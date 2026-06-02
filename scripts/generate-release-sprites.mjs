/**
 * scripts/generate-release-sprites.mjs
 *
 * Generates release-candidate Phase 0 sprite frames for the Pixel Cat
 * baby form.  Uses raw PNG encoding (no external dependencies).
 *
 * Run: node scripts/generate-release-sprites.mjs
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const SIZE = 32;
const ROOT = path.resolve("pet-packs/pixel-cat/baby");

// Palette – [R, G, B, A]
const C = {
  orange:      [0xff, 0x8c, 0x00, 0xff],
  darkOrange:  [0xcc, 0x66, 0x00, 0xff],
  lightOrange: [0xff, 0xa5, 0x00, 0xff],
  blush:       [0xff, 0xcc, 0x80, 0xff],
  white:       [0xff, 0xff, 0xff, 0xff],
  black:       [0x00, 0x00, 0x00, 0xff],
  gray:        [0xdd, 0xdd, 0xdd, 0xff],
  transparent: [0x00, 0x00, 0x00, 0x00],
};

// ---------------------------------------------------------------------------
// Low-level drawing helpers
// ---------------------------------------------------------------------------

function allocBuffer() {
  return new Uint8Array(SIZE * SIZE * 4);
}

function setPixel(buf, x, y, color) {
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;
  const i = (y * SIZE + x) << 2;
  buf[i] = color[0];
  buf[i + 1] = color[1];
  buf[i + 2] = color[2];
  buf[i + 3] = color[3];
}

function fillRect(buf, x0, y0, x1, y1, color) {
  for (let y = Math.max(0, y0); y <= Math.min(SIZE - 1, y1); y++) {
    for (let x = Math.max(0, x0); x <= Math.min(SIZE - 1, x1); x++) {
      setPixel(buf, x, y, color);
    }
  }
}

function fillEllipse(buf, cx, cy, rx, ry, color) {
  const minY = Math.max(0, Math.floor(cy - ry));
  const maxY = Math.min(SIZE - 1, Math.ceil(cy + ry));
  const minX = Math.max(0, Math.floor(cx - rx));
  const maxX = Math.min(SIZE - 1, Math.ceil(cx + rx));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1.0) setPixel(buf, x, y, color);
    }
  }
}

function fillTriangle(buf, x1, y1, x2, y2, x3, y3, color) {
  const minX = Math.max(0, Math.floor(Math.min(x1, x2, x3)));
  const maxX = Math.min(SIZE - 1, Math.ceil(Math.max(x1, x2, x3)));
  const minY = Math.max(0, Math.floor(Math.min(y1, y2, y3)));
  const maxY = Math.min(SIZE - 1, Math.ceil(Math.max(y1, y2, y3)));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (pointInTri(x + 0.5, y + 0.5, x1, y1, x2, y2, x3, y3)) {
        setPixel(buf, x, y, color);
      }
    }
  }
}

function pointInTri(px, py, x1, y1, x2, y2, x3, y3) {
  const d1 = sign(px, py, x1, y1, x2, y2);
  const d2 = sign(px, py, x2, y2, x3, y3);
  const d3 = sign(px, py, x3, y3, x1, y1);
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNeg && hasPos);
}

function sign(px, py, x1, y1, x2, y2) {
  return (px - x2) * (y1 - y2) - (x1 - x2) * (py - y2);
}

// ---------------------------------------------------------------------------
// Composite cat builder
// ---------------------------------------------------------------------------

/**
 * Parameters to vary across animation frames:
 *   hx, hy   – head offset (px)
 *   hrx, hry – head radii (default 7, 6)
 *   bx, by   – body offset (px)
 *   earDx    – ear horizontal shift for tilt
 *   eyeOpen  – 0 = closed, 1 = open
 *   pxOff    – pupil X offset (-1 = left, 1 = right)
 *   squash   – vertical squash of body (-1 = squished, 1 = stretched)
 *   mouthO   – mouth open 0..1
 *   lift     – arm lift 0..1
 */
