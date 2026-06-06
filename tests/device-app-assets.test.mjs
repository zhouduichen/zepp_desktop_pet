import test from "node:test";
import { access } from "node:fs/promises";
import path from "node:path";
import { PET_ROSTER } from "../device-app/core/pets.js";

const deviceTargets = ["gt.r", "gt.s"];
const requiredForms = ["baby", "teen", "active", "steady", "explorer", "rare", "secret"];
const requiredFrames = ["static.png", "feed_7.png", "tap_3.png", "happy_4.png", "no_food_3.png"];

test("device app target assets include visible pet frames for every starter pet", async () => {
  for (const target of deviceTargets) {
    for (const pet of PET_ROSTER) {
      await access(path.join("device-app", "assets", target, "pets", pet.id, "manifest.json"));
      for (const formId of requiredForms) {
        for (const frame of requiredFrames) {
          await access(path.join("device-app", "assets", target, "pets", pet.id, formId, frame));
        }
      }
    }
  }
});
