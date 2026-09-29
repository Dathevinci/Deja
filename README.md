<div align="center">
  <img src="assets/logo.png" alt="Deja Logo" width="120" height="120" style="border-radius: 26px; box-shadow: 0 10px 30px rgba(250, 45, 72, 0.35);" />
  <h1>Deja</h1>
  <p><strong>A desktop YouTube Music client with Apple Music design language and BitChord native audio architecture.</strong></p>

  <p>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-red.svg" alt="License: MIT" /></a>
    <img src="https://img.shields.io/badge/Platform-Windows%2010%20%2F%2011-lightgrey.svg" alt="Platform: Windows" />
    <img src="https://img.shields.io/badge/Architecture-BitChord%20Audio-ff2d55.svg" alt="Architecture: BitChord Audio" />
    <img src="https://img.shields.io/badge/Stream-160kbps%20Opus-orange.svg" alt="Stream: 160kbps Opus" />
    <img src="https://img.shields.io/badge/TOS-Google%20Compliant-brightgreen.svg" alt="TOS: Google Compliant" />
    <img src="https://img.shields.io/badge/Tests-11%2F11%20Passing-success.svg" alt="Tests: 11/11 Passing" />
  </p>
  
  <p>
    <a href="https://github.com/Dathevinci/Deja/releases/latest/download/Deja.Setup.1.0.0.exe"><img src="https://img.shields.io/badge/Download%20Setup-Deja.Setup.1.0.0.exe-FA2D48?style=for-the-badge&logo=windows&logoColor=white" alt="Download Windows Setup (.exe)" /></a>
    <a href="https://github.com/Dathevinci/Deja/releases/latest/download/Deja.1.0.0.exe"><img src="https://img.shields.io/badge/Download%20Portable-Deja.1.0.0.exe-333333?style=for-the-badge&logo=windows&logoColor=white" alt="Download Portable (.exe)" /></a>
  </p>

  <p>
    <a href="https://dathevinci.github.io/Deja/">Official Website</a> &middot;
    <a href="https://github.com/Dathevinci/Deja/releases">Download Releases</a> &middot;
    <a href="#getting-started">Getting Started</a> &middot;
    <a href="#key-features">Features</a> &middot;
    <a href="#architecture">Architecture</a>
  </p>
</div>

---

## Overview

Deja is an open-source desktop audio player engineered to unite the comprehensive catalog, personalization, and recommendations of YouTube Music with the aesthetic refinement, fluid glassmorphism, and typography of Apple Music.

Powered by the **BitChord native audio engine**, Deja extracts direct 160kbps Opus audio streams without video decoding overhead, integrates real-time synchronized lyrics via the LRCLIB open database, projects dynamic 4-color liquid ambient gradients derived from album artwork, and offers low-latency studio equalization.

Deja operates in strict alignment with Google platform policies and monetization guidelines: standard advertisements are displayed for free users, while YouTube Premium subscribers enjoy verified ad-free listening.

---

## Key Features

### BitChord Audio Engine
- **Direct Opus Stream Resolution**: Connects to YouTube Music stream endpoints to deliver native 160kbps Opus audio (`audio/webm; codecs="opus"`), eliminating excessive CPU and GPU overhead from video pipelines.
- **Stats for Nerds Telemetry**: Comprehensive real-time audio diagnostics, tracking bitrate, audio formats, buffer length, network throughput, loudness normalization, and dropped frames.

### Foolproof 1-Click Browser Sync
- **Private Network Access (PNA)**: Built-in local loopback endpoint adhering to W3C Private Network Access specifications (`Access-Control-Allow-Private-Network`).
- **One-Click Session Token Import**: Authenticate with a single click from Chrome, Microsoft Edge, Brave, or Firefox. Completely avoids embedded browser login blocks (`"This browser or app may not be secure"`) and Botguard verification traps.

### Personal Library & Playlist Sync
- **Multi-Feed Library Aggregation**: Synchronizes user-created playlists, saved albums, followed artists, and liked songs with continuation token pagination.
- **Bidirectional Playlist Management**: Create custom playlists, append tracks, reorder queues, and favorite songs directly within the desktop interface.

### Real-Time Synced Lyrics
- **LRCLIB Integration**: Queries the LRCLIB open lyrics database with fuzzy-sanitized artist and track metadata for millisecond-accurate synchronized lyrics.
- **Interactive Scroller**: Frosted blur focus, smooth auto-scrolling to the active vocal line, and tap-to-seek playback jump functionality.
- **Native Fallback**: Automatic fallback to YouTube Music timed closed-captions and transcripts when studio lyrics are unlisted.

### Liquid Ambient Mesh Backdrop
- **Dynamic 4-Color Gradient**: Real-time palette extraction calculates primary, secondary, highlight, and ambient hues from the active album cover.
- **Hardware-Accelerated Fluid Aura**: Renders a dynamic mesh gradient canvas that pulses subtly in the background behind player controls and lyrics.

### Web Audio Studio Equalizer & Sleep Timer
- **5-Band Parametric Equalizer**: BiquadFilter-powered audio shaping with dedicated profiles for Bass Boost, Acoustic, Vocal Booster, Treble Booster, and Flat response.
- **Sleep Timer**: Programmable sleep countdown timer with gradual volume fade-out over the final 60 seconds.

