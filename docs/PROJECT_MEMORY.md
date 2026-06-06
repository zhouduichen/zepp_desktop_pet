# Zepp Pet Universe Project Memory

Last updated: 2026-06-06

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
  `a7cf630 feat: complete simulator-safe pet product`
- Main product name: Zepp Pet Universe
- Runtime split:
  - `device-app/`: Zepp OS Device Mini Program
  - `watchface-spike/`: Zepp OS watch-face spike
  - `pet-packs/`: canonical pet assets
  - `watchface-spike/assets/`: generated watch-face mirrors
  - `device-app/assets/`: generated Device Mini Program mirrors for simulator/debug use

## Product State

The project is in Phase 0 plus a simulator-safe local product build. It is not a
release-verified product because the P0-6 physical-watch gate is still incomplete.

Completed or locally working:

- Zepp OS API research is documented in
  `docs/research/zepp-os-phase-0-api-verification.md`.
- Deterministic profile, local date, and step-to-food settlement logic are implemented
  under `device-app/core/`.
- Settlement uses daily entitlement:
  `floor(currentSteps / 1000) - earnedToday`, capped at 10 food/day.
- Five starter pet packs exist:
  - `pixel-cat`
  - `pixel-dog`
  - `pixel-bunny`
  - `pixel-hamster`
  - `pixel-fox`
- Each starter pack now contains `baby`, `teen`, `active`, `steady`, `explorer`,
  `rare`, and `secret` forms.
- The Device Mini Program simulator page now shows a pet sprite and has four controls:
  `FEED`, `PET`, `PLAY`, `EVO`, `FORM`, and `NEXT`.
- `FEED` consumes food and adds EXP/AFF.
- `PET` increases AFF.
- `PLAY` increases EXP/AFF.
- `NEXT` cycles through the five starter pets and persists selected pet id.
- V1 Phase 1 constants are implemented:
  seven-day scoring window, feed EXP/AFF rewards, Baby to Teen threshold, Teen to
  mature threshold, close-score threshold, and schema version.
- Deterministic active, steady, and explorer scoring is implemented in `core/scoring.js`
  and mirrored into `device-app/core/scoring.js`.
- Collection unlock helpers are implemented in `core/collection.js` and mirrored into
  `device-app/core/collection.js`.
- Baby to Teen and Teen to mature progression logic is implemented in
  `core/evolution.js`, including close-score user choice resolution.
- Form switch eligibility is implemented in `core/form-switch.js`, allowing only
  permanently unlocked forms to be selected.
- Device Mini Program home UI is wired to evolution, close-score branch choice,
  form switching, collection persistence, and Rare/Secret local unlocks.
- Device Mini Program assets are staged as a lightweight UI subset, while canonical
  `pet-packs/` and watch-face mirrors keep complete animation sequences.
- Watch-face spike builds locally and packages pet assets, but physical runtime behavior
  is still not verified.
- Starter pet sprites were redesigned on 2026-06-06 to use cuter black highlight eyes,
  clearer blush, and stronger form silhouettes.
- Evolution forms now have different silhouette language:
  - Baby: small and round.
  - Teen: taller.
  - Active: lifted and energetic.
  - Steady: lower, wider, and grounded.
  - Explorer: wider exploration silhouette.
  - Rare: wing/star silhouette.
  - Secret: moon/shadow silhouette.
- `docs/reports/starter-form-preview.png` shows the five starter pets across Baby,
  Teen, Active, Steady, Explorer, Rare, and Secret.
- `watchface-spike/` is now a normal watch face surface: time, date, steps, goal
  progress, food derived from steps, and pet pat only.
- Watch-face assets are intentionally lightweight. `stage:watchface` stages only the
  current watch-face pet/form (`pixel-cat/baby` by default) and only static, AOD,
  wake, and tap frames. The full roster and management actions stay in `device-app/`.

Not implemented yet:

- True watch-face and Device Mini Program state sharing.
- Real battery, AOD, memory, and tap behavior validation on physical watches.
- Human visual review for the generated complete-form sprites.
- Separate full collection/history pages beyond the compact home-screen management UI.

## User-Visible Simulator State

The user has been testing the Device Mini Program simulator, not the watch face.

Current expected Device Mini Program screen:

- Title: `PET UNIVERSE`
- Selected pet name, for example `PIXEL CAT`
- Pet image
- Steps text
- Food text
- `AFF` and `EXP`
- Six tap controls: `FEED`, `PET`, `PLAY`, `EVO`, `FORM`, `NEXT`

Current expected watch-face screen:

- Normal watch face first: time, date, steps, goal progress, and food-from-steps.
- Pet appears as an added companion layer.
- The only watch-face pet interaction is tapping the pet to play the finite `tap_`
  pat animation.
- Watch face must not show `NEXT PET`, `FEED`, `PLAY`, `EVO`, or `FORM`; those belong
  to the Device Mini Program.

Known behavior:

- With `300 STEPS`, food should remain `0 FOOD`.
- `1000 STEPS` earns `1 FOOD`.
- Reopening at the same step count must not duplicate food.
- `EVO` upgrades Baby to Teen when EXP reaches 200.
- `EVO` resolves Teen to Active, Steady, or Explorer when EXP reaches 500.
- If mature scores are close, the first buttons become branch choices.
- `FORM` cycles through permanently unlocked forms.
- Rare can unlock from explicit progress; Secret can unlock after hidden preconditions.

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

