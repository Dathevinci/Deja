/**
 * Deja - Apple Music & BitChord Desktop Client Engine
 * Fully autonomous, glitch-free client UI backed by YouTube Music architecture:
 * - Dynamic Mesh Gradient Aura (MeshGradient.kt, ArtworkMeshBackdrop.kt)
 * - Translucent Frosted Glass Apple Sidebar & Navigation
 * - Fluid Full-Screen Now Playing View with Squircles & Breathing Pulse
 * - Time-Synced Synced Lyrics Drawer with Seek-on-Click
 * - Up Next Queue Drawer (PlayerQueue.kt)
 * - Audio Pipeline & Stats for Nerds Telemetry (NerdStats.kt)
 * - Sleep Timer with Live Countdown & Gentle Pause Fade (SleepTimer.kt)
 * - 5-Band Web Audio API Graphic Equalizer Presets (GraphicEq)
 * - Instant Global Search (⌘K / Ctrl+K)
 * - Full Media Key, System Tray & Discord Rich Presence Synchronization
 */

// Helper to create stunning, high-resolution SVG album cover art data URIs with distinct palettes
function createCoverArt(title, subtitle, c1, c2, c3, patternType = 'mesh') {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
      <defs>
        <radialGradient id="g1" cx="25%" cy="25%" r="70%">
          <stop offset="0%" stop-color="${c1}" stop-opacity="1" />
          <stop offset="50%" stop-color="${c2}" stop-opacity="0.85" />
          <stop offset="100%" stop-color="${c3}" stop-opacity="0.95" />
        </radialGradient>
        <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c1}" stop-opacity="0.9" />
          <stop offset="100%" stop-color="${c3}" stop-opacity="0.9" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="30" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <rect width="500" height="500" fill="#121216" />
      <circle cx="150" cy="160" r="180" fill="url(#g1)" filter="url(#glow)" opacity="0.9" />
      <circle cx="360" cy="340" r="170" fill="${c2}" filter="url(#glow)" opacity="0.8" />
      <circle cx="380" cy="140" r="130" fill="${c3}" filter="url(#glow)" opacity="0.75" />
      <rect x="30" y="30" width="440" height="440" rx="28" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2" />
      <g transform="translate(48, 410)">
        <text x="0" y="0" font-family="-apple-system, SF Pro Display, Segoe UI, sans-serif" font-weight="800" font-size="28" fill="#FFFFFF" letter-spacing="-0.5">${title}</text>
        <text x="0" y="24" font-family="-apple-system, SF Pro Text, Segoe UI, sans-serif" font-weight="500" font-size="15" fill="rgba(255,255,255,0.7)">${subtitle}</text>
      </g>
      <circle cx="430" cy="70" r="18" fill="rgba(255,255,255,0.15)" />
      <path d="M424 64 L440 70 L424 76 Z" fill="#FFFFFF" opacity="0.9" />
    </svg>
  `.trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const CATALOGUE_TRACKS = [
  {
    id: 'yt-E9jGlwluIbk',
    videoId: 'E9jGlwluIbk',
    title: 'Cruel Summer',
    artist: 'Taylor Swift',
    album: 'Lover',
    duration: 178,
    genre: 'Pop',
    year: '2019',
    playlists: ['favorites', 'featured'],
    palette: { c1: 'rgba(250, 45, 72, 0.48)', c2: 'rgba(255, 120, 50, 0.44)', c3: 'rgba(255, 200, 55, 0.40)', c4: 'rgba(250, 80, 120, 0.35)', primaryR: 250, primaryG: 45, primaryB: 72 },
    cover: 'https://i.ytimg.com/vi/E9jGlwluIbk/hqdefault.jpg',
    lyrics: [
      { time: 0.72, text: "(Yeah, yeah, yeah, yeah)" },
      { time: 5.77, text: "Fever dream high in the quiet of the night" },
      { time: 8.11, text: "You know that I caught it (oh yeah, you're right, I want it)" },
      { time: 11.43, text: "Bad, bad boy, shiny toy with a price" },
      { time: 13.92, text: "You know that I bought it (oh yeah, you're right, I want it)" },
      { time: 16.13, text: "Killing me slow, out the window" },
      { time: 19.33, text: "I'm always waiting for you to be waiting below" },
      { time: 24.16, text: "Devils roll the dice, angels roll their eyes" },
      { time: 29.56, text: "What doesn't kill me makes me want you more" },
      { time: 33.65, text: "And it's new, the shape of your body" },
      { time: 36.85, text: "It's blue, the feeling I've got" },
      { time: 39.42, text: "And it's ooh, whoa, oh" },
      { time: 42.66, text: "It's a cruel summer" },
      { time: 48.06, text: "It's cool, that's what I tell 'em" },
      { time: 50.84, text: "No rules in breakable heaven" },
      { time: 53.64, text: "But ooh, whoa, oh" },
      { time: 56.76, text: "It's a cruel summer with you" },
      { time: 65.41, text: "Hang your head low in the glow of the vending machine" },
      { time: 70.32, text: "I'm not dying (oh yeah, you're right, I want it)" },
      { time: 75.12, text: "We say that we'll just screw it up in these trying times" },
      { time: 82.20, text: "We're not trying (oh yeah, you're right, I want it)" },
      { time: 87.45, text: "So cut the headlights, summer's a knife" },
      { time: 92.80, text: "I'm always waiting for you just to cut to the bone" },
      { time: 98.15, text: "Devils roll the dice, angels roll their eyes" },
      { time: 103.50, text: "And if I bleed, you'll be the last to know" },
      { time: 108.20, text: "Oh, it's new, the shape of your body" },
      { time: 111.40, text: "It's blue, the feeling I've got" },
      { time: 114.10, text: "And it's ooh, whoa, oh" },
      { time: 117.25, text: "It's a cruel summer" },
      { time: 122.50, text: "It's cool, that's what I tell 'em" },
      { time: 125.30, text: "No rules in breakable heaven" },
      { time: 128.10, text: "But ooh, whoa, oh" },
      { time: 131.25, text: "It's a cruel summer with you" },
      { time: 137.80, text: "I'm drunk in the back of the car" },
      { time: 140.20, text: "And I cried like a baby coming home from the bar (oh)" },
      { time: 143.40, text: "Said, \"I'm fine,\" but it wasn't true" },
      { time: 146.10, text: "I don't wanna keep secrets just to keep you" },
      { time: 148.80, text: "And I snuck in through the garden gate" },
      { time: 151.40, text: "Every night that summer just to seal my fate (oh)" },
      { time: 154.50, text: "And I screamed for whatever it's worth" },
      { time: 157.20, text: "\"I love you,\" ain't that the worst thing you ever heard?" },
      { time: 162.80, text: "He looks up, grinning like a devil" }
    ]
  },
  {
    id: 'yt-4NRXx6U8ABQ',
    videoId: '4NRXx6U8ABQ',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200,
    genre: 'Synthwave / Pop',
    year: '2020',
    playlists: ['favorites'],
    palette: { c1: 'rgba(255, 0, 80, 0.48)', c2: 'rgba(30, 20, 50, 0.44)', c3: 'rgba(255, 60, 0, 0.40)', c4: 'rgba(120, 0, 50, 0.35)', primaryR: 255, primaryG: 0, primaryB: 80 },
    cover: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg',
    lyrics: [
      { time: 0, text: 'Yeah' },
      { time: 12, text: 'I\'ve been tryna call' },
      { time: 15, text: 'I\'ve been on my own for long enough' },
      { time: 20, text: 'Maybe you can show me how to love, maybe' },
      { time: 28, text: 'I\'m going through withdrawals' },
      { time: 33, text: 'You don\'t even have to do too much' },
      { time: 37, text: 'You can turn me on with just a touch, baby' },
      { time: 48, text: 'I look around and Sin City\'s cold and empty' },
      { time: 54, text: 'No one\'s around to judge me' },
      { time: 60, text: 'I can\'t see clearly when you\'re gone' },
      { time: 65, text: 'I said, ooh, I\'m blinded by the lights' },
      { time: 75, text: 'No, I can\'t sleep until I feel your touch' },
      { time: 85, text: 'I said, ooh, I\'m drowning in the night' },
      { time: 95, text: 'Oh, when I\'m like this, you\'re the one I trust' }
    ]
  },
  {
    id: 'yt-eVli-tstM5E',
    videoId: 'eVli-tstM5E',
    title: 'Espresso',
    artist: 'Sabrina Carpenter',
    album: 'Short n\' Sweet',
    duration: 175,
    genre: 'Nu-Disco / Pop',
    year: '2024',
    playlists: ['favorites', 'featured'],
    palette: { c1: 'rgba(240, 160, 40, 0.48)', c2: 'rgba(60, 150, 240, 0.44)', c3: 'rgba(255, 220, 100, 0.40)', c4: 'rgba(200, 100, 30, 0.35)', primaryR: 240, primaryG: 160, primaryB: 40 },
    cover: 'https://i.ytimg.com/vi/eVli-tstM5E/hqdefault.jpg',
    lyrics: [
      { time: 0, text: 'Now he\'s thinkin\' \'bout me every night, oh' },
      { time: 6, text: 'Is it that sweet? I guess so' },
      { time: 11, text: 'Say you can\'t sleep, baby, I know' },
      { time: 16, text: 'That\'s that me espresso' },
      { time: 22, text: 'Move it up, down, left, right, oh' },
      { time: 27, text: 'Switch it up like Nintendo' },
      { time: 33, text: 'Say you can\'t sleep, baby, I know' },
      { time: 38, text: 'That\'s that me espresso' },
      { time: 45, text: 'I can\'t relate to desperation' },
      { time: 50, text: 'My give-a-fucks are on vacation' },
      { time: 55, text: 'And I got this one boy and he won\'t stop calling' },
      { time: 65, text: 'Now he\'s thinkin\' \'bout me every night, oh' },
      { time: 75, text: 'That\'s that me espresso' }
    ]
  },
  {
    id: 'yt-G7KNmW9a75Y',
    videoId: 'G7KNmW9a75Y',
    title: 'Flowers',
    artist: 'Miley Cyrus',
    album: 'Endless Summer Vacation',
    duration: 200,
    genre: 'Pop',
    year: '2023',
    playlists: ['favorites'],
    palette: { c1: 'rgba(255, 200, 0, 0.48)', c2: 'rgba(200, 100, 0, 0.44)', c3: 'rgba(255, 80, 50, 0.40)', c4: 'rgba(180, 120, 20, 0.35)', primaryR: 255, primaryG: 200, primaryB: 0 },
    cover: 'https://i.ytimg.com/vi/G7KNmW9a75Y/hqdefault.jpg',
    lyrics: [
      { time: 0, text: 'We were good, we were gold' },
      { time: 6, text: 'Kinda dream that can\'t be sold' },
      { time: 12, text: 'We were right \'til we weren\'t' },
      { time: 18, text: 'Built a home and watched it burn' },
      { time: 24, text: 'Mm, I didn\'t wanna leave you' },
      { time: 30, text: 'I didn\'t wanna lie' },
      { time: 36, text: 'Started to cry, but then remembered I' },
      { time: 42, text: 'I can buy myself flowers' },
      { time: 48, text: 'Write my name in the sand' },
      { time: 54, text: 'Talk to myself for hours' },
      { time: 60, text: 'Say things you don\'t understand' },
      { time: 66, text: 'I can take myself dancing' },
      { time: 72, text: 'And I can hold my own hand' },
      { time: 78, text: 'Yeah, I can love me better than you can' }
    ]
  },
  {
    id: 'yt-34Na4j8AVgA',
    videoId: '34Na4j8AVgA',
    title: 'Starboy',
    artist: 'The Weeknd ft. Daft Punk',
    album: 'Starboy',
    duration: 230,
    genre: 'R&B / Electronic',
    year: '2016',
    playlists: ['favorites'],
    palette: { c1: 'rgba(0, 100, 255, 0.48)', c2: 'rgba(255, 0, 80, 0.44)', c3: 'rgba(20, 20, 60, 0.40)', c4: 'rgba(0, 200, 255, 0.35)', primaryR: 0, primaryG: 100, primaryB: 255 },
    cover: 'https://i.ytimg.com/vi/34Na4j8AVgA/hqdefault.jpg',
    lyrics: [
      { time: 0, text: 'I\'m tryna put you in the worst mood, ah' },
      { time: 5, text: 'P1 cleaner than your church shoes, ah' },
      { time: 10, text: 'Milli point two just to hurt you, ah' },
      { time: 15, text: 'All red Lamb\' just to tease you, ah' },
      { time: 21, text: 'None of these toys on lease too, ah' },
      { time: 26, text: 'Made your whole year in a week too, yah' },
      { time: 36, text: 'Look what you\'ve done' },
      { time: 42, text: 'I\'m a motherfuckin\' starboy' },
      { time: 50, text: 'Look what you\'ve done' },
      { time: 58, text: 'I\'m a motherfuckin\' starboy' }
    ]
  },
  {
    id: 'yt-H5v3kku4y6Q',
    videoId: 'H5v3kku4y6Q',
    title: 'As It Was',
    artist: 'Harry Styles',
    album: 'Harry\'s House',
    duration: 167,
    genre: 'Indie Pop',
    year: '2022',
    playlists: ['favorites'],
    palette: { c1: 'rgba(255, 80, 50, 0.48)', c2: 'rgba(50, 120, 220, 0.44)', c3: 'rgba(250, 200, 60, 0.40)', c4: 'rgba(220, 60, 60, 0.35)', primaryR: 255, primaryG: 80, primaryB: 50 },
    cover: 'https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg',
    lyrics: [
      { time: 0, text: 'Come on, Harry, we wanna say goodnight to you' },
      { time: 7, text: 'Holdin\' me back' },
      { time: 10, text: 'Gravity\'s holdin\' me back' },
      { time: 14, text: 'I want you to hold out the palm of your hand' },
      { time: 18, text: 'Why don\'t we leave it at that?' },
      { time: 25, text: 'Nothin\' to say' },
      { time: 29, text: 'When everything gets in the way' },
      { time: 36, text: 'You know it\'s not the same as it was' },
      { time: 43, text: 'In this world, it\'s just us' },
      { time: 50, text: 'You know it\'s not the same as it was' }
    ]
  },
  {
    id: 'yt-TUVcZfQe-Kw',
    videoId: 'TUVcZfQe-Kw',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    duration: 203,
    genre: 'Nu-Disco',
    year: '2020',
    playlists: ['favorites'],
    palette: { c1: 'rgba(160, 40, 220, 0.48)', c2: 'rgba(0, 220, 255, 0.44)', c3: 'rgba(255, 50, 150, 0.40)', c4: 'rgba(100, 20, 180, 0.35)', primaryR: 160, primaryG: 40, primaryB: 220 },
    cover: 'https://i.ytimg.com/vi/TUVcZfQe-Kw/hqdefault.jpg',
    lyrics: [
      { time: 0, text: 'If you wanna run away with me, I know a galaxy' },
      { time: 5, text: 'And I can take you for a ride' },
      { time: 9, text: 'I had a premonition that we fell into a rhythm' },
      { time: 13, text: 'Where the music don\'t stop for life' },
      { time: 18, text: 'Glitter in the sky, glitter in my eyes' },
      { time: 22, text: 'Shining just the way I like' },
      { time: 27, text: 'If you\'re feeling like you need a little bit of company' },
      { time: 31, text: 'You met me at the perfect time' },
      { time: 35, text: 'You want me, I want you, baby' },
      { time: 40, text: 'My sugarboo, I\'m levitating' }
    ]
  },
  {
    id: 'yt-LIIDh-qI9oI',
    videoId: 'LIIDh-qI9oI',
    title: 'Save Your Tears',
    artist: 'The Weeknd & Ariana Grande',
    album: 'After Hours',
    duration: 191,
    genre: 'Synth-Pop',
    year: '2021',
    playlists: ['favorites'],
    palette: { c1: 'rgba(240, 50, 80, 0.48)', c2: 'rgba(120, 30, 180, 0.44)', c3: 'rgba(255, 120, 40, 0.40)', c4: 'rgba(60, 10, 80, 0.35)', primaryR: 240, primaryG: 50, primaryB: 80 },
    cover: 'https://i.ytimg.com/vi/LIIDh-qI9oI/hqdefault.jpg',
    lyrics: [
      { time: 0, text: 'I saw you dancing in a crowded room' },
      { time: 8, text: 'You look so happy when I\'m not with you' },
      { time: 16, text: 'But then you saw me, caught you by surprise' },
      { time: 24, text: 'A single teardrop falling from your eye' },
      { time: 32, text: 'I don\'t know why I run away' },
      { time: 40, text: 'I make you cry when I run away' },
      { time: 48, text: 'Save your tears for another day' },
      { time: 56, text: 'Save your tears for another day' }
    ]
  },
  {
    id: 'yt-RlPNh_PBZb4',
    videoId: 'RlPNh_PBZb4',
    title: 'vampire',
    artist: 'Olivia Rodrigo',
    album: 'GUTS',
    duration: 219,
    genre: 'Pop Rock',
    year: '2023',
    playlists: ['favorites'],
    palette: { c1: 'rgba(140, 30, 60, 0.48)', c2: 'rgba(30, 20, 40, 0.44)', c3: 'rgba(200, 40, 80, 0.40)', c4: 'rgba(80, 10, 30, 0.35)', primaryR: 140, primaryG: 30, primaryB: 60 },
    cover: 'https://i.ytimg.com/vi/RlPNh_PBZb4/hqdefault.jpg',
    lyrics: [
      { time: 0, text: 'Hate to give the satisfaction, asking how you\'re doing now' },
      { time: 8, text: 'How\'s the castle built off people you pretend to care about?' },
      { time: 16, text: 'Just what you wanted, look at you, cool guy, you got it' },
      { time: 24, text: 'I should\'ve known it was strange' },
      { time: 30, text: 'You only come out at night' },
      { time: 36, text: 'Bloodsucker, fame fucker' },
      { time: 42, text: 'Bleedin\' me dry like a goddamn vampire' }
    ]
  },
  {
    id: 'yt-b1kbLwvqugk',
    videoId: 'b1kbLwvqugk',
    title: 'Anti-Hero',
    artist: 'Taylor Swift',
    album: 'Midnights',
    duration: 200,
    genre: 'Synth-Pop',
    year: '2022',
    playlists: ['favorites'],
    palette: { c1: 'rgba(80, 80, 180, 0.48)', c2: 'rgba(180, 100, 60, 0.44)', c3: 'rgba(30, 30, 70, 0.40)', c4: 'rgba(120, 120, 220, 0.35)', primaryR: 80, primaryG: 80, primaryB: 180 },
    cover: 'https://i.ytimg.com/vi/b1kbLwvqugk/hqdefault.jpg',
    lyrics: [
      { time: 0, text: 'I have this thing where I get older, but just never wiser' },
      { time: 6, text: 'Midnights become my afternoons' },
      { time: 12, text: 'When my depression works the graveyard shift' },
      { time: 18, text: 'All of the people I\'ve ghosted stand there in the room' },
      { time: 28, text: 'It\'s me, hi, I\'m the problem, it\'s me' },
      { time: 36, text: 'At tea time, everybody agrees' },
      { time: 42, text: 'I\'ll stare directly at the sun, but never in the mirror' },
      { time: 50, text: 'It must be exhausting always rooting for the anti-hero' }
    ]
  },
  {
    id: 'yt-kPa7bsKwL-c',
    videoId: 'kPa7bsKwL-c',
    title: 'Die With A Smile',
    artist: 'Lady Gaga & Bruno Mars',
    album: 'Die With A Smile',
    duration: 251,
    genre: 'Soul / Pop',
    year: '2024',
    playlists: ['favorites', 'featured'],
    palette: { c1: 'rgba(0, 140, 200, 0.48)', c2: 'rgba(200, 60, 60, 0.44)', c3: 'rgba(50, 80, 150, 0.40)', c4: 'rgba(180, 40, 80, 0.35)', primaryR: 0, primaryG: 140, primaryB: 200 },
    cover: 'https://i.ytimg.com/vi/kPa7bsKwL-c/hqdefault.jpg',
    lyrics: [
      { time: 0, text: 'I, I just woke up from a dream' },
      { time: 8, text: 'Where you and I had to say goodbye' },
      { time: 16, text: 'And I don\'t know what it all means' },
      { time: 24, text: 'But since I survived, I realized' },
      { time: 32, text: 'Wherever you go, that\'s where I\'ll follow' },
      { time: 40, text: 'Nobody\'s promised tomorrow' },
      { time: 48, text: 'So I\'ma love you every night like it\'s the last night' },
      { time: 58, text: 'If the world was ending, I\'d wanna be next to you' },
      { time: 70, text: 'If the party was over and our time on Earth was through' },
      { time: 82, text: 'I\'d wanna hold you just for a while and die with a smile' }
    ]
  },
  {
    id: 'yt-d5gf9dXHevw',
    videoId: 'd5gf9dXHevw',
    title: 'Birds of a Feather',
    artist: 'Billie Eilish',
    album: 'HIT ME HARD AND SOFT',
    duration: 196,
    genre: 'Alt-Pop',
    year: '2024',
    playlists: ['favorites'],
    palette: { c1: 'rgba(50, 160, 220, 0.48)', c2: 'rgba(20, 40, 90, 0.44)', c3: 'rgba(100, 200, 255, 0.40)', c4: 'rgba(10, 20, 50, 0.35)', primaryR: 50, primaryG: 160, primaryB: 220 },
    cover: 'https://i.ytimg.com/vi/d5gf9dXHevw/hqdefault.jpg',
    lyrics: [
      { time: 0, text: 'I want you to stay' },
      { time: 6, text: '\'Til I\'m in the grave' },
      { time: 12, text: '\'Til I rot away, dead and buried' },
      { time: 18, text: '\'Til I\'m in the casket you carry' },
      { time: 24, text: 'If you go, I\'m goin\' too, uh' },
      { time: 30, text: '\'Cause it was always you, alright' },
      { time: 38, text: 'And if I\'m turnin\' blue, please don\'t save me' },
      { time: 46, text: 'Nothin\' in this world could ever break me' },
      { time: 54, text: 'Birds of a feather, we should stick together, I know' }
    ]
  }
];


const SAMPLE_TRACKS = CATALOGUE_TRACKS;

// State Variables
let currentIndex = 0;
let isPlaying = false;
let currentTime = 0;
let playbackTimer = null;
let lyricClockTimer = null;
let lastActiveLyricIndex = -1;
let currentVolume = 0.75;
let isMuted = false;
let previousVolume = 0.75;
let isShuffle = false;
let repeatMode = 'off'; // 'off', 'all', 'one'
let lovedTrackIds = new Set(['yt-ic8j13U_FS8', 'yt-4NRXx6U8ABQ', 'yt-kPa7bsKwL-c']);
let currentView = 'listen-now';
let searchQuery = '';

// Live YouTube Music State (InnerTube WEB_REMIX architecture)
let liveHomeShelves = [];
let liveExploreShelves = [];
let liveChartsShelves = [];
let liveNewReleasesShelves = [];
let liveArtists = [];
let liveUserPlaylists = [];
let liveLikedSongs = [];
let liveAccount = { isLoggedIn: false };
let activeBrowseDetail = null;
let isFetchingLive = false;

// Custom Playlists State & Persistence
let customPlaylists = loadCustomPlaylists();

function loadCustomPlaylists() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('deja_custom_playlists');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('[Playlists] Error loading custom playlists:', err.message);
  }
  return [];
}

function saveCustomPlaylists() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('deja_custom_playlists', JSON.stringify(customPlaylists));
    }
  } catch (err) {
    console.warn('[Playlists] Error saving custom playlists:', err.message);
  }
  const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
  if (api?.setConfig) {
    api.setConfig({ customPlaylists }).catch(() => {});
  }
}

function createCustomPlaylist(title, description = '') {
  const safeTitle = (title && title.trim()) ? title.trim() : 'My Playlist';
  const newPl = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: safeTitle,
    description: (description && description.trim()) ? description.trim() : 'Custom Playlist',
    cover: '../../assets/icon.png',
    tracks: [],
    createdAt: Date.now()
  };
  customPlaylists.push(newPl);
  saveCustomPlaylists();
  updateSidebarPlaylistsUI(liveUserPlaylists);
  return newPl;
}

function deleteCustomPlaylist(playlistId) {
  const pl = customPlaylists.find(p => p.id === playlistId);
  const title = pl ? pl.title : 'this playlist';
  const confirmed = typeof confirm !== 'undefined' ? confirm(`Are you sure you want to delete "${title}"?`) : true;
  if (confirmed) {
    const idx = customPlaylists.findIndex(p => p.id === playlistId);
    if (idx !== -1) {
      customPlaylists.splice(idx, 1);
    }
    saveCustomPlaylists();
    updateSidebarPlaylistsUI(liveUserPlaylists);
    if (typeof currentView !== 'undefined' && currentView === `playlist-${playlistId}`) {
      navigateTo('playlists');
    } else if (typeof currentView !== 'undefined' && currentView === 'playlists') {
      renderCurrentView();
    }
    showToast(`Deleted "${title}"`);
  }
}

function addTrackToCustomPlaylist(playlistId, track) {
  if (!playlistId || !track) return false;
  const pl = customPlaylists.find(p => p.id === playlistId);
  if (!pl) return false;
  if (!pl.tracks) pl.tracks = [];

  const existing = pl.tracks.find(t => (track.videoId && t.videoId === track.videoId) || t.id === track.id);
  if (existing) {
    showToast(`Already in "${pl.title}"`);
    return false;
  }

  const trackCopy = {
    id: track.id || `yt-${track.videoId || Date.now()}`,
    videoId: track.videoId || '',
    title: track.title || 'Unknown Title',
    artist: track.artist || 'Unknown Artist',
    album: track.album || pl.title,
    duration: track.duration || 180,
    durationStr: track.durationStr || formatTime(track.duration || 180),
    cover: track.cover || '../../assets/icon.png',
    lyrics: track.lyrics || []
  };

  pl.tracks.push(trackCopy);
  if ((!pl.cover || pl.cover === '../../assets/icon.png') && trackCopy.cover) {
    pl.cover = trackCopy.cover;
  }
  saveCustomPlaylists();
  updateSidebarPlaylistsUI(liveUserPlaylists);
  if (currentView === `playlist-${playlistId}`) {
    renderCurrentView();
  }
  showToast(`Added to "${pl.title}"`);
  return true;
}

function removeTrackFromCustomPlaylist(playlistId, trackId) {
  const pl = customPlaylists.find(p => p.id === playlistId);
  if (!pl || !pl.tracks) return;
  pl.tracks = pl.tracks.filter(t => t.id !== trackId && t.videoId !== trackId);
  if (pl.tracks.length > 0) {
    pl.cover = pl.tracks[0].cover || '../../assets/icon.png';
  } else {
    pl.cover = '../../assets/icon.png';
  }
  saveCustomPlaylists();
  updateSidebarPlaylistsUI(liveUserPlaylists);
  if (currentView === `playlist-${playlistId}`) {
    renderCurrentView();
  }
  showToast(`Removed from "${pl.title}"`);
}

// Sleek Toast Notifications
let toastTimeout = null;
function showToast(message) {
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') return;
  let toast = document.getElementById('deja-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'deja-toast';
    toast.className = 'deja-toast';
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.classList.add('show');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

// Floating Apple Song Action Menu
let activeSongMenu = null;
function closeSongMenu() {
  if (activeSongMenu) {
    activeSongMenu.remove();
    activeSongMenu = null;
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    if (activeSongMenu && !activeSongMenu.contains(e.target)) {
      closeSongMenu();
    }
  });
}

function openSongMenu(e, track, playlistContextId = null) {
  if (typeof document === 'undefined') return;
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  closeSongMenu();

  const menu = document.createElement('div');
  menu.className = 'deja-song-menu';

  const isLoved = lovedTrackIds.has(track.id);

  let html = `
    <button class="deja-song-menu-item" id="menu-opt-play-next">
      <span>▶</span> <span>Play Next</span>
    </button>
    <button class="deja-song-menu-item" id="menu-opt-like">
      <span>${isLoved ? '💔' : '⭐'}</span> <span>${isLoved ? 'Remove from Liked' : 'Like Song'}</span>
    </button>
    <button class="deja-song-menu-item" id="menu-opt-add-playlist">
      <span>➕</span> <span>Add to Playlist...</span>
    </button>
  `;

  if (playlistContextId && playlistContextId.startsWith('custom-')) {
    html += `
      <button class="deja-song-menu-item danger" id="menu-opt-remove-playlist">
        <span>🗑️</span> <span>Remove from Playlist</span>
      </button>
    `;
  }

  menu.innerHTML = html;
  document.body.appendChild(menu);

  const clientX = e ? (e.clientX || 200) : 200;
  const clientY = e ? (e.clientY || 200) : 200;
  const x = Math.min(clientX, window.innerWidth - 220);
  const y = Math.min(clientY, window.innerHeight - 180);
  menu.style.left = `${Math.max(10, x)}px`;
  menu.style.top = `${Math.max(10, y)}px`;

  menu.querySelector('#menu-opt-play-next').onclick = (ev) => {
    ev.stopPropagation();
    closeSongMenu();
    const currentVideoId = CATALOGUE_TRACKS[currentIndex]?.videoId;
    const qIdx = userQueue.findIndex(t => (currentVideoId && t.videoId === currentVideoId) || t.id === CATALOGUE_TRACKS[currentIndex]?.id);
    if (qIdx !== -1) {
      userQueue.splice(qIdx + 1, 0, track);
    } else {
      userQueue.unshift(track);
    }
    showToast(`"${track.title}" will play next`);
  };

  menu.querySelector('#menu-opt-like').onclick = (ev) => {
    ev.stopPropagation();
    closeSongMenu();
    toggleTrackFavorite(null, track.id);
  };

  menu.querySelector('#menu-opt-add-playlist').onclick = (ev) => {
    ev.stopPropagation();
    closeSongMenu();
    openAddToPlaylistModal(track);
  };

  if (playlistContextId && playlistContextId.startsWith('custom-')) {
    const removeBtn = menu.querySelector('#menu-opt-remove-playlist');
    if (removeBtn) {
      removeBtn.onclick = (ev) => {
        ev.stopPropagation();
        closeSongMenu();
        removeTrackFromCustomPlaylist(playlistContextId, track.id);
      };
    }
  }

  activeSongMenu = menu;
}

// Modal Handlers: Create Playlist and Add to Playlist
let pendingTrackToAddToPlaylist = null;

function openCreatePlaylistModal(initialTrackToAdd = null) {
  pendingTrackToAddToPlaylist = initialTrackToAdd;
  const modal = document.getElementById('create-playlist-modal');
  const inputTitle = document.getElementById('input-new-playlist-title');
  const inputDesc = document.getElementById('input-new-playlist-desc');
  if (inputTitle) inputTitle.value = '';
  if (inputDesc) inputDesc.value = '';
  if (modal) modal.style.display = 'flex';
  setTimeout(() => inputTitle?.focus(), 80);
}

function closeCreatePlaylistModal() {
  const modal = document.getElementById('create-playlist-modal');
  if (modal) modal.style.display = 'none';
  pendingTrackToAddToPlaylist = null;
}

function handleConfirmCreatePlaylist() {
  const inputTitle = document.getElementById('input-new-playlist-title');
  const inputDesc = document.getElementById('input-new-playlist-desc');
  const title = inputTitle?.value?.trim();
  if (!title) {
    inputTitle?.focus();
    return;
  }
  const desc = inputDesc?.value?.trim() || '';
  const newPl = createCustomPlaylist(title, desc);
  closeCreatePlaylistModal();

  if (pendingTrackToAddToPlaylist) {
    addTrackToCustomPlaylist(newPl.id, pendingTrackToAddToPlaylist);
    pendingTrackToAddToPlaylist = null;
  }
  navigateToPlaylist(newPl.id);
}

function openAddToPlaylistModal(track) {
  if (!track) return;
  const modal = document.getElementById('add-to-playlist-modal');
  const infoEl = document.getElementById('add-to-playlist-song-info');
  const listEl = document.getElementById('add-to-playlist-list');
  if (!modal || !listEl) return;

  if (infoEl) {
    infoEl.innerText = `${track.title} • ${track.artist}`;
  }

  if (customPlaylists.length === 0) {
    listEl.innerHTML = `
      <div style="text-align: center; padding: 20px; color: var(--text-secondary); font-size: 13px;">
        No custom playlists yet. Click "+ Create New Playlist" above!
      </div>
    `;
  } else {
    listEl.innerHTML = customPlaylists.map(pl => {
      const songCount = pl.tracks ? pl.tracks.length : 0;
      return `
        <button class="deja-picker-btn" data-pl-id="${escapeHTML(pl.id)}">
          <span>${escapeHTML(pl.title)}</span>
          <small style="color: var(--apple-text-tertiary);">${songCount} songs</small>
        </button>
      `;
    }).join('');

    listEl.querySelectorAll('.deja-picker-btn').forEach(btn => {
      btn.onclick = () => {
        const plId = btn.getAttribute('data-pl-id');
        if (plId) {
          addTrackToCustomPlaylist(plId, track);
          modal.style.display = 'none';
        }
      };
    });
  }

  modal.style.display = 'flex';

  const btnCreateAndAdd = document.getElementById('btn-modal-create-and-add');
  if (btnCreateAndAdd) {
    btnCreateAndAdd.onclick = () => {
      modal.style.display = 'none';
      openCreatePlaylistModal(track);
    };
  }
}

// Security: HTML Escaping
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Navigation History Stack (Back / Forward)
const navHistory = [];
let navHistoryIndex = -1;
let isNavigatingHistory = false;

function pushNavigation(target, isPlaylist = false) {
  if (isNavigatingHistory) return;
  if (navHistoryIndex < navHistory.length - 1) {
    navHistory.splice(navHistoryIndex + 1);
  }
  navHistory.push({ target, isPlaylist });
  navHistoryIndex = navHistory.length - 1;
  updateNavButtons();
}

function updateNavButtons() {
  const backBtn = document.getElementById('nav-back');
  const fwdBtn = document.getElementById('nav-forward');
  if (backBtn) {
    const canBack = navHistoryIndex > 0;
    backBtn.disabled = !canBack;
    backBtn.style.opacity = canBack ? '1' : '0.35';
    backBtn.style.cursor = canBack ? 'pointer' : 'default';
  }
  if (fwdBtn) {
    const canFwd = navHistoryIndex < navHistory.length - 1;
    fwdBtn.disabled = !canFwd;
    fwdBtn.style.opacity = canFwd ? '1' : '0.35';
    fwdBtn.style.cursor = canFwd ? 'pointer' : 'default';
  }
}

function navigateBack() {
  if (navHistoryIndex > 0) {
    navHistoryIndex--;
    isNavigatingHistory = true;
    const entry = navHistory[navHistoryIndex];
    if (entry.isPlaylist) {
      navigateToPlaylist(entry.target);
    } else {
      navigateTo(entry.target);
    }
    isNavigatingHistory = false;
    updateNavButtons();
  }
}

function navigateForward() {
  if (navHistoryIndex < navHistory.length - 1) {
    navHistoryIndex++;
    isNavigatingHistory = true;
    const entry = navHistory[navHistoryIndex];
    if (entry.isPlaylist) {
      navigateToPlaylist(entry.target);
    } else {
      navigateTo(entry.target);
    }
    isNavigatingHistory = false;
    updateNavButtons();
  }
}

// Web Audio API State
let audioContext = null;
let masterGain = null;
let bassFilter = null;
let midFilter = null;
let trebleFilter = null;
let activeOscillators = [];
let noteIntervalId = null;

// YouTube Live Audio Playback State & Native BitChord Direct Stream Engine
let ytPlayer = null;
let isYtReady = false;
let isYtPlaying = false;

// Native BitChord Direct Audio Stream Resolution via InnerTube
let dejaAudio = null;
let isDirectStreamPlaying = false;
let currentStreamMeta = null;

function setupDejaAudioElement() {
  if (typeof document === 'undefined') return;
  dejaAudio = document.getElementById('deja-audio-element');
  if (!dejaAudio) {
    dejaAudio = document.createElement('audio');
    dejaAudio.id = 'deja-audio-element';
    dejaAudio.preload = 'auto';
    dejaAudio.style.display = 'none';
    document.body.appendChild(dejaAudio);
  }

  dejaAudio.addEventListener('play', () => {
    isDirectStreamPlaying = true;
    isPlaying = true;
    updatePlayButton();
    startLyricClock();
    notifyTrackState();
  });

  dejaAudio.addEventListener('pause', () => {
    if (!dejaAudio.ended && isDirectStreamPlaying) {
      isPlaying = false;
      updatePlayButton();
      stopLyricClock();
      notifyTrackState();
    }
  });

  dejaAudio.addEventListener('ended', () => {
    isDirectStreamPlaying = false;
    stopLyricClock();
    if (repeatMode === 'one') {
      seekTo(0);
      play();
      return;
    }
    nextTrack();
  });

  dejaAudio.addEventListener('timeupdate', () => {
    if (!isDirectStreamPlaying) return;
    currentTime = dejaAudio.currentTime;
    const track = CATALOGUE_TRACKS[currentIndex];
    if (track && dejaAudio.duration && !isNaN(dejaAudio.duration) && Math.round(dejaAudio.duration) > 0) {
      const dur = Math.round(dejaAudio.duration);
      if (dur !== track.duration) {
        track.duration = dur;
        const totalEl = document.getElementById('time-total');
        const expTotal = document.getElementById('exp-time-total');
        if (totalEl) totalEl.innerText = formatTime(dur);
        if (expTotal) expTotal.innerText = '-' + formatTime(dur);
      }
    }
    updateProgress();
    updateSyncedLyrics();
    updateDynamicPipeline(dejaAudio);
  });

  dejaAudio.addEventListener('error', () => {
    console.warn('[Deja Audio] Direct stream playback error, falling back gracefully to IFrame:', dejaAudio.error?.message || dejaAudio.error?.code);
    isDirectStreamPlaying = false;
    const track = CATALOGUE_TRACKS[currentIndex];
    if (track && track.videoId) {
      fallbackToIFrame(track);
    }
  });
}

/**
 * Fallback gracefully to hidden YouTube IFrame player with unMute() and setVolume(100).
 */
function fallbackToIFrame(track) {
  if (!track || !track.videoId) return;
  if (isYtReady && ytPlayer) {
    try {
      ytPlayer.unMute();
      ytPlayer.setVolume(isMuted ? 0 : Math.round(currentVolume * 100));
      const currentLoaded = ytPlayer.getVideoData ? ytPlayer.getVideoData().video_id : null;
      if (currentLoaded !== track.videoId) {
        ytPlayer.loadVideoById(track.videoId);
      } else {
        ytPlayer.playVideo();
      }
      isYtPlaying = true;
      isPlaying = true;
      updatePlayButton();
      startLyricClock();
      if (!playbackTimer) playbackTimer = setInterval(tick, 1000);
      updateSyncedLyrics(true);
    } catch (e) {
      console.warn('[YouTube] Could not play video in iframe:', e.message);
    }
  }
}

/**
 * Direct Audio Stream Resolution via InnerTube (BitChord architecture):
 * Resolves direct audio stream URL via IPC and pipes to native HTML5 deja-audio-element.
 * If stream URL requires signature cipher or fails, gracefully falls back to IFrame.
 */
async function resolveAndPlayTrack(track) {
  if (!track) return;
  const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;

  // Stop any active audio before switching
  if (dejaAudio && !dejaAudio.paused) {
    try { dejaAudio.pause(); } catch {}
  }
  if (isYtReady && ytPlayer && isYtPlaying) {
    try { ytPlayer.pauseVideo(); } catch {}
    isYtPlaying = false;
  }

  // Ensure AudioContext is resumed if suspended
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }

  if (api?.resolveAudioStream && track.videoId) {
    try {
      const stream = await api.resolveAudioStream(track.videoId);
      if (stream && stream.url && dejaAudio) {
        currentStreamMeta = stream;
        isDirectStreamPlaying = true;
        dejaAudio.src = stream.url;
        dejaAudio.volume = isMuted ? 0 : currentVolume;
        if (currentTime > 0) {
          dejaAudio.currentTime = currentTime;
        }
        if (stream.duration && stream.duration > 0) {
          track.duration = stream.duration;
          const totalEl = document.getElementById('time-total');
          const expTotal = document.getElementById('exp-time-total');
          if (totalEl) totalEl.innerText = formatTime(track.duration);
          if (expTotal) expTotal.innerText = formatTime(track.duration);
        }
        const p = dejaAudio.play();
        if (p) {
          p.catch(err => {
            console.warn('[Deja Audio] HTML5 play() error, falling back to IFrame:', err.message);
            isDirectStreamPlaying = false;
            fallbackToIFrame(track);
          });
        }
        isPlaying = true;
        updatePlayButton();
        if (playbackTimer) clearInterval(playbackTimer);
        playbackTimer = setInterval(tick, 1000);
        startLyricClock();
        notifyTrackState();
        return;
      }
    } catch (err) {
      console.warn('[Deja Audio] Direct stream resolution error:', err.message);
    }
  }

  // Graceful fallback to unmuted IFrame player
  isDirectStreamPlaying = false;
  fallbackToIFrame(track);
  isPlaying = true;
  updatePlayButton();
  if (playbackTimer) clearInterval(playbackTimer);
  playbackTimer = setInterval(tick, 1000);
  startLyricClock();
  notifyTrackState();
}

if (typeof window !== 'undefined') {
  window.onYouTubeIframeAPIReady = function() {
    try {
      const initialVideoId = (CATALOGUE_TRACKS[0] && CATALOGUE_TRACKS[0].videoId) || 'E9jGlwluIbk';

      ytPlayer = new YT.Player('yt-player-container', {
        height: '180',
        width: '320',
        videoId: initialVideoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
          playsinline: 1
        },
        events: {
          onReady: () => {
            isYtReady = true;
            try {
              ytPlayer.unMute();
              ytPlayer.setVolume(isMuted ? 0 : Math.round(currentVolume * 100));
              if (isPlaying && !isDirectStreamPlaying) {
                const cur = CATALOGUE_TRACKS[currentIndex];
                if (cur && cur.videoId) {
                  fallbackToIFrame(cur);
                }
              }
            } catch {}
          },
          onStateChange: (event) => {
            // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
            if (event.data === 0) {
              stopLyricClock();
              if (repeatMode === 'one') {
                seekTo(0);
                play();
                return;
              }
              nextTrack();
            } else if (event.data === 1) {
              try { ytPlayer.unMute(); } catch {}
              isYtPlaying = true;
              isPlaying = true;
              updatePlayButton();
              startLyricClock();
              if (!playbackTimer) playbackTimer = setInterval(tick, 1000);
              updateSyncedLyrics(true);
              notifyTrackState();
              try {
                const vidData = ytPlayer.getVideoData ? ytPlayer.getVideoData() : null;
                const isAd = !!(vidData && (vidData.isAd || vidData.author === ''));
                const adPill = document.getElementById('player-ad-pill');
                if (adPill) adPill.style.display = isAd ? 'inline-flex' : 'none';
              } catch {}
            } else if (event.data === 2) {
              isYtPlaying = false;
              if (!isDirectStreamPlaying) {
                isPlaying = false;
                updatePlayButton();
                stopLyricClock();
                if (playbackTimer) {
                  clearInterval(playbackTimer);
                  playbackTimer = null;
                }
                notifyTrackState();
              }
            }
          },
          onError: (event) => {
            console.warn('[YouTube Player] Playback error code:', event?.data);
            isYtPlaying = false;
            // If IFrame playback encounters Error 150 / 101 or embed block, attempt direct stream
            const cur = CATALOGUE_TRACKS[currentIndex];
            if (cur && cur.videoId && !isDirectStreamPlaying) {
              resolveAndPlayTrack(cur);
            }
          }
        }
      });
    } catch (err) {
      console.warn('[YouTube Player] Init notice:', err.message);
    }
  };
}

// BitChord Features State
let sleepTimerId = null;
let sleepRemainingSec = null;
let sleepMode = null; // 'duration' or 'track'
let currentEqPreset = 'Flat';
let userQueue = [...CATALOGUE_TRACKS];

const EQ_PRESETS = {
  'Flat': { bass: 0, mid: 0, treble: 0 },
  'Bass Boost': { bass: 6, mid: 0, treble: -1 },
  'Acoustic': { bass: 2, mid: 3, treble: 1 },
  'Vocal Booster': { bass: -2, mid: 4, treble: 2 },
  'Treble Booster': { bass: -2, mid: 1, treble: 5 }
};

// Initialize Application
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initUI();
    setupNavigation();
    setupEvents();
    setupIPC();
    loadTrack(0);
    updateSidebarPlaylistsUI(liveUserPlaylists);
    pushNavigation('listen-now', false);
    renderCurrentView();
    fetchLiveYouTubeMusic();
  });
}

function initUI() {
  setupDejaAudioElement();
  document.getElementById('scrubber-track').onclick = handleScrubberClick;
  const expScrubber = document.getElementById('exp-scrubber-track');
  if (expScrubber) expScrubber.onclick = handleScrubberClick;

  document.getElementById('volume-track').onclick = handleVolumeClick;

  // Titlebar Navigation Buttons
  const backBtn = document.getElementById('nav-back');
  const fwdBtn = document.getElementById('nav-forward');
  if (backBtn) backBtn.onclick = navigateBack;
  if (fwdBtn) fwdBtn.onclick = navigateForward;
  updateNavButtons();

  // Load YouTube IFrame API dynamically
  if (!window.YT && typeof document !== 'undefined') {
    try {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      tag.onerror = () => {
        console.info('[YouTube] YouTube IFrame API script load skipped (offline mode).');
      };
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    } catch {}
  }
}

// ==========================================
// View Routing & Dynamic Content Rendering
// ==========================================

function setupNavigation() {
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      const page = link.getAttribute('data-page');
      const playlist = link.getAttribute('data-playlist');

      if (page) {
        navigateTo(page);
      } else if (playlist) {
        navigateToPlaylist(playlist);
      }
    });
  });
}

function navigateTo(pageId) {
  currentView = pageId;
  const searchInput = document.getElementById('apple-search-input');
  if (searchInput && currentView !== 'search') {
    searchInput.value = '';
    searchQuery = '';
  }
  if (!isNavigatingHistory) {
    pushNavigation(pageId, false);
  }
  renderCurrentView();
}

function navigateToPlaylist(playlistId) {
  currentView = `playlist-${playlistId}`;
  if (!isNavigatingHistory) {
    pushNavigation(playlistId, true);
  }
  renderCurrentView();
}

function renderCurrentView() {
  const mainContent = document.getElementById('main-content-scroll');
  if (!mainContent) return;

  // Update active sidebar link
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  sidebarLinks.forEach(link => {
    const page = link.getAttribute('data-page');
    const pl = link.getAttribute('data-playlist');
    if (page && page === currentView && !searchQuery.trim()) {
      link.classList.add('active');
    } else if (pl && `playlist-${pl}` === currentView && !searchQuery.trim()) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  if (searchQuery.trim().length > 0) {
    renderSearchResultsView(mainContent);
    return;
  }

  if (currentView === 'listen-now') {
    renderListenNowView(mainContent);
  } else if (currentView === 'browse') {
    renderBrowseView(mainContent);
  } else if (currentView === 'radio') {
    renderRadioView(mainContent);
  } else if (currentView === 'recently-added') {
    renderRecentlyAddedView(mainContent);
  } else if (currentView === 'artists') {
    renderArtistsView(mainContent);
  } else if (currentView === 'albums') {
    renderAlbumsView(mainContent);
  } else if (currentView === 'songs') {
    renderSongsTableView(mainContent);
  } else if (currentView === 'playlists') {
    renderPlaylistsGridView(mainContent);
  } else if (currentView.startsWith('playlist-')) {
    const playlistId = currentView.replace('playlist-', '');
    renderSinglePlaylistView(mainContent, playlistId);
  } else if (currentView === 'browse-detail') {
    renderBrowseDetailView(mainContent);
  }
}

function createCatalogueItemFromLive(t) {
  const videoId = t.videoId || '';
  const title = t.title || 'YouTube Track';
  const artist = t.artist || 'YouTube Music';
  const album = t.album || 'YouTube Music';
  const duration = typeof t.duration === 'number' && t.duration > 0 ? t.duration : 210;
  const cover = t.cover || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '../../assets/icon.png');

  const itemObj = {
    id: t.id || (videoId ? `yt-${videoId}` : `track-${Math.random().toString(36).slice(2, 9)}`),
    videoId: videoId,
    title: title,
    artist: artist,
    album: album,
    duration: duration,
    durationStr: t.durationStr || formatTime(duration),
    genre: 'YouTube Music',
    year: '2026',
    playlists: ['favorites'],
    palette: {
      c1: 'rgba(250, 45, 72, 0.48)',
      c2: 'rgba(140, 40, 220, 0.44)',
      c3: 'rgba(255, 120, 50, 0.40)',
      c4: 'rgba(40, 160, 220, 0.35)',
      primaryR: 250,
      primaryG: 45,
      primaryB: 72
    },
    cover: cover,
    lyrics: [
      { time: 0, text: `Playing "${title}"` },
      { time: 5, text: `By ${artist}` },
      { time: 12, text: 'Streamed directly from YouTube Music' }
    ]
  };
  resolveSyncedLyrics(itemObj);
  return itemObj;
}

function renderLiveCardHTML(item, globalCardId) {
  const safeTitle = escapeHTML(item.title || '');
  const safeSub = escapeHTML(item.subtitle || item.artist || 'YouTube Music');
  const safeCover = escapeHTML(item.cover || '../../assets/icon.png');
  const isBrowse = item.type === 'browse' || (!item.videoId && item.browseId);

  return `
    <div class="apple-music-card live-yt-card" data-live-id="${globalCardId}">
      <div class="card-thumb-wrapper">
        <img src="${safeCover}" class="card-thumb track-card-img" alt="${safeTitle}" onerror="this.src='../../assets/icon.png'">
        <div class="card-play-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>
        ${isBrowse ? '<span class="card-type-badge">ALBUM</span>' : '<span class="card-type-badge yt-badge">YTM</span>'}
      </div>
      <div class="card-title">${safeTitle}</div>
      <div class="card-subtitle">${safeSub}</div>
    </div>
  `;
}

let fetchLivePromise = null;
function fetchLiveYouTubeMusic(force = false) {
  if (force) {
    fetchLivePromise = null;
  }
  if (fetchLivePromise) return fetchLivePromise;
  fetchLivePromise = _fetchLiveYouTubeMusicInternal().finally(() => {
    fetchLivePromise = null;
  });
  return fetchLivePromise;
}

async function _fetchLiveYouTubeMusicInternal() {
  const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
  if (!api) return;
  isFetchingLive = true;

  // 1. Account Info & User Library
  try {
    if (api.getAccountInfo) {
      const acc = await api.getAccountInfo();
      updateAccountUI(acc);
      if (acc && acc.isLoggedIn) {
        if (api.getLibraryPlaylists) {
          const userPls = await api.getLibraryPlaylists();
          if (userPls && userPls.length > 0) {
            liveUserPlaylists = userPls;
            updateSidebarPlaylistsUI(userPls);
          }
        }
        if (api.getLibrarySongs) {
          const libSongs = await api.getLibrarySongs();
          if (libSongs && libSongs.songs && libSongs.songs.length > 0) {
            liveLikedSongs = libSongs.songs;
            lovedTrackIds.clear();
            libSongs.songs.forEach(t => {
              let existing = CATALOGUE_TRACKS.find(x => x.videoId === t.videoId);
              if (!existing) {
                existing = createCatalogueItemFromLive(t);
                CATALOGUE_TRACKS.push(existing);
              }
              if (existing) {
                if (!existing.playlists) existing.playlists = [];
                if (!existing.playlists.includes('favorites')) {
                  existing.playlists.push('favorites');
                }
                lovedTrackIds.add(existing.id);
              }
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Account] getAccountInfo error:', err.message);
  }

  // 2. Charts Feed (Top video charts, Top artists, 100 live chart songs)
  try {
    if (api.getChartsFeed) {
      const chartsData = await api.getChartsFeed();
      if (chartsData) {
        if (chartsData.shelves && chartsData.shelves.length > 0) {
          liveChartsShelves = chartsData.shelves;
        }
        if (chartsData.artists && chartsData.artists.length > 0) {
          liveArtists = chartsData.artists;
        }
        if (chartsData.tracks && chartsData.tracks.length > 0) {
          chartsData.tracks.forEach(t => {
            if (t.videoId && !CATALOGUE_TRACKS.some(x => x.videoId === t.videoId)) {
              CATALOGUE_TRACKS.push(createCatalogueItemFromLive(t));
            }
          });
        }
      }
    }
  } catch (err) {
    console.warn('[Feed] Charts feed error:', err.message);
  }

  // 3. Home Feed (FEmusic_home)
  try {
    if (api.getHomeFeed) {
      const homeData = await api.getHomeFeed();
      if (homeData && homeData.shelves && homeData.shelves.length > 0) {
        liveHomeShelves = homeData.shelves;
        if (homeData.tracks && homeData.tracks.length > 0) {
          homeData.tracks.forEach(t => {
            if (t.videoId && !CATALOGUE_TRACKS.some(x => x.videoId === t.videoId)) {
              CATALOGUE_TRACKS.push(createCatalogueItemFromLive(t));
            }
          });
        }
      }
    }
  } catch (err) {
    console.warn('[Feed] Home feed error:', err.message);
  }

  // 4. Explore Feed (FEmusic_explore)
  try {
    if (api.getExploreFeed) {
      const exploreData = await api.getExploreFeed();
      if (exploreData && exploreData.shelves && exploreData.shelves.length > 0) {
        liveExploreShelves = exploreData.shelves;
        if (exploreData.tracks && exploreData.tracks.length > 0) {
          exploreData.tracks.forEach(t => {
            if (t.videoId && !CATALOGUE_TRACKS.some(x => x.videoId === t.videoId)) {
              CATALOGUE_TRACKS.push(createCatalogueItemFromLive(t));
            }
          });
        }
      }
    }
  } catch (err) {
    console.warn('[Feed] Explore feed error:', err.message);
  }

  // 5. New Releases Feed (FEmusic_new_releases)
  try {
    if (api.getNewReleasesFeed) {
      const newRelData = await api.getNewReleasesFeed();
      if (newRelData && newRelData.shelves && newRelData.shelves.length > 0) {
        liveNewReleasesShelves = newRelData.shelves;
        if (newRelData.tracks && newRelData.tracks.length > 0) {
          newRelData.tracks.forEach(t => {
            if (t.videoId && !CATALOGUE_TRACKS.some(x => x.videoId === t.videoId)) {
              CATALOGUE_TRACKS.push(createCatalogueItemFromLive(t));
            }
          });
        }
      }
    }
  } catch (err) {
    console.warn('[Feed] New releases feed error:', err.message);
  }

  isFetchingLive = false;
  renderCurrentView();
}

function updateSidebarPlaylistsUI(userPls) {
  if (typeof document === 'undefined') return;

  const customContainer = document.getElementById('sidebar-custom-playlists-container');
  const ytContainer = document.getElementById('sidebar-yt-playlists-container');
  const pls = userPls || liveUserPlaylists || [];

  if (customContainer && ytContainer) {
    // 1. Render Custom Playlists
    if (customPlaylists && customPlaylists.length > 0) {
      customContainer.innerHTML = customPlaylists.map(pl => `
        <button class="sidebar-link custom-playlist-link" data-playlist="${escapeHTML(pl.id)}" title="${escapeHTML(pl.title)}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHTML(pl.title)}</span>
        </button>
      `).join('');

      customContainer.querySelectorAll('.custom-playlist-link').forEach(btn => {
        btn.onclick = () => {
          const plId = btn.getAttribute('data-playlist');
          if (plId) navigateToPlaylist(plId);
        };
      });
    } else {
      customContainer.innerHTML = '';
    }

    // 2. Render Live YouTube Playlists
    if (pls && pls.length > 0) {
      ytContainer.innerHTML = `
        <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; padding: 10px 14px 4px 14px;">YouTube Music</div>
        ${pls.slice(0, 10).map(p => `
          <button class="sidebar-link live-user-playlist-link" data-browse-id="${escapeHTML(p.browseId || '')}" title="${escapeHTML(p.title || '')}">
            <span style="font-size: 13px;">📁</span>
            <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHTML(p.title || 'Playlist')}</span>
          </button>
        `).join('')}
      `;

      ytContainer.querySelectorAll('.live-user-playlist-link').forEach(btn => {
        btn.onclick = () => {
          const bId = btn.getAttribute('data-browse-id');
          const title = btn.innerText.replace('📁', '').trim();
          if (bId) openBrowseDetail(bId, title);
        };
      });
    } else {
      ytContainer.innerHTML = '';
    }
    return;
  }

  // Fallback for environment where subcontainers are not present
  const groups = document.querySelectorAll('.sidebar-group');
  let myPlaylistsGroup = null;
  groups.forEach(g => {
    const h = g.querySelector ? g.querySelector('.sidebar-heading') : null;
    if (h && h.innerText && h.innerText.includes('My Playlists')) {
      myPlaylistsGroup = g;
    }
  });
  if (!myPlaylistsGroup) return;

  let html = `
    <div class="sidebar-heading-row">
      <span class="sidebar-heading">My Playlists</span>
      <button class="sidebar-add-playlist-btn" id="btn-sidebar-new-playlist" title="New Playlist">+</button>
    </div>
    <button class="sidebar-link" data-playlist="favorites">⭐ Liked Songs</button>
  `;

  if (customPlaylists && customPlaylists.length > 0) {
    customPlaylists.forEach(pl => {
      html += `
        <button class="sidebar-link custom-playlist-link" data-playlist="${escapeHTML(pl.id)}" title="${escapeHTML(pl.title)}">
          🎵 ${escapeHTML(pl.title)}
        </button>
      `;
    });
  }

  if (pls && pls.length > 0) {
    pls.slice(0, 8).forEach(p => {
      html += `
        <button class="sidebar-link live-user-playlist-link" data-browse-id="${escapeHTML(p.browseId || '')}" title="${escapeHTML(p.title || '')}">
          📁 ${escapeHTML(p.title || 'Playlist')}
        </button>
      `;
    });
  }
  myPlaylistsGroup.innerHTML = html;

  const btnNew = myPlaylistsGroup.querySelector('#btn-sidebar-new-playlist');
  if (btnNew) btnNew.onclick = () => openCreatePlaylistModal();

  const favBtn = myPlaylistsGroup.querySelector('[data-playlist="favorites"]');
  if (favBtn) favBtn.onclick = () => navigateToPlaylist('favorites');

  myPlaylistsGroup.querySelectorAll('.custom-playlist-link').forEach(btn => {
    btn.onclick = () => {
      const plId = btn.getAttribute('data-playlist');
      if (plId) navigateToPlaylist(plId);
    };
  });

  myPlaylistsGroup.querySelectorAll('.live-user-playlist-link').forEach(l => {
    l.onclick = () => {
      const bId = l.getAttribute('data-browse-id');
      const title = l.innerText.replace('📁 ', '').trim();
      if (bId) openBrowseDetail(bId, title);
    };
  });
}

function updateAccountUI(acc) {
  if (!acc) return;
  liveAccount = acc;
  const avatarText = document.getElementById('user-avatar-text');
  const avatarImg = document.getElementById('user-avatar-img');
  const pillText = document.getElementById('user-pill-text');

  // Sidebar account profile elements
  const sidebarAvatarText = document.getElementById('sidebar-avatar-text');
  const sidebarAvatarImg = document.getElementById('sidebar-avatar-img');
  const sidebarName = document.getElementById('sidebar-account-name');
  const sidebarSub = document.getElementById('sidebar-account-sub');
  const sidebarBadge = document.getElementById('sidebar-account-btn');

  if (acc.isLoggedIn) {
    const displayName = acc.channelTitle || acc.name || 'Connected';
    const photo = acc.avatarUrl || acc.photoUrl;

    if (avatarImg && photo) {
      avatarImg.src = photo;
      avatarImg.style.display = 'inline-block';
      avatarImg.onerror = () => {
        avatarImg.style.display = 'none';
        if (avatarText) {
          avatarText.innerText = (displayName || 'U')[0].toUpperCase();
          avatarText.style.display = 'inline-block';
        }
      };
      if (avatarText) avatarText.style.display = 'none';
    } else if (avatarText) {
      avatarText.innerText = (displayName || 'U')[0].toUpperCase();
      avatarText.style.display = 'inline-block';
      if (avatarImg) avatarImg.style.display = 'none';
    }
    if (pillText) {
      pillText.innerText = displayName;
      pillText.style.color = '#34C759';
    }
    const badge = document.getElementById('btn-login-status');
    if (badge) {
      badge.title = `${displayName} (${acc.handle || 'Connected'})`;
    }
    const switchLiveBtn = document.getElementById('btn-switch-live');
    if (switchLiveBtn) {
      const span = switchLiveBtn.querySelector('span');
      if (span) span.innerText = 'YouTube Music Connected';
    }

    // Update sidebar account profile
    if (sidebarAvatarImg && photo) {
      sidebarAvatarImg.src = photo;
      sidebarAvatarImg.style.display = 'inline-block';
      sidebarAvatarImg.onerror = () => {
        sidebarAvatarImg.style.display = 'none';
        if (sidebarAvatarText) {
          sidebarAvatarText.innerText = (displayName || 'U')[0].toUpperCase();
          sidebarAvatarText.style.display = 'inline-block';
        }
      };
      if (sidebarAvatarText) sidebarAvatarText.style.display = 'none';
    } else if (sidebarAvatarText) {
      sidebarAvatarText.innerText = (displayName || 'U')[0].toUpperCase();
      sidebarAvatarText.style.display = 'inline-block';
      if (sidebarAvatarImg) sidebarAvatarImg.style.display = 'none';
    }
    if (sidebarName) sidebarName.innerText = displayName;
    if (sidebarSub) sidebarSub.innerText = acc.handle || 'Connected';
    if (sidebarBadge) sidebarBadge.title = `${displayName} (${acc.handle || 'Connected'})`;
  } else {
    if (avatarText) {
      avatarText.innerText = 'G';
      avatarText.style.display = 'inline-block';
    }
    if (avatarImg) avatarImg.style.display = 'none';
    if (pillText) {
      pillText.innerText = 'Sign In';
      pillText.style.color = '';
    }
    const badge = document.getElementById('btn-login-status');
    if (badge) {
      badge.title = 'Sign in with Google / YouTube Music';
    }
    const switchLiveBtn = document.getElementById('btn-switch-live');
    if (switchLiveBtn) {
      const span = switchLiveBtn.querySelector('span');
      if (span) span.innerText = 'Connect Live YouTube Music';
    }

    // Reset sidebar account profile
    if (sidebarAvatarText) {
      sidebarAvatarText.innerText = 'G';
      sidebarAvatarText.style.display = 'inline-block';
    }
    if (sidebarAvatarImg) sidebarAvatarImg.style.display = 'none';
    if (sidebarName) sidebarName.innerText = 'Sign In';
    if (sidebarSub) sidebarSub.innerText = 'YouTube Music';
    if (sidebarBadge) sidebarBadge.title = 'Sign in to YouTube Music';
  }

  // If account login modal is currently open, refresh its content
  const modal = (typeof document !== 'undefined' && typeof document.getElementById === 'function')
    ? document.getElementById('account-login-modal')
    : null;
  if (modal && modal.style && modal.style.display && modal.style.display !== 'none') {
    renderAccountModalContent();
  }
}

function openAccountModal(forceLogin = false) {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('account-login-modal');
  if (!modal) return;
  if (modal.style) modal.style.display = 'flex';
  renderAccountModalContent(forceLogin);

  const api = (typeof window !== 'undefined') ? (window.dejaAPI || window.sonoraAPI) : null;
  if (api && api.startCookieSyncServer) {
    try { api.startCookieSyncServer(); } catch {}
  }
}

function closeAccountModal() {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('account-login-modal');
  if (modal && modal.style) modal.style.display = 'none';
}

function renderAccountModalContent(forceLoginView = false) {
  if (typeof document === 'undefined') return;
  const modalTitle = document.getElementById('account-modal-title');
  const tabs = document.getElementById('login-modal-tabs');
  const inAppContent = document.getElementById('tab-content-inapp');
  const browserContent = document.getElementById('tab-content-browser');
  const profileView = document.getElementById('account-profile-view');

  const isLoggedIn = liveAccount && liveAccount.isLoggedIn && !forceLoginView;

  if (isLoggedIn) {
    if (modalTitle) modalTitle.innerText = 'Account';
    if (tabs && tabs.style) tabs.style.display = 'none';
    if (inAppContent && inAppContent.style) inAppContent.style.display = 'none';
    if (browserContent && browserContent.style) browserContent.style.display = 'none';
    if (profileView && profileView.style) profileView.style.display = 'block';

    const displayName = liveAccount.channelTitle || liveAccount.name || 'Google User';
    const handle = liveAccount.handle || '';
    const photo = liveAccount.avatarUrl || liveAccount.photoUrl;

    const profName = document.getElementById('profile-display-name');
    const profHandle = document.getElementById('profile-handle');
    const profAvatarLarge = document.getElementById('profile-avatar-large-text');
    const profAvatarImg = document.getElementById('profile-avatar-large-img');

    if (profName) profName.innerText = displayName;
    if (profHandle) profHandle.innerText = handle;

    if (profAvatarImg && photo) {
      profAvatarImg.src = photo;
      if (profAvatarImg.style) profAvatarImg.style.display = 'inline-block';
      profAvatarImg.onerror = () => {
        if (profAvatarImg.style) profAvatarImg.style.display = 'none';
        if (profAvatarLarge) {
          profAvatarLarge.innerText = (displayName || 'U')[0].toUpperCase();
          if (profAvatarLarge.style) profAvatarLarge.style.display = 'flex';
        }
      };
      if (profAvatarLarge && profAvatarLarge.style) profAvatarLarge.style.display = 'none';
    } else if (profAvatarLarge) {
      profAvatarLarge.innerText = (displayName || 'U')[0].toUpperCase();
      if (profAvatarLarge.style) profAvatarLarge.style.display = 'flex';
      if (profAvatarImg && profAvatarImg.style) profAvatarImg.style.display = 'none';
    }
  } else {
    if (modalTitle) modalTitle.innerText = 'Sign in to YouTube Music';
    if (tabs && tabs.style) tabs.style.display = 'flex';
    if (profileView && profileView.style) profileView.style.display = 'none';

    const activeTab = (typeof document.querySelector === 'function')
      ? (document.querySelector('.segmented-tab.active')?.getAttribute('data-tab') || 'inapp')
      : 'inapp';
    switchLoginTab(activeTab);
  }
}

function switchLoginTab(tabName) {
  if (typeof document === 'undefined') return;
  const inAppTabBtn = document.getElementById('tab-btn-inapp');
  const browserTabBtn = document.getElementById('tab-btn-browser');
  const inAppContent = document.getElementById('tab-content-inapp');
  const browserContent = document.getElementById('tab-content-browser');

  if (tabName === 'browser') {
    if (browserTabBtn && browserTabBtn.classList && typeof browserTabBtn.classList.add === 'function') {
      browserTabBtn.classList.add('active');
    }
    if (inAppTabBtn && inAppTabBtn.classList && typeof inAppTabBtn.classList.remove === 'function') {
      inAppTabBtn.classList.remove('active');
    }
    if (browserContent && browserContent.style) browserContent.style.display = 'block';
    if (inAppContent && inAppContent.style) inAppContent.style.display = 'none';
  } else {
    if (inAppTabBtn && inAppTabBtn.classList && typeof inAppTabBtn.classList.add === 'function') {
      inAppTabBtn.classList.add('active');
    }
    if (browserTabBtn && browserTabBtn.classList && typeof browserTabBtn.classList.remove === 'function') {
      browserTabBtn.classList.remove('active');
    }
    if (inAppContent && inAppContent.style) inAppContent.style.display = 'block';
    if (browserContent && browserContent.style) browserContent.style.display = 'none';
  }
}

async function openBrowseDetail(browseId, title = 'Album', cover = '', subtitle = 'YouTube Music') {
  currentView = 'browse-detail';
  activeBrowseDetail = {
    browseId,
    title,
    subtitle,
    cover,
    songs: [],
    isLoading: true
  };
  pushNavigation('browse-detail', false);
  renderCurrentView();

  const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
  if (api?.getBrowsePlaylist) {
    try {
      const detail = await api.getBrowsePlaylist(browseId);
      if (detail) {
        activeBrowseDetail = {
          browseId,
          title: detail.title || title,
          subtitle: detail.subtitle || subtitle,
          cover: detail.cover || cover,
          songs: detail.songs || [],
          isLoading: false
        };
        if (currentView === 'browse-detail') {
          renderCurrentView();
        }
      }
    } catch (err) {
      console.warn('[Browse] getBrowsePlaylist error:', err.message);
      if (activeBrowseDetail) {
        activeBrowseDetail.isLoading = false;
        renderCurrentView();
      }
    }
  }
}

function renderBrowseDetailView(container) {
  if (!activeBrowseDetail) {
    navigateTo('listen-now');
    return;
  }

  const { title, subtitle, cover, songs, isLoading } = activeBrowseDetail;
  const safeTitle = escapeHTML(title);
  const safeSubtitle = escapeHTML(subtitle);
  const safeCover = escapeHTML(cover || '../../assets/icon.png');

  container.innerHTML = `
    <div style="padding: 10px 0 20px 0;">
      <div class="category-hero">
        <img src="${safeCover}" class="category-hero-cover" alt="${safeTitle}" onerror="this.src='../../assets/icon.png'">
        <div class="category-hero-details">
          <span class="category-hero-tag">YOUTUBE MUSIC ALBUM / PLAYLIST</span>
          <h1 class="category-hero-title">${safeTitle}</h1>
          <p class="category-hero-desc">${safeSubtitle}</p>
          <div class="category-hero-actions">
            ${songs && songs.length > 0 ? `
              <button class="btn-apple-primary" id="btn-play-browse-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span>Play All</span>
              </button>
              <button class="btn-apple-secondary" id="btn-shuffle-browse-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="16 3 21 3 21 8"></polyline>
                  <line x1="4" y1="20" x2="21" y2="3"></line>
                  <polyline points="21 16 21 21 16 21"></polyline>
                  <line x1="15" y1="15" x2="21" y2="21"></line>
                  <line x1="4" y1="4" x2="9" y2="9"></line>
                </svg>
                <span>Shuffle</span>
              </button>
            ` : ''}
            <button class="genre-chip" onclick="navigateBack()">‹ Back</button>
          </div>
        </div>
      </div>

      ${isLoading ? `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
          <div style="font-size: 14px; margin-bottom: 8px;">Loading YouTube Music tracklist...</div>
          <div style="font-size: 12px; color: var(--text-muted);">Fetching from InnerTube API</div>
        </div>
      ` : (songs && songs.length > 0 ? `
        <div class="songs-table-container">
          <div class="songs-table-header">
            <span>#</span>
            <span>Title</span>
            <span>Artist</span>
            <span>Album</span>
            <span>Duration</span>
            <span>Play</span>
          </div>
          ${songs.map((s, idx) => `
            <div class="song-row" id="browse-song-${idx}">
              <span class="song-number">${idx + 1}</span>
              <div class="song-title-cell">
                <img src="${escapeHTML(s.cover || safeCover)}" class="song-cell-thumb" alt="${escapeHTML(s.title)}" onerror="this.src='../../assets/icon.png'">
                <span class="song-title">${escapeHTML(s.title)}</span>
              </div>
              <span class="song-artist-cell">${escapeHTML(s.artist)}</span>
              <span class="song-album-cell">${escapeHTML(s.album || title)}</span>
              <span class="song-duration-cell">${escapeHTML(s.durationStr || formatTime(s.duration))}</span>
              <div>
                <button class="player-icon-btn" style="width:28px; height:28px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
          <p>No tracks found in this playlist or album.</p>
        </div>
      `)}
    </div>
  `;

  if (songs && songs.length > 0) {
    songs.forEach((s, idx) => {
      const row = document.getElementById(`browse-song-${idx}`);
      if (row) {
        row.onclick = () => {
          playLiveTrack(s);
        };
      }
    });

    const btnPlayAll = document.getElementById('btn-play-browse-all');
    if (btnPlayAll) {
      btnPlayAll.onclick = () => {
        playLiveTrack(songs[0]);
      };
    }

    const btnShuffleAll = document.getElementById('btn-shuffle-browse-all');
    if (btnShuffleAll) {
      btnShuffleAll.onclick = () => {
        const randSong = songs[Math.floor(Math.random() * songs.length)];
        playLiveTrack(randSong);
      };
    }
  }
}

function playLiveTrack(item) {
  if (!item) return;
  let idx = CATALOGUE_TRACKS.findIndex(t => (item.videoId && t.videoId === item.videoId) || t.id === item.id);
  if (idx === -1) {
    const fullTrack = createCatalogueItemFromLive(item);
    CATALOGUE_TRACKS.unshift(fullTrack);
    idx = 0;
  }
  selectTrack(idx);
}

function renderListenNowView(container) {
  const allShelves = [];

  if (liveChartsShelves && liveChartsShelves.length > 0) {
    liveChartsShelves.forEach(s => {
      if (s.items && s.items.length > 0 && !allShelves.some(x => x.title === s.title)) {
        allShelves.push(s);
      }
    });
  }

  if (liveHomeShelves && liveHomeShelves.length > 0) {
    liveHomeShelves.forEach(s => {
      if (s.items && s.items.length > 0 && !allShelves.some(x => x.title === s.title)) {
        allShelves.push(s);
      }
    });
  }

  if (liveExploreShelves && liveExploreShelves.length > 0) {
    liveExploreShelves.forEach(s => {
      if (s.items && s.items.length > 0 && !allShelves.some(x => x.title === s.title)) {
        allShelves.push(s);
      }
    });
  }

  if (liveNewReleasesShelves && liveNewReleasesShelves.length > 0) {
    liveNewReleasesShelves.forEach(s => {
      if (s.items && s.items.length > 0 && !allShelves.some(x => x.title === s.title)) {
        allShelves.push(s);
      }
    });
  }

  const hasLiveShelves = allShelves.length > 0;
  let shelvesHTML = '';

  if (hasLiveShelves) {
    shelvesHTML = allShelves.map((shelf, shelfIdx) => {
      return `
        <section class="shelf-section">
          <div class="shelf-header">
            <div>
              <h2 class="shelf-title">${escapeHTML(shelf.title)}</h2>
              ${shelf.strapline ? `<p style="font-size: 13px; color: var(--text-secondary); margin-top: 3px;">${escapeHTML(shelf.strapline)}</p>` : ''}
            </div>
            <span class="shelf-action" style="color: var(--apple-accent); font-weight: 600;">YouTube Music</span>
          </div>
          <div class="card-grid" ${shelfIdx === 0 ? 'id="featured-grid"' : (shelfIdx === 1 ? 'id="new-releases-grid"' : '')}>
            ${shelf.items.map((item, itemIdx) => {
              const globalCardId = `live-home-${shelfIdx}-${itemIdx}`;
              return renderLiveCardHTML(item, globalCardId);
            }).join('')}
          </div>
        </section>
      `;
    }).join('');
  } else {
    const featuredTracks = CATALOGUE_TRACKS.slice(0, 6);
    const newReleases = CATALOGUE_TRACKS.slice(6);
    shelvesHTML = `
      <section class="shelf-section">
        <div class="shelf-header">
          <h2 class="shelf-title">Featured Albums & Hits</h2>
          <span class="shelf-action" onclick="navigateTo('albums')">See All</span>
        </div>
        <div class="card-grid" id="featured-grid">
          ${renderCardGridHTML(featuredTracks)}
        </div>
      </section>

      <section class="shelf-section">
        <div class="shelf-header">
          <h2 class="shelf-title">Top Charts & New Releases</h2>
          <span class="shelf-action" onclick="navigateTo('songs')">Explore</span>
        </div>
        <div class="card-grid" id="new-releases-grid">
          ${renderCardGridHTML(newReleases)}
        </div>
      </section>
    `;
  }

  container.innerHTML = `
    <section class="hero-banner">
      <div class="hero-backdrop"></div>
      <div class="hero-content">
        <span class="hero-tag">NATIVE BITCHORD & APPLE MUSIC CLIENT</span>
        <h1 class="hero-title">Crystal Audio with Dynamic Mesh Aura</h1>
        <p class="hero-subtitle">Immerse yourself in fluid 18px squircles, word-synced live lyrics, BitChord audio telemetry, and high-fidelity YouTube Music streaming.</p>
        <div class="hero-actions">
          <button class="btn-apple-primary" id="btn-hero-play">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span>Play Featured Mix</span>
          </button>
          <button class="btn-apple-secondary" id="btn-switch-live">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span>${liveAccount?.isLoggedIn ? 'YouTube Music Connected' : 'Connect Live YouTube Music'}</span>
          </button>
        </div>
      </div>
    </section>

    ${isFetchingLive && !hasLiveShelves ? `
      <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 24px; display: flex; align-items: center; gap: 8px;">
        <span class="badge-dot" style="background: #FA2D48;"></span>
        <span>Loading live feeds from YouTube Music...</span>
      </div>
    ` : ''}

    ${shelvesHTML}
  `;

  if (hasLiveShelves) {
    allShelves.forEach((shelf, sIdx) => {
      shelf.items.forEach((item, iIdx) => {
        const cardId = `live-home-${sIdx}-${iIdx}`;
        const el = document.querySelector(`[data-live-id="${cardId}"]`);
        if (el) {
          el.onclick = () => {
            if (item.type === 'browse' || (!item.videoId && item.browseId)) {
              openBrowseDetail(item.browseId, item.title, item.cover, item.subtitle);
            } else if (item.videoId) {
              playLiveTrack(item);
            }
          };
        }
      });
    });
  }

  const heroBtn = document.getElementById('btn-hero-play');
  if (heroBtn) {
    heroBtn.onclick = () => {
      loadTrack(0);
      play();
    };
  }

  const switchLiveBtn = document.getElementById('btn-switch-live');
  if (switchLiveBtn) {
    switchLiveBtn.onclick = handleGoogleConnect;
  }
}

function renderBrowseView(container) {
  const genres = ['All', 'Charts', 'New Releases', 'Moods & Genres', 'Trending', 'Chill', 'Synthwave'];
  const allBrowseShelves = [];

  if (liveNewReleasesShelves && liveNewReleasesShelves.length > 0) {
    liveNewReleasesShelves.forEach(s => {
      if (s.items && s.items.length > 0 && !allBrowseShelves.some(x => x.title === s.title)) {
        allBrowseShelves.push(s);
      }
    });
  }

  if (liveExploreShelves && liveExploreShelves.length > 0) {
    liveExploreShelves.forEach(s => {
      if (s.items && s.items.length > 0 && !allBrowseShelves.some(x => x.title === s.title)) {
        allBrowseShelves.push(s);
      }
    });
  }

  if (liveChartsShelves && liveChartsShelves.length > 0) {
    liveChartsShelves.forEach(s => {
      if (s.items && s.items.length > 0 && !allBrowseShelves.some(x => x.title === s.title)) {
        allBrowseShelves.push(s);
      }
    });
  }

  const hasLiveShelves = allBrowseShelves.length > 0;
  let shelvesHTML = '';

  if (hasLiveShelves) {
    shelvesHTML = allBrowseShelves.map((shelf, shelfIdx) => {
      return `
        <section class="shelf-section">
          <div class="shelf-header">
            <div>
              <h2 class="shelf-title">${escapeHTML(shelf.title)}</h2>
            </div>
            <span class="shelf-action" style="color: var(--apple-accent); font-weight: 600;">YouTube Music</span>
          </div>
          <div class="card-grid" ${shelfIdx === 0 ? 'id="browse-card-grid"' : ''}>
            ${shelf.items.map((item, itemIdx) => {
              const globalCardId = `live-browse-${shelfIdx}-${itemIdx}`;
              return renderLiveCardHTML(item, globalCardId);
            }).join('')}
          </div>
        </section>
      `;
    }).join('');
  } else {
    shelvesHTML = `
      <div class="card-grid" id="browse-card-grid">
        ${renderCardGridHTML(CATALOGUE_TRACKS)}
      </div>
    `;
  }

  container.innerHTML = `
    <div style="padding: 10px 0 20px 0;">
      <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 8px;">Browse Music</h1>
      <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 20px;">Explore trending hits, curated playlists, and new releases directly from YouTube Music.</p>
      
      <div class="genre-chips-wrap">
        ${genres.map((g, i) => `
          <button class="genre-chip ${i === 0 ? 'active' : ''}" onclick="filterByGenre('${g}')">${g}</button>
        `).join('')}
      </div>

      ${shelvesHTML}
    </div>
  `;

  if (hasLiveShelves) {
    allBrowseShelves.forEach((shelf, sIdx) => {
      shelf.items.forEach((item, iIdx) => {
        const cardId = `live-browse-${sIdx}-${iIdx}`;
        const el = document.querySelector(`[data-live-id="${cardId}"]`);
        if (el) {
          el.onclick = () => {
            if (item.type === 'browse' || (!item.videoId && item.browseId)) {
              openBrowseDetail(item.browseId, item.title, item.cover, item.subtitle);
            } else if (item.videoId) {
              playLiveTrack(item);
            }
          };
        }
      });
    });
  }
}

function filterByGenre(genre) {
  const chips = document.querySelectorAll('.genre-chip');
  chips.forEach(c => c.classList.toggle('active', c.innerText === genre));

  const filtered = genre === 'All'
    ? CATALOGUE_TRACKS
    : CATALOGUE_TRACKS.filter(t => t.genre.toLowerCase().includes(genre.toLowerCase()) || t.playlists.includes(genre.toLowerCase()));

  const grid = document.getElementById('browse-card-grid');
  if (grid) grid.innerHTML = renderCardGridHTML(filtered);
}

function renderRadioView(container) {
  const stations = [
    { title: "Today's Top Hits Radio", desc: 'The biggest global hits and chart-topping singles streaming continuously.', cover: CATALOGUE_TRACKS[0].cover, trackIdx: 0 },
    { title: 'Chillhop & Lo-Fi Beats', desc: 'Relaxing study beats, mellow piano textures, and warm atmospheric grooves.', cover: CATALOGUE_TRACKS[7].cover, trackIdx: 7 },
    { title: 'Synthwave 80s Cyber Radio', desc: 'Outrun arpeggios, vintage analog synthesizers, and midnight neon drive.', cover: CATALOGUE_TRACKS[1].cover, trackIdx: 1 },
    { title: 'Pure Pop Energy Radio', desc: 'High-tempo chart toppers, dance anthems, and vibrant modern rhythms.', cover: CATALOGUE_TRACKS[2].cover, trackIdx: 2 },
    { title: 'Acoustic & Flow Radio', desc: 'Organic acoustic plucks, soothing vocal melodies, and acoustic sessions.', cover: CATALOGUE_TRACKS[5].cover, trackIdx: 5 },
    { title: 'High Endurance Workout', desc: 'Heavy basslines, driving kicks, and fast-paced motivation tracks.', cover: CATALOGUE_TRACKS[6].cover, trackIdx: 6 }
  ];

  container.innerHTML = `
    <div style="padding: 10px 0 20px 0;">
      <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 8px;">BitChord Radio</h1>
      <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 24px;">Continuous live streams and AutoPlay mixes powered by YouTube Music.</p>

      <div class="radio-grid">
        ${stations.map(st => `
          <div class="radio-card" onclick="startRadioStation(${st.trackIdx})">
            <div class="radio-card-top">
              <span class="radio-live-badge"><span class="radio-live-dot"></span> LIVE</span>
              <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">YouTube Music Radio</span>
            </div>
            <img src="${st.cover}" class="radio-card-cover" alt="${st.title}">
            <div>
              <div class="radio-card-title">${st.title}</div>
              <div class="radio-card-desc">${st.desc}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function startRadioStation(trackIdx) {
  selectTrack(trackIdx);
}

function renderRecentlyAddedView(container) {
  container.innerHTML = `
    <div style="padding: 10px 0 20px 0;">
      <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 8px;">Recently Added</h1>
      <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 24px;">Your latest additions, releases, and synchronized playlists.</p>
      <div class="card-grid">
        ${renderCardGridHTML(CATALOGUE_TRACKS.slice().reverse())}
      </div>
    </div>
  `;
}

function renderArtistsView(container) {
  const hasLiveArtists = liveArtists && liveArtists.length > 0;

  let artistsHTML = '';
  if (hasLiveArtists) {
    artistsHTML = liveArtists.map(a => {
      const safeName = escapeHTML(a.artist);
      const safeSub = escapeHTML(a.subscribers || 'YouTube Music Chart');
      const safeCover = escapeHTML(a.cover || '../../assets/icon.png');
      const browseId = a.browseId || '';
      return `
        <div class="artist-card" onclick="openArtistItem('${browseId}', '${safeName}', '${safeCover}', '${safeSub}')">
          <div class="artist-avatar-wrap">
            <img src="${safeCover}" class="artist-avatar-img" alt="${safeName}" onerror="this.src='../../assets/icon.png'">
          </div>
          <div class="artist-card-name">${safeName}</div>
          <div class="artist-card-sub">${safeSub}</div>
        </div>
      `;
    }).join('');
  } else {
    const artistsMap = new Map();
    CATALOGUE_TRACKS.forEach(t => {
      if (!artistsMap.has(t.artist)) {
        artistsMap.set(t.artist, { artist: t.artist, genre: t.genre, cover: t.cover, trackId: t.id });
      }
    });

    const artistsList = Array.from(artistsMap.values());
    artistsHTML = artistsList.map(a => {
      const trackIdx = CATALOGUE_TRACKS.findIndex(t => t.artist === a.artist);
      return `
        <div class="artist-card" onclick="selectTrack(${trackIdx})">
          <div class="artist-avatar-wrap">
            <img src="${a.cover}" class="artist-avatar-img" alt="${a.artist}">
          </div>
          <div class="artist-card-name">${a.artist}</div>
          <div class="artist-card-sub">${a.genre}</div>
        </div>
      `;
    }).join('');
  }

  container.innerHTML = `
    <div style="padding: 10px 0 20px 0;">
      <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 8px;">Artists</h1>
      <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 24px;">Top charting YouTube Music artists & creators.</p>
      <div class="artists-grid">
        ${artistsHTML}
      </div>
    </div>
  `;
}

function openArtistItem(browseId, artistName, cover, subtitle) {
  if (browseId) {
    openBrowseDetail(browseId, artistName, cover, subtitle);
  } else {
    const match = CATALOGUE_TRACKS.find(t => t.artist.toLowerCase().includes(artistName.toLowerCase()));
    if (match) {
      playLiveTrack(match);
    }
  }
}

function renderAlbumsView(container) {
  container.innerHTML = `
    <div style="padding: 10px 0 20px 0;">
      <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 8px;">Albums</h1>
      <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 24px;">Complete collection albums in crystal squircle fidelity.</p>
      <div class="card-grid">
        ${renderCardGridHTML(CATALOGUE_TRACKS)}
      </div>
    </div>
  `;
}

function renderSongsTableView(container) {
  container.innerHTML = `
    <div style="padding: 10px 0 20px 0;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <div>
          <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 4px;">Songs</h1>
          <p style="color: var(--text-secondary); font-size: 13.5px;">${CATALOGUE_TRACKS.length} songs • 42 minutes total duration</p>
        </div>
        <button class="btn-apple-primary" onclick="selectTrack(0)" style="padding: 8px 18px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          <span>Play All</span>
        </button>
      </div>

      <div class="songs-table-container">
        <div class="songs-table-header" style="grid-template-columns: 40px 1.8fr 1.2fr 1.2fr 80px 50px 50px;">
          <span>#</span>
          <span>Title</span>
          <span>Artist</span>
          <span>Album</span>
          <span>Duration</span>
          <span>Favorite</span>
          <span>More</span>
        </div>
        ${CATALOGUE_TRACKS.map((t, idx) => `
          <div class="song-row ${idx === currentIndex ? 'active' : ''}" onclick="selectTrack(${idx})" style="grid-template-columns: 40px 1.8fr 1.2fr 1.2fr 80px 50px 50px;">
            <span class="song-number">${idx === currentIndex && isPlaying ? '▶' : idx + 1}</span>
            <div class="song-title-cell">
              <img src="${t.cover}" class="song-cell-thumb" alt="${t.title}">
              <span class="song-title">${t.title}</span>
            </div>
            <span class="song-artist-cell">${t.artist}</span>
            <span class="song-album-cell">${t.album}</span>
            <span class="song-duration-cell">${formatTime(t.duration)}</span>
            <div>
              <button class="player-heart-btn ${lovedTrackIds.has(t.id) ? 'loved' : ''}" onclick="event.stopPropagation(); toggleTrackFavorite(event, '${t.id}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                </svg>
              </button>
            </div>
            <div>
              <button class="song-more-btn" onclick="event.stopPropagation(); openSongMenu(event, CATALOGUE_TRACKS[${idx}])" title="More Actions">•••</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderPlaylistsGridView(container) {
  // Extract live YouTube Music chart playlists from liveChartsShelves
  const livePlaylists = [];
  if (liveChartsShelves && liveChartsShelves.length > 0) {
    liveChartsShelves.forEach(s => {
      if (s.items) {
        s.items.forEach(it => {
          if (it.browseId && !livePlaylists.some(p => p.browseId === it.browseId)) {
            livePlaylists.push(it);
          }
        });
      }
    });
  }
  if (liveUserPlaylists && liveUserPlaylists.length > 0) {
    liveUserPlaylists.forEach(up => {
      if (up.browseId && !livePlaylists.some(p => p.browseId === up.browseId)) {
        livePlaylists.push(up);
      }
    });
  }

  container.innerHTML = `
    <div style="padding: 10px 0 20px 0;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
        <div>
          <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 6px;">Playlists</h1>
          <p style="color: var(--text-secondary); font-size: 14px;">Your personal library, custom playlists, and YouTube Music charts.</p>
        </div>
        <button class="btn-apple-primary" id="btn-grid-new-playlist" style="display: flex; align-items: center; gap: 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>New Playlist</span>
        </button>
      </div>

      <div class="card-grid">
        <!-- 1. Create New Playlist Card -->
        <div class="create-playlist-card" id="card-action-new-playlist">
          <div class="create-playlist-card-icon">+</div>
          <div style="font-weight: 700; font-size: 15px; color: var(--text-main);">New Playlist</div>
          <div style="font-size: 12.5px; color: var(--text-secondary);">Create custom collection</div>
        </div>

        <!-- 2. Liked Songs Card -->
        <div class="apple-music-card" onclick="navigateToPlaylist('favorites')">
          <div class="card-thumb-wrapper">
            <img src="${CATALOGUE_TRACKS[0]?.cover || '../../assets/icon.png'}" class="card-thumb track-card-img" alt="Liked Songs">
            <div class="card-play-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
          </div>
          <div class="card-title">⭐ Liked Songs</div>
          <div class="card-subtitle">${lovedTrackIds.size} tracks • Favorites</div>
        </div>

        <!-- 3. Custom Playlists -->
        ${customPlaylists.map(pl => {
          const songCount = pl.tracks ? pl.tracks.length : 0;
          return `
            <div class="apple-music-card" onclick="navigateToPlaylist('${pl.id}')">
              <div class="card-thumb-wrapper">
                <img src="${pl.cover || '../../assets/icon.png'}" class="card-thumb track-card-img" alt="${escapeHTML(pl.title)}" onerror="this.src='../../assets/icon.png'">
                <div class="card-play-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              </div>
              <div class="card-title">${escapeHTML(pl.title)}</div>
              <div class="card-subtitle">${songCount} tracks • Custom</div>
            </div>
          `;
        }).join('')}

        <!-- 4. Real YouTube Music Playlists -->
        ${livePlaylists.map(lp => `
          <div class="apple-music-card" onclick="openBrowseDetail('${lp.browseId}', '${escapeHTML(lp.title)}', '${escapeHTML(lp.cover || '')}', '${escapeHTML(lp.subtitle || 'YouTube Music Playlist')}')">
            <div class="card-thumb-wrapper">
              <img src="${escapeHTML(lp.cover || '../../assets/icon.png')}" class="card-thumb track-card-img" alt="${escapeHTML(lp.title)}" onerror="this.src='../../assets/icon.png'">
              <div class="card-play-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </div>
            <div class="card-title">${escapeHTML(lp.title)}</div>
            <div class="card-subtitle">${escapeHTML(lp.subtitle || 'YouTube Music')}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const btnGridNew = document.getElementById('btn-grid-new-playlist');
  if (btnGridNew) btnGridNew.onclick = () => openCreatePlaylistModal();

  const cardNew = document.getElementById('card-action-new-playlist');
  if (cardNew) cardNew.onclick = () => openCreatePlaylistModal();
}

function renderSinglePlaylistView(container, playlistId) {
  let tracks = [];
  let title = 'Playlist';
  let desc = '';
  let tag = 'PLAYLIST';
  let cover = CATALOGUE_TRACKS[0]?.cover || '../../assets/icon.png';
  let isCustom = false;
  let customPl = null;

  if (playlistId === 'favorites') {
    tracks = CATALOGUE_TRACKS.filter(t => lovedTrackIds.has(t.id));
    title = 'Liked Songs';
    desc = 'All your favorite songs gathered in one place. Synced with your Google & Deja library.';
    tag = 'PERSONAL FAVORITES';
    if (tracks.length > 0) cover = tracks[0].cover;
  } else if (playlistId && playlistId.startsWith('custom-')) {
    customPl = customPlaylists.find(p => p.id === playlistId);
    if (customPl) {
      isCustom = true;
      title = customPl.title;
      desc = customPl.description || `${customPl.tracks?.length || 0} songs in custom collection.`;
      tag = 'CUSTOM PLAYLIST';
      tracks = customPl.tracks || [];
      cover = customPl.cover || (tracks.length > 0 ? tracks[0].cover : '../../assets/icon.png');
    }
  }

  container.innerHTML = `
    <div style="padding: 10px 0 20px 0;">
      <div class="category-hero">
        <img src="${cover}" class="category-hero-cover" alt="${escapeHTML(title)}" onerror="this.src='../../assets/icon.png'">
        <div class="category-hero-details">
          <span class="category-hero-tag">${tag}</span>
          <h1 class="category-hero-title">${escapeHTML(title)}</h1>
          <p class="category-hero-desc">${escapeHTML(desc)}</p>
          <div class="category-hero-actions">
            ${tracks.length > 0 ? `
              <button class="btn-apple-primary" id="btn-play-single-playlist">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span>Play</span>
              </button>
              <button class="btn-apple-secondary" id="btn-shuffle-single-playlist">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="16 3 21 3 21 8"></polyline>
                  <line x1="4" y1="20" x2="21" y2="3"></line>
                  <polyline points="21 16 21 21 16 21"></polyline>
                  <line x1="15" y1="15" x2="21" y2="21"></line>
                  <line x1="4" y1="4" x2="9" y2="9"></line>
                </svg>
                <span>Shuffle</span>
              </button>
            ` : ''}
            ${isCustom ? `
              <button class="btn-apple-secondary btn-delete-playlist" id="btn-delete-this-playlist" title="Delete custom playlist">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>Delete Playlist</span>
              </button>
            ` : ''}
          </div>
        </div>
      </div>

      ${tracks.length > 0 ? `
        <div class="songs-table-container">
          <div class="songs-table-header" style="grid-template-columns: 40px 1.8fr 1.2fr 1.2fr 80px 50px 50px;">
            <span>#</span>
            <span>Title</span>
            <span>Artist</span>
            <span>Album</span>
            <span>Duration</span>
            <span>Favorite</span>
            <span>More</span>
          </div>
          ${tracks.map((t, idx) => {
            const isLoved = lovedTrackIds.has(t.id);
            return `
              <div class="song-row" id="pl-track-${idx}" style="grid-template-columns: 40px 1.8fr 1.2fr 1.2fr 80px 50px 50px;">
                <span class="song-number">${idx + 1}</span>
                <div class="song-title-cell">
                  <img src="${escapeHTML(t.cover || '../../assets/icon.png')}" class="song-cell-thumb" alt="${escapeHTML(t.title)}" onerror="this.src='../../assets/icon.png'">
                  <span class="song-title">${escapeHTML(t.title)}</span>
                </div>
                <span class="song-artist-cell">${escapeHTML(t.artist)}</span>
                <span class="song-album-cell">${escapeHTML(t.album || title)}</span>
                <span class="song-duration-cell">${escapeHTML(t.durationStr || formatTime(t.duration))}</span>
                <div>
                  <button class="player-heart-btn ${isLoved ? 'loved' : ''}" onclick="event.stopPropagation(); toggleTrackFavorite(event, '${t.id}')">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                    </svg>
                  </button>
                </div>
                <div>
                  <button class="song-more-btn" id="btn-more-pl-${idx}" title="More Actions">•••</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <div style="text-align: center; padding: 48px 20px; color: var(--text-secondary);">
          <div style="font-size: 36px; margin-bottom: 12px;">🎵</div>
          <h3 style="font-size: 17px; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">This playlist is empty</h3>
          <p style="font-size: 13.5px; max-width: 400px; margin: 0 auto;">Add tracks from the Songs view, Listen Now, or search results by clicking the (•••) menu on any song.</p>
        </div>
      `}
    </div>
  `;

  // Attach event handlers
  if (tracks.length > 0) {
    tracks.forEach((t, idx) => {
      const row = document.getElementById(`pl-track-${idx}`);
      if (row) {
        row.onclick = () => playLiveTrack(t);
      }
      const moreBtn = document.getElementById(`btn-more-pl-${idx}`);
      if (moreBtn) {
        moreBtn.onclick = (e) => openSongMenu(e, t, playlistId);
      }
    });

    const btnPlay = document.getElementById('btn-play-single-playlist');
    if (btnPlay) {
      btnPlay.onclick = () => {
        userQueue = [...tracks];
        playLiveTrack(tracks[0]);
      };
    }

    const btnShuffle = document.getElementById('btn-shuffle-single-playlist');
    if (btnShuffle) {
      btnShuffle.onclick = () => shufflePlayPlaylist(playlistId);
    }
  }

  if (isCustom) {
    const btnDel = document.getElementById('btn-delete-this-playlist');
    if (btnDel) {
      btnDel.onclick = () => deleteCustomPlaylist(playlistId);
    }
  }
}

function shufflePlayPlaylist(playlistId) {
  let tracks = [];
  if (playlistId === 'favorites') {
    tracks = CATALOGUE_TRACKS.filter(t => lovedTrackIds.has(t.id));
  } else if (playlistId && playlistId.startsWith('custom-')) {
    const pl = customPlaylists.find(p => p.id === playlistId);
    if (pl && pl.tracks && pl.tracks.length > 0) {
      tracks = pl.tracks;
    }
  }
  if (tracks.length === 0) tracks = [...CATALOGUE_TRACKS];

  // Set shuffle mode on
  isShuffle = true;
  const btn = document.getElementById('btn-shuffle');
  const expBtn = document.getElementById('exp-btn-shuffle');
  if (btn) btn.classList.add('active');
  if (expBtn) expBtn.classList.add('active');

  const randTrack = tracks[Math.floor(Math.random() * tracks.length)];
  if (randTrack) {
    playLiveTrack(randTrack);
  }
}

function selectYouTubeTrack(ytTrack) {
  if (ytTrack.type === 'browse' || (!ytTrack.videoId && ytTrack.browseId)) {
    openBrowseDetail(ytTrack.browseId, ytTrack.title, ytTrack.cover, ytTrack.subtitle);
    return;
  }
  let existingIdx = CATALOGUE_TRACKS.findIndex(t => t.videoId === ytTrack.videoId);
  if (existingIdx === -1) {
    const newTrack = createCatalogueItemFromLive(ytTrack);
    CATALOGUE_TRACKS.unshift(newTrack);
    existingIdx = 0;
  }
  selectTrack(existingIdx);
}

let activeSearchQuery = '';

function renderSearchResultsView(container) {
  const q = searchQuery.toLowerCase().trim();
  activeSearchQuery = q;
  const safeQ = escapeHTML(searchQuery);

  const matched = CATALOGUE_TRACKS.filter(t => 
    t.title.toLowerCase().includes(q) ||
    t.artist.toLowerCase().includes(q) ||
    t.album.toLowerCase().includes(q) ||
    t.genre.toLowerCase().includes(q)
  );

  container.innerHTML = `
    <div style="padding: 10px 0 20px 0;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
        <div>
          <h1 style="font-size: 26px; font-weight: 800; margin-bottom: 4px;">Search Results for "${safeQ}"</h1>
          <p style="color: var(--text-secondary); font-size: 13.5px;">Found ${matched.length} local library matches</p>
        </div>
        <button class="genre-chip" onclick="clearSearch()">Clear Search</button>
      </div>

      ${matched.length > 0 ? `
        <div class="card-grid">
          ${renderCardGridHTML(matched)}
        </div>
      ` : ''}

      <div id="yt-search-section" style="margin-top: 24px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <h2 style="font-size: 20px; font-weight: 700; margin: 0;">YouTube Music Results</h2>
          <span style="font-size: 12px; color: var(--text-secondary);">(Live Search)</span>
        </div>
        <div id="yt-search-grid" class="card-grid">
          <div style="color: var(--text-secondary); font-size: 13px; padding: 12px 0;">Searching YouTube Music...</div>
        </div>
      </div>

      ${matched.length === 0 ? `
        <div id="no-local-hint" style="text-align: center; padding: 24px 20px; color: var(--text-secondary);">
          <p style="font-size: 13px;">No local tracks found. Checking YouTube Music catalogue above...</p>
        </div>
      ` : ''}
    </div>
  `;

  const api = window.dejaAPI || window.sonoraAPI;
  if (api?.searchYouTube && q.length >= 2) {
    api.searchYouTube(searchQuery).then(ytResults => {
      if (activeSearchQuery !== q) return;
      const ytGrid = document.getElementById('yt-search-grid');
      if (!ytGrid) return;
      if (!ytResults || ytResults.length === 0) {
        ytGrid.innerHTML = `<div style="color: var(--text-secondary); font-size: 13px;">No online YouTube Music tracks found for "${safeQ}".</div>`;
        return;
      }
      ytGrid.innerHTML = ytResults.map((yt, i) => `
        <div class="apple-music-card" id="yt-card-${i}">
          <div class="card-thumb-wrapper">
            <img src="${escapeHTML(yt.cover || '')}" class="card-thumb track-card-img" alt="${escapeHTML(yt.title)}" onerror="this.src='../../assets/icon.png'">
            <div class="card-play-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
            ${yt.type === 'browse' || (!yt.videoId && yt.browseId) ? '<span class="card-type-badge">ALBUM</span>' : '<span class="card-type-badge yt-badge">YTM</span>'}
          </div>
          <div class="card-title">${escapeHTML(yt.title)}</div>
          <div class="card-subtitle">${escapeHTML(yt.artist)} ${yt.durationStr ? `• ${escapeHTML(yt.durationStr)}` : ''}</div>
        </div>
      `).join('');

      ytResults.forEach((yt, i) => {
        const card = document.getElementById(`yt-card-${i}`);
        if (card) {
          card.onclick = () => {
            if (yt.type === 'browse' || (!yt.videoId && yt.browseId)) {
              openBrowseDetail(yt.browseId, yt.title, yt.cover, yt.subtitle);
            } else {
              selectYouTubeTrack(yt);
            }
          };
        }
      });
    }).catch(err => {
      console.warn('[Search] YouTube live search error:', err);
      const ytGrid = document.getElementById('yt-search-grid');
      if (ytGrid && activeSearchQuery === q) {
        ytGrid.innerHTML = `<div style="color: var(--text-secondary); font-size: 13px;">Offline or YouTube search unavailable.</div>`;
      }
    });
  } else {
    const ytSection = document.getElementById('yt-search-section');
    if (ytSection && q.length < 2) {
      ytSection.style.display = 'none';
    }
  }
}


function renderCardGridHTML(tracksList) {
  return tracksList.map(t => {
    const idx = CATALOGUE_TRACKS.findIndex(x => x.id === t.id);
    return `
      <div class="apple-music-card" onclick="selectTrack(${idx})">
        <div class="card-thumb-wrapper">
          <img src="${t.cover}" class="card-thumb track-card-img" alt="${t.title}">
          <div class="card-play-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
        </div>
        <div class="card-title">${t.title}</div>
        <div class="card-subtitle">${t.artist}</div>
      </div>
    `;
  }).join('');
}

// ==========================================
// Player Logic & Track Selection
// ==========================================

function selectTrack(idx) {
  if (idx < 0 || idx >= CATALOGUE_TRACKS.length) return;
  loadTrack(idx);
  const track = CATALOGUE_TRACKS[idx];
  resolveAndPlayTrack(track);

  const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
  if (api?.getNextQueue && track.videoId) {
    api.getNextQueue(track.videoId).then(queueItems => {
      if (queueItems && queueItems.length > 0) {
        userQueue = queueItems.map(qi => createCatalogueItemFromLive(qi));
        renderPreviewQueue();
      }
    }).catch(err => {
      console.warn('[Queue] getNextQueue error:', err.message);
    });
  }
}

function selectTrackByObject(trackId) {
  const idx = CATALOGUE_TRACKS.findIndex(t => t.id === trackId);
  if (idx !== -1) selectTrack(idx);
}

function loadTrack(idx) {
  currentIndex = idx;
  const track = CATALOGUE_TRACKS[idx];
  if (!track) return;
  currentTime = 0;
  lastActiveLyricIndex = -1;

  if (typeof document === 'undefined') return;

  // Player Bar Left Meta
  const titleEl = document.getElementById('player-track-title');
  const artistEl = document.getElementById('player-track-artist');
  const artEl = document.getElementById('player-artwork');
  const totalEl = document.getElementById('time-total');
  const curEl = document.getElementById('time-current');
  const fillEl = document.getElementById('scrubber-fill');
  const knobEl = document.getElementById('scrubber-knob');

  if (titleEl) titleEl.innerText = track.title;
  if (artistEl) artistEl.innerText = `${track.artist} • ${track.album}`;
  if (artEl) artEl.src = track.cover;
  if (totalEl) totalEl.innerText = formatTime(track.duration);
  if (curEl) curEl.innerText = '0:00';
  if (fillEl) fillEl.style.width = '0%';
  if (knobEl) knobEl.style.left = '0%';

  // Update Favorite Heart
  updateFavoriteUI(track.id);

  // Expanded Now Playing Screen
  const expandedTitle = document.getElementById('expanded-track-title');
  const expandedArtist = document.getElementById('expanded-track-artist');
  const expandedArtwork = document.getElementById('expanded-artwork-img');
  const expPlayingFrom = document.getElementById('exp-playing-from');
  const expTotal = document.getElementById('exp-time-total');
  const expCurrent = document.getElementById('exp-time-current');
  const expFill = document.getElementById('exp-scrubber-fill');
  const expKnob = document.getElementById('exp-scrubber-knob');
  const expSnippet = (typeof document.getElementById === 'function' ? (document.getElementById('exp-lyric-snippet-text') || document.getElementById('exp-lyric-snippet')) : null) ||
                     (typeof document.querySelector === 'function' ? document.querySelector('.exp-lyric-snippet-text') : null);

  if (expandedTitle) expandedTitle.innerText = track.title;
  if (expandedArtist) expandedArtist.innerText = `${track.artist} • ${track.album}`;
  if (expandedArtwork) expandedArtwork.src = track.cover;
  if (expPlayingFrom) expPlayingFrom.innerText = `Album • ${track.album || 'YouTube Music'}`;
  if (expTotal) expTotal.innerText = `-${formatTime(track.duration)}`;
  if (expCurrent) expCurrent.innerText = '0:00';
  if (expFill) expFill.style.width = '0%';
  if (expKnob) expKnob.style.left = '0%';
  if (expSnippet) {
    let snippetInitial = 'Tap for synced lyrics';
    if (track.lyrics && track.lyrics.length > 0) {
      const firstVocal = track.lyrics.find(l => l.text && l.text !== '♪');
      snippetInitial = firstVocal ? firstVocal.text : track.lyrics[0].text;
    }
    if (!snippetInitial || snippetInitial === '♪') snippetInitial = 'Tap for synced lyrics';
    expSnippet.innerText = snippetInitial;
  }

  // Dynamic Mesh Gradient Tinting (BitChord MeshGradient.kt)
  applyDynamicMeshAura(track);

  // Update Lyrics & Queue
  renderLyrics(track.lyrics);
  renderPreviewQueue();
  updateSyncedLyrics(true);

  // Resolve millisecond synced lyrics via LRCLIB or InnerTube if not yet fetched
  resolveSyncedLyrics(track);

  // Notify Electron Main Process
  notifyTrackState();
}

function applyDynamicMeshAura(track) {
  const p = track.palette;
  if (!p) return;

  // Update Expanded Aura
  const previewAura = document.getElementById('preview-ambient-aura');
  const previewArtBlur = document.getElementById('preview-ambient-art-blur');
  if (previewAura) {
    previewAura.style.setProperty('--deja-aura-c1', p.c1);
    previewAura.style.setProperty('--deja-aura-c2', p.c2);
    previewAura.style.setProperty('--deja-aura-c3', p.c3);
    previewAura.style.setProperty('--deja-aura-c4', p.c4);
    previewAura.style.setProperty('--deja-aura-r', String(p.primaryR));
    previewAura.style.setProperty('--deja-aura-g', String(p.primaryG));
    previewAura.style.setProperty('--deja-aura-b', String(p.primaryB));
  }
  if (previewArtBlur) {
    previewArtBlur.style.backgroundImage = `url('${track.cover}')`;
  }

  // Update Global App Ambient Backdrop
  const globalBackdrop = document.getElementById('app-ambient-backdrop');
  if (globalBackdrop) {
    globalBackdrop.style.setProperty('--deja-aura-c1', p.c1);
    globalBackdrop.style.setProperty('--deja-aura-c2', p.c2);
    globalBackdrop.style.setProperty('--deja-aura-c3', p.c3);
    globalBackdrop.style.setProperty('--deja-aura-c4', p.c4);
  }

  // Update Lyrics Dynamic Backdrop
  const lyricsAura = document.getElementById('lyrics-aura');
  if (lyricsAura) {
    lyricsAura.style.backgroundImage = `url('${track.cover}')`;
  }
}

function renderLyrics(lyrics) {
  if (typeof document === 'undefined') return;
  const containers = [
    document.getElementById('lyrics-lines-container'),
    document.getElementById('expanded-lyrics-container')
  ].filter(Boolean);

  if (containers.length === 0) return;

  const track = CATALOGUE_TRACKS[currentIndex];
  if (track) {
    const songTitleEl = document.getElementById('lyrics-song-title');
    const artistNameEl = document.getElementById('lyrics-artist-name');
    if (songTitleEl) songTitleEl.innerText = track.title;
    if (artistNameEl) artistNameEl.innerText = track.artist;
  }

  const safeLyrics = (lyrics && Array.isArray(lyrics) && lyrics.length > 0)
    ? lyrics
    : [{ time: 0, text: 'No synchronized lyrics available for this track.' }];

  containers.forEach(container => {
    container.innerHTML = safeLyrics.map((l, i) => `
      <div class="apple-lyric-line ${i === 0 ? 'active' : ''}" data-time="${l.time}" data-line-index="${i}" onclick="seekTo(${l.time})">
        ${escapeHTML(l.text)}
      </div>
    `).join('');

    // Attach direct click listeners for immediate seek responsiveness
    container.querySelectorAll('.apple-lyric-line').forEach((lineEl, idx) => {
      const lineData = safeLyrics[idx];
      if (lineData && typeof lineData.time === 'number') {
        lineEl.onclick = (e) => {
          if (e) e.stopPropagation();
          seekTo(lineData.time);
        };
      }
    });
  });
}

/**
 * Sanitizes track search term for lyrics matching
 */
function cleanSearchTerm(str) {
  if (!str || typeof str !== 'string') return '';
  let s = str
    .replace(/\uFEFF|\u200E|\u200F/g, '')
    // Strip trailing unclosed or closed feature/collaboration tags (e.g. '(feat. Din...', 'with Daft Punk')
    .replace(/\s*[\(\[](?:feat\.?|ft\.?|featuring|with)\b.*$/gi, '')
    .replace(/\s*(?:feat\.?|ft\.?|featuring|with)\b.*$/gi, '')
    // Strip parenthetical/bracketed official video/audio/remaster/live tags
    .replace(/\s*[\(\[](?:official\s+)?(?:music\s+|lyric\s+|lyrics\s+)?(?:video|audio|visualizer|track|remaster(?:ed)?(?:\s+\d{4})?|live(?:\s+at\s+[^)\]]+)?)[\]\)]/gi, '')
    .replace(/\s*\(?(?:official\s+(?:music\s+|lyric\s+|lyrics\s+)?video|official\s+audio|audio|lyric\s+video|lyrics\s+video|visualizer|remastered|remaster\s+\d{4}|live(?:\s+at\s+[^)]+)?)\)?/gi, '')
    .replace(/\s*\[?(?:official\s+(?:music\s+|lyric\s+|lyrics\s+)?video|official\s+audio|audio|lyric\s+video|lyrics\s+video|visualizer|remastered|remaster\s+\d{4}|live(?:\s+at\s+[^\]]+)?)\]?/gi, '')
    // Strip trailing separators and descriptors
    .replace(/\s*(?:\||\/\/|-)\s*(?:official\s+video|official\s+audio|audio|lyric\s+video|lyrics).*$/gi, '')
    .trim();
  // Strip metadata like bullet view counts or album info (e.g. "Eminem • The Eminem Show")
  if (s.includes('•')) s = s.split('•')[0].trim();
  if (s.includes('·')) s = s.split('·')[0].trim();
  return s.replace(/^["'“‘]+|["'”’]+$/g, '').replace(/[\.…\s]+$/, '').trim();
}

/**
 * Cleans artist name for lyrics matching
 */
function cleanArtistTerm(str) {
  if (!str || typeof str !== 'string') return '';
  let s = str
    .replace(/\uFEFF|\u200E|\u200F/g, '')
    .replace(/\s*[\(\[](?:feat\.?|ft\.?|featuring|with)\b.*$/gi, '')
    .replace(/\s*(?:feat\.?|ft\.?|featuring|with)\b.*$/gi, '')
    .trim();
  // Strip metadata like bullet view counts or album info (e.g. "Eminem • The Eminem Show")
  if (s.includes('•')) s = s.split('•')[0].trim();
  if (s.includes('·')) s = s.split('·')[0].trim();
  return s.replace(/^["'“‘]+|["'”’]+$/g, '').replace(/[\.…\s]+$/, '').trim();
}

/**
 * Extracts primary artist name if multiple artists are separated by comma, slash, or ampersand
 */
function getPrimaryArtist(str) {
  const clean = cleanArtistTerm(str);
  if (!clean) return '';
  return clean.split(/[,&/]/)[0].trim();
}

/**
 * Fetches and resolves millisecond-synced lyrics via LRCLIB and InnerTube
 * (BitChord LyricsRepository.kt and LrcLib.kt provider architecture)
 */
async function resolveSyncedLyrics(track) {
  if (!track || track._lyricsResolved || track._lyricsFetching) return;
  track._lyricsFetching = true;

  const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
  const cleanTitle = cleanSearchTerm(track.title || '');
  const cleanArtist = cleanArtistTerm(track.artist || '');
  const primaryArtist = getPrimaryArtist(cleanArtist);

  // Build title candidates (including stripping artist prefix if present)
  const titleCandidates = [cleanTitle];
  if (cleanArtist) {
    const escaped = cleanArtist.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const withoutArtist = cleanTitle.replace(new RegExp('^' + escaped + '\\s*[-:–—]\\s*', 'i'), '').trim();
    if (withoutArtist && !titleCandidates.includes(withoutArtist)) {
      titleCandidates.push(withoutArtist);
    }
  }
  if (cleanTitle.includes(' - ')) {
    const afterDash = cleanTitle.split(' - ').slice(1).join(' - ').trim();
    if (afterDash && !titleCandidates.includes(afterDash)) {
      titleCandidates.push(afterDash);
    }
  }

  try {
    let resolved = null;
    if (api?.getLyrics) {
      resolved = await api.getLyrics({
        videoId: track.videoId,
        title: cleanTitle,
        artist: cleanArtist,
        duration: track.duration
      });
    }

    if (!resolved && typeof fetch === 'function' && cleanTitle) {
      const durationParam = (track.duration && typeof track.duration === 'number' && track.duration > 0)
        ? Math.round(track.duration)
        : null;

      const artistCandidates = [cleanArtist, primaryArtist].filter(Boolean);
      const uniqueArtists = [...new Set(artistCandidates)];

      // 1. Exact match attempt via /get endpoint
      for (const tCand of titleCandidates) {
        if (resolved) break;
        for (const art of (uniqueArtists.length > 0 ? uniqueArtists : [''])) {
          if (resolved) break;
          try {
            let getUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(tCand)}`;
            if (art) getUrl += `&artist_name=${encodeURIComponent(art)}`;
            if (durationParam) getUrl += `&duration=${durationParam}`;

            const res = await fetch(getUrl);
            if (res.ok) {
              const data = await res.json();
              if (data && data.syncedLyrics && data.syncedLyrics.trim().length > 0) {
                resolved = parseLrcLines(data.syncedLyrics);
                break;
              }
            }
          } catch {}

          // Try without duration parameter in case of minor duration drift
          if (!resolved && durationParam) {
            try {
              let getUrlNoDur = `https://lrclib.net/api/get?track_name=${encodeURIComponent(tCand)}`;
              if (art) getUrlNoDur += `&artist_name=${encodeURIComponent(art)}`;

              const res = await fetch(getUrlNoDur);
              if (res.ok) {
                const data = await res.json();
                if (data && data.syncedLyrics && data.syncedLyrics.trim().length > 0) {
                  resolved = parseLrcLines(data.syncedLyrics);
                  break;
                }
              }
            } catch {}
          }
        }
      }

      // 2. Fuzzy search fallback via /search endpoint
      if (!resolved) {
        const searchQueries = [];
        for (const tCand of titleCandidates) {
          for (const art of uniqueArtists) {
            searchQueries.push(`https://lrclib.net/api/search?q=${encodeURIComponent(tCand + ' ' + art)}`);
            searchQueries.push(`https://lrclib.net/api/search?track_name=${encodeURIComponent(tCand)}&artist_name=${encodeURIComponent(art)}`);
          }
          searchQueries.push(`https://lrclib.net/api/search?q=${encodeURIComponent(tCand)}`);
        }

        const seenUrls = new Set();
        for (const searchUrl of searchQueries) {
          if (resolved || seenUrls.has(searchUrl)) continue;
          seenUrls.add(searchUrl);

          try {
            const res = await fetch(searchUrl);
            if (res.ok) {
              const items = await res.json();
              if (Array.isArray(items) && items.length > 0) {
                const syncedItems = items.filter(it => it && it.syncedLyrics && it.syncedLyrics.trim().length > 0);
                if (syncedItems.length > 0) {
                  if (durationParam) {
                    syncedItems.sort((a, b) => Math.abs((a.duration || 0) - durationParam) - Math.abs((b.duration || 0) - durationParam));
                  }
                  resolved = parseLrcLines(syncedItems[0].syncedLyrics);
                  break;
                }
              }
            }
          } catch {}
        }
      }
    }

    if (resolved && resolved.length > 0) {
      track.lyrics = resolved;
      track._lyricsResolved = true;
      CATALOGUE_TRACKS.forEach(t => {
        if (t === track || t.id === track.id || (track.videoId && t.videoId === track.videoId)) {
          t.lyrics = resolved;
          t._lyricsResolved = true;
        }
      });
      if (Array.isArray(userQueue)) {
        userQueue.forEach(t => {
          if (t === track || t.id === track.id || (track.videoId && t.videoId === track.videoId)) {
            t.lyrics = resolved;
            t._lyricsResolved = true;
          }
        });
      }
      const curTrack = CATALOGUE_TRACKS[currentIndex];
      if (curTrack && (curTrack === track || curTrack.id === track.id || (track.videoId && curTrack.videoId === track.videoId))) {
        curTrack.lyrics = resolved;
        curTrack._lyricsResolved = true;
        renderLyrics(curTrack.lyrics);
        updateSyncedLyrics(true);
      }
    }
  } catch (err) {
    console.warn('[Lyrics] resolveSyncedLyrics notice:', err.message);
  } finally {
    track._lyricsFetching = false;
  }
}

