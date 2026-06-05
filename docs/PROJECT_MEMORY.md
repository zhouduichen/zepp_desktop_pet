# Zepp Pet Universe Project Memory

Last updated: 2026-06-05

Use this file as the first handoff document when starting a new Codex conversation for
this repository.

## New Conversation Bootstrap

Paste or say this in a new conversation:

```text
Workspace: D:\huami\desktop_pet

Please read:
1. AGENTS.md
2. docs/PROJECT_MEMORY.md
3. PROJECT_REQUIREMENTS.md
4. docs/superpowers/specs/2026-06-02-zepp-pet-universe-design.md
5. docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-0-feasibility.md
6. docs/superpowers/runbooks/2026-06-02-zepp-pet-universe-ai-execution-runbook.md
7. docs/PROJECT_BOARD.md
8. docs/architecture/RISK_REGISTER.md

Use PowerShell and npm.cmd. Check git status before editing. Do not assume watchface
and Device Mini Program share state. Simulator-only results cannot complete the
physical-watch gate.
```

## Current Repository Snapshot

- Working directory: `D:\huami\desktop_pet`
- Active branch at the time this memory was written:
  `codex/pet-universe-retry-verification`
- Latest implementation commit before this memory document:
  `e342429 feat: add device app pet interactions`
- Main product name: Zepp Pet Universe
- Runtime split:
  - `device-app/`: Zepp OS Device Mini Program
  - `watchface-spike/`: Zepp OS watch-face spike
  - `pet-packs/`: canonical pet assets
  - `watchface-spike/assets/`: generated watch-face mirrors
  - `device-app/assets/`: generated Device Mini Program mirrors for simulator/debug use

## Product State

The project is still in Phase 0 plus local simulator follow-ups. It is not a finished
Phase 1 product.

Completed or locally working:

- Zepp OS API research is documented in
  `docs/research/zepp-os-phase-0-api-verification.md`.
- Deterministic profile, local date, and step-to-food settlement logic are implemented
  under `device-app/core/`.
- Settlement uses daily entitlement:
  `floor(currentSteps / 1000) - earnedToday`, capped at 10 food/day.
- Five starter Baby pet packs exist:
  - `pixel-cat`
  - `pixel-dog`
  - `pixel-bunny`
  - `pixel-hamster`
  - `pixel-fox`
- The Device Mini Program simulator page now shows a pet sprite and has four controls:
  `FEED`, `PET`, `PLAY`, and `NEXT`.
- `FEED` consumes food and adds EXP/AFF.
- `PET` increases AFF.
- `PLAY` increases EXP/AFF.
- `NEXT` cycles through the five starter pets and persists selected pet id.
- Watch-face spike builds locally and packages pet assets, but physical runtime behavior
  is still not verified.

Not implemented yet:

- Baby to Teen upgrade.
- Active, Steady, Explorer mature branches.
- Rare and Secret forms.
- Full collection pages.
- Seven-day history UI.
- Form switching UI.
- True watch-face and Device Mini Program state sharing.
- Real battery, AOD, memory, and tap behavior validation on physical watches.

## User-Visible Simulator State

The user has been testing the Device Mini Program simulator, not the watch face.

Current expected Device Mini Program screen:

- Title: `PET UNIVERSE`
- Selected pet name, for example `PIXEL CAT`
- Pet image
- Steps text
- Food text
- `AFF` and `EXP`
- Four tap controls: `FEED`, `PET`, `PLAY`, `NEXT`

Known behavior:

- With `300 STEPS`, food should remain `0 FOOD`.
- `1000 STEPS` earns `1 FOOD`.
- Reopening at the same step count must not duplicate food.
- `EXP` and `AFF` change, but the pet does not upgrade form yet.

## How To Run Or Refresh The Simulator

If an old simulator/dev session is running, stop it first in its terminal:

```powershell
Ctrl+C
```

Then run the Device Mini Program simulator:

```powershell
Set-Location D:\huami\desktop_pet\device-app
zeus.cmd dev
```

If assets were regenerated or changed, run staging before `zeus.cmd dev`:

```powershell
Set-Location D:\huami\desktop_pet
npm.cmd run stage:device
Set-Location D:\huami\desktop_pet\device-app
zeus.cmd dev
```

Build the Device Mini Program package:

```powershell
Set-Location D:\huami\desktop_pet\device-app
zeus.cmd build
```

Build the watch-face spike:

```powershell
Set-Location D:\huami\desktop_pet
npm.cmd run stage:watchface
Set-Location D:\huami\desktop_pet\watchface-spike
$env:NODE_OPTIONS='--require D:\huami\desktop_pet\patch-zpm.cjs'
zeus.cmd build
```

The Node patch is needed on the local Node v24 setup for some watch-face packaging
paths. It may not be needed on Node 18 or Node 20.

## Current Verification Commands

Run from `D:\huami\desktop_pet`:

```powershell
npm.cmd test
npm.cmd run validate:pack
npm.cmd run validate:roster
npm.cmd run stage:device
npm.cmd run stage:watchface
npm.cmd run measure:assets
git diff --check
git status --short
```

