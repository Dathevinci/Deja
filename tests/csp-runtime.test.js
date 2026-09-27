const http = require('http');
const { app, BrowserWindow } = require('electron');
const path = require('path');
const assert = require('assert');

function runCspRuntimeTests() {
  console.log('--- Testing Preload & Apple UI Runtime under Strict CSP ---');

  const server = http.createServer((req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'nonce-secure123'; style-src 'self' 'nonce-secure456';"
    });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head><title>Strict CSP YouTube Music Simulation</title></head>
        <body>
          <ytmusic-nav-bar></ytmusic-nav-bar>
          <ytmusic-player-bar>
            <div class="content-info-wrapper">
              <span class="title">Starboy</span>
              <span class="byline">The Weeknd • Starboy</span>
            </div>
            <button id="play-pause-button">Play</button>
          </ytmusic-player-bar>
          <video class="html5-main-video"></video>
        </body>
      </html>
    `);
  });

  const sockets = new Set();
  server.on('connection', (socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
  });

  server.listen(48999, '127.0.0.1', () => {
    app.whenReady().then(async () => {
      try {
        const win = new BrowserWindow({
          show: false,
          webPreferences: {
            preload: path.join(__dirname, '../src/preload/preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false
          }
        });

        const cspViolations = [];
        win.webContents.on('console-message', (e, level, msg) => {
          if (msg && msg.toLowerCase().includes('violates the following content security policy directive')) {
            cspViolations.push(msg);
          }
        });

        await win.loadURL('http://127.0.0.1:48999');

        const domState = await win.webContents.executeJavaScript(`
          ({
            hasTitlebar: !!(document.getElementById('deja-titlebar') || document.getElementById('sonora-titlebar')),
            hasTrafficLights: !!(document.querySelector('.deja-traffic-lights') || document.querySelector('.sonora-traffic-lights')),
            hasCloseBtn: !!(document.getElementById('deja-close-btn') || document.getElementById('sonora-close-btn')),
            hasMinBtn: !!(document.getElementById('deja-min-btn') || document.getElementById('sonora-min-btn')),
            hasMaxBtn: !!(document.getElementById('deja-max-btn') || document.getElementById('sonora-max-btn')),
            hasSearchBar: !!(document.getElementById('deja-search-bar') || document.getElementById('sonora-search-bar')),
            hasSearchInput: !!(document.getElementById('deja-search-input') || document.getElementById('sonora-search-input')),
            hasLyricsBtn: !!(document.getElementById('deja-lyrics-btn') || document.getElementById('sonora-lyrics-btn')),
            hasMiniBtn: !!(document.getElementById('deja-mini-btn') || document.getElementById('sonora-mini-btn')),
            hasSettingsBtn: !!(document.getElementById('deja-settings-btn') || document.getElementById('sonora-settings-btn')),
            hasAccountBtn: !!(document.getElementById('deja-account-btn') || document.getElementById('sonora-account-btn')),
            navBarHidden: window.getComputedStyle(document.querySelector('ytmusic-nav-bar')).display === 'none',
            titlebarHeight: (document.getElementById('deja-titlebar') || document.getElementById('sonora-titlebar')) ? window.getComputedStyle(document.getElementById('deja-titlebar') || document.getElementById('sonora-titlebar')).height : '0px'
          })
        `);

        assert.strictEqual(domState.hasTitlebar, true, 'Apple titlebar must be injected');
        assert.strictEqual(domState.hasTrafficLights, true, 'Traffic lights must be present');
        assert.strictEqual(domState.hasCloseBtn, true, 'Close button must exist');
        assert.strictEqual(domState.hasMinBtn, true, 'Minimize button must exist');
        assert.strictEqual(domState.hasMaxBtn, true, 'Maximize button must exist');
        assert.strictEqual(domState.hasSearchBar, true, 'Search bar must exist');
        assert.strictEqual(domState.hasSearchInput, true, 'Search input field must exist');
        assert.strictEqual(domState.hasLyricsBtn, true, 'Lyrics button must exist');
        assert.strictEqual(domState.hasMiniBtn, true, 'Mini player button must exist');
        assert.strictEqual(domState.hasSettingsBtn, true, 'Settings button must exist');
        assert.strictEqual(domState.hasAccountBtn, true, 'Account avatar button must exist');
        assert.strictEqual(domState.navBarHidden, true, 'Raw ytmusic-nav-bar must be hidden');
        assert.strictEqual(domState.titlebarHeight, '42px', 'Titlebar must have 42px height via injected CSS');
        assert.strictEqual(cspViolations.length, 0, `Must have 0 CSP violations, got: ${JSON.stringify(cspViolations)}`);

        console.log('✓ Preload & Apple UI Runtime under Strict CSP tests passed successfully.');
        try { win.destroy(); } catch {}
        sockets.forEach(s => { try { s.destroy(); } catch {} });
        sockets.clear();
        try { if (typeof server.closeAllConnections === 'function') server.closeAllConnections(); } catch {}
        try { server.close(); } catch {}
        try { server.unref(); } catch {}
        app.exit(0);
        process.exit(0);
      } catch (err) {
        console.error('❌ CSP Runtime test failed:', err);
        sockets.forEach(s => { try { s.destroy(); } catch {} });
        sockets.clear();
        try { server.close(); } catch {}
        try { server.unref(); } catch {}
        app.exit(1);
        process.exit(1);
      }
    });
  });
}

module.exports = runCspRuntimeTests;

runCspRuntimeTests();
