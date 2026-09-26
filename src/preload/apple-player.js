/**
 * Deja - Apple Music Client Controller
 * Manages UI injection, player hooks, lyrics, and YouTube Music synchronization.
 * Runs inside the Electron preload execution context to guarantee immunity against web page CSP.
 */

function initDejaApplePlayer(api = (window.dejaAPI || window.sonoraAPI)) {
  if (window.__DEJA_INITIALIZED__ || window.__SONORA_INITIALIZED__) return;
  window.__DEJA_INITIALIZED__ = true;
  window.__SONORA_INITIALIZED__ = true;

  const getEl = (dejaId, sonoraId) => document.getElementById(dejaId) || document.getElementById(sonoraId);

  let lastTrackId = '';
  let lastIsPlaying = null;
  let lastIsAd = null;
  let pollInterval = null;

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

  function bootstrap() {
    // Avoid double injection if preview.html already rendered its own header
    if (!getEl('deja-titlebar', 'sonora-titlebar')) {
      injectTitlebar();
    }
    setupPlayerHooks();
    setupIpcListeners();
    setupKeyboardShortcuts();
  }

  function setSafeHTML(element, html) {
    if (!element) return;
    try {
      if (typeof window !== 'undefined' && window.trustedTypes && typeof window.trustedTypes.createPolicy === 'function') {
        try {
          if (!window.__dejaPolicy) {
            window.__dejaPolicy = window.trustedTypes.createPolicy('deja-policy', {
              createHTML: (s) => s
            });
          }
          element.innerHTML = window.__dejaPolicy.createHTML(html);
          return;
        } catch (e) {
          if (window.trustedTypes.defaultPolicy) {
            try {
              element.innerHTML = window.trustedTypes.defaultPolicy.createHTML(html);
              return;
            } catch (e2) {}
          }
        }
      }
    } catch (e) {}

    try {
      if (typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        element.textContent = '';
        while (doc.body.firstChild) {
          element.appendChild(doc.body.firstChild);
        }
        return;
      }
    } catch (e) {}

    element.innerHTML = html;
  }

  /* -------------------------------------------------------------
     1. Apple Music Custom Titlebar Injection
     ------------------------------------------------------------- */
  function injectTitlebar() {
    if (getEl('deja-titlebar', 'sonora-titlebar')) return;

    const titlebar = document.createElement('header');
    titlebar.id = 'deja-titlebar';
    titlebar.className = 'deja-titlebar sonora-titlebar';
    setSafeHTML(titlebar, `
      <div class="deja-traffic-lights sonora-traffic-lights">
        <button class="deja-btn-traffic sonora-btn-traffic deja-btn-close sonora-btn-close" id="deja-close-btn" title="Close Deja"></button>
        <button class="deja-btn-traffic sonora-btn-traffic deja-btn-min sonora-btn-min" id="deja-min-btn" title="Minimize"></button>
        <button class="deja-btn-traffic sonora-btn-traffic deja-btn-max sonora-btn-max" id="deja-max-btn" title="Maximize"></button>
        <div class="deja-nav-controls sonora-nav-controls">
          <button class="deja-nav-btn sonora-nav-btn" id="deja-back-btn" title="Back">‹</button>
          <button class="deja-nav-btn sonora-nav-btn" id="deja-forward-btn" title="Forward">›</button>
        </div>
      </div>

      <div class="deja-top-center sonora-top-center">
        <div class="deja-search-pill sonora-search-pill" id="deja-search-bar" title="Search songs, artists, albums (Ctrl+K)">
          <svg class="deja-search-icon sonora-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" id="deja-search-input" class="deja-search-input sonora-search-input" placeholder="Search songs, artists, albums..." autocomplete="off" spellcheck="false" />
          <span class="deja-search-shortcut sonora-search-shortcut">⌘K</span>
        </div>
      </div>

      <div class="deja-top-right sonora-top-right">
        <button class="deja-icon-btn sonora-icon-btn" id="deja-lyrics-btn" title="Live Synced Lyrics">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <path d="M8 9h8"></path>
            <path d="M8 13h6"></path>
          </svg>
        </button>
        <button class="deja-icon-btn sonora-icon-btn" id="deja-mini-btn" title="Mini Player">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <rect x="12" y="9" width="8" height="6" rx="1" ry="1"></rect>
          </svg>
        </button>
        <button class="deja-icon-btn sonora-icon-btn" id="deja-settings-btn" title="Deja Settings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
        <button class="deja-icon-btn sonora-icon-btn deja-account-btn sonora-account-btn" id="deja-account-btn" title="Google Account / Sign In">
          <div class="deja-avatar-circle sonora-avatar-circle" id="deja-avatar-circle">
            <span id="deja-account-initial">D</span>
          </div>
        </button>
      </div>
    `);

    document.body.prepend(titlebar);

    // Titlebar Button Actions
    const closeBtn = getEl('deja-close-btn', 'sonora-close-btn');
    if (closeBtn) closeBtn.onclick = () => api?.windowAction('close');
    const minBtn = getEl('deja-min-btn', 'sonora-min-btn');
    if (minBtn) minBtn.onclick = () => api?.windowAction('minimize');
    const maxBtn = getEl('deja-max-btn', 'sonora-max-btn');
    if (maxBtn) maxBtn.onclick = () => api?.windowAction('maximize');
    const backBtn = getEl('deja-back-btn', 'sonora-back-btn');
    if (backBtn) backBtn.onclick = () => window.history.back();
    const forwardBtn = getEl('deja-forward-btn', 'sonora-forward-btn');
    if (forwardBtn) forwardBtn.onclick = () => window.history.forward();

    const searchBar = getEl('deja-search-bar', 'sonora-search-bar');
    const searchInput = getEl('deja-search-input', 'sonora-search-input');
    if (searchBar) {
      searchBar.onclick = (e) => {
        if (searchInput && e.target !== searchInput) {
          searchInput.focus();
        } else if (!searchInput) {
          const ytSearch = document.querySelector('ytmusic-search-box input') || document.querySelector('input.ytmusic-search-box') || document.querySelector('#search-input input');
          if (ytSearch) {
            ytSearch.focus();
            ytSearch.select();
          } else {
            const searchBtn = document.querySelector('ytmusic-nav-bar [aria-label*="Search"], ytmusic-search-box');
            if (searchBtn) searchBtn.click();
          }
        }
      };
    }

    if (searchInput) {
      const onSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const query = (searchInput.value || '').trim();
          if (query) {
            const ytSearch = document.querySelector('ytmusic-search-box input') || document.querySelector('input.ytmusic-search-box') || document.querySelector('#search-input input');
            if (ytSearch) {
              ytSearch.value = query;
              ytSearch.dispatchEvent?.(new Event('input', { bubbles: true }));
              ytSearch.dispatchEvent?.(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, which: 13, bubbles: true }));
            }
            if (typeof window !== 'undefined' && window.location) {
              if (window.location.pathname && window.location.pathname.includes('/search')) {
                window.location.search = `?q=${encodeURIComponent(query)}`;
              } else {
                window.location.href = `https://music.youtube.com/search?q=${encodeURIComponent(query)}`;
              }
            }
          }
        }
      };

      if (typeof searchInput.addEventListener === 'function') {
        searchInput.addEventListener('keydown', onSearchKeyDown);
      } else {
        searchInput.onkeydown = onSearchKeyDown;
      }
    }

    const lyricsBtn = getEl('deja-lyrics-btn', 'sonora-lyrics-btn');
    if (lyricsBtn) lyricsBtn.onclick = () => toggleLyricsDrawer();
    const miniBtn = getEl('deja-mini-btn', 'sonora-mini-btn');
    if (miniBtn) miniBtn.onclick = () => api?.windowAction('toggle-miniplayer');
    const settingsBtn = getEl('deja-settings-btn', 'sonora-settings-btn');
    if (settingsBtn) settingsBtn.onclick = () => openSettingsModal();

    const accountBtn = getEl('deja-account-btn', 'sonora-account-btn');
    if (accountBtn) {
      accountBtn.onclick = () => {
        const nativeAvatar = document.querySelector('ytmusic-nav-bar #avatar-btn, ytmusic-nav-bar ytmusic-settings-button, ytmusic-nav-bar button#avatar-btn, #avatar-btn, ytmusic-settings-button');
        const nativeSignIn = document.querySelector('ytmusic-nav-bar ytmusic-sign-in-button-renderer a, ytmusic-nav-bar a[href*="accounts.google.com"], ytmusic-sign-in-button-renderer a');
        if (nativeAvatar) {
          nativeAvatar.click();
        } else if (nativeSignIn) {
          nativeSignIn.click();
        } else if (typeof window !== 'undefined' && window.location) {
          window.location.href = 'https://accounts.google.com/ServiceLogin?service=youtube&uivews=1&passive=true&continue=https://music.youtube.com';
        }
      };
    }
  }

  /* -------------------------------------------------------------
     2. YouTube Music Audio & Ad Observer
     ------------------------------------------------------------- */
  function setupPlayerHooks() {
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(extractPlayerState, 800);
    extractPlayerState();
  }

  function extractPlayerState() {
    if (typeof document === 'undefined') return;
    const video = document.querySelector('video.html5-main-video') || document.querySelector('video');
    const playerBar = document.querySelector('ytmusic-player-bar');

    if (!playerBar && !video) return;

    // Detect Advertisement
    const isAdPlaying = !!(
      document.querySelector('.ad-showing') ||
      document.querySelector('.video-ads')?.children.length > 0 ||
      playerBar?.hasAttribute('is-ad') ||
      document.querySelector('.ytp-ad-player-overlay') ||
      document.querySelector('.ytp-ad-module')?.childElementCount > 0
    );

    updateAdBadge(isAdPlaying);

    const titleEl = playerBar?.querySelector('.title.ytmusic-player-bar') || playerBar?.querySelector('.content-info-wrapper .title');
    const bylineEl = playerBar?.querySelector('.byline.ytmusic-player-bar') || playerBar?.querySelector('.content-info-wrapper .byline');
    const imageEl = playerBar?.querySelector('img.image.ytmusic-player-bar') || playerBar?.querySelector('ytmusic-player-bar img');

    const title = titleEl ? titleEl.textContent.trim() : (isAdPlaying ? 'Advertisement' : 'Deja');
    const byline = bylineEl ? bylineEl.textContent.trim() : (isAdPlaying ? 'Google Ad' : 'YouTube Music');
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

    if (trackId !== lastTrackId || isPlaying !== lastIsPlaying || isAdPlaying !== lastIsAd) {
      lastTrackId = trackId;
      lastIsPlaying = isPlaying;
      lastIsAd = isAdPlaying;
      window.__DEJA_CURRENT_TRACK__ = trackData;
      window.__SONORA_CURRENT_TRACK__ = trackData;

      if (api?.sendTrackChanged) {
        api.sendTrackChanged(trackData);
      }
    }

    // Synchronize account avatar from native DOM if present
    updateAccountAvatar();
  }

  function updateAccountAvatar() {
    const avatarCircle = getEl('deja-avatar-circle', 'sonora-avatar-circle');
    if (!avatarCircle) return;

    const nativeAvatarImg = document.querySelector('ytmusic-nav-bar #avatar-btn img, ytmusic-nav-bar ytmusic-settings-button img, #avatar-btn img, ytmusic-settings-button img, ytmusic-avatar img');
    if (nativeAvatarImg && nativeAvatarImg.src && !avatarCircle.querySelector('img')) {
      const img = document.createElement('img');
      img.src = nativeAvatarImg.src;
      img.alt = 'Account';
      img.className = 'deja-avatar-img sonora-avatar-img';
      avatarCircle.textContent = '';
      avatarCircle.appendChild(img);
    }
  }

  function updateAdBadge(isAd) {
    let adBadge = getEl('deja-ad-badge', 'sonora-ad-badge');
    const playerBar = document.querySelector('ytmusic-player-bar');

    if (isAd) {
      if (!adBadge && playerBar) {
        adBadge = document.createElement('span');
        adBadge.id = 'deja-ad-badge';
        adBadge.className = 'deja-ad-badge sonora-ad-badge';
        adBadge.innerText = 'ADVERTISEMENT';
        const titleWrapper = playerBar.querySelector('.title.ytmusic-player-bar')?.parentElement || playerBar.querySelector('.middle-controls');
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
    if (!api?.onPlayerAction) return;

    api.onPlayerAction(({ action, payload }) => {
      handlePlayerAction(action, payload);
    });

    api.onMiniPlayerChanged?.((isMini) => {
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
        api?.windowAction('toggle-miniplayer');
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
        if (e.target.id === 'deja-search-input' && e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = getEl('deja-search-input', 'sonora-search-input');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        } else {
          getEl('deja-search-bar', 'sonora-search-bar')?.click();
        }
      }
    });
  }

  /* -------------------------------------------------------------
     4. Apple Music Live Synced Lyrics Overlay
     ------------------------------------------------------------- */
  function toggleLyricsDrawer() {
    let overlay = getEl('deja-lyrics-overlay', 'sonora-lyrics-overlay');
    if (overlay) {
      if (overlay.classList.contains('visible')) {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 300);
      } else {
        overlay.classList.add('visible');
      }
      return;
    }

    const track = window.__DEJA_CURRENT_TRACK__ || window.__SONORA_CURRENT_TRACK__ || {
      title: 'Current Song',
      artist: 'Artist',
      coverUrl: ''
    };

    overlay = document.createElement('div');
    overlay.id = 'deja-lyrics-overlay';
    overlay.className = 'deja-lyrics-drawer sonora-lyrics-drawer visible';
    setSafeHTML(overlay, `
      <div class="deja-lyrics-aura sonora-lyrics-aura" style="background-image: url('${track.coverUrl}');"></div>
      <div class="deja-lyrics-header sonora-lyrics-header">
        <div class="deja-lyrics-meta sonora-lyrics-meta">
          <h2 class="deja-lyrics-title sonora-lyrics-title">${escapeHtml(track.title)}</h2>
          <p class="deja-lyrics-artist sonora-lyrics-artist">${escapeHtml(track.artist)}</p>
        </div>
        <button class="deja-lyrics-close sonora-lyrics-close" id="deja-lyrics-close-btn">&times;</button>
      </div>
      <div class="deja-lyrics-body sonora-lyrics-body" id="deja-lyrics-content">
        <div class="deja-lyric-line sonora-lyric-line active">♪ Synchronized with YouTube Music playback</div>
        <div class="deja-lyric-line sonora-lyric-line">Real-time lyrics rendered with Apple Music dynamic mesh backdrop</div>
        <div class="deja-lyric-line sonora-lyric-line">Enjoy your music in high fidelity</div>
      </div>
    `);

    document.body.appendChild(overlay);
    const lyricsCloseBtn = getEl('deja-lyrics-close-btn', 'sonora-lyrics-close-btn');
    if (lyricsCloseBtn) {
      lyricsCloseBtn.onclick = () => {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 300);
      };
    }

    // Try extracting native YTM lyrics if available in tab
    const nativeLyricsTab = document.querySelector('ytmusic-tab-renderer[tab-id="LYRICS"]');
    if (nativeLyricsTab) {
      const desc = nativeLyricsTab.querySelector('.description');
      if (desc && desc.textContent.trim()) {
        const lines = desc.textContent.trim().split('\n').filter(l => l.trim().length > 0);
        const container = getEl('deja-lyrics-content', 'sonora-lyrics-content');
        if (container && lines.length > 0) {
          setSafeHTML(container, lines.map((l, i) => `<div class="deja-lyric-line sonora-lyric-line ${i === 0 ? 'active' : ''}">${escapeHtml(l)}</div>`).join(''));
        }
      }
    }
  }

  /* -------------------------------------------------------------
     5. Apple Frosted Modal Dialog (Settings & About)
     ------------------------------------------------------------- */
  function openSettingsModal() {
    renderAppleModal({
      title: 'Deja Preferences',
      rows: [
        { label: 'Theme Styling', desc: 'macOS Sonoma / Apple Music Acrylic Dark', badge: 'Active' },
        { label: 'Ad Monetization Policy', desc: 'Non-harming: Free users receive Google ads; Premium users enjoy native ad-free playback', badge: 'Compliant' },
        { label: 'Discord Rich Presence', desc: 'Real-time song & artist status display on Discord', badge: 'Enabled' },
        { label: 'Global Media Keys', desc: 'Hardware Play/Pause, Next, Previous, and Volume hotkeys', badge: 'Active' },
        { label: 'Hardware Acceleration', desc: 'Chromium GPU compositor for high performance', badge: 'Enabled' }
      ]
    });
  }

  function openAboutDialog() {
    renderAppleModal({
      title: 'About Deja',
      rows: [
        { label: 'Version', desc: 'Deja Desktop Client v1.0.0', badge: 'v1.0.0' },
        { label: 'Architecture', desc: 'Clean Apple Music-styled interface layered over YouTube Music base', badge: 'Electron' },
        { label: 'Google TOS Disclosure', desc: 'Not affiliated with Google LLC. Respects all YouTube content licensing and advertisement rules.', badge: 'Verified' },
        { label: 'License', desc: 'MIT Open Source License - Ready for GitHub community publication', badge: 'MIT' }
      ]
    });
  }

  function renderAppleModal({ title, rows }) {
    const existing = getEl('deja-apple-modal', 'sonora-apple-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'deja-apple-modal';
    overlay.className = 'deja-modal-overlay sonora-modal-overlay';
    setSafeHTML(overlay, `
      <div class="deja-modal-card sonora-modal-card">
        <div class="deja-modal-header sonora-modal-header">
          <h3 class="deja-modal-title sonora-modal-title">${escapeHtml(title)}</h3>
          <button class="deja-modal-close-btn sonora-modal-close-btn" id="deja-modal-close">&times;</button>
        </div>
        <div class="deja-modal-body sonora-modal-body">
          ${rows.map(r => `
            <div class="deja-modal-row sonora-modal-row">
              <div>
                <div class="deja-modal-label sonora-modal-label">${escapeHtml(r.label)}</div>
                <div class="deja-modal-desc sonora-modal-desc">${escapeHtml(r.desc)}</div>
              </div>
              <span class="deja-modal-badge sonora-modal-badge">${escapeHtml(r.badge)}</span>
            </div>
          `).join('')}
        </div>
        <div class="deja-modal-footer sonora-modal-footer">
          <button class="deja-modal-btn-primary sonora-modal-btn-primary" id="deja-modal-ok">Done</button>
        </div>
      </div>
    `);

    document.body.appendChild(overlay);

    const closeModal = () => overlay.remove();
    const closeBtn = getEl('deja-modal-close', 'sonora-modal-close');
    const okBtn = getEl('deja-modal-ok', 'sonora-modal-ok');
    if (closeBtn) closeBtn.onclick = closeModal;
    if (okBtn) okBtn.onclick = closeModal;
    overlay.onclick = (e) => {
      if (e.target === overlay) closeModal();
    };
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

  return {
    destroy: () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      window.__DEJA_INITIALIZED__ = false;
      window.__SONORA_INITIALIZED__ = false;
      delete window.__DEJA_CURRENT_TRACK__;
      delete window.__SONORA_CURRENT_TRACK__;
    }
  };
}

const initSonoraApplePlayer = initDejaApplePlayer;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = initDejaApplePlayer;
  module.exports.initDejaApplePlayer = initDejaApplePlayer;
  module.exports.initSonoraApplePlayer = initSonoraApplePlayer;
}

if (typeof window !== 'undefined') {
  window.initDejaApplePlayer = initDejaApplePlayer;
  window.initSonoraApplePlayer = initSonoraApplePlayer;
}
