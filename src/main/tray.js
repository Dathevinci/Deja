const { Tray, Menu, nativeImage, app } = require('electron');
const path = require('path');

class TrayManager {
  constructor(mainWindow, iconPath) {
    this.mainWindow = mainWindow;
    this.iconPath = iconPath;
    this.tray = null;
    this.currentTrack = {
      title: 'Sonora Music',
      artist: 'No track playing',
      isPlaying: false
    };
  }

  init() {
    try {
      let icon;
      if (this.iconPath && require('fs').existsSync(this.iconPath)) {
        icon = nativeImage.createFromPath(this.iconPath);
      } else {
        icon = nativeImage.createEmpty();
      }

      this.tray = new Tray(icon);
      this.tray.setToolTip('Sonora - YouTube Music (Apple Edition)');

      this.tray.on('double-click', () => {
        this.toggleWindow();
      });

      this.updateMenu();
    } catch (err) {
      console.warn('[Tray] Failed to initialize system tray:', err.message);
    }
  }

  toggleWindow() {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
    if (this.mainWindow.isVisible()) {
      if (this.mainWindow.isFocused()) {
        this.mainWindow.hide();
      } else {
        this.mainWindow.focus();
      }
    } else {
      this.mainWindow.show();
      this.mainWindow.focus();
    }
  }

  updateTrack(trackInfo) {
    if (!trackInfo) return;
    this.currentTrack = Object.assign(this.currentTrack, trackInfo);

    if (this.tray && !this.tray.isDestroyed()) {
      let tooltip;
      if (this.currentTrack.isAd) {
        tooltip = '📢 Advertisement (Google / Free Tier)';
      } else {
        tooltip = this.currentTrack.isPlaying
          ? `▶ ${this.currentTrack.title} — ${this.currentTrack.artist}`
          : `⏸ ${this.currentTrack.title} — ${this.currentTrack.artist}`;
      }
      this.tray.setToolTip(tooltip.slice(0, 127));
      this.updateMenu();
    }
  }

  updateMenu() {
    if (!this.tray || this.tray.isDestroyed()) return;

    const dispatch = (action) => {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('player-action', { action });
      }
    };

    const isPlaying = this.currentTrack.isPlaying;
    let trackLabel;
    if (this.currentTrack.isAd) {
      trackLabel = '📢 Advertisement (Google / Free Tier)';
    } else {
      trackLabel = this.currentTrack.title !== 'Sonora Music'
        ? `${this.currentTrack.title} • ${this.currentTrack.artist}`
        : 'Sonora YouTube Music';
    }

    const contextMenu = Menu.buildFromTemplate([
      {
        label: trackLabel,
        enabled: false,
        icon: undefined
      },
      { type: 'separator' },
      {
        label: isPlaying ? '⏸  Pause' : '▶  Play',
        click: () => dispatch('togglePlay')
      },
      {
        label: '⏭  Next Track',
        click: () => dispatch('nextTrack')
      },
      {
        label: '⏮  Previous Track',
        click: () => dispatch('prevTrack')
      },
      { type: 'separator' },
      {
        label: '🎤  Live Lyrics',
        click: () => dispatch('toggleLyrics')
      },
      {
        label: '🪟  Mini Player',
        click: () => dispatch('toggleMiniPlayer')
      },
      { type: 'separator' },
      {
        label: this.mainWindow && this.mainWindow.isVisible() ? 'Hide Window' : 'Show Sonora',
        click: () => this.toggleWindow()
      },
      {
        label: 'Settings...',
        click: () => dispatch('openSettings')
      },
      { type: 'separator' },
      {
        label: 'Quit Sonora',
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  destroy() {
    if (this.tray && !this.tray.isDestroyed()) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}

module.exports = TrayManager;
