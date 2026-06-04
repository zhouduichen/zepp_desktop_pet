# Zepp Pet Universe

An international-facing Zepp OS virtual-pet watch-face project. Daily steps earn food,
shape evolution, and unlock collectible forms. The watch face stays lightweight; a
companion Device Mini Program handles settlement, history, and collection management.

## Current Status

The one-pet Phase 0 spike is implemented locally. Automated tests pass, pet-pack
validation passes, and Zeus build output is produced for both the Device Mini Program
and watch-face spike. The remaining release gate is physical-watch validation.

| Area | Status |
| --- | --- |
| Product design | approved |
| Phase 0 plan | implemented locally |
| AI execution runbook | ready |
| Zepp OS API verification | done |
| Prototype implementation | done with hardware concerns |
| Automated verification | 15 Node tests passing; pet-pack validation passing |
| Zeus build | local `.zab` packages produced with Node v24 patch |
| Physical-watch gate | not started |
| Phase 1 product plan | drafted; execution blocked by physical-watch gate |

## Start Here

1. Read [AGENTS.md](AGENTS.md).
2. Read the [project requirements](PROJECT_REQUIREMENTS.md).
3. Read the [approved design](docs/superpowers/specs/2026-06-02-zepp-pet-universe-design.md).
4. Read the [Phase 0 plan](docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-0-feasibility.md).
5. Read the [AI execution runbook](docs/superpowers/runbooks/2026-06-02-zepp-pet-universe-ai-execution-runbook.md).
6. Open the [project board](docs/PROJECT_BOARD.md).
7. Give [the orchestrator prompt](docs/prompts/00-orchestrator.md) to the coordinating AI.

## Phase 0 Deliverable

Phase 0 proves:

- daily STEP readout;
- finite raise-to-wake animation;
- static AOD silhouette;
- watch-face tap support or a documented Mini Program fallback;
- supported persistence and cross-runtime state-sharing path;
- guarded step-to-food settlement;
- round and square device behavior;
- representative package, memory, AOD, and battery measurements.

## Hard Boundary

Do not start the full `8-10` pet roster, branching evolution UI, Side Service, account
system, community catalog, or runtime asset downloading before Phase 0 is measured on
physical watches.

## Environment Notes

Use PowerShell. On this Windows machine, use `npm.cmd` instead of `npm` because the
PowerShell execution policy blocks `npm.ps1`.
