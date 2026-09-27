/**
 * Deja - Apple Music Desktop Client Controller
 * Complete BitChord Design System & Feature Alignment for YouTube Music:
 * - Dynamic Mesh Gradient Backdrop (MeshGradient.kt, ArtworkMeshBackdrop.kt)
 * - BitChord Frosted Glass Player Bar with Left Album Squircle & Center Transport
 * - Audio Pipeline / Stats for Nerds Sheet (NerdStats.kt)
 * - Sleep Timer with Live Countdown & Gentle Pause Fade (SleepTimer.kt)
 * - Web Audio API Equalizer Presets (GraphicEq)
 * - Word-synced Synced Lyrics Drawer with Spring Scrolling & Seek-on-Click
 * - Up Next Queue Drawer (PlayerQueue.kt)
 * - Recursive Shadow DOM Styling & Universal Scrollbar Elimination
 * - Polymer Promo, Mealbar & Hover Tooltip Elimination
 */

const artworkPaletteCache = new Map();

// BitChord Fallback Colors (from MeshGradient.kt)
const BITCHORD_FALLBACK_COLORS = {
  c1: 'rgba(58, 28, 113, 0.48)',   // Purple (0xFF3A1C71)
  c2: 'rgba(215, 109, 119, 0.44)', // Coral (0xFFD76D77)
  c3: 'rgba(43, 88, 118, 0.40)',   // Deep Blue (0xFF2B5876)
  c4: 'rgba(255, 175, 123, 0.40)', // Peach (0xFFFFAF7B)
  primaryR: 215,
  primaryG: 109,
  primaryB: 119
};

function extractArtworkPalette(coverUrl, callback) {
  if (!coverUrl) {
    if (typeof callback === 'function') callback(null);
    return;
  }
  if (typeof Image === 'undefined') {
    if (typeof callback === 'function') callback(BITCHORD_FALLBACK_COLORS);
    return;
  }
  if (artworkPaletteCache.has(coverUrl)) {
    if (typeof callback === 'function') callback(artworkPaletteCache.get(coverUrl));
    return;
  }

  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
          if (typeof callback === 'function') callback(BITCHORD_FALLBACK_COLORS);
          return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext ? canvas.getContext('2d', { willReadFrequently: true }) : null;
        if (!ctx) {
          if (typeof callback === 'function') callback(BITCHORD_FALLBACK_COLORS);
          return;
        }
        ctx.drawImage(img, 0, 0, 16, 16);
        const imgData = ctx.getImageData(0, 0, 16, 16).data;

        function getRGB(x, y) {
          const idx = (y * 16 + x) * 4;
          return [imgData[idx] || 0, imgData[idx + 1] || 0, imgData[idx + 2] || 0];
        }

        function boostLuminance([r, g, b]) {
          const max = Math.max(r, g, b);
          if (max < 48) {
            const boost = 55 / (max || 1);
            return [
              Math.min(255, Math.round(r * boost + 35)),
              Math.min(255, Math.round(g * boost + 28)),
              Math.min(255, Math.round(b * boost + 45))
            ];
          }
          return [r, g, b];
        }

        const c1 = boostLuminance(getRGB(2, 2));
        const c2 = boostLuminance(getRGB(13, 2));
        const c3 = boostLuminance(getRGB(2, 13));
        const c4 = boostLuminance(getRGB(13, 13));

        const palette = {
          c1: `rgba(${c1[0]}, ${c1[1]}, ${c1[2]}, 0.48)`,
          c2: `rgba(${c2[0]}, ${c2[1]}, ${c2[2]}, 0.44)`,
          c3: `rgba(${c3[0]}, ${c3[1]}, ${c3[2]}, 0.40)`,
          c4: `rgba(${c4[0]}, ${c4[1]}, ${c4[2]}, 0.40)`,
          primaryR: c1[0],
          primaryG: c1[1],
          primaryB: c1[2]
        };

        artworkPaletteCache.set(coverUrl, palette);
        if (typeof callback === 'function') callback(palette);
      } catch (e) {
        if (typeof callback === 'function') callback(BITCHORD_FALLBACK_COLORS);
      }
    };
    img.onerror = () => {
      if (typeof callback === 'function') callback(BITCHORD_FALLBACK_COLORS);
    };
    img.src = coverUrl;
  } catch (e) {
    if (typeof callback === 'function') callback(BITCHORD_FALLBACK_COLORS);
  }
}

/**
 * Universal Shadow DOM CSS
 * Eliminates Windows scrollbars (< > arrow buttons) everywhere across shadow trees
 */
const SHADOW_UNIVERSAL_SCROLLBAR_CSS = `
  :host, *, *::before, *::after {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
  :host::-webkit-scrollbar,
  ::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
    background: transparent !important;
  }
  :host::-webkit-scrollbar-button,
  ::-webkit-scrollbar-button {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }
  :host::-webkit-scrollbar-track,
  :host::-webkit-scrollbar-thumb,
  :host::-webkit-scrollbar-corner,
  ::-webkit-scrollbar-track,
  ::-webkit-scrollbar-thumb,
  ::-webkit-scrollbar-corner {
    display: none !important;
    background: transparent !important;
  }
`;

/**
 * BitChord Player Bar Shadow DOM CSS
 * Applied directly into ytmusic-player-bar.shadowRoot:
 * 1. Middle Controls (Art squircle + Title/Artist) -> Left side (Order 1)
 * 2. Left Controls (Transport Previous/Play/Next/Time) -> Center (Order 2)
 * 3. Right Controls (Volume/Extras) -> Right side (Order 3)
 * 4. Hairline Progress Bar along the top (ThinSlider.kt)
 * 5. Eliminates floating thumbnail preview hovering artifacts
 */
const SHADOW_PLAYER_BAR_CSS = `
  ${SHADOW_UNIVERSAL_SCROLLBAR_CSS}

  :host {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    height: 80px !important;
    min-height: 80px !important;
    max-height: 80px !important;
    background: rgba(28, 28, 30, 0.88) !important;
    backdrop-filter: blur(30px) saturate(190%) !important;
    -webkit-backdrop-filter: blur(30px) saturate(190%) !important;
    border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
    position: relative !important;
    box-sizing: border-box !important;
    padding: 0 20px !important;
  }

  /* ThinSlider.kt hairline progress bar along top */
  #progress-bar,
  tp-yt-paper-progress#progress-bar,
  tp-yt-paper-slider#progress-bar {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    height: 4px !important;
    margin: 0 !important;
    padding: 0 !important;
    cursor: pointer !important;
    transition: height 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
    z-index: 100 !important;
  }

  #progress-bar:hover,
  tp-yt-paper-progress#progress-bar:hover,
  tp-yt-paper-slider#progress-bar:hover {
    height: 7px !important;
  }

  #progress-bar #primaryProgress,
  #progress-bar .primary-progress {
    background: #FA2D48 !important;
    border-radius: 9999px !important;
  }

  #progress-bar #progressContainer,
  #progress-bar .progress-container {
    background: rgba(255, 255, 255, 0.16) !important;
    border-radius: 9999px !important;
  }

  /* Hide all hovering thumbnail preview artifacts and Polymer tooltips completely */
  #preview,
  #hover,
  #hover-time,
  #hover-time-info,
  .thumbnail-preview,
  #thumbnail-preview,
  #preview-container,
  .hover-container,
  .thumbnail-wrapper.preview,
  #thumbnail.preview,
  tp-yt-paper-tooltip,
  .paper-progress #hover,
  ytmusic-player-preview,
  ytmusic-thumbnail-preview,
  #sliderKnob .thumbnail-container,
  #sliderKnob img,
  #sliderKnob yt-img-shadow,
  #sliderKnob [id*="preview"],
  #sliderKnob [id*="hover"],
  [id*="preview"],
  [id*="hover"],
  [class*="thumbnail-preview"] {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
    width: 0 !important;
    height: 0 !important;
  }

  /* Order 1: Middle Controls -> LEFT (Album art + Title/Artist + Like) */
  .middle-controls {
    order: 1 !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 14px !important;
    flex: 0 1 32% !important;
    min-width: 0 !important;
    max-width: 35% !important;
    overflow: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* 52px Squircle album artwork (smooth scale + glow when playing) */
  .middle-controls .thumbnail-image-wrapper,
  .middle-controls #thumbnail-container,
  .middle-controls yt-img-shadow,
  .middle-controls .thumbnail,
  .middle-controls #thumbnail,
  .middle-controls .image.ytmusic-player-bar,
  .middle-controls img {
    width: 52px !important;
    height: 52px !important;
    min-width: 52px !important;
    min-height: 52px !important;
    max-width: 52px !important;
    max-height: 52px !important;
    border-radius: 12px !important;
    object-fit: cover !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45) !important;
    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease !important;
  }

  :host([playing]) .middle-controls .thumbnail-image-wrapper,
  :host([playing]) .middle-controls #thumbnail-container,
  :host([playing]) .middle-controls yt-img-shadow,
  :host([playing]) .middle-controls .thumbnail,
  :host([playing]) .middle-controls #thumbnail,
  :host([playing]) .middle-controls img,
  :host(.is-playing) .middle-controls img {
    transform: scale(1.05) !important;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.55), 0 0 16px rgba(250, 45, 72, 0.3) !important;
  }

  .middle-controls .content-info-wrapper {
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    min-width: 0 !important;
    overflow: hidden !important;
  }

  .middle-controls .title {
    font-size: 14px !important;
    font-weight: 700 !important;
    color: #FFFFFF !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  .middle-controls .byline {
    font-size: 12.5px !important;
    font-weight: 500 !important;
    color: rgba(255, 255, 255, 0.65) !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  /* Order 2: Left Controls -> CENTER (Apple-style Transport: Prev, Play/Pause, Next, Time) */
  .left-controls {
    order: 2 !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 16px !important;
    flex: 1 1 auto !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Prominent circular Play/Pause button */
  .left-controls #play-pause-button,
  .left-controls tp-yt-paper-icon-button#play-pause-button {
    width: 44px !important;
    height: 44px !important;
    border-radius: 50% !important;
    background: #FFFFFF !important;
    color: #000000 !important;
    fill: #000000 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35) !important;
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease !important;
  }

  .left-controls #play-pause-button:hover {
    transform: scale(1.08) !important;
    background: #F2F2F7 !important;
  }

  .left-controls #play-pause-button iron-icon,
  .left-controls #play-pause-button svg {
    fill: #000000 !important;
    color: #000000 !important;
  }

  .left-controls .previous-button,
  .left-controls .next-button {
    width: 32px !important;
    height: 32px !important;
    color: rgba(255, 255, 255, 0.85) !important;
    transition: transform 0.15s ease, color 0.15s ease !important;
  }

  .left-controls .previous-button:hover,
  .left-controls .next-button:hover {
    transform: scale(1.12) !important;
    color: #FFFFFF !important;
  }

  .left-controls .time-info {
    font-size: 12px !important;
    font-variant-numeric: tabular-nums !important;
    color: rgba(255, 255, 255, 0.6) !important;
  }

  /* Order 3: Right Controls -> RIGHT (Volume, Pipeline Badge, Sleep Timer, EQ, Lyrics, Queue) */
  .right-controls {
    order: 3 !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: flex-end !important;
    gap: 10px !important;
    flex: 0 1 32% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* BitChord Controls inside player bar shadowRoot */
  .deja-audio-pipeline-badge {
    display: inline-flex !important;
    align-items: center !important;
    gap: 5px !important;
    background: rgba(255, 255, 255, 0.08) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    border-radius: 9999px !important;
    color: rgba(255, 255, 255, 0.65) !important;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif !important;
    font-size: 11px !important;
    font-weight: 600 !important;
    letter-spacing: 0.02em !important;
    padding: 4px 10px !important;
    cursor: pointer !important;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
    user-select: none !important;
    flex-shrink: 0 !important;
  }

  .deja-audio-pipeline-badge:hover {
    background: rgba(255, 255, 255, 0.16) !important;
    color: #FFFFFF !important;
    border-color: rgba(250, 45, 72, 0.4) !important;
    box-shadow: 0 0 12px rgba(250, 45, 72, 0.25) !important;
    transform: scale(1.04) !important;
  }

  .deja-audio-pipeline-badge .badge-dot {
    width: 6px !important;
    height: 6px !important;
    border-radius: 50% !important;
    background: #34C759 !important;
    box-shadow: 0 0 6px rgba(52, 199, 89, 0.6) !important;
  }

  .deja-sleep-timer-btn,
  .deja-eq-btn,
  .deja-player-lyrics-btn,
  .deja-queue-btn {
    background: rgba(255, 255, 255, 0.08) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    color: rgba(255, 255, 255, 0.65) !important;
    width: 32px !important;
    height: 32px !important;
    border-radius: 50% !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
    padding: 0 !important;
    flex-shrink: 0 !important;
  }

  .deja-sleep-timer-btn:hover,
  .deja-eq-btn:hover,
  .deja-player-lyrics-btn:hover,
  .deja-queue-btn:hover {
    background: rgba(255, 255, 255, 0.16) !important;
    color: #FFFFFF !important;
    transform: scale(1.08) !important;
  }

  .deja-sleep-timer-btn.active,
  .deja-eq-btn.active,
  .deja-player-lyrics-btn.active,
  .deja-queue-btn.active {
    background: rgba(250, 45, 72, 0.18) !important;
    color: #FA2D48 !important;
    border-color: rgba(250, 45, 72, 0.4) !important;
  }

  .deja-sleep-timer-btn.has-timer {
    width: auto !important;
    padding: 0 10px !important;
    border-radius: 9999px !important;
    gap: 5px !important;
    font-size: 11.5px !important;
    font-weight: 600 !important;
    font-variant-numeric: tabular-nums !important;
  }

  .deja-sleep-timer-btn svg,
  .deja-eq-btn svg,
  .deja-player-lyrics-btn svg,
  .deja-queue-btn svg {
    stroke: currentColor !important;
  }
`;

