const net = require('net');
const os = require('os');
const path = require('path');

// Standard registered Discord application client ID for Deja (Legacy ID: 463097721130188830)
const CLIENT_ID = '1411019391843172514';
const DEJA_LOGO_URL = 'https://raw.githubusercontent.com/Dathevinci/Deja/main/Logo.png';
const DEJA_PROJECT_URL = 'https://github.com/Dathevinci/Deja';
const MIN_SEND_INTERVAL_MS = 1500;

class DiscordPresence {
  constructor() {
    this.client = null;
    this.connected = false;
    this.ready = false;
    this.enabled = true;
    this.reconnectTimer = null;
    this.reconnectDelay = 2000;
    this.currentActivity = null;
    this.pendingActivity = null;
    this.currentPipe = 0;
    this.useDetails = false;
    this.showAudioQuality = true;
    this.activityName = 'Deja';
    this.presenceStatus = 'online';
    this.audioQualityLabel = '160kbps Opus';
    this.hasEverPlayed = false;
    this._recvBuffer = Buffer.alloc(0);
    this._lastSendAt = 0;
    this._lastSentSignature = '';
    this._flushTimer = null;
    this._readyFallbackTimer = null;
  }

  init(enabled = true, initialSettings = null) {
    if (initialSettings && typeof initialSettings === 'object') {
      this.updateSettings(initialSettings);
    }
    this.enabled = enabled;
    if (this.enabled) {
      this.connect();
    }
  }

  setEnabled(val) {
    this.enabled = !!val;
    if (!this.enabled) {
      this._sendClearActivity();
      this.disconnect();
    } else {
      this.connect();
      if (this.pendingActivity) {
        this._lastSentSignature = '';
        this.updateActivity(this.pendingActivity);
      }
    }
  }

  _destroySocket(socket) {
    if (!socket) return;
    try {
      if (typeof socket.removeAllListeners === 'function') {
        socket.removeAllListeners();
      }
      if (typeof socket.on === 'function') {
        socket.on('error', () => {});
      }
      if (typeof socket.destroy === 'function') {
        socket.destroy();
      }
    } catch {}
  }

