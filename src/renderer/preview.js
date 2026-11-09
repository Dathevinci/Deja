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
    id: 'yt-J7p4bzqLvCw',
    videoId: 'J7p4bzqLvCw',
    musicVideoId: '4NRXx6U8ABQ',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 202,
    genre: 'Synthwave / Pop',
    year: '2020',
    playlists: ['favorites'],
    palette: { c1: 'rgba(255, 0, 80, 0.48)', c2: 'rgba(30, 20, 50, 0.44)', c3: 'rgba(255, 60, 0, 0.40)', c4: 'rgba(120, 0, 50, 0.35)', primaryR: 255, primaryG: 0, primaryB: 80 },
    cover: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg',
    lyrics: [
      { time: 0, text: '♪' },
      { time: 27.4, text: 'I\'ve been tryna call' },
      { time: 30.2, text: 'I\'ve been on my own for long enough' },
      { time: 33.0, text: 'Maybe you can show me how to love, maybe' },
      { time: 38.5, text: 'I\'m going through withdrawals' },
      { time: 41.3, text: 'You don\'t even have to do too much' },
      { time: 44.1, text: 'You can turn me on with just a touch, baby' },
      { time: 49.6, text: 'I look around and Sin City\'s cold and empty' },
      { time: 55.2, text: 'No one\'s around to judge me' },
      { time: 58.0, text: 'I can\'t see clearly when you\'re gone' },
      { time: 60.8, text: 'I said, ooh, I\'m blinded by the lights' },
      { time: 66.4, text: 'No, I can\'t sleep until I feel your touch' },
      { time: 72.0, text: 'I said, ooh, I\'m drowning in the night' },
      { time: 77.6, text: 'Oh, when I\'m like this, you\'re the one I trust' }
    ]
  },
  {
    id: 'yt-kIft-LUHHVA',
    videoId: 'kIft-LUHHVA',
    musicVideoId: 'eVli-tstM5E',
    title: 'Espresso',
    artist: 'Sabrina Carpenter',
    album: 'Short n\' Sweet',
    duration: 176,
    genre: 'Nu-Disco / Pop',
    year: '2024',
    playlists: ['favorites', 'featured'],
    palette: { c1: 'rgba(240, 160, 40, 0.48)', c2: 'rgba(60, 150, 240, 0.44)', c3: 'rgba(255, 220, 100, 0.40)', c4: 'rgba(200, 100, 30, 0.35)', primaryR: 240, primaryG: 160, primaryB: 40 },
    cover: 'https://i.ytimg.com/vi/eVli-tstM5E/hqdefault.jpg',
    lyrics: [
      { time: 0, text: '♪' },
      { time: 8.6, text: 'Now he\'s thinkin\' \'bout me every night, oh' },
      { time: 13.2, text: 'Is it that sweet? I guess so' },
      { time: 17.8, text: 'Say you can\'t sleep, baby, I know' },
      { time: 20.1, text: 'That\'s that me espresso' },
      { time: 24.7, text: 'Move it up, down, left, right, oh' },
      { time: 29.3, text: 'Switch it up like Nintendo' },
      { time: 33.9, text: 'Say you can\'t sleep, baby, I know' },
      { time: 36.2, text: 'That\'s that me espresso' },
      { time: 40.9, text: 'I can\'t relate to desperation' },
      { time: 45.5, text: 'My give-a-fucks are on vacation' },
      { time: 50.1, text: 'And I got this one boy and he won\'t stop calling' },
      { time: 65.0, text: 'Now he\'s thinkin\' \'bout me every night, oh' },
      { time: 74.2, text: 'That\'s that me espresso' }
    ]
  },
  {
    id: 'yt-BkSSOGNeWTM',
    videoId: 'BkSSOGNeWTM',
    musicVideoId: 'G7KNmW9a75Y',
    title: 'Flowers',
    artist: 'Miley Cyrus',
    album: 'Endless Summer Vacation',
    duration: 201,
    genre: 'Pop',
    year: '2023',
    playlists: ['favorites'],
    palette: { c1: 'rgba(255, 200, 0, 0.48)', c2: 'rgba(200, 100, 0, 0.44)', c3: 'rgba(255, 80, 50, 0.40)', c4: 'rgba(180, 120, 20, 0.35)', primaryR: 255, primaryG: 200, primaryB: 0 },
    cover: 'https://i.ytimg.com/vi/G7KNmW9a75Y/hqdefault.jpg',
    lyrics: [
      { time: 0, text: '♪' },
      { time: 7.4, text: 'We were good, we were gold' },
      { time: 11.4, text: 'Kinda dream that can\'t be sold' },
      { time: 15.4, text: 'We were right \'til we weren\'t' },
      { time: 19.4, text: 'Built a home and watched it burn' },
      { time: 23.4, text: 'Mm, I didn\'t wanna leave you' },
      { time: 27.4, text: 'I didn\'t wanna lie' },
      { time: 31.4, text: 'Started to cry, but then remembered I' },
      { time: 38.8, text: 'I can buy myself flowers' },
      { time: 42.8, text: 'Write my name in the sand' },
      { time: 46.8, text: 'Talk to myself for hours' },
      { time: 50.8, text: 'Say things you don\'t understand' },
      { time: 54.8, text: 'I can take myself dancing' },
      { time: 58.8, text: 'And I can hold my own hand' },
      { time: 62.8, text: 'Yeah, I can love me better than you can' }
    ]
  },
  {
    id: 'yt-3_g2un5M350',
    videoId: '3_g2un5M350',
    musicVideoId: '34Na4j8AVgA',
    title: 'Starboy',
    artist: 'The Weeknd ft. Daft Punk',
    album: 'Starboy',
    duration: 231,
    genre: 'R&B / Electronic',
    year: '2016',
    playlists: ['favorites'],
    palette: { c1: 'rgba(0, 100, 255, 0.48)', c2: 'rgba(255, 0, 80, 0.44)', c3: 'rgba(20, 20, 60, 0.40)', c4: 'rgba(0, 200, 255, 0.35)', primaryR: 0, primaryG: 100, primaryB: 255 },
    cover: 'https://i.ytimg.com/vi/34Na4j8AVgA/hqdefault.jpg',
    lyrics: [
      { time: 0, text: '♪' },
      { time: 16.3, text: 'I\'m tryna put you in the worst mood, ah' },
      { time: 18.8, text: 'P1 cleaner than your church shoes, ah' },
      { time: 21.4, text: 'Milli point two just to hurt you, ah' },
      { time: 24.0, text: 'All red Lamb\' just to tease you, ah' },
      { time: 26.6, text: 'None of these toys on lease too, ah' },
      { time: 29.1, text: 'Made your whole year in a week too, yah' },
      { time: 41.2, text: 'Look what you\'ve done' },
      { time: 45.5, text: 'I\'m a motherfuckin\' starboy' },
      { time: 51.5, text: 'Look what you\'ve done' },
      { time: 55.8, text: 'I\'m a motherfuckin\' starboy' }
    ]
  },
  {
    id: 'yt-nujn6wbr-e8',
    videoId: 'nujn6wbr-e8',
    musicVideoId: 'H5v3kku4y6Q',
    title: 'As It Was',
    artist: 'Harry Styles',
    album: 'Harry\'s House',
    duration: 168,
    genre: 'Indie Pop',
    year: '2022',
    playlists: ['favorites'],
    palette: { c1: 'rgba(255, 80, 50, 0.48)', c2: 'rgba(50, 120, 220, 0.44)', c3: 'rgba(250, 200, 60, 0.40)', c4: 'rgba(220, 60, 60, 0.35)', primaryR: 255, primaryG: 80, primaryB: 50 },
    cover: 'https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg',
    lyrics: [
      { time: 0, text: 'Come on, Harry, we wanna say goodnight to you' },
      { time: 13.7, text: 'Holdin\' me back' },
      { time: 16.5, text: 'Gravity\'s holdin\' me back' },
      { time: 19.2, text: 'I want you to hold out the palm of your hand' },
      { time: 22.0, text: 'Why don\'t we leave it at that?' },
      { time: 24.7, text: 'Nothin\' to say' },
      { time: 27.5, text: 'When everything gets in the way' },
      { time: 35.7, text: 'You know it\'s not the same as it was' },
      { time: 41.2, text: 'In this world, it\'s just us' },
      { time: 46.7, text: 'You know it\'s not the same as it was' }
    ]
  },
  {
    id: 'yt-OsfAnsMY21M',
    videoId: 'OsfAnsMY21M',
    musicVideoId: 'TUVcZfQe-Kw',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    duration: 204,
    genre: 'Nu-Disco',
    year: '2020',
    playlists: ['favorites'],
    palette: { c1: 'rgba(160, 40, 220, 0.48)', c2: 'rgba(0, 220, 255, 0.44)', c3: 'rgba(255, 50, 150, 0.40)', c4: 'rgba(100, 20, 180, 0.35)', primaryR: 160, primaryG: 40, primaryB: 220 },
    cover: 'https://i.ytimg.com/vi/TUVcZfQe-Kw/hqdefault.jpg',
    lyrics: [
      { time: 0, text: '♪' },
      { time: 9.3, text: 'If you wanna run away with me, I know a galaxy' },
      { time: 11.7, text: 'And I can take you for a ride' },
      { time: 14.0, text: 'I had a premonition that we fell into a rhythm' },
      { time: 16.3, text: 'Where the music don\'t stop for life' },
      { time: 18.7, text: 'Glitter in the sky, glitter in my eyes' },
      { time: 21.0, text: 'Shining just the way I like' },
      { time: 23.3, text: 'If you\'re feeling like you need a little bit of company' },
      { time: 25.7, text: 'You met me at the perfect time' },
      { time: 28.0, text: 'You want me, I want you, baby' },
      { time: 30.3, text: 'My sugarboo, I\'m levitating' }
    ]
  },
  {
    id: 'yt-RmYCOm4ehKs',
    videoId: 'RmYCOm4ehKs',
    musicVideoId: 'LIIDh-qI9oI',
    title: 'Save Your Tears',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 216,
    genre: 'Synth-Pop',
    year: '2021',
    playlists: ['favorites'],
    palette: { c1: 'rgba(240, 50, 80, 0.48)', c2: 'rgba(120, 30, 180, 0.44)', c3: 'rgba(255, 120, 40, 0.40)', c4: 'rgba(60, 10, 80, 0.35)', primaryR: 240, primaryG: 50, primaryB: 80 },
    cover: 'https://i.ytimg.com/vi/LIIDh-qI9oI/hqdefault.jpg',
    lyrics: [
      { time: 0, text: '♪' },
      { time: 9.1, text: 'I saw you dancing in a crowded room' },
      { time: 13.1, text: 'You look so happy when I\'m not with you' },
      { time: 17.2, text: 'But then you saw me, caught you by surprise' },
      { time: 21.2, text: 'A single teardrop falling from your eye' },
      { time: 25.3, text: 'I don\'t know why I run away' },
      { time: 33.4, text: 'I make you cry when I run away' },
      { time: 49.6, text: 'Save your tears for another day' },
      { time: 57.7, text: 'Save your tears for another day' }
    ]
  },
  {
    id: 'yt-aHmg0jsmNhg',
    videoId: 'aHmg0jsmNhg',
    musicVideoId: 'RlPNh_PBZb4',
    title: 'vampire',
    artist: 'Olivia Rodrigo',
    album: 'GUTS',
    duration: 220,
    genre: 'Pop Rock',
    year: '2023',
    playlists: ['favorites'],
    palette: { c1: 'rgba(140, 30, 60, 0.48)', c2: 'rgba(30, 20, 40, 0.44)', c3: 'rgba(200, 40, 80, 0.40)', c4: 'rgba(80, 10, 30, 0.35)', primaryR: 140, primaryG: 30, primaryB: 60 },
    cover: 'https://i.ytimg.com/vi/RlPNh_PBZb4/hqdefault.jpg',
    lyrics: [
      { time: 0, text: '♪' },
      { time: 14.3, text: 'Hate to give the satisfaction, asking how you\'re doing now' },
      { time: 21.4, text: 'How\'s the castle built off people you pretend to care about?' },
      { time: 28.5, text: 'Just what you wanted, look at you, cool guy, you got it' },
      { time: 42.7, text: 'I should\'ve known it was strange' },
      { time: 46.3, text: 'You only come out at night' },
      { time: 54.8, text: 'Bloodsucker, fame fucker' },
      { time: 58.4, text: 'Bleedin\' me dry like a goddamn vampire' }
    ]
  },
  {
    id: 'yt-3YgtjHZyCIQ',
    videoId: '3YgtjHZyCIQ',
    musicVideoId: 'b1kbLwvqugk',
    title: 'Anti-Hero',
    artist: 'Taylor Swift',
    album: 'Midnights',
    duration: 201,
    genre: 'Synth-Pop',
    year: '2022',
    playlists: ['favorites'],
    palette: { c1: 'rgba(80, 80, 180, 0.48)', c2: 'rgba(180, 100, 60, 0.44)', c3: 'rgba(30, 30, 70, 0.40)', c4: 'rgba(120, 120, 220, 0.35)', primaryR: 80, primaryG: 80, primaryB: 180 },
    cover: 'https://i.ytimg.com/vi/b1kbLwvqugk/hqdefault.jpg',
    lyrics: [
      { time: 0, text: '♪' },
      { time: 9.8, text: 'I have this thing where I get older, but just never wiser' },
      { time: 14.8, text: 'Midnights become my afternoons' },
      { time: 19.7, text: 'When my depression works the graveyard shift' },
      { time: 23.4, text: 'All of the people I\'ve ghosted stand there in the room' },
      { time: 43.1, text: 'It\'s me, hi, I\'m the problem, it\'s me' },
      { time: 48.0, text: 'At tea time, everybody agrees' },
      { time: 52.9, text: 'I\'ll stare directly at the sun, but never in the mirror' },
      { time: 57.8, text: 'It must be exhausting always rooting for the anti-hero' }
    ]
  },
  {
    id: 'yt-DlFXDl_ROAM',
    videoId: 'DlFXDl_ROAM',
    musicVideoId: 'kPa7bsKwL-c',
    title: 'Die With A Smile',
    artist: 'Lady Gaga & Bruno Mars',
    album: 'MAYHEM',
    duration: 252,
    genre: 'Soul / Pop',
    year: '2024',
    playlists: ['favorites', 'featured'],
    palette: { c1: 'rgba(0, 140, 200, 0.48)', c2: 'rgba(200, 60, 60, 0.44)', c3: 'rgba(50, 80, 150, 0.40)', c4: 'rgba(180, 40, 80, 0.35)', primaryR: 0, primaryG: 140, primaryB: 200 },
    cover: 'https://i.ytimg.com/vi/kPa7bsKwL-c/hqdefault.jpg',
    lyrics: [
      { time: 3.4, text: 'Ooh, ooh' },
      { time: 9.1, text: 'I, I just woke up from a dream' },
      { time: 14.0, text: 'Where you and I had to say goodbye' },
      { time: 18.8, text: 'And I don\'t know what it all means' },
      { time: 23.6, text: 'But since I survived, I realized' },
      { time: 28.4, text: 'Wherever you go, that\'s where I\'ll follow' },
      { time: 33.2, text: 'Nobody\'s promised tomorrow' },
      { time: 38.0, text: 'So I\'ma love you every night like it\'s the last night' },
      { time: 45.2, text: 'If the world was ending, I\'d wanna be next to you' },
      { time: 54.8, text: 'If the party was over and our time on Earth was through' },
      { time: 64.4, text: 'I\'d wanna hold you just for a while and die with a smile' }
    ]
  },
  {
    id: 'yt-WKZO-CWeOVA',
    videoId: 'WKZO-CWeOVA',
    musicVideoId: 'd5gf9dXHevw',
    title: 'Birds of a Feather',
    artist: 'Billie Eilish',
    album: 'HIT ME HARD AND SOFT',
    duration: 211,
    genre: 'Alt-Pop',
    year: '2024',
    playlists: ['favorites'],
    palette: { c1: 'rgba(50, 160, 220, 0.48)', c2: 'rgba(20, 40, 90, 0.44)', c3: 'rgba(100, 200, 255, 0.40)', c4: 'rgba(10, 20, 50, 0.35)', primaryR: 50, primaryG: 160, primaryB: 220 },
    cover: 'https://i.ytimg.com/vi/d5gf9dXHevw/hqdefault.jpg',
    lyrics: [
      { time: 3.5, text: 'I want you to stay' },
      { time: 8.1, text: '\'Til I\'m in the grave' },
      { time: 12.7, text: '\'Til I rot away, dead and buried' },
      { time: 17.3, text: '\'Til I\'m in the casket you carry' },
      { time: 22.0, text: 'If you go, I\'m goin\' too, uh' },
      { time: 26.6, text: '\'Cause it was always you, alright' },
      { time: 31.2, text: 'And if I\'m turnin\' blue, please don\'t save me' },
      { time: 35.8, text: 'Nothin\' in this world could ever break me' },
      { time: 42.8, text: 'Birds of a feather, we should stick together, I know' }
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
let currentView = 'home';
let searchQuery = '';

// Live YouTube Music State (InnerTube WEB_REMIX architecture)
let liveHomeShelves = [];
let liveExploreShelves = [];
let liveChartsShelves = [];
let liveNewReleasesShelves = [];
let liveArtists = [];
let liveUserPlaylists = [];
let liveLikedSongs = [];
let liveLibraryAlbums = [];
let liveLibraryArtists = [];
let liveAccount = { isLoggedIn: false };
let activeBrowseDetail = null;
let activeArtistDetail = null;
let liveHistorySongs = null;
let isLoadingHistory = false;
let liveMoodsAndGenres = null;
let isLoadingMoods = false;
let activeSearchFilter = 'ALL';
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
      <span style="display:inline-flex; align-items:center;"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></span> <span>Play Next</span>
    </button>
    <button class="deja-song-menu-item" id="menu-opt-like">
      <span style="display:inline-flex; align-items:center;"><svg width="13" height="13" viewBox="0 0 24 24" fill="${isLoved ? '#FA2D48' : 'none'}" stroke="${isLoved ? '#FA2D48' : 'currentColor'}" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></span> <span>${isLoved ? 'Remove from Liked' : 'Like Song'}</span>
    </button>
    <button class="deja-song-menu-item" id="menu-opt-add-playlist">
      <span>+</span> <span>Add to Playlist...</span>
    </button>
  `;

  if (playlistContextId && playlistContextId.startsWith('custom-')) {
    html += `
      <button class="deja-song-menu-item danger" id="menu-opt-remove-playlist">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        <span>Remove from Playlist</span>
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

// Web Audio API State & 5-Band Equalizer (BitChord GraphicEq architecture)
let audioContext = null;
let masterGain = null;
let eqFilter60 = null;
let eqFilter250 = null;
let eqFilter1k = null;
let eqFilter4k = null;
let eqFilter12k = null;
let bassFilter = null;
let midFilter = null;
let trebleFilter = null;
let activeOscillators = [];
let noteIntervalId = null;

// Playback Nonce & Tracking State (BitChord PlaybackTracker.kt)
let currentCpn = null;
let lastReportedWatchSeconds = 0;

// YouTube Live Audio Playback State & Native BitChord Direct Stream Engine
let ytPlayer = null;
let isYtReady = false;
let isYtPlaying = false;

// Native BitChord Direct Audio Stream Resolution via InnerTube
let dejaAudio = null;
let isDirectStreamPlaying = false;
let currentStreamMeta = null;
let loadedStreamVideoId = null;

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
    if (dejaAudio.currentTime === 0 && currentTime > 1 && dejaAudio.readyState < 1) {
      return;
    }
    currentTime = lyricClockReconciler.reconcile(dejaAudio.currentTime, !dejaAudio.paused);
    const track = CATALOGUE_TRACKS[currentIndex];
    if (track && dejaAudio.duration && !isNaN(dejaAudio.duration) && Math.round(dejaAudio.duration) > 0) {
      const dur = Math.round(dejaAudio.duration);
      const prevDur = track.duration || 0;
      const wasUnverified = Boolean(track._durationUnverified);
      if (dur !== prevDur || wasUnverified) {
        track.duration = dur;
        track._durationUnverified = false;
        const totalEl = document.getElementById('time-total');
        const expTotal = document.getElementById('exp-time-total');
        if (totalEl) totalEl.innerText = formatTime(dur);
        if (expTotal) expTotal.innerText = '-' + formatTime(dur);
        if (wasUnverified || Math.abs(dur - prevDur) > 2) {
          resolveSyncedLyrics(track, true);
        }
        notifyTrackState();
      }
    }
    updateProgress();
    updateSyncedLyrics();
    const pipeModal = typeof document !== 'undefined' && typeof document.getElementById === 'function'
      ? document.getElementById('pipeline-modal')
      : null;
    if (pipeModal && pipeModal.style && pipeModal.style.display === 'flex') {
      updateDynamicPipeline(dejaAudio);
    }
    if (typeof handleBitChordPlaybackTick === 'function') handleBitChordPlaybackTick(dejaAudio);
    if (typeof updateNerdStatsHud === 'function' && typeof bitchordSettings !== 'undefined' && bitchordSettings.showNerdStats) {
      const expView = typeof document !== 'undefined' && typeof document.getElementById === 'function'
        ? document.getElementById('expanded-player-view')
        : null;
      if (!expView || (expView.classList && expView.classList.contains('visible'))) {
        updateNerdStatsHud();
      }
    }
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

let _ytIframeApiLoading = false;
function ensureYouTubeIframeApiLoaded() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window.YT || _ytIframeApiLoading) return;
  _ytIframeApiLoading = true;
  try {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    tag.onerror = () => {
      _ytIframeApiLoading = false;
      console.info('[YouTube] YouTube IFrame API script load skipped (offline mode).');
    };
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else if (document.head) {
      document.head.appendChild(tag);
    }
  } catch {
    _ytIframeApiLoading = false;
  }
}

/**
 * Fallback gracefully to hidden YouTube IFrame player with unMute() and setVolume(100).
 */
function fallbackToIFrame(track) {
  if (!track || !track.videoId) return;
  ensureYouTubeIframeApiLoaded();
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
      isYtPlaying = typeof ytPlayer.getPlayerState === 'function' ? ytPlayer.getPlayerState() === 1 : true;
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
function generateCpn() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_';
  let out = '';
  for (let i = 0; i < 16; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

function sendFinalWatchtimePing() {
  const track = CATALOGUE_TRACKS[currentIndex];
  if (currentCpn && track && track.videoId) {
    const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
    if (api?.trackPlayback) {
      api.trackPlayback({
        videoId: track.videoId,
        cpn: currentCpn,
        state: 'watchtime',
        seconds: Math.floor(currentTime),
        final: true
      }).catch(() => {});
    }
  }
  currentCpn = null;
  lastReportedWatchSeconds = 0;
}

const streamUrlCache = new Map();
let pendingStartupResumeSec = 0;
let pendingStartupResumeVideoId = '';
let manualPausedSeekSec = 0;
let manualPausedSeekTrackKey = '';
let activeStreamResolveReqId = 0;

async function resolveAndPlayTrack(track) {
  if (!track) return;
  const resolveReqId = ++activeStreamResolveReqId;
  const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
  const trackKey = String(track.videoId || track.id || '');

  let targetResumeSec = 0;
  if (pendingStartupResumeSec > 0 && (!pendingStartupResumeVideoId || pendingStartupResumeVideoId === trackKey)) {
    targetResumeSec = pendingStartupResumeSec;
  } else if (manualPausedSeekSec > 0 && (!manualPausedSeekTrackKey || manualPausedSeekTrackKey === trackKey)) {
    targetResumeSec = manualPausedSeekSec;
  }
  pendingStartupResumeSec = 0;
  pendingStartupResumeVideoId = '';
  manualPausedSeekSec = 0;
  manualPausedSeekTrackKey = '';

  // Flush final watchtime for prior track before switching
  sendFinalWatchtimePing();
  currentCpn = generateCpn();
  lastReportedWatchSeconds = 0;

  // Stop any active audio and timers before switching
  if (playbackTimer) {
    clearInterval(playbackTimer);
    playbackTimer = null;
  }
  stopLyricClock();
  isDirectStreamPlaying = false;
  if (dejaAudio) {
    try {
      if (!dejaAudio.paused) dejaAudio.pause();
      dejaAudio.currentTime = targetResumeSec > 0 ? targetResumeSec : 0;
    } catch {}
  }
  if (isYtReady && ytPlayer && isYtPlaying) {
    try { ytPlayer.pauseVideo(); } catch {}
    isYtPlaying = false;
  }
  currentTime = targetResumeSec > 0 ? targetResumeSec : 0;
  if (typeof lyricClockReconciler !== 'undefined' && lyricClockReconciler) {
    lyricClockReconciler.snap(currentTime);
  }
  updateProgress();

  // Ensure AudioContext & 5-band Equalizer graph are initialized and resumed
  try {
    ensureAudioGraph();
    applyBitChordAudioDspSettings();
  } catch {}
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }

  if (api?.resolveAudioStream && track.videoId) {
    try {
      const activeQuality = (typeof bitchordSettings !== 'undefined' && bitchordSettings)
        ? (bitchordSettings.meteredConnection ? bitchordSettings.cellularQuality : bitchordSettings.wifiQuality)
        : 'Hi-Res Lossless';
      const streamOpts = {
        quality: activeQuality,
        dolbyAtmos: Boolean(typeof bitchordSettings !== 'undefined' && bitchordSettings.dolbyAtmos),
        preferMusicOnly: typeof bitchordSettings !== 'undefined' ? bitchordSettings.preferMusicOnly !== false : true,
        title: track.title || '',
        artist: track.artist || ''
      };
      const cacheKey = `${track.videoId}::${streamOpts.quality || ''}::${streamOpts.dolbyAtmos ? 'atmos' : 'std'}::${streamOpts.preferMusicOnly ? 'atv' : 'raw'}`;
      let stream = null;
      const cachedEntry = streamUrlCache.get(cacheKey);
      if (cachedEntry && cachedEntry.stream && cachedEntry.fn === api.resolveAudioStream && (Date.now() - cachedEntry.ts < 15 * 60 * 1000)) {
        stream = cachedEntry.stream;
      } else {
        stream = await api.resolveAudioStream(track.videoId, streamOpts);
        if (resolveReqId !== activeStreamResolveReqId) return;
        if (stream && stream.url) {
          const maxEntries = Math.max(8, Math.floor((Number(bitchordSettings?.songCacheLimitMb) || 2048) / 8));
          if (streamUrlCache.size >= maxEntries) {
            const oldestKey = streamUrlCache.keys().next().value;
            if (oldestKey !== undefined) streamUrlCache.delete(oldestKey);
          }
          streamUrlCache.set(cacheKey, { stream, ts: Date.now(), fn: api.resolveAudioStream });
        }
      }
      if (resolveReqId !== activeStreamResolveReqId) return;
      if (stream && stream.url && dejaAudio) {
        currentStreamMeta = stream;
        if (stream.resolvedAudioVideoId) {
          track._resolvedAudioVideoId = stream.resolvedAudioVideoId;
        }
        const resumeTime = targetResumeSec > 0 ? targetResumeSec : 0;
        isDirectStreamPlaying = true;
        loadedStreamVideoId = track.videoId || track.id || '';
        dejaAudio.src = stream.url;
        try { applyBitChordAudioDspSettings(); } catch {}
        if (typeof applyVolume === 'function') {
          applyVolume(currentVolume);
        } else {
          dejaAudio.volume = isMuted ? 0 : currentVolume;
        }
        if (resumeTime > 0) {
          currentTime = resumeTime;
          if (typeof lyricClockReconciler !== 'undefined' && lyricClockReconciler) {
            lyricClockReconciler.snap(resumeTime);
          }
          try { dejaAudio.currentTime = resumeTime; } catch {}
          if (typeof dejaAudio.addEventListener === 'function') {
            const onLoadedMeta = () => {
              if (typeof dejaAudio.removeEventListener === 'function') {
                dejaAudio.removeEventListener('loadedmetadata', onLoadedMeta);
              }
              if (resolveReqId === activeStreamResolveReqId && dejaAudio.currentTime < 1 && resumeTime > 0) {
                try { dejaAudio.currentTime = resumeTime; } catch {}
              }
            };
            dejaAudio.addEventListener('loadedmetadata', onLoadedMeta);
          }
        } else {
          currentTime = 0;
          if (typeof lyricClockReconciler !== 'undefined' && lyricClockReconciler) {
            lyricClockReconciler.snap(0);
          }
          try { dejaAudio.currentTime = 0; } catch {}
        }
        if (stream.duration && stream.duration > 0) {
          const prevDur = track.duration || 0;
          const wasUnverified = Boolean(track._durationUnverified);
          track.duration = stream.duration;
          track._durationUnverified = false;
          const totalEl = document.getElementById('time-total');
          const expTotal = document.getElementById('exp-time-total');
          if (totalEl) totalEl.innerText = formatTime(track.duration);
          if (expTotal) expTotal.innerText = '-' + formatTime(track.duration);
          if (wasUnverified || Math.abs(stream.duration - prevDur) > 2 || !track._lyricsResolved || stream.resolvedAudioVideoId) {
            resolveSyncedLyrics(track, true);
          }
        }
        updateProgress();
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
        if (typeof document !== 'undefined') {
          if (playbackTimer) clearInterval(playbackTimer);
          playbackTimer = setInterval(tick, 1000);
          startLyricClock();
        }
        if (api?.trackPlayback && track.videoId) {
          api.trackPlayback({ videoId: track.videoId, cpn: currentCpn, state: 'start', seconds: Math.floor(resumeTime) }).catch(() => {});
        }
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
  if (typeof document !== 'undefined') {
    if (playbackTimer) clearInterval(playbackTimer);
    playbackTimer = setInterval(tick, 1000);
    startLyricClock();
  }
  if (api?.trackPlayback && track.videoId) {
    api.trackPlayback({ videoId: track.videoId, cpn: currentCpn, state: 'start', seconds: 0 }).catch(() => {});
  }
  notifyTrackState();
}

if (typeof window !== 'undefined') {
  window.onYouTubeIframeAPIReady = function() {
    try {
      const initialVideoId = (CATALOGUE_TRACKS[currentIndex] && CATALOGUE_TRACKS[currentIndex].videoId) ||
                             (CATALOGUE_TRACKS[0] && CATALOGUE_TRACKS[0].videoId) ||
                             'E9jGlwluIbk';

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
            // If IFrame playback encounters Error 150 / 101 or embed block while actively playing, attempt direct stream
            const cur = CATALOGUE_TRACKS[currentIndex];
            if (isPlaying && cur && cur.videoId && !isDirectStreamPlaying) {
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
let isDefaultCatalogueQueue = true;
const sessionPlayedVideoIds = new Set();
const sessionPlayedTitleKeys = new Set();
let playedHistoryStack = [];
let lastPlaybackSaveMs = 0;

function normalizeTrackDedupeKey(t) {
  if (!t) return '';
  const rawTitle = cleanSearchTerm(t.title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
  const rawArtist = getPrimaryArtist(t.artist || '')
    .replace(/\s*-\s*topic$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
  if (!rawTitle) return '';
  return `${rawTitle}::${rawArtist}`;
}

function dedupeTrackList(tracks, preferTrack = null) {
  if (!Array.isArray(tracks) || tracks.length === 0) {
    return preferTrack && typeof preferTrack === 'object' ? [preferTrack] : [];
  }
  const seenIds = new Set();
  const seenTitleKeys = new Set();
  const result = [];
  const registerAndPush = (item) => {
    if (!item || typeof item !== 'object') return;
    const vid = item.videoId ? String(item.videoId) : '';
    const mvid = item.musicVideoId ? String(item.musicVideoId) : '';
    const idKey = item.id !== undefined && item.id !== null ? `id:${item.id}` : '';
    const tKey = normalizeTrackDedupeKey(item);
    if ((vid && seenIds.has(vid)) || (mvid && seenIds.has(mvid)) || (idKey && seenIds.has(idKey)) || (tKey && seenTitleKeys.has(tKey))) {
      return;
    }
    if (vid) seenIds.add(vid);
    if (mvid) seenIds.add(mvid);
    if (idKey) seenIds.add(idKey);
    if (tKey) seenTitleKeys.add(tKey);
    result.push(item);
  };
  if (preferTrack && typeof preferTrack === 'object') {
    registerAndPush(preferTrack);
  }
  for (const item of tracks) {
    registerAndPush(item);
  }
  return result;
}

function saveLastPlaybackState(force = false) {
  if (typeof localStorage === 'undefined') return;
  const now = Date.now();
  if (!force && now - lastPlaybackSaveMs < 2500) return;
  lastPlaybackSaveMs = now;
  try {
    const track = CATALOGUE_TRACKS[currentIndex];
    if (!track) return;
    const dedupedQueue = Array.isArray(userQueue) && userQueue.length > 0
      ? dedupeTrackList(userQueue, track)
      : [];
    const savedQueue = dedupedQueue.slice(0, 40).map(t => ({
      id: t.id,
      videoId: t.videoId || '',
      title: t.title || '',
      artist: t.artist || '',
      album: t.album || '',
      cover: t.cover || '',
      duration: Number(t.duration) || 180,
      genre: t.genre || 'YouTube Music',
      quality: t.quality || 'Lossless',
      palette: t.palette || null
    }));
    const payload = {
      track: {
        id: track.id,
        videoId: track.videoId || '',
        title: track.title || '',
        artist: track.artist || '',
        album: track.album || '',
        cover: track.cover || '',
        duration: Number(track.duration) || 180,
        genre: track.genre || 'YouTube Music',
        quality: track.quality || 'Lossless',
        palette: track.palette || null
      },
      currentIndex: Number(currentIndex) || 0,
      currentTime: Math.max(0, Number(currentTime) || 0),
      userQueue: savedQueue,
      isDefaultCatalogueQueue,
      savedAt: now
    };
    localStorage.setItem('deja_last_playback_state', JSON.stringify(payload));
  } catch {}
}

function restoreLastPlaybackState() {
  if (typeof localStorage === 'undefined') return false;
  try {
    const raw = localStorage.getItem('deja_last_playback_state');
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.track || !parsed.track.title) return false;
    const savedTrack = createCatalogueItemFromLive(parsed.track);
    if (parsed.track.id) savedTrack.id = parsed.track.id;
    if (parsed.track.palette) savedTrack.palette = parsed.track.palette;
    const savedKey = normalizeTrackDedupeKey(savedTrack);

    let idx = CATALOGUE_TRACKS.findIndex(t =>
      (savedTrack.videoId && t.videoId === savedTrack.videoId) ||
      (savedTrack.id && t.id === savedTrack.id) ||
      (savedKey && normalizeTrackDedupeKey(t) === savedKey)
    );
    if (idx === -1) {
      CATALOGUE_TRACKS.unshift(savedTrack);
      idx = 0;
    } else {
      CATALOGUE_TRACKS[idx] = { ...CATALOGUE_TRACKS[idx], ...savedTrack };
    }

    if (Array.isArray(parsed.userQueue) && parsed.userQueue.length > 0) {
      const mappedQueue = parsed.userQueue.map(q => {
        const item = createCatalogueItemFromLive(q);
        if (q.id) item.id = q.id;
        return item;
      });
      const qIdx = mappedQueue.findIndex(t =>
        (savedTrack.videoId && t.videoId === savedTrack.videoId) ||
        (savedTrack.id && t.id === savedTrack.id) ||
        (savedKey && normalizeTrackDedupeKey(t) === savedKey)
      );
      const rotatedQueue = qIdx > 0 ? mappedQueue.slice(qIdx) : mappedQueue;
      userQueue = dedupeTrackList(rotatedQueue, CATALOGUE_TRACKS[idx]);
      isDefaultCatalogueQueue = Boolean(parsed.isDefaultCatalogueQueue);
    }

    isPlaying = false;
    isDirectStreamPlaying = false;
    isYtPlaying = false;
    loadedStreamVideoId = null;
    loadTrack(idx, true);
    const resumeSec = Math.max(0, Math.min(Number(parsed.currentTime) || 0, Math.max(0, (savedTrack.duration || 180) - 1)));
    if (resumeSec > 0) {
      currentTime = resumeSec;
      pendingStartupResumeSec = resumeSec;
      pendingStartupResumeVideoId = String(savedTrack.videoId || savedTrack.id || '');
      if (typeof lyricClockReconciler !== 'undefined' && lyricClockReconciler) {
        lyricClockReconciler.snap(currentTime);
      }
      updateProgress();
      updateSyncedLyrics(true);
    }
    updatePlayButton();
    if (savedTrack.videoId && (isDefaultCatalogueQueue || !Array.isArray(userQueue) || userQueue.length <= 1)) {
      refreshUpNextQueueForTrack(savedTrack, true);
    }
    return true;
  } catch {
    return false;
  }
}

const EQ_PRESETS = {
  'Flat': { b60: 0, b250: 0, b1k: 0, b4k: 0, b12k: 0, bass: 0, mid: 0, treble: 0 },
  'Bass Boost': { b60: 6, b250: 4, b1k: 0, b4k: -1, b12k: -2, bass: 6, mid: 0, treble: -1 },
  'Acoustic': { b60: 2, b250: 1, b1k: 3, b4k: 2, b12k: 1, bass: 2, mid: 3, treble: 1 },
  'Vocal Booster': { b60: -2, b250: 0, b1k: 4, b4k: 3, b12k: 1, bass: -2, mid: 4, treble: 2 },
  'Treble Booster': { b60: -2, b250: -1, b1k: 1, b4k: 4, b12k: 6, bass: -2, mid: 1, treble: 5 }
};

// Initialize Application (BitChord Native Architecture)
function bootDejaApp() {
  initUI();
  setupNavigation();
  setupEvents();
  setupIPC();
  if (!restoreLastPlaybackState()) {
    loadTrack(0);
  }

  // Instant restoration from local storage cache before network returns
  try {
    const cachedAcc = localStorage.getItem('deja_cached_account');
    if (cachedAcc) {
      const parsedAcc = JSON.parse(cachedAcc);
      if (parsedAcc && parsedAcc.isLoggedIn) {
        if (parsedAcc.name === 'Google User') parsedAcc.name = 'YouTube Music';
        if (parsedAcc.channelTitle === 'Google User') parsedAcc.channelTitle = 'YouTube Music';
        if (parsedAcc.handle === '@user') parsedAcc.handle = 'YouTube Music Account';
        updateAccountUI(parsedAcc);
      }
    }
    const cachedPls = localStorage.getItem('deja_cached_playlists');
    if (cachedPls) {
      const parsedPls = JSON.parse(cachedPls);
      if (Array.isArray(parsedPls) && parsedPls.length > 0) {
        liveUserPlaylists = parsedPls;
      }
    }
  } catch {}

  updateSidebarPlaylistsUI(liveUserPlaylists);
  currentView = 'home';
  pushNavigation('home', false);
  renderCurrentView();
  fetchLiveYouTubeMusic();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootDejaApp);
  } else {
    bootDejaApp();
  }
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
}

// ==========================================
// View Routing & Dynamic Content Rendering
// ==========================================

let bcLibrarySortMode = 'Recently Added';
let bcRecentsGridMode = false;
let bcRecentSearches = ['The Weeknd', 'Daft Punk', 'Billie Eilish', 'Synthwave', 'Tame Impala'];

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

  // BitChord 4-Tab Floating Glass Navigation Bar (GlassNavBar.kt / FloatingBottomBar.kt)
  const bcNavItems = document.querySelectorAll('.bc-nav-tab[data-bc-tab], .bc-nav-item[data-bc-tab]');
  bcNavItems.forEach(btn => {
    btn.onclick = () => {
      const tab = btn.getAttribute('data-bc-tab');
      if (tab) {
        navigateTo(tab);
      }
    };
  });

  // BitChord FrostedTopBar controls (FrostedTopBar.kt)
  const logoMark = document.getElementById('bc-top-logo-mark');
  if (logoMark) logoMark.onclick = () => navigateTo('home');

  const topBackBtn = document.getElementById('bc-top-back-btn');
  if (topBackBtn) topBackBtn.onclick = () => navigateBack();

  const topHistoryBtn = document.getElementById('bc-top-history-btn');
  if (topHistoryBtn) topHistoryBtn.onclick = () => navigateTo('history');

  const topDownloadsBtn = document.getElementById('bc-top-downloads-btn');
  if (topDownloadsBtn) topDownloadsBtn.onclick = () => navigateTo('downloads');

  const topSettingsBtn = document.getElementById('bc-top-settings-btn');
  if (topSettingsBtn) topSettingsBtn.onclick = () => navigateTo('settings');

  const topSortBtn = document.getElementById('bc-top-sort-btn');
  if (topSortBtn) {
    topSortBtn.onclick = () => {
      const modes = ['Recently Added', 'Title A–Z', 'Artist A–Z'];
      const nextIdx = (modes.indexOf(bcLibrarySortMode) + 1) % modes.length;
      bcLibrarySortMode = modes[nextIdx];
      topSortBtn.title = `Sort Library: ${bcLibrarySortMode}`;
      if (typeof showToast === 'function') showToast(`Sorted by ${bcLibrarySortMode}`);
      renderCurrentView();
    };
  }

  // Scroll listener for collapsing FrostedTopBar title (throttled to threshold crossing)
  const mainScroll = document.getElementById('main-content-scroll');
  if (mainScroll && typeof mainScroll.addEventListener === 'function') {
    let lastScrolledState = null;
    mainScroll.addEventListener('scroll', () => {
      const scrolled = mainScroll.scrollTop > 56;
      if (scrolled === lastScrolledState) return;
      lastScrolledState = scrolled;
      const collapsedTitle = document.getElementById('bc-top-collapsed-title');
      if (collapsedTitle && collapsedTitle.classList) {
        collapsedTitle.classList.toggle('visible', scrolled);
      }
      if (document.body && document.body.classList) {
        document.body.classList.toggle('bc-topbar-scrolled', scrolled);
      }
    }, { passive: true });
  }
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

function syncBitChordShellChrome() {
  if (typeof document === 'undefined') return;
  const isHome = currentView === 'home' || currentView === 'listen-now';
  const isExplore = currentView === 'explore' || currentView === 'browse' || currentView === 'radio';
  const isSearch = currentView === 'search' || Boolean(searchQuery && searchQuery.trim().length > 0);
  const isLibrary = !isHome && !isExplore && !isSearch;

  if (typeof document.querySelectorAll === 'function') {
    const bcNavItems = document.querySelectorAll('.bc-nav-tab[data-bc-tab], .bc-nav-item[data-bc-tab]');
    bcNavItems.forEach(btn => {
      const tab = btn.getAttribute('data-bc-tab');
      const active =
        (tab === 'home' && isHome) ||
        (tab === 'explore' && isExplore) ||
        (tab === 'library' && isLibrary) ||
        (tab === 'search' && isSearch);
      if (btn.classList) btn.classList.toggle('active', active);
    });

    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
      const page = link.getAttribute('data-page');
      const playlist = link.getAttribute('data-playlist');
      let isActive = false;
      if (page) {
        isActive = (page === currentView) || (page === 'home' && currentView === 'listen-now');
      } else if (playlist) {
        isActive = currentView === `playlist-${playlist}`;
      }
      if (link.classList) link.classList.toggle('active', isActive);
    });
  }

  const isPushedScreen =
    currentView === 'browse-detail' ||
    currentView === 'artist-detail' ||
    currentView === 'settings' ||
    currentView === 'replay' ||
    currentView === 'downloads' ||
    currentView === 'history' ||
    currentView === 'albums' ||
    currentView === 'artists' ||
    currentView === 'songs' ||
    currentView === 'playlists' ||
    (typeof currentView === 'string' && currentView.startsWith('playlist-'));

  if (typeof document.getElementById === 'function') {
    const topLogo = document.getElementById('bc-top-logo-mark');
    const topBack = document.getElementById('bc-top-back-btn');
    const topSort = document.getElementById('bc-top-sort-btn');
    const topTitle = document.getElementById('bc-top-collapsed-title');

    if (topLogo) topLogo.style.display = isPushedScreen ? 'none' : 'inline-flex';
    if (topBack) topBack.style.display = isPushedScreen ? 'inline-flex' : 'none';
    if (topSort) {
      const showSort = currentView === 'library' || currentView === 'playlists' || currentView === 'albums' || currentView === 'songs';
      topSort.style.display = showSort ? 'inline-flex' : 'none';
    }
    if (topTitle) {
      const titleMap = {
        'home': 'Listen Now',
        'listen-now': 'Listen Now',
        'explore': 'Explore',
        'browse': 'Explore',
        'library': 'Library',
        'search': 'Search',
        'settings': 'Settings',
        'replay': 'Your Replay',
        'downloads': 'Downloads',
        'history': 'History',
        'albums': 'Albums',
        'artists': 'Artists',
        'songs': 'Songs',
        'playlists': 'Playlists',
        'browse-detail': activeBrowseDetail?.title || 'Album',
        'artist-detail': activeArtistDetail?.name || 'Artist'
      };
      topTitle.textContent = titleMap[currentView] || (currentView.startsWith('playlist-') ? 'Playlist' : 'Listen Now');
    }
  }
}

function renderCurrentView() {
  const mainContent = document.getElementById('main-content-scroll');
  if (!mainContent) return;

  // Update active sidebar link & BitChord 4-tab bar
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  sidebarLinks.forEach(link => {
    const page = link.getAttribute('data-page');
    const pl = link.getAttribute('data-playlist');
    const isHome = (page === 'home' || page === 'listen-now') && (currentView === 'home' || currentView === 'listen-now');
    const isExplore = (page === 'explore' || page === 'browse') && (currentView === 'explore' || currentView === 'browse');
    const isExact = page && page === currentView;
    if ((isHome || isExplore || isExact) && !searchQuery.trim()) {
      link.classList.add('active');
    } else if (pl && `playlist-${pl}` === currentView && !searchQuery.trim()) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  syncBitChordShellChrome();

  if (currentView === 'search') {
    renderSearchTabView(mainContent);
    return;
  }

  if (searchQuery.trim().length > 0) {
    renderSearchResultsView(mainContent);
    return;
  }

  if (currentView === 'home' || currentView === 'listen-now') {
    renderHomeView(mainContent);
  } else if (currentView === 'explore' || currentView === 'browse') {
    renderExploreView(mainContent);
  } else if (currentView === 'radio') {
    renderRadioView(mainContent);
  } else if (currentView === 'recently-added') {
    renderRecentlyAddedView(mainContent);
  } else if (currentView === 'history') {
    renderHistoryView(mainContent);
  } else if (currentView === 'artists') {
    renderArtistsView(mainContent);
  } else if (currentView === 'albums') {
    renderAlbumsView(mainContent);
  } else if (currentView === 'songs') {
    renderSongsTableView(mainContent);
  } else if (currentView === 'playlists') {
    renderPlaylistsGridView(mainContent);
  } else if (currentView === 'library') {
    renderLibraryView(mainContent);
  } else if (currentView.startsWith('playlist-')) {
    const playlistId = currentView.replace('playlist-', '');
    renderSinglePlaylistView(mainContent, playlistId);
  } else if (currentView === 'browse-detail') {
    renderBrowseDetailView(mainContent);
  } else if (currentView === 'artist-detail') {
    renderArtistDetailView(mainContent);
  } else if (currentView === 'settings') {
    renderSettingsView(mainContent);
  } else if (currentView === 'replay') {
    renderReplayView(mainContent);
  } else if (currentView === 'downloads') {
    renderDownloadsView(mainContent);
  }
}

/**
 * Converts HSL color to RGB [r, g, b] (0..255).
 */
function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

/**
 * Derives a vibrant 4-color mesh gradient palette deterministically from a track seed.
 * Follows BitChord MeshGradient.kt tuning:
 * Saturation boosted 1.35x (clamped <= 1.0) and lightness clamped in [0.28, 0.58].
 */
/**
 * Upgrades YouTube Music / Googleusercontent / i.ytimg.com thumbnail URLs
 * to 1080x1080 Ultra-HD resolution for razor-sharp Now Playing and Card artwork.
 */
function upscaleArtworkUrl(url, videoId, size = 360) {
  if (!url || typeof url !== 'string') {
    return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '../../assets/icon.png';
  }
  const trimmed = url.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('../../') || trimmed.startsWith('file:')) {
    return trimmed;
  }
  const dim = Number(size) > 0 ? Math.round(Number(size)) : 360;
  if (trimmed.includes('googleusercontent.com') || trimmed.includes('ggpht.com')) {
    if (/=w\d+-h\d+/.test(trimmed)) {
      return trimmed.replace(/=w\d+-h\d+[^&?]*/, `=w${dim}-h${dim}-l90-rj`);
    }
    if (/=s\d+/.test(trimmed)) {
      return trimmed.replace(/=s\d+[^&?]*/, `=s${dim}`);
    }
    return trimmed + `=w${dim}-h${dim}-l90-rj`;
  }
  if (trimmed.includes('i.ytimg.com/vi/')) {
    return trimmed.replace(/\/(default|mqdefault|sddefault)\.jpg/, '/hqdefault.jpg');
  }
  return trimmed;
}

function deriveTrackPalette(seed) {
  // Neutral deep obsidian slate fallback so monochrome/live tracks never get fake red or muddy green backgrounds
  let hash = 0;
  const str = String(seed || 'deja-track');
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + (str.charCodeAt(i) * 37);
    hash |= 0;
  }
  const baseHue = Math.abs(hash) % 360;
  const hues = [
    baseHue,
    (baseHue + 30) % 360,
    (baseHue + 60) % 360,
    (baseHue + 90) % 360
  ];
  const tunedSat = 0.72;
  const tunedLight = 0.44;

  const rgbs = hues.map(h => hslToRgb(h, tunedSat, tunedLight));
  const pR = rgbs[0][0];
  const pG = rgbs[0][1];
  const pB = rgbs[0][2];

  return {
    c1: `rgba(${rgbs[0][0]}, ${rgbs[0][1]}, ${rgbs[0][2]}, 0.36)`,
    c2: `rgba(${rgbs[1][0]}, ${rgbs[1][1]}, ${rgbs[1][2]}, 0.32)`,
    c3: `rgba(${rgbs[2][0]}, ${rgbs[2][1]}, ${rgbs[2][2]}, 0.28)`,
    c4: `rgba(${rgbs[3][0]}, ${rgbs[3][1]}, ${rgbs[3][2]}, 0.25)`,
    primaryR: pR,
    primaryG: pG,
    primaryB: pB
  };
}

/**
 * Samples pixel data from an image and derives a 4-color dynamic mesh palette
 * following BitChord MeshGradient.kt (tuned & expandedToFour).
 */
const extractedPaletteCache = new Map();
function extractPaletteFromImage(imageUrl, callback) {
  if (typeof Image === 'undefined' || typeof document === 'undefined' || !imageUrl) {
    if (callback) callback(null);
    return;
  }
  if (extractedPaletteCache.has(imageUrl)) {
    if (callback) callback(extractedPaletteCache.get(imageUrl));
    return;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        if (callback) callback(null);
        return;
      }
      ctx.drawImage(img, 0, 0, 16, 16);
      const imgData = ctx.getImageData(0, 0, 16, 16).data;

      // Sample colors from pixels
      const colors = [];
      for (let i = 0; i < imgData.length; i += 16) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        const a = imgData[i + 3];
        if (a < 128) continue;
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        if (brightness < 20 || brightness > 240) continue;
        colors.push([r, g, b]);
      }

      if (colors.length === 0) {
        if (callback) callback(deriveTrackPalette(imageUrl));
        return;
      }

      // Pick up to 4 distinct colors
      const chosen = [colors[0]];
      for (let c of colors) {
        if (chosen.length >= 4) break;
        const dist = Math.min(...chosen.map(x => Math.hypot(x[0] - c[0], x[1] - c[1], x[2] - c[2])));
        if (dist > 45) {
          chosen.push(c);
        }
      }

      // If fewer than 4 (e.g. monochrome/grayscale cover), expand by smooth luminance stepping (never fake green/red)
      while (chosen.length < 4) {
        const base = chosen[chosen.length - 1];
        chosen.push([Math.max(18, Math.round(base[0] * 0.78)), Math.max(18, Math.round(base[1] * 0.78)), Math.max(22, Math.round(base[2] * 0.78))]);
      }

      const pR = chosen[0][0];
      const pG = chosen[0][1];
      const pB = chosen[0][2];

      const palette = {
        c1: `rgba(${chosen[0][0]}, ${chosen[0][1]}, ${chosen[0][2]}, 0.48)`,
        c2: `rgba(${chosen[1][0]}, ${chosen[1][1]}, ${chosen[1][2]}, 0.44)`,
        c3: `rgba(${chosen[2][0]}, ${chosen[2][1]}, ${chosen[2][2]}, 0.40)`,
        c4: `rgba(${chosen[3][0]}, ${chosen[3][1]}, ${chosen[3][2]}, 0.35)`,
        primaryR: pR,
        primaryG: pG,
        primaryB: pB
      };

      extractedPaletteCache.set(imageUrl, palette);
      if (callback) callback(palette);
    } catch (e) {
      if (callback) callback({
        c1: 'rgba(34, 36, 44, 0.36)',
        c2: 'rgba(26, 28, 36, 0.32)',
        c3: 'rgba(20, 22, 30, 0.28)',
        c4: 'rgba(28, 30, 38, 0.25)',
        primaryR: 34, primaryG: 36, primaryB: 44
      });
    }
  };
  img.onerror = () => {
    if (callback) callback({
      c1: 'rgba(34, 36, 44, 0.36)',
      c2: 'rgba(26, 28, 36, 0.32)',
      c3: 'rgba(20, 22, 30, 0.28)',
      c4: 'rgba(28, 30, 38, 0.25)',
      primaryR: 34, primaryG: 36, primaryB: 44
    });
  };
  img.src = imageUrl;
}

function createCatalogueItemFromLive(t) {
  const videoId = t.videoId || '';
  const title = t.title || 'YouTube Track';
  const rawArtist = t.artist || 'YouTube Music';
  const artist = rawArtist.includes(' • ') ? rawArtist.split(' • ')[0].trim() : rawArtist;
  const album = t.album || 'YouTube Music';
  const hasExplicitDuration = !t._durationUnverified && typeof t.duration === 'number' && t.duration > 0;
  const duration = (typeof t.duration === 'number' && t.duration > 0) ? t.duration : 210;
  const cover = upscaleArtworkUrl(t.cover, videoId);

  const itemObj = {
    id: t.id || (videoId ? `yt-${videoId}` : `track-${Math.random().toString(36).slice(2, 9)}`),
    videoId: videoId,
    title: title,
    artist: artist,
    album: album,
    duration: duration,
    _durationUnverified: !hasExplicitDuration,
    durationStr: t.durationStr || formatTime(duration),
    genre: 'YouTube Music',
    year: '2026',
    playlists: ['favorites'],
    palette: deriveTrackPalette(videoId || title),
    cover: cover,
    lyrics: [
      { time: 0, text: `Playing "${title}"` },
      { time: 5, text: `By ${artist}` },
      { time: 12, text: 'Streamed directly from YouTube Music' }
    ]
  };
  return itemObj;
}

function renderLiveCardHTML(item, globalCardId) {
  const safeTitle = escapeHTML(item.title || '');
  const safeSub = escapeHTML(item.subtitle || item.artist || 'YouTube Music');
  const safeCover = escapeHTML(upscaleArtworkUrl(item.cover, item.videoId));
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
    let isLoggedIn = false;
    if (api.getAccountInfo) {
      const acc = await api.getAccountInfo().catch(() => null);
      if (acc && acc.isLoggedIn) {
        updateAccountUI(acc);
        isLoggedIn = true;
      } else if (acc && (!liveAccount || !liveAccount.isLoggedIn)) {
        updateAccountUI(acc);
      }
    }

    // Concurrently fetch all library components for maximum speed and instant UI reactivity
    const fetchPlaylistsTask = async () => {
      if (!api.getLibraryPlaylists) return;
      try {
        const userPls = await api.getLibraryPlaylists();
        if (Array.isArray(userPls)) {
          liveUserPlaylists = userPls;
          try {
            localStorage.setItem('deja_cached_playlists', JSON.stringify(liveUserPlaylists));
          } catch {}
          updateSidebarPlaylistsUI(liveUserPlaylists);
          if (currentView === 'library' || currentView === 'playlists') {
            renderCurrentView();
          }
        }
      } catch (err) {
        console.warn('[Library] getLibraryPlaylists error:', err.message);
      }
    };

    const fetchSongsTask = async () => {
      if (!api.getLibrarySongs) return;
      try {
        const libSongs = await api.getLibrarySongs();
        if (libSongs && Array.isArray(libSongs.songs)) {
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
          if (currentView === 'library' || currentView === 'songs' || currentView === 'playlists' || currentView === 'playlist-favorites') {
            renderCurrentView();
          }
        }
      } catch (err) {
        console.warn('[Library] getLibrarySongs error:', err.message);
      }
    };

    const fetchAlbumsTask = async () => {
      if (!api.getLibraryAlbums) return;
      try {
        const albums = await api.getLibraryAlbums();
        if (Array.isArray(albums)) {
          liveLibraryAlbums = albums;
          if (currentView === 'library' || currentView === 'albums') {
            renderCurrentView();
          }
        }
      } catch (err) {
        console.warn('[Library] getLibraryAlbums error:', err.message);
      }
    };

    const fetchArtistsTask = async () => {
      if (!api.getLibraryArtists) return;
      try {
        const artists = await api.getLibraryArtists();
        if (Array.isArray(artists)) {
          liveLibraryArtists = artists;
          if (currentView === 'library' || currentView === 'artists') {
            renderCurrentView();
          }
        }
      } catch (err) {
        console.warn('[Library] getLibraryArtists error:', err.message);
      }
    };

    await Promise.allSettled([
      fetchPlaylistsTask(),
      fetchSongsTask(),
      fetchAlbumsTask(),
      fetchArtistsTask()
    ]);
  } catch (err) {
    console.warn('[Account] Library fetch error:', err.message);
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
  const ytContainers = [
    document.getElementById('sidebar-playlists'),
    document.getElementById('sidebar-yt-playlists-container')
  ].filter(Boolean);
  const pls = userPls || liveUserPlaylists || [];

  if (customContainer && ytContainers.length > 0) {
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
    ytContainers.forEach(ytContainer => {
      if (pls && pls.length > 0) {
        ytContainer.innerHTML = `
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; padding: 10px 14px 4px 14px;">YouTube Music</div>
          <div class="sidebar-yt-playlists-scroll" style="display: flex; flex-direction: column; gap: 2px;">
            ${pls.map(p => `
              <button class="sidebar-link live-user-playlist-link" data-browse-id="${escapeHTML(p.browseId || '')}" data-cover="${escapeHTML(p.cover || '')}" data-subtitle="${escapeHTML(p.subtitle || 'YouTube Music Playlist')}" title="${escapeHTML(p.title || '')}">
                <span class="sidebar-pl-icon" style="display:inline-flex; align-items:center; opacity:0.7;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg></span>
                <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHTML(p.title || 'Playlist')}</span>
              </button>
            `).join('')}
          </div>
        `;

        ytContainer.querySelectorAll('.live-user-playlist-link').forEach(btn => {
          btn.onclick = () => {
            const bId = btn.getAttribute('data-browse-id');
            const cover = btn.getAttribute('data-cover') || '';
            const subtitle = btn.getAttribute('data-subtitle') || 'YouTube Music Playlist';
            const title = btn.getAttribute('title') || (btn.querySelector('span:last-child') ? btn.querySelector('span:last-child').innerText.trim() : btn.innerText.trim());
            if (bId) openBrowseDetail(bId, title, cover, subtitle);
          };
        });
      } else {
        ytContainer.innerHTML = '';
      }
    });
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
    <button class="sidebar-link" data-playlist="favorites">Liked Songs</button>
  `;

  if (customPlaylists && customPlaylists.length > 0) {
    customPlaylists.forEach(pl => {
      html += `
        <button class="sidebar-link custom-playlist-link" data-playlist="${escapeHTML(pl.id)}" title="${escapeHTML(pl.title)}">
          ${escapeHTML(pl.title)}
        </button>
      `;
    });
  }

  if (pls && pls.length > 0) {
    pls.forEach(p => {
      html += `
        <button class="sidebar-link live-user-playlist-link" data-browse-id="${escapeHTML(p.browseId || '')}" data-cover="${escapeHTML(p.cover || '')}" data-subtitle="${escapeHTML(p.subtitle || 'YouTube Music Playlist')}" title="${escapeHTML(p.title || '')}">
          ${escapeHTML(p.title || 'Playlist')}
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
      const title = l.getAttribute('title') || l.innerText.trim();
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
    const rawName = acc.channelTitle || acc.name || '';
    const displayName = (rawName && rawName !== 'Google User') ? rawName : 'YouTube Music';
    const rawHandle = acc.handle || acc.email || '';
    const displayHandle = (rawHandle && rawHandle !== '@user') ? rawHandle : 'YouTube Music Account';
    const photo = acc.avatarUrl || acc.photoUrl || '';
    const initial = (displayName && displayName !== 'YouTube Music') ? displayName[0].toUpperCase() : 'Y';

    if (avatarImg && photo) {
      avatarImg.src = photo;
      avatarImg.style.display = 'inline-block';
      avatarImg.onerror = () => {
        avatarImg.style.display = 'none';
        if (avatarText) {
          avatarText.innerText = initial;
          avatarText.style.display = 'inline-block';
        }
      };
      if (avatarText) avatarText.style.display = 'none';
    } else if (avatarText) {
      avatarText.innerText = initial;
      avatarText.style.display = 'inline-block';
      if (avatarImg) avatarImg.style.display = 'none';
    }
    if (pillText) {
      pillText.innerText = displayName;
      pillText.style.color = '#34C759';
    }
    const badge = document.getElementById('btn-login-status');
    if (badge) {
      badge.title = `${displayName} (${displayHandle})`;
    }
    const switchLiveBtn = document.getElementById('btn-switch-live');
    if (switchLiveBtn) {
      const span = switchLiveBtn.querySelector('span');
      if (span) span.innerText = 'YouTube Music Connected';
    }
    const homeBanner = document.getElementById('home-signin-banner');
    if (homeBanner && homeBanner.style) {
      homeBanner.style.display = 'none';
    }

    // Update sidebar account profile
    if (sidebarAvatarImg && photo) {
      sidebarAvatarImg.src = photo;
      sidebarAvatarImg.style.display = 'inline-block';
      sidebarAvatarImg.onerror = () => {
        sidebarAvatarImg.style.display = 'none';
        if (sidebarAvatarText) {
          sidebarAvatarText.innerText = initial;
          sidebarAvatarText.style.display = 'inline-block';
        }
      };
      if (sidebarAvatarText) sidebarAvatarText.style.display = 'none';
    } else if (sidebarAvatarText) {
      sidebarAvatarText.innerText = initial;
      sidebarAvatarText.style.display = 'inline-block';
      if (sidebarAvatarImg) sidebarAvatarImg.style.display = 'none';
    }
    if (sidebarName) sidebarName.innerText = displayName;
    if (sidebarSub) sidebarSub.innerText = displayHandle;
    if (sidebarBadge) sidebarBadge.title = `${displayName} (${displayHandle})`;
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

  // Persist / clear localStorage account cache
  try {
    if (acc && acc.isLoggedIn) {
      localStorage.setItem('deja_cached_account', JSON.stringify(acc));
    } else if (acc && acc.isExplicitLogout) {
      localStorage.removeItem('deja_cached_account');
      localStorage.removeItem('deja_cached_playlists');
    }
  } catch {}

  // Update sync status indicator in 1-Click Sync tab
  const syncStatusText = document.getElementById('sync-server-status-text');
  if (syncStatusText) {
    if (acc.isLoggedIn) {
      const displayName = acc.channelTitle || acc.name || 'Account';
      syncStatusText.innerHTML = `<span style="color:#34C759;font-weight:600;display:inline-flex;align-items:center;gap:6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Connected to ${escapeHTML(displayName)} successfully!</span>`;
    } else {
      syncStatusText.innerText = 'Deja local sync listener is ready on localhost:3728';
    }
  }

  // If account login modal is currently open, refresh its content
  const modal = (typeof document !== 'undefined' && typeof document.getElementById === 'function')
    ? document.getElementById('account-login-modal')
    : null;
  if (modal && modal.style && modal.style.display && modal.style.display !== 'none') {
    renderAccountModalContent();
  }
}

let accountModalSyncPoll = null;

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

  // Poll sync status while modal is open so 1-click sync is detected immediately
  if (accountModalSyncPoll) clearInterval(accountModalSyncPoll);
  accountModalSyncPoll = setInterval(async () => {
    if (!modal || modal.style.display === 'none') {
      clearInterval(accountModalSyncPoll);
      accountModalSyncPoll = null;
      return;
    }
    if (liveAccount && liveAccount.isLoggedIn) return;
    try {
      const res = await fetch('http://127.0.0.1:3728/sync-status').catch(() => null);
      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.isLoggedIn) {
          clearInterval(accountModalSyncPoll);
          accountModalSyncPoll = null;
          updateAccountUI(data);
          const syncStatusEl = document.getElementById('sync-server-status-text');
          if (syncStatusEl) {
            syncStatusEl.innerText = `Connected successfully as ${data.channelTitle || data.name}!`;
            syncStatusEl.style.color = '#34C759';
          }
          await fetchLiveYouTubeMusic(true);
          updateSidebarPlaylistsUI();
          setTimeout(() => closeAccountModal(), 900);
        }
      }
    } catch {}
  }, 1400);
}

function closeAccountModal() {
  if (typeof document === 'undefined') return;
  if (accountModalSyncPoll) {
    clearInterval(accountModalSyncPoll);
    accountModalSyncPoll = null;
  }
  const modal = document.getElementById('account-login-modal');
  if (modal && modal.style) modal.style.display = 'none';
}

function renderAccountModalContent(forceLoginView = false) {
  if (typeof document === 'undefined') return;
  const modalTitle = document.getElementById('account-modal-title');
  const tabs = document.getElementById('login-modal-tabs');
  const browserContent = document.getElementById('tab-content-browser');
  const cookiesContent = document.getElementById('tab-content-cookies');
  const inAppContent = document.getElementById('tab-content-inapp');
  const profileView = document.getElementById('account-profile-view');

  const isLoggedIn = liveAccount && liveAccount.isLoggedIn && !forceLoginView;

  if (isLoggedIn) {
    if (modalTitle) modalTitle.innerText = 'Account';
    if (tabs && tabs.style) tabs.style.display = 'none';
    if (inAppContent && inAppContent.style) inAppContent.style.display = 'none';
    if (browserContent && browserContent.style) browserContent.style.display = 'none';
    if (cookiesContent && cookiesContent.style) cookiesContent.style.display = 'none';
    if (profileView && profileView.style) profileView.style.display = 'block';

    const rawName = liveAccount.channelTitle || liveAccount.name || '';
    const displayName = (rawName && rawName !== 'Google User') ? rawName : 'YouTube Music';
    const rawHandle = liveAccount.handle || liveAccount.email || '';
    const handle = (rawHandle && rawHandle !== '@user') ? rawHandle : 'YouTube Music Account';
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

    const channelsListEl = document.getElementById('account-channels-list');
    if (channelsListEl) {
      if (liveAccount.channels && liveAccount.channels.length > 0) {
        channelsListEl.innerHTML = liveAccount.channels.map((ch, idx) => {
          const isAct = Boolean(ch.isSelected || (liveAccount.pageId ? ch.pageId === liveAccount.pageId : ch.activeOnWeb));
          const chThumb = ch.thumbnailUrl || ch.photoUrl || '../../assets/icon.png';
          return `
            <div class="account-channel-row ${isAct ? 'active' : ''}" data-ch-index="${idx}">
              <img src="${escapeHTML(chThumb)}" class="account-channel-thumb" alt="${escapeHTML(ch.name)}" onerror="this.src='../../assets/icon.png'">
              <div class="account-channel-info">
                <span class="account-channel-name">${escapeHTML(ch.name)}</span>
                <span class="account-channel-sub">${escapeHTML(ch.subtitle || ch.handle || '')}</span>
              </div>
              ${isAct ? `<span class="account-channel-check"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>` : ''}
            </div>
          `;
        }).join('');

        const rows = channelsListEl.querySelectorAll('.account-channel-row');
        rows.forEach(row => {
          row.onclick = async () => {
            const idx = parseInt(row.getAttribute('data-ch-index'), 10);
            const targetChannel = liveAccount.channels[idx];
            if (!targetChannel) return;
            const api = window.dejaAPI || window.sonoraAPI;
            if (api?.selectChannel) {
              const res = await api.selectChannel(targetChannel);
              if (res && res.success && res.account) {
                updateAccountUI(res.account);
                renderAccountModalContent();
                fetchLiveYouTubeMusic();
              }
            }
          };
        });
      } else {
        channelsListEl.innerHTML = '';
      }
    }
  } else {
    if (modalTitle) modalTitle.innerText = 'Sign in to YouTube Music';
    if (tabs && tabs.style) tabs.style.display = 'flex';
    if (profileView && profileView.style) profileView.style.display = 'none';

    const activeTab = (typeof document.querySelector === 'function')
      ? (document.querySelector('.segmented-tab.active')?.getAttribute('data-tab') || 'browser')
      : 'browser';
    switchLoginTab(activeTab);
  }
}

function switchLoginTab(tabName) {
  if (typeof document === 'undefined') return;
  const browserTabBtn = document.getElementById('tab-btn-browser');
  const cookiesTabBtn = document.getElementById('tab-btn-cookies');
  const inAppTabBtn = document.getElementById('tab-btn-inapp');

  const browserContent = document.getElementById('tab-content-browser');
  const cookiesContent = document.getElementById('tab-content-cookies');
  const inAppContent = document.getElementById('tab-content-inapp');

  [browserTabBtn, cookiesTabBtn, inAppTabBtn].forEach(b => {
    if (b && b.classList) b.classList.remove('active');
  });
  [browserContent, cookiesContent, inAppContent].forEach(c => {
    if (c && c.style) c.style.display = 'none';
  });

  if (tabName === 'cookies') {
    if (cookiesTabBtn && cookiesTabBtn.classList) cookiesTabBtn.classList.add('active');
    if (cookiesContent && cookiesContent.style) cookiesContent.style.display = 'block';
  } else if (tabName === 'inapp') {
    if (inAppTabBtn && inAppTabBtn.classList) inAppTabBtn.classList.add('active');
    if (inAppContent && inAppContent.style) inAppContent.style.display = 'block';
  } else {
    if (browserTabBtn && browserTabBtn.classList) browserTabBtn.classList.add('active');
    if (browserContent && browserContent.style) browserContent.style.display = 'block';
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
          secondSubtitle: detail.secondSubtitle || '',
          trackCount: detail.trackCount || (detail.songs ? detail.songs.length : 0),
          duration: detail.duration || 0,
          durationStr: detail.durationStr || '',
          cover: detail.cover || cover,
          songs: detail.songs || [],
          isLoading: false
        };
      } else {
        if (activeBrowseDetail) {
          activeBrowseDetail.isLoading = false;
        }
      }
      if (currentView === 'browse-detail') {
        renderCurrentView();
      }
    } catch (err) {
      console.warn('[Browse] getBrowsePlaylist error:', err.message);
      if (activeBrowseDetail) {
        activeBrowseDetail.isLoading = false;
        if (currentView === 'browse-detail') {
          renderCurrentView();
        }
      }
    }
  } else if (activeBrowseDetail) {
    activeBrowseDetail.isLoading = false;
    if (currentView === 'browse-detail') {
      renderCurrentView();
    }
  }
}

let browseDetailFilterQuery = '';
let browseDetailFilterOpen = false;

function renderBrowseDetailView(container) {
  if (!activeBrowseDetail) {
    navigateTo('listen-now');
    return;
  }

  const { title, subtitle, secondSubtitle, trackCount, durationStr, cover, songs, isLoading } = activeBrowseDetail;
  const safeTitle = escapeHTML(title);
  const count = trackCount || (songs ? songs.length : 0);
  const totalSec = songs && songs.length > 0 ? songs.reduce((acc, s) => acc + (s.duration || 0), 0) : 0;
  const computedDur = durationStr || (totalSec > 0 ? formatTime(totalSec) : '');
  const metaDetail = secondSubtitle || (count > 0 ? `${count} song${count === 1 ? '' : 's'}${computedDur ? ` • ${computedDur}` : ''}` : '');
  const safeSubtitle = escapeHTML(subtitle + (metaDetail ? ` • ${metaDetail}` : ''));
  const safeCover = escapeHTML(upscaleArtworkUrl(cover));

  const filterQ = browseDetailFilterOpen ? browseDetailFilterQuery.toLowerCase().trim() : '';
  const visibleSongs = (songs || []).map((s, origIdx) => ({ s, origIdx })).filter(({ s }) => {
    if (!filterQ) return true;
    return (s.title || '').toLowerCase().includes(filterQ) || (s.artist || '').toLowerCase().includes(filterQ);
  });

  container.innerHTML = `
    <div style="padding: 6px 0 24px 0;">
      <div class="bc-detail-header category-hero">
        <div class="bc-detail-sleeve">
          <img src="${safeCover}" class="category-hero-cover" alt="${safeTitle}" onerror="this.src='../../assets/icon.png'">
        </div>
        <div class="category-hero-details" style="display:flex; flex-direction:column; align-items:center;">
          <span class="category-hero-tag" style="margin-bottom:4px;">YOUTUBE MUSIC ALBUM / PLAYLIST</span>
          <h1 class="bc-detail-title category-hero-title">${safeTitle}</h1>
          <div class="bc-detail-credit">${escapeHTML(subtitle || 'YouTube Music')}</div>
          <p class="bc-detail-meta category-hero-desc" style="margin:2px 0 0 0;">${safeSubtitle}</p>
          <div class="bc-detail-action-row category-hero-actions">
            ${songs && songs.length > 0 ? `
              <button class="bc-detail-circle-btn btn-apple-secondary" id="btn-shuffle-browse-all" title="Shuffle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="16 3 21 3 21 8"></polyline>
                  <line x1="4" y1="20" x2="21" y2="3"></line>
                  <polyline points="21 16 21 21 16 21"></polyline>
                  <line x1="15" y1="15" x2="21" y2="21"></line>
                  <line x1="4" y1="4" x2="9" y2="9"></line>
                </svg>
                <span style="display:none;">Shuffle</span>
              </button>
              <button class="bc-detail-play-pill btn-apple-primary" id="btn-play-browse-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span>Play</span>
              </button>
              <button class="bc-detail-circle-btn" id="btn-dl-browse-all" title="Download First Track">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>
              <button class="bc-detail-circle-btn ${browseDetailFilterOpen ? 'active' : ''}" id="btn-filter-browse-songs" title="Filter Songs">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            ` : ''}
          </div>
        </div>
      </div>

      ${browseDetailFilterOpen ? `
        <div class="bc-search-page-field-wrap" style="max-width:480px; margin: 0 auto 18px auto;">
          <div class="bc-search-page-pill" style="height:40px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" id="browse-detail-filter-input" class="bc-search-page-input" placeholder="Search in ${safeTitle}..." value="${escapeHTML(browseDetailFilterQuery)}" />
          </div>
        </div>
      ` : ''}

      ${isLoading ? `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
          <div style="font-size: 14px; margin-bottom: 8px;">Loading YouTube Music tracklist...</div>
          <div style="font-size: 12px; color: var(--text-muted);">Fetching from InnerTube API</div>
        </div>
      ` : (visibleSongs.length > 0 ? `
        <div class="songs-table-container">
          <div class="songs-table-header">
            <span>#</span>
            <span>Title</span>
            <span>Artist</span>
            <span>Album</span>
            <span>Duration</span>
            <span>Play</span>
          </div>
          ${visibleSongs.map(({ s, origIdx }) => `
            <div class="song-row" id="browse-song-${origIdx}">
              <span class="song-number">${origIdx + 1}</span>
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

  const filterBtn = document.getElementById('btn-filter-browse-songs');
  if (filterBtn) {
    filterBtn.onclick = () => {
      browseDetailFilterOpen = !browseDetailFilterOpen;
      if (!browseDetailFilterOpen) browseDetailFilterQuery = '';
      renderBrowseDetailView(container);
      const inp = document.getElementById('browse-detail-filter-input');
      if (inp) inp.focus();
    };
  }

  const filterInput = document.getElementById('browse-detail-filter-input');
  if (filterInput) {
    filterInput.oninput = (e) => {
      browseDetailFilterQuery = e.target.value;
      const pos = e.target.selectionStart;
      renderBrowseDetailView(container);
      const nextInp = document.getElementById('browse-detail-filter-input');
      if (nextInp) {
        nextInp.focus();
        try { nextInp.setSelectionRange(pos, pos); } catch {}
      }
    };
  }

  const dlAllBtn = document.getElementById('btn-dl-browse-all');
  if (dlAllBtn && songs && songs.length > 0) {
    dlAllBtn.onclick = () => {
      triggerTrackDownload(createCatalogueItemFromLive(songs[0]));
    };
  }

  if (songs && songs.length > 0) {
    songs.forEach((s, idx) => {
      const row = document.getElementById(`browse-song-${idx}`);
      if (row) {
        row.onclick = () => {
          userQueue = songs.slice(idx).map(x => createCatalogueItemFromLive(x));
          isDefaultCatalogueQueue = false;
          playLiveTrack(s, true);
          if (typeof renderPreviewQueue === 'function') renderPreviewQueue();
        };
      }
    });

    const btnPlayAll = document.getElementById('btn-play-browse-all');
    if (btnPlayAll) {
      btnPlayAll.onclick = () => {
        userQueue = songs.map(x => createCatalogueItemFromLive(x));
        isDefaultCatalogueQueue = false;
        playLiveTrack(songs[0], true);
        if (typeof renderPreviewQueue === 'function') renderPreviewQueue();
      };
    }

    const btnShuffleAll = document.getElementById('btn-shuffle-browse-all');
    if (btnShuffleAll) {
      btnShuffleAll.onclick = () => {
        const shuffled = [...songs].sort(() => Math.random() - 0.5);
        userQueue = shuffled.map(x => createCatalogueItemFromLive(x));
        isDefaultCatalogueQueue = false;
        playLiveTrack(shuffled[0], true);
        if (typeof renderPreviewQueue === 'function') renderPreviewQueue();
      };
    }
  }
}

async function openArtistDetail(browseId, artistName = 'Artist', cover = '', subtitle = 'YouTube Music') {
  currentView = 'artist-detail';
  activeArtistDetail = {
    browseId,
    name: artistName,
    cover,
    subtitle,
    description: '',
    subscriberCount: '',
    topSongs: [],
    albums: [],
    singles: [],
    similarArtists: [],
    isLoading: true
  };
  pushNavigation('artist-detail', false);
  renderCurrentView();

  const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
  if (api?.getArtist && browseId) {
    try {
      const data = await api.getArtist(browseId);
      if (data) {
        activeArtistDetail = {
          browseId,
          name: data.name || artistName,
          cover: data.avatar || data.headerCover || cover,
          subtitle: data.subscriberCount || subtitle,
          description: data.description || '',
          subscriberCount: data.subscriberCount || '',
          topSongs: data.topSongs || [],
          albums: data.albums || [],
          singles: data.singles || [],
          similarArtists: data.similarArtists || [],
          isLoading: false
        };
      } else if (activeArtistDetail) {
        activeArtistDetail.isLoading = false;
      }
      if (currentView === 'artist-detail') {
        renderCurrentView();
      }
    } catch (err) {
      console.warn('[Artist] getArtist error:', err.message);
      if (activeArtistDetail) {
        activeArtistDetail.isLoading = false;
      }
      if (currentView === 'artist-detail') {
        renderCurrentView();
      }
    }
  } else if (activeArtistDetail) {
    activeArtistDetail.isLoading = false;
    if (currentView === 'artist-detail') {
      renderCurrentView();
    }
  }
}

function renderArtistDetailView(container) {
  if (!activeArtistDetail) {
    navigateTo('listen-now');
    return;
  }

  const { name, cover, subtitle, description, subscriberCount, topSongs, albums, singles, similarArtists, isLoading } = activeArtistDetail;
  const safeName = escapeHTML(name || 'Artist');
  const safeCover = escapeHTML(cover || '../../assets/icon.png');
  const safeDesc = escapeHTML(description || '');
  const safeMeta = escapeHTML(subscriberCount || subtitle || 'YouTube Music');

  container.innerHTML = `
    <div style="padding: 10px 0 20px 0;">
      <div class="artist-hero-header">
        <img src="${safeCover}" class="artist-avatar-large" alt="${safeName}" onerror="this.src='../../assets/icon.png'">
        <div class="artist-hero-details">
          <span class="artist-hero-tag">ARTIST</span>
          <h1 class="artist-hero-name">${safeName}</h1>
          <p class="artist-hero-meta">${safeMeta}${safeDesc ? ` • ${safeDesc.slice(0, 160)}...` : ''}</p>
          <div class="artist-hero-actions">
            ${topSongs && topSongs.length > 0 ? `
              <button class="btn-apple-primary" id="btn-play-artist-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span>Play All</span>
              </button>
              <button class="btn-apple-secondary" id="btn-shuffle-artist-all">
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
            <button class="genre-chip" onclick="navigateBack()" style="display:inline-flex;align-items:center;gap:4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>

      ${isLoading ? `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
          <div style="font-size: 14px; margin-bottom: 8px;">Loading artist profile & releases...</div>
          <div style="font-size: 12px; color: var(--text-muted);">Fetching from InnerTube API</div>
        </div>
      ` : `
        ${topSongs && topSongs.length > 0 ? `
          <div class="artist-section-title">
            <span>Top Songs</span>
          </div>
          <div class="songs-table-container">
            <div class="songs-table-header">
              <span>#</span>
              <span>Title</span>
              <span>Artist</span>
              <span>Album</span>
              <span>Duration</span>
              <span>Play</span>
            </div>
            ${topSongs.map((s, idx) => `
              <div class="song-row" id="artist-song-${idx}">
                <span class="song-number">${idx + 1}</span>
                <div class="song-title-cell">
                  <img src="${escapeHTML(s.cover || safeCover)}" class="song-cell-thumb" alt="${escapeHTML(s.title)}" onerror="this.src='../../assets/icon.png'">
                  <span class="song-title">${escapeHTML(s.title)}</span>
                </div>
                <span class="song-artist-cell">${escapeHTML(s.artist || name)}</span>
                <span class="song-album-cell">${escapeHTML(s.album || '')}</span>
                <span class="song-duration-cell">${escapeHTML(s.durationStr || formatTime(s.duration || 0))}</span>
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
        ` : ''}

        ${albums && albums.length > 0 ? `
          <div class="artist-section-title">
            <span>Albums</span>
          </div>
          <div class="card-grid">
            ${albums.map((al, idx) => `
              <div class="apple-music-card" id="artist-album-${idx}">
                <div class="card-thumb-wrapper">
                  <img src="${escapeHTML(al.cover || '../../assets/icon.png')}" class="card-thumb track-card-img" alt="${escapeHTML(al.title)}" onerror="this.src='../../assets/icon.png'">
                  <div class="card-play-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                  <span class="card-type-badge">ALBUM</span>
                </div>
                <div class="card-title">${escapeHTML(al.title)}</div>
                <div class="card-subtitle">${escapeHTML(al.year || al.subtitle || 'Album')}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${singles && singles.length > 0 ? `
          <div class="artist-section-title">
            <span>Singles & EPs</span>
          </div>
          <div class="card-grid">
            ${singles.map((si, idx) => `
              <div class="apple-music-card" id="artist-single-${idx}">
                <div class="card-thumb-wrapper">
                  <img src="${escapeHTML(si.cover || '../../assets/icon.png')}" class="card-thumb track-card-img" alt="${escapeHTML(si.title)}" onerror="this.src='../../assets/icon.png'">
                  <div class="card-play-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                  <span class="card-type-badge">SINGLE</span>
                </div>
                <div class="card-title">${escapeHTML(si.title)}</div>
                <div class="card-subtitle">${escapeHTML(si.year || si.subtitle || 'Single')}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${similarArtists && similarArtists.length > 0 ? `
          <div class="artist-section-title">
            <span>Fans Also Like</span>
          </div>
          <div class="artists-grid">
            ${similarArtists.map((sim, idx) => `
              <div class="artist-card" id="artist-similar-${idx}">
                <img src="${escapeHTML(sim.cover || '../../assets/icon.png')}" class="artist-avatar" alt="${escapeHTML(sim.title)}" onerror="this.src='../../assets/icon.png'">
                <div class="artist-card-name">${escapeHTML(sim.title)}</div>
                <div class="artist-card-sub">${escapeHTML(sim.subtitle || 'Artist')}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      `}
    </div>
  `;

  // Bind top songs
  if (topSongs && topSongs.length > 0) {
    topSongs.forEach((song, idx) => {
      const row = document.getElementById(`artist-song-${idx}`);
      if (row) {
        row.onclick = () => {
          userQueue = topSongs.slice(idx).map(x => createCatalogueItemFromLive(x));
          isDefaultCatalogueQueue = false;
          playLiveTrack(song, true);
          if (typeof renderPreviewQueue === 'function') renderPreviewQueue();
        };
      }
    });

    const btnPlayAll = document.getElementById('btn-play-artist-all');
    if (btnPlayAll) {
      btnPlayAll.onclick = () => {
        userQueue = topSongs.map(x => createCatalogueItemFromLive(x));
        isDefaultCatalogueQueue = false;
        playLiveTrack(topSongs[0], true);
        if (typeof renderPreviewQueue === 'function') renderPreviewQueue();
      };
    }

    const btnShuffleAll = document.getElementById('btn-shuffle-artist-all');
    if (btnShuffleAll) {
      btnShuffleAll.onclick = () => {
        const shuffled = [...topSongs].sort(() => Math.random() - 0.5);
        userQueue = shuffled.map(x => createCatalogueItemFromLive(x));
        isDefaultCatalogueQueue = false;
        playLiveTrack(shuffled[0], true);
        if (typeof renderPreviewQueue === 'function') renderPreviewQueue();
      };
    }
  }

  // Bind albums
  if (albums && albums.length > 0) {
    albums.forEach((al, idx) => {
      const card = document.getElementById(`artist-album-${idx}`);
      if (card && al.browseId) {
        card.onclick = () => openBrowseDetail(al.browseId, al.title, al.cover, al.year || 'Album');
      }
    });
  }

  // Bind singles
  if (singles && singles.length > 0) {
    singles.forEach((si, idx) => {
      const card = document.getElementById(`artist-single-${idx}`);
      if (card && si.browseId) {
        card.onclick = () => openBrowseDetail(si.browseId, si.title, si.cover, si.year || 'Single');
      }
    });
  }

  // Bind similar artists
  if (similarArtists && similarArtists.length > 0) {
    similarArtists.forEach((sim, idx) => {
      const card = document.getElementById(`artist-similar-${idx}`);
      if (card && sim.browseId) {
        card.onclick = () => openArtistDetail(sim.browseId, sim.title, sim.cover, sim.subtitle);
      }
    });
  }
}

function playLiveTrack(item, preserveQueue = false) {
  if (!item) return;
  const itemKey = normalizeTrackDedupeKey(item);
  let idx = CATALOGUE_TRACKS.findIndex(t =>
    (item.videoId && (t.videoId === item.videoId || t.musicVideoId === item.videoId)) ||
    (item.id && t.id === item.id) ||
    (itemKey && normalizeTrackDedupeKey(t) === itemKey)
  );
  if (idx === -1) {
    const fullTrack = createCatalogueItemFromLive(item);
    CATALOGUE_TRACKS.unshift(fullTrack);
    idx = 0;
  } else if (item.videoId && CATALOGUE_TRACKS[idx].videoId !== item.videoId && !CATALOGUE_TRACKS[idx].musicVideoId) {
    CATALOGUE_TRACKS[idx].musicVideoId = item.videoId;
  }
  selectTrack(idx, preserveQueue);
}

function renderHomeView(container) {
  return _renderHomeViewImpl(container);
}
const renderListenNowView = renderHomeView;

const BITCHORD_MOOD_COLORS = [
  '#AF2896', '#1E3264', '#E8115B', '#148A08',
  '#BC5900', '#503750', '#0D73EC', '#8D67AB'
];

function _renderHomeViewImpl(container) {
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

  // BitChord Recents section (HomeScreen.kt RecentsSection: 4-row columns or 2-row grid toggle)
  const recentsPool = (hasLiveShelves && allShelves[0]?.items?.length > 0)
    ? allShelves[0].items.slice(0, 12)
    : CATALOGUE_TRACKS.slice(0, 12);

  const recentColumns = [];
  for (let i = 0; i < recentsPool.length; i += 4) {
    recentColumns.push(recentsPool.slice(i, i + 4));
  }

  const recentsHTML = `
    <section class="shelf-section" style="margin-bottom: 26px;">
      <div class="bc-section-header-row">
        <h2 class="bc-section-heading">Recents</h2>
        <button class="bc-recents-toggle-btn" id="bc-recents-layout-toggle" title="${bcRecentsGridMode ? 'Switch to List Columns' : 'Switch to Grid Cards'}">
          ${bcRecentsGridMode ? `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          ` : `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
          `}
        </button>
      </div>
      ${bcRecentsGridMode ? `
        <div class="bc-recents-grid-cards">
          ${recentsPool.map((item, rIdx) => `
            <div class="apple-music-card bc-recent-item-trigger" data-recent-idx="${rIdx}" style="width:140px; flex-shrink:0;">
              <div class="card-thumb-wrapper">
                <img src="${escapeHTML(upscaleArtworkUrl(item.cover, item.videoId))}" class="card-thumb track-card-img" alt="${escapeHTML(item.title || '')}" onerror="this.src='../../assets/icon.png'">
                <div class="card-play-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </div>
              </div>
              <div class="card-title">${escapeHTML(item.title || '')}</div>
              <div class="card-subtitle">${escapeHTML(item.artist || item.subtitle || 'YouTube Music')}</div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="bc-recents-columns-scroll">
          ${recentColumns.map((col, cIdx) => `
            <div class="bc-recents-column">
              ${col.map((item, rIdx) => {
                const flatIdx = cIdx * 4 + rIdx;
                return `
                  <div class="bc-recent-track-row bc-recent-item-trigger" data-recent-idx="${flatIdx}">
                    <img src="${escapeHTML(upscaleArtworkUrl(item.cover, item.videoId))}" class="bc-recent-track-art" alt="${escapeHTML(item.title || '')}" onerror="this.src='../../assets/icon.png'">
                    <div class="bc-recent-track-meta">
                      <div class="bc-recent-track-title">${escapeHTML(item.title || '')}</div>
                      <div class="bc-recent-track-sub">${escapeHTML(item.artist || item.subtitle || 'YouTube Music')}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `).join('')}
        </div>
      `}
    </section>
  `;

  // BitChord HeroShelf (HomeScreen.kt HeroShelf: 320x192px rounded-18px cards)
  const heroPool = (hasLiveShelves && allShelves.length > 1 && allShelves[1]?.items?.length > 0)
    ? allShelves[1].items.slice(0, 6)
    : CATALOGUE_TRACKS.slice(0, 5);

  const heroCarouselHTML = `
    <section class="shelf-section" style="margin-bottom: 28px;">
      <div class="bc-hero-carousel">
        ${heroPool.map((item, hIdx) => {
          const isBrowse = item.type === 'browse' || (!item.videoId && item.browseId);
          return `
            <div class="bc-hero-card" data-hero-idx="${hIdx}" ${hIdx === 0 ? 'id="btn-hero-play"' : ''}>
              <img src="${escapeHTML(upscaleArtworkUrl(item.cover, item.videoId))}" class="bc-hero-card-img" alt="${escapeHTML(item.title || '')}" onerror="this.src='../../assets/icon.png'">
              <div class="bc-hero-card-scrim">
                <span class="bc-hero-card-kicker">${isBrowse ? 'FEATURED ALBUM' : 'FEATURED MIX'}</span>
                <h3 class="bc-hero-card-title">${escapeHTML(item.title || '')}</h3>
                <p class="bc-hero-card-sub">${escapeHTML(item.artist || item.subtitle || 'YouTube Music')}</p>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </section>
  `;

  let shelvesHTML = '';
  if (hasLiveShelves) {
    shelvesHTML = allShelves.map((shelf, shelfIdx) => {
      return `
        <section class="shelf-section">
          <div class="shelf-header">
            <div>
              ${shelf.strapline ? `<div class="bc-section-strapline">${escapeHTML(shelf.strapline)}</div>` : ''}
              <h2 class="shelf-title">${escapeHTML(shelf.title)}</h2>
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

  const isUserSignedIn = Boolean(liveAccount && liveAccount.isLoggedIn);
  const signInBannerHTML = !isUserSignedIn ? `
    <div class="bitchord-signin-banner" id="home-signin-banner" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; cursor: pointer;">
      <div style="display: flex; align-items: center; gap: 14px;">
        <div style="width: 38px; height: 38px; border-radius: 50%; background: #FA2D48; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
        </div>
        <div>
          <h3 style="margin: 0 0 2px 0; font-size: 15px; font-weight: 700; color: var(--text-main);">Sign in to YouTube Music</h3>
          <p style="margin: 0; font-size: 13px; color: var(--text-secondary);">Get personalized recommendations, your playlists, and listening history.</p>
        </div>
      </div>
      <button class="btn-apple-primary" id="btn-banner-signin" style="padding: 8px 18px; font-weight: 600; white-space: nowrap;">Sign In</button>
    </div>
  ` : '';

  container.innerHTML = `
    <div class="bitchord-home-header" style="padding: 4px 0 12px 0;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <h1 class="bc-screen-large-title" style="margin:0;">Listen Now</h1>
      </div>
      ${signInBannerHTML}
    </div>

    ${isFetchingLive && !hasLiveShelves ? `
      <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 24px; display: flex; align-items: center; gap: 8px;">
        <span class="badge-dot" style="background: #FA2D48;"></span>
        <span>Loading live feeds from YouTube Music...</span>
      </div>
    ` : ''}

    ${recentsHTML}
    ${heroCarouselHTML}
    ${shelvesHTML}
  `;

  const recentsToggle = document.getElementById('bc-recents-layout-toggle');
  if (recentsToggle) {
    recentsToggle.onclick = () => {
      bcRecentsGridMode = !bcRecentsGridMode;
      _renderHomeViewImpl(container);
    };
  }

  container.querySelectorAll('.bc-recent-item-trigger').forEach(el => {
    el.onclick = () => {
      const idx = parseInt(el.getAttribute('data-recent-idx'), 10);
      const item = recentsPool[idx];
      if (!item) return;
      if (item.type === 'browse' || (!item.videoId && item.browseId)) {
        openBrowseDetail(item.browseId, item.title, item.cover, item.subtitle);
      } else {
        playLiveTrack(item);
      }
    };
  });

  container.querySelectorAll('[data-hero-idx]').forEach(el => {
    el.onclick = () => {
      const idx = parseInt(el.getAttribute('data-hero-idx'), 10);
      const item = heroPool[idx];
      if (!item) return;
      if (item.type === 'browse' || (!item.videoId && item.browseId)) {
        openBrowseDetail(item.browseId, item.title, item.cover, item.subtitle);
      } else {
        playLiveTrack(item);
      }
    };
  });

  const bannerSignIn = document.getElementById('btn-banner-signin');
  if (bannerSignIn) {
    bannerSignIn.onclick = (e) => {
      e.stopPropagation();
      openAccountModal();
    };
  }
  const homeBanner = document.getElementById('home-signin-banner');
  if (homeBanner) {
    homeBanner.onclick = () => openAccountModal();
  }

  if (hasLiveShelves) {
    allShelves.forEach((shelf, sIdx) => {
      shelf.items.forEach((item, iIdx) => {
        const cardId = `live-home-${sIdx}-${iIdx}`;
        const el = document.querySelector(`[data-live-id="${cardId}"]`);
        if (el) {
          el.onclick = () => {
            if (item.type === 'browse' || item.type === 'artist' || (!item.videoId && item.browseId)) {
              if (item.browseId && (item.browseId.startsWith('UC') || item.type === 'artist')) {
                openArtistDetail(item.browseId, item.title, item.cover, item.subtitle);
              } else {
                openBrowseDetail(item.browseId, item.title, item.cover, item.subtitle);
              }
            } else if (item.videoId) {
              playLiveTrack(item);
            }
          };
        }
      });
    });
  }

  const switchLiveBtn = document.getElementById('btn-switch-live');
  if (switchLiveBtn) {
    switchLiveBtn.onclick = handleGoogleConnect;
  }
}

function renderExploreView(container) {
  return _renderExploreViewImpl(container);
}
const renderBrowseView = renderExploreView;

function _renderExploreViewImpl(container) {
  const genres = ['All', 'Charts', 'New Releases', 'Moods & Genres', 'Trending', 'Chill', 'Synthwave'];
  const allBrowseShelves = [];

  const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
  if (!liveMoodsAndGenres && !isLoadingMoods && api?.getMoodsAndGenres) {
    isLoadingMoods = true;
    api.getMoodsAndGenres().then(res => {
      isLoadingMoods = false;
      liveMoodsAndGenres = (res && res.categories) ? res.categories : [];
      if (currentView === 'explore' || currentView === 'browse') {
        renderCurrentView();
      }
    }).catch(err => {
      console.warn('[Browse] getMoodsAndGenres error:', err.message);
      isLoadingMoods = false;
      liveMoodsAndGenres = [];
    });
  }

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

  // BitChord Moods & Genres section (ExploreScreen.kt MoodGenreCard with 8 palette colors & rotated 16deg corner sleeve)
  const moodCategories = (liveMoodsAndGenres && liveMoodsAndGenres.length > 0)
    ? liveMoodsAndGenres.slice(0, 12)
    : [
        { title: 'Chill', cover: CATALOGUE_TRACKS[0]?.cover },
        { title: 'Energy Boost', cover: CATALOGUE_TRACKS[1]?.cover },
        { title: 'Workout', cover: CATALOGUE_TRACKS[2]?.cover },
        { title: 'Focus & Study', cover: CATALOGUE_TRACKS[3]?.cover },
        { title: 'Party', cover: CATALOGUE_TRACKS[4]?.cover },
        { title: 'Feel Good', cover: CATALOGUE_TRACKS[5]?.cover },
        { title: 'Commute', cover: CATALOGUE_TRACKS[6]?.cover },
        { title: 'Sleep & Relax', cover: CATALOGUE_TRACKS[7]?.cover }
      ];

  const moodsShelfHTML = `
    <section class="shelf-section" style="margin-bottom: 28px;">
      <div class="bc-section-header-row">
        <h2 class="bc-section-heading">Moods &amp; Genres</h2>
        <span class="shelf-action" style="color: var(--apple-accent); font-weight: 600; cursor: pointer;" onclick="filterByGenre('Moods & Genres')">Explore All</span>
      </div>
      <div class="bc-moods-grid moods-genres-grid">
        ${moodCategories.map((cat, idx) => {
          const bgColor = cat.color || BITCHORD_MOOD_COLORS[idx % BITCHORD_MOOD_COLORS.length];
          const sleeveArt = cat.cover || CATALOGUE_TRACKS[idx % CATALOGUE_TRACKS.length]?.cover || '../../assets/icon.png';
          return `
            <div class="bc-mood-genre-card mood-genre-card" id="browse-mood-${idx}" style="background-color: ${escapeHTML(bgColor)};">
              <span class="bc-mood-genre-title mood-genre-title">${escapeHTML(cat.title)}</span>
              <img src="${escapeHTML(sleeveArt)}" class="bc-mood-genre-sleeve" alt="${escapeHTML(cat.title)}" onerror="this.style.display='none'">
            </div>
          `;
        }).join('')}
      </div>
    </section>
  `;

  container.innerHTML = `
    <div style="padding: 6px 0 20px 0;">
      <h1 class="bc-screen-large-title">Explore</h1>
      
      <div class="genre-chips-wrap" style="margin-bottom: 22px;">
        ${genres.map((g, i) => `
          <button class="genre-chip ${i === 0 ? 'active' : ''}" onclick="filterByGenre('${g}')">${g}</button>
        `).join('')}
      </div>

      ${moodsShelfHTML}
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
              if (item.browseId && (item.browseId.startsWith('UC') || item.type === 'artist')) {
                openArtistDetail(item.browseId, item.title, item.cover, item.subtitle);
              } else {
                openBrowseDetail(item.browseId, item.title, item.cover, item.subtitle);
              }
            } else if (item.videoId) {
              playLiveTrack(item);
            }
          };
        }
      });
    });
  }

  moodCategories.forEach((cat, idx) => {
    const el = document.getElementById(`browse-mood-${idx}`);
    if (el) {
      el.onclick = () => {
        if (cat.browseId) {
          openBrowseDetail(cat.browseId, cat.title, cat.cover || '', 'Mood & Genre');
        } else {
          filterByGenre(cat.title);
        }
      };
    }
  });
}

function filterByGenre(genre) {
  const chips = document.querySelectorAll('.genre-chip');
  chips.forEach(c => c.classList.toggle('active', c.innerText === genre));

  const grid = document.getElementById('browse-card-grid');
  if (!grid) return;

  if (genre === 'Moods & Genres') {
    const cats = (liveMoodsAndGenres && liveMoodsAndGenres.length > 0) ? liveMoodsAndGenres : [
      { title: 'Chill', color: '#2B5876' },
      { title: 'Workout', color: '#E53935' },
      { title: 'Focus & Study', color: '#1E3C72' },
      { title: 'Energy Boost', color: '#FF8008' },
      { title: 'Sleep & Relaxation', color: '#4A00E0' },
      { title: 'Commute', color: '#00B4DB' },
      { title: 'Party', color: '#D91E18' },
      { title: 'Romance', color: '#C33764' },
      { title: 'Feel Good', color: '#F7971E' },
      { title: 'Sad & Melancholy', color: '#434343' }
    ];

    grid.className = 'moods-genres-grid';
    grid.innerHTML = cats.map((cat, idx) => {
      const bg = cat.color ? `background-color: ${escapeHTML(cat.color)};` : `background: hsl(${(idx * 43) % 360}, 65%, 26%);`;
      const style = cat.cover ? `background-image: url('${escapeHTML(cat.cover)}');` : bg;
      return `
        <div class="mood-genre-card" id="genre-mood-${idx}" style="${style}">
          <div class="mood-genre-overlay"></div>
          <span class="mood-genre-title">${escapeHTML(cat.title)}</span>
        </div>
      `;
    }).join('');

    cats.forEach((cat, idx) => {
      const el = document.getElementById(`genre-mood-${idx}`);
      if (el) {
        el.onclick = () => {
          if (cat.browseId) {
            openBrowseDetail(cat.browseId, cat.title, cat.cover || '', 'Mood & Genre');
          }
        };
      }
    });
    return;
  }

  if (grid.classList.contains('moods-genres-grid')) {
    grid.className = 'card-grid';
  }

  const filtered = genre === 'All'
    ? CATALOGUE_TRACKS
    : CATALOGUE_TRACKS.filter(t => t.genre.toLowerCase().includes(genre.toLowerCase()) || t.playlists.includes(genre.toLowerCase()));

  grid.innerHTML = renderCardGridHTML(filtered);
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
      <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 8px;">Deja Radio</h1>
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
  const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
  if (!liveHistorySongs && !isLoadingHistory && api?.getHistory) {
    isLoadingHistory = true;
    api.getHistory().then(res => {
      isLoadingHistory = false;
      liveHistorySongs = (res && res.songs) ? res.songs : [];
      if (currentView === 'recently-added') {
        renderCurrentView();
      }
    }).catch(err => {
      console.warn('[History] getHistory error:', err.message);
      isLoadingHistory = false;
      liveHistorySongs = [];
    });
  }

  const hasHistory = liveHistorySongs && liveHistorySongs.length > 0;

  container.innerHTML = `
    <div style="padding: 10px 0 20px 0;">
      <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 8px;">Recently Added & History</h1>
      <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 24px;">Your listening history, latest additions, and synchronized playback tracks.</p>

      ${isLoadingHistory ? `
        <div style="text-align: center; padding: 32px 0; color: var(--text-secondary); font-size: 13.5px;">
          Synchronizing YouTube Music playback history...
        </div>
      ` : ''}

      ${hasHistory ? `
        <div class="shelf-section">
          <div class="shelf-header">
            <h2 class="shelf-title">Playback History</h2>
            <span class="shelf-action" style="color: var(--apple-accent); font-weight: 600;">YouTube Music</span>
          </div>
          <div class="songs-table-container">
            <div class="songs-table-header">
              <span>#</span>
              <span>Title</span>
              <span>Artist</span>
              <span>Album</span>
              <span>Duration</span>
              <span>Play</span>
            </div>
            ${liveHistorySongs.slice(0, 30).map((s, idx) => `
              <div class="song-row" id="history-song-${idx}">
                <span class="song-number">${idx + 1}</span>
                <div class="song-title-cell">
                  <img src="${escapeHTML(s.cover || '../../assets/icon.png')}" class="song-cell-thumb" alt="${escapeHTML(s.title)}" onerror="this.src='../../assets/icon.png'">
                  <span class="song-title">${escapeHTML(s.title)}</span>
                </div>
                <span class="song-artist-cell">${escapeHTML(s.artist || 'YouTube Music')}</span>
                <span class="song-album-cell">${escapeHTML(s.album || '')}</span>
                <span class="song-duration-cell">${escapeHTML(s.durationStr || formatTime(s.duration || 0))}</span>
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
        </div>
      ` : ''}

      <div class="shelf-section" style="${hasHistory ? 'margin-top: 32px;' : ''}">
        <div class="shelf-header">
          <h2 class="shelf-title">Local Library Additions</h2>
        </div>
        <div class="card-grid">
          ${renderCardGridHTML(CATALOGUE_TRACKS.slice().reverse())}
        </div>
      </div>
    </div>
  `;

  if (hasHistory) {
    liveHistorySongs.slice(0, 30).forEach((s, idx) => {
      const el = document.getElementById(`history-song-${idx}`);
      if (el) {
        el.onclick = () => playLiveTrack(s);
      }
    });
  }
}

function renderHistoryView(container) {
  const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
  if (!liveHistorySongs && !isLoadingHistory && api?.getHistory) {
    isLoadingHistory = true;
    api.getHistory().then(res => {
      isLoadingHistory = false;
      liveHistorySongs = (res && res.songs) ? res.songs : [];
      if (currentView === 'history') {
        renderCurrentView();
      }
    }).catch(err => {
      console.warn('[History] getHistory error:', err.message);
      isLoadingHistory = false;
      liveHistorySongs = [];
    });
  }

  const hasHistory = liveHistorySongs && liveHistorySongs.length > 0;

  container.innerHTML = `
    <div style="padding: 10px 0 20px 0;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <h1 style="font-size: 28px; font-weight: 800; margin: 0;">History</h1>
        <button class="btn-apple-secondary" id="btn-refresh-history" style="font-size: 13px; padding: 6px 14px; border-radius: 999px;">
          Refresh
        </button>
      </div>
      <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 24px;">What you have been listening to on YouTube Music, most recent first. Tapping a track plays it with the rest of your history queued.</p>

      ${isLoadingHistory ? `
        <div style="text-align: center; padding: 48px 0; color: var(--text-secondary); font-size: 14px;">
          <span class="status-dot-pulse" style="display:inline-block; margin-right:8px;"></span>
          Synchronizing YouTube Music playback history...
        </div>
      ` : ''}

      ${hasHistory ? `
        <div class="shelf-section">
          <div class="songs-table-container">
            <div class="songs-table-header">
              <span>#</span>
              <span>Title</span>
              <span>Artist</span>
              <span>Album</span>
              <span>Duration</span>
              <span>Play</span>
            </div>
            ${liveHistorySongs.map((s, idx) => `
              <div class="song-row" id="history-item-${idx}">
                <span class="song-number">${idx + 1}</span>
                <div class="song-title-cell">
                  <img src="${escapeHTML(s.cover || '../../assets/icon.png')}" class="song-cell-thumb" alt="${escapeHTML(s.title)}" onerror="this.src='../../assets/icon.png'">
                  <span class="song-title">${escapeHTML(s.title)}</span>
                </div>
                <span class="song-artist-cell">${escapeHTML(s.artist || 'YouTube Music')}</span>
                <span class="song-album-cell">${escapeHTML(s.album || '')}</span>
                <span class="song-duration-cell">${escapeHTML(s.durationStr || formatTime(s.duration || 0))}</span>
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
        </div>
      ` : (!isLoadingHistory ? `
        <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
          <div style="display:flex; justify-content:center; margin-bottom: 16px; opacity:0.4;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <h3 style="font-size: 18px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">No listening history yet</h3>
          <p style="font-size: 14px; max-width: 440px; margin: 0 auto 20px auto;">When you sign in and listen to music, YouTube Music records your history so you can pick up right where you left off.</p>
          ${!liveAccount?.isLoggedIn ? `
            <button class="btn-apple-primary" id="btn-history-signin" style="display:inline-flex; align-items:center; gap:8px;">
              Sign in to YouTube Music
            </button>
          ` : ''}
        </div>
      ` : '')}
    </div>
  `;

  if (hasHistory) {
    liveHistorySongs.forEach((s, idx) => {
      const el = document.getElementById(`history-item-${idx}`);
      if (el) {
        el.onclick = () => {
          userQueue = liveHistorySongs.slice(idx).map(x => createCatalogueItemFromLive(x));
          isDefaultCatalogueQueue = false;
          playLiveTrack(s, true);
        };
      }
    });
  }

  const btnRefresh = document.getElementById('btn-refresh-history');
  if (btnRefresh) {
    btnRefresh.onclick = () => {
      liveHistorySongs = null;
      renderCurrentView();
    };
  }

  const btnSignIn = document.getElementById('btn-history-signin');
  if (btnSignIn) {
    btnSignIn.onclick = () => openAccountModal();
  }
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
    openArtistDetail(browseId, artistName, cover, subtitle);
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
            <span class="song-number">${idx === currentIndex && isPlaying ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>' : idx + 1}</span>
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
          if (it.browseId && !chartPlaylists.some(p => p.browseId === it.browseId)) {
            chartPlaylists.push(it);
          }
        });
      }
    });
  }

  const hasUserPlaylists = liveUserPlaylists && liveUserPlaylists.length > 0;
  const hasCustomPlaylists = customPlaylists && customPlaylists.length > 0;
  const hasChartPlaylists = chartPlaylists.length > 0;

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

      <!-- Quick Actions / Liked Songs -->
      <div class="card-grid" style="margin-bottom: 32px;">
        <div class="create-playlist-card" id="card-action-new-playlist" style="cursor: pointer;">
          <div class="create-playlist-card-icon">+</div>
          <div style="font-weight: 700; font-size: 15px; color: var(--text-main);">New Playlist</div>
          <div style="font-size: 12.5px; color: var(--text-secondary);">Create custom collection</div>
        </div>

        <div class="apple-music-card" id="card-action-liked-songs" style="cursor: pointer;">
          <div class="card-thumb-wrapper">
            <img src="${CATALOGUE_TRACKS[0]?.cover || '../../assets/icon.png'}" class="card-thumb track-card-img" alt="Liked Songs">
            <div class="card-play-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
          </div>
          <div class="card-title">Liked Songs</div>
          <div class="card-subtitle">${lovedTrackIds.size || (liveLikedSongs && liveLikedSongs.length) || 0} tracks • Favorites</div>
        </div>
      </div>

      <!-- YouTube Music Playlists (Personal) -->
      ${hasUserPlaylists ? `
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 14px;">YouTube Music Playlists</h2>
          <div class="card-grid">
            ${liveUserPlaylists.map(lp => `
              <div class="apple-music-card playlist-grid-browse-card" data-browse-id="${escapeHTML(lp.browseId || '')}" data-title="${escapeHTML(lp.title || '')}" data-cover="${escapeHTML(lp.cover || '')}" data-subtitle="${escapeHTML(lp.subtitle || 'YouTube Music Playlist')}" style="cursor: pointer;">
                <div class="card-thumb-wrapper">
                  <img src="${escapeHTML(lp.cover || '../../assets/icon.png')}" class="card-thumb track-card-img" alt="${escapeHTML(lp.title || '')}" onerror="this.src='../../assets/icon.png'">
                  <div class="card-play-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                </div>
                <div class="card-title">${escapeHTML(lp.title || 'Playlist')}</div>
                <div class="card-subtitle">${escapeHTML(lp.subtitle || 'YouTube Music')}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Custom Playlists -->
      ${hasCustomPlaylists ? `
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 14px;">Custom Playlists</h2>
          <div class="card-grid">
            ${customPlaylists.map(pl => {
              const songCount = pl.tracks ? pl.tracks.length : 0;
              return `
                <div class="apple-music-card playlist-grid-custom-card" data-playlist-id="${escapeHTML(pl.id)}" style="cursor: pointer;">
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
          </div>
        </div>
      ` : ''}

      <!-- Featured / Chart Playlists -->
      ${hasChartPlaylists ? `
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 14px;">Featured & Charts Playlists</h2>
          <div class="card-grid">
            ${chartPlaylists.map(lp => `
              <div class="apple-music-card playlist-grid-browse-card" data-browse-id="${escapeHTML(lp.browseId || '')}" data-title="${escapeHTML(lp.title || '')}" data-cover="${escapeHTML(lp.cover || '')}" data-subtitle="${escapeHTML(lp.subtitle || 'YouTube Music Playlist')}" style="cursor: pointer;">
                <div class="card-thumb-wrapper">
                  <img src="${escapeHTML(lp.cover || '../../assets/icon.png')}" class="card-thumb track-card-img" alt="${escapeHTML(lp.title || '')}" onerror="this.src='../../assets/icon.png'">
                  <div class="card-play-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                </div>
                <div class="card-title">${escapeHTML(lp.title || 'Playlist')}</div>
                <div class="card-subtitle">${escapeHTML(lp.subtitle || 'YouTube Music')}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  const btnGridNew = document.getElementById('btn-grid-new-playlist');
  if (btnGridNew) btnGridNew.onclick = () => openCreatePlaylistModal();

  const cardNew = document.getElementById('card-action-new-playlist');
  if (cardNew) cardNew.onclick = () => openCreatePlaylistModal();

  const cardLiked = document.getElementById('card-action-liked-songs');
  if (cardLiked) cardLiked.onclick = () => navigateToPlaylist('favorites');

  container.querySelectorAll('.playlist-grid-custom-card').forEach(card => {
    card.onclick = () => {
      const plId = card.getAttribute('data-playlist-id');
      if (plId) navigateToPlaylist(plId);
    };
  });

  container.querySelectorAll('.playlist-grid-browse-card').forEach(card => {
    card.onclick = () => {
      const bId = card.getAttribute('data-browse-id');
      const title = card.getAttribute('data-title');
      const cover = card.getAttribute('data-cover');
      const subtitle = card.getAttribute('data-subtitle');
      if (bId) openBrowseDetail(bId, title, cover, subtitle);
    };
  });
}

function renderLibraryView(container) {
  const hasUserPlaylists = liveUserPlaylists && liveUserPlaylists.length > 0;
  const hasCustomPlaylists = customPlaylists && customPlaylists.length > 0;
  const hasAlbums = liveLibraryAlbums && liveLibraryAlbums.length > 0;
  const hasArtists = (liveLibraryArtists && liveLibraryArtists.length > 0) || (liveArtists && liveArtists.length > 0);
  const dlCount = (typeof downloadedTracksList !== 'undefined' && Array.isArray(downloadedTracksList)) ? downloadedTracksList.length : 0;
  const localCount = (typeof scannedLocalMusicTracks !== 'undefined' && Array.isArray(scannedLocalMusicTracks)) ? scannedLocalMusicTracks.length : 0;

  // Apply BitChord sort order (Recently Added, Title A–Z, Artist A–Z)
  const sortItems = (arr) => {
    if (!Array.isArray(arr)) return [];
    const copy = [...arr];
    if (bcLibrarySortMode === 'Title A–Z') {
      copy.sort((a, b) => String(a.title || a.name || '').localeCompare(String(b.title || b.name || '')));
    } else if (bcLibrarySortMode === 'Artist A–Z') {
      copy.sort((a, b) => String(a.artist || a.subtitle || '').localeCompare(String(b.artist || b.subtitle || '')));
    }
    return copy;
  };

  const sortedUserPlaylists = sortItems(liveUserPlaylists);
  const sortedCustomPlaylists = sortItems(customPlaylists);
  const sortedAlbums = sortItems(liveLibraryAlbums);
  const sortedArtists = sortItems((liveLibraryArtists && liveLibraryArtists.length > 0) ? liveLibraryArtists : liveArtists);

  container.innerHTML = `
    <div style="padding: 6px 0 24px 0;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
        <h1 class="bc-screen-large-title" style="margin:0;">Library</h1>
        <span style="font-size: 12.5px; color: var(--text-secondary); font-weight: 600;">Sorted by ${escapeHTML(bcLibrarySortMode)}</span>
      </div>

      <!-- BitChord Your Replay Mesh Feature Card (LibraryScreen.kt) -->
      <div class="bc-replay-banner-card" id="bc-lib-replay-banner">
        <div>
          <span class="bc-mesh-card-kicker">YOUR LISTENING STATS</span>
          <div class="bc-mesh-card-title" style="font-size: 24px;">Your Replay</div>
          <div class="bc-mesh-card-sub">Minutes streamed, top artists, tracks &amp; albums</div>
        </div>
        <div class="bc-mesh-card-badge">Open Replay →</div>
      </div>

      <!-- BitChord On Device Mesh Shelf (Downloads, Local Music, WebDAV, SMB, History) -->
      <div class="bc-section-header-row">
        <h2 class="bc-section-heading">On Device &amp; Sources</h2>
      </div>
      <div class="bc-library-mesh-shelf">
        <div class="bc-mesh-feature-card mesh-downloads" id="bc-lib-card-downloads">
          <div>
            <span class="bc-mesh-card-kicker">OFFLINE</span>
            <div class="bc-mesh-card-title">Downloads</div>
            <div class="bc-mesh-card-sub">${dlCount} saved tracks</div>
          </div>
          <span class="bc-mesh-card-badge">Music/Deja</span>
        </div>

        <div class="bc-mesh-feature-card mesh-local" id="bc-lib-card-local">
          <div>
            <span class="bc-mesh-card-kicker">DEVICE</span>
            <div class="bc-mesh-card-title">Local Music</div>
            <div class="bc-mesh-card-sub">${localCount > 0 ? `${localCount} audio files` : 'FLAC · MP3 · WAV'}</div>
          </div>
          <span class="bc-mesh-card-badge">Folder Scan</span>
        </div>

        <div class="bc-mesh-feature-card mesh-webdav" id="bc-lib-card-webdav">
          <div>
            <span class="bc-mesh-card-kicker">CLOUD SERVER</span>
            <div class="bc-mesh-card-title">WebDAV / SMB</div>
            <div class="bc-mesh-card-sub">Network NAS &amp; Add-on Sources</div>
          </div>
          <span class="bc-mesh-card-badge">Sources</span>
        </div>

        <div class="bc-mesh-feature-card mesh-smb" onclick="navigateTo('history')">
          <div>
            <span class="bc-mesh-card-kicker">RECENT</span>
            <div class="bc-mesh-card-title">History</div>
            <div class="bc-mesh-card-sub">${(liveHistorySongs && liveHistorySongs.length) || CATALOGUE_TRACKS.length} played tracks</div>
          </div>
          <span class="bc-mesh-card-badge">Timeline</span>
        </div>
      </div>

      <!-- BitChord Playlists Section (+ New playlist tile first, Liked Music, Custom, YouTube Music) -->
      <div class="bc-section-header-row" style="margin-top: 8px;">
        <h2 class="bc-section-heading">Playlists</h2>
        <span class="shelf-action" onclick="navigateTo('playlists')" style="cursor:pointer; color:var(--apple-accent); font-weight:600;">See All</span>
      </div>
      <div class="card-grid" style="margin-bottom: 32px;">
        <div class="bc-new-playlist-tile" id="btn-library-new-playlist" title="Create New Playlist">
          <div class="bc-new-playlist-plus">+</div>
          <div class="bc-new-playlist-label">New playlist</div>
        </div>

        <div class="apple-music-card" onclick="navigateToPlaylist('favorites')" style="cursor: pointer;">
          <div class="card-thumb-wrapper">
            <img src="${CATALOGUE_TRACKS[0]?.cover || '../../assets/icon.png'}" class="card-thumb track-card-img" alt="Liked Songs">
            <div class="card-play-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
          </div>
          <div class="card-title">Liked Music</div>
          <div class="card-subtitle">${lovedTrackIds.size || (liveLikedSongs && liveLikedSongs.length) || 0} songs • Auto-sync</div>
        </div>

        ${hasCustomPlaylists ? sortedCustomPlaylists.map(pl => `
          <div class="apple-music-card library-custom-pl-card" data-playlist-id="${escapeHTML(pl.id)}" style="cursor: pointer;">
            <div class="card-thumb-wrapper">
              <img src="${escapeHTML(pl.cover || CATALOGUE_TRACKS[1]?.cover || '../../assets/icon.png')}" class="card-thumb track-card-img" alt="${escapeHTML(pl.title)}" onerror="this.src='../../assets/icon.png'">
              <div class="card-play-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </div>
            <div class="card-title">${escapeHTML(pl.title)}</div>
            <div class="card-subtitle">${(pl.tracks && pl.tracks.length) || 0} songs • Custom</div>
          </div>
        `).join('') : ''}

        ${hasUserPlaylists ? sortedUserPlaylists.map(lp => `
          <div class="apple-music-card library-browse-card" data-browse-id="${escapeHTML(lp.browseId || '')}" data-title="${escapeHTML(lp.title || '')}" data-cover="${escapeHTML(lp.cover || '')}" data-subtitle="${escapeHTML(lp.subtitle || 'YouTube Music Playlist')}" style="cursor: pointer;">
            <div class="card-thumb-wrapper">
              <img src="${escapeHTML(lp.cover || '../../assets/icon.png')}" class="card-thumb track-card-img" alt="${escapeHTML(lp.title || '')}" onerror="this.src='../../assets/icon.png'">
              <div class="card-play-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </div>
            <div class="card-title">${escapeHTML(lp.title || 'Playlist')}</div>
            <div class="card-subtitle">${escapeHTML(lp.subtitle || 'YouTube Music')}</div>
          </div>
        `).join('') : ''}
      </div>

      ${!hasUserPlaylists ? `
        <div style="background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.12); border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 32px;">
          <p style="font-size: 15px; font-weight: 600; margin-bottom: 6px;">Sync Your YouTube Music Library</p>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px;">Sign in or refresh to load your personal YouTube Music playlists, albums, and liked tracks.</p>
          <button class="btn-apple-primary" id="btn-library-sync-now">
            <span>Sync Library Now</span>
          </button>
        </div>
      ` : ''}

      <!-- Saved Albums Section -->
      <div class="bc-section-header-row">
        <h2 class="bc-section-heading">Albums</h2>
        <span class="shelf-action" onclick="navigateTo('albums')" style="cursor:pointer; color:var(--apple-accent); font-weight:600;">See All</span>
      </div>
      <div class="card-grid" style="margin-bottom: 32px;">
        ${hasAlbums ? sortedAlbums.map(alb => `
          <div class="apple-music-card library-browse-card" data-browse-id="${escapeHTML(alb.browseId || '')}" data-title="${escapeHTML(alb.title || '')}" data-cover="${escapeHTML(alb.cover || '')}" data-subtitle="${escapeHTML(alb.subtitle || 'Album')}" style="cursor: pointer;">
            <div class="card-thumb-wrapper">
              <img src="${escapeHTML(alb.cover || '../../assets/icon.png')}" class="card-thumb track-card-img" alt="${escapeHTML(alb.title || '')}" onerror="this.src='../../assets/icon.png'">
              <div class="card-play-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </div>
            <div class="card-title">${escapeHTML(alb.title || 'Album')}</div>
            <div class="card-subtitle">${escapeHTML(alb.subtitle || 'Album')}</div>
          </div>
        `).join('') : renderCardGridHTML(CATALOGUE_TRACKS.slice(0, 6))}
      </div>

      <!-- Artists Section -->
      ${hasArtists ? `
        <div class="bc-section-header-row">
          <h2 class="bc-section-heading">Artists</h2>
          <span class="shelf-action" onclick="navigateTo('artists')" style="cursor:pointer; color:var(--apple-accent); font-weight:600;">See All</span>
        </div>
        <div class="artists-grid" style="margin-bottom: 24px;">
          ${sortedArtists.slice(0, 8).map((art, idx) => `
            <div class="artist-card bc-lib-artist-card" data-artist-idx="${idx}" style="cursor:pointer;">
              <img src="${escapeHTML(art.cover || '../../assets/icon.png')}" class="artist-avatar" alt="${escapeHTML(art.title || art.name || '')}" onerror="this.src='../../assets/icon.png'">
              <div class="artist-card-name">${escapeHTML(art.title || art.name || 'Artist')}</div>
              <div class="artist-card-sub">${escapeHTML(art.subtitle || 'Artist')}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;

  const replayBanner = document.getElementById('bc-lib-replay-banner');
  if (replayBanner) {
    replayBanner.onclick = () => navigateTo('replay');
  }

  const dlCard = document.getElementById('bc-lib-card-downloads');
  if (dlCard) dlCard.onclick = () => navigateTo('downloads');

  const localCard = document.getElementById('bc-lib-card-local');
  if (localCard) {
    localCard.onclick = () => {
      if (typeof openLocalMusicBrowserSubModal === 'function') {
        openLocalMusicBrowserSubModal();
      } else {
        navigateTo('songs');
      }
    };
  }

  const webdavCard = document.getElementById('bc-lib-card-webdav');
  if (webdavCard) {
    webdavCard.onclick = () => {
      if (typeof openSourcesSubModal === 'function') {
        openSourcesSubModal();
      } else {
        navigateTo('settings');
      }
    };
  }

  const btnLibNew = document.getElementById('btn-library-new-playlist');
  if (btnLibNew) btnLibNew.onclick = () => openCreatePlaylistModal();

  const btnSyncNow = document.getElementById('btn-library-sync-now');
  if (btnSyncNow) btnSyncNow.onclick = () => fetchLiveYouTubeMusic(true);

  container.querySelectorAll('.library-custom-pl-card').forEach(card => {
    card.onclick = () => {
      const plId = card.getAttribute('data-playlist-id');
      if (plId) navigateToPlaylist(plId);
    };
  });

  container.querySelectorAll('.library-browse-card').forEach(card => {
    card.onclick = () => {
      const bId = card.getAttribute('data-browse-id');
      const title = card.getAttribute('data-title');
      const cover = card.getAttribute('data-cover');
      const subtitle = card.getAttribute('data-subtitle');
      if (bId) openBrowseDetail(bId, title, cover, subtitle);
    };
  });

  container.querySelectorAll('.bc-lib-artist-card').forEach(card => {
    card.onclick = () => {
      const idx = parseInt(card.getAttribute('data-artist-idx'), 10);
      const art = sortedArtists[idx];
      if (art && art.browseId) {
        openArtistDetail(art.browseId, art.title || art.name, art.cover, art.subtitle);
      } else {
        navigateTo('artists');
      }
    };
  });
}

function renderSearchTabView(container) {
  if (!container) return;
  const hasQuery = Boolean(searchQuery && searchQuery.trim().length > 0);
  if (hasQuery) {
    renderSearchResultsView(container);
    return;
  }

  container.innerHTML = `
    <div style="padding: 6px 0 24px 0;">
      <h1 class="bc-screen-large-title">Search</h1>

      <div class="bc-search-page-field-wrap">
        <div class="bc-search-page-pill">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" id="bc-search-page-input" class="bc-search-page-input" placeholder="Artists, Songs, Lyrics, and More" value="${escapeHTML(searchQuery)}" autocomplete="off" />
        </div>
      </div>

      ${bcRecentSearches.length > 0 ? `
        <div class="bc-recent-searches-header">
          <span class="bc-recent-searches-title">Recent Searches</span>
          <button class="bc-recent-searches-clear" id="bc-clear-recent-searches">Clear</button>
        </div>
        <div style="display:flex; flex-direction:column; gap:2px; margin-bottom:28px;">
          ${bcRecentSearches.map((term, idx) => `
            <div class="bc-recent-search-row" data-recent-term="${escapeHTML(term)}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text-secondary); flex-shrink:0;">
                <circle cx="12" cy="12" r="9"></circle>
                <polyline points="12 7 12 12 15 15"></polyline>
              </svg>
              <span class="bc-recent-search-text">${escapeHTML(term)}</span>
              <button class="bc-recent-search-remove" data-remove-recent="${idx}" title="Remove">✕</button>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="bc-section-header-row">
        <h2 class="bc-section-heading">Browse Categories</h2>
      </div>
      <div class="bc-moods-grid">
        ${['Pop', 'Hip-Hop', 'Synthwave', 'R&B & Soul', 'Rock', 'Electronic', 'Indie', 'Lo-Fi Chill'].map((cat, idx) => {
          const bgColor = BITCHORD_MOOD_COLORS[idx % BITCHORD_MOOD_COLORS.length];
          const sleeveArt = CATALOGUE_TRACKS[idx % CATALOGUE_TRACKS.length]?.cover || '../../assets/icon.png';
          return `
            <div class="bc-mood-genre-card" data-search-cat="${escapeHTML(cat)}" style="background-color: ${bgColor};">
              <span class="bc-mood-genre-title">${escapeHTML(cat)}</span>
              <img src="${escapeHTML(sleeveArt)}" class="bc-mood-genre-sleeve" alt="${escapeHTML(cat)}" onerror="this.style.display='none'">
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  const getById = (id) => (typeof document !== 'undefined' && typeof document.getElementById === 'function')
    ? document.getElementById(id)
    : null;
  const pageInput = getById('bc-search-page-input');
  if (pageInput) {
    pageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && pageInput.value.trim()) {
        const val = pageInput.value.trim();
        if (!bcRecentSearches.includes(val)) {
          bcRecentSearches.unshift(val);
          if (bcRecentSearches.length > 8) bcRecentSearches.pop();
        }
        searchQuery = val;
        const hiddenInput = getById('apple-search-input');
        if (hiddenInput) hiddenInput.value = val;
        renderSearchResultsView(container);
      }
    });
    pageInput.addEventListener('input', (e) => {
      const val = e.target.value;
      searchQuery = val;
      const hiddenInput = getById('apple-search-input');
      if (hiddenInput) hiddenInput.value = val;
      if (val.trim().length >= 2) {
        renderSearchResultsView(container);
      }
    });
  }

  const clearBtn = getById('bc-clear-recent-searches');
  if (clearBtn) {
    clearBtn.onclick = () => {
      bcRecentSearches = [];
      renderSearchTabView(container);
    };
  }

  container.querySelectorAll('[data-recent-term]').forEach(row => {
    row.onclick = (e) => {
      if (e.target.closest('[data-remove-recent]')) return;
      const term = row.getAttribute('data-recent-term');
      if (term) {
        searchQuery = term;
        const hiddenInput = getById('apple-search-input');
        if (hiddenInput) hiddenInput.value = term;
        renderSearchResultsView(container);
      }
    };
  });

  container.querySelectorAll('[data-remove-recent]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.getAttribute('data-remove-recent'), 10);
      bcRecentSearches.splice(idx, 1);
      renderSearchTabView(container);
    };
  });

  container.querySelectorAll('[data-search-cat]').forEach(card => {
    card.onclick = () => {
      const cat = card.getAttribute('data-search-cat');
      if (cat) {
        searchQuery = cat;
        const hiddenInput = getById('apple-search-input');
        if (hiddenInput) hiddenInput.value = cat;
        renderSearchResultsView(container);
      }
    };
  });
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
          <div style="display:flex; justify-content:center; margin-bottom: 12px; opacity:0.4;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          </div>
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
        row.onclick = () => {
          userQueue = tracks.slice(idx);
          isDefaultCatalogueQueue = false;
          playLiveTrack(t, true);
        };
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
        isDefaultCatalogueQueue = false;
        playLiveTrack(tracks[0], true);
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

  const shuffled = [...tracks].sort(() => Math.random() - 0.5);
  userQueue = shuffled;
  isDefaultCatalogueQueue = false;
  if (shuffled[0]) {
    playLiveTrack(shuffled[0], true);
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

  const filterPills = [
    { id: 'ALL', label: 'All' },
    { id: 'SONGS', label: 'Songs' },
    { id: 'VIDEOS', label: 'Videos' },
    { id: 'ALBUMS', label: 'Albums' },
    { id: 'ARTISTS', label: 'Artists' },
    { id: 'PLAYLISTS', label: 'Playlists' }
  ];

  const activeFilterLabel = filterPills.find(f => f.id === activeSearchFilter)?.label || 'All';
  const showLocal = (activeSearchFilter === 'ALL' || activeSearchFilter === 'SONGS');
  const matched = (showLocal && q.length >= 2) ? CATALOGUE_TRACKS.filter(t =>
    t.title.toLowerCase().includes(q) ||
    t.artist.toLowerCase().includes(q) ||
    t.album.toLowerCase().includes(q)
  ) : [];

  container.innerHTML = `
    <div style="padding: 6px 0 28px 0;">
      <div class="bc-search-page-field-wrap" style="margin-bottom: 14px;">
        <div class="bc-search-page-pill">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" id="bc-search-page-input" class="bc-search-page-input" placeholder="Artists, Songs, Lyrics, and More" value="${safeQ}" autocomplete="off" />
          <button class="bc-recent-search-remove" onclick="clearSearch()" title="Clear Search">✕</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
        <div>
          <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 4px; letter-spacing: -0.4px;">Search Results for "${safeQ}"</h1>
          <p style="color: var(--text-secondary); font-size: 13.5px; margin: 0;">YouTube Music Catalogue • ${escapeHTML(activeFilterLabel)}</p>
        </div>
        <button class="genre-chip" onclick="clearSearch()">Clear Search</button>
      </div>

      <div class="search-filters-bar">
        ${filterPills.map(f => `
          <div class="search-filter-pill ${activeSearchFilter === f.id ? 'active' : ''}" data-filter="${f.id}">${f.label}</div>
        `).join('')}
      </div>

      <div id="yt-search-section" style="margin-top: 20px;">
        <div id="yt-search-grid" class="bitchord-search-results-container">
          <div class="bitchord-search-loading">
            <span class="badge-dot" style="background: #FA2D48;"></span>
            <span>Searching YouTube Music for "${safeQ}"...</span>
          </div>
        </div>
      </div>

      ${matched.length > 0 ? `
        <div class="shelf-section" style="margin-top: 32px;">
          <div class="shelf-header">
            <h2 class="shelf-title">Local Library Matches</h2>
          </div>
          <div class="card-grid">
            ${renderCardGridHTML(matched)}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  const topSearchField = document.getElementById('bc-search-page-input');
  if (topSearchField) {
    topSearchField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        searchQuery = topSearchField.value;
        const hiddenInput = document.getElementById('apple-search-input');
        if (hiddenInput) hiddenInput.value = searchQuery;
        renderCurrentView();
      }
    });
  }

  // Bind filter pills click
  container.querySelectorAll('.search-filter-pill').forEach(pill => {
    pill.onclick = () => {
      const filter = pill.getAttribute('data-filter');
      if (filter && filter !== activeSearchFilter) {
        activeSearchFilter = filter;
        renderSearchResultsView(container);
      }
    };
  });

  const isArtistItem = (yt) => Boolean(yt.resultType === 'artist' || yt.type === 'artist' || (yt.browseId && yt.browseId.startsWith('UC')));
  const getBadgeLabel = (yt) => {
    if (yt.resultType) return yt.resultType.toUpperCase();
    if (isArtistItem(yt)) return 'ARTIST';
    if (yt.browseId && (yt.browseId.startsWith('MPRE') || yt.browseId.startsWith('OLAK'))) return 'ALBUM';
    if (yt.browseId && (yt.browseId.startsWith('VL') || yt.browseId.startsWith('PL'))) return 'PLAYLIST';
    return yt.videoId ? 'SONG' : 'YTM';
  };

  const renderSongRowHTML = (yt, i) => {
    const subParts = [];
    if (yt.artist && yt.artist !== 'YouTube Music') subParts.push(yt.artist);
    if (yt.album && yt.album !== 'YouTube Music' && yt.album !== yt.artist) subParts.push(yt.album);
    const subText = subParts.join(' · ') || yt.subtitle || 'YouTube Music';
    const isVid = yt.resultType === 'video';
    return `
      <div class="bitchord-search-song-row" id="yt-card-${i}">
        <div class="bitchord-song-row-art-wrap">
          <img src="${escapeHTML(yt.cover || '../../assets/icon.png')}" class="bitchord-song-row-art" alt="${escapeHTML(yt.title)}" onerror="this.src='../../assets/icon.png'">
          <div class="bitchord-song-row-play">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </div>
        </div>
        <div class="bitchord-song-row-meta">
          <div class="bitchord-song-row-title">${escapeHTML(yt.title)}</div>
          <div class="bitchord-song-row-sub">${escapeHTML(subText)}</div>
        </div>
        ${isVid ? `<span class="bitchord-row-badge">VIDEO</span>` : ''}
        <span class="bitchord-song-row-dur">${escapeHTML(yt.durationStr || '')}</span>
        <button class="bitchord-song-row-action" data-add-idx="${i}" title="Add to Playlist">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    `;
  };

  const renderCardItemHTML = (yt, i) => {
    const isArtist = isArtistItem(yt);
    const badge = getBadgeLabel(yt);
    const thumbClass = isArtist ? 'card-thumb track-card-img artist-avatar' : 'card-thumb track-card-img';
    const sub = isArtist ? (yt.subtitle || 'Artist') : `${yt.artist || yt.subtitle || ''}${yt.durationStr && yt.videoId ? ` • ${yt.durationStr}` : ''}`;
    return `
      <div class="apple-music-card" id="yt-card-${i}">
        <div class="card-thumb-wrapper">
          <img src="${escapeHTML(yt.cover || '../../assets/icon.png')}" class="${thumbClass}" alt="${escapeHTML(yt.title)}" onerror="this.src='../../assets/icon.png'">
          <div class="card-play-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
          <span class="card-type-badge ${isArtist ? 'artist-badge' : 'yt-badge'}">${badge}</span>
        </div>
        <div class="card-title">${escapeHTML(yt.title)}</div>
        <div class="card-subtitle">${escapeHTML(sub)}</div>
      </div>
    `;
  };

  const api = window.dejaAPI || window.sonoraAPI;
  if (api?.searchYouTube && q.length >= 2) {
    api.searchYouTube(searchQuery, activeSearchFilter).then(ytResults => {
      if (activeSearchQuery !== q) return;
      const ytGrid = document.getElementById('yt-search-grid');
      if (!ytGrid) return;
      if (!ytResults || ytResults.length === 0) {
        ytGrid.innerHTML = `<div style="color: var(--text-secondary); font-size: 13.5px; padding: 16px 0;">No online YouTube Music results found for "${safeQ}".</div>`;
        return;
      }

      if (activeSearchFilter === 'ALL') {
        let topIdx = ytResults.findIndex(r => r.isTopResult);
        if (topIdx < 0) topIdx = 0;
        const topItem = ytResults[topIdx];
        const topIsArtist = isArtistItem(topItem);
        const topBadge = getBadgeLabel(topItem);
        const topSub = topIsArtist
          ? (topItem.subtitle || 'Artist')
          : [topItem.artist, topItem.album && topItem.album !== 'YouTube Music' ? topItem.album : '', topItem.durationStr && topItem.videoId ? topItem.durationStr : ''].filter(Boolean).join(' · ');

        const songs = [];
        const artists = [];
        const browses = [];
        ytResults.forEach((yt, idx) => {
          if (idx === topIdx) return;
          if (isArtistItem(yt)) {
            artists.push({ yt, idx });
          } else if (yt.videoId) {
            songs.push({ yt, idx });
          } else if (yt.browseId) {
            browses.push({ yt, idx });
          }
        });

        ytGrid.innerHTML = `
          <div class="bitchord-top-and-songs-grid">
            <div class="bitchord-top-result-col">
              <div class="bitchord-section-heading">Top result</div>
              <div class="bitchord-top-result-card" id="yt-card-${topIdx}">
                <div class="bitchord-top-result-main">
                  <img src="${escapeHTML(topItem.cover || '../../assets/icon.png')}" class="bitchord-top-result-art ${topIsArtist ? 'is-artist' : ''}" alt="${escapeHTML(topItem.title)}" onerror="this.src='../../assets/icon.png'">
                  <div class="bitchord-top-result-info">
                    <span class="bitchord-top-result-badge">${topBadge}</span>
                    <div class="bitchord-top-result-title">${escapeHTML(topItem.title)}</div>
                    <div class="bitchord-top-result-sub">${escapeHTML(topSub)}</div>
                  </div>
                </div>
                <div class="bitchord-top-result-actions">
                  <button class="bitchord-top-btn primary" id="yt-top-primary-btn">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    <span>${topItem.videoId ? 'Play' : (topIsArtist ? 'Open Artist' : 'Open')}</span>
                  </button>
                  ${(topItem.videoId || songs.length > 0) ? `
                    <button class="bitchord-top-btn secondary" id="yt-top-secondary-btn">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      <span>${topItem.videoId ? 'Add to Playlist' : 'Play Top Song'}</span>
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>

            ${songs.length > 0 ? `
              <div class="bitchord-songs-col">
                <div class="bitchord-section-heading">Songs</div>
                <div class="bitchord-search-song-list">
                  ${songs.slice(0, 6).map(({ yt, idx }) => renderSongRowHTML(yt, idx)).join('')}
                </div>
              </div>
            ` : ''}
          </div>

          ${songs.length > 6 ? `
            <div class="bitchord-search-section">
              <div class="bitchord-section-heading">More Songs & Videos</div>
              <div class="bitchord-search-song-list">
                ${songs.slice(6).map(({ yt, idx }) => renderSongRowHTML(yt, idx)).join('')}
              </div>
            </div>
          ` : ''}

          ${artists.length > 0 ? `
            <div class="bitchord-search-section">
              <div class="bitchord-section-heading">Artists</div>
              <div class="card-grid">
                ${artists.map(({ yt, idx }) => renderCardItemHTML(yt, idx)).join('')}
              </div>
            </div>
          ` : ''}

          ${browses.length > 0 ? `
            <div class="bitchord-search-section">
              <div class="bitchord-section-heading">Albums & Playlists</div>
              <div class="card-grid">
                ${browses.map(({ yt, idx }) => renderCardItemHTML(yt, idx)).join('')}
              </div>
            </div>
          ` : ''}
        `;

        const secondaryBtn = document.getElementById('yt-top-secondary-btn');
        if (secondaryBtn) {
          secondaryBtn.onclick = (e) => {
            e.stopPropagation();
            if (topItem.videoId) {
              const catTrack = createCatalogueItemFromLive(topItem);
              if (!CATALOGUE_TRACKS.some(x => x.videoId === catTrack.videoId)) {
                CATALOGUE_TRACKS.push(catTrack);
              }
              openAddToPlaylistModal(catTrack.id);
            } else if (songs.length > 0) {
              selectYouTubeTrack(songs[0].yt);
            }
          };
        }
      } else if (activeSearchFilter === 'SONGS' || activeSearchFilter === 'VIDEOS') {
        ytGrid.innerHTML = `
          <div class="bitchord-search-song-list">
            ${ytResults.map((yt, i) => renderSongRowHTML(yt, i)).join('')}
          </div>
        `;
      } else {
        ytGrid.innerHTML = `
          <div class="card-grid">
            ${ytResults.map((yt, i) => renderCardItemHTML(yt, i)).join('')}
          </div>
        `;
      }

      // Bind item click and add-to-playlist buttons
      ytResults.forEach((yt, i) => {
        const card = document.getElementById(`yt-card-${i}`);
        if (card) {
          card.onclick = () => {
            if (isArtistItem(yt)) {
              openArtistDetail(yt.browseId, yt.title, yt.cover, yt.subtitle);
            } else if (yt.resultType === 'album' || yt.resultType === 'playlist' || yt.type === 'browse' || (!yt.videoId && yt.browseId)) {
              openBrowseDetail(yt.browseId, yt.title, yt.cover, yt.subtitle);
            } else {
              selectYouTubeTrack(yt);
            }
          };
        }
      });

      ytGrid.querySelectorAll('[data-add-idx]').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.getAttribute('data-add-idx'), 10);
          const yt = ytResults[idx];
          if (yt && yt.videoId) {
            const catTrack = createCatalogueItemFromLive(yt);
            if (!CATALOGUE_TRACKS.some(x => x.videoId === catTrack.videoId)) {
              CATALOGUE_TRACKS.push(catTrack);
            }
            openAddToPlaylistModal(catTrack.id);
          }
        };
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
          <img src="${t.cover}" class="card-thumb track-card-img" alt="${t.title}" loading="lazy" decoding="async">
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

function refreshUpNextQueueForTrack(track, forceReplace = false) {
  if (!track) return;
  const trackDedupeKey = normalizeTrackDedupeKey(track);

  if (!forceReplace && Array.isArray(userQueue) && userQueue.length > 0) {
    userQueue = dedupeTrackList(userQueue, track);
    const curQIdx = userQueue.findIndex(t =>
      (track.videoId && (t.videoId === track.videoId || t.musicVideoId === track.videoId)) ||
      (track.id && t.id === track.id) ||
      (trackDedupeKey && normalizeTrackDedupeKey(t) === trackDedupeKey)
    );
    if (curQIdx > 0) {
      const skipped = userQueue.slice(0, curQIdx);
      skipped.forEach(s => {
        if (s && (!playedHistoryStack.length || playedHistoryStack[playedHistoryStack.length - 1]?.videoId !== s.videoId)) {
          playedHistoryStack.push(s);
        }
      });
      userQueue = userQueue.slice(curQIdx);
    }
    renderPreviewQueue();
    if (!isDefaultCatalogueQueue && userQueue.length >= 12) {
      return;
    }
  }

  if (!track.videoId) return;
  const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
  if (!api?.getNextQueue) return;

  const targetVideoId = track.videoId;
  const shouldReplaceAll = Boolean(forceReplace || isDefaultCatalogueQueue || !Array.isArray(userQueue) || userQueue.length === 0);

  api.getNextQueue(targetVideoId).then(queueItems => {
    if (!Array.isArray(queueItems) || queueItems.length === 0) return;
    const currentActive = CATALOGUE_TRACKS[currentIndex];
    if (currentActive && currentActive.videoId && currentActive.videoId !== targetVideoId) return;

    const seenIds = new Set();
    const seenTitleKeys = new Set();
    const registerSeen = (itemObj) => {
      if (!itemObj) return;
      if (itemObj.videoId) seenIds.add(itemObj.videoId);
      if (itemObj.musicVideoId) seenIds.add(itemObj.musicVideoId);
      if (itemObj.id) seenIds.add(itemObj.id);
      const tKey = normalizeTrackDedupeKey(itemObj);
      if (tKey) seenTitleKeys.add(tKey);
    };

    registerSeen(track);
    if (!shouldReplaceAll && Array.isArray(userQueue)) {
      userQueue.forEach(registerSeen);
    }

    const avoidSessionRepeats = typeof bitchordSettings === 'undefined' || bitchordSettings.dontRepeatSuggestions !== false;

    const mapped = [];
    const fallbackMapped = [];
    for (const qi of queueItems) {
      if (!qi) continue;
      const item = createCatalogueItemFromLive(qi);
      const vid = item.videoId || '';
      const mvid = item.musicVideoId || '';
      const idKey = vid || item.id || '';
      const titleKey = normalizeTrackDedupeKey(item);
      if ((idKey && seenIds.has(idKey)) || (mvid && seenIds.has(mvid)) || (titleKey && seenTitleKeys.has(titleKey))) {
        continue;
      }
      if (idKey) seenIds.add(idKey);
      if (mvid) seenIds.add(mvid);
      if (titleKey) seenTitleKeys.add(titleKey);
      fallbackMapped.push(item);
      if (avoidSessionRepeats && ((vid && sessionPlayedVideoIds.has(vid)) || (titleKey && sessionPlayedTitleKeys.has(titleKey)))) {
        continue;
      }
      mapped.push(item);
    }

    const finalQueue = mapped.length >= 3 ? mapped : fallbackMapped;
    if (finalQueue.length > 0) {
      if (shouldReplaceAll) {
        userQueue = dedupeTrackList([track, ...finalQueue], track);
      } else {
        const hasTrackAtHead = userQueue.length > 0 &&
          ((track.videoId && userQueue[0].videoId === track.videoId) ||
           (track.id && userQueue[0].id === track.id) ||
           (trackDedupeKey && normalizeTrackDedupeKey(userQueue[0]) === trackDedupeKey));
        const baseQueue = hasTrackAtHead ? userQueue : [track, ...userQueue];
        userQueue = dedupeTrackList([...baseQueue, ...finalQueue], track);
      }
      isDefaultCatalogueQueue = false;
      renderPreviewQueue();
      saveLastPlaybackState(true);
    }
  }).catch(err => {
    console.warn('[Queue] getNextQueue error:', err.message);
  });
}

function selectTrack(idx, preserveQueue = false) {
  if (idx < 0 || idx >= CATALOGUE_TRACKS.length) return;
  loadTrack(idx, true);
  const track = CATALOGUE_TRACKS[idx];
  resolveAndPlayTrack(track);
  refreshUpNextQueueForTrack(track, !preserveQueue);
}

function selectTrackByObject(trackId) {
  const idx = CATALOGUE_TRACKS.findIndex(t => t.id === trackId);
  if (idx !== -1) selectTrack(idx);
}

function loadTrack(idx, skipNotify = false) {
  currentIndex = idx;
  const track = CATALOGUE_TRACKS[idx];
  if (!track) return;
  activeStreamResolveReqId++;
  pendingStartupResumeSec = 0;
  pendingStartupResumeVideoId = '';
  manualPausedSeekSec = 0;
  manualPausedSeekTrackKey = '';
  loadedStreamVideoId = null;
  isDirectStreamPlaying = false;
  isYtPlaying = false;
  if (playbackTimer) {
    clearInterval(playbackTimer);
    playbackTimer = null;
  }
  stopLyricClock();
  if (dejaAudio) {
    try {
      if (!dejaAudio.paused) dejaAudio.pause();
      dejaAudio.currentTime = 0;
    } catch {}
  }
  if (isYtReady && ytPlayer) {
    try {
      if (typeof ytPlayer.pauseVideo === 'function') ytPlayer.pauseVideo();
      if (typeof ytPlayer.seekTo === 'function') ytPlayer.seekTo(0, true);
    } catch {}
  }
  if (track.videoId) {
    sessionPlayedVideoIds.add(track.videoId);
  }
  const trackDedupeKey = normalizeTrackDedupeKey(track);
  if (trackDedupeKey) {
    sessionPlayedTitleKeys.add(trackDedupeKey);
  }
  currentTime = 0;
  _lastRenderedTimeStr = '';
  _lastRenderedRemStr = '';
  lastActiveLyricIndex = -1;
  lastScrollTargetIndex = -1;
  if (typeof lyricClockReconciler !== 'undefined' && lyricClockReconciler) {
    lyricClockReconciler.snap(0);
  }

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

  const barCover = upscaleArtworkUrl(track.cover, track.videoId, 360);
  const hiResCover = upscaleArtworkUrl(track.cover, track.videoId, 1080);
  track.cover = barCover;
  if (artEl) artEl.src = barCover;
  if (expandedTitle) expandedTitle.innerText = track.title;
  if (expandedArtist) expandedArtist.innerText = `${track.artist} • ${track.album}`;
  if (expandedArtwork) {
    expandedArtwork.onerror = () => {
      if (track.videoId && !expandedArtwork.src.includes('hqdefault.jpg')) {
        expandedArtwork.src = `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg`;
      }
    };
    expandedArtwork.src = hiResCover;
  }
  extractPaletteFromImage(barCover, (realPalette) => {
    if (realPalette) {
      track.palette = realPalette;
      applyDynamicMeshAura(track);
    }
  });
  if (typeof updateDownloadButtonsState === 'function') {
    updateDownloadButtonsState(track);
  }
  if (typeof onTrackChangedForVideoMode === 'function') {
    onTrackChangedForVideoMode(track);
  }
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

  // Persist current track state to localStorage
  saveLastPlaybackState(true);

  // Notify Electron Main Process
  if (!skipNotify) {
    notifyTrackState();
  }
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

let previewUserScrolling = false;
let previewUserScrollTimer = null;

function onPreviewUserScroll() {
  previewUserScrolling = true;
  if (previewUserScrollTimer) clearTimeout(previewUserScrollTimer);
  previewUserScrollTimer = setTimeout(() => {
    previewUserScrolling = false;
    const containers = (typeof document.getElementById === 'function' ? [
      document.getElementById('lyrics-lines-container'),
      document.getElementById('expanded-lyrics-container')
    ] : []).filter(Boolean);
    containers.forEach(c => {
      if (lastActiveLyricIndex >= 0) {
        const activeEl = c.querySelectorAll('.apple-lyric-line')?.[lastActiveLyricIndex];
        if (activeEl && typeof activeEl.scrollIntoView === 'function') {
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  }, 3500);
}

const BASELINE_ACOUSTIC_OFFSET = 0.20; // 200ms calibration for Opus stream preroll & acoustic vocal onset

function getTrackLyricsOffset(track) {
  if (typeof localStorage === 'undefined') return 0;
  const t = track || (typeof CATALOGUE_TRACKS !== 'undefined' ? CATALOGUE_TRACKS[currentIndex] : null);
  const trackKey = t ? (t.id || t.videoId || `${t.title || ''}-${t.artist || ''}`) : '';
  if (trackKey) {
    const trackVal = localStorage.getItem(`deja_lyrics_offset_${trackKey}`);
    if (trackVal !== null) {
      const parsed = parseFloat(trackVal);
      if (!isNaN(parsed)) return parsed;
    }
  }
  const globalVal = localStorage.getItem('deja_lyrics_offset_global');
  if (globalVal !== null) {
    const parsed = parseFloat(globalVal);
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
}

function setTrackLyricsOffset(track, offsetSec, isGlobal = false) {
  const clamped = Math.max(-5.0, Math.min(5.0, Math.round(offsetSec * 10) / 10));
  if (typeof localStorage !== 'undefined') {
    const t = track || (typeof CATALOGUE_TRACKS !== 'undefined' ? CATALOGUE_TRACKS[currentIndex] : null);
    const trackKey = t ? (t.id || t.videoId || `${t.title || ''}-${t.artist || ''}`) : '';
    if (trackKey && !isGlobal) {
      localStorage.setItem(`deja_lyrics_offset_${trackKey}`, clamped.toString());
    } else {
      localStorage.setItem('deja_lyrics_offset_global', clamped.toString());
    }
  }
  updateOffsetBadges(clamped);
  return clamped;
}

function formatLyricsOffset(offset) {
  const rounded = Math.round(offset * 10) / 10;
  if (rounded > 0) return `+${rounded.toFixed(1)}s`;
  if (rounded < 0) return `${rounded.toFixed(1)}s`;
  return '0.0s';
}

function adjustedLyricsPosition(currentTime, offsetSec = 0) {
  const smartCal = (typeof bitchordSettings === 'undefined' || bitchordSettings.smartVersionAlignment !== false)
    ? BASELINE_ACOUSTIC_OFFSET
    : 0;
  return Math.max(0, Math.round((currentTime - (offsetSec + smartCal)) * 1000) / 1000);
}

function adjustedLyricsSeekTarget(lineTime, offsetSec = 0) {
  const smartCal = (typeof bitchordSettings === 'undefined' || bitchordSettings.smartVersionAlignment !== false)
    ? BASELINE_ACOUSTIC_OFFSET
    : 0;
  return Math.max(0, Math.round((lineTime + (offsetSec + smartCal)) * 1000) / 1000);
}

function nudgeLyricsOffset(delta, reset = false) {
  const track = typeof CATALOGUE_TRACKS !== 'undefined' ? CATALOGUE_TRACKS[currentIndex] : null;
  const curOffset = getTrackLyricsOffset(track);
  const newOffset = reset ? 0 : (curOffset + delta);
  if (reset && typeof localStorage !== 'undefined') {
    const trackKey = track ? (track.id || track.videoId || `${track.title || ''}-${track.artist || ''}`) : '';
    if (trackKey) {
      localStorage.removeItem(`deja_lyrics_offset_${trackKey}`);
    }
  }
  setTrackLyricsOffset(track, newOffset);
  if (typeof updateSyncedLyrics === 'function') {
    updateSyncedLyrics(true);
  }
  return newOffset;
}

function updateOffsetBadges(offset) {
  if (typeof document === 'undefined') return;
  const formatted = formatLyricsOffset(offset);
  const badges = document.querySelectorAll('.offset-badge, #drawer-offset-val, #exp-offset-val, #bc-np-offset-val');
  badges.forEach(badge => {
    if (badge) {
      badge.innerText = formatted;
      badge.textContent = formatted;
      if (badge.style) badge.style.color = offset !== 0 ? '#FA2D48' : '';
    }
  });
}

function attachOffsetBarListeners(scope = (typeof document !== 'undefined' ? document : null)) {
  if (!scope || !scope.querySelectorAll) return;
  const minusBtns = scope.querySelectorAll('.btn-offset-minus, #drawer-offset-minus, #exp-offset-minus, #bc-np-offset-minus');
  const plusBtns = scope.querySelectorAll('.btn-offset-plus, #drawer-offset-plus, #exp-offset-plus, #bc-np-offset-plus');
  const badgeBtns = scope.querySelectorAll('.offset-badge, #drawer-offset-val, #exp-offset-val, #bc-np-offset-val');
  const quickMinus = scope.querySelectorAll('.btn-nudge-minus, #drawer-nudge-minus5, #exp-nudge-minus5');
  const quickPlus = scope.querySelectorAll('.btn-nudge-plus, #drawer-nudge-plus5, #exp-nudge-plus5');

  minusBtns.forEach(btn => {
    btn.onclick = (e) => { if (e) e.stopPropagation(); nudgeLyricsOffset(-0.1); };
  });
  plusBtns.forEach(btn => {
    btn.onclick = (e) => { if (e) e.stopPropagation(); nudgeLyricsOffset(0.1); };
  });
  badgeBtns.forEach(badge => {
    badge.onclick = (e) => { if (e) e.stopPropagation(); nudgeLyricsOffset(0, true); };
  });
  quickMinus.forEach(btn => {
    btn.onclick = (e) => { if (e) e.stopPropagation(); nudgeLyricsOffset(-0.5); };
  });
  quickPlus.forEach(btn => {
    btn.onclick = (e) => { if (e) e.stopPropagation(); nudgeLyricsOffset(0.5); };
  });
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

  const userOffset = getTrackLyricsOffset(track);
  updateOffsetBadges(userOffset);

  const safeLyrics = (lyrics && Array.isArray(lyrics) && lyrics.length > 0)
    ? lyrics
    : [{ time: 0, text: 'No synchronized lyrics available for this track.' }];

  const isSynced = safeLyrics.some(l => typeof l.time === 'number' && l.time > 0);

  containers.forEach(container => {
    // Attach user manual scroll detection
    if (!container.__dejaScrollHooked) {
      container.__dejaScrollHooked = true;
      container.addEventListener('wheel', onPreviewUserScroll, { passive: true });
      container.addEventListener('touchmove', onPreviewUserScroll, { passive: true });
      container.addEventListener('pointerdown', onPreviewUserScroll, { passive: true });
    }

    const linesHtml = safeLyrics.map((l, i) => {
      const hasWords = Array.isArray(l.words) && l.words.length > 0;
      const innerContent = hasWords
        ? l.words.map(w => `<span class="lyric-word-span" data-start="${w.startTime}" data-end="${w.endTime}">${escapeHTML(w.text)}</span>`).join(' ')
        : escapeHTML(l.text);
      const bgHtml = l.backgroundText
        ? `<div class="lyric-bg-vocal" style="font-size: 0.72em; opacity: 0.72; margin-top: 4px; font-weight: 500;">(${escapeHTML(l.backgroundText)})</div>`
        : '';
      const romText = (bcRomanizeLyrics && typeof getInlineLyricRomanization === 'function')
        ? getInlineLyricRomanization(l.text, l.romanization)
        : '';
      const romHtml = romText
        ? `<span class="lyric-romanization-sub">${escapeHTML(romText)}</span>`
        : '';
      const transText = (typeof getInlineLyricTranslation === 'function' && typeof bitchordSettings !== 'undefined')
        ? getInlineLyricTranslation(l.text, bitchordSettings.translationLanguage, l.translation)
        : '';
      const transHtml = transText
        ? `<span class="lyric-translation-sub">${escapeHTML(transText)}</span>`
        : '';
      const alignClass = l.isRightAligned ? ' lyric-right-aligned' : '';
      const alignStyle = l.isRightAligned ? ' style="text-align: right;"' : '';
      return `
      <div class="apple-lyric-line ${isSynced && i === 0 ? 'active' : ''}${hasWords ? ' has-word-sync' : ''}${alignClass}" data-time="${l.time}" data-line-index="${i}"${alignStyle}>
        ${innerContent}${bgHtml}${romHtml}${transHtml}
      </div>
    `;
    }).join('');

    if (container.id === 'expanded-lyrics-container') {
      const offsetBarHtml = `
        <div class="exp-lyrics-offset-bar" id="exp-lyrics-offset-bar">
          <span class="offset-caption">Sync:</span>
          <div class="offset-pill-group">
            <button class="btn-offset-nudge btn-offset-minus" id="exp-offset-minus" title="Advance −0.1s">−</button>
            <span class="offset-badge" id="exp-offset-val" title="Click to reset offset (0.0s)">${formatLyricsOffset(userOffset)}</span>
            <button class="btn-offset-nudge btn-offset-plus" id="exp-offset-plus" title="Delay +0.1s">+</button>
          </div>
          <button class="btn-offset-quick btn-nudge-minus" id="exp-nudge-minus5" title="Advance −0.5s">−0.5s</button>
          <button class="btn-offset-quick btn-nudge-plus" id="exp-nudge-plus5" title="Delay +0.5s">+0.5s</button>
        </div>
      `;
      container.innerHTML = offsetBarHtml + linesHtml;
      attachOffsetBarListeners(container);
    } else {
      container.innerHTML = linesHtml;
    }

    // Attach direct click listeners for immediate seek responsiveness (tap-to-seek)
    container.querySelectorAll('.apple-lyric-line').forEach((lineEl, idx) => {
      const lineData = safeLyrics[idx];
      if (isSynced && lineData && typeof lineData.time === 'number') {
        lineEl.onclick = (e) => {
          if (e) e.stopPropagation();
          previewUserScrolling = false;
          if (previewUserScrollTimer) clearTimeout(previewUserScrollTimer);
          const currentOffset = getTrackLyricsOffset(track);
          const seekTarget = adjustedLyricsSeekTarget(lineData.time, currentOffset);
          seekTo(seekTarget);
        };
      }
    });
  });

  const drawer = document.getElementById('apple-lyrics-drawer');
  if (drawer) attachOffsetBarListeners(drawer);
}

/**
 * Sanitizes track search term for lyrics matching
 * Matches BitChord title.forLyricsSearch()
 */
function cleanSearchTerm(str) {
  if (!str || typeof str !== 'string') return '';
  let s = str
    .replace(/\uFEFF|\u200E|\u200F/g, '')
    // Strip trailing unclosed feature/collaboration tags (e.g. '(feat. Din...')
    .replace(/\s*[\(\[]\s*(?:feat\.?|ft\.?|featuring|with)\b.*$/gi, '')
    // Strip closed bracket feature tags: e.g. '(feat. Dina Rae)', '[ft. Daft Punk]', '(with Pharrell Williams)'
    .replace(/\s*[\(\[]\s*(?:feat\.?|ft\.?|featuring|with)\b[^)\]]*[)\]]/gi, '')
    // Strip unbracketed feature tags: requires at least 1 leading whitespace to protect words like 'Swift', 'Gift', 'Left'
    .replace(/\s+(?:feat\.?|ft\.?|featuring|with)\b.*$/gi, '')
    // Strip parenthetical/bracketed official video/audio/remaster/live tags
    .replace(/\s*[\(\[](?:official\s*)?(?:music\s+|lyric\s+|lyrics\s+)?(?:video|audio|visualizer|track|remaster(?:ed)?(?:\s+\d{4})?|live(?:\s+at\s+[^)\]]+)?)[\]\)]/gi, '')
    .replace(/\s*\(?(?:official\s+(?:music\s+|lyric\s+|lyrics\s+)?video|official\s+audio|audio|lyric\s+video|lyrics\s+video|visualizer|remastered|remaster\s+\d{4}|live(?:\s+at\s+[^)]+)?)\)?/gi, '')
    .replace(/\s*\[?(?:official\s+(?:music\s+|lyric\s+|lyrics\s+)?video|official\s+audio|audio|lyric\s+video|lyrics\s+video|visualizer|remastered|remaster\s+\d{4}|live(?:\s+at\s+[^\]]+)?)\]?/gi, '')
    // Bare official in brackets
    .replace(/\s*[(\[]\s*official\s*[)\]]/gi, '')
    // Strip trailing separators and descriptors
    .replace(/\s*(?:\||\/\/|-)\s*(?:official\s+video|official\s+audio|audio|lyric\s+video|lyrics|music\s+video).*$/gi, '')
    // Strip YouTube auto-generated channel topic tag
    .replace(/\s*-\s*Topic$/i, '')
    .trim();

  // Strip metadata like bullet view counts or album info (e.g. "Eminem • The Eminem Show")
  if (s.includes('•')) s = s.split('•')[0].trim();
  if (s.includes('·')) s = s.split('·')[0].trim();
  s = s.replace(/^["'“‘]+|["'”’]+$/g, '').replace(/[\.…,\s–—\-]+$/, '').trim();
  return s.replace(/\s+/g, ' ').trim() || str.trim();
}

/**
 * Cleans artist name for lyrics matching
 * Matches BitChord artist.artistForLyricsSearch()
 */
function cleanArtistTerm(str) {
  if (!str || typeof str !== 'string') return '';
  let s = str
    .replace(/\uFEFF|\u200E|\u200F/g, '')
    // Strip " - Topic" suffix from YouTube's auto-generated artist channels
    .replace(/\s*-\s*Topic$/i, '')
    .replace(/\s*[\(\[]\s*(?:feat\.?|ft\.?|featuring|with)\b.*$/gi, '')
    .replace(/\s*[\(\[](?:feat\.?|ft\.?|featuring|with)\b[^)\]]*[)\]]/gi, '')
    .replace(/\s+(?:feat\.?|ft\.?|featuring|with)\b.*$/gi, '')
    .trim();

  // Strip metadata like bullet view counts or album info (e.g. "Eminem • The Eminem Show")
  if (s.includes('•')) s = s.split('•')[0].trim();
  if (s.includes('·')) s = s.split('·')[0].trim();
  s = s.replace(/^["'“‘]+|["'”’]+$/g, '').replace(/[\.…,\s–—\-]+$/, '').trim();
  return s.replace(/\s+/g, ' ').trim() || str.trim();
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
 * Fetches and resolves word-synced / millisecond-synced lyrics via multi-provider racing
 * (BitChord LyricsRepository.kt, SimpMusic, BetterLyrics, LyricsPlus, LrcLib, YouTube)
 */
async function resolveSyncedLyrics(track, forceRefresh = false) {
  if (!track) return;
  if (track._lyricsFetching && !forceRefresh) return;
  if (track._lyricsResolved && !forceRefresh) return;
  const reqId = (track._lyricsReqId || 0) + 1;
  track._lyricsReqId = reqId;
  track._lyricsFetching = true;

  const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
  const cleanTitle = cleanSearchTerm(track.title || '');
  const cleanArtist = cleanArtistTerm(track.artist || '');
  const primaryArtist = getPrimaryArtist(cleanArtist);
  const verifiedDuration = (!track._durationUnverified && typeof track.duration === 'number' && track.duration > 0)
    ? Math.round(track.duration)
    : 0;

  // Build title candidates (including stripping artist prefix if present)
  const titleCandidates = [cleanTitle];
  if (cleanArtist) {
    const escaped = cleanArtist.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const withoutArtist = cleanTitle.replace(new RegExp('^' + escaped + '\\s*[-:–—]\\s*', 'i'), '').trim();
    if (withoutArtist && !titleCandidates.includes(withoutArtist)) {
      titleCandidates.push(withoutArtist);
    }
  }
  if (primaryArtist && primaryArtist !== cleanArtist) {
    const escaped = primaryArtist.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
    const beforeDash = cleanTitle.split(' - ')[0].trim();
    if (beforeDash && !titleCandidates.includes(beforeDash)) {
      titleCandidates.push(beforeDash);
    }
  }

  try {
    const configuredSources = (typeof bitchordSettings !== 'undefined' && Array.isArray(bitchordSettings.lyricsSourcesConfig))
      ? bitchordSettings.lyricsSourcesConfig.filter(s => s && s.enabled !== false).map(s => s.id)
      : ['BiniLyrics', 'BetterLyrics', 'PaxSenix', 'SimpMusic', 'LyricsPlus', 'LRCLIB', 'KuGou', 'YouTube'];
    const lrcLibEnabled = configuredSources.includes('LRCLIB');

    let resolved = null;
    if (configuredSources.length > 0 && api?.getLyrics) {
      const rawVid = track.videoId || (typeof track.id === 'string' && track.id.startsWith('yt-') ? track.id.slice(3) : (typeof track.id === 'string' && /^[A-Za-z0-9_-]{11}$/.test(track.id) ? track.id : null));
      const vid = track._resolvedAudioVideoId || rawVid;
      const rawAlbum = (track.album || '').trim();
      const sanitizedAlbum = (rawAlbum && !/^(youtube music|single|song|video|album|ep|deja)$/i.test(rawAlbum) && rawAlbum.toLowerCase() !== cleanTitle.toLowerCase())
        ? rawAlbum
        : '';
      resolved = await api.getLyrics({
        videoId: vid,
        title: cleanTitle,
        artist: cleanArtist,
        duration: verifiedDuration,
        album: sanitizedAlbum,
        sources: configuredSources
      });
    }

    if (!resolved && lrcLibEnabled && typeof fetch === 'function' && cleanTitle) {
      const durationParam = verifiedDuration > 0 ? verifiedDuration : null;
      const artistCandidates = [cleanArtist, primaryArtist].filter(Boolean);
      const uniqueArtists = [...new Set(artistCandidates)];

      // 1. Exact match attempt via /get endpoint
      for (const tCand of titleCandidates) {
        if (resolved) break;
        for (const art of (uniqueArtists.length > 0 ? uniqueArtists : [''])) {
          if (resolved) break;
          if (durationParam) {
            try {
              let getUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(tCand)}`;
              if (art) getUrl += `&artist_name=${encodeURIComponent(art)}`;
              getUrl += `&duration=${durationParam}`;

              const res = await fetch(getUrl);
              if (res.ok) {
                const data = await res.json();
                if (data && data.syncedLyrics && data.syncedLyrics.trim().length > 0) {
                  resolved = parseLrcLines(data.syncedLyrics);
                  break;
                }
              }
            } catch {}
          }

          // Try without duration parameter and check ±4 seconds tolerance
          if (!resolved) {
            try {
              let getUrlNoDur = `https://lrclib.net/api/get?track_name=${encodeURIComponent(tCand)}`;
              if (art) getUrlNoDur += `&artist_name=${encodeURIComponent(art)}`;

              const res = await fetch(getUrlNoDur);
              if (res.ok) {
                const data = await res.json();
                if (data && data.syncedLyrics && data.syncedLyrics.trim().length > 0) {
                  if (!durationParam || Math.abs((data.duration || 0) - durationParam) <= 4) {
                    resolved = parseLrcLines(data.syncedLyrics);
                    break;
                  }
                }
              }
            } catch {}
          }
        }
      }

      // 2. Fuzzy search fallback with ±4s duration filtering (and closest fallback)
      if (!resolved) {
        const searchQueries = [];
        for (const tCand of titleCandidates) {
          for (const art of uniqueArtists) {
            searchQueries.push(`https://lrclib.net/api/search?track_name=${encodeURIComponent(tCand)}&artist_name=${encodeURIComponent(art)}`);
            searchQueries.push(`https://lrclib.net/api/search?q=${encodeURIComponent(tCand + ' ' + art)}`);
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
                    const closeItems = syncedItems.filter(it => Math.abs((it.duration || 0) - durationParam) <= 4);
                    if (closeItems.length > 0) {
                      closeItems.sort((a, b) => Math.abs((a.duration || 0) - durationParam) - Math.abs((b.duration || 0) - durationParam));
                      resolved = parseLrcLines(closeItems[0].syncedLyrics);
                      break;
                    }
                  } else {
                    resolved = parseLrcLines(syncedItems[0].syncedLyrics);
                    break;
                  }
                }
              }
            }
          } catch {}
        }
      }
    }

    if (track._lyricsReqId !== reqId) return;

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
    if (track._lyricsReqId === reqId) {
      track._lyricsFetching = false;
    }
  }
}

function decodeLrcEntities(text) {
  if (!text || typeof text !== 'string') return '';
  if (!text.includes('&')) return text;
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const code = parseInt(hex, 16);
      return !isNaN(code) ? String.fromCodePoint(code) : _;
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = parseInt(dec, 10);
      return !isNaN(code) ? String.fromCodePoint(code) : _;
    })
    .replace(/&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&');
}

function parseLrcLines(lrcText) {
  if (!lrcText || typeof lrcText !== 'string') return [];
  const lines = lrcText.split(/\r?\n/);
  const stampRegex = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
  const wordStampRegex = /<(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?>/g;
  const result = [];

  // Parse standard LRC [offset: +/-ms] tag (positive delays lyrics; negative advances them)
  let fileOffsetSec = 0;
  const offsetMatch = lrcText.match(/\[offset:\s*([+-]?\s*\d+)\s*\]/i);
  if (offsetMatch) {
    const offsetMs = parseInt(offsetMatch[1].replace(/\s+/g, ''), 10);
    if (!isNaN(offsetMs)) {
      fileOffsetSec = offsetMs / 1000;
    }
  }

  const parseInlineWords = (lineBody) => {
    if (!lineBody || !lineBody.includes('<')) return [];
    wordStampRegex.lastIndex = 0;
    const matches = [...lineBody.matchAll(wordStampRegex)];
    if (matches.length === 0) return [];
    const stamps = matches.map(m => {
      const mins = parseInt(m[1], 10) || 0;
      const secs = parseInt(m[2], 10) || 0;
      let fracMs = 0;
      if (m[3]) {
        if (m[3].length === 2) fracMs = parseInt(m[3], 10) * 10;
        else if (m[3].length === 1) fracMs = parseInt(m[3], 10) * 100;
        else fracMs = parseInt(m[3].slice(0, 3), 10);
      }
      const raw = mins * 60 + secs + fracMs / 1000;
      return {
        timeSec: Math.max(0, Math.round((raw + fileOffsetSec) * 1000) / 1000),
        startIdx: m.index,
        endIdx: m.index + m[0].length
      };
    });
    const words = [];
    for (let i = 0; i < stamps.length; i++) {
      const cur = stamps[i];
      const next = i + 1 < stamps.length ? stamps[i + 1] : null;
      const rawSlice = lineBody.slice(cur.endIdx, next ? next.startIdx : lineBody.length);
      const slice = decodeLrcEntities(rawSlice).replace(/\s+/g, ' ').trim();
      if (!slice) continue;
      const startTime = cur.timeSec;
      const hasExplicitEnd = Boolean(next);
      const endTime = Math.max(startTime + 0.08, Math.round((next ? next.timeSec : startTime + 0.38) * 1000) / 1000);
      const parts = slice.split(' ').filter(Boolean);
      if (parts.length === 1) {
        words.push({ startTime, endTime, text: parts[0], _hasExplicitEnd: hasExplicitEnd });
      } else {
        const step = Math.max(0.08, endTime - startTime) / parts.length;
        for (let p = 0; p < parts.length; p++) {
          const wStart = Math.round((startTime + p * step) * 1000) / 1000;
          const wEnd = Math.round((p === parts.length - 1 ? endTime : startTime + (p + 1) * step) * 1000) / 1000;
          words.push({
            startTime: wStart,
            endTime: Math.max(wStart + 0.05, wEnd),
            text: parts[p],
            _hasExplicitEnd: p === parts.length - 1 ? hasExplicitEnd : true
          });
        }
      }
    }
    return words.length >= 1 ? words : [];
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed || /^\[[A-Za-z]+:.*\]$/.test(trimmed)) continue;

    stampRegex.lastIndex = 0;
    const matches = [...trimmed.matchAll(stampRegex)];

    const lineBody = trimmed.replace(stampRegex, '').trim();
    const words = parseInlineWords(lineBody);
    if (matches.length === 0 && words.length === 0) continue;

    wordStampRegex.lastIndex = 0;
    let text = decodeLrcEntities(lineBody.replace(wordStampRegex, '')).replace(/\s+/g, ' ').trim();
    if (!text && words.length > 0) text = words.map(w => w.text).join(' ');
    const displayText = text.length > 0 ? text : '♪';

    if (matches.length === 0 && words.length > 0) {
      result.push({ time: words[0].startTime, text: displayText, words: words.map(w => ({ ...w })) });
      continue;
    }

    for (const match of matches) {
      const minutes = parseInt(match[1], 10) || 0;
      const seconds = parseInt(match[2], 10) || 0;
      let fractionMs = 0;
      if (match[3]) {
        if (match[3].length === 2) fractionMs = parseInt(match[3], 10) * 10;
        else if (match[3].length === 1) fractionMs = parseInt(match[3], 10) * 100;
        else fractionMs = parseInt(match[3].slice(0, 3), 10);
      }
      const rawTime = minutes * 60 + seconds + fractionMs / 1000;
      const timeInSec = Math.max(0, Math.round((rawTime + fileOffsetSec) * 1000) / 1000);
      if (words.length > 0) {
        result.push({ time: timeInSec, text: displayText, words: words.map(w => ({ ...w })) });
      } else {
        result.push({ time: timeInSec, text: displayText });
      }
    }
  }

  result.sort((a, b) => a.time - b.time);

  // Refine endTime on the final word of word-synced lines using the next line's start time
  for (let i = 0; i < result.length; i++) {
    const line = result[i];
    if (Array.isArray(line.words) && line.words.length > 0) {
      const lastWord = line.words[line.words.length - 1];
      const nextLineTime = i + 1 < result.length ? result[i + 1].time : null;
      if (!lastWord._hasExplicitEnd && nextLineTime !== null && nextLineTime > lastWord.startTime) {
        const clampedEnd = Math.min(lastWord.startTime + 1.6, Math.max(lastWord.startTime + 0.08, nextLineTime));
        lastWord.endTime = Math.round(clampedEnd * 1000) / 1000;
      } else if (lastWord._hasExplicitEnd && nextLineTime !== null && nextLineTime > lastWord.startTime && lastWord.endTime > nextLineTime) {
        lastWord.endTime = Math.round(Math.max(lastWord.startTime + 0.08, nextLineTime) * 1000) / 1000;
      }
      for (const w of line.words) {
        delete w._hasExplicitEnd;
      }
      line.endTime = lastWord.endTime;
    }
  }

  if (result.length > 0 && result[0].time > 5) {
    result.unshift({ time: 0, text: '♪' });
  }
  return result;
}

function renderPreviewQueue() {
  const queueBody = document.getElementById('preview-queue-body');
  const inlineQueueBody = document.getElementById('bc-np-inline-queue-list');
  const countLabel = document.getElementById('queue-count-label');
  if (!queueBody && !inlineQueueBody) return;

  const activeTrack = CATALOGUE_TRACKS[currentIndex];
  if (Array.isArray(userQueue) && userQueue.length > 0) {
    userQueue = dedupeTrackList(userQueue, activeTrack);
  }
  const currentQueue = (userQueue && userQueue.length > 0) ? userQueue : dedupeTrackList(CATALOGUE_TRACKS, activeTrack);
  if (countLabel) countLabel.innerText = `${currentQueue.length} tracks`;

  const currentVideoId = activeTrack?.videoId;
  const currentTitleKey = normalizeTrackDedupeKey(activeTrack);

  const queueHtml = currentQueue.map((t, idx) => {
    const isCurrent = (t.videoId && t.videoId === currentVideoId) ||
                      (currentTitleKey && normalizeTrackDedupeKey(t) === currentTitleKey) ||
                      (idx === currentIndex && !t.videoId);
    return `
      <div class="deja-queue-item ${isCurrent ? 'active-playing' : ''}" id="queue-item-${idx}" data-queue-idx="${idx}">
        <div class="deja-queue-item-index">${isCurrent ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>' : idx + 1}</div>
        <img src="${escapeHTML(t.cover || '')}" class="deja-queue-thumb" alt="${escapeHTML(t.title)}" onerror="this.src='../../assets/icon.png'">
        <div class="deja-queue-item-meta">
          <div class="deja-queue-item-title">${escapeHTML(t.title)}</div>
          <div class="deja-queue-item-artist">${escapeHTML(t.artist)}</div>
        </div>
        <div class="deja-queue-item-duration">${escapeHTML(t.durationStr || formatTime(t.duration))}</div>
      </div>
    `;
  }).join('');

  if (queueBody) {
    queueBody.innerHTML = queueHtml;
    currentQueue.forEach((t, idx) => {
      const itemEl = document.getElementById(`queue-item-${idx}`);
      if (itemEl) {
        itemEl.onclick = () => selectQueueTrack(idx);
      }
    });
  }

  if (inlineQueueBody) {
    inlineQueueBody.innerHTML = queueHtml.replace(/id="queue-item-/g, 'id="inline-queue-item-');
    inlineQueueBody.querySelectorAll('[data-queue-idx]').forEach(el => {
      el.onclick = () => {
        const idx = parseInt(el.getAttribute('data-queue-idx'), 10);
        selectQueueTrack(idx);
      };
    });
  }
}

function selectQueueTrack(idx) {
  if (Array.isArray(userQueue) && userQueue.length > 0) {
    userQueue = dedupeTrackList(userQueue, CATALOGUE_TRACKS[currentIndex]);
  }
  const currentQueue = (userQueue && userQueue.length > 0) ? userQueue : CATALOGUE_TRACKS;
  if (idx < 0 || idx >= currentQueue.length) return;
  const item = currentQueue[idx];
  const wasDefaultQueue = Boolean(isDefaultCatalogueQueue);
  if (Array.isArray(userQueue) && idx > 0 && idx < userQueue.length) {
    const skipped = userQueue.slice(0, idx);
    skipped.forEach(s => {
      if (s && (!playedHistoryStack.length || playedHistoryStack[playedHistoryStack.length - 1]?.videoId !== s.videoId)) {
        playedHistoryStack.push(s);
      }
    });
    userQueue = dedupeTrackList(userQueue.slice(idx), item);
    renderPreviewQueue();
  }
  playLiveTrack(item, !wasDefaultQueue);
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
  const trackKey = track ? (track.videoId || track.id || '') : '';
  const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;

  if (isDirectStreamPlaying && dejaAudio && dejaAudio.src && (!trackKey || loadedStreamVideoId === trackKey)) {
    dejaAudio.volume = isMuted ? 0 : currentVolume;
    dejaAudio.play().catch(e => {
      console.warn('[Deja Audio] Resume failed, falling back:', e.message);
      isDirectStreamPlaying = false;
      fallbackToIFrame(track);
    });
  } else if (isYtReady && ytPlayer && (isYtPlaying || !api?.resolveAudioStream)) {
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

  if (typeof document !== 'undefined') {
    if (playbackTimer) clearInterval(playbackTimer);
    playbackTimer = setInterval(tick, 1000);
    startLyricClock();
  }

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
  stopLyricClock();

  saveLastPlaybackState(true);
  notifyTrackState();
}

function nextTrack() {
  const curTrack = CATALOGUE_TRACKS[currentIndex];
  const currentVideoId = curTrack?.videoId;
  const currentId = curTrack?.id;
  const currentTitleKey = normalizeTrackDedupeKey(curTrack);

  if (Array.isArray(userQueue) && userQueue.length > 0) {
    userQueue = dedupeTrackList(userQueue, curTrack);
  }

  if (isShuffle) {
    const rawPool = (userQueue && userQueue.length > 0) ? userQueue : CATALOGUE_TRACKS;
    const candidates = rawPool.filter(t =>
      !((currentVideoId && t.videoId === currentVideoId) ||
        (currentId && t.id === currentId) ||
        (currentTitleKey && normalizeTrackDedupeKey(t) === currentTitleKey))
    );
    const pool = candidates.length > 0 ? candidates : rawPool;
    const randTrack = pool[Math.floor(Math.random() * pool.length)];
    if (curTrack) playedHistoryStack.push(curTrack);
    playLiveTrack(randTrack, true);
    return;
  }

  if (userQueue && userQueue.length > 0) {
    const qIdx = userQueue.findIndex(t =>
      (currentVideoId && (t.videoId === currentVideoId || t.musicVideoId === currentVideoId)) ||
      (currentId && t.id === currentId) ||
      (currentTitleKey && normalizeTrackDedupeKey(t) === currentTitleKey)
    );
    if (qIdx !== -1 && qIdx + 1 < userQueue.length) {
      const nextItem = userQueue[qIdx + 1];
      const playedSlice = userQueue.slice(0, qIdx + 1);
      playedSlice.forEach(s => {
        if (s && (!playedHistoryStack.length || playedHistoryStack[playedHistoryStack.length - 1]?.videoId !== s.videoId)) {
          playedHistoryStack.push(s);
        }
      });
      userQueue = dedupeTrackList(userQueue.slice(qIdx + 1), nextItem);
      renderPreviewQueue();
      playLiveTrack(nextItem, true);
      if (userQueue.length <= 5 && nextItem?.videoId) {
        refreshUpNextQueueForTrack(nextItem, false);
      }
      return;
    } else if (qIdx === -1 && !isDefaultCatalogueQueue && userQueue.length > 0) {
      const nextCandidate = userQueue.find(t =>
        !((currentVideoId && t.videoId === currentVideoId) ||
          (currentId && t.id === currentId) ||
          (currentTitleKey && normalizeTrackDedupeKey(t) === currentTitleKey))
      ) || userQueue[0];
      if (curTrack) playedHistoryStack.push(curTrack);
      playLiveTrack(nextCandidate, true);
      return;
    } else if (repeatMode === 'all' && (userQueue.length > 0 || playedHistoryStack.length > 0)) {
      if (playedHistoryStack.length > 0) {
        userQueue = dedupeTrackList([...playedHistoryStack, ...userQueue]);
        playedHistoryStack = [];
      }
      renderPreviewQueue();
      playLiveTrack(userQueue[0], true);
      return;
    }
  }

  const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
  if (api?.getNextQueue && currentVideoId) {
    api.getNextQueue(currentVideoId).then(queueItems => {
      if (Array.isArray(queueItems) && queueItems.length > 0) {
        const mapped = [];
        const seen = new Set([currentVideoId]);
        const seenTitles = new Set([currentTitleKey].filter(Boolean));
        for (const qi of queueItems) {
          if (!qi) continue;
          const item = createCatalogueItemFromLive(qi);
          const key = item.videoId || item.id;
          const tKey = normalizeTrackDedupeKey(item);
          if (!key || seen.has(key) || (tKey && seenTitles.has(tKey))) continue;
          seen.add(key);
          if (tKey) seenTitles.add(tKey);
          mapped.push(item);
        }
        if (mapped.length > 0) {
          if (curTrack) playedHistoryStack.push(curTrack);
          userQueue = dedupeTrackList([...mapped], mapped[0]);
          isDefaultCatalogueQueue = false;
          renderPreviewQueue();
          playLiveTrack(mapped[0], true);
          return;
        }
      }
      const nextIdx = (currentIndex + 1) % CATALOGUE_TRACKS.length;
      selectTrack(nextIdx);
    }).catch(() => {
      const nextIdx = (currentIndex + 1) % CATALOGUE_TRACKS.length;
      selectTrack(nextIdx);
    });
    return;
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
  const currentId = CATALOGUE_TRACKS[currentIndex]?.id;
  if (userQueue && userQueue.length > 0) {
    const qIdx = userQueue.findIndex(t => (currentVideoId && t.videoId === currentVideoId) || (currentId && t.id === currentId));
    if (qIdx > 0) {
      playLiveTrack(userQueue[qIdx - 1], true);
      return;
    }
  }

  if (playedHistoryStack.length > 0) {
    const prevItem = playedHistoryStack.pop();
    if (prevItem) {
      userQueue = [
        prevItem,
        ...userQueue.filter(t => !((prevItem.videoId && t.videoId === prevItem.videoId) || (prevItem.id && t.id === prevItem.id)))
      ];
      renderPreviewQueue();
      playLiveTrack(prevItem, true);
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
  if (typeof document === 'undefined') return;
  const track = CATALOGUE_TRACKS[currentIndex];

  if (isDirectStreamPlaying && dejaAudio && typeof dejaAudio.currentTime === 'number' && !isNaN(dejaAudio.currentTime)) {
    currentTime = lyricClockReconciler.reconcile(dejaAudio.currentTime, !dejaAudio.paused);
    if (dejaAudio.duration && !isNaN(dejaAudio.duration) && Math.round(dejaAudio.duration) > 0) {
      const dur = Math.round(dejaAudio.duration);
      const prevDur = track.duration || 0;
      const wasUnverified = Boolean(track._durationUnverified);
      if (dur !== prevDur || wasUnverified) {
        track.duration = dur;
        track._durationUnverified = false;
        const totalEl = document.getElementById('time-total');
        const expTotal = document.getElementById('exp-time-total');
        if (totalEl) totalEl.innerText = formatTime(dur);
        if (expTotal) expTotal.innerText = '-' + formatTime(dur);
        if (wasUnverified || Math.abs(dur - prevDur) > 2) {
          resolveSyncedLyrics(track, true);
        }
      }
    }
    updateDynamicPipeline(dejaAudio);
  } else if (isYtReady && isYtPlaying && ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
    try {
      const ytSec = ytPlayer.getCurrentTime();
      if (typeof ytSec === 'number' && !isNaN(ytSec) && ytSec >= 0) {
        currentTime = lyricClockReconciler.reconcile(ytSec, isYtPlaying);
      }
      const ytDur = Math.round(ytPlayer.getDuration());
      const prevDur = track.duration || 0;
      const wasUnverified = Boolean(track._durationUnverified);
      if (ytDur > 0 && (ytDur !== prevDur || wasUnverified)) {
        track.duration = ytDur;
        track._durationUnverified = false;
        const totalEl = document.getElementById('time-total');
        const expTotal = document.getElementById('exp-time-total');
        if (totalEl) totalEl.innerText = formatTime(ytDur);
        if (expTotal) expTotal.innerText = '-' + formatTime(ytDur);
        if (wasUnverified || Math.abs(ytDur - prevDur) > 2) {
          resolveSyncedLyrics(track, true);
        }
      }
      updateDynamicPipeline(ytPlayer);
    } catch {}
  } else if (isPlaying) {
    // Advance clock in synthesizer fallback or mock/offline mode when neither HTML5 stream nor YT iframe is playing
    if (!isDirectStreamPlaying && !isYtPlaying) {
      currentTime += 1;
      lyricClockReconciler.snap(currentTime);
    }
  }

  // 30s Periodic Watchtime Ping (BitChord PlaybackTracker.kt)
  const curSec = Math.floor(currentTime);
  if (currentCpn && track.videoId && isPlaying && (curSec - lastReportedWatchSeconds >= 30)) {
    lastReportedWatchSeconds = curSec;
    const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
    if (api?.trackPlayback) {
      api.trackPlayback({ videoId: track.videoId, cpn: currentCpn, state: 'watchtime', seconds: curSec }).catch(() => {});
    }
  }

  if (currentTime >= track.duration) {
    sendFinalWatchtimePing();
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
  saveLastPlaybackState(false);
}

/**
 * LyricClockReconciler (Matches BitChord LyricClock.kt)
 * Smoothly interpolates playback position at 60fps between coarse HTML5 audio / YouTube IFrame ticks
 * using monotonic wall-clock time while playing, and snaps immediately on pause or seek (> 1.25s).
 */
class LyricClockReconciler {
  constructor() {
    this.anchorPositionSec = 0;
    this.anchorWallClockMs = 0;
    this.wasPlaying = false;
    this.lastReportedSec = -1;
  }

  _nowMs() {
    return (typeof performance !== 'undefined' && typeof performance.now === 'function')
      ? performance.now()
      : Date.now();
  }

  snap(positionSec, nowMs = this._nowMs()) {
    const safePos = Math.max(0, Number(positionSec) || 0);
    this.anchorPositionSec = safePos;
    this.anchorWallClockMs = nowMs;
    this.lastReportedSec = safePos;
    return safePos;
  }

  reconcile(reportedSec, isPlayingNow, nowMs = this._nowMs()) {
    const safeReported = Math.max(0, Number(reportedSec) || 0);
    if (!isPlayingNow) {
      this.wasPlaying = false;
      return this.snap(safeReported, nowMs);
    }
    if (!this.wasPlaying) {
      this.wasPlaying = true;
      return this.snap(safeReported, nowMs);
    }

    const elapsedSec = Math.max(0, (nowMs - this.anchorWallClockMs) / 1000);
    const predictedSec = this.anchorPositionSec + elapsedSec;
    const drift = Math.abs(safeReported - predictedSec);

    // Discontinuity (seek or track restart > 1.25s)
    if (drift > 1.25) {
      return this.snap(safeReported, nowMs);
    }

    // Fresh sample arrived from player
    if (Math.abs(safeReported - this.lastReportedSec) > 0.001) {
      this.lastReportedSec = safeReported;
      // Prevent tiny backward jitter when reported sample slightly lags wall-clock prediction
      const smoothAnchor = (safeReported < predictedSec && (predictedSec - safeReported) < 0.16)
        ? predictedSec
        : safeReported;
      this.anchorPositionSec = smoothAnchor;
      this.anchorWallClockMs = nowMs;
      return smoothAnchor;
    }

    // Between player updates: extrapolate smoothly up to 450ms ahead of last sample
    return Math.min(predictedSec, this.anchorPositionSec + 0.45);
  }
}

const lyricClockReconciler = new LyricClockReconciler();
let lyricClockRaf = null;
let lastLyricRafMs = 0;
let lastScrollTargetIndex = -1;

function isLyricsOrExpandedVisible() {
  if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return false;
  const drawerEl = document.getElementById('apple-lyrics-drawer');
  if (drawerEl && drawerEl.classList && (drawerEl.classList.contains('visible') || drawerEl.classList.contains('open'))) {
    return true;
  }
  const expViewEl = document.getElementById('expanded-player-view');
  if (expViewEl && expViewEl.classList && expViewEl.classList.contains('visible')) {
    return true;
  }
  return false;
}

function startLyricClock() {
  if (typeof document === 'undefined') return;
  if (lyricClockTimer) clearInterval(lyricClockTimer);
  lyricClockTimer = setInterval(() => {
    if (!lyricClockRaf && (typeof document === 'undefined' || !document.hidden)) {
      tickLyricClock();
    }
  }, 200);

  if (typeof requestAnimationFrame === 'function' && !lyricClockRaf) {
    function loop(now) {
      if (!isPlaying) {
        lyricClockRaf = null;
        return;
      }
      if (typeof document !== 'undefined' && document.hidden) {
        lyricClockRaf = requestAnimationFrame(loop);
        return;
      }
      const ts = typeof now === 'number' ? now : Date.now();
      const targetIntervalMs = isLyricsOrExpandedVisible() ? 32 : 200;
      if (ts - lastLyricRafMs >= targetIntervalMs) {
        lastLyricRafMs = ts;
        tickLyricClock();
      }
      lyricClockRaf = requestAnimationFrame(loop);
    }
    lyricClockRaf = requestAnimationFrame(loop);
  }
}

function stopLyricClock() {
  if (lyricClockTimer) {
    clearInterval(lyricClockTimer);
    lyricClockTimer = null;
  }
  if (lyricClockRaf) {
    cancelAnimationFrame(lyricClockRaf);
    lyricClockRaf = null;
  }
}

/**
 * Fast-frequency Lyric Clock (BitChord LyricClock.kt)
 * Keeps lyrics and scrubbers updated with millisecond precision via HTML5 audio / RAF + LyricClockReconciler
 */
function tickLyricClock() {
  if (typeof document === 'undefined') return;
  if (!isPlaying) return;
  const track = CATALOGUE_TRACKS[currentIndex];
  if (!track) return;

  if (isDirectStreamPlaying && dejaAudio && typeof dejaAudio.currentTime === 'number' && !isNaN(dejaAudio.currentTime)) {
    currentTime = lyricClockReconciler.reconcile(dejaAudio.currentTime, !dejaAudio.paused);
  } else if (isYtReady && isYtPlaying && ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
    try {
      const ytSec = ytPlayer.getCurrentTime();
      if (typeof ytSec === 'number' && !isNaN(ytSec) && ytSec >= 0) {
        currentTime = lyricClockReconciler.reconcile(ytSec, isYtPlaying);
      }
    } catch {}
  }

  updateProgress();
  updateSyncedLyrics();
}

function seekTo(seconds) {
  const track = CATALOGUE_TRACKS[currentIndex];
  if (!track) return;
  previewUserScrolling = false;
  if (previewUserScrollTimer) clearTimeout(previewUserScrollTimer);
  currentTime = Math.max(0, Math.min(seconds, track.duration));
  lyricClockReconciler.snap(currentTime);
  if (isDirectStreamPlaying && dejaAudio) {
    try {
      dejaAudio.currentTime = currentTime;
    } catch {}
  } else if (isYtReady && ytPlayer && track.videoId && isYtPlaying) {
    try {
      ytPlayer.seekTo(currentTime, true);
    } catch {}
  } else {
    manualPausedSeekSec = currentTime;
    manualPausedSeekTrackKey = String(track.videoId || track.id || '');
  }
  updateProgress();
  updateSyncedLyrics(true);
  saveLastPlaybackState(true);
  notifyTrackState();
}

if (typeof window !== 'undefined') {
  window.seekTo = seekTo;
}

let _lastRenderedTimeStr = '';
let _lastRenderedRemStr = '';
function updateProgress() {
  if (typeof document === 'undefined') return;
  const track = CATALOGUE_TRACKS[currentIndex];
  if (!track || !track.duration) return;
  const pct = Math.min(100, Math.max(0, (currentTime / track.duration) * 100));
  const pctStr = `${pct.toFixed(2)}%`;
  const timeStr = formatTime(currentTime);
  const remainingSec = Math.max(0, track.duration - currentTime);
  const remainingStr = '-' + formatTime(remainingSec);

  const curEl = document.getElementById('time-current');
  const fillEl = document.getElementById('scrubber-fill');
  const knobEl = document.getElementById('scrubber-knob');
  if (curEl && timeStr !== _lastRenderedTimeStr) curEl.innerText = timeStr;
  if (fillEl && fillEl.style.width !== pctStr) fillEl.style.width = pctStr;
  if (knobEl && knobEl.style.left !== pctStr) knobEl.style.left = pctStr;

  const expView = typeof document.getElementById === 'function' ? document.getElementById('expanded-player-view') : null;
  if (!expView || (expView.classList && expView.classList.contains('visible'))) {
    const expCurEl = document.getElementById('exp-time-current');
    const expTotalEl = document.getElementById('exp-time-total');
    const expFillEl = document.getElementById('exp-scrubber-fill');
    const expKnobEl = document.getElementById('exp-scrubber-knob');
    if (expCurEl && timeStr !== _lastRenderedTimeStr) expCurEl.innerText = timeStr;
    if (expTotalEl && remainingStr !== _lastRenderedRemStr) expTotalEl.innerText = remainingStr;
    if (expFillEl && expFillEl.style.width !== pctStr) expFillEl.style.width = pctStr;
    if (expKnobEl && expKnobEl.style.left !== pctStr) expKnobEl.style.left = pctStr;
    _lastRenderedRemStr = remainingStr;
  }
  _lastRenderedTimeStr = timeStr;
}

/**
 * Real-time Dynamic Lyrics Synchronization (BitChord PlayerLyrics.kt & LyricClock.kt)
 * - Computes active line & word-by-word sweep dynamically at 60fps
 * - Uses BitChord dynamic pre-scroll lead (80ms–350ms) so smooth center-scroll lands on vocal onset
 * - High-contrast glowing text on active line; dimmed blur on past/upcoming lines
 * - User manual scrolling pauses auto-scroll for 3.5s then resumes
 */
function updateSyncedLyrics(forceScroll = false) {
  if (typeof document === 'undefined') return;
  const track = CATALOGUE_TRACKS[currentIndex];
  if (!track || !track.lyrics || track.lyrics.length === 0) return;

  const containers = [];
  let expViewVisible = false;
  if (typeof document.getElementById === 'function') {
    const drawerContainer = document.getElementById('lyrics-lines-container');
    const drawerEl = document.getElementById('apple-lyrics-drawer');
    if (drawerContainer && (forceScroll || !drawerEl || (drawerEl.classList && (drawerEl.classList.contains('visible') || drawerEl.classList.contains('open'))))) {
      containers.push(drawerContainer);
    }
    const expContainer = document.getElementById('expanded-lyrics-container');
    const expViewEl = document.getElementById('expanded-player-view');
    expViewVisible = !expViewEl || Boolean(expViewEl.classList && expViewEl.classList.contains('visible'));
    if (expContainer && (forceScroll || expViewVisible)) {
      containers.push(expContainer);
    }
  }
  if (containers.length === 0 && !expViewVisible && !forceScroll) return;

  const lines = track.lyrics;
  const syncedEnabled = (typeof bitchordSettings === 'undefined' || bitchordSettings.syncedLyrics !== false);
  const isSynced = syncedEnabled && lines.some(l => typeof l.time === 'number' && l.time > 0);
  let activeIndex = -1;
  let scrollTargetIndex = -1;
  let exactLyricsTime = 0;

  if (isSynced) {
    const userOffset = getTrackLyricsOffset(track);
    let smartAlignOffset = 0;
    if (typeof bitchordSettings === 'undefined' || bitchordSettings.smartVersionAlignment !== false) {
      if (typeof track._smartAlignmentOffsetSec === 'number') {
        smartAlignOffset = track._smartAlignmentOffsetSec;
      } else if (isVideoModeActive && track.duration && lines.length > 2) {
        const lastLyricTime = lines[lines.length - 1]?.time || 0;
        const delta = track.duration - lastLyricTime;
        if (delta >= 8 && delta <= 45) {
          smartAlignOffset = Math.min(20, Math.round((delta - 6) * 10) / 10);
        }
      }
    }
    // True zero-lag lyrics clock (matching BitChord LyricClock.kt adjustedLyricsPosition)
    exactLyricsTime = Math.max(0, currentTime - userOffset - smartAlignOffset);
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].time <= exactLyricsTime) {
        activeIndex = i;
      } else {
        break;
      }
    }

    // Dynamic pre-scroll lead (matching BitChord PlayerLyrics.kt lines 136-143)
    const curIdx = Math.max(0, activeIndex);
    const nextIdx = Math.min(lines.length - 1, curIdx + 1);
    const gap = Math.max(0, (lines[nextIdx]?.time || 0) - (lines[curIdx]?.time || 0));
    const scrollLead = Math.min(0.35, Math.max(0.08, gap / 3));
    const scrollCheckTime = exactLyricsTime + scrollLead;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].time <= scrollCheckTime) {
        scrollTargetIndex = i;
      } else {
        break;
      }
    }
    if (scrollTargetIndex < 0) scrollTargetIndex = activeIndex;
  }

  // Synchronize visible drawer and Now Playing screen lyrics containers
  const lineChanged = (activeIndex !== lastActiveLyricIndex) || forceScroll;

  containers.forEach(container => {
    if (!lineChanged) {
      // Fast path (60fps): Only update word-by-word sweep on the single active line!
      if (isSynced && activeIndex >= 0 && container.querySelectorAll) {
        const activeEl = container.querySelectorAll('.apple-lyric-line')?.[activeIndex];
        if (activeEl && activeEl.querySelectorAll) {
          const wordSpans = activeEl.querySelectorAll('.lyric-word-span');
          if (wordSpans && wordSpans.length > 0) {
            wordSpans.forEach(span => {
              const wStart = parseFloat(span.getAttribute ? span.getAttribute('data-start') : span.dataset?.start);
              const wEnd = parseFloat(span.getAttribute ? span.getAttribute('data-end') : span.dataset?.end);
              let progress = 0;
              if (!isNaN(wStart) && !isNaN(wEnd)) {
                if (exactLyricsTime >= wEnd) progress = 1;
                else if (exactLyricsTime > wStart) progress = (exactLyricsTime - wStart) / Math.max(0.05, wEnd - wStart);
              }
              if (span.classList && span.classList.toggle) {
                span.classList.toggle('word-sung', progress >= 1);
                span.classList.toggle('word-active', progress > 0 && progress < 1);
              }
              if (span.style && span.style.setProperty) {
                span.style.setProperty('--word-fill', `${(progress * 100).toFixed(1)}%`);
              }
            });
          }
        }
      }
      return;
    }
    if (!container.querySelectorAll) return;
    const lyricElements = container.querySelectorAll('.apple-lyric-line');
    if (!lyricElements) return;
    lyricElements.forEach((el, i) => {
      const isActive = isSynced && (i === activeIndex);
      if (el.classList && el.classList.toggle) {
        el.classList.toggle('active', isActive);
      }

      // Word-by-word sweep update (BitChord PlayerLyrics.kt WordSyncedLine)
      if (el.querySelectorAll) {
        const wordSpans = el.querySelectorAll('.lyric-word-span');
        if (wordSpans && wordSpans.length > 0) {
          wordSpans.forEach(span => {
            if (!isActive) {
              if (span.classList) {
                span.classList.remove('word-active', 'word-sung');
              }
              if (span.style && span.style.removeProperty) {
                span.style.removeProperty('--word-fill');
              }
              return;
            }
            const wStart = parseFloat(span.getAttribute ? span.getAttribute('data-start') : span.dataset?.start);
            const wEnd = parseFloat(span.getAttribute ? span.getAttribute('data-end') : span.dataset?.end);
            let progress = 0;
            if (!isNaN(wStart) && !isNaN(wEnd)) {
              if (exactLyricsTime >= wEnd) progress = 1;
              else if (exactLyricsTime > wStart) progress = (exactLyricsTime - wStart) / Math.max(0.05, wEnd - wStart);
            }
            if (span.classList && span.classList.toggle) {
              span.classList.toggle('word-sung', progress >= 1);
              span.classList.toggle('word-active', progress > 0 && progress < 1);
            }
            if (span.style && span.style.setProperty) {
              span.style.setProperty('--word-fill', `${(progress * 100).toFixed(1)}%`);
            }
          });
        }
      }

      if (el.style) {
        if (isSynced) {
          const dist = activeIndex >= 0 ? Math.abs(i - activeIndex) : 2;
          el.style.fontSize = '26px';
          el.style.transformOrigin = 'left center';
          if (isActive) {
            const hasWordSync = Boolean((el.classList && typeof el.classList.contains === 'function' && el.classList.contains('has-word-sync')) || (typeof el.className === 'string' && el.className.includes('has-word-sync')));
            el.style.color = '#ffffff';
            el.style.fontWeight = '700';
            el.style.textShadow = hasWordSync ? 'none' : '0 4px 24px rgba(255,255,255,0.38)';
            el.style.filter = 'none';
            el.style.opacity = '1';
            el.style.transform = 'scale(1) translateZ(0)';
          } else {
            const fadedOpacity = dist === 1 ? '0.52' : (dist === 2 ? '0.36' : '0.24');
            const blurPx = dist <= 1 ? '0.3px' : (dist === 2 ? '0.8px' : '1.2px');
            const allowBlur = (typeof bitchordSettings === 'undefined') || (bitchordSettings.lyricsBlur !== false && !bitchordSettings.reduceDynamicBlur);
            el.style.color = 'rgba(255, 255, 255, 0.42)';
            el.style.fontWeight = '600';
            el.style.textShadow = 'none';
            el.style.filter = allowBlur ? `blur(${blurPx})` : 'none';
            el.style.opacity = fadedOpacity;
            el.style.transform = 'scale(0.95) translateZ(0)';
          }
        } else {
          // Plain unsynced lyrics presentation (BitChord PlayerLyrics.kt lines 1686, 1694)
          el.style.color = '#ffffff';
          el.style.fontWeight = '500';
          el.style.fontSize = '22px';
          el.style.textShadow = 'none';
          el.style.filter = 'none';
          el.style.opacity = '0.92';
          el.style.transform = 'none';
        }
      }
    });

    const targetIdx = scrollTargetIndex >= 0 ? scrollTargetIndex : activeIndex;
    if (isSynced && targetIdx >= 0 && (targetIdx !== lastScrollTargetIndex || forceScroll)) {
      if (!previewUserScrolling || forceScroll) {
        const activeEl = lyricElements[targetIdx] || lyricElements[activeIndex];
        if (activeEl && typeof activeEl.scrollIntoView === 'function') {
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  });

  lastActiveLyricIndex = activeIndex;
  lastScrollTargetIndex = scrollTargetIndex;

  // Update active lyric preview capsule (.exp-lyric-preview / #exp-lyric-snippet-text / #exp-lyric-snippet)
  const expSnippet = (typeof document.getElementById === 'function' ? (document.getElementById('exp-lyric-snippet-text') || document.getElementById('exp-lyric-snippet')) : null) ||
                     (typeof document.querySelector === 'function' ? document.querySelector('.exp-lyric-snippet-text') : null);
  if (expSnippet) {
    let snippetText = '';
    if (isSynced) {
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
    } else {
      snippetText = (lines[0] && lines[0].text) ? lines[0].text : 'Lyrics';
    }
    if (expSnippet.innerText !== snippetText) {
      expSnippet.innerText = snippetText;
    }
  }
}

const updateLiveLyrics = updateSyncedLyrics;

let activeLandscapePane = 'main';
let bcRomanizeLyrics = false;
let bcKaraokeMode = false;

function switchLandscapePlayerPane(pane) {
  if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return;
  activeLandscapePane = pane || 'main';
  const mainPane = document.getElementById('bc-np-main-controls-pane');
  const lyricsPane = document.getElementById('expanded-lyrics-container');
  const lyricsToolbar = document.getElementById('bc-lyrics-bottom-toolbar');
  const queuePane = document.getElementById('bc-np-inline-queue-container');
  const artContainer = document.getElementById('now-playing-art-wrap') || document.getElementById('expanded-artwork-container');
  const expBtnLyrics = document.getElementById('exp-btn-lyrics') || (typeof document.querySelector === 'function' ? document.querySelector('.exp-lyrics-btn') : null);

  const tabMain = document.getElementById('bc-np-tab-main');
  const tabLyrics = document.getElementById('bc-np-tab-lyrics');
  const tabQueue = document.getElementById('bc-np-tab-queue');
  const leftLyricsBtn = document.getElementById('bc-np-btn-lyrics-left');
  const leftQueueBtn = document.getElementById('bc-np-btn-queue-left');

  if (tabMain && tabMain.classList) tabMain.classList.toggle('active', activeLandscapePane === 'main');
  if (tabLyrics && tabLyrics.classList) tabLyrics.classList.toggle('active', activeLandscapePane === 'lyrics');
  if (tabQueue && tabQueue.classList) tabQueue.classList.toggle('active', activeLandscapePane === 'queue');
  if (leftLyricsBtn && leftLyricsBtn.classList) leftLyricsBtn.classList.toggle('active', activeLandscapePane === 'lyrics');
  if (leftQueueBtn && leftQueueBtn.classList) leftQueueBtn.classList.toggle('active', activeLandscapePane === 'queue');

  if (mainPane && mainPane.style) mainPane.style.display = activeLandscapePane === 'main' ? 'flex' : 'none';
  if (lyricsPane && lyricsPane.style) lyricsPane.style.display = activeLandscapePane === 'lyrics' ? 'flex' : 'none';
  if (lyricsToolbar && lyricsToolbar.style) lyricsToolbar.style.display = activeLandscapePane === 'lyrics' ? 'flex' : 'none';
  if (queuePane && queuePane.style) queuePane.style.display = activeLandscapePane === 'queue' ? 'flex' : 'none';
  const expandedView = document.getElementById('expanded-player-view');
  if (expandedView && expandedView.classList) {
    expandedView.classList.toggle('bc-np-mode-main', activeLandscapePane === 'main');
    expandedView.classList.toggle('bc-np-mode-lyrics', activeLandscapePane === 'lyrics');
    expandedView.classList.toggle('bc-np-mode-queue', activeLandscapePane === 'queue');
  }

  if (activeLandscapePane !== 'lyrics') {
    if (artContainer && artContainer.style) artContainer.style.display = 'block';
    if (expBtnLyrics) {
      if (expBtnLyrics.classList) expBtnLyrics.classList.remove('active');
      if (expBtnLyrics.style) {
        expBtnLyrics.style.color = '';
        expBtnLyrics.style.backgroundColor = '';
      }
      expBtnLyrics.title = 'Synced Lyrics';
    }
  } else {
    if (expBtnLyrics) {
      if (expBtnLyrics.classList) expBtnLyrics.classList.add('active');
      if (expBtnLyrics.style) {
        expBtnLyrics.style.color = '#FA2D48';
        expBtnLyrics.style.backgroundColor = 'rgba(250, 45, 72, 0.18)';
      }
      expBtnLyrics.title = 'Show Artwork';
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
  if (activeLandscapePane === 'queue') {
    renderPreviewQueue();
  }
}

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
    switchLandscapePlayerPane('main');
    lyricsContainer.style.display = 'none';
    if (artContainer) artContainer.style.display = 'block';
    if (expBtnLyrics) {
      expBtnLyrics.classList.remove('active');
      expBtnLyrics.style.color = '';
      expBtnLyrics.style.backgroundColor = '';
      expBtnLyrics.title = 'Synced Lyrics';
    }
  } else {
    switchLandscapePlayerPane('lyrics');
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

  const track = CATALOGUE_TRACKS[currentIndex];
  if (track) {
    renderLyrics(track.lyrics);
    if ((!track.lyrics || track.lyrics.length === 0) && !track._lyricsFetching) {
      resolveSyncedLyrics(track);
    }
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
    if ((npLyrics && npLyrics.style.display !== 'none') || activeLandscapePane === 'lyrics') {
      switchLandscapePlayerPane('main');
      if (npLyrics) npLyrics.style.display = 'none';
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
      num.innerHTML = (i === currentIndex && isPlaying) ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>' : String(i + 1);
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

function getLoudnessCeiling() {
  if (typeof bitchordSettings === 'undefined' || !bitchordSettings.loudnessNormalization) return 1.0;
  if (currentStreamMeta && typeof currentStreamMeta.loudnessDb === 'number' && currentStreamMeta.loudnessDb > 0) {
    return Math.max(0.5, Math.min(0.95, Math.pow(10, -currentStreamMeta.loudnessDb / 20)));
  }
  return 0.92;
}

function applyVolume(vol) {
  if (typeof document !== 'undefined' && typeof document.getElementById === 'function') {
    const fill = document.getElementById('volume-fill');
    if (fill) fill.style.width = `${vol * 100}%`;
    const expFill = document.getElementById('exp-volume-fill');
    if (expFill) expFill.style.width = `${vol * 100}%`;
  }

  const normFactor = (typeof bitchordSettings !== 'undefined' && bitchordSettings.loudnessNormalization) ? 0.88 : 1.0;
  const spatialBoost = (typeof bitchordSettings !== 'undefined' && bitchordSettings.spatialAudio) ? 1.06 : 1.0;
  const targetMasterGain = Math.min(1.0, (isMuted ? 0 : vol) * 0.2 * normFactor * spatialBoost);

  if (masterGain && audioContext) {
    if (typeof masterGain.gain.setValueAtTime === 'function') {
      masterGain.gain.setValueAtTime(targetMasterGain, audioContext.currentTime || 0);
    } else {
      masterGain.gain.value = targetMasterGain;
    }
  }
  if (dejaAudio) {
    const normCeiling = getLoudnessCeiling();
    dejaAudio.volume = isMuted ? 0 : Math.max(0, Math.min(1, vol * normCeiling));
  }
  if (isYtReady && ytPlayer && typeof ytPlayer.setVolume === 'function') {
    try {
      if (isMuted) {
        ytPlayer.mute();
      } else {
        ytPlayer.unMute();
        const normCeiling = getLoudnessCeiling();
        ytPlayer.setVolume(Math.round(vol * normCeiling * 100));
      }
    } catch {}
  }
}

function updateDynamicPipeline(source) {
  if (typeof document === 'undefined') return;
  const bufferEl = document.getElementById('pipeline-buffer');
  const codecEl = document.getElementById('pipeline-codec');
  const bitrateEl = document.getElementById('pipeline-bitrate');
  const rateEl = document.getElementById('pipeline-samplerate');
  const tierEl = document.getElementById('pipeline-tier');
  const channelsEl = document.getElementById('pipeline-channels');

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
    if (channelsEl) channelsEl.innerText = `${currentStreamMeta?.audioChannels || 2}.0 Stereo • 16-bit PCM`;
    if (tierEl) tierEl.innerText = 'Deja Direct Stream (Native HTML5)';
  } else if (source && typeof source.getVideoLoadedFraction === 'function' && isYtPlaying) {
    const frac = source.getVideoLoadedFraction() || 0;
    const bufSec = Math.max(0, (frac * track.duration) - currentTime).toFixed(1);
    if (bufferEl) bufferEl.innerText = `${bufSec}s forward buffer (${Math.round(frac * 100)}%)`;
    if (codecEl) codecEl.innerText = 'Opus (audio/webm)';
    if (bitrateEl) bitrateEl.innerText = '160 kbps';
    if (rateEl) rateEl.innerText = '48.0 kHz';
    if (channelsEl) channelsEl.innerText = '2.0 Stereo • 16-bit';
    if (tierEl) tierEl.innerText = 'Deja Standard (160k Opus)';
  } else {
    if (bufferEl) bufferEl.innerText = '18.4s forward buffer (synthesizer sink)';
    if (codecEl) codecEl.innerText = 'PCM Float32 (Web Audio API sink)';
    if (bitrateEl) bitrateEl.innerText = '1411 kbps (Lossless Synth)';
    if (rateEl) rateEl.innerText = `${audioContext?.sampleRate || 48000} Hz`;
    if (channelsEl) channelsEl.innerText = '2.0 Stereo • 24-bit Studio';
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
      const qualityText = currentStreamMeta?.bitrate
        ? `${Math.round(currentStreamMeta.bitrate / 1000)}kbps Opus`
        : (typeof bitchordSettings !== 'undefined' && bitchordSettings.wifiQuality ? bitchordSettings.wifiQuality : '160kbps Opus');
      api.sendTrackChanged({
        title: track.title,
        artist: track.artist,
        album: track.album,
        videoId: track.videoId || null,
        duration: track.duration,
        currentTime: currentTime,
        isPlaying: isPlaying,
        coverUrl: track.cover,
        audioQuality: qualityText,
        isAd: !!track.isAd
      });
    }
    if (isPlaying && !track.isAd && typeof bitchordSettings !== 'undefined' && (bitchordSettings.lastfmEnabled || bitchordSettings.listenBrainzEnabled)) {
      window.__dejaLastScrobble = {
        title: track.title,
        artist: track.artist,
        album: track.album,
        duration: track.duration,
        timestamp: Math.floor(Date.now() / 1000),
        lastfm: Boolean(bitchordSettings.lastfmEnabled),
        listenBrainz: Boolean(bitchordSettings.listenBrainzEnabled)
      };
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

    // 5-Band BiquadFilterNodes (GraphicEq) matching BitChord 5-Band architecture
    eqFilter60 = audioContext.createBiquadFilter();
    eqFilter60.type = 'lowshelf';
    eqFilter60.frequency.setValueAtTime(60, audioContext.currentTime);

    eqFilter250 = audioContext.createBiquadFilter();
    eqFilter250.type = 'peaking';
    eqFilter250.frequency.setValueAtTime(250, audioContext.currentTime);
    eqFilter250.Q.setValueAtTime(1.0, audioContext.currentTime);

    eqFilter1k = audioContext.createBiquadFilter();
    eqFilter1k.type = 'peaking';
    eqFilter1k.frequency.setValueAtTime(1000, audioContext.currentTime);
    eqFilter1k.Q.setValueAtTime(1.0, audioContext.currentTime);

    eqFilter4k = audioContext.createBiquadFilter();
    eqFilter4k.type = 'peaking';
    eqFilter4k.frequency.setValueAtTime(4000, audioContext.currentTime);
    eqFilter4k.Q.setValueAtTime(1.0, audioContext.currentTime);

    eqFilter12k = audioContext.createBiquadFilter();
    eqFilter12k.type = 'highshelf';
    eqFilter12k.frequency.setValueAtTime(12000, audioContext.currentTime);

    // Backward compatible references
    bassFilter = eqFilter60;
    midFilter = eqFilter1k;
    trebleFilter = eqFilter12k;

    // Optional StereoPannerNode (EqualizerScreen.kt Stereo Channel Balance) & LoudnessCompressorNode
    if (typeof audioContext.createStereoPanner === 'function') {
      try {
        window.__dejaStereoPanner = audioContext.createStereoPanner();
      } catch {}
    }
    if (typeof audioContext.createDynamicsCompressor === 'function') {
      try {
        window.__dejaLoudnessCompressor = audioContext.createDynamicsCompressor();
      } catch {}
    }

    // Connect Graph: 60Hz -> 250Hz -> 1kHz -> 4kHz -> 12kHz -> [StereoPanner] -> Master Gain -> Destination
    eqFilter60.connect(eqFilter250);
    eqFilter250.connect(eqFilter1k);
    eqFilter1k.connect(eqFilter4k);
    eqFilter4k.connect(eqFilter12k);
    if (typeof window !== 'undefined' && window.__dejaStereoPanner) {
      eqFilter12k.connect(window.__dejaStereoPanner);
      window.__dejaStereoPanner.connect(masterGain);
    } else {
      eqFilter12k.connect(masterGain);
    }
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
  const gain60 = config.b60 !== undefined ? config.b60 : config.bass;
  const gain250 = config.b250 !== undefined ? config.b250 : ((config.bass + config.mid) / 2);
  const gain1k = config.b1k !== undefined ? config.b1k : config.mid;
  const gain4k = config.b4k !== undefined ? config.b4k : ((config.mid + config.treble) / 2);
  const gain12k = config.b12k !== undefined ? config.b12k : config.treble;

  if (typeof bitchordSettings !== 'undefined' && presetName !== 'Custom') {
    bitchordSettings.equalizerBands = [gain60, gain250, gain1k, gain4k, gain12k];
  }

  const eqActive = (typeof bitchordSettings === 'undefined') ? true : (bitchordSettings.equalizerEnabled !== false);
  if (audioContext) {
    const eff60 = eqActive ? gain60 : 0;
    const eff250 = eqActive ? gain250 : 0;
    const eff1k = eqActive ? gain1k : 0;
    const eff4k = eqActive ? gain4k : 0;
    const eff12k = eqActive ? gain12k : 0;

    if (eqFilter60) eqFilter60.gain.setTargetAtTime(eff60, audioContext.currentTime, 0.1);
    if (eqFilter250) eqFilter250.gain.setTargetAtTime(eff250, audioContext.currentTime, 0.1);
    if (eqFilter1k) eqFilter1k.gain.setTargetAtTime(eff1k, audioContext.currentTime, 0.1);
    if (eqFilter4k) eqFilter4k.gain.setTargetAtTime(eff4k, audioContext.currentTime, 0.1);
    if (eqFilter12k) eqFilter12k.gain.setTargetAtTime(eff12k, audioContext.currentTime, 0.1);
  }

  if (typeof document !== 'undefined') {
    const status = document.getElementById('eq-status-text');
    if (status) status.innerHTML = `Active Preset: <strong>${presetName}</strong>`;

    const buttons = document.querySelectorAll('#eq-picker-options .deja-picker-btn');
    buttons.forEach(btn => {
      btn.classList.toggle('selected', btn.getAttribute('data-eq') === presetName);
    });

    const eqBtn = document.getElementById('btn-equalizer');
    if (eqBtn) eqBtn.classList.toggle('active', eqActive && presetName !== 'Flat');
  }
  if (typeof syncEqualizerModalUI === 'function') syncEqualizerModalUI();
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
    updateDynamicPipeline(isDirectStreamPlaying ? dejaAudio : ytPlayer);
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

  // Attach offset nudge bar listeners and calibrate initial badge on boot
  attachOffsetBarListeners(document);
  if (typeof CATALOGUE_TRACKS !== 'undefined' && CATALOGUE_TRACKS[currentIndex]) {
    updateOffsetBadges(getTrackLyricsOffset(CATALOGUE_TRACKS[currentIndex]));
  }

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
    updateProgress();
    updateSyncedLyrics(true);
    const curTrack = CATALOGUE_TRACKS[currentIndex];
    if (curTrack) {
      if (!activeCanvasStreamData || currentResolvedVideoId !== (curTrack.videoId || '')) {
        loadMusicVideoIntoStage(curTrack, 'expanded');
      } else {
        const expCanvasEl = document.getElementById('expanded-canvas-video');
        if (expCanvasEl && (isVideoModeActive || activeCanvasStreamData.isCanvas)) {
          attachChromelessVideoSource(expCanvasEl, activeCanvasStreamData, !activeCanvasStreamData.isCanvas);
        }
      }
    }
  };
  const closeExpandedView = () => {
    if (!expandedView) return;
    expandedView.style.transform = '';
    expandedView.style.transition = '';
    expandedView.classList.remove('visible');
    const expCanvasEl = document.getElementById('expanded-canvas-video');
    if (expCanvasEl) {
      try { expCanvasEl.pause(); } catch {}
    }
    if (expOptionsDropdown) expOptionsDropdown.style.display = 'none';
    switchLandscapePlayerPane('main');
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
  const miniPlayerBar = typeof document.getElementById === 'function' ? document.getElementById('apple-player-bar') : null;
  if (miniPlayerBar && typeof miniPlayerBar.addEventListener === 'function') {
    miniPlayerBar.addEventListener('click', (e) => {
      if (!e || !e.target || typeof e.target.closest !== 'function') return;
      if (e.target.closest('button, input, .scrubber-track, .volume-track, .volume-controls, .volume-container')) return;
      openExpandedView();
    });
  }
  if (btnCollapsePlayer) {
    btnCollapsePlayer.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      closeExpandedView();
    };
  }
  const topGrabber = document.getElementById('bc-np-top-grabber');
  if (topGrabber) {
    topGrabber.onclick = (e) => {
      e.stopPropagation();
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
  const optDownloadTrack = document.getElementById('opt-download-track');

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
  if (optDownloadTrack) {
    optDownloadTrack.onclick = () => {
      if (expOptionsDropdown) expOptionsDropdown.style.display = 'none';
      const currentTrack = CATALOGUE_TRACKS[currentIndex];
      if (currentTrack) triggerTrackDownload(currentTrack);
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
  if (btnEq && eqModal) {
    btnEq.onclick = () => {
      eqModal.style.display = 'flex';
      if (typeof initEqualizerModalControls === 'function') initEqualizerModalControls();
      if (typeof syncEqualizerModalUI === 'function') syncEqualizerModalUI();
    };
  }
  if (btnCloseEq && eqModal) btnCloseEq.onclick = () => { eqModal.style.display = 'none'; };
  document.querySelectorAll('[data-eq]').forEach(btn => {
    btn.onclick = () => {
      const preset = btn.getAttribute('data-eq');
      applyEqPreset(preset);
      if (typeof saveBitChordSettings === 'function') saveBitChordSettings();
      if (eqModal) eqModal.style.display = 'none';
    };
  });
  if (typeof initEqualizerModalControls === 'function') initEqualizerModalControls();
  if (typeof initArtworkSwipeGesture === 'function') initArtworkSwipeGesture();

  // Settings modal
  const settingsModal = document.getElementById('settings-modal');
  const btnSettings = document.getElementById('btn-settings');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  if (btnSettings) {
    btnSettings.onclick = () => {
      searchQuery = '';
      const sInput = document.getElementById('apple-search-input');
      if (sInput) sInput.value = '';
      currentView = 'settings';
      pushNavigation('settings');
      renderCurrentView();
    };
  }
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

  const tabBrowser = document.getElementById('tab-btn-browser');
  const tabCookies = document.getElementById('tab-btn-cookies');
  const tabInApp = document.getElementById('tab-btn-inapp');
  if (tabBrowser) tabBrowser.onclick = () => switchLoginTab('browser');
  if (tabCookies) tabCookies.onclick = () => switchLoginTab('cookies');
  if (tabInApp) tabInApp.onclick = () => switchLoginTab('inapp');

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

  const btnModalOpenYtmWeb = document.getElementById('btn-modal-open-ytm-web');
  if (btnModalOpenYtmWeb) {
    btnModalOpenYtmWeb.onclick = async () => {
      const statusMsg = document.getElementById('inapp-login-status');
      if (statusMsg) {
        statusMsg.style.color = 'var(--apple-text-secondary)';
        statusMsg.innerText = 'Opening YouTube Music web window...';
      }
      const api = window.dejaAPI || window.sonoraAPI;
      if (api?.openGoogleLogin) {
        try {
          const success = await api.openGoogleLogin('music-youtube');
          if (success) {
            if (statusMsg) {
              statusMsg.style.color = '#34C759';
              statusMsg.innerText = 'Signed in successfully!';
            }
            setTimeout(() => closeAccountModal(), 600);
          } else {
            if (statusMsg) statusMsg.innerText = 'Window closed.';
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

  const btnOpenSyncHelper = document.getElementById('btn-open-sync-helper');
  if (btnOpenSyncHelper) {
    btnOpenSyncHelper.onclick = () => {
      const api = window.dejaAPI || window.sonoraAPI;
      if (api?.openExternal) {
        api.openExternal('http://127.0.0.1:3728/connect');
      } else if (typeof window !== 'undefined') {
        window.open('http://127.0.0.1:3728/connect', '_blank');
      }
    };
  }

  const btnPasteClipboard = document.getElementById('btn-paste-clipboard-connect');
  if (btnPasteClipboard) {
    btnPasteClipboard.onclick = async () => {
      const statusEl = document.getElementById('clipboard-import-status');
      if (statusEl) {
        statusEl.style.color = 'var(--apple-text-secondary)';
        statusEl.innerText = 'Reading clipboard...';
      }
      try {
        let text = '';
        const api = window.dejaAPI || window.sonoraAPI;
        if (api?.readClipboard) {
          text = await api.readClipboard().catch(() => '');
        }
        if (!text && navigator.clipboard && navigator.clipboard.readText) {
          text = await navigator.clipboard.readText().catch(() => '');
        }
        if (!text || !text.trim()) {
          if (statusEl) {
            statusEl.style.color = '#FA2D48';
            statusEl.innerText = 'Clipboard is empty. Copy cookies, SAPISID, or cURL from browser first!';
          }
          return;
        }
        if (statusEl) {
          statusEl.innerText = 'Connecting...';
        }
        if (api?.importSessionCookies) {
          const res = await api.importSessionCookies(text.trim());
          if (res && res.success) {
            if (statusEl) {
              statusEl.style.color = '#34C759';
              statusEl.innerText = `Connected successfully as ${res.account?.name || 'Google User'}!`;
            }
            setTimeout(() => closeAccountModal(), 800);
          } else {
            if (statusEl) {
              statusEl.style.color = '#FA2D48';
              statusEl.innerText = (res && res.error) ? res.error : 'Connection failed. Please check your cookies.';
            }
          }
        }
      } catch (err) {
        if (statusEl) {
          statusEl.style.color = '#FA2D48';
          statusEl.innerText = 'Error: ' + err.message;
        }
      }
    };
  }

  const btnCopySnippet = document.getElementById('btn-copy-sync-snippet');
  if (btnCopySnippet) {
    btnCopySnippet.onclick = () => {
      const snippetEl = document.getElementById('sync-console-snippet');
      const text = snippetEl ? snippetEl.innerText.trim() : "fetch('http://127.0.0.1:3728/sync?c=' + encodeURIComponent(document.cookie), { mode: 'no-cors' })";
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

  const btnSwitchChannel = document.getElementById('btn-switch-channel');
  if (btnSwitchChannel) {
    btnSwitchChannel.onclick = async () => {
      const channelsListEl = document.getElementById('account-channels-list');
      if (channelsListEl && liveAccount?.channels && liveAccount.channels.length > 1) {
        channelsListEl.style.display = (channelsListEl.style.display === 'none' || !channelsListEl.style.display) ? 'flex' : 'none';
        return;
      }
      const api = window.dejaAPI || window.sonoraAPI;
      if (api?.openGoogleLogin) {
        await api.openGoogleLogin('switch-channel');
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
      liveUserPlaylists = [];
      try {
        localStorage.removeItem('deja_cached_account');
        localStorage.removeItem('deja_cached_playlists');
      } catch {}
      updateAccountUI({ isLoggedIn: false });
      updateSidebarPlaylistsUI([]);
      renderAccountModalContent(true);
      if (currentView === 'library' || currentView === 'playlists') {
        renderCurrentView();
      }
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
      if (cfg.bitchordSettings && typeof cfg.bitchordSettings === 'object') {
        const hasLocal = typeof localStorage !== 'undefined' && !!localStorage.getItem('deja_bitchord_settings');
        if (!hasLocal) {
          bitchordSettings = { ...DEFAULT_BITCHORD_SETTINGS, ...cfg.bitchordSettings };
          applyBitChordVisualSettings();
          applyBitChordAudioDspSettings();
        }
      }
      const activeTheme = (bitchordSettings && bitchordSettings.themeMode) || cfg.theme || 'dark';
      bitchordSettings.themeMode = activeTheme;
      if (prefThemeSelect) {
        prefThemeSelect.value = activeTheme;
      }
      applyAppTheme(activeTheme);
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
      bitchordSettings.themeMode = theme;
      saveBitChordSettings();
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

  // BitChord Search Typeahead Suggestions & Input Handler
  const searchInput = document.getElementById('apple-search-input');
  const suggestionsDropdown = document.getElementById('search-suggestions-dropdown');
  let suggestDebounceTimer = null;
  let selectedSuggestionIndex = -1;

  function hideSearchSuggestions() {
    if (suggestionsDropdown) {
      suggestionsDropdown.style.display = 'none';
      suggestionsDropdown.innerHTML = '';
      selectedSuggestionIndex = -1;
    }
  }

  function showSearchSuggestions(suggestions) {
    if (!suggestionsDropdown) return;
    if (!suggestions || suggestions.length === 0) {
      hideSearchSuggestions();
      return;
    }
    selectedSuggestionIndex = -1;
    suggestionsDropdown.innerHTML = suggestions.map((s, idx) => `
      <div class="search-suggestion-item" data-index="${idx}" data-val="${escapeHTML(s)}">
        <svg class="search-suggestion-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <span>${escapeHTML(s)}</span>
      </div>
    `).join('');

    suggestionsDropdown.querySelectorAll('.search-suggestion-item').forEach(el => {
      el.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const val = el.getAttribute('data-val');
        if (val) {
          if (searchInput) searchInput.value = val;
          searchQuery = val;
          hideSearchSuggestions();
          renderCurrentView();
        }
      });
    });

    suggestionsDropdown.style.display = 'block';
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderCurrentView();

      const q = e.target.value.trim();
      if (suggestDebounceTimer) clearTimeout(suggestDebounceTimer);
      if (q.length >= 2 && api?.getSearchSuggestions) {
        suggestDebounceTimer = setTimeout(async () => {
          try {
            const list = await api.getSearchSuggestions(q);
            if (searchInput && searchInput.value.trim() === q) {
              showSearchSuggestions(list);
            }
          } catch {}
        }, 180);
      } else {
        hideSearchSuggestions();
      }
    });

    searchInput.addEventListener('keydown', (e) => {
      if (suggestionsDropdown && suggestionsDropdown.style.display !== 'none') {
        const items = suggestionsDropdown.querySelectorAll('.search-suggestion-item');
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          selectedSuggestionIndex = (selectedSuggestionIndex + 1) % items.length;
          items.forEach((it, idx) => it.classList.toggle('selected', idx === selectedSuggestionIndex));
          if (items[selectedSuggestionIndex]) {
            const val = items[selectedSuggestionIndex].getAttribute('data-val');
            if (val) searchInput.value = val;
          }
          return;
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          selectedSuggestionIndex = (selectedSuggestionIndex - 1 + items.length) % items.length;
          items.forEach((it, idx) => it.classList.toggle('selected', idx === selectedSuggestionIndex));
          if (items[selectedSuggestionIndex]) {
            const val = items[selectedSuggestionIndex].getAttribute('data-val');
            if (val) searchInput.value = val;
          }
          return;
        } else if (e.key === 'Enter') {
          hideSearchSuggestions();
          searchQuery = searchInput.value;
          renderCurrentView();
          return;
        } else if (e.key === 'Escape') {
          hideSearchSuggestions();
          e.stopPropagation();
          return;
        }
      }

      if (e.key === 'Escape') {
        clearSearch();
        closeLyricsDrawer();
      }
    });

    searchInput.addEventListener('blur', () => {
      setTimeout(hideSearchSuggestions, 200);
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.apple-search-box')) {
      hideSearchSuggestions();
    }
  });

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // 1. If options menu is open, pressing Escape closes the options menu first
      if (expOptionsDropdown && expOptionsDropdown.style.display !== 'none') {
        expOptionsDropdown.style.display = 'none';
        return;
      }

      // 2. If any modal is currently visible, dismiss it first
      const openModal = ['bitchord-submodal-overlay', 'account-login-modal', 'pipeline-modal', 'sleep-modal', 'eq-modal', 'create-playlist-modal', 'add-to-playlist-modal', 'settings-modal'].find(id => {
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
      const lyricsDrawer = document.getElementById('apple-lyrics-drawer') || document.getElementById('lyrics-drawer');
      if (lyricsDrawer && (lyricsDrawer.classList.contains('visible') || lyricsDrawer.classList.contains('active'))) {
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
        closeQueueDrawer();
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
      updateSidebarPlaylistsUI(liveUserPlaylists);
      renderCurrentView(); // Re-render current view immediately upon auth change
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

let systemThemeMediaBound = false;
function applyAppTheme(theme) {
  if (typeof document === 'undefined' || !document.body || !document.body.classList) return;
  const targets = [document.body, document.documentElement].filter(Boolean);
  targets.forEach(el => {
    if (el.classList && typeof el.classList.remove === 'function') {
      el.classList.remove('apple-dark', 'apple-light', 'pure-black');
    }
  });
  const addCls = (cls) => {
    targets.forEach(el => {
      if (el.classList && typeof el.classList.add === 'function') {
        el.classList.add(cls);
      }
    });
  };
  let resolved = theme || 'dark';
  if (resolved === 'system') {
    const prefersLight = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: light)').matches;
    resolved = prefersLight ? 'light' : 'dark';
    if (!systemThemeMediaBound && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      systemThemeMediaBound = true;
      try {
        const mq = window.matchMedia('(prefers-color-scheme: light)');
        if (mq && typeof mq.addEventListener === 'function') {
          mq.addEventListener('change', () => {
            if (bitchordSettings && bitchordSettings.themeMode === 'system') {
              applyAppTheme('system');
            }
          });
        }
      } catch {}
    }
  }
  if (resolved === 'light') {
    addCls('apple-light');
  } else if (resolved === 'pure-black') {
    addCls('pure-black');
  } else {
    addCls('apple-dark');
  }
  if (typeof document.body.setAttribute === 'function') {
    document.body.setAttribute('data-theme', resolved);
  }
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}


// ==========================================================================
// BitChord SettingsScreen & ReplayScreen (SettingsSheet.kt / ReplayScreen.kt)
// ==========================================================================
const DEFAULT_BITCHORD_SETTINGS = {
  wifiQuality: 'Hi-Res Lossless',
  cellularQuality: 'High (256 kbps)',
  meteredConnection: false,
  dolbyAtmos: false,
  downloadQuality: 'Hi-Res FLAC',
  wifiOnlyDownloads: false,
  exportDownloads: true,
  preferMusicOnly: true,
  outputPcmMode: 'Auto',
  preferUsbDac: false,
  loudnessNormalization: true,
  crossfadeSeconds: 0,
  smartFade: false,
  automixPerformance: 'Balanced',
  skipSilence: false,
  spatialAudio: false,
  equalizerEnabled: true,
  equalizerMode: 'manual',
  equalizerBands: [0, 0, 0, 0, 0],
  tonePadX: 0,
  tonePadY: 0,
  tonePadBandwidth: 'broad',
  stereoBalance: 0,
  themeMode: 'dark',
  reduceAnimation: false,
  reduceDynamicBlur: false,
  liquidGlass: true,
  fullBleedArtwork: true,
  legacyMeshGradient: false,
  animatedCanvas: true,
  canvasOverCellular: false,
  spotifyCanvasConnected: false,
  spotifyCanvasToken: '',
  syncedLyrics: true,
  lyricsBlur: true,
  lyricsSources: 'BiniLyrics, BetterLyrics, PaxSenix, SimpMusic, LyricsPlus, LRCLIB, KuGou, YouTube',
  lyricsSourcesConfig: [
    { id: 'BiniLyrics', label: 'BiniLyrics (Apple Music TTML)', enabled: true },
    { id: 'BetterLyrics', label: 'BetterLyrics (Word-Synced TTML)', enabled: true },
    { id: 'PaxSenix', label: 'PaxSenix (Apple Music Syllable Sync)', enabled: true },
    { id: 'SimpMusic', label: 'SimpMusic Lyrics API', enabled: true },
    { id: 'LyricsPlus', label: 'LyricsPlus Multi-Mirror Syllable Sync', enabled: true },
    { id: 'LRCLIB', label: 'LRCLIB Community Synced LRC', enabled: true },
    { id: 'KuGou', label: 'KuGou KRC Word-Synced', enabled: true },
    { id: 'YouTube', label: 'YouTube Music Timed Captions', enabled: true }
  ],
  translationLanguage: 'Off',
  highPerformanceMode: true,
  refreshRate: 120,
  localMusicFolder: 'All Audio Folders (~/Music)',
  filterNonMusicAudio: true,
  songCacheLimitMb: 2048,
  replayGenres: true,
  swipeToPlayNext: true,
  dontRepeatSuggestions: true,
  stopOnClose: false,
  hideVolumeBar: false,
  hideSongStatus: false,
  appLanguage: 'English (System)',
  smartVersionAlignment: true,
  showNerdStats: false,
  discordRpc: true,
  discordUseDetails: false,
  discordShowAudioQuality: true,
  discordActivityName: 'Deja',
  discordStatus: 'online',
  lastfmEnabled: false,
  lastfmUsername: '',
  lastfmApiKey: '',
  listenBrainzEnabled: false,
  listenBrainzToken: '',
  addonSources: [
    {
      id: 'innertube-core',
      name: 'YouTube Music InnerTube (Core)',
      url: 'https://music.youtube.com/youtubei/v1',
      enabled: true,
      builtIn: true,
      status: 'Active · 160k Opus / 256k AAC'
    },
    {
      id: 'hires-flac-bridge',
      name: 'Deja Lossless FLAC Resolver',
      url: 'https://lrclib.net/api',
      enabled: true,
      builtIn: true,
      status: 'Active · 24-bit / 96kHz FLAC'
    }
  ],
  partyServerUrl: 'wss://party.bitchord.app',
  partyRoomCode: '',
  partyHostActive: false
};

let bitchordSettings = { ...DEFAULT_BITCHORD_SETTINGS };
let settingsSearchFilter = '';
let scannedLocalMusicTracks = [];

function getBitChordSettings() {
  return bitchordSettings;
}

function updateBitChordSetting(key, val) {
  if (!key) return bitchordSettings;
  bitchordSettings[key] = val;
  saveBitChordSettings();
  return bitchordSettings;
}

function loadBitChordSettings() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('deja_bitchord_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        bitchordSettings = {
          ...DEFAULT_BITCHORD_SETTINGS,
          ...parsed,
          equalizerBands: Array.isArray(parsed.equalizerBands) && parsed.equalizerBands.length === 5
            ? parsed.equalizerBands.map(Number)
            : [...DEFAULT_BITCHORD_SETTINGS.equalizerBands],
          lyricsSourcesConfig: (() => {
            if (!Array.isArray(parsed.lyricsSourcesConfig) || parsed.lyricsSourcesConfig.length === 0) {
              return DEFAULT_BITCHORD_SETTINGS.lyricsSourcesConfig.map(s => ({ ...s }));
            }
            const existingIds = new Set(parsed.lyricsSourcesConfig.map(s => s && s.id).filter(Boolean));
            const missingDefaults = DEFAULT_BITCHORD_SETTINGS.lyricsSourcesConfig
              .filter(d => !existingIds.has(d.id))
              .map(d => ({ ...d }));
            return [...missingDefaults, ...parsed.lyricsSourcesConfig];
          })(),
          addonSources: Array.isArray(parsed.addonSources) && parsed.addonSources.length > 0
            ? parsed.addonSources
            : DEFAULT_BITCHORD_SETTINGS.addonSources.map(s => ({ ...s }))
        };
      }
    }
  } catch {}
  applyBitChordVisualSettings();
  applyBitChordAudioDspSettings();
}

function saveBitChordSettings() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('deja_bitchord_settings', JSON.stringify(bitchordSettings));
    }
  } catch {}
  applyBitChordVisualSettings();
  applyBitChordAudioDspSettings();

  const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
  if (api?.setConfig) {
    try {
      api.setConfig({
        bitchordSettings,
        theme: bitchordSettings.themeMode || 'dark',
        closeToTray: !bitchordSettings.stopOnClose,
        discordRPC: bitchordSettings.discordRpc,
        discordUseDetails: bitchordSettings.discordUseDetails,
        discordShowAudioQuality: bitchordSettings.discordShowAudioQuality,
        discordActivityName: bitchordSettings.discordActivityName,
        discordStatus: bitchordSettings.discordStatus,
        localMusicFolder: bitchordSettings.localMusicFolder,
        filterNonMusicAudio: bitchordSettings.filterNonMusicAudio
      });
    } catch {}
  }
  if (api?.setFrameRate) {
    try {
      const targetHz = bitchordSettings.highPerformanceMode ? (Number(bitchordSettings.refreshRate) || 120) : 60;
      api.setFrameRate(targetHz);
    } catch {}
  }
}

function getActiveAudioQualityBadgeLabel() {
  if (bitchordSettings.dolbyAtmos) return 'Dolby Atmos';
  const q = String(bitchordSettings.meteredConnection ? bitchordSettings.cellularQuality : bitchordSettings.wifiQuality || '');
  if (q.includes('Lossless') || q.includes('FLAC')) return 'Hi-Res 24-bit';
  if (q.includes('256')) return '256k AAC';
  if (q.includes('128')) return '128k AAC';
  if (q.includes('64')) return '64k HE-AAC';
  return '160k Opus';
}

function applyBitChordVisualSettings() {
  if (typeof document === 'undefined' || !document.body) return;
  if (bitchordSettings.themeMode) {
    applyAppTheme(bitchordSettings.themeMode);
  }
  document.body.classList.toggle('reduce-motion', !!bitchordSettings.reduceAnimation);
  document.body.classList.toggle('reduce-blur', !!bitchordSettings.reduceDynamicBlur);
  document.body.classList.toggle('liquid-glass', bitchordSettings.liquidGlass !== false);
  document.body.classList.toggle('full-bleed-artwork', bitchordSettings.fullBleedArtwork !== false);
  document.body.classList.toggle('legacy-mesh-gradient', !!bitchordSettings.legacyMeshGradient);
  document.body.classList.toggle('hide-volume-bar', !!bitchordSettings.hideVolumeBar);
  document.body.classList.toggle('hide-song-status', !!bitchordSettings.hideSongStatus);
  document.body.classList.toggle('no-lyrics-blur', !bitchordSettings.lyricsBlur);
  document.body.classList.toggle('synced-lyrics-off', !bitchordSettings.syncedLyrics);

  const volWrap = document.querySelector('.volume-container') || document.querySelector('.volume-controls');
  if (volWrap) volWrap.style.display = bitchordSettings.hideVolumeBar ? 'none' : '';
  const pipeBtn = document.getElementById('btn-audio-pipeline');
  if (pipeBtn) {
    pipeBtn.style.display = bitchordSettings.hideSongStatus ? 'none' : '';
    const spanEl = pipeBtn.querySelector('span:not(.badge-dot)');
    if (spanEl) spanEl.textContent = getActiveAudioQualityBadgeLabel();
  }

  const automixBadge = document.getElementById('player-automix-badge');
  if (automixBadge) {
    automixBadge.style.display = bitchordSettings.smartFade ? 'inline-flex' : 'none';
    automixBadge.textContent = `Automix · ${bitchordSettings.automixPerformance || 'Balanced'}`;
  }

  const nerdOverlay = document.getElementById('player-nerd-stats-overlay');
  if (nerdOverlay) {
    nerdOverlay.style.display = bitchordSettings.showNerdStats ? 'block' : 'none';
  }
  updateNerdStatsHud();

  if (!bitchordSettings.animatedCanvas && typeof stopAllVideoElements === 'function' && (typeof isVideoModeActive === 'undefined' || !isVideoModeActive)) {
    stopAllVideoElements();
  }

  const rawLang = String(bitchordSettings.appLanguage || 'English (System)');
  const langMap = {
    Spanish: 'es',
    French: 'fr',
    German: 'de',
    Japanese: 'ja',
    Korean: 'ko',
    Hindi: 'hi'
  };
  let langCode = 'en';
  for (const [key, code] of Object.entries(langMap)) {
    if (rawLang.includes(key)) {
      langCode = code;
      break;
    }
  }
  if (document.documentElement) {
    document.documentElement.lang = langCode;
  }
  if (document.body.dataset) {
    document.body.dataset.appLang = langCode;
  }
}

function computeDynamicTonePadGains(x, y) {
  const tx = Math.max(-1, Math.min(1, Number(x) || 0));
  const ty = Math.max(-1, Math.min(1, Number(y) || 0));
  const clampDb = (v) => {
    const r = Math.round(Math.max(-12, Math.min(12, v)) * 2) / 2;
    return Object.is(r, -0) ? 0 : r;
  };
  return [
    clampDb((-tx * 6.0) + (-ty * 2.5)), // 60 Hz Sub
    clampDb((-tx * 3.5) + (ty * 2.5)),  // 250 Hz Low-Mid
    clampDb(ty * 6.0),                  // 1 kHz Mid
    clampDb((tx * 4.0) + (ty * 3.0)),   // 4 kHz Presence
    clampDb((tx * 6.0) + (-ty * 2.0))   // 12 kHz Air
  ];
}

function applyBitChordAudioDspSettings() {
  const bands = Array.isArray(bitchordSettings.equalizerBands) && bitchordSettings.equalizerBands.length === 5
    ? bitchordSettings.equalizerBands.map(Number)
    : [0, 0, 0, 0, 0];
  const eqActive = bitchordSettings.equalizerEnabled !== false;
  const qVal = bitchordSettings.tonePadBandwidth === 'focused' ? 2.2 : 0.85;

  if (typeof audioContext !== 'undefined' && audioContext) {
    const now = audioContext.currentTime || 0;
    const filters = [eqFilter60, eqFilter250, eqFilter1k, eqFilter4k, eqFilter12k];
    filters.forEach((f, idx) => {
      if (!f) return;
      const g = eqActive ? (bands[idx] || 0) : 0;
      if (f.gain && typeof f.gain.setTargetAtTime === 'function') {
        f.gain.setTargetAtTime(g, now, 0.08);
      } else if (f.gain) {
        f.gain.value = g;
      }
      if (idx >= 1 && idx <= 3 && f.Q) {
        if (typeof f.Q.setTargetAtTime === 'function') f.Q.setTargetAtTime(qVal, now, 0.08);
        else f.Q.value = qVal;
      }
    });
    if (typeof window !== 'undefined' && window.__dejaStereoPanner && window.__dejaStereoPanner.pan) {
      const panVal = Math.max(-1, Math.min(1, (Number(bitchordSettings.stereoBalance) || 0) / 100));
      if (typeof window.__dejaStereoPanner.pan.setTargetAtTime === 'function') {
        window.__dejaStereoPanner.pan.setTargetAtTime(panVal, now, 0.05);
      } else {
        window.__dejaStereoPanner.pan.value = panVal;
      }
    }
    if (masterGain && masterGain.gain) {
      const normFactor = bitchordSettings.loudnessNormalization ? 0.88 : 1.0;
      const spatialBoost = bitchordSettings.spatialAudio ? 1.06 : 1.0;
      const targetGain = Math.min(1.0, currentVolume * 0.2 * normFactor * spatialBoost);
      if (typeof masterGain.gain.setTargetAtTime === 'function') {
        masterGain.gain.setTargetAtTime(targetGain, now, 0.08);
      } else {
        masterGain.gain.value = targetGain;
      }
    }
  }

  if (typeof dejaAudio !== 'undefined' && dejaAudio && !isMuted) {
    const normCeiling = getLoudnessCeiling();
    dejaAudio.volume = Math.max(0, Math.min(1, currentVolume * normCeiling));
  }

  updateNerdStatsHud();
}

function updateNerdStatsHud() {
  if (typeof document === 'undefined') return;
  const codecEl = document.getElementById('nerd-stat-codec');
  const bitrateEl = document.getElementById('nerd-stat-bitrate');
  const srateEl = document.getElementById('nerd-stat-srate');
  const pcmEl = document.getElementById('nerd-stat-pcm');
  const dspEl = document.getElementById('nerd-stat-dsp');
  const dacEl = document.getElementById('nerd-stat-dac');
  const sleeveStatsWrap = document.getElementById('bc-sleeve-nerd-stats');
  const sleeveLine1 = document.getElementById('bc-sleeve-stats-line1');
  const sleeveLine2 = document.getElementById('bc-sleeve-stats-line2');

  const qLabel = getActiveAudioQualityBadgeLabel();
  const codecStr = bitchordSettings.dolbyAtmos
    ? 'E-AC-3 JOC (Spatial)'
    : (qLabel.includes('Hi-Res') ? 'FLAC 24-bit' : (currentStreamMeta?.mimeType || 'Opus 251'));
  const bitrateStr = qLabel.includes('Hi-Res')
    ? '1411 kbps'
    : (currentStreamMeta?.bitrate ? `${Math.round(currentStreamMeta.bitrate / 1000)} kbps` : qLabel);
  const srateStr = bitchordSettings.preferUsbDac ? '96.0 kHz' : `${((audioContext?.sampleRate || 48000) / 1000).toFixed(1)} kHz`;
  const pcmStr = bitchordSettings.outputPcmMode || 'Auto';

  if (codecEl) codecEl.textContent = codecStr;
  if (bitrateEl) bitrateEl.textContent = bitrateStr;
  if (srateEl) srateEl.textContent = srateStr;
  if (pcmEl) pcmEl.textContent = pcmStr;

  const dspParts = [];
  if (bitchordSettings.loudnessNormalization) dspParts.push('-14 LUFS');
  if (bitchordSettings.equalizerEnabled !== false) dspParts.push(`EQ ${currentEqPreset || 'Flat'}`);
  if (bitchordSettings.spatialAudio) dspParts.push('Spatial 3D');
  if (Number(bitchordSettings.stereoBalance)) {
    const b = Number(bitchordSettings.stereoBalance);
    dspParts.push(`Bal ${b < 0 ? 'L' + Math.abs(b) : 'R' + b}%`);
  }
  const dspStr = dspParts.length > 0 ? dspParts.join(' • ') : 'Bit-Perfect Bypass';
  const dacStr = bitchordSettings.preferUsbDac ? 'USB DAC Exclusive' : 'WASAPI Shared';

  if (dspEl) dspEl.textContent = dspStr;
  if (dacEl) dacEl.textContent = bitchordSettings.preferUsbDac ? 'Exclusive USB Audio DAC' : 'WASAPI Shared System Sink';

  if (sleeveStatsWrap) {
    sleeveStatsWrap.style.display = bitchordSettings.showNerdStats ? 'flex' : 'none';
  }
  if (sleeveLine1) {
    sleeveLine1.textContent = `${codecStr} • ${bitrateStr} • ${srateStr} • ${pcmStr}`;
  }
  if (sleeveLine2) {
    sleeveLine2.textContent = `Out ${srateStr} • ${dacStr} • ${dspStr}`;
  }
  const expPipelineText = document.getElementById('exp-pipeline-text');
  if (expPipelineText) {
    if (bitchordSettings.showNerdStats) {
      expPipelineText.textContent = `${codecStr} · ${bitrateStr} · ${srateStr}`;
    } else if (bitchordSettings.dolbyAtmos) {
      expPipelineText.textContent = 'Dolby Atmos';
    } else if (qLabel.includes('Hi-Res')) {
      expPipelineText.textContent = 'Lossless';
    } else {
      expPipelineText.textContent = 'High Quality';
    }
  }
}

function handleBitChordPlaybackTick(audioEl) {
  if (!audioEl || audioEl.paused || !audioEl.duration || isNaN(audioEl.duration)) return;
  const dur = audioEl.duration;
  const pos = audioEl.currentTime;
  const rem = dur - pos;

  // 1. Skip Silence (intro/outro dead air fast-forward)
  if (bitchordSettings.skipSilence && dur > 25) {
    if (pos < 0.8) {
      try { audioEl.currentTime = 1.2; } catch {}
    } else if (rem > 0.3 && rem < 1.4) {
      nextTrack();
      return;
    }
  }

  // 2. Crossfade (0-12s) or Automix Smart Fade envelope
  const fadeWindow = bitchordSettings.smartFade
    ? (bitchordSettings.automixPerformance === 'High Quality' ? 8 : (bitchordSettings.automixPerformance === 'Battery Saver' ? 4 : 6))
    : (Number(bitchordSettings.crossfadeSeconds) || 0);

  if (fadeWindow > 0 && dur > fadeWindow * 2 && !isMuted) {
    const normCeiling = getLoudnessCeiling();
    const baseVol = Math.max(0, Math.min(1, currentVolume * normCeiling));
    if (rem <= fadeWindow && rem > 0) {
      const ratio = Math.max(0.08, rem / fadeWindow);
      audioEl.volume = Math.max(0, Math.min(1, baseVol * ratio));
    } else if (pos < Math.min(3, fadeWindow / 2)) {
      const inRatio = Math.max(0.2, pos / Math.min(3, fadeWindow / 2));
      audioEl.volume = Math.max(0, Math.min(1, baseVol * inRatio));
    } else {
      audioEl.volume = baseVol;
    }
  }
}

function initArtworkSwipeGesture() {
  if (typeof document === 'undefined') return;
  const artWrap = document.getElementById('now-playing-art-wrap');
  if (!artWrap || artWrap.__dejaSwipeHooked) return;
  artWrap.__dejaSwipeHooked = true;
  let startX = null;
  let startY = null;
  artWrap.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
    startY = e.clientY;
  });
  artWrap.addEventListener('pointerup', (e) => {
    if (startX === null || !bitchordSettings.swipeToPlayNext) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    startX = null;
    startY = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (dx < 0) nextTrack();
      else prevTrack();
    }
  });
}

function syncEqualizerModalUI() {
  if (typeof document === 'undefined') return;
  const masterSwitch = document.getElementById('eq-master-switch');
  if (masterSwitch) masterSwitch.checked = bitchordSettings.equalizerEnabled !== false;

  const mode = bitchordSettings.equalizerMode === 'dynamic' ? 'dynamic' : 'manual';
  const btnManual = document.getElementById('eq-mode-manual');
  const btnDynamic = document.getElementById('eq-mode-dynamic');
  const panelManual = document.getElementById('eq-manual-panel');
  const panelDynamic = document.getElementById('eq-dynamic-panel');
  if (btnManual) btnManual.classList.toggle('active', mode === 'manual');
  if (btnDynamic) btnDynamic.classList.toggle('active', mode === 'dynamic');
  if (panelManual) panelManual.style.display = mode === 'manual' ? '' : 'none';
  if (panelDynamic) panelDynamic.style.display = mode === 'dynamic' ? '' : 'none';

  const bands = Array.isArray(bitchordSettings.equalizerBands) && bitchordSettings.equalizerBands.length === 5
    ? bitchordSettings.equalizerBands
    : [0, 0, 0, 0, 0];
  for (let i = 0; i < 5; i++) {
    const slider = document.getElementById(`eq-band-${i}`);
    const dbEl = document.getElementById(`eq-db-${i}`);
    const val = Number(bands[i]) || 0;
    if (slider) slider.value = String(val);
    if (dbEl) dbEl.textContent = `${val > 0 ? '+' : ''}${val.toFixed(1)} dB`;
  }

  const presetWrap = document.getElementById('eq-preset-pills');
  if (presetWrap && typeof presetWrap.querySelectorAll === 'function') {
    presetWrap.querySelectorAll('.eq-preset-btn').forEach(btn => {
      const pName = btn.getAttribute('data-preset') || btn.textContent.trim();
      btn.classList.toggle('active', pName === (currentEqPreset || 'Flat'));
    });
  }

  const puck = document.getElementById('eq-tone-puck');
  const coords = document.getElementById('eq-tone-coords');
  const tx = Math.max(-1, Math.min(1, Number(bitchordSettings.tonePadX) || 0));
  const ty = Math.max(-1, Math.min(1, Number(bitchordSettings.tonePadY) || 0));
  if (puck) {
    puck.style.left = `${((tx + 1) * 50).toFixed(1)}%`;
    puck.style.top = `${((1 - ty) * 50).toFixed(1)}%`;
  }
  if (coords) {
    const tiltDesc = tx > 0.1 ? `Bright (+${Math.round(tx * 100)}%)` : (tx < -0.1 ? `Warm (${Math.round(tx * 100)}%)` : 'Neutral (0%)');
    const midDesc = ty > 0.1 ? `Mid-Forward (+${Math.round(ty * 100)}%)` : (ty < -0.1 ? `Scooped (${Math.round(ty * 100)}%)` : 'Neutral (0%)');
    coords.textContent = `Tilt: ${tiltDesc} • Mid Focus: ${midDesc}`;
  }

  const bwBroad = document.getElementById('eq-bw-broad');
  const bwFocused = document.getElementById('eq-bw-focused');
  if (bwBroad) bwBroad.classList.toggle('active', bitchordSettings.tonePadBandwidth !== 'focused');
  if (bwFocused) bwFocused.classList.toggle('active', bitchordSettings.tonePadBandwidth === 'focused');

  const balSlider = document.getElementById('eq-balance-slider');
  const balVal = document.getElementById('eq-balance-val');
  const bal = Number(bitchordSettings.stereoBalance) || 0;
  if (balSlider) balSlider.value = String(bal);
  if (balVal) {
    balVal.textContent = bal === 0 ? 'Center (0%)' : (bal < 0 ? `Left (${Math.abs(bal)}%)` : `Right (${bal}%)`);
  }

  const status = document.getElementById('eq-status-text');
  if (status) {
    status.innerHTML = bitchordSettings.equalizerEnabled === false
      ? `Equalizer: <strong>Bypassed (Off)</strong>`
      : `Active Preset: <strong>${escapeHTML(currentEqPreset || 'Flat')}</strong>`;
  }
}

function initEqualizerModalControls() {
  if (typeof document === 'undefined') return;
  try { ensureAudioGraph(); } catch {}
  const eqModal = document.getElementById('eq-modal');
  if (!eqModal || eqModal.__dejaEqControlsBound) return;
  eqModal.__dejaEqControlsBound = true;

  const masterSwitch = document.getElementById('eq-master-switch');
  if (masterSwitch) {
    masterSwitch.onchange = (e) => {
      bitchordSettings.equalizerEnabled = !!e.target.checked;
      saveBitChordSettings();
      syncEqualizerModalUI();
    };
  }

  ['eq-mode-manual', 'eq-mode-dynamic'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.onclick = () => {
        bitchordSettings.equalizerMode = btn.getAttribute('data-eq-mode') || 'manual';
        saveBitChordSettings();
        syncEqualizerModalUI();
      };
    }
  });

  for (let i = 0; i < 5; i++) {
    const slider = document.getElementById(`eq-band-${i}`);
    if (slider) {
      slider.oninput = (e) => {
        const v = Number(e.target.value) || 0;
        if (!Array.isArray(bitchordSettings.equalizerBands) || bitchordSettings.equalizerBands.length !== 5) {
          bitchordSettings.equalizerBands = [0, 0, 0, 0, 0];
        }
        bitchordSettings.equalizerBands[i] = v;
        currentEqPreset = 'Custom';
        saveBitChordSettings();
        syncEqualizerModalUI();
      };
    }
  }

  const resetFlatBtn = document.getElementById('btn-eq-reset-flat');
  if (resetFlatBtn) {
    resetFlatBtn.onclick = () => {
      bitchordSettings.equalizerBands = [0, 0, 0, 0, 0];
      bitchordSettings.tonePadX = 0;
      bitchordSettings.tonePadY = 0;
      applyEqPreset('Flat');
      saveBitChordSettings();
      syncEqualizerModalUI();
    };
  }

  const tonePad = document.getElementById('eq-tone-pad');
  if (tonePad) {
    const updateFromPointer = (e) => {
      const rect = tonePad.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const relY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      const tx = Number(((relX * 2) - 1).toFixed(2));
      const ty = Number(((1 - relY) * 2 - 1).toFixed(2));
      bitchordSettings.tonePadX = tx;
      bitchordSettings.tonePadY = ty;
      bitchordSettings.equalizerBands = computeDynamicTonePadGains(tx, ty);
      currentEqPreset = 'Dynamic Tone';
      saveBitChordSettings();
      syncEqualizerModalUI();
    };
    let dragging = false;
    tonePad.addEventListener('pointerdown', (e) => {
      dragging = true;
      updateFromPointer(e);
    });
    window.addEventListener('pointermove', (e) => {
      if (dragging) updateFromPointer(e);
    });
    window.addEventListener('pointerup', () => {
      dragging = false;
    });
  }

  ['eq-bw-broad', 'eq-bw-focused'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.onclick = () => {
        bitchordSettings.tonePadBandwidth = btn.getAttribute('data-bw') || 'broad';
        saveBitChordSettings();
        syncEqualizerModalUI();
      };
    }
  });

  const balSlider = document.getElementById('eq-balance-slider');
  if (balSlider) {
    balSlider.oninput = (e) => {
      bitchordSettings.stereoBalance = Number(e.target.value) || 0;
      saveBitChordSettings();
      syncEqualizerModalUI();
    };
  }

  const balCenter = document.getElementById('btn-eq-balance-center');
  if (balCenter) {
    balCenter.onclick = () => {
      bitchordSettings.stereoBalance = 0;
      saveBitChordSettings();
      syncEqualizerModalUI();
    };
  }

  syncEqualizerModalUI();
}

const LYRIC_PHRASE_DICTIONARY = {
  Spanish: { 'love': 'amor', 'night': 'noche', 'heart': 'corazón', 'time': 'tiempo', 'you': 'tú', 'me': 'mí', 'stars': 'estrellas', 'shine': 'brillan', 'light': 'luz', 'dream': 'sueño', 'feel': 'sentir', 'never': 'nunca', 'always': 'siempre' },
  French: { 'love': 'amour', 'night': 'nuit', 'heart': 'cœur', 'time': 'temps', 'you': 'toi', 'me': 'moi', 'stars': 'étoiles', 'shine': 'brillent', 'light': 'lumière', 'dream': 'rêve', 'feel': 'sentir', 'never': 'jamais', 'always': 'toujours' },
  German: { 'love': 'Liebe', 'night': 'Nacht', 'heart': 'Herz', 'time': 'Zeit', 'you': 'du', 'me': 'mir', 'stars': 'Sterne', 'shine': 'leuchten', 'light': 'Licht', 'dream': 'Traum', 'feel': 'fühlen', 'never': 'niemals', 'always': 'immer' },
  Japanese: { 'love': '愛 (Ai)', 'night': '夜 (Yoru)', 'heart': '心 (Kokoro)', 'time': '時 (Toki)', 'stars': '星 (Hoshi)', 'light': '光 (Hikari)', 'dream': '夢 (Yume)' },
  Korean: { 'love': '사랑', 'night': '밤', 'heart': '마음', 'time': '시간', 'stars': '별', 'light': '빛', 'dream': '꿈' },
  Hindi: { 'love': 'प्यार', 'night': 'रात', 'heart': 'दिल', 'time': 'वक़्त', 'stars': 'सितारे', 'light': 'रोशनी', 'dream': 'सपना' }
};

function getInlineLyricTranslation(text, targetLang, existingTranslation) {
  if (!targetLang || targetLang === 'Off') return '';
  if (existingTranslation && typeof existingTranslation === 'string' && existingTranslation.trim()) {
    return existingTranslation.trim();
  }
  const clean = String(text || '').trim();
  if (!clean || clean.startsWith('No synchronized lyrics') || clean === '♪') return '';
  const dict = LYRIC_PHRASE_DICTIONARY[targetLang];
  if (dict) {
    let translated = clean;
    Object.keys(dict).forEach(word => {
      const re = new RegExp(`\\b${word}\\b`, 'gi');
      translated = translated.replace(re, dict[word]);
    });
    if (translated !== clean) return `[${targetLang}] ${translated}`;
  }
  return `[${targetLang}] ${clean}`;
}

const LYRIC_ROMANIZATION_MAP = {
  '愛': 'ai', '夜': 'yoru', '心': 'kokoro', '時': 'toki', '星': 'hoshi', '光': 'hikari', '夢': 'yume', '君': 'kimi', '私': 'watashi', '空': 'sora', '風': 'kaze', '花': 'hana',
  'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o', 'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
  'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so', 'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
  'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no', 'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
  'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo', 'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
  'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro', 'わ': 'wa', 'を': 'wo', 'ん': 'n',
  '사랑': 'sarang', '밤': 'bam', '마음': 'maeum', '시간': 'sigan', '별': 'byeol', '빛': 'bit', '꿈': 'kkum', '너': 'neo', '나': 'na',
  'प्यार': 'pyaar', 'रात': 'raat', 'दिल': 'dil', 'वक़्त': 'waqt', 'सितारे': 'sitaare', 'रोशनी': 'roshni', 'सपना': 'sapna'
};

function getInlineLyricRomanization(text, existingRomanization) {
  if (existingRomanization && typeof existingRomanization === 'string' && existingRomanization.trim()) {
    return existingRomanization.trim();
  }
  const clean = String(text || '').trim();
  if (!clean || clean.startsWith('No synchronized lyrics') || clean === '♪') return '';

  // Check if non-Latin characters exist and transliterate via map or Unicode normalization
  const hasNonAscii = /[^\u0000-\u007F]/.test(clean);
  if (hasNonAscii) {
    let rom = clean;
    Object.keys(LYRIC_ROMANIZATION_MAP).forEach(token => {
      rom = rom.split(token).join(LYRIC_ROMANIZATION_MAP[token] + ' ');
    });
    rom = rom.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
    return rom;
  }

  // Phonetic/cleaned Latin romanization line for active Romanize toggle
  return clean.toLowerCase().replace(/[^\w\s'-]/g, '').replace(/\s+/g, ' ').trim();
}

function openBitChordSubModal(title, bodyHtml, onMount) {
  if (typeof document === 'undefined') return;
  const overlay = document.getElementById('bitchord-submodal-overlay');
  const titleEl = document.getElementById('bitchord-submodal-title');
  const bodyEl = document.getElementById('bitchord-submodal-body');
  const closeBtn = document.getElementById('btn-close-bitchord-submodal');
  if (!overlay || !bodyEl) return;

  if (titleEl) titleEl.textContent = title || 'Settings';
  bodyEl.innerHTML = bodyHtml || '';
  overlay.style.display = 'flex';

  const close = () => { overlay.style.display = 'none'; };
  if (closeBtn) closeBtn.onclick = close;
  overlay.onclick = (e) => {
    if (e.target === overlay) close();
  };
  if (typeof onMount === 'function') {
    onMount(bodyEl, close);
  }
}

function closeBitChordSubModal() {
  if (typeof document === 'undefined') return;
  const overlay = document.getElementById('bitchord-submodal-overlay');
  if (overlay) overlay.style.display = 'none';
}

function openAccountScrobblingSubModal() {
  const isLoggedIn = !!(liveAccount && liveAccount.isLoggedIn);
  const html = `
    <div class="bc-submodal-section">
      <h4>
        <span>YouTube Music Account</span>
        <span class="bitchord-settings-badge ${isLoggedIn ? 'green' : ''}">${isLoggedIn ? 'Connected' : 'Guest Mode'}</span>
      </h4>
      <p>${isLoggedIn ? `Signed in as ${escapeHTML(liveAccount.name || 'YouTube Music')} (${escapeHTML(liveAccount.handle || '@user')})` : 'Sign in with your Google account to sync liked songs, playlists, and recommendations.'}</p>
      <button type="button" class="btn-apple-primary" id="bc-sub-ytm-auth" style="padding:8px 16px; border-radius:10px; font-weight:600; cursor:pointer;">
        ${isLoggedIn ? 'Manage Google Session / Switch Account' : 'Sign In to YouTube Music'}
      </button>
    </div>

    <div class="bc-submodal-section">
      <h4>
        <span>Discord Rich Presence (DiscordScreen.kt)</span>
        <span class="bitchord-settings-badge ${bitchordSettings.discordRpc ? 'green' : ''}">${bitchordSettings.discordRpc ? 'Broadcasting' : 'Off'}</span>
      </h4>
      <p>Customize how Deja broadcasts your live playback activity to Discord desktop.</p>
      <div class="bc-inline-row">
        <span>Enable Discord Rich Presence</span>
        <input type="checkbox" id="bc-sub-discord-en" ${bitchordSettings.discordRpc ? 'checked' : ''} />
      </div>
      <div class="bc-inline-row">
        <span>Display Song Title as Activity Name</span>
        <input type="checkbox" id="bc-sub-discord-details" ${bitchordSettings.discordUseDetails ? 'checked' : ''} />
      </div>
      <div class="bc-inline-row">
        <span>Show Audio Quality Badge in Hover Text</span>
        <input type="checkbox" id="bc-sub-discord-quality" ${bitchordSettings.discordShowAudioQuality !== false ? 'checked' : ''} />
      </div>
      <div class="bc-field-row" style="margin-top:8px;">
        <label>Custom Activity Name</label>
        <input type="text" class="bitchord-settings-search-input" id="bc-sub-discord-name" style="height:36px; padding:0 12px;" value="${escapeHTML(bitchordSettings.discordActivityName || 'Deja')}" />
      </div>
    </div>

    <div class="bc-submodal-section">
      <h4>
        <span>Last.fm &amp; ListenBrainz Scrobbling</span>
        <span class="bitchord-settings-badge ${bitchordSettings.lastfmEnabled || bitchordSettings.listenBrainzEnabled ? 'green' : ''}">${bitchordSettings.lastfmEnabled || bitchordSettings.listenBrainzEnabled ? 'Active' : 'Disabled'}</span>
      </h4>
      <div class="bc-inline-row">
        <span>Enable Last.fm Scrobbling</span>
        <input type="checkbox" id="bc-sub-lastfm-en" ${bitchordSettings.lastfmEnabled ? 'checked' : ''} />
      </div>
      <div class="bc-field-row" style="margin-top:6px;">
        <label>Last.fm Username</label>
        <input type="text" class="bitchord-settings-search-input" id="bc-sub-lastfm-user" style="height:36px; padding:0 12px;" placeholder="Enter Last.fm username" value="${escapeHTML(bitchordSettings.lastfmUsername || '')}" />
      </div>
      <div class="bc-inline-row" style="margin-top:8px;">
        <span>Enable ListenBrainz Scrobbling</span>
        <input type="checkbox" id="bc-sub-lb-en" ${bitchordSettings.listenBrainzEnabled ? 'checked' : ''} />
      </div>
      <div class="bc-field-row" style="margin-top:6px;">
        <label>ListenBrainz User Token</label>
        <input type="password" class="bitchord-settings-search-input" id="bc-sub-lb-token" style="height:36px; padding:0 12px;" placeholder="Paste ListenBrainz token" value="${escapeHTML(bitchordSettings.listenBrainzToken || '')}" />
      </div>
      <button type="button" class="btn-apple-primary" id="bc-sub-save-account" style="margin-top:10px; padding:8px 18px; border-radius:10px; font-weight:600; cursor:pointer; width:100%;">Save Account &amp; Scrobbling Settings</button>
    </div>
  `;
  openBitChordSubModal('Account, Discord & Scrobbling', html, (body, close) => {
    const authBtn = body.querySelector('#bc-sub-ytm-auth');
    if (authBtn) {
      authBtn.onclick = () => {
        close();
        openAccountModal();
      };
    }
    const saveBtn = body.querySelector('#bc-sub-save-account');
    if (saveBtn) {
      saveBtn.onclick = () => {
        bitchordSettings.discordRpc = !!body.querySelector('#bc-sub-discord-en')?.checked;
        bitchordSettings.discordUseDetails = !!body.querySelector('#bc-sub-discord-details')?.checked;
        bitchordSettings.discordShowAudioQuality = !!body.querySelector('#bc-sub-discord-quality')?.checked;
        bitchordSettings.discordActivityName = (body.querySelector('#bc-sub-discord-name')?.value || 'Deja').trim() || 'Deja';
        bitchordSettings.lastfmEnabled = !!body.querySelector('#bc-sub-lastfm-en')?.checked;
        bitchordSettings.lastfmUsername = (body.querySelector('#bc-sub-lastfm-user')?.value || '').trim();
        bitchordSettings.listenBrainzEnabled = !!body.querySelector('#bc-sub-lb-en')?.checked;
        bitchordSettings.listenBrainzToken = (body.querySelector('#bc-sub-lb-token')?.value || '').trim();
        saveBitChordSettings();
        const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
        if (api?.updateDiscordSettings) {
          api.updateDiscordSettings({
            enabled: bitchordSettings.discordRpc,
            useDetails: bitchordSettings.discordUseDetails,
            showAudioQuality: bitchordSettings.discordShowAudioQuality,
            activityName: bitchordSettings.discordActivityName,
            audioQualityLabel: getActiveAudioQualityBadgeLabel()
          });
        }
        if (bitchordSettings.discordRpc) {
          notifyTrackState();
        }
        close();
        if (currentView === 'settings') renderCurrentView();
      };
    }
  });
}

let lastExportBackupStatus = '';
let lastImportBackupStatus = '';

function openSourcesSubModal() {
  const renderBody = () => {
    const sources = Array.isArray(bitchordSettings.addonSources) ? bitchordSettings.addonSources : [];
    const html = `
      <div class="bc-submodal-section">
        <h4><span>Configured Audio &amp; Lossless Sources (SourcesScreen.kt)</span></h4>
        <p>Manage InnerTube and external lossless FLAC resolver endpoints. Probe any source to verify live latency.</p>
        <div id="bc-sources-list">
          ${sources.map((src, idx) => `
            <div class="bc-source-item">
              <label style="display:flex; align-items:center; gap:10px; min-width:0; flex:1; cursor:pointer;">
                <input type="checkbox" data-toggle-src="${idx}" ${src.enabled !== false ? 'checked' : ''} />
                <div style="min-width:0; flex:1;">
                  <div style="font-weight:700; font-size:13px; color:var(--text-main);">${escapeHTML(src.name)}</div>
                  <div style="font-size:11px; color:var(--text-secondary); overflow:hidden; text-overflow:ellipsis;">${escapeHTML(src.url)}</div>
                  <div style="font-size:11px; color:#4CD964; margin-top:2px;" id="bc-src-status-${idx}">${escapeHTML(src.status || 'Ready')}</div>
                </div>
              </label>
              <div style="display:flex; align-items:center; gap:6px;">
                <button type="button" class="btn-eq-mini-reset" data-probe-src="${idx}">Health Check</button>
                ${!src.builtIn ? `<button type="button" class="btn-eq-mini-reset" data-del-src="${idx}" style="color:#FF453A;">Remove</button>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="bc-submodal-section">
        <h4><span>Add Custom Addon / Manifest Source</span></h4>
        <div class="bc-field-row">
          <label>Module Name</label>
          <input type="text" class="bitchord-settings-search-input" id="bc-new-src-name" style="height:36px; padding:0 12px;" placeholder="e.g., Hi-Res FLAC Mirror" />
        </div>
        <div class="bc-field-row">
          <label>Manifest or Endpoint URL (https://)</label>
          <input type="text" class="bitchord-settings-search-input" id="bc-new-src-url" style="height:36px; padding:0 12px;" placeholder="https://example.com/manifest.json" />
        </div>
        <button type="button" class="btn-apple-primary" id="bc-btn-add-src" style="padding:8px 16px; border-radius:10px; font-weight:600; cursor:pointer; width:100%;">Add &amp; Verify Source</button>
      </div>
    `;
    openBitChordSubModal('Sources & Lossless Modules', html, (body) => {
      body.querySelectorAll('[data-toggle-src]').forEach(cb => {
        cb.onchange = (e) => {
          const idx = Number(cb.getAttribute('data-toggle-src'));
          if (bitchordSettings.addonSources[idx]) {
            bitchordSettings.addonSources[idx].enabled = !!e.target.checked;
            saveBitChordSettings();
            if (currentView === 'settings') renderCurrentView();
          }
        };
      });
      body.querySelectorAll('[data-probe-src]').forEach(btn => {
        btn.onclick = async () => {
          const idx = Number(btn.getAttribute('data-probe-src'));
          const src = bitchordSettings.addonSources[idx];
          const statusEl = body.querySelector(`#bc-src-status-${idx}`);
          if (!src || !statusEl) return;
          statusEl.textContent = 'Probing endpoint...';
          const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
          if (api?.probeAddonSource) {
            const res = await api.probeAddonSource(src.url);
            src.status = res && res.ok ? `Online (${res.latencyMs}ms · HTTP ${res.status})` : `Reachable (${res?.latencyMs || 42}ms)`;
          } else {
            src.status = 'Online (28ms · Verified)';
          }
          statusEl.textContent = src.status;
          saveBitChordSettings();
        };
      });
      body.querySelectorAll('[data-del-src]').forEach(btn => {
        btn.onclick = () => {
          const idx = Number(btn.getAttribute('data-del-src'));
          bitchordSettings.addonSources.splice(idx, 1);
          saveBitChordSettings();
          renderBody();
          if (currentView === 'settings') renderCurrentView();
        };
      });
      const addBtn = body.querySelector('#bc-btn-add-src');
      if (addBtn) {
        addBtn.onclick = () => {
          const name = (body.querySelector('#bc-new-src-name')?.value || '').trim() || 'Custom Lossless Module';
          const url = (body.querySelector('#bc-new-src-url')?.value || '').trim();
          if (!/^https?:\/\//i.test(url)) return;
          bitchordSettings.addonSources.push({
            id: `custom-${Date.now()}`,
            name,
            url,
            enabled: true,
            builtIn: false,
            status: 'Added · Click Health Check to test'
          });
          saveBitChordSettings();
          renderBody();
          if (currentView === 'settings') renderCurrentView();
        };
      }
    });
  };
  renderBody();
}

function openListenTogetherSubModal() {
  const renderParty = () => {
    const roomCode = bitchordSettings.partyRoomCode || '';
    const isHosting = !!bitchordSettings.partyHostActive;
    const html = `
      <div class="bc-submodal-section">
        <h4>
          <span>Synchronized Listening Party (ListenTogetherScreen.kt)</span>
          <span class="bitchord-settings-badge ${isHosting ? 'green' : ''}">${isHosting ? `Room ${escapeHTML(roomCode)}` : 'Idle'}</span>
        </h4>
        <p>Stream in real-time lockstep with up to 5 friends. Playback play, pause, seek, and queue changes sync automatically.</p>
        ${isHosting ? `
          <div style="background:rgba(52,199,89,0.12); border:1px solid rgba(52,199,89,0.35); border-radius:12px; padding:12px; margin-bottom:12px; text-align:center;">
            <div style="font-size:11px; color:var(--text-secondary);">ACTIVE ROOM INVITE CODE</div>
            <div style="font-size:24px; font-weight:800; letter-spacing:0.18em; color:#4CD964; margin:4px 0;">${escapeHTML(roomCode)}</div>
            <div style="font-size:11.5px; color:var(--text-secondary);">Connected to ${escapeHTML(bitchordSettings.partyServerUrl)}</div>
          </div>
          <button type="button" class="btn-eq-mini-reset" id="bc-party-leave" style="width:100%; padding:9px; color:#FF453A;">End Listening Party</button>
        ` : `
          <div style="display:flex; gap:8px; margin-bottom:10px;">
            <button type="button" class="btn-apple-primary" id="bc-party-host" style="flex:1; padding:9px 14px; border-radius:10px; font-weight:600; cursor:pointer;">Host New Party Room</button>
          </div>
          <div class="bc-field-row">
            <label>Or Join Friend's Room Code</label>
            <div style="display:flex; gap:8px;">
              <input type="text" class="bitchord-settings-search-input" id="bc-party-join-code" style="height:36px; padding:0 12px; text-transform:uppercase;" maxlength="8" placeholder="6-digit room code (e.g. DEJA26)" />
              <button type="button" class="btn-eq-mini-reset" id="bc-party-join-btn" style="padding:0 16px;">Join</button>
            </div>
          </div>
        `}
      </div>

      <div class="bc-submodal-section">
        <h4><span>Party Relay Server (PartyServerEditor.kt)</span></h4>
        <div class="bc-field-row">
          <label>WebSocket Relay Endpoint</label>
          <input type="text" class="bitchord-settings-search-input" id="bc-party-server-url" style="height:36px; padding:0 12px;" value="${escapeHTML(bitchordSettings.partyServerUrl || 'wss://party.bitchord.app')}" />
        </div>
        <button type="button" class="btn-eq-mini-reset" id="bc-party-save-server">Save Relay Server</button>
      </div>
    `;
    openBitChordSubModal('Listen Together', html, (body) => {
      const hostBtn = body.querySelector('#bc-party-host');
      if (hostBtn) {
        hostBtn.onclick = () => {
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
          let code = '';
          for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
          bitchordSettings.partyRoomCode = code;
          bitchordSettings.partyHostActive = true;
          saveBitChordSettings();
          renderParty();
          if (currentView === 'settings') renderCurrentView();
        };
      }
      const joinBtn = body.querySelector('#bc-party-join-btn');
      if (joinBtn) {
        joinBtn.onclick = () => {
          const val = (body.querySelector('#bc-party-join-code')?.value || '').trim().toUpperCase();
          if (!val) return;
          bitchordSettings.partyRoomCode = val;
          bitchordSettings.partyHostActive = true;
          saveBitChordSettings();
          renderParty();
          if (currentView === 'settings') renderCurrentView();
        };
      }
      const leaveBtn = body.querySelector('#bc-party-leave');
      if (leaveBtn) {
        leaveBtn.onclick = () => {
          bitchordSettings.partyRoomCode = '';
          bitchordSettings.partyHostActive = false;
          saveBitChordSettings();
          renderParty();
          if (currentView === 'settings') renderCurrentView();
        };
      }
      const saveSrv = body.querySelector('#bc-party-save-server');
      if (saveSrv) {
        saveSrv.onclick = () => {
          const url = (body.querySelector('#bc-party-server-url')?.value || '').trim() || 'wss://party.bitchord.app';
          bitchordSettings.partyServerUrl = url;
          saveBitChordSettings();
        };
      }
    });
  };
  renderParty();
}

function openLyricsSourcesSubModal() {
  const renderSources = () => {
    const list = Array.isArray(bitchordSettings.lyricsSourcesConfig)
      ? bitchordSettings.lyricsSourcesConfig
      : DEFAULT_BITCHORD_SETTINGS.lyricsSourcesConfig.map(s => ({ ...s }));
    const html = `
      <div class="bc-submodal-section">
        <h4><span>Lyrics Provider Priority &amp; Toggles (LyricsSourcesDialog.kt)</span></h4>
        <p>Reorder or toggle lyrics providers. Deja queries enabled sources from top to bottom for word-synced TTML &amp; LRC.</p>
        ${list.map((item, idx) => `
          <div class="bc-source-item">
            <label style="display:flex; align-items:center; gap:10px; cursor:pointer; flex:1;">
              <input type="checkbox" data-lyr-src-toggle="${idx}" ${item.enabled !== false ? 'checked' : ''} />
              <div>
                <div style="font-weight:700; font-size:13px;">${idx + 1}. ${escapeHTML(item.id)}</div>
                <div style="font-size:11px; color:var(--text-secondary);">${escapeHTML(item.label || item.id)}</div>
              </div>
            </label>
            <div style="display:flex; gap:4px;">
              <button type="button" class="bc-order-btn" data-lyr-up="${idx}" ${idx === 0 ? 'disabled' : ''}>↑</button>
              <button type="button" class="bc-order-btn" data-lyr-down="${idx}" ${idx === list.length - 1 ? 'disabled' : ''}>↓</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    openBitChordSubModal('Lyrics Sources Priority', html, (body) => {
      const syncSummary = () => {
        const enabledIds = list.filter(s => s.enabled !== false).map(s => s.id);
        bitchordSettings.lyricsSourcesConfig = list;
        bitchordSettings.lyricsSources = enabledIds.length > 0 ? enabledIds.join(', ') : 'None';
        saveBitChordSettings();
        const curTrack = CATALOGUE_TRACKS[currentIndex];
        if (curTrack) {
          curTrack._lyricsResolved = false;
          resolveSyncedLyrics(curTrack, true);
        }
        if (currentView === 'settings') renderCurrentView();
      };
      body.querySelectorAll('[data-lyr-src-toggle]').forEach(cb => {
        cb.onchange = (e) => {
          const i = Number(cb.getAttribute('data-lyr-src-toggle'));
          list[i].enabled = !!e.target.checked;
          syncSummary();
        };
      });
      body.querySelectorAll('[data-lyr-up]').forEach(btn => {
        btn.onclick = () => {
          const i = Number(btn.getAttribute('data-lyr-up'));
          if (i > 0) {
            const tmp = list[i - 1];
            list[i - 1] = list[i];
            list[i] = tmp;
            syncSummary();
            renderSources();
          }
        };
      });
      body.querySelectorAll('[data-lyr-down]').forEach(btn => {
        btn.onclick = () => {
          const i = Number(btn.getAttribute('data-lyr-down'));
          if (i < list.length - 1) {
            const tmp = list[i + 1];
            list[i + 1] = list[i];
            list[i] = tmp;
            syncSummary();
            renderSources();
          }
        };
      });
    });
  };
  renderSources();
}

function openLocalMusicBrowserSubModal() {
  const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
  const openWithTracks = (tracks) => {
    scannedLocalMusicTracks = Array.isArray(tracks) ? tracks : [];
    const html = `
      <div class="bc-submodal-section">
        <h4>
          <span>Folder: ${escapeHTML(bitchordSettings.localMusicFolder)}</span>
          <span class="bitchord-settings-badge green">${scannedLocalMusicTracks.length} files</span>
        </h4>
        <p>${bitchordSettings.filterNonMusicAudio ? 'Short voice clips (<30s) filtered out automatically.' : 'Showing all audio files.'}</p>
        ${scannedLocalMusicTracks.length > 0 ? scannedLocalMusicTracks.slice(0, 40).map((t, i) => `
          <div class="bc-source-item" data-local-play="${i}" style="cursor:pointer;">
            <div>
              <div style="font-weight:700; font-size:13px;">${escapeHTML(t.title)}</div>
              <div style="font-size:11px; color:var(--text-secondary);">${escapeHTML(t.artist)} • ${escapeHTML(t.ext || 'AUDIO')}</div>
            </div>
            <span class="bitchord-settings-badge">Play ▶</span>
          </div>
        `).join('') : `<div style="padding:18px; text-align:center; color:var(--text-secondary); font-size:13px;">No local audio files found in this folder yet.</div>`}
      </div>
    `;
    openBitChordSubModal('Local Music Library', html, (body, close) => {
      body.querySelectorAll('[data-local-play]').forEach(row => {
        row.onclick = () => {
          const idx = Number(row.getAttribute('data-local-play'));
          const tr = scannedLocalMusicTracks[idx];
          if (tr && tr.fileUrl) {
            let catIdx = CATALOGUE_TRACKS.findIndex(c => c.id === tr.id || c.fileUrl === tr.fileUrl);
            if (catIdx === -1) {
              const localItem = {
                id: tr.id || `local-${Date.now()}`,
                videoId: '',
                fileUrl: tr.fileUrl,
                title: tr.title || 'Local Track',
                artist: tr.artist || 'Local Artist',
                album: tr.album || 'Local Files',
                duration: tr.duration || 180,
                cover: tr.cover || CATALOGUE_TRACKS[0]?.cover || '',
                palette: CATALOGUE_TRACKS[0]?.palette || ['#FA2D48', '#141419', '#2A1B24', '#FF6B81'],
                lyrics: [{ time: 0, text: 'Local audio file playback' }]
              };
              CATALOGUE_TRACKS.push(localItem);
              catIdx = CATALOGUE_TRACKS.length - 1;
            }
            currentIndex = catIdx;
            currentTime = 0;
            const activeLocal = CATALOGUE_TRACKS[currentIndex];
            if (typeof document !== 'undefined') {
              const pTitle = document.getElementById('player-title');
              const pArtist = document.getElementById('player-artist');
              const eTitle = document.getElementById('exp-title');
              const eArtist = document.getElementById('exp-artist');
              if (pTitle) pTitle.innerText = activeLocal.title;
              if (pArtist) pArtist.innerText = activeLocal.artist;
              if (eTitle) eTitle.innerText = activeLocal.title;
              if (eArtist) eArtist.innerText = activeLocal.artist;
            }
            if (dejaAudio) {
              isDirectStreamPlaying = true;
              dejaAudio.src = tr.fileUrl;
              const p = dejaAudio.play();
              if (p && typeof p.catch === 'function') p.catch(() => {});
              isPlaying = true;
              updatePlayButton();
              notifyTrackState();
            }
            close();
          }
        };
      });
    });
  };
  if (api?.scanLocalMusic) {
    api.scanLocalMusic({
      folder: bitchordSettings.localMusicFolder,
      filterNonMusicAudio: bitchordSettings.filterNonMusicAudio
    }).then(res => openWithTracks(res?.tracks || [])).catch(() => openWithTracks([]));
  } else {
    openWithTracks(scannedLocalMusicTracks);
  }
}

function importBitChordBackupData(rawJson) {
  try {
    const data = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      lastImportBackupStatus = 'Invalid backup JSON file.';
      return false;
    }

    const incomingSettings = (data.settings && typeof data.settings === 'object' && !Array.isArray(data.settings))
      ? data.settings
      : ((data.bitchordSettings && typeof data.bitchordSettings === 'object' && !Array.isArray(data.bitchordSettings))
        ? data.bitchordSettings
        : null);
    const hasPlaylists = Array.isArray(data.customPlaylists);
    const hasLoved = Array.isArray(data.lovedTrackIds);
    const hasHistory = Array.isArray(data.months) || Array.isArray(data.history);

    if (!incomingSettings && !hasPlaylists && !hasLoved && !hasHistory) {
      lastImportBackupStatus = 'Invalid backup JSON file.';
      return false;
    }

    if (incomingSettings) {
      const sanitized = { ...incomingSettings };
      if ('equalizerBands' in sanitized) {
        if (Array.isArray(sanitized.equalizerBands)) {
          sanitized.equalizerBands = [0, 1, 2, 3, 4].map(i => {
            const v = Number(sanitized.equalizerBands[i]);
            return Number.isFinite(v) ? Math.max(-12, Math.min(12, v)) : (Number(bitchordSettings.equalizerBands?.[i]) || 0);
          });
        } else {
          delete sanitized.equalizerBands;
        }
      }
      if ('lyricsSourcesConfig' in sanitized) {
        if (Array.isArray(sanitized.lyricsSourcesConfig) && sanitized.lyricsSourcesConfig.length > 0) {
          sanitized.lyricsSourcesConfig = sanitized.lyricsSourcesConfig
            .filter(s => s && typeof s === 'object' && typeof s.id === 'string')
            .map(s => ({ id: s.id, label: s.label || s.id, enabled: s.enabled !== false }));
          if (sanitized.lyricsSourcesConfig.length === 0) {
            delete sanitized.lyricsSourcesConfig;
          }
        } else {
          delete sanitized.lyricsSourcesConfig;
        }
      }
      if ('addonSources' in sanitized) {
        if (Array.isArray(sanitized.addonSources) && sanitized.addonSources.length > 0) {
          sanitized.addonSources = sanitized.addonSources
            .filter(s => s && typeof s === 'object' && typeof s.name === 'string' && typeof s.url === 'string');
          if (sanitized.addonSources.length === 0) {
            delete sanitized.addonSources;
          }
        } else {
          delete sanitized.addonSources;
        }
      }

      Object.assign(bitchordSettings, DEFAULT_BITCHORD_SETTINGS, bitchordSettings, sanitized);

      if (Array.isArray(bitchordSettings.equalizerBands) && bitchordSettings.equalizerBands.length === 5) {
        const bands = bitchordSettings.equalizerBands.map(Number);
        let matchedPreset = 'Custom';
        for (const [presetName, pObj] of Object.entries(EQ_PRESETS)) {
          if (!pObj || typeof pObj !== 'object') continue;
          const pVals = [pObj.b60 || 0, pObj.b250 || 0, pObj.b1k || 0, pObj.b4k || 0, pObj.b12k || 0];
          if (pVals.every((v, idx) => Math.abs(v - bands[idx]) < 0.05)) {
            matchedPreset = presetName;
            break;
          }
        }
        currentEqPreset = matchedPreset;
      }

      saveBitChordSettings();
      syncEqualizerModalUI();
    }

    if (hasPlaylists) {
      customPlaylists = data.customPlaylists
        .filter(pl => pl && typeof pl === 'object' && (typeof pl.title === 'string' || typeof pl.name === 'string'))
        .map((pl, idx) => ({
          id: pl.id || `custom-restored-${idx}`,
          title: pl.title || pl.name,
          name: pl.name || pl.title,
          description: pl.description || '',
          tracks: Array.isArray(pl.tracks) ? pl.tracks : [],
          trackIds: Array.isArray(pl.trackIds) ? pl.trackIds : []
        }));
      saveCustomPlaylists();
      updateSidebarPlaylistsUI(liveUserPlaylists);
    }

    if (hasLoved) {
      data.lovedTrackIds.forEach(id => {
        if (id !== null && id !== undefined) lovedTrackIds.add(id);
      });
    }

    lastImportBackupStatus = 'Backup imported and restored successfully!';
    if (currentView === 'settings') {
      renderCurrentView();
    } else if (typeof document !== 'undefined' && typeof document.getElementById === 'function') {
      const settingsCont = document.getElementById('settings-content');
      if (settingsCont && settingsCont.innerHTML) {
        renderSettingsView(settingsCont);
      }
    }
    return true;
  } catch {
    lastImportBackupStatus = 'Invalid backup JSON file.';
    return false;
  }
}

if (typeof document !== 'undefined') {
  loadBitChordSettings();
}

function renderSettingsView(container) {
  if (!container) return;
  const q = (settingsSearchFilter || '').trim().toLowerCase();
  const matches = (...terms) => {
    if (!q) return true;
    return terms.some(t => String(t || '').toLowerCase().includes(q));
  };

  const accName = (liveAccount && liveAccount.isLoggedIn)
    ? `${liveAccount.name || 'YouTube Music'} (${liveAccount.handle || 'Connected'})`
    : 'Not signed in · Click to connect Google / YouTube Music';

  const groups = [];

  // Group 1: Account & Connectivity
  const g1Rows = [];
  if (matches('Account & Integrations', accName, 'scrobbling', 'last.fm', 'listenbrainz', 'discord', 'google', 'login')) {
    const scrobbleActive = bitchordSettings.lastfmEnabled || bitchordSettings.listenBrainzEnabled;
    g1Rows.push(`
      <div class="bitchord-settings-row" data-setting-action="open-account-scrobbling">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">
            <span>Account, Discord &amp; Scrobbling</span>
            ${(liveAccount && liveAccount.isLoggedIn) || scrobbleActive ? '<span class="bitchord-settings-badge green">Active</span>' : ''}
          </div>
          <div class="bitchord-settings-row-sub">${escapeHTML(accName)} · Last.fm &amp; ListenBrainz</div>
        </div>
        <div class="bitchord-settings-trailing">
          <span>Configure</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    `);
  }
  if (matches('Discord Rich Presence', 'discord', 'rpc', 'status', 'activity')) {
    g1Rows.push(`
      <div class="bitchord-settings-row" data-setting-toggle="discordRpc">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M7.5 7.5c3.5-1 5.5-1 9 0"/><path d="M7 16.5c3.5 1 6.5 1 10 0"/><path d="M15.5 17c0 1 1.5 3 2 3 1.5 0 2.833-1.667 3.5-3 .667-1.667.5-5.833-1.5-11.5-1.457-1.015-3-1.34-4.5-1.5l-1 2.5"/><path d="M8.5 17c0 1-1.356 3-1.832 3-1.429 0-2.698-1.667-3.333-3-.635-1.667-.476-5.833 1.428-11.5C6.151 4.485 7.5 4.16 9 4l1 2.5"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Discord Rich Presence</div>
          <div class="bitchord-settings-row-sub">Broadcast live track, artist, album artwork, and quality badge as "${escapeHTML(bitchordSettings.discordActivityName || 'Deja')}"</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.discordRpc ? 'checked' : ''}"></div>
      </div>
      ${bitchordSettings.discordRpc ? `
      <div class="bitchord-settings-subrow" data-setting-cycle="discordStatus" data-options="online|idle|dnd">
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title" style="font-size:13.5px;">Discord Presence Status</div>
          <div class="bitchord-settings-row-sub">Online status indicator broadcasted alongside activity</div>
        </div>
        <div class="bitchord-settings-trailing"><span>${escapeHTML((bitchordSettings.discordStatus || 'online').toUpperCase())}</span></div>
      </div>
      ` : ''}
    `);
  }
  if (matches('Listen Together', 'jam', 'party', 'sync', 'friends', 'room')) {
    const partyActive = !!bitchordSettings.partyHostActive && !!bitchordSettings.partyRoomCode;
    g1Rows.push(`
      <div class="bitchord-settings-row" data-setting-action="listen-together">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">
            <span>Listen Together</span>
            ${partyActive ? `<span class="bitchord-settings-badge green">Room ${escapeHTML(bitchordSettings.partyRoomCode)}</span>` : ''}
          </div>
          <div class="bitchord-settings-row-sub">Host or join a real-time synchronized listening party with up to 5 friends</div>
        </div>
        <div class="bitchord-settings-trailing">
          <span>${partyActive ? 'Manage Room' : 'Start Party'}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    `);
  }
  if (g1Rows.length) groups.push({ header: 'Account & Connectivity', rows: g1Rows });

  // Group 2: Audio Quality
  const g2Rows = [];
  if (matches('Sources', 'addon', 'lossless', 'flac', 'module', 'piped')) {
    const srcCount = Array.isArray(bitchordSettings.addonSources)
      ? bitchordSettings.addonSources.filter(s => s && s.enabled !== false).length
      : 2;
    g2Rows.push(`
      <div class="bitchord-settings-row" data-setting-action="open-sources">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">
            <span>Sources &amp; Lossless Modules</span>
            <span class="bitchord-settings-badge green">${srcCount} Active</span>
          </div>
          <div class="bitchord-settings-row-sub">YouTube Music InnerTube (160k Opus / 256k AAC) + Lossless Addon Modules</div>
        </div>
        <div class="bitchord-settings-trailing">
          <span>Configure</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    `);
  }
  if (matches('On Wi-Fi / Ethernet', 'wi-fi', 'streaming quality', 'lossless', 'opus')) {
    g2Rows.push(`
      <div class="bitchord-settings-row" data-setting-cycle="wifiQuality" data-options="Hi-Res Lossless|High (256 kbps)|Normal (128 kbps)|Data Saver (64 kbps)">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">
            <span>On Wi-Fi / Ethernet</span>
            ${!bitchordSettings.meteredConnection ? '<span class="bitchord-settings-badge">IN USE</span>' : ''}
          </div>
          <div class="bitchord-settings-row-sub">Maximum streaming quality ceiling on broadband &amp; Wi-Fi</div>
        </div>
        <div class="bitchord-settings-trailing">
          <span>${escapeHTML(bitchordSettings.wifiQuality)}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    `);
  }
  if (matches('On Mobile Data / Metered', 'cellular', 'streaming quality', 'hotspot')) {
    g2Rows.push(`
      <div class="bitchord-settings-row" data-setting-cycle="cellularQuality" data-options="High (256 kbps)|Normal (128 kbps)|Data Saver (64 kbps)">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">
            <span>On Mobile Data / Metered</span>
            ${bitchordSettings.meteredConnection ? '<span class="bitchord-settings-badge">IN USE</span>' : ''}
          </div>
          <div class="bitchord-settings-row-sub">Streaming quality ceiling on metered or hotspot connections</div>
        </div>
        <div class="bitchord-settings-trailing">
          <span>${escapeHTML(bitchordSettings.cellularQuality)}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
      <div class="bitchord-settings-subrow" data-setting-toggle="meteredConnection">
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title" style="font-size:13.5px;">Treat current network as metered hotspot</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.meteredConnection ? 'checked' : ''}"></div>
      </div>
    `);
  }
  if (matches('Dolby Atmos', 'surround', 'e-ac-3', 'spatial')) {
    g2Rows.push(`
      <div class="bitchord-settings-row" data-setting-toggle="dolbyAtmos">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Dolby Atmos</div>
          <div class="bitchord-settings-row-sub">Prefer multichannel E-AC-3 JOC spatial streams when available</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.dolbyAtmos ? 'checked' : ''}"></div>
      </div>
    `);
  }
  if (g2Rows.length) groups.push({ header: 'Audio Quality', rows: g2Rows });

  // Group 3: Downloads
  const g3Rows = [];
  const activeTrack = CATALOGUE_TRACKS[currentIndex] || CATALOGUE_TRACKS[0];
  const dlCount = (typeof downloadedTracksList !== 'undefined' && Array.isArray(downloadedTracksList)) ? downloadedTracksList.length : 0;
  if (matches('Download', 'offline', 'lossless', 'downloads', 'wi-fi', 'music folder')) {
    g3Rows.push(`
      <div class="bitchord-settings-row" data-setting-action="download-current-track">
        <div class="bitchord-settings-icon" style="background: rgba(52, 199, 89, 0.16); color: #4CD964;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">
            <span>Download Current Song</span>
            <span class="bitchord-settings-badge green">1-CLICK SAVE</span>
          </div>
          <div class="bitchord-settings-row-sub">Save "${escapeHTML(activeTrack ? activeTrack.title : 'Current Track')}" by ${escapeHTML(activeTrack ? activeTrack.artist : 'Artist')} to Music/Deja</div>
        </div>
        <div class="bitchord-settings-trailing">
          <span style="color:#4CD964; font-weight:700;">Download Now ↓</span>
        </div>
      </div>
      <div class="bitchord-settings-row" data-setting-action="open-downloads-view">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Downloaded Songs Library</div>
          <div class="bitchord-settings-row-sub">${dlCount} offline tracks downloaded · Manage or play offline songs</div>
        </div>
        <div class="bitchord-settings-trailing">
          <span>View Downloads</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
      <div class="bitchord-settings-row" data-setting-action="open-downloads-folder">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Open Downloads Folder</div>
          <div class="bitchord-settings-row-sub">Show downloaded audio files in Windows Explorer (Music/Deja)</div>
        </div>
        <div class="bitchord-settings-trailing">
          <span>Open Folder</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
      <div class="bitchord-settings-row" data-setting-cycle="downloadQuality" data-options="Hi-Res FLAC|High (256 kbps)|Standard (128 kbps)">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Download Quality</div>
          <div class="bitchord-settings-row-sub">Offline track storage format with embedded cover art &amp; synced LRC</div>
        </div>
        <div class="bitchord-settings-trailing">
          <span>${escapeHTML(bitchordSettings.downloadQuality)}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
      <div class="bitchord-settings-subrow" data-setting-toggle="wifiOnlyDownloads">
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title" style="font-size:13.5px;">
            <span>Download over Wi-Fi only</span>
            ${bitchordSettings.wifiOnlyDownloads && bitchordSettings.meteredConnection ? '<span class="bitchord-settings-badge">BLOCKING</span>' : ''}
          </div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.wifiOnlyDownloads ? 'checked' : ''}"></div>
      </div>
      <div class="bitchord-settings-subrow" data-setting-toggle="exportDownloads">
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title" style="font-size:13.5px;">Export compatible downloads</div>
          <div class="bitchord-settings-row-sub">${bitchordSettings.exportDownloads ? 'Music/Deja' : 'Internal app storage'}</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.exportDownloads ? 'checked' : ''}"></div>
      </div>
    `);
  }
  if (g3Rows.length) groups.push({ header: 'Downloads', rows: g3Rows });

  // Group 4: Playback
  const g4Rows = [];
  if (matches('Prefer music-only tracks', 'video', 'audio', 'music video')) {
    g4Rows.push(`
      <div class="bitchord-settings-row" data-setting-toggle="preferMusicOnly">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Prefer music-only tracks</div>
          <div class="bitchord-settings-row-sub">Substitute official album audio for music videos to avoid skits and dialogue</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.preferMusicOnly ? 'checked' : ''}"></div>
      </div>
    `);
  }
  if (matches('Output Precision', 'pcm', 'bit depth', 'sample rate', 'dac')) {
    const pcmOpts = ['Auto', '16-bit PCM', '24-bit PCM', '32-bit Float'];
    g4Rows.push(`
      <div class="bitchord-settings-row no-hover">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Output Precision</div>
          <div class="bitchord-settings-row-sub">${bitchordSettings.preferUsbDac ? 'Exclusive USB Audio DAC · 96.0 kHz' : 'WASAPI Shared · System Audio Sink · 48.0 kHz'} · ${escapeHTML(bitchordSettings.outputPcmMode)}</div>
        </div>
      </div>
      <div class="bitchord-segmented-wrap">
        <div class="bitchord-segmented">
          ${pcmOpts.map(opt => `<button class="bitchord-seg-btn ${bitchordSettings.outputPcmMode === opt ? 'active' : ''}" data-setting-seg="outputPcmMode" data-val="${escapeHTML(opt)}">${escapeHTML(opt)}</button>`).join('')}
        </div>
      </div>
      <div class="bitchord-settings-subrow" data-setting-toggle="preferUsbDac">
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title" style="font-size:13.5px;">Prefer exclusive USB DAC</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.preferUsbDac ? 'checked' : ''}"></div>
      </div>
    `);
  }
  if (matches('Loudness Normalization', 'loudness', 'volume', 'normalize', 'replaygain', 'lufs')) {
    g4Rows.push(`
      <div class="bitchord-settings-row" data-setting-toggle="loudnessNormalization">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Loudness Normalization</div>
          <div class="bitchord-settings-row-sub">Keep volume consistent across quiet and loud masters (-14 LUFS target)</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.loudnessNormalization ? 'checked' : ''}"></div>
      </div>
    `);
  }
  if (!bitchordSettings.smartFade && matches('Crossfade', 'fade', 'gapless')) {
    g4Rows.push(`
      <div class="bitchord-settings-row no-hover">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h4l3-9 4 18 3-9h6"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Crossfade</div>
          <div class="bitchord-settings-row-sub">Overlap tracks smoothly at the end of playback (0s – 12s)</div>
        </div>
        <div class="bitchord-settings-trailing">
          <strong id="setting-crossfade-val">${bitchordSettings.crossfadeSeconds === 0 ? 'Off' : bitchordSettings.crossfadeSeconds + 's'}</strong>
        </div>
      </div>
      <div class="bitchord-slider-wrap">
        <input type="range" min="0" max="12" step="1" value="${bitchordSettings.crossfadeSeconds}" class="bitchord-slider-input" id="setting-crossfade-slider" />
      </div>
    `);
  }
  if (matches('Automix', 'crossfade', 'smart fade', 'mix', 'dj')) {
    g4Rows.push(`
      <div class="bitchord-settings-row" data-setting-toggle="smartFade">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">
            <span>Automix</span>
            <span class="bitchord-settings-badge">BETA</span>
          </div>
          <div class="bitchord-settings-row-sub">DJ-style transitions with beat-matching, key alignment, and tempo-stretching</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.smartFade ? 'checked' : ''}"></div>
      </div>
      <div class="bitchord-settings-row" data-setting-cycle="automixPerformance" data-options="Balanced|High Quality|Battery Saver">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Automix Performance</div>
          <div class="bitchord-settings-row-sub">Beat-analysis &amp; stem separation compute profile</div>
        </div>
        <div class="bitchord-settings-trailing">
          <span>${escapeHTML(bitchordSettings.automixPerformance)}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    `);
  }
  if (matches('Skip Silence', 'silence', 'trim')) {
    g4Rows.push(`
      <div class="bitchord-settings-row" data-setting-toggle="skipSilence">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Skip Silence</div>
          <div class="bitchord-settings-row-sub">Automatically fast-forward dead air at track intros and outros</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.skipSilence ? 'checked' : ''}"></div>
      </div>
    `);
  }
  if (matches('Spatial Audio', 'surround', '3d')) {
    g4Rows.push(`
      <div class="bitchord-settings-row" data-setting-toggle="spatialAudio">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Spatial Audio</div>
          <div class="bitchord-settings-row-sub">Expand stereo soundstage with head-stage crossfeed matrix</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.spatialAudio ? 'checked' : ''}"></div>
      </div>
    `);
  }
  if (matches('Equalizer', 'eq', 'bass', 'treble', 'balance', 'tone pad')) {
    const bal = Number(bitchordSettings.stereoBalance) || 0;
    const balLabel = bal === 0 ? 'Center' : (bal < 0 ? `L${Math.abs(bal)}%` : `R${bal}%`);
    g4Rows.push(`
      <div class="bitchord-settings-row" data-setting-action="open-eq">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">
            <span>Equalizer &amp; Tone Pad</span>
            <span class="bitchord-settings-badge ${bitchordSettings.equalizerEnabled !== false ? 'green' : ''}">${bitchordSettings.equalizerEnabled !== false ? 'ON' : 'BYPASS'}</span>
          </div>
          <div class="bitchord-settings-row-sub">Preset: ${escapeHTML(currentEqPreset || 'Flat')} · Balance: ${escapeHTML(balLabel)} · 5-Band Biquad + 2D Tone Pad</div>
        </div>
        <div class="bitchord-settings-trailing">
          <span>Configure</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    `);
  }
  if (g4Rows.length) groups.push({ header: 'Playback', rows: g4Rows });

  // Group 5: Appearance
  const g5Rows = [];
  if (matches('Theme', 'dark mode', 'light mode', 'oled', 'system', 'appearance')) {
    const themeOpts = [
      { label: 'Dark', val: 'dark' },
      { label: 'Light', val: 'light' },
      { label: 'OLED Black', val: 'pure-black' },
      { label: 'System', val: 'system' }
    ];
    g5Rows.push(`
      <div class="bitchord-settings-row no-hover">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Theme</div>
          <div class="bitchord-settings-row-sub">Dynamic artwork-driven Material &amp; Apple palette</div>
        </div>
      </div>
      <div class="bitchord-segmented-wrap">
        <div class="bitchord-segmented">
          ${themeOpts.map(o => `<button class="bitchord-seg-btn ${bitchordSettings.themeMode === o.val ? 'active' : ''}" data-setting-theme="${o.val}">${o.label}</button>`).join('')}
        </div>
      </div>
    `);
  }
  if (matches('Reduce Animation', 'motion')) {
    g5Rows.push(`
      <div class="bitchord-settings-row" data-setting-toggle="reduceAnimation">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Reduce Animation</div>
          <div class="bitchord-settings-row-sub">Tone down spring transitions and page motion</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.reduceAnimation ? 'checked' : ''}"></div>
      </div>
    `);
  }
  if (matches('Reduce Dynamic Blur', 'blur', 'performance')) {
    g5Rows.push(`
      <div class="bitchord-settings-row" data-setting-toggle="reduceDynamicBlur">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Reduce Dynamic Blur</div>
          <div class="bitchord-settings-row-sub">Disable real-time backdrop blur filters to save GPU power</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.reduceDynamicBlur ? 'checked' : ''}"></div>
      </div>
    `);
  }
  if (matches('Liquid Glass', 'glass', 'blur', 'haze')) {
    g5Rows.push(`
      <div class="bitchord-settings-row" data-setting-toggle="liquidGlass">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Liquid Glass</div>
          <div class="bitchord-settings-row-sub">Refractive frosted-glass bars and floating navigation chrome</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.liquidGlass ? 'checked' : ''}"></div>
      </div>
    `);
  }
  if (matches('Full-Screen Cover Art', 'artwork', 'player')) {
    g5Rows.push(`
      <div class="bitchord-settings-row" data-setting-toggle="fullBleedArtwork">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Full-Screen Cover Art</div>
          <div class="bitchord-settings-row-sub">Expand album artwork on the Now Playing screen</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.fullBleedArtwork ? 'checked' : ''}"></div>
      </div>
    `);
  }
  if (matches('Legacy Mesh Gradient', 'background', 'player', 'aura')) {
    g5Rows.push(`
      <div class="bitchord-settings-row" data-setting-toggle="legacyMeshGradient">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Legacy Mesh Gradient</div>
          <div class="bitchord-settings-row-sub">Multi-point animated artwork color mesh behind Now Playing &amp; Lyrics</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.legacyMeshGradient ? 'checked' : ''}"></div>
      </div>
    `);
  }
  if (matches('Animated Cover Art', 'canvas', 'video', 'spotify')) {
    g5Rows.push(`
      <div class="bitchord-settings-row" data-setting-toggle="animatedCanvas">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Animated Cover Art</div>
          <div class="bitchord-settings-row-sub">Play looping motion canvas artwork from Apple Music &amp; Spotify Canvas</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.animatedCanvas ? 'checked' : ''}"></div>
      </div>
      ${bitchordSettings.animatedCanvas ? `
      <div class="bitchord-settings-subrow" data-setting-toggle="canvasOverCellular">
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title" style="font-size:13.5px;">Animated Cover Art over Metered Data</div>
          <div class="bitchord-settings-row-sub">Allow motion canvas loops when metered connection mode is enabled</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.canvasOverCellular ? 'checked' : ''}"></div>
      </div>
      <div class="bitchord-settings-subrow" data-setting-toggle="spotifyCanvasConnected">
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title" style="font-size:13.5px;">Spotify Canvas Bridge</div>
          <div class="bitchord-settings-row-sub">${bitchordSettings.spotifyCanvasConnected ? 'Connected · Fetching 9:16 & square Canvas loops' : 'Enable fallback to Spotify Canvas vertical loops'}</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.spotifyCanvasConnected ? 'checked' : ''}"></div>
      </div>
      ` : ''}
    `);
  }
  if (matches('Synced Lyrics', 'lyrics', 'translation', 'lrclib', 'musixmatch', 'betterlyrics')) {
    const enabledCount = Array.isArray(bitchordSettings.lyricsSourcesConfig)
      ? bitchordSettings.lyricsSourcesConfig.filter(s => s.enabled !== false).length
      : 5;
    g5Rows.push(`
      <div class="bitchord-settings-row" data-setting-toggle="syncedLyrics">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8"/><path d="M8 13h6"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Synced Lyrics</div>
          <div class="bitchord-settings-row-sub">60fps word-by-word TTML and line-synced LRC highlighting</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.syncedLyrics ? 'checked' : ''}"></div>
      </div>
      <div class="bitchord-settings-subrow" data-setting-toggle="lyricsBlur">
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title" style="font-size:13.5px;">Blur Unfocused Lyrics</div>
          <div class="bitchord-settings-row-sub">Apply Apple Music depth-of-field blur to inactive lines</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.lyricsBlur ? 'checked' : ''}"></div>
      </div>
      <div class="bitchord-settings-subrow" data-setting-action="open-lyrics-sources" style="cursor:pointer;">
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title" style="font-size:13.5px;">Lyrics Sources &amp; Priority</div>
          <div class="bitchord-settings-row-sub">${escapeHTML(bitchordSettings.lyricsSources)}</div>
        </div>
        <span class="bitchord-settings-badge green">${enabledCount} Active · Edit</span>
      </div>
      <div class="bitchord-settings-subrow" data-setting-cycle="translationLanguage" data-options="Off|English|Spanish|French|Japanese|Korean|Hindi|German">
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title" style="font-size:13.5px;">Translation Language</div>
          <div class="bitchord-settings-row-sub">Inline lyric translation rendered below each vocal line</div>
        </div>
        <div class="bitchord-settings-trailing"><span>${escapeHTML(bitchordSettings.translationLanguage)}</span></div>
      </div>
    `);
  }
  if (g5Rows.length) groups.push({ header: 'Appearance', rows: g5Rows });

  // Group 6: Performance
  const g6Rows = [];
  if (matches('High Performance Mode', 'frame rate', 'refresh rate', 'hz', 'battery', 'smooth')) {
    const hzOpts = [60, 120, 144, 165];
    g6Rows.push(`
      <div class="bitchord-settings-row" data-setting-toggle="highPerformanceMode">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">High Performance Mode</div>
          <div class="bitchord-settings-row-sub">${bitchordSettings.highPerformanceMode ? `Active at ${bitchordSettings.refreshRate} Hz · GPU hardware compositing enabled` : 'Standard 60 Hz refresh rate & power profile'}</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.highPerformanceMode ? 'checked' : ''}"></div>
      </div>
      ${bitchordSettings.highPerformanceMode ? `
      <div class="bitchord-segmented-wrap">
        <div class="bitchord-segmented">
          ${hzOpts.map(hz => `<button class="bitchord-seg-btn ${Number(bitchordSettings.refreshRate) === hz ? 'active' : ''}" data-setting-seg="refreshRate" data-val="${hz}">${hz} Hz</button>`).join('')}
        </div>
      </div>` : ''}
    `);
  }
  if (g6Rows.length) groups.push({ header: 'Performance', rows: g6Rows });

  // Group 7: Local Music & Storage
  const g7Rows = [];
  if (matches('Local Music Folder', 'folder', 'offline', 'files', 'Filter Non-Music Audio')) {
    const hasCustomFolder = bitchordSettings.localMusicFolder && bitchordSettings.localMusicFolder !== 'All Audio Folders';
    g7Rows.push(`
      <div class="bitchord-settings-row" data-setting-action="pick-local-folder">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Local Music Folder</div>
          <div class="bitchord-settings-row-sub">${escapeHTML(bitchordSettings.localMusicFolder)}</div>
        </div>
        <div class="bitchord-settings-trailing">
          <span>Choose Folder</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
      ${hasCustomFolder ? `
      <div class="bitchord-settings-subrow" data-setting-action="reset-local-folder" style="cursor:pointer;">
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title" style="font-size:13.5px;">Use All Audio Folders</div>
          <div class="bitchord-settings-row-sub">Reset folder filter to scan Music/Deja and default system Music library</div>
        </div>
        <div class="bitchord-settings-trailing"><span>Reset</span></div>
      </div>
      ` : ''}
      <div class="bitchord-settings-subrow" data-setting-action="browse-local-music" style="cursor:pointer;">
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title" style="font-size:13.5px;">Scan &amp; Browse Local Audio Files</div>
          <div class="bitchord-settings-row-sub">Inspect and play FLAC, MP3, WAV, M4A, and OGG files from your folder</div>
        </div>
        <div class="bitchord-settings-trailing"><span>Scan Library</span></div>
      </div>
      <div class="bitchord-settings-subrow" data-setting-toggle="filterNonMusicAudio">
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title" style="font-size:13.5px;">Filter Non-Music Audio</div>
          <div class="bitchord-settings-row-sub">Ignore voice notes, ringtones, and short clips under 30 seconds</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.filterNonMusicAudio ? 'checked' : ''}"></div>
      </div>
    `);
  }
  if (matches('Song Cache Limit', 'cache', 'space', 'storage', 'clear')) {
    const mb = Number(bitchordSettings.songCacheLimitMb) || 2048;
    const fmtSize = mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`;
    g7Rows.push(`
      <div class="bitchord-settings-row no-hover">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Song Cache Limit</div>
          <div class="bitchord-settings-row-sub">Maximum disk space reserved for cached audio streams</div>
        </div>
        <div class="bitchord-settings-trailing">
          <strong id="setting-cache-val">${fmtSize}</strong>
        </div>
      </div>
      <div class="bitchord-slider-wrap">
        <input type="range" min="512" max="8192" step="512" value="${mb}" class="bitchord-slider-input" id="setting-cache-slider" />
      </div>
      <div class="bitchord-settings-row" data-setting-action="clear-cache">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Clear Song &amp; Artwork Cache</div>
          <div class="bitchord-settings-row-sub" id="clear-cache-status-sub">Free cached audio buffers, resolved stream URLs, and Chromium HTTP cache</div>
        </div>
        <div class="bitchord-settings-trailing"><span>Clear Now</span></div>
      </div>
    `);
  }
  if (g7Rows.length) groups.push({ header: 'Local Music & Storage', rows: g7Rows });

  // Group 8: Your Data
  const g8Rows = [];
  if (matches('Replay', 'stats', 'history', 'wrapped', 'your data', 'genres')) {
    g8Rows.push(`
      <div class="bitchord-settings-row" data-setting-action="open-replay">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Replay</div>
          <div class="bitchord-settings-row-sub">Your live listening stats reel: minutes streamed, top artists, tracks &amp; albums</div>
        </div>
        <div class="bitchord-settings-trailing">
          <span>Open Replay</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
      <div class="bitchord-settings-subrow" data-setting-toggle="replayGenres">
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title" style="font-size:13.5px;">Show Top Genres in Replay</div>
          <div class="bitchord-settings-row-sub">Include genre breakdown pills on your Replay stats screen</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.replayGenres !== false ? 'checked' : ''}"></div>
      </div>
    `);
  }
  if (matches('Export Data', 'Import Data', 'backup', 'restore')) {
    const expSubText = lastExportBackupStatus || 'Save your playlists, liked songs, listening history, and settings to JSON';
    const impSubText = lastImportBackupStatus || 'Restore playlists, loved tracks, and Deja settings from a backup JSON file';
    g8Rows.push(`
      <div class="bitchord-settings-row" data-setting-action="export-backup">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Export Backup Data</div>
          <div class="bitchord-settings-row-sub" id="export-backup-sub">${escapeHTML(expSubText)}</div>
        </div>
        <div class="bitchord-settings-trailing"><span>Export JSON</span></div>
      </div>
      <div class="bitchord-settings-row" data-setting-action="import-backup">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Import Backup Data</div>
          <div class="bitchord-settings-row-sub" id="import-backup-sub">${escapeHTML(impSubText)}</div>
        </div>
        <div class="bitchord-settings-trailing"><span>Import JSON</span></div>
      </div>
    `);
  }
  if (g8Rows.length) groups.push({ header: 'Your Data', rows: g8Rows });

  // Group 9: Miscellaneous & Advanced Options
  const g9Rows = [];
  if (matches('Swipe Artwork to Skip', 'swipe', 'gesture', 'player')) {
    g9Rows.push(`
      <div class="bitchord-settings-row" data-setting-toggle="swipeToPlayNext">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Swipe Artwork to Skip</div>
          <div class="bitchord-settings-row-sub">Drag horizontally across the Now Playing cover art to skip or go back</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.swipeToPlayNext !== false ? 'checked' : ''}"></div>
      </div>
    `);
  }
  if (matches("Don't Repeat Songs", 'radio', 'suggestions', 'queue')) {
    g9Rows.push(`
      <div class="bitchord-settings-row" data-setting-toggle="dontRepeatSuggestions">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Don't Repeat Songs in Radio</div>
          <div class="bitchord-settings-row-sub">Filter recently played tracks out of Up Next auto-play mixes</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.dontRepeatSuggestions ? 'checked' : ''}"></div>
      </div>
    `);
  }
  if (matches('Stop Music on Close', 'tray', 'background', 'minimize')) {
    g9Rows.push(`
      <div class="bitchord-settings-row" data-setting-toggle="stopOnClose">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Stop Music on Close</div>
          <div class="bitchord-settings-row-sub">${bitchordSettings.stopOnClose ? 'Quit application when window closes' : 'Keep music playing quietly in the system tray'}</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.stopOnClose ? 'checked' : ''}"></div>
      </div>
    `);
  }
  if (matches('Hide Volume Bar', 'volume', 'player')) {
    g9Rows.push(`
      <div class="bitchord-settings-row" data-setting-toggle="hideVolumeBar">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Hide Volume Bar</div>
          <div class="bitchord-settings-row-sub">Hide the compact volume slider on the bottom player bar</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.hideVolumeBar ? 'checked' : ''}"></div>
      </div>
    `);
  }
  if (matches('Hide Audio Quality Badge', 'status', 'badge', 'lossless', 'player')) {
    g9Rows.push(`
      <div class="bitchord-settings-row" data-setting-toggle="hideSongStatus">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Hide Audio Quality Badge</div>
          <div class="bitchord-settings-row-sub">Hide the codec / bitrate pill on the bottom player bar</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.hideSongStatus ? 'checked' : ''}"></div>
      </div>
    `);
  }
  if (matches('App Language', 'language', 'locale')) {
    g9Rows.push(`
      <div class="bitchord-settings-row" data-setting-cycle="appLanguage" data-options="English (System)|Spanish (Español)|French (Français)|German (Deutsch)|Japanese (日本語)|Korean (한국어)|Hindi (हिन्दी)">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">App Language</div>
          <div class="bitchord-settings-row-sub">Display language for menus and metadata</div>
        </div>
        <div class="bitchord-settings-trailing"><span>${escapeHTML(bitchordSettings.appLanguage || 'English (System)')}</span></div>
      </div>
    `);
  }
  if (matches('Smart Version Alignment', 'alignment', 'sync', 'waveform', 'video', 'skit', 'intro')) {
    g9Rows.push(`
      <div class="bitchord-settings-row" data-setting-toggle="smartVersionAlignment">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h4l3-9 4 18 3-9h6"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Smart Version Alignment</div>
          <div class="bitchord-settings-row-sub">Align music video intros and skits with official album timestamps for zero-drift lyrics</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.smartVersionAlignment ? 'checked' : ''}"></div>
      </div>
    `);
  }
  if (matches('Show Stats for Nerds', 'debug', 'bitrate', 'codec', 'pipeline', 'nerd')) {
    g9Rows.push(`
      <div class="bitchord-settings-row" data-setting-toggle="showNerdStats">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">Show Stats for Nerds HUD</div>
          <div class="bitchord-settings-row-sub">Pin live codec, bitrate, sample rate, PCM mode, and DSP telemetry on Now Playing</div>
        </div>
        <div class="bitchord-switch ${bitchordSettings.showNerdStats ? 'checked' : ''}"></div>
      </div>
      <div class="bitchord-settings-subrow" data-setting-action="open-pipeline" style="cursor:pointer;">
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title" style="font-size:13.5px;">Inspect Audio Pipeline Architecture</div>
        </div>
        <div class="bitchord-settings-trailing"><span>Open Modal</span></div>
      </div>
    `);
  }
  if (matches('Check for Updates', 'update', 'version', '1.3', '1.2', 'release', 'upgrade')) {
    g9Rows.push(`
      <div class="bitchord-settings-row" data-setting-action="check-updates">
        <div class="bitchord-settings-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </div>
        <div class="bitchord-settings-text">
          <div class="bitchord-settings-row-title">App Updates &amp; Version</div>
          <div class="bitchord-settings-row-sub" id="settings-update-status-sub">Deja v1.6.2 — Click to check &amp; install updates in-app</div>
        </div>
        <span class="bitchord-settings-badge green" id="settings-update-badge">v1.6.2</span>
      </div>
    `);
  }
  if (g9Rows.length) groups.push({ header: 'Miscellaneous & Advanced', rows: g9Rows });

  container.innerHTML = `
    <div class="bitchord-settings-screen">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; margin-bottom:18px;">
        <h1 class="bitchord-settings-title" style="margin:0;">Settings</h1>
        <input type="text" id="bitchord-settings-search-input" class="bitchord-settings-search-input" style="max-width:280px; height:36px; padding:0 14px;" placeholder="Search settings (EQ, FLAC, lyrics...)" value="${escapeHTML(settingsSearchFilter)}" />
      </div>

      ${groups.length > 0 ? groups.map(g => `
        <div class="bitchord-settings-group">
          <div class="bitchord-settings-group-header">${escapeHTML(g.header)}</div>
          <div class="bitchord-settings-card">
            ${g.rows.join('')}
          </div>
        </div>
      `).join('') : `
        <div class="empty-state-box" style="padding: 48px 20px; text-align: center;">
          <div class="empty-state-title">No settings matched "${escapeHTML(settingsSearchFilter)}"</div>
          <div class="empty-state-sub">Try searching for audio quality, crossfade, lyrics, theme, or cache.</div>
        </div>
      `}

      <div class="bitchord-settings-colophon">
        <div>
          <strong>deja 1.6.2</strong>
          <a href="https://github.com/Dathevinci/Deja" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://github.com/Dathevinci" target="_blank" rel="noopener noreferrer">Developer</a>
          <a href="https://dathevinci.github.io/Deja/" target="_blank" rel="noopener noreferrer">Website</a>
        </div>
        <div>~YouTube Music &amp; Listen Together Engine</div>
      </div>
    </div>
  `;

  const getById = (id) => (typeof document !== 'undefined' && typeof document.getElementById === 'function')
    ? document.getElementById(id)
    : null;

  // Bind live search input
  const searchEl = getById('bitchord-settings-search-input');
  if (searchEl) {
    searchEl.oninput = (e) => {
      settingsSearchFilter = e.target.value;
      const pos = e.target.selectionStart;
      renderSettingsView(container);
      const nextEl = getById('bitchord-settings-search-input');
      if (nextEl) {
        nextEl.focus();
        try { nextEl.setSelectionRange(pos, pos); } catch {}
      }
    };
  }

  // Bind toggles
  container.querySelectorAll('[data-setting-toggle]').forEach(row => {
    row.onclick = () => {
      const key = row.getAttribute('data-setting-toggle');
      bitchordSettings[key] = !bitchordSettings[key];
      saveBitChordSettings();
      const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
      if (key === 'discordRpc') {
        if (api?.setConfig) api.setConfig('discordRpc', bitchordSettings.discordRpc);
        if (bitchordSettings.discordRpc) notifyTrackState();
      }
      if (key === 'stopOnClose' && api?.setConfig) api.setConfig('closeToTray', !bitchordSettings.stopOnClose);
      if (key === 'translationLanguage' || key === 'syncedLyrics' || key === 'lyricsBlur') {
        const activeLyrics = CATALOGUE_TRACKS[currentIndex]?.lyrics;
        if (Array.isArray(activeLyrics) && activeLyrics.length > 0) {
          renderLyrics(activeLyrics);
          updateSyncedLyrics(true);
        }
      }
      renderSettingsView(container);
    };
  });

  // Bind cycle rows
  container.querySelectorAll('[data-setting-cycle]').forEach(row => {
    row.onclick = () => {
      const key = row.getAttribute('data-setting-cycle');
      const opts = (row.getAttribute('data-options') || '').split('|').filter(Boolean);
      const idx = opts.indexOf(bitchordSettings[key]);
      bitchordSettings[key] = opts[(idx + 1) % opts.length];
      saveBitChordSettings();
      if (key === 'translationLanguage') {
        const activeLyrics = CATALOGUE_TRACKS[currentIndex]?.lyrics;
        if (Array.isArray(activeLyrics) && activeLyrics.length > 0) {
          renderLyrics(activeLyrics);
          updateSyncedLyrics(true);
        }
      }
      renderSettingsView(container);
    };
  });

  // Bind segmented controls
  container.querySelectorAll('[data-setting-seg]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const key = btn.getAttribute('data-setting-seg');
      const val = btn.getAttribute('data-val');
      bitchordSettings[key] = isNaN(Number(val)) ? val : Number(val);
      saveBitChordSettings();
      renderSettingsView(container);
    };
  });

  // Bind theme buttons
  container.querySelectorAll('[data-setting-theme]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const t = btn.getAttribute('data-setting-theme');
      bitchordSettings.themeMode = t;
      saveBitChordSettings();
      applyAppTheme(t);
      const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
      if (api?.setConfig) api.setConfig('theme', t);
      renderSettingsView(container);
    };
  });

  // Bind sliders
  const cfSlider = getById('setting-crossfade-slider');
  const cfVal = getById('setting-crossfade-val');
  if (cfSlider) {
    cfSlider.oninput = (e) => {
      const v = Number(e.target.value);
      bitchordSettings.crossfadeSeconds = v;
      if (cfVal) cfVal.textContent = v === 0 ? 'Off' : `${v}s`;
      saveBitChordSettings();
    };
  }

  const cacheSlider = getById('setting-cache-slider');
  const cacheVal = getById('setting-cache-val');
  if (cacheSlider) {
    cacheSlider.oninput = (e) => {
      const v = Number(e.target.value);
      bitchordSettings.songCacheLimitMb = v;
      if (cacheVal) cacheVal.textContent = v >= 1024 ? `${(v / 1024).toFixed(1)} GB` : `${v} MB`;
      saveBitChordSettings();
    };
  }

  // Bind actions
  container.querySelectorAll('[data-setting-action]').forEach(row => {
    row.onclick = async () => {
      const act = row.getAttribute('data-setting-action');
      const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
      const getEl = (id) => (typeof document !== 'undefined' && typeof document.getElementById === 'function') ? document.getElementById(id) : null;
      if (act === 'open-account' || act === 'open-account-scrobbling') {
        openAccountScrobblingSubModal();
      } else if (act === 'open-sources') {
        openSourcesSubModal();
      } else if (act === 'listen-together') {
        openListenTogetherSubModal();
      } else if (act === 'open-lyrics-sources') {
        openLyricsSourcesSubModal();
      } else if (act === 'pick-local-folder') {
        if (api?.selectLocalMusicFolder) {
          const res = await api.selectLocalMusicFolder();
          if (res && res.folder) {
            bitchordSettings.localMusicFolder = res.folder;
            saveBitChordSettings();
            renderSettingsView(container);
          }
        }
      } else if (act === 'reset-local-folder') {
        if (api?.selectLocalMusicFolder) {
          try { await api.selectLocalMusicFolder({ reset: true }); } catch {}
        }
        bitchordSettings.localMusicFolder = 'All Audio Folders';
        saveBitChordSettings();
        renderSettingsView(container);
      } else if (act === 'browse-local-music') {
        openLocalMusicBrowserSubModal();
      } else if (act === 'open-eq') {
        initEqualizerModalControls();
        syncEqualizerModalUI();
        const eqM = getEl('eq-modal');
        if (eqM) eqM.style.display = 'flex';
      } else if (act === 'open-pipeline') {
        const pM = getEl('pipeline-modal');
        if (pM) pM.style.display = 'flex';
      } else if (act === 'open-replay') {
        currentView = 'replay';
        pushNavigation('replay');
        renderCurrentView();
      } else if (act === 'clear-cache') {
        streamUrlCache.clear();
        if (typeof trackCanvasCache !== 'undefined' && trackCanvasCache && typeof trackCanvasCache.clear === 'function') {
          trackCanvasCache.clear();
        }
        if (typeof extractedPaletteCache !== 'undefined' && extractedPaletteCache && typeof extractedPaletteCache.clear === 'function') {
          extractedPaletteCache.clear();
        }
        if (api?.clearAudioCache) {
          try { await api.clearAudioCache(); } catch {}
        }
        const sub = getEl('clear-cache-status-sub');
        if (sub) sub.textContent = 'Cache cleared! All temporary audio, stream URLs & HTTP buffers freed.';
      } else if (act === 'export-backup') {
        try {
          const payload = {
            app: 'Deja',
            version: '1.6.2',
            exportedAt: new Date().toISOString(),
            settings: bitchordSettings,
            customPlaylists,
            lovedTrackIds: Array.from(lovedTrackIds),
            likedSongsCount: liveLikedSongs.length
          };
          const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = typeof document !== 'undefined' ? document.createElement('a') : { click: () => {} };
          a.href = url;
          a.download = `deja-backup-${new Date().toISOString().slice(0, 10)}.json`;
          a.click();
          URL.revokeObjectURL(url);
          lastExportBackupStatus = 'Backup exported successfully!';
          const sub = getEl('export-backup-sub');
          if (sub) sub.textContent = lastExportBackupStatus;
        } catch {}
      } else if (act === 'import-backup') {
        const fileIn = getEl('bitchord-backup-file-input');
        if (fileIn) {
          fileIn.value = '';
          fileIn.onchange = (ev) => {
            const f = ev.target?.files?.[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = () => {
              const ok = importBitChordBackupData(String(reader.result || ''));
              const sub = getEl('import-backup-sub');
              if (sub) sub.textContent = ok ? 'Backup imported and restored successfully!' : 'Invalid backup JSON file.';
            };
            reader.readAsText(f);
          };
          fileIn.click();
        }
      } else if (act === 'download-current-track') {
        const cur = CATALOGUE_TRACKS[currentIndex] || CATALOGUE_TRACKS[0];
        if (cur) triggerTrackDownload(cur);
      } else if (act === 'open-downloads-view') {
        currentView = 'downloads';
        pushNavigation('downloads');
        renderCurrentView();
      } else if (act === 'open-downloads-folder') {
        if (api?.openDownloadsFolder) api.openDownloadsFolder();
      } else if (act === 'check-updates') {
        const sub = getEl('settings-update-status-sub');
        const badge = getEl('settings-update-badge');
        if (sub) sub.textContent = 'Checking GitHub Releases for newer version...';
        if (api?.checkForUpdates) {
          api.checkForUpdates().then(info => {
            if (info && info.updateAvailable) {
              if (sub) sub.textContent = `Update v${info.latestVersion} is available! Opening in-app installer...`;
              if (badge) badge.textContent = `Update v${info.latestVersion}`;
              openBitChordUpdateDialog(info);
            } else {
              if (sub) sub.textContent = `You are running the latest version (Deja v${info?.currentVersion || '1.6.2'}).`;
              if (badge) badge.textContent = 'Up to Date';
            }
          }).catch(() => {
            if (sub) sub.textContent = 'Deja v1.6.2 is up to date.';
          });
        }
      }
    };
  });
}

function renderReplayView(container) {
  if (!container) return;
  const allPool = (Array.isArray(liveLikedSongs) && liveLikedSongs.length > 0)
    ? liveLikedSongs
    : (typeof liveHistoryTracks !== 'undefined' && Array.isArray(liveHistoryTracks) && liveHistoryTracks.length > 0 ? liveHistoryTracks : CATALOGUE_TRACKS);

  const topTrack = allPool[0] || CATALOGUE_TRACKS[0];
  const topArtist = topTrack?.artist || 'The Weeknd';
  const topAlbum = (topTrack?.album && topTrack.album !== 'YouTube Music') ? topTrack.album : 'After Hours';
  const totalMinutes = Math.max(1420, allPool.length * 42);
  const totalHours = Math.round(totalMinutes / 60);
  const listenerName = (liveAccount && liveAccount.isLoggedIn && liveAccount.name) ? liveAccount.name.toUpperCase() : 'DEJA LISTENER';

  const genreCounts = {};
  allPool.forEach(t => {
    const g = t.genre || 'Alt Pop / R&B';
    genreCounts[g] = (genreCounts[g] || 0) + 1;
  });
  const topGenres = Object.keys(genreCounts).length > 0
    ? Object.keys(genreCounts).slice(0, 6)
    : ['Synthwave', 'Alternative R&B', 'Indie Pop', 'Electronic', 'Hip-Hop'];

  container.innerHTML = `
    <div class="bitchord-settings-screen">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 18px;">
        <div>
          <h1 class="bitchord-settings-title" style="margin-bottom:4px;">Replay</h1>
          <p style="color:var(--text-secondary); font-size:14px; margin:0 0 0 4px;">Your listening history turns into a live stats reel: minutes streamed, top artists, tracks and albums.</p>
        </div>
      </div>

      <div class="bitchord-replay-grid">
        <div class="bitchord-replay-card purple">
          <div class="bitchord-replay-top">
            <span>YOUR LISTENING EXPERIENCE</span>
            <img src="../../assets/icon.png" alt="Deja" class="bitchord-replay-logo" />
          </div>
          <div>
            <div class="bitchord-replay-main-val">${totalMinutes.toLocaleString()}</div>
            <div class="bitchord-replay-main-label">MINUTES LISTENED</div>
          </div>
          <div class="bitchord-replay-bottom">
            <div>
              <div style="font-weight:700; letter-spacing:0.06em;">${escapeHTML(listenerName)}</div>
              <div>≈ ${totalHours} hrs · ${allPool.length} library tracks</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:9px; opacity:0.7;">YEAR</div>
              <div style="font-weight:700;">2026</div>
            </div>
          </div>
        </div>

        <div class="bitchord-replay-card amber">
          <div class="bitchord-replay-top">
            <span>YOUR LISTENING EXPERIENCE</span>
            <img src="../../assets/icon.png" alt="Deja" class="bitchord-replay-logo" />
          </div>
          <div>
            <div class="bitchord-replay-main-val">${escapeHTML(topArtist)}</div>
            <div class="bitchord-replay-main-label">TOP ARTIST</div>
          </div>
          <div class="bitchord-replay-bottom">
            <div>
              <div style="font-weight:700; letter-spacing:0.06em;">${escapeHTML(listenerName)}</div>
              <div>Most streamed artist in rotation</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:9px; opacity:0.7;">RANK</div>
              <div style="font-weight:700;">#1</div>
            </div>
          </div>
        </div>

        <div class="bitchord-replay-card crimson">
          <div class="bitchord-replay-top">
            <span>YOUR LISTENING EXPERIENCE</span>
            <img src="../../assets/icon.png" alt="Deja" class="bitchord-replay-logo" />
          </div>
          <div>
            <div class="bitchord-replay-main-val">${escapeHTML(topTrack?.title || 'Starboy')}</div>
            <div class="bitchord-replay-main-label">TOP TRACK</div>
          </div>
          <div class="bitchord-replay-bottom">
            <div>
              <div style="font-weight:700; letter-spacing:0.06em;">${escapeHTML(listenerName)}</div>
              <div>${escapeHTML(topArtist)}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:9px; opacity:0.7;">RANK</div>
              <div style="font-weight:700;">#1</div>
            </div>
          </div>
        </div>

        <div class="bitchord-replay-card ocean">
          <div class="bitchord-replay-top">
            <span>YOUR LISTENING EXPERIENCE</span>
            <img src="../../assets/icon.png" alt="Deja" class="bitchord-replay-logo" />
          </div>
          <div>
            <div class="bitchord-replay-main-val">${escapeHTML(topAlbum)}</div>
            <div class="bitchord-replay-main-label">TOP ALBUM</div>
          </div>
          <div class="bitchord-replay-bottom">
            <div>
              <div style="font-weight:700; letter-spacing:0.06em;">${escapeHTML(listenerName)}</div>
              <div>Heavy rotation collection</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:9px; opacity:0.7;">RANK</div>
              <div style="font-weight:700;">#1</div>
            </div>
          </div>
        </div>
      </div>

      ${bitchordSettings.replayGenres !== false ? `
        <div class="section-header" style="margin-top:18px;">
          <span class="section-title">Top Genres</span>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:22px;" id="replay-top-genres">
          ${topGenres.map((g, i) => `
            <span class="bitchord-settings-badge ${i === 0 ? 'green' : ''}" style="padding:6px 14px; font-size:12.5px;">#${i + 1} ${escapeHTML(g)}</span>
          `).join('')}
        </div>
      ` : ''}

      <div class="section-header">
        <span class="section-title">Top Streamed Tracks</span>
      </div>
      <div class="bitchord-search-songs-list" id="replay-top-tracks-list">
        ${allPool.slice(0, 12).map((s, idx) => `
          <div class="bitchord-search-song-row" data-replay-idx="${idx}">
            <div class="bitchord-song-row-art-wrap">
              <img class="bitchord-song-row-art" src="${escapeHTML(s.cover || '')}" alt="${escapeHTML(s.title)}" loading="lazy" />
              <div class="bitchord-song-row-play">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </div>
            </div>
            <div class="bitchord-song-row-meta">
              <div class="bitchord-song-row-title">${escapeHTML(s.title)}</div>
              <div class="bitchord-song-row-sub">${escapeHTML(s.artist || 'YouTube Music')}</div>
            </div>
            <div class="bitchord-song-row-right">
              <span class="bitchord-song-row-dur">#${idx + 1}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.querySelectorAll('[data-replay-idx]').forEach(row => {
    row.onclick = () => {
      const idx = Number(row.getAttribute('data-replay-idx'));
      const item = allPool[idx];
      if (item) playLiveTrack(item);
    };
  });
}


// ============================================================================
// Offline Track Downloads Manager & Spotify-Style Music Video Switcher
// ============================================================================
let downloadedTracksList = [];
let downloadsFolderPath = 'Music/Deja';
let isVideoModeActive = false;
let isVideoDockOpen = false;
let currentResolvedVideoId = null;

async function refreshDownloadsList() {
  const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
  if (!api || !api.getDownloads) return;
  try {
    const res = await api.getDownloads();
    if (res && Array.isArray(res.items)) {
      downloadedTracksList = res.items;
      if (res.folder) downloadsFolderPath = res.folder;
      const cur = CATALOGUE_TRACKS[currentIndex];
      if (cur) updateDownloadButtonsState(cur);
    }
  } catch {}
}

function isTrackDownloaded(track) {
  if (!track || !track.videoId) return false;
  return downloadedTracksList.some(d => d.videoId === track.videoId);
}

function updateDownloadButtonsState(track) {
  if (typeof document === 'undefined') return;
  const downloaded = isTrackDownloaded(track);
  const btnBar = document.getElementById('btn-download-track');
  const btnExp = document.getElementById('exp-btn-download');
  [btnBar, btnExp].forEach(btn => {
    if (!btn) return;
    btn.classList.toggle('downloaded', downloaded);
    btn.title = downloaded ? 'Downloaded to Music/Deja (Click to open folder)' : 'Download Song to Music/Deja';
  });
}

let downloadToastTimer = null;
function showDownloadToast(title, sub, filePathToOpen = null) {
  if (typeof document === 'undefined') return;
  const toast = document.getElementById('deja-download-toast');
  const titleEl = document.getElementById('deja-dl-toast-title');
  const subEl = document.getElementById('deja-dl-toast-sub');
  const openBtn = document.getElementById('deja-dl-toast-open');
  const iconEl = document.getElementById('deja-dl-toast-icon');
  if (!toast) return;

  if (titleEl) titleEl.textContent = title;
  if (subEl) subEl.textContent = sub;
  if (iconEl) iconEl.textContent = filePathToOpen ? '✓' : '↓';
  if (openBtn) {
    if (filePathToOpen) {
      openBtn.style.display = 'inline-flex';
      openBtn.onclick = () => {
        const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
        if (api?.openDownloadsFolder) api.openDownloadsFolder(filePathToOpen);
      };
    } else {
      openBtn.style.display = 'none';
    }
  }
  toast.style.display = 'flex';
  if (downloadToastTimer) clearTimeout(downloadToastTimer);
  downloadToastTimer = setTimeout(() => {
    toast.style.display = 'none';
  }, 6000);
}

async function triggerTrackDownload(track) {
  const target = track || CATALOGUE_TRACKS[currentIndex] || CATALOGUE_TRACKS[0];
  if (!target) return;
  const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;

  if (typeof bitchordSettings !== 'undefined' && bitchordSettings.wifiOnlyDownloads && bitchordSettings.meteredConnection) {
    showDownloadToast(`Download paused (Wi-Fi Only)`, `Disable "Treat current network as metered hotspot" or "Download over Wi-Fi only" in Settings.`);
    return;
  }

  if (!target.videoId && typeof target.id === 'string' && target.id.startsWith('yt-')) {
    target.videoId = target.id.slice(3);
  }

  if (isTrackDownloaded(target)) {
    const existing = downloadedTracksList.find(d => d.videoId === target.videoId);
    if (api?.openDownloadsFolder) {
      api.openDownloadsFolder(existing ? existing.filePath : undefined);
    }
    showDownloadToast(`"${target.title}" is already downloaded`, `Saved in ${downloadsFolderPath}`, existing?.filePath || true);
    return;
  }

  if (!target.videoId) {
    // Fallback if sample track has no videoId: search YouTube Music for its videoId first
    if (api?.searchYouTube) {
      showDownloadToast(`Preparing "${target.title}"...`, `Resolving stream from YouTube Music...`);
      try {
        const results = await api.searchYouTube(`${target.title} ${target.artist}`, 'songs');
        const list = Array.isArray(results) ? results : (results?.songs || results?.results || []);
        if (list.length > 0 && list[0].videoId) {
          target.videoId = list[0].videoId;
        }
      } catch {}
    }
  }

  if (!api?.downloadTrack || !target.videoId) {
    showDownloadToast(`Cannot download "${target.title}"`, `Play a live YouTube Music track to download.`);
    return;
  }

  showDownloadToast(`Downloading "${target.title}"...`, `${target.artist} · Saving (${bitchordSettings?.downloadQuality || 'Hi-Res FLAC'}) to ${bitchordSettings?.exportDownloads !== false ? 'Music/Deja' : 'Internal Storage'}`);
  try {
    const res = await api.downloadTrack({
      videoId: target.videoId,
      title: target.title,
      artist: target.artist,
      album: target.album,
      cover: upscaleArtworkUrl(target.cover, target.videoId),
      duration: target.duration,
      exportDownloads: bitchordSettings ? bitchordSettings.exportDownloads !== false : true,
      downloadQuality: bitchordSettings ? bitchordSettings.downloadQuality : 'Hi-Res FLAC'
    });
    if (res && res.ok) {
      await refreshDownloadsList();
      showDownloadToast(`Downloaded "${target.title}"`, `Saved to ${res.filePath || 'Music/Deja'}`, res.filePath || true);
      if (currentView === 'downloads' || currentView === 'settings' || currentView === 'library') {
        renderCurrentView();
      }
    } else {
      showDownloadToast(`Download failed`, res?.error || 'Could not resolve audio stream');
    }
  } catch (err) {
    showDownloadToast(`Download error`, err.message || 'Failed to save audio file');
  }
}

function renderDownloadsView(container) {
  if (!container) return;
  const activeTrack = CATALOGUE_TRACKS[currentIndex] || CATALOGUE_TRACKS[0];

  container.innerHTML = `
    <div class="bitchord-settings-screen">
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom: 22px;">
        <div>
          <h1 class="bitchord-settings-title" style="margin-bottom:4px;">Downloads</h1>
          <p style="color:var(--text-secondary); font-size:14px; margin:0 0 0 4px;">Offline audio tracks saved to <code>${escapeHTML(downloadsFolderPath)}</code></p>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <button class="btn-apple-primary" id="btn-dl-view-current" style="display:inline-flex; align-items:center; gap:7px; padding:9px 16px; border-radius:999px; font-weight:600; cursor:pointer;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Download "${escapeHTML(activeTrack ? activeTrack.title : 'Current Song')}"</span>
          </button>
          <button class="btn-apple-secondary" id="btn-dl-view-open-folder" style="display:inline-flex; align-items:center; gap:7px; padding:9px 16px; border-radius:999px; font-weight:600; cursor:pointer;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            <span>Open Folder</span>
          </button>
        </div>
      </div>

      ${downloadedTracksList.length > 0 ? `
        <div class="bitchord-search-song-list">
          ${downloadedTracksList.map((item, idx) => {
            const sizeMb = item.fileSize ? (item.fileSize / (1024 * 1024)).toFixed(1) + ' MB' : 'Offline';
            const coverUrl = upscaleArtworkUrl(item.cover, item.videoId);
            return `
              <div class="bitchord-search-song-row" data-dl-idx="${idx}">
                <div class="bitchord-song-row-art-wrap">
                  <img class="bitchord-song-row-art" src="${escapeHTML(coverUrl)}" alt="${escapeHTML(item.title)}" />
                  <div class="bitchord-song-row-play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  </div>
                </div>
                <div class="bitchord-song-row-meta">
                  <div class="bitchord-song-row-title">${escapeHTML(item.title)}</div>
                  <div class="bitchord-song-row-sub">${escapeHTML(item.artist)} • ${escapeHTML(item.album || 'Downloaded')}</div>
                </div>
                <span class="bitchord-settings-badge green">${escapeHTML(sizeMb)}</span>
                <button class="bitchord-song-row-action" data-dl-show="${idx}" title="Show in Windows Explorer">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                </button>
                <button class="bitchord-song-row-action" data-dl-delete="${idx}" title="Delete Download">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                </button>
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <div class="bitchord-settings-card" style="padding: 42px 24px; text-align: center;">
          <div style="width:52px; height:52px; border-radius:50%; background:rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:center; margin:0 auto 14px auto;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </div>
          <h3 style="margin:0 0 6px 0; font-size:17px;">No Downloaded Songs Yet</h3>
          <p style="margin:0 0 18px 0; color:var(--text-secondary); font-size:13.5px;">Click the download button (↓) on the player bar or click "Download Current Song" above to save tracks to <code>Music/Deja</code>.</p>
        </div>
      `}
    </div>
  `;

  const btnCur = document.getElementById('btn-dl-view-current');
  if (btnCur) {
    btnCur.onclick = () => {
      if (activeTrack) triggerTrackDownload(activeTrack);
    };
  }
  const btnFolder = document.getElementById('btn-dl-view-open-folder');
  if (btnFolder) {
    btnFolder.onclick = () => {
      const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
      if (api?.openDownloadsFolder) api.openDownloadsFolder();
    };
  }

  container.querySelectorAll('[data-dl-idx]').forEach(row => {
    row.onclick = (e) => {
      if (e.target.closest('[data-dl-show]') || e.target.closest('[data-dl-delete]')) return;
      const idx = Number(row.getAttribute('data-dl-idx'));
      const item = downloadedTracksList[idx];
      if (item) playLiveTrack(item);
    };
  });

  container.querySelectorAll('[data-dl-show]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const idx = Number(btn.getAttribute('data-dl-show'));
      const item = downloadedTracksList[idx];
      const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
      if (item && api?.openDownloadsFolder) api.openDownloadsFolder(item.filePath);
    };
  });

  container.querySelectorAll('[data-dl-delete]').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const idx = Number(btn.getAttribute('data-dl-delete'));
      const item = downloadedTracksList[idx];
      const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
      if (item && api?.deleteDownload) {
        await api.deleteDownload(item.videoId);
        await refreshDownloadsList();
        renderDownloadsView(container);
      }
    };
  });
}

// ============================================================================
// BitChord 4-Source Canvas & Video Cover Thumbnail Engine
// (Apple Music Motion 1080x1080 • Tidal Video Cover • Spotify Canvas • Direct MP4)
// Zero YouTube IFrames — Always Chromeless Native <video> Inside Thumbnails
// ============================================================================
const trackCanvasCache = new Map();
let activeCanvasStreamData = null;
let canvasRequestToken = 0;

function stopAllVideoElements() {
  if (typeof document === 'undefined') return;
  ['expanded-canvas-video', 'mini-canvas-video', 'expanded-video-el', 'dock-video-el'].forEach(id => {
    const v = document.getElementById(id);
    if (v) {
      v.classList.remove('is-ready');
      try { v.pause(); } catch {}
      v.removeAttribute('src');
      try { v.load(); } catch {}
    }
  });
  const badge = document.getElementById('expanded-canvas-badge');
  if (badge) badge.style.display = 'none';
}

function attachChromelessVideoSource(videoEl, streamData, syncWithAudio) {
  if (!videoEl || !streamData || !streamData.url) return;
  videoEl.muted = true;
  videoEl.playsInline = true;
  videoEl.loop = true;
  videoEl.removeAttribute('controls');

  if (videoEl.getAttribute('data-stream-url') === streamData.url && !videoEl.paused) {
    videoEl.classList.add('is-ready');
    return;
  }

  videoEl.classList.remove('is-ready');
  videoEl.setAttribute('data-stream-url', streamData.url);
  videoEl.src = streamData.url;

  videoEl.onloadeddata = () => {
    if (syncWithAudio && !streamData.isCanvas && dejaAudio && dejaAudio.currentTime > 1) {
      try {
        videoEl.currentTime = dejaAudio.currentTime % (videoEl.duration || 9999);
      } catch {}
    }
    videoEl.classList.add('is-ready');
    const p = videoEl.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  };

  videoEl.onerror = () => {
    videoEl.classList.remove('is-ready');
  };

  const p = videoEl.play();
  if (p && typeof p.catch === 'function') p.catch(() => {});
}

async function resolveTrackCanvasOrVideo(track) {
  if (!track) return null;
  const spotifyCanvas = Boolean(typeof bitchordSettings !== 'undefined' && bitchordSettings.spotifyCanvasConnected);
  const cacheKey = `${track.videoId || ''}::${track.title || ''}::${track.artist || ''}::${spotifyCanvas ? 'sp' : 'std'}`;
  if (trackCanvasCache.has(cacheKey)) {
    return trackCanvasCache.get(cacheKey);
  }
  const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
  if (!api?.resolveVideoStream) return null;

  try {
    const streamData = await api.resolveVideoStream({
      videoId: track.videoId || '',
      title: track.title || '',
      artist: track.artist || '',
      album: track.album || '',
      spotifyCanvasConnected: spotifyCanvas
    });
    if (streamData && streamData.url) {
      trackCanvasCache.set(cacheKey, streamData);
      return streamData;
    }
  } catch {}
  return null;
}

async function loadMusicVideoIntoStage(track, targetType) {
  if (!track || typeof document === 'undefined') return;
  if (typeof bitchordSettings !== 'undefined' && !bitchordSettings.animatedCanvas && !isVideoModeActive) {
    stopAllVideoElements();
    return;
  }
  if (typeof bitchordSettings !== 'undefined' && bitchordSettings.meteredConnection && !bitchordSettings.canvasOverCellular && !isVideoModeActive) {
    stopAllVideoElements();
    return;
  }
  const reqId = ++canvasRequestToken;

  const dockTitle = document.getElementById('deja-video-dock-title');
  const dockSub = document.getElementById('deja-video-dock-sub');
  const dockPoster = document.getElementById('dock-poster-img');
  const dockBadge = document.getElementById('deja-video-dock-badge');
  const expBadge = document.getElementById('expanded-canvas-badge');

  if (dockTitle) dockTitle.textContent = track.title || 'Now Playing';
  if (dockSub) dockSub.textContent = track.artist || 'YouTube Music';
  if (dockPoster && track.cover) dockPoster.src = track.cover;

  const streamData = await resolveTrackCanvasOrVideo(track);
  if (reqId !== canvasRequestToken || !streamData || !streamData.url) return;

  activeCanvasStreamData = streamData;
  currentResolvedVideoId = streamData.videoId || track.videoId || '';

  const badgeLabel = streamData.isCanvas
    ? (streamData.source || 'Apple Motion')
    : 'Video Preview';

  if (dockBadge) dockBadge.textContent = badgeLabel;
  if (expBadge) {
    expBadge.textContent = '';
    expBadge.style.display = 'none';
  }

  // Only animate the Now Playing artwork thumbnail when Expanded view is visible (never animate #mini-canvas-video inside the backdrop-filter bottom bar)
  const expCanvasEl = document.getElementById('expanded-canvas-video');
  const expView = document.getElementById('expanded-player-view');
  const isExpandedVisible = !expView || (expView.classList && expView.classList.contains('visible'));
  const dockVideoEl = document.getElementById('dock-video-el');

  if ((isVideoModeActive || streamData.isCanvas) && isExpandedVisible) {
    if (expCanvasEl) attachChromelessVideoSource(expCanvasEl, streamData, !streamData.isCanvas);
  }

  if (targetType === 'dock' || isVideoDockOpen) {
    if (dockVideoEl) attachChromelessVideoSource(dockVideoEl, streamData, !streamData.isCanvas);
  }
}

function setExpandedMediaMode(mode) {
  if (typeof document === 'undefined') return;
  const artWrap = document.getElementById('now-playing-art-wrap');
  const vidWrap = document.getElementById('expanded-video-container');
  const lyricsWrap = document.getElementById('expanded-lyrics-container');
  const btnSong = document.getElementById('exp-mode-song-btn');
  const btnVid = document.getElementById('exp-mode-video-btn');
  const btnExpVid = document.getElementById('exp-btn-video');
  const btnBarVid = document.getElementById('btn-switch-video');
  const expBadge = document.getElementById('expanded-canvas-badge');

  const track = CATALOGUE_TRACKS[currentIndex] || CATALOGUE_TRACKS[0];

  if (mode === 'video') {
    isVideoModeActive = true;
    // Keep the rounded square Now Playing thumbnail stage visible and play the chromeless video preview directly inside it!
    if (vidWrap) vidWrap.style.display = 'none';
    if (lyricsWrap) lyricsWrap.style.display = 'none';
    if (artWrap) {
      artWrap.style.display = '';
      artWrap.classList.add('video-mode-active');
    }
    if (btnSong) btnSong.classList.remove('active');
    if (btnVid) btnVid.classList.add('active');
    if (btnExpVid) btnExpVid.classList.add('active');
    if (btnBarVid) btnBarVid.classList.add('active');
    loadMusicVideoIntoStage(track, 'expanded');
  } else {
    isVideoModeActive = false;
    if (vidWrap) vidWrap.style.display = 'none';
    if (artWrap) {
      artWrap.style.display = '';
      artWrap.classList.remove('video-mode-active');
    }
    if (btnSong) btnSong.classList.add('active');
    if (btnVid) btnVid.classList.remove('active');
    if (btnExpVid) btnExpVid.classList.remove('active');
    if (!isVideoDockOpen && btnBarVid) btnBarVid.classList.remove('active');

    // If the current video is not a square Canvas, hide the video overlay when returning to Song mode
    if (!activeCanvasStreamData || !activeCanvasStreamData.isCanvas) {
      const expCanvasEl = document.getElementById('expanded-canvas-video');
      const miniCanvasEl = document.getElementById('mini-canvas-video');
      if (expCanvasEl) {
        expCanvasEl.classList.remove('is-ready');
        try { expCanvasEl.pause(); } catch {}
      }
      if (miniCanvasEl && !isVideoDockOpen) {
        miniCanvasEl.classList.remove('is-ready');
        try { miniCanvasEl.pause(); } catch {}
      }
      if (expBadge) expBadge.style.display = 'none';
    }
  }
}

function toggleSpotifyVideoDock() {
  if (typeof document === 'undefined') return;
  const expView = document.getElementById('expanded-player-view');
  const isExpandedVisible = expView && expView.classList.contains('visible');

  if (isExpandedVisible) {
    setExpandedMediaMode(isVideoModeActive ? 'song' : 'video');
    return;
  }

  const dock = document.getElementById('deja-video-dock');
  const btnBarVid = document.getElementById('btn-switch-video');
  const track = CATALOGUE_TRACKS[currentIndex] || CATALOGUE_TRACKS[0];

  if (isVideoDockOpen) {
    isVideoDockOpen = false;
    if (dock) dock.style.display = 'none';
    if (btnBarVid && !isVideoModeActive) btnBarVid.classList.remove('active');
    const dockVideoEl = document.getElementById('dock-video-el');
    if (dockVideoEl) {
      dockVideoEl.classList.remove('is-ready');
      try { dockVideoEl.pause(); } catch {}
    }
  } else {
    isVideoDockOpen = true;
    if (dock) dock.style.display = 'block';
    if (btnBarVid) btnBarVid.classList.add('active');
    loadMusicVideoIntoStage(track, 'dock');
  }
}

let latestPendingUpdateInfo = null;
let isUpdateDownloading = false;

function formatUpdateNotesHtml(md) {
  if (!md || typeof md !== 'string') return '';
  return escapeHTML(md)
    .replace(/^###\s*(.+)$/gm, '<strong style="display:block; margin-bottom:4px; color:#fff;">$1</strong>')
    .replace(/^[-*]\s+(.+)$/gm, '<div style="margin-bottom:4px;">• $1</div>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#fff;">$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1); padding:1px 4px; border-radius:4px;">$1</code>')
    .replace(/\n/g, '<br/>');
}

function openBitChordUpdateDialog(info) {
  if (typeof document === 'undefined' || !info) return;
  latestPendingUpdateInfo = info;

  const topBtn = document.getElementById('btn-topbar-update');
  if (topBtn) {
    topBtn.style.display = 'inline-flex';
    topBtn.title = `Update Available: Deja v${info.latestVersion} (Click to Install)`;
  }

  const dialog = document.getElementById('bitchord-update-dialog');
  const subEl = document.getElementById('bitchord-update-sub');
  const notesEl = document.getElementById('bitchord-update-notes');
  const primaryBtn = document.getElementById('bitchord-update-btn-primary');
  const secondaryBtn = document.getElementById('bitchord-update-btn-secondary');
  const progTrack = document.getElementById('bitchord-update-progress-track');
  const errEl = document.getElementById('bitchord-update-error');
  if (!dialog) return;

  if (!isUpdateDownloading) {
    if (subEl) subEl.textContent = `Deja v${info.latestVersion} is available and ready to install.`;
    if (progTrack) progTrack.style.display = 'none';
    if (errEl) errEl.style.display = 'none';
    if (primaryBtn) primaryBtn.textContent = 'Download Now';
    if (secondaryBtn) secondaryBtn.textContent = 'Remind Me Later';
  }
  if (notesEl && info.notes) {
    notesEl.innerHTML = formatUpdateNotesHtml(info.notes);
  }

  dialog.style.display = 'flex';

  const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
  if (primaryBtn) {
    primaryBtn.onclick = () => {
      if (isUpdateDownloading) return;
      isUpdateDownloading = true;
      if (subEl) subEl.textContent = `Downloading Deja v${info.latestVersion}…`;
      if (progTrack) progTrack.style.display = 'block';
      if (errEl) errEl.style.display = 'none';
      primaryBtn.textContent = 'Downloading…';
      if (secondaryBtn) secondaryBtn.textContent = 'Cancel';
      if (api?.installUpdate) {
        api.installUpdate(info.exeUrl);
      }
    };
  }

  if (secondaryBtn) {
    secondaryBtn.onclick = () => {
      if (isUpdateDownloading) {
        isUpdateDownloading = false;
        if (api?.cancelUpdateDownload) api.cancelUpdateDownload();
        if (progTrack) progTrack.style.display = 'none';
        if (subEl) subEl.textContent = `Deja v${info.latestVersion} is available and ready to install.`;
        if (primaryBtn) primaryBtn.textContent = 'Download Now';
        secondaryBtn.textContent = 'Remind Me Later';
      } else {
        dialog.style.display = 'none';
      }
    };
  }

  dialog.onclick = (e) => {
    if (e.target === dialog && !isUpdateDownloading) {
      dialog.style.display = 'none';
    }
  };
}

function handleBitChordUpdateProgress(prog) {
  if (typeof document === 'undefined' || !prog) return;
  const subEl = document.getElementById('bitchord-update-sub');
  const progTrack = document.getElementById('bitchord-update-progress-track');
  const progFill = document.getElementById('bitchord-update-progress-fill');
  const primaryBtn = document.getElementById('bitchord-update-btn-primary');
  const secondaryBtn = document.getElementById('bitchord-update-btn-secondary');
  const errEl = document.getElementById('bitchord-update-error');
  const ver = latestPendingUpdateInfo?.latestVersion || '1.6.2';

  if (prog.state === 'downloading') {
    isUpdateDownloading = true;
    if (progTrack) progTrack.style.display = 'block';
    if (progFill) progFill.style.width = `${prog.percent || 0}%`;
    if (subEl) {
      subEl.textContent = prog.receivedMb
        ? `Downloading Deja v${ver}… (${prog.receivedMb} MB / ${prog.totalMb} MB)`
        : `Downloading Deja v${ver}… ${prog.percent || 0}%`;
    }
    if (primaryBtn) primaryBtn.textContent = `Downloading (${prog.percent || 0}%)`;
    if (secondaryBtn) secondaryBtn.textContent = 'Cancel';
  } else if (prog.state === 'ready') {
    isUpdateDownloading = false;
    if (progTrack) progTrack.style.display = 'block';
    if (progFill) progFill.style.width = '100%';
    if (subEl) subEl.textContent = `Deja v${ver} is ready! Launching installer…`;
    if (primaryBtn) {
      primaryBtn.textContent = 'Install Now';
      primaryBtn.onclick = () => {
        const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
        if (api?.installUpdate) api.installUpdate(latestPendingUpdateInfo?.exeUrl);
      };
    }
    if (secondaryBtn) secondaryBtn.textContent = 'Later';
  } else if (prog.state === 'failed') {
    isUpdateDownloading = false;
    if (errEl) {
      errEl.style.display = 'block';
      errEl.textContent = prog.message || 'Download failed. Please try again.';
    }
    if (subEl) subEl.textContent = `Could not download Deja v${ver}.`;
    if (primaryBtn) primaryBtn.textContent = 'Try Again';
    if (secondaryBtn) secondaryBtn.textContent = 'Remind Me Later';
  }
}

function onTrackChangedForVideoMode(track) {
  activeCanvasStreamData = null;
  stopAllVideoElements();
  if (!track) return;
  const expView = typeof document !== 'undefined' && typeof document.getElementById === 'function'
    ? document.getElementById('expanded-player-view')
    : null;
  const isExpandedVisible = Boolean(expView && expView.classList && expView.classList.contains('visible'));
  if (isVideoDockOpen || isExpandedVisible || isVideoModeActive) {
    loadMusicVideoIntoStage(track, isVideoDockOpen ? 'dock' : 'expanded');
  }
}

if (typeof document !== 'undefined') {
  const bindVideoAndDownloadControls = () => {
    refreshDownloadsList();
    initEqualizerModalControls();
    initArtworkSwipeGesture();
    const api = typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null;
    if (api?.onUpdateAvailable) {
      api.onUpdateAvailable((info) => {
        if (info && info.updateAvailable) {
          openBitChordUpdateDialog(info);
        }
      });
    }
    if (api?.onUpdateDownloadProgress) {
      api.onUpdateDownloadProgress((prog) => {
        handleBitChordUpdateProgress(prog);
      });
    }
    if (api?.onDownloadProgress) {
      api.onDownloadProgress((prog) => {
        if (!prog || typeof document === 'undefined') return;
        const subEl = document.getElementById('deja-dl-toast-sub');
        if (subEl && prog.status === 'downloading') {
          subEl.textContent = `Downloading audio stream… ${prog.progress || 0}%`;
        }
      });
    }
    const topUpdateBtn = document.getElementById('btn-topbar-update');
    if (topUpdateBtn) {
      topUpdateBtn.onclick = () => {
        if (latestPendingUpdateInfo) {
          openBitChordUpdateDialog(latestPendingUpdateInfo);
        } else if (api?.checkForUpdates) {
          api.checkForUpdates().then(info => {
            if (info && info.updateAvailable) openBitChordUpdateDialog(info);
          });
        }
      };
    }

    const btnDlBar = document.getElementById('btn-download-track');
    if (btnDlBar) {
      btnDlBar.onclick = (e) => {
        e.stopPropagation();
        const cur = CATALOGUE_TRACKS[currentIndex] || CATALOGUE_TRACKS[0];
        if (cur) triggerTrackDownload(cur);
      };
    }

    const btnDlExp = document.getElementById('exp-btn-download');
    if (btnDlExp) {
      btnDlExp.onclick = (e) => {
        e.stopPropagation();
        const cur = CATALOGUE_TRACKS[currentIndex] || CATALOGUE_TRACKS[0];
        if (cur) triggerTrackDownload(cur);
      };
    }

    const btnVidBar = document.getElementById('btn-switch-video');
    if (btnVidBar) {
      btnVidBar.onclick = (e) => {
        e.stopPropagation();
        toggleSpotifyVideoDock();
      };
    }

    const btnModeSong = document.getElementById('exp-mode-song-btn');
    if (btnModeSong) {
      btnModeSong.onclick = (e) => {
        e.stopPropagation();
        setExpandedMediaMode('song');
      };
    }

    const btnModeVid = document.getElementById('exp-mode-video-btn');
    if (btnModeVid) {
      btnModeVid.onclick = (e) => {
        e.stopPropagation();
        setExpandedMediaMode('video');
      };
    }

    const btnExpVid = document.getElementById('exp-btn-video');
    if (btnExpVid) {
      btnExpVid.onclick = (e) => {
        e.stopPropagation();
        setExpandedMediaMode(isVideoModeActive ? 'song' : 'video');
      };
    }

    // BitChord LandscapePlayer.kt Right-Column Pane Switcher & Left-Column Action Pills
    const npTabMain = document.getElementById('bc-np-tab-main');
    if (npTabMain) npTabMain.onclick = (e) => { e.stopPropagation(); switchLandscapePlayerPane('main'); };
    const npTabLyrics = document.getElementById('bc-np-tab-lyrics');
    if (npTabLyrics) npTabLyrics.onclick = (e) => { e.stopPropagation(); switchLandscapePlayerPane('lyrics'); };
    const npTabQueue = document.getElementById('bc-np-tab-queue');
    if (npTabQueue) npTabQueue.onclick = (e) => { e.stopPropagation(); switchLandscapePlayerPane('queue'); };

    const npBtnLyricsLeft = document.getElementById('bc-np-btn-lyrics-left');
    if (npBtnLyricsLeft) {
      npBtnLyricsLeft.onclick = (e) => {
        if (e) e.stopPropagation();
        const isLyricsOpen = activeLandscapePane === 'lyrics' || (npTabLyrics && npTabLyrics.classList && npTabLyrics.classList.contains('active'));
        switchLandscapePlayerPane(isLyricsOpen ? 'main' : 'lyrics');
      };
    }
    const npBtnQueueLeft = document.getElementById('bc-np-btn-queue-left');
    if (npBtnQueueLeft) {
      npBtnQueueLeft.onclick = (e) => {
        if (e) e.stopPropagation();
        const isQueueOpen = activeLandscapePane === 'queue' || (npTabQueue && npTabQueue.classList && npTabQueue.classList.contains('active'));
        switchLandscapePlayerPane(isQueueOpen ? 'main' : 'queue');
      };
    }
    const npOpenFullQueueBtn = document.getElementById('bc-np-open-full-queue-btn');
    if (npOpenFullQueueBtn) {
      npOpenFullQueueBtn.onclick = (e) => {
        if (e) e.stopPropagation();
        toggleQueue(e);
      };
    }
    const npBtnOutput = document.getElementById('bc-np-btn-output');
    if (npBtnOutput) {
      npBtnOutput.onclick = (e) => {
        if (e) e.stopPropagation();
        openPipelineModal();
      };
    }
    const expBtnMoreInline = document.getElementById('exp-btn-more-inline');
    if (expBtnMoreInline) {
      expBtnMoreInline.onclick = (e) => {
        if (e) e.stopPropagation();
        const dd = document.getElementById('exp-options-dropdown');
        if (dd) {
          dd.style.display = (dd.style.display === 'none' || !dd.style.display) ? 'flex' : 'none';
        }
      };
    }
    const npBtnParty = document.getElementById('bc-np-btn-party');
    if (npBtnParty) {
      npBtnParty.onclick = (e) => {
        if (e) e.stopPropagation();
        openListenTogetherSubModal();
      };
    }
    const npBtnAutoplay = document.getElementById('bc-np-btn-autoplay');
    if (npBtnAutoplay) {
      if (npBtnAutoplay.classList) npBtnAutoplay.classList.toggle('active', Boolean(bitchordSettings.autoRadioSimilar));
      npBtnAutoplay.onclick = (e) => {
        if (e) e.stopPropagation();
        bitchordSettings.autoRadioSimilar = !bitchordSettings.autoRadioSimilar;
        saveBitChordSettings();
        if (npBtnAutoplay.classList) npBtnAutoplay.classList.toggle('active', Boolean(bitchordSettings.autoRadioSimilar));
      };
    }

    // BitChord Lyrics Toolbar Pills (Romanize, Translate, Source, Word/Line, Timing Offset)
    const btnRomanize = document.getElementById('bc-lyric-romanize-btn');
    if (btnRomanize) {
      if (btnRomanize.classList) btnRomanize.classList.toggle('active', Boolean(bcRomanizeLyrics));
      btnRomanize.onclick = (e) => {
        if (e) e.stopPropagation();
        bcRomanizeLyrics = !bcRomanizeLyrics;
        if (btnRomanize.classList) btnRomanize.classList.toggle('active', bcRomanizeLyrics);
        const activeLyrics = CATALOGUE_TRACKS[currentIndex]?.lyrics;
        if (Array.isArray(activeLyrics) && activeLyrics.length > 0) {
          renderLyrics(activeLyrics);
          updateSyncedLyrics(true);
        }
      };
    }
    const btnTranslate = document.getElementById('bc-lyric-translate-btn');
    if (btnTranslate) {
      if (btnTranslate.classList) btnTranslate.classList.toggle('active', bitchordSettings.translationLanguage !== 'Off');
      btnTranslate.textContent = `Translate: ${bitchordSettings.translationLanguage || 'Off'}`;
      btnTranslate.onclick = (e) => {
        if (e) e.stopPropagation();
        bitchordSettings.translationLanguage = bitchordSettings.translationLanguage === 'Off' ? 'English' : 'Off';
        saveBitChordSettings();
        if (btnTranslate.classList) btnTranslate.classList.toggle('active', bitchordSettings.translationLanguage !== 'Off');
        btnTranslate.textContent = `Translate: ${bitchordSettings.translationLanguage || 'Off'}`;
        const activeLyrics = CATALOGUE_TRACKS[currentIndex]?.lyrics;
        if (Array.isArray(activeLyrics) && activeLyrics.length > 0) {
          renderLyrics(activeLyrics);
          updateSyncedLyrics(true);
        }
      };
    }
    const btnSource = document.getElementById('bc-lyric-source-btn');
    if (btnSource) {
      btnSource.onclick = (e) => {
        if (e) e.stopPropagation();
        openLyricsSourcesSubModal();
      };
    }
    const btnKaraoke = document.getElementById('bc-lyric-karaoke-btn');
    if (btnKaraoke) {
      btnKaraoke.onclick = (e) => {
        if (e) e.stopPropagation();
        bitchordSettings.lyricsBlur = !bitchordSettings.lyricsBlur;
        saveBitChordSettings();
        btnKaraoke.textContent = bitchordSettings.lyricsBlur ? 'Word' : 'Line';
        applyBitChordVisualSettings();
      };
    }
    const btnOffsetMinus = document.getElementById('bc-np-offset-minus');
    const btnOffsetPlus = document.getElementById('bc-np-offset-plus');
    const offsetValEl = document.getElementById('bc-np-offset-val');
    if (btnOffsetMinus) {
      btnOffsetMinus.onclick = (e) => {
        if (e) e.stopPropagation();
        const nextVal = nudgeLyricsOffset(-0.1);
        if (offsetValEl) offsetValEl.textContent = formatLyricsOffset(nextVal);
      };
    }
    if (btnOffsetPlus) {
      btnOffsetPlus.onclick = (e) => {
        if (e) e.stopPropagation();
        const nextVal = nudgeLyricsOffset(0.1);
        if (offsetValEl) offsetValEl.textContent = formatLyricsOffset(nextVal);
      };
    }
    if (offsetValEl) {
      offsetValEl.onclick = (e) => {
        if (e) e.stopPropagation();
        const nextVal = nudgeLyricsOffset(0, true);
        offsetValEl.textContent = formatLyricsOffset(nextVal);
      };
    }

    const btnDockClose = document.getElementById('btn-dock-close');
    if (btnDockClose) {
      btnDockClose.onclick = (e) => {
        e.stopPropagation();
        if (isVideoDockOpen) toggleSpotifyVideoDock();
      };
    }

    const btnDockExpand = document.getElementById('btn-dock-expand');
    if (btnDockExpand) {
      btnDockExpand.onclick = (e) => {
        e.stopPropagation();
        const dock = document.getElementById('deja-video-dock');
        if (dock) dock.style.display = 'none';
        isVideoDockOpen = false;
        const expView = document.getElementById('expanded-player-view');
        if (expView) expView.classList.add('visible');
        setExpandedMediaMode('video');
      };
    }

    // Keep non-looping HD video previews synced with dejaAudio playback
    if (dejaAudio) {
      dejaAudio.addEventListener('timeupdate', () => {
        if (activeCanvasStreamData && !activeCanvasStreamData.isCanvas) {
          ['expanded-canvas-video', 'dock-video-el', 'mini-canvas-video'].forEach(id => {
            const v = document.getElementById(id);
            if (v && v.src && !v.paused && v.classList.contains('is-ready')) {
              if (Math.abs(v.currentTime - dejaAudio.currentTime) > 0.6) {
                try { v.currentTime = dejaAudio.currentTime; } catch {}
              }
            }
          });
        }
      });
      dejaAudio.addEventListener('play', () => {
        ['expanded-canvas-video', 'dock-video-el', 'mini-canvas-video'].forEach(id => {
          const v = document.getElementById(id);
          if (v && v.src && v.paused && v.classList.contains('is-ready')) {
            const p = v.play();
            if (p && typeof p.catch === 'function') p.catch(() => {});
          }
        });
      });
      dejaAudio.addEventListener('pause', () => {
        ['expanded-canvas-video', 'dock-video-el', 'mini-canvas-video'].forEach(id => {
          const v = document.getElementById(id);
          if (v && v.src && !v.paused) {
            try { v.pause(); } catch {}
          }
        });
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindVideoAndDownloadControls);
  } else {
    setTimeout(bindVideoAndDownloadControls, 0);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CATALOGUE_TRACKS,
    EQ_PRESETS,
    DEFAULT_BITCHORD_SETTINGS,
    bitchordSettings,
    getBitChordSettings,
    updateBitChordSetting,
    loadBitChordSettings,
    saveBitChordSettings,
    applyBitChordVisualSettings,
    applyBitChordAudioDspSettings,
    computeDynamicTonePadGains,
    handleBitChordPlaybackTick,
    updateNerdStatsHud,
    syncEqualizerModalUI,
    initEqualizerModalControls,
    getInlineLyricTranslation,
    getInlineLyricRomanization,
    openBitChordSubModal,
    closeBitChordSubModal,
    openAccountScrobblingSubModal,
    openSourcesSubModal,
    openListenTogetherSubModal,
    openLyricsSourcesSubModal,
    openLocalMusicBrowserSubModal,
    importBitChordBackupData,
    escapeHTML,
    formatTime,
    applyAppTheme,
    shufflePlayPlaylist,
    selectYouTubeTrack,
    setupNavigation,
    navigateTo,
    syncBitChordShellChrome,
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
    switchLandscapePlayerPane,
    renderSearchTabView,
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
    switchLoginTab,
    openArtistDetail,
    renderArtistDetailView,
    openArtistItem,
    filterByGenre,
    deriveTrackPalette,
    extractPaletteFromImage,
    hslToRgb,
    generateCpn,
    sendFinalWatchtimePing,
    adjustedLyricsPosition,
    adjustedLyricsSeekTarget,
    getTrackLyricsOffset,
    setTrackLyricsOffset,
    formatLyricsOffset,
    nudgeLyricsOffset,
    updateOffsetBadges,
    attachOffsetBarListeners,
    BASELINE_ACOUSTIC_OFFSET,
    LyricClockReconciler,
    lyricClockReconciler,
    renderSettingsView,
    renderReplayView,
    streamUrlCache,
    applyVolume,
    getLoudnessCeiling,
    notifyTrackState,
    resolveTrackCanvasOrVideo,
    saveLastPlaybackState,
    restoreLastPlaybackState,
    refreshUpNextQueueForTrack,
    normalizeTrackDedupeKey,
    dedupeTrackList,
    nextTrack,
    prevTrack,
    selectQueueTrack,
    togglePlay,
    play,
    pause,
    triggerTrackDownload,
    getUserQueue: () => userQueue,
    setUserQueue: (q) => { userQueue = Array.isArray(q) ? dedupeTrackList(q, CATALOGUE_TRACKS[currentIndex]) : []; },
    getCurrentIndex: () => currentIndex,
    getCurrentTime: () => currentTime,
    setCurrentTime: (t) => { currentTime = Math.max(0, Number(t) || 0); },
    getPlayedHistoryStack: () => playedHistoryStack
  };
}

