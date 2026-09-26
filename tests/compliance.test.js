const assert = require('assert');
const fs = require('fs');
const path = require('path');

function runComplianceTests() {
  console.log('--- Testing Google TOS & Ad Monetization Policy Compliance ---');

  const mainPath = path.join(__dirname, '../src/main/main.js');
  const mainCode = fs.readFileSync(mainPath, 'utf8');

  // Ensure no ad-blocking extensions or webRequest cancel rules for ads
  assert.ok(!mainCode.includes('cancel: true') || !mainCode.includes('ad'), 'Must NOT cancel or block ad requests');
  assert.ok(!mainCode.includes('ublock'), 'Must NOT bundle adblockers');
  assert.ok(!mainCode.includes('adblock'), 'Must NOT contain ad-blocking logic');

  // Verify Chrome User Agent for clean Google OAuth authentication
  assert.ok(mainCode.includes('CHROME_UA'), 'Must define Chrome User Agent for Google login');

  // Verify Controller handles Ad states
  const controllerPath = path.join(__dirname, '../src/preload/apple-player.js');
  const controllerCode = fs.readFileSync(controllerPath, 'utf8');
  assert.ok(controllerCode.includes('isAdPlaying'), 'Must detect and monitor ad status');
  assert.ok(controllerCode.includes('sonora-ad-badge'), 'Must support Apple-style advertisement badge');

  console.log('✓ Google TOS & Ad Compliance tests passed successfully.');
}

module.exports = runComplianceTests;

if (require.main === module) {
  runComplianceTests();
}
