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

  // 2. Verify preview.html BitChord UI Components
  const htmlPath = path.join(__dirname, '../src/renderer/preview.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  assert.ok(html.includes('id="app-ambient-backdrop"'), 'Must include global dynamic ambient backdrop');
  assert.ok(html.includes('id="deja-titlebar"'), 'Must include macOS frosted window titlebar');
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

  // 3. Verify preview.css Styling
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

  // 4. Verify preview.js Logic
  const jsPath = path.join(__dirname, '../src/renderer/preview.js');
  const js = fs.readFileSync(jsPath, 'utf8');

  assert.ok(js.includes('CATALOGUE_TRACKS'), 'preview.js must define track catalogue');
  assert.ok(js.includes('createCoverArt'), 'preview.js must generate vibrant SVG cover art');
  assert.ok(js.includes('renderListenNowView'), 'preview.js must implement Listen Now view');
  assert.ok(js.includes('renderBrowseView'), 'preview.js must implement Browse view');
  assert.ok(js.includes('renderRadioView'), 'preview.js must implement Radio view');
  assert.ok(js.includes('renderSongsTableView'), 'preview.js must implement Songs table view');
  assert.ok(js.includes('renderArtistsView'), 'preview.js must implement Artists view');
  assert.ok(js.includes('renderAlbumsView'), 'preview.js must implement Albums view');
  assert.ok(js.includes('renderPlaylistsGridView'), 'preview.js must implement Playlists grid view');
  assert.ok(js.includes('renderSearchResultsView'), 'preview.js must implement Search view');
  assert.ok(js.includes('ensureAudioGraph'), 'preview.js must implement Web Audio graph');
  assert.ok(js.includes('EQ_PRESETS'), 'preview.js must define EQ presets');
  assert.ok(js.includes('applyEqPreset'), 'preview.js must apply EQ presets in real-time');
  assert.ok(js.includes('startPreviewSleepTimer'), 'preview.js must support sleep timer countdown');
  assert.ok(js.includes('applyDynamicMeshAura'), 'preview.js must dynamically extract and inject mesh aura');

  console.log('✓ Native BitChord & Apple Client Architecture tests passed successfully.');
}

module.exports = runBitChordArchitectureTests;

if (require.main === module) {
  runBitChordArchitectureTests();
}
