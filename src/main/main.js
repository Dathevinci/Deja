const { app, BrowserWindow, ipcMain, shell, session, Notification, screen, dialog } = require('electron');
const path = require('path');
const config = require('./config');
const ShortcutManager = require('./shortcuts');
const TrayManager = require('./tray');
const discord = require('./discord');
const { buildAppMenu } = require('./menu');
const innertube = require('./innertube');
const authStore = require('./auth-store');
const { parseCookiePairs, hasApiSid, normalizeDataSyncId } = require('./cookie-utils');

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
const CHROME_METADATA = {
  brands: [
    { brand: 'Google Chrome', version: '131' },
    { brand: 'Chromium', version: '131' },
    { brand: 'Not_A Brand', version: '24' }
  ],
  fullVersionList: [
    { brand: 'Google Chrome', version: '131.0.6778.86' },
    { brand: 'Chromium', version: '131.0.6778.86' },
    { brand: 'Not_A Brand', version: '24.0.0.0' }
  ],
  fullVersion: '131.0.6778.86',
  platform: 'Windows',
  platformVersion: '10.0.0',
  architecture: 'x86',
  model: '',
  mobile: false,
  bitness: '64',
  wow64: false
};
app.userAgentFallback = CHROME_UA;

// Chromium autoplay policy: allow immediate audio playback without prior user gesture
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
// Prevent Google automation detection ("This browser or app may not be secure")
app.commandLine.appendSwitch('disable-blink-features', 'AutomationControlled');

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
    const remainingTime = (track.duration && track.currentTime != null)
      ? Math.max(0, track.duration - track.currentTime)
      : 0;
    const activityData = {
      title: track.title,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
      currentTime: track.currentTime,
      remainingTime: remainingTime,
      artworkUrl: track.coverUrl || track.cover,
      coverUrl: track.coverUrl || track.cover,
      isPlaying: track.isPlaying !== false,
      isAd: !!track.isAd
    };
    if (typeof discord.updateActivity === 'function') {
      discord.updateActivity(activityData);
    } else if (typeof discord.updateTrack === 'function') {
      discord.updateTrack(activityData);
    }
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

// Google Account & YouTube Music Authentication (BitChord Architecture)
let activeLoginWin = null;
let syncServer = null;

/**
 * Lightweight local HTTP sync listener on http://127.0.0.1:3728/sync.
 * Accepts GET/POST ?c=COOKIE_STRING with CORS enabled so a user can run a 1-line browser snippet:
 * fetch('http://127.0.0.1:3728/sync?c=' + encodeURIComponent(document.cookie))
 * from their browser console to import session cookies directly.
 */
