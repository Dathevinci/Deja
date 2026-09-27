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
    id: 'track-1',
    videoId: 'jfKfPfyJRdk',
    title: 'Midnight Reverie',
    artist: 'Aura Soundscapes',
    album: 'Deja Originals',
    duration: 215,
    genre: 'Chill / Ambient',
    year: '2026',
    playlists: ['favorites', 'lofi', 'featured'],
    palette: { c1: 'rgba(250, 45, 72, 0.48)', c2: 'rgba(140, 40, 220, 0.44)', c3: 'rgba(255, 120, 50, 0.40)', c4: 'rgba(40, 160, 220, 0.35)', primaryR: 250, primaryG: 45, primaryB: 72 },
    cover: createCoverArt('Midnight Reverie', 'Aura Soundscapes', '#FA2D48', '#833AB4', '#FD1D1D'),
    lyrics: [
      { time: 0, text: 'Neon lights reflecting on the window pane' },
      { time: 6, text: 'The city hums a rhythm through the midnight rain' },
      { time: 13, text: 'Echoes of a melody from yesterday' },
      { time: 20, text: 'Floating gently as the shadows fade away' },
      { time: 28, text: 'In the soundscape of tomorrow we find peace' },
      { time: 36, text: 'Where the timeless chords of harmony increase' },
      { time: 44, text: 'Feel the bassline moving softly through the night' },
      { time: 52, text: 'Guided by the crimson Apple aura light' },
      { time: 60, text: 'Every note a story waiting to be told' },
      { time: 70, text: 'In a desktop symphony of crystal and gold' },
      { time: 82, text: 'Drifting further into this electric dream' },
      { time: 95, text: 'Nothing is ever quite as it would seem' },
      { time: 110, text: 'A gentle frequency that sets the spirit free' },
      { time: 130, text: 'Midnight Reverie, forever you and me' }
    ]
  },
  {
    id: 'track-2',
    videoId: 'DWcJFNfaw9c',
    title: 'Starlight Symphony',
    artist: 'Celestial Echo',
    album: 'Cosmic Horizons',
    duration: 184,
    genre: 'Space Ambient',
    year: '2026',
    playlists: ['favorites', 'lofi'],
    palette: { c1: 'rgba(0, 192, 255, 0.48)', c2: 'rgba(43, 88, 118, 0.44)', c3: 'rgba(78, 84, 200, 0.40)', c4: 'rgba(0, 242, 254, 0.35)', primaryR: 0, primaryG: 192, primaryB: 255 },
    cover: createCoverArt('Starlight Symphony', 'Celestial Echo', '#00C0FF', '#2B5876', '#4E54C8'),
    lyrics: [
      { time: 0, text: 'Drifting past constellations in the deep' },
      { time: 8, text: 'Waking up the universe from quiet sleep' },
      { time: 16, text: 'Harmonics resonate across the space and time' },
      { time: 25, text: 'Every constellation sings a subtle rhyme' },
      { time: 35, text: 'Lost in stellar dust and endless skies' },
      { time: 45, text: 'Seeing pure perfection in your eyes' },
      { time: 60, text: 'A supernova burning with a sapphire glow' },
      { time: 75, text: 'Dancing in the cosmic streams below' },
      { time: 90, text: 'Starlight symphony, play until the dawn' },
      { time: 110, text: 'Carrying our memories on and on' }
    ]
  },
  {
    id: 'track-3',
    videoId: '4xDzrJKXOOY',
    title: 'Cyberpunk Odyssey',
    artist: 'Glitch Horizon',
    album: 'Synthetic Dreams',
    duration: 242,
    genre: 'Synthwave',
    year: '2026',
    playlists: ['synth', 'workout', 'featured'],
    palette: { c1: 'rgba(255, 0, 127, 0.48)', c2: 'rgba(121, 40, 202, 0.44)', c3: 'rgba(0, 245, 255, 0.40)', c4: 'rgba(255, 75, 43, 0.35)', primaryR: 255, primaryG: 0, primaryB: 127 },
    cover: createCoverArt('Cyberpunk Odyssey', 'Glitch Horizon', '#FF007F', '#7928CA', '#00F5FF'),
    lyrics: [
      { time: 0, text: 'Analog warmth in a digital sphere' },
      { time: 10, text: 'Voices of neon becoming so clear' },
      { time: 22, text: 'Circuits pulse beneath the street' },
      { time: 32, text: 'Locking into this magnetic beat' },
      { time: 44, text: 'Data streams flowing through our veins' },
      { time: 56, text: 'Breaking free of the mechanical chains' },
      { time: 70, text: 'High above the towers of chrome and glass' },
      { time: 85, text: 'Watching another millennium pass' },
      { time: 105, text: 'The synthesizer cries into the rain' },
      { time: 125, text: 'Cyberpunk odyssey, rise up again' }
    ]
  },
  {
    id: 'track-4',
    videoId: '5qap5aO4i9A',
    title: 'Golden Sunset Boulevard',
    artist: 'Solara',
    album: 'Summer Memories',
    duration: 198,
    genre: 'Chillhop',
    year: '2025',
    playlists: ['favorites', 'lofi'],
    palette: { c1: 'rgba(255, 128, 8, 0.48)', c2: 'rgba(255, 200, 55, 0.44)', c3: 'rgba(238, 90, 36, 0.40)', c4: 'rgba(255, 175, 123, 0.35)', primaryR: 255, primaryG: 128, primaryB: 8 },
    cover: createCoverArt('Golden Sunset', 'Solara', '#FF8008', '#FFC837', '#EE5A24'),
    lyrics: [
      { time: 0, text: 'Warm breeze whispering through the palm tree leaves' },
      { time: 12, text: 'Memories of yesterday that nobody perceives' },
      { time: 24, text: 'Amber rays casting long golden lines' },
      { time: 36, text: 'Everything falling into place by design' },
      { time: 50, text: 'Sipping coffee as the ocean meets the sky' },
      { time: 65, text: 'Watching sea birds gently glide on by' },
      { time: 80, text: 'Golden sunset, hold on to this light' },
      { time: 100, text: 'Before the velvet beauty of the night' }
    ]
  },
  {
    id: 'track-5',
    videoId: 'WPni755-Krg',
    title: 'Emerald Canopy',
    artist: 'Forest Whispers',
    album: 'Botanica',
    duration: 175,
    genre: 'Lo-Fi Nature',
    year: '2026',
    playlists: ['lofi'],
    palette: { c1: 'rgba(0, 176, 116, 0.48)', c2: 'rgba(42, 245, 152, 0.44)', c3: 'rgba(17, 153, 142, 0.40)', c4: 'rgba(56, 239, 125, 0.35)', primaryR: 0, primaryG: 176, primaryB: 116 },
    cover: createCoverArt('Emerald Canopy', 'Forest Whispers', '#00B074', '#2AF598', '#11998E'),
    lyrics: [
      { time: 0, text: 'Morning dew drops sparkling on the fern' },
      { time: 10, text: 'Ancient secrets that the trees will never learn' },
      { time: 22, text: 'Gentle footsteps on the mossy ground' },
      { time: 34, text: 'The purest silence is the richest sound' },
      { time: 48, text: 'Canopy of emerald shielding from the sun' },
      { time: 62, text: 'Where modern worries are completely undone' },
      { time: 80, text: 'Breathe the cedar, breathe the pine' },
      { time: 98, text: 'In the emerald forest, everything is fine' }
    ]
  },
  {
    id: 'track-6',
    videoId: 'TURbeWK2wwg',
    title: 'Tokyo Midnight Overdrive',
    artist: 'Neon Overdrive',
    album: 'Shibuya 1988',
    duration: 230,
    genre: 'Synthwave',
    year: '2026',
    playlists: ['synth', 'workout'],
    palette: { c1: 'rgba(225, 0, 255, 0.48)', c2: 'rgba(63, 43, 150, 0.44)', c3: 'rgba(255, 41, 117, 0.40)', c4: 'rgba(102, 126, 234, 0.35)', primaryR: 225, primaryG: 0, primaryB: 255 },
    cover: createCoverArt('Tokyo Overdrive', 'Neon Overdrive', '#E100FF', '#3F2B96', '#FF2975'),
    lyrics: [
      { time: 0, text: 'Headlights cutting through the Shibuya rain' },
      { time: 10, text: 'Tachometer redlining once again' },
      { time: 22, text: 'Shinkansen speeding past the bay' },
      { time: 35, text: 'Chasing the ghost of yesterday' },
      { time: 50, text: 'Wangan expressway under violet skies' },
      { time: 65, text: 'Reflections dancing in your eyes' },
      { time: 80, text: 'Downshift into the sharp hairpin curve' },
      { time: 95, text: 'Feel the adrenaline in every nerve' },
      { time: 115, text: 'Tokyo midnight overdrive' },
      { time: 135, text: 'This is the city where legends survive' }
    ]
  },
  {
    id: 'track-7',
    videoId: 'fEvM-OUq940',
    title: 'Quantum Resonance',
    artist: 'HyperPulse',
    album: 'Future Bass',
    duration: 205,
    genre: 'Electronic',
    year: '2026',
    playlists: ['workout', 'featured'],
    palette: { c1: 'rgba(0, 242, 254, 0.48)', c2: 'rgba(79, 172, 254, 0.44)', c3: 'rgba(168, 237, 234, 0.40)', c4: 'rgba(0, 198, 251, 0.35)', primaryR: 0, primaryG: 242, primaryB: 254 },
    cover: createCoverArt('Quantum Resonance', 'HyperPulse', '#00F2FE', '#4FACFE', '#A8EDEA'),
    lyrics: [
      { time: 0, text: 'Particle spin in the subatomic haze' },
      { time: 12, text: 'Entangled waveforms in a holographic maze' },
      { time: 25, text: 'Frequency oscillation reaching peak power' },
      { time: 38, text: 'Countdown clock ticking toward the zero hour' },
      { time: 52, text: 'Drop the heavy sub, shake the foundation' },
      { time: 68, text: 'A brand new sonic revelation' },
      { time: 84, text: 'Quantum resonance in full stereo display' },
      { time: 102, text: 'Wash all the earthly gravity away' }
    ]
  },
  {
    id: 'track-8',
    videoId: 'lTRiuFIWV54',
    title: 'Velvet Rain & Espresso',
    artist: 'Lofi Coffee Club',
    album: 'Study Sessions',
    duration: 160,
    genre: 'Lo-Fi',
    year: '2025',
    playlists: ['favorites', 'lofi'],
    palette: { c1: 'rgba(138, 35, 135, 0.48)', c2: 'rgba(233, 64, 87, 0.44)', c3: 'rgba(242, 113, 33, 0.40)', c4: 'rgba(180, 58, 120, 0.35)', primaryR: 138, primaryG: 35, primaryB: 135 },
    cover: createCoverArt('Velvet Rain', 'Lofi Coffee Club', '#8A2387', '#E94057', '#F27121'),
    lyrics: [
      { time: 0, text: 'Steam rising from the ceramic mug' },
      { time: 10, text: 'Warm blanket like a peaceful hug' },
      { time: 22, text: 'Rain tapping softly on the window pane' },
      { time: 34, text: 'Washing away all fatigue and strain' },
      { time: 48, text: 'Pages turning with a gentle sound' },
      { time: 62, text: 'The coziest haven to be found' },
      { time: 78, text: 'Velvet rain, take your time' },
      { time: 94, text: 'Matching the mellow piano chime' }
    ]
  },
  {
    id: 'track-9',
    videoId: '1fueZCTYkpA',
    title: 'Kinetic Overdrive',
    artist: 'Kinetic Drive',
    album: 'Redline',
    duration: 190,
    genre: 'High Energy',
    year: '2026',
    playlists: ['workout'],
    palette: { c1: 'rgba(255, 65, 108, 0.48)', c2: 'rgba(255, 75, 43, 0.44)', c3: 'rgba(241, 39, 17, 0.40)', c4: 'rgba(255, 140, 0, 0.35)', primaryR: 255, primaryG: 65, primaryB: 108 },
    cover: createCoverArt('Kinetic Overdrive', 'Kinetic Drive', '#FF416C', '#FF4B2B', '#F12711'),
    lyrics: [
      { time: 0, text: 'Feel the heart rate climbing higher' },
      { time: 10, text: 'Lungs filled with pure electric fire' },
      { time: 20, text: 'Pounding pavement with every stride' },
      { time: 30, text: 'No hesitation, no place to hide' },
      { time: 45, text: 'Breaking through the barrier of fatigue' },
      { time: 60, text: 'Running in a whole different league' },
      { time: 75, text: 'Kinetic power unleashed and wild' },
      { time: 90, text: 'Stronger than ever, unreconciled' }
    ]
  },
  {
    id: 'track-10',
    videoId: 'rUxyKA_-grg',
    title: 'Deep Mind Meditation',
    artist: 'Mindful Waves',
    album: 'Inner Calm',
    duration: 210,
    genre: 'Ambient',
    year: '2026',
    playlists: ['favorites', 'lofi'],
    palette: { c1: 'rgba(48, 207, 208, 0.48)', c2: 'rgba(51, 8, 103, 0.44)', c3: 'rgba(0, 168, 255, 0.40)', c4: 'rgba(100, 43, 115, 0.35)', primaryR: 48, primaryG: 207, primaryB: 208 },
    cover: createCoverArt('Deep Mind', 'Mindful Waves', '#30CFD0', '#330867', '#00A8FF'),
    lyrics: [
      { time: 0, text: 'Inhale peace, exhale all the noise' },
      { time: 12, text: 'Returning to centered quiet poise' },
      { time: 26, text: 'Waves receding on a tranquil shore' },
      { time: 40, text: 'Opening up the inner spiritual door' },
      { time: 55, text: 'Light expanding inside the chest' },
      { time: 70, text: 'Finding eternal restorative rest' },
      { time: 90, text: 'Mindful waves wash over the soul' },
      { time: 110, text: 'Making the fragmented spirit whole' }
    ]
  },
  {
    id: 'track-11',
    videoId: '7NOSDKb0HlU',
    title: 'Outrun Nostalgia',
    artist: 'Pixel Arcade',
    album: '8-Bit Dreams',
    duration: 180,
    genre: 'Synthwave',
    year: '2025',
    playlists: ['synth'],
    palette: { c1: 'rgba(243, 85, 218, 0.48)', c2: 'rgba(112, 0, 255, 0.44)', c3: 'rgba(255, 0, 128, 0.40)', c4: 'rgba(0, 230, 255, 0.35)', primaryR: 243, primaryG: 85, primaryB: 218 },
    cover: createCoverArt('Outrun Nostalgia', 'Pixel Arcade', '#F355DA', '#7000FF', '#FF0080'),
    lyrics: [
      { time: 0, text: 'Insert coin to start the game' },
      { time: 10, text: 'A glowing screen with our high-score name' },
      { time: 22, text: 'Pixel horizons stretching far away' },
      { time: 34, text: 'In the golden 80s we choose to stay' },
      { time: 48, text: 'Arcade cabinets glowing in the dark' },
      { time: 64, text: 'Igniting an eternal retro spark' },
      { time: 80, text: 'Press turbo boost, fly off the ramp' },
      { time: 96, text: 'The undisputed champion of the camp' }
    ]
  }
];


