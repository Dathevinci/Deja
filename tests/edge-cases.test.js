const assert = require('assert');
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

  console.log('✓ Edge cases and security tests passed successfully.');
}

module.exports = runEdgeCaseTests;

if (require.main === module) {
  runEdgeCaseTests();
}
