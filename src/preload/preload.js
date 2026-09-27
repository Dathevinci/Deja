const { contextBridge, ipcRenderer, webFrame } = require('electron');
const fs = require('fs');
const path = require('path');
const { initDejaApplePlayer, initSonoraApplePlayer } = require('./apple-player');

// Define Deja safe API bridge
const dejaAPI = {
  windowAction: (action) => ipcRenderer.invoke('window-action', action),
  sendTrackChanged: (track) => ipcRenderer.send('track-changed', track),
  getConfig: (key) => ipcRenderer.invoke('get-config', key),
  setConfig: (payload) => ipcRenderer.invoke('set-config', payload),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  openGoogleLogin: () => ipcRenderer.invoke('open-google-login'),
  toggleWebMode: () => ipcRenderer.invoke('toggle-web-mode'),
  searchYouTube: (query) => ipcRenderer.invoke('yt-search', query),
  getHomeFeed: () => ipcRenderer.invoke('yt-home-feed'),
  getExploreFeed: () => ipcRenderer.invoke('yt-explore-feed'),
  getChartsFeed: () => ipcRenderer.invoke('yt-charts-feed'),
  getNewReleasesFeed: () => ipcRenderer.invoke('yt-new-releases-feed'),
  getLibrarySongs: () => ipcRenderer.invoke('yt-library-songs'),
  getLibraryPlaylists: () => ipcRenderer.invoke('yt-library-playlists'),
  getBrowsePlaylist: (browseId) => ipcRenderer.invoke('yt-browse-playlist', browseId),
  getNextQueue: (videoId) => ipcRenderer.invoke('yt-next-queue', videoId),
  resolveAudioStream: (videoId) => ipcRenderer.invoke('yt-resolve-stream', videoId),
  getAccountInfo: () => ipcRenderer.invoke('yt-account-info'),
  rateSong: (videoId, status) => ipcRenderer.invoke('yt-rate', { videoId, status }),
  onAuthChanged: (callback) => {
    ipcRenderer.on('auth-state-changed', (event, data) => callback(data));
  },
  onPlayerAction: (callback) => {
    ipcRenderer.on('player-action', (event, data) => callback(data));
  },
  onMiniPlayerChanged: (callback) => {
    ipcRenderer.on('miniplayer-state-changed', (event, isMini) => callback(isMini));
  }
};
const sonoraAPI = dejaAPI;

// Make available in the preload execution context
window.dejaAPI = dejaAPI;
window.sonoraAPI = sonoraAPI;

// Expose safe Deja and Sonora APIs to the webpage main world context
try {
  contextBridge.exposeInMainWorld('dejaAPI', dejaAPI);
  contextBridge.exposeInMainWorld('sonoraAPI', sonoraAPI);
} catch (e) {
  // If context isolation is disabled or in testing environment
  window.dejaAPI = dejaAPI;
  window.sonoraAPI = sonoraAPI;
}

const LYRICS_STYLES = `
  .deja-lyrics-drawer,
  .sonora-lyrics-drawer {
    position: fixed;
    top: 42px;
    right: 0;
    bottom: 80px;
    width: 480px;
    background: rgba(18, 18, 20, 0.92);
    backdrop-filter: blur(50px) saturate(200%);
    -webkit-backdrop-filter: blur(50px) saturate(200%);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    transform: translateX(100%);
    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    overflow: hidden;
  }
  .deja-lyrics-drawer.visible,
  .sonora-lyrics-drawer.visible {
    transform: translateX(0);
  }
  .deja-lyrics-aura,
  .sonora-lyrics-aura {
    position: absolute;
    inset: -20%;
    background-size: cover;
    background-position: center;
    filter: blur(80px) brightness(0.4) saturate(250%);
    opacity: 0.65;
    z-index: 0;
    animation: dejaAuraPulse 12s infinite alternate ease-in-out;
  }
  @keyframes dejaAuraPulse {
    0% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.15) rotate(4deg); }
    100% { transform: scale(1.05) rotate(-3deg); }
  }
  @keyframes sonoraAuraPulse {
    0% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.15) rotate(4deg); }
    100% { transform: scale(1.05) rotate(-3deg); }
  }
  .deja-lyrics-header,
  .sonora-lyrics-header {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  .deja-lyrics-meta,
  .sonora-lyrics-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-width: 80%;
  }
  .deja-lyrics-title,
  .sonora-lyrics-title {
    font-size: 18px;
    font-weight: 700;
    color: #FFFFFF;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0;
  }
  .deja-lyrics-artist,
  .sonora-lyrics-artist {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.65);
    margin: 0;
  }
  .deja-lyrics-close,
  .sonora-lyrics-close {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #FFFFFF;
    font-size: 20px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
  }
  .deja-lyrics-close:hover,
  .sonora-lyrics-close:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  .deja-lyrics-body,
  .sonora-lyrics-body {
    position: relative;
    z-index: 1;
    flex: 1;
    overflow-y: auto;
    padding: 32px 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .deja-lyric-line,
  .sonora-lyric-line {
    font-size: 22px;
    font-weight: 600;
    line-height: 1.4;
    color: rgba(255, 255, 255, 0.35);
    transition: color 0.3s ease, transform 0.3s ease, filter 0.3s ease;
    cursor: pointer;
    filter: blur(0.4px);
  }
  .deja-lyric-line:hover,
  .sonora-lyric-line:hover {
    color: rgba(255, 255, 255, 0.7);
  }
  .deja-lyric-line.active,
  .sonora-lyric-line.active {
    color: #FFFFFF;
    font-size: 26px;
    font-weight: 700;
    transform: scale(1.02);
    filter: none;
    text-shadow: 0 4px 20px rgba(255, 255, 255, 0.35);
  }
`;

// Inject styles immediately via webFrame (immune to CSP restrictions on YouTube Music)
try {
  const themeCssPath = path.join(__dirname, 'apple-theme.css');
  if (fs.existsSync(themeCssPath)) {
    const cssContent = fs.readFileSync(themeCssPath, 'utf8');
    if (webFrame && webFrame.insertCSS) {
      webFrame.insertCSS(cssContent);
    }
  }

  if (webFrame && webFrame.insertCSS) {
    webFrame.insertCSS(LYRICS_STYLES);
  }
} catch (e) {
  console.warn('[Preload] webFrame.insertCSS notice:', e.message);
}

// DOM-ready initialization
function onDOMReady() {
  try {
    // Initialize Deja Apple UI & Player observer directly in preload context
    // This executes safely without being blocked by website Content-Security-Policy (CSP)
    const initPlayer = initDejaApplePlayer || initSonoraApplePlayer || require('./apple-player');
    initPlayer(dejaAPI);
  } catch (err) {
    console.error('[Preload] Failed to initialize Deja Apple controller:', err);
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', onDOMReady);
} else {
  onDOMReady();
}
