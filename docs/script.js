/**
 * Deja Website Interactive Behaviors
 * Apple-grade UI animations, interactive mockups, EQ presets, and modal handlers.
 */

document.addEventListener('DOMContentLoaded', () => {
  initPlayerMockup();
  initLyricsDemo();
  initEqualizerDemo();
  initModals();
});

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

  startTimer();
}

// Interactive LRCLIB Synced Lyrics
function initLyricsDemo() {
  const lines = document.querySelectorAll('.lyric-line');
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
        notifyStatus.innerText = "✓ You're on the list! We'll notify you as soon as the APK is released.";
      }
      if (notifyInput) notifyInput.value = '';
    });
  }
}
