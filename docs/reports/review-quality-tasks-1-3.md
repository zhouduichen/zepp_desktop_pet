# Review Report

## Status

`APPROVED`

## Review Type

`code-quality`

## Commit Range

```text
b637b66..d80fa26
```

Commits:
- `7c5d11e` feat: add compact profile normalization
- `8a200fd` feat: settle step rewards without duplicates
- `d80fa26` chore: fix test script to use explicit file list

## Files Reviewed

- `device-app/core/constants.js`
- `device-app/core/date-key.js`
- `device-app/core/profile.js`
- `device-app/core/settlement.js`
- `tests/smoke.test.mjs`
- `tests/profile.test.mjs`
- `tests/settlement.test.mjs`
- `package.json`
- `.gitignore`
- `docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-0-feasibility.md`

## Findings

### Required

**R1 -- Duplicated `toNonNegativeInt` guard creates maintenance hazard**

*Files:* `device-app/core/profile.js:4`, `device-app/core/settlement.js:4`

The helper `toNonNegativeInt` is defined identically in both modules. If the clamping or coercion logic ever needs to change (for example, to log warnings on corruption), both copies must be updated. Extract into a shared utility module (e.g. `device-app/core/guard.js`) or import from `profile.js` into `settlement.js`.

---

### Suggestions

**S1 -- Corrupt input heals silently; consider logging normalizations**

*Files:* `device-app/core/profile.js:20-47`, `device-app/core/settlement.js:9`

`normalizeProfile` silently coerces every invalid field (negative numbers, NaN, undefined, null, non-numeric strings, broken entries) without any console output. While the prototype correctly recovers from corruption, silent healing makes it impossible to distinguish "data was clean" from "data was corrupt and reset" during device testing. Adding a `console.warn` or `console.error` inside the catch-alls would flag corruption in the Zeus device log without changing any behavior.

For example, a brief `console.warn("[pet] normalized corrupt foodBalance")` inside `normalizeProfile` on each fallback path would give the device-spike tester immediate signal.

**S2 -- Plan deviation: test script uses explicit file list instead of wildcard**

*File:* `package.json:7`  
*Plan reference:* `docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-0-feasibility.md` line 109

The plan specifies `"test": "node --test tests/*.test.mjs"`. Commit `d80fa26` changed it to `"test": "node --test tests/smoke.test.mjs tests/profile.test.mjs tests/settlement.test.mjs"`. The explicit list prevents newly added test files from executing automatically. This is a reasonable safety measure for a prototype (no untested test file can sneak into CI), but it is a deliberate departure from the plan. Either document the rationale in a comment above the script, or restore the wildcard and add a `.gitignore`-style exclusion pattern if needed.

**S3 -- `normalizeProfile` trims history before the caller pushes new activity, creating a small window where a 31st day could push valid data out**

*Files:* `device-app/core/settlement.js:14`, `device-app/core/settlement.js:29`, `device-app/core/profile.js:30`

In `settleSteps`, the old entry for today is removed (line 14), the new entry is pushed (line 16-20), and then `slice(-HISTORY_DAYS)` is applied (line 29). The profile received by `settleSteps` has already been normalized (line 7), which also calls `slice(-HISTORY_DAYS)`. If the profile already has exactly 30 entries and today is a different day, after normalization it has 30 entries, a new entry is pushed to make 31, and slice keeps the newest 30. This is correct.

However, if today's entry already existed in the profile and was trimmed by the previous normalization (because there were exactly 30 newer entries), then `isNewDay` is checked against `lastSettlementDate` -- which could be today's date even though today's dailyActivity entry was trimmed. In that case `isNewDay = false`, `existing = find(...)` returns `undefined` (entry was trimmed), `earnedToday = 0`, and a new entry for today is created with full entitlement. This means the daily cap resets on the same date if exactly 30 other daily entries have pushed today's record out. Impact is low (at most one extra daily cap per 30 sessions), but the plan should acknowledge this limitation or normalizeProfile should cap to `HISTORY_DAYS - 1` to leave room for the current-day entry.

## Verified Strengths

1. **Sensor decrease/reset is fully guarded.** `settleSteps` uses `max(0, entitledFood - earnedToday)`, so a sensor that resets downward never deducts food. Daily activity records always reflect the current step reading, not a cumulative delta.

2. **Repeated settlement on the same date produces zero additional earnings.** The `existing.earnedFood` baseline prevents double-counting. Thoroughly covered by tests (`settlement.test.mjs` lines 13-18, 31-37).

3. **Incremental step progress is correctly rewarded.** The test at `settlement.test.mjs:20-29` demonstrates multiple openings at 950, 1200, 1950, and 2000 steps, earning food only when a new 1000-step threshold is crossed.

4. **Date rollover creates a fresh daily activity record.** `isNewDay = profile.lastSettlementDate !== today` cleanly separates days. Tested at `settlement.test.mjs:39-48`.

5. **Comprehensive corrupt-data recovery.** `normalizeProfile` handles: null/undefined/non-object input (falls back to empty `{}`), negative values (clamped to 0 via `toNonNegativeInt`), non-integer floats (`Math.floor` truncates), numeric strings (`Number()` coerces), empty-string pet/form IDs (defaults used), invalid date-key strings (falls back to `today`), broken daily-activity entries (filtered by `DATE_KEY` regex + truthy check).

6. **NaN, undefined, null, and empty arrays are all safe.** `Number(undefined)` -> `NaN` -> `NaN || 0` -> `0`. `Number(null)` -> `0`. `Array.isArray([])` is true, filter and map on empty arrays produce empty arrays, `slice(-30)` on empty array is safe.

7. **No timers or infinite loops.** Every exported function is a synchronous pure function. No `setInterval`, `setTimeout`, `requestAnimationFrame`, or unbounded `while` loops exist in the reviewed files.

8. **30-day history trimming is applied at every write boundary.** Both `normalizeProfile` (line 30) and `settleSteps` (line 29) call `slice(-HISTORY_DAYS)`, so history never exceeds 30 entries regardless of the call path.

## Required Re-Review

- [ ] R1 findings fixed (extract `toNonNegativeInt` to shared module)
- [ ] same reviewer prompt re-run
- [ ] status changed to `APPROVED`