function buildCat(opt = {}) {
  const buf = allocBuffer();
  const {
    hx = 0, hy = 0,
    hrx = 7, hry = 6,
    bx = 0, by = 0,
    earDx = 0,
    eyeOpen = 1,
    pxOff = 0,
    squash = 0,
   } = opt;

  const headCX = 16 + hx;
  const headCY = 11 + hy + squash * 0.3;
  const bodyCY = 23 + by + squash * 0.6;

  // Use slightly modified radii for squashing
  const hRy = Math.max(4, hry + squash * 0.4);

  // ---- Layer 1: body ----
  fillEllipse(buf, headCX, bodyCY, 6, 4, C.darkOrange);
  fillEllipse(buf, headCX, bodyCY, 5, 3, C.orange);

  // ---- Layer 2: ear tips (drawn before head so head covers the base) ----
  const earTipY = headCY - hRy - 1;
  const earBaseY = headCY - hRy + 3;

  // Left ear
  fillTriangle(buf,
    headCX - 5 + earDx, earBaseY,
    headCX - 4 + earDx, earTipY,
    headCX - 1 + earDx, earBaseY,
    C.darkOrange);
  fillTriangle(buf,
    headCX - 4 + earDx, earBaseY,
    headCX - 3.5 + earDx, earTipY + 1,
    headCX - 2 + earDx, earBaseY,
    C.orange);

  // Right ear
  fillTriangle(buf,
    headCX + 1 - earDx, earBaseY,
    headCX + 4 - earDx, earTipY,
    headCX + 5 - earDx, earBaseY,
    C.darkOrange);
  fillTriangle(buf,
    headCX + 2 - earDx, earBaseY,
    headCX + 3.5 - earDx, earTipY + 1,
    headCX + 4 - earDx, earBaseY,
    C.orange);

  // ---- Layer 3: head ----
  fillEllipse(buf, headCX, headCY, hrx, hRy, C.darkOrange);
  fillEllipse(buf, headCX, headCY, hrx - 1, hRy - 1, C.orange);

  // ---- Cheek blush ----
  setPixel(buf, headCX - 5, headCY + 1, C.blush);
  setPixel(buf, headCX + 5, headCY + 1, C.blush);

  // ---- Eyes ----
  if (eyeOpen >= 0.8) {
    // Fully open – 2x1 white + 1x1 pupil
    fillRect(buf, headCX - 4, headCY - 3, headCX - 3, headCY - 2, C.white);
    fillRect(buf, headCX + 3, headCY - 3, headCX + 4, headCY - 2, C.white);
    setPixel(buf, headCX - 3 + (pxOff > 0 ? 0 : -1), headCY - 2, C.black);
    setPixel(buf, headCX + 3 + (pxOff < 0 ? 0 : 1), headCY - 2, C.black);
  } else if (eyeOpen >= 0.4) {
    // Half open – 1x1 slit
    setPixel(buf, headCX - 4, headCY - 2, C.white);
    setPixel(buf, headCX + 4, headCY - 2, C.white);
    setPixel(buf, headCX - 4, headCY - 2, C.black);
    setPixel(buf, headCX + 4, headCY - 2, C.black);
  } else if (eyeOpen >= 0.1) {
    // Tiny slit – just a dark pixel
    setPixel(buf, headCX - 4, headCY - 2, C.darkOrange);
    setPixel(buf, headCX + 4, headCY - 2, C.darkOrange);
  }
  // eyeOpen < 0.1 → no eyes (closed)

  // ---- Nose ----
  setPixel(buf, headCX, headCY + 2, C.darkOrange);

  // ---- Mouth ----
  setPixel(buf, headCX - 1, headCY + 3, C.darkOrange);
  setPixel(buf, headCX + 1, headCY + 3, C.darkOrange);

  return buf;
}

