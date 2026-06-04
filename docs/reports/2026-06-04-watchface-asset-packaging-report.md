# Worker Report

## Status

`DONE_WITH_CONCERNS`

## Scope

Fix and verify Watch Face asset packaging for the Phase 0 spike.

## Summary

What changed:

- Added a deterministic test that checks Watch Face target names map to Zeus target-shape asset directories.
- Changed Watch Face targets from `gt.r` / `gt.s` to `gt-round` / `gt-square`.
- Changed `scripts/stage-watchface-assets.mjs` to stage generated mirrors into `watchface-spike/assets/gt-round.r/` and `watchface-spike/assets/gt-square.s/`.
- Removed the old generated `watchface-spike/assets/gt.r/` and `watchface-spike/assets/gt.s/` mirrors from git.
- Verified the built Watch Face `.zab` now contains `assets/pixel-cat/baby/*.png`.
- Updated status docs that still described the implementation as not started or zpm packaging as blocked.

## Files Changed

- `tests/watchface-assets.test.mjs`
- `scripts/stage-watchface-assets.mjs`
- `watchface-spike/app.json`
- `watchface-spike/assets/gt-round.r/**`
- `watchface-spike/assets/gt-square.s/**`
- `watchface-spike/assets/gt.r/**` (removed generated mirror)
- `watchface-spike/assets/gt.s/**` (removed generated mirror)
- `watchface-spike/README.md`
- `README.md`
- `docs/PROJECT_BOARD.md`

## Commands Run

```powershell
node --test tests\watchface-assets.test.mjs
npm.cmd run stage:watchface
git rm -r -- watchface-spike/assets/gt.r watchface-spike/assets/gt.s
node --test tests\watchface-assets.test.mjs
npm.cmd test
npm.cmd run validate:pack
npm.cmd run measure:assets
$env:NODE_OPTIONS='--require D:\huami\desktop_pet\patch-zpm.cjs'; zeus.cmd build
tar -tf watchface-spike\dist\1099992-Pet_Universe_Face_Spike-0.0.1-20260604113217.zab
git diff --check
```

## Verification

Tests:

- `node --test tests\watchface-assets.test.mjs`: PASS, 1/1
- `npm.cmd test`: PASS, 15/15
- `npm.cmd run validate:pack`: PASS, `valid pet pack: pixel-cat`
- `npm.cmd run measure:assets`: PASS, 49 files / 9,819 bytes

Build or preview:

- `zeus.cmd build` from `watchface-spike/` returned exit code 0 with the Node v24 `patch-zpm.cjs` preload.
- Latest Watch Face package: `watchface-spike/dist/1099992-Pet_Universe_Face_Spike-0.0.1-20260604113217.zab`, 385,812 bytes.
- Package inspection found `assets/pixel-cat/manifest.json` and `assets/pixel-cat/baby/*.png` in the generated `device.zip`.

## Commits

- `1ff25de` fix: package watchface pet assets

## Risks And Follow-Up

- Zeus still logs `RESIZE Error: Input file contains unsupported image format` once per generated target, even though pet assets are packaged and converted. Investigate before store submission.
- Runtime behavior is still unverified on physical watches: STEP accuracy, one-shot wake animation, AOD branch, tap handling, and installation QR flow all remain hardware-gated.
- Watch Face / Device Mini Program state sharing remains undocumented and should default to the selected-pet watch-face variant fallback.
