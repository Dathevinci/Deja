const net = require('net');
const os = require('os');
const path = require('path');

// Standard registered Discord application client ID for YouTube Music / Deja
const CLIENT_ID = '463097721130188830';

class DiscordPresence {
  constructor() {
    this.client = null;
    this.connected = false;
    this.enabled = true;
    this.reconnectTimer = null;
    this.reconnectDelay = 2000;
    this.currentActivity = null;
    this.pendingActivity = null;
    this.currentPipe = 0;
  }

  init(enabled = true) {
    this.enabled = enabled;
    if (this.enabled) {
      this.connect();
    }
  }

  setEnabled(val) {
    this.enabled = !!val;
    if (!this.enabled) {
      this.clear();
      this.disconnect();
    } else {
      this.connect();
    }
  }

  getPipePaths(id = 0) {
    if (process.platform === 'win32') {
      return [
        `\\\\?\\pipe\\discord-ipc-${id}`,
        `\\\\.\\pipe\\discord-ipc-${id}`
      ];
    }
    const envPaths = [
      process.env.XDG_RUNTIME_DIR,
      process.env.TMPDIR,
      process.env.TMP,
      process.env.TEMP,
      '/tmp'
    ].filter(Boolean);

    return envPaths.map(ep => path.join(ep, `discord-ipc-${id}`));
  }

  /**
   * Connect to Discord IPC socket across all pipes (discord-ipc-0 through discord-ipc-9)
   */
  connect(pipeIndex = 0) {
    if (this.connected || !this.enabled) return;

    if (this.client) {
      try { this.client.destroy(); } catch {}
      this.client = null;
    }

    if (pipeIndex > 9) {
      // Completed sweep of all discord pipes 0..9 without a successful connection
      this.connected = false;
      this._scheduleReconnect();
      return;
    }

    const candidatePaths = this.getPipePaths(pipeIndex);
    this._tryConnectPaths(candidatePaths, 0, (connected) => {
      if (connected) {
        this.currentPipe = pipeIndex;
        this.reconnectDelay = 2000; // Reset backoff on success
      } else {
        // Try next pipe in sequence
        this.connect(pipeIndex + 1);
      }
    });
  }

  _tryConnectPaths(paths, pathIndex, done) {
    if (pathIndex >= paths.length || this.connected || !this.enabled) {
      return done(false);
    }

    const pipePath = paths[pathIndex];
    let socket = null;
    let handled = false;

    const cleanup = () => {
      if (socket && !this.connected) {
        try { socket.destroy(); } catch {}
      }
    };

    try {
      socket = net.createConnection(pipePath);

      socket.once('connect', () => {
        if (handled) return;
        handled = true;
        this.client = socket;
        this.connected = true;
        this._setupSocket(socket);
        this._handshake();
        done(true);
      });

      socket.once('error', () => {
        if (handled) return;
        handled = true;
        cleanup();
        this._tryConnectPaths(paths, pathIndex + 1, done);
      });
    } catch {
      if (!handled) {
        handled = true;
        cleanup();
        this._tryConnectPaths(paths, pathIndex + 1, done);
      }
    }
  }

  _setupSocket(socket) {
    socket.on('error', () => {
      this._handleDisconnect();
    });

    socket.on('close', () => {
      this._handleDisconnect();
    });

    socket.on('data', () => {
      // Handle incoming IPC messages if needed
    });
  }

  _handleDisconnect() {
    this.connected = false;
    if (this.client) {
      try { this.client.destroy(); } catch {}
      this.client = null;
    }
    this._scheduleReconnect();
  }

  _handshake() {
    const payload = JSON.stringify({ v: 1, client_id: CLIENT_ID });
    this._send(0, payload);

    if (this.pendingActivity) {
      this.updateActivity(this.pendingActivity);
    }
  }

  _send(op, data) {
    if (!this.connected || !this.client) return;

    try {
      const len = Buffer.byteLength(data);
      const header = Buffer.alloc(8);
      header.writeInt32LE(op, 0);
      header.writeInt32LE(len, 4);
      this.client.write(Buffer.concat([header, Buffer.from(data)]));
    } catch {
      this.connected = false;
      this._handleDisconnect();
    }
  }

  /**
   * Exponential backoff reconnection handler if Discord is started after Deja
   */
  _scheduleReconnect() {
    if (this.reconnectTimer || !this.enabled) return;

    const delay = this.reconnectDelay || 2000;
    // Exponential backoff: 2s -> 3s -> 4.5s -> 6.75s -> ... max 30s
    this.reconnectDelay = Math.min(Math.round(delay * 1.5), 30000);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.enabled && !this.connected) {
        this.connect(0);
      }
    }, delay);
  }

  /**
   * Update Discord Rich Presence activity
   */
  updateActivity(data) {
    if (!data) return;
    this.pendingActivity = data;
    if (!this.enabled) return;

    const isAd = !!data.isAd;
    const isPlaying = data.isPlaying !== false;
    const title = isAd ? 'Advertisement (Google)' : (data.title || 'Unknown Title');
    const artist = isAd ? 'Free Tier • Sponsored' : (data.artist || 'Unknown Artist');
    const album = isAd ? 'YouTube Music Ads' : (data.album || 'YouTube Music');

    const coverUrl = data.artworkUrl || data.coverUrl || data.cover;
    const hasValidCoverUrl = typeof coverUrl === 'string' && (coverUrl.startsWith('https://') || coverUrl.startsWith('http://'));

    const remainingSec = data.remainingTime != null
      ? data.remainingTime
      : ((data.duration && data.currentTime != null) ? Math.max(0, data.duration - data.currentTime) : 0);

    const activity = {
      details: title.length > 128 ? title.slice(0, 125) + '...' : title,
      state: isAd ? artist : `by ${artist}`.slice(0, 128),
      assets: {
        large_image: isAd ? 'deja_logo' : (hasValidCoverUrl ? coverUrl : 'deja_logo'),
        large_text: album.slice(0, 128),
        small_image: isPlaying ? 'play_icon' : 'pause_icon',
        small_text: isAd ? 'Ad Playing' : (isPlaying ? 'Playing' : 'Paused')
      }
    };

    if (isPlaying && data.duration && !isAd) {
      activity.timestamps = {
        start: Math.floor((Date.now() - (data.currentTime || 0) * 1000) / 1000),
        end: Math.floor((Date.now() + remainingSec * 1000) / 1000)
      };
    }

    this.currentActivity = activity;

    const payload = JSON.stringify({
      cmd: 'SET_ACTIVITY',
      args: {
        pid: process.pid,
        activity: activity
      },
      nonce: Math.random().toString(36).substring(2)
    });

    this._send(1, payload);
  }

  updateTrack(track) {
    return this.updateActivity(track);
  }

  clear() {
    this.pendingActivity = null;
    this.currentActivity = null;
    if (!this.connected) return;
    const payload = JSON.stringify({
      cmd: 'SET_ACTIVITY',
      args: {
        pid: process.pid,
        activity: null
      },
      nonce: Math.random().toString(36).substring(2)
    });
    this._send(1, payload);
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.client) {
      try {
        this.client.destroy();
      } catch {}
      this.client = null;
    }
    this.connected = false;
  }
}

module.exports = new DiscordPresence();

