/**
 * Deja - Login Window Stealth Preload Script
 * Protects Google Authentication against Botguard "This browser or app may not be secure" detection.
 */
try {
  // 1. Hide webdriver flag
  Object.defineProperty(navigator, 'webdriver', {
    get: () => undefined,
    configurable: true
  });

  // 2. Mock complete genuine Chrome window.chrome API surface
  if (!window.chrome) {
    window.chrome = {};
  }
  if (!window.chrome.app) {
    window.chrome.app = {
      isInstalled: false,
      InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' },
      RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' },
      getDetails: function() {},
      getIsInstalled: function() { return false; },
      installState: function() { return 'not_installed'; },
      runningState: function() { return 'cannot_run'; }
    };
  }
  if (!window.chrome.csi) {
    window.chrome.csi = function() {
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
    window.chrome.loadTimes = function() {
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

  // 3. Harmonize navigator.userAgentData with Chrome 131 desktop client hints
  if (navigator.userAgentData) {
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
    } catch {}
  }
} catch (e) {
  // Silent fail safe
}
