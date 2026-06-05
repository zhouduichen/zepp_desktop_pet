# Sprite Generation Report

Date: 2026-06-05
Project: Zepp Pet Universe Phase 0
Task: Release-candidate baby pixel-cat sprite sequence

## Status

`DONE_WITH_CONCERNS`

The previous placeholder-style pixel-cat assets have been replaced with a more expressive
pixel mascot candidate. The new frames are generated from a deterministic 32 x 32
pixel-art grid and scaled to 128 x 128 PNG files with transparent backgrounds for clean
watch-face scaling. This revision specifically improves mascot readability with larger
eyes, stronger highlights, a rounder head, and a clearer curled-tail silhouette.

## Files

- Canonical source assets: `pet-packs/pixel-cat/baby/*.png`
- Watch-face generated mirrors:
  - `watchface-spike/assets/gt.r/pixel-cat/baby/*.png`
  - `watchface-spike/assets/gt.s/pixel-cat/baby/*.png`
- Generator entrypoint: `npm.cmd run generate:assets`
- Renderer: `scripts/create-wiring-pet-assets.mjs`
- Preview sheet: `docs/reports/pixel-cat-preview.png`
- Quality test: `tests/pet-asset-quality.test.mjs`

## Visual Constraints

| Constraint | Result |
| --- | --- |
| Apparent sprite complexity | 32 px source grid, scaled to 128 px PNG |
| Palette | Flat orange, cream, white, pink, outline, and AOD grays |
| Transparent background | Verified by transparent-corner asset test |
| Strong silhouette | Thick outline, visible ears, tail, body, paws, and face |
| No dense rendering | No gradients, text, logos, fur texture, or painterly shading |
| AOD recognizability | Separate low-pixel gray silhouette with ears, body, tail, and face marks |
| Frame variation | Each action sequence has at least three distinct frames |
| Expressive mascot face | Larger blue eyes and at least 64 highlight pixels in the 128 px static frame |
| Runtime constraints | 8-12 FPS manifest values and 8-20 frames per action retained |

## Animations Produced

| Sequence | Frames | FPS | Motion |
| --- | ---: | ---: | --- |
| `static.png` | 1 | n/a | Calm orange cat idle frame |
| `aod.png` | 1 | n/a | Static low-pixel silhouette |
| `wake_0..7` | 8 | 8 | Eyes open, tiny stretch, return to calm |
| `tap_0..7` | 8 | 8 | Head tilt and small reaction |
| `feed_0..11` | 12 | 10 | Food dot approaches, bite, happy return |
| `happy_0..9` | 10 | 10 | Compact bounce and paw lift |
| `no_food_0..7` | 8 | 8 | Curious left/right head tilt |

## Asset Metrics

- Total files: 49
- Total size: 33,104 bytes
- Preview sheet: `docs/reports/pixel-cat-preview.png`

## Verification

Latest local verification:

```powershell
node scripts\create-wiring-pet-assets.mjs
node --test tests\pet-asset-quality.test.mjs
npm.cmd run generate:assets
npm.cmd run stage:watchface
npm.cmd run preview:assets
npm.cmd run measure:assets
npm.cmd test
npm.cmd run validate:pack
$env:PATH='C:\Users\33135\AppData\Roaming\npm;' + $env:PATH
$env:NODE_OPTIONS='--require D:\huami\desktop_pet\patch-zpm.cjs'
zeus.cmd build
```

Results:

- Full test suite: PASS, 20/20.
- Asset quality test: PASS, 4/4.
- Watch-face staging: PASS, staged for `gt.r` and `gt.s`.
- Asset measurement: PASS, 49 files / 33,104 bytes.
- Watch-face build: PASS, latest `.zab` size 1,019,686 bytes.

## Remaining Risks

- This is a deterministic local release candidate, not a human-reviewed final launch
  roster asset.
- Physical watch review is still required for wrist-distance readability, AOD lit-pixel
  behavior, animation smoothness, memory impact, and battery impact.
