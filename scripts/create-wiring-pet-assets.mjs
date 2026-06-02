import { mkdir, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

const root = path.resolve("pet-packs/pixel-cat/baby");
const actions = { wake: 8, tap: 8, feed: 12, happy: 10, no_food: 8 };

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

function png(width, height, rgba) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  const rows = [];
  for (let y = 0; y < height; y += 1) rows.push(Buffer.concat([Buffer.from([0]), Buffer.from(rgba)]));
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", zlib.deflateSync(Buffer.concat(rows))),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

await mkdir(root, { recursive: true });
const solid = png(1, 1, [255, 207, 112, 255]);
await writeFile(path.join(root, "static.png"), solid);
await writeFile(path.join(root, "aod.png"), png(1, 1, [170, 170, 170, 255]));
for (const [prefix, count] of Object.entries(actions)) {
  for (let index = 0; index < count; index += 1) {
    await copyFile(path.join(root, "static.png"), path.join(root, `${prefix}_${index}.png`));
  }
}
await copyFile(path.join(root, "aod.png"), path.join(root, "wake_0.png"));
console.log("created wiring pixel-cat assets");
