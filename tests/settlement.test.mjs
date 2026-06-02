import test from "node:test";
import assert from "node:assert/strict";
import { createDefaultProfile } from "../device-app/core/profile.js";
import { settleSteps } from "../device-app/core/settlement.js";

test("settleSteps grants one food per 1000 new steps", () => {
  const result = settleSteps(createDefaultProfile("20260602"), "20260602", 2450);
  assert.equal(result.earnedFood, 2);
  assert.equal(result.profile.foodBalance, 2);
  assert.equal(result.profile.lastSettledSteps, 2450);
});

test("settleSteps does not duplicate food on repeated settlement", () => {
  const once = settleSteps(createDefaultProfile("20260602"), "20260602", 2450).profile;
  const twice = settleSteps(once, "20260602", 2450);
  assert.equal(twice.earnedFood, 0);
  assert.equal(twice.profile.foodBalance, 2);
});

test("settleSteps keeps partial progress across incremental opens", () => {
  const at950 = settleSteps(createDefaultProfile("20260602"), "20260602", 950);
  const at1200 = settleSteps(at950.profile, "20260602", 1200);
  const at1950 = settleSteps(at1200.profile, "20260602", 1950);
  const at2000 = settleSteps(at1950.profile, "20260602", 2000);
  assert.deepEqual(
    [at950.earnedFood, at1200.earnedFood, at1950.earnedFood, at2000.earnedFood],
    [0, 1, 0, 1]
  );
});

test("settleSteps carries partial progress and caps daily food", () => {
  const profile = settleSteps(createDefaultProfile("20260602"), "20260602", 9500).profile;
  const result = settleSteps(profile, "20260602", 15800);
  assert.equal(result.earnedFood, 1);
  assert.equal(result.profile.foodBalance, 10);
  assert.equal(result.profile.dailyActivity.at(-1).earnedFood, 10);
});

test("settleSteps starts a new daily activity record after rollover", () => {
  const profile = settleSteps(createDefaultProfile("20260602"), "20260602", 2800).profile;
  const result = settleSteps(profile, "20260603", 1200);
  assert.equal(result.earnedFood, 1);
  assert.equal(result.profile.lastSettledSteps, 1200);
  assert.deepEqual(result.profile.dailyActivity, [
    { date: "20260602", settledSteps: 2800, earnedFood: 2 },
    { date: "20260603", settledSteps: 1200, earnedFood: 1 }
  ]);
});
