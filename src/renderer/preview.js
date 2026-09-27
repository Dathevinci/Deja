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

  // Update Expanded Now Playing Page
  const expandedTitle = document.getElementById('expanded-track-title');
  const expandedArtist = document.getElementById('expanded-track-artist');
  const expandedArtwork = document.getElementById('expanded-artwork-img');
  const previewArtBlur = document.getElementById('preview-ambient-art-blur');
  const previewAura = document.getElementById('preview-ambient-aura');
  if (expandedTitle) expandedTitle.innerText = track.title;
  if (expandedArtist) expandedArtist.innerText = `${track.artist} • ${track.album}`;
  if (expandedArtwork) expandedArtwork.src = track.cover;
  if (previewArtBlur) previewArtBlur.style.backgroundImage = `url('${track.cover}')`;

  // Dynamic ambient palette tint
  extractTrackPalette(track.cover, (palette) => {
    if (!palette || !previewAura) return;
    previewAura.style.setProperty('--deja-aura-c1', palette.c1);
    previewAura.style.setProperty('--deja-aura-c2', palette.c2);
    previewAura.style.setProperty('--deja-aura-c3', palette.c3);
    previewAura.style.setProperty('--deja-aura-c4', palette.c4);
    previewAura.style.setProperty('--deja-aura-r', String(palette.primaryR));
    previewAura.style.setProperty('--deja-aura-g', String(palette.primaryG));
    previewAura.style.setProperty('--deja-aura-b', String(palette.primaryB));
  });

  renderLyrics(track.lyrics);
  renderPreviewQueue();

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

  // Queue toggle
  const queueDrawer = document.getElementById('apple-queue-drawer');
  const btnQueuePanel = document.getElementById('btn-queue-panel');
  const btnCloseQueue = document.getElementById('btn-close-queue');
  if (btnQueuePanel && queueDrawer) {
    btnQueuePanel.onclick = () => {
      queueDrawer.classList.toggle('visible');
      btnQueuePanel.classList.toggle('active');
      renderPreviewQueue();
    };
  }
  if (btnCloseQueue && queueDrawer) {
    btnCloseQueue.onclick = () => {
      queueDrawer.classList.remove('visible');
      if (btnQueuePanel) btnQueuePanel.classList.remove('active');
    };
  }

  // Audio Pipeline Modal
  const pipelineModal = document.getElementById('pipeline-modal');
  const btnPipeline = document.getElementById('btn-audio-pipeline');
  const btnClosePipeline = document.getElementById('btn-close-pipeline');
  if (btnPipeline && pipelineModal) {
    btnPipeline.onclick = openPipelineModal;
  }
  if (btnClosePipeline && pipelineModal) {
    btnClosePipeline.onclick = () => { pipelineModal.style.display = 'none'; };
  }

  // Sleep Timer Modal
  const sleepModal = document.getElementById('sleep-modal');
  const btnSleep = document.getElementById('btn-sleep-timer');
  const btnCloseSleep = document.getElementById('btn-close-sleep');
  if (btnSleep && sleepModal) {
    btnSleep.onclick = () => { sleepModal.style.display = 'flex'; };
  }
  if (btnCloseSleep && sleepModal) {
    btnCloseSleep.onclick = () => { sleepModal.style.display = 'none'; };
  }
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
    btnEq.onclick = () => { eqModal.style.display = 'flex'; };
  }
  if (btnCloseEq && eqModal) {
    btnCloseEq.onclick = () => { eqModal.style.display = 'none'; };
  }
  document.querySelectorAll('[data-eq]').forEach(btn => {
    btn.onclick = () => {
      const preset = btn.getAttribute('data-eq');
      applyPreviewEq(preset);
      if (eqModal) eqModal.style.display = 'none';
    };
  });

  // Modal backdrop click-away
  ['settings-modal', 'pipeline-modal', 'sleep-modal', 'eq-modal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', (e) => {
        if (e.target === el) el.style.display = 'none';
      });
    }
  });

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

  // Expanded Now Playing view toggle
  const expandedView = document.getElementById('expanded-player-view');
  const artworkWrapper = document.getElementById('player-artwork-wrapper');
  const btnCollapsePlayer = document.getElementById('btn-collapse-player');
  if (artworkWrapper && expandedView) {
    artworkWrapper.onclick = () => {
      expandedView.classList.toggle('visible');
    };
  }
  if (btnCollapsePlayer && expandedView) {
    btnCollapsePlayer.onclick = () => {
      expandedView.classList.remove('visible');
    };
  }

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
    if (sleepMode === 'track') {
      cancelPreviewSleepTimer();
      triggerPreviewSleepPause();
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
  const playerBar = document.getElementById('apple-player-bar');
  if (playerBar) playerBar.classList.toggle('is-playing', isPlaying);
  if (document.body) document.body.classList.toggle('deja-playing', isPlaying);
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

const previewPaletteCache = new Map();

function extractTrackPalette(coverUrl, callback) {
  if (!coverUrl || typeof Image === 'undefined') {
    if (typeof callback === 'function') callback(null);
    return;
  }
  if (previewPaletteCache.has(coverUrl)) {
    if (typeof callback === 'function') callback(previewPaletteCache.get(coverUrl));
    return;
  }

  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          if (typeof callback === 'function') callback(null);
          return;
        }
        ctx.drawImage(img, 0, 0, 16, 16);
        const data = ctx.getImageData(0, 0, 16, 16).data;

        function getRGB(x, y) {
          const idx = (y * 16 + x) * 4;
          return [data[idx] || 0, data[idx + 1] || 0, data[idx + 2] || 0];
        }

        function boost(c) {
          const max = Math.max(...c);
          if (max < 45) {
            const factor = 55 / (max || 1);
            return [
              Math.min(255, Math.round(c[0] * factor + 30)),
              Math.min(255, Math.round(c[1] * factor + 25)),
              Math.min(255, Math.round(c[2] * factor + 40))
            ];
          }
          return c;
        }

        const c1 = boost(getRGB(2, 2));
        const c2 = boost(getRGB(13, 2));
        const c3 = boost(getRGB(2, 13));
        const c4 = boost(getRGB(13, 13));

        const palette = {
          c1: `rgba(${c1[0]}, ${c1[1]}, ${c1[2]}, 0.45)`,
          c2: `rgba(${c2[0]}, ${c2[1]}, ${c2[2]}, 0.40)`,
          c3: `rgba(${c3[0]}, ${c3[1]}, ${c3[2]}, 0.35)`,
          c4: `rgba(${c4[0]}, ${c4[1]}, ${c4[2]}, 0.35)`,
          primaryR: c1[0],
          primaryG: c1[1],
          primaryB: c1[2]
        };

        previewPaletteCache.set(coverUrl, palette);
        if (typeof callback === 'function') callback(palette);
      } catch (e) {
        if (typeof callback === 'function') callback(null);
      }
    };
    img.onerror = () => {
      if (typeof callback === 'function') callback(null);
    };
    img.src = coverUrl;
  } catch (e) {
    if (typeof callback === 'function') callback(null);
  }
}

