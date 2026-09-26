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
      this.style = {};
      this.children = [];
      this.parentElement = null;
      this.textContent = '';
      this.attributes = {};
      this.onclick = null;
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
      if (sel === '.title.ytmusic-player-bar' || sel === '.content-info-wrapper .title') {
        return this._find(el => el.className && el.className.includes('title'));
      }
      if (sel === '.byline.ytmusic-player-bar' || sel === '.content-info-wrapper .byline') {
        return this._find(el => el.className && el.className.includes('byline'));
      }
      if (sel === 'img.image.ytmusic-player-bar' || sel === 'ytmusic-player-bar img') {
        return this._find(el => el.tagName === 'IMG');
      }
      return null;
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
        toggle: (cls) => {
          if (this.className.includes(cls)) this.className = this.className.replace(cls, '').trim();
          else this.className += ` ${cls}`;
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
    addEventListener: (event, cb) => {
      listeners[event] = listeners[event] || [];
      listeners[event].push(cb);
    }
  };

  const windowMock = {
    document: documentMock,
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
  const titleEl = new MockElement('SPAN', '', 'title ytmusic-player-bar');
  titleEl.textContent = 'Blinding Lights';
  const bylineEl = new MockElement('SPAN', '', 'byline ytmusic-player-bar');
  bylineEl.textContent = 'The Weeknd • After Hours';
  mockPlayerBar.appendChild(titleEl);
  mockPlayerBar.appendChild(bylineEl);
  elements['mock-player-bar'] = mockPlayerBar;

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
