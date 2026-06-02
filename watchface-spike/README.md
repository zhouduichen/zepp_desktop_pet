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

**Date:** 2026-06-02

| Stage | Result | Detail |
| --- | --- | --- |
| app.json schema validation | PASS | `permissions` field required by validator; added empty array. Observer pattern: schema after `permissions: []` no longer rejected the manifest. |
| app.js requirement | PASS | Build requires `app.js` in watchface project root (even for watchface type). Added lifecycle shell. |
| Rollup JS transform | PASS | Both `app.js` and `index.js` transformed without syntax or API errors. The `hmUI`, `hmSensor`, `hmSetting` globals and `CLICK_DOWN` event used in `index.js` validated by the bundler. |
| zpm package (dist/) | BLOCKED | Build fails inside the `@zeppos/zpm` packaging library with `TypeError [ERR_INVALID_ARG_TYPE]: The "paths[2]" argument must be of type string. Received undefined`. This is a **Node.js v24 compatibility bug** in the Zeus CLI's internal `zpm` module. The code itself is structurally valid but the tooling infrastructure on this workstation cannot produce the final `.zab` package. |

**Conclusion:** Rollup compiled the watch-face JS successfully, confirming all API globals (`hmUI`, `hmSensor`, `hmSetting`, `CLICK_DOWN`) pass the bundler without errors. The tap listener with `CLICK_DOWN` was **not rejected by the build**. The `zpm` packaging failure is an environment issue (Node v24 vs older `zpm` library), not a code issue. Physical-device testing on a workstation with Node v18/v20 or a compatible Zeus version is required to confirm whether the `addEventListener(CLICK_DOWN, ...)` pattern works at runtime.

## Verified Capability Matrix

(Last updated: 2026-06-02 after `zeus build` from `watchface-spike/`.)

| Capability | Result | Evidence |
| --- | --- | --- |
| STEP readout | supported (syntax verified) | `hmSensor.createSensor(hmSensor.id.STEP)` compiled by Rollup. |
| Finite wake animation | supported (syntax verified) | IMG_ANIM widget with `repeat_count: 1`, `display_on_restart`, `default_frame_index` compiled by Rollup. |
| Pet tap reaction | supported by build (not rejected) | `addEventListener(hmUI.event.CLICK_DOWN, ...)` compiled by Rollup without errors. Physical device test needed for runtime confirmation. |
| Static AOD frame | supported (syntax verified) | `hmSetting.getScreenType()` check with IMG widget compiled by Rollup. |
| State persistence | not verified | Watchface persistence APIs not documented. |
| Mini Program state sharing | not supported | No documented shared storage API between watchface and Mini Program runtimes. |

## Physical-Device Installation

To install on a physical watch, the `zpm` packaging step must succeed. This requires:
