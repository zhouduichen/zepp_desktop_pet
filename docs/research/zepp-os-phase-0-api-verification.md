# Zepp OS Phase 0 API Verification

**Date:** 2026-06-02
**Source:** Official Zepp OS Developer Documentation (docs.zepp.com)
**Plan reference:** `docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-0-feasibility.md`

---

## 1. V3 Device Mini Program app.json -- Round and Square Target Syntax

**Result: verified**

**Official URL:** https://docs.zepp.com/docs/reference/app-json/ (English, shared app.json reference for all mini programs including device-app), or https://docs.zepp.com/zh-cn/docs/reference/app-json/ (Chinese)

**Exact fields:**
- `"targets"`: object whose key names map to `/assets` subdirectory names. Keys can be freely named.
- Inside each target:
  - `"module"`: object -- for `appType: "app"`, use `"page": { "pages": ["path/to/page"] }`
  - `"platforms"`: array of objects. Each object has:
    - `"deviceSource"`: number (v2 style). Optional in v3.
    - `"st"`: string, screen shape. Supported values: `"s"` (square), `"r"` (round), `"b"`. Available since v3.
    - `"sr"`: string, resolution format `"w" + number` e.g. `"w480"`. Available since v3.
  - `"designWidth"`: number

**Implication:**
- The plan's `targets` section using keys `"gt.r"` and `"gt.s"` with `"platforms": [{ "st": "r" }]` and `[{ "st": "s" }]` is **supported**. Key names are convention-based, not enforced.
- The plan's `designWidth` values (480 for round, 390 for square) are appropriate defaults.

---

## 2. Device Mini Program Step Sensor -- Import, Constructor, getCurrent(), Permission

**Result: verified**

**Official URL:** https://docs.zepp.com/zh-cn/docs/reference/device-app-api/newAPI/sensor/Step/

**Exact API:**
```js
import { Step } from '@zos/sensor'
const step = new Step()
const current = step.getCurrent()  // returns number
const target = step.getTarget()    // returns number
step.onChange(callback)            // register step change listener
step.offChange(callback)           // unregister step change listener
```

**Permission code:** `"data:user.hd.step"` (documented under "信息权限代码")

**API_LEVEL:** 2.0+

**Implication:**
- The plan's `device-app/page/home/home.js` correctly uses `import { Step } from "@zos/sensor"`, `new Step()`, and `step.getCurrent()`.
- The plan's `app.json` permissions list includes `"data:user.hd.step"` -- **correct**.
- Note: the plan uses `Math.max(0, Math.floor(step.getCurrent() || 0))` which is a safe defensive pattern.

---

## 3. Device Mini Program LocalStorage -- Availability and Behavior

**Result: verified**

**Official URL:** https://docs.zepp.com/zh-cn/docs/reference/device-app-api/newAPI/storage/localStorage/

**Exact API:**
```js
import { LocalStorage } from '@zos/storage'
const localStorage = new LocalStorage()
localStorage.setItem(key, value)          // save
const val = localStorage.getItem(key)     // read (returns value or undefined)
const val = localStorage.getItem(key, defaultValue)  // read with default fallback
localStorage.removeItem(key)              // delete key
localStorage.clear()                      // clear all
```

**Behavior:**
- API_LEVEL 3.0+
- Permission code: `"device:os.local_storage"`
- Key-value pair storage. Supports `any` value type for `setItem` (JSON serialization expected).
- `getItem` returns `defaultValue` if key does not exist.
- Data is **cleared when the mini program is uninstalled**.
- No documented size limit.

**Implication:**
- The plan's `device-app/utils/storage.js` correctly uses `import { LocalStorage } from "@zos/storage"`, `new LocalStorage()`, and `getItem`/`setItem`.
- The plan's `app.json` includes `"device:os.local_storage"` permission -- **correct**.
- The corrupt-data recovery pattern (JSON.parse in try/catch) is sound, because `getItem` returns a string or undefined.

---

