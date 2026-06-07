import test from "node:test";
import assert from "node:assert/strict";
import { t, setLanguage, SUPPORTED_LANGUAGES } from "../device-app/utils/i18n.js";

test("t returns English string by default", () => {
  assert.equal(t("app_name"), "Pet Universe");
});

test("t returns key when translation missing", () => {
  assert.equal(t("nonexistent_key"), "nonexistent_key");
});

test("t supports parameter interpolation", () => {
  assert.equal(t("choose_or", { branches: "ACTIVE or STEADY" }), "Choose ACTIVE or STEADY");
});

test("SUPPORTED_LANGUAGES includes en", () => {
  assert.ok(SUPPORTED_LANGUAGES.includes("en"));
});

test("setLanguage ignores unsupported languages", () => {
  setLanguage("fr");
  assert.equal(t("app_name"), "Pet Universe");
  setLanguage("en");
  assert.equal(t("app_name"), "Pet Universe");
});
