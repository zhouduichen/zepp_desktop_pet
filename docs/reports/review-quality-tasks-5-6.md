# Review Report

## Status

`APPROVED`

## Review Type

`code-quality`

## Commit Range

```text
589473f..4ece4a7
```

## Findings

Findings are listed in severity order with file and line references. No blocking issues were found.

### Minor: Redundant double-normalization of profile

**File:** `device-app/page/home/home.js` line 15, `device-app/core/settlement.js` line 6, `device-app/utils/storage.js` line 11

`loadProfile(today)` (storage.js:11) already calls `normalizeProfile` internally on the parsed JSON. The returned profile is then passed into `settleSteps(...)`, which calls `normalizeProfile` a second time (settlement.js:6). Since `normalizeProfile` is idempotent, this is not a bug, but it is redundant work on every `build()`. Consider removing the `normalizeProfile` call from `settleSteps` and documenting that callers must supply a normalized profile, or remove it from `loadProfile` and let `settleSteps` own the normalization.

### Minor: Misleading note when daily cap is already reached

**File:** `device-app/page/home/home.js` lines 22-27

When `result.earnedFood` is 0 because the user has already reached the daily food cap (DAILY_FOOD_CAP = 10) rather than because they walked fewer than 1000 steps, the note still reads "Walk 1,000 steps to earn food". This is misleading — the user may have already earned their full daily quota. This is a UX nuance, not a correctness bug.

## Verified Strengths

1. **Storage read is guarded.** `storage.js` wraps `JSON.parse(raw)` in a try/catch and falls back to `createDefaultProfile(today)` on failure. An empty-string return from `getItem` also returns a default profile. A corrupt stored value never propagates as a crash.

2. **Profile save is correct.** `storage.js` line 18 calls `localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))` — both `JSON.stringify` and `setItem` are used correctly with the right argument order.

3. **Step sensor is safely read.** `home.js` line 14 calls `step.getCurrent()`, floors with `Math.floor`, guards against null/undefined via `|| 0`, and clamps to zero with `Math.max(0, ...)`. No negative step counts can propagate.

4. **Settlement receives correct arguments.** `home.js` line 15 passes `(profile, today, currentSteps)` matching the `settleSteps(inputProfile, today, currentSteps)` signature in settlement.js.

5. **Profile update is persisted.** The result of `settleSteps` is destructured and `result.profile` is saved via `saveProfile` (home.js line 16).

6. **UI renders all required elements.** The `build()` function creates a background `FILL_RECT`, a `"PET UNIVERSE"` title, current steps counter, food balance display, and a conditional settlement note (home.js lines 18-27).

7. **No banned APIs or patterns are present.** There are no timers, infinite loops, GPS, heart-rate, or workout-related code anywhere in the device-app.

8. **Layout files use `px()` for scaling.** Every layout file (`common.r.layout.js`, `common.s.layout.js`, `home.r.layout.js`, `home.s.layout.js`) imports `px` from `@zos/utils` and wraps all dimension/position values with `px()`.

9. **Platform differentiation is correct.** `app.json` defines separate targets for `gt.r` (round, designWidth 480) and `gt.s` (square, designWidth 390), and the layout files supply matching coordinate sets via the `zosLoader:./...[pf].layout.js` dynamic-import pattern.

10. **Settlement logic prevents double-counting.** `settleSteps` correctly computes `earnedFood` as the delta between the newly entitled amount and any food already earned today for the same day, preventing duplicate rewards across repeated `build()` calls.

## Required Re-Review

- [ ] findings fixed
- [ ] same reviewer prompt re-run
- [x] status changed to `APPROVED`