/**
 * Now Playing / Player Page Shadow DOM CSS
 * Eliminates solid black void backgrounds inside ytmusic-player-page.shadowRoot
 */
const SHADOW_PLAYER_PAGE_CSS = `
  ${SHADOW_UNIVERSAL_SCROLLBAR_CSS}

  :host {
    position: relative !important;
    overflow: hidden !important;
    background: transparent !important;
  }

  #background,
  #player-page-background,
  #main-panel,
  #side-panel,
  #player,
  ytmusic-player,
  #song-video,
  #song-media-window,
  .main-panel,
  .side-panel {
    background: transparent !important;
    background-color: transparent !important;
    box-shadow: none !important;
  }

  #main-panel {
    position: relative !important;
    z-index: 2 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  #side-panel {
    position: relative !important;
    z-index: 2 !important;
  }

  /* Album artwork & media container on player page */
  #main-panel #player,
  .song-media-window {
    border-radius: 18px !important;
    overflow: hidden !important;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7) !important;
  }

  #main-panel #player img,
  #main-panel #player video,
  #song-video,
  #song-image,
  #thumbnail,
  img.ytmusic-player-page {
    border-radius: inherit !important;
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
  }

  /* BitChord Dynamic Mesh Gradient Backdrop (MeshGradient.kt, ArtworkMeshBackdrop.kt) */
  .deja-player-ambient-aura {
    position: absolute !important;
    inset: -25% !important;
    width: 150% !important;
    height: 150% !important;
    z-index: 0 !important;
    pointer-events: none !important;
    overflow: hidden !important;
    opacity: 0.88 !important;
    transition: opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }

  .deja-ambient-art-blur {
    position: absolute !important;
    inset: 0 !important;
    background-size: cover !important;
    background-position: center !important;
    filter: blur(85px) saturate(240%) brightness(0.48) !important;
    animation: dejaAuraDrift 20s infinite alternate cubic-bezier(0.4, 0, 0.2, 1) !important;
    transform: scale(1.08) !important;
    transition: opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }

  .deja-ambient-mesh-overlay {
    position: absolute !important;
    inset: -10% !important;
    width: 120% !important;
    height: 120% !important;
    background: radial-gradient(circle at 20% 25%, var(--deja-aura-c1, rgba(250, 45, 72, 0.50)) 0%, transparent 60%),
                radial-gradient(circle at 80% 20%, var(--deja-aura-c2, rgba(140, 40, 220, 0.45)) 0%, transparent 65%),
                radial-gradient(circle at 25% 80%, var(--deja-aura-c3, rgba(40, 160, 220, 0.40)) 0%, transparent 60%),
                radial-gradient(circle at 75% 75%, var(--deja-aura-c4, rgba(250, 140, 45, 0.40)) 0%, transparent 65%),
                radial-gradient(circle at 50% 50%, rgba(18, 18, 22, 0.30) 0%, rgba(14, 14, 16, 0.88) 100%) !important;
    mix-blend-mode: overlay !important;
    animation: dejaMeshDrift 24s infinite alternate ease-in-out !important;
    transition: opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }

  @keyframes dejaMeshDrift {
    0% { transform: scale(1) translate(0, 0) rotate(0deg); }
    33% { transform: scale(1.08) translate(-3%, 2%) rotate(2deg); }
    66% { transform: scale(1.05) translate(2%, -2%) rotate(-2deg); }
    100% { transform: scale(1.1) translate(-2%, 3%) rotate(1deg); }
  }

  @keyframes dejaAuraDrift {
    0% { transform: scale(1.05) translate(0, 0) rotate(0deg); }
    33% { transform: scale(1.15) translate(-3%, 2%) rotate(2deg); }
    66% { transform: scale(1.1) translate(2%, -2%) rotate(-1.5deg); }
    100% { transform: scale(1.18) translate(-1%, 3%) rotate(1deg); }
  }
`;

/**
 * Sidebar Guide Renderer Shadow DOM CSS
 * Eliminates chunky maroon buttons and scrollbars in ytmusic-guide-renderer.shadowRoot
 */
const SHADOW_GUIDE_CSS = `
  ${SHADOW_UNIVERSAL_SCROLLBAR_CSS}

  :host,
  #guide-wrapper,
  #guide-content,
  #items,
  #sections {
    background: transparent !important;
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }

  ytmusic-guide-entry-renderer,
  ytmusic-mini-guide-entry-renderer {
    border-radius: 10px !important;
    margin: 2px 8px !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }

  ytmusic-guide-entry-renderer tp-yt-paper-item,
  ytmusic-mini-guide-entry-renderer tp-yt-paper-item,
  .paper-item,
  #item {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }

  ytmusic-guide-entry-renderer:not(.deja-active):not(.sonora-active),
  ytmusic-mini-guide-entry-renderer:not(.deja-active):not(.sonora-active) {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
  }

  ytmusic-guide-entry-renderer.deja-active,
  ytmusic-guide-entry-renderer.sonora-active,
  ytmusic-mini-guide-entry-renderer.deja-active,
  ytmusic-mini-guide-entry-renderer.sonora-active {
    background: rgba(250, 45, 72, 0.12) !important;
    border-radius: 10px !important;
    box-shadow: 0 2px 10px rgba(250, 45, 72, 0.12) !important;
  }

  ytmusic-guide-entry-renderer.deja-active yt-formatted-string,
  ytmusic-guide-entry-renderer.deja-active .title,
  ytmusic-guide-entry-renderer.sonora-active yt-formatted-string,
  ytmusic-guide-entry-renderer.sonora-active .title {
    color: #FA2D48 !important;
    font-weight: 600 !important;
  }

  ytmusic-guide-entry-renderer.deja-active yt-icon,
  ytmusic-guide-entry-renderer.sonora-active yt-icon,
  ytmusic-guide-entry-renderer.deja-active tp-yt-iron-icon,
  ytmusic-guide-entry-renderer.sonora-active tp-yt-iron-icon {
    color: #FA2D48 !important;
    fill: #FA2D48 !important;
  }
`;

/**
 * Chip Cloud Shadow DOM CSS
 * Eliminates Windows scrollbars and < > arrow buttons inside ytmusic-chip-cloud-renderer.shadowRoot
 */
const SHADOW_CHIP_CSS = `
  ${SHADOW_UNIVERSAL_SCROLLBAR_CSS}

  :host,
  #chips,
  #chips-container,
  #chips-wrapper {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
  }

  #left-arrow-button,
  #right-arrow-button,
  #left-arrow,
  #right-arrow,
  .arrow-button,
  ytmusic-scroll-button-renderer {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
    width: 0 !important;
    height: 0 !important;
  }
`;

/**
 * Query all matching elements deep across the main document AND all open shadow trees.
 */
function querySelectorAllDeep(selector, root = (typeof document !== 'undefined' ? document : null)) {
  if (!root) return [];
  const results = [];
  try {
    if (root.querySelectorAll) {
      const matched = root.querySelectorAll(selector);
      for (let i = 0; i < matched.length; i++) {
        results.push(matched[i]);
      }
    }
  } catch (e) {}

  function walk(node) {
    if (!node) return;
    if (node.shadowRoot) {
      try {
        if (node.shadowRoot.querySelectorAll) {
          const shadowMatched = node.shadowRoot.querySelectorAll(selector);
          for (let i = 0; i < shadowMatched.length; i++) {
            if (!results.includes(shadowMatched[i])) {
              results.push(shadowMatched[i]);
            }
          }
        }
      } catch (e) {}
      walk(node.shadowRoot);
    }
    const children = node.children || [];
    for (let i = 0; i < children.length; i++) {
      walk(children[i]);
    }
  }

  const start = (root === document) ? (document.body || document.documentElement) : root;
  walk(start);
  return results;
}

// Hook Element.prototype.attachShadow immediately so EVERY Polymer / Lit component
// is styled the instant its shadowRoot is created
if (typeof Element !== 'undefined' && Element.prototype && Element.prototype.attachShadow) {
  if (!Element.prototype.__dejaShadowHooked__) {
    Element.prototype.__dejaShadowHooked__ = true;
    const origAttachShadow = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function(...args) {
      const shadowRoot = origAttachShadow.apply(this, args);
      try {
        injectShadowStyles(shadowRoot);
        if (typeof MutationObserver !== 'undefined') {
          const shadowObs = new MutationObserver(() => {
            scanAndInjectAllShadowRoots(shadowRoot);
          });
          shadowObs.observe(shadowRoot, { childList: true, subtree: true });
        }
      } catch (e) {}
      return shadowRoot;
    };
  }
}

/**
 * BitChord Sleep Timer Engine (SleepTimer.kt)
 */
