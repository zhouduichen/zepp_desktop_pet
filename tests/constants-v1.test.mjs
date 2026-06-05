import test from "node:test";
import assert from "node:assert/strict";
import {
  AFFINITY_PER_FEED,
  BABY_TO_TEEN_EXPERIENCE,
  CLOSE_SCORE_THRESHOLD,
  DAILY_FOOD_CAP,
  EXPERIENCE_PER_FEED,
  FOOD_PER_STEPS,
  HISTORY_DAYS,
  SCHEMA_VERSION_V1,
  SCORING_WINDOW_DAYS,
  TEEN_TO_MATURE_EXPERIENCE
} from "../device-app/core/constants.js";

test("V1 constants meet product requirements", () => {
  assert.equal(FOOD_PER_STEPS, 1000);
  assert.equal(DAILY_FOOD_CAP, 10);
  assert.equal(HISTORY_DAYS, 30);
  assert.equal(SCORING_WINDOW_DAYS, 7);
  assert.equal(EXPERIENCE_PER_FEED, 10);
  assert.equal(AFFINITY_PER_FEED, 5);
  assert.equal(BABY_TO_TEEN_EXPERIENCE, 200);
  assert.equal(TEEN_TO_MATURE_EXPERIENCE, 500);
  assert.equal(CLOSE_SCORE_THRESHOLD, 15);
  assert.equal(SCHEMA_VERSION_V1, 2);
});
