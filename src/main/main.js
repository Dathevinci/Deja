const { app, BrowserWindow, ipcMain, shell, session, Notification, screen, dialog } = require('electron');
const path = require('path');
const config = require('./config');
const ShortcutManager = require('./shortcuts');
const TrayManager = require('./tray');
const discord = require('./discord');
const { buildAppMenu } = require('./menu');
const innertube = require('./innertube');

// Set Windows App User Model ID for notifications and taskbar
if (process.platform === 'win32') {
  app.setAppUserModelId('com.deja.ytmusic.desktop');
}

// Global exception safety to prevent silent crashes
process.on('uncaughtException', (err) => {
  console.error('[Deja] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Deja] Unhandled Promise Rejection:', reason);
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  console.log('[Deja] Another instance is already running. Quitting.');
  app.quit();
  process.exit(0);
}

// User Agent spoofing for Google Login compatibility
const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
app.userAgentFallback = CHROME_UA;

// Chromium autoplay policy: allow immediate audio playback without prior user gesture
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

let mainWindow = null;
let forceShowTimeout = null;
let isWindowDisplayed = false;
let shortcutManager = null;
let trayManager = null;
let isMiniPlayer = false;
let normalBounds = null;
let wasMaximizedBeforeMini = false;

/**
 * Display the main application window safely and bring it to the foreground.
 */
function showMainWindow(reason) {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  if (isWindowDisplayed && mainWindow.isVisible() && !mainWindow.isMinimized()) {
    try {
      mainWindow.focus();
    } catch {}
    return;
  }

  const startMinimized = config.get('startMinimized');
  const isExplicitAutostart = process.argv && (
    process.argv.includes('--hidden') ||
    process.argv.includes('--minimized') ||
    process.argv.includes('--autostart')
  );

  // Only stay hidden in tray if explicitly autostarted AND tray exists
  if (startMinimized && isExplicitAutostart && reason !== 'fallback-timeout' && reason !== 'user-forced' && reason !== 'second-instance') {
    if (trayManager && trayManager.tray && !trayManager.tray.isDestroyed()) {
      console.log(`[Window] startMinimized is enabled and launched via autostart; staying in tray (trigger: ${reason})`);
      return;
    }
  }

  if (forceShowTimeout) {
    clearTimeout(forceShowTimeout);
    forceShowTimeout = null;
  }

  console.log(`[Window] Showing main window (trigger: ${reason})`);
  try {
    const savedBounds = config.get('windowBounds') || {};
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    if (savedBounds.isMaximized) {
      mainWindow.maximize();
    }
    mainWindow.show();
    mainWindow.setAlwaysOnTop(true);
    mainWindow.focus();
    mainWindow.setAlwaysOnTop(false);
    isWindowDisplayed = true;
  } catch (err) {
    console.error('[Window] Error showing main window:', err);
  }
}

// Second instance handler: bring window to front when user launches app again
app.on('second-instance', (event, commandLine, workingDirectory) => {
  console.log('[Deja] Second instance detected. Restoring and focusing main window.');
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }
    mainWindow.setAlwaysOnTop(true);
    mainWindow.focus();
    mainWindow.setAlwaysOnTop(false);
    showMainWindow('second-instance');
  } else if (app.isReady()) {
    createWindow();
  }
});

// Hardware acceleration option
if (!config.get('hardwareAcceleration')) {
  app.disableHardwareAcceleration();
}

