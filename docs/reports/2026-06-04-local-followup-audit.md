# Local Follow-Up Audit

Date: 2026-06-04
Branch: `codex/pet-universe-retry-verification`

## Status

`DONE_WITH_CONCERNS`

## Scope

Local-only follow-up work that does not require a physical watch, QR-code scan, Zepp
App login, or manual Zepp App interaction.

## Completed

- Updated tester handoff docs to reflect the current local build path:
  - PowerShell should use `zeus.cmd`.
  - Node v24 can build locally when `patch-zpm.cjs` is loaded through `NODE_OPTIONS`.
  - `npm.cmd run stage:watchface` is the canonical asset staging command.
  - The watch-face package now includes the Phase 0 pixel-cat candidate sprites, not
    one-pixel placeholder blocks.
- Updated root environment notes with the `zeus.cmd` and `NODE_OPTIONS` workaround.
- Added ignore rules for local Zeus scratch output and damaged/duplicate patch drafts:
  - `zeus-test/`
  - `patch-path.js`
  - `patch-zpm.js`
  - nested generated `.gitignore` files
- Prepared historical worker and review reports for commit so the Phase 0 execution
  trail is available in `docs/reports/`.
- Preserved the existing uncommitted `preview-device-app.bat` and
  `preview-watchface.bat` changes as user/workspace changes; they were not included in
  this audit commit.

## Checks

Latest retry on 2026-06-04:

```powershell
npm.cmd test
npm.cmd run validate:pack
npm.cmd run stage:watchface
npm.cmd run measure:assets
git diff --check
$env:NODE_OPTIONS='--require D:\huami\desktop_pet\patch-zpm.cjs'; zeus.cmd build
```

Results:

- `npm.cmd test`: PASS, 18/18 tests.
- `npm.cmd run validate:pack`: PASS, `valid pet pack: pixel-cat`.
- `npm.cmd run stage:watchface`: PASS, staged `pixel-cat` assets for `gt.r` and `gt.s`.
- `npm.cmd run measure:assets`: PASS, 49 files / 31,203 bytes.
- `git diff --check`: PASS, no whitespace errors.
- Device App `zeus.cmd build`: PASS, latest `.zab` 99,515 bytes.
- Watch Face `zeus.cmd build`: PASS, latest `.zab` 951,569 bytes; package inspection found 48 `assets/pixel-cat/baby/*.png` files in every inspected `device.zip`.
- Watch Face build still logs the known `RESIZE Error: Input file contains unsupported image format` warning before converting 48 PNG files.

## Remaining Hardware-Blocked Work

- Physical install on one round and one square watch.
- STEP truth check on device.
- One-shot wake animation and static idle verification.
- AOD branch verification.
- Watch-face tap runtime behavior.
- Device Mini Program LocalStorage behavior on device.
- Watch-face / Mini Program state-sharing conclusion and fallback selection.
- Package, memory, AOD lit-pixel, and 24-hour battery measurements.
