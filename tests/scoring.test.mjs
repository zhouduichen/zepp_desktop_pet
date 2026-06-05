import test from "node:test";
import assert from "node:assert/strict";
import { computeScores, pickMatureBranch } from "../core/scoring.js";

const HIGH_STEPS = [
  { date: "20260601", settledSteps: 12000, earnedFood: 10 },
  { date: "20260602", settledSteps: 8000, earnedFood: 8 },
  { date: "20260603", settledSteps: 15000, earnedFood: 10 },
  { date: "20260604", settledSteps: 10000, earnedFood: 10 },
  { date: "20260605", settledSteps: 9000, earnedFood: 9 },
  { date: "20260606", settledSteps: 11000, earnedFood: 10 },
  { date: "20260607", settledSteps: 13000, earnedFood: 10 }
];

const CONSISTENT_STEPS = [
  { date: "20260601", settledSteps: 5500, earnedFood: 5 },
  { date: "20260602", settledSteps: 6000, earnedFood: 6 },
  { date: "20260603", settledSteps: 5200, earnedFood: 5 },
  { date: "20260604", settledSteps: 5800, earnedFood: 5 },
  { date: "20260605", settledSteps: 6100, earnedFood: 6 },
  { date: "20260606", settledSteps: 5400, earnedFood: 5 },
  { date: "20260607", settledSteps: 5900, earnedFood: 5 }
];

const BROAD_EXPLORER_STEPS = [
  { date: "20260601", settledSteps: 3000, earnedFood: 3 },
  { date: "20260602", settledSteps: 12000, earnedFood: 10 },
  { date: "20260603", settledSteps: 2000, earnedFood: 2 },
  { date: "20260604", settledSteps: 4500, earnedFood: 4 },
  { date: "20260605", settledSteps: 8500, earnedFood: 8 },
  { date: "20260606", settledSteps: 1500, earnedFood: 1 },
  { date: "20260607", settledSteps: 14000, earnedFood: 10 }
];

test("computeScores returns active, steady, and explorer scores in range", () => {
  const scores = computeScores(HIGH_STEPS);

  assert.deepEqual(Object.keys(scores), ["active", "steady", "explorer"]);
  for (const score of Object.values(scores)) {
    assert.equal(typeof score, "number");
    assert.ok(score >= 0 && score <= 100);
  }
});

test("computeScores favors active for high total steps", () => {
  const scores = computeScores(HIGH_STEPS);

  assert.ok(scores.active > scores.steady);
  assert.ok(scores.active > scores.explorer);
});

test("computeScores favors steady for consistent moderate steps", () => {
  const scores = computeScores(CONSISTENT_STEPS);

  assert.ok(scores.steady > scores.active);
  assert.ok(scores.steady > scores.explorer);
});

test("computeScores favors explorer for broad varied activity", () => {
  const scores = computeScores(BROAD_EXPLORER_STEPS);

  assert.ok(scores.explorer > scores.steady);
});

test("computeScores handles empty and malformed activity gracefully", () => {
  assert.deepEqual(computeScores([]), { active: 0, steady: 0, explorer: 0 });
  assert.deepEqual(computeScores(null), { active: 0, steady: 0, explorer: 0 });

  const scores = computeScores([{ settledSteps: -5 }, { settledSteps: "2000" }]);
  assert.ok(scores.active >= 0);
});

test("computeScores only uses the latest seven activity days", () => {
  const olderHeavyDay = { date: "20260530", settledSteps: 50000, earnedFood: 10 };
  const latest = Array.from({ length: 7 }, (_, index) => ({
    date: `2026060${index + 1}`,
    settledSteps: 0,
    earnedFood: 0
  }));

  assert.deepEqual(computeScores([olderHeavyDay, ...latest]), {
    active: 0,
    steady: 0,
    explorer: 0
  });
});

test("pickMatureBranch returns the highest-scoring branch", () => {
  const result = pickMatureBranch({ active: 80, steady: 40, explorer: 30 });

  assert.equal(result.chosen, "active");
  assert.equal(result.tiebreaker, false);
  assert.deepEqual(result.closeBranches, ["active"]);
});

test("pickMatureBranch flags tiebreaker when scores are close", () => {
  const result = pickMatureBranch({ active: 78, steady: 70, explorer: 30 });

  assert.equal(result.chosen, "active");
  assert.equal(result.tiebreaker, true);
  assert.deepEqual(result.closeBranches, ["active", "steady"]);
});

test("pickMatureBranch handles missing scores with a steady fallback", () => {
  const result = pickMatureBranch({});

  assert.equal(result.chosen, "steady");
  assert.equal(result.tiebreaker, false);
  assert.deepEqual(result.closeBranches, ["steady"]);
});