function createWindow() {
  try {
    const savedBounds = config.get('windowBounds') || {};
    const isWebMode = process.argv.includes('--web');
    const isPreview = !isWebMode;

    let x = savedBounds.x;
    let y = savedBounds.y;

    if (typeof x === 'number' && typeof y === 'number') {
      try {
        const displays = screen.getAllDisplays();
        const isVisibleOnAnyDisplay = displays.some(d => {
          const { x: dx, y: dy, width: dw, height: dh } = d.bounds;
          return x >= dx && x < (dx + dw) && y >= dy && y < (dy + dh);
        });
        if (!isVisibleOnAnyDisplay) {
          console.warn(`[Window] Saved position (${x}, ${y}) is outside all connected displays; centering.`);
          x = undefined;
          y = undefined;
        }
      } catch (screenErr) {
        console.warn('[Window] Could not check screen bounds:', screenErr.message);
      }
    }

    const iconPath = process.platform === 'win32'
      ? path.join(__dirname, '../../assets/icon.ico')
      : path.join(__dirname, '../../assets/icon.png');

    mainWindow = new BrowserWindow({
      width: savedBounds.width || 1300,
      height: savedBounds.height || 860,
      x: x,
      y: y,
      minWidth: 320,
      minHeight: 120,
      frame: false,
      title: 'Deja - YouTube Music',
      backgroundColor: '#141416',
      icon: iconPath,
      webPreferences: {
        preload: path.join(__dirname, '../preload/preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false,
        webSecurity: true,
        spellcheck: false,
        partition: 'persist:ytmusic'
      },
      show: false
    });

    normalBounds = mainWindow.getBounds();
    isWindowDisplayed = false;

    // Custom UserAgent to allow standard Google Authentication
    mainWindow.webContents.setUserAgent(CHROME_UA);

    // Set application menu safely
    try {
      const menu = buildAppMenu(mainWindow);
      mainWindow.setMenu(menu);
    } catch (err) {
      console.warn('[Menu] Failed to set menu:', err.message);
    }

    // Initialize helper managers safely
    try {
      shortcutManager = new ShortcutManager(mainWindow, (action) => {
        if (action === 'toggleMiniPlayer') {
          toggleMiniPlayer();
          return true;
        }
        return false;
      });
      shortcutManager.registerAll();
    } catch (err) {
      console.warn('[Shortcuts] Failed to init ShortcutManager:', err.message);
    }

    try {
      trayManager = new TrayManager(mainWindow, iconPath);
      trayManager.init();
    } catch (err) {
      console.warn('[Tray] Failed to init TrayManager:', err.message);
    }

    try {
      if (config.get('discordRPC')) {
        discord.init(true);
      }
    } catch (err) {
      console.warn('[Discord] Failed to init Discord RPC:', err.message);
    }

    // 1. Primary event: ready-to-show
    mainWindow.once('ready-to-show', () => {
      console.log('[Window] Event: ready-to-show');
      showMainWindow('ready-to-show');
    });

    // 2. Early event: dom-ready (fast paint before heavy external network assets)
    mainWindow.webContents.once('dom-ready', () => {
      console.log('[Window] Event: dom-ready');
      showMainWindow('dom-ready');
    });

    // 3. Secondary event: did-finish-load
    mainWindow.webContents.once('did-finish-load', () => {
      console.log('[Window] Event: did-finish-load');
      showMainWindow('did-finish-load');
    });

    // 4. Fallback: Force show if ready-to-show takes longer than 3 seconds (3000ms)
    forceShowTimeout = setTimeout(() => {
      if (!isWindowDisplayed && mainWindow && !mainWindow.isDestroyed()) {
        console.warn('[Window] ready-to-show took longer than 3000ms; force-showing window now.');
        showMainWindow('fallback-timeout');
      }
    }, 3000);

    // Clear fallback timer if window is closed
    mainWindow.on('closed', () => {
      if (forceShowTimeout) {
        clearTimeout(forceShowTimeout);
        forceShowTimeout = null;
      }
      isWindowDisplayed = false;
      mainWindow = null;
    });

    // Load URL or preview mode
    if (isPreview) {
      mainWindow.loadFile(path.join(__dirname, '../renderer/preview.html')).catch((err) => {
        console.error('[Window] Failed to load preview.html:', err);
        showMainWindow('preview-load-error');
      });
    } else {
      mainWindow.loadURL('https://music.youtube.com', {
        userAgent: CHROME_UA
      }).catch((err) => {
        console.warn(`[Network] loadURL failed (${err.message}). Loading offline fallback.`);
        const fallbackPath = path.join(__dirname, '../renderer/offline-fallback.html');
        mainWindow.loadFile(fallbackPath).finally(() => {
          showMainWindow('loadurl-catch-fallback');
        });
      });
    }

    // Handle network failure gracefully with fallback option
    mainWindow.webContents.on('did-fail-load', (e, errorCode, errorDescription, validatedURL) => {
      if (errorCode !== -3 && (!validatedURL || (!validatedURL.includes('preview.html') && !validatedURL.includes('offline-fallback.html')))) { // -3 is ABORTED
        console.warn(`[Network] Failed to load ${validatedURL}: ${errorDescription} (${errorCode})`);
        const fallbackPath = path.join(__dirname, '../renderer/offline-fallback.html');
        mainWindow.loadFile(fallbackPath).finally(() => {
          showMainWindow('did-fail-load-fallback');
        });
      }
    });

    mainWindow.on('resize', () => {
      if (!mainWindow.isMaximized() && !isMiniPlayer) {
        normalBounds = mainWindow.getBounds();
      }
    });

    mainWindow.on('move', () => {
      if (!mainWindow.isMaximized() && !isMiniPlayer) {
        normalBounds = mainWindow.getBounds();
      }
    });

    mainWindow.on('close', (e) => {
      const hasTray = trayManager && trayManager.tray && !trayManager.tray.isDestroyed();
      if (config.get('closeToTray') && !app.isQuitting && hasTray) {
        e.preventDefault();
        mainWindow.hide();
        return false;
      }

      if (!isMiniPlayer && mainWindow && !mainWindow.isMinimized() && !mainWindow.isMaximized()) {
        const bounds = mainWindow.getBounds();
        bounds.isMaximized = false;
        config.set('windowBounds', bounds);
      } else if (mainWindow && mainWindow.isMaximized()) {
        config.set('windowBounds', Object.assign({}, config.get('windowBounds') || {}, { isMaximized: true }));
      }
    });

    mainWindow.on('minimize', (e) => {
      const hasTray = trayManager && trayManager.tray && !trayManager.tray.isDestroyed();
      if (config.get('minimizeToTray') && hasTray) {
        e.preventDefault();
        mainWindow.hide();
      }
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      // Open external links in default system browser except Google auth URLs and consent UI
      if (
        url.includes('accounts.google.com') ||
        url.includes('music.youtube.com') ||
        url.includes('consent.youtube.com') ||
        url.includes('youtube.com')
      ) {
        return {
          action: 'allow',
          overrideBrowserWindowOptions: {
            userAgent: CHROME_UA,
            autoHideMenuBar: true
          }
        };
      }
      shell.openExternal(url);
      return { action: 'deny' };
    });

  } catch (err) {
    console.error('[Window] Fatal exception in createWindow:', err);
    try {
      dialog.showErrorBox('Deja Startup Error', `A fatal error occurred while starting Deja:\n\n${err.stack || err.message}`);
    } catch {}
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        mainWindow.show();
      } catch {}
    }
  }
}

