# AI Contributor Instructions

## Required Reading

Before editing files, read:

1. `PROJECT_REQUIREMENTS.md`
2. `docs/superpowers/specs/2026-06-02-zepp-pet-universe-design.md`
3. `docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-0-feasibility.md`
4. `docs/superpowers/runbooks/2026-06-02-zepp-pet-universe-ai-execution-runbook.md`
5. `docs/PROJECT_BOARD.md`
6. `docs/architecture/RISK_REGISTER.md`

## Execution Rules

- Work on an isolated feature branch or worktree.
- Only one implementation AI edits the repository at a time.
- Use official Zepp OS documentation as the source of truth.
- Use PowerShell and `npm.cmd`.
- Follow TDD for deterministic JavaScript modules.
- Commit after each completed task.
- Run `git diff --check` before every commit.
- Record commands, tests, commit SHA, and remaining risks using
  `docs/templates/worker-report.md`.
- Stop for human input when a task requires a physical watch, QR scan, login, or Zepp
  App interaction.

## Runtime Boundaries

- `watchface-spike/` is the experimental watch-face runtime.
- `device-app/` is the Device Mini Program runtime.
- `pet-packs/` holds canonical pet assets.
- `watchface-spike/assets/` holds generated mirrors only.
- `core/` holds repository-level pet-pack tooling only.
- `device-app/core/` holds deterministic Mini Program domain logic.

Do not assume watch faces and Device Mini Programs share LocalStorage or assets.

## Lightweight Rules

- No GPS.
- No heart-rate monitoring.
- No workout mode.
- No background polling.
- No background timers.
- No infinite watch-face animation loops.
- AOD is static and minimal.

## Stop Conditions

Report `BLOCKED` rather than guessing when:

- official docs contradict the plan;
- a Zepp OS API is not documented;
- a Zeus command cannot be verified;
- tap support or state sharing is uncertain;
- a physical watch is required;
- unrelated changes conflict with owned files.
