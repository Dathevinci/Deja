const { app, BrowserWindow, ipcMain, shell, session, Notification, screen } = require('electron');
const path = require('path');
const config = require('./config');
const ShortcutManager = require('./shortcuts');
const TrayManager = require('./tray');
const discord = require('./discord');
const { buildAppMenu } = require('./menu');

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

let mainWindow = null;
let forceShowTimeout = null;
let shortcutManager = null;
let trayManager = null;
let isMiniPlayer = false;
let normalBounds = null;
let wasMaximizedBeforeMini = false;

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
  } else {
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
    const isPreview = process.argv.includes('--preview');

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
      icon: path.join(__dirname, '../../assets/icon.png'),
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
      const iconPath = path.join(__dirname, '../../assets/icon.ico');
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

    // Window display management with 3-second fallback
    let isWindowDisplayed = false;

    const showMainWindow = (reason) => {
      if (isWindowDisplayed || !mainWindow || mainWindow.isDestroyed()) return;

      if (forceShowTimeout) {
        clearTimeout(forceShowTimeout);
        forceShowTimeout = null;
      }

      const startMinimized = config.get('startMinimized');
      if (startMinimized && reason !== 'fallback-timeout' && reason !== 'user-forced') {
        console.log(`[Window] startMinimized is enabled; staying hidden in tray (trigger: ${reason})`);
        return;
      }

      console.log(`[Window] Showing main window (trigger: ${reason})`);
      try {
        if (savedBounds.isMaximized) {
          mainWindow.maximize();
        }
        mainWindow.show();
        mainWindow.focus();
        isWindowDisplayed = true;
      } catch (err) {
        console.error('[Window] Error showing main window:', err);
      }
    };

    // 1. Primary event: ready-to-show
    mainWindow.once('ready-to-show', () => {
      console.log('[Window] Event: ready-to-show');
      showMainWindow('ready-to-show');
    });

    // 2. Secondary event: did-finish-load
    mainWindow.webContents.once('did-finish-load', () => {
      console.log('[Window] Event: did-finish-load');
      showMainWindow('did-finish-load');
    });

    // 3. Fallback: Force show if ready-to-show takes longer than 3 seconds (3000ms)
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
      if (errorCode !== -3 && (!validatedURL || !validatedURL.includes('preview.html'))) { // -3 is ABORTED
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
      if (config.get('closeToTray') && !app.isQuitting) {
        e.preventDefault();
        mainWindow.hide();
        return false;
      }

      if (!isMiniPlayer && mainWindow) {
        const bounds = mainWindow.getBounds();
        bounds.isMaximized = mainWindow.isMaximized();
        config.set('windowBounds', bounds);
      }
    });

    mainWindow.on('minimize', (e) => {
      if (config.get('minimizeToTray')) {
        e.preventDefault();
        mainWindow.hide();
      }
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      // Open external links in default system browser except Google auth URLs
      if (url.includes('accounts.google.com') || url.includes('music.youtube.com')) {
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

// App Lifecycle
app.whenReady().then(() => {
  // Clean request headers to avoid Google security prompt issues
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    delete details.requestHeaders['Sec-Ch-Ua-Platform'];
    delete details.requestHeaders['sec-ch-ua-platform'];
    details.requestHeaders['Sec-Ch-Ua'] = '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"';
    details.requestHeaders['User-Agent'] = CHROME_UA;
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
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
