const path = require('path');
const { spawnSync } = require('child_process');
const electron = require('electron');
const runConfigTests = require('./config.test');
const runThemeTests = require('./theme.test');
const runComplianceTests = require('./compliance.test');
const runIpcTests = require('./ipc.test');
const runPlayerControllerTests = require('./player-controller.test');
const runWindowLifecycleTests = require('./window-lifecycle.test');

console.log('====================================================');
console.log('  Deja - YouTube Music Apple Client Test Suite      ');
console.log('====================================================\n');

try {
  runConfigTests();
  console.log('');
  runThemeTests();
  console.log('');
  runComplianceTests();
  console.log('');
  runIpcTests();
  console.log('');
  runPlayerControllerTests();
  console.log('');
  runWindowLifecycleTests();
  console.log('');

  // Run live Electron CSP integration test
  const res = spawnSync(electron, [path.join(__dirname, 'csp-runtime.test.js')], {
    encoding: 'utf8',
    env: { ...process.env, ELECTRON_ENABLE_LOGGING: '1' }
  });

  if (res.status !== 0) {
    throw new Error(`CSP Runtime test failed with exit code ${res.status}: ${res.stderr || res.stdout}`);
  }
  console.log(res.stdout.trim());
  console.log('');

  console.log('====================================================');
  console.log('  ALL TESTS PASSED SUCCESSFULLY! (7/7 test suites)  ');
  console.log('====================================================');
  process.exit(0);
} catch (err) {
  console.error('\n❌ Test suite failed with error:');
  console.error(err);
  process.exit(1);
}
