import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

const packRoot = path.resolve("pet-packs/pixel-cat/baby");
const expectedSize = 128;
const actions = {
  wake: 8,
  tap: 8,
  feed: 12,
  happy: 10,
  no_food: 8
};

async function readPng(relativePath) {
  const buffer = await readFile(path.join(packRoot, relativePath));
  assert.deepEqual([...buffer.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);

  let offset = 8;
  let width = 0;
  let height = 0;
  const idat = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      assert.equal(data[8], 8, "PNG bit depth must be 8");
      assert.equal(data[9], 6, "PNG color type must be RGBA");
    }
    if (type === "IDAT") idat.push(data);
    if (type === "IEND") break;
    offset += 12 + length;
  }

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const pixels = [];
  const stride = width * 4;
  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * (stride + 1);
    assert.equal(raw[rowOffset], 0, "asset PNGs must use unfiltered rows");
    for (let x = 0; x < width; x += 1) {
      const pixelOffset = rowOffset + 1 + x * 4;
      pixels.push([
        raw[pixelOffset],
        raw[pixelOffset + 1],
        raw[pixelOffset + 2],
        raw[pixelOffset + 3]
      ]);
    }
  }

  return { width, height, pixels, hash: buffer.toString("base64") };
}

function opaquePixels(image) {
  return image.pixels.filter((pixel) => pixel[3] > 0);
}

function colorSet(image) {
  return new Set(
    opaquePixels(image).map((pixel) => `${pixel[0]},${pixel[1]},${pixel[2]},${pixel[3]}`)
  );
}

test("pixel-cat static frame is a reviewed-size transparent pixel mascot", async () => {
  const image = await readPng("static.png");
  assert.equal(image.width, expectedSize);
  assert.equal(image.height, expectedSize);

  const topLeftAlpha = image.pixels[0][3];
  const topRightAlpha = image.pixels[expectedSize - 1][3];
  const bottomLeftAlpha = image.pixels[expectedSize * (expectedSize - 1)][3];
  const bottomRightAlpha = image.pixels.at(-1)[3];
  assert.deepEqual([topLeftAlpha, topRightAlpha, bottomLeftAlpha, bottomRightAlpha], [0, 0, 0, 0]);

  const opaqueCount = opaquePixels(image).length;
  assert.ok(opaqueCount > 3000, `static frame is too sparse: ${opaqueCount} opaque pixels`);
  assert.ok(opaqueCount < 9000, `static frame is too dense: ${opaqueCount} opaque pixels`);

  const colors = colorSet(image);
  assert.ok(colors.size >= 5, `static frame has too few colors: ${colors.size}`);
  assert.ok(colors.size <= 12, `static frame has too many colors: ${colors.size}`);
});

test("pixel-cat AOD frame is static and low-pixel", async () => {
  const staticImage = await readPng("static.png");
  const aodImage = await readPng("aod.png");

  assert.equal(aodImage.width, expectedSize);
  assert.equal(aodImage.height, expectedSize);
  assert.ok(opaquePixels(aodImage).length < opaquePixels(staticImage).length * 0.35);
  assert.ok(colorSet(aodImage).size <= 3);
});

test("pixel-cat action sequences have aligned dimensions and real motion", async () => {
  for (const [prefix, frameCount] of Object.entries(actions)) {
    const frames = [];
    for (let index = 0; index < frameCount; index += 1) {
      const frame = await readPng(`${prefix}_${index}.png`);
      assert.equal(frame.width, expectedSize, `${prefix}_${index}.png width`);
      assert.equal(frame.height, expectedSize, `${prefix}_${index}.png height`);
      frames.push(frame);
    }

    const uniqueFrames = new Set(frames.map((frame) => frame.hash));
    assert.ok(uniqueFrames.size >= 3, `${prefix} needs at least 3 distinct frames`);
  }
});
