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
  assert.ok(css.includes('#player-bar-background') && css.includes('#nav-bar-background'), 'Must eliminate opaque background layers for player-bar and nav-bar');
  assert.ok(css.includes('--ytmusic-player-bar-height: 80px !important'), 'Must define --ytmusic-player-bar-height: 80px');
  assert.ok(css.includes('ytmusic-mini-guide-renderer'), 'Must style and offset mini-sidebar');
  assert.ok(css.includes('ITEM_SHAPE_CIRCLE'), 'Must preserve 50% circle border radius for artist avatars');
  assert.ok(css.includes('.subtitle') && css.includes('.content-info-wrapper a'), 'Must style track subtitles and links cleanly');
  assert.ok(css.includes('#sonora-titlebar'), 'Must retain backwards-compatible #sonora-titlebar');
  assert.ok(css.includes('.sonora-traffic-lights'), 'Must retain backwards-compatible .sonora-traffic-lights');
  assert.ok(css.includes('.sonora-ad-badge'), 'Must retain backwards-compatible .sonora-ad-badge');

  // Verify Fluid Micro-interactions & Scrollbar Elimination
  assert.ok(css.includes('scrollbar-width: none !important'), 'Must eliminate native browser scrollbars');
  assert.ok(css.includes('*, *::before, *::after'), 'Must apply scrollbar hiding universally');
  assert.ok(css.includes('cubic-bezier(0.16, 1, 0.3, 1)'), 'Must use Apple fluid spring cubic-bezier curves');

  // Verify Sidebar Refined Pill & Paper-Item Reset
  assert.ok(css.includes('ytmusic-guide-entry-renderer tp-yt-paper-item'), 'Must reset Polymer paper-item inside sidebar entries');
  assert.ok(css.includes('background: transparent !important'), 'Paper items must have transparent background');

  // Verify Apple Squircle & Cover Art After Playing
  assert.ok(css.includes('scale(1.05)'), 'Album art must scale smoothly to 1.05 when playing');
  assert.ok(css.includes('#hover.paper-progress'), 'Must eliminate floating thumbnail tooltip artifacts');
  assert.ok(css.includes('ytmusic-player-bar #preview'), 'Must eliminate preview thumbnail tooltips');

  // Verify Now Playing Dynamic Ambient Aura & 18px Squircle
  assert.ok(css.includes('.deja-player-ambient-aura'), 'Must wrap now playing view with Apple dynamic ambient aura');
  assert.ok(css.includes('--deja-aura-c1'), 'Must support dynamic color extraction variables');
  assert.ok(css.includes('dejaMeshDrift'), 'Must include animated mesh drift keyframes');
  assert.ok(css.includes('18px !important'), 'Artwork on player page must have 18px squircle radius');
  assert.ok(css.includes('dejaArtworkBreathing'), 'Artwork must have smooth play/pause breathing animation');

  console.log('✓ Apple Theme CSS tests passed successfully.');
}

module.exports = runThemeTests;

if (require.main === module) {
  runThemeTests();
}
