# Review Report

## Status

`APPROVED`

## Review Type

`spec-compliance`

## Commit Range

```text
589473f..4ece4a7
```

## Files Reviewed

| File | Status |
|------|--------|
| `device-app/package.json` | verified |
| `device-app/jsconfig.json` | verified |
| `device-app/global.d.ts` | verified |
| `device-app/app.js` | verified |
| `device-app/app.json` | verified |
| `device-app/page/common.r.layout.js` | verified |
| `device-app/page/common.s.layout.js` | verified |
| `device-app/page/home/home.r.layout.js` | verified |
| `device-app/page/home/home.s.layout.js` | verified |
| `device-app/utils/storage.js` | verified |
| `device-app/page/home/home.js` | verified |

## Findings

None.

## Checklist Results

### 1. API_LEVEL 3.0 manifest with correct permissions

**PASS.** `app.json` declares `runtime.apiVersion.minVersion: "3.0"`, `compatible: "3.0.0"`, `target: "3.0.0"`. Permissions list contains exactly the three required codes:
- `"data:os.device.info"` for device info access
- `"device:os.local_storage"` for LocalStorage (verified in `docs/research/zepp-os-phase-0-api-verification.md` Section 3)
- `"data:user.hd.step"` for step sensor (verified in Section 2)

No extra permissions. No `"data:user.hd.heart"`, no GPS, no workout-related permissions.

### 2. Round (gt.r) and square (gt.s) targets both present with correct designWidth

**PASS.** `app.json` `targets` object has keys `gt.r` and `gt.s`:
- `gt.r`: `platforms: [{ "st": "r" }]`, `designWidth: 480`
- `gt.s`: `platforms: [{ "st": "s" }]`, `designWidth: 390`

Both map to `pages: ["page/home/home"]`. The `st: "r"` and `st: "s"` values match the official Zepp OS V3 `app.json` spec (verified Section 1 of the API verification doc).

### 3. Round and square layouts are separate files with different coordinates

**PASS.** Four layout files exist:

- `page/common.r.layout.js` -- `SCREEN = { w: px(480), h: px(480) }`
- `page/common.s.layout.js` -- `SCREEN = { w: px(390), h: px(450) }` (also calls `setStatusBarVisible(false)`, correct for square devices)
- `page/home/home.r.layout.js` -- TITLE y:72, STEPS y:170, FOOD y:225, NOTE y:300 (x offsets are 60-70 range, centered on 480px width)
- `page/home/home.s.layout.js` -- TITLE y:62, STEPS y:150, FOOD y:205, NOTE y:275 (x offsets are 30-40 range, centered on 390px width)

All coordinate values differ between round and square as expected for different screen geometries.

### 4. Storage adapter handles corrupt JSON (try/catch around JSON.parse)

**PASS.** `utils/storage.js` `loadProfile` function:
1. Calls `localStorage.getItem(PROFILE_KEY, "")` -- returns empty string default if key missing
2. `if (!raw) return createDefaultProfile(today);` -- guard for missing/empty key
3. `try { return normalizeProfile(JSON.parse(raw), today); } catch { return createDefaultProfile(today); }` -- corrupt JSON is caught, returns safe default profile

Both the empty-string guard and the try/catch are present. Corrupt data cannot propagate.

### 5. Settlement screen reads Step.getCurrent(), runs settleSteps, saves profile

**PASS.** `page/home/home.js`:
1. `import { Step } from "@zos/sensor"; const step = new Step();` -- sensor initialization (verified Section 2 of API verification doc)
2. `const currentSteps = Math.max(0, Math.floor(step.getCurrent() || 0));` -- defensive read with zero floor
3. `const result = settleSteps(loadProfile(today), today, currentSteps);` -- calls core settlement logic
4. `saveProfile(result.profile);` -- persists the updated profile

### 6. No GPS, heart rate, workout mode, timers, background work

**PASS.** No imports from `@zos/sensor` other than `Step`. No `@zos/ble`, no `@zos/notification`, no `@zos/phone`, no `setInterval`, `setTimeout`, or `onChange` listeners. The app is purely synchronous: read steps, settle, display, save.

### 7. No extra pages beyond home

**PASS.** The only page directory is `page/home/`. The only page file is `page/home/home.js`. The `app.json` targets declare `"pages": ["page/home/home"]`. No `page/complete/`, `page/settings/`, `page/collection/` or any other pages exist under `device-app/`.

### 8. No touch of watchface-spike/**, pet-packs/**, scripts/**, core/**

**PASS.** `git diff --name-only 589473f..4ece4a7` lists exactly 11 files, all under `device-app/`. No files in `watchface-spike/`, `pet-packs/`, `scripts/`, or `core/` were modified (`git diff --stat` against these directories produced empty output).

### 9. No undocumented Zepp OS API assumptions

**PASS.** Every import is documented in the official Zepp OS docs:
- `@zos/storage` -> `LocalStorage` -- verified (API verification Section 3)
- `@zos/sensor` -> `Step` with `getCurrent()` -- verified (Section 2)
- `@zos/ui` -> `createWidget`, `widget`, `setStatusBarVisible`, `align` -- standard V3 API
- `@zos/utils` -> `px` -- standard V3 API
- `zosLoader:./../common.[pf].layout.js` and `zosLoader:./home.[pf].layout.js` -- standard Zepp OS dynamic layout substitution pattern

No undocumented features, no device-specific constants, and no assumed cross-runtime storage are used.

## Verified Strengths

- All three required permissions (device info, local storage, step data) are present with no extras.
- Round and square designWidths (480/390) match between `app.json` targets, common layout files, and home layout files.
- Storage corrupt-data recovery uses both an empty-string guard and a try/catch around `JSON.parse`, with fallback to `createDefaultProfile`.
- The settlement screen correctly uses `settleSteps()` which implements the "entitlement minus earned-today" logic mandated by PROJECT_REQUIREMENTS.md and the risk register.
- The commit range is cleanly scoped to `device-app/` only.

## Required Re-Review

- [x] findings fixed
- [ ] same reviewer prompt re-run
- [ ] status changed to `APPROVED`
