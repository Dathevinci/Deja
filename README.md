<div align="center">
  <img src="assets/logo.png" alt="Deja Logo" width="128" height="128" style="border-radius: 28px; box-shadow: 0 10px 30px rgba(250, 45, 72, 0.4);" />
  <h1>Deja</h1>
  <p><strong>A clean, modern Apple Music-styled desktop client for YouTube Music on PC.</strong></p>

  <p>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-red.svg" alt="License: MIT" /></a>
    <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20Cross--Platform-lightgrey.svg" alt="Platform" />
    <img src="https://img.shields.io/badge/Base-YouTube%20Music-red.svg" alt="Base" />
    <img src="https://img.shields.io/badge/UI-Apple%20Music%20Aesthetic-ff2d55.svg" alt="UI" />
    <img src="https://img.shields.io/badge/Google%20TOS-Compliant-brightgreen.svg" alt="Google TOS Compliant" />
    <img src="https://img.shields.io/badge/Tests-Passing-success.svg" alt="Tests" />
  </p>
</div>

---

## 🌟 Overview

**Deja** is a refined desktop client that pairs the massive catalog and recommendation algorithms of **YouTube Music** with the clean, elegant glassmorphism of **Apple Music**.

Designed from the ground up for desktop PC users, Deja eliminates the clutter of a standard browser tab while preserving all official YouTube Music functionality, including Google account library synchronization, high-fidelity audio playback, and official monetization compliance.

---

## ⚖️ Google Terms of Service & Advertising Policy

Deja is strictly an independent **user interface shell** and **desktop wrapper** for YouTube Music. We believe in supporting music creators and respecting platform guidelines:

- **Free Users**: In accordance with Google's platform policies, standard advertisements served by YouTube Music **are displayed normally**. Deja does not block, skip, or modify ads.
- **YouTube Premium Subscribers**: Users with a valid YouTube Premium subscription can securely log into their Google account and enjoy their native **ad-free listening**, background playback, and high-bitrate streaming.
- **No Paywall Circumvention**: Deja contains zero adblockers or subscription bypass algorithms. It is built to offer a visually superior interface while remaining 100% compliant with Google's Terms of Service.

---

## ✨ Features

- 🍎 **Apple Music Glassmorphic Design**:
  - macOS Sonoma / Windows 11 Acrylic frosted glass navigation bar and translucent sidebar.
  - Signature Apple Music Ruby Red accent color (`#FA2D48`).
  - Smooth squircle cards with subtle hover lift and floating drop shadows.
  - Apple macOS traffic light window controls (Close, Minimize, Maximize) with seamless frameless window dragging.
- 🎤 **Live Time-Synced Lyrics (Apple Music Sing Style)**:
  - Immersive full-height lyrics drawer with dynamic glowing mesh aura that shifts colors to match the currently playing album artwork.
  - Large, bold lyrics typography with real-time active line highlighting and smooth auto-scrolling.
- 🪟 **Compact Mini Player**:
  - Always-on-top floating pill player widget for discreet desktop multitasking.
- ⌨️ **Hardware Media Keys & Windows SMTC**:
  - Global support for keyboard media keys (`Play/Pause`, `Next Track`, `Previous Track`, `Stop`).
  - Windows System Media Transport Controls integration (lock screen controls and volume flyout).
- 💬 **Discord Rich Presence (RPC)**:
  - Displays what track you're listening to on Discord with album art, artist, track title, and elapsed time.
- 🔔 **Windows System Tray & Notifications**:
  - Runs quietly in the notification tray with full playback context menu.
  - Native toast notifications upon track change.
- 🔒 **Secure Google Authentication**:
  - Configured with clean User-Agent parameters so users can safely sign into their Google accounts with 2FA/passkeys without encountering browser blocks.
