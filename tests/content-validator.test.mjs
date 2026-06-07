import test from "node:test";
import assert from "node:assert/strict";
import {
  validateSpriteDimensions,
  validateFrameCount,
  validateAodPixelRatio
} from "../core/content-validator.js";

test("validateSpriteDimensions passes for consistent frames", () => {
  const frames = [{ width: 32, height: 32 }, { width: 32, height: 32 }];
  assert.deepEqual(validateSpriteDimensions(frames, 32, 32), []);
});

test("validateSpriteDimensions rejects inconsistent dimensions", () => {
  const frames = [{ width: 32, height: 32 }, { width: 64, height: 32 }];
  const errors = validateSpriteDimensions(frames, 32, 32);
  assert.equal(errors.length, 1);
  assert.ok(errors[0].includes("width"));
});

test("validateFrameCount rejects mismatch", () => {
  const errors = validateFrameCount(8, 10, "test");
  assert.equal(errors.length, 1);
  assert.ok(errors[0].includes("test"));
  assert.ok(errors[0].includes("8"));
});

test("validateFrameCount passes for matching count", () => {
  assert.deepEqual(validateFrameCount(10, 10, "test"), []);
});

test("validateAodPixelRatio flags high pixel count", () => {
  const errors = validateAodPixelRatio(500, 32 * 32);
  assert.ok(errors.length > 0);
  assert.ok(errors[0].includes("AOD"));
});

test("validateAodPixelRatio passes for minimal pixels", () => {
  const errors = validateAodPixelRatio(30, 32 * 32);
  assert.deepEqual(errors, []);
});