// IPC Handlers
ipcMain.handle('window-action', (event, action) => {
  if (!mainWindow) return;
  switch (action) {
    case 'minimize':
      mainWindow.minimize();
      break;
    case 'maximize':
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
      break;
    case 'close':
      mainWindow.close();
      break;
    case 'is-maximized':
      return mainWindow.isMaximized();
    case 'toggle-miniplayer':
      toggleMiniPlayer();
      break;
  }
});

function toggleMiniPlayer() {
  if (!mainWindow) return;
  isMiniPlayer = !isMiniPlayer;

  if (isMiniPlayer) {
    wasMaximizedBeforeMini = mainWindow.isMaximized();
    if (wasMaximizedBeforeMini) {
      mainWindow.unmaximize();
    }
    normalBounds = mainWindow.getBounds();
    mainWindow.setAlwaysOnTop(true, 'floating');
    mainWindow.setMinimumSize(320, 110);
    mainWindow.setBounds({
      width: 360,
      height: 120,
      x: normalBounds.x + normalBounds.width - 380,
      y: normalBounds.y + normalBounds.height - 140
    });
  } else {
    mainWindow.setAlwaysOnTop(false);
    mainWindow.setMinimumSize(800, 500);
    if (normalBounds) {
      mainWindow.setBounds(normalBounds);
    } else {
      mainWindow.setSize(1300, 860);
      mainWindow.center();
    }
    if (wasMaximizedBeforeMini) {
      mainWindow.maximize();
    }
  }

  mainWindow.webContents.send('miniplayer-state-changed', isMiniPlayer);
}

ipcMain.on('track-changed', (event, track) => {
  if (!track) return;

  // Update System Tray
  if (trayManager) {
    trayManager.updateTrack(track);
  }

  // Update Discord Rich Presence
  if (config.get('discordRPC')) {
    discord.updateTrack(track);
  }

  // Desktop notification on song change if enabled
  // Ad compliance: Do not send OS notifications during advertisements
  if (!track.isAd && config.get('notifications') && track.isPlaying && Notification.isSupported()) {
    try {
      const notif = new Notification({
        title: track.title || 'Now Playing',
        body: `${track.artist || 'Unknown Artist'} • ${track.album || 'YouTube Music'}`,
        silent: true,
        icon: path.join(__dirname, '../../assets/icon.png')
      });
      notif.show();
    } catch {}
  }
});

ipcMain.handle('get-config', (event, key) => {
  return config.get(key);
});

ipcMain.handle('set-config', (event, payload) => {
  if (typeof payload === 'object') {
    config.set(payload);
    if ('discordRPC' in payload) {
      discord.setEnabled(payload.discordRPC);
    }
    return true;
  }
  return false;
});