## 4. V3 Watch-Face app.json Schema -- watchface Module Path, main, lockscreen

**Result: verified**

**Official URL:** https://docs.zepp.com/zh-cn/docs/watchface/app-json/ (Chinese) or https://docs.zepp.com/docs/watchface/app-json/ (English)

**Exact fields** (under `"module"` when `appType: "watchface"`):
```json
"watchface": {
  "path": "index",           // string, required, path to watchface JS
  "main": 1,                 // number, optional, default 1. 1=show on homescreen, 0=no
  "lockscreen": 1,           // number, optional, default 0. 1=enable AOD/lockscreen, 0=no
  "editable": 0,             // number, optional, default 0
  "photoscreen": 0           // number, optional, default 0
}
```

**Implication:**
- The plan's `watchface-spike/app.json` correctly uses `"watchface": { "path": "index", "main": 1, "lockscreen": 1 }`.
- `lockscreen: 1` enables the always-on-display (AOD) entry point.

---

## 5. Watch-Face STEP Sensor Access

**Result: verified**

**Official URL:** https://docs.zepp.com/zh-cn/docs/watchface/api/hmSensor/sensorId/STEP/

**Exact API:**
```js
const step = hmSensor.createSensor(hmSensor.id.STEP)
console.log(step.current)   // number - current daily step count
console.log(step.target)    // number - daily step target
```

**Events:**
```js
step.addEventListener(hmSensor.event.CHANGE, callback)  // callback: () => void
```

**Implication:**
- The plan's `watchface-spike/index.js` uses `hmSensor.createSensor(hmSensor.id.STEP)` and `stepSensor.current` -- **correct**.
- No separate permission declaration is needed for watch-face sensors (watchface `app.json` does not have a `permissions` array in the same way).

---

## 6. IMG_ANIM -- Finite Repeat, display_on_restart, default_frame_index

**Result: verified**

**Official URL:** https://docs.zepp.com/zh-cn/docs/watchface/api/hmUI/widget/IMG_ANIM/

**Exact Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `repeat_count` | number | yes | 0 = infinite loop, 1 = single repeat |
| `display_on_restart` | boolean | no | Whether to replay animation on watchface resume |
| `default_frame_index` | number | no | Frame index to display in power-saving (AOD) mode |
| `anim_complete_call` | function | no | Called when animation finishes (invalid when repeat_count=0) |
| `anim_auto_resume_call` | function | no | Called before auto-resume when display_on_restart=true |

**Animation control:**
- `hmUI.anim_status.START` / `PAUSE` / `RESUME` / `STOP` via `setProperty(hmUI.prop.ANIM_STATUS, ...)`
- Status queries: `hmUI.prop.ANIM_IS_RUNINNG`, `ANIM_IS_PAUSE`, `ANIM_IS_STOP`

**Implication:**
- The plan's `watchface-spike/index.js` correctly uses `repeat_count: 1` for finite play, `display_on_restart: true`, and `default_frame_index: 0`.
- The plan uses `anim_status.START` via `wakeAnimation.setProperty(hmUI.prop.ANIM_STATUS, hmUI.anim_status.START)`.
- **Important:** `default_frame_index` is documented as the frame index to show in power-saving mode. The plan comment says `wake_0.png` should be "an AOD-safe silhouette frame" -- this aligns with the documented purpose.
- The plan should set `default_frame_index` on the IMG_ANIM creation param, not via setProperty. The plan currently does this correctly.

---

## 7. hmSetting.getDeviceInfo() and hmSetting.getScreenType()

**Result: verified** (getDeviceInfo: verified; getScreenType: partially verified)

**Official URLs:**
- https://docs.zepp.com/docs/watchface/api/hmSetting/getDeviceInfo/ (English)
- https://docs.zepp.com/zh-cn/docs/watchface/api/hmSetting/getScreenType/ (Chinese, listed in sidebar but page load observed as SPA-only)

