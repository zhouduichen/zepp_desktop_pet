import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";
import { validatePetPack } from "../core/pet-pack.js";

const rosterIds = ["pixel-cat", "pixel-dog", "pixel-bunny", "pixel-hamster", "pixel-fox"];
const requiredForms = ["baby", "teen", "active", "steady", "explorer", "rare", "secret"];
const expectedSize = 128;
const actions = {
  wake: 8,
  tap: 8,
  feed: 12,
  happy: 10,
  no_food: 8
};

async function readPng(filePath) {
  const buffer = await readFile(filePath);
  assert.deepEqual([...buffer.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);

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

function opaqueCount(image) {
  return image.pixels.filter((pixel) => pixel[3] > 0).length;
}

test("starter roster contains five valid complete-form pet packs", async () => {
  for (const petId of rosterIds) {
    const manifestPath = path.join("pet-packs", petId, "manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    assert.equal(manifest.id, petId);
    assert.deepEqual(validatePetPack(manifest), []);

    for (const formId of requiredForms) {
      const staticFrame = await readPng(path.join("pet-packs", petId, manifest.forms[formId].static));
      const aodFrame = await readPng(path.join("pet-packs", petId, manifest.forms[formId].aod));
      assert.equal(staticFrame.width, expectedSize, `${petId} ${formId} static width`);
      assert.equal(staticFrame.height, expectedSize, `${petId} ${formId} static height`);
      assert.equal(aodFrame.width, expectedSize, `${petId} ${formId} aod width`);
      assert.equal(aodFrame.height, expectedSize, `${petId} ${formId} aod height`);
      assert.ok(opaqueCount(aodFrame) < opaqueCount(staticFrame) * 0.4, `${petId} ${formId} AOD is too dense`);

      for (const [prefix, frameCount] of Object.entries(actions)) {
        for (let index = 0; index < frameCount; index += 1) {
          const frame = await readPng(path.join("pet-packs", petId, formId, `${prefix}_${index}.png`));
          assert.equal(frame.width, expectedSize, `${petId} ${formId} ${prefix}_${index} width`);
          assert.equal(frame.height, expectedSize, `${petId} ${formId} ${prefix}_${index} height`);
        }
      }
    }
  }
});

test("starter roster static sprites are visually distinct", async () => {
  const hashes = new Set();
  for (const petId of rosterIds) {
    const staticFrame = await readPng(path.join("pet-packs", petId, "baby", "static.png"));
    hashes.add(staticFrame.hash);
  }
  assert.equal(hashes.size, rosterIds.length);
});
