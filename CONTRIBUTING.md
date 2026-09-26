# Contributing to Sonora (YouTube Music Apple Client)

Thank you for your interest in contributing to Sonora! We welcome contributions from developers, designers, and music enthusiasts.

## Guiding Principles

1. **Clean Apple Music Aesthetic**: All UI components, animations, typography, and controls should adhere to Apple's Human Interface Guidelines (glassmorphism, vibrant colors, fluid interactions).
2. **Strict Google & YouTube TOS Compliance**:
   - Sonora is a client interface for YouTube Music.
   - We **never** block advertisements, bypass paywalls, or circumvent YouTube's security features.
   - Free users will see standard Google advertisements as delivered by YouTube Music.
   - YouTube Premium subscribers can log in securely to access their native ad-free experience.
   - Any pull request attempting to block ads or violate Google terms will be rejected.

## Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/yt-music-apple.git
   cd yt-music-apple
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run in development mode**:
   ```bash
   npm start
   ```

4. **Run the offline Apple Music desktop preview**:
   ```bash
   npm run preview
   ```

5. **Run test suite**:
   ```bash
   npm test
   ```

## Pull Request Guidelines

- Ensure `npm test` passes completely before submitting.
- Follow existing JavaScript (ES6+) and CSS conventions.
- Keep commits focused and provide clear descriptions.
