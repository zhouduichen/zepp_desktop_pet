# Starter Roster Switch Test Report

Date: 2026-06-05
Status: done with product-art concerns

## Scope

This pass replaces the earlier rough placeholder animal set with a richer starter roster for pet switching tests.

Included pets:
- `pixel-cat`
- `pixel-dog`
- `pixel-bunny`
- `pixel-hamster`
- `pixel-fox`

Each pet pack includes:
- `baby/static.png`
- `baby/aod.png`
- `wake_0..7`
- `tap_0..7`
- `feed_0..11`
- `happy_0..9`
- `no_food_0..7`
- `manifest.json`

The assets are generated from `scripts/generate-starter-roster-assets.mjs` using a 64 px source grid scaled to 128 px output PNGs. The intent is to keep the watch runtime cheap: pre-rendered frames, no procedural drawing at runtime, no runtime sprite composition, and a sparse AOD silhouette.

## Product Note

These are starter test assets, not final launch art.

They are now recognizable enough to validate:
- pet selection state
- pack loading
- watchface asset staging
- AOD density checks
- action manifest consistency
- basic character differentiation

For overseas consumer launch, the next art pass should define a stronger commercial style guide: cleaner silhouettes, less generic face language, more personality per animal, and a stricter cuteness benchmark.

## App Behavior

The Mini Program home page now has a `NEXT PET` control for switching through the starter roster. The selected pet id is persisted in profile storage and resets to the default `baby` form.

Core roster logic lives in:
- `device-app/core/pets.js`

Home page wiring lives in:
- `device-app/page/home/home.js`
- `device-app/page/home/home.r.layout.js`
- `device-app/page/home/home.s.layout.js`

## Watchface Packaging

For switching verification, all 5 pet packs are staged into:
- `watchface-spike/assets/gt.r`
- `watchface-spike/assets/gt.s`

This is intentionally heavier than the final packaging model. The watchface spike package is useful for compatibility and asset validation, but final release should likely use one of these strategies:
- build per selected pet
- stage a smaller default subset
- verify cross-app state sharing and load only the selected pet

Current measured asset payload under `pet-packs`:
- file count: 245
- bytes: 206217

Latest local build outputs observed:
- `device-app/dist/1099991-Pet_Universe_Spike-0.0.1-20260605145633.zab` at 111718 bytes
- `watchface-spike/dist/1099992-Pet_Universe_Face_Spike-0.0.1-20260605145754.zab` at 5693198 bytes

The watchface build still logs the existing Zepp resize warning:
- `RESIZE Error: Input file contains unsupported image format`

The build continues and produces the `.zab` package. This should be tracked separately because it appears to be a toolchain conversion warning rather than a hard build failure.

## Preview

Generated preview:
- `docs/reports/starter-roster-preview.png`

Preview generation command:
- `npm run preview:roster`

## Verification

Commands run successfully during this pass:
- `npm run generate:assets`
- `npm run preview:roster`
- `npm run validate:roster`
- `npm test`
- `npm run stage:watchface`
- `npm run measure:assets`
- `git diff --check`
- `zeus.cmd build` in `device-app`
- `zeus.cmd build` in `watchface-spike`

Additional tests added:
- `tests/pet-selection.test.mjs`
- `tests/starter-roster-assets.test.mjs`

Existing watchface asset tests now validate all roster packs across both target staging folders.