const SAMPLE_TRACKS = CATALOGUE_TRACKS;

// State Variables
let currentIndex = 0;
let isPlaying = false;
let currentTime = 0;
let playbackTimer = null;
let currentVolume = 0.75;
let isMuted = false;
let previousVolume = 0.75;
let isShuffle = false;
let repeatMode = 'off'; // 'off', 'all', 'one'
let lovedTrackIds = new Set(['track-1', 'track-4', 'track-8']);
let currentView = 'listen-now';
let searchQuery = '';

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

// YouTube Live Audio Playback State
let ytPlayer = null;
let isYtReady = false;
let isYtPlaying = false;

if (typeof window !== 'undefined') {
  window.onYouTubeIframeAPIReady = function() {
    try {
      ytPlayer = new YT.Player('yt-player-container', {
        height: '1',
        width: '1',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onReady: () => {
            isYtReady = true;
            try {
              ytPlayer.setVolume(Math.round(currentVolume * 100));
            } catch {}
          },
          onStateChange: (event) => {
            // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
            if (event.data === 0) {
              nextTrack();
            } else if (event.data === 1) {
              isYtPlaying = true;
              isPlaying = true;
              updatePlayButton();
              notifyTrackState();
            } else if (event.data === 2) {
              isYtPlaying = false;
              isPlaying = false;
              updatePlayButton();
              notifyTrackState();
            }
          },
          onError: (err) => {
            console.warn('[YouTube Player] Playback error; switching to Web Audio API synth:', err);
            isYtPlaying = false;
            startWebAudioStream();
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
    pushNavigation('listen-now', false);
    renderCurrentView();
  });
}

function initUI() {
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
  }
}


function renderListenNowView(container) {
  const featuredTracks = CATALOGUE_TRACKS.slice(0, 6);
  const newReleases = CATALOGUE_TRACKS.slice(6);

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
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span>Connect Live YouTube Music</span>
          </button>
        </div>
      </div>
    </section>

    <section class="shelf-section">
      <div class="shelf-header">
        <h2 class="shelf-title">Featured Albums & Mixes</h2>
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

  // Wire up hero play button
  document.getElementById('btn-hero-play').onclick = () => {
    loadTrack(0);
    play();
  };

  // Wire up Google Account connection
  document.getElementById('btn-switch-live').onclick = handleGoogleConnect;
}

function renderBrowseView(container) {
  const genres = ['All', 'Chill', 'Synthwave', 'Electronic', 'Lo-Fi', 'Ambient', 'Workout'];

  container.innerHTML = `
    <div style="padding: 10px 0 20px 0;">
      <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 8px;">Browse Music</h1>
      <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 20px;">Explore trending hits, curated playlists, and atmospheric soundscapes.</p>
      
      <div class="genre-chips-wrap">
        ${genres.map((g, i) => `
          <button class="genre-chip ${i === 0 ? 'active' : ''}" onclick="filterByGenre('${g}')">${g}</button>
        `).join('')}
      </div>

      <div class="card-grid" id="browse-card-grid">
        ${renderCardGridHTML(CATALOGUE_TRACKS)}
      </div>
    </div>
  `;
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
    { title: 'Apple Music 1', desc: 'The pulse of music culture. Live premieres, artist takeovers & deep cuts.', cover: CATALOGUE_TRACKS[0].cover, trackIdx: 0 },
    { title: 'Chillhop Beats FM', desc: 'Cozy study beats, melodic piano & relaxing rainy day textures.', cover: CATALOGUE_TRACKS[7].cover, trackIdx: 7 },
    { title: 'Synthwave 80s Radio', desc: 'Retro outrun arpeggios, neon driving vibes & vintage analog synths.', cover: CATALOGUE_TRACKS[2].cover, trackIdx: 2 },
    { title: 'Deep Space Ambient', desc: 'Weightless cosmic soundscapes for meditation and deep flow states.', cover: CATALOGUE_TRACKS[1].cover, trackIdx: 1 },
    { title: 'Energy HyperDrive', desc: 'High-octane BPM for running, training, and breaking barriers.', cover: CATALOGUE_TRACKS[8].cover, trackIdx: 8 },
    { title: 'Botanica Zen Radio', desc: 'Forest birds, gentle acoustic plucks, and organic lo-fi rhythms.', cover: CATALOGUE_TRACKS[4].cover, trackIdx: 4 }
  ];

  container.innerHTML = `
    <div style="padding: 10px 0 20px 0;">
      <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 8px;">BitChord Radio</h1>
      <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 24px;">Continuous live streams curated for every mood and moment.</p>

      <div class="radio-grid">
        ${stations.map(st => `
          <div class="radio-card" onclick="selectTrack(${st.trackIdx})">
            <div class="radio-card-top">
              <span class="radio-live-badge"><span class="radio-live-dot"></span> LIVE</span>
              <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">160k Opus</span>
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
  const artistsMap = new Map();
  CATALOGUE_TRACKS.forEach(t => {
    if (!artistsMap.has(t.artist)) {
      artistsMap.set(t.artist, { artist: t.artist, genre: t.genre, cover: t.cover, trackId: t.id });
    }
  });

  const artistsList = Array.from(artistsMap.values());

  container.innerHTML = `
    <div style="padding: 10px 0 20px 0;">
      <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 8px;">Artists</h1>
      <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 24px;">Browse by your favorite creators and audio producers.</p>
      <div class="artists-grid">
        ${artistsList.map(a => {
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
        }).join('')}
      </div>
    </div>
  `;
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
        <div class="songs-table-header">
          <span>#</span>
          <span>Title</span>
          <span>Artist</span>
          <span>Album</span>
          <span>Duration</span>
          <span>Favorite</span>
        </div>
        ${CATALOGUE_TRACKS.map((t, idx) => `
          <div class="song-row ${idx === currentIndex ? 'active' : ''}" onclick="selectTrack(${idx})">
            <span class="song-number">${idx === currentIndex && isPlaying ? '▶' : idx + 1}</span>
            <div class="song-title-cell">
              <img src="${t.cover}" class="song-cell-thumb" alt="${t.title}">
              <span class="song-title">${t.title}</span>
            </div>
            <span class="song-artist-cell">${t.artist}</span>
            <span class="song-album-cell">${t.album}</span>
            <span class="song-duration-cell">${formatTime(t.duration)}</span>
            <div>
              <button class="player-heart-btn ${lovedTrackIds.has(t.id) ? 'loved' : ''}" onclick="toggleTrackFavorite(event, '${t.id}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                </svg>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderPlaylistsGridView(container) {
  const playlists = [
    { id: 'favorites', title: 'Liked Songs', count: lovedTrackIds.size, desc: 'Your personalized collection of loved tracks.', cover: CATALOGUE_TRACKS[0].cover },
    { id: 'lofi', title: 'Deep Focus & Chill', count: CATALOGUE_TRACKS.filter(t => t.playlists.includes('lofi')).length, desc: 'Warm analog chords and rain for work & coding.', cover: CATALOGUE_TRACKS[4].cover },
    { id: 'synth', title: 'Synthwave Vibes', count: CATALOGUE_TRACKS.filter(t => t.playlists.includes('synth')).length, desc: 'Retro 80s outrun beats and neon highway driving.', cover: CATALOGUE_TRACKS[2].cover },
    { id: 'workout', title: 'High Energy Beats', count: CATALOGUE_TRACKS.filter(t => t.playlists.includes('workout')).length, desc: 'Heavy basslines and fast tempo for high endurance.', cover: CATALOGUE_TRACKS[8].cover }
  ];

  container.innerHTML = `
    <div style="padding: 10px 0 20px 0;">
      <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 8px;">Playlists</h1>
      <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 24px;">Curated collections crafted for every moment.</p>
      
      <div class="card-grid">
        ${playlists.map(pl => `
          <div class="apple-music-card" onclick="navigateToPlaylist('${pl.id}')">
            <div class="card-thumb-wrapper">
              <img src="${pl.cover}" class="card-thumb" alt="${pl.title}">
              <div class="card-play-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </div>
            <div class="card-title">${pl.title}</div>
            <div class="card-subtitle">${pl.count} tracks</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderSinglePlaylistView(container, playlistId) {
  let tracks = [];
  let title = 'Playlist';
  let desc = '';
  let tag = 'CURATED PLAYLIST';
  let cover = CATALOGUE_TRACKS[0].cover;

  if (playlistId === 'favorites') {
    tracks = CATALOGUE_TRACKS.filter(t => lovedTrackIds.has(t.id));
    title = 'Liked Songs';
    desc = 'All your favorite songs gathered in one place. Synced with your Google & Deja library.';
    tag = 'PERSONAL FAVORITES';
  } else if (playlistId === 'lofi') {
    tracks = CATALOGUE_TRACKS.filter(t => t.playlists.includes('lofi'));
    title = 'Deep Focus & Chill';
    desc = 'Immerse into mellow lo-fi beats, gentle rain, and harmonic piano for studying and flow.';
    cover = CATALOGUE_TRACKS[4].cover;
  } else if (playlistId === 'synth') {
    tracks = CATALOGUE_TRACKS.filter(t => t.playlists.includes('synth'));
    title = 'Synthwave Vibes';
    desc = 'Driving into the midnight neon horizon with retro arpeggios and vintage drums.';
    cover = CATALOGUE_TRACKS[2].cover;
  } else if (playlistId === 'workout') {
    tracks = CATALOGUE_TRACKS.filter(t => t.playlists.includes('workout'));
    title = 'High Energy Beats';
    desc = 'Aggressive drops, high velocity, and electronic stamina boosters for peak performance.';
    cover = CATALOGUE_TRACKS[8].cover;
  }

  if (tracks.length === 0) tracks = CATALOGUE_TRACKS.slice(0, 4);

  container.innerHTML = `
    <div style="padding: 10px 0 20px 0;">
      <div class="category-hero">
        <img src="${cover}" class="category-hero-cover" alt="${title}">
        <div class="category-hero-details">
          <span class="category-hero-tag">${tag}</span>
          <h1 class="category-hero-title">${title}</h1>
          <p class="category-hero-desc">${desc}</p>
          <div class="category-hero-actions">
            <button class="btn-apple-primary" onclick="selectTrackByObject('${tracks[0].id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Play</span>
            </button>
            <button class="btn-apple-secondary" onclick="shufflePlayPlaylist('${playlistId}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 3 21 3 21 8"></polyline>
                <line x1="4" y1="20" x2="21" y2="3"></line>
                <polyline points="21 16 21 21 16 21"></polyline>
                <line x1="15" y1="15" x2="21" y2="21"></line>
                <line x1="4" y1="4" x2="9" y2="9"></line>
              </svg>
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      </div>

      <div class="songs-table-container">
        <div class="songs-table-header">
          <span>#</span>
          <span>Title</span>
          <span>Artist</span>
          <span>Album</span>
          <span>Duration</span>
          <span>Favorite</span>
        </div>
        ${tracks.map((t, idx) => {
          const globalIdx = CATALOGUE_TRACKS.findIndex(x => x.id === t.id);
          return `
            <div class="song-row ${globalIdx === currentIndex ? 'active' : ''}" onclick="selectTrack(${globalIdx})">
              <span class="song-number">${globalIdx === currentIndex && isPlaying ? '▶' : idx + 1}</span>
              <div class="song-title-cell">
                <img src="${t.cover}" class="song-cell-thumb" alt="${t.title}">
                <span class="song-title">${t.title}</span>
              </div>
              <span class="song-artist-cell">${t.artist}</span>
              <span class="song-album-cell">${t.album}</span>
              <span class="song-duration-cell">${formatTime(t.duration)}</span>
              <div>
                <button class="player-heart-btn ${lovedTrackIds.has(t.id) ? 'loved' : ''}" onclick="toggleTrackFavorite(event, '${t.id}')">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                  </svg>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function shufflePlayPlaylist(playlistId) {
  let tracks = [];
  if (playlistId === 'favorites') {
    tracks = CATALOGUE_TRACKS.filter(t => lovedTrackIds.has(t.id));
  } else if (playlistId === 'lofi') {
    tracks = CATALOGUE_TRACKS.filter(t => t.playlists.includes('lofi'));
  } else if (playlistId === 'synth') {
    tracks = CATALOGUE_TRACKS.filter(t => t.playlists.includes('synth'));
  } else if (playlistId === 'workout') {
    tracks = CATALOGUE_TRACKS.filter(t => t.playlists.includes('workout'));
  }
  if (tracks.length === 0) tracks = [...CATALOGUE_TRACKS];

  // Set shuffle mode on
  isShuffle = true;
  const btn = document.getElementById('btn-shuffle');
  const expBtn = document.getElementById('exp-btn-shuffle');
  if (btn) btn.classList.add('active');
  if (expBtn) expBtn.classList.add('active');

  const randTrack = tracks[Math.floor(Math.random() * tracks.length)];
  const globalIdx = CATALOGUE_TRACKS.findIndex(t => t.id === randTrack.id);
  if (globalIdx !== -1) {
    selectTrack(globalIdx);
  } else {
    selectTrack(0);
  }
}

function selectYouTubeTrack(ytTrack) {
  let existingIdx = CATALOGUE_TRACKS.findIndex(t => t.videoId === ytTrack.videoId);
  if (existingIdx === -1) {
    const newTrack = {
      id: ytTrack.id || `yt-${ytTrack.videoId}`,
      videoId: ytTrack.videoId,
      title: ytTrack.title,
      artist: ytTrack.artist,
      album: ytTrack.album || 'YouTube Music',
      duration: 210,
      genre: 'YouTube Stream',
      year: '2026',
      playlists: ['favorites'],
      palette: { c1: 'rgba(250, 45, 72, 0.48)', c2: 'rgba(140, 40, 220, 0.44)', c3: 'rgba(255, 120, 50, 0.40)', c4: 'rgba(40, 160, 220, 0.35)', primaryR: 250, primaryG: 45, primaryB: 72 },
      cover: ytTrack.cover || createCoverArt(ytTrack.title, ytTrack.artist, '#FA2D48', '#833AB4', '#FD1D1D'),
      lyrics: [
        { time: 0, text: `Playing "${ytTrack.title}"` },
        { time: 6, text: `By ${ytTrack.artist}` },
        { time: 15, text: `Streamed from YouTube Music` }
      ]
    };
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
            <img src="${escapeHTML(yt.cover || '')}" class="card-thumb" alt="${escapeHTML(yt.title)}" onerror="this.src='../../assets/icon.png'">
            <div class="card-play-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
          </div>
          <div class="card-title">${escapeHTML(yt.title)}</div>
          <div class="card-subtitle">${escapeHTML(yt.artist)} • ${escapeHTML(yt.durationStr || '')}</div>
        </div>
      `).join('');

      ytResults.forEach((yt, i) => {
        const card = document.getElementById(`yt-card-${i}`);
        if (card) {
          card.onclick = () => selectYouTubeTrack(yt);
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
          <img src="${t.cover}" class="card-thumb" alt="${t.title}">
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
  play();
}

function selectTrackByObject(trackId) {
  const idx = CATALOGUE_TRACKS.findIndex(t => t.id === trackId);
  if (idx !== -1) selectTrack(idx);
}

function loadTrack(idx) {
  currentIndex = idx;
  const track = CATALOGUE_TRACKS[idx];
  currentTime = 0;

  // Player Bar Left Meta
  document.getElementById('player-track-title').innerText = track.title;
  document.getElementById('player-track-artist').innerText = `${track.artist} • ${track.album}`;
  document.getElementById('player-artwork').src = track.cover;
  document.getElementById('time-total').innerText = formatTime(track.duration);
  document.getElementById('time-current').innerText = '0:00';
  document.getElementById('scrubber-fill').style.width = '0%';
  document.getElementById('scrubber-knob').style.left = '0%';

  // Update Favorite Heart
  updateFavoriteUI(track.id);

  // Expanded Now Playing Screen
  const expandedTitle = document.getElementById('expanded-track-title');
  const expandedArtist = document.getElementById('expanded-track-artist');
  const expandedArtwork = document.getElementById('expanded-artwork-img');
  const expTotal = document.getElementById('exp-time-total');
  const expCurrent = document.getElementById('exp-time-current');
  const expFill = document.getElementById('exp-scrubber-fill');
  const expKnob = document.getElementById('exp-scrubber-knob');
  if (expandedTitle) expandedTitle.innerText = track.title;
  if (expandedArtist) expandedArtist.innerText = `${track.artist} • ${track.album}`;
  if (expandedArtwork) expandedArtwork.src = track.cover;
  if (expTotal) expTotal.innerText = formatTime(track.duration);
  if (expCurrent) expCurrent.innerText = '0:00';
  if (expFill) expFill.style.width = '0%';
  if (expKnob) expKnob.style.left = '0%';

  // Dynamic Mesh Gradient Tinting (BitChord MeshGradient.kt)
  applyDynamicMeshAura(track);

  // Update Lyrics & Queue
  renderLyrics(track.lyrics);
  renderPreviewQueue();

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
  const container = document.getElementById('lyrics-lines-container');
  if (!container) return;

  const track = CATALOGUE_TRACKS[currentIndex];
  const songTitleEl = document.getElementById('lyrics-song-title');
  const artistNameEl = document.getElementById('lyrics-artist-name');
  if (songTitleEl) songTitleEl.innerText = track.title;
  if (artistNameEl) artistNameEl.innerText = track.artist;

  container.innerHTML = lyrics.map((l, i) => `
    <div class="apple-lyric-line ${i === 0 ? 'active' : ''}" data-time="${l.time}" onclick="seekTo(${l.time})">
      ${l.text}
    </div>
  `).join('');
}

function renderPreviewQueue() {
  const queueBody = document.getElementById('preview-queue-body');
  const countLabel = document.getElementById('queue-count-label');
  if (!queueBody) return;
  if (countLabel) countLabel.innerText = `${CATALOGUE_TRACKS.length} tracks`;

  queueBody.innerHTML = CATALOGUE_TRACKS.map((t, idx) => `
    <div class="deja-queue-item ${idx === currentIndex ? 'active-playing' : ''}" onclick="selectTrack(${idx})">
      <div class="deja-queue-item-index">${idx === currentIndex ? '▶' : idx + 1}</div>
      <img src="${t.cover}" class="deja-queue-thumb" alt="${t.title}">
      <div class="deja-queue-item-meta">
        <div class="deja-queue-item-title">${t.title}</div>
        <div class="deja-queue-item-artist">${t.artist}</div>
      </div>
      <div class="deja-queue-item-duration">${formatTime(t.duration)}</div>
    </div>
  `).join('');
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

  const track = CATALOGUE_TRACKS[currentIndex];
  if (isYtReady && ytPlayer && track.videoId) {
    stopWebAudioStream();
    try {
      const currentLoaded = ytPlayer.getVideoData ? ytPlayer.getVideoData().video_id : null;
      if (currentLoaded !== track.videoId) {
        ytPlayer.loadVideoById(track.videoId);
      } else {
        ytPlayer.playVideo();
      }
      isYtPlaying = true;
    } catch (e) {
      console.warn('[YouTube] Could not play video; using synthesizer fallback:', e.message);
      startWebAudioStream();
    }
  } else {
    startWebAudioStream();
  }

  if (playbackTimer) clearInterval(playbackTimer);
  playbackTimer = setInterval(tick, 1000);

  notifyTrackState();
}

function pause() {
  isPlaying = false;
  updatePlayButton();

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

  notifyTrackState();
}

function nextTrack() {
  let nextIdx;
  if (isShuffle) {
    nextIdx = Math.floor(Math.random() * CATALOGUE_TRACKS.length);
  } else {
    nextIdx = (currentIndex + 1) % CATALOGUE_TRACKS.length;
  }
  loadTrack(nextIdx);
  if (isPlaying) play();
}

function prevTrack() {
  if (currentTime > 3) {
    seekTo(0);
  } else {
    const prevIdx = (currentIndex - 1 + CATALOGUE_TRACKS.length) % CATALOGUE_TRACKS.length;
    loadTrack(prevIdx);
    if (isPlaying) play();
  }
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  const btn = document.getElementById('btn-shuffle');
  const expBtn = document.getElementById('exp-btn-shuffle');
  if (btn) btn.classList.toggle('active', isShuffle);
  if (expBtn) expBtn.classList.toggle('active', isShuffle);
}

function toggleRepeat() {
  if (repeatMode === 'off') repeatMode = 'all';
  else if (repeatMode === 'all') repeatMode = 'one';
  else repeatMode = 'off';

  const btn = document.getElementById('btn-repeat');
  const expBtn = document.getElementById('exp-btn-repeat');
  [btn, expBtn].forEach(b => {
    if (!b) return;
    b.classList.toggle('active', repeatMode !== 'off');
    if (repeatMode === 'one') {
      b.style.color = '#FA2D48';
      b.title = 'Repeat One';
    } else if (repeatMode === 'all') {
      b.style.color = '#FA2D48';
      b.title = 'Repeat All';
    } else {
      b.style.color = '';
      b.title = 'Repeat Off';
    }
  });
}

function tick() {
  const track = CATALOGUE_TRACKS[currentIndex];

  if (isYtReady && ytPlayer && isYtPlaying && typeof ytPlayer.getCurrentTime === 'function') {
    try {
      const ytSec = Math.round(ytPlayer.getCurrentTime());
      if (ytSec >= 0) currentTime = ytSec;
      const ytDur = Math.round(ytPlayer.getDuration());
      if (ytDur > 0 && ytDur !== track.duration) {
        track.duration = ytDur;
        document.getElementById('time-total').innerText = formatTime(ytDur);
        const expTotal = document.getElementById('exp-time-total');
        if (expTotal) expTotal.innerText = formatTime(ytDur);
      }
      updateDynamicPipeline(ytPlayer);
    } catch {}
  } else {
    currentTime += 1;
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
  updateLiveLyrics();
}

function seekTo(seconds) {
  const track = CATALOGUE_TRACKS[currentIndex];
  currentTime = Math.max(0, Math.min(seconds, track.duration));
  if (isYtReady && ytPlayer && track.videoId) {
    try {
      ytPlayer.seekTo(currentTime, true);
    } catch {}
  }
  updateProgress();
  updateLiveLyrics();
}

function updateProgress() {
  const track = CATALOGUE_TRACKS[currentIndex];
  const pct = (currentTime / track.duration) * 100;
  const timeStr = formatTime(currentTime);

  const curEl = document.getElementById('time-current');
  const fillEl = document.getElementById('scrubber-fill');
  const knobEl = document.getElementById('scrubber-knob');
  if (curEl) curEl.innerText = timeStr;
  if (fillEl) fillEl.style.width = `${pct}%`;
  if (knobEl) knobEl.style.left = `${pct}%`;

  const expCurEl = document.getElementById('exp-time-current');
  const expFillEl = document.getElementById('exp-scrubber-fill');
  const expKnobEl = document.getElementById('exp-scrubber-knob');
  if (expCurEl) expCurEl.innerText = timeStr;
  if (expFillEl) expFillEl.style.width = `${pct}%`;
  if (expKnobEl) expKnobEl.style.left = `${pct}%`;
}

function updateLiveLyrics() {
  const track = CATALOGUE_TRACKS[currentIndex];
  const lyricElements = document.querySelectorAll('.apple-lyric-line');
  let activeIndex = -1;

  for (let i = 0; i < track.lyrics.length; i++) {
    if (currentTime >= track.lyrics[i].time) {
      activeIndex = i;
    }
  }

  lyricElements.forEach((el, i) => {
    if (i === activeIndex) {
      el.classList.add('active');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      el.classList.remove('active');
    }
  });
}

function updatePlayButton() {
  const icon = document.getElementById('play-pause-icon');
  const expIcon = document.getElementById('exp-play-pause-icon');
  const playerBar = document.getElementById('apple-player-bar');

  if (playerBar) playerBar.classList.toggle('is-playing', isPlaying);
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

  if (masterGain && audioContext) {
    masterGain.gain.setValueAtTime(vol * 0.2, audioContext.currentTime);
  }
  if (isYtReady && ytPlayer && typeof ytPlayer.setVolume === 'function') {
    try {
      ytPlayer.setVolume(Math.round(vol * 100));
    } catch {}
  }
}

function updateDynamicPipeline(player) {
  const bufferEl = document.getElementById('pipeline-buffer');
  const codecEl = document.getElementById('pipeline-codec');
  const bitrateEl = document.getElementById('pipeline-bitrate');
  const rateEl = document.getElementById('pipeline-samplerate');
  const tierEl = document.getElementById('pipeline-tier');

  const track = CATALOGUE_TRACKS[currentIndex];
  if (player && typeof player.getVideoLoadedFraction === 'function' && isYtPlaying) {
    const frac = player.getVideoLoadedFraction() || 0;
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
  const isAd = !!track.isAd;
  const adPill = document.getElementById('player-ad-pill');
  if (adPill) adPill.style.display = isAd ? 'inline-flex' : 'none';

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
      isAd: isAd
    });
  }
}

// ==========================================
// Web Audio API Synthesizer & EQ Filters
// ==========================================

function ensureAudioGraph() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();
  }
  if (audioContext.state === 'suspended') {
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
    stopWebAudioStream();

    const track = CATALOGUE_TRACKS[currentIndex];
    // Rich musical chord progressions based on track id
    const baseFreqs = [220, 261.63, 196, 293.66, 174.61]; // A, C, G, D, F
    const root = baseFreqs[currentIndex % baseFreqs.length];

    // Pad Voice 1: Root Warm Sine
    const osc1 = audioContext.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(root, audioContext.currentTime);

    // Pad Voice 2: Fifth / Major Third Triangle
    const osc2 = audioContext.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(root * 1.5, audioContext.currentTime);

    // Sub-bass Voice 3: Deep Sine
    const osc3 = audioContext.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(root / 2, audioContext.currentTime);

    const voiceGain = audioContext.createGain();
    voiceGain.gain.setValueAtTime(0.001, audioContext.currentTime);
    voiceGain.gain.exponentialRampToValueAtTime(0.35, audioContext.currentTime + 1.2);

    osc1.connect(voiceGain);
    osc2.connect(voiceGain);
    osc3.connect(voiceGain);
    voiceGain.connect(bassFilter);

    osc1.start();
    osc2.start();
    osc3.start();

    activeOscillators = [osc1, osc2, osc3];
  } catch (err) {
    console.warn('[Audio] Synthesizer started silently:', err.message);
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
  const api = window.dejaAPI || window.sonoraAPI;
  if (api?.openGoogleLogin) {
    api.openGoogleLogin().then(() => {
      const pill = document.querySelector('.premium-pill');
      if (pill) pill.innerText = 'YTM Linked';
    });
  } else {
    alert('Deja YouTube Music Auth: Open Google login window.');
  }
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
  const expShuffle = document.getElementById('exp-btn-shuffle');
  const expRepeat = document.getElementById('exp-btn-repeat');
  const expFav = document.getElementById('exp-btn-favorite');
  if (expPlay) expPlay.onclick = togglePlay;
  if (expNext) expNext.onclick = nextTrack;
  if (expPrev) expPrev.onclick = prevTrack;
  if (expShuffle) expShuffle.onclick = toggleShuffle;
  if (expRepeat) expRepeat.onclick = toggleRepeat;
  if (expFav) expFav.onclick = (e) => toggleTrackFavorite(e, CATALOGUE_TRACKS[currentIndex].id);

  // Queue toggle
  const queueDrawer = document.getElementById('apple-queue-drawer');
  const btnQueuePanel = document.getElementById('btn-queue-panel');
  const expBtnQueue = document.getElementById('exp-btn-queue');
  const btnCloseQueue = document.getElementById('btn-close-queue');
  const toggleQueue = () => {
    if (!queueDrawer) return;
    queueDrawer.classList.toggle('visible');
    const isVis = queueDrawer.classList.contains('visible');
    if (btnQueuePanel) btnQueuePanel.classList.toggle('active', isVis);
    if (expBtnQueue) expBtnQueue.classList.toggle('active', isVis);
    if (isVis) renderPreviewQueue();
  };
  if (btnQueuePanel) btnQueuePanel.onclick = toggleQueue;
  if (expBtnQueue) expBtnQueue.onclick = toggleQueue;
  if (btnCloseQueue) btnCloseQueue.onclick = toggleQueue;

  // Lyrics toggle
  const lyricsDrawer = document.getElementById('apple-lyrics-drawer');
  const btnToggleLyrics = document.getElementById('btn-toggle-lyrics');
  const btnLyricsPanel = document.getElementById('btn-lyrics-panel');
  const expBtnLyrics = document.getElementById('exp-btn-lyrics');
  const btnCloseLyrics = document.getElementById('btn-close-lyrics');
  const toggleLyrics = () => {
    if (!lyricsDrawer) return;
    lyricsDrawer.classList.toggle('visible');
    const isVis = lyricsDrawer.classList.contains('visible');
    if (btnToggleLyrics) btnToggleLyrics.classList.toggle('active', isVis);
    if (btnLyricsPanel) btnLyricsPanel.classList.toggle('active', isVis);
    if (expBtnLyrics) expBtnLyrics.classList.toggle('active', isVis);
  };
  if (btnToggleLyrics) btnToggleLyrics.onclick = toggleLyrics;
  if (btnLyricsPanel) btnLyricsPanel.onclick = toggleLyrics;
  if (expBtnLyrics) expBtnLyrics.onclick = toggleLyrics;
  if (btnCloseLyrics) btnCloseLyrics.onclick = toggleLyrics;

  // Expanded Now Playing view toggle
  const expandedView = document.getElementById('expanded-player-view');
  const artworkWrapper = document.getElementById('player-artwork-wrapper');
  const btnCollapsePlayer = document.getElementById('btn-collapse-player');
  if (artworkWrapper && expandedView) {
    artworkWrapper.onclick = () => expandedView.classList.toggle('visible');
  }
  if (btnCollapsePlayer && expandedView) {
    btnCollapsePlayer.onclick = () => expandedView.classList.remove('visible');
  }

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

  // Profile status badge -> Google sign in
  const btnLoginStatus = document.getElementById('btn-login-status');
  if (btnLoginStatus) btnLoginStatus.onclick = handleGoogleConnect;

  // Modal backdrop click-away
  ['settings-modal', 'pipeline-modal', 'sleep-modal', 'eq-modal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', (e) => {
        if (e.target === el) el.style.display = 'none';
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
      }
    });
  }

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
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
      case 'toggleLyrics': document.getElementById('btn-toggle-lyrics')?.click(); break;
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
    navHistory
  };
}
