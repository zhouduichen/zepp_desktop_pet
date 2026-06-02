# Worker Report

## Status

`DONE_WITH_CONCERNS`

## Scope

Task 7 from the Phase 0 feasibility plan: "Build The Watch-Face Runtime Experiment"

Files created:
- `watchface-spike/README.md`
- `watchface-spike/app.json`
- `watchface-spike/index.js`
- `watchface-spike/app.js` (added after build required it)

## Summary

- Created the V3 watch-face manifest (`app.json`) with `"appType": "watchface"`, `"watchface": { "path": "index", "main": 1, "lockscreen": 1 }` for both `gt.r` (round) and `gt.s` (square) targets.
- Reconciled plan's `hmUI.event.CLICK_UP` against official docs which show `hmUI.event.CLICK_DOWN` -- changed to CLICK_DOWN.
- Implemented the watch-face JS with all four experiment branches: AOD static frame via `hmSetting.getScreenType()`, step readout via `hmSensor.createSensor(hmSensor.id.STEP)`, finite IMG_ANIM wake animation with `repeat_count: 1` and `default_frame_index: 0`, and experimental transparent FILL_RECT tap target with `CLICK_DOWN`.
- Staged pixel-cat assets for both round and square targets.
- Ran `zeus build` from `watchface-spike/`. Rollup compiled both JS files successfully (no syntax or API errors). The `zpm` packaging step failed with a Node v24 compatibility bug (`ERR_INVALID_ARG_TYPE: paths[2] must be string`), preventing `.zab` output. This is an environment issue, not a code issue.
- Added `permissions: []` and `app.js` lifecycle shell after the build validator required them.
- The CLICK_DOWN tap listener was **not rejected** by Rollup -- physical-device test still needed for runtime confirmation.

## Files Changed

- `D:\huami\desktop_pet\watchface-spike\README.md` -- spike hypotheses, reconciliation notes, build results, capability matrix
- `D:\huami\desktop_pet\watchface-spike\app.json` -- V3 watch-face manifest
- `D:\huami\desktop_pet\watchface-spike\index.js` -- watch-face experiment implementation
- `D:\huami\desktop_pet\watchface-spike\app.js` -- lifecycle shell (required by build)

## Commands Run

```powershell
node scripts/stage-watchface-assets.mjs pet-packs/pixel-cat watchface-spike/assets
PATH="/c/Program Files/nodejs:$PATH" zeus build  # from watchface-spike/
```

## Verification

- **Asset staging**: PASS -- pixel-cat assets mirrored to `watchface-spike/assets/gt.r/` and `gt.s/`
- **JS syntax (Rollup)**: PASS -- both `app.js` and `index.js` transformed without errors
- **app.json schema**: PASS -- after adding `permissions: []` and `app.js` (build-required)
- **zpm packaging**: FAIL -- Node v24 compatibility bug in `@zeppos/zpm`, not a code issue
- **git diff --check**: PASS -- no whitespace errors

## Commits

- `git add watchface-spike`
- `git commit -m "feat: add watch face feasibility experiment"`
- `git add docs/reports/`
- `git commit -m "docs: add task 7 spike report"`

## Risks And Follow-Up

1. **zpm packaging blocked**: Zeus CLI's internal `zpm` library is incompatible with Node.js v24. The build produces an empty `dist/` directory. Need Node v18/v20 workstation or updated Zeus CLI for `.zab` output and physical-device installation.
2. **CLICK_DOWN runtime unverified**: Rollup compiled the `addEventListener(hmUI.event.CLICK_DOWN, ...)` code without errors, but the physical device will decide whether the tap handler actually fires. Prepare to fall back to Mini Program interactions if runtime rejects it.
3. **No cross-runtime persistence**: Watchface has no documented shared storage with Mini Programs. V1 fallback of separately packaged watch-face variants remains the default path.
4. **app.js requirement**: The build requires `app.js` in the watchface project root even though `appType` is `"watchface"`. This is not mentioned in the watchface quick-start docs but was enforced by the build schema.
5. **Permissions array required**: The build schema requires a `permissions` property in `app.json` even for watchface type. Added as empty array.

## Blocker Evidence

- Observed behavior: `zeus build` fails with `TypeError [ERR_INVALID_ARG_TYPE]: The "paths[2]" argument must be of type string. Received undefined`
- Evidence: The error originates in `@zeppos/zpm/lib/node.js` at the packaging stage. Rollup completes successfully. This is a compatibility issue between the `zpm` library and Node.js v24.
- Recommended next action: Either downgrade to Node.js v18 or v20, or use a CI workstation with a compatible Node version.
