/**
 * Deja Website Interactive Behaviors
 * Apple-grade UI animations, interactive mockups, EQ presets, and modal handlers.
 */

document.addEventListener('DOMContentLoaded', () => {
  initPhoneHeroWordLyrics();
  initReplayCardsSpotlight();
  initBigScreenTabs();
  initPlayerMockup();
  initLyricsDemo();
  initEqualizerDemo();
  initModals();
});

// BitChord Hero: 60fps Word-Synced Coldplay "Yellow" Showcase
function initPhoneHeroWordLyrics() {
  const trackEl = document.getElementById('phone-lyrics-track');
  if (!trackEl) return;

  const YELLOW_LINES = [
    {
      timeMs: 0,
      words: [
        { text: 'Look', startMs: 200, endMs: 650 },
        { text: 'at', startMs: 650, endMs: 950 },
        { text: 'the', startMs: 950, endMs: 1300 },
        { text: 'stars', startMs: 1300, endMs: 3200 }
      ]
    },
    {
      timeMs: 3400,
      words: [
        { text: 'Look', startMs: 3400, endMs: 3850 },
        { text: 'how', startMs: 3850, endMs: 4250 },
        { text: 'they', startMs: 4250, endMs: 4650 },
        { text: 'shine', startMs: 4650, endMs: 5600 },
        { text: 'for', startMs: 5600, endMs: 6050 },
        { text: 'you', startMs: 6050, endMs: 7900 }
      ]
    },
    {
      timeMs: 8200,
      words: [
        { text: 'And', startMs: 8200, endMs: 8650 },
        { text: 'everything', startMs: 8650, endMs: 9850 },
        { text: 'you', startMs: 9850, endMs: 10350 },
        { text: 'do', startMs: 10350, endMs: 12200 }
      ]
    },
    {
      timeMs: 12500,
      words: [
        { text: 'Yeah,', startMs: 12500, endMs: 13100 },
        { text: 'they', startMs: 13100, endMs: 13550 },
        { text: 'were', startMs: 13550, endMs: 14050 },
        { text: 'all', startMs: 14050, endMs: 14650 },
        { text: 'yellow', startMs: 14650, endMs: 16800 }
      ]
    },
    {
      timeMs: 17100,
      words: [
        { text: 'I', startMs: 17100, endMs: 17450 },
        { text: 'came', startMs: 17450, endMs: 18050 },
        { text: 'along,', startMs: 18050, endMs: 19200 },
        { text: 'I', startMs: 19200, endMs: 19550 },
        { text: 'wrote', startMs: 19550, endMs: 20150 },
        { text: 'a', startMs: 20150, endMs: 20450 },
        { text: 'song', startMs: 20450, endMs: 21250 },
        { text: 'for', startMs: 21250, endMs: 21650 },
        { text: 'you', startMs: 21650, endMs: 23400 }
      ]
    },
    {
      timeMs: 23700,
      words: [
        { text: 'Your', startMs: 23700, endMs: 24200 },
        { text: 'skin,', startMs: 24200, endMs: 25300 },
        { text: 'oh', startMs: 25300, endMs: 25800 },
        { text: 'yeah,', startMs: 25800, endMs: 26600 },
        { text: 'your', startMs: 26600, endMs: 27050 },
        { text: 'skin', startMs: 27050, endMs: 27750 },
        { text: 'and', startMs: 27750, endMs: 28150 },
        { text: 'bones', startMs: 28150, endMs: 29800 }
      ]
    }
  ];

  const totalLoopMs = 30400;
  trackEl.innerHTML = YELLOW_LINES.map((line, lIdx) => {
    const wordsHtml = line.words.map((w, wIdx) =>
      `<span class="phone-word" data-l="${lIdx}" data-w="${wIdx}" data-start="${w.startMs}" data-end="${w.endMs}">${w.text}</span>`
    ).join('');
    return `<div class="phone-lyric-line" data-line="${lIdx}">${wordsHtml}</div>`;
  }).join('');

  const lineEls = Array.from(trackEl.querySelectorAll('.phone-lyric-line'));
  const wordElsByLine = lineEls.map(el => Array.from(el.querySelectorAll('.phone-word')));
  let startWall = performance.now();
  let lastActiveLine = -1;

  function step(now) {
    const t = (now - startWall) % totalLoopMs;
    let activeIdx = 0;
    for (let i = 0; i < YELLOW_LINES.length; i++) {
      if (t >= YELLOW_LINES[i].timeMs - 180) {
        activeIdx = i;
      }
    }

    if (activeIdx !== lastActiveLine) {
      lastActiveLine = activeIdx;
      lineEls.forEach((el, idx) => {
        el.classList.toggle('active', idx === activeIdx);
        el.classList.toggle('past', idx < activeIdx);
      });
      const activeEl = lineEls[activeIdx];
      if (activeEl) {
        const offsetTop = Math.max(0, activeEl.offsetTop - 36);
        trackEl.style.transform = `translate3d(0, ${-offsetTop}px, 0)`;
      }
    }

    wordElsByLine.forEach((words, lIdx) => {
      words.forEach((wEl) => {
        const s = Number(wEl.dataset.start);
        const e = Number(wEl.dataset.end);
        if (lIdx < activeIdx || t >= e) {
          wEl.classList.add('sung');
          wEl.classList.remove('singing');
          wEl.style.setProperty('--w-fill', '100%');
        } else if (lIdx > activeIdx || t <= s) {
          wEl.classList.remove('sung', 'singing');
          wEl.style.setProperty('--w-fill', '0%');
        } else {
          const pct = Math.max(0, Math.min(100, ((t - s) / Math.max(1, e - s)) * 100));
          wEl.classList.remove('sung');
          wEl.classList.add('singing');
          wEl.style.setProperty('--w-fill', `${pct.toFixed(1)}%`);
        }
      });
    });

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// Replay Credit Cards Interactive Cursor Spotlight
function initReplayCardsSpotlight() {
  const cards = document.querySelectorAll('[data-replay-card]');
  cards.forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
    });
  });
}

