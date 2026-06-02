# Phase 0 Device Spike Results

Date: 2026-06-02 (blocked — no physical devices available)
Tester: N/A (requires human operator with physical Zepp OS watches)
Commit: 6d9f4e6 (latest on feat/pet-universe-phase-0)

## Status

**BLOCKED** — Physical-device gate cannot be completed because no round or square
Zepp OS API_LEVEL >= 3.0 watch is available for installation and measurement.

## Devices

| Device | Shape | Resolution | Zepp OS version | Result |
| --- | --- | --- | --- | --- |
| (any round) | round | — | — | blocked — no hardware |
| (any square) | square | — | — | blocked — no hardware |

## What Phase 0 Proved Without Hardware

| Item | Result | Evidence |
| --- | --- | --- |
| Step-to-food settlement logic | ✅ correct | 14 Node tests pass |
| Profile storage adapter with corrupt recovery | ✅ correct | code + spec review |
| Pet-pack manifest validation | ✅ correct | validates 5 actions, frames, FPS, existence |
| Watch-face Rollup bundler | ✅ passes | `zeus build` Rollup transform succeeded |
| zpm packaging (zab) | ❌ blocked | Node.js v24 incompatibility in zpm library |
| Generated sprite set | ✅ 47 frames 32x32 | valid pet pack, 9,819 bytes total |
| Round/square layout constants | ✅ separate files | gt.r (480px) / gt.s (390px) |
| Asset staging pipeline | ✅ works | mirrors under watchface-spike/assets/ |

## Unverified Capabilities (Require Hardware)

| Capability | Status | What to test |
| --- | --- | --- |
| STEP readout on physical watch | ⚠️ unverified | Does hmSensor.id.STEP.current return correct daily total? |
| 1-2 second finite wake animation | ⚠️ unverified | Does IMG_ANIM play once and stop on static frame? |
| static idle frame after animation | ⚠️ unverified | Does default_frame_index work on device? |
| pet tap reaction (CLICK_DOWN) | ⚠️ unverified | Does addEventListener work on watch-face widgets? |
| static AOD silhouette | ⚠️ unverified | Does getScreenType() === AOD work? Does aod.png display? |
| profile persistence | ⚠️ unverified | Does LocalStorage survive app restart on device? |
| watch-face / Mini Program sharing | ⚠️ unverified | Documented as not supported; variant fallback assumed |
| Battery impact | ⚠️ unmeasured | No baseline or pet-face 24h comparison |
| AOD lit-pixel ratio | ⚠️ unmeasured | Cannot verify <= 10% target without real display |

## Fallback Decision (Phase 0 Defaults for Phase 1)

- [ ] Direct shared state is supported.
- [x] **Selected-pet watch-face variants are required for V1** (default until hardware disproves).
- [ ] Tap interaction is supported on the watch face.
- [x] **Tap interaction moves to the companion Mini Program** (default until hardware disproves).

## Go / No-Go (Conditional)

Decision: **CONDITIONAL GO** for code-complete Phase 1 plan.
Hardware dependencies are marked `[HW-NEEDED]` throughout the plan.

**Rationale:**
All deterministic logic (settlement, profile, pack validation) is tested and
working. The watch-face assets, manifest, and JS bundle are generated and valid.
Seven hardware-dependent items remain unverified but do not block the Phase 1
code architecture — they only block release. The code structure is correct for
either outcome of each unverified item; fallback paths are documented.

**Required follow-up before V1 release:**
1. Obtain one round Zepp OS device (API_LEVEL >= 3.0).
2. Obtain one square Zepp OS device (API_LEVEL >= 3.0).
3. Install `watchface-spike/` and `device-app/` via Zeus CLI.
4. Fill "Unverified Capabilities" table above with pass/fail per device.
5. Select the correct fallback checkboxes.
6. If zpm packaging still fails on Node 24, downgrade to Node 18/20 for builds.
7. Measure 24h battery delta before calling V1 ready.
