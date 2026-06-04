# Review Report

## Status

`APPROVED`

## Review Type

`spec-compliance`

## Commit Range

```text
98de677..103e713
```

## Findings

### Finding 1 (low): test coverage for all 5 required actions is implicit

`tests/pet-pack.test.mjs` only deletes `feed` when testing the "missing required actions" path. The test passes because the loop iterates over all `REQUIRED_ACTIONS`, but a regression that removed one of the other four actions (e.g., `wakeIdle`) from the array would not be caught. The test should ideally verify that removing any single action produces exactly one error, or enumerate all five expected names. This is acceptable for Phase 0 and does not block approval.

- File: `tests/pet-pack.test.mjs`, line 34
- Severity: low (informational)

### Finding 2 (note): staging guard is prefix-based, not exact-path-based

The `rm` escape guard at `scripts/stage-watchface-assets.mjs` line 9 checks `destination.startsWith(...)`. On Windows, if `watchfaceAssets` is a prefix of another path (unlikely given `path.sep` is appended), the destination could theoretically escape. For a Phase 0 developer tool this is sufficient. A production hardening could compare resolved real paths instead.

- File: `scripts/stage-watchface-assets.mjs`, line 9
- Severity: low (informational)

### Finding 3 (note): design spec uses snake_case action names, implementation uses camelCase

The design spec (Section 8.1) names actions `wake_idle`, `tap_react`, `no_food`, etc. The Phase 0 implementation and manifest use camelCase (`wakeIdle`, `tapReact`, `noFood`). This is a deliberate implementation choice documented in the Phase 0 plan. The schema is self-consistent across all Phase 0 files. The Phase 1 spec document must align the naming convention before more packs are authored.

- Files: `pet-packs/pixel-cat/manifest.json` lines 18-22, `core/pet-pack.js` line 1
- Severity: low (documentation alignment for Phase 1)

## Verified Strengths

1. **Required action enforcement is correct.** `core/pet-pack.js` validates exactly 5 actions (`wakeIdle`, `tapReact`, `feed`, `happy`, `noFood`) as specified by the Phase 0 plan. The test at line 34 confirms rejection of a missing required action, and the test at line 41 confirms dual frame/FPS errors on a single malformed action.

2. **Frame and FPS bounds are verified.** `core/pet-pack.js` lines 19-23 enforce `frames` in `[8, 20]` and `fps` in `[8, 12]`, matching the design spec Section 10 ("8-20 frames", "8-12 FPS"). Tests confirm both bounds simultaneously.

3. **Staging guard prevents rm escape.** `scripts/stage-watchface-assets.mjs` line 9 checks that the computed destination path starts with the resolved watchface assets directory plus `path.sep`. The `rm({ recursive: true })` at line 12 can only remove files within that guarded subtree.

4. **Canonical assets in pet-packs/, mirrors in watchface-spike/assets/.** The diff shows `pet-packs/pixel-cat/` as the single source of truth and `watchface-spike/assets/gt.{r,s}/pixel-cat/` as generated mirrors. This matches `AGENTS.md` Runtime Boundaries and `PROJECT_REQUIREMENTS.md` Section 4.2 directory responsibilities.

5. **No hand-editing of generated mirrors.** The mirror files in `watchface-spike/assets/gt.r/` and `gt.s/` were produced by the staging script and committed in the same commit as the script. No evidence of manual edits to generated files.

6. **Wiring assets are one-pixel only.** `scripts/create-wiring-pet-assets.mjs` calls `png(1, 1, ...)` at line 47, producing deterministic 1x1 pixel PNGs. All 70-byte frame files are wiring-only placeholders, not release art.

7. **wake_0.png is AOD-safe.** `scripts/create-wiring-pet-assets.mjs` line 55 copies `aod.png` to `wake_0.png`, ensuring the first frame of the wake animation is an AOD-safe silhouette as required by the plan.

8. **No scope creep beyond Phase 0.** All files in the commit range are limited to: pet-pack validation (`core/pet-pack.js`), pack tests (`tests/pet-pack.test.mjs`), the representative manifest (`pet-packs/pixel-cat/manifest.json`), wiring assets, and three scripts (asset generation, validation, staging). No evolution logic, no community features, no Side Service, no collection UI.

9. **`toNonNegativeInt` is correctly shared.** The function at `device-app/core/helpers.js` line 1 is imported by both `device-app/core/profile.js` (line 2) and `device-app/core/settlement.js` (line 3). The implementation is identical to the original inline version: `Math.max(0, Math.floor(Number(value) || 0))`. Both consumers now reference the single source of truth.

10. **CLI validator checks disk assets for all actions.** `scripts/validate-pet-pack.mjs` iterates over every action (not just required ones), verifying each frame file exists via `fs.access`. The static and AOD files are also checked.

11. **Wiring script generates correct file names matching manifest prefixes.** The script uses `{ wake, tap, feed, happy, no_food }` as action keys and generates `{prefix}_{n}.png`. The manifest uses `"prefix": "baby/wake_"` etc., which resolves to the generated filenames. All frame counts match between script and manifest.

## Required Re-Review

- [x] findings fixed
- [ ] same reviewer prompt re-run
- [ ] status changed to `APPROVED`

(Finding 1 is informational; no code changes needed for Phase 0. Finding 2 and Finding 3 are documentation notes for Phase 1 planning, not actionable bugs.)
