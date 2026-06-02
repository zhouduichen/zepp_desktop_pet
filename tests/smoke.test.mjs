import test from "node:test";
import assert from "node:assert/strict";
import { FOOD_PER_STEPS, DAILY_FOOD_CAP, HISTORY_DAYS } from "../device-app/core/constants.js";

test("phase 0 constants keep the prototype lightweight", () => {
  assert.equal(FOOD_PER_STEPS, 1000);
  assert.equal(DAILY_FOOD_CAP, 10);
  assert.equal(HISTORY_DAYS, 30);
});
