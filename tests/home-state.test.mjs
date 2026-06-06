import test from "node:test";
import assert from "node:assert/strict";
import {
  applyChoiceAction,
  applyEvolutionAction,
  applyFormCycleAction,
  applyMilestoneUnlocks,
  applyPetCycleAction,
  createHomeView,
  ensureCollectionForPet,
  getCollectionForPet
} from "../device-app/core/home-state.js";

test("ensureCollectionForPet creates a baby collection for a new pet", () => {
  const collections = ensureCollectionForPet([], "pixel-cat");

  assert.deepEqual(collections, [{
    petId: "pixel-cat",
    unlockedFormIds: ["baby"],
    rareProgress: 0,
    secretTriggerFlags: 0
  }]);
});

test("applyEvolutionAction upgrades a ready baby to teen and unlocks teen", () => {
  const result = applyEvolutionAction({
    profile: { selectedPetId: "pixel-cat", selectedFormId: "baby", experience: 220 },
    collections: [],
    dailyActivity: []
  });

  assert.equal(result.profile.selectedFormId, "teen");
  assert.equal(getCollectionForPet(result.collections, "pixel-cat").unlockedFormIds.includes("teen"), true);
  assert.equal(result.message, "Evolved to TEEN");
});

test("applyEvolutionAction offers a mature branch choice when scores are close", () => {
  const result = applyEvolutionAction({
    profile: { selectedPetId: "pixel-cat", selectedFormId: "teen", experience: 620 },
    collections: [],
    dailyActivity: [],
    scoreOverride: { active: 78, steady: 70, explorer: 20 }
  });

  assert.equal(result.profile.selectedFormId, "teen");
  assert.deepEqual(result.profile.pendingEvolutionChoices, ["active", "steady"]);
  assert.equal(result.message, "Choose ACTIVE or STEADY");
});

test("applyChoiceAction resolves a pending mature branch choice", () => {
  const result = applyChoiceAction({
    profile: {
      selectedPetId: "pixel-cat",
      selectedFormId: "teen",
      pendingEvolutionChoices: ["active", "steady"]
    },
    collections: []
  }, "steady");

  assert.equal(result.profile.selectedFormId, "steady");
  assert.equal(result.profile.pendingEvolutionChoices, undefined);
  assert.equal(getCollectionForPet(result.collections, "pixel-cat").unlockedFormIds.includes("steady"), true);
  assert.equal(result.message, "Evolved to STEADY");
});

test("applyFormCycleAction switches only through unlocked forms", () => {
  const result = applyFormCycleAction({
    profile: { selectedPetId: "pixel-cat", selectedFormId: "baby" },
    collections: [{
      petId: "pixel-cat",
      unlockedFormIds: ["baby", "teen", "active"],
      rareProgress: 0,
      secretTriggerFlags: 0
    }]
  });

  assert.equal(result.profile.selectedFormId, "teen");
  assert.equal(result.message, "Form TEEN");
});

test("applyMilestoneUnlocks unlocks rare from explicit progress", () => {
  const result = applyMilestoneUnlocks({
    profile: { selectedPetId: "pixel-cat", selectedFormId: "active", experience: 820, affinity: 20 },
    collections: []
  });

  const collection = getCollectionForPet(result.collections, "pixel-cat");
  assert.equal(collection.rareProgress, 100);
  assert.equal(collection.unlockedFormIds.includes("rare"), true);
  assert.equal(result.message, "Rare form unlocked");
});

test("applyMilestoneUnlocks can deterministically unlock secret after hidden preconditions", () => {
  const result = applyMilestoneUnlocks({
    profile: { selectedPetId: "pixel-cat", selectedFormId: "rare", experience: 1000, affinity: 160 },
    collections: [{
      petId: "pixel-cat",
      unlockedFormIds: ["baby", "teen", "active", "rare"],
      rareProgress: 100,
      secretTriggerFlags: 0
    }]
  }, 0.01);

  const collection = getCollectionForPet(result.collections, "pixel-cat");
  assert.equal(collection.unlockedFormIds.includes("secret"), true);
  assert.equal(result.message, "Secret form found");
});

test("applyPetCycleAction switches pet and ensures that pet has a collection", () => {
  const result = applyPetCycleAction({
    profile: { selectedPetId: "pixel-cat", selectedFormId: "active", foodBalance: 2 },
    collections: []
  });

  assert.equal(result.profile.selectedPetId, "pixel-dog");
  assert.equal(result.profile.selectedFormId, "baby");
  assert.deepEqual(getCollectionForPet(result.collections, "pixel-dog").unlockedFormIds, ["baby"]);
});

test("createHomeView exposes evolution and choice button labels", () => {
  const normal = createHomeView({
    profile: { selectedPetId: "pixel-cat", selectedFormId: "baby", experience: 120, affinity: 4, foodBalance: 1 },
    collections: []
  });
  const choice = createHomeView({
    profile: {
      selectedPetId: "pixel-cat",
      selectedFormId: "teen",
      experience: 620,
      affinity: 5,
      foodBalance: 0,
      pendingEvolutionChoices: ["active", "steady"]
    },
    collections: []
  });

  assert.equal(normal.formText, "BABY 60%");
  assert.deepEqual(normal.buttons.map((button) => button.label), ["FEED", "PET", "PLAY", "EVO", "FORM", "NEXT"]);
  assert.deepEqual(choice.buttons.map((button) => button.label), ["ACTIVE", "STEADY", "", "", "FORM", "NEXT"]);
});
