const assert = require('assert');
const fs = require('fs');
const path = require('path');

function runBitChordArchitectureTests() {
  console.log('--- Testing Native BitChord & Apple Client Architecture ---');

  // 1. Verify main.js launches the native BitChord client UI by default
  const mainPath = path.join(__dirname, '../src/main/main.js');
  const mainCode = fs.readFileSync(mainPath, 'utf8');

  assert.ok(mainCode.includes("const isWebMode = process.argv.includes('--web');"), 'main.js must define isWebMode flag');
  assert.ok(mainCode.includes('const isPreview = !isWebMode;'), 'main.js must default isPreview to true (!isWebMode)');
  assert.ok(mainCode.includes("mainWindow.loadFile(path.join(__dirname, '../renderer/preview.html'))"), 'main.js must load preview.html by default');
  assert.ok(mainCode.includes("ipcMain.handle('open-google-login'"), 'main.js must provide open-google-login IPC handler');
  assert.ok(mainCode.includes("ipcMain.handle('toggle-web-mode'"), 'main.js must provide toggle-web-mode IPC handler');
  assert.ok(mainCode.includes("ipcMain.handle('yt-search'"), 'main.js must provide yt-search IPC handler');
  assert.ok(mainCode.includes("ipcMain.handle('yt-resolve-stream'"), 'main.js must provide yt-resolve-stream IPC handler');
  assert.ok(mainCode.includes("app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')"), 'main.js must set autoplay-policy command line switch before whenReady');

  // 2. Verify preload.js API bridges
  const preloadPath = path.join(__dirname, '../src/preload/preload.js');
  const preloadCode = fs.readFileSync(preloadPath, 'utf8');
  assert.ok(preloadCode.includes('searchYouTube:'), 'preload.js must expose searchYouTube in dejaAPI');
  assert.ok(preloadCode.includes('toggleWebMode:'), 'preload.js must expose toggleWebMode in dejaAPI');
  assert.ok(preloadCode.includes('openGoogleLogin:'), 'preload.js must expose openGoogleLogin in dejaAPI');
  assert.ok(preloadCode.includes('resolveAudioStream:'), 'preload.js must expose resolveAudioStream in dejaAPI');

  // 3. Verify menu.js
  const menuPath = path.join(__dirname, '../src/main/menu.js');
  const menuCode = fs.readFileSync(menuPath, 'utf8');
  assert.ok(menuCode.includes('Toggle Web / Native Client Mode'), 'menu.js must include Toggle Web / Native Client Mode');

  // 4. Verify preview.html BitChord UI Components
  const htmlPath = path.join(__dirname, '../src/renderer/preview.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  assert.ok(html.includes('id="app-ambient-backdrop"'), 'Must include global dynamic ambient backdrop');
  assert.ok(html.includes('id="deja-titlebar"'), 'Must include macOS frosted window titlebar');
  assert.ok(html.includes('id="nav-back"'), 'Must include back navigation arrow');
  assert.ok(html.includes('id="nav-forward"'), 'Must include forward navigation arrow');
  assert.ok(html.includes('id="btn-toggle-web"'), 'Must include toggle web mode button');
  assert.ok(html.includes('id="yt-player-container"'), 'Must include hidden YouTube player container');
  assert.ok(html.includes('id="deja-audio-element"'), 'Must include native HTML5 deja-audio-element audio player');
  assert.ok(html.includes('class="apple-sidebar"'), 'Must include Apple sidebar navigation');
  assert.ok(html.includes('data-page="listen-now"'), 'Sidebar must include Listen Now');
  assert.ok(html.includes('data-page="browse"'), 'Sidebar must include Browse');
  assert.ok(html.includes('data-page="radio"'), 'Sidebar must include Radio');
  assert.ok(html.includes('data-page="recently-added"'), 'Sidebar must include Recently Added');
  assert.ok(html.includes('data-page="artists"'), 'Sidebar must include Artists');
  assert.ok(html.includes('data-page="albums"'), 'Sidebar must include Albums');
  assert.ok(html.includes('data-page="songs"'), 'Sidebar must include Songs');
  assert.ok(html.includes('data-page="playlists"'), 'Sidebar must include Playlists');
  assert.ok(html.includes('id="apple-player-bar"'), 'Must include frosted glass player bar');
  assert.ok(html.includes('id="player-artwork-wrapper"'), 'Must include squircle artwork wrapper');
  assert.ok(html.includes('id="btn-audio-pipeline"'), 'Must include BitChord audio pipeline badge');
  assert.ok(html.includes('id="btn-sleep-timer"'), 'Must include BitChord sleep timer button');
  assert.ok(html.includes('id="btn-equalizer"'), 'Must include BitChord equalizer button');
  assert.ok(html.includes('id="btn-lyrics-panel"'), 'Must include player bar lyrics button');
  assert.ok(html.includes('id="btn-queue-panel"'), 'Must include player bar queue button');
  assert.ok(html.includes('id="expanded-player-view"'), 'Must include expanded Now Playing page');
  assert.ok(html.includes('id="preview-ambient-aura"'), 'Expanded view must include dynamic ambient aura');
  assert.ok(html.includes('id="preview-ambient-mesh-overlay"'), 'Expanded view must include mesh overlay');
  assert.ok(html.includes('id="exp-scrubber-track"'), 'Expanded view must include scrubber slider');
  assert.ok(html.includes('id="exp-btn-play-pause"'), 'Expanded view must include play/pause button');
  assert.ok(html.includes('id="exp-playing-from"'), 'Expanded view must include Playing From header');
  assert.ok(html.includes('id="exp-btn-options"'), 'Expanded view must include options button');
  assert.ok(html.includes('id="exp-audio-pipeline-badge"'), 'Expanded view must include BitChord audio pipeline badge');
  assert.ok(html.includes('id="exp-lyric-snippet-wrap"'), 'Expanded view must include interactive synced lyric snippet preview');
  assert.ok(html.includes('id="exp-time-total"'), 'Expanded view must include negative remaining time indicator');
  assert.ok(html.includes('id="btn-expand-player"'), 'Player bar must include expand player button');
  assert.ok(!html.includes('id="sidebar-tos-pill"'), 'Sidebar must not include clunky TOS pill badge');
  assert.ok(html.includes('id="expanded-lyrics-container"'), 'Expanded view must include Now Playing lyrics container');
  assert.ok(html.includes('class="expanded-transport-row"'), 'Must include expanded transport row');
  assert.ok(html.includes('class="expanded-bottom-row"'), 'Must include expanded bottom row');
  assert.ok(html.includes('id="apple-lyrics-drawer"'), 'Must include time-synced lyrics drawer');
  assert.ok(html.includes('id="btn-close-lyrics"'), 'Must include lyrics drawer close button');
  assert.ok(html.includes('id="lyrics-backdrop"'), 'Must include lyrics drawer backdrop');
  assert.ok(html.includes('id="apple-queue-drawer"'), 'Must include Up Next queue drawer');
  assert.ok(html.includes('id="pipeline-modal"'), 'Must include audio pipeline modal');
  assert.ok(html.includes('id="sleep-modal"'), 'Must include sleep timer modal');
  assert.ok(html.includes('id="eq-modal"'), 'Must include equalizer modal');

  // 5. Verify preview.css Styling
  const cssPath = path.join(__dirname, '../src/renderer/preview.css');
  const css = fs.readFileSync(cssPath, 'utf8');

  assert.ok(css.includes('.app-ambient-backdrop'), 'CSS must style app ambient backdrop');
  assert.ok(css.includes('.deja-audio-pipeline-badge'), 'CSS must style audio pipeline badge');
  assert.ok(css.includes('.deja-sleep-timer-btn'), 'CSS must style sleep timer button');
  assert.ok(css.includes('.deja-eq-btn'), 'CSS must style equalizer button');
  assert.ok(css.includes('.deja-queue-drawer'), 'CSS must style Up Next queue drawer');
  assert.ok(css.includes('.deja-pipeline-card'), 'CSS must style audio pipeline card');
  assert.ok(css.includes('.songs-table-container'), 'CSS must style songs table');
  assert.ok(css.includes('.song-row') && css.includes('height: 52px'), 'CSS must enforce standard row height for .song-row');
  assert.ok(css.includes('.song-cell-thumb') && css.includes('width: 40px !important') && css.includes('height: 40px !important'), 'CSS must enforce 40x40px rounded squircle for song-cell-thumb');
  assert.ok(css.includes('.song-title') && css.includes('text-overflow: ellipsis'), 'CSS must enforce text-overflow: ellipsis on .song-title');
  assert.ok(css.includes('.artists-grid'), 'CSS must style artists grid');
  assert.ok(css.includes('.radio-grid'), 'CSS must style radio grid');
  assert.ok(css.includes('body.pure-black'), 'CSS must support body.pure-black theme selector');
  assert.ok(css.includes('.sidebar-tos-pill'), 'CSS must style sleek sidebar TOS pill');
  assert.ok(css.includes('.player-art-img'), 'CSS must style player bar artwork image');
  assert.ok(css.includes('.now-playing-art'), 'CSS must style now playing squircle art');
  assert.ok(css.includes('.track-card-img'), 'CSS must style catalogue track card images');
  assert.ok(css.includes('object-fit: cover !important'), 'CSS must enforce object-fit: cover to prevent aspect ratio distortion');
  assert.ok(css.includes('[src*="hqdefault"]'), 'CSS must include hqdefault scaling rule to eliminate YouTube 4:3 letterbox padding');
  assert.ok(css.includes('.expanded-lyrics-container'), 'CSS must style expanded lyrics container');
  assert.ok(css.includes('.lyrics-backdrop'), 'CSS must style lyrics drawer backdrop');
  assert.ok(css.includes('.btn-close-lyrics'), 'CSS must style lyrics drawer close button');
  assert.ok(css.includes('.apple-lyrics-drawer') && css.includes('transform: translate3d(100%, 0, 0) !important'), 'CSS must enforce off-screen translation with !important on lyrics drawer');
  assert.ok(css.includes('.deja-queue-drawer') && css.includes('transform: translate3d(100%, 0, 0) !important'), 'CSS must enforce off-screen translation with !important on queue drawer');
  assert.ok(!css.includes('.apple-lyrics-drawer,\n.deja-lyrics-drawer'), 'CSS must not override lyrics drawer translation with translateZ(0)');
  assert.ok(css.includes('.apple-lyric-line'), 'CSS must style apple-lyric-line');
  assert.ok(css.includes('text-shadow: 0 4px 20px rgba(255, 255, 255, 0.4)'), 'CSS must style active lyric line glowing text shadow');
  assert.ok(css.includes('filter: blur(0.4px)'), 'CSS must style dimmed inactive lyric lines with blur');

  const previewPath = path.join(__dirname, '../src/renderer/preview.js');
  const previewCode = fs.readFileSync(previewPath, 'utf8');
  const previewModule = require('../src/renderer/preview.js');
  const {
    CATALOGUE_TRACKS,
    EQ_PRESETS,
    escapeHTML,
    formatTime,
    shufflePlayPlaylist
  } = previewModule;

  // 6.1 Catalogue Tracks Integrity
  assert.ok(Array.isArray(CATALOGUE_TRACKS) && CATALOGUE_TRACKS.length >= 11, 'Must have at least 11 tracks');
  CATALOGUE_TRACKS.forEach((t, i) => {
    assert.ok(t.id, `Track ${i} must have id`);
    assert.ok(t.videoId, `Track ${i} (${t.title}) must have videoId for live YouTube streaming`);
    assert.ok(t.title, `Track ${i} must have title`);
    assert.ok(t.artist, `Track ${i} must have artist`);
    assert.ok(t.duration > 0, `Track ${i} must have duration > 0`);
    assert.ok(t.palette && t.palette.c1, `Track ${i} must have dynamic mesh palette`);
  });

  // 6.2 Security: escapeHTML XSS sanitization
  assert.strictEqual(
    escapeHTML('<script>alert("xss")</script>'),
    '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    'escapeHTML must escape HTML tags and quotes'
  );
  assert.strictEqual(
    escapeHTML('Starboy & "Secrets"'),
    'Starboy &amp; &quot;Secrets&quot;',
    'escapeHTML must escape ampersands and quotes'
  );
  assert.strictEqual(escapeHTML(null), '', 'escapeHTML must handle null safely');

  // 6.3 Time formatting
  assert.strictEqual(formatTime(0), '0:00', '0s must format to 0:00');
  assert.strictEqual(formatTime(9), '0:09', '9s must format to 0:09');
  assert.strictEqual(formatTime(65), '1:05', '65s must format to 1:05');
  assert.strictEqual(formatTime(215), '3:35', '215s must format to 3:35');

  // 6.4 Equalizer Presets
  assert.ok(EQ_PRESETS['Flat'], 'EQ must define Flat');
  assert.ok(EQ_PRESETS['Bass Boost'], 'EQ must define Bass Boost');
  assert.ok(EQ_PRESETS['Acoustic'], 'EQ must define Acoustic');
  assert.ok(EQ_PRESETS['Vocal Booster'], 'EQ must define Vocal Booster');
  assert.ok(EQ_PRESETS['Treble Booster'], 'EQ must define Treble Booster');

  // 6.5 Playlist shuffle function existence
  assert.strictEqual(typeof shufflePlayPlaylist, 'function', 'shufflePlayPlaylist must be a defined function');
  assert.strictEqual(typeof previewModule.resolveAndPlayTrack, 'function', 'resolveAndPlayTrack must be a defined function');
  assert.strictEqual(typeof previewModule.fallbackToIFrame, 'function', 'fallbackToIFrame must be a defined function');

  // 6.6 LRCLIB & Synced Lyrics Engine (LrcLib.kt & PlayerLyrics.kt)
  const innertube = require('../src/main/innertube.js');
  assert.strictEqual(typeof innertube.parseLrcString, 'function', 'innertube must export parseLrcString');
  assert.strictEqual(typeof innertube.cleanSearchTerm, 'function', 'innertube must export cleanSearchTerm');
  assert.strictEqual(typeof innertube.getLyrics, 'function', 'innertube must export getLyrics');

  // Test cleanSearchTerm
  assert.strictEqual(
    innertube.cleanSearchTerm('Cruel Summer (Official Music Video)'),
    'Cruel Summer'
  );
  assert.strictEqual(
    innertube.cleanSearchTerm('Starboy [Official Lyric Video] ft. Daft Punk'),
    'Starboy'
  );
  assert.strictEqual(
    innertube.cleanSearchTerm('Blinding Lights (Live at SoFi Stadium)'),
    'Blinding Lights'
  );
  assert.strictEqual(
    innertube.cleanSearchTerm('Superman (feat. Din...)'),
    'Superman'
  );
  assert.strictEqual(
    innertube.cleanSearchTerm('Superman (feat. Din...'),
    'Superman'
  );
  assert.strictEqual(
    innertube.cleanSearchTerm('Superman (feat. Dina Rae)'),
    'Superman'
  );
  assert.strictEqual(
    innertube.cleanSearchTerm('Superman (Remastered)'),
    'Superman'
  );
  assert.strictEqual(
    innertube.cleanSearchTerm('Superman [Official Video]'),
    'Superman'
  );
  assert.strictEqual(
    innertube.cleanSearchTerm('Get Lucky (with Pharrell Williams)'),
    'Get Lucky'
  );
  assert.strictEqual(
    innertube.cleanSearchTerm('Song Name with Collaborator'),
    'Song Name'
  );
  assert.strictEqual(
    innertube.cleanSearchTerm('"Superman"'),
    'Superman'
  );
  assert.strictEqual(
    innertube.cleanSearchTerm('“Superman”'),
    'Superman'
  );
  assert.strictEqual(
    innertube.cleanSearchTerm('Superman • Eminem Show'),
    'Superman'
  );
  assert.strictEqual(
    previewModule.cleanSearchTerm('Superman (feat. Din...)'),
    'Superman'
  );
  assert.strictEqual(
    previewModule.cleanSearchTerm('Get Lucky (with Pharrell Williams)'),
    'Get Lucky'
  );
  assert.strictEqual(
    previewModule.cleanSearchTerm('"Superman"'),
    'Superman'
  );

  // Test cleanArtistTerm and getPrimaryArtist
  assert.strictEqual(
    innertube.cleanArtistTerm('Eminem • The Eminem Show'),
    'Eminem'
  );
  assert.strictEqual(
    innertube.getPrimaryArtist('Eminem, Dina Rae'),
    'Eminem'
  );

  // Test parseLrcString
  const sampleLrc = `
[ti:Cruel Summer]
[ar:Taylor Swift]
[00:00.72]Fever dream high in the quiet of the night
[00:04.15]You know that I caught it
[00:09.80]Bad, bad boy, shiny toy with a price
`;
  const parsedLrc = innertube.parseLrcString(sampleLrc);
  assert.strictEqual(parsedLrc.length, 3);
  assert.strictEqual(parsedLrc[0].time, 0.72);
  assert.strictEqual(parsedLrc[0].text, 'Fever dream high in the quiet of the night');
  assert.strictEqual(parsedLrc[1].time, 4.15);
  assert.strictEqual(parsedLrc[2].time, 9.8);

  // Test intro gap insertion (if first lyric starts after 5s)
  const lateLrc = `[00:08.50]Late intro starts here`;
  const parsedLate = innertube.parseLrcString(lateLrc);
  assert.strictEqual(parsedLate.length, 2);
  assert.strictEqual(parsedLate[0].time, 0);
  assert.strictEqual(parsedLate[0].text, '♪');
  assert.strictEqual(parsedLate[1].time, 8.5);

  // 6.7 Preview Synced Lyrics Engine & Dynamic Clock Computation
  assert.strictEqual(typeof previewModule.parseLrcLines, 'function', 'previewModule must export parseLrcLines');
  assert.strictEqual(typeof previewModule.resolveSyncedLyrics, 'function', 'previewModule must export resolveSyncedLyrics');
  assert.strictEqual(typeof previewModule.updateLiveLyrics, 'function', 'previewModule must export updateLiveLyrics');
  assert.strictEqual(typeof previewModule.renderLyrics, 'function', 'previewModule must export renderLyrics');
  assert.strictEqual(typeof previewModule.toggleNowPlayingLyrics, 'function', 'previewModule must export toggleNowPlayingLyrics');
  assert.strictEqual(typeof previewModule.seekTo, 'function', 'previewModule must export seekTo');

  const previewParsed = previewModule.parseLrcLines(sampleLrc);
  assert.strictEqual(previewParsed.length, 3);
  assert.strictEqual(previewParsed[0].time, 0.72);
  assert.strictEqual(previewParsed[0].text, 'Fever dream high in the quiet of the night');

  // Verify dynamic active lyric calculation: timestamp <= currentTime < nextTimestamp
  const testLyrics = [
    { time: 0, text: 'Intro' },
    { time: 10, text: 'First verse' },
    { time: 25, text: 'Chorus' },
    { time: 40, text: 'Outro' }
  ];

  function computeActiveLyricIndex(lyrics, curTime) {
    let activeIdx = -1;
    for (let i = 0; i < lyrics.length; i++) {
      const lineTime = lyrics[i].time;
      const nextTime = (i + 1 < lyrics.length) ? lyrics[i + 1].time : Infinity;
      if (curTime >= lineTime && curTime < nextTime) {
        activeIdx = i;
        break;
      }
    }
    return activeIdx;
  }

  assert.strictEqual(computeActiveLyricIndex(testLyrics, 0), 0);
  assert.strictEqual(computeActiveLyricIndex(testLyrics, 5.5), 0);
  assert.strictEqual(computeActiveLyricIndex(testLyrics, 10.0), 1);
  assert.strictEqual(computeActiveLyricIndex(testLyrics, 24.99), 1);
  assert.strictEqual(computeActiveLyricIndex(testLyrics, 25.0), 2);
  assert.strictEqual(computeActiveLyricIndex(testLyrics, 39.99), 2);
  assert.strictEqual(computeActiveLyricIndex(testLyrics, 50.0), 3);

  // 6.8 Fast-Frequency Lyric Clock & Expanded Controls Single-Invocation
  assert.strictEqual(typeof previewModule.startLyricClock, 'function', 'previewModule must export startLyricClock');
  assert.strictEqual(typeof previewModule.stopLyricClock, 'function', 'previewModule must export stopLyricClock');
  assert.strictEqual(typeof previewModule.tickLyricClock, 'function', 'previewModule must export tickLyricClock');

  // Verify Expanded Player Button Single Click Invocations and State Toggling
  const originalDoc = global.document;
  try {
    const mockElements = {};
    const createMockElement = (id, classNames = '') => {
      const classes = new Set(classNames.split(' ').filter(Boolean));
      return {
        id,
        className: classNames,
        classList: {
          contains: (cls) => classes.has(cls),
          add: (cls) => classes.add(cls),
          remove: (cls) => classes.delete(cls),
          toggle: (cls, force) => {
            const shouldAdd = force !== undefined ? !!force : !classes.has(cls);
            if (shouldAdd) classes.add(cls); else classes.delete(cls);
            return shouldAdd;
          }
        },
        style: {},
        innerHTML: '',
        innerText: '',
        querySelectorAll: () => [],
        onclick: null,
        addEventListener: function(event, fn) {
          this._listeners = this._listeners || {};
          this._listeners[event] = this._listeners[event] || [];
          this._listeners[event].push(fn);
        }
      };
    };

    const expBtnShuffle = createMockElement('exp-btn-shuffle', 'exp-sub-btn exp-shuffle-btn');
    const expBtnRepeat = createMockElement('exp-btn-repeat', 'exp-sub-btn exp-repeat-btn');
    const expBtnLyrics = createMockElement('exp-btn-lyrics', 'exp-sub-btn exp-lyrics-btn');
    const expBtnQueue = createMockElement('exp-btn-queue', 'exp-sub-btn exp-queue-btn');
    const lyricsContainer = createMockElement('expanded-lyrics-container');
    lyricsContainer.style.display = 'none';
    const artContainer = createMockElement('now-playing-art-wrap');
    artContainer.style.display = 'block';
    const queueDrawer = createMockElement('apple-queue-drawer');
    const lyricSnippet = createMockElement('exp-lyric-snippet-text');

    mockElements['exp-btn-shuffle'] = expBtnShuffle;
    mockElements['exp-btn-repeat'] = expBtnRepeat;
    mockElements['exp-btn-lyrics'] = expBtnLyrics;
    mockElements['exp-btn-queue'] = expBtnQueue;
    mockElements['expanded-lyrics-container'] = lyricsContainer;
    mockElements['now-playing-art-wrap'] = artContainer;
    mockElements['apple-queue-drawer'] = queueDrawer;
    mockElements['exp-lyric-snippet-text'] = lyricSnippet;

    global.document = {
      createElement: (tag) => createMockElement(`mock-${tag}`),
      body: {
        appendChild: () => {}
      },
      getElementById: (id) => mockElements[id] || null,
      querySelector: (sel) => {
        if (sel === '.exp-shuffle-btn') return expBtnShuffle;
        if (sel === '.exp-repeat-btn') return expBtnRepeat;
        if (sel === '.exp-lyrics-btn') return expBtnLyrics;
        if (sel === '.exp-queue-btn') return expBtnQueue;
        if (sel === '.exp-lyric-snippet-text') return lyricSnippet;
        return null;
      },
      querySelectorAll: () => []
    };

    // Test toggleShuffle: 1st invocation turns on, 2nd invocation turns off
    let shuffleInvocations = 0;
    const testShuffleClick = () => {
      shuffleInvocations++;
      previewModule.toggleShuffle();
    };
    testShuffleClick();
    assert.strictEqual(shuffleInvocations, 1, 'Shuffle click handler must execute exactly once per click');
    assert.ok(expBtnShuffle.classList.contains('active'), 'Shuffle must be active after 1st click');
    assert.strictEqual(expBtnShuffle.style.color, '#FA2D48');

    testShuffleClick();
    assert.strictEqual(shuffleInvocations, 2, 'Shuffle click handler must execute exactly twice after two clicks');
    assert.ok(!expBtnShuffle.classList.contains('active'), 'Shuffle must be inactive after 2nd click');

    // Test toggleNowPlayingLyrics: 1st invocation displays lyrics, 2nd hides lyrics
    previewModule.toggleNowPlayingLyrics();
    assert.strictEqual(lyricsContainer.style.display, 'flex', 'Lyrics container must display on 1st toggle');
    assert.strictEqual(artContainer.style.display, 'none', 'Artwork container must hide on 1st toggle');
    assert.ok(expBtnLyrics.classList.contains('active'), 'Lyrics button must be active');

    previewModule.toggleNowPlayingLyrics();
    assert.strictEqual(lyricsContainer.style.display, 'none', 'Lyrics container must hide on 2nd toggle');
    assert.strictEqual(artContainer.style.display, 'block', 'Artwork container must restore on 2nd toggle');
    assert.ok(!expBtnLyrics.classList.contains('active'), 'Lyrics button must be inactive');

    // Test preview lyric capsule formatting: never bare '♪'
    lyricSnippet.innerText = '';
    previewModule.updateSyncedLyrics();
    assert.ok(lyricSnippet.innerText !== '♪', 'Preview snippet text must never be bare ♪');
    assert.ok(lyricSnippet.innerText.length > 0, 'Preview snippet text must be populated');

    // Test toggleQueue: 1st invocation displays queue drawer, 2nd hides queue drawer
    previewModule.toggleQueue();
    assert.ok(queueDrawer.classList.contains('visible'), 'Queue drawer must be visible after 1st toggle');
    assert.ok(expBtnQueue.classList.contains('active'), 'Queue button must be active after 1st toggle');
    assert.strictEqual(expBtnQueue.style.color, '#FA2D48', 'Queue button must have red active color');
    assert.strictEqual(expBtnQueue.style.backgroundColor, 'rgba(250, 45, 72, 0.18)', 'Queue button must have active pill background');

    previewModule.toggleQueue();
    assert.ok(!queueDrawer.classList.contains('visible'), 'Queue drawer must be hidden after 2nd toggle');
    assert.ok(!expBtnQueue.classList.contains('active'), 'Queue button must be inactive after 2nd toggle');
    assert.strictEqual(expBtnQueue.style.color, '', 'Queue button color must be cleared after 2nd toggle');
    assert.strictEqual(expBtnQueue.style.backgroundColor, '', 'Queue button background must be cleared after 2nd toggle');
  } finally {
    global.document = originalDoc;
  }

  // 7. Verify Discord RPC Multi-Pipe Scanning and Activity Protocol
  const discord = require('../src/main/discord.js');
  const discordPath = path.join(__dirname, '../src/main/discord.js');
  const discordCode = fs.readFileSync(discordPath, 'utf8');

  assert.ok(discordCode.includes('463097721130188830'), 'Discord RPC must use verified YouTube Music RPC Client ID');
  assert.strictEqual(typeof discord.getPipePaths, 'function', 'Discord instance must implement getPipePaths');
  assert.strictEqual(typeof discord.updateActivity, 'function', 'Discord instance must implement updateActivity');
  assert.strictEqual(typeof discord.updateTrack, 'function', 'Discord instance must implement updateTrack');

  const pipePaths0 = discord.getPipePaths(0);
  assert.ok(Array.isArray(pipePaths0) && pipePaths0.length > 0, 'getPipePaths(0) must return valid path array');
  assert.ok(pipePaths0.some(p => p.includes('discord-ipc-0')), 'Pipe paths for index 0 must reference discord-ipc-0');

  const pipePaths3 = discord.getPipePaths(3);
  assert.ok(pipePaths3.some(p => p.includes('discord-ipc-3')), 'Pipe paths for index 3 must reference discord-ipc-3');

  // Test Discord Activity data preparation
  discord.updateActivity({
    title: 'Cruel Summer',
    artist: 'Taylor Swift',
    album: 'Lover',
    duration: 178,
    currentTime: 25,
    remainingTime: 153,
    artworkUrl: 'https://i.ytimg.com/vi/ic8j13U_6_8/maxresdefault.jpg',
    isPlaying: true,
    isAd: false
  });

  assert.ok(discord.pendingActivity || discord.currentActivity, 'Activity must be cached in pending or current activity');
  const activeActivity = discord.pendingActivity || discord.currentActivity;
  assert.strictEqual(activeActivity.title, 'Cruel Summer');
  assert.strictEqual(activeActivity.artist, 'Taylor Swift');
  assert.strictEqual(activeActivity.remainingTime, 153);

  // Test Ad state
  discord.updateActivity({
    title: 'Ad',
    artist: '',
    duration: 30,
    currentTime: 5,
    isAd: true,
    isPlaying: true
  });
  assert.strictEqual(discord.pendingActivity.isAd, true, 'Ad state must be reflected in pending activity');

  // 8. Verify Google Login Window, Security Blocking Prevention & Auth Synchronization
  assert.ok(mainCode.includes('ServiceLogin?continue=https%3A%2F%2Fmusic.youtube.com%2F'), 'main.js must load Google ServiceLogin with music.youtube.com continue URL');
  assert.ok(mainCode.includes("loginWin.webContents.on('did-navigate'"), 'main.js must listen for did-navigate on loginWin');
  assert.ok(mainCode.includes("loginWin.webContents.on('did-navigate-in-page'"), 'main.js must listen for did-navigate-in-page on loginWin');
  assert.ok(mainCode.includes("'auth-changed'"), 'main.js must send auth-changed IPC event to mainWindow');
  assert.ok(mainCode.includes("replace(/Electron\\/[0-9\\.]+\\s*/gi"), 'main.js must strip Electron tokens from all request headers');
  assert.ok(mainCode.includes("requestHeaders['Sec-Ch-Ua-Platform'] = '\"Windows\"'"), 'main.js must provide standard Windows Client Hint platform');
  assert.ok(mainCode.includes("requestHeaders['Sec-Ch-Ua-Full-Version-List']"), 'main.js must provide canonical Sec-Ch-Ua-Full-Version-List client hints');
  assert.ok(mainCode.includes("details.url.includes('accounts.google.com')"), 'main.js must safeguard accounts.google.com security headers');
  assert.ok(mainCode.includes("details.url.includes('accounts.youtube.com')"), 'main.js must safeguard accounts.youtube.com security headers');

  // Verify preload.js listens to auth-changed
  assert.ok(preloadCode.includes("ipcRenderer.on('auth-changed'"), 'preload.js must listen for auth-changed IPC event');

  // Verify preview.js exports and updateAccountUI
  assert.strictEqual(typeof previewModule.updateAccountUI, 'function', 'preview.js must export updateAccountUI');
  assert.strictEqual(typeof previewModule.updateSidebarPlaylistsUI, 'function', 'preview.js must export updateSidebarPlaylistsUI');

  // Test updateAccountUI with mocked DOM elements
  const prevDoc = global.document;
  try {
    global.document = {
      getElementById: (id) => {
        if (!global.document._store[id]) {
          global.document._store[id] = {
            style: {},
            querySelector: () => ({ innerText: '' })
          };
        }
        return global.document._store[id];
      },
      querySelectorAll: () => [],
      _store: {}
    };

    // Test logged-in state
    previewModule.updateAccountUI({
      isLoggedIn: true,
      channelTitle: 'Deja Google Artist',
      avatarUrl: 'https://lh3.googleusercontent.com/test-photo.jpg'
    });
    assert.strictEqual(global.document.getElementById('user-pill-text').innerText, 'Deja Google Artist', 'Pill text must display channel name');
    assert.strictEqual(global.document.getElementById('user-avatar-img').src, 'https://lh3.googleusercontent.com/test-photo.jpg', 'Avatar image src must match Google photo');
    assert.strictEqual(global.document.getElementById('user-avatar-img').style.display, 'inline-block');

    // Test logged-out state
    previewModule.updateAccountUI({
      isLoggedIn: false
    });
    assert.strictEqual(global.document.getElementById('user-pill-text').innerText, 'Sign In');
    assert.strictEqual(global.document.getElementById('user-avatar-img').style.display, 'none');
    assert.strictEqual(global.document.getElementById('user-avatar-text').innerText, 'G');
  } finally {
    global.document = prevDoc;
  }

  // Verify InnerTube parses responsive library playlist items
  const innertubeModule = require('../src/main/innertube.js');
  if (typeof innertubeModule.parseLibraryPlaylistsResponse === 'function') {
    const mockResponsivePls = {
      contents: [{
        musicResponsiveListItemRenderer: {
          flexColumns: [
            {
              musicResponsiveListItemFlexColumnRenderer: {
                text: { runs: [{ text: 'Chill Mix', navigationEndpoint: { browseEndpoint: { browseId: 'VLPLchill123' } } }] }
              }
            }
          ]
        }
      }]
    };
    const parsedPls = innertubeModule.parseLibraryPlaylistsResponse(mockResponsivePls);
    assert.ok(parsedPls.some(p => p.browseId === 'VLPLchill123'), 'Must parse responsive playlist list items');
  }

  // 9. Verify Apple Fluid Animations, Independent Google OAuth Window, and Custom Playlists
  // 9.1 CSS Animation and Fluidity
  assert.ok(css.includes('--apple-ease: cubic-bezier(0.16, 1, 0.3, 1)'), 'CSS must define Apple signature easing curve');
  assert.ok(css.includes('scroll-behavior: smooth !important'), 'CSS must enforce momentum smooth scrolling');
  assert.ok(css.includes('will-change: transform, opacity;'), 'CSS must promote GPU layers on animated surfaces');
  assert.ok(css.includes('transform: translate3d(0, 100%, 0)'), 'CSS must use hardware-accelerated translate3d for Now Playing slide-up view');
  assert.ok(css.includes('z-index: 100050'), 'Modal backdrop must be elevated above expanded player view');
  assert.ok(css.includes('z-index: 10002'), 'Queue drawer must be layered above expanded player view');
  assert.ok(css.includes('z-index: 100020 !important'), 'Queue drawer must have z-index: 100020 !important to sit above expanded player view');
  assert.ok(css.includes('z-index: 100010'), 'Options menu must have z-index: 100010 to sit above artwork');
  assert.ok(css.includes('z-index: 100000'), 'Expanded player header must have elevated z-index');
  assert.ok(css.includes('contain: layout paint;'), 'CSS must include contain: layout paint to prevent layout thrashing');
  assert.ok(html.includes('now-playing-options-menu'), 'preview.html must include now-playing-options-menu class');
  assert.ok(html.includes('now-playing-art-wrap'), 'preview.html must include now-playing-art-wrap class');
  assert.ok(html.includes('id="now-playing-art-wrap"'), 'preview.html must include id="now-playing-art-wrap"');
  const appleThemePath = path.join(__dirname, '../src/preload/apple-theme.css');
  const appleThemeCss = fs.readFileSync(appleThemePath, 'utf8');
  assert.ok(!appleThemeCss.includes('animation: dejaArtworkBreathing 7s infinite'), 'apple-theme.css must not run infinite artwork breathing animation');
  assert.ok(appleThemeCss.includes('z-index: 100020 !important'), 'apple-theme.css must enforce z-index: 100020 !important for queue drawer');

  // 9.2 Independent Google Login Window Architecture
  assert.ok(!mainCode.includes('parent: mainWindow, modal: true'), 'Login window must NOT use parent or modal to prevent Google embedded webview detection');
  assert.ok(mainCode.includes("Object.defineProperty(navigator, 'webdriver'"), 'main.js must inject stealth webdriver evasion into login window');
  assert.ok(mainCode.includes("https://music.youtube.com"), 'main.js must support direct YouTube Music sign-in route');
  assert.ok(mainCode.includes("curUrl.includes('accounts.google.')"), 'main.js must prevent closing login window while user is still on Google auth');
  assert.ok(mainCode.includes("disable-blink-features") && mainCode.includes("AutomationControlled"), 'main.js must disable AutomationControlled blink feature');
  assert.ok(mainCode.includes('width: 800') && mainCode.includes('height: 700'), 'main.js must create 800x700 login window');
  assert.ok(mainCode.includes('pollInterval'), 'main.js must actively poll for authentication cookies');
  assert.ok(mainCode.includes('injectLoginHeader'), 'main.js must inject visible login header');
  assert.ok(mainCode.includes('Sign in to YouTube Music'), 'main.js header must have Sign in to YouTube Music title');
  assert.ok(mainCode.includes('Done / Sync My Account'), 'main.js header must have Done / Sync My Account button');
  assert.ok(mainCode.includes('Load music.youtube.com'), 'main.js header must have Load music.youtube.com button');
  assert.ok(mainCode.includes("backgroundColor: '#ffffff'"), 'main.js must set white background on login window to avoid black void');
  assert.ok(mainCode.includes("domain: '.google.com'"), 'main.js must capture cookies on Google domains as well as YouTube');
  assert.ok(mainCode.includes('hasGoogleAuthCookie'), 'main.js must track Google authentication cookies');
  assert.ok(preloadCode.includes("openGoogleLogin: (targetMethod) =>"), 'preload.js must forward targetMethod parameter in openGoogleLogin bridge');
  assert.ok(mainCode.includes('isGoogleAuthRequest'), 'main.js must implement isGoogleAuthRequest to safeguard all Google auth endpoints');
  assert.ok(mainCode.includes('gstatic.com') && mainCode.includes('googleapis.com'), 'main.js must safeguard gstatic and googleapis subresources for Google auth');
  assert.ok(mainCode.includes('youtube.com/signin') && mainCode.includes('consent.youtube.'), 'main.js must safeguard youtube signin and consent endpoints');
  assert.ok(mainCode.includes('isEmbedOrMedia'), 'main.js must only mutate response headers on player media streaming and embed iframes');
  assert.ok(!mainCode.includes('header.innerHTML ='), 'main.js must not set innerHTML on login header to strictly comply with Trusted Types');
  assert.ok(mainCode.includes('sandbox: true'), 'main.js must enforce sandbox: true on login window webPreferences');
  assert.ok(mainCode.includes('CHROME_METADATA'), 'main.js must define CHROME_METADATA matching standard Windows Chrome 131');
  assert.ok(mainCode.includes('DEJA_LOAD_YTM'), 'main.js must handle DEJA_LOAD_YTM to cleanly load music.youtube.com from header button');

  // 9.3 HTML Custom Playlists Components
  assert.ok(html.includes('id="btn-sidebar-new-playlist"'), 'HTML must provide "+ New Playlist" button in sidebar');
  assert.ok(html.includes('id="sidebar-custom-playlists-container"'), 'HTML must provide sidebar custom playlists container');
  assert.ok(html.includes('id="create-playlist-modal"'), 'HTML must provide create playlist modal');
  assert.ok(html.includes('id="add-to-playlist-modal"'), 'HTML must provide add to playlist modal');
  assert.ok(html.includes('id="opt-add-to-playlist"'), 'Now playing dropdown must include add to playlist option');
  assert.ok(previewCode.includes("cfg.customPlaylists"), 'preview.js must hydrate custom playlists from persistent config on startup');

  // 9.4 Functional Custom Playlist CRUD Logic
  const {
    createCustomPlaylist,
    deleteCustomPlaylist,
    addTrackToCustomPlaylist,
    removeTrackFromCustomPlaylist,
    customPlaylists
  } = previewModule;

  assert.strictEqual(typeof createCustomPlaylist, 'function', 'preview.js must export createCustomPlaylist');
  assert.strictEqual(typeof deleteCustomPlaylist, 'function', 'preview.js must export deleteCustomPlaylist');
  assert.strictEqual(typeof addTrackToCustomPlaylist, 'function', 'preview.js must export addTrackToCustomPlaylist');
  assert.strictEqual(typeof removeTrackFromCustomPlaylist, 'function', 'preview.js must export removeTrackFromCustomPlaylist');

  const testPl = createCustomPlaylist('Unit Test Jams', 'Created during architecture test');
  assert.ok(testPl && testPl.id && testPl.id.startsWith('custom-'), 'Created playlist must have valid custom ID');
  assert.strictEqual(testPl.title, 'Unit Test Jams');
  assert.strictEqual(testPl.tracks.length, 0);

  const sampleTrack = { id: 'test-trk-1', title: 'Test Song', artist: 'Test Artist', duration: 180 };
  const addRes1 = addTrackToCustomPlaylist(testPl.id, sampleTrack);
  assert.strictEqual(addRes1, true, 'First track addition must succeed');
  assert.strictEqual(testPl.tracks.length, 1);
  assert.strictEqual(testPl.tracks[0].id, 'test-trk-1');

  // Duplicate prevention check
  const addRes2 = addTrackToCustomPlaylist(testPl.id, sampleTrack);
  assert.strictEqual(addRes2, false, 'Adding duplicate track must return false');
  assert.strictEqual(testPl.tracks.length, 1);

  // Remove track
  removeTrackFromCustomPlaylist(testPl.id, 'test-trk-1');
  assert.strictEqual(testPl.tracks.length, 0);

  // Delete playlist
  deleteCustomPlaylist(testPl.id);
  assert.ok(!customPlaylists.some(p => p.id === testPl.id), 'Deleted playlist must be removed from customPlaylists array');

  // Verify lyrics drawer exports
  assert.strictEqual(typeof previewModule.openLyricsDrawer, 'function', 'preview.js must export openLyricsDrawer');
  assert.strictEqual(typeof previewModule.closeLyricsDrawer, 'function', 'preview.js must export closeLyricsDrawer');
  assert.strictEqual(typeof previewModule.toggleLyricsDrawer, 'function', 'preview.js must export toggleLyricsDrawer');

  console.log('✓ Native BitChord & Apple Client Architecture tests passed successfully.');
}

module.exports = runBitChordArchitectureTests;

if (require.main === module) {
  runBitChordArchitectureTests();
}