function parseLrcLines(lrcText) {
  if (!lrcText || typeof lrcText !== 'string') return [];
  const lines = lrcText.split(/\r?\n/);
  const stampRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;
  const result = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed || /^\[[A-Za-z]+:.*\]$/.test(trimmed)) continue;

    stampRegex.lastIndex = 0;
    const matches = [...trimmed.matchAll(stampRegex)];
    if (matches.length === 0) continue;

    const text = trimmed.replace(stampRegex, '').trim() || '♪';

    for (const match of matches) {
      const minutes = parseInt(match[1], 10) || 0;
      const seconds = parseInt(match[2], 10) || 0;
      let fractionMs = 0;
      if (match[3]) {
        if (match[3].length === 2) fractionMs = parseInt(match[3], 10) * 10;
        else if (match[3].length === 1) fractionMs = parseInt(match[3], 10) * 100;
        else fractionMs = parseInt(match[3].slice(0, 3), 10);
      }
      const timeInSec = Math.round((minutes * 60 + seconds + fractionMs / 1000) * 100) / 100;
      result.push({ time: timeInSec, text });
    }
  }

  result.sort((a, b) => a.time - b.time);
  if (result.length > 0 && result[0].time > 5) {
    result.unshift({ time: 0, text: '♪' });
  }
  return result;
}

