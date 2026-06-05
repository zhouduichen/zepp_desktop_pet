import test from "node:test";
import assert from "node:assert/strict";
import {
  getEvolutionStatus,
  progressEvolution,
  resolveMatureChoice
} from "../core/evolution.js";
import { createEmptyCollection, isFormUnlocked } from "../core/collection.js";

const activeActivity = [
  { settledSteps: 40000 },
  { settledSteps: 30000 },
  { settledSteps: 0 },
  { settledSteps: 0 },
  { settledSteps: 0 },
  { settledSteps: 0 },
  { settledSteps: 0 }
];

test("getEvolutionStatus reports baby progress before the teen threshold", () => {
  assert.deepEqual(getEvolutionStatus({ selectedFormId: "baby", experience: 120 }), {
    currentFormId: "baby",
    nextFormId: "teen",
    ready: false,
    progress: 60,
    tiebreaker: false,
    closeBranches: []
  });
});

test("progressEvolution evolves baby to teen and permanently unlocks teen", () => {
  const collection = createEmptyCollection("pixel-cat");
  const result = progressEvolution(
    { selectedPetId: "pixel-cat", selectedFormId: "baby", experience: 220 },
    collection,
    []
  );

  assert.equal(result.profile.selectedFormId, "teen");
  assert.equal(isFormUnlocked(result.collection, "teen"), true);
  assert.equal(result.event, "evolved");
  assert.equal(result.targetFormId, "teen");
});

test("progressEvolution evolves teen to the computed mature branch", () => {
  const collection = createEmptyCollection("pixel-cat");
  const result = progressEvolution(
    { selectedPetId: "pixel-cat", selectedFormId: "teen", experience: 620 },
    collection,
    activeActivity
  );

  assert.equal(result.profile.selectedFormId, "active");
  assert.equal(isFormUnlocked(result.collection, "active"), true);
  assert.equal(result.event, "evolved");
});

test("progressEvolution returns a choice event when mature scores are close", () => {
  const collection = createEmptyCollection("pixel-cat");
  const result = progressEvolution(
    { selectedPetId: "pixel-cat", selectedFormId: "teen", experience: 620 },
    collection,
    [],
    { active: 78, steady: 70, explorer: 30 }
  );

  assert.equal(result.profile.selectedFormId, "teen");
  assert.equal(result.event, "choice");
  assert.deepEqual(result.closeBranches, ["active", "steady"]);
});

test("resolveMatureChoice applies one of the offered branches", () => {
  const collection = createEmptyCollection("pixel-cat");
  const result = resolveMatureChoice(
    { selectedPetId: "pixel-cat", selectedFormId: "teen", pendingEvolutionChoices: ["active", "steady"] },
    collection,
    "steady"
  );

  assert.equal(result.profile.selectedFormId, "steady");
  assert.equal(result.profile.pendingEvolutionChoices, undefined);
  assert.equal(isFormUnlocked(result.collection, "steady"), true);
});

test("resolveMatureChoice rejects a branch outside pending choices", () => {
  const collection = createEmptyCollection("pixel-cat");
  const profile = {
    selectedPetId: "pixel-cat",
    selectedFormId: "teen",
    pendingEvolutionChoices: ["active", "steady"]
  };

  const result = resolveMatureChoice(profile, collection, "explorer");

  assert.equal(result.profile, profile);
  assert.equal(result.event, "invalid-choice");
});
