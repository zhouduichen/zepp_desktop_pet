# Pet Universe Watch Face

A normal information face with a visible pixel pet companion:
- Time and date
- Today's steps
- Goal progress
- Food earned from steps
- Wake animation on raise-to-wake
- Pet pat reaction on tap (CLICK_DOWN)
- AOD silhouette

## Build

```powershell
cd watchface
zeus build
```

## Physical Device Installation

```powershell
zeus preview
```

Scan the QR code with the Zepp App in Developer Mode.

## Product Boundary

The watch face is a normal information face first. The only watch-face pet
interaction is tapping the pet area to play the finite pat animation. The
companion Mini Program owns lower-frequency management interactions: Feed,
Play, Evolution, Form, and Next Pet.

Since there is no documented shared storage API between watchface and Mini
Program runtimes, the watch face defaults to `pixel-cat`. Pet-specific
watchface variants can be created by replacing asset paths in `index.js`.

## Build Results (2026-06-06)

| Stage | Result |
|-------|--------|
| app.json schema validation | PASS |
| Rollup JS transform | PASS |
| zpm packaging | PASS |
| Round layout (480px) | PASS |
| Square layout (390px) | PASS |

Physical-device testing is still required for STEP refresh, IMG_ANIM
repeat_count, AOD detection, and CLICK_DOWN at runtime.

## Non-Goals

- No GPS, heart-rate, workout, or network APIs
- No background timers or infinite animation loops
- No runtime asset downloading
- No direct cross-runtime state sharing

## Official Documentation

- https://docs.zepp.com/docs/watchface/api/hmUI/widget/IMG_ANIM/
- https://docs.zepp.com/docs/watchface/api/hmSetting/getDeviceInfo/
- https://docs.zepp.com/docs/watchface/api/hmSetting/getScreenType/
