import test from "node:test";
import assert from "node:assert/strict";
import { PET_ROSTER, applyPetSwitch, getNextPetId, getPetById } from "../device-app/core/pets.js";

test("PET_ROSTER exposes the starter animals in switch order", () => {
  assert.deepEqual(PET_ROSTER.map((pet) => pet.id), [
    "pixel-cat",
    "pixel-dragon",
    "pixel-fox",
    "pixel-hamster",
    "pixel-owl",
    "pixel-penguin",
    "pixel-rabbit",
    "pixel-shiba"
  ]);
});

test("getPetById falls back to pixel-cat for unknown ids", () => {
  assert.equal(getPetById("pixel-cat").name, "Pixel Cat");
  assert.equal(getPetById("missing").id, "pixel-cat");
});

test("getNextPetId cycles through the starter roster", () => {
  assert.equal(getNextPetId("pixel-cat"), "pixel-dragon");
  assert.equal(getNextPetId("pixel-dragon"), "pixel-fox");
  assert.equal(getNextPetId("pixel-fox"), "pixel-hamster");
  assert.equal(getNextPetId("pixel-hamster"), "pixel-owl");
  assert.equal(getNextPetId("pixel-owl"), "pixel-penguin");
  assert.equal(getNextPetId("pixel-penguin"), "pixel-rabbit");
  assert.equal(getNextPetId("pixel-rabbit"), "pixel-shiba");
  assert.equal(getNextPetId("pixel-shiba"), "pixel-cat");
  assert.equal(getNextPetId("unknown"), "pixel-cat");
});

test("applyPetSwitch updates selectedPetId and resets to baby form", () => {
  const profile = {
    selectedPetId: "pixel-cat",
    selectedFormId: "explorer",
    foodBalance: 3
  };

  assert.deepEqual(applyPetSwitch(profile, "pixel-dragon"), {
    selectedPetId: "pixel-dragon",
    selectedFormId: "baby",
    foodBalance: 3
  });
});
