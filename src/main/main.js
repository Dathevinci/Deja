const { app, BrowserWindow, ipcMain, shell, session, Notification } = require('electron');
const path = require('path');
const config = require('./config');
const ShortcutManager = require('./shortcuts');
const TrayManager = require('./tray');
const discord = require('./discord');
const { buildAppMenu } = require('./menu');

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

// User Agent spoofing for Google Login compatibility
const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
app.userAgentFallback = CHROME_UA;

let mainWindow = null;
let shortcutManager = null;
let trayManager = null;
let isMiniPlayer = false;
let normalBounds = null;
let wasMaximizedBeforeMini = false;

// Hardware acceleration option
if (!config.get('hardwareAcceleration')) {
  app.disableHardwareAcceleration();
}

function createWindow() {
  const savedBounds = config.get('windowBounds');
  const isPreview = process.argv.includes('--preview');

  mainWindow = new BrowserWindow({
    width: savedBounds.width || 1300,
    height: savedBounds.height || 860,
    x: savedBounds.x,
    y: savedBounds.y,
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

  // Set application menu
  const menu = buildAppMenu(mainWindow);
  mainWindow.setMenu(menu);

  // Initialize helper managers
  shortcutManager = new ShortcutManager(mainWindow, (action) => {
    if (action === 'toggleMiniPlayer') {
      toggleMiniPlayer();
      return true;
    }
    return false;
  });
  shortcutManager.registerAll();

  const iconPath = path.join(__dirname, '../../assets/icon.ico');
  trayManager = new TrayManager(mainWindow, iconPath);
  trayManager.init();

  if (config.get('discordRPC')) {
    discord.init(true);
  }

  // Load URL or preview mode
  if (isPreview) {
    mainWindow.loadFile(path.join(__dirname, '../renderer/preview.html'));
  } else {
    mainWindow.loadURL('https://music.youtube.com', {
      userAgent: CHROME_UA
    });
  }

  // Window events
  mainWindow.once('ready-to-show', () => {
    if (!config.get('startMinimized')) {
      if (savedBounds.isMaximized) {
        mainWindow.maximize();
      }
      mainWindow.show();
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

    if (!isMiniPlayer) {
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

  // Handle network failure gracefully with fallback option
  mainWindow.webContents.on('did-fail-load', (e, errorCode, errorDescription, validatedURL) => {
    if (errorCode !== -3 && (!validatedURL || !validatedURL.includes('preview.html'))) { // -3 is ABORTED
      console.warn(`[Network] Failed to load ${validatedURL}: ${errorDescription} (${errorCode})`);
      mainWindow.loadFile(path.join(__dirname, '../renderer/offline-fallback.html'));
    }
  });
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

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    if (!mainWindow.isVisible()) mainWindow.show();
    mainWindow.focus();
  }
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
