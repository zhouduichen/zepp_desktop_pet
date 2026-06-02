import test from "node:test";
import assert from "node:assert/strict";
import { toDateKey } from "../device-app/core/date-key.js";
import { createDefaultProfile, normalizeProfile } from "../device-app/core/profile.js";

test("toDateKey formats local calendar fields", () => {
  assert.equal(toDateKey(new Date(2026, 5, 2, 23, 59)), "20260602");
});

test("createDefaultProfile returns a compact valid profile", () => {
  assert.deepEqual(createDefaultProfile("20260602"), {
    schemaVersion: 1,
    selectedPetId: "pixel-cat",
    selectedFormId: "baby",
    foodBalance: 0,
    affinity: 0,
    experience: 0,
    lastSettlementDate: "20260602",
    lastSettledSteps: 0,
    dailyActivity: []
  });
});

test("normalizeProfile recovers invalid counters and keeps readable activity", () => {
  assert.deepEqual(
    normalizeProfile({
      selectedPetId: "",
      selectedFormId: "",
      foodBalance: -4,
      affinity: "8",
      experience: 12.8,
      lastSettlementDate: "bad",
      lastSettledSteps: -2,
      dailyActivity: [{ date: "20260601", settledSteps: 3000, earnedFood: 3 }, { broken: true }]
    }, "20260602"),
    {
      schemaVersion: 1,
      selectedPetId: "pixel-cat",
      selectedFormId: "baby",
      foodBalance: 0,
      affinity: 8,
      experience: 12,
      lastSettlementDate: "20260602",
      lastSettledSteps: 0,
      dailyActivity: [{ date: "20260601", settledSteps: 3000, earnedFood: 3 }]
    }
  );
});