Latest known verification from commit `e342429`:

- `npm.cmd test`: PASS, 32 tests.
- `npm.cmd run validate:pack`: PASS.
- `npm.cmd run validate:roster`: PASS, 5 packs.
- `npm.cmd run stage:device`: PASS.
- `npm.cmd run stage:watchface`: PASS.
- `npm.cmd run measure:assets`: PASS, 245 files, 206,217 bytes under `pet-packs`.
- `zeus.cmd build` from `device-app/`: PASS.
- Latest Device Mini Program package at that time:
  `device-app/dist/1099991-Pet_Universe_Spike-0.0.1-20260605220814.zab`,
  5,785,663 bytes.

## What To Test Right Now

Only simulator-friendly Phase 0 behavior should be tested right now:

- Device Mini Program shows pet image, not only text.
- `FEED`, `PET`, `PLAY`, and `NEXT` are clickable.
- `NEXT` cycles through Cat, Dog, Bunny, Hamster, and Fox.
- Name and sprite change together.
- `PET` increases AFF.
- `PLAY` increases EXP and AFF.
- `FEED` with `0 FOOD` shows a no-food message and does not corrupt counters.
- If simulator steps are `1000+`, `FEED` consumes food and adds EXP/AFF.
- Reopening the app does not duplicate food for the same step total.
- Round and square layouts do not overlap text, controls, or sprite.

Do not treat these as complete product tests:

- Upgrade/evolution tests.
- Rare or Secret form tests.
- AOD tests.
- Battery tests.
- Physical tap tests.
- Watch-face and Device Mini Program shared state tests.

## Important Files

- `AGENTS.md`: local contributor rules and stop conditions.
- `docs/PROJECT_MEMORY.md`: this handoff memory.
- `docs/PROJECT_BOARD.md`: project task board and remaining gates.
- `docs/architecture/RISK_REGISTER.md`: known architecture risks.
- `docs/research/zepp-os-phase-0-api-verification.md`: official API findings.
- `docs/superpowers/specs/2026-06-02-zepp-pet-universe-design.md`: product design.
- `docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-0-feasibility.md`:
  Phase 0 plan.
- `docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-1-product.md`:
  Phase 1 draft, blocked for execution until the physical-watch gate.
- `docs/reports/2026-06-05-device-app-pet-interactions-worker-report.md`:
  latest Device Mini Program interaction follow-up.
- `device-app/page/home/home.js`: current simulator UI behavior.
- `device-app/core/interactions.js`: FEED/PET/PLAY logic.
- `device-app/core/pets.js`: starter roster and pet switching.
- `scripts/stage-device-assets.mjs`: mirrors canonical pet packs into device app assets.
- `scripts/stage-watchface-assets.mjs`: mirrors canonical pet packs into watch-face assets.
- `pet-packs/*`: canonical starter pet packs.

## Architecture Rules To Preserve

- Use official Zepp OS docs as source of truth when APIs are uncertain.
- Use PowerShell and `npm.cmd`.
- Follow TDD for deterministic JavaScript modules.
- Commit after each completed task.
- Run `git diff --check` before every commit.
- Do not assume watch faces and Device Mini Programs share LocalStorage or assets.
- Do not use GPS, heart-rate monitoring, workout mode, background polling, background
  timers, infinite watch-face animation loops, or runtime asset downloads.
- Keep AOD static and minimal.
- Edit canonical assets in `pet-packs/`; regenerate mirrors with staging scripts.
- Stop and report `BLOCKED` for physical watch, QR scan, login, Zepp App interaction,
  uncertain undocumented APIs, or conflicting unrelated changes.

## Known Risks And Concerns

- Physical-watch gate is still human-required and incomplete.
- Watch-face tap compiles with `CLICK_DOWN`, but physical runtime behavior is unknown.
- Watch face and Device Mini Program state sharing is not documented; fallback is
  selected-pet watch-face variants.
- Device app debug package now includes all five starter pet packs and is therefore
  larger than the earlier minimal build.
- Starter sprites are good enough for testing but not final commercial launch art.
- Watch-face builds have previously shown a Zepp resize warning while still producing
  packages; investigate before store submission.

## Recommended Next Work

If the user asks for simulator improvements:

1. Reproduce in `device-app` simulator.
2. Keep work inside `device-app/` unless the issue is asset generation or shared core
   logic.
3. Add tests for deterministic behavior first.
4. Run `npm.cmd test`, `npm.cmd run stage:device`, and `zeus.cmd build`.

If the user asks for upgrades/evolution:

1. Treat it as a Phase 1 slice unless explicitly scoped as a simulator-only prototype.
2. Add deterministic core tests first for thresholds and branch choice.
3. Avoid claiming full Phase 1 completion without the physical-watch gate.

If the user asks for release readiness:

1. Report that simulator-only testing cannot complete Phase 0.
2. Point to `docs/validation/phase-0-device-spike.md` and the human device gate docs.
3. Require round and square physical watch evidence.