- 🎛️ **Dual Engine Preview & Offline Fallback**:
  - Built-in preview player mode (`npm run preview`) allowing full UI testing and demonstration even without an active internet connection.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Space` | Play / Pause |
| `Ctrl + Alt + Space` / `MediaPlayPause` | Global Play / Pause |
| `Ctrl + Alt + Right` / `MediaNextTrack` | Global Next Track |
| `Ctrl + Alt + Left` / `MediaPreviousTrack`| Global Previous Track |
| `Ctrl + Alt + Up` | Volume Up |
| `Ctrl + Alt + Down` | Volume Down |
| `Ctrl + Alt + M` / `Ctrl + Shift + M` | Toggle Mini Player |
| `Ctrl + Alt + L` / `Ctrl + Shift + L` | Toggle Live Synced Lyrics |
| `Ctrl + K` | Focus Search Bar |
| `F12` | Toggle Developer Tools |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Dathevinci/Deja.git
   cd Deja
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the Deja Desktop Client**:
   ```bash
   npm start
   ```

4. **Run the Apple Music UI Preview Mode**:
   ```bash
   npm run preview
   ```

---

## 🧪 Testing

Deja includes an automated test suite verifying configuration persistence, CSS selector validity, IPC protocols, and Google TOS compliance:

```bash
npm test
```

---

## 📦 Building Standalone Executable (.exe)

To build a standalone Windows installer (`.exe`) and portable executable:

```bash
# Package into dist/ folder
npm run pack

# Build production NSIS Windows installer
npm run dist
```

Generated binaries will be available inside the `dist/` directory:
- `Deja Setup 1.0.0.exe` (Full NSIS Installer with desktop/start menu shortcuts)
- `Deja 1.0.0.exe` (Portable edition)

---

## 📁 Project Structure

```
Deja/
├── .github/
│   └── workflows/
│       └── build.yml             # Automated CI build & GitHub releases
├── assets/
│   ├── logo.png                  # Apple Music + YouTube Music hybrid app logo
│   ├── icon.ico                  # Multi-resolution Windows application icon
│   └── icon.png                  # 512x512 high-res application icon
├── src/
│   ├── main/
│   │   ├── main.js               # Electron main process entry point & window manager
│   │   ├── config.js             # User settings & persistent configuration manager
│   │   ├── shortcuts.js          # Hardware media keys & global hotkey registrar
│   │   ├── tray.js               # Windows taskbar system tray controller
│   │   ├── discord.js            # Discord Rich Presence IPC bridge
│   │   └── menu.js               # Native application & playback menu
│   ├── preload/
│   │   ├── preload.js            # Secure contextBridge & script/stylesheet injection
│   │   ├── apple-theme.css       # Complete Apple Music design system for YouTube Music
│   │   └── apple-player.js       # Player event hooks, ad status observer, & live lyrics
│   └── renderer/
│       ├── preview.html          # Standalone Apple Music desktop interface
│       ├── preview.css           # Glassmorphism, animations, & responsive styles
│       ├── preview.js            # Interactive player logic & synthesized audio demo
│       └── offline-fallback.html # Graceful offline reconnection screen
├── tests/
│   ├── config.test.js            # Unit tests for ConfigManager
│   ├── theme.test.js             # Unit tests for CSS styling tokens
│   ├── compliance.test.js        # Unit tests for Google TOS & Ad compliance
│   ├── ipc.test.js               # Unit tests for IPC action mappings
│   └── run-all-tests.js          # Master test runner
├── .gitignore
├── LICENSE                       # MIT License with trademark notices
├── CONTRIBUTING.md               # Community guidelines
├── README.md                     # Documentation
└── package.json                  # Scripts & build configuration
```

---

## 📄 Legal & Disclaimer

- **YouTube Music** and the YouTube logo are trademarks of **Google LLC**.
- **Apple Music**, **macOS**, and **SF Pro** are trademarks of **Apple Inc.**
- Deja is an independent open-source project and is **not affiliated with, endorsed by, or sponsored by Google LLC or Apple Inc.**
- All content and audio streams originate directly from YouTube Music servers according to Google's standard web delivery.

---

<div align="center">
  <sub>Crafted with passion for music and beautiful desktop design. Open source under the MIT License.</sub>
</div>