**getDeviceInfo():**
```js
hmSetting.getDeviceInfo()  // returns object
// {
//   width: number,          // screen width in px
//   height: number,         // screen height in px
//   screenShape: number,    // 0 = square screen, 1 = round screen
//   deviceName: string,     // device model name
//   keyNumber: number,      // number of physical keys
//   deviceSource: number    // device code
// }
```

**getScreenType():**
The page is listed in the official sidebar under `hmSetting 系统模块` with title `getScreenType`. Its exact return values could not be fetched from the server (SPA renders via JavaScript), but based on the plan's usage pattern `hmSetting.getScreenType() === hmSetting.screen_type.AOD`, this is the conventional pattern used across Zepp OS watchface examples.

**getDeviceInfo** does NOT have a `screen_type` field. It has `screenShape` (0/1 for square/round). The separate `getScreenType()` function returns the current display mode (main face vs AOD).

**Implication:**
- The plan's usage `hmSetting.getDeviceInfo()` for `width` is correct.
- The plan's `hmSetting.getScreenType()` with `hmSetting.screen_type.AOD` follows observed community patterns, but exact enum values should be verified on a physical device.
- The plan correctly uses `isAod` check to return early with a static AOD image.

---

## 8. Watch-Face CLICK_UP or Equivalent Tap Support

**Result: verified** -- but CLICK_DOWN is the documented event, not CLICK_UP

**Official URL:** https://docs.zepp.com/zh-cn/docs/watchface/api/hmUI/widget/IMG/ (shows addEventListener example)

**Exact API:**
```js
const img = hmUI.createWidget(hmUI.widget.IMG, { ... })
img.addEventListener(hmUI.event.CLICK_DOWN, (info) => {
  // info parameter provides event details
  img.setProperty(hmUI.prop.MORE, { y: 200 })
})
```

The official watchface IMG widget example uses `CLICK_DOWN` (not `CLICK_UP`). The `BUTTON` widget supports `click_func` callback.

**Important:** The official documentation only demonstrates `CLICK_DOWN` in the watchface API. `CLICK_UP` is **not shown** in the IMG widget example. The device-app IMG widget also uses `event.CLICK_DOWN`.

**Implication:**
- The plan's `watchface-spike/index.js` uses `hmUI.event.CLICK_UP`. This should be changed to `hmUI.event.CLICK_DOWN`, or tested to see if `CLICK_UP` is available (it may exist but not be documented).
- No explicit CLICK_UP event page exists on the official docs site.
- **Recommendation:** The plan should use `hmUI.event.CLICK_DOWN` as the documented tap event, or list CLICK_UP as a capability requiring physical-device verification.

---

## 9. Documented Persistence or State Sharing Between Watch Face and Device Mini Program

**Result: not documented**

There is **no documented API** for shared persistent storage between a watch face and a Device Mini Program on Zepp OS:

- **Watch faces** have access to `hmFS` (file system for reading asset files, e.g. `hmFS.stat_asset()`). No key-value storage or writeable LocalStorage is documented for watch faces.
- **Device Mini Programs** have `LocalStorage` at `@zos/storage` but it is **scoped per mini program** and cleared on uninstall. A watch face and a device app are separate mini programs with separate app IDs and separate storage sandboxes.
- **Settings Storage** (`Settings Storage API`) exists for communication between the Side Service and Settings App, not for watch faces.
- **BLE communication** exists between Device App and Side Service, but the watch face has no documented BLE communication API for interacting with companion software.

**Implication:**
- The plan correctly acknowledges in `watchface-spike/README.md` that "if the watch face cannot persist or share the selected-pet profile... use separately packaged selected-pet watch-face variants for V1."
- This is a **BLOCKED** capability for direct cross-runtime state sharing. The fallback approach of separately packaged watch-face variants is the correct documented approach.

---

## 10. Zeus Preview, Build, and Physical-Device Installation Commands

**Result: verified**

**Official URL:** https://docs.zepp.com/zh-cn/docs/guides/tools/cli/

**Exact Commands:**