ipcMain.handle('open-external', (event, url) => {
  if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
    shell.openExternal(url);
  }
});

// Google Account & YouTube Music Authentication Dialog
ipcMain.handle('open-google-login', async () => {
  return new Promise((resolve) => {
    try {
      const loginWin = new BrowserWindow({
        width: 580,
        height: 720,
        title: 'Sign in to YouTube Music - Deja',
        parent: mainWindow,
        modal: true,
        autoHideMenuBar: true,
        webPreferences: {
          partition: 'persist:ytmusic',
          nodeIntegration: false,
          contextIsolation: true
        }
      });
      loginWin.webContents.setUserAgent(CHROME_UA);
      loginWin.loadURL('https://accounts.google.com/ServiceLogin?continue=https%3A%2F%2Fmusic.youtube.com%2F');

      const notifyAuth = async () => {
        try {
          const ses = session.fromPartition('persist:ytmusic');
          const info = await innertube.getAccountInfo(ses);
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('auth-state-changed', info);
          }
        } catch {}
      };

      loginWin.webContents.on('did-navigate', async (e, url) => {
        if (url.includes('music.youtube.com') && !url.includes('accounts.google.com')) {
          await notifyAuth();
          setTimeout(() => {
            if (!loginWin.isDestroyed()) {
              loginWin.close();
            }
          }, 1500);
        }
      });

      loginWin.on('closed', async () => {
        await notifyAuth();
        resolve(true);
      });
    } catch (err) {
      console.error('[Auth] Failed to open Google login dialog:', err);
      resolve(false);
    }
  });
});

// Toggle between native BitChord Apple UI and raw YouTube Music web mode
ipcMain.handle('toggle-web-mode', async () => {
  if (!mainWindow) return false;
  try {
    const currentURL = mainWindow.webContents.getURL() || '';
    if (currentURL.includes('music.youtube.com')) {
      await mainWindow.loadFile(path.join(__dirname, '../renderer/preview.html'));
    } else {
      await mainWindow.loadURL('https://music.youtube.com', { userAgent: CHROME_UA });
    }
    return true;
  } catch (err) {
    console.error('[Mode] Failed to toggle web mode:', err);
    return false;
  }
});

// Live YouTube Music Search API (InnerTube WEB_REMIX client architecture)
ipcMain.handle('yt-search', async (event, query) => {
  if (!query || typeof query !== 'string') return [];
  try {
    const ses = session.fromPartition('persist:ytmusic');
    return await innertube.search(query, ses);
  } catch (err) {
    console.warn('[Search] YouTube Music search error:', err.message);
    return [];
  }
});

// Live YouTube Music Home Feed (Quick picks, personalized recommendations, trending)
ipcMain.handle('yt-home-feed', async () => {
  try {
    const ses = session.fromPartition('persist:ytmusic');
    return await innertube.getHomeFeed(ses);
  } catch (err) {
    console.warn('[Feed] Home feed error:', err.message);
    return { shelves: [], tracks: [] };
  }
});

// Live YouTube Music Explore Feed (New releases, Top charts, Moods & genres)
ipcMain.handle('yt-explore-feed', async () => {
  try {
    const ses = session.fromPartition('persist:ytmusic');
    return await innertube.getExploreFeed(ses);
  } catch (err) {
    console.warn('[Feed] Explore feed error:', err.message);
    return { shelves: [], tracks: [] };
  }
});

// Live YouTube Music Charts Feed (Top video charts, Top artists)
ipcMain.handle('yt-charts-feed', async () => {
  try {
    const ses = session.fromPartition('persist:ytmusic');
    return await innertube.getChartsFeed(ses);
  } catch (err) {
    console.warn('[Feed] Charts feed error:', err.message);
    return { shelves: [], tracks: [], artists: [] };
  }
});

// Live YouTube Music New Releases Feed (Albums & singles, Music videos)
ipcMain.handle('yt-new-releases-feed', async () => {
  try {
    const ses = session.fromPartition('persist:ytmusic');
    return await innertube.getNewReleasesFeed(ses);
  } catch (err) {
    console.warn('[Feed] New releases feed error:', err.message);
    return { shelves: [], tracks: [] };
  }
});

// User Google Library Liked Songs (FEmusic_liked_videos)
ipcMain.handle('yt-library-songs', async () => {
  try {
    const ses = session.fromPartition('persist:ytmusic');
    return await innertube.getLibrarySongs(ses);
  } catch (err) {
    console.warn('[Library] Liked songs error:', err.message);
    return { songs: [] };
  }
});

