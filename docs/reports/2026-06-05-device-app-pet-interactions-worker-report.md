# Device App Pet Interactions Worker Report

## Status

`DONE_WITH_CONCERNS`

## Scope

Assigned task IDs:

- Local follow-up: make the Device Mini Program simulator view show pet sprites and
  expose more than the single `NEXT PET` interaction.

## Summary

What changed:

- Root cause: `device-app/page/home/home.js` only created text widgets and only bound
  one click handler to `NEXT PET`; `device-app/assets/` did not contain the pet PNGs
  used by the starter roster.
- Added deterministic Mini Program interaction logic for `FEED`, `PET`, and `PLAY`.
- Added a `stage:device` asset mirror from canonical `pet-packs/` into
  `device-app/assets/gt.{r,s}/pets/`.
- Updated the home page to render the selected pet sprite and four tap controls:
  `FEED`, `PET`, `PLAY`, and `NEXT`.
- Kept the change inside the Phase 0 Mini Program surface: no new pages, no timers, no
  GPS, no heart-rate monitoring, no workout mode, and no cross-runtime storage
  assumption.

## Files Changed

- `device-app/core/interactions.js`
- `device-app/page/home/home.js`
- `device-app/page/home/home.r.layout.js`
- `device-app/page/home/home.s.layout.js`
- `device-app/assets/gt.r/pets/**`
- `device-app/assets/gt.s/pets/**`
- `scripts/stage-device-assets.mjs`
- `package.json`
- `tests/device-app-assets.test.mjs`
- `tests/pet-interactions.test.mjs`
- `docs/reports/2026-06-05-device-app-pet-interactions-worker-report.md`

## Commands Run

```powershell
node --test tests\pet-interactions.test.mjs
node --test tests\device-app-assets.test.mjs
npm.cmd run stage:device
node --test tests\pet-interactions.test.mjs
node --test tests\device-app-assets.test.mjs
npm.cmd test
npm.cmd run validate:pack
npm.cmd run validate:roster
npm.cmd run stage:device
npm.cmd run stage:watchface
npm.cmd run measure:assets
zeus.cmd build
zeus.cmd dev --help
```

## Verification

Tests:

- Initial red tests failed as expected:
  - `pet-interactions.test.mjs`: missing `device-app/core/interactions.js`.
  - `device-app-assets.test.mjs`: missing `device-app/assets/gt.r/pets/...`.
- `npm.cmd test`: PASS, 32 tests passing.
- `npm.cmd run validate:pack`: PASS, `valid pet pack: pixel-cat`.
- `npm.cmd run validate:roster`: PASS, 5 valid roster packs.
- `npm.cmd run stage:device`: PASS, staged 5 pet packs for `gt.r` and `gt.s`.
- `npm.cmd run stage:watchface`: PASS, staged 5 pet packs for `gt.r` and `gt.s`.
- `npm.cmd run measure:assets`: PASS, 245 files, 206,217 bytes under `pet-packs`.

Build or preview:

- `zeus.cmd build` from `device-app/`: PASS.
- Latest package: `device-app/dist/1099991-Pet_Universe_Spike-0.0.1-20260605220814.zab`,
  5,785,663 bytes.
- Build output converted 240 pet images per generated target.
- Package inspection confirmed `device.zip` contains `assets/pets/...` entries.

## Commits

- Pending in this worker pass.

## Risks And Follow-Up

- Manual simulator refresh is still required because `zeus dev` is a long-running
  watcher, not a one-shot update command.
- Physical-watch validation remains blocked by the project gate; simulator success
  still cannot prove device tap behavior, battery, AOD, or cross-runtime state sharing.
- Carrying all five starter pet packs inside the Device Mini Program increases the
  debug package size. This is acceptable for simulator validation but should be
  revisited for the final packaging model.