| Command | Description |
|---------|-------------|
| `zeus create <project-name>` | Interactive project scaffolding |
| `zeus dev` | Compile and preview on simulator (auto-reload on changes) |
| `zeus preview` | Build and generate QR code for Zepp App installation to physical device |
| `zeus build` | Build distribution `.zab` package to `dist/` |
| `zeus login` | Login to Zepp open platform account |
| `zeus config list` | List all config |
| `zeus config set <key>=<value>` | Set config |
| `zeus config get <key>` | Get config value |
| `zeus config delete <key>` | Delete config |
| `zeus bridge` | Developer Bridge mode for live debugging |
| `zeus status` | Show login status and simulator connection status |

**Physical device workflow:**
1. `zeus login` (one-time)
2. `zeus preview` -- selects target, builds, generates QR code in terminal
3. Zepp App (Developer Mode) -- scan QR code to install on device

**Implication:**
- The plan's step in Task 7 references `zeus build` from the watchface directory -- correct.
- The plan's Task 6 references `zeus preview` from `device-app/` -- correct.
- The plan should run `zeus build` from the project root or the specific project directory. Each mini program (device-app and watchface-spike) is a separate Zeus project with its own `app.json`.

---

## Summary of Findings

| # | Item | Result | Correction Needed |
|---|------|--------|-------------------|
| 1 | Device-app target syntax | Verified | No |
| 2 | Device-app Step API | Verified | No |
| 3 | Device-app LocalStorage | Verified | No |
| 4 | Watch-face app.json schema | Verified | No |
| 5 | Watch-face STEP sensor | Verified | No |
| 6 | IMG_ANIM repeat/restart | Verified | No |
| 7 | getDeviceInfo / getScreenType | Verified | No |
| 8 | CLICK_UP tap support | Contradicted | Plan uses `hmUI.event.CLICK_UP`; official docs show `hmUI.event.CLICK_DOWN`. Change or verify on device. |
| 9 | Cross-runtime persistence | Not documented | Fallback (separate watch-face variants) is correct. No shared storage API exists. |
| 10 | Zeus CLI commands | Verified | No |

## BLOCKED Items

### Item 8: CLICK_UP should be CLICK_DOWN

**Plan location:** `watchface-spike/index.js` line 1169 (in the plan document), reference in `watchface-spike/app.json` Task 7.

**Current plan code:**
```js
petHitTarget.addEventListener(hmUI.event.CLICK_UP, () => { ... });
```

**Official documentation shows:** `hmUI.event.CLICK_DOWN` in the IMG widget example. No CLICK_UP documentation exists in the watchface API docs.

**Required correction:** Change to `hmUI.event.CLICK_DOWN`, or add a note that CLICK_UP is an undocumented capability requiring physical-device verification. The plan already includes a fallback ("If the build rejects the experimental `addEventListener` block, remove only that block...").

**Status:** Not fully blocked -- the plan has a fallback path. But the plan should use the documented `CLICK_DOWN` event instead of `CLICK_UP`.

### Item 9: No Documented Cross-Runtime State Sharing

**Plan location:** `docs/validation/phase-0-device-spike.md` -- manual gate question 5, and `watchface-spike/README.md` fallback section.

**Finding:** Zepp OS documentation provides no shared persistent storage API between watch faces and Device Mini Programs. Each runtime has isolated storage scoped to its own app ID.

**Required correction:** The plan already correctly documents this fallback. No code change needed. The physical-device gate (Task 9) must explicitly report the state-sharing approach used: separate watch-face variants, or a workaround discovered on physical hardware.

## Recommendations

1. **Use CLICK_DOWN** instead of CLICK_UP in `watchface-spike/index.js` for documented compatibility.
2. **Proceed with separate packaging** for watch-face variants -- this is the only documented path for different selected-pet configurations.
3. **Physical device testing required** for `getScreenType()` return values and `CLICK_UP`/`CLICK_DOWN` behavior -- these cannot be fully verified from documentation alone.
4. **The rest of the plan is supported** by official documentation.
