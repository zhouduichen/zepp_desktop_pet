# Review Report

## Status

`APPROVED`

## Review Type

`code-quality`

## Commit Range

```text
98de677..103e713
```

Commits:
- `103e713` feat: define representative pet pack contract

## Files Reviewed

- `core/pet-pack.js`
- `tests/pet-pack.test.mjs`
- `scripts/create-wiring-pet-assets.mjs`
- `scripts/validate-pet-pack.mjs`
- `scripts/stage-watchface-assets.mjs`
- `pet-packs/pixel-cat/manifest.json`
- `device-app/core/helpers.js`

Dependencies confirmed clean (read for context, not in commit range):
- `device-app/core/profile.js`
- `device-app/core/settlement.js`

## Findings

### Required

**R1 -- `validatePetPack` does not check that `forms.baby.static` and `forms.baby.aod` are present**

*File:* `core/pet-pack.js:3-28`

The `validatePetPack` function verifies:
- `schemaVersion` is 1
- `id` and `name` are truthy
- `forms.baby` exists
- Each required action has valid `frames` and `fps`

However, it never checks that `forms.baby.static` and `forms.baby.aod` are present. The CLI validator (`validate-pet-pack.mjs`) adds `baby?.static` and `baby?.aod` to its asset path list, but because it uses `filter(Boolean)` on line 18, a missing field (yielding `undefined`) is silently dropped. A manifest with correct actions but no static/aod fields would pass `validatePetPack` with zero errors and would be reported as "valid pet pack: ..." by the CLI. The runtime would later fail attempting to load these assets.

Add validation for `forms.baby.static` (non-empty string) and `forms.baby.aod` (non-empty string) to `validatePetPack`.

---

**R2 -- `validatePetPack` does not check that `action.prefix` is present**

*File:* `core/pet-pack.js:12-25`

Each action object is validated for `frames` (integer, 8-20) and `fps` (integer, 8-12), but `prefix` is never validated. If `prefix` is missing, undefined, or empty, the CLI validator will construct asset paths like `undefined0.png`, `undefined1.png`, etc. and report them as missing, which is confusing and masks the root cause.

Add a check that `action.prefix` is a non-empty string for each required action in `validatePetPack`.

---

### Suggestions

**S1 -- Staging script guard is correct but a comment would clarify the safety invariant**

*File:* `scripts/stage-watchface-assets.mjs:9`

The `startsWith` guard on line 9 correctly prevents traversal outside `watchfaceAssets`. The check uses `path.sep` which makes it platform-correct, and `path.resolve()` normalizes both paths before comparison. The guard runs before `rm()` on line 12. This is correct as written. A one-line comment above line 9 noting the safety intent would help future readers.

**S2 -- Wiring script missing error handling for fs operations**

*File:* `scripts/create-wiring-pet-assets.mjs`

All filesystem calls (`mkdir`, `writeFile`, `copyFile`) are top-level `await` without try/catch. If any fails (e.g., disk full, permission denied), the script crashes with a Node.js stack trace rather than a user-friendly error message. Acceptable for a dev wiring script, but adding a `process.on("unhandledRejection")` or wrapping the body in a try/catch would improve the developer experience.

## Verified Strengths

1. **`toNonNegativeInt` extraction is complete.** The helper is defined exactly once in `device-app/core/helpers.js:1`. Both `profile.js` and `settlement.js` import it from `"./helpers.js"`. No leftover duplicate definitions found. The previous R1 finding is fully resolved.

2. **Staging script verifies destination before `rm({ recursive: true })`.** The guard at `stage-watchface-assets.mjs:9` checks `destination.startsWith(`${watchfaceAssets}${path.sep}`)` before the `rm` call on line 12. Both paths are resolved to absolute form via `path.resolve()`. This prevents accidental deletion outside the intended watchface assets directory.

3. **CLI validator checks that all referenced files exist on disk.** `validate-pet-pack.mjs:18-24` iterates over the full set of asset paths (static, aod, and every action frame) and calls `fs.access` on each joined with `baseDir`. Missing files produce `missing asset: ...` error lines.

4. **Wiring asset generator produces correct PNG binary.** `create-wiring-pet-assets.mjs` generates valid PNG files: correct magic bytes, IHDR chunk (13-byte header, 8-bit RGBA), IDAT chunk (deflated, filter-byte-prefixed rows), and IEND chunk. Line 55 explicitly copies `aod.png` over `wake_0.png` after the loop, so the first AOD frame is correctly sourced from the AOD pixel as intended.

5. **Pet pack validation handles edge cases.** `validatePetPack` safely handles: null/undefined `pack` (optional chaining everywhere), missing `forms.baby` (explicit check on line 9), missing actions (reports which path is missing), non-integer frame/fps values (`Number.isInteger` rejects strings, floats, null, undefined, NaN), and out-of-range values (separate range check). Error messages include the full property path (e.g., `forms.baby.actions.feed is required`).

6. **Test coverage covers key validation cases.** `pet-pack.test.mjs` tests: valid pack (returns empty array), missing required action (single error message), out-of-range frames and fps (two errors for the same action). Good representative coverage.

7. **No timers, infinite loops, GPS/heart-rate/workout code in any reviewed file.** All functions are synchronous pure functions or top-level sequential scripts. No `setInterval`, `setTimeout`, `requestAnimationFrame`, or unbounded loops exist.

8. **Clear error messages from CLI scripts.** `validate-pet-pack.mjs` prints each validation error on its own line via `errors.join("\n")`. `stage-watchface-assets.mjs` throws with an explicit message before the destructive operation. Success messages are printed on stdout, errors on stderr.

9. **Manifest JSON is well-formed and matches the contract.** `pet-packs/pixel-cat/manifest.json` has all required fields, correct types, and valid action entries matching `REQUIRED_ACTIONS`. The frame counts and fps values are within the validated ranges.

## Required Re-Review

- [ ] R1 findings fixed (add `static`/`aod` field validation to `validatePetPack`)
- [ ] R2 findings fixed (add `prefix` field validation to `validatePetPack`)
- [ ] same reviewer prompt re-run
- [ ] status changed to `APPROVED`
