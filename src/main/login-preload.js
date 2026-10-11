/**
 * Deja - Login Window Stealth Preload Script
 * Protects Google Authentication against Botguard "This browser or app may not be secure" detection.
 */
(function () {
  try {
    // 1. Remove automation and webdriver properties across navigator prototypes
    try {
      if (typeof navigator !== 'undefined') {
        delete Object.getPrototypeOf(navigator).webdriver;
      }
    } catch (e) {}

    try {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
        set: () => {},
        configurable: true,
        enumerable: true
      });
    } catch (e) {}

    // 2. Remove Node / Electron runtime globals if exposed
    try {
      if (typeof window !== 'undefined') {
        delete window.process;
        delete window.electron;
        delete window.require;
      }
    } catch (e) {}

    // 3. Mock genuine Chrome window.chrome API surface
    if (typeof window !== 'undefined') {
      if (!window.chrome) {
        window.chrome = {};
      }
      if (!window.chrome.app) {
        window.chrome.app = {
          isInstalled: false,
          InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' },
          RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' },
          getDetails: function () {},
          getIsInstalled: function () { return false; },
          installState: function () { return 'not_installed'; },
          runningState: function () { return 'cannot_run'; }
        };
      }
      if (!window.chrome.csi) {
        window.chrome.csi = function () {
          const now = Date.now();
          const navStart = (window.performance && window.performance.timing) ? window.performance.timing.navigationStart : now;
          return {
            onloadT: now,
            pageT: now - navStart,
            startE: navStart,
            tran: 15
          };
        };
      }
      if (!window.chrome.loadTimes) {
        window.chrome.loadTimes = function () {
          const nowSec = Date.now() / 1000;
          const navStart = (window.performance && window.performance.timing) ? (window.performance.timing.navigationStart / 1000) : nowSec;
          return {
            commitLoadTime: navStart + 0.1,
            connectionInfo: 'h2',
            finishDocumentLoadTime: navStart + 0.3,
            finishLoadTime: navStart + 0.5,
            firstPaintAfterLoadTime: 0,
            firstPaintTime: navStart + 0.35,
            navigationType: 'Other',
            npnNegotiatedProtocol: 'h2',
            requestTime: navStart,
            startLoadTime: navStart,
            wasAlternateProtocolAvailable: false,
            wasFetchedViaSpdy: true,
            wasNpnNegotiated: true
          };
        };
      }
      if (!window.chrome.runtime) {
        window.chrome.runtime = {
          OnInstalledReason: { CHROME_UPDATE: 'chrome_update', INSTALL: 'install', SHARED_MODULE_UPDATE: 'shared_module_update', UPDATE: 'update' },
          OnRestartRequiredReason: { APP_UPDATE: 'app_update', OS_UPDATE: 'os_update', PERIODIC: 'periodic' },
          PlatformArch: { ARM: 'arm', ARM64: 'arm64', MIPS: 'mips', MIPS64: 'mips64', X86_32: 'x86-32', X86_64: 'x86-64' },
          PlatformNaclArch: { ARM: 'arm', MIPS: 'mips', MIPS64: 'mips64', X86_32: 'x86-32', X86_64: 'x86-64' },
          PlatformOs: { ANDROID: 'android', CROS: 'cros', LINUX: 'linux', MAC: 'mac', OPENBSD: 'openbsd', WIN: 'win' },
          connect: function () { return { disconnect: function () {}, postMessage: function () {} }; },
          sendMessage: function () {}
        };
      }
    }

    // 4. Harmonize navigator.userAgentData with Chrome 131 desktop client hints
    if (typeof navigator !== 'undefined' && navigator.userAgentData) {
      const brands = [
        { brand: 'Google Chrome', version: '131' },
        { brand: 'Chromium', version: '131' },
        { brand: 'Not_A Brand', version: '24' }
      ];
      try {
        Object.defineProperty(navigator.userAgentData, 'brands', {
          get: () => brands,
          configurable: true
        });
        Object.defineProperty(navigator.userAgentData, 'mobile', {
          get: () => false,
          configurable: true
        });
        Object.defineProperty(navigator.userAgentData, 'platform', {
          get: () => 'Windows',
          configurable: true
        });
      } catch (e) {}
    }
  } catch (e) {
    // Silent fail safe
  }
})();