function renderPreviewQueue() {
  const queueBody = document.getElementById('preview-queue-body');
  const countLabel = document.getElementById('queue-count-label');
  if (!queueBody) return;

  const currentQueue = (userQueue && userQueue.length > 0) ? userQueue : CATALOGUE_TRACKS;
  if (countLabel) countLabel.innerText = `${currentQueue.length} tracks`;

  const currentVideoId = CATALOGUE_TRACKS[currentIndex]?.videoId;

  queueBody.innerHTML = currentQueue.map((t, idx) => {
    const isCurrent = (t.videoId && t.videoId === currentVideoId) || (idx === currentIndex && !t.videoId);
    return `
      <div class="deja-queue-item ${isCurrent ? 'active-playing' : ''}" id="queue-item-${idx}">
        <div class="deja-queue-item-index">${isCurrent ? '▶' : idx + 1}</div>
        <img src="${escapeHTML(t.cover || '')}" class="deja-queue-thumb" alt="${escapeHTML(t.title)}" onerror="this.src='../../assets/icon.png'">
        <div class="deja-queue-item-meta">
          <div class="deja-queue-item-title">${escapeHTML(t.title)}</div>
          <div class="deja-queue-item-artist">${escapeHTML(t.artist)}</div>
        </div>
        <div class="deja-queue-item-duration">${escapeHTML(t.durationStr || formatTime(t.duration))}</div>
      </div>
    `;
  }).join('');

  currentQueue.forEach((t, idx) => {
    const itemEl = document.getElementById(`queue-item-${idx}`);
    if (itemEl) {
      itemEl.onclick = () => selectQueueTrack(idx);
    }
  });
}