### Discord Rich Presence
- **Native IPC RPC Integration**: Automatically updates your Discord status with current track title, artist name, album name, elapsed playback time, and high-resolution album artwork.

### Google Terms of Service Compliance
- **Monetization Ad Support**: Free-tier Google advertisements are served unmodified in full accordance with platform guidelines. Deja contains zero ad-blocking mechanisms.
- **YouTube Premium Ad-Free Playback**: YouTube Premium subscribers who connect their account enjoy official, policy-compliant ad-free audio playback and library sync.

---

## Architecture & Technical Stack

```
+-----------------------------------------------------------------------+
|                             DEJA CLIENT                               |
+-----------------------------------------------------------------------+
|  Apple Music Design System (CSS Glassmorphism, SF Pro, Liquid Mesh)   |
+-----------------------------------------------------------------------+
|  Renderer Layer: HTML5 Audio / Web Audio Biquad Equalizer / LRCLIB    |
+-----------------------------------------------------------------------+
|  Preload Bridge: Context Isolation, IPC Sanitization, Strict CSP      |
+-----------------------------------------------------------------------+
|  Main Process: Electron 44, Chromium Runtime, Node.js Engine         |
|  - BitChord Stream Parser: 160kbps Opus Extractor & Nerds Telemetry   |
|  - PNA Auth Loopback: 1-Click Browser Sync & Cookie Storage           |
|  - Native Shell: Frameless Window, System Tray, Global Hotkeys        |
|  - Discord RPC: Native Socket IPC Bridge                              |
+-----------------------------------------------------------------------+
|  Network / Backend: YouTube Music InnerTube API & LRCLIB Open DB      |
+-----------------------------------------------------------------------+
```

### Technologies

| Component | Technology | Role |
| :--- | :--- | :--- |
| Framework | **Electron 44** | Desktop window management, native menus, tray, and IPC |
| Audio Engine | **BitChord & Web Audio API** | 160kbps Opus stream resolution and 5-band parametric EQ |
| Authentication | **PNA HTTP Bridge & Cookie Utils** | W3C Private Network Access session import |
| Lyrics Provider | **LRCLIB Open Database** | Millisecond-precision synced lyrics retrieval |
| Presence | **Discord RPC Bridge** | Local named-pipe IPC rich presence broadcasting |
| Interface | **Apple HIG & Glassmorphism** | Acrylic blur, Ruby accent (`#FA2D48`), squircle cards |

---

## Keyboard Shortcuts

| Shortcut | Global Shortcut | Action |
| :--- | :--- | :--- |
| `Space` | `Ctrl + Alt + Space` / `MediaPlayPause` | Play / Pause |
| `Ctrl + Right` | `Ctrl + Alt + Right` / `MediaNextTrack` | Next Track |
| `Ctrl + Left` | `Ctrl + Alt + Left` / `MediaPreviousTrack` | Previous Track |
| `Ctrl + Up` | `Ctrl + Alt + Up` | Volume Up (+5%) |
| `Ctrl + Down` | `Ctrl + Alt + Down` | Volume Down (-5%) |
| `Ctrl + M` | `Ctrl + Alt + M` / `Ctrl + Shift + M` | Toggle Mini Player |
| `Ctrl + L` | `Ctrl + Alt + L` / `Ctrl + Shift + L` | Toggle Live Synced Lyrics |
| `Ctrl + Q` | `Ctrl + Alt + Q` | Toggle Up Next Queue |
| `Ctrl + K` | -- | Focus Search Field |
| `F12` | -- | Toggle Developer Tools |

---

## Getting Started

### Direct Downloads (Windows)

Ready-to-run Windows binaries are published on GitHub Releases and the official website:

