const path = require('path');
const { spawnSync } = require('child_process');
const electron = require('electron');
const runConfigTests = require('./config.test');
const runThemeTests = require('./theme.test');
const runComplianceTests = require('./compliance.test');
const runIpcTests = require('./ipc.test');
const runPlayerControllerTests = require('./player-controller.test');
const runWindowLifecycleTests = require('./window-lifecycle.test');
const runBitChordArchitectureTests = require('./bitchord-architecture.test');
const runEdgeCaseTests = require('./edge-cases.test');
const runInnerTubeIntegrationTests = require('./innertube-integration.test');
const runAuthPersistenceTests = require('./auth-persistence.test');

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
  runBitChordArchitectureTests();
  console.log('');
  runEdgeCaseTests();
  console.log('');
  runInnerTubeIntegrationTests();
  console.log('');
  runAuthPersistenceTests();
  console.log('');

  // Run live Electron CSP integration test
  const { spawn } = require('child_process');
  const child = spawn(electron, [path.join(__dirname, 'csp-runtime.test.js')], {
    env: { ...process.env, ELECTRON_ENABLE_LOGGING: '1' }
  });

  let cspStdout = '';
  let cspStderr = '';
  let testPassed = false;

  child.stdout.on('data', (d) => {
    const text = d.toString();
    cspStdout += text;
    if (text.includes('tests passed successfully')) {
      testPassed = true;
      setTimeout(() => {
        try { child.kill('SIGKILL'); } catch {}
      }, 500);
    }
  });

  child.stderr.on('data', (d) => {
    cspStderr += d.toString();
  });

  child.on('close', (code) => {
    if (!testPassed && code !== 0) {
      console.error(cspStderr || cspStdout);
      process.exit(code || 1);
    }
    console.log(cspStdout.trim());
    console.log('');
    console.log('====================================================');
    console.log('  ALL TESTS PASSED SUCCESSFULLY! (11/11 test suites)');
    console.log('====================================================');
    process.exit(0);
  });
} catch (err) {
  console.error('\n[FAIL] Test suite failed with error:');
  console.error(err);
  process.exit(1);
}