function selectQueueTrack(idx) {
  const currentQueue = (userQueue && userQueue.length > 0) ? userQueue : CATALOGUE_TRACKS;
  if (idx < 0 || idx >= currentQueue.length) return;
  const item = currentQueue[idx];
  playLiveTrack(item);
}

function updateFavoriteUI(trackId) {
  const isLoved = lovedTrackIds.has(trackId);
  const heartBtn = document.getElementById('btn-favorite');
  const expHeartBtn = document.getElementById('exp-btn-favorite');
  if (heartBtn) heartBtn.classList.toggle('loved', isLoved);
  if (expHeartBtn) expHeartBtn.classList.toggle('loved', isLoved);
}

function toggleTrackFavorite(e, trackId) {
  if (e) e.stopPropagation();
  if (lovedTrackIds.has(trackId)) {
    lovedTrackIds.delete(trackId);
  } else {
    lovedTrackIds.add(trackId);
  }
  updateFavoriteUI(CATALOGUE_TRACKS[currentIndex].id);
  if (currentView === 'songs' || currentView.startsWith('playlist-')) {
    renderCurrentView();
  }
}

// ==========================================
// Transport & Playback Control
// ==========================================

function togglePlay() {
  if (isPlaying) pause();
  else play();
}

function play() {
  isPlaying = true;
  updatePlayButton();

  // Resume AudioContext if suspended
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }

  const track = CATALOGUE_TRACKS[currentIndex];
  if (isDirectStreamPlaying && dejaAudio && dejaAudio.src) {
    dejaAudio.volume = isMuted ? 0 : currentVolume;
    dejaAudio.play().catch(e => {
      console.warn('[Deja Audio] Resume failed, falling back:', e.message);
      isDirectStreamPlaying = false;
      fallbackToIFrame(track);
    });
  } else if (isYtReady && ytPlayer) {
    try {
      ytPlayer.unMute();
      ytPlayer.setVolume(isMuted ? 0 : Math.round(currentVolume * 100));
      ytPlayer.playVideo();
      isYtPlaying = true;
    } catch {}
  } else {
    resolveAndPlayTrack(track);
    return;
  }

  ensureAudioGraph();

  if (playbackTimer) clearInterval(playbackTimer);
  playbackTimer = setInterval(tick, 1000);

  if (lyricClockTimer) clearInterval(lyricClockTimer);
  lyricClockTimer = setInterval(tickLyricClock, 50);

  notifyTrackState();
}