function startSyncServer() {
  if (syncServer) return;
  try {
    const http = require('http');
    syncServer = http.createServer(async (req, res) => {
      // Chrome & Edge Private Network Access (PNA) and CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Access-Control-Allow-Private-Network', 'true');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      try {
        const parsedUrl = new URL(req.url, 'http://127.0.0.1:3728');

        // Status check endpoint to see if Deja is authenticated and running
        if (parsedUrl.pathname === '/sync-status') {
          const ses = session.fromPartition('persist:ytmusic');
          const info = await innertube.getAccountInfo(ses).catch(() => ({ isLoggedIn: false }));
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Private-Network': 'true'
          });
          res.end(JSON.stringify(info || { isLoggedIn: false }));
          return;
        }

        // Web Helper / Connect Landing Page
        if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/connect' || parsedUrl.pathname === '/help') {
          res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Private-Network': 'true'
          });
          res.end(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Deja Desktop Sync Helper</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif; background: #0a0a0e; color: #fff; text-align: center; padding: 40px 20px; margin: 0; }
    .card { max-width: 520px; margin: 0 auto; background: rgba(28,28,32,0.9); border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; padding: 32px 28px; box-shadow: 0 16px 40px rgba(0,0,0,0.6); }
    h1 { font-size: 24px; color: #FA2D48; margin-top: 0; }
    p { font-size: 14px; line-height: 1.6; color: #aaa; }
    .status-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(52,199,89,0.15); color: #34C759; padding: 6px 16px; border-radius: 999px; font-weight: 600; font-size: 13px; margin-bottom: 20px; }
    .btn { display: inline-block; background: #FA2D48; color: #fff; text-decoration: none; padding: 10px 22px; border-radius: 999px; font-weight: 600; margin: 10px 4px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="status-badge">● Deja Sync Server is Online</div>
    <h1>Deja Account Connect</h1>
    <p>To connect your Google / YouTube Music account to Deja without entering your password, open YouTube Music in this browser and click your Deja bookmarklet!</p>
    <a href="https://music.youtube.com" class="btn" target="_blank">Open YouTube Music ↗</a>
  </div>
</body>
</html>`);
          return;
        }

        if (parsedUrl.pathname === '/sync') {
          let cookieParam = parsedUrl.searchParams.get('c') || '';

          if (!cookieParam && req.method === 'POST') {
            try {
              const chunks = [];
              for await (const chunk of req) chunks.push(chunk);
              const rawBody = Buffer.concat(chunks).toString('utf8');
              try {
                const bodyJson = JSON.parse(rawBody);
                cookieParam = bodyJson.c || bodyJson.cookie || bodyJson.cookies || rawBody;
              } catch {
                cookieParam = rawBody;
              }
            } catch {}
          }

          if (cookieParam) {
            const ses = session.fromPartition('persist:ytmusic');
            const result = await applySessionCookies(cookieParam, ses);
            if (result && result.success) {
              if (activeLoginWin && !activeLoginWin.isDestroyed()) {
                try { activeLoginWin.close(); } catch {}
              }
              const isDirectBrowser = req.headers['sec-fetch-dest'] === 'document' || req.headers['accept']?.includes('text/html');
              if (isDirectBrowser) {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`<!DOCTYPE html><html><body style="font-family:system-ui;background:#0d0d12;color:#fff;text-align:center;padding-top:60px;"><h2 style="color:#34C759;">Connected to Deja Successfully</h2><p>You can close this tab now and return to Deja.</p><script>setTimeout(() => window.close(), 1800);</script></body></html>`);
              } else {
                res.writeHead(200, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                  'Access-Control-Allow-Private-Network': 'true'
                });
                res.end(JSON.stringify({ success: true, message: 'Signed in successfully!', account: result.account }));
              }
              return;
            } else {
              res.writeHead(400, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Private-Network': 'true'
              });
              res.end(JSON.stringify({ success: false, error: (result && result.error) || 'Failed to authenticate with provided cookies.' }));
              return;
            }
          } else {
            res.writeHead(400, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Private-Network': 'true'
            });
            res.end(JSON.stringify({ success: false, error: 'Missing c parameter with cookie string.' }));
            return;
          }
        }
      } catch (err) {
        console.warn('[SyncServer] Request error:', err.message);
      }

      res.writeHead(404, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Private-Network': 'true'
      });
      res.end(JSON.stringify({ error: 'Not found' }));
    });

    syncServer.on('error', (err) => {
      console.warn('[SyncServer] HTTP sync server notice:', err.message);
      try { syncServer.close(); } catch {}
      syncServer = null;
    });

    syncServer.listen(3728, '127.0.0.1', () => {
      console.log('[SyncServer] Listening on http://127.0.0.1:3728/sync');
    });

    if (typeof syncServer.unref === 'function') {
      syncServer.unref();
    }
  } catch (err) {
    console.warn('[SyncServer] Could not initialize sync server:', err.message);
    syncServer = null;
  }
}


/**
 * Parses and sets session cookies for YouTube and Google domains into the session partition,
 * then validates via innertube.getAccountInfo(ses).
 */
async function applySessionCookies(rawCookieInput, ses) {
  const cookiePairs = parseCookiePairs(rawCookieInput);
  if (cookiePairs.length === 0) {
    return { success: false, error: 'No valid cookies found in input.' };
  }

  // Set cookies with future expiration dates (2 years) and flush to disk
  await authStore.applyCookiesToSession(ses, cookiePairs);

  try {
    await innertube.ensureSessionScope(ses, true).catch(() => {});
    const info = await innertube.getAccountInfo(ses);
    if (info && info.isLoggedIn) {
      const scope = innertube.getSessionScope();
      await authStore.persistCurrentSession(ses, info, scope, rawCookieInput);
      await ses.cookies.flushStore().catch(() => {});

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('auth-changed', info);
        mainWindow.webContents.send('auth-state-changed', info);
      }
      return { success: true, account: info };
    } else {
      return {
        success: false,
        error: 'Cookies were imported, but YouTube Music session could not be authenticated. Please ensure you copied cookies while logged into YouTube Music.'
      };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

const BITCHORD_GOOGLE_SIGNIN_URL = 'https://accounts.google.com/ServiceLogin?ltmpl=music&service=youtube&passive=true&continue=https%3A%2F%2Fmusic.youtube.com%2F';

const YTCFG_PROBE_SCRIPT = `
(function () {
  try {
    if (!window.ytcfg) return null;
    var get = function (key) {
      var value = (window.ytcfg.get ? window.ytcfg.get(key) : null);
      if (value === undefined || value === null || value === '') {
        if (window.ytcfg.data_ && window.ytcfg.data_[key] !== undefined) {
          value = window.ytcfg.data_[key];
        }
      }
      return (value === undefined || value === null || value === '') ? null : String(value);
    };
    var loggedInVal = (window.ytcfg.get ? window.ytcfg.get('LOGGED_IN') : (window.ytcfg.data_ && window.ytcfg.data_['LOGGED_IN']));
    return {
      loggedIn: String(!!loggedInVal),
      pageId: get('DELEGATED_SESSION_ID'),
      dataSyncId: get('DATASYNC_ID'),
      authUser: get('SESSION_INDEX'),
      visitorData: get('VISITOR_DATA'),
      clientVersion: get('INNERTUBE_CLIENT_VERSION')
    };
  } catch (e) {
    return null;
  }
})()
`;

/**
 * Clears local Google and YouTube session cookies without visiting Google's logout endpoint.
 * Matches BitChord BrowserSession.clearGoogleCookies():
 * Never visit accounts.google.com/Logout here: that invalidates a previously saved account
 * on Google's server, so adding account B silently breaks account A.
 */
async function clearGoogleSessionCookies(ses) {
  try {
    const origins = [
      'https://music.youtube.com',
      'https://www.youtube.com',
      'https://youtube.com',
      'https://accounts.google.com',
      'https://www.google.com',
      'https://google.com'
    ];
    const cookies = await ses.cookies.get({});
    for (const c of cookies) {
      const dom = c.domain || '';
      if (dom.includes('youtube.com') || dom.includes('google.com') || dom.includes('youtubei')) {
        const protocol = c.secure ? 'https:' : 'http:';
        const host = dom.startsWith('.') ? dom.substring(1) : dom;
        const cookieUrl = `${protocol}//${host}${c.path || '/'}`;
        await ses.cookies.remove(cookieUrl, c.name).catch(() => {});
        for (const orig of origins) {
          await ses.cookies.remove(orig, c.name).catch(() => {});
        }
      }
    }
    await ses.flushStorageData().catch(() => {});
  } catch (err) {
    console.warn('[Auth] Error clearing Google session cookies:', err.message);
  }
}

