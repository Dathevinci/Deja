const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Test ConfigManager
const config = require('../src/main/config');

function runConfigTests() {
  console.log('--- Testing ConfigManager ---');

  // 1. Default values
  const theme = config.get('theme');
  assert.strictEqual(theme, 'dark', 'Default theme should be dark');

  const accentColor = config.get('accentColor');
  assert.strictEqual(accentColor, '#FA2D48', 'Default accent color should be Apple Red #FA2D48');

  // 2. Set and get values
  config.set('theme', 'light');
  assert.strictEqual(config.get('theme'), 'light', 'Theme should update to light');

  config.set('theme', 'dark'); // restore
  assert.strictEqual(config.get('theme'), 'dark', 'Theme should restore to dark');

  // 3. Batch set
  config.set({
    discordRPC: false,
    notifications: true
  });
  assert.strictEqual(config.get('discordRPC'), false, 'Batch set should update discordRPC');
  assert.strictEqual(config.get('notifications'), true, 'Batch set should update notifications');

  config.set('discordRPC', true); // restore

  // 4. Reset
  const restored = config.reset();
  assert.strictEqual(restored.theme, 'dark');
  assert.strictEqual(restored.discordRPC, true);

  // 5. Config persistence path
  assert.ok(config.configPath.includes('deja-config.json'), 'Config storage must be named deja-config.json');

  console.log('✓ ConfigManager tests passed successfully.');
}

module.exports = runConfigTests;

if (require.main === module) {
  runConfigTests();
}
