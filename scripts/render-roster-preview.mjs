import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

const petIds = ["pixel-cat", "pixel-dog", "pixel-bunny", "pixel-hamster", "pixel-fox"];
const frameNames = ["static.png", "aod.png", "wake_3.png", "tap_2.png", "feed_5.png", "happy_3.png", "no_food_2.png"];
const root = path.resolve("pet-packs");
const out = path.resolve("docs/reports/starter-roster-preview.png");
const frameSize = 128;
const cellSize = 144;
const padding = 8;

async function readPng(petId, fileName) {
  const buffer = await readFile(path.join(root, petId, "baby", fileName));
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const idat = [];
  let offset = 8;

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IDAT") idat.push(data);
    if (type === "IEND") break;
    offset += length + 12;
  }

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const rgba = Buffer.alloc(width * height * 4);
  const stride = width * 4;
  for (let y = 0; y < height; y += 1) {
    raw.copy(rgba, y * stride, y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
  }

  return { width, height, rgba };
}

function blendPixel(canvas, width, x, y, source) {
  const alpha = source[3] / 255;
  const offset = (y * width + x) * 4;
  for (let channel = 0; channel < 3; channel += 1) {
    canvas[offset + channel] = Math.round(source[channel] * alpha + canvas[offset + channel] * (1 - alpha));
  }
  canvas[offset + 3] = 255;
}

function drawFrame(canvas, canvasWidth, image, x0, y0) {
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const sourceOffset = (y * image.width + x) * 4;
      const source = image.rgba.subarray(sourceOffset, sourceOffset + 4);
      if (source[3] === 0) continue;
      blendPixel(canvas, canvasWidth, x0 + x, y0 + y, source);
    }
  }
}

function chunk(type, data) {
  const name = Buffer.from(type);
  const body = Buffer.concat([name, data]);
  let crc = 0xffffffff;
  for (const byte of body) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  const trailer = Buffer.alloc(4);
  trailer.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([
    Buffer.from([
      (data.length >>> 24) & 255,
      (data.length >>> 16) & 255,
      (data.length >>> 8) & 255,
      data.length & 255
    ]),
    body,
    trailer
  ]);
}

function encodePng(width, height, rgba) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;

  const rows = [];
  for (let y = 0; y < height; y += 1) {
    const start = y * width * 4;
    rows.push(Buffer.concat([Buffer.from([0]), rgba.subarray(start, start + width * 4)]));
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", zlib.deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

const width = frameNames.length * cellSize + padding * 2;
const height = petIds.length * cellSize + padding * 2;
const canvas = Buffer.alloc(width * height * 4);

for (let offset = 0; offset < canvas.length; offset += 4) {
  canvas[offset] = 12;
  canvas[offset + 1] = 14;
  canvas[offset + 2] = 20;
  canvas[offset + 3] = 255;
}

for (let rowIndex = 0; rowIndex < petIds.length; rowIndex += 1) {
  for (let colIndex = 0; colIndex < frameNames.length; colIndex += 1) {
    const image = await readPng(petIds[rowIndex], frameNames[colIndex]);
    const x = padding + colIndex * cellSize + Math.floor((cellSize - frameSize) / 2);
    const y = padding + rowIndex * cellSize + Math.floor((cellSize - frameSize) / 2);
    drawFrame(canvas, width, image, x, y);
  }
}

await mkdir(path.dirname(out), { recursive: true });
await writeFile(out, encodePng(width, height, canvas));
console.log(`rendered starter roster preview: ${out}`);
