import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

test("watchface target assets use Zeus target-shape directories", async () => {
  const appJson = JSON.parse(await readFile("watchface-spike/app.json", "utf8"));

  for (const [targetName, target] of Object.entries(appJson.targets)) {
    const shape = target.platforms?.[0]?.st;
    assert.ok(shape, `${targetName} must declare a screen shape`);
    assert.equal(targetName.includes("."), false, `${targetName} should not include the shape suffix`);

    const assetRoot = path.join("watchface-spike", "assets", `${targetName}.${shape}`, "pixel-cat");
    await access(path.join(assetRoot, "manifest.json"));
    await access(path.join(assetRoot, "baby", "static.png"));
    await access(path.join(assetRoot, "baby", "aod.png"));
  }
});
