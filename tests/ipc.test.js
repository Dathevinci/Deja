const assert = require('assert');
const fs = require('fs');
const path = require('path');

function runIpcTests() {
  console.log('--- Testing IPC & Player Action Protocols ---');

  const shortcutsPath = path.join(__dirname, '../src/main/shortcuts.js');
  const shortcutsCode = fs.readFileSync(shortcutsPath, 'utf8');

  // Verify Media Keys
  assert.ok(shortcutsCode.includes('MediaPlayPause'), 'Must register MediaPlayPause');
  assert.ok(shortcutsCode.includes('MediaNextTrack'), 'Must register MediaNextTrack');
  assert.ok(shortcutsCode.includes('MediaPreviousTrack'), 'Must register MediaPreviousTrack');
  assert.ok(shortcutsCode.includes('toggleMiniPlayer'), 'Must register mini player shortcut');
  assert.ok(shortcutsCode.includes('toggleLyrics'), 'Must register lyrics shortcut');

  // Verify Tray implementation
  const trayPath = path.join(__dirname, '../src/main/tray.js');
  const trayCode = fs.readFileSync(trayPath, 'utf8');
  assert.ok(trayCode.includes('updateTrack'), 'Tray must support track updates');
  assert.ok(trayCode.includes('updateMenu'), 'Tray must update context menu dynamically');

  // Verify Preload API Bridge
  const preloadPath = path.join(__dirname, '../src/preload/preload.js');
  const preloadCode = fs.readFileSync(preloadPath, 'utf8');
  assert.ok(preloadCode.includes("exposeInMainWorld('dejaAPI'"), 'Preload must expose dejaAPI in main world');
  assert.ok(preloadCode.includes('window.dejaAPI'), 'Preload must set window.dejaAPI');
  assert.ok(preloadCode.includes("exposeInMainWorld('sonoraAPI'"), 'Preload must retain backwards-compatible sonoraAPI');

  console.log('✓ IPC & Player Action Protocol tests passed successfully.');
}

module.exports = runIpcTests;

if (require.main === module) {
  runIpcTests();
}