// ==========================================
// BitChord Feature Suite for Deja Preview
// ==========================================

function renderPreviewQueue() {
  const queueBody = document.getElementById('preview-queue-body');
  const countLabel = document.getElementById('queue-count-label');
  if (!queueBody) return;
  if (countLabel) countLabel.innerText = `${SAMPLE_TRACKS.length} tracks`;

  queueBody.innerHTML = SAMPLE_TRACKS.map((t, idx) => `
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

let sleepTimerId = null;
let sleepRemainingSec = null;
let sleepMode = null; // 'duration' or 'track'

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
  const track = SAMPLE_TRACKS[currentIndex];
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

let currentEqPreset = 'Flat';
const EQ_PRESETS = {
  'Flat': { bass: 0, mid: 0, treble: 0 },
  'Bass Boost': { bass: 6, mid: 0, treble: -1 },
  'Acoustic': { bass: 2, mid: 3, treble: 1 },
  'Vocal Booster': { bass: -2, mid: 4, treble: 2 },
  'Treble Booster': { bass: -2, mid: 1, treble: 5 }
};

function applyPreviewEq(presetName) {
  currentEqPreset = presetName;
  const status = document.getElementById('eq-status-text');
  if (status) status.innerHTML = `Active Preset: <strong>${presetName}</strong>`;
  const buttons = document.querySelectorAll('#eq-picker-options .deja-picker-btn');
  buttons.forEach(btn => {
    btn.classList.toggle('selected', btn.getAttribute('data-eq') === presetName);
  });
  const eqBtn = document.getElementById('btn-equalizer');
  if (eqBtn) {
    eqBtn.classList.toggle('active', presetName !== 'Flat');
  }
}

function openPipelineModal() {
  const modal = document.getElementById('pipeline-modal');
  if (modal) {
    const bufferEl = document.getElementById('pipeline-buffer');
    if (bufferEl) {
      const buf = (15 + Math.random() * 8).toFixed(1);
      bufferEl.innerText = `${buf}s forward buffer`;
    }
    modal.style.display = 'flex';
  }
}