const SleepTimer = {
  deadline: null,
  minutes: null,
  afterTrack: false,
  timerInterval: null,
  PRESETS: [15, 30, 45, 60],

  start(mins) {
    this.afterTrack = false;
    this.minutes = mins;
    this.deadline = Date.now() + mins * 60 * 1000;
    this.startWatcher();
    this.updateUI();
  },

  startAfterTrack() {
    this.minutes = null;
    this.deadline = null;
    this.afterTrack = true;
    this.startWatcher();
    this.updateUI();
  },

  cancel() {
    this.minutes = null;
    this.deadline = null;
    this.afterTrack = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.updateUI();
  },

  remainingMs() {
    if (!this.deadline) return null;
    return Math.max(0, this.deadline - Date.now());
  },

  isRunning() {
    return this.deadline !== null || this.afterTrack;
  },

  startWatcher() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.tick();
    }, 1000);
  },

  tick() {
    if (!this.isRunning()) return;
    this.updateUI();
    const video = (typeof document !== 'undefined') ? (document.querySelector('video.html5-main-video') || document.querySelector('video')) : null;
    if (!video) return;

    if (this.afterTrack) {
      if (video.ended || (video.duration && video.currentTime >= video.duration - 1.5)) {
        this.triggerSleepFade();
      }
    } else if (this.deadline) {
      if (Date.now() >= this.deadline) {
        this.triggerSleepFade();
      }
    }
  },

  triggerSleepFade() {
    this.cancel();
    const video = (typeof document !== 'undefined') ? (document.querySelector('video.html5-main-video') || document.querySelector('video')) : null;
    if (!video) return;

    const initialVol = video.volume;
    let step = 0;
    const steps = 20;
    const fadeTimer = setInterval(() => {
      step++;
      video.volume = Math.max(0, initialVol * (1 - step / steps));
      if (step >= steps) {
        clearInterval(fadeTimer);
        video.pause();
        video.volume = initialVol;
      }
    }, 100);
  },

  updateUI() {
    if (typeof document === 'undefined') return;
    const buttons = querySelectorAllDeep('.deja-sleep-timer-btn');
    buttons.forEach(btn => {
      if (this.afterTrack) {
        btn.classList.add('active', 'has-timer');
        btn.innerHTML = `<span class="sleep-icon">⏱</span> <span class="sleep-time">Track End</span>`;
      } else if (this.deadline) {
        const rem = this.remainingMs();
        const mins = Math.floor(rem / 60000);
        const secs = Math.floor((rem % 60000) / 1000);
        const display = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        btn.classList.add('active', 'has-timer');
        btn.innerHTML = `<span class="sleep-icon">⏱</span> <span class="sleep-time">${display}</span>`;
      } else {
        btn.classList.remove('active', 'has-timer');
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
      }
    });
  }
};

/**
 * BitChord Audio Pipeline / Stats for Nerds Engine (NerdStats.kt)
 */
const AudioPipeline = {
  getSnapshot() {
    const video = (typeof document !== 'undefined') ? (document.querySelector('video.html5-main-video') || document.querySelector('video')) : null;
    const track = (typeof window !== 'undefined' && window.__DEJA_CURRENT_TRACK__) || {};

    let bufferSeconds = 0;
    if (video && video.buffered && video.buffered.length > 0) {
      try {
        const cur = video.currentTime;
        for (let i = 0; i < video.buffered.length; i++) {
          if (video.buffered.start(i) <= cur && cur <= video.buffered.end(i)) {
            bufferSeconds = Math.max(0, Math.round((video.buffered.end(i) - cur) * 10) / 10);
            break;
          }
        }
      } catch (e) {}
    }

    return {
      codec: 'Opus (audio/webm)',
      bitrate: '160 kbps',
      sampleRate: '48.0 kHz',
      channels: '2.0 Stereo',
      bitDepth: '16-bit PCM',
      buffer: `${bufferSeconds}s forward buffer`,
      decoder: 'Chromium Hardware Accelerated Pipeline (Web Audio API sink)',
      qualityTier: 'BitChord Standard Tier (160 kbps Opus)',
      trackTitle: track.title || 'Current Track',
      trackArtist: track.artist || 'YouTube Music'
    };
  }
};

/**
 * BitChord Web Audio API Equalizer Engine (GraphicEq)
 */
const AudioEqualizer = {
  ctx: null,
  source: null,
  lowFilter: null,
  midFilter: null,
  highFilter: null,
  currentPreset: 'Flat',
  presets: {
    'Flat': { low: 0, mid: 0, high: 0 },
    'Bass Boost': { low: 6, mid: 0, high: 0 },
    'Acoustic': { low: 3, mid: 2, high: 1 },
    'Vocal Booster': { low: -2, mid: 4, high: 1 },
    'Treble Booster': { low: -1, mid: 1, high: 5 }
  },

  init() {
    if (this.ctx) return;
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      const video = document.querySelector('video.html5-main-video') || document.querySelector('video');
      if (video) {
        this.source = this.ctx.createMediaElementSource(video);
        this.lowFilter = this.ctx.createBiquadFilter();
        this.lowFilter.type = 'lowshelf';
        this.lowFilter.frequency.value = 150;

        this.midFilter = this.ctx.createBiquadFilter();
        this.midFilter.type = 'peaking';
        this.midFilter.frequency.value = 1200;
        this.midFilter.Q.value = 1.0;

        this.highFilter = this.ctx.createBiquadFilter();
        this.highFilter.type = 'highshelf';
        this.highFilter.frequency.value = 7000;

        this.source.connect(this.lowFilter);
        this.lowFilter.connect(this.midFilter);
        this.midFilter.connect(this.highFilter);
        this.highFilter.connect(this.ctx.destination);
      }
    } catch (e) {
      // Browsers may restrict createMediaElementSource if CORS or already connected
    }
  },

  applyPreset(presetName) {
    if (!this.presets[presetName]) return;
    this.currentPreset = presetName;
    if (!this.ctx) this.init();
    const config = this.presets[presetName];
    if (this.lowFilter) this.lowFilter.gain.value = config.low;
    if (this.midFilter) this.midFilter.gain.value = config.mid;
    if (this.highFilter) this.highFilter.gain.value = config.high;
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }
};