/**
 * Injects a sleek Apple-styled profile confirmation banner on music.youtube.com
 * (never on accounts.google.com). Matches BitChord's YtMusicLoginScreen confirmation architecture:
 * allows the user to browse their channels/identities before committing the session.
 */
async function injectProfileConfirmationBar(win) {
  if (!win || win.isDestroyed()) return;
  const script = `
  (function() {
    if (document.getElementById('deja-auth-confirmation-bar')) return;
    try {
      var bar = document.createElement('div');
      bar.id = 'deja-auth-confirmation-bar';
      bar.style.position = 'fixed';
      bar.style.bottom = '20px';
      bar.style.left = '50%';
      bar.style.transform = 'translateX(-50%)';
      bar.style.zIndex = '2147483647';
      bar.style.display = 'flex';
      bar.style.alignItems = 'center';
      bar.style.gap = '14px';
      bar.style.background = 'rgba(28, 28, 30, 0.94)';
      bar.style.backdropFilter = 'blur(20px)';
      bar.style.webkitBackdropFilter = 'blur(20px)';
      bar.style.border = '1px solid rgba(255, 255, 255, 0.18)';
      bar.style.borderRadius = '999px';
      bar.style.padding = '8px 18px 8px 16px';
      bar.style.boxShadow = '0 12px 36px rgba(0,0,0,0.6)';
      bar.style.fontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
      bar.style.color = '#ffffff';

      var hint = document.createElement('span');
      hint.style.fontSize = '13px';
      hint.style.fontWeight = '500';
      hint.innerText = 'Switch profile if needed, then confirm:';

      var btn = document.createElement('button');
      btn.id = 'deja-btn-confirm-profile';
      btn.innerText = 'Use This Profile';
      btn.style.background = '#FA2D48';
      btn.style.color = '#ffffff';
      btn.style.border = 'none';
      btn.style.borderRadius = '999px';
      btn.style.padding = '6px 16px';
      btn.style.fontSize = '13px';
      btn.style.fontWeight = '600';
      btn.style.cursor = 'pointer';
      btn.style.boxShadow = '0 4px 12px rgba(250, 45, 72, 0.35)';
      btn.style.transition = 'transform 0.15s ease, opacity 0.15s ease';

      btn.onmouseenter = function() { btn.style.transform = 'scale(1.04)'; };
      btn.onmouseleave = function() { btn.style.transform = 'scale(1)'; };
      btn.onclick = function() {
        btn.innerText = 'Checking...';
        btn.disabled = true;
        console.log('__DEJA_CONFIRM_PROFILE__');
      };

      var closeBtn = document.createElement('button');
      closeBtn.innerText = '✕';
      closeBtn.style.background = 'none';
      closeBtn.style.border = 'none';
      closeBtn.style.color = 'rgba(255, 255, 255, 0.5)';
      closeBtn.style.fontSize = '14px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.padding = '0 4px';
      closeBtn.title = 'Dismiss confirmation bar';
      closeBtn.onclick = function() { bar.remove(); };

      bar.appendChild(hint);
      bar.appendChild(btn);
      bar.appendChild(closeBtn);
      document.body.appendChild(bar);
    } catch(e) {}
  })()
  `;
  await win.webContents.executeJavaScript(script).catch(() => {});
}

