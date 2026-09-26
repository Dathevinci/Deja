const runConfigTests = require('./config.test');
const runThemeTests = require('./theme.test');
const runComplianceTests = require('./compliance.test');
const runIpcTests = require('./ipc.test');

console.log('====================================================');
console.log('  Sonora - YouTube Music Apple Client Test Suite    ');
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
  console.log('====================================================');
  console.log('  ALL TESTS PASSED SUCCESSFULLY! (4/4 test suites)  ');
  console.log('====================================================');
  process.exit(0);
} catch (err) {
  console.error('\n❌ Test suite failed with error:');
  console.error(err);
  process.exit(1);
}