// User Google Library Playlists (FEmusic_liked_playlists)
ipcMain.handle('yt-library-playlists', async () => {
  try {
    const ses = session.fromPartition('persist:ytmusic');
    return await innertube.getLibraryPlaylists(ses);
  } catch (err) {
    console.warn('[Library] Liked playlists error:', err.message);
    return [];
  }
});

// Live YouTube Music Browse Playlist / Album tracks
ipcMain.handle('yt-browse-playlist', async (event, browseId) => {
  if (!browseId || typeof browseId !== 'string') return null;
  try {
    const ses = session.fromPartition('persist:ytmusic');
    return await innertube.getPlaylist(browseId, ses);
  } catch (err) {
    console.warn('[Browse] Playlist browse error:', err.message);
    return null;
  }
});

// Live YouTube Music Watch / Radio Next Queue
ipcMain.handle('yt-next-queue', async (event, videoId) => {
  if (!videoId || typeof videoId !== 'string') return [];
  try {
    const ses = session.fromPartition('persist:ytmusic');
    return await innertube.getNextQueue(videoId, ses);
  } catch (err) {
    console.warn('[Queue] Next queue error:', err.message);
    return [];
  }
});

// User Account & Authentication Status
ipcMain.handle('yt-account-info', async () => {
  try {
    const ses = session.fromPartition('persist:ytmusic');
    return await innertube.getAccountInfo(ses);
  } catch (err) {
    console.warn('[Account] Account info error:', err.message);
    return { isLoggedIn: false };
  }
});

// Song Thumbs Up / Down / Remove Rating
ipcMain.handle('yt-rate', async (event, { videoId, status }) => {
  if (!videoId) return null;
  try {
    const ses = session.fromPartition('persist:ytmusic');
    return await innertube.rate(videoId, status, ses);
  } catch (err) {
    console.warn('[Rate] Song rate error:', err.message);
    return null;
  }
});

// Direct Audio Stream Resolution via InnerTube (BitChord architecture)
ipcMain.handle('yt-resolve-stream', async (event, videoId) => {
  if (!videoId || typeof videoId !== 'string') return null;
  try {
    const ses = session.fromPartition('persist:ytmusic');
    return await innertube.getAudioStream(videoId, ses);
  } catch (err) {
    console.warn('[Stream] Audio stream resolution error:', err.message);
    return null;
  }
});

// App Lifecycle
app.whenReady().then(() => {
  const ytSession = session.fromPartition('persist:ytmusic');
  const activeSessions = [session.defaultSession, ytSession];

  activeSessions.forEach(ses => {
    // Intercept headers: emulate genuine YouTube Music client and eliminate Error 150 / 101 embed blocks
    ses.webRequest.onBeforeSendHeaders((details, callback) => {
      const requestHeaders = details.requestHeaders || {};

      // Rewrite Origin & Referer to music.youtube.com for all YouTube & GoogleVideo requests
      if (
        details.url.includes('youtube.com') ||
        details.url.includes('youtube-nocookie.com') ||
        details.url.includes('googlevideo.com')
      ) {
        requestHeaders['Origin'] = 'https://music.youtube.com';
        requestHeaders['Referer'] = 'https://music.youtube.com/';
      }

      delete requestHeaders['Sec-Ch-Ua-Platform'];
      delete requestHeaders['sec-ch-ua-platform'];
      requestHeaders['Sec-Ch-Ua'] = '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"';
      requestHeaders['User-Agent'] = CHROME_UA;
      callback({ cancel: false, requestHeaders });
    });

    // Strip iframe embedding restrictions and enable cross-origin media streaming
    ses.webRequest.onHeadersReceived((details, callback) => {
      const responseHeaders = { ...details.responseHeaders };
      delete responseHeaders['x-frame-options'];
      delete responseHeaders['X-Frame-Options'];
      delete responseHeaders['content-security-policy'];
      delete responseHeaders['Content-Security-Policy'];
      responseHeaders['Access-Control-Allow-Origin'] = ['*'];
      callback({ cancel: false, responseHeaders });
    });
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      showMainWindow('app-activate');
    }
  });
}).catch((err) => {
  console.error('[App] Failed during whenReady initialization:', err);
  try {
    dialog.showErrorBox('Deja Initialization Error', `Failed to start Deja:\n\n${err.stack || err.message}`);
  } catch {}
});

app.on('will-quit', () => {
  if (shortcutManager) {
    shortcutManager.unregisterAll();
  }
  if (discord) {
    discord.disconnect();
  }
  if (trayManager) {
    trayManager.destroy();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && !config.get('closeToTray')) {
    app.quit();
  }
});
