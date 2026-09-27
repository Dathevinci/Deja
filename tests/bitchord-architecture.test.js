const assert = require('assert');
const fs = require('fs');
const path = require('path');

function runBitChordArchitectureTests() {
  console.log('--- Testing Native BitChord & Apple Client Architecture ---');

  // 1. Verify main.js launches the native BitChord client UI by default
  const mainPath = path.join(__dirname, '../src/main/main.js');
  const mainCode = fs.readFileSync(mainPath, 'utf8');

  assert.ok(mainCode.includes("const isWebMode = process.argv.includes('--web');"), 'main.js must define isWebMode flag');
  assert.ok(mainCode.includes('const isPreview = !isWebMode;'), 'main.js must default isPreview to true (!isWebMode)');
  assert.ok(mainCode.includes("mainWindow.loadFile(path.join(__dirname, '../renderer/preview.html'))"), 'main.js must load preview.html by default');
  assert.ok(mainCode.includes("ipcMain.handle('open-google-login'"), 'main.js must provide open-google-login IPC handler');
  assert.ok(mainCode.includes("ipcMain.handle('toggle-web-mode'"), 'main.js must provide toggle-web-mode IPC handler');
  assert.ok(mainCode.includes("ipcMain.handle('yt-search'"), 'main.js must provide yt-search IPC handler');
  assert.ok(mainCode.includes("ipcMain.handle('yt-resolve-stream'"), 'main.js must provide yt-resolve-stream IPC handler');
  assert.ok(mainCode.includes("app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')"), 'main.js must set autoplay-policy command line switch before whenReady');

  // 2. Verify preload.js API bridges
  const preloadPath = path.join(__dirname, '../src/preload/preload.js');
  const preloadCode = fs.readFileSync(preloadPath, 'utf8');
  assert.ok(preloadCode.includes('searchYouTube:'), 'preload.js must expose searchYouTube in dejaAPI');
  assert.ok(preloadCode.includes('toggleWebMode:'), 'preload.js must expose toggleWebMode in dejaAPI');
  assert.ok(preloadCode.includes('openGoogleLogin:'), 'preload.js must expose openGoogleLogin in dejaAPI');
  assert.ok(preloadCode.includes('resolveAudioStream:'), 'preload.js must expose resolveAudioStream in dejaAPI');

  // 3. Verify menu.js
  const menuPath = path.join(__dirname, '../src/main/menu.js');
  const menuCode = fs.readFileSync(menuPath, 'utf8');
  assert.ok(menuCode.includes('Toggle Web / Native Client Mode'), 'menu.js must include Toggle Web / Native Client Mode');

  // 4. Verify preview.html BitChord UI Components
  const htmlPath = path.join(__dirname, '../src/renderer/preview.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  assert.ok(html.includes('id="app-ambient-backdrop"'), 'Must include global dynamic ambient backdrop');
  assert.ok(html.includes('id="deja-titlebar"'), 'Must include macOS frosted window titlebar');
  assert.ok(html.includes('id="nav-back"'), 'Must include back navigation arrow');
  assert.ok(html.includes('id="nav-forward"'), 'Must include forward navigation arrow');
  assert.ok(html.includes('id="btn-toggle-web"'), 'Must include toggle web mode button');
  assert.ok(html.includes('id="yt-player-container"'), 'Must include hidden YouTube player container');
  assert.ok(html.includes('id="deja-audio-element"'), 'Must include native HTML5 deja-audio-element audio player');
  assert.ok(html.includes('class="apple-sidebar"'), 'Must include Apple sidebar navigation');
  assert.ok(html.includes('data-page="listen-now"'), 'Sidebar must include Listen Now');
  assert.ok(html.includes('data-page="browse"'), 'Sidebar must include Browse');
  assert.ok(html.includes('data-page="radio"'), 'Sidebar must include Radio');
  assert.ok(html.includes('data-page="recently-added"'), 'Sidebar must include Recently Added');
  assert.ok(html.includes('data-page="artists"'), 'Sidebar must include Artists');
  assert.ok(html.includes('data-page="albums"'), 'Sidebar must include Albums');
  assert.ok(html.includes('data-page="songs"'), 'Sidebar must include Songs');
  assert.ok(html.includes('data-page="playlists"'), 'Sidebar must include Playlists');
  assert.ok(html.includes('id="apple-player-bar"'), 'Must include frosted glass player bar');
  assert.ok(html.includes('id="player-artwork-wrapper"'), 'Must include squircle artwork wrapper');
  assert.ok(html.includes('id="btn-audio-pipeline"'), 'Must include BitChord audio pipeline badge');
  assert.ok(html.includes('id="btn-sleep-timer"'), 'Must include BitChord sleep timer button');
  assert.ok(html.includes('id="btn-equalizer"'), 'Must include BitChord equalizer button');
  assert.ok(html.includes('id="btn-lyrics-panel"'), 'Must include player bar lyrics button');
  assert.ok(html.includes('id="btn-queue-panel"'), 'Must include player bar queue button');
  assert.ok(html.includes('id="expanded-player-view"'), 'Must include expanded Now Playing page');
  assert.ok(html.includes('id="preview-ambient-aura"'), 'Expanded view must include dynamic ambient aura');
  assert.ok(html.includes('id="preview-ambient-mesh-overlay"'), 'Expanded view must include mesh overlay');
  assert.ok(html.includes('id="exp-scrubber-track"'), 'Expanded view must include scrubber slider');
  assert.ok(html.includes('id="exp-btn-play-pause"'), 'Expanded view must include play/pause button');
  assert.ok(html.includes('id="apple-lyrics-drawer"'), 'Must include time-synced lyrics drawer');
  assert.ok(html.includes('id="apple-queue-drawer"'), 'Must include Up Next queue drawer');
  assert.ok(html.includes('id="pipeline-modal"'), 'Must include audio pipeline modal');
  assert.ok(html.includes('id="sleep-modal"'), 'Must include sleep timer modal');
  assert.ok(html.includes('id="eq-modal"'), 'Must include equalizer modal');

  // 5. Verify preview.css Styling
  const cssPath = path.join(__dirname, '../src/renderer/preview.css');
  const css = fs.readFileSync(cssPath, 'utf8');

  assert.ok(css.includes('.app-ambient-backdrop'), 'CSS must style app ambient backdrop');
  assert.ok(css.includes('.deja-audio-pipeline-badge'), 'CSS must style audio pipeline badge');
  assert.ok(css.includes('.deja-sleep-timer-btn'), 'CSS must style sleep timer button');
  assert.ok(css.includes('.deja-eq-btn'), 'CSS must style equalizer button');
  assert.ok(css.includes('.deja-queue-drawer'), 'CSS must style Up Next queue drawer');
  assert.ok(css.includes('.deja-pipeline-card'), 'CSS must style audio pipeline card');
  assert.ok(css.includes('.songs-table-container'), 'CSS must style songs table');
  assert.ok(css.includes('.artists-grid'), 'CSS must style artists grid');
  assert.ok(css.includes('.radio-grid'), 'CSS must style radio grid');
  assert.ok(css.includes('body.pure-black'), 'CSS must support body.pure-black theme selector');

  // 6. Verify preview.js Functional Unit Tests
  const previewModule = require('../src/renderer/preview.js');
  const {
    CATALOGUE_TRACKS,
    EQ_PRESETS,
    escapeHTML,
    formatTime,
    shufflePlayPlaylist
  } = previewModule;

  // 6.1 Catalogue Tracks Integrity
  assert.ok(Array.isArray(CATALOGUE_TRACKS) && CATALOGUE_TRACKS.length >= 11, 'Must have at least 11 tracks');
  CATALOGUE_TRACKS.forEach((t, i) => {
    assert.ok(t.id, `Track ${i} must have id`);
    assert.ok(t.videoId, `Track ${i} (${t.title}) must have videoId for live YouTube streaming`);
    assert.ok(t.title, `Track ${i} must have title`);
    assert.ok(t.artist, `Track ${i} must have artist`);
    assert.ok(t.duration > 0, `Track ${i} must have duration > 0`);
    assert.ok(t.palette && t.palette.c1, `Track ${i} must have dynamic mesh palette`);
  });

  // 6.2 Security: escapeHTML XSS sanitization
  assert.strictEqual(
    escapeHTML('<script>alert("xss")</script>'),
    '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    'escapeHTML must escape HTML tags and quotes'
  );
  assert.strictEqual(
    escapeHTML('Starboy & "Secrets"'),
    'Starboy &amp; &quot;Secrets&quot;',
    'escapeHTML must escape ampersands and quotes'
  );
  assert.strictEqual(escapeHTML(null), '', 'escapeHTML must handle null safely');

  // 6.3 Time formatting
  assert.strictEqual(formatTime(0), '0:00', '0s must format to 0:00');
  assert.strictEqual(formatTime(9), '0:09', '9s must format to 0:09');
  assert.strictEqual(formatTime(65), '1:05', '65s must format to 1:05');
  assert.strictEqual(formatTime(215), '3:35', '215s must format to 3:35');

  // 6.4 Equalizer Presets
  assert.ok(EQ_PRESETS['Flat'], 'EQ must define Flat');
  assert.ok(EQ_PRESETS['Bass Boost'], 'EQ must define Bass Boost');
  assert.ok(EQ_PRESETS['Acoustic'], 'EQ must define Acoustic');
  assert.ok(EQ_PRESETS['Vocal Booster'], 'EQ must define Vocal Booster');
  assert.ok(EQ_PRESETS['Treble Booster'], 'EQ must define Treble Booster');

  // 6.5 Playlist shuffle function existence
  assert.strictEqual(typeof shufflePlayPlaylist, 'function', 'shufflePlayPlaylist must be a defined function');
  assert.strictEqual(typeof previewModule.resolveAndPlayTrack, 'function', 'resolveAndPlayTrack must be a defined function');
  assert.strictEqual(typeof previewModule.fallbackToIFrame, 'function', 'fallbackToIFrame must be a defined function');

  console.log('✓ Native BitChord & Apple Client Architecture tests passed successfully.');
}

module.exports = runBitChordArchitectureTests;

if (require.main === module) {
  runBitChordArchitectureTests();
}

