/**
 * Generates the PWA icons without any image dependency.
 * Draws the GATE Prep Hub mark (a pi-like gate) into an RGBA buffer,
 * supersamples it for smooth edges and encodes a PNG by hand.
 *
 * Run: npm run icons
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

const OUT_DIR = join('public', 'icons');
const BG = [11, 18, 32, 255];
const FG = [245, 158, 11, 255];

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function encodePng(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 6; // RGBA
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function fillRect(pixels, size, x, y, width, height, color) {
  for (let py = y; py < y + height; py += 1) {
    if (py < 0 || py >= size) continue;
    for (let px = x; px < x + width; px += 1) {
      if (px < 0 || px >= size) continue;
      const offset = (py * size + px) * 4;
      pixels[offset] = color[0];
      pixels[offset + 1] = color[1];
      pixels[offset + 2] = color[2];
      pixels[offset + 3] = color[3];
    }
  }
}

/** Draws the mark on a 512-unit grid, scaled by `scale` around the centre. */
function drawMark(pixels, size, scale) {
  const unit = (size / 512) * scale;
  const offset = (size - 512 * unit) / 2;
  const rect = (x, y, w, h) =>
    fillRect(
      pixels,
      size,
      Math.round(offset + x * unit),
      Math.round(offset + y * unit),
      Math.round(w * unit),
      Math.round(h * unit),
      FG,
    );

  rect(112, 150, 288, 62); // top bar
  rect(168, 212, 60, 162); // left leg
  rect(300, 212, 60, 162); // right leg
}

function render(size, scale) {
  const supersample = 4;
  const big = size * supersample;
  const pixels = Buffer.alloc(big * big * 4);

  for (let i = 0; i < big * big; i += 1) {
    pixels[i * 4] = BG[0];
    pixels[i * 4 + 1] = BG[1];
    pixels[i * 4 + 2] = BG[2];
    pixels[i * 4 + 3] = BG[3];
  }

  drawMark(pixels, big, scale);

  const out = Buffer.alloc(size * size * 4);
  const samples = supersample * supersample;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let dy = 0; dy < supersample; dy += 1) {
        for (let dx = 0; dx < supersample; dx += 1) {
          const source = ((y * supersample + dy) * big + (x * supersample + dx)) * 4;
          r += pixels[source];
          g += pixels[source + 1];
          b += pixels[source + 2];
          a += pixels[source + 3];
        }
      }
      const target = (y * size + x) * 4;
      out[target] = Math.round(r / samples);
      out[target + 1] = Math.round(g / samples);
      out[target + 2] = Math.round(b / samples);
      out[target + 3] = Math.round(a / samples);
    }
  }

  return out;
}

mkdirSync(OUT_DIR, { recursive: true });

const targets = [
  { file: 'icon-192.png', size: 192, scale: 1 },
  { file: 'icon-512.png', size: 512, scale: 1 },
  { file: 'icon-maskable-512.png', size: 512, scale: 0.82 },
];

for (const { file, size, scale } of targets) {
  const png = encodePng(size, size, render(size, scale));
  writeFileSync(join(OUT_DIR, file), png);
  console.log(`wrote public/icons/${file} (${size}x${size}, ${(png.length / 1024).toFixed(1)} KB)`);
}
