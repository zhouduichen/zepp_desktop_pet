import test from "node:test";
import assert from "node:assert/strict";
import { validatePetPack } from "../core/pet-pack.js";

const validPack = {
  schemaVersion: 1,
  id: "pixel-cat",
  name: "Pixel Cat",
  author: "Zepp Pet Universe",
  version: "0.0.1",
  minimumApiLevel: "3.0",
  screenShapes: ["r", "s"],
  forms: {
    baby: {
      static: "baby/static.png",
      aod: "baby/aod.png",
      actions: {
        wakeIdle: { prefix: "baby/wake_", frames: 8, fps: 8 },
        tapReact: { prefix: "baby/tap_", frames: 8, fps: 8 },
        feed: { prefix: "baby/feed_", frames: 12, fps: 10 },
        happy: { prefix: "baby/happy_", frames: 10, fps: 10 },
        noFood: { prefix: "baby/no_food_", frames: 8, fps: 8 }
      }
    }
  }
};

test("validatePetPack accepts the phase 0 representative pack", () => {
  assert.deepEqual(validatePetPack(validPack), []);
});

test("validatePetPack rejects missing required actions", () => {
  const broken = structuredClone(validPack);
  delete broken.forms.baby.actions.feed;
  assert.deepEqual(validatePetPack(broken), ["forms.baby.actions.feed is required"]);
});

test("validatePetPack rejects missing static and aod", () => {
  const broken = structuredClone(validPack);
  delete broken.forms.baby.static;
  delete broken.forms.baby.aod;
  const errors = validatePetPack(broken);
  assert.ok(errors.includes("forms.baby.static is required"));
  assert.ok(errors.includes("forms.baby.aod is required"));
});

test("validatePetPack rejects missing action prefix", () => {
  const broken = structuredClone(validPack);
  delete broken.forms.baby.actions.wakeIdle.prefix;
  assert.deepEqual(validatePetPack(broken), ["forms.baby.actions.wakeIdle.prefix is required"]);
});

test("validatePetPack rejects long or high-fps watch-face actions", () => {
  const broken = structuredClone(validPack);
  broken.forms.baby.actions.happy = { prefix: "baby/happy_", frames: 30, fps: 20 };
  assert.deepEqual(validatePetPack(broken), [
    "forms.baby.actions.happy.frames must be between 8 and 20",
    "forms.baby.actions.happy.fps must be between 8 and 12"
  ]);
});
