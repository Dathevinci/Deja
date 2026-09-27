const assert = require('assert');
const path = require('path');
const preview = require('../src/renderer/preview.js');

function runEdgeCaseTests() {
  console.log('--- Testing Edge Cases & Security ---');

  // 1. escapeHTML edge cases
  assert.strictEqual(
    preview.escapeHTML('<script>alert("XSS")</script>'),
    '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;',
    'Must escape script tags'
  );
  assert.strictEqual(
    preview.escapeHTML('<img src="x" onerror="alert(1)">'),
    '&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;',
    'Must escape img onerror attribute'
  );
  assert.strictEqual(
    preview.escapeHTML("Deja's <Apple> & 'BitChord' \"Client\""),
    'Deja&#039;s &lt;Apple&gt; &amp; &#039;BitChord&#039; &quot;Client&quot;',
    'Must escape all entities'
  );
  assert.strictEqual(preview.escapeHTML(null), '', 'Null must return empty string');
  assert.strictEqual(preview.escapeHTML(undefined), '', 'Undefined must return empty string');
  assert.strictEqual(preview.escapeHTML(''), '', 'Empty string must return empty string');
  assert.strictEqual(preview.escapeHTML(12345), '', 'Non-string must return empty string');

  // 2. formatTime edge cases
  assert.strictEqual(preview.formatTime(0), '0:00');
  assert.strictEqual(preview.formatTime(5), '0:05');
  assert.strictEqual(preview.formatTime(59), '0:59');
  assert.strictEqual(preview.formatTime(60), '1:00');
  assert.strictEqual(preview.formatTime(65), '1:05');
  assert.strictEqual(preview.formatTime(3599), '59:59');

  // 3. Navigation History Logic
  assert.strictEqual(typeof preview.pushNavigation, 'function');
  assert.strictEqual(typeof preview.navigateBack, 'function');
  assert.strictEqual(typeof preview.navigateForward, 'function');

  // 4. shufflePlayPlaylist logic
  assert.strictEqual(typeof preview.shufflePlayPlaylist, 'function');

  // 5. Catalogue Tracks
  assert.ok(Array.isArray(preview.CATALOGUE_TRACKS));
  assert.ok(preview.CATALOGUE_TRACKS.length >= 11);
  for (const track of preview.CATALOGUE_TRACKS) {
    assert.ok(track.id);
    assert.ok(track.videoId);
    assert.ok(track.title);
    assert.ok(track.artist);
    assert.ok(track.album);
    assert.ok(track.duration > 0);
    assert.ok(track.cover);
    assert.ok(track.palette && track.palette.c1);
    assert.ok(Array.isArray(track.lyrics));
  }

  // 6. EQ Presets
  assert.strictEqual(Object.keys(preview.EQ_PRESETS).length, 5);
  ['Flat', 'Bass Boost', 'Acoustic', 'Vocal Booster', 'Treble Booster'].forEach(preset => {
    assert.ok(preview.EQ_PRESETS[preset]);
    assert.strictEqual(typeof preview.EQ_PRESETS[preset].bass, 'number');
    assert.strictEqual(typeof preview.EQ_PRESETS[preset].mid, 'number');
    assert.strictEqual(typeof preview.EQ_PRESETS[preset].treble, 'number');
  });

  // 7. Lyrics Parsing & Clean Search Term Edge Cases
  const innertube = require('../src/main/innertube.js');
  assert.deepStrictEqual(innertube.parseLrcString(null), []);
  assert.deepStrictEqual(innertube.parseLrcString(undefined), []);
  assert.deepStrictEqual(innertube.parseLrcString(''), []);
  assert.deepStrictEqual(innertube.parseLrcString('Not an LRC file at all'), []);
  assert.deepStrictEqual(innertube.parseLrcString('[invalid:stamp] No match'), []);
  assert.deepStrictEqual(innertube.parseLrcString('[00:00] No fraction'), [{ time: 0, text: 'No fraction' }]);
  assert.strictEqual(innertube.cleanSearchTerm(null), '');
  assert.strictEqual(innertube.cleanSearchTerm(undefined), '');
  assert.strictEqual(innertube.cleanSearchTerm(''), '');
  assert.strictEqual(innertube.cleanSearchTerm(12345), '');

  // 3-digit millisecond timestamps [mm:ss.xxx] (with intro gap if starts after 5s)
  const parsed3digit = innertube.parseLrcString('[01:15.500] Three digit fraction');
  assert.strictEqual(parsed3digit.length, 2);
  assert.strictEqual(parsed3digit[0].time, 0);
  assert.strictEqual(parsed3digit[0].text, '♪');
  assert.strictEqual(parsed3digit[1].time, 75.5);
  assert.strictEqual(parsed3digit[1].text, 'Three digit fraction');

  // Empty line text defaults to musical note ♪
  const emptyLineParsed = innertube.parseLrcString('[00:01.00] ');
  assert.strictEqual(emptyLineParsed[0].text, '♪');

  // Preview parseLrcLines edge cases
  assert.deepStrictEqual(preview.parseLrcLines(null), []);
  assert.deepStrictEqual(preview.parseLrcLines(undefined), []);
  assert.deepStrictEqual(preview.parseLrcLines(''), []);

  // 8. Custom Playlist Edge Cases
  const plEmpty = preview.createCustomPlaylist('', '   ');
  assert.strictEqual(plEmpty.title, 'My Playlist');
  assert.strictEqual(plEmpty.description, 'Custom Playlist');

  const plWhitespace = preview.createCustomPlaylist('   ', '');
  assert.strictEqual(plWhitespace.title, 'My Playlist');

  assert.strictEqual(preview.addTrackToCustomPlaylist('non-existent-pl-id', { id: 'x' }), false);
  assert.strictEqual(preview.addTrackToCustomPlaylist(null, null), false);
  assert.strictEqual(preview.addTrackToCustomPlaylist(plEmpty.id, null), false);

  // Removing from non-existent playlist should not throw
  assert.doesNotThrow(() => {
    preview.removeTrackFromCustomPlaylist('non-existent-pl-id', 'some-id');
  });

  // Deleting non-existent playlist should not throw
  assert.doesNotThrow(() => {
    preview.deleteCustomPlaylist('non-existent-pl-id');
  });

  // Cleanup test playlist
  preview.deleteCustomPlaylist(plEmpty.id);
  preview.deleteCustomPlaylist(plWhitespace.id);

  // 9. Lyrics Drawer Dismissal & DOM Idempotency Edge Cases
  // In Node environment without DOM, functions should gracefully return without throwing
  assert.doesNotThrow(() => {
    preview.closeLyricsDrawer();
    preview.openLyricsDrawer();
    preview.toggleLyricsDrawer();
  }, 'Lyrics drawer functions must be safe when DOM is absent');

  // Test with mock DOM elements
  const mockClassList = (initial = []) => {
    const classes = new Set(initial);
    return {
      add: (...cls) => cls.forEach(c => classes.add(c)),
      remove: (...cls) => cls.forEach(c => classes.delete(c)),
      contains: (c) => classes.has(c),
      toggle: (c, force) => {
        if (typeof force === 'boolean') {
          if (force) classes.add(c); else classes.delete(c);
          return force;
        }
        if (classes.has(c)) { classes.delete(c); return false; }
        classes.add(c); return true;
      }
    };
  };

  const mockDrawer = { id: 'apple-lyrics-drawer', classList: mockClassList() };
  const mockBackdrop = { id: 'lyrics-backdrop', classList: mockClassList() };
  const mockBtnToggle = { id: 'btn-toggle-lyrics', classList: mockClassList() };
  const mockBtnLyricsPanel = { id: 'btn-lyrics-panel', classList: mockClassList() };

  global.document = {
    getElementById: (id) => {
      if (id === 'apple-lyrics-drawer') return mockDrawer;
      if (id === 'lyrics-backdrop') return mockBackdrop;
      if (id === 'btn-toggle-lyrics') return mockBtnToggle;
      if (id === 'btn-lyrics-panel') return mockBtnLyricsPanel;
      return null;
    }
  };

  // Open drawer
  preview.openLyricsDrawer();
  assert.strictEqual(mockDrawer.classList.contains('visible'), true, 'Drawer must have visible class');
  assert.strictEqual(mockDrawer.classList.contains('active'), true, 'Drawer must have active class');
  assert.strictEqual(mockBackdrop.classList.contains('visible'), true, 'Backdrop must have visible class');
  assert.strictEqual(mockBtnToggle.classList.contains('active'), true, 'Toggle button must have active class');
  assert.strictEqual(mockBtnLyricsPanel.classList.contains('active'), true, 'Player bar lyrics button must have active class');

  // Close drawer
  preview.closeLyricsDrawer();
  assert.strictEqual(mockDrawer.classList.contains('visible'), false, 'Drawer must not have visible class');
  assert.strictEqual(mockDrawer.classList.contains('active'), false, 'Drawer must not have active class');
  assert.strictEqual(mockBackdrop.classList.contains('visible'), false, 'Backdrop must not have visible class');
  assert.strictEqual(mockBtnToggle.classList.contains('active'), false, 'Toggle button must not have active class');
  assert.strictEqual(mockBtnLyricsPanel.classList.contains('active'), false, 'Player bar lyrics button must not have active class');

  // Idempotency: closing already closed drawer
  assert.doesNotThrow(() => preview.closeLyricsDrawer());
  assert.strictEqual(mockDrawer.classList.contains('visible'), false);

  // Toggle drawer
  preview.toggleLyricsDrawer();
  assert.strictEqual(mockDrawer.classList.contains('visible'), true);
  preview.toggleLyricsDrawer();
  assert.strictEqual(mockDrawer.classList.contains('visible'), false);

  // Queue drawer mutual exclusion
  const mockQueueDrawer = { id: 'apple-queue-drawer', classList: mockClassList(['visible', 'active']) };
  const mockBtnQueuePanel = { id: 'btn-queue-panel', classList: mockClassList(['active']), style: {} };
  const mockExpBtnQueue = { id: 'exp-btn-queue', classList: mockClassList(['active']), style: {} };
  const prevGetElementById = global.document.getElementById;
  global.document.getElementById = (id) => {
    if (id === 'apple-queue-drawer') return mockQueueDrawer;
    if (id === 'btn-queue-panel') return mockBtnQueuePanel;
    if (id === 'exp-btn-queue') return mockExpBtnQueue;
    return prevGetElementById(id);
  };

  preview.openLyricsDrawer();
  assert.strictEqual(mockQueueDrawer.classList.contains('visible'), false, 'Opening lyrics drawer must close queue drawer');
  assert.strictEqual(mockBtnQueuePanel.classList.contains('active'), false, 'Opening lyrics drawer must deactivate queue button');
  preview.closeLyricsDrawer();

  // Test opening queue drawer closes lyrics drawer
  mockDrawer.classList.add('visible', 'active');
  preview.openQueueDrawer();
  assert.strictEqual(mockDrawer.classList.contains('visible'), false, 'Opening queue drawer must close lyrics drawer');
  assert.strictEqual(mockQueueDrawer.classList.contains('visible'), true, 'Queue drawer must be opened');
  assert.strictEqual(mockExpBtnQueue.style.color, '#FA2D48', 'Queue button must be styled active');

  preview.closeQueueDrawer();
  assert.strictEqual(mockQueueDrawer.classList.contains('visible'), false, 'Closing queue drawer must hide it');
  assert.strictEqual(mockExpBtnQueue.style.color, '', 'Closing queue drawer must clear style');

  // Clean up global mock
  delete global.document;

  // 12. Session Cookie Parser Edge Cases (testing real parseCookiePairs from cookie-utils.js)
  const { execFileSync } = require('child_process');
  const fs = require('fs');
  const srcFiles = [
    '../src/main/main.js',
    '../src/main/auth-store.js',
    '../src/main/cookie-utils.js',
    '../src/main/config.js',
    '../src/main/discord.js',
    '../src/main/innertube.js',
    '../src/main/menu.js',
    '../src/main/shortcuts.js',
    '../src/main/tray.js',
    '../src/preload/preload.js',
    '../src/preload/apple-player.js',
    '../src/renderer/preview.js'
  ];
  for (const relPath of srcFiles) {
    const fullPath = path.resolve(__dirname, relPath);
    assert.doesNotThrow(() => {
      execFileSync(process.execPath, ['--check', fullPath]);
    }, `${relPath} must have zero syntax errors or duplicate declarations`);
  }

  const { parseCookiePairs } = require('../src/main/cookie-utils.js');

  assert.deepStrictEqual(parseCookiePairs(''), []);
  assert.deepStrictEqual(parseCookiePairs(null), []);
  assert.deepStrictEqual(parseCookiePairs(undefined), []);
  assert.deepStrictEqual(parseCookiePairs('   '), []);
  assert.deepStrictEqual(parseCookiePairs('RAW_SAPISID_TOKEN_ABC123'), [
    { name: 'SAPISID', value: 'RAW_SAPISID_TOKEN_ABC123' },
    { name: '__Secure-3PAPISID', value: 'RAW_SAPISID_TOKEN_ABC123' },
    { name: '__Secure-1PAPISID', value: 'RAW_SAPISID_TOKEN_ABC123' }
  ]);
  assert.deepStrictEqual(parseCookiePairs('"QUOTED_BARE_TOKEN"'), [
    { name: 'SAPISID', value: 'QUOTED_BARE_TOKEN' },
    { name: '__Secure-3PAPISID', value: 'QUOTED_BARE_TOKEN' },
    { name: '__Secure-1PAPISID', value: 'QUOTED_BARE_TOKEN' }
  ]);
  assert.deepStrictEqual(parseCookiePairs('SAPISID="quoted_token"; LOGIN_INFO=live_info_token'), [
    { name: 'SAPISID', value: 'quoted_token' },
    { name: 'LOGIN_INFO', value: 'live_info_token' },
    { name: '__Secure-3PAPISID', value: 'quoted_token' },
    { name: '__Secure-1PAPISID', value: 'quoted_token' }
  ]);
  assert.deepStrictEqual(parseCookiePairs('Cookie: SAPISID=foo; SID=bar'), [
    { name: 'SAPISID', value: 'foo' },
    { name: 'SID', value: 'bar' },
    { name: '__Secure-3PAPISID', value: 'foo' },
    { name: '__Secure-1PAPISID', value: 'foo' }
  ]);
  assert.deepStrictEqual(parseCookiePairs('SID=123;\nHSID=456;\r\nSSID=789'), [
    { name: 'SID', value: '123' },
    { name: 'HSID', value: '456' },
    { name: 'SSID', value: '789' }
  ]);
  // When __Secure-3PAPISID is already present, do not overwrite or duplicate; populate missing __Secure-1PAPISID
  const withExisting3P = parseCookiePairs('SAPISID=token1; __Secure-3PAPISID=token2');
  assert.strictEqual(withExisting3P.filter(c => c.name === '__Secure-3PAPISID').length, 1);
  assert.strictEqual(withExisting3P.find(c => c.name === '__Secure-3PAPISID').value, 'token2');
  assert.strictEqual(withExisting3P.find(c => c.name === '__Secure-1PAPISID').value, 'token1');

  // When __Secure-1PAPISID is already present, do not overwrite or duplicate; populate missing __Secure-3PAPISID
  const withExisting1P = parseCookiePairs('SAPISID=token1; __Secure-1PAPISID=token3');
  assert.strictEqual(withExisting1P.filter(c => c.name === '__Secure-1PAPISID').length, 1);
  assert.strictEqual(withExisting1P.find(c => c.name === '__Secure-1PAPISID').value, 'token3');
  assert.strictEqual(withExisting1P.find(c => c.name === '__Secure-3PAPISID').value, 'token1');

  // Strip cookie directives (Path, Domain, SameSite, Secure, HttpOnly)
  const withDirectives = parseCookiePairs('SAPISID=token1; Path=/; Domain=.google.com; Secure; HttpOnly; SameSite=None');
  assert.strictEqual(withDirectives.some(c => c.name.toLowerCase() === 'path'), false);
  assert.strictEqual(withDirectives.some(c => c.name.toLowerCase() === 'domain'), false);
  assert.strictEqual(withDirectives.some(c => c.name.toLowerCase() === 'samesite'), false);

  // Support JSON-exported cookies from Cookie-Editor / EditThisCookie
  const jsonInput = JSON.stringify([
    { name: 'SAPISID', value: 'json_sapisid_val' },
    { name: 'LOGIN_INFO', value: 'json_login_info_val' },
    { name: 'Path', value: '/' }
  ]);
  const parsedJson = parseCookiePairs(jsonInput);
  assert.strictEqual(parsedJson.find(c => c.name === 'SAPISID').value, 'json_sapisid_val');
  assert.strictEqual(parsedJson.find(c => c.name === 'LOGIN_INFO').value, 'json_login_info_val');
  assert.strictEqual(parsedJson.find(c => c.name === '__Secure-3PAPISID').value, 'json_sapisid_val');
  assert.strictEqual(parsedJson.find(c => c.name === '__Secure-1PAPISID').value, 'json_sapisid_val');
  assert.strictEqual(parsedJson.some(c => c.name.toLowerCase() === 'path'), false);

  // 13. InnerTube getAccountInfo Fallback when account_menu endpoint fails
  const mockFallbackSes = {
    cookies: {
      get: async (opts) => {
        if (opts && opts.domain && opts.domain.includes('youtube')) {
          return [{ name: 'SAPISID', value: 'valid_fallback_sapisid' }];
        }
        return [];
      }
    }
  };
  innertube.getAccountInfo(mockFallbackSes).then(info => {
    assert.strictEqual(info.isLoggedIn, true, 'getAccountInfo must preserve logged-in state when authentic YouTube session exists');
    assert.strictEqual(info.name, 'Google User');
  });

  console.log('✓ Edge cases and security tests passed successfully.');
}

module.exports = runEdgeCaseTests;

if (require.main === module) {
  runEdgeCaseTests();
}
