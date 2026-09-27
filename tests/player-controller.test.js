const assert = require('assert');
const playerModule = require('../src/preload/apple-player');
const initDejaApplePlayer = playerModule.initDejaApplePlayer || playerModule;
const initSonoraApplePlayer = playerModule.initSonoraApplePlayer || playerModule;

function runPlayerControllerTests() {
  console.log('--- Testing Apple Player Controller Functional Logic ---');

  assert.strictEqual(typeof initDejaApplePlayer, 'function', 'initDejaApplePlayer must be a function');
  assert.strictEqual(typeof initSonoraApplePlayer, 'function', 'initSonoraApplePlayer must be a function');

  // Set up mock DOM environment
  const listeners = {};
  const elements = {};

  class MockElement {
    constructor(tagName, id = '', className = '') {
      this.tagName = tagName.toUpperCase();
      this.id = id;
      this.className = className;
      this.style = {
        setProperty: (k, v) => { this.style[k] = v; }
      };
      this.children = [];
      this.parentElement = null;
      this.shadowRoot = null;
      this.textContent = '';
      this.attributes = {};
      this.onclick = null;
    }

    attachShadow(opts = {}) {
      this.shadowRoot = new MockElement('SHADOW-ROOT');
      this.shadowRoot.host = this;
      return this.shadowRoot;
    }

    setAttribute(name, val) { this.attributes[name] = val; }
    getAttribute(name) { return this.attributes[name]; }
    hasAttribute(name) { return name in this.attributes; }
    removeAttribute(name) { delete this.attributes[name]; }

    appendChild(child) {
      child.parentElement = this;
      this.children.push(child);
      if (child.id) elements[child.id] = child;
      return child;
    }

    prepend(child) {
      child.parentElement = this;
      this.children.unshift(child);
      if (child.id) elements[child.id] = child;
      return child;
    }

    remove() {
      if (this.parentElement) {
        const idx = this.parentElement.children.indexOf(this);
        if (idx !== -1) this.parentElement.children.splice(idx, 1);
        this.parentElement = null;
      }
      if (this.id) delete elements[this.id];
    }

    click() {
      if (typeof this.onclick === 'function') {
        this.onclick({ target: this, preventDefault: () => {} });
      }
    }

    querySelector(sel) {
      if (sel === 'a') {
        return this._find(el => el.tagName === 'A');
      }
      if (sel.includes('.title')) {
        return this._find(el => el.className && el.className.includes('title'));
      }
      if (sel.includes('.byline')) {
        return this._find(el => el.className && el.className.includes('byline'));
      }
      if (sel.includes('img') || sel.includes('IMG')) {
        return this._find(el => el.tagName === 'IMG');
      }
      if (sel.startsWith('.')) {
        const classes = sel.split('.').filter(Boolean);
        return this._find(el => classes.every(c => el.className && el.className.split(/\s+/).includes(c)));
      }
      if (sel.startsWith('#')) {
        const id = sel.slice(1);
        return this._find(el => el.id === id);
      }
      return this._find(el => el.tagName === sel.toUpperCase());
    }

    querySelectorAll(sel) {
      const res = [];
      const match = (el) => {
        if (sel.startsWith('.')) {
          const classes = sel.split('.').filter(Boolean);
          return classes.every(c => el.className && el.className.split(/\s+/).includes(c));
        }
        if (sel.startsWith('#')) {
          const id = sel.slice(1);
          return el.id === id;
        }
        return el.tagName === sel.toUpperCase();
      };
      const collect = (node) => {
        for (const child of node.children) {
          if (match(child)) res.push(child);
          collect(child);
        }
      };
      collect(this);
      return res;
    }

    _find(predicate) {
      for (const child of this.children) {
        if (predicate(child)) return child;
        const res = child._find ? child._find(predicate) : null;
        if (res) return res;
      }
      return null;
    }

    set innerHTML(html) {
      this._innerHTML = html;
      // Extract IDs from html to mock querySelector/getElementById
      const idMatches = html.matchAll(/id=["']([^"']+)["']/g);
      for (const match of idMatches) {
        const id = match[1];
        const el = new MockElement('DIV', id);
        el.parentElement = this;
        this.children.push(el);
        elements[id] = el;
      }
    }

    get innerHTML() {
      return this._innerHTML || '';
    }

    get classList() {
      return {
        add: (cls) => { if (!this.className.includes(cls)) this.className += ` ${cls}`; },
        remove: (cls) => { this.className = this.className.replace(cls, '').trim(); },
        contains: (cls) => this.className.includes(cls),
        toggle: (cls, force) => {
          const shouldAdd = typeof force === 'boolean' ? force : !this.className.includes(cls);
          if (shouldAdd) {
            if (!this.className.includes(cls)) this.className = (this.className + ` ${cls}`).trim();
          } else {
            this.className = this.className.replace(new RegExp(`(^|\\s)${cls}(\\s|$)`, 'g'), ' ').trim();
          }
        }
      };
    }
  }

  const documentMock = {
    readyState: 'complete',
    body: new MockElement('BODY', 'mock-body'),
    createElement: (tag) => new MockElement(tag),
    getElementById: (id) => elements[id] || null,
    querySelector: (sel) => {
      if (sel === 'video.html5-main-video' || sel === 'video') return elements['mock-video'] || null;
      if (sel === 'ytmusic-player-bar') return elements['mock-player-bar'] || null;
      if (sel === '.ad-showing') return elements['mock-ad'] || null;
      return null;
    },
    querySelectorAll: (sel) => {
      if (sel.includes('ytmusic-guide-entry-renderer') || sel.includes('ytmusic-mini-guide-entry-renderer')) {
        return elements.guideEntries || [];
      }
      return [];
    },
    addEventListener: (event, cb) => {
      listeners[event] = listeners[event] || [];
      listeners[event].push(cb);
    }
  };

  const windowMock = {
    document: documentMock,
    location: {
      pathname: '/browse/FEmusic_explore'
    },
    history: {
      back: () => { windowMock.historyBackCalled = true; },
      forward: () => { windowMock.historyForwardCalled = true; }
    },
    addEventListener: (event, cb) => {
      listeners[event] = listeners[event] || [];
      listeners[event].push(cb);
    }
  };

  // Mock Sonora API
  const apiCalls = [];
  const actionListeners = [];
  const mockApi = {
    windowAction: (act) => { apiCalls.push({ type: 'windowAction', act }); },
    sendTrackChanged: (track) => { apiCalls.push({ type: 'sendTrackChanged', track }); },
    onPlayerAction: (cb) => { actionListeners.push(cb); },
    onMiniPlayerChanged: () => {}
  };

  // Setup DOM elements
  const mockVideo = new MockElement('VIDEO', 'mock-video');
  mockVideo.paused = false;
  mockVideo.currentTime = 45;
  mockVideo.duration = 200;
  mockVideo.volume = 0.5;
  mockVideo.play = () => { mockVideo.paused = false; };
  mockVideo.pause = () => { mockVideo.paused = true; };
  elements['mock-video'] = mockVideo;

  const mockPlayerBar = new MockElement('YTMUSIC-PLAYER-BAR', 'mock-player-bar');
  const middleControls = new MockElement('DIV', '', 'middle-controls');
  const titleEl = new MockElement('SPAN', '', 'title ytmusic-player-bar');
  titleEl.textContent = 'Blinding Lights';
  const bylineEl = new MockElement('SPAN', '', 'byline ytmusic-player-bar');
  bylineEl.textContent = 'The Weeknd • After Hours';
  middleControls.appendChild(titleEl);
  middleControls.appendChild(bylineEl);
  const leftControls = new MockElement('DIV', '', 'left-controls');
  const rightControls = new MockElement('DIV', '', 'right-controls');
  mockPlayerBar.appendChild(middleControls);
  mockPlayerBar.appendChild(leftControls);
  mockPlayerBar.appendChild(rightControls);
  elements['mock-player-bar'] = mockPlayerBar;

  const entryHome = new MockElement('YTMUSIC-GUIDE-ENTRY-RENDERER', 'entry-home');
  entryHome.textContent = 'Home';
  const homeLink = new MockElement('A');
  homeLink.setAttribute('href', '/');
  entryHome.appendChild(homeLink);

  const entryExplore = new MockElement('YTMUSIC-GUIDE-ENTRY-RENDERER', 'entry-explore');
  entryExplore.textContent = 'Explore';
  const exploreLink = new MockElement('A');
  exploreLink.setAttribute('href', 'browse/FEmusic_explore');
  entryExplore.appendChild(exploreLink);

  const entryLibrary = new MockElement('YTMUSIC-GUIDE-ENTRY-RENDERER', 'entry-library');
  entryLibrary.textContent = 'Library';
  const libraryLink = new MockElement('A');
  libraryLink.setAttribute('href', '/library');
  entryLibrary.appendChild(libraryLink);

  elements.guideEntries = [entryHome, entryExplore, entryLibrary];

  // Run controller in mock environment
  global.window = windowMock;
  global.document = documentMock;

  const controller = initDejaApplePlayer(mockApi);

  // 1. Verify Titlebar injection
  const titlebar = elements['deja-titlebar'] || elements['sonora-titlebar'];
  assert.ok(titlebar, 'Deja Apple Titlebar must be injected into DOM');
  const closeBtn = elements['deja-close-btn'] || elements['sonora-close-btn'];
  assert.ok(closeBtn, 'Close button must be present in Titlebar');
  const minBtn = elements['deja-min-btn'] || elements['sonora-min-btn'];
  assert.ok(minBtn, 'Minimize button must be present in Titlebar');
  const maxBtn = elements['deja-max-btn'] || elements['sonora-max-btn'];
  assert.ok(maxBtn, 'Maximize button must be present in Titlebar');
  const searchBar = elements['deja-search-bar'] || elements['sonora-search-bar'];
  assert.ok(searchBar, 'Search pill must be present in Titlebar');
  const searchInput = elements['deja-search-input'] || elements['sonora-search-input'];
  assert.ok(searchInput, 'Search input field must be present in Titlebar search pill');
  const accountBtn = elements['deja-account-btn'] || elements['sonora-account-btn'];
  assert.ok(accountBtn, 'Account avatar button must be present in Titlebar');

  // 2. Verify traffic light click actions
  closeBtn.click();
  assert.strictEqual(apiCalls.some(c => c.type === 'windowAction' && c.act === 'close'), true, 'Close button must invoke windowAction close');

  minBtn.click();
  assert.strictEqual(apiCalls.some(c => c.type === 'windowAction' && c.act === 'minimize'), true, 'Min button must invoke windowAction minimize');

  maxBtn.click();
  assert.strictEqual(apiCalls.some(c => c.type === 'windowAction' && c.act === 'maximize'), true, 'Max button must invoke windowAction maximize');

  // 3. Verify track state extraction & synchronization
  const trackUpdate = apiCalls.find(c => c.type === 'sendTrackChanged');
  assert.ok(trackUpdate, 'Track state must be dispatched to API');
  assert.strictEqual(trackUpdate.track.title, 'Blinding Lights');
  assert.strictEqual(trackUpdate.track.artist, 'The Weeknd');
  assert.strictEqual(trackUpdate.track.album, 'After Hours');
  assert.strictEqual(trackUpdate.track.isPlaying, true);
  assert.strictEqual(trackUpdate.track.isAd, false);
  assert.ok(windowMock.__DEJA_CURRENT_TRACK__, 'window.__DEJA_CURRENT_TRACK__ must be set');
  assert.ok(windowMock.__SONORA_CURRENT_TRACK__, 'window.__SONORA_CURRENT_TRACK__ must be set for backwards compatibility');

  // 4. Verify player action handling via IPC
  assert.strictEqual(actionListeners.length > 0, true, 'Player action listener must be registered');
  const dispatchAction = actionListeners[0];

  // Pause
  dispatchAction({ action: 'togglePlay' });
  assert.strictEqual(mockVideo.paused, true, 'togglePlay action must pause video');

  // Volume up
  dispatchAction({ action: 'volumeUp' });
  assert.strictEqual(mockVideo.volume > 0.5, true, 'volumeUp action must increase volume');

  // Volume down
  dispatchAction({ action: 'volumeDown' });
  assert.strictEqual(mockVideo.volume <= 0.55, true, 'volumeDown action must decrease volume');

  // 5. Verify Settings modal renders Apple Card (replacing blocking alert)
  const settingsBtn = elements['deja-settings-btn'] || elements['sonora-settings-btn'];
  assert.ok(settingsBtn, 'Settings button must be present');
  settingsBtn.click();
  const modal = elements['deja-apple-modal'] || elements['sonora-apple-modal'];
  assert.ok(modal, 'Apple modal overlay must be rendered on settings click');
  const modalClose = elements['deja-modal-close'] || elements['sonora-modal-close'];
  assert.ok(modalClose, 'Modal close button must exist');
  modalClose.click();
  assert.strictEqual(elements['deja-apple-modal'] || elements['sonora-apple-modal'], undefined, 'Modal must close on button click');

  // 6. Verify Ad Badge detection
  const adElement = new MockElement('DIV', 'mock-ad', 'ad-showing');
  elements['mock-ad'] = adElement;
  mockPlayerBar.setAttribute('is-ad', 'true');
  // Trigger poll
  mockVideo.currentTime = 50;

  // 7. Verify Sidebar Active Navigation State Logic
  assert.strictEqual(entryExplore.className.includes('deja-active'), true, 'Explore entry must receive deja-active for /browse/FEmusic_explore');
  assert.strictEqual(entryHome.className.includes('deja-active'), false, 'Home entry must not have deja-active');
  assert.strictEqual(entryLibrary.className.includes('deja-active'), false, 'Library entry must not have deja-active');

  // 8. Verify Artwork Palette Extraction Function
  const extractArtworkPalette = playerModule.extractArtworkPalette;
  assert.strictEqual(typeof extractArtworkPalette, 'function', 'extractArtworkPalette must be exported');
  let nullPaletteResult = 'initial';
  extractArtworkPalette(null, (pal) => { nullPaletteResult = pal; });
  assert.strictEqual(nullPaletteResult, null, 'extractArtworkPalette should return null for empty/null coverUrl');

  // 9. Verify BitChord Audio Pipeline Engine (NerdStats.kt)
  const AudioPipeline = playerModule.AudioPipeline;
  assert.ok(AudioPipeline, 'AudioPipeline must be exported');
  const snap = AudioPipeline.getSnapshot();
  assert.strictEqual(snap.codec, 'Opus (audio/webm)');
  assert.strictEqual(snap.bitrate, '160 kbps');
  assert.strictEqual(snap.sampleRate, '48.0 kHz');
  assert.strictEqual(snap.channels, '2.0 Stereo');
  assert.ok(snap.buffer.includes('forward buffer'));

  // 10. Verify BitChord Sleep Timer Engine (SleepTimer.kt)
  const SleepTimer = playerModule.SleepTimer;
  assert.ok(SleepTimer, 'SleepTimer must be exported');
  SleepTimer.start(15);
  assert.strictEqual(SleepTimer.isRunning(), true, 'SleepTimer must be active after start');
  assert.strictEqual(SleepTimer.remainingMs() > 0, true, 'Remaining ms must be > 0');
  SleepTimer.cancel();
  assert.strictEqual(SleepTimer.isRunning(), false, 'SleepTimer must be inactive after cancel');

  // 11. Verify BitChord Audio Equalizer Engine (GraphicEq)
  const AudioEqualizer = playerModule.AudioEqualizer;
  assert.ok(AudioEqualizer, 'AudioEqualizer must be exported');
  const eqPresets = AudioEqualizer.presets;
  assert.ok(eqPresets['Flat'], 'Flat preset must exist');
  assert.ok(eqPresets['Bass Boost'], 'Bass Boost preset must exist');
  assert.ok(eqPresets['Acoustic'], 'Acoustic preset must exist');
  assert.ok(eqPresets['Vocal Booster'], 'Vocal Booster preset must exist');
  assert.ok(eqPresets['Treble Booster'], 'Treble Booster preset must exist');
  AudioEqualizer.applyPreset('Bass Boost');
  assert.strictEqual(AudioEqualizer.currentPreset, 'Bass Boost');

  // 12. Verify BitChord Shadow CSS Exports for Polymer Components
  assert.ok(playerModule.SHADOW_PLAYER_BAR_CSS.includes('.left-controls'), 'SHADOW_PLAYER_BAR_CSS must style .left-controls');
  assert.ok(playerModule.SHADOW_PLAYER_BAR_CSS.includes('.deja-player-lyrics-btn'), 'SHADOW_PLAYER_BAR_CSS must style .deja-player-lyrics-btn');
  assert.ok(playerModule.SHADOW_PLAYER_BAR_CSS.includes('.deja-audio-pipeline-badge'), 'SHADOW_PLAYER_BAR_CSS must style .deja-audio-pipeline-badge');
  assert.ok(playerModule.SHADOW_UNIVERSAL_SCROLLBAR_CSS.includes('scrollbar-width: none'), 'SHADOW_UNIVERSAL_SCROLLBAR_CSS must eliminate scrollbars');
  assert.ok(playerModule.SHADOW_UNIVERSAL_SCROLLBAR_CSS.includes(':host::-webkit-scrollbar'), 'SHADOW_UNIVERSAL_SCROLLBAR_CSS must eliminate :host scrollbars');
  assert.ok(playerModule.SHADOW_PLAYER_PAGE_CSS.includes('.deja-player-ambient-aura'), 'SHADOW_PLAYER_PAGE_CSS must style ambient aura');
  assert.ok(playerModule.SHADOW_PLAYER_PAGE_CSS.includes('dejaMeshDrift'), 'SHADOW_PLAYER_PAGE_CSS must include dejaMeshDrift keyframes');
  assert.ok(playerModule.SHADOW_GUIDE_CSS.includes('.deja-active'), 'SHADOW_GUIDE_CSS must style .deja-active');
  assert.ok(playerModule.SHADOW_CHIP_CSS.includes('#left-arrow-button'), 'SHADOW_CHIP_CSS must hide arrow buttons');

  // 13. Verify BitChord Player Bar Injected Controls in Right Controls
  assert.ok(rightControls.querySelector('.deja-audio-pipeline-badge'), 'Audio pipeline badge must be injected into right controls');
  assert.ok(rightControls.querySelector('.deja-sleep-timer-btn'), 'Sleep timer button must be injected into right controls');
  assert.ok(rightControls.querySelector('.deja-eq-btn'), 'EQ button must be injected into right controls');
  assert.ok(rightControls.querySelector('.deja-player-lyrics-btn'), 'Lyrics button must be injected into right controls');
  assert.ok(rightControls.querySelector('.deja-queue-btn'), 'Queue button must be injected into right controls');

  // 14. Verify querySelectorAllDeep across Shadow DOM boundaries
  const querySelectorAllDeep = playerModule.querySelectorAllDeep;
  assert.strictEqual(typeof querySelectorAllDeep, 'function', 'querySelectorAllDeep must be exported');
  const testHost = new MockElement('DIV', 'test-host');
  const shadow = testHost.attachShadow();
  const shadowChild = new MockElement('SPAN', 'shadow-span', 'deep-target');
  shadow.appendChild(shadowChild);
  const deepFound = querySelectorAllDeep('.deep-target', testHost);
  assert.strictEqual(deepFound.length, 1, 'querySelectorAllDeep must penetrate shadow root');
  assert.strictEqual(deepFound[0], shadowChild, 'querySelectorAllDeep must return matching element from shadow root');

  // 15. Verify SleepTimer startAfterTrack
  SleepTimer.startAfterTrack();
  assert.strictEqual(SleepTimer.isRunning(), true, 'SleepTimer must be running with afterTrack');
  assert.strictEqual(SleepTimer.afterTrack, true, 'SleepTimer.afterTrack must be true');
  SleepTimer.cancel();
  assert.strictEqual(SleepTimer.isRunning(), false, 'SleepTimer must be inactive after cancel');

  // 16. Verify Preload Lyrics Synchronization Engine
  assert.strictEqual(typeof controller.toggleLyricsDrawer, 'function', 'controller must export toggleLyricsDrawer');
  assert.strictEqual(typeof controller.updatePreloadLiveLyrics, 'function', 'controller must export updatePreloadLiveLyrics');
  assert.strictEqual(typeof controller.resolvePreloadLyrics, 'function', 'controller must export resolvePreloadLyrics');
  assert.strictEqual(typeof controller.renderPreloadLyrics, 'function', 'controller must export renderPreloadLyrics');

  // Cleanup controller timers
  controller?.destroy?.();

  // Cleanup globals
  delete global.window;
  delete global.document;

  console.log('✓ Apple Player Controller functional tests passed successfully.');
}

module.exports = runPlayerControllerTests;

if (require.main === module) {
  runPlayerControllerTests();
}
