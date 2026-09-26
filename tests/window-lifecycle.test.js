const assert = require('assert');
const fs = require('fs');
const path = require('path');

function runWindowLifecycleTests() {
  console.log('--- Testing Window Lifecycle, Single-Instance & Force-Show Logic ---');

  const mainPath = path.join(__dirname, '../src/main/main.js');
  const mainCode = fs.readFileSync(mainPath, 'utf8');

  // 1. Single-instance lock
  assert.ok(mainCode.includes('app.requestSingleInstanceLock()'), 'Must call app.requestSingleInstanceLock()');
  assert.ok(mainCode.includes('app.on(\'second-instance\''), 'Must register second-instance handler');
  assert.ok(mainCode.includes('mainWindow.restore()'), 'Second-instance must restore minimized window');
  assert.ok(mainCode.includes('mainWindow.show()'), 'Second-instance must show hidden window');
  assert.ok(mainCode.includes('mainWindow.focus()'), 'Second-instance must focus window');
  assert.ok(mainCode.includes('setAlwaysOnTop'), 'Second-instance must bring window to front');

  // 2. Force-show fallback
  assert.ok(mainCode.includes('3000'), 'Must include 3000ms fallback timeout for force-showing window');
  assert.ok(mainCode.includes('forceShowTimeout = setTimeout'), 'Must set fallback timer for ready-to-show');
  assert.ok(mainCode.includes('ready-to-show'), 'Must handle ready-to-show event');
  assert.ok(mainCode.includes('did-finish-load'), 'Must handle did-finish-load event');
  assert.ok(mainCode.includes('clearTimeout(forceShowTimeout)'), 'Must clear fallback timer when window is displayed/closed');

  // 3. Fallback error handling
  assert.ok(mainCode.includes('offline-fallback.html'), 'Must route network failures to offline-fallback.html');
  assert.ok(mainCode.includes('did-fail-load'), 'Must handle did-fail-load event');

  // 4. Display bounds validation & safety
  assert.ok(mainCode.includes('getAllDisplays'), 'Must validate saved window coordinates against displays');
  assert.ok(mainCode.includes('setAppUserModelId'), 'Must set AppUserModelId on Windows');
  assert.ok(mainCode.includes('dom-ready'), 'Must handle early dom-ready for rapid window display');
  assert.ok(mainCode.includes('uncaughtException'), 'Must register uncaughtException handler to prevent silent crash');

  // 5. Config startMinimized autostart protection
  const configPath = path.join(__dirname, '../src/main/config.js');
  const configCode = fs.readFileSync(configPath, 'utf8');
  assert.ok(configCode.includes('startMinimized'), 'Config must manage startMinimized');
  assert.ok(configCode.includes('--autostart') || configCode.includes('--hidden'), 'startMinimized must require explicit autostart flag');

  // 6. Preload Trusted Types compatibility
  const playerPath = path.join(__dirname, '../src/preload/apple-player.js');
  const playerCode = fs.readFileSync(playerPath, 'utf8');
  assert.ok(playerCode.includes('setSafeHTML'), 'Apple player must include safe HTML injection for Trusted Types');
  assert.ok(playerCode.includes('trustedTypes'), 'Apple player must support window.trustedTypes');

  console.log('✓ Window Lifecycle, Single-Instance & Force-Show tests passed successfully.');
}

module.exports = runWindowLifecycleTests;

if (require.main === module) {
  runWindowLifecycleTests();
}