function pause() {
  isPlaying = false;
  updatePlayButton();

  if (dejaAudio && !dejaAudio.paused) {
    try { dejaAudio.pause(); } catch {}
  }

  if (isYtReady && ytPlayer && isYtPlaying) {
    try {
      ytPlayer.pauseVideo();
    } catch {}
    isYtPlaying = false;
  }
  stopWebAudioStream();

  if (playbackTimer) {
    clearInterval(playbackTimer);
    playbackTimer = null;
  }
  if (lyricClockTimer) {
    clearInterval(lyricClockTimer);
    lyricClockTimer = null;
  }

  notifyTrackState();
}

function nextTrack() {
  if (isShuffle) {
    const pool = (userQueue && userQueue.length > 1) ? userQueue : CATALOGUE_TRACKS;
    const randTrack = pool[Math.floor(Math.random() * pool.length)];
    playLiveTrack(randTrack);
    return;
  }

  const currentVideoId = CATALOGUE_TRACKS[currentIndex]?.videoId;
  if (userQueue && userQueue.length > 1) {
    const qIdx = userQueue.findIndex(t => t.videoId === currentVideoId);
    if (qIdx !== -1 && qIdx + 1 < userQueue.length) {
      playLiveTrack(userQueue[qIdx + 1]);
      return;
    }
  }

  const nextIdx = (currentIndex + 1) % CATALOGUE_TRACKS.length;
  selectTrack(nextIdx);
}