// ---------------------------------------------------------------------------
// AOD builder – minimal silhouette
// ---------------------------------------------------------------------------

function buildAOD() {
  const buf = allocBuffer();

  // Body silhouette
  fillEllipse(buf, 16, 23, 6, 4, C.gray);

  // Head silhouette
  fillEllipse(buf, 16, 11, 7, 6, C.gray);

  // Left ear
  fillTriangle(buf, 11, 6, 13, 1, 15, 6, C.gray);
  // Right ear
  fillTriangle(buf, 17, 6, 19, 1, 21, 6, C.gray);

  // Very minimal eye dots for recognizability
  setPixel(buf, 12, 9, C.gray);
  setPixel(buf, 20, 9, C.gray);

  return buf;
}

// ---------------------------------------------------------------------------
// Animation parameter sequences
// ---------------------------------------------------------------------------

function staticParams() {
  return { hx: 0, hy: 0, eyeOpen: 1, pxOff: 0, squash: 0, earDx: 0, lift: 0 };
}

function wakeSeq(i) {
  // 8 frames: eyes closed → open → tiny stretch → back to idle
  if (i === 7) return { ...staticParams() };
  const eyeOpen = i < 2 ? i / 2 : (i > 5 ? (7 - i) / 2 : 1);
  const hy = i >= 3 && i <= 5 ? -0.5 - (i - 3) * 0.3 : 0;
  const squash = i >= 3 && i <= 5 ? (i - 3) * 0.25 : 0;
  return { hx: 0, hy, eyeOpen, pxOff: 0, squash, earDx: 0, lift: i >= 4 && i <= 5 ? 1 : 0 };
}

function tapSeq(i) {
  // 8 frames: look right → head tilt → back to idle
  if (i === 7) return { ...staticParams() };
  const phase = i < 3 ? i / 3 : (i > 4 ? (7 - i) / 3 : 1);
  const hx = phase * 1.5;
  const earDx = phase * 0.5;
  const pxOff = phase * 1;
  return { hx, hy: 0, eyeOpen: 1, pxOff, squash: 0, earDx, lift: 0 };
}

function feedSeq(i) {
  // 12 frames: head down → bite → head up → back to idle
  if (i === 11) return { ...staticParams() };
  let hy = 0, mouthO = 0, eyeOpen = 1;
  if (i < 4) {
    hy = i * 0.6;        // lowering head
  } else if (i < 7) {
    hy = 2.0;             // at food
    mouthO = (i - 3) / 3; // mouth open during bite
  } else if (i < 10) {
    hy = 2.0 - (i - 6) * 0.6; // raising head
  } else {
    hy = 0.2;             // almost back

  }
  if (i >= 9 && i <= 11) eyeOpen = 0.8 + (i - 9) * 0.1;
  return { hx: 0, hy, eyeOpen, pxOff: 0, squash: 0, earDx: 0, lift: 0, mouthO };
}

function happySeq(i) {
  // 10 frames: compact bounce (squash → stretch → back to idle)
  if (i === 9) return { ...staticParams() };
  const phases = [
    { squash: -0.4, hy: 0.5, by: 0.5 },  // squash down
    { squash: -0.6, hy: 0.8, by: 0.8 },
    { squash: 0,    hy: 0,   by: 0 },
    { squash: 0.3,  hy: -0.5, by: -0.5 }, // stretch up
    { squash: 0.5,  hy: -1,  by: -1 },
    { squash: 0,    hy: 0,   by: 0 },
    { squash: -0.4, hy: 0.5, by: 0.5 },
    { squash: -0.5, hy: 0.7, by: 0.7 },
    { squash: 0,    hy: 0,   by: 0 },
    { squash: 0,    hy: 0,   by: 0 },
  ];
  return { hx: 0, hy: phases[i].hy, eyeOpen: 1 + (i > 0 && i < 8 ? 0.2 : 0), pxOff: 0, squash: phases[i].squash, earDx: 0, lift: 0, by: phases[i].by };
}

