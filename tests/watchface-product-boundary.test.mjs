import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("watch face is a normal information face with pet pat only", async () => {
  const source = await readFile("watchface-spike/index.js", "utf8");

  for (const managementLabel of ["NEXT PET", "FEED", "PLAY", "EVO", "FORM"]) {
    assert.equal(
      source.includes(managementLabel),
      false,
      `watch face must not expose Mini Program management label ${managementLabel}`
    );
  }

  assert.match(source, /stepSensor\.current/, "watch face should display current steps");
  assert.match(source, /formatTime/, "watch face should display normal time");
  assert.match(source, /formatDate/, "watch face should display date");
  assert.match(source, /foodFromSteps/, "watch face should derive lightweight food display from steps");
  assert.match(source, /anim_prefix:\s*"tap_"/, "pet tap should play the pat/tap animation");
  assert.match(source, /repeat_count:\s*1/, "watch face animations must remain finite");
});