// Google Account & YouTube Music Authentication Dialog (BitChord Architecture)
ipcMain.handle('open-google-login', async (event, targetMethod) => {
  return new Promise(async (resolve) => {
    try {
      startSyncServer();

      if (activeLoginWin && !activeLoginWin.isDestroyed()) {
        activeLoginWin.focus();
        return resolve(true);
      }

      const ses = session.fromPartition('persist:ytmusic');
      try {
        ses.setUserAgent(CHROME_UA, CHROME_METADATA);
      } catch {
        ses.setUserAgent(CHROME_UA);
      }

      const isSwitchChannel = (targetMethod === 'switch-channel');

      // Matching BitChord BrowserSession.clearGoogleCookies():
      // If fresh sign-in, clear local cookies first so it doesn't immediately
      // lock onto the previous account. For SWITCH_CHANNEL, preserve existing cookies.
      if (targetMethod === 'fresh-login') {
        await clearGoogleSessionCookies(ses);
      }

      // Independent normal window (no parent / modal to avoid Google embedded browser detection)
      const loginWin = new BrowserWindow({
        width: 800,
        height: 700,
        minWidth: 500,
        minHeight: 600,
        backgroundColor: '#ffffff',
        title: isSwitchChannel ? 'Choose YouTube Music Profile - Deja' : 'Sign in to YouTube Music - Deja',
        autoHideMenuBar: true,
        webPreferences: {
          partition: 'persist:ytmusic',
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
          webSecurity: true,
          allowRunningInsecureContent: false
        }
      });
      activeLoginWin = loginWin;

      // Clean Chrome 131 User-Agent with no Electron tokens
      try {
        loginWin.webContents.setUserAgent(CHROME_UA, CHROME_METADATA);
      } catch {
        loginWin.webContents.setUserAgent(CHROME_UA);
      }

      // Handle popup windows during Google Auth (e.g. 2FA, passkeys, Security Keys)
      loginWin.webContents.setWindowOpenHandler(({ url }) => {
        return {
          action: 'allow',
          overrideBrowserWindowOptions: {
            width: 800,
            height: 700,
            minWidth: 500,
            minHeight: 600,
            backgroundColor: '#ffffff',
            userAgent: CHROME_UA,
            autoHideMenuBar: true,
            webPreferences: {
              partition: 'persist:ytmusic',
              nodeIntegration: false,
              contextIsolation: true,
              sandbox: true,
              webSecurity: true,
              allowRunningInsecureContent: false
            }
          }
        };
      });

      let authResolved = false;
      let checkInProgress = false;
      let pollInterval = null;
      let latestProbe = null;

      // BitChord session capture and validation logic:
      // Reads live ytcfg from music.youtube.com and verifies signing secret
      const captureSessionAndResolve = async () => {
        if (authResolved || checkInProgress) return false;
        checkInProgress = true;
        try {
          if (!loginWin || loginWin.isDestroyed()) return false;
          const curUrl = loginWin.webContents.getURL() || '';

          // Only capture when on music.youtube.com
          if (!curUrl.includes('music.youtube.com')) return false;

          // Probe live ytcfg from the active page
          const probe = await loginWin.webContents.executeJavaScript(YTCFG_PROBE_SCRIPT).catch(() => null);
          if (probe && (probe.loggedIn === 'true' || probe.loggedIn === true)) {
            latestProbe = probe;
          }
          const activeProbe = probe || latestProbe;
          const loggedIn = activeProbe && (activeProbe.loggedIn === 'true' || activeProbe.loggedIn === true);

          // Verify cookies across YouTube & Google domains
          const ytCookies = await ses.cookies.get({ domain: '.youtube.com' }).catch(() => []);
          const ytDomainCookies = await ses.cookies.get({ domain: 'youtube.com' }).catch(() => []);
          const musicCookies = await ses.cookies.get({ url: 'https://music.youtube.com' }).catch(() => []);
          const googleCookies = await ses.cookies.get({ domain: '.google.com' }).catch(() => []);
          const googleDomainCookies = await ses.cookies.get({ domain: 'google.com' }).catch(() => []);
          const allCookies = [...ytCookies, ...ytDomainCookies, ...musicCookies, ...googleCookies, ...googleDomainCookies];
          const cookieStr = allCookies.map(c => `${c.name}=${c.value}`).join('; ');

          const cookieNames = new Set(allCookies.map(c => c.name));
          const hasSid = hasApiSid(cookieStr) ||
                         cookieNames.has('SAPISID') ||
                         cookieNames.has('__Secure-3PAPISID') ||
                         cookieNames.has('__Secure-1PAPISID');

          if (!hasSid && !loggedIn) {
            return false;
          }

          const pageId = (activeProbe && activeProbe.pageId) || null;
          const dataSyncId = normalizeDataSyncId(activeProbe && activeProbe.dataSyncId);
          const authUser = (activeProbe && activeProbe.authUser) || '0';
          const visitorData = (activeProbe && activeProbe.visitorData) || null;
          const clientVersion = (activeProbe && activeProbe.clientVersion) || null;

          // Adopt live session scope exactly as BitChord Innertube does
          innertube.adoptSessionScope({
            pageId,
            dataSyncId,
            authUser,
            visitorData,
            clientVersion,
            loggedIn: true
          });

          const info = await innertube.getAccountInfo(ses);
          if (info && info.isLoggedIn) {
            authResolved = true;
            if (pollInterval) {
              clearInterval(pollInterval);
              pollInterval = null;
            }
            const scope = innertube.getSessionScope();
            await authStore.persistCurrentSession(ses, info, scope);
            await ses.cookies.flushStore().catch(() => {});

            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('auth-changed', info);
              mainWindow.webContents.send('auth-state-changed', info);
            }
            setTimeout(() => {
              if (loginWin && !loginWin.isDestroyed()) {
                loginWin.close();
              }
            }, 500);
            return true;
          }
        } catch (err) {
          console.warn('[Auth] Capture session error:', err.message);
        } finally {
          checkInProgress = false;
        }
        return false;
      };

      // Listen for confirmation button click inside music.youtube.com
      loginWin.webContents.on('console-message', (e, level, msg) => {
        if (typeof msg === 'string' && msg.includes('__DEJA_CONFIRM_PROFILE__')) {
          captureSessionAndResolve();
        }
      });

      // Navigation handler:
      // When reaching music.youtube.com, probe ytcfg and auto-capture session.
      const handleNavigation = async (navUrl) => {
        try {
          if (!loginWin || loginWin.isDestroyed()) return;
          const curUrl = navUrl || loginWin.webContents.getURL() || '';

          if (curUrl.includes('accounts.google.') || curUrl.includes('accounts.youtube.')) {
            return;
          }

          if (curUrl.includes('music.youtube.com')) {
            const probe = await loginWin.webContents.executeJavaScript(YTCFG_PROBE_SCRIPT).catch(() => null);
            if (probe && (probe.loggedIn === 'true' || probe.loggedIn === true)) {
              latestProbe = probe;
              await injectProfileConfirmationBar(loginWin);
              if (!isSwitchChannel && !authResolved) {
                setTimeout(() => {
                  if (!authResolved) captureSessionAndResolve();
                }, 600);
              }
            }
          }

          // In case user navigated to generic google and is authenticated
          const googleCookies = await ses.cookies.get({ domain: '.google.com' }).catch(() => []);
          const googleDomainCookies = await ses.cookies.get({ domain: 'google.com' }).catch(() => []);
          const googleCookieNames = new Set([...googleCookies, ...googleDomainCookies].map(c => c.name));
          const hasGoogleAuthCookie = googleCookieNames.has('SAPISID') ||
                                      googleCookieNames.has('SID') ||
                                      googleCookieNames.has('__Secure-3PAPISID') ||
                                      googleCookieNames.has('SSID');

          if (hasGoogleAuthCookie && !curUrl.includes('accounts.google.') && !curUrl.includes('music.youtube.com')) {
            if (loginWin && !loginWin.isDestroyed()) {
              loginWin.loadURL('https://music.youtube.com', { userAgent: CHROME_UA });
            }
          }
        } catch (err) {
          console.warn('[Auth] Navigation handler notice:', err.message);
        }
      };

      loginWin.webContents.on('did-navigate', (e, url) => {
        handleNavigation(url);
      });

      loginWin.webContents.on('did-navigate-in-page', (e, url) => {
        handleNavigation(url);
      });

      // Active polling every 1000ms:
      // Keeps confirmation bar attached and auto-captures session when ready
      pollInterval = setInterval(async () => {
        if (authResolved) {
          if (pollInterval) clearInterval(pollInterval);
          return;
        }
        if (!loginWin || loginWin.isDestroyed()) return;
        const curUrl = loginWin.webContents.getURL() || '';
        if (curUrl.includes('music.youtube.com')) {
          const probe = await loginWin.webContents.executeJavaScript(YTCFG_PROBE_SCRIPT).catch(() => null);
          if (probe && (probe.loggedIn === 'true' || probe.loggedIn === true)) {
            latestProbe = probe;
            await injectProfileConfirmationBar(loginWin);
            if (!isSwitchChannel && !authResolved) {
              await captureSessionAndResolve();
            }
          }
        }
      }, 1000);

      // Cookie change listener to detect login state change
      const onCookieChanged = (event, cookie, cause, removed) => {
        if (!removed && (
          cookie.name === 'SAPISID' ||
          cookie.name === 'SID' ||
          cookie.name === 'LOGIN_INFO' ||
          cookie.name === '__Secure-3PAPISID' ||
          cookie.name === '__Secure-1PAPISID' ||
          cookie.name === 'SSID'
        )) {
          handleNavigation();
        }
      };
      ses.cookies.on('changed', onCookieChanged);

      loginWin.on('closed', async () => {
        activeLoginWin = null;
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
        ses.cookies.removeListener('changed', onCookieChanged);
        if (!authResolved) {
          try {
            if (latestProbe && (latestProbe.loggedIn === 'true' || latestProbe.loggedIn === true)) {
              const pageId = latestProbe.pageId || null;
              const dataSyncId = pageId || normalizeDataSyncId(latestProbe.dataSyncId);
              innertube.adoptSessionScope({
                pageId,
                dataSyncId,
                authUser: latestProbe.authUser || '0',
                visitorData: latestProbe.visitorData || null,
                clientVersion: latestProbe.clientVersion || null,
                loggedIn: true
              });
            } else {
              await innertube.ensureSessionScope(ses, true).catch(() => {});
            }
            const info = await innertube.getAccountInfo(ses);
            if (info && info.isLoggedIn) {
              authResolved = true;
              const scope = innertube.getSessionScope();
              await authStore.persistCurrentSession(ses, info, scope);
              await ses.cookies.flushStore().catch(() => {});
              if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('auth-changed', info);
                mainWindow.webContents.send('auth-state-changed', info);
              }
            }
          } catch (err) {
            console.warn('[Auth] Closed handler resolution notice:', err.message);
          }
        }
        resolve(authResolved);
      });

      // Load initial URL
      if (isSwitchChannel || targetMethod === 'web-remix' || targetMethod === 'music-youtube') {
        loginWin.loadURL('https://music.youtube.com/', { userAgent: CHROME_UA });
      } else {
        loginWin.loadURL(BITCHORD_GOOGLE_SIGNIN_URL, { userAgent: CHROME_UA });
      }
    } catch (err) {
      console.error('[Auth] Failed to open Google login dialog:', err);
      resolve(false);
    }
  });
});

