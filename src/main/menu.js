const { Menu, shell, app, dialog } = require('electron');
const path = require('path');

function buildAppMenu(mainWindow) {
  const dispatch = (action, payload = null) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('player-action', { action, payload });
    }
  };

  const template = [
    {
      label: 'Deja',
      submenu: [
        {
          label: 'About Deja',
          click: () => dispatch('openAbout')
        },
        {
          label: 'Preferences...',
          accelerator: 'CommandOrControl+,',
          click: () => dispatch('openSettings')
        },
        { type: 'separator' },
        {
          label: 'Always on Top',
          type: 'checkbox',
          checked: mainWindow ? mainWindow.isAlwaysOnTop() : false,
          click: (item) => {
            if (mainWindow) {
              mainWindow.setAlwaysOnTop(item.checked);
            }
          }
        },
        {
          label: 'Mini Player',
          accelerator: 'CommandOrControl+Shift+M',
          click: () => dispatch('toggleMiniPlayer')
        },
        { type: 'separator' },
        {
          label: 'Hide Deja',
          accelerator: 'CommandOrControl+H',
          click: () => {
            if (mainWindow) mainWindow.hide();
          }
        },
        {
          label: 'Quit Deja',
          accelerator: 'CommandOrControl+Q',
          click: () => {
            app.isQuitting = true;
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Playback',
      submenu: [
        {
          label: 'Play / Pause',
          accelerator: 'Space',
          click: () => dispatch('togglePlay')
        },
        {
          label: 'Next Track',
          accelerator: 'CommandOrControl+Right',
          click: () => dispatch('nextTrack')
        },
        {
          label: 'Previous Track',
          accelerator: 'CommandOrControl+Left',
          click: () => dispatch('prevTrack')
        },
        { type: 'separator' },
        {
          label: 'Volume Up',
          accelerator: 'CommandOrControl+Up',
          click: () => dispatch('volumeUp')
        },
        {
          label: 'Volume Down',
          accelerator: 'CommandOrControl+Down',
          click: () => dispatch('volumeDown')
        },
        {
          label: 'Mute',
          accelerator: 'CommandOrControl+Shift+M',
          click: () => dispatch('toggleMute')
        },
        { type: 'separator' },
        {
          label: 'Like Song',
          accelerator: 'CommandOrControl+L',
          click: () => dispatch('toggleLike')
        },
        {
          label: 'Toggle Repeat',
          accelerator: 'CommandOrControl+R',
          click: () => dispatch('toggleRepeat')
        },
        {
          label: 'Toggle Shuffle',
          accelerator: 'CommandOrControl+S',
          click: () => dispatch('toggleShuffle')
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Show Live Lyrics',
          accelerator: 'CommandOrControl+Shift+L',
          click: () => dispatch('toggleLyrics')
        },
        {
          label: 'Show Queue',
          accelerator: 'CommandOrControl+Shift+Q',
          click: () => dispatch('toggleQueue')
        },
        {
          label: 'Toggle Web / Native Client Mode',
          accelerator: 'CommandOrControl+Shift+W',
          click: async () => {
            if (!mainWindow || mainWindow.isDestroyed()) return;
            const currentURL = mainWindow.webContents.getURL() || '';
            if (currentURL.includes('music.youtube.com')) {
              await mainWindow.loadFile(path.join(__dirname, '../renderer/preview.html'));
            } else {
              await mainWindow.loadURL('https://music.youtube.com', { userAgent: app.userAgentFallback });
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Reload',
          accelerator: 'CommandOrControl+Shift+R',
          click: () => {
            if (mainWindow) mainWindow.reload();
          }
        },
        {
          label: 'Force Reload',
          accelerator: 'CommandOrControl+Alt+R',
          click: () => {
            if (mainWindow) mainWindow.webContents.reloadIgnoringCache();
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) mainWindow.webContents.toggleDevTools();
          }
        },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Google & YouTube TOS Compliance',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'YouTube Music Policy & TOS Compliance',
              message: 'Deja is a desktop client for YouTube Music.',
              detail: '• Deja acts strictly as an Apple Music-styled user interface for YouTube Music.\n• Standard Google Ads are displayed for free-tier users per Google Rules.\n• YouTube Premium subscribers receive their native ad-free playback.\n• We do not alter, inject, or block advertisements or bypass paywalls.\n• YouTube and YouTube Music are registered trademarks of Google LLC.',
              buttons: ['Understood', 'View Google Terms']
            }).then((res) => {
              if (res.response === 1) {
                shell.openExternal('https://www.youtube.com/t/terms');
              }
            });
          }
        },
        {
          label: 'GitHub Repository',
          click: () => {
            shell.openExternal('https://github.com/Dathevinci/Deja');
          }
        },
        {
          label: 'Report an Issue',
          click: () => {
            shell.openExternal('https://github.com/Dathevinci/Deja/issues');
          }
        }
      ]
    }
  ];

  return Menu.buildFromTemplate(template);
}

module.exports = { buildAppMenu };
