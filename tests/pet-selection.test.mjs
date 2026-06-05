import test from "node:test";
import assert from "node:assert/strict";
import { PET_ROSTER, applyPetSwitch, getNextPetId, getPetById } from "../device-app/core/pets.js";

test("PET_ROSTER exposes the starter animals in switch order", () => {
  assert.deepEqual(PET_ROSTER.map((pet) => pet.id), [
    "pixel-cat",
    "pixel-dog",
    "pixel-bunny",
    "pixel-hamster",
    "pixel-fox"
  ]);
});

test("getPetById falls back to pixel-cat for unknown ids", () => {
  assert.equal(getPetById("pixel-bunny").name, "Pixel Bunny");
  assert.equal(getPetById("missing").id, "pixel-cat");
});

test("getNextPetId cycles through the starter roster", () => {
  assert.equal(getNextPetId("pixel-cat"), "pixel-dog");
  assert.equal(getNextPetId("pixel-dog"), "pixel-bunny");
  assert.equal(getNextPetId("pixel-bunny"), "pixel-hamster");
  assert.equal(getNextPetId("pixel-hamster"), "pixel-fox");
  assert.equal(getNextPetId("pixel-fox"), "pixel-cat");
  assert.equal(getNextPetId("unknown"), "pixel-cat");
});

test("applyPetSwitch updates selectedPetId and resets to baby form", () => {
  const profile = {
    selectedPetId: "pixel-bunny",
    selectedFormId: "explorer",
    foodBalance: 3
  };

  assert.deepEqual(applyPetSwitch(profile, "pixel-hamster"), {
    selectedPetId: "pixel-hamster",
    selectedFormId: "baby",
    foodBalance: 3
  });
});