// Import session cookies from browser quick-connect or raw input
ipcMain.handle('import-session-cookies', async (event, cookieStr) => {
  const ses = session.fromPartition('persist:ytmusic');
  return await applySessionCookies(cookieStr, ses);
});

// Start the lightweight HTTP sync server if not already running
ipcMain.handle('start-cookie-sync-server', () => {
  startSyncServer();
  return true;
});

// Sign out / disconnect Google account
ipcMain.handle('logout-google', async () => {
  try {
    const ses = session.fromPartition('persist:ytmusic');
    await clearGoogleSessionCookies(ses);
    await ses.clearStorageData({
      storages: ['cookies', 'localstorage', 'cache']
    });
    authStore.clearAuthSession();
    if (typeof ses.cookies.flushStore === 'function') {
      await ses.cookies.flushStore().catch(() => {});
    }
    innertube.adoptSessionScope(null);
    const info = { isLoggedIn: false };
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('auth-changed', info);
      mainWindow.webContents.send('auth-state-changed', info);
    }
    return { success: true };
  } catch (err) {
    console.warn('[Auth] Logout error:', err.message);
    return { success: false, error: err.message };
  }
});

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
  if (!query) return [];
  try {
    const ses = session.fromPartition('persist:ytmusic');
    let q = query;
    let filter = null;
    if (typeof query === 'object' && query !== null) {
      q = query.query;
      filter = query.filter;
    }
    if (!q || typeof q !== 'string') return [];
    return await innertube.search(q, ses, filter);
  } catch (err) {
    console.warn('[Search] YouTube Music search error:', err.message);
    return [];
  }
});