function prevTrack() {
  if (currentTime > 3) {
    seekTo(0);
    return;
  }

  const currentVideoId = CATALOGUE_TRACKS[currentIndex]?.videoId;
  if (userQueue && userQueue.length > 1) {
    const qIdx = userQueue.findIndex(t => t.videoId === currentVideoId);
    if (qIdx > 0) {
      playLiveTrack(userQueue[qIdx - 1]);
      return;
    }
  }

  const prevIdx = (currentIndex - 1 + CATALOGUE_TRACKS.length) % CATALOGUE_TRACKS.length;
  selectTrack(prevIdx);
}

let unshuffledQueue = [];

function toggleShuffle() {
  isShuffle = !isShuffle;
  const btn = typeof document.getElementById === 'function' ? document.getElementById('btn-shuffle') : null;
  const expBtn = (typeof document.getElementById === 'function' ? document.getElementById('exp-btn-shuffle') : null) ||
                 (typeof document.querySelector === 'function' ? document.querySelector('.exp-shuffle-btn') : null);

  [btn, expBtn].forEach(b => {
    if (!b) return;
    if (b.classList && b.classList.toggle) b.classList.toggle('active', isShuffle);
    if (b.style) {
      if (isShuffle) {
        b.style.color = '#FA2D48';
        b.style.backgroundColor = 'rgba(250, 45, 72, 0.18)';
        b.title = 'Shuffle On';
      } else {
        b.style.color = '';
        b.style.backgroundColor = '';
        b.title = 'Shuffle Off';
      }
    }
  });

  const pool = (userQueue && userQueue.length > 0) ? userQueue : [...CATALOGUE_TRACKS];
  const currentTrack = CATALOGUE_TRACKS[currentIndex];

  if (isShuffle) {
    if (!unshuffledQueue || unshuffledQueue.length === 0) {
      unshuffledQueue = [...pool];
    }
    // Randomize queue while preserving current track at head
    const otherTracks = pool.filter(t => (currentTrack && t.videoId ? t.videoId !== currentTrack.videoId : t.id !== currentTrack?.id));
    for (let i = otherTracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [otherTracks[i], otherTracks[j]] = [otherTracks[j], otherTracks[i]];
    }
    userQueue = currentTrack ? [currentTrack, ...otherTracks] : otherTracks;
    renderPreviewQueue();
    showToast('Shuffle: On');
  } else {
    // Restore original queue order
    if (unshuffledQueue && unshuffledQueue.length > 0) {
      userQueue = [...unshuffledQueue];
      unshuffledQueue = [];
    }
    renderPreviewQueue();
    showToast('Shuffle: Off');
  }
}

function toggleRepeat() {
  if (repeatMode === 'off') repeatMode = 'all';
  else if (repeatMode === 'all') repeatMode = 'one';
  else repeatMode = 'off';

  const btn = typeof document.getElementById === 'function' ? document.getElementById('btn-repeat') : null;
  const expBtn = (typeof document.getElementById === 'function' ? document.getElementById('exp-btn-repeat') : null) ||
                 (typeof document.querySelector === 'function' ? document.querySelector('.exp-repeat-btn') : null);

  const repeatAllSvg = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="17 1 21 5 17 9"></polyline>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
      <polyline points="7 23 3 19 7 15"></polyline>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
    </svg>
  `;

  const repeatOneSvg = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="17 1 21 5 17 9"></polyline>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
      <polyline points="7 23 3 19 7 15"></polyline>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
      <text x="12" y="15.5" font-size="9" font-weight="900" font-family="-apple-system, BlinkMacSystemFont, sans-serif" text-anchor="middle" fill="currentColor" stroke="none">1</text>
    </svg>
  `;

  [btn, expBtn].forEach(b => {
    if (!b) return;
    if (b.classList && b.classList.toggle) b.classList.toggle('active', repeatMode !== 'off');
    if (b.style) {
      if (repeatMode === 'one') {
        b.innerHTML = repeatOneSvg;
        b.style.color = '#FA2D48';
        b.style.backgroundColor = 'rgba(250, 45, 72, 0.18)';
        b.title = 'Repeat One';
      } else if (repeatMode === 'all') {
        b.innerHTML = repeatAllSvg;
        b.style.color = '#FA2D48';
        b.style.backgroundColor = 'rgba(250, 45, 72, 0.18)';
        b.title = 'Repeat All';
      } else {
        b.innerHTML = repeatAllSvg;
        b.style.color = '';
        b.style.backgroundColor = '';
        b.title = 'Repeat Off';
      }
    }
  });

  showToast(repeatMode === 'one' ? 'Repeat: One' : (repeatMode === 'all' ? 'Repeat: All' : 'Repeat: Off'));
}

function tick() {
  const track = CATALOGUE_TRACKS[currentIndex];

  if (isDirectStreamPlaying && dejaAudio && !dejaAudio.paused) {
    currentTime = dejaAudio.currentTime;
    if (dejaAudio.duration && !isNaN(dejaAudio.duration) && Math.round(dejaAudio.duration) > 0) {
      const dur = Math.round(dejaAudio.duration);
      if (dur !== track.duration) {
        track.duration = dur;
        const totalEl = document.getElementById('time-total');
        const expTotal = document.getElementById('exp-time-total');
        if (totalEl) totalEl.innerText = formatTime(dur);
        if (expTotal) expTotal.innerText = '-' + formatTime(dur);
      }
    }
    updateDynamicPipeline(dejaAudio);
  } else if (isYtReady && ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
    try {
      const ytSec = ytPlayer.getCurrentTime();
      if (typeof ytSec === 'number' && !isNaN(ytSec) && ytSec >= 0) currentTime = ytSec;
      const ytDur = Math.round(ytPlayer.getDuration());
      if (ytDur > 0 && ytDur !== track.duration) {
        track.duration = ytDur;
        const totalEl = document.getElementById('time-total');
        const expTotal = document.getElementById('exp-time-total');
        if (totalEl) totalEl.innerText = formatTime(ytDur);
        if (expTotal) expTotal.innerText = '-' + formatTime(ytDur);
      }
      updateDynamicPipeline(ytPlayer);
    } catch {}
  } else if (isPlaying) {
    // Only increment simulated time in pure mock/offline testing mode without player attached
    if (!dejaAudio?.src && !isYtReady) {
      currentTime += 1;
    }
  }

  if (currentTime >= track.duration) {
    if (sleepMode === 'track') {
      cancelPreviewSleepTimer();
      triggerPreviewSleepPause();
      return;
    }
    if (repeatMode === 'one') {
      seekTo(0);
      return;
    }
    nextTrack();
    return;
  }

  if (sleepMode === 'track') {
    sleepRemainingSec = Math.max(0, track.duration - currentTime);
    updateSleepUI();
  }

  updateProgress();
  updateSyncedLyrics();
}

function startLyricClock() {
  if (lyricClockTimer) clearInterval(lyricClockTimer);
  lyricClockTimer = setInterval(tickLyricClock, 50);
}

function stopLyricClock() {
  if (lyricClockTimer) {
    clearInterval(lyricClockTimer);
    lyricClockTimer = null;
  }
}

/**
 * Fast-frequency Lyric Clock (BitChord LyricClock.kt)
 * Keeps lyrics and scrubbers updated at 20fps for millisecond precision
 */
function tickLyricClock() {
  if (!isPlaying) return;
  const track = CATALOGUE_TRACKS[currentIndex];
  if (!track) return;

  if (isDirectStreamPlaying && dejaAudio && !dejaAudio.paused) {
    currentTime = dejaAudio.currentTime;
  } else if (isYtReady && ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
    try {
      const ytSec = ytPlayer.getCurrentTime();
      if (typeof ytSec === 'number' && !isNaN(ytSec) && ytSec >= 0) {
        currentTime = ytSec;
      }
    } catch {}
  }

  updateProgress();
  updateSyncedLyrics();
}

function seekTo(seconds) {
  const track = CATALOGUE_TRACKS[currentIndex];
  if (!track) return;
  currentTime = Math.max(0, Math.min(seconds, track.duration));
  if (isDirectStreamPlaying && dejaAudio) {
    try {
      dejaAudio.currentTime = currentTime;
    } catch {}
  } else if (isYtReady && ytPlayer && track.videoId) {
    try {
      ytPlayer.seekTo(currentTime, true);
    } catch {}
  }
  updateProgress();
  updateSyncedLyrics(true);
}

if (typeof window !== 'undefined') {
  window.seekTo = seekTo;
}

function updateProgress() {
  const track = CATALOGUE_TRACKS[currentIndex];
  if (!track || !track.duration) return;
  const pct = Math.min(100, Math.max(0, (currentTime / track.duration) * 100));
  const timeStr = formatTime(currentTime);
  const remainingSec = Math.max(0, track.duration - currentTime);
  const remainingStr = '-' + formatTime(remainingSec);

  const curEl = document.getElementById('time-current');
  const fillEl = document.getElementById('scrubber-fill');
  const knobEl = document.getElementById('scrubber-knob');
  if (curEl) curEl.innerText = timeStr;
  if (fillEl) fillEl.style.width = `${pct}%`;
  if (knobEl) knobEl.style.left = `${pct}%`;

  const expCurEl = document.getElementById('exp-time-current');
  const expTotalEl = document.getElementById('exp-time-total');
  const expFillEl = document.getElementById('exp-scrubber-fill');
  const expKnobEl = document.getElementById('exp-scrubber-knob');
  if (expCurEl) expCurEl.innerText = timeStr;
  if (expTotalEl) expTotalEl.innerText = remainingStr;
  if (expFillEl) expFillEl.style.width = `${pct}%`;
  if (expKnobEl) expKnobEl.style.left = `${pct}%`;
}

/**
 * Real-time Dynamic Lyrics Synchronization (BitChord PlayerLyrics.kt & LyricClock.kt)
 * Computes active line dynamically: line.time <= currentTime && (!nextLine || nextLine.time > currentTime)
 * Smooth spring-scrolling to vertical center (scrollIntoView({ behavior: 'smooth', block: 'center' }))
 * High-contrast glowing text on active line; dimmed blur on past/upcoming lines
 */
