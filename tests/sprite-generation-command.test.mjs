import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

async function readPngSize(relativePath) {
  const buffer = await readFile(path.resolve(relativePath));
  assert.deepEqual([...buffer.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

test("release sprite packs have 128 px canonical frames", async () => {
  const staticFrame = await readPngSize("pet-packs/pixel-cat/baby/static.png");
  const aodFrame = await readPngSize("pet-packs/pixel-cat/baby/aod.png");

  assert.deepEqual(staticFrame, { width: 128, height: 128 });
  assert.deepEqual(aodFrame, { width: 128, height: 128 });
});
