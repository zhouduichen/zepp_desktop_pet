import test from "node:test";
import assert from "node:assert/strict";
import { REQUIRED_FORMS, validatePetPack } from "../core/pet-pack.js";

function formFixture(formId) {
  return {
    static: `${formId}/static.png`,
    aod: `${formId}/aod.png`,
    actions: {
      wakeIdle: { prefix: `${formId}/wake_`, frames: 8, fps: 8 },
      tapReact: { prefix: `${formId}/tap_`, frames: 8, fps: 8 },
      feed: { prefix: `${formId}/feed_`, frames: 12, fps: 10 },
      happy: { prefix: `${formId}/happy_`, frames: 10, fps: 10 },
      noFood: { prefix: `${formId}/no_food_`, frames: 8, fps: 8 }
    }
  };
}

function validPackFixture() {
  return {
    schemaVersion: 1,
    id: "pixel-cat",
    name: "Pixel Cat",
    author: "Zepp Pet Universe",
    version: "0.0.1",
    minimumApiLevel: "3.0",
    screenShapes: ["r", "s"],
    forms: Object.fromEntries(REQUIRED_FORMS.map((formId) => [formId, formFixture(formId)]))
  };
}

test("validatePetPack accepts a complete V1 pet pack", () => {
  assert.deepEqual(validatePetPack(validPackFixture()), []);
});

test("validatePetPack rejects missing V1 forms", () => {
  const broken = validPackFixture();
  delete broken.forms.rare;
  assert.deepEqual(validatePetPack(broken), ["forms.rare is required"]);
});

test("validatePetPack rejects missing required actions", () => {
  const broken = validPackFixture();
  delete broken.forms.baby.actions.feed;
  assert.deepEqual(validatePetPack(broken), ["forms.baby.actions.feed is required"]);
});

test("validatePetPack rejects missing static and aod", () => {
  const broken = validPackFixture();
  delete broken.forms.baby.static;
  delete broken.forms.baby.aod;
  const errors = validatePetPack(broken);
  assert.ok(errors.includes("forms.baby.static is required"));
  assert.ok(errors.includes("forms.baby.aod is required"));
});

test("validatePetPack rejects missing action prefix", () => {
  const broken = validPackFixture();
  delete broken.forms.baby.actions.wakeIdle.prefix;
  assert.deepEqual(validatePetPack(broken), ["forms.baby.actions.wakeIdle.prefix is required"]);
});

test("validatePetPack rejects long or high-fps watch-face actions", () => {
  const broken = validPackFixture();
  broken.forms.baby.actions.happy = { prefix: "baby/happy_", frames: 30, fps: 20 };
  assert.deepEqual(validatePetPack(broken), [
    "forms.baby.actions.happy.frames must be between 8 and 20",
    "forms.baby.actions.happy.fps must be between 8 and 12"
  ]);
});
