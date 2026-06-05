# Pixel Cat Expressive Upgrade Report

Date: 2026-06-05

## Status

`DONE_WITH_CONCERNS`

## Summary

The prior release-candidate cat pack was technically valid but not expressive enough for
a pet product. This upgrade keeps the same lightweight 32 px source-grid approach while
making the mascot more readable and characterful:

- larger blue eyes with stronger wrist-distance highlights;
- rounder head and fuller cream muzzle;
- clearer curled tail in static, action, and AOD frames;
- retained transparent backgrounds and 128 x 128 exported PNGs;
- retained Phase 0 action counts and FPS values.

## Changed Files

- `pet-packs/pixel-cat/baby/*.png`
- `watchface-spike/assets/gt.r/pixel-cat/baby/*.png`
- `watchface-spike/assets/gt.s/pixel-cat/baby/*.png`
- `scripts/create-wiring-pet-assets.mjs`
- `scripts/generate-release-sprites.mjs`
- `scripts/render-sprite-preview.mjs`
- `tests/pet-asset-quality.test.mjs`
- `tests/sprite-generation-command.test.mjs`
- `docs/reports/pixel-cat-preview.png`

## Verification

```powershell
npm.cmd run generate:assets
npm.cmd run stage:watchface
npm.cmd run preview:assets
npm.cmd run measure:assets
npm.cmd test
npm.cmd run validate:pack
$env:PATH='C:\Users\33135\AppData\Roaming\npm;' + $env:PATH
$env:NODE_OPTIONS='--require D:\huami\desktop_pet\patch-zpm.cjs'
zeus.cmd build
git diff --check
```

Results:

- `npm.cmd test`: PASS, 20/20.
- `npm.cmd run validate:pack`: PASS, `valid pet pack: pixel-cat`.
- `npm.cmd run measure:assets`: PASS, 49 files / 33,104 bytes.
- Watch-face staged mirrors hash-match canonical `static.png` for `gt.r` and `gt.s`.
- Watch-face `zeus.cmd build`: PASS, latest package
  `watchface-spike/dist/1099992-Pet_Universe_Face_Spike-0.0.1-20260605133916.zab`
  (1,019,686 bytes).

## Preview

Open `docs/reports/pixel-cat-preview.png`.

## Remaining Risks

- Human visual approval is still required. The pack is more expressive, but taste remains
  a product decision.
- Zeus still prints the previously known `RESIZE Error: Input file contains unsupported
  image format` warning before successfully resizing/converting PNG assets.
- Physical watches are still required for wrist-distance readability, AOD behavior,
  one-shot wake animation, memory, and 24-hour battery impact.