// Live YouTube Music Search Suggestions (BitChord SearchScreen.kt)
ipcMain.handle('yt-search-suggestions', async (event, input) => {
  if (!input || typeof input !== 'string') return [];
  try {
    const ses = session.fromPartition('persist:ytmusic');
    return await innertube.getSearchSuggestions(input, ses);
  } catch (err) {
    console.warn('[Search] YouTube Music search suggestions error:', err.message);
    return [];
  }
});

// Live YouTube Music Artist Detail (BitChord DetailScreen.kt)
ipcMain.handle('yt-browse-artist', async (event, browseId) => {
  if (!browseId || typeof browseId !== 'string') return null;
  try {
    const ses = session.fromPartition('persist:ytmusic');
    return await innertube.getArtist(browseId, ses);
  } catch (err) {
    console.warn('[Browse] Artist browse error:', err.message);
    return null;
  }
});

// User YouTube Music History / Recently Played (FEmusic_history)
ipcMain.handle('yt-history', async () => {
  try {
    const ses = session.fromPartition('persist:ytmusic');
    return await innertube.getHistory(ses);
  } catch (err) {
    console.warn('[History] History browse error:', err.message);
    return { songs: [] };
  }
});

// YouTube Music Moods & Genres (FEmusic_moods_and_genres)
ipcMain.handle('yt-moods-genres', async () => {
  try {
    const ses = session.fromPartition('persist:ytmusic');
    return await innertube.getMoodsAndGenres(ses);
  } catch (err) {
    console.warn('[Browse] Moods and genres error:', err.message);
    return { categories: [] };
  }
});

