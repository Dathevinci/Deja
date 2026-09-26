/**
 * Deja - Apple Music Desktop Client Interface Logic
 */

const SAMPLE_TRACKS = [
  {
    id: 'track-1',
    title: 'Midnight Reverie',
    artist: 'Aura Soundscapes',
    album: 'Deja Originals',
    duration: 215, // seconds
    cover: '../../assets/logo.png',
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
      { time: 70, text: 'In a desktop symphony of crystal and gold' }
    ]
  },
  {
    id: 'track-2',
    title: 'Starlight Symphony',
    artist: 'Celestial Echo',
    album: 'Cosmic Horizons',
    duration: 184,
    cover: '../../assets/logo.png',
    lyrics: [
      { time: 0, text: 'Drifting past constellations in the deep' },
      { time: 8, text: 'Waking up the universe from quiet sleep' },
      { time: 16, text: 'Harmonics resonate across the space and time' },
      { time: 25, text: 'Every constellation sings a subtle rhyme' },
      { time: 35, text: 'Lost in stellar dust and endless skies' },
      { time: 45, text: 'Seeing pure perfection in your eyes' }
    ]
  },
  {
    id: 'track-3',
    title: 'Cyberpunk Odyssey',
    artist: 'Glitch Horizon',
    album: 'Synthetic Dreams 2026',
    duration: 242,
    cover: '../../assets/logo.png',
    lyrics: [
      { time: 0, text: 'Analog warmth in a digital sphere' },
      { time: 10, text: 'Voices of neon becoming so clear' },
      { time: 22, text: 'Circuits pulse beneath the street' },
      { time: 32, text: 'Locking into this magnetic beat' }
    ]
  }
];

let currentIndex = 0;
let isPlaying = false;
let currentTime = 0;
let playbackTimer = null;
let audioContext = null;
let synthOscillator = null;
let synthGain = null;
let currentVolume = 0.75;

document.addEventListener('DOMContentLoaded', () => {
  initUI();
  renderShelves();
  loadTrack(0);
  setupEvents();
  setupIPC();
});

function initUI() {
  document.getElementById('scrubber-track').onclick = handleScrubberClick;
  document.getElementById('volume-track').onclick = handleVolumeClick;
}

function renderShelves() {
  const featuredGrid = document.getElementById('featured-grid');
  const newReleasesGrid = document.getElementById('new-releases-grid');

  featuredGrid.innerHTML = SAMPLE_TRACKS.map((t, idx) => `
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
  `).join('');

  newReleasesGrid.innerHTML = SAMPLE_TRACKS.slice().reverse().map((t, idx) => `
    <div class="apple-music-card" onclick="selectTrack(${SAMPLE_TRACKS.length - 1 - idx})">
      <div class="card-thumb-wrapper">
        <img src="${t.cover}" class="card-thumb" alt="${t.title}">
        <div class="card-play-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>
      </div>
      <div class="card-title">${t.title}</div>
      <div class="card-subtitle">${t.album}</div>
    </div>
  `).join('');
}

function selectTrack(idx) {
  loadTrack(idx);
  play();
}

function loadTrack(idx) {
  currentIndex = idx;
  const track = SAMPLE_TRACKS[idx];
  currentTime = 0;

  document.getElementById('player-track-title').innerText = track.title;
  document.getElementById('player-track-artist').innerText = `${track.artist} • ${track.album}`;
  document.getElementById('player-artwork').src = track.cover;
  document.getElementById('time-total').innerText = formatTime(track.duration);
  document.getElementById('time-current').innerText = '0:00';
  document.getElementById('scrubber-fill').style.width = '0%';

  // Update Lyrics Drawer
  document.getElementById('lyrics-song-title').innerText = track.title;
  document.getElementById('lyrics-artist-name').innerText = track.artist;
  document.getElementById('lyrics-aura').style.backgroundImage = `url('${track.cover}')`;

  renderLyrics(track.lyrics);

  // Notify Electron Main process
  const api = window.dejaAPI || window.sonoraAPI;
  if (api?.sendTrackChanged) {
    api.sendTrackChanged({
      title: track.title,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
      currentTime: 0,
      isPlaying: isPlaying,
      coverUrl: track.cover
    });
  }
}

function renderLyrics(lyrics) {
  const container = document.getElementById('lyrics-lines-container');
  container.innerHTML = lyrics.map((l, i) => `
    <div class="apple-lyric-line ${i === 0 ? 'active' : ''}" data-time="${l.time}" onclick="seekTo(${l.time})">
      ${l.text}
    </div>
  `).join('');
}

