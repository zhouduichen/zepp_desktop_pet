import test from "node:test";
import { access } from "node:fs/promises";
import path from "node:path";
import { PET_ROSTER } from "../device-app/core/pets.js";

const deviceTargets = ["gt.r", "gt.s"];
const requiredFrames = [
  "manifest.json",
  "baby/static.png",
  "baby/feed_7.png",
  "baby/tap_3.png",
  "baby/happy_4.png",
  "baby/no_food_3.png"
];

test("device app target assets include visible pet frames for every starter pet", async () => {
  for (const target of deviceTargets) {
    for (const pet of PET_ROSTER) {
      for (const frame of requiredFrames) {
        await access(path.join("device-app", "assets", target, "pets", pet.id, frame));
      }
    }
  }
});