Latest Phase 1 core verification from commit `9f19472`:

- `npm.cmd test`: PASS, 62 tests.
- `node --test tests\constants-v1.test.mjs`: PASS.
- `node --test tests\scoring.test.mjs`: PASS.
- `node --test tests\collection.test.mjs`: PASS.
- `node --test tests\evolution.test.mjs`: PASS.
- `node --test tests\form-switch.test.mjs`: PASS.
- `git diff --check`: PASS, with line-ending warnings for existing generated pet-pack
  manifest files.
- No Zeus build or simulator preview was run for this core-only batch.

Latest simulator-safe local product verification from 2026-06-06:

- `npm.cmd test`: PASS, 72 tests.
- `npm.cmd run validate:pack`: PASS.
- `npm.cmd run validate:roster`: PASS, 5 packs.
- `npm.cmd run stage:device`: PASS.
- `npm.cmd run stage:watchface`: PASS.
- `npm.cmd run measure:assets`: PASS, 1,685 files, 1,462,676 bytes under
  `pet-packs`.
- `zeus.cmd build` from `device-app/`: PASS.
- Latest Device Mini Program package:
  `device-app/dist/1099991-Pet_Universe_Spike-0.0.1-20260606125410.zab`,
  5,855,865 bytes.

Latest pet redesign and watch-face boundary verification from 2026-06-06:

- `npm.cmd test`: PASS, 74 tests.
- `npm.cmd run validate:pack`: PASS.
- `npm.cmd run validate:roster`: PASS, 5 packs.
- `npm.cmd run stage:device`: PASS.
- `npm.cmd run stage:watchface`: PASS, lightweight `pixel-cat/baby` only.
- `npm.cmd run measure:assets`: PASS, 1,685 files, 1,582,281 bytes under
  `pet-packs`.
- `zeus.cmd build` from `device-app/`: PASS.
- Latest Device Mini Program package:
  `device-app/dist/1099991-Pet_Universe_Spike-0.0.1-20260606141807.zab`,
  6,358,254 bytes.
- `zeus.cmd build` from `watchface-spike/` with the local `NODE_OPTIONS` patch: PASS.
- Latest watch-face package:
  `watchface-spike/dist/1099992-Pet_Universe_Face_Spike-0.0.1-20260606141558.zab`,
  504,576 bytes.

## What To Test Right Now

Only simulator-friendly Phase 0 behavior should be tested right now:

- Device Mini Program shows pet image, not only text.
- `FEED`, `PET`, `PLAY`, and `NEXT` are clickable.
- `EVO` upgrades when thresholds are met.
- close-score branch choices are clickable when offered.
- `FORM` cycles through unlocked forms.
- `NEXT` cycles through Cat, Dog, Bunny, Hamster, and Fox.
- Name and sprite change together.
- `PET` increases AFF.
- `PLAY` increases EXP and AFF.
- `FEED` with `0 FOOD` shows a no-food message and does not corrupt counters.
- If simulator steps are `1000+`, `FEED` consumes food and adds EXP/AFF.
- Reopening the app does not duplicate food for the same step total.
- Round and square layouts do not overlap text, controls, or sprite.
- Watch-face build includes a normal time/date/steps/goal/food surface and no
  management controls.
- Watch-face assets remain lightweight and do not include full roster management
  actions.

Do not treat these as complete product tests:

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
  Device Mini Program interaction follow-up.
- `docs/reports/2026-06-05-phase-1-core-worker-report.md`:
  Phase 1 core worker report.
- `docs/reports/2026-06-06-simulator-safe-product-worker-report.md`:
  latest simulator-safe product worker report.
- `core/scoring.js`: active, steady, and explorer scoring.
- `core/collection.js`: form unlock and collection helpers.
- `core/evolution.js`: Baby/Teen/Mature evolution progression and close-score choice.
- `core/form-switch.js`: unlocked-form selection rules.
- `device-app/page/home/home.js`: current simulator UI behavior.
- `device-app/core/interactions.js`: FEED/PET/PLAY logic.
- `device-app/core/pets.js`: starter roster and pet switching.
- `scripts/stage-device-assets.mjs`: mirrors canonical pet packs into device app assets.
- `scripts/stage-watchface-assets.mjs`: mirrors canonical pet packs into watch-face assets.
- `scripts/render-form-preview.mjs`: renders the form-preview contact sheet for visual
  review.
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
- Starter sprites are improved from placeholders, but still need human visual review
  before commercial launch.
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

1. Use the existing deterministic core modules first:
   `core/scoring.js`, `core/collection.js`, `core/evolution.js`, and
   `core/form-switch.js`.
2. The Device Mini Program home UI already wires this flow; reproduce issues in the
   simulator and add focused tests before changing behavior.
3. Avoid claiming release readiness without the physical-watch gate.

If the user asks for release readiness:

1. Report that simulator-only testing cannot complete Phase 0.
2. Point to `docs/validation/phase-0-device-spike.md` and the human device gate docs.
3. Require round and square physical watch evidence.
