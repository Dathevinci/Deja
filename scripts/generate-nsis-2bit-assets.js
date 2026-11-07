#!/usr/bin/env node
/**
 * Generates Deja 2-Bit Dither & Pixel Art NSIS Setup Bitmaps:
 *  - assets/installerSidebar.bmp   (164 x 314, 24-bit uncompressed Windows BMP)
 *  - assets/uninstallerSidebar.bmp (164 x 314, 24-bit uncompressed Windows BMP)
 *  - assets/installerHeader.bmp    (150 x 57,  24-bit uncompressed Windows BMP)
 *
 * Palette derived directly from the Deja 2-Bit Website (docs/style.css):
 *  - Bit 00 (Obsidian Ink) : #0B090A / #141012 / #1B1518
 *  - Bit 01 (Crimson Wing) : #8C2D33 / #C43B44 / #4A181B
 *  - Bit 10 (Ash Pewter)   : #968E8B / #544D4B
 *  - Bit 11 (Bone Ivory)   : #F4EFEA
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(ROOT, 'assets');
const PKG = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const VERSION = PKG.version || '1.2.3';

// 2-Bit Palette
const PALETTE = {
  bit00: [0x0B, 0x09, 0x0A],        // #0B090A Obsidian Ink
  bit00Elevated: [0x14, 0x10, 0x12],// #141012 Elevated Obsidian
  bit00Panel: [0x1B, 0x15, 0x18],   // #1B1518 Panel Surface
  borderSubtle: [0x33, 0x2A, 0x2D], // #332A2D Subtle Border
  borderProm: [0x5C, 0x4E, 0x52],   // #5C4E52 Prominent Border
  bit01Deep: [0x4A, 0x18, 0x1B],    // #4A181B Deep Crimson Shadow
  bit01: [0x8C, 0x2D, 0x33],        // #8C2D33 Crimson Wing
  bit01Bright: [0xC4, 0x3B, 0x44],  // #C43B44 Bright Ruby/Crimson
  bit10Dim: [0x54, 0x4D, 0x4B],     // #544D4B Dim Pewter
  bit10: [0x96, 0x8E, 0x8B],        // #968E8B Ash Pewter
  bit10Light: [0xB8, 0xB0, 0xAC],   // #B8B0AC Light Pewter
  bit11: [0xF4, 0xEF, 0xEA],        // #F4EFEA Bone Ivory
  black: [0x00, 0x00, 0x00]
};

// 4x4 Bayer Matrix normalized [0..15]
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
];

// 5x7 Pixel Bitmap Font for 2-Bit HUD Typography
const FONT_5X7 = {
  'A': ['01110','10001','10001','11111','10001','10001','10001'],
  'B': ['11110','10001','10001','11110','10001','10001','11110'],
  'C': ['01111','10000','10000','10000','10000','10000','01111'],
  'D': ['11110','10001','10001','10001','10001','10001','11110'],
  'E': ['11111','10000','10000','11110','10000','10000','11111'],
  'F': ['11111','10000','10000','11110','10000','10000','10000'],
  'G': ['01111','10000','10000','10011','10001','10001','01111'],
  'H': ['10001','10001','10001','11111','10001','10001','10001'],
  'I': ['11111','00100','00100','00100','00100','00100','11111'],
  'J': ['00111','00010','00010','00010','10010','10010','01100'],
  'K': ['10001','10010','10100','11000','10100','10010','10001'],
  'L': ['10000','10000','10000','10000','10000','10000','11111'],
  'M': ['10001','11011','10101','10101','10001','10001','10001'],
  'N': ['10001','11001','10101','10011','10001','10001','10001'],
  'O': ['01110','10001','10001','10001','10001','10001','01110'],
  'P': ['11110','10001','10001','11110','10000','10000','10000'],
  'R': ['11110','10001','10001','11110','10100','10010','10001'],
  'S': ['01111','10000','10000','01110','00001','00001','11110'],
  'T': ['11111','00100','00100','00100','00100','00100','00100'],
  'U': ['10001','10001','10001','10001','10001','10001','01110'],
  'V': ['10001','10001','10001','10001','10001','01010','00100'],
  'W': ['10001','10001','10001','10101','10101','11011','10001'],
  'X': ['10001','10001','01010','00100','01010','10001','10001'],
  'Y': ['10001','10001','01010','00100','00100','00100','00100'],
  'Z': ['11111','00001','00010','00100','01000','10000','11111'],
  '0': ['01110','10011','10101','10101','11001','10001','01110'],
  '1': ['00100','01100','00100','00100','00100','00100','01110'],
  '2': ['01110','10001','00001','00110','01000','10000','11111'],
  '3': ['11110','00001','00001','01110','00001','00001','11110'],
  '4': ['00010','00110','01010','10010','11111','00010','00010'],
  '5': ['11111','10000','10000','11110','00001','00001','11110'],
  '6': ['01110','10000','10000','11110','10001','10001','01110'],
  '7': ['11111','00001','00010','00100','01000','01000','01000'],
  '8': ['01110','10001','10001','01110','10001','10001','01110'],
  '9': ['01110','10001','10001','01111','00001','00001','01110'],
  '-': ['00000','00000','00000','11111','00000','00000','00000'],
  '+': ['00000','00100','00100','11111','00100','00100','00000'],
  '.': ['00000','00000','00000','00000','00000','01100','01100'],
  '/': ['00001','00010','00100','00100','01000','10000','00000'],
  ':': ['00000','01100','01100','00000','01100','01100','00000'],
  ' ': ['00000','00000','00000','00000','00000','00000','00000']
};

function decodePngRGBA(filePath) {
  const buf = fs.readFileSync(filePath);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const idatChunks = [];
  let offset = 8;
  while (offset < buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.subarray(offset + 4, offset + 8).toString('ascii');
    if (type === 'IDAT') {
      idatChunks.push(buf.subarray(offset + 8, offset + 8 + len));
    } else if (type === 'IEND') {
      break;
    }
    offset += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idatChunks));
  const bpp = 4;
  const stride = width * bpp;
  const pixels = new Uint8Array(width * height * 4);

  function paethPredictor(a, b, c) {
    const p = a + b - c;
    const pa = Math.abs(p - a);
    const pb = Math.abs(p - b);
    const pc = Math.abs(p - c);
    if (pa <= pb && pa <= pc) return a;
    if (pb <= pc) return b;
    return c;
  }

  for (let y = 0; y < height; y++) {
    const filterType = raw[y * (stride + 1)];
    const rowStart = y * (stride + 1) + 1;
    const outRow = y * stride;
    const prevRow = (y - 1) * stride;
    for (let i = 0; i < stride; i++) {
      const xByte = raw[rowStart + i];
      const a = i >= bpp ? pixels[outRow + i - bpp] : 0;
      const b = y > 0 ? pixels[prevRow + i] : 0;
      const c = (y > 0 && i >= bpp) ? pixels[prevRow + i - bpp] : 0;
      let val = xByte;
      if (filterType === 1) val = (xByte + a) & 0xFF;
      else if (filterType === 2) val = (xByte + b) & 0xFF;
      else if (filterType === 3) val = (xByte + ((a + b) >> 1)) & 0xFF;
      else if (filterType === 4) val = (xByte + paethPredictor(a, b, c)) & 0xFF;
      pixels[outRow + i] = val;
    }
  }

  // Trim transparent bounding box while preserving 1:1 square aspect ratio
  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = pixels[(y * width + x) * 4 + 3];
      if (a > 24) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  const boxW = maxX - minX + 1;
  const boxH = maxY - minY + 1;
  const side = Math.max(boxW, boxH);
  const centerX = Math.round((minX + maxX) / 2);
  const centerY = Math.round((minY + maxY) / 2);
  const sqMinX = Math.max(0, Math.round(centerX - side / 2));
  const sqMinY = Math.max(0, Math.round(centerY - side / 2));
  const sqMaxX = Math.min(width - 1, sqMinX + side - 1);
  const sqMaxY = Math.min(height - 1, sqMinY + side - 1);

  return { width, height, pixels, bounds: { minX: sqMinX, minY: sqMinY, maxX: sqMaxX, maxY: sqMaxY } };
}

class Canvas24 {
  constructor(width, height, bg = PALETTE.bit00) {
    this.width = width;
    this.height = height;
    this.data = new Uint8Array(width * height * 3);
    this.fillRect(0, 0, width, height, bg);
  }

  setPixel(x, y, rgb) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const idx = (y * this.width + x) * 3;
    this.data[idx] = rgb[0];
    this.data[idx + 1] = rgb[1];
    this.data[idx + 2] = rgb[2];
  }

  blendPixel(x, y, rgb, alpha) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const idx = (y * this.width + x) * 3;
    const inv = 1 - alpha;
    this.data[idx] = Math.round(this.data[idx] * inv + rgb[0] * alpha);
    this.data[idx + 1] = Math.round(this.data[idx + 1] * inv + rgb[1] * alpha);
    this.data[idx + 2] = Math.round(this.data[idx + 2] * inv + rgb[2] * alpha);
  }

  fillRect(x, y, w, h, rgb) {
    for (let py = y; py < y + h; py++) {
      for (let px = x; px < x + w; px++) {
        this.setPixel(px, py, rgb);
      }
    }
  }

  strokeRect(x, y, w, h, thickness, rgb) {
    this.fillRect(x, y, w, thickness, rgb);
    this.fillRect(x, y + h - thickness, w, thickness, rgb);
    this.fillRect(x, y, thickness, h, rgb);
    this.fillRect(x + w - thickness, y, thickness, h, rgb);
  }

  drawPixelCorners(x, y, w, h, len, thickness, rgb) {
    // TL
    this.fillRect(x, y, len, thickness, rgb);
    this.fillRect(x, y, thickness, len, rgb);
    // TR
    this.fillRect(x + w - len, y, len, thickness, rgb);
    this.fillRect(x + w - thickness, y, thickness, len, rgb);
    // BL
    this.fillRect(x, y + h - thickness, len, thickness, rgb);
    this.fillRect(x, y + h - len, thickness, len, rgb);
    // BR
    this.fillRect(x + w - len, y + h - thickness, len, thickness, rgb);
    this.fillRect(x + w - thickness, y + h - len, thickness, len, rgb);
  }

  drawText(text, x, y, rgb, scale = 1, spacing = 1, shadowRgb = null, shadowOffset = 1) {
    const str = String(text).toUpperCase();
    if (shadowRgb) {
      this.drawText(str, x + shadowOffset, y + shadowOffset, shadowRgb, scale, spacing, null, 0);
    }
    let cursorX = x;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const glyph = FONT_5X7[ch] || FONT_5X7[' '];
      for (let gy = 0; gy < 7; gy++) {
        const row = glyph[gy];
        for (let gx = 0; gx < 5; gx++) {
          if (row[gx] === '1') {
            this.fillRect(cursorX + gx * scale, y + gy * scale, scale, scale, rgb);
          }
        }
      }
      cursorX += (5 + spacing) * scale;
    }
  }

  measureTextWidth(text, scale = 1, spacing = 1) {
    const len = String(text).length;
    if (len === 0) return 0;
    return (len * 5 + (len - 1) * spacing) * scale;
  }

  drawCenteredText(text, centerX, y, rgb, scale = 1, spacing = 1, shadowRgb = null, shadowOffset = 1) {
    const w = this.measureTextWidth(text, scale, spacing);
    const startX = Math.round(centerX - w / 2);
    this.drawText(text, startX, y, rgb, scale, spacing, shadowRgb, shadowOffset);
  }

  drawSpriteNearest(png, destX, destY, destW, destH) {
    const { minX, minY, maxX, maxY } = png.bounds;
    const srcW = Math.max(1, maxX - minX + 1);
    const srcH = Math.max(1, maxY - minY + 1);

    for (let dy = 0; dy < destH; dy++) {
      const sy = Math.min(png.height - 1, minY + Math.floor((dy / destH) * srcH));
      for (let dx = 0; dx < destW; dx++) {
        const sx = Math.min(png.width - 1, minX + Math.floor((dx / destW) * srcW));
        const idx = (sy * png.width + sx) * 4;
        const a = png.pixels[idx + 3] / 255;
        if (a > 0.12) {
          const r = png.pixels[idx];
          const g = png.pixels[idx + 1];
          const b = png.pixels[idx + 2];
          // Quantize slightly toward crisp 2-bit contrast
          this.blendPixel(destX + dx, destY + dy, [r, g, b], a);
        }
      }
    }
  }

  toBmpBuffer() {
    const rowStride = Math.ceil((this.width * 3) / 4) * 4;
    const pixelDataSize = rowStride * this.height;
    const fileSize = 54 + pixelDataSize;
    const buf = Buffer.alloc(fileSize);

    // BITMAPFILEHEADER (14 bytes)
    buf.write('BM', 0, 2, 'ascii');
    buf.writeUInt32LE(fileSize, 2);
    buf.writeUInt32LE(0, 6);
    buf.writeUInt32LE(54, 10);

    // BITMAPINFOHEADER (40 bytes)
    buf.writeUInt32LE(40, 14);
    buf.writeInt32LE(this.width, 18);
    buf.writeInt32LE(this.height, 22); // bottom-up positive height
    buf.writeUInt16LE(1, 26);          // planes
    buf.writeUInt16LE(24, 28);         // 24-bit RGB
    buf.writeUInt32LE(0, 30);          // BI_RGB uncompressed
    buf.writeUInt32LE(pixelDataSize, 34);
    buf.writeInt32LE(2835, 38);        // 72 DPI
    buf.writeInt32LE(2835, 42);
    buf.writeUInt32LE(0, 46);
    buf.writeUInt32LE(0, 50);

    for (let y = 0; y < this.height; y++) {
      const srcY = this.height - 1 - y; // bottom-up
      const rowOffset = 54 + y * rowStride;
      for (let x = 0; x < this.width; x++) {
        const idx = (srcY * this.width + x) * 3;
        const dst = rowOffset + x * 3;
        buf[dst] = this.data[idx + 2];     // B
        buf[dst + 1] = this.data[idx + 1]; // G
        buf[dst + 2] = this.data[idx];     // R
      }
    }
    return buf;
  }
}

function buildSidebarBmp(angelPng, mode = 'install') {
  const W = 164;
  const H = 314;
  const c = new Canvas24(W, H, PALETTE.bit00);

  // 1. 2-Bit Bayer Dither Halo + Halftone Grid + Scanlines
  const cx = 81;
  const cy = 104;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x - cx;
      const dy = (y - cy) * 0.82;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const norm = Math.max(0, 1 - dist / 118);
      const bayer = BAYER_4X4[(y >> 1) & 3][(x >> 1) & 3] / 16;

      if (norm > bayer * 0.85) {
        c.setPixel(x, y, norm > 0.55 ? PALETTE.bit01Deep : PALETTE.bit00Elevated);
      } else if ((x % 16 === 0 || y % 16 === 0) && (x + y) % 4 === 0) {
        c.setPixel(x, y, [0x18, 0x12, 0x15]);
      }

      // Subtle CRT scanline every 4px
      if (y % 4 === 3) {
        c.blendPixel(x, y, PALETTE.black, 0.25);
      }
    }
  }

  // Outer left/top/bottom subtle border & right Crimson divider
  c.fillRect(0, 0, W, 2, PALETTE.bit01);
  c.fillRect(0, H - 2, W, 2, PALETTE.bit01);
  c.fillRect(0, 0, 2, H, PALETTE.borderSubtle);
  c.fillRect(W - 3, 0, 1, H, PALETTE.borderSubtle);
  c.fillRect(W - 2, 0, 2, H, PALETTE.bit01Bright);

  // 2. Top 2-Bit HUD Telemetry Strip (x=10..152, y=10..28)
  c.fillRect(12, 12, 142, 18, PALETTE.black);
  c.fillRect(10, 10, 142, 18, PALETTE.bit00Panel);
  c.strokeRect(10, 10, 142, 18, 1, PALETTE.borderProm);

  // 4-Bit Swatch Grid inside HUD strip
  c.fillRect(15, 14, 5, 5, PALETTE.bit00);
  c.fillRect(21, 14, 5, 5, PALETTE.bit01Bright);
  c.fillRect(15, 20, 5, 5, PALETTE.bit10);
  c.fillRect(21, 20, 5, 5, PALETTE.bit11);
  c.strokeRect(14, 13, 13, 13, 1, PALETTE.bit10Dim);

  c.drawText('2-BIT // DITHER UI', 33, 16, PALETTE.bit11, 1, 1);

  // 3. Dashed Pixel Orbit Ring around Medallion
  const orbitR = 54;
  for (let deg = 0; deg < 360; deg += 6) {
    if ((deg / 6) % 2 === 0) {
      const rad = (deg * Math.PI) / 180;
      const ox = Math.round(cx + Math.cos(rad) * orbitR);
      const oy = Math.round(cy + Math.sin(rad) * orbitR);
      c.fillRect(ox - 1, oy - 1, 2, 2, PALETTE.bit01);
    }
  }

  // 4. 2-Bit Fallen Angel Medallion (86 x 86 at x=38, y=61)
  const medX = 38;
  const medY = 61;
  const medSize = 86;

  // Hard offset shadow (#4A181B + #000000)
  c.fillRect(medX + 5, medY + 5, medSize, medSize, PALETTE.bit01Deep);
  c.strokeRect(medX + 5, medY + 5, medSize, medSize, 1, PALETTE.black);

  // Medallion Bone Ivory Box with stepped borders
  c.fillRect(medX, medY, medSize, medSize, PALETTE.bit11);
  c.strokeRect(medX, medY, medSize, medSize, 2, PALETTE.bit01Bright);
  c.strokeRect(medX + 2, medY + 2, medSize - 4, medSize - 4, 2, PALETTE.bit00);

  // Subtle Bayer halftone texture in medallion corners
  for (let py = medY + 4; py < medY + medSize - 4; py += 2) {
    for (let px = medX + 4; px < medX + medSize - 4; px += 2) {
      const cdx = Math.abs(px - (medX + medSize / 2));
      const cdy = Math.abs(py - (medY + medSize / 2));
      if (cdx + cdy > 58) {
        c.fillRect(px, py, 1, 1, [0xDF, 0xD8, 0xD2]);
      }
    }
  }

  // Pixel Corner Brackets outside medallion
  c.drawPixelCorners(medX - 5, medY - 5, medSize + 10, medSize + 10, 8, 2, PALETTE.bit01Bright);

  // Draw Fallen Angel Sprite inside medallion
  c.drawSpriteNearest(angelPng, medX + 6, medY + 6, medSize - 12, medSize - 12);

  // 5. Large 2-Bit Pixel Title "DEJA" & Subtitles
  c.drawCenteredText('DEJA', cx, 162, PALETTE.bit11, 3, 2, PALETTE.bit01, 2);
  c.drawCenteredText('YOUTUBE MUSIC CLIENT', cx, 191, PALETTE.bit10Light, 1, 1);
  c.drawCenteredText('APPLE + 2-BIT ENGINE', cx, 202, PALETTE.bit01Bright, 1, 1);

  // 6. Stepped 2-Bit Equalizer Waveform Stage (y=218..264)
  const barHeights = [3, 5, 8, 6, 9, 7, 10, 8, 5, 9, 6, 4, 7];
  const barW = 7;
  const barGap = 3;
  const totalBarsW = barHeights.length * barW + (barHeights.length - 1) * barGap;
  const startBarX = Math.round(cx - totalBarsW / 2);
  const eqTop = 218;
  const eqH = 44;

  for (let i = 0; i < barHeights.length; i++) {
    const bx = startBarX + i * (barW + barGap);
    // Track background
    c.fillRect(bx, eqTop, barW, eqH, PALETTE.bit00Panel);
    c.strokeRect(bx, eqTop, barW, eqH, 1, PALETTE.borderSubtle);

    const blocks = barHeights[i];
    for (let b = 0; b < blocks; b++) {
      const by = eqTop + eqH - 2 - (b + 1) * 4;
      let col = PALETTE.bit01;
      if (b >= blocks - 1 && blocks >= 8) col = PALETTE.bit11;
      else if (b >= 5) col = PALETTE.bit01Bright;
      c.fillRect(bx + 1, by, barW - 2, 3, col);
    }
  }

  // 7. Bottom Telemetry Badge Pill (x=12..150, y=274..298)
  c.fillRect(14, 277, 138, 22, PALETTE.black);
  c.fillRect(11, 274, 138, 22, PALETTE.bit00Elevated);
  c.strokeRect(11, 274, 138, 22, 1, PALETTE.bit01Bright);

  // Status dot
  c.fillRect(18, 282, 6, 6, PALETTE.bit01Bright);
  c.fillRect(19, 283, 2, 2, PALETTE.bit11);

  const badgeLabel = mode === 'uninstall'
    ? `UNINSTALL // V${VERSION}`
    : `SETUP // V${VERSION} X64`;
  c.drawText(badgeLabel, 29, 282, PALETTE.bit11, 1, 1);

  return c.toBmpBuffer();
}

function buildHeaderBmp(angelPng) {
  const W = 150;
  const H = 57;
  const c = new Canvas24(W, H, PALETTE.bit00);

  // 1. Right-aligned 2-Bit Bayer Dither Glow + CRT Scanlines
  const cx = 118;
  const cy = 27;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const norm = Math.max(0, 1 - dist / 64);
      const bayer = BAYER_4X4[(y >> 1) & 3][(x >> 1) & 3] / 16;
      if (norm > bayer * 0.9) {
        c.setPixel(x, y, norm > 0.52 ? PALETTE.bit01Deep : PALETTE.bit00Elevated);
      }
      if (y % 4 === 3) {
        c.blendPixel(x, y, PALETTE.black, 0.22);
      }
    }
  }

  // 2. Left 4-Bit Palette Swatch Pills + Micro Telemetry (x=5..88)
  const swColors = [PALETTE.bit00Elevated, PALETTE.bit01Bright, PALETTE.bit10, PALETTE.bit11];
  for (let i = 0; i < swColors.length; i++) {
    const sx = 5 + i * 9;
    c.fillRect(sx, 8, 7, 7, swColors[i]);
    c.strokeRect(sx, 8, 7, 7, 1, PALETTE.borderProm);
  }
  c.drawText('2-BIT', 44, 8, PALETTE.bit10, 1, 1);

  // Mini stepped equalizer + DEJA pixel wordmark on header
  const miniBars = [2, 4, 6, 5, 7, 4, 6];
  for (let i = 0; i < miniBars.length; i++) {
    const bx = 5 + i * 5;
    const blocks = miniBars[i];
    for (let b = 0; b < blocks; b++) {
      const by = 46 - (b + 1) * 4;
      const col = b === blocks - 1 && blocks >= 6 ? PALETTE.bit11 : (b >= 4 ? PALETTE.bit01Bright : PALETTE.bit01);
      c.fillRect(bx, by, 3, 3, col);
    }
  }

  c.drawText('DEJA', 44, 24, PALETTE.bit11, 2, 1, PALETTE.bit01, 1);
  c.drawText(`V${VERSION}`, 44, 41, PALETTE.bit01Bright, 1, 1);

  // 3. Fallen Angel Medallion on Right (x=96, y=5, 44x44)
  const medX = 96;
  const medY = 5;
  const medSize = 44;

  c.fillRect(medX + 3, medY + 3, medSize, medSize, PALETTE.bit01Deep);
  c.fillRect(medX, medY, medSize, medSize, PALETTE.bit11);
  c.strokeRect(medX, medY, medSize, medSize, 2, PALETTE.bit01Bright);
  c.strokeRect(medX + 2, medY + 2, medSize - 4, medSize - 4, 1, PALETTE.bit00);
  c.drawPixelCorners(medX - 3, medY - 3, medSize + 6, medSize + 6, 5, 1, PALETTE.bit01Bright);

  c.drawSpriteNearest(angelPng, medX + 3, medY + 3, medSize - 6, medSize - 6);

  // 4. Bottom Crimson Wing Accent Strip (y=55..56)
  c.fillRect(0, H - 2, W, 2, PALETTE.bit01Bright);

  return c.toBmpBuffer();
}

function main() {
  const iconPath = path.join(ASSETS_DIR, 'icon.png');
  const angelPng = decodePngRGBA(iconPath);

  const sidebarBmp = buildSidebarBmp(angelPng, 'install');
  const unSidebarBmp = buildSidebarBmp(angelPng, 'uninstall');
  const headerBmp = buildHeaderBmp(angelPng);

  const sidebarPath = path.join(ASSETS_DIR, 'installerSidebar.bmp');
  const unSidebarPath = path.join(ASSETS_DIR, 'uninstallerSidebar.bmp');
  const headerPath = path.join(ASSETS_DIR, 'installerHeader.bmp');

  fs.writeFileSync(sidebarPath, sidebarBmp);
  fs.writeFileSync(unSidebarPath, unSidebarBmp);
  fs.writeFileSync(headerPath, headerBmp);

  console.log(`Generated 2-Bit NSIS bitmaps:
  - ${sidebarPath} (${sidebarBmp.length} bytes, 164x314, 24-bit BMP)
  - ${unSidebarPath} (${unSidebarBmp.length} bytes, 164x314, 24-bit BMP)
  - ${headerPath} (${headerBmp.length} bytes, 150x57, 24-bit BMP)`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
