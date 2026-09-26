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

  // Verify YouTube Music Specific Components are Restyled
  assert.ok(css.includes('ytmusic-player-bar'), 'Must restyle ytmusic-player-bar');
  assert.ok(css.includes('ytmusic-guide-renderer'), 'Must restyle sidebar navigation');
  assert.ok(css.includes('#deja-titlebar'), 'Must define custom Apple titlebar (#deja-titlebar)');
  assert.ok(css.includes('.deja-traffic-lights'), 'Must define macOS traffic light buttons (.deja-traffic-lights)');
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
