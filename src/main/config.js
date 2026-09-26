const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const DEFAULT_CONFIG = {
  theme: 'dark', // 'dark' | 'light' | 'pure-black'
  accentColor: '#FA2D48', // Apple Music Ruby Red
  windowBounds: {
    width: 1300,
    height: 860,
    x: undefined,
    y: undefined,
    isMaximized: false
  },
  miniPlayerBounds: {
    width: 340,
    height: 120,
    x: undefined,
    y: undefined
  },
  minimizeToTray: true,
  closeToTray: false,
  discordRPC: true,
  notifications: true,
  hardwareAcceleration: true,
  appleTrafficLights: true,
  startMinimized: false,
  lastUrl: 'https://music.youtube.com',
  volume: 1.0,
  audioQuality: 'high',
  equalizerPreset: 'Flat',
  equalizerGains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
};

class ConfigManager {
  constructor() {
    this.configPath = this._resolvePath();
    this.data = this._load();
  }

  _resolvePath() {
    try {
      const userDataPath = app ? app.getPath('userData') : path.join(process.cwd(), '.config');
      if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, { recursive: true });
      }
      return path.join(userDataPath, 'sonora-config.json');
    } catch {
      return path.join(process.cwd(), 'sonora-config.json');
    }
  }

  _load() {
    try {
      if (fs.existsSync(this.configPath)) {
        const raw = fs.readFileSync(this.configPath, 'utf8');
        const parsed = JSON.parse(raw);
        return Object.assign({}, DEFAULT_CONFIG, parsed);
      }
    } catch (err) {
      console.warn('[Config] Failed to load config, falling back to defaults:', err.message);
    }
    return Object.assign({}, DEFAULT_CONFIG);
  }

  get(key) {
    if (key === undefined) return Object.assign({}, this.data);
    return this.data[key] !== undefined ? this.data[key] : DEFAULT_CONFIG[key];
  }

  set(key, value) {
    if (typeof key === 'object' && key !== null) {
      Object.assign(this.data, key);
    } else {
      this.data[key] = value;
    }
    this.save();
  }

  save() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.data, null, 2), 'utf8');
      return true;
    } catch (err) {
      console.error('[Config] Failed to save config:', err.message);
      return false;
    }
  }

  reset() {
    this.data = Object.assign({}, DEFAULT_CONFIG);
    this.save();
    return this.data;
  }
}

const configInstance = new ConfigManager();
module.exports = configInstance;