// Big Screen 4-Tab Switcher
function initBigScreenTabs() {
  const tabs = Array.from(document.querySelectorAll('[data-tv-tab]'));
  const slides = Array.from(document.querySelectorAll('[data-tv-slide]'));
  if (!tabs.length || !slides.length) return;

  let current = 0;
  function selectSlide(idx) {
    current = (idx + slides.length) % slides.length;
    tabs.forEach((tab, i) => {
      const active = i === current;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === current);
    });
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectSlide(i));
  });

  setInterval(() => {
    selectSlide(current + 1);
  }, 5000);
}

// Interactive Player Mockup
function initPlayerMockup() {
  const btnPlayPause = document.getElementById('mockup-play-pause');
  const scrubberProgress = document.getElementById('mockup-scrubber-progress');
  const timeCurrent = document.getElementById('mockup-time-current');
  const timeTotal = document.getElementById('mockup-time-total');

  let isPlaying = true;
  let currentTime = 78; // 1:18
  const totalDuration = 200; // 3:20
  let interval = null;

  function updateScrubber() {
    if (!scrubberProgress || !timeCurrent) return;
    const pct = (currentTime / totalDuration) * 100;
    scrubberProgress.style.width = pct + '%';
    const mins = Math.floor(currentTime / 60);
    const secs = Math.floor(currentTime % 60).toString().padStart(2, '0');
    timeCurrent.innerText = `${mins}:${secs}`;
  }

  function startTimer() {
    if (interval) clearInterval(interval);
    interval = setInterval(() => {
      currentTime++;
      if (currentTime > totalDuration) currentTime = 0;
      updateScrubber();
    }, 1000);
  }

  if (btnPlayPause) {
    btnPlayPause.addEventListener('click', () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        btnPlayPause.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        `;
        startTimer();
      } else {
        btnPlayPause.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        `;
        clearInterval(interval);
      }
    });
  }

  const scrubberBar = document.querySelector('.scrubber-bar');
  if (scrubberBar) {
    scrubberBar.style.cursor = 'pointer';
    scrubberBar.addEventListener('click', (e) => {
      const rect = scrubberBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const frac = Math.max(0, Math.min(1, clickX / rect.width));
      currentTime = Math.round(frac * totalDuration);
      updateScrubber();
    });
  }

  const albumCards = document.querySelectorAll('.album-card');
  const trackNameEl = document.querySelector('.player-track-name');
  const trackArtistEl = document.querySelector('.player-track-artist');
  const miniArtEl = document.querySelector('.player-mini-art img');
  const titlebarCenter = document.querySelector('.titlebar-center');

  albumCards.forEach((card) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const title = card.querySelector('.album-title')?.innerText || '';
      const artist = card.querySelector('.album-artist')?.innerText || '';
      const imgSrc = card.querySelector('.album-art-wrap img')?.getAttribute('src') || '';

      if (trackNameEl) trackNameEl.innerText = title;
      if (trackArtistEl) trackArtistEl.innerText = artist.split('·')[0].trim();
      if (miniArtEl && imgSrc) miniArtEl.setAttribute('src', imgSrc);
      if (titlebarCenter) titlebarCenter.innerText = `Deja — ${artist.split('·')[0].trim()} - ${title}`;

      currentTime = 0;
      updateScrubber();
      if (!isPlaying && btnPlayPause) {
        btnPlayPause.click();
      }
    });
  });

  startTimer();
}

