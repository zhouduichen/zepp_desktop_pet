# Watch-Face Spike

## Official Scaffold Sources

- https://docs.zepp.com/zh-cn/docs/watchface/watchface-quick-start/
- https://docs.zepp.com/zh-cn/docs/watchface/app-json/
- https://docs.zepp.com/zh-cn/docs/watchface/api/hmSensor/sensorId/STEP/
- https://docs.zepp.com/docs/watchface/api/hmUI/widget/IMG_ANIM/
- https://docs.zepp.com/docs/watchface/api/hmSetting/getDeviceInfo/
- https://docs.zepp.com/docs/watchface/api/hmSetting/getScreenType/

## Reconciliation With Official Documentation

The Phase 0 feasibility plan was checked against the official Zepp OS docs before
implementing this spike. The following discrepancies were corrected:

| Plan Draft | Official Value | Action |
| --- | --- | --- |
| `hmUI.event.CLICK_UP` | `hmUI.event.CLICK_DOWN` | Changed to CLICK_DOWN. CLICK_UP is not documented in watchface API. |

All other fields matched the official API documentation at commit time.

## Hypotheses

1. STEP exposes the current daily step total via `hmSensor.createSensor(hmSensor.id.STEP)`.
2. IMG_ANIM can play a finite wake animation with `repeat_count: 1` and stop on `default_frame_index: 0`.
3. The watch face can render a static low-pixel AOD frame via `hmSetting.getScreenType()` branching.
4. Pet tap reaction via `addEventListener(hmUI.event.CLICK_DOWN, ...)` is either supported or explicitly rejected by the runtime/build.
5. The supported persistence and cross-runtime state-sharing path is documented after physical-device testing.

## Non-Goals (watch-face runtime)

- No GPS, heart-rate, workout, or network APIs.
- No background timers or infinite animation loops.
- No runtime asset downloading.
- No direct cross-runtime state sharing (see fallback below).

## Fallback

If the watch face cannot persist or share the selected-pet profile with the companion
Mini Program, use separately packaged selected-pet watch-face variants for V1. The Mini
Program remains the collection manager.

If the build rejects the experimental `addEventListener` block, remove only that block,
record `pet tap reaction = unsupported by build` in the capability matrix below, and
rebuild. The prototype remains valid with interactions moved to the companion Mini
Program.

## Build Results

**Last updated:** 2026-06-04

| Stage | Result | Detail |
| --- | --- | --- |
| app.json schema validation | PASS | `permissions` field required by validator; added empty array. Observer pattern: schema after `permissions: []` no longer rejected the manifest. |
| app.js requirement | PASS | Build requires `app.js` in watchface project root (even for watchface type). Added lifecycle shell. |
| Rollup JS transform | PASS | Both `app.js` and `index.js` transformed without syntax or API errors. The `hmUI`, `hmSensor`, `hmSetting` globals and `CLICK_DOWN` event used in `index.js` validated by the bundler. |
| zpm package (dist/) | PASS | `NODE_OPTIONS=--require D:\huami\desktop_pet\patch-zpm.cjs` with `zeus.cmd build` on Node v24.15.0 produced `watchface-spike/dist/1099992-Pet_Universe_Face_Spike-0.0.1-20260604201005.zab` (384,572 bytes). |
| staged pet assets | PASS | The single `gt` target declares round (`r`) and square (`s`) platforms; generated mirrors live under `assets/gt.r/` and `assets/gt.s/`. The built package includes `assets/pixel-cat/baby/*.png`; PNG2TGA converted 48 files per build target. |
| resize warning | DONE_WITH_CONCERNS | Build still logs `RESIZE Error: Input file contains unsupported image format` once per generated target before converting pet assets. The package contains the pet assets, but the warning should be checked before store submission. |

**Conclusion:** Rollup compiled the watch-face JS successfully and Zeus produced a
`.zab` package with the pet assets included. The tap listener with `CLICK_DOWN` was
**not rejected by the build**. Physical-device testing is still required to confirm
whether `addEventListener(CLICK_DOWN, ...)`, `IMG_ANIM`, STEP, and AOD work at runtime.

## Verified Capability Matrix

(Last updated: 2026-06-04 after `zeus.cmd build` from `watchface-spike/`.)

| Capability | Result | Evidence |
| --- | --- | --- |
| STEP readout | supported (syntax verified) | `hmSensor.createSensor(hmSensor.id.STEP)` compiled by Rollup. |
| Finite wake animation | supported (syntax verified) | IMG_ANIM widget with `repeat_count: 1`, `display_on_restart`, `default_frame_index` compiled by Rollup. |
| Pet tap reaction | supported by build (not rejected) | `addEventListener(hmUI.event.CLICK_DOWN, ...)` compiled by Rollup without errors. Physical device test needed for runtime confirmation. |
| Static AOD frame | supported (syntax verified) | `hmSetting.getScreenType()` check with IMG widget compiled by Rollup. |
| State persistence | not verified | Watchface persistence APIs not documented. |
| Mini Program state sharing | not supported | No documented shared storage API between watchface and Mini Program runtimes. |

## Physical-Device Installation

To install on a physical watch, use the patched local build path:

```powershell
cd D:\huami\desktop_pet\watchface-spike
$env:NODE_OPTIONS='--require D:\huami\desktop_pet\patch-zpm.cjs'
zeus.cmd preview
```

If the tester uses Node v18 or v20, the patch may not be required. Physical-device
installation still requires Zeus login, QR scan, Zepp App Developer Mode, and a real
round/square watch.
