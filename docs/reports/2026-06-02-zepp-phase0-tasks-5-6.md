# Worker Report

## Status

`DONE_WITH_CONCERNS`

## Scope

Tasks 5 and 6 from the Zepp Pet Universe Phase 0 feasibility implementation plan:
- Task 5: Scaffold the Companion Device Mini Program
- Task 6: Add Storage Adapter and Settlement Screen

## Summary

Created the Device Mini Program scaffold with API_LEVEL 3.0 manifest, round/square layout separation, and the home screen with step-to-food settlement logic. All 14 Node tests pass.

**Concern:** `zeus preview` fails because the Zeus CLI cannot spawn `node` in its subprocess within this environment (git-bash via PowerShell). On a standard Windows developer environment with cmd/PowerShell, `zeus preview` should work.

## Files Changed

- `device-app/package.json` -- device app package metadata with @zeppos/device-types and @zeppos/zml dependencies
- `device-app/jsconfig.json` -- JS type checking config referencing device-types
- `device-app/global.d.ts` -- type reference declaration
- `device-app/app.js` -- lifecycle shell with onCreate/onDestroy
- `device-app/app.json` -- V3 manifest: targets gt.r (480px round) and gt.s (390px square), permissions for step, localStorage, device info
- `device-app/page/common.r.layout.js` -- round screen base dimensions
- `device-app/page/common.s.layout.js` -- square screen base dimensions (hides status bar)
- `device-app/page/home/home.r.layout.js` -- round home text coordinates (TITLE, STEPS, FOOD, NOTE)
- `device-app/page/home/home.s.layout.js` -- square home text coordinates
- `device-app/utils/storage.js` -- LocalStorage adapter with corrupt-JSON recovery via normalizeProfile
- `device-app/page/home/home.js` -- home page build(): step settlement, profile save, PET UNIVERSE/STEPS/FOOD/NOTE render

## Commands Run

```powershell
cd D:/huami/desktop_pet
npm.cmd install
npm.cmd install --prefix device-app
node --test tests/*.test.mjs
```
```powershell
zeus preview  # FAILS: Zeus CLI cannot spawn 'node' subprocess in git-bash environment
```

## Verification

Tests: 14 pass (smoke, profile, settlement, pet-pack)

- `FOOD_PER_STEPS = 1000`, `DAILY_FOOD_CAP = 10`, `HISTORY_DAYS = 30`
- `toDateKey` formats local calendar fields
- `createDefaultProfile` returns compact valid profile
- `normalizeProfile` recovers invalid counters, keeps readable activity, falls back on bad JSON
- `settleSteps` grants food correctly, prevents duplicate settlement, carries partial progress across incremental opens, caps at DAILY_FOOD_CAP, creates new daily records on date rollover
- `validatePetPack` accepts valid packs, rejects missing required actions, rejects out-of-range frames/fps

`git diff --check`: no whitespace errors

## Commits

- `d9a4fd0` -- feat: scaffold pet universe device app (Task 5)
- `4ece4a7` -- feat: settle pet food in companion device app (Task 6)

## Risks And Follow-Up

1. **zeus preview unavailable in git-bash:** The Zeus CLI (`zeus preview`) requires a standard Windows shell environment where it can spawn `node` as a subprocess. In the git-bash + PowerShell environment, `zeus preview` errors with `'node' is not recognized`. Remaining: verify on a real developer machine with cmd or PowerShell.
2. **@zeppos/device-types and @zeppos/zml not installed:** These packages may not resolve from public npm. They are provided by the Zepp OS IDE/Zeus CLI at build time. The root `package.json` lists them; if they fail to install on other machines, that is expected -- they are only needed for type checking, not runtime.
3. **device-app/core/*.js has no `"type": "module"`:** The `device-app/package.json` is missing `"type": "module"`. The Node test runner re-parses them as ESM with a warning. The `device-app` is a Zeus project, not a Node project, so this is cosmetic for Zeus but should be addressed if these files are also consumed by Node tests. Adding `"type": "module"` to `device-app/package.json` would eliminate the warnings.

## Blocker Evidence

Complete this section only when blocked:

- Observed behavior: `zeus preview` fails with `'node' is not recognized as an internal or external command, operable program or batch file.`
- Evidence: The Zeus CLI (Node.js v24.15.0 installed) cannot spawn a `node -v` subprocess. This is a git-bash PATH issue where `node` is available in the shell but not visible to child processes spawned by zeus.
- Recommended next action: Run `zeus preview` from a native Windows command prompt or PowerShell (not git-bash) on a machine with Node.js in the system PATH.
