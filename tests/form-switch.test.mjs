import test from "node:test";
import assert from "node:assert/strict";
import {
  applyFormSwitch,
  canSelectForm,
  getSelectableForms
} from "../core/form-switch.js";

const collection = {
  unlockedFormIds: ["baby", "teen", "active", "steady"]
};

test("canSelectForm returns true for unlocked forms", () => {
  assert.equal(canSelectForm(collection, "active"), true);
});

test("canSelectForm returns false for locked or invalid forms", () => {
  assert.equal(canSelectForm(collection, "explorer"), false);
  assert.equal(canSelectForm(collection, ""), false);
  assert.equal(canSelectForm(null, "baby"), false);
});

test("getSelectableForms returns unlocked forms as a copy", () => {
  const forms = getSelectableForms(collection);

  forms.push("explorer");

  assert.deepEqual(forms, ["baby", "teen", "active", "steady", "explorer"]);
  assert.deepEqual(collection.unlockedFormIds, ["baby", "teen", "active", "steady"]);
});

test("applyFormSwitch returns an updated profile for unlocked forms", () => {
  const profile = { selectedPetId: "pixel-cat", selectedFormId: "baby", foodBalance: 2 };

  assert.deepEqual(applyFormSwitch(profile, "active", collection), {
    selectedPetId: "pixel-cat",
    selectedFormId: "active",
    foodBalance: 2
  });
  assert.equal(profile.selectedFormId, "baby");
});

test("applyFormSwitch rejects locked forms", () => {
  const profile = { selectedPetId: "pixel-cat", selectedFormId: "baby" };

  assert.equal(applyFormSwitch(profile, "explorer", collection), null);
});