- **Windows Setup Installer**: [Deja.Setup.1.0.0.exe](https://github.com/Dathevinci/Deja/releases/latest/download/Deja.Setup.1.0.0.exe) (~107 MB)  
  *Standard NSIS installer with desktop shortcut, Start menu integration, and automatic uninstaller.*
- **Windows Portable Edition**: [Deja.1.0.0.exe](https://github.com/Dathevinci/Deja/releases/latest/download/Deja.1.0.0.exe) (~107 MB)  
  *Standalone zero-install executable. Runs directly without administrator privileges or registry modifications.*
- **All Releases & Release Notes**: [GitHub Releases](https://github.com/Dathevinci/Deja/releases)
- **Official Web Portal**: [https://dathevinci.github.io/Deja/](https://dathevinci.github.io/Deja/)

> [!TIP]
> **Local Build Location**: If you have already cloned the repository and executed `npm run dist` locally, the compiled `.exe` files are already generated on your machine in the project root:
> - `dist/Deja Setup 1.0.0.exe` (or `dist/Deja.Setup.1.0.0.exe`)
> - `dist/Deja 1.0.0.exe` (or `dist/Deja.1.0.0.exe`)
>
> *(Large `.exe` binaries are distributed via GitHub Releases and not committed directly into the Git repository tree to adhere to GitHub's file size limits).*

---

### Building From Source

#### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher; v22 recommended)
- `npm` (v9.0.0 or higher)
- Git

#### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Dathevinci/Deja.git
   cd Deja
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Launch in development mode**:
   ```bash
   npm run dev
   ```

4. **Launch standalone Apple Music interface preview**:
   ```bash
   npm run preview
   ```

5. **Run the automated test suite**:
   ```bash
   npm test
   ```

6. **Build production binaries for Windows**:
   ```bash
   # Package unpackaged directory into dist/win-unpacked
   npm run pack

   # Build production NSIS installer and portable executable
   npm run dist
   ```

---

## Testing & Quality Assurance

Deja includes an automated test suite across 11 specialized modules:

```bash
npm test
```

### Verified Test Suites
1. **ConfigManager**: Configuration defaults, schema validation, and persistent file storage.
2. **Apple Theme CSS**: Acrylic frosted glass variables, SF Pro typography tokens, and responsive rules.
3. **Google TOS Compliance**: Ad element preservation, zero-adblocker verification, and monetization rules.
4. **IPC Protocol**: Action routing (`togglePlay`, `nextTrack`, `prevTrack`, `toggleLyrics`, `toggleMiniPlayer`).
5. **Apple Player Controller**: DOM hooks, event listeners, track state transitions, and error recovery.
6. **Window Lifecycle**: Single-instance lock, secondary instance focus, and tray toggle behavior.
7. **Native BitChord Architecture**: 160kbps Opus stream parsing, Stats for Nerds, and preview player logic.
8. **Edge Cases & Security**: Malformed lyric timestamps, network interruption handling, and sanitized HTML.
9. **InnerTube Integration**: Live playlist retrieval, continuation pagination, and track metadata extraction.
10. **Auth Persistence & Playlist Architecture**: Session token lifecycle, cookie expiration enforcement, and bidirectional playlist sync.
11. **Preload & CSP Runtime**: Secure contextBridge injection under strict Content Security Policies.

---

## Project Structure

```
Deja/
|-- .github/
|   `-- workflows/
|       |-- build.yml             # Automated CI test and build validation pipeline
|       `-- release.yml           # Automated release packaging and binary publishing pipeline
|-- assets/
|   |-- icon.ico                  # Multi-resolution Windows application icon
|   |-- icon.png                  # High-resolution 512x512 application icon
|   `-- logo.png                  # Hybrid Apple Music & YouTube Music emblem
|-- docs/                         # GitHub Pages presentation site
|   |-- assets/                   # Web typography and icon assets
|   |-- index.html                # Official product landing page
|   |-- script.js                 # Interactive showcase controllers and modals
|   `-- style.css                 # Glassmorphic responsive styling
|-- src/
|   |-- main/
|   |   |-- config.js             # User preferences and state persistence
|   |   |-- cookie-utils.js       # Session token sanitization and decryption
|   |   |-- discord.js            # Discord Rich Presence IPC bridge
|   |   |-- innertube.js          # BitChord InnerTube API client and stream parser
|   |   |-- main.js               # Application lifecycle, windows, and PNA server
|   |   |-- menu.js               # Native desktop menu bar
|   |   |-- shortcuts.js          # Global media keys and keyboard accelerators
|   |   `-- tray.js               # System notification tray and context menu
|   |-- preload/
|   |   |-- apple-player.js       # Player state observer, ad monitor, and lyrics
|   |   |-- apple-theme.css       # Complete Apple Music stylesheet injection
|   |   `-- preload.js            # Secure contextBridge IPC boundary
|   `-- renderer/
|       |-- offline-fallback.html # Graceful offline reconnection interface
|       |-- preview.css           # Standalone player styles and fluid animations
|       |-- preview.html          # Desktop interface with 1-Click Browser Sync
|       `-- preview.js            # Native audio pipeline, queue, lyrics, and EQ
|-- tests/
|   |-- bitchord-architecture.test.js
|   |-- compliance.test.js
|   |-- config.test.js
|   |-- csp-runtime.test.js
|   |-- edge-cases.test.js
|   |-- innertube-integration.test.js
|   |-- ipc.test.js
|   |-- player-controller.test.js
|   |-- run-all-tests.js
|   |-- theme.test.js
|   `-- window-lifecycle.test.js
|-- .gitignore                    # Build outputs, logs, caches, and artifacts
|-- CONTRIBUTING.md               # Contribution and coding standards
|-- LICENSE                       # MIT License with trademark notices
|-- README.md                     # Project documentation
`-- package.json                  # Dependencies, build targets, and metadata
```

---

## Legal & Disclaimer

- **YouTube Music** and the YouTube logo are trademarks of **Google LLC**.
- **Apple Music**, **macOS**, and **SF Pro** are trademarks of **Apple Inc.**
- Deja is an independent open-source project and is **not affiliated with, sponsored by, or endorsed by Google LLC or Apple Inc.**
- All content, audio streams, and metadata originate directly from YouTube Music servers according to Google's standard web delivery policies.

---

<div align="center">
  <sub>Deja &middot; Crafted for audio fidelity and clean desktop design &middot; MIT License</sub>
</div>
