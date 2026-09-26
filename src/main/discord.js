const net = require('net');
const os = require('os');
const path = require('path');

const CLIENT_ID = '1288594238914560000'; // Registered Sonora / YTM Apple client application id

class DiscordPresence {
  constructor() {
    this.client = null;
    this.connected = false;
    this.enabled = true;
    this.reconnectTimer = null;
    this.currentActivity = null;
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

  getPipePath(id = 0) {
    if (process.platform === 'win32') {
      return `\\\\?\\pipe\\discord-ipc-${id}`;
    }
    const envPath = process.env.XDG_RUNTIME_DIR || process.env.TMPDIR || process.env.TMP || '/tmp';
    return path.join(envPath, `discord-ipc-${id}`);
  }

  connect() {
    if (this.connected || !this.enabled) return;

    try {
      const pipePath = this.getPipePath(0);
      this.client = net.createConnection(pipePath, () => {
        this.connected = true;
        this._handshake();
      });

      this.client.on('error', () => {
        this.connected = false;
        this._scheduleReconnect();
      });

      this.client.on('close', () => {
        this.connected = false;
        this._scheduleReconnect();
      });

      this.client.on('data', (data) => {
        // Handle incoming IPC messages if needed
      });
    } catch {
      this.connected = false;
      this._scheduleReconnect();
    }
  }

  _handshake() {
    const payload = JSON.stringify({ v: 1, client_id: CLIENT_ID });
    this._send(0, payload);
  }

  _send(op, data) {
    if (!this.connected || !this.client) return;

    try {
      const len = Buffer.byteLength(data);
      const header = Buffer.alloc(8);
      header.writeInt32LE(op, 0);
      header.writeInt32LE(len, 4);
      this.client.write(Buffer.concat([header, Buffer.from(data)]));
    } catch (err) {
      this.connected = false;
    }
  }

  _scheduleReconnect() {
    if (this.reconnectTimer || !this.enabled) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.enabled && !this.connected) {
        this.connect();
      }
    }, 15000);
  }

  updateTrack(track) {
    if (!this.enabled || !track) return;

    const isAd = !!track.isAd;
    const isPlaying = track.isPlaying;
    const title = isAd ? 'Advertisement (Google)' : (track.title || 'Unknown Title');
    const artist = isAd ? 'Free Tier • Sponsored' : (track.artist || 'Unknown Artist');
    const album = isAd ? 'YouTube Music Ads' : (track.album || 'YouTube Music');

    const activity = {
      details: title.length > 128 ? title.slice(0, 125) + '...' : title,
      state: isAd ? artist : `by ${artist}`.slice(0, 128),
      assets: {
        large_image: isAd ? 'sonora_logo' : (track.coverUrl || 'sonora_logo'),
        large_text: album.slice(0, 128),
        small_image: isPlaying ? 'play_icon' : 'pause_icon',
        small_text: isAd ? 'Ad Playing' : (isPlaying ? 'Playing' : 'Paused')
      },
      timestamps: isPlaying && track.duration && !isAd
        ? {
            start: Math.floor((Date.now() - (track.currentTime || 0) * 1000) / 1000),
            end: Math.floor((Date.now() + ((track.duration || 0) - (track.currentTime || 0)) * 1000) / 1000)
          }
        : undefined
    };

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

  clear() {
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
        this.client.end();
      } catch {}
      this.client = null;
    }
    this.connected = false;
  }
}

module.exports = new DiscordPresence();
