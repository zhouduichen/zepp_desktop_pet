import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

const forms = ["baby", "teen", "active", "steady", "explorer", "rare", "secret"];
const checkedPets = ["pixel-cat", "pixel-dog", "pixel-bunny", "pixel-hamster", "pixel-fox"];

async function readPngMask(relativePath) {
  const buffer = await readFile(path.resolve(relativePath));
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
    }
    if (type === "IDAT") idat.push(data);
    if (type === "IEND") break;
    offset += 12 + length;
  }

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const mask = new Set();
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let sumX = 0;
  let sumY = 0;
  let opaque = 0;

  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * (width * 4 + 1);
    assert.equal(raw[rowOffset], 0, `${relativePath} must use unfiltered PNG rows`);
    for (let x = 0; x < width; x += 1) {
      const alpha = raw[rowOffset + 1 + x * 4 + 3];
      if (alpha === 0) continue;
      mask.add(`${x},${y}`);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      sumX += x;
      sumY += y;
      opaque += 1;
    }
  }

  return {
    mask,
    opaque,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
    centerX: sumX / opaque,
    centerY: sumY / opaque
  };
}

function silhouetteDistance(a, b) {
  let intersection = 0;
  for (const pixel of a.mask) {
    if (b.mask.has(pixel)) intersection += 1;
  }
  const union = a.opaque + b.opaque - intersection;
  return 1 - intersection / union;
}

test("starter pet evolutions use visibly different silhouettes", async () => {
  for (const petId of checkedPets) {
    const metrics = Object.fromEntries(await Promise.all(forms.map(async (formId) => [
      formId,
      await readPngMask(path.join("pet-packs", petId, formId, "static.png"))
    ])));

    const pairThresholds = [
      ["baby", "teen", 0.14],
      ["teen", "active", 0.16],
      ["teen", "steady", 0.16],
      ["teen", "explorer", 0.16],
      ["active", "steady", 0.24],
      ["active", "explorer", 0.24],
      ["steady", "explorer", 0.22],
      ["active", "rare", 0.20],
      ["rare", "secret", 0.22]
    ];

    for (const [left, right, threshold] of pairThresholds) {
      const distance = silhouetteDistance(metrics[left], metrics[right]);
      assert.ok(
        distance >= threshold,
        `${petId} ${left}/${right} silhouettes are too similar: ${distance.toFixed(3)}`
      );
    }

    assert.ok(
      metrics.active.centerY < metrics.steady.centerY - 4,
      `${petId} active form should read as more lifted and energetic`
    );
    assert.ok(
      metrics.explorer.width > metrics.steady.width + 6,
      `${petId} explorer form should have a wider exploratory silhouette`
    );
  }
});