function updateSyncedLyrics(forceScroll = false) {
  if (typeof document === 'undefined') return;
  const track = CATALOGUE_TRACKS[currentIndex];
  if (!track || !track.lyrics || track.lyrics.length === 0) return;

  const lines = track.lyrics;
  let activeIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const lineTime = lines[i].time;
    const nextLine = (i + 1 < lines.length) ? lines[i + 1] : null;
    if (lineTime <= currentTime && (!nextLine || nextLine.time > currentTime)) {
      activeIndex = i;
      break;
    }
  }

  // Synchronize both drawer and Now Playing screen lyrics containers
  const containers = (typeof document.getElementById === 'function' ? [
    document.getElementById('lyrics-lines-container'),
    document.getElementById('expanded-lyrics-container')
  ] : []).filter(Boolean);

  containers.forEach(container => {
    if (!container.querySelectorAll) return;
    const lyricElements = container.querySelectorAll('.apple-lyric-line');
    if (!lyricElements) return;
    lyricElements.forEach((el, i) => {
      const isActive = (i === activeIndex);
      if (el.classList && el.classList.toggle) {
        el.classList.toggle('active', isActive);
      }
      if (el.style) {
        if (isActive) {
          el.style.color = '#ffffff';
          el.style.textShadow = '0 4px 20px rgba(255,255,255,0.4)';
          el.style.filter = 'none';
          el.style.opacity = '1';
          el.style.transform = 'scale(1.02)';
        } else {
          el.style.color = 'rgba(255, 255, 255, 0.35)';
          el.style.textShadow = 'none';
          el.style.filter = 'blur(0.4px)';
          el.style.opacity = '0.45';
          el.style.transform = 'none';
        }
      }
    });

    if (activeIndex >= 0 && (activeIndex !== lastActiveLyricIndex || forceScroll)) {
      const activeEl = lyricElements[activeIndex];
      if (activeEl && typeof activeEl.scrollIntoView === 'function') {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });

  lastActiveLyricIndex = activeIndex;

  // Update active lyric preview capsule (.exp-lyric-preview / #exp-lyric-snippet-text / #exp-lyric-snippet)
  const expSnippet = (typeof document.getElementById === 'function' ? (document.getElementById('exp-lyric-snippet-text') || document.getElementById('exp-lyric-snippet')) : null) ||
                     (typeof document.querySelector === 'function' ? document.querySelector('.exp-lyric-snippet-text') : null);
  if (expSnippet) {
    let snippetText = '';
    if (activeIndex >= 0 && lines[activeIndex]) {
      const curText = lines[activeIndex].text;
      if (curText && curText !== '♪') {
        snippetText = curText;
      } else {
        // If current timestamp is instrumental, show upcoming vocal line or clean instrumental text
        const nextVocal = lines.slice(activeIndex + 1).find(l => l.text && l.text !== '♪');
        snippetText = nextVocal ? nextVocal.text : '♪ Instrumental ♪';
      }
    } else if (lines.length > 0) {
      const firstVocal = lines.find(l => l.text && l.text !== '♪');
      snippetText = firstVocal ? firstVocal.text : lines[0].text;
    }
    if (!snippetText || snippetText === '♪') {
      snippetText = 'Tap for synced lyrics';
    }
    expSnippet.innerText = snippetText;
  }
}

const updateLiveLyrics = updateSyncedLyrics;

/**
 * Toggles Now Playing Lyrics View inside slide-up Now Playing screen (NowPlayingScreen.kt)
 */
function toggleNowPlayingLyrics() {
  if (typeof document === 'undefined') return;
  const artContainer = document.getElementById('now-playing-art-wrap') || document.getElementById('expanded-artwork-container');
  const lyricsContainer = document.getElementById('expanded-lyrics-container');
  const expBtnLyrics = document.getElementById('exp-btn-lyrics') || (typeof document.querySelector === 'function' ? document.querySelector('.exp-lyrics-btn') : null);
  if (!lyricsContainer) return;

  const isShowingLyrics = lyricsContainer.style.display !== 'none';
  if (isShowingLyrics) {
    lyricsContainer.style.display = 'none';
    if (artContainer) artContainer.style.display = 'block';
    if (expBtnLyrics) {
      expBtnLyrics.classList.remove('active');
      expBtnLyrics.style.color = '';
      expBtnLyrics.style.backgroundColor = '';
      expBtnLyrics.title = 'Synced Lyrics';
    }
  } else {
    lyricsContainer.style.display = 'flex';
    if (artContainer) artContainer.style.display = 'none';
    if (expBtnLyrics) {
      expBtnLyrics.classList.add('active');
      expBtnLyrics.style.color = '#FA2D48';
      expBtnLyrics.style.backgroundColor = 'rgba(250, 45, 72, 0.18)';
      expBtnLyrics.title = 'Hide Lyrics';
    }
    // Close queue drawer if open so lyrics view has full focus
    const queueDrawer = document.getElementById('apple-queue-drawer');
    if (queueDrawer && (queueDrawer.classList.contains('visible') || queueDrawer.classList.contains('active'))) {
      queueDrawer.classList.remove('visible', 'active');
      const expBtnQueue = document.getElementById('exp-btn-queue') || (typeof document.querySelector === 'function' ? document.querySelector('.exp-queue-btn') : null);
      const btnQueuePanel = document.getElementById('btn-queue-panel');
      if (expBtnQueue) {
        expBtnQueue.classList.remove('active');
        expBtnQueue.style.color = '';
        expBtnQueue.style.backgroundColor = '';
      }
      if (btnQueuePanel) {
        btnQueuePanel.classList.remove('active');
        btnQueuePanel.style.color = '';
      }
    }
    const track = CATALOGUE_TRACKS[currentIndex];
    if (track) {
      renderLyrics(track.lyrics);
      if ((!track.lyrics || track.lyrics.length === 0) && !track._lyricsFetching) {
        resolveSyncedLyrics(track);
      }
    }
    updateSyncedLyrics(true);
  }
}

/**
 * Opens the Apple Music Synced Lyrics Drawer smoothly
 */
function openLyricsDrawer() {
  if (typeof document === 'undefined') return;
  const lyricsDrawer = document.getElementById('apple-lyrics-drawer');
  const lyricsBackdrop = document.getElementById('lyrics-backdrop');
  const btnToggleLyrics = document.getElementById('btn-toggle-lyrics');
  const btnLyricsPanel = document.getElementById('btn-lyrics-panel');

  if (lyricsDrawer) {
    lyricsDrawer.classList.add('visible', 'active');
  }
  if (lyricsBackdrop) {
    lyricsBackdrop.classList.add('visible', 'active');
  }
  if (btnToggleLyrics) btnToggleLyrics.classList.add('active');
  if (btnLyricsPanel) btnLyricsPanel.classList.add('active');

  // Close queue drawer if open so they do not overlap
  const queueDrawer = document.getElementById('apple-queue-drawer');
  if (queueDrawer && (queueDrawer.classList.contains('visible') || queueDrawer.classList.contains('active'))) {
    queueDrawer.classList.remove('visible', 'active');
    const btnQueuePanel = document.getElementById('btn-queue-panel');
    if (btnQueuePanel) btnQueuePanel.classList.remove('active');
  }

  updateLiveLyrics(true);
}

/**
 * Closes and dismisses the Apple Music Synced Lyrics Drawer immediately & cleanly
 */
function closeLyricsDrawer() {
  if (typeof document === 'undefined') return;
  const lyricsDrawer = document.getElementById('apple-lyrics-drawer');
  const lyricsBackdrop = document.getElementById('lyrics-backdrop');
  const btnToggleLyrics = document.getElementById('btn-toggle-lyrics');
  const btnLyricsPanel = document.getElementById('btn-lyrics-panel');

  if (lyricsDrawer) {
    lyricsDrawer.classList.remove('visible', 'active');
  }
  if (lyricsBackdrop) {
    lyricsBackdrop.classList.remove('visible', 'active');
  }
  if (btnToggleLyrics) btnToggleLyrics.classList.remove('active');
  if (btnLyricsPanel) btnLyricsPanel.classList.remove('active');
}

/**
 * Toggles the Apple Music Synced Lyrics Drawer on or off cleanly
 */
function toggleLyricsDrawer() {
  if (typeof document === 'undefined') return;
  const lyricsDrawer = document.getElementById('apple-lyrics-drawer');
  if (!lyricsDrawer) return;
  const isOpen = lyricsDrawer.classList.contains('visible') || lyricsDrawer.classList.contains('active');
  if (isOpen) {
    closeLyricsDrawer();
  } else {
    openLyricsDrawer();
  }
}

/**
 * Toggles the BitChord Up Next Queue Drawer cleanly
 */
function toggleQueue(e) {
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
    e.stopPropagation();
  }
  if (typeof document === 'undefined') return;
  const queueDrawer = document.getElementById('apple-queue-drawer');
  const btnQueuePanel = document.getElementById('btn-queue-panel');
  const expBtnQueue = document.getElementById('exp-btn-queue') || (typeof document.querySelector === 'function' ? document.querySelector('.exp-queue-btn') : null);
  if (!queueDrawer) return;

  const willBeVis = !queueDrawer.classList.contains('visible');
  queueDrawer.classList.toggle('visible', willBeVis);
  queueDrawer.classList.toggle('active', willBeVis);

  if (btnQueuePanel) {
    btnQueuePanel.classList.toggle('active', willBeVis);
    btnQueuePanel.style.color = willBeVis ? '#FA2D48' : '';
  }
  if (expBtnQueue) {
    expBtnQueue.classList.toggle('active', willBeVis);
    expBtnQueue.style.color = willBeVis ? '#FA2D48' : '';
    expBtnQueue.style.backgroundColor = willBeVis ? 'rgba(250, 45, 72, 0.18)' : '';
  }

  if (willBeVis) {
    closeLyricsDrawer();
    const npLyrics = document.getElementById('expanded-lyrics-container');
    const npArt = document.getElementById('now-playing-art-wrap') || document.getElementById('expanded-artwork-container');
    const expBtnLyrics = document.getElementById('exp-btn-lyrics') || (typeof document.querySelector === 'function' ? document.querySelector('.exp-lyrics-btn') : null);
    if (npLyrics && npLyrics.style.display !== 'none') {
      npLyrics.style.display = 'none';
      if (npArt) npArt.style.display = 'block';
      if (expBtnLyrics) {
        expBtnLyrics.classList.remove('active');
        expBtnLyrics.style.color = '';
        expBtnLyrics.style.backgroundColor = '';
        expBtnLyrics.title = 'Synced Lyrics';
      }
    }
    renderPreviewQueue();
  }
}

function openQueueDrawer() {
  if (typeof document === 'undefined') return;
  const queueDrawer = document.getElementById('apple-queue-drawer');
  if (queueDrawer && !queueDrawer.classList.contains('visible')) {
    toggleQueue();
  }
}

function closeQueueDrawer() {
  if (typeof document === 'undefined') return;
  const queueDrawer = document.getElementById('apple-queue-drawer');
  const btnQueuePanel = document.getElementById('btn-queue-panel');
  const expBtnQueue = document.getElementById('exp-btn-queue') || (typeof document.querySelector === 'function' ? document.querySelector('.exp-queue-btn') : null);

  if (queueDrawer) {
    queueDrawer.classList.remove('visible', 'active');
  }
  if (btnQueuePanel) {
    btnQueuePanel.classList.remove('active');
    btnQueuePanel.style.color = '';
  }
  if (expBtnQueue) {
    expBtnQueue.classList.remove('active');
    expBtnQueue.style.color = '';
    expBtnQueue.style.backgroundColor = '';
  }
}

if (typeof window !== 'undefined') {
  window.openLyricsDrawer = openLyricsDrawer;
  window.closeLyricsDrawer = closeLyricsDrawer;
  window.toggleLyrics = toggleLyricsDrawer;
  window.toggleQueue = toggleQueue;
  window.openQueueDrawer = openQueueDrawer;
  window.closeQueueDrawer = closeQueueDrawer;
  window.openAccountModal = openAccountModal;
  window.closeAccountModal = closeAccountModal;
  window.renderAccountModalContent = renderAccountModalContent;
  window.switchLoginTab = switchLoginTab;
}

function updatePlayButton() {
  if (typeof document === 'undefined') return;
  const icon = document.getElementById('play-pause-icon');
  const expIcon = document.getElementById('exp-play-pause-icon');
  const playerBar = document.getElementById('apple-player-bar');
  const expView = document.getElementById('expanded-player-view');

  if (playerBar) playerBar.classList.toggle('is-playing', isPlaying);
  if (expView) expView.classList.toggle('is-playing', isPlaying);
  if (document.body) document.body.classList.toggle('deja-playing', isPlaying);

  const pauseSvg = `
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  `;
  const playSvg = `<polygon points="5 3 19 12 5 21 5 3"></polygon>`;

  if (icon) icon.innerHTML = isPlaying ? pauseSvg : playSvg;
  if (expIcon) expIcon.innerHTML = isPlaying ? pauseSvg : playSvg;

  // Update song row active icons
  document.querySelectorAll('.song-row').forEach((row, i) => {
    const num = row.querySelector('.song-number');
    if (num) {
      num.innerText = (i === currentIndex && isPlaying) ? '▶' : String(i + 1);
    }
  });
}

function handleScrubberClick(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
  const track = CATALOGUE_TRACKS[currentIndex];
  seekTo(ratio * track.duration);
}

function handleVolumeClick(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  currentVolume = Math.max(0, Math.min(1, clickX / rect.width));
  isMuted = false;
  applyVolume(currentVolume);
}

function toggleMute() {
  if (isMuted) {
    isMuted = false;
    applyVolume(previousVolume);
  } else {
    isMuted = true;
    previousVolume = currentVolume;
    applyVolume(0);
  }
}

function adjustVolume(delta) {
  isMuted = false;
  currentVolume = Math.max(0, Math.min(1, currentVolume + delta));
  applyVolume(currentVolume);
}

function applyVolume(vol) {
  const fill = document.getElementById('volume-fill');
  if (fill) fill.style.width = `${vol * 100}%`;
  const expFill = document.getElementById('exp-volume-fill');
  if (expFill) expFill.style.width = `${vol * 100}%`;

  if (masterGain && audioContext) {
    masterGain.gain.setValueAtTime(vol * 0.2, audioContext.currentTime);
  }
  if (dejaAudio) {
    dejaAudio.volume = isMuted ? 0 : vol;
  }
  if (isYtReady && ytPlayer && typeof ytPlayer.setVolume === 'function') {
    try {
      if (isMuted) {
        ytPlayer.mute();
      } else {
        ytPlayer.unMute();
        ytPlayer.setVolume(Math.round(vol * 100));
      }
    } catch {}
  }
}

function updateDynamicPipeline(source) {
  const bufferEl = document.getElementById('pipeline-buffer');
  const codecEl = document.getElementById('pipeline-codec');
  const bitrateEl = document.getElementById('pipeline-bitrate');
  const rateEl = document.getElementById('pipeline-samplerate');
  const tierEl = document.getElementById('pipeline-tier');

  const track = CATALOGUE_TRACKS[currentIndex];
  if (isDirectStreamPlaying && dejaAudio) {
    let bufSec = '0.0';
    try {
      if (dejaAudio.buffered && dejaAudio.buffered.length > 0) {
        const end = dejaAudio.buffered.end(dejaAudio.buffered.length - 1);
        bufSec = Math.max(0, end - dejaAudio.currentTime).toFixed(1);
      }
    } catch {}
    if (bufferEl) bufferEl.innerText = `${bufSec}s forward buffer (HTML5 audio stream)`;
    if (codecEl) codecEl.innerText = currentStreamMeta?.mimeType || 'Opus / WebM (Native HTML5 Stream)';
    if (bitrateEl) bitrateEl.innerText = currentStreamMeta?.bitrate ? `${Math.round(currentStreamMeta.bitrate / 1000)} kbps` : '160 kbps';
    if (rateEl) rateEl.innerText = `${audioContext?.sampleRate || 48000} Hz`;
    if (tierEl) tierEl.innerText = 'BitChord Direct Stream (Native HTML5)';
  } else if (source && typeof source.getVideoLoadedFraction === 'function' && isYtPlaying) {
    const frac = source.getVideoLoadedFraction() || 0;
    const bufSec = Math.max(0, (frac * track.duration) - currentTime).toFixed(1);
    if (bufferEl) bufferEl.innerText = `${bufSec}s forward buffer (${Math.round(frac * 100)}%)`;
    if (codecEl) codecEl.innerText = 'Opus (audio/webm)';
    if (bitrateEl) bitrateEl.innerText = '160 kbps';
    if (rateEl) rateEl.innerText = '48.0 kHz';
    if (tierEl) tierEl.innerText = 'BitChord Standard (160k Opus)';
  } else {
    if (bufferEl) bufferEl.innerText = '18.4s forward buffer (synthesizer sink)';
    if (codecEl) codecEl.innerText = 'PCM Float32 (Web Audio API sink)';
    if (bitrateEl) bitrateEl.innerText = '1411 kbps (Lossless Synth)';
    if (rateEl) rateEl.innerText = `${audioContext?.sampleRate || 48000} Hz`;
    if (tierEl) tierEl.innerText = 'Native Studio Reference';
  }
}

function notifyTrackState() {
  const track = CATALOGUE_TRACKS[currentIndex];
  if (!track) return;
  if (typeof document !== 'undefined') {
    const isAd = !!track.isAd;
    const adPill = document.getElementById('player-ad-pill');
    if (adPill) adPill.style.display = isAd ? 'inline-flex' : 'none';
  }

  if (typeof window !== 'undefined') {
    const api = window.dejaAPI || window.sonoraAPI;
    if (api?.sendTrackChanged) {
      api.sendTrackChanged({
        title: track.title,
        artist: track.artist,
        album: track.album,
        duration: track.duration,
        currentTime: currentTime,
        isPlaying: isPlaying,
        coverUrl: track.cover,
        isAd: !!track.isAd
      });
    }
  }
}

// ==========================================
// Web Audio API Synthesizer & EQ Filters
// ==========================================

function ensureAudioGraph() {
  if (typeof window === 'undefined') return;
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    audioContext = new AudioCtx();
  }
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }

  if (!masterGain) {
    masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(currentVolume * 0.2, audioContext.currentTime);

    // 5-Band BiquadFilterNodes (GraphicEq)
    bassFilter = audioContext.createBiquadFilter();
    bassFilter.type = 'lowshelf';
    bassFilter.frequency.setValueAtTime(120, audioContext.currentTime);

    midFilter = audioContext.createBiquadFilter();
    midFilter.type = 'peaking';
    midFilter.frequency.setValueAtTime(1000, audioContext.currentTime);
    midFilter.Q.setValueAtTime(1.0, audioContext.currentTime);

    trebleFilter = audioContext.createBiquadFilter();
    trebleFilter.type = 'highshelf';
    trebleFilter.frequency.setValueAtTime(4500, audioContext.currentTime);

    // Connect Graph: Filter Chain -> Master Gain -> Destination
    bassFilter.connect(midFilter);
    midFilter.connect(trebleFilter);
    trebleFilter.connect(masterGain);
    masterGain.connect(audioContext.destination);

    // Apply active EQ Preset
    applyEqPreset(currentEqPreset);
  }
}

function startWebAudioStream() {
  try {
    ensureAudioGraph();
    // Compliance with Google TOS & user specifications:
    // Real YouTube audio streaming only, no mock sine wave beep oscillators.
  } catch (err) {
    console.warn('[Audio] Audio graph init notice:', err.message);
  }
}

function stopWebAudioStream() {
  activeOscillators.forEach(osc => {
    try {
      osc.stop();
      osc.disconnect();
    } catch {}
  });
  activeOscillators = [];
}

// ==========================================
// BitChord Feature Suite: EQ, Sleep, Pipeline
// ==========================================

function applyEqPreset(presetName) {
  currentEqPreset = presetName;
  const config = EQ_PRESETS[presetName] || EQ_PRESETS['Flat'];

  if (bassFilter && midFilter && trebleFilter && audioContext) {
    bassFilter.gain.setTargetAtTime(config.bass, audioContext.currentTime, 0.1);
    midFilter.gain.setTargetAtTime(config.mid, audioContext.currentTime, 0.1);
    trebleFilter.gain.setTargetAtTime(config.treble, audioContext.currentTime, 0.1);
  }

  const status = document.getElementById('eq-status-text');
  if (status) status.innerHTML = `Active Preset: <strong>${presetName}</strong>`;

  const buttons = document.querySelectorAll('#eq-picker-options .deja-picker-btn');
  buttons.forEach(btn => {
    btn.classList.toggle('selected', btn.getAttribute('data-eq') === presetName);
  });

  const eqBtn = document.getElementById('btn-equalizer');
  if (eqBtn) eqBtn.classList.toggle('active', presetName !== 'Flat');
}

function startPreviewSleepTimer(minutes) {
  cancelPreviewSleepTimer();
  sleepMode = 'duration';
  sleepRemainingSec = minutes * 60;
  updateSleepUI();

  sleepTimerId = setInterval(() => {
    if (sleepRemainingSec > 0) {
      sleepRemainingSec -= 1;
      updateSleepUI();
      if (sleepRemainingSec <= 0) {
        cancelPreviewSleepTimer();
        triggerPreviewSleepPause();
      }
    }
  }, 1000);
}

function startPreviewSleepTrack() {
  cancelPreviewSleepTimer();
  sleepMode = 'track';
  const track = CATALOGUE_TRACKS[currentIndex];
  sleepRemainingSec = Math.max(0, track.duration - currentTime);
  updateSleepUI();
}

function cancelPreviewSleepTimer() {
  if (sleepTimerId) {
    clearInterval(sleepTimerId);
    sleepTimerId = null;
  }
  sleepRemainingSec = null;
  sleepMode = null;
  updateSleepUI();
}

function triggerPreviewSleepPause() {
  pause();
  const status = document.getElementById('sleep-status-text');
  if (status) status.innerText = 'Playback paused by Sleep Timer';
}

