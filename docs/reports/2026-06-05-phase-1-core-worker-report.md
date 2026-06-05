# Worker Report

## Status

`DONE_WITH_CONCERNS`

## Scope

Assigned task IDs:

- Phase 1 simulator-safe deterministic core slice
- V1 constants
- Evolution scoring
- Collection unlock model
- Baby/Teen/Mature progression
- Form switch eligibility

Full Phase 1 product completion remains blocked by the P0-6 physical-watch gate.

## Summary

What changed:

- Added V1 product constants for seven-day scoring, feed rewards, evolution thresholds,
  close-score threshold, and schema version.
- Added deterministic active, steady, and explorer scoring over the latest seven activity
  days.
- Added collection state helpers for permanent form unlocks, Rare progress, Secret trigger
  testing, and collection stats.
- Added evolution progression from Baby to Teen and Teen to mature branch, including
  close-score user choice resolution.
- Added form-switch eligibility helpers so users can only select permanently unlocked
  forms.
- Mirrored deterministic core entry points into `device-app/core/` without assuming shared
  watch-face state.

## Files Changed

- `device-app/core/constants.js`
- `core/scoring.js`
- `device-app/core/scoring.js`
- `core/collection.js`
- `device-app/core/collection.js`
- `core/evolution.js`
- `device-app/core/evolution.js`
- `core/form-switch.js`
- `device-app/core/form-switch.js`
- `tests/constants-v1.test.mjs`
- `tests/scoring.test.mjs`
- `tests/collection.test.mjs`
- `tests/evolution.test.mjs`
- `tests/form-switch.test.mjs`

## Commands Run

```powershell
node --test tests\constants-v1.test.mjs
npm.cmd test
node --test tests\scoring.test.mjs
npm.cmd test
node --test tests\collection.test.mjs
npm.cmd test
node --test tests\evolution.test.mjs
npm.cmd test
node --test tests\form-switch.test.mjs
npm.cmd test
git diff --check
git status --short
```

## Verification

Tests:

- `node --test tests\constants-v1.test.mjs`: PASS.
- `node --test tests\scoring.test.mjs`: PASS.
- `node --test tests\collection.test.mjs`: PASS.
- `node --test tests\evolution.test.mjs`: PASS.
- `node --test tests\form-switch.test.mjs`: PASS.
- Final `npm.cmd test`: PASS, 62 tests.
- `git diff --check`: PASS, with line-ending warnings for existing generated pet-pack
  manifest files.

Build or preview:

- Not run for this core-only batch.
- Device simulator and Zeus builds still need a separate UI integration batch.

## Commits

- `f24db20 feat: add V1 evolution and scoring constants`
- `624088c feat: implement evolution scoring fixtures`
- `d5a4a1d feat: add pet collection unlock model`
- `62d1f08 feat: add evolution progression core`
- `9f19472 feat: add form switch eligibility core`

## Risks And Follow-Up

- Device Mini Program UI is not yet wired to show evolution status, close-score choice,
  collection pages, or manual form switching.
- Rare and Secret have collection helpers only; final asset/UI/trigger policy still needs
  product wiring.
- Watch-face and Device Mini Program state sharing remains undocumented and unverified.
- Physical watch validation is still required for tap support, AOD behavior, memory,
  package size, and battery impact.
- Simulator-only evidence cannot satisfy release readiness.

## Blocker Evidence

Complete this section only when blocked:

- Observed behavior: Phase 1 planning is drafted, but the project board gates Phase 1 on
  P0-6 physical-watch results.
- Evidence: `docs/PROJECT_BOARD.md` lists `P1-P` as `drafted; blocked for execution` with
  dependency `P0-6 Go decision`; `AGENTS.md` requires reporting `BLOCKED` when a physical
  watch, QR scan, login, Zepp App interaction, or undocumented state sharing is required.
- Recommended next action: run the human P0-6 physical-watch gate, then wire these core
  modules into Device Mini Program UI and any watch-face fallback path that the gate
  permits.
