import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

const watchfacePetId = "pixel-cat";

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

test("watchface target assets contain only the lightweight current-pet face pack", async () => {
  const appJson = JSON.parse(await readFile("watchface-spike/app.json", "utf8"));

  for (const [targetName, target] of Object.entries(appJson.targets)) {
    for (const platform of target.platforms) {
      const shape = platform.st;
      const assetRoot = path.join("watchface-spike", "assets", `${targetName}.${shape}`, watchfacePetId);
      await access(path.join(assetRoot, "manifest.json"));
      await access(path.join(assetRoot, "baby", "static.png"));
      await access(path.join(assetRoot, "baby", "aod.png"));

      for (let index = 0; index < 8; index += 1) {
        await access(path.join(assetRoot, "baby", `wake_${index}.png`));
        await access(path.join(assetRoot, "baby", `tap_${index}.png`));
      }

      assert.equal(await exists(path.join(assetRoot, "teen", "static.png")), false);
      assert.equal(await exists(path.join(assetRoot, "baby", "feed_0.png")), false);
      assert.equal(await exists(path.join("watchface-spike", "assets", `${targetName}.${shape}`, "pixel-dragon")), false);
    }
  }
});