// Interactive LRCLIB Synced Lyrics & Timing Offset Calibration
function initLyricsDemo() {
  const lines = document.querySelectorAll('.lyric-line');
  const btnMinus = document.getElementById('demo-offset-minus');
  const btnPlus = document.getElementById('demo-offset-plus');
  const badgeVal = document.getElementById('demo-offset-val');
  const quickMinus = document.getElementById('demo-nudge-minus5');
  const quickPlus = document.getElementById('demo-nudge-plus5');

  let currentOffset = 0;

  function updateOffset(newVal) {
    currentOffset = Math.max(-5.0, Math.min(5.0, Math.round(newVal * 10) / 10));
    if (badgeVal) {
      if (currentOffset > 0) {
        badgeVal.innerText = `+${currentOffset.toFixed(1)}s`;
        badgeVal.style.color = '#FA2D48';
      } else if (currentOffset < 0) {
        badgeVal.innerText = `${currentOffset.toFixed(1)}s`;
        badgeVal.style.color = '#FA2D48';
      } else {
        badgeVal.innerText = '0.0s';
        badgeVal.style.color = '';
      }
    }
  }

  if (btnMinus) {
    btnMinus.addEventListener('click', () => updateOffset(currentOffset - 0.1));
  }
  if (btnPlus) {
    btnPlus.addEventListener('click', () => updateOffset(currentOffset + 0.1));
  }
  if (badgeVal) {
    badgeVal.addEventListener('click', () => updateOffset(0));
  }
  if (quickMinus) {
    quickMinus.addEventListener('click', () => updateOffset(currentOffset - 0.5));
  }
  if (quickPlus) {
    quickPlus.addEventListener('click', () => updateOffset(currentOffset + 0.5));
  }

  lines.forEach((line) => {
    line.addEventListener('click', () => {
      lines.forEach(l => l.classList.remove('active'));
      line.classList.add('active');
    });
  });
}

// 5-Band Studio Equalizer Presets
const EQ_PRESETS = {
  'Flat': [50, 50, 50, 50, 50],
  'Bass Boost': [85, 78, 50, 40, 35],
  'Acoustic': [65, 55, 60, 75, 70],
  'Vocal Booster': [35, 45, 80, 85, 65],
  'Treble Booster': [30, 40, 55, 80, 90]
};

function initEqualizerDemo() {
  const chips = document.querySelectorAll('.eq-preset-chip');
  const fills = document.querySelectorAll('.eq-fill');

  function applyPreset(name) {
    const values = EQ_PRESETS[name] || EQ_PRESETS['Flat'];
    fills.forEach((fill, index) => {
      if (values[index] !== undefined) {
        fill.style.height = `${values[index]}%`;
      }
    });
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      applyPreset(chip.getAttribute('data-preset'));
    });
  });

  applyPreset('Bass Boost');
}

// Modals: Android & Download Details
function initModals() {
  const androidModal = document.getElementById('android-modal');
  const openAndroidBtns = document.querySelectorAll('.btn-open-android-modal');
  const closeAndroidBtn = document.getElementById('btn-close-android-modal');

  const notifyForm = document.getElementById('android-notify-form');
  const notifyInput = document.getElementById('android-notify-email');
  const notifyStatus = document.getElementById('android-notify-status');

  openAndroidBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (androidModal) androidModal.classList.add('open');
    });
  });

  if (closeAndroidBtn && androidModal) {
    closeAndroidBtn.addEventListener('click', () => {
      androidModal.classList.remove('open');
    });
  }

  if (androidModal) {
    androidModal.addEventListener('click', (e) => {
      if (e.target === androidModal) {
        androidModal.classList.remove('open');
      }
    });
  }

  if (notifyForm) {
    notifyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = notifyInput ? notifyInput.value.trim() : '';
      if (!email || !email.includes('@')) {
        if (notifyStatus) {
          notifyStatus.style.color = '#FA2D48';
          notifyStatus.innerText = 'Please enter a valid email address.';
        }
        return;
      }
      try {
        const saved = JSON.parse(localStorage.getItem('deja_android_waitlist') || '[]');
        if (!saved.includes(email)) saved.push(email);
        localStorage.setItem('deja_android_waitlist', JSON.stringify(saved));
      } catch {}

      if (notifyStatus) {
        notifyStatus.style.color = '#34C759';
        notifyStatus.innerText = "You're on the list. We'll notify you as soon as the APK is released.";
      }
      if (notifyInput) notifyInput.value = '';
    });
  }
}