function setupEvents() {
  // Transport buttons
  document.getElementById('btn-play-pause').onclick = togglePlay;
  document.getElementById('btn-next').onclick = nextTrack;
  document.getElementById('btn-prev').onclick = prevTrack;
  document.getElementById('btn-hero-play').onclick = () => {
    loadTrack(0);
    play();
  };

  // Connect live YouTube Music button
  document.getElementById('btn-switch-live').onclick = () => {
    window.location.href = 'https://music.youtube.com';
  };

  // Lyrics toggle
  const lyricsDrawer = document.getElementById('apple-lyrics-drawer');
  document.getElementById('btn-toggle-lyrics').onclick = () => {
    lyricsDrawer.classList.toggle('visible');
    document.getElementById('btn-lyrics-panel').classList.toggle('active');
  };
  document.getElementById('btn-lyrics-panel').onclick = () => {
    lyricsDrawer.classList.toggle('visible');
    document.getElementById('btn-lyrics-panel').classList.toggle('active');
  };
  document.getElementById('btn-close-lyrics').onclick = () => {
    lyricsDrawer.classList.remove('visible');
    document.getElementById('btn-lyrics-panel').classList.remove('active');
  };

  // Settings modal
  const settingsModal = document.getElementById('settings-modal');
  document.getElementById('btn-settings').onclick = () => {
    settingsModal.style.display = 'flex';
  };
  document.getElementById('btn-close-settings').onclick = () => {
    settingsModal.style.display = 'none';
  };

  // Favorite Heart
  const heartBtn = document.getElementById('btn-favorite');
  heartBtn.onclick = () => heartBtn.classList.toggle('loved');

  // Window titlebar buttons
  const api = window.dejaAPI || window.sonoraAPI;
  document.getElementById('btn-close').onclick = () => api?.windowAction('close');
  document.getElementById('btn-minimize').onclick = () => api?.windowAction('minimize');
  document.getElementById('btn-maximize').onclick = () => api?.windowAction('maximize');
  document.getElementById('btn-toggle-miniplayer').onclick = () => api?.windowAction('toggle-miniplayer');

  // Search filter
  document.getElementById('apple-search-input').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.apple-music-card');
    cards.forEach(card => {
      const match = card.innerText.toLowerCase().includes(q);
      card.style.display = match ? 'block' : 'none';
    });
  });

  // Global Spacebar
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
      e.preventDefault();
      togglePlay();
    }
  });
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
      case 'toggleLyrics': document.getElementById('btn-toggle-lyrics').click(); break;
      case 'openSettings': document.getElementById('btn-settings').click(); break;
    }
  });
}

function togglePlay() {
  if (isPlaying) pause();
  else play();
}

function play() {
  isPlaying = true;
  updatePlayButton();
  startSynthesizerAudio();

  if (playbackTimer) clearInterval(playbackTimer);
  playbackTimer = setInterval(tick, 1000);

  notifyTrackState();
}

function pause() {
  isPlaying = false;
  updatePlayButton();
  stopSynthesizerAudio();

  if (playbackTimer) {
    clearInterval(playbackTimer);
    playbackTimer = null;
  }

  notifyTrackState();
}

function nextTrack() {
  const nextIdx = (currentIndex + 1) % SAMPLE_TRACKS.length;
  loadTrack(nextIdx);
  if (isPlaying) play();
}

function prevTrack() {
  if (currentTime > 3) {
    seekTo(0);
  } else {
    const prevIdx = (currentIndex - 1 + SAMPLE_TRACKS.length) % SAMPLE_TRACKS.length;
    loadTrack(prevIdx);
    if (isPlaying) play();
  }
}

function tick() {
  const track = SAMPLE_TRACKS[currentIndex];
  currentTime += 1;

  if (currentTime >= track.duration) {
    nextTrack();
    return;
  }

  updateProgress();
  updateLiveLyrics();
}

function seekTo(seconds) {
  currentTime = Math.max(0, Math.min(seconds, SAMPLE_TRACKS[currentIndex].duration));
  updateProgress();
  updateLiveLyrics();
}

function updateProgress() {
  const track = SAMPLE_TRACKS[currentIndex];
  document.getElementById('time-current').innerText = formatTime(currentTime);
  const pct = (currentTime / track.duration) * 100;
  document.getElementById('scrubber-fill').style.width = `${pct}%`;
  document.getElementById('scrubber-knob').style.left = `${pct}%`;
}

function updateLiveLyrics() {
  const track = SAMPLE_TRACKS[currentIndex];
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
  if (isPlaying) {
    icon.innerHTML = `
      <rect x="6" y="4" width="4" height="16"></rect>
      <rect x="14" y="4" width="4" height="16"></rect>
    `;
  } else {
    icon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"></polygon>`;
  }
}

function handleScrubberClick(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
  const track = SAMPLE_TRACKS[currentIndex];
  seekTo(ratio * track.duration);
}

function handleVolumeClick(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  currentVolume = Math.max(0, Math.min(1, clickX / rect.width));
  document.getElementById('volume-fill').style.width = `${currentVolume * 100}%`;
  if (synthGain) {
    synthGain.gain.setValueAtTime(currentVolume * 0.15, audioContext.currentTime);
  }
}

function adjustVolume(delta) {
  currentVolume = Math.max(0, Math.min(1, currentVolume + delta));
  document.getElementById('volume-fill').style.width = `${currentVolume * 100}%`;
  if (synthGain) {
    synthGain.gain.setValueAtTime(currentVolume * 0.15, audioContext.currentTime);
  }
}

function notifyTrackState() {
  const track = SAMPLE_TRACKS[currentIndex];
  const api = window.dejaAPI || window.sonoraAPI;
  if (api?.sendTrackChanged) {
    api.sendTrackChanged({
      title: track.title,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
      currentTime: currentTime,
      isPlaying: isPlaying,
      coverUrl: track.cover
    });
  }
}

function startSynthesizerAudio() {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    if (!synthGain) {
      synthGain = audioContext.createGain();
      synthGain.gain.setValueAtTime(currentVolume * 0.15, audioContext.currentTime);
      synthGain.connect(audioContext.destination);
    }
    if (synthOscillator) {
      synthOscillator.stop();
      synthOscillator.disconnect();
    }
    synthOscillator = audioContext.createOscillator();
    synthOscillator.type = 'sine';
    synthOscillator.frequency.setValueAtTime(220, audioContext.currentTime); // Gentle A3 chord
    synthOscillator.connect(synthGain);
    synthOscillator.start();
  } catch (err) {
    console.warn('Audio synth initialized silently:', err.message);
  }
}

function stopSynthesizerAudio() {
  if (synthGain && audioContext) {
    synthGain.gain.setTargetAtTime(0, audioContext.currentTime, 0.05);
  }
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
