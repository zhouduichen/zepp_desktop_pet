# Sprite Generation Report

**Date:** 2026-06-02
**Project:** Zepp Pet Universe — Phase 0
**Task:** Release-candidate baby pixel-cat sprite sequence

## Summary

Generated 48 real pixel-art 32x32 RGBA PNG frames plus `static.png` and `aod.png` for the Pixel Cat baby form. All files are stored under `pet-packs/pixel-cat/baby/`.

## Key Constraints Verified

| Constraint | Result |
|---|---|
| Apparent sprite complexity | 24-32 px (centered in 32x32 canvas) |
| Palette | 5 colors: orange (#ff8c00), dark orange (#cc6600), blush (#ffcc80), white, black |
| Transparent background | Every frame uses alpha channel with transparent padding |
| Consistent anchor/scale | Head radius 7x6, body at fixed offset; per-frame deltas only |
| No gradients/fur/text | Flat color fills with ellipse/triangle drawing only |
| AOD recognizability | Minimal gray silhouette with ear dots and eye dots |
| Same pixel dimensions | All frames are 32x32 RGBA |
| First/last clean transition | `static()` params match frame 0 and last frame of each sequence |
| `wake_0.png` = AOD-safe fallback | Shares exact pixel data with `aod.png` (same 152-byte file size) |

## Animations Produced

| Sequence | Frames | FPS | Motion description |
|---|---|---|---|
| `static.png` | 1 | — | Calm idle: round head, triangle ears, dot eyes, small body |
| `aod.png` | 1 | — | Gray silhouette, minimal eye dots for watch-face always-on-display |
| `wake_0..7` | 8 | 8 | Eyes closed→open (frames 0-2), tiny body stretch (3-5), return to calm (6-7) |
| `tap_0..7` | 8 | 8 | Head tilts right, ears and pupils shift, returns to center |
| `feed_0..11` | 12 | 10 | Head lowers toward food (0-3), bite with slight stretch (4-7), raises back (8-11) |
| `happy_0..9` | 10 | 10 | Squash (compress) then stretch (bounce up) in a compact bounce cycle |
| `no_food_0..7` | 8 | 8 | Curious head tilt left→right→center, pupils track tilt direction |

## Generation Approach

The generation script `scripts/generate-release-sprites.mjs` uses raw Node.js PNG encoding (zlib for IDAT compression, manual CRC, no external dependencies). Each frame is built from composited primitives:

1. **Layer 1 - Body:** Ellipse at bottom-center (y=23, rx=6, ry=4) in dark orange with orange fill
2. **Layer 2 - Ears:** Two triangles above the head, drawn with outline+inner fill
3. **Layer 3 - Head:** Ellipse at center (y=11, rx=7, ry=6) with outline
4. **Details:** Cheek blush, eyes (white 2x1 + black 1x1 pupil), nose, mouth

Per-frame parameters (eyeOpen, hx/hy offset, squash, pxOff pupil offset, earDx tilt) vary each frame to create readable animation at watch scale.

## Asset Metrics

- **Total files:** 49 (48 sprites + manifest.json)
- **Total size:** 9,824 bytes (~9.6 KB)
- **Average frame size:** ~190 bytes
- **Smallest:** `aod.png` / `wake_0.png` (152 bytes)
- **Largest:** `wake_4.png` (208 bytes)

## Validation Pipeline

All steps passed:

1. `node scripts/generate-release-sprites.mjs` — generated 48 frames
2. `node scripts/validate-pet-pack.mjs pet-packs/pixel-cat/manifest.json` — valid pet pack
3. `node scripts/stage-watchface-assets.mjs pet-packs/pixel-cat watchface-spike/assets` — staged to `gt.r` and `gt.s`
4. `node --test tests/*.test.mjs` — all 5 tests pass
5. Visual pixel inspection confirmed cat shape, correct colors, and frame variation
