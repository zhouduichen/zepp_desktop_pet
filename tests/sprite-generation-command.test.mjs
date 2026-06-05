import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);

async function readPngSize(relativePath) {
  const buffer = await readFile(path.resolve(relativePath));
  assert.deepEqual([...buffer.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

test("release sprite generator writes the canonical 128 px pixel-cat pack", async () => {
  await execFileAsync(process.execPath, ["scripts/generate-release-sprites.mjs"]);

  const staticFrame = await readPngSize("pet-packs/pixel-cat/baby/static.png");
  const aodFrame = await readPngSize("pet-packs/pixel-cat/baby/aod.png");

  assert.deepEqual(staticFrame, { width: 128, height: 128 });
  assert.deepEqual(aodFrame, { width: 128, height: 128 });
});
