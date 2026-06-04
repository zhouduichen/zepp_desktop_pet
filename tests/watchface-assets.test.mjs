import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

test("watchface target assets match all app.json platforms", async () => {
  const appJson = JSON.parse(await readFile("watchface-spike/app.json", "utf8"));

  for (const [targetName, target] of Object.entries(appJson.targets)) {
    for (const platform of target.platforms) {
      const shape = platform.st;
      const assetRoot = path.join("watchface-spike", "assets", `${targetName}.${shape}`, "pixel-cat");
      await access(path.join(assetRoot, "manifest.json"));
      await access(path.join(assetRoot, "baby", "static.png"));
      await access(path.join(assetRoot, "baby", "aod.png"));
    }
  }
});