  updateSettings(opts = {}) {
    if (!opts || typeof opts !== 'object') return;
    if ('enabled' in opts || 'discordRPC' in opts || 'discordRpc' in opts) {
      const en = opts.enabled ?? opts.discordRPC ?? opts.discordRpc;
      this.setEnabled(en);
    }
    if (typeof opts.useDetails === 'boolean' || typeof opts.discordUseDetails === 'boolean') {
      this.useDetails = Boolean(opts.useDetails ?? opts.discordUseDetails);
    }
    if (typeof opts.showAudioQuality === 'boolean' || typeof opts.discordShowAudioQuality === 'boolean') {
      this.showAudioQuality = Boolean(opts.showAudioQuality ?? opts.discordShowAudioQuality);
    }
    if (typeof opts.activityName === 'string' || typeof opts.discordActivityName === 'string') {
      const name = String(opts.activityName ?? opts.discordActivityName).trim();
      this.activityName = name || 'Deja';
    }
    if (typeof opts.status === 'string' || typeof opts.discordStatus === 'string') {
      this.presenceStatus = String((opts.status ?? opts.discordStatus) || 'online');
    }
    if (typeof opts.audioQualityLabel === 'string' && opts.audioQualityLabel.trim()) {
      this.audioQualityLabel = opts.audioQualityLabel.trim();
    }
    if (this.enabled && this.pendingActivity) {
      this._lastSentSignature = '';
      this.updateActivity(this.pendingActivity);
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
      this._destroySocket(this.client);
      this.client = null;
    }

    if (pipeIndex > 9) {
      // Completed sweep of all discord pipes 0..9 without a successful connection
      this.connected = false;
      this.ready = false;
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
      if (socket && this.client !== socket) {
        this._destroySocket(socket);
      }
    };

    try {
      socket = net.createConnection(pipePath);

      socket.once('connect', () => {
        if (handled) return;
        handled = true;
        this.client = socket;
        this.connected = true;
        this.ready = false;
        this._recvBuffer = Buffer.alloc(0);
        this._lastSentSignature = '';
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
      if (this.client !== socket) return;
      this._handleDisconnect();
    });

    socket.on('close', () => {
      if (this.client !== socket) return;
      this._handleDisconnect();
    });

    socket.on('data', (chunk) => {
      if (this.client !== socket) return;
      if (!Buffer.isBuffer(chunk)) return;
      this._recvBuffer = Buffer.concat([this._recvBuffer, chunk]);
      while (this._recvBuffer.length >= 8) {
        const op = this._recvBuffer.readInt32LE(0);
        const len = this._recvBuffer.readInt32LE(4);
        if (len < 0 || len > 1024 * 1024) {
          this._recvBuffer = Buffer.alloc(0);
          break;
        }
        if (this._recvBuffer.length < 8 + len) break;
        const payloadStr = this._recvBuffer.slice(8, 8 + len).toString('utf8');
        this._recvBuffer = this._recvBuffer.slice(8 + len);

        if (op === 3) {
          // Discord IPC PING -> Respond with PONG (op=4)
          this._send(4, payloadStr || '{}');
        } else if (op === 2) {
          // Discord IPC CLOSE
          this._handleDisconnect();
          return;
        } else if (op === 1) {
          try {
            const msg = JSON.parse(payloadStr);
            if (msg && msg.cmd === 'DISPATCH' && msg.evt === 'READY') {
              this.ready = true;
              if (this._readyFallbackTimer) {
                clearTimeout(this._readyFallbackTimer);
                this._readyFallbackTimer = null;
              }
              if (this.pendingActivity) {
                this._lastSentSignature = '';
                this.updateActivity(this.pendingActivity);
              }
            }
          } catch {}
        }
      }
    });
  }

  _handleDisconnect() {
    this.connected = false;
    this.ready = false;
    this._recvBuffer = Buffer.alloc(0);
    if (this._readyFallbackTimer) {
      clearTimeout(this._readyFallbackTimer);
      this._readyFallbackTimer = null;
    }
    if (this._flushTimer) {
      clearTimeout(this._flushTimer);
      this._flushTimer = null;
    }
    if (this.client) {
      this._destroySocket(this.client);
      this.client = null;
    }
    this._scheduleReconnect();
  }

  _handshake() {
    const payload = JSON.stringify({ v: 1, client_id: CLIENT_ID });
    this._send(0, payload);

    // Fallback in case a mock or older IPC bridge doesn't emit a DISPATCH READY frame
    if (this._readyFallbackTimer) clearTimeout(this._readyFallbackTimer);
    this._readyFallbackTimer = setTimeout(() => {
      this._readyFallbackTimer = null;
      if (this.connected && !this.ready) {
        this.ready = true;
        if (this.pendingActivity) {
          this._lastSentSignature = '';
          this.updateActivity(this.pendingActivity);
        }
      }
    }, 350);
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

  _computeActivitySignature(activity) {
    if (!activity) return 'null';
    const endBucket = activity.timestamps && activity.timestamps.end
      ? Math.round(activity.timestamps.end / 2)
      : 0;
    return JSON.stringify({
      name: activity.name,
      type: activity.type,
      status_display_type: activity.status_display_type,
      details: activity.details,
      state: activity.state,
      large_image: activity.assets ? activity.assets.large_image : '',
      large_text: activity.assets ? activity.assets.large_text : '',
      small_text: activity.assets ? activity.assets.small_text : '',
      endBucket
    });
  }

  _dispatchActivity(activity) {
    if (!this.connected || !this.client) return;
    if (!this.ready) return;

    const sig = this._computeActivitySignature(activity);
    if (sig === this._lastSentSignature) return;

    const now = Date.now();
    const elapsed = now - this._lastSendAt;
    if (elapsed >= MIN_SEND_INTERVAL_MS) {
      if (this._flushTimer) {
        clearTimeout(this._flushTimer);
        this._flushTimer = null;
      }
      this._lastSendAt = now;
      this._lastSentSignature = sig;
      const payload = JSON.stringify({
        cmd: 'SET_ACTIVITY',
        args: {
          pid: process.pid,
          activity: activity
        },
        nonce: Math.random().toString(36).substring(2)
      });
      this._send(1, payload);
    } else if (!this._flushTimer) {
      const waitMs = Math.max(100, MIN_SEND_INTERVAL_MS - elapsed);
      this._flushTimer = setTimeout(() => {
        this._flushTimer = null;
        if (this.enabled && this.connected && this.currentActivity) {
          this._dispatchActivity(this.currentActivity);
        }
      }, waitMs);
    }
  }

  /**
   * Update Discord Rich Presence activity
   */
  updateActivity(data) {
    if (!data) return;
    if (data !== this.pendingActivity) {
      data._receivedAt = typeof data._receivedAt === 'number' ? data._receivedAt : Date.now();
    }
    this.pendingActivity = data;
    if (!this.enabled) return;

    const isAd = !!data.isAd;
    const isPlaying = data.isPlaying !== false;
    if (isPlaying) {
      this.hasEverPlayed = true;
    }

    const isIdleDefault = !isAd && data.title === 'Deja' && (!data.artist || data.artist === 'YouTube Music');
    const title = isAd
      ? 'Advertisement (Google)'
      : (isIdleDefault ? 'Browsing Music' : (data.title || 'Unknown Title'));
    const artist = isAd
      ? 'Free Tier • Sponsored'
      : (isIdleDefault ? 'Deja • 2-Bit Edition' : (data.artist || 'Unknown Artist'));
    const rawAlbum = data.album && data.album !== 'YouTube Music' ? data.album : 'Deja';
    const qualitySuffix = (this.showAudioQuality && !isAd && (data.audioQuality || this.audioQualityLabel))
      ? ` · ${data.audioQuality || this.audioQualityLabel}`
      : '';
    const album = isAd ? 'YouTube Music Ads' : `${rawAlbum}${qualitySuffix}`;

    const rawCoverUrl = data.artworkUrl || data.coverUrl || data.cover;
    const videoId = typeof data.videoId === 'string' && /^[a-zA-Z0-9_-]{8,15}$/.test(data.videoId.trim())
      ? data.videoId.trim()
      : '';
    const fallbackYtCover = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : DEJA_LOGO_URL;
    const hasValidCoverUrl = typeof rawCoverUrl === 'string' &&
      (rawCoverUrl.startsWith('https://') || rawCoverUrl.startsWith('http://')) &&
      rawCoverUrl.length <= 256;
    const resolvedCoverUrl = hasValidCoverUrl ? rawCoverUrl : fallbackYtCover;

    const elapsedSinceReceived = (isPlaying && typeof data._receivedAt === 'number')
      ? Math.max(0, (Date.now() - data._receivedAt) / 1000)
      : 0;
    const effectiveCurrentTime = data.duration
      ? Math.min(Number(data.duration), Math.max(0, (Number(data.currentTime) || 0) + elapsedSinceReceived))
      : Math.max(0, (Number(data.currentTime) || 0) + elapsedSinceReceived);
    const remainingSec = data.remainingTime != null
      ? Math.max(0, Number(data.remainingTime) - elapsedSinceReceived)
      : ((data.duration && data.currentTime != null) ? Math.max(0, Number(data.duration) - effectiveCurrentTime) : 0);

    const activity = {
      name: this.useDetails && !isIdleDefault ? title.slice(0, 128) : (this.activityName || 'Deja'),
      type: 2,
      status_display_type: this.useDetails ? 2 : 1,
      details: title.length > 128 ? title.slice(0, 125) + '...' : title,
      state: (isAd || isIdleDefault) ? artist : `by ${artist}`.slice(0, 128),
      assets: {
        large_image: isAd ? DEJA_LOGO_URL : resolvedCoverUrl,
        large_text: album.slice(0, 128),
        small_image: DEJA_LOGO_URL,
        small_text: isAd ? 'Ad Playing' : (isPlaying ? `Listening on ${this.activityName || 'Deja'}${qualitySuffix}` : `Paused on ${this.activityName || 'Deja'}`).slice(0, 128)
      }
    };

    if (!isAd && !isIdleDefault) {
      if (videoId) {
        const watchUrl = `https://music.youtube.com/watch?v=${videoId}`;
        activity.details_url = watchUrl;
        activity.buttons = [
          { label: 'Listen on YouTube Music', url: watchUrl },
          { label: 'Visit Deja', url: DEJA_PROJECT_URL }
        ];
      } else {
        activity.buttons = [
          { label: 'Visit Deja', url: DEJA_PROJECT_URL }
        ];
      }
    }

    if (isPlaying && data.duration && !isAd) {
      activity.timestamps = {
        start: Math.floor((Date.now() - effectiveCurrentTime * 1000) / 1000),
        end: Math.floor((Date.now() + remainingSec * 1000) / 1000)
      };
    }

    this.currentActivity = activity;

    // Do not broadcast a fake paused song on cold start before the user has played anything
    if (!isPlaying && !this.hasEverPlayed && !isIdleDefault) {
      return;
    }

    this._dispatchActivity(activity);
  }

  updateTrack(track) {
    return this.updateActivity(track);
  }

  _sendClearActivity() {
    this.currentActivity = null;
    this._lastSentSignature = '';
    if (this._flushTimer) {
      clearTimeout(this._flushTimer);
      this._flushTimer = null;
    }
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

  clear() {
    this.pendingActivity = null;
    this._sendClearActivity();
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this._readyFallbackTimer) {
      clearTimeout(this._readyFallbackTimer);
      this._readyFallbackTimer = null;
    }
    if (this._flushTimer) {
      clearTimeout(this._flushTimer);
      this._flushTimer = null;
    }
    if (this.client) {
      this._destroySocket(this.client);
      this.client = null;
    }
    this.connected = false;
    this.ready = false;
  }
}

module.exports = new DiscordPresence();


