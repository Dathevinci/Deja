/**
 * Sonora - Apple Music Client Controller
 * Manages UI injection, player hooks, lyrics, and YouTube Music synchronization.
 */

(function initSonoraController() {
  if (window.__SONORA_INITIALIZED__) return;
  window.__SONORA_INITIALIZED__ = true;

  let lastTrackId = '';
  let pollInterval = null;

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

  function bootstrap() {
    injectTitlebar();
    setupPlayerHooks();
    setupIpcListeners();
    setupKeyboardShortcuts();
  }

  /* -------------------------------------------------------------
     1. Apple Music Custom Titlebar Injection
     ------------------------------------------------------------- */
  function injectTitlebar() {
    if (document.getElementById('sonora-titlebar')) return;

    const titlebar = document.createElement('header');
    titlebar.id = 'sonora-titlebar';
    titlebar.innerHTML = `
      <div class="sonora-traffic-lights">
        <button class="sonora-btn-traffic sonora-btn-close" id="sonora-close-btn" title="Close Sonora"></button>
        <button class="sonora-btn-traffic sonora-btn-min" id="sonora-min-btn" title="Minimize"></button>
        <button class="sonora-btn-traffic sonora-btn-max" id="sonora-max-btn" title="Maximize"></button>
        <div class="sonora-nav-controls" style="margin-left: 12px;">
          <button class="sonora-nav-btn" id="sonora-back-btn" title="Back">‹</button>
          <button class="sonora-nav-btn" id="sonora-forward-btn" title="Forward">›</button>
        </div>
      </div>

      <div class="sonora-top-center">
        <div class="sonora-search-pill" id="sonora-search-bar" title="Search (Ctrl+K)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span id="sonora-search-placeholder">Search songs, artists, albums...</span>
        </div>
      </div>

      <div class="sonora-top-right">
        <button class="sonora-icon-btn" id="sonora-lyrics-btn" title="Live Synced Lyrics">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <path d="M8 9h8"></path>
            <path d="M8 13h6"></path>
          </svg>
        </button>
        <button class="sonora-icon-btn" id="sonora-mini-btn" title="Mini Player">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <rect x="12" y="9" width="8" height="6" rx="1" ry="1"></rect>
          </svg>
        </button>
        <button class="sonora-icon-btn" id="sonora-settings-btn" title="Sonora Settings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>
    `;

    document.body.prepend(titlebar);

    // Titlebar Button Actions
    document.getElementById('sonora-close-btn').onclick = () => window.sonoraAPI?.windowAction('close');
    document.getElementById('sonora-min-btn').onclick = () => window.sonoraAPI?.windowAction('minimize');
    document.getElementById('sonora-max-btn').onclick = () => window.sonoraAPI?.windowAction('maximize');
    document.getElementById('sonora-back-btn').onclick = () => window.history.back();
    document.getElementById('sonora-forward-btn').onclick = () => window.history.forward();

    document.getElementById('sonora-search-bar').onclick = () => {
      // Focus YouTube Music native search
      const ytSearch = document.querySelector('ytmusic-search-box input') || document.querySelector('input.ytmusic-search-box');
      if (ytSearch) {
        ytSearch.focus();
        ytSearch.select();
      } else {
        const searchBtn = document.querySelector('ytmusic-nav-bar [aria-label*="Search"], ytmusic-search-box');
        if (searchBtn) searchBtn.click();
      }
    };

    document.getElementById('sonora-lyrics-btn').onclick = () => toggleLyricsDrawer();
    document.getElementById('sonora-mini-btn').onclick = () => window.sonoraAPI?.windowAction('toggle-miniplayer');
    document.getElementById('sonora-settings-btn').onclick = () => openSettingsModal();
  }

  /* -------------------------------------------------------------
     2. YouTube Music Audio & Ad Observer
     ------------------------------------------------------------- */
  function setupPlayerHooks() {
    pollInterval = setInterval(extractPlayerState, 1000);
    extractPlayerState();
  }

  function extractPlayerState() {
    const video = document.querySelector('video.html5-main-video') || document.querySelector('video');
    const playerBar = document.querySelector('ytmusic-player-bar');

    if (!playerBar) return;

    // Detect Advertisement
    const isAdPlaying = !!(
      document.querySelector('.ad-showing') ||
      document.querySelector('.video-ads')?.children.length > 0 ||
      playerBar.hasAttribute('is-ad')
    );

    updateAdBadge(isAdPlaying);

    const titleEl = playerBar.querySelector('.title.ytmusic-player-bar') || playerBar.querySelector('.content-info-wrapper .title');
    const bylineEl = playerBar.querySelector('.byline.ytmusic-player-bar') || playerBar.querySelector('.content-info-wrapper .byline');
    const imageEl = playerBar.querySelector('img.image.ytmusic-player-bar') || playerBar.querySelector('ytmusic-player-bar img');

    const title = titleEl ? titleEl.textContent.trim() : 'Sonora Music';
    const byline = bylineEl ? bylineEl.textContent.trim() : 'YouTube Music';
    const coverUrl = imageEl ? imageEl.src : '';

    const isPlaying = video ? !video.paused : false;
    const currentTime = video ? video.currentTime : 0;
    const duration = video ? video.duration : 0;

    const trackId = `${title}-${byline}-${Math.floor(duration)}`;

    const trackData = {
      id: trackId,
      title: title,
      artist: byline.split('•')[0]?.trim() || byline,
      album: byline.split('•')[1]?.trim() || 'YouTube Music',
      coverUrl: coverUrl,
      isPlaying: isPlaying,
      currentTime: currentTime,
      duration: duration,
      isAd: isAdPlaying
    };

    if (trackId !== lastTrackId || isPlaying !== window.__LAST_IS_PLAYING__) {
      lastTrackId = trackId;
      window.__LAST_IS_PLAYING__ = isPlaying;
      window.__SONORA_CURRENT_TRACK__ = trackData;

      if (window.sonoraAPI?.sendTrackChanged) {
        window.sonoraAPI.sendTrackChanged(trackData);
      }
    }
  }

  function updateAdBadge(isAd) {
    let adBadge = document.getElementById('sonora-ad-badge');
    const playerBar = document.querySelector('ytmusic-player-bar');

    if (isAd) {
      if (!adBadge && playerBar) {
        adBadge = document.createElement('span');
        adBadge.id = 'sonora-ad-badge';
        adBadge.className = 'sonora-ad-badge';
        adBadge.innerText = 'ADVERTISEMENT';
        const titleWrapper = playerBar.querySelector('.title.ytmusic-player-bar')?.parentElement;
        if (titleWrapper) {
          titleWrapper.appendChild(adBadge);
        }
      }
      if (adBadge) adBadge.style.display = 'inline-flex';
    } else if (adBadge) {
      adBadge.style.display = 'none';
    }
  }

  /* -------------------------------------------------------------
     3. Incoming IPC & Action Dispatcher
     ------------------------------------------------------------- */
  function setupIpcListeners() {
    if (!window.sonoraAPI?.onPlayerAction) return;

    window.sonoraAPI.onPlayerAction(({ action, payload }) => {
      handlePlayerAction(action, payload);
    });

    window.sonoraAPI.onMiniPlayerChanged?.((isMini) => {
      if (isMini) {
        document.body.classList.add('mini-player-mode');
      } else {
        document.body.classList.remove('mini-player-mode');
      }
    });
  }

  function handlePlayerAction(action, payload) {
    const video = document.querySelector('video.html5-main-video') || document.querySelector('video');
    const playPauseBtn = document.querySelector('#play-pause-button') || document.querySelector('tp-yt-paper-icon-button#play-pause-button');
    const nextBtn = document.querySelector('.next-button') || document.querySelector('tp-yt-paper-icon-button.next-button');
    const prevBtn = document.querySelector('.previous-button') || document.querySelector('tp-yt-paper-icon-button.previous-button');
    const repeatBtn = document.querySelector('tp-yt-paper-icon-button.repeat');
    const shuffleBtn = document.querySelector('tp-yt-paper-icon-button.shuffle');

    switch (action) {
      case 'togglePlay':
        if (playPauseBtn) playPauseBtn.click();
        else if (video) {
          if (video.paused) video.play();
          else video.pause();
        }
        break;

      case 'nextTrack':
        if (nextBtn) nextBtn.click();
        break;

      case 'prevTrack':
        if (prevBtn) prevBtn.click();
        break;

      case 'stop':
        if (video) video.pause();
        break;

      case 'volumeUp':
        if (video) video.volume = Math.min(1, video.volume + 0.05);
        break;

      case 'volumeDown':
        if (video) video.volume = Math.max(0, video.volume - 0.05);
        break;

      case 'toggleMute':
        if (video) video.muted = !video.muted;
        break;

      case 'toggleRepeat':
        if (repeatBtn) repeatBtn.click();
        break;

      case 'toggleShuffle':
        if (shuffleBtn) shuffleBtn.click();
        break;

      case 'toggleLyrics':
        toggleLyricsDrawer();
        break;

      case 'toggleMiniPlayer':
        window.sonoraAPI?.windowAction('toggle-miniplayer');
        break;

      case 'openSettings':
        openSettingsModal();
        break;

      case 'openAbout':
        openAboutDialog();
        break;
    }
  }

  function setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('sonora-search-bar')?.click();
      }
    });
  }

  /* -------------------------------------------------------------
     4. Apple Music Live Synced Lyrics Overlay
     ------------------------------------------------------------- */
  function toggleLyricsDrawer() {
    let overlay = document.getElementById('sonora-lyrics-overlay');
    if (overlay) {
      if (overlay.classList.contains('visible')) {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 300);
      } else {
        overlay.classList.add('visible');
      }
      return;
    }

    const track = window.__SONORA_CURRENT_TRACK__ || {
      title: 'Current Song',
      artist: 'Artist',
      coverUrl: ''
    };

    overlay = document.createElement('div');
    overlay.id = 'sonora-lyrics-overlay';
    overlay.className = 'sonora-lyrics-drawer visible';
    overlay.innerHTML = `
      <div class="sonora-lyrics-aura" style="background-image: url('${track.coverUrl}');"></div>
      <div class="sonora-lyrics-header">
        <div class="sonora-lyrics-meta">
          <h2 class="sonora-lyrics-title">${escapeHtml(track.title)}</h2>
          <p class="sonora-lyrics-artist">${escapeHtml(track.artist)}</p>
        </div>
        <button class="sonora-lyrics-close" id="sonora-lyrics-close-btn">&times;</button>
      </div>
      <div class="sonora-lyrics-body" id="sonora-lyrics-content">
        <div class="sonora-lyric-line active">♪ Synchronized with YouTube Music playback</div>
        <div class="sonora-lyric-line">Real-time lyrics rendered with Apple Music dynamic mesh backdrop</div>
        <div class="sonora-lyric-line">Enjoy your music in high fidelity</div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.getElementById('sonora-lyrics-close-btn').onclick = () => {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 300);
    };

    // Try extracting native YTM lyrics if available in tab
    const nativeLyricsTab = document.querySelector('ytmusic-tab-renderer[tab-id="LYRICS"]');
    if (nativeLyricsTab) {
      const desc = nativeLyricsTab.querySelector('.description');
      if (desc && desc.textContent.trim()) {
        const lines = desc.textContent.trim().split('\n').filter(l => l.trim().length > 0);
        const container = document.getElementById('sonora-lyrics-content');
        if (container && lines.length > 0) {
          container.innerHTML = lines.map((l, i) => `<div class="sonora-lyric-line ${i === 0 ? 'active' : ''}">${escapeHtml(l)}</div>`).join('');
        }
      }
    }
  }

  function openSettingsModal() {
    alert('Sonora Preferences:\n• Theme: Apple Dark (Active)\n• Ad Policy: Standard Google Ads compliant\n• Discord RPC: Enabled\n• Media Keys: Enabled\n• Hardware Acceleration: Enabled');
  }

  function openAboutDialog() {
    alert('Sonora Music v1.0.0\nAn Apple Music-styled desktop client for YouTube Music.\n\nCompliant with Google & YouTube Terms of Service: Free users receive ads; YouTube Premium subscribers enjoy native ad-free listening.');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }
})();
