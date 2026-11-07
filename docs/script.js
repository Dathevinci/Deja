/**
 * Deja Website Interactive Behaviors
 * Apple-grade UI animations, interactive mockups, EQ presets, and modal handlers.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTwoBitPolarityToggle();
  initTwoBitMotionGraphics();
  initScrollMotionReveal();
  initPhoneHeroWordLyrics();
  initReplayCardsSpotlight();
  initBigScreenTabs();
  initPlayerMockup();
  initLyricsDemo();
  initEqualizerDemo();
  initModals();
  initLiveReleaseSync();
});

function initLiveReleaseSync() {
  fetch('https://api.github.com/repos/Dathevinci/Deja/releases/latest')
    .then(r => r.ok ? r.json() : null)
    .then(rel => {
      if (!rel || !rel.tag_name) return;
      const ver = rel.tag_name.replace(/^v/i, '');
      document.querySelectorAll('.brand-badge, .footer-version-tag').forEach(el => { el.textContent = 'v' + ver; });
      const assets = Array.isArray(rel.assets) ? rel.assets : [];
      const setupAsset = assets.find(a => a && a.name && /Setup.*\.exe$/i.test(a.name) && !a.name.endsWith('.blockmap'));
      const portAsset = assets.find(a => a && a.name && /^Deja[.-]\d+.*\.exe$/i.test(a.name) && !/Setup/i.test(a.name));
      const apkAsset = assets.find(a => a && a.name && /^Deja\.apk$/i.test(a.name));
      if (setupAsset && setupAsset.browser_download_url) {
        document.querySelectorAll('a[href*="Deja.Setup"]').forEach(a => { a.href = setupAsset.browser_download_url; });
      }
      if (portAsset && portAsset.browser_download_url) {
        document.querySelectorAll('a[href*="Deja.1."]').forEach(a => { a.href = portAsset.browser_download_url; });
      }
      if (apkAsset && apkAsset.browser_download_url) {
        document.querySelectorAll('a[href*="Deja.apk"]').forEach(a => { a.href = apkAsset.browser_download_url; });
      }
    })
    .catch(() => {});
}

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



// ==========================================================================
// 2-Bit UI/UX Polarity Switcher (Ink Dark vs Ivory Alabaster)
// ==========================================================================
function initTwoBitPolarityToggle() {
  const btn = document.getElementById('btn-twobit-polarity');
  const label = document.getElementById('twobit-polarity-label');
  const medallion = document.getElementById('twobit-angel-medallion');

  function applyMode(mode) {
    const isIvory = mode === 'ivory';
    document.body.classList.toggle('twobit-ivory', isIvory);
    if (label) {
      label.textContent = isIvory ? '2-BIT: IVORY' : '2-BIT: INK';
    }
    try {
      localStorage.setItem('deja_twobit_polarity', isIvory ? 'ivory' : 'ink');
    } catch {}
  }

  try {
    const saved = localStorage.getItem('deja_twobit_polarity');
    if (saved === 'ivory') applyMode('ivory');
  } catch {}

  if (btn) {
    btn.addEventListener('click', () => {
      const next = document.body.classList.contains('twobit-ivory') ? 'ink' : 'ivory';
      applyMode(next);
    });
  }

  if (medallion) {
    medallion.addEventListener('click', () => {
      const next = document.body.classList.contains('twobit-ivory') ? 'ink' : 'ivory';
      applyMode(next);
    });
  }
}

// ==========================================================================
// 60fps 2-Bit Motion Graphics Engine (Pixel Feathers + Stepped Audio Spectrum)
// ==========================================================================
function initTwoBitMotionGraphics() {
  const bgCanvas = document.getElementById('twobit-bg-canvas');
  const heroCanvas = document.getElementById('twobit-hero-canvas');
  const fpsEl = document.getElementById('twobit-live-fps');

  const PIXEL = 4; // 4px quantized 2-bit grid
  let pointerX = window.innerWidth * 0.5;
  let pointerY = window.innerHeight * 0.35;

  window.addEventListener('pointermove', (e) => {
    pointerX = e.clientX;
    pointerY = e.clientY;
  }, { passive: true });

  // 1. Background 2-Bit Pixel Feather & Halftone Particle Field
  let bgCtx = null;
  const particles = [];
  if (bgCanvas && bgCanvas.getContext) {
    bgCtx = bgCanvas.getContext('2d');
    const resizeBg = () => {
      bgCanvas.width = window.innerWidth;
      bgCanvas.height = window.innerHeight;
    };
    resizeBg();
    window.addEventListener('resize', resizeBg);

    const count = 42;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.35,
        vy: 0.25 + Math.random() * 0.55,
        kind: i % 3, // 0: pixel cross, 1: 2-bit feather sprite, 2: stepped square
        bit: i % 2 === 0 ? 'crimson' : 'ash',
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  // 2. Hero Stage Symmetrical 2-Bit Spectrum & Quantized Waveform
  let heroCtx = null;
  if (heroCanvas && heroCanvas.getContext) {
    heroCtx = heroCanvas.getContext('2d');
  }

  let lastFrame = performance.now();
  let frameCounter = 0;

  function renderMotionFrame(now) {
    frameCounter++;
    const t = now * 0.001;
    const isIvory = document.body.classList.contains('twobit-ivory');

    const colCrimson = isIvory ? '#8C2D33' : '#C43B44';
    const colDeep = '#4A181B';
    const colBone = isIvory ? '#140F11' : '#F4EFEA';
    const colAsh = isIvory ? '#73696B' : '#968E8B';

    // Update HUD telemetry counter periodically
    if (fpsEl && frameCounter % 30 === 0) {
      const dt = Math.max(1, now - lastFrame);
      const fps = Math.min(60, Math.round(1000 / (dt / 30)));
      fpsEl.textContent = `${fps || 60} FPS · OPUS 160K`;
      lastFrame = now;
    }

    // Draw Background 2-Bit Pixel Field
    if (bgCtx && bgCanvas) {
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx + Math.sin(t + p.phase) * 0.18;
        p.y += p.vy;

        // Subtle cursor repulsion snapped to grid
        const dx = p.x - pointerX;
        const dy = p.y - pointerY;
        const distSq = dx * dx + dy * dy;
        if (distSq < 18000 && distSq > 1) {
          const dist = Math.sqrt(distSq);
          p.x += (dx / dist) * 0.9;
          p.y += (dy / dist) * 0.9;
        }

        if (p.y > bgCanvas.height + 20) {
          p.y = -16;
          p.x = Math.random() * bgCanvas.width;
        }
        if (p.x < -20) p.x = bgCanvas.width + 16;
        if (p.x > bgCanvas.width + 20) p.x = -16;

        const gx = Math.floor(p.x / PIXEL) * PIXEL;
        const gy = Math.floor(p.y / PIXEL) * PIXEL;

        bgCtx.fillStyle = p.bit === 'crimson' ? colCrimson : colAsh;
        bgCtx.globalAlpha = p.bit === 'crimson' ? 0.42 : 0.24;

        if (p.kind === 0) {
          // 2-Bit Plus Reticle
          bgCtx.fillRect(gx, gy - PIXEL, PIXEL, PIXEL * 3);
          bgCtx.fillRect(gx - PIXEL, gy, PIXEL * 3, PIXEL);
        } else if (p.kind === 1) {
          // Falling 2-Bit Angel Feather Sprite (stepped diagonal pixels)
          bgCtx.fillRect(gx, gy, PIXEL * 2, PIXEL);
          bgCtx.fillRect(gx + PIXEL, gy + PIXEL, PIXEL * 2, PIXEL);
          bgCtx.fillRect(gx + PIXEL * 2, gy + PIXEL * 2, PIXEL, PIXEL);
        } else {
          // Quantized Dither Block
          bgCtx.fillRect(gx, gy, PIXEL, PIXEL);
        }
      }
      bgCtx.globalAlpha = 1;
    }

    // Draw Hero Stage 2-Bit Stepped Spectrum Bars Flanking the Angel Medallion
    if (heroCtx && heroCanvas) {
      const w = heroCanvas.width;
      const h = heroCanvas.height;
      heroCtx.clearRect(0, 0, w, h);

      const centerX = w / 2;
      const centerY = h / 2;
      const numBarsPerSide = 16;
      const barWidth = 8;
      const barGap = 6;
      const startOffset = 104; // Outside medallion

      for (let i = 0; i < numBarsPerSide; i++) {
        const waveA = Math.sin(t * 3.6 + i * 0.45);
        const waveB = Math.cos(t * 2.1 - i * 0.3);
        const falloff = 1 - (i / numBarsPerSide) * 0.58;
        const normalized = Math.max(0.12, ((waveA * 0.5 + waveB * 0.5 + 1) * 0.5) * falloff);
        const totalBlocks = Math.max(2, Math.round(normalized * 11));
        const blockH = 5;
        const blockGap = 2;

        const leftX = Math.floor((centerX - startOffset - (i + 1) * (barWidth + barGap)) / 2) * 2;
        const rightX = Math.floor((centerX + startOffset + i * (barWidth + barGap)) / 2) * 2;

        for (let b = 0; b < totalBlocks; b++) {
          const offsetY = b * (blockH + blockGap);
          // Peak block uses Bone Ivory, upper blocks use Crimson, base uses Ash/Deep Crimson
          if (b === totalBlocks - 1) {
            heroCtx.fillStyle = colBone;
          } else if (b >= totalBlocks * 0.55) {
            heroCtx.fillStyle = colCrimson;
          } else {
            heroCtx.fillStyle = colDeep;
          }

          // Mirror vertically from center horizon
          heroCtx.fillRect(leftX, centerY - offsetY - blockH, barWidth, blockH);
          heroCtx.fillRect(leftX, centerY + offsetY + 2, barWidth, blockH);

          heroCtx.fillRect(rightX, centerY - offsetY - blockH, barWidth, blockH);
          heroCtx.fillRect(rightX, centerY + offsetY + 2, barWidth, blockH);
        }
      }

      // Draw crisp horizontal 2-bit horizon scanline
      heroCtx.fillStyle = colAsh;
      heroCtx.globalAlpha = 0.32;
      heroCtx.fillRect(24, centerY - 1, w - 48, 2);
      heroCtx.globalAlpha = 1;
    }

    requestAnimationFrame(renderMotionFrame);
  }

  requestAnimationFrame(renderMotionFrame);
}

// ==========================================================================
// Smooth Scroll-Triggered Motion Choreography
// ==========================================================================
function initScrollMotionReveal() {
  const targets = document.querySelectorAll(
    '.feature-card, .replay-credit-card, .download-card, .showcase-split, .tv-card, .ecosystem-chip, .mockup-window'
  );
  if (!('IntersectionObserver' in window)) return;

  targets.forEach((el, idx) => {
    el.classList.add('twobit-reveal');
    el.style.transitionDelay = `${(idx % 4) * 55}ms`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach((el) => observer.observe(el));
}