function initDejaApplePlayer(api = (typeof window !== 'undefined' ? (window.dejaAPI || window.sonoraAPI) : null)) {
  if (typeof window !== 'undefined') {
    if (window.__DEJA_INITIALIZED__ || window.__SONORA_INITIALIZED__) return;
    window.__DEJA_INITIALIZED__ = true;
    window.__SONORA_INITIALIZED__ = true;
  }

  const getEl = (dejaId, sonoraId) => {
    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return null;
    return document.getElementById(dejaId) || (sonoraId ? document.getElementById(sonoraId) : null);
  };

  let lastTrackId = '';
  let lastIsPlaying = null;
  let lastIsAd = null;
  let pollInterval = null;
  let shadowObserver = null;
  let preloadLyrics = [];
  let preloadLastActiveIndex = -1;
  let lyricsVideoHooked = null;
  let lastLyricsTrackId = '';

  // Wait for DOM ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
      bootstrap();
    }
  }

  function bootstrap() {
    if (!getEl('deja-titlebar', 'sonora-titlebar')) {
      injectTitlebar();
    }
    setupPlayerHooks();
    setupIpcListeners();
    setupKeyboardShortcuts();
    setupNavigationHooks();
    initShadowDomManager();
  }

  function setSafeHTML(element, html) {
    if (!element) return;
    try {
      if (typeof window !== 'undefined' && window.trustedTypes && typeof window.trustedTypes.createPolicy === 'function') {
        try {
          if (!window.__dejaPolicy) {
            window.__dejaPolicy = window.trustedTypes.createPolicy('deja-policy', {
              createHTML: (s) => s
            });
          }
          element.innerHTML = window.__dejaPolicy.createHTML(html);
          return;
        } catch (e) {
          if (window.trustedTypes.defaultPolicy) {
            try {
              element.innerHTML = window.trustedTypes.defaultPolicy.createHTML(html);
              return;
            } catch (e2) {}
          }
        }
      }
    } catch (e) {}

    try {
      if (typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        element.textContent = '';
        while (doc.body.firstChild) {
          element.appendChild(doc.body.firstChild);
        }
        return;
      }
    } catch (e) {}

    element.innerHTML = html;
  }

  /* -------------------------------------------------------------
     1. Apple Music Custom Titlebar Injection
     ------------------------------------------------------------- */
  function injectTitlebar() {
    if (getEl('deja-titlebar', 'sonora-titlebar')) return;
    if (typeof document === 'undefined' || typeof document.createElement !== 'function') return;

    const titlebar = document.createElement('header');
    titlebar.id = 'deja-titlebar';
    titlebar.className = 'deja-titlebar sonora-titlebar';
    setSafeHTML(titlebar, `
      <div class="deja-traffic-lights sonora-traffic-lights">
        <button class="deja-btn-traffic sonora-btn-traffic deja-btn-close sonora-btn-close" id="deja-close-btn" title="Close Deja"></button>
        <button class="deja-btn-traffic sonora-btn-traffic deja-btn-min sonora-btn-min" id="deja-min-btn" title="Minimize"></button>
        <button class="deja-btn-traffic sonora-btn-traffic deja-btn-max sonora-btn-max" id="deja-max-btn" title="Maximize"></button>
        <div class="deja-nav-controls sonora-nav-controls">
          <button class="deja-nav-btn sonora-nav-btn" id="deja-back-btn" title="Back">‹</button>
          <button class="deja-nav-btn sonora-nav-btn" id="deja-forward-btn" title="Forward">›</button>
        </div>
      </div>

      <div class="deja-top-center sonora-top-center">
        <div class="deja-search-pill sonora-search-pill" id="deja-search-bar" title="Search songs, artists, albums (Ctrl+K)">
          <svg class="deja-search-icon sonora-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" id="deja-search-input" class="deja-search-input sonora-search-input" placeholder="Search songs, artists, albums..." autocomplete="off" spellcheck="false" />
          <span class="deja-search-shortcut sonora-search-shortcut">⌘K</span>
        </div>
      </div>

      <div class="deja-top-right sonora-top-right">
        <button class="deja-icon-btn sonora-icon-btn" id="deja-lyrics-btn" title="Live Synced Lyrics">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <path d="M8 9h8"></path>
            <path d="M8 13h6"></path>
          </svg>
        </button>
        <button class="deja-icon-btn sonora-icon-btn" id="deja-mini-btn" title="Mini Player">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <rect x="12" y="9" width="8" height="6" rx="1" ry="1"></rect>
          </svg>
        </button>
        <button class="deja-icon-btn sonora-icon-btn" id="deja-settings-btn" title="Deja Settings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
        <button class="deja-icon-btn sonora-icon-btn deja-account-btn sonora-account-btn" id="deja-account-btn" title="Google Account / Sign In">
          <div class="deja-avatar-circle sonora-avatar-circle" id="deja-avatar-circle">
            <span id="deja-account-initial">D</span>
          </div>
        </button>
      </div>
    `);

    if (document.body && typeof document.body.prepend === 'function') {
      document.body.prepend(titlebar);
    } else if (document.body && typeof document.body.appendChild === 'function') {
      document.body.appendChild(titlebar);
    }

    // Titlebar Button Actions
    const closeBtn = getEl('deja-close-btn', 'sonora-close-btn');
    if (closeBtn) closeBtn.onclick = () => api?.windowAction('close');
    const minBtn = getEl('deja-min-btn', 'sonora-min-btn');
    if (minBtn) minBtn.onclick = () => api?.windowAction('minimize');
    const maxBtn = getEl('deja-max-btn', 'sonora-max-btn');
    if (maxBtn) maxBtn.onclick = () => api?.windowAction('maximize');
    const backBtn = getEl('deja-back-btn', 'sonora-back-btn');
    if (backBtn) backBtn.onclick = () => { if (typeof window !== 'undefined' && window.history) window.history.back(); };
    const forwardBtn = getEl('deja-forward-btn', 'sonora-forward-btn');
    if (forwardBtn) forwardBtn.onclick = () => { if (typeof window !== 'undefined' && window.history) window.history.forward(); };

    const searchBar = getEl('deja-search-bar', 'sonora-search-bar');
    const searchInput = getEl('deja-search-input', 'sonora-search-input');
    if (searchBar) {
      searchBar.onclick = (e) => {
        if (searchInput && e.target !== searchInput) {
          searchInput.focus();
        } else if (!searchInput) {
          const ytSearch = document.querySelector('ytmusic-search-box input') || document.querySelector('input.ytmusic-search-box') || document.querySelector('#search-input input');
          if (ytSearch) {
            ytSearch.focus();
            ytSearch.select();
          } else {
            const searchBtn = document.querySelector('ytmusic-nav-bar [aria-label*="Search"], ytmusic-search-box');
            if (searchBtn) searchBtn.click();
          }
        }
      };
    }

    if (searchInput) {
      const onSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const query = (searchInput.value || '').trim();
          if (query) {
            const ytSearch = document.querySelector('ytmusic-search-box input') || document.querySelector('input.ytmusic-search-box') || document.querySelector('#search-input input');
            if (ytSearch) {
              ytSearch.value = query;
              ytSearch.dispatchEvent?.(new Event('input', { bubbles: true, composed: true }));
              ytSearch.dispatchEvent?.(new Event('change', { bubbles: true, composed: true }));
              ytSearch.dispatchEvent?.(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, composed: true }));
            }
            if (typeof window !== 'undefined' && window.location) {
              const targetPath = `/search?q=${encodeURIComponent(query)}`;
              const ytApp = document.querySelector('ytmusic-app');
              if (ytApp && typeof ytApp.navigate === 'function') {
                ytApp.navigate(targetPath);
              } else if (window.history && typeof window.history.pushState === 'function') {
                window.history.pushState({}, '', targetPath);
                window.dispatchEvent(new CustomEvent('location-changed'));
              } else {
                window.location.href = targetPath;
              }
            }
          }
        }
      };

      if (typeof searchInput.addEventListener === 'function') {
        searchInput.addEventListener('keydown', onSearchKeyDown);
      } else {
        searchInput.onkeydown = onSearchKeyDown;
      }
    }

    const lyricsBtn = getEl('deja-lyrics-btn', 'sonora-lyrics-btn');
    if (lyricsBtn) lyricsBtn.onclick = () => toggleLyricsDrawer();
    const miniBtn = getEl('deja-mini-btn', 'sonora-mini-btn');
    if (miniBtn) miniBtn.onclick = () => api?.windowAction('toggle-miniplayer');
    const settingsBtn = getEl('deja-settings-btn', 'sonora-settings-btn');
    if (settingsBtn) settingsBtn.onclick = () => openSettingsModal();

    const accountBtn = getEl('deja-account-btn', 'sonora-account-btn');
    if (accountBtn) {
      accountBtn.onclick = () => {
        const nativeSignIn = document.querySelector('ytmusic-nav-bar ytmusic-sign-in-button-renderer a, a[href*="accounts.google.com"], ytmusic-sign-in-button-renderer a');
        if (nativeSignIn && nativeSignIn.href) {
          window.location.href = nativeSignIn.href;
          return;
        }
        const nativeAvatar = document.querySelector('ytmusic-nav-bar #avatar-btn, ytmusic-nav-bar ytmusic-settings-button, ytmusic-nav-bar button#avatar-btn, #avatar-btn, ytmusic-settings-button');
        if (nativeAvatar) {
          try {
            nativeAvatar.click();
            const popupContainer = document.querySelector('ytmusic-popup-container, tp-yt-iron-dropdown');
            if (popupContainer && popupContainer.style) {
              popupContainer.style.zIndex = '10002';
              return;
            }
          } catch (e) {}
        }
        openAccountModal();
      };
    }
  }

  /* -------------------------------------------------------------
     2. Shadow DOM Stylesheet Manager & Observer
     Traverses open ShadowRoots recursively and injects:
     - Universal scrollbar elimination
     - Player bar layout and squircle styling
     - Injects BitChord badges (Stats for Nerds, Sleep Timer, EQ, Lyrics, Queue)
     ------------------------------------------------------------- */
  function injectShadowStyles(shadowRoot) {
    if (!shadowRoot) return;
    const host = shadowRoot.host;
    const tagName = host ? (host.tagName || '').toUpperCase() : '';
    const hostId = host ? (host.id || '') : '';

    let customCss = SHADOW_UNIVERSAL_SCROLLBAR_CSS;
    let styleId = 'deja-universal-shadow-style';

    if (tagName === 'YTMUSIC-PLAYER-BAR' || hostId === 'player-bar') {
      customCss = SHADOW_PLAYER_BAR_CSS;
      styleId = 'deja-player-bar-shadow-style';
    } else if (tagName === 'YTMUSIC-PLAYER-PAGE' || hostId === 'player-page') {
      customCss = SHADOW_PLAYER_PAGE_CSS;
      styleId = 'deja-player-page-shadow-style';
    } else if (tagName === 'YTMUSIC-GUIDE-RENDERER' || tagName === 'YTMUSIC-MINI-GUIDE-RENDERER' || hostId === 'guide' || hostId === 'mini-guide') {
      customCss = SHADOW_GUIDE_CSS;
      styleId = 'deja-guide-shadow-style';
    } else if (tagName === 'YTMUSIC-CHIP-CLOUD-RENDERER' || hostId === 'chips') {
      customCss = SHADOW_CHIP_CSS;
      styleId = 'deja-chip-shadow-style';
    }

    if (typeof CSSStyleSheet !== 'undefined' && 'adoptedStyleSheets' in shadowRoot) {
      try {
        if (!shadowRoot.__dejaStyleSheetsAdopted__) {
          const sheet = new CSSStyleSheet();
          sheet.replaceSync(customCss);
          shadowRoot.adoptedStyleSheets = [...(shadowRoot.adoptedStyleSheets || []), sheet];
          shadowRoot.__dejaStyleSheetsAdopted__ = true;
        }
      } catch (e) {}
    }

    let styleEl = shadowRoot.getElementById ? shadowRoot.getElementById(styleId) : (shadowRoot.querySelector ? shadowRoot.querySelector(`#${styleId}`) : null);
    if (!styleEl && typeof document !== 'undefined' && typeof document.createElement === 'function') {
      try {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.textContent = customCss;
        shadowRoot.appendChild(styleEl);
      } catch (e) {}
    }
  }

  function scanAndInjectAllShadowRoots(node) {
    if (!node) return;
    if (node.shadowRoot) {
      injectShadowStyles(node.shadowRoot);
      scanAndInjectAllShadowRoots(node.shadowRoot);
    }
    const children = node.children || [];
    for (let i = 0; i < children.length; i++) {
      scanAndInjectAllShadowRoots(children[i]);
    }
  }

  function initShadowDomManager() {
    if (typeof document === 'undefined') return;

    // Scan initial document
    scanAndInjectAllShadowRoots(document.body);

    // Watch for newly appended nodes or element replacements
    if (typeof MutationObserver !== 'undefined' && document.body) {
      try {
        shadowObserver = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
              for (const node of mutation.addedNodes) {
                if (node.nodeType === 1) { // ELEMENT_NODE
                  scanAndInjectAllShadowRoots(node);
                }
              }
            }
          }
        });
        shadowObserver.observe(document.body, { childList: true, subtree: true });
      } catch (e) {}
    }
  }

  /* -------------------------------------------------------------
     3. BitChord Player Bar Controls Injection
     ------------------------------------------------------------- */
  function injectBitChordPlayerControls() {
    if (typeof document === 'undefined') return;
    const playerBar = document.querySelector('ytmusic-player-bar');
    if (!playerBar) return;

    // Enforce flex order directly on the elements as double guarantee
    const root = playerBar.shadowRoot || playerBar;
    const middle = root.querySelector ? root.querySelector('.middle-controls') : null;
    const left = root.querySelector ? root.querySelector('.left-controls') : null;
    const right = root.querySelector ? root.querySelector('.right-controls') : null;
    if (middle && middle.style && typeof middle.style.setProperty === 'function') {
      middle.style.setProperty('order', '1', 'important');
    }
    if (left && left.style && typeof left.style.setProperty === 'function') {
      left.style.setProperty('order', '2', 'important');
    }
    if (right && right.style && typeof right.style.setProperty === 'function') {
      right.style.setProperty('order', '3', 'important');
    }

    // Hide any floating hover/preview thumbnail artifacts inside the progress bar or shadowRoot
    const previewArtifacts = root.querySelectorAll ? root.querySelectorAll('#preview, #hover, #hover-time, .thumbnail-preview, #sliderKnob .thumbnail-container, #sliderKnob img, tp-yt-paper-tooltip, ytmusic-player-preview') : [];
    if (previewArtifacts && previewArtifacts.forEach) {
      previewArtifacts.forEach(el => {
        if (el && el.style && typeof el.style.setProperty === 'function') {
          el.style.setProperty('display', 'none', 'important');
          el.style.setProperty('visibility', 'hidden', 'important');
          el.style.setProperty('opacity', '0', 'important');
          el.style.setProperty('pointer-events', 'none', 'important');
        }
      });
    }

    if (!right) return;

    // 1. Stats for Nerds / Audio Pipeline Badge
    if (!right.querySelector('.deja-audio-pipeline-badge')) {
      const badge = document.createElement('div');
      badge.className = 'deja-audio-pipeline-badge';
      badge.title = 'BitChord Audio Pipeline & Stats for Nerds';
      badge.innerHTML = `<span class="badge-dot"></span> <span>160k Opus</span>`;
      badge.onclick = (e) => {
        e.stopPropagation();
        openAudioPipelineModal();
      };
      right.prepend(badge);
    }

    // 2. Sleep Timer Button
    if (!right.querySelector('.deja-sleep-timer-btn')) {
      const sleepBtn = document.createElement('button');
      sleepBtn.className = 'deja-sleep-timer-btn';
      sleepBtn.title = 'BitChord Sleep Timer';
      sleepBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
      sleepBtn.onclick = (e) => {
        e.stopPropagation();
        openSleepTimerModal();
      };
      right.appendChild(sleepBtn);
    }

    // 3. Equalizer Button
    if (!right.querySelector('.deja-eq-btn')) {
      const eqBtn = document.createElement('button');
      eqBtn.className = 'deja-eq-btn';
      eqBtn.title = 'BitChord Equalizer Presets';
      eqBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>`;
      eqBtn.onclick = (e) => {
        e.stopPropagation();
        openEqualizerModal();
      };
      right.appendChild(eqBtn);
    }

    // 4. Word-Synced Lyrics Button
    if (!right.querySelector('.deja-player-lyrics-btn')) {
      const lyricsBtn = document.createElement('button');
      lyricsBtn.className = 'deja-icon-btn deja-player-lyrics-btn';
      lyricsBtn.title = 'Word-Synced Live Lyrics';
      lyricsBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><path d="M8 9h8"></path><path d="M8 13h6"></path></svg>`;
      lyricsBtn.onclick = (e) => {
        e.stopPropagation();
        toggleLyricsDrawer();
      };
      right.appendChild(lyricsBtn);
    }

    // 5. Up Next Queue Drawer Button
    if (!right.querySelector('.deja-queue-btn')) {
      const queueBtn = document.createElement('button');
      queueBtn.className = 'deja-queue-btn';
      queueBtn.title = 'Up Next Queue';
      queueBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`;
      queueBtn.onclick = (e) => {
        e.stopPropagation();
        toggleQueueDrawer();
      };
      right.appendChild(queueBtn);
    }
  }

  /* -------------------------------------------------------------
     4. YouTube Music Audio & Ad Observer
     ------------------------------------------------------------- */
  function setupPlayerHooks() {
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(extractPlayerState, 800);
    extractPlayerState();
  }

  function extractPlayerState() {
    if (typeof document === 'undefined') return;
    const video = document.querySelector('video.html5-main-video') || document.querySelector('video');
    const playerBar = document.querySelector('ytmusic-player-bar');

    if (!playerBar && !video) return;

    // Detect Advertisement (compliance safe: no blocking, native presentation with ad badge)
    const isAdPlaying = !!(
      document.querySelector('.ad-showing') ||
      document.querySelector('.video-ads')?.children.length > 0 ||
      playerBar?.hasAttribute('is-ad') ||
      document.querySelector('.ytp-ad-player-overlay') ||
      document.querySelector('.ytp-ad-module')?.childElementCount > 0
    );

    updateAdBadge(isAdPlaying);

    const titleEl = playerBar?.querySelector('.title.ytmusic-player-bar') || playerBar?.querySelector('.content-info-wrapper .title');
    const bylineEl = playerBar?.querySelector('.byline.ytmusic-player-bar') || playerBar?.querySelector('.content-info-wrapper .byline');
    const imageEl = playerBar?.querySelector('img.image.ytmusic-player-bar') || playerBar?.querySelector('ytmusic-player-bar img');

    const title = titleEl ? titleEl.textContent.trim() : (isAdPlaying ? 'Advertisement' : 'Deja');
    const byline = bylineEl ? bylineEl.textContent.trim() : (isAdPlaying ? 'Google Ad' : 'YouTube Music');
    const coverUrl = imageEl ? imageEl.src : '';

    const isPlaying = video ? !video.paused : false;
    const currentTime = video ? video.currentTime : 0;
    const duration = video ? video.duration : 0;

    const trackId = `${title}-${byline}-${Math.floor(duration)}`;

    const trackData = {
      id: trackId,
      title: title,
      artist: byline.split('•')[0]?.trim() || byline,
      album: byline.split('•')[1]?.trim() || 'YouTube Music',
      coverUrl: coverUrl,
      isPlaying: isPlaying,
      currentTime: currentTime,
      duration: duration,
      isAd: isAdPlaying
    };

    if (trackId !== lastTrackId || isPlaying !== lastIsPlaying || isAdPlaying !== lastIsAd) {
      const isNewTrack = (trackId !== lastTrackId);
      lastTrackId = trackId;
      lastIsPlaying = isPlaying;
      lastIsAd = isAdPlaying;
      if (typeof window !== 'undefined') {
        window.__DEJA_CURRENT_TRACK__ = trackData;
        window.__SONORA_CURRENT_TRACK__ = trackData;
      }

      if (api?.sendTrackChanged) {
        api.sendTrackChanged(trackData);
      }

      if (isNewTrack) {
        lastLyricsTrackId = '';
        const overlay = getEl('deja-lyrics-overlay', 'sonora-lyrics-overlay');
        if (overlay && overlay.classList.contains('visible')) {
          resolvePreloadLyrics(trackData);
        }
      }
    }

    if (video && video !== lyricsVideoHooked && typeof video.addEventListener === 'function') {
      lyricsVideoHooked = video;
      video.addEventListener('timeupdate', () => {
        updatePreloadLiveLyrics(video.currentTime);
      });
      video.addEventListener('seeked', () => {
        updatePreloadLiveLyrics(video.currentTime, true);
      });
    }

    // Toggle Apple playing states for spring scaling and aura breathing
    if (document.body && document.body.classList) {
      document.body.classList.toggle('deja-playing', isPlaying);
    }
    if (playerBar && playerBar.classList) {
      playerBar.classList.toggle('is-playing', isPlaying);
      if (typeof playerBar.setAttribute === 'function') {
        if (isPlaying) playerBar.setAttribute('playing', '');
        else playerBar.removeAttribute('playing');
      }
    }

    // Synchronize BitChord 4-blob animated mesh aura for now-playing / watch view
    updateAmbientAura(coverUrl);

    // Synchronize active sidebar navigation state (strictly single route isolation)
    updateSidebarActiveState();

    // Synchronize account avatar from native DOM if present
    updateAccountAvatar();

    // Inject BitChord buttons into player bar
    injectBitChordPlayerControls();

    // Dismiss intrusive Polymer mealbars, promo banners, and hovering tooltips
    dismissMealbarsAndPromos();

    // Tick sleep timer
    SleepTimer.tick();
  }

  function dismissMealbarsAndPromos() {
    if (typeof document === 'undefined') return;
    const promos = querySelectorAllDeep('ytmusic-mealbar-promo-renderer, tp-yt-paper-tooltip');
    promos.forEach(p => {
      try {
        if (p.style) {
          p.style.setProperty('display', 'none', 'important');
          p.style.setProperty('opacity', '0', 'important');
          p.style.setProperty('visibility', 'hidden', 'important');
          p.style.setProperty('pointer-events', 'none', 'important');
        }
      } catch (e) {}
    });
  }

  /* -------------------------------------------------------------
     5. BitChord Dynamic Mesh Gradient Backdrop (MeshGradient.kt)
     4 luminous color blobs with soft drift, rotation, and 1.4s crossfades
     ------------------------------------------------------------- */
  function updateAmbientAura(coverUrl) {
    if (typeof document === 'undefined' || typeof document.querySelector !== 'function') return;
    const playerPage = document.querySelector('ytmusic-player-page') || document.getElementById('player-page');
    if (playerPage) {
      // Enforce complete transparency on native player containers to avoid black void in light and shadow roots
      const roots = [playerPage];
      if (playerPage.shadowRoot) roots.push(playerPage.shadowRoot);
      roots.forEach(root => {
        if (root.style) {
          root.style.setProperty('background', 'transparent', 'important');
          root.style.setProperty('background-color', 'transparent', 'important');
        }
        const bgElements = root.querySelectorAll ? root.querySelectorAll('#background, #player-page-background, #main-panel, #side-panel, #player, ytmusic-player, #song-video, #song-media-window, .main-panel, .side-panel') : [];
        bgElements.forEach(el => {
          if (el.style) {
            el.style.setProperty('background', 'transparent', 'important');
            el.style.setProperty('background-color', 'transparent', 'important');
            el.style.setProperty('box-shadow', 'none', 'important');
          }
        });
      });

      let aura = getEl('deja-player-ambient-aura', 'sonora-player-ambient-aura');
      if (!aura && typeof document.createElement === 'function') {
        aura = document.createElement('div');
        aura.id = 'deja-player-ambient-aura';
        aura.className = 'deja-player-ambient-aura sonora-player-ambient-aura';
        setSafeHTML(aura, `
          <div class="deja-ambient-art-blur" id="deja-ambient-art-blur"></div>
          <div class="deja-ambient-mesh-overlay" id="deja-ambient-mesh-overlay"></div>
        `);
        if (typeof playerPage.prepend === 'function') {
          playerPage.prepend(aura);
        } else if (typeof playerPage.appendChild === 'function') {
          playerPage.appendChild(aura);
        }
      }

      // Also inject into playerPage.shadowRoot if present and missing
      if (playerPage.shadowRoot && !playerPage.shadowRoot.getElementById?.('deja-player-ambient-aura-shadow')) {
        try {
          const shadowAura = document.createElement('div');
          shadowAura.id = 'deja-player-ambient-aura-shadow';
          shadowAura.className = 'deja-player-ambient-aura';
          setSafeHTML(shadowAura, `
            <div class="deja-ambient-art-blur" id="deja-shadow-art-blur"></div>
            <div class="deja-ambient-mesh-overlay" id="deja-shadow-mesh-overlay"></div>
          `);
          playerPage.shadowRoot.prepend(shadowAura);
        } catch (e) {}
      }

      const blurEl = getEl('deja-ambient-art-blur', 'sonora-ambient-art-blur');
      if (blurEl && coverUrl && blurEl.style) {
        const bgVal = `url("${coverUrl}")`;
        if (blurEl.style.backgroundImage !== bgVal) {
          blurEl.style.backgroundImage = bgVal;
        }
      }

      const shadowBlurEl = playerPage.shadowRoot?.getElementById?.('deja-shadow-art-blur');
      if (shadowBlurEl && coverUrl && shadowBlurEl.style) {
        const bgVal = `url("${coverUrl}")`;
        if (shadowBlurEl.style.backgroundImage !== bgVal) {
          shadowBlurEl.style.backgroundImage = bgVal;
        }
      }

      // Sample 4 vibrant colors from artwork and dynamically paint luminous mesh
      if (coverUrl) {
        extractArtworkPalette(coverUrl, (palette) => {
          if (!palette) return;
          const auras = [aura, playerPage.shadowRoot?.getElementById?.('deja-player-ambient-aura-shadow')].filter(Boolean);
          auras.forEach(a => {
            if (a && a.style && typeof a.style.setProperty === 'function') {
              a.style.setProperty('--deja-aura-c1', palette.c1);
              a.style.setProperty('--deja-aura-c2', palette.c2);
              a.style.setProperty('--deja-aura-c3', palette.c3);
              a.style.setProperty('--deja-aura-c4', palette.c4);
              a.style.setProperty('--deja-aura-r', String(palette.primaryR));
              a.style.setProperty('--deja-aura-g', String(palette.primaryG));
              a.style.setProperty('--deja-aura-b', String(palette.primaryB));
            }
          });
          if (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && typeof document.documentElement.style.setProperty === 'function') {
            document.documentElement.style.setProperty('--deja-aura-c1', palette.c1);
            document.documentElement.style.setProperty('--deja-aura-c2', palette.c2);
            document.documentElement.style.setProperty('--deja-aura-c3', palette.c3);
            document.documentElement.style.setProperty('--deja-aura-c4', palette.c4);
            document.documentElement.style.setProperty('--deja-aura-r', String(palette.primaryR));
            document.documentElement.style.setProperty('--deja-aura-g', String(palette.primaryG));
            document.documentElement.style.setProperty('--deja-aura-b', String(palette.primaryB));
          }
        });
      }
    }

    // Also update lyrics drawer dynamic aura if open
    const lyricsAura = document.querySelector('.deja-lyrics-aura, .sonora-lyrics-aura');
    if (lyricsAura && coverUrl && lyricsAura.style) {
      const bgVal = `url("${coverUrl}")`;
      if (lyricsAura.style.backgroundImage !== bgVal) {
        lyricsAura.style.backgroundImage = bgVal;
      }
    }
  }

  /* -------------------------------------------------------------
     6. Sidebar Single-Route Navigation State (Strict Isolation)
     Eliminates multiple chunky highlights on Home, Explore, Library
     ------------------------------------------------------------- */
  function updateSidebarActiveState() {
    if (typeof document === 'undefined') return;
    const currentPath = ((typeof window !== 'undefined' && window.location && window.location.pathname) || '').toLowerCase();
    const cleanPath = currentPath.replace(/^\/+|\/+$/g, '');

    const isHomeRoute = cleanPath === '' || cleanPath === 'home' || cleanPath.includes('femusic_home');
    const isExploreRoute = cleanPath.includes('explore') || cleanPath.includes('femusic_explore');
    const isLibraryRoute = cleanPath.includes('library') || cleanPath.includes('femusic_library');

    const entries = querySelectorAllDeep('ytmusic-guide-entry-renderer, ytmusic-mini-guide-entry-renderer');
    if (!entries || !entries.forEach) return;

    let activeEntry = null;

    entries.forEach(entry => {
      const link = entry.querySelector ? entry.querySelector('a') : null;
      const rawHref = link ? (link.getAttribute('href') || link.pathname || '') : '';
      const cleanHref = rawHref.replace(/^\/+|\/+$/g, '').toLowerCase();
      const text = (entry.textContent || '').trim().toLowerCase();

      let matches = false;
      if (cleanHref) {
        if (cleanHref === '' || cleanHref === 'home' || cleanHref.includes('femusic_home')) {
          matches = isHomeRoute;
        } else if (cleanHref.includes('explore') || cleanHref.includes('femusic_explore')) {
          matches = isExploreRoute;
        } else if (cleanHref.includes('library') || cleanHref.includes('femusic_library')) {
          matches = isLibraryRoute;
        } else if (cleanPath && (cleanPath === cleanHref || cleanPath.startsWith(cleanHref))) {
          matches = true;
        }
      } else {
        if (text.includes('home')) {
          matches = isHomeRoute;
        } else if (text.includes('explore')) {
          matches = isExploreRoute;
        } else if (text.includes('library')) {
          matches = isLibraryRoute;
        }
      }

      if (matches && !activeEntry) {
        activeEntry = entry;
      }
    });

    // Strictly ONE entry gets deja-active; all others are cleansed
    entries.forEach(entry => {
      const isActive = (entry === activeEntry);
      if (entry.classList && typeof entry.classList.toggle === 'function') {
        entry.classList.toggle('deja-active', isActive);
        entry.classList.toggle('sonora-active', isActive);
      }
      if (typeof entry.setAttribute === 'function') {
        if (isActive) {
          entry.setAttribute('aria-selected', 'true');
        } else {
          entry.removeAttribute('aria-selected');
          if (entry.classList && typeof entry.classList.remove === 'function') {
            entry.classList.remove('iron-selected', 'active');
          }
        }
      }

      // Also clean any child paper-item
      const paperItem = entry.querySelector ? entry.querySelector('tp-yt-paper-item, .paper-item') : null;
      if (paperItem) {
        if (paperItem.style) {
          paperItem.style.setProperty('background', 'transparent', 'important');
          paperItem.style.setProperty('box-shadow', 'none', 'important');
        }
        if (!isActive) {
          paperItem.removeAttribute?.('aria-selected');
          paperItem.classList?.remove?.('iron-selected', 'active');
        }
      }
    });
  }

  function setupNavigationHooks() {
    updateSidebarActiveState();

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => {
        setTimeout(updateSidebarActiveState, 50);
      });
      window.addEventListener('yt-navigate-finish', () => {
        setTimeout(updateSidebarActiveState, 50);
      });

      try {
        if (window.history) {
          const origPushState = window.history.pushState;
          if (typeof origPushState === 'function') {
            window.history.pushState = function(...args) {
              const ret = origPushState.apply(this, args);
              setTimeout(updateSidebarActiveState, 50);
              return ret;
            };
          }
          const origReplaceState = window.history.replaceState;
          if (typeof origReplaceState === 'function') {
            window.history.replaceState = function(...args) {
              const ret = origReplaceState.apply(this, args);
              setTimeout(updateSidebarActiveState, 50);
              return ret;
            };
          }
        }
      } catch (e) {}

      if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
        document.addEventListener('click', (e) => {
          const guideEntry = e.target && e.target.closest ? e.target.closest('ytmusic-guide-entry-renderer, ytmusic-mini-guide-entry-renderer') : null;
          if (guideEntry) {
            setTimeout(updateSidebarActiveState, 80);
            setTimeout(updateSidebarActiveState, 300);
          }
        }, true);
      }
    }
  }

  function updateAccountAvatar() {
    const avatarCircle = getEl('deja-avatar-circle', 'sonora-avatar-circle');
    if (!avatarCircle) return;

    const nativeAvatarImg = document.querySelector('ytmusic-nav-bar #avatar-btn img, ytmusic-nav-bar ytmusic-settings-button img, #avatar-btn img, ytmusic-settings-button img, ytmusic-avatar img');
    if (nativeAvatarImg && nativeAvatarImg.src) {
      const existingImg = avatarCircle.querySelector('img');
      if (existingImg) {
        if (existingImg.src !== nativeAvatarImg.src) {
          existingImg.src = nativeAvatarImg.src;
        }
      } else {
        const img = document.createElement('img');
        img.src = nativeAvatarImg.src;
        img.alt = 'Account';
        img.className = 'deja-avatar-img sonora-avatar-img';
        avatarCircle.textContent = '';
        avatarCircle.appendChild(img);
      }
    }
  }

  function updateAdBadge(isAd) {
    let adBadge = getEl('deja-ad-badge', 'sonora-ad-badge');
    const playerBar = document.querySelector('ytmusic-player-bar');

    if (isAd) {
      if (!adBadge && playerBar) {
        adBadge = document.createElement('span');
        adBadge.id = 'deja-ad-badge';
        adBadge.className = 'deja-ad-badge sonora-ad-badge';
        adBadge.innerText = 'ADVERTISEMENT';
        const titleWrapper = playerBar.querySelector('.title.ytmusic-player-bar')?.parentElement || playerBar.querySelector('.middle-controls');
        if (titleWrapper) {
          titleWrapper.appendChild(adBadge);
        }
      }
      if (adBadge) adBadge.style.display = 'inline-flex';
    } else if (adBadge) {
      adBadge.style.display = 'none';
    }
  }

  /* -------------------------------------------------------------
     7. Incoming IPC & Action Dispatcher
     ------------------------------------------------------------- */
  function setupIpcListeners() {
    if (!api?.onPlayerAction) return;

    api.onPlayerAction(({ action, payload }) => {
      handlePlayerAction(action, payload);
    });

    api.onMiniPlayerChanged?.((isMini) => {
      if (document.body && document.body.classList) {
        if (isMini) {
          document.body.classList.add('mini-player-mode');
        } else {
          document.body.classList.remove('mini-player-mode');
        }
      }
    });
  }

  function handlePlayerAction(action, payload) {
    const video = document.querySelector('video.html5-main-video') || document.querySelector('video');
    const playPauseBtn = document.querySelector('#play-pause-button') || document.querySelector('tp-yt-paper-icon-button#play-pause-button');
    const nextBtn = document.querySelector('.next-button') || document.querySelector('tp-yt-paper-icon-button.next-button');
    const prevBtn = document.querySelector('.previous-button') || document.querySelector('tp-yt-paper-icon-button.previous-button');
    const repeatBtn = document.querySelector('tp-yt-paper-icon-button.repeat');
    const shuffleBtn = document.querySelector('tp-yt-paper-icon-button.shuffle');

    switch (action) {
      case 'togglePlay':
        if (playPauseBtn) playPauseBtn.click();
        else if (video) {
          if (video.paused) video.play();
          else video.pause();
        }
        break;

      case 'nextTrack':
        if (nextBtn) nextBtn.click();
        break;

      case 'prevTrack':
        if (prevBtn) prevBtn.click();
        break;

      case 'stop':
        if (video) video.pause();
        break;

      case 'volumeUp':
        if (video) video.volume = Math.min(1, video.volume + 0.05);
        break;

      case 'volumeDown':
        if (video) video.volume = Math.max(0, video.volume - 0.05);
        break;

      case 'toggleMute':
        if (video) video.muted = !video.muted;
        break;

      case 'toggleRepeat':
        if (repeatBtn) repeatBtn.click();
        break;

      case 'toggleShuffle':
        if (shuffleBtn) shuffleBtn.click();
        break;

      case 'toggleLyrics':
        toggleLyricsDrawer();
        break;

      case 'toggleMiniPlayer':
        api?.windowAction('toggle-miniplayer');
        break;

      case 'openSettings':
        openSettingsModal();
        break;

      case 'openAbout':
        openAboutDialog();
        break;
    }
  }

  function setupKeyboardShortcuts() {
    if (typeof window === 'undefined') return;
    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        if (e.target.id === 'deja-search-input' && e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = getEl('deja-search-input', 'sonora-search-input');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        } else {
          getEl('deja-search-bar', 'sonora-search-bar')?.click();
        }
      }
    });
  }

  /* -------------------------------------------------------------
     8. BitChord Word-Synced Live Lyrics Drawer (PlayerLyrics.kt)
     Smooth spring scrolling, active line glow, seek-on-click
     Dynamic real-time clock synchronization & LRCLIB/InnerTube integration
     ------------------------------------------------------------- */
  function updatePreloadLiveLyrics(currentTime, forceScroll = false) {
    const overlay = getEl('deja-lyrics-overlay', 'sonora-lyrics-overlay');
    if (!overlay || !overlay.classList.contains('visible')) return;
    if (!preloadLyrics || preloadLyrics.length === 0) return;

    let activeIndex = -1;
    for (let i = 0; i < preloadLyrics.length; i++) {
      const lineTime = preloadLyrics[i].time;
      const nextTime = (i + 1 < preloadLyrics.length) ? preloadLyrics[i + 1].time : Infinity;
      if (currentTime >= lineTime && currentTime < nextTime) {
        activeIndex = i;
        break;
      }
    }

    const lines = overlay.querySelectorAll('.deja-lyric-line, .sonora-lyric-line');
    lines.forEach((el, i) => {
      const isActive = (i === activeIndex);
      if (el.classList.contains('active') !== isActive) {
        el.classList.toggle('active', isActive);
      }
    });

    if (activeIndex >= 0 && (activeIndex !== preloadLastActiveIndex || forceScroll)) {
      const activeEl = lines[activeIndex];
      if (activeEl && typeof activeEl.scrollIntoView === 'function') {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    preloadLastActiveIndex = activeIndex;
  }

  async function resolvePreloadLyrics(track) {
    if (!track || !track.title) return;
    if (track.id && track.id === lastLyricsTrackId && preloadLyrics.length > 0) return;

    const overlay = getEl('deja-lyrics-overlay', 'sonora-lyrics-overlay');
    const container = getEl('deja-lyrics-content', 'sonora-lyrics-content');

    if (overlay) {
      const titleEl = overlay.querySelector('.deja-lyrics-title, .sonora-lyrics-title');
      const artistEl = overlay.querySelector('.deja-lyrics-artist, .sonora-lyrics-artist');
      const auraEl = overlay.querySelector('.deja-lyrics-aura, .sonora-lyrics-aura');
      if (titleEl) titleEl.textContent = track.title;
      if (artistEl) artistEl.textContent = track.artist;
      if (auraEl && track.coverUrl) auraEl.style.backgroundImage = `url('${track.coverUrl}')`;
    }

    let videoId = '';
    try {
      if (typeof window !== 'undefined' && window.location) {
        const urlParams = new URLSearchParams(window.location.search);
        videoId = urlParams.get('v') || '';
      }
    } catch {}

    const cleanTitle = (track.title || '')
      .replace(/\uFEFF|\u200E|\u200F/g, '')
      .replace(/\s*[\(\[](?:official\s+)?(?:music\s+|lyric\s+|lyrics\s+)?(?:video|audio|visualizer|track|remaster(?:ed)?(?:\s+\d{4})?|live(?:\s+at\s+[^)\]]+)?)[\]\)]/gi, '')
      .replace(/\s*\(?(?:official\s+(?:music\s+|lyric\s+|lyrics\s+)?video|official\s+audio|audio|lyric\s+video|lyrics\s+video|visualizer|remastered|remaster\s+\d{4}|live(?:\s+at\s+[^)]+)?)\)?/gi, '')
      .replace(/\s*\[?(?:official\s+(?:music\s+|lyric\s+|lyrics\s+)?video|official\s+audio|audio|lyric\s+video|lyrics\s+video|visualizer|remastered|remaster\s+\d{4}|live(?:\s+at\s+[^\]]+)?)\]?/gi, '')
      .replace(/\s*(?:\||\/\/|-)\s*(?:official\s+video|official\s+audio|audio|lyric\s+video|lyrics).*$/gi, '')
      .replace(/\s*[\(\[](?:feat\.|ft\.)\s+[^)\]]+[\]\)]/gi, '')
      .replace(/\s*\(?(?:feat\.|ft\.)\s+[^)]+\)?/gi, '')
      .replace(/\s*\[?(?:feat\.|ft\.)\s+[^\]]+\]?/gi, '')
      .replace(/\s*(?:feat\.|ft\.)\s+.*$/gi, '')
      .trim();
    const cleanArtist = (track.artist || '')
      .replace(/\uFEFF|\u200E|\u200F/g, '')
      .replace(/\s*\(?(?:feat\.|ft\.)\s+[^)]+\)?/gi, '')
      .trim();

    try {
      let resolved = null;
      if (api?.getLyrics) {
        resolved = await api.getLyrics({
          videoId,
          title: cleanTitle,
          artist: cleanArtist,
          duration: track.duration
        });
      }

      if (resolved && Array.isArray(resolved) && resolved.length > 0) {
        preloadLyrics = resolved;
        lastLyricsTrackId = track.id || `${cleanTitle}-${cleanArtist}`;
        renderPreloadLyrics(preloadLyrics);
        return;
      }
    } catch (e) {
      console.warn('[Preload] resolvePreloadLyrics API notice:', e.message);
    }

    // Fall back to extracting native YTM lyrics if available in tab
    const nativeLyricsTab = document.querySelector('ytmusic-tab-renderer[tab-id="LYRICS"]');
    if (nativeLyricsTab) {
      const desc = nativeLyricsTab.querySelector('.description');
      if (desc && desc.textContent.trim()) {
        const lines = desc.textContent.trim().split('\n').filter(l => l.trim().length > 0);
        if (lines.length > 0) {
          const stepSec = Math.max(3, (track.duration || 180) / lines.length);
          const fallbackLyrics = lines.map((l, i) => ({
            time: Math.floor(i * stepSec),
            text: l
          }));
          preloadLyrics = fallbackLyrics;
          lastLyricsTrackId = track.id || `${cleanTitle}-${cleanArtist}`;
          renderPreloadLyrics(fallbackLyrics);
          return;
        }
      }
    }

    if (container) {
      renderPreloadLyrics([]);
    }
  }

  function renderPreloadLyrics(lyrics) {
    const container = getEl('deja-lyrics-content', 'sonora-lyrics-content');
    if (!container) return;

    if (!lyrics || lyrics.length === 0) {
      setSafeHTML(container, '<div class="deja-lyric-line sonora-lyric-line active" data-time="0">No synchronized lyrics available for this track.</div>');
      return;
    }

    setSafeHTML(container, lyrics.map((l, i) => `
      <div class="deja-lyric-line sonora-lyric-line ${i === 0 ? 'active' : ''}" data-time="${l.time}">
        ${escapeHtml(l.text)}
      </div>
    `).join(''));

    const video = document.querySelector('video.html5-main-video') || document.querySelector('video');
    const curTime = video ? video.currentTime : 0;
    updatePreloadLiveLyrics(curTime, true);
  }

  function toggleLyricsDrawer() {
    let overlay = getEl('deja-lyrics-overlay', 'sonora-lyrics-overlay');
    if (overlay) {
      if (overlay.classList.contains('visible')) {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 300);
      } else {
        overlay.classList.add('visible');
        const video = document.querySelector('video.html5-main-video') || document.querySelector('video');
        if (video) updatePreloadLiveLyrics(video.currentTime, true);
      }
      return;
    }

    const track = (typeof window !== 'undefined' && window.__DEJA_CURRENT_TRACK__) || {
      title: 'Current Song',
      artist: 'Artist',
      coverUrl: ''
    };

    overlay = document.createElement('div');
    overlay.id = 'deja-lyrics-overlay';
    overlay.className = 'deja-lyrics-drawer sonora-lyrics-drawer visible';
    setSafeHTML(overlay, `
      <div class="deja-lyrics-aura sonora-lyrics-aura" style="background-image: url('${track.coverUrl}');"></div>
      <div class="deja-lyrics-header sonora-lyrics-header">
        <div class="deja-lyrics-meta sonora-lyrics-meta">
          <h2 class="deja-lyrics-title sonora-lyrics-title">${escapeHtml(track.title)}</h2>
          <p class="deja-lyrics-artist sonora-lyrics-artist">${escapeHtml(track.artist)}</p>
        </div>
        <button class="deja-lyrics-close sonora-lyrics-close" id="deja-lyrics-close-btn">&times;</button>
      </div>
      <div class="deja-lyrics-body sonora-lyrics-body" id="deja-lyrics-content">
        <div class="deja-lyric-line sonora-lyric-line active" data-time="0">♪ Loading synchronized lyrics...</div>
      </div>
    `);

    document.body.appendChild(overlay);
    const lyricsCloseBtn = getEl('deja-lyrics-close-btn', 'sonora-lyrics-close-btn');
    if (lyricsCloseBtn) {
      lyricsCloseBtn.onclick = () => {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 300);
      };
    }

    // Seek-on-click on lyric lines
    const container = getEl('deja-lyrics-content', 'sonora-lyrics-content');
    if (container) {
      container.onclick = (e) => {
        const line = e.target && e.target.closest ? e.target.closest('.deja-lyric-line, .sonora-lyric-line') : null;
        if (line && line.dataset && line.dataset.time) {
          const seekSec = parseFloat(line.dataset.time);
          const video = document.querySelector('video.html5-main-video') || document.querySelector('video');
          if (video && !isNaN(seekSec)) {
            video.currentTime = seekSec;
            updatePreloadLiveLyrics(seekSec, true);
          }
        }
      };
    }

    // Hook video timeupdate
    const video = document.querySelector('video.html5-main-video') || document.querySelector('video');
    if (video && video !== lyricsVideoHooked && typeof video.addEventListener === 'function') {
      lyricsVideoHooked = video;
      video.addEventListener('timeupdate', () => {
        updatePreloadLiveLyrics(video.currentTime);
      });
      video.addEventListener('seeked', () => {
        updatePreloadLiveLyrics(video.currentTime, true);
      });
    }

    // Resolve lyrics from API or native tab fallback
    if (preloadLyrics.length > 0 && lastLyricsTrackId === track.id) {
      renderPreloadLyrics(preloadLyrics);
    } else {
      resolvePreloadLyrics(track);
    }
  }

  /* -------------------------------------------------------------
     9. BitChord Up Next Queue Drawer (PlayerQueue.kt)
     ------------------------------------------------------------- */
  function toggleQueueDrawer() {
    let drawer = getEl('deja-queue-drawer');
    if (drawer) {
      if (drawer.classList.contains('visible')) {
        drawer.classList.remove('visible');
        setTimeout(() => drawer.remove(), 350);
      } else {
        drawer.classList.add('visible');
      }
      return;
    }

    drawer = document.createElement('aside');
    drawer.id = 'deja-queue-drawer';
    drawer.className = 'deja-queue-drawer visible';

    // Extract native queue tracks if present
    const nativeQueueItems = querySelectorAllDeep('ytmusic-player-queue-item');
    const queueTracks = [];
    if (nativeQueueItems && nativeQueueItems.length > 0) {
      nativeQueueItems.forEach(item => {
        const title = item.querySelector('.song-title')?.textContent?.trim() || 'Track';
        const artist = item.querySelector('.byline')?.textContent?.trim() || 'Artist';
        const duration = item.querySelector('.duration')?.textContent?.trim() || '';
        const thumb = item.querySelector('img')?.src || '';
        const isSelected = item.hasAttribute('selected') || item.classList.contains('selected');
        queueTracks.push({ title, artist, duration, thumb, isSelected, element: item });
      });
    }

    setSafeHTML(drawer, `
      <div class="deja-queue-header">
        <div>
          <h3 class="deja-queue-title">Up Next</h3>
          <span class="deja-queue-count">${queueTracks.length > 0 ? `${queueTracks.length} tracks` : 'Live Queue'}</span>
        </div>
        <button class="deja-lyrics-close" id="deja-queue-close-btn">&times;</button>
      </div>
      <div class="deja-queue-body" id="deja-queue-body">
        ${queueTracks.length > 0 ? queueTracks.map((t, idx) => `
          <div class="deja-queue-item ${t.isSelected ? 'playing' : ''}" data-idx="${idx}">
            ${t.thumb ? `<img src="${t.thumb}" class="deja-queue-thumb" alt="${escapeHtml(t.title)}" />` : '<div class="deja-queue-thumb" style="background: rgba(255,255,255,0.08);"></div>'}
            <div class="deja-queue-info">
              <div class="deja-queue-track-title">${escapeHtml(t.title)}</div>
              <div class="deja-queue-track-artist">${escapeHtml(t.artist)}</div>
            </div>
            <span class="deja-queue-duration">${escapeHtml(t.duration)}</span>
          </div>
        `).join('') : `
          <div style="padding: 24px; text-align: center; color: var(--apple-text-secondary); font-size: 13px;">
            Queue is managed dynamically by YouTube Music.<br>Select any song or playlist to populate upcoming tracks.
          </div>
        `}
      </div>
    `);

    document.body.appendChild(drawer);
    const closeBtn = getEl('deja-queue-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        drawer.classList.remove('visible');
        setTimeout(() => drawer.remove(), 350);
      };
    }

    // Queue item click handler
    const queueBody = getEl('deja-queue-body');
    if (queueBody) {
      queueBody.onclick = (e) => {
        const itemEl = e.target && e.target.closest ? e.target.closest('.deja-queue-item') : null;
        if (itemEl && itemEl.dataset && itemEl.dataset.idx) {
          const idx = parseInt(itemEl.dataset.idx, 10);
          if (queueTracks[idx] && queueTracks[idx].element) {
            queueTracks[idx].element.click();
          }
        }
      };
    }
  }

  /* -------------------------------------------------------------
     10. BitChord Audio Pipeline Modal Sheet
     ------------------------------------------------------------- */
  function openAudioPipelineModal() {
    const snap = AudioPipeline.getSnapshot();
    renderAppleModal({
      title: 'Audio Pipeline & Stats for Nerds',
      customBody: `
        <div class="deja-pipeline-card">
          <div class="deja-pipeline-grid">
            <div class="deja-pipeline-cell">
              <div class="deja-pipeline-label">Stream Codec</div>
              <div class="deja-pipeline-value">${escapeHtml(snap.codec)}</div>
            </div>
            <div class="deja-pipeline-cell">
              <div class="deja-pipeline-label">Audio Bitrate</div>
              <div class="deja-pipeline-value">${escapeHtml(snap.bitrate)}</div>
            </div>
            <div class="deja-pipeline-cell">
              <div class="deja-pipeline-label">Sample Rate</div>
              <div class="deja-pipeline-value">${escapeHtml(snap.sampleRate)}</div>
            </div>
            <div class="deja-pipeline-cell">
              <div class="deja-pipeline-label">Channels & Depth</div>
              <div class="deja-pipeline-value">${escapeHtml(snap.channels)} • ${escapeHtml(snap.bitDepth)}</div>
            </div>
            <div class="deja-pipeline-cell">
              <div class="deja-pipeline-label">Buffer Health</div>
              <div class="deja-pipeline-value">${escapeHtml(snap.buffer)}</div>
            </div>
            <div class="deja-pipeline-cell">
              <div class="deja-pipeline-label">Audio Quality Tier</div>
              <div class="deja-pipeline-value" style="color: #34C759;">${escapeHtml(snap.qualityTier)}</div>
            </div>
          </div>
          <div style="font-size: 11.5px; color: var(--apple-text-tertiary); margin-top: 10px; line-height: 1.5;">
            <strong>Renderer:</strong> ${escapeHtml(snap.decoder)}<br>
            Measurements are sampled in real-time from the active HTML5 Media Pipeline.
          </div>
        </div>
      `
    });
  }

  /* -------------------------------------------------------------
     11. BitChord Sleep Timer Modal Sheet (SleepTimer.kt)
     ------------------------------------------------------------- */
  function openSleepTimerModal() {
    const isRunning = SleepTimer.isRunning();
    const remaining = SleepTimer.remainingMs();
    let statusText = 'Sleep timer is currently inactive';
    if (SleepTimer.afterTrack) {
      statusText = 'Active: Playback will pause when current song ends';
    } else if (remaining) {
      const mins = Math.ceil(remaining / 60000);
      statusText = `Active: Playback will pause in ~${mins} minutes with smooth volume fade`;
    }

    renderAppleModal({
      title: 'BitChord Sleep Timer',
      customBody: `
        <div style="margin-bottom: 12px; font-size: 13px; color: var(--apple-text-secondary);">
          ${statusText}
        </div>
        <div class="deja-picker-options">
          <button class="deja-picker-btn ${SleepTimer.afterTrack ? 'selected' : ''}" id="btn-sleep-track">
            <span>End of Current Track</span>
            <small style="color: var(--apple-text-tertiary);">Pauses when song finishes</small>
          </button>
          ${SleepTimer.PRESETS.map(mins => `
            <button class="deja-picker-btn ${SleepTimer.minutes === mins ? 'selected' : ''}" data-mins="${mins}">
              <span>${mins} Minutes</span>
              <small style="color: var(--apple-text-tertiary);">${mins * 60} seconds</small>
            </button>
          `).join('')}
          ${isRunning ? `
            <button class="deja-picker-btn" id="btn-sleep-cancel" style="color: #FF5F56;">
              <span>Turn Off Sleep Timer</span>
              <small style="color: var(--apple-text-tertiary);">Cancel timer</small>
            </button>
          ` : ''}
        </div>
      `,
      onMount: (overlay) => {
        const btnTrack = overlay.querySelector('#btn-sleep-track');
        if (btnTrack) {
          btnTrack.onclick = () => {
            SleepTimer.startAfterTrack();
            overlay.remove();
          };
        }
        const minButtons = overlay.querySelectorAll('.deja-picker-btn[data-mins]');
        minButtons.forEach(btn => {
          btn.onclick = () => {
            const mins = parseInt(btn.dataset.mins, 10);
            SleepTimer.start(mins);
            overlay.remove();
          };
        });
        const cancelBtn = overlay.querySelector('#btn-sleep-cancel');
        if (cancelBtn) {
          cancelBtn.onclick = () => {
            SleepTimer.cancel();
            overlay.remove();
          };
        }
      }
    });
  }

  /* -------------------------------------------------------------
     12. BitChord Equalizer Modal Sheet (GraphicEq)
     ------------------------------------------------------------- */
  function openEqualizerModal() {
    renderAppleModal({
      title: 'Sound Enhancement & Equalizer',
      customBody: `
        <div style="margin-bottom: 12px; font-size: 13px; color: var(--apple-text-secondary);">
          Active Preset: <strong>${AudioEqualizer.currentPreset}</strong>
        </div>
        <div class="deja-picker-options">
          ${Object.keys(AudioEqualizer.presets).map(name => `
            <button class="deja-picker-btn ${AudioEqualizer.currentPreset === name ? 'selected' : ''}" data-eq="${name}">
              <span>${name}</span>
              <small style="color: var(--apple-text-tertiary);">
                ${name === 'Flat' ? 'Pristine neutral reference' : name === 'Bass Boost' ? '+6dB sub-bass punch' : name === 'Acoustic' ? '+3dB warm mids' : name === 'Vocal Booster' ? '+4dB vocal clarity' : '+5dB crisp highs'}
              </small>
            </button>
          `).join('')}
        </div>
      `,
      onMount: (overlay) => {
        const eqButtons = overlay.querySelectorAll('.deja-picker-btn[data-eq]');
        eqButtons.forEach(btn => {
          btn.onclick = () => {
            const preset = btn.dataset.eq;
            AudioEqualizer.applyPreset(preset);
            overlay.remove();
          };
        });
      }
    });
  }

  /* -------------------------------------------------------------
     13. Frosted Apple Modals (Settings & Account)
     ------------------------------------------------------------- */
  function openAccountModal() {
    const isConnected = !!document.querySelector('ytmusic-nav-bar #avatar-btn, #avatar-btn, ytmusic-avatar');
    renderAppleModal({
      title: 'Google & Deja Account',
      rows: [
        { label: 'Status', desc: isConnected ? 'Connected to Google & YouTube Music' : 'Guest mode (not signed in)', badge: isConnected ? 'Signed In' : 'Guest' },
        { label: 'Platform', desc: 'YouTube Music Desktop Integration', badge: 'Connected' },
        { label: 'Account Switch', desc: 'Manage your active Google account in Deja', badge: 'Google Auth' }
      ]
    });
  }

  function openSettingsModal() {
    renderAppleModal({
      title: 'Deja Preferences',
      rows: [
        { label: 'Theme Styling', desc: 'BitChord & macOS Apple Music Acrylic Glass', badge: 'Active' },
        { label: 'Ad Monetization Policy', desc: 'Non-harming: Free users receive Google ads; Premium users enjoy native ad-free playback', badge: 'Compliant' },
        { label: 'Dynamic Mesh Aura', desc: '4-color luminous mesh background crossfaded at 1.4s', badge: 'Enabled' },
        { label: 'Discord Rich Presence', desc: 'Real-time song & artist status display on Discord', badge: 'Enabled' },
        { label: 'Hardware Acceleration', desc: 'Chromium GPU compositor for high performance', badge: 'Enabled' }
      ]
    });
  }

  function openAboutDialog() {
    renderAppleModal({
      title: 'About Deja',
      rows: [
        { label: 'Version', desc: 'Deja Desktop Client v1.0.0 (BitChord Engine)', badge: 'v1.0.0' },
        { label: 'Design System', desc: 'BitChord luminous mesh aura & Apple Music fluid glassmorphism', badge: 'BitChord' },
        { label: 'Google TOS Disclosure', desc: 'Not affiliated with Google LLC. Respects all YouTube content licensing and advertisement rules.', badge: 'Verified' },
        { label: 'License', desc: 'MIT Open Source License - Ready for GitHub community publication', badge: 'MIT' }
      ]
    });
  }

  function renderAppleModal({ title, rows, customBody, onMount }) {
    if (typeof document === 'undefined' || typeof document.createElement !== 'function') return;

    const existing = getEl('deja-apple-modal', 'sonora-apple-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'deja-apple-modal';
    overlay.className = 'deja-modal-overlay sonora-modal-overlay';
    setSafeHTML(overlay, `
      <div class="deja-modal-card sonora-modal-card">
        <div class="deja-modal-header sonora-modal-header">
          <h3 class="deja-modal-title sonora-modal-title">${escapeHtml(title)}</h3>
          <button class="deja-modal-close-btn sonora-modal-close-btn" id="deja-modal-close">&times;</button>
        </div>
        <div class="deja-modal-body sonora-modal-body">
          ${customBody || (rows ? rows.map(r => `
            <div class="deja-modal-row sonora-modal-row">
              <div>
                <div class="deja-modal-label sonora-modal-label">${escapeHtml(r.label)}</div>
                <div class="deja-modal-desc sonora-modal-desc">${escapeHtml(r.desc)}</div>
              </div>
              <span class="deja-modal-badge sonora-modal-badge">${escapeHtml(r.badge)}</span>
            </div>
          `).join('') : '')}
        </div>
        <div class="deja-modal-footer sonora-modal-footer">
          <button class="deja-modal-btn-primary sonora-modal-btn-primary" id="deja-modal-ok">Done</button>
        </div>
      </div>
    `);

    if (document.body && typeof document.body.appendChild === 'function') {
      document.body.appendChild(overlay);
    }

    const closeModal = () => overlay.remove();
    const closeBtn = getEl('deja-modal-close', 'sonora-modal-close');
    const okBtn = getEl('deja-modal-ok', 'sonora-modal-ok');
    if (closeBtn) closeBtn.onclick = closeModal;
    if (okBtn) okBtn.onclick = closeModal;
    overlay.onclick = (e) => {
      if (e.target === overlay) closeModal();
    };

    if (typeof onMount === 'function') {
      onMount(overlay);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  return {
    destroy: () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      if (shadowObserver) {
        shadowObserver.disconnect();
        shadowObserver = null;
      }
      lyricsVideoHooked = null;
      SleepTimer.cancel();
      if (typeof window !== 'undefined') {
        window.__DEJA_INITIALIZED__ = false;
        window.__SONORA_INITIALIZED__ = false;
        delete window.__DEJA_CURRENT_TRACK__;
        delete window.__SONORA_CURRENT_TRACK__;
      }
    },
    SleepTimer,
    AudioPipeline,
    AudioEqualizer,
    toggleLyricsDrawer,
    updatePreloadLiveLyrics,
    resolvePreloadLyrics,
    renderPreloadLyrics
  };
}

const initSonoraApplePlayer = initDejaApplePlayer;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = initDejaApplePlayer;
  module.exports.initDejaApplePlayer = initDejaApplePlayer;
  module.exports.initSonoraApplePlayer = initSonoraApplePlayer;
  module.exports.extractArtworkPalette = extractArtworkPalette;
  module.exports.SleepTimer = SleepTimer;
  module.exports.AudioPipeline = AudioPipeline;
  module.exports.AudioEqualizer = AudioEqualizer;
  module.exports.querySelectorAllDeep = querySelectorAllDeep;
  module.exports.SHADOW_PLAYER_BAR_CSS = SHADOW_PLAYER_BAR_CSS;
  module.exports.SHADOW_UNIVERSAL_SCROLLBAR_CSS = SHADOW_UNIVERSAL_SCROLLBAR_CSS;
  module.exports.SHADOW_PLAYER_PAGE_CSS = SHADOW_PLAYER_PAGE_CSS;
  module.exports.SHADOW_GUIDE_CSS = SHADOW_GUIDE_CSS;
  module.exports.SHADOW_CHIP_CSS = SHADOW_CHIP_CSS;
}

if (typeof window !== 'undefined') {
  window.initDejaApplePlayer = initDejaApplePlayer;
  window.initSonoraApplePlayer = initSonoraApplePlayer;
  window.extractArtworkPalette = extractArtworkPalette;
  window.SleepTimer = SleepTimer;
  window.AudioPipeline = AudioPipeline;
  window.AudioEqualizer = AudioEqualizer;
  window.querySelectorAllDeep = querySelectorAllDeep;
  window.SHADOW_PLAYER_BAR_CSS = SHADOW_PLAYER_BAR_CSS;
  window.SHADOW_UNIVERSAL_SCROLLBAR_CSS = SHADOW_UNIVERSAL_SCROLLBAR_CSS;
  window.SHADOW_PLAYER_PAGE_CSS = SHADOW_PLAYER_PAGE_CSS;
  window.SHADOW_GUIDE_CSS = SHADOW_GUIDE_CSS;
  window.SHADOW_CHIP_CSS = SHADOW_CHIP_CSS;
}
