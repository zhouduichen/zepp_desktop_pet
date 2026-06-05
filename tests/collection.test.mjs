import test from "node:test";
import assert from "node:assert/strict";
import {
  checkRareUnlock,
  checkSecretTrigger,
  createEmptyCollection,
  getCollectionStats,
  getUnlockedForms,
  isFormUnlocked,
  unlockForm,
  updateRareProgress
} from "../core/collection.js";

test("createEmptyCollection returns a valid initial collection entry", () => {
  assert.deepEqual(createEmptyCollection("pixel-cat"), {
    petId: "pixel-cat",
    unlockedFormIds: ["baby"],
    rareProgress: 0,
    secretTriggerFlags: 0
  });
});

test("unlockForm adds a form id and is idempotent", () => {
  const collection = createEmptyCollection("pixel-cat");

  unlockForm(collection, "teen");
  unlockForm(collection, "teen");

  assert.equal(isFormUnlocked(collection, "teen"), true);
  assert.deepEqual(getUnlockedForms(collection), ["baby", "teen"]);
});

test("unlockForm ignores invalid form ids", () => {
  const collection = createEmptyCollection("pixel-cat");

  unlockForm(collection, "");
  unlockForm(collection, null);

  assert.deepEqual(getUnlockedForms(collection), ["baby"]);
});

test("updateRareProgress accumulates non-negative integer progress", () => {
  const collection = createEmptyCollection("pixel-cat");

  updateRareProgress(collection, 50.8);
  updateRareProgress(collection, -20);
  updateRareProgress(collection, "25");

  assert.equal(collection.rareProgress, 75);
});

test("checkRareUnlock unlocks the target form when threshold is met", () => {
  const collection = createEmptyCollection("pixel-cat");
  updateRareProgress(collection, 100);

  assert.equal(checkRareUnlock(collection, "rare", 100), true);
  assert.equal(isFormUnlocked(collection, "rare"), true);
});

test("checkRareUnlock does not unlock before threshold", () => {
  const collection = createEmptyCollection("pixel-cat");
  updateRareProgress(collection, 99);

  assert.equal(checkRareUnlock(collection, "rare", 100), false);
  assert.equal(isFormUnlocked(collection, "rare"), false);
});

test("checkSecretTrigger can be deterministic for tests", () => {
  const collection = createEmptyCollection("pixel-cat");

  assert.equal(checkSecretTrigger(collection, "secret", 0.25, 0.2), true);
  assert.equal(isFormUnlocked(collection, "secret"), true);
  assert.equal(collection.secretTriggerFlags, 1);
});

test("checkSecretTrigger does not unlock when probability misses", () => {
  const collection = createEmptyCollection("pixel-cat");

  assert.equal(checkSecretTrigger(collection, "secret", 0.25, 0.8), false);
  assert.equal(isFormUnlocked(collection, "secret"), false);
  assert.equal(collection.secretTriggerFlags, 0);
});

test("getCollectionStats summarizes one or more collection entries", () => {
  const cat = createEmptyCollection("pixel-cat");
  unlockForm(cat, "teen");
  const dog = createEmptyCollection("pixel-dog");

  assert.deepEqual(getCollectionStats([cat, dog]), {
    petCount: 2,
    unlockedFormCount: 3
  });
  assert.deepEqual(getCollectionStats(cat), {
    petCount: 1,
    unlockedFormCount: 2
  });
});
