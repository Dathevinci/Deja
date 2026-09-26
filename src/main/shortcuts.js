const { globalShortcut } = require('electron');

class ShortcutManager {
  constructor(mainWindow, ipcCallback) {
    this.mainWindow = mainWindow;
    this.ipcCallback = ipcCallback;
    this.registered = false;
  }

  registerAll() {
    if (this.registered) return;

    const dispatch = (action, payload = null) => {
      if (typeof this.ipcCallback === 'function') {
        const handled = this.ipcCallback(action, payload);
        if (handled) return;
      }
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('player-action', { action, payload });
      }
    };

    // Hardware Media Keys
    this._safeRegister('MediaPlayPause', () => dispatch('togglePlay'));
    this._safeRegister('MediaNextTrack', () => dispatch('nextTrack'));
    this._safeRegister('MediaPreviousTrack', () => dispatch('prevTrack'));
    this._safeRegister('MediaStop', () => dispatch('stop'));

    // Desktop Global Shortcuts
    this._safeRegister('CommandOrControl+Alt+Space', () => dispatch('togglePlay'));
    this._safeRegister('CommandOrControl+Alt+Right', () => dispatch('nextTrack'));
    this._safeRegister('CommandOrControl+Alt+Left', () => dispatch('prevTrack'));
    this._safeRegister('CommandOrControl+Alt+Up', () => dispatch('volumeUp'));
    this._safeRegister('CommandOrControl+Alt+Down', () => dispatch('volumeDown'));
    this._safeRegister('CommandOrControl+Alt+M', () => dispatch('toggleMiniPlayer'));
    this._safeRegister('CommandOrControl+Alt+L', () => dispatch('toggleLyrics'));

    this.registered = true;
  }

  _safeRegister(accelerator, handler) {
    try {
      if (!globalShortcut.isRegistered(accelerator)) {
        globalShortcut.register(accelerator, handler);
      }
    } catch (err) {
      console.warn(`[Shortcuts] Failed to register shortcut ${accelerator}:`, err.message);
    }
  }

  unregisterAll() {
    try {
      globalShortcut.unregisterAll();
      this.registered = false;
    } catch (err) {
      console.warn('[Shortcuts] Error unregistering shortcuts:', err.message);
    }
  }
}

module.exports = ShortcutManager;