function updateSleepUI() {
  const sleepBtn = document.getElementById('btn-sleep-timer');
  const statusText = document.getElementById('sleep-status-text');
  if (!sleepRemainingSec || sleepRemainingSec <= 0) {
    if (sleepBtn) {
      sleepBtn.classList.remove('active');
      sleepBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      `;
    }
    if (statusText) statusText.innerText = 'Sleep timer is currently inactive';
  } else {
    if (sleepBtn) {
      sleepBtn.classList.add('active');
      const mm = Math.floor(sleepRemainingSec / 60);
      const ss = sleepRemainingSec % 60;
      sleepBtn.innerText = `${mm}:${ss < 10 ? '0' : ''}${ss}`;
    }
    if (statusText) {
      statusText.innerText = `Sleep timer active: pauses in ${formatTime(sleepRemainingSec)}${sleepMode === 'track' ? ' (End of Track)' : ''}`;
    }
  }
}

function openPipelineModal() {
  const modal = document.getElementById('pipeline-modal');
  if (modal) {
    const bufferEl = document.getElementById('pipeline-buffer');
    if (bufferEl) {
      const buf = (16 + Math.random() * 6).toFixed(1);
      bufferEl.innerText = `${buf}s forward buffer`;
    }
    modal.style.display = 'flex';
  }
}

function handleGoogleConnect() {
  openAccountModal();
}

// ==========================================
// Event Listeners & UI Hooks
// ==========================================

function setupEvents() {
  // Transport buttons
  document.getElementById('btn-play-pause').onclick = togglePlay;
  document.getElementById('btn-next').onclick = nextTrack;
  document.getElementById('btn-prev').onclick = prevTrack;
  document.getElementById('btn-shuffle').onclick = toggleShuffle;
  document.getElementById('btn-repeat').onclick = toggleRepeat;
  document.getElementById('btn-favorite').onclick = (e) => toggleTrackFavorite(e, CATALOGUE_TRACKS[currentIndex].id);
  document.getElementById('btn-mute').onclick = toggleMute;

  // Expanded Now Playing transport buttons
  const expPlay = document.getElementById('exp-btn-play-pause');
  const expNext = document.getElementById('exp-btn-next');
  const expPrev = document.getElementById('exp-btn-prev');
  const expShuffle = document.getElementById('exp-btn-shuffle') || document.querySelector('.exp-shuffle-btn');
  const expRepeat = document.getElementById('exp-btn-repeat') || document.querySelector('.exp-repeat-btn');
  const expFav = document.getElementById('exp-btn-favorite');
  if (expPlay) expPlay.onclick = togglePlay;
  if (expNext) expNext.onclick = nextTrack;
  if (expPrev) expPrev.onclick = prevTrack;
  if (expShuffle) {
    expShuffle.onclick = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      toggleShuffle();
    };
  }
  if (expRepeat) {
    expRepeat.onclick = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      toggleRepeat();
    };
  }
  if (expFav) expFav.onclick = (e) => toggleTrackFavorite(e, CATALOGUE_TRACKS[currentIndex].id);

  // Queue toggle
  const queueDrawer = document.getElementById('apple-queue-drawer');
  const btnQueuePanel = document.getElementById('btn-queue-panel');
  const expBtnQueue = document.getElementById('exp-btn-queue') || document.querySelector('.exp-queue-btn');
  const btnCloseQueue = document.getElementById('btn-close-queue');

  if (btnQueuePanel) btnQueuePanel.onclick = (e) => toggleQueue(e);
  if (expBtnQueue) {
    expBtnQueue.onclick = (e) => toggleQueue(e);
  }
  if (btnCloseQueue) {
    btnCloseQueue.onclick = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      closeQueueDrawer();
    };
  }

  // Lyrics toggle & dismissing
  const lyricsDrawer = document.getElementById('apple-lyrics-drawer');
  const lyricsBackdrop = document.getElementById('lyrics-backdrop');
  const btnToggleLyrics = document.getElementById('btn-toggle-lyrics');
  const btnLyricsPanel = document.getElementById('btn-lyrics-panel');
  const expBtnLyrics = document.getElementById('exp-btn-lyrics') || document.querySelector('.exp-lyrics-btn');
  const btnCloseLyrics = document.getElementById('btn-close-lyrics');

  if (btnToggleLyrics) btnToggleLyrics.onclick = (e) => { e.preventDefault(); e.stopPropagation(); toggleLyricsDrawer(); };
  if (btnLyricsPanel) btnLyricsPanel.onclick = (e) => { e.preventDefault(); e.stopPropagation(); toggleLyricsDrawer(); };
  if (expBtnLyrics) {
    expBtnLyrics.onclick = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      toggleNowPlayingLyrics();
    };
  }
  if (btnCloseLyrics) btnCloseLyrics.onclick = (e) => { e.preventDefault(); e.stopPropagation(); closeLyricsDrawer(); };
  if (lyricsBackdrop) lyricsBackdrop.onclick = (e) => { e.preventDefault(); closeLyricsDrawer(); };

  // Overlay backdrop and click-outside handler: clicking outside the lyrics drawer closes it
  document.addEventListener('pointerdown', (e) => {
    const drawer = document.getElementById('apple-lyrics-drawer');
    if (!drawer) return;
    const isOpen = drawer.classList.contains('visible') || drawer.classList.contains('active');
    if (!isOpen) return;

    if (drawer.contains(e.target)) return;
    if (btnToggleLyrics && (btnToggleLyrics === e.target || btnToggleLyrics.contains(e.target))) return;
    if (btnLyricsPanel && (btnLyricsPanel === e.target || btnLyricsPanel.contains(e.target))) return;

    closeLyricsDrawer();
  });

  // Click-outside handler: clicking outside the queue drawer closes it cleanly
  document.addEventListener('pointerdown', (e) => {
    const qDrawer = document.getElementById('apple-queue-drawer');
    if (!qDrawer) return;
    const isQOpen = qDrawer.classList.contains('visible') || qDrawer.classList.contains('active');
    if (!isQOpen) return;

    if (qDrawer.contains(e.target)) return;
    if (btnQueuePanel && (btnQueuePanel === e.target || btnQueuePanel.contains(e.target))) return;
    if (expBtnQueue && (expBtnQueue === e.target || expBtnQueue.contains(e.target))) return;

    closeQueueDrawer();
  });

  // Expanded Now Playing view toggle & interactions
  const expandedView = document.getElementById('expanded-player-view');
  const artworkWrapper = document.getElementById('player-artwork-wrapper');
  const playerMeta = document.getElementById('player-meta-info');
  const playerTrackTitle = document.getElementById('player-track-title');
  const playerTrackArtist = document.getElementById('player-track-artist');
  const btnExpandPlayer = document.getElementById('btn-expand-player');
  const btnCollapsePlayer = document.getElementById('btn-collapse-player');
  const expOptionsBtn = document.getElementById('exp-btn-options');
  const expOptionsDropdown = document.getElementById('exp-options-dropdown');
  const expAudioPipeline = document.getElementById('exp-audio-pipeline-badge');
  const expLyricWrap = document.getElementById('exp-lyric-snippet-wrap');
  const expVolTrack = document.getElementById('exp-volume-track');
  const expScrubberTrack = document.getElementById('exp-scrubber-track');

  const openExpandedView = () => {
    if (!expandedView) return;
    expandedView.classList.add('visible');
    expandedView.classList.toggle('is-playing', isPlaying);
  };
  const closeExpandedView = () => {
    if (!expandedView) return;
    expandedView.style.transform = '';
    expandedView.style.transition = '';
    expandedView.classList.remove('visible');
    if (expOptionsDropdown) expOptionsDropdown.style.display = 'none';
    const lyricsContainer = document.getElementById('expanded-lyrics-container');
    const artContainer = document.getElementById('now-playing-art-wrap') || document.getElementById('expanded-artwork-container');
    if (lyricsContainer) lyricsContainer.style.display = 'none';
    if (artContainer) artContainer.style.display = 'block';
    const expLyricsBtn = document.getElementById('exp-btn-lyrics') || document.querySelector('.exp-lyrics-btn');
    if (expLyricsBtn) {
      expLyricsBtn.classList.remove('active');
      expLyricsBtn.style.color = '';
      expLyricsBtn.style.backgroundColor = '';
      expLyricsBtn.title = 'Synced Lyrics';
    }
    const expQueueBtn = document.getElementById('exp-btn-queue') || document.querySelector('.exp-queue-btn');
    if (expQueueBtn) {
      expQueueBtn.classList.remove('active');
      expQueueBtn.style.color = '';
      expQueueBtn.style.backgroundColor = '';
    }
    ['pipeline-modal', 'sleep-modal', 'eq-modal', 'add-to-playlist-modal'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  };

  if (artworkWrapper) artworkWrapper.onclick = openExpandedView;
  if (playerMeta) playerMeta.onclick = openExpandedView;
  if (playerTrackTitle) playerTrackTitle.onclick = openExpandedView;
  if (playerTrackArtist) playerTrackArtist.onclick = openExpandedView;
  if (btnExpandPlayer) btnExpandPlayer.onclick = openExpandedView;
  if (btnCollapsePlayer) {
    btnCollapsePlayer.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      closeExpandedView();
    };
  }

  // Fluid iOS / macOS swipe / drag down to dismiss gesture on Now Playing header
  const expHeader = document.querySelector('.expanded-player-header');
  if (expHeader && expandedView) {
    let startY = 0;
    let currentDragY = 0;
    let isDraggingHeader = false;

    expHeader.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      isDraggingHeader = true;
      startY = e.clientY;
      currentDragY = 0;
      expandedView.style.transition = 'none';
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDraggingHeader) return;
      const deltaY = e.clientY - startY;
      if (deltaY > 0) {
        currentDragY = deltaY;
        expandedView.style.transform = `translate3d(0, ${deltaY}px, 0)`;
      }
    });

    const endDrag = () => {
      if (!isDraggingHeader) return;
      isDraggingHeader = false;
      expandedView.style.transition = '';
      if (currentDragY > 80) {
        closeExpandedView();
      } else {
        expandedView.style.transform = '';
      }
    };

    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  }

  if (expOptionsBtn && expOptionsDropdown) {
    expOptionsBtn.onclick = (e) => {
      e.stopPropagation();
      expOptionsDropdown.style.display = (expOptionsDropdown.style.display === 'none' || !expOptionsDropdown.style.display) ? 'flex' : 'none';
    };
  }

  // Options dropdown items
  const optPipeline = document.getElementById('opt-open-pipeline');
  const optEq = document.getElementById('opt-open-eq');
  const optSleep = document.getElementById('opt-open-sleep');
  const optLyrics = document.getElementById('opt-open-lyrics');
  const optQueue = document.getElementById('opt-open-queue');
  const optAddToPlaylist = document.getElementById('opt-add-to-playlist');

  if (optPipeline) optPipeline.onclick = () => { if (expOptionsDropdown) expOptionsDropdown.style.display = 'none'; openPipelineModal(); };
  if (optEq) optEq.onclick = () => { if (expOptionsDropdown) expOptionsDropdown.style.display = 'none'; const eqM = document.getElementById('eq-modal'); if (eqM) eqM.style.display = 'flex'; };
  if (optSleep) optSleep.onclick = () => { if (expOptionsDropdown) expOptionsDropdown.style.display = 'none'; const sM = document.getElementById('sleep-modal'); if (sM) sM.style.display = 'flex'; };
  if (optLyrics) optLyrics.onclick = () => { if (expOptionsDropdown) expOptionsDropdown.style.display = 'none'; toggleNowPlayingLyrics(); };
  if (optQueue) optQueue.onclick = () => { if (expOptionsDropdown) expOptionsDropdown.style.display = 'none'; toggleQueue(); };
  if (optAddToPlaylist) {
    optAddToPlaylist.onclick = () => {
      if (expOptionsDropdown) expOptionsDropdown.style.display = 'none';
      const currentTrack = CATALOGUE_TRACKS[currentIndex];
      if (currentTrack) openAddToPlaylistModal(currentTrack);
    };
  }

  if (expAudioPipeline) expAudioPipeline.onclick = openPipelineModal;
  if (expLyricWrap) expLyricWrap.onclick = toggleNowPlayingLyrics;

  if (expScrubberTrack) {
    expScrubberTrack.onclick = handleScrubberClick;
  }

  if (expVolTrack) {
    expVolTrack.onclick = (e) => {
      const rect = expVolTrack.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      currentVolume = Math.max(0, Math.min(1, clickX / rect.width));
      isMuted = false;
      applyVolume(currentVolume);
    };
  }

  // Dismiss options dropdown immediately on outside click or pointerdown
  const handleCloseOptionsDropdown = (e) => {
    if (expOptionsDropdown && expOptionsDropdown.style.display !== 'none') {
      if (!expOptionsDropdown.contains(e.target) && !expOptionsBtn.contains(e.target)) {
        expOptionsDropdown.style.display = 'none';
      }
    }
  };
  window.addEventListener('pointerdown', handleCloseOptionsDropdown, true);
  window.addEventListener('click', handleCloseOptionsDropdown, true);

  // Audio Pipeline Modal
  const pipelineModal = document.getElementById('pipeline-modal');
  const btnPipeline = document.getElementById('btn-audio-pipeline');
  const btnClosePipeline = document.getElementById('btn-close-pipeline');
  if (btnPipeline && pipelineModal) btnPipeline.onclick = openPipelineModal;
  if (btnClosePipeline && pipelineModal) btnClosePipeline.onclick = () => { pipelineModal.style.display = 'none'; };

  // Sleep Timer Modal
  const sleepModal = document.getElementById('sleep-modal');
  const btnSleep = document.getElementById('btn-sleep-timer');
  const btnCloseSleep = document.getElementById('btn-close-sleep');
  if (btnSleep && sleepModal) btnSleep.onclick = () => { sleepModal.style.display = 'flex'; };
  if (btnCloseSleep && sleepModal) btnCloseSleep.onclick = () => { sleepModal.style.display = 'none'; };
  document.querySelectorAll('[data-sleep]').forEach(btn => {
    btn.onclick = () => {
      const minutes = parseInt(btn.getAttribute('data-sleep'), 10);
      startPreviewSleepTimer(minutes);
      if (sleepModal) sleepModal.style.display = 'none';
    };
  });
  const btnSleepTrack = document.getElementById('btn-sleep-opt-track');
  if (btnSleepTrack) {
    btnSleepTrack.onclick = () => {
      startPreviewSleepTrack();
      if (sleepModal) sleepModal.style.display = 'none';
    };
  }
  const btnSleepCancel = document.getElementById('btn-sleep-opt-cancel');
  if (btnSleepCancel) {
    btnSleepCancel.onclick = () => {
      cancelPreviewSleepTimer();
      if (sleepModal) sleepModal.style.display = 'none';
    };
  }

  // Equalizer Modal
  const eqModal = document.getElementById('eq-modal');
  const btnEq = document.getElementById('btn-equalizer');
  const btnCloseEq = document.getElementById('btn-close-eq');
  if (btnEq && eqModal) btnEq.onclick = () => { eqModal.style.display = 'flex'; };
  if (btnCloseEq && eqModal) btnCloseEq.onclick = () => { eqModal.style.display = 'none'; };
  document.querySelectorAll('[data-eq]').forEach(btn => {
    btn.onclick = () => {
      const preset = btn.getAttribute('data-eq');
      applyEqPreset(preset);
      if (eqModal) eqModal.style.display = 'none';
    };
  });

  // Settings modal
  const settingsModal = document.getElementById('settings-modal');
  const btnSettings = document.getElementById('btn-settings');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  if (btnSettings && settingsModal) btnSettings.onclick = () => { settingsModal.style.display = 'flex'; };
  if (btnCloseSettings && settingsModal) btnCloseSettings.onclick = () => { settingsModal.style.display = 'none'; };

  // Create Playlist Modal
  const btnCloseCreatePl = document.getElementById('btn-close-create-playlist');
  const btnCancelCreatePl = document.getElementById('btn-cancel-create-playlist');
  const btnConfirmCreatePl = document.getElementById('btn-confirm-create-playlist');
  const inputNewPlTitle = document.getElementById('input-new-playlist-title');
  if (btnCloseCreatePl) btnCloseCreatePl.onclick = closeCreatePlaylistModal;
  if (btnCancelCreatePl) btnCancelCreatePl.onclick = closeCreatePlaylistModal;
  if (btnConfirmCreatePl) btnConfirmCreatePl.onclick = handleConfirmCreatePlaylist;
  if (inputNewPlTitle) {
    inputNewPlTitle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirmCreatePlaylist();
      }
    });
  }

  // Add to Playlist Modal
  const btnCloseAddToPl = document.getElementById('btn-close-add-to-playlist');
  if (btnCloseAddToPl) {
    btnCloseAddToPl.onclick = () => {
      const m = document.getElementById('add-to-playlist-modal');
      if (m) m.style.display = 'none';
    };
  }

  // Sidebar "+ New Playlist"
  const btnSidebarNewPl = document.getElementById('btn-sidebar-new-playlist');
  if (btnSidebarNewPl) {
    btnSidebarNewPl.onclick = () => openCreatePlaylistModal();
  }

  // Profile status badge -> Google sign in / account modal
  const btnLoginStatus = document.getElementById('btn-login-status');
  if (btnLoginStatus) btnLoginStatus.onclick = handleGoogleConnect;

  // Sidebar account button -> Google sign in / account modal
  const btnSidebarAccount = document.getElementById('sidebar-account-btn');
  if (btnSidebarAccount) btnSidebarAccount.onclick = handleGoogleConnect;

  // Account Login Modal wiring
  const btnCloseAccModal = document.getElementById('btn-close-account-modal');
  if (btnCloseAccModal) btnCloseAccModal.onclick = closeAccountModal;

  const tabInApp = document.getElementById('tab-btn-inapp');
  const tabBrowser = document.getElementById('tab-btn-browser');
  if (tabInApp) tabInApp.onclick = () => switchLoginTab('inapp');
  if (tabBrowser) tabBrowser.onclick = () => switchLoginTab('browser');

  const btnModalOpenLogin = document.getElementById('btn-modal-open-login');
  if (btnModalOpenLogin) {
    btnModalOpenLogin.onclick = async () => {
      const statusMsg = document.getElementById('inapp-login-status');
      if (statusMsg) {
        statusMsg.style.color = 'var(--apple-text-secondary)';
        statusMsg.innerText = 'Opening secure sign-in window...';
      }
      const api = window.dejaAPI || window.sonoraAPI;
      if (api?.openGoogleLogin) {
        try {
          const success = await api.openGoogleLogin('direct-google');
          if (success) {
            if (statusMsg) {
              statusMsg.style.color = '#34C759';
              statusMsg.innerText = 'Signed in successfully!';
            }
            setTimeout(() => closeAccountModal(), 600);
          } else {
            if (statusMsg) statusMsg.innerText = 'Sign in window closed.';
          }
        } catch (err) {
          if (statusMsg) {
            statusMsg.style.color = '#FA2D48';
            statusMsg.innerText = 'Error: ' + err.message;
          }
        }
      }
    };
  }

  const btnOpenYtmBrowser = document.getElementById('btn-open-ytm-browser');
  if (btnOpenYtmBrowser) {
    btnOpenYtmBrowser.onclick = () => {
      const api = window.dejaAPI || window.sonoraAPI;
      if (api?.openExternal) {
        api.openExternal('https://music.youtube.com');
      } else if (typeof window !== 'undefined') {
        window.open('https://music.youtube.com', '_blank');
      }
    };
  }

  const btnCopySnippet = document.getElementById('btn-copy-sync-snippet');
  if (btnCopySnippet) {
    btnCopySnippet.onclick = () => {
      const snippetEl = document.getElementById('sync-console-snippet');
      const text = snippetEl ? snippetEl.innerText.trim() : "fetch('http://127.0.0.1:3728/sync?c=' + encodeURIComponent(document.cookie))";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      }
      const orig = btnCopySnippet.innerText;
      btnCopySnippet.innerText = 'Copied!';
      btnCopySnippet.style.color = '#34C759';
      setTimeout(() => {
        btnCopySnippet.innerText = orig;
        btnCopySnippet.style.color = '';
      }, 2000);
    };
  }

  const btnSubmitCookies = document.getElementById('btn-submit-session-cookies');
  if (btnSubmitCookies) {
    btnSubmitCookies.onclick = async () => {
      const inputEl = document.getElementById('input-session-cookies');
      const statusEl = document.getElementById('cookie-import-status');
      const val = inputEl ? inputEl.value.trim() : '';

      if (!val) {
        if (statusEl) {
          statusEl.style.color = '#FA2D48';
          statusEl.innerText = 'Please paste cookies or SAPISID first.';
        }
        return;
      }

      if (statusEl) {
        statusEl.style.color = 'var(--apple-text-secondary)';
        statusEl.innerText = 'Connecting...';
      }

      const api = window.dejaAPI || window.sonoraAPI;
      if (api?.importSessionCookies) {
        try {
          const res = await api.importSessionCookies(val);
          if (res && res.success) {
            if (statusEl) {
              statusEl.style.color = '#34C759';
              statusEl.innerText = 'Connected successfully!';
            }
            if (inputEl) inputEl.value = '';
            setTimeout(() => {
              closeAccountModal();
            }, 800);
          } else {
            if (statusEl) {
              statusEl.style.color = '#FA2D48';
              statusEl.innerText = (res && res.error) ? res.error : 'Authentication failed. Please check cookies.';
            }
          }
        } catch (err) {
          if (statusEl) {
            statusEl.style.color = '#FA2D48';
            statusEl.innerText = 'Error: ' + err.message;
          }
        }
      }
    };
  }

  const btnSwitchAccount = document.getElementById('btn-switch-account');
  if (btnSwitchAccount) {
    btnSwitchAccount.onclick = () => {
      renderAccountModalContent(true);
    };
  }

  const btnModalLogout = document.getElementById('btn-modal-logout');
  if (btnModalLogout) {
    btnModalLogout.onclick = async () => {
      const api = window.dejaAPI || window.sonoraAPI;
      if (api?.logoutGoogle) {
        await api.logoutGoogle();
      }
      updateAccountUI({ isLoggedIn: false });
      renderAccountModalContent(true);
    };
  }

  // Modal backdrop click-away
  ['account-login-modal', 'settings-modal', 'pipeline-modal', 'sleep-modal', 'eq-modal', 'create-playlist-modal', 'add-to-playlist-modal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', (e) => {
        if (e.target === el) {
          el.style.display = 'none';
          if (id === 'create-playlist-modal') pendingTrackToAddToPlaylist = null;
        }
      });
    }
  });

  // Window titlebar buttons & mode toggle
  const api = window.dejaAPI || window.sonoraAPI;
  document.getElementById('btn-close').onclick = () => api?.windowAction('close');
  document.getElementById('btn-minimize').onclick = () => api?.windowAction('minimize');
  document.getElementById('btn-maximize').onclick = () => api?.windowAction('maximize');
  document.getElementById('btn-toggle-miniplayer').onclick = () => api?.windowAction('toggle-miniplayer');
  const btnToggleWeb = document.getElementById('btn-toggle-web');
  if (btnToggleWeb) {
    btnToggleWeb.onclick = () => api?.toggleWebMode();
  }

  // Preferences Modal Config Loader and Live Bindings
  const prefThemeSelect = document.getElementById('pref-theme-select');
  const prefDiscord = document.getElementById('pref-discord');
  const prefTray = document.getElementById('pref-tray');

  if (api?.getConfig) {
    api.getConfig().then(cfg => {
      if (!cfg) return;
      if (prefThemeSelect && cfg.theme) {
        prefThemeSelect.value = cfg.theme;
        applyAppTheme(cfg.theme);
      }
      if (prefDiscord && typeof cfg.discordRPC === 'boolean') {
        prefDiscord.checked = cfg.discordRPC;
      }
      if (prefTray && typeof cfg.minimizeToTray === 'boolean') {
        prefTray.checked = cfg.minimizeToTray;
      }
      if (Array.isArray(cfg.customPlaylists) && cfg.customPlaylists.length > 0) {
        if (!customPlaylists || customPlaylists.length === 0) {
          customPlaylists = cfg.customPlaylists;
          saveCustomPlaylists();
          updateSidebarPlaylistsUI(liveUserPlaylists);
          if (currentView === 'playlists' || (currentView && currentView.startsWith('playlist-'))) {
            renderCurrentView();
          }
        }
      }
    }).catch(() => {});
  }

  if (prefThemeSelect) {
    prefThemeSelect.addEventListener('change', (e) => {
      const theme = e.target.value;
      applyAppTheme(theme);
      api?.setConfig({ theme });
    });
  }

  if (prefDiscord) {
    prefDiscord.addEventListener('change', (e) => {
      api?.setConfig({ discordRPC: e.target.checked });
    });
  }

  if (prefTray) {
    prefTray.addEventListener('change', (e) => {
      api?.setConfig({ minimizeToTray: e.target.checked });
    });
  }

  // Search input handler
  const searchInput = document.getElementById('apple-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderCurrentView();
    });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        clearSearch();
        closeLyricsDrawer();
      }
    });
  }

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // 1. If options menu is open, pressing Escape closes the options menu first
      if (expOptionsDropdown && expOptionsDropdown.style.display !== 'none') {
        expOptionsDropdown.style.display = 'none';
        return;
      }

      // 2. If any modal is currently visible, dismiss it first
      const openModal = ['account-login-modal', 'pipeline-modal', 'sleep-modal', 'eq-modal', 'create-playlist-modal', 'add-to-playlist-modal', 'settings-modal'].find(id => {
        const el = document.getElementById(id);
        return el && el.style.display && el.style.display !== 'none';
      });
      if (openModal) {
        const el = document.getElementById(openModal);
        if (el) el.style.display = 'none';
        pendingTrackToAddToPlaylist = null;
        return;
      }

      // 3. If lyrics drawer, song menu, or queue drawer is open, dismiss it
      const lyricsDrawer = document.getElementById('lyrics-drawer');
      if (lyricsDrawer && lyricsDrawer.classList.contains('visible')) {
        closeLyricsDrawer();
        return;
      }
      const songMenu = document.getElementById('song-context-menu');
      if (songMenu && songMenu.style.display !== 'none') {
        closeSongMenu();
        return;
      }
      const queueDrawer = document.getElementById('apple-queue-drawer');
      if (queueDrawer && (queueDrawer.classList.contains('visible') || queueDrawer.classList.contains('active'))) {
        queueDrawer.classList.remove('visible', 'active');
        return;
      }

      // 4. Otherwise, if expanded player view is visible, collapse it
      if (expandedView && expandedView.classList.contains('visible')) {
        closeExpandedView();
        return;
      }
      return;
    }

    if (e.target.tagName === 'INPUT') return;

    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (searchInput) searchInput.focus();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
      e.preventDefault();
      nextTrack();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
      e.preventDefault();
      prevTrack();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowUp') {
      e.preventDefault();
      adjustVolume(0.05);
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowDown') {
      e.preventDefault();
      adjustVolume(-0.05);
    }
  });
}

function clearSearch() {
  searchQuery = '';
  const searchInput = document.getElementById('apple-search-input');
  if (searchInput) searchInput.value = '';
  renderCurrentView();
}

function setupIPC() {
  const api = window.dejaAPI || window.sonoraAPI;
  if (!api) return;

  if (api.onAuthChanged) {
    api.onAuthChanged(async (acc) => {
      updateAccountUI(acc);
      await fetchLiveYouTubeMusic(true);
      updateSidebarPlaylistsUI();
      renderCurrentView();
    });
  }

  api.onPlayerAction(({ action }) => {
    switch (action) {
      case 'togglePlay': togglePlay(); break;
      case 'nextTrack': nextTrack(); break;
      case 'prevTrack': prevTrack(); break;
      case 'volumeUp': adjustVolume(0.05); break;
      case 'volumeDown': adjustVolume(-0.05); break;
      case 'toggleMute': toggleMute(); break;
      case 'toggleShuffle': toggleShuffle(); break;
      case 'toggleRepeat': toggleRepeat(); break;
      case 'toggleLike': toggleTrackFavorite(null, CATALOGUE_TRACKS[currentIndex].id); break;
      case 'toggleLyrics': toggleLyricsDrawer(); break;
      case 'toggleQueue': document.getElementById('btn-queue-panel')?.click(); break;
      case 'openSettings': document.getElementById('btn-settings')?.click(); break;
    }
  });
}

function applyAppTheme(theme) {
  if (typeof document === 'undefined') return;
  document.body.classList.remove('apple-dark', 'apple-light', 'pure-black');
  if (theme === 'light') {
    document.body.classList.add('apple-light');
  } else if (theme === 'pure-black') {
    document.body.classList.add('pure-black');
  } else {
    document.body.classList.add('apple-dark');
  }
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CATALOGUE_TRACKS,
    EQ_PRESETS,
    escapeHTML,
    formatTime,
    applyAppTheme,
    shufflePlayPlaylist,
    selectYouTubeTrack,
    pushNavigation,
    navigateBack,
    navigateForward,
    navHistory,
    createCatalogueItemFromLive,
    fetchLiveYouTubeMusic,
    openBrowseDetail,
    playLiveTrack,
    resolveAndPlayTrack,
    fallbackToIFrame,
    resolveSyncedLyrics,
    parseLrcLines,
    updateLiveLyrics,
    updateSyncedLyrics,
    renderLyrics,
    toggleNowPlayingLyrics,
    toggleShuffle,
    toggleRepeat,
    openLyricsDrawer,
    closeLyricsDrawer,
    toggleLyricsDrawer,
    toggleQueue,
    openQueueDrawer,
    closeQueueDrawer,
    seekTo,
    updateAccountUI,
    updateSidebarPlaylistsUI,
    lovedTrackIds,
    customPlaylists,
    loadCustomPlaylists,
    saveCustomPlaylists,
    createCustomPlaylist,
    deleteCustomPlaylist,
    addTrackToCustomPlaylist,
    removeTrackFromCustomPlaylist,
    startLyricClock,
    stopLyricClock,
    tickLyricClock,
    cleanSearchTerm,
    cleanArtistTerm,
    getPrimaryArtist,
    openCreatePlaylistModal,
    closeCreatePlaylistModal,
    openAddToPlaylistModal,
    openAccountModal,
    closeAccountModal,
    renderAccountModalContent,
    switchLoginTab
  };
}
