# Worker Report

## Status

`DONE_WITH_CONCERNS`

## Scope

Assigned task IDs:

- Complete local/simulator-safe product functionality without waiting for physical watch
  validation.
- Device Mini Program evolution UI integration.
- Complete-form pet assets for the starter roster.
- Rare and Secret unlock behavior.
- V1 local profile schema.
- Zeus build verification.

Physical watch, QR scan, Zepp App login, battery measurement, AOD runtime behavior, tap
runtime behavior, and watch-face / Mini Program state sharing remain unverified.

## Summary

What changed:

- Wired the Device Mini Program home screen to the deterministic evolution, collection,
  form-switch, and branch-choice core.
- Expanded the home screen from four controls to six stable controls:
  `FEED`, `PET`, `PLAY`, `EVO`, `FORM`, and `NEXT`.
- Added close-score branch choice on the same screen using temporary choice buttons such
  as `ACTIVE` and `STEADY`.
- Persisted collection state separately from profile state.
- Added Rare and Secret local unlock logic:
  - Rare unlocks from explicit experience progress.
  - Secret uses hidden preconditions plus a deterministic probability hook for tests.
- Upgraded profile schema output to V1 schema version `2` while preserving safe
  normalization.
- Removed cross-directory re-export usage from `device-app/core/` so Zeus can bundle the
  Mini Program from its own runtime tree.
- Expanded the starter roster asset generator and pet-pack contract to include:
  `baby`, `teen`, `active`, `steady`, `explorer`, `rare`, and `secret`.
- Changed Device Mini Program asset staging to copy only UI-required frames while keeping
  canonical pet packs and watch-face mirrors complete.

## Files Changed

- `core/pet-pack.js`
- `device-app/core/collection.js`
- `device-app/core/evolution.js`
- `device-app/core/form-switch.js`
- `device-app/core/home-state.js`
- `device-app/core/interactions.js`
- `device-app/core/profile.js`
- `device-app/core/scoring.js`
- `device-app/page/home/home.js`
- `device-app/page/home/home.r.layout.js`
- `device-app/page/home/home.s.layout.js`
- `device-app/utils/storage.js`
- `scripts/generate-starter-roster-assets.mjs`
- `scripts/stage-device-assets.mjs`
- `scripts/validate-pet-pack.mjs`
- `tests/device-app-assets.test.mjs`
- `tests/home-state.test.mjs`
- `tests/pet-interactions.test.mjs`
- `tests/pet-pack.test.mjs`
- `tests/profile.test.mjs`
- `tests/starter-roster-assets.test.mjs`
- `pet-packs/**`
- `device-app/assets/**`
- `watchface-spike/assets/**`

## Commands Run

```powershell
node --test tests\home-state.test.mjs
node --test tests\pet-pack.test.mjs
node --test tests\starter-roster-assets.test.mjs
node --test tests\device-app-assets.test.mjs
node --test tests\pet-interactions.test.mjs
node --test tests\profile.test.mjs
npm.cmd test
npm.cmd run generate:assets
npm.cmd run validate:pack
npm.cmd run validate:roster
npm.cmd run stage:device
npm.cmd run stage:watchface
npm.cmd run measure:assets
zeus.cmd build
git diff --check
```

## Verification

Tests:

- `npm.cmd test`: PASS, 72 tests.
- `node --test tests\home-state.test.mjs`: PASS.
- `node --test tests\starter-roster-assets.test.mjs`: PASS.
- `node --test tests\device-app-assets.test.mjs`: PASS.
- `npm.cmd run validate:pack`: PASS.
- `npm.cmd run validate:roster`: PASS, 5 packs.
- `npm.cmd run stage:device`: PASS.
- `npm.cmd run stage:watchface`: PASS.
- `npm.cmd run measure:assets`: PASS, 1,685 files, 1,462,676 bytes under
  `pet-packs`.
- `git diff --check`: PASS, with line-ending warnings only.

Build or preview:

- `zeus.cmd build` from `device-app/`: PASS.
- Output package:
  `device-app/dist/1099991-Pet_Universe_Spike-0.0.1-20260606125410.zab`
- Package bytes: `5,855,865`.

## Commits

- Pending at report creation time.

## Risks And Follow-Up

- Device simulator preview was not interacted with in this worker run; only Zeus build
  completed.
- Physical watch behavior remains unverified.
- Watch-face runtime still cannot honestly claim selected-pet/form state sharing with the
  Device Mini Program.
- The generated complete-form sprites are deterministic local product assets, but still
  need human visual review before commercial release.
- Device Mini Program uses a lightweight subset of frames to keep package buildable; the
  canonical pet packs and watch-face mirrors retain complete animation sequences.

## Blocker Evidence

Complete this section only when blocked:

- Observed behavior: physical validation is still required for release claims.
- Evidence: `docs/PROJECT_BOARD.md` lists P0-6 as human required; `AGENTS.md` requires
  stopping for physical watch, QR scan, login, Zepp App interaction, and undocumented
  state sharing.
- Recommended next action: run the human device gate after local simulator review.