// YouTube Music Playback Telemetry & History Sync (BitChord PlaybackTracker.kt)
ipcMain.handle('yt-track-playback', async (event, data) => {
  if (!data || !data.videoId) return false;
  try {
    const ses = session.fromPartition('persist:ytmusic');
    return await innertube.trackPlayback(data, ses);
  } catch (err) {
    return false;
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

// User Google Library Playlists (FEmusic_liked_playlists, FEmusic_library_playlists, FEmusic_library_landing)
ipcMain.handle('yt-library-playlists', async () => {
  try {
    const ses = session.fromPartition('persist:ytmusic');
    return await innertube.getLibraryPlaylists(ses);
  } catch (err) {
    console.warn('[Library] Liked playlists error:', err.message);
    return [];
  }
});

// User Google Library Saved Albums (FEmusic_liked_albums)
ipcMain.handle('yt-library-albums', async () => {
  try {
    const ses = session.fromPartition('persist:ytmusic');
    return await innertube.getLibraryAlbums(ses);
  } catch (err) {
    console.warn('[Library] Library albums error:', err.message);
    return [];
  }
});

// User Google Library Artists
ipcMain.handle('yt-library-artists', async () => {
  try {
    const ses = session.fromPartition('persist:ytmusic');
    return await innertube.getLibraryArtists(ses);
  } catch (err) {
    console.warn('[Library] Library artists error:', err.message);
    return [];
  }
});

// Unified User Library (playlists, liked songs, albums, artists)
ipcMain.handle('yt-user-library', async () => {
  try {
    const ses = session.fromPartition('persist:ytmusic');
    return await innertube.getUserLibrary(ses);
  } catch (err) {
    console.warn('[Library] User library error:', err.message);
    return { playlists: [], songs: [], albums: [], artists: [] };
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

// Synced Lyrics Resolution (LRCLIB & YouTube Music InnerTube)
async function handleGetLyrics(event, query) {
  if (!query || typeof query !== 'object') return null;
  try {
    const ses = session.fromPartition('persist:ytmusic');
    return await innertube.getLyrics(query, ses);
  } catch (err) {
    console.warn('[Lyrics] Lyrics resolution error:', err.message);
    return null;
  }
}
ipcMain.handle('yt-get-lyrics', handleGetLyrics);
ipcMain.handle('innertube-get-lyrics', handleGetLyrics);

// App Lifecycle
app.whenReady().then(async () => {
  startSyncServer();
  const ytSession = session.fromPartition('persist:ytmusic');
  const activeSessions = [session.defaultSession, ytSession];

  // Restore persistent authentication session from deja-auth.json
  let startupRestoreRes = null;
  try {
    startupRestoreRes = await authStore.restoreSessionOnStartup(ytSession);
    if (startupRestoreRes && startupRestoreRes.restored) {
      if (startupRestoreRes.sessionScope) {
        innertube.adoptSessionScope(startupRestoreRes.sessionScope);
      }
    }
  } catch (err) {
    console.warn('[Auth] Startup session restoration notice:', err.message);
  }

  activeSessions.forEach(ses => {
    const isGoogleAuthRequest = (url, initiator) => {
      if (!url) return false;
      const u = url.toLowerCase();
      const init = (initiator || '').toLowerCase();

      // Protected if initiated from Google / YouTube account authentication flow
      if (
        init.includes('accounts.google.') ||
        init.includes('accounts.youtube.') ||
        init.includes('myaccount.google.') ||
        init.includes('consent.youtube.') ||
        init.includes('consent.google.')
      ) {
        return true;
      }

      // Protected if target URL is Google / YouTube authentication or account infrastructure
      if (
        u.includes('accounts.google.com') ||
        u.includes('accounts.youtube.com') ||
        u.includes('accounts.google.') ||
        u.includes('accounts.youtube.') ||
        u.includes('myaccount.google.') ||
        u.includes('consent.youtube.') ||
        u.includes('consent.google.') ||
        u.includes('youtube.com/signin') ||
        u.includes('gstatic.com') ||
        u.includes('googleapis.com') ||
        u.includes('googleusercontent.com') ||
        u.includes('play.google.com') ||
        u.includes('google.com/recaptcha')
      ) {
        return true;
      }

      return false;
    };

    // Intercept headers: emulate genuine YouTube Music client and eliminate Error 150 / 101 embed blocks
    ses.webRequest.onBeforeSendHeaders((details, callback) => {
      const requestHeaders = details.requestHeaders || {};

      // 1. Strip any Electron and app tokens across all headers to prevent Google's "browser or app may not be secure" block
      for (const k of Object.keys(requestHeaders)) {
        if (typeof requestHeaders[k] === 'string') {
          if (/electron/i.test(requestHeaders[k])) {
            requestHeaders[k] = requestHeaders[k]
              .replace(/Electron\/[0-9\.]+\s*/gi, '')
              .replace(/"?Electron"?;v="?[0-9\.]+"?\s*,?\s*/gi, '')
              .replace(/Electron\s*/gi, '')
              .replace(/,\s*,/g, ', ')
              .replace(/^[,\s]+|[,\s]+$/g, '')
              .trim();
          }
          if (/deja/i.test(requestHeaders[k])) {
            requestHeaders[k] = requestHeaders[k]
              .replace(/Deja\/[0-9\.]+\s*/gi, '')
              .replace(/"?Deja"?;v="?[0-9\.]+"?\s*,?\s*/gi, '')
              .replace(/Deja\s*/gi, '')
              .replace(/,\s*,/g, ', ')
              .replace(/^[,\s]+|[,\s]+$/g, '')
              .trim();
          }
        }
      }

      const isGoogleAuth = (
        details.url.includes('accounts.google.com') ||
        details.url.includes('accounts.youtube.com') ||
        details.url.includes('accounts.google.') ||
        details.url.includes('accounts.youtube.') ||
        isGoogleAuthRequest(details.url, details.initiator)
      );

      // Clean file:// origin/referer for Google OAuth & auth endpoints without tampering with native Client Hints
      if (isGoogleAuth) {
        const origin = requestHeaders['Origin'] || requestHeaders['origin'] || '';
        const referer = requestHeaders['Referer'] || requestHeaders['referer'] || '';
        if (origin && origin.startsWith('file://')) {
          delete requestHeaders['Origin'];
          delete requestHeaders['origin'];
        }
        if (referer && referer.startsWith('file://')) {
          delete requestHeaders['Referer'];
          delete requestHeaders['referer'];
        }
        return callback({ cancel: false, requestHeaders });
      }

      // Remove any lowercase/variant header keys before explicitly setting clean canonical headers
      for (const k of Object.keys(requestHeaders)) {
        const lower = k.toLowerCase();
        if (
          lower === 'user-agent' ||
          lower === 'sec-ch-ua' ||
          lower === 'sec-ch-ua-mobile' ||
          lower === 'sec-ch-ua-platform' ||
          lower === 'sec-ch-ua-full-version-list' ||
          lower === 'sec-ch-ua-model'
        ) {
          delete requestHeaders[k];
        }
      }

      // Enforce clean standard Chrome 131 User-Agent and consistent Client Hints
      requestHeaders['User-Agent'] = CHROME_UA;
      requestHeaders['Sec-Ch-Ua'] = '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"';
      requestHeaders['Sec-Ch-Ua-Mobile'] = '?0';
      requestHeaders['Sec-Ch-Ua-Platform'] = '"Windows"';
      requestHeaders['Sec-Ch-Ua-Full-Version-List'] = '"Google Chrome";v="131.0.6778.86", "Chromium";v="131.0.6778.86", "Not_A Brand";v="24.0.0.0"';

      const isYtOrGv = (
        details.url.includes('youtube.com') ||
        details.url.includes('youtube-nocookie.com') ||
        details.url.includes('googlevideo.com')
      );

      if (isYtOrGv) {
        const origin = requestHeaders['Origin'] || requestHeaders['origin'] || '';
        const referer = requestHeaders['Referer'] || requestHeaders['referer'] || '';
        if (!origin || origin.startsWith('file://')) {
          requestHeaders['Origin'] = 'https://music.youtube.com';
        }
        if (!referer || referer.startsWith('file://')) {
          requestHeaders['Referer'] = 'https://music.youtube.com/';
        }
      }

      callback({ cancel: false, requestHeaders });
    });

    // Strip iframe embedding restrictions and enable cross-origin media streaming
    ses.webRequest.onHeadersReceived((details, callback) => {
      // Do NOT mutate security headers on accounts.google.com or accounts.youtube.com (Google security scripts detect altered CSP/CORS)
      if (
        details.url.includes('accounts.google.com') ||
        details.url.includes('accounts.youtube.com') ||
        details.url.includes('accounts.google.') ||
        details.url.includes('accounts.youtube.') ||
        isGoogleAuthRequest(details.url, details.initiator)
      ) {
        return callback({ cancel: false });
      }

      // Only strip iframe restrictions or enable CORS for player media streaming and embed iframes
      const isEmbedOrMedia = (
        details.url.includes('googlevideo.com') ||
        details.url.includes('youtube.com/embed/') ||
        details.url.includes('youtube-nocookie.com/embed/')
      );

      if (!isEmbedOrMedia) {
        return callback({ cancel: false });
      }

      const responseHeaders = { ...details.responseHeaders };
      for (const k of Object.keys(responseHeaders)) {
        const lower = k.toLowerCase();
        if (lower === 'x-frame-options' || lower === 'content-security-policy' || lower === 'access-control-allow-origin') {
          delete responseHeaders[k];
        }
      }
      let allowedOrigin = details.initiator;
      if (!allowedOrigin) {
        if (
          details.url.includes('googlevideo.com') ||
          details.url.includes('youtube.com')
        ) {
          allowedOrigin = 'https://www.youtube.com';
        } else {
          allowedOrigin = 'https://music.youtube.com';
        }
      }
      responseHeaders['access-control-allow-origin'] = [allowedOrigin];
      responseHeaders['access-control-allow-credentials'] = ['true'];
      callback({ cancel: false, responseHeaders });
    });
  });

  createWindow();

  // Validate session with InnerTube and push auth state to renderer
  const pushStartupAuth = async () => {
    try {
      const info = await innertube.getAccountInfo(ytSession);
      if (info && info.isLoggedIn) {
        authStore.updateSavedAccount(info);
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('auth-changed', info);
          mainWindow.webContents.send('auth-state-changed', info);
        }
      }
    } catch (err) {
      console.warn('[Auth] Startup session validation notice:', err.message);
    }
  };

  if (mainWindow) {
    mainWindow.webContents.once('dom-ready', () => {
      if (startupRestoreRes && startupRestoreRes.account && startupRestoreRes.account.isLoggedIn) {
        if (!mainWindow.isDestroyed()) {
          mainWindow.webContents.send('auth-changed', startupRestoreRes.account);
          mainWindow.webContents.send('auth-state-changed', startupRestoreRes.account);
        }
      }
      pushStartupAuth();
    });
  }

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

app.on('before-quit', async () => {
  try {
    const ytSession = session.fromPartition('persist:ytmusic');
    if (typeof ytSession.cookies.flushStore === 'function') {
      await ytSession.cookies.flushStore().catch(() => {});
    }
  } catch {}
});

app.on('will-quit', () => {
  try {
    const ytSession = session.fromPartition('persist:ytmusic');
    if (typeof ytSession.cookies.flushStore === 'function') {
      ytSession.cookies.flushStore().catch(() => {});
    }
  } catch {}
  if (syncServer) {
    try { syncServer.close(); } catch {}
    syncServer = null;
  }
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    startSyncServer,
    applySessionCookies,
    parseCookiePairs,
    authStore
  };
}
