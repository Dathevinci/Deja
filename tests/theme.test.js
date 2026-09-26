const assert = require('assert');
const fs = require('fs');
const path = require('path');

function runThemeTests() {
  console.log('--- Testing Apple Theme CSS & Player Injection ---');

  const cssPath = path.join(__dirname, '../src/preload/apple-theme.css');
  assert.ok(fs.existsSync(cssPath), 'apple-theme.css must exist');

  const css = fs.readFileSync(cssPath, 'utf8');

  // Verify Apple Design System Variables
  assert.ok(css.includes('--apple-accent: #FA2D48'), 'Must include signature Apple red #FA2D48');
  assert.ok(css.includes('--apple-blur:'), 'Must include Apple blur variable');
  assert.ok(css.includes('backdrop-filter'), 'Must use backdrop-filter for frosted glass UI');

  // Verify Clean Desktop Layout & Components
  assert.ok(css.includes('ytmusic-player-bar'), 'Must restyle ytmusic-player-bar');
  assert.ok(css.includes('height: 80px !important'), 'Player bar must have 80px height');
  assert.ok(css.includes('ytmusic-guide-renderer'), 'Must restyle sidebar navigation');
  assert.ok(css.includes('calc(100vh - 42px - 80px)'), 'Sidebar must cleanly offset below 42px titlebar and above 80px player bar');
  assert.ok(css.includes('display: none !important') && css.includes('ytmusic-nav-bar'), 'Must hide raw YouTube Music top nav bar');
  assert.ok(css.includes('#deja-titlebar'), 'Must define custom Apple titlebar (#deja-titlebar)');
  assert.ok(css.includes('.deja-traffic-lights'), 'Must define macOS traffic light buttons (.deja-traffic-lights)');
  assert.ok(css.includes('.deja-account-btn'), 'Must define Apple account avatar button (.deja-account-btn)');
  assert.ok(css.includes('.deja-search-input'), 'Must define Apple search input (.deja-search-input)');
  assert.ok(css.includes('.deja-ad-badge'), 'Must define Apple-styled advertisement badge (.deja-ad-badge)');
  assert.ok(css.includes('#sonora-titlebar'), 'Must retain backwards-compatible #sonora-titlebar');
  assert.ok(css.includes('.sonora-traffic-lights'), 'Must retain backwards-compatible .sonora-traffic-lights');
  assert.ok(css.includes('.sonora-ad-badge'), 'Must retain backwards-compatible .sonora-ad-badge');

  console.log('✓ Apple Theme CSS tests passed successfully.');
}

module.exports = runThemeTests;

if (require.main === module) {
  runThemeTests();
}