function noFoodSeq(i) {
  // 8 frames: curious tilt left → right → back to idle
  if (i === 7) return { ...staticParams() };
  let tilt = 0;
  if (i < 3) tilt = i * 0.5;
  else if (i < 5) tilt = 1.0 - (i - 2) * 0.5;
  else tilt = -(i - 4) * 0.5;
  const pxOff = tilt * 0.5;
  return { hx: tilt * 0.8, hy: 0, eyeOpen: 1, pxOff, squash: 0, earDx: tilt * 0.3, lift: 0 };
}

// ---------------------------------------------------------------------------
// PNG encoder (same as create-wiring-pet-assets.mjs)
// ---------------------------------------------------------------------------

function chunk(type, data) {
  const name = Buffer.from(type);
  const body = Buffer.concat([name, data]);
  let crc = 0xffffffff;
  for (const byte of body) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  const trailer = Buffer.alloc(4);
  trailer.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([
    Buffer.from([
      (data.length >>> 24) & 255,
      (data.length >>> 16) & 255,
      (data.length >>> 8) & 255,
       data.length & 255,
    ]),
    body,
    trailer,
  ]);
}

function encodePNG(width, height, rgba) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;  // bit depth
  header[9] = 6;  // RGBA color type

  const rows = [];
  for (let y = 0; y < height; y++) {
    const filterByte = Buffer.from([0]); // no filter
    const row = Buffer.from(rgba.slice(y * width * 4, (y + 1) * width * 4));
    rows.push(Buffer.concat([filterByte, row]));
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    chunk("IHDR", header),
    chunk("IDAT", zlib.deflateSync(Buffer.concat(rows))),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function bufferToRGBA(buf) {
  // flat Uint8Array of RGBA values
  return Buffer.from(buf);
}

function buildFromParams(params) {
  const buf = buildCat(params);
  return bufferToRGBA(buf);
}

function buildAODRGBA() {
  return bufferToRGBA(buildAOD());
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

await mkdir(ROOT, { recursive: true });

// --- static ---
const staticBuf = buildFromParams(staticParams());
await writeFile(path.join(ROOT, "static.png"), encodePNG(SIZE, SIZE, staticBuf));

// --- aod ---
const aodBuf = buildAODRGBA();
await writeFile(path.join(ROOT, "aod.png"), encodePNG(SIZE, SIZE, aodBuf));

// --- wake (8 frames) ---
for (let i = 0; i < 8; i++) {
  const p = wakeSeq(i);
  const buf = i === 0 ? Buffer.from(aodBuf) : buildFromParams(p);
  await writeFile(path.join(ROOT, `wake_${i}.png`), encodePNG(SIZE, SIZE, buf));
}

// --- tap (8 frames) ---
for (let i = 0; i < 8; i++) {
  const p = tapSeq(i);
  const buf = buildFromParams(p);
  await writeFile(path.join(ROOT, `tap_${i}.png`), encodePNG(SIZE, SIZE, buf));
}

// --- feed (12 frames) ---
for (let i = 0; i < 12; i++) {
  const p = feedSeq(i);
  const buf = buildFromParams(p);
  await writeFile(path.join(ROOT, `feed_${i}.png`), encodePNG(SIZE, SIZE, buf));
}

// --- happy (10 frames) ---
for (let i = 0; i < 10; i++) {
  const p = happySeq(i);
  const buf = buildFromParams(p);
  await writeFile(path.join(ROOT, `happy_${i}.png`), encodePNG(SIZE, SIZE, buf));
}

// --- no_food (8 frames) ---
for (let i = 0; i < 8; i++) {
  const p = noFoodSeq(i);
  const buf = buildFromParams(p);
  await writeFile(path.join(ROOT, `no_food_${i}.png`), encodePNG(SIZE, SIZE, buf));
}

console.log("Generated release-candidate baby pixel-cat sprites in", ROOT);
