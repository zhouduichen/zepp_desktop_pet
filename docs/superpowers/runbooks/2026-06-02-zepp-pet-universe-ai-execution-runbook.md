# Zepp Pet Universe AI Execution Runbook

Date: 2026-06-02

## 1. Purpose

This runbook is the handoff manual for executing the Zepp Pet Universe project with
other AI coding agents. It does not replace the approved design or the Phase 0 plan.
It tells an orchestrator AI how to assign work, what each worker AI must verify, which
commands to run, and when to stop for a human-operated physical-watch check.

Read these documents before execution:

1. `docs/superpowers/specs/2026-06-02-zepp-pet-universe-design.md`
2. `docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-0-feasibility.md`
3. This runbook

The project must execute Phase 0 before a Phase 1 product build. Phase 0 is not a demo
that can be skipped. It is the gate that resolves undocumented or device-dependent
behavior.

## 2. Operating Principles

### 2.1 Work Sequentially In One Repository

Only one implementation AI writes to the repository at a time. Documentation research
and review agents may work independently, but implementation agents must not overlap
because they touch shared paths.

Use one feature worktree or one feature branch:

```powershell
git status --short
git branch --show-current
```

Do not implement on `master` unless the human explicitly requests it. A suitable branch
name is:

```text
feat/pet-universe-phase-0
```

### 2.2 Treat Official Documentation As The Source Of Truth

Zepp OS API details can change. When an API, manifest field, CLI command, or capability
is uncertain, verify it against official Zepp documentation before editing code.

Primary documentation:

- `https://docs.zepp.com/zh-cn/docs/watchface/watchface-quick-start/`
- `https://docs.zepp.com/zh-cn/docs/watchface/app-json/`
- `https://docs.zepp.com/zh-cn/docs/watchface/api/hmSensor/sensorId/STEP/`
- `https://docs.zepp.com/docs/watchface/api/hmUI/widget/IMG_ANIM/`
- `https://docs.zepp.com/docs/watchface/api/hmSetting/getDeviceInfo/`
- `https://docs.zepp.com/docs/watchface/api/hmSetting/getScreenType/`
- `https://docs.zepp.com/docs/reference/device-app-api/newAPI/sensor/Step/`
- `https://docs.zepp.com/docs/reference/device-app-api/newAPI/storage/localStorage/`

If code and documentation disagree, update the spike README with the observed
difference. Do not silently invent a compatibility shim.

### 2.3 Keep Runtime Boundaries Explicit

There are two distinct runtimes:

1. `watchface-spike/`: watch-face JavaScript runtime.
2. `device-app/`: Zepp OS Device Mini Program runtime.

Do not assume:

- shared LocalStorage keys are visible across the two runtimes;
- the watch face can dynamically download arbitrary sprite assets;
- watch-face widgets support the same events as device-app widgets;
- simulator success proves physical-watch behavior;
- a single watch-face package has identical AOD behavior across all devices.

Record unsupported behavior and use the fallback described in the design.

### 2.4 Optimize For A Lightweight Watch Face

The watch face is a display surface, not the full game engine:

- read the system step total only;
- do not enable GPS, heart rate, workout mode, background polling, or background timers;
- use finite `1-2` second animation sequences;
- stop on a static frame;
- render AOD as a static silhouette;
- move settlement, history, evolution scoring, and collection management into the Mini
  Program.

## 3. Roles

Use the following agents:

| Role | Responsibility | May Edit Files |
| --- | --- | --- |
| Orchestrator AI | sequence tasks, read reports, enforce gates | documentation only |
| Documentation Research AI | verify Zepp OS docs and flag schema/API mismatches | `docs/research/**`, `watchface-spike/README.md` |
| Core Logic AI | Tasks 1-3: tested deterministic profile and settlement logic | `device-app/core/**`, `tests/**`, root package files |
| Pet-Pack Pipeline AI | Task 4 and Task 8 measurement script | `core/**`, `pet-packs/**`, `scripts/**`, pack tests |
| Device-App AI | Tasks 5-6: Mini Program shell, storage adapter, settlement screen | `device-app/**` |
| Watch-Face Spike AI | Task 7: official scaffold, wake animation, STEP, AOD, tap experiment | `watchface-spike/**` |
| Review AI | spec compliance and code quality reviews after each implementation batch | read-only report |
| Human Device Operator | Task 9: install on physical watches and measure battery | validation docs only |
| Phase 1 Planning AI | write Phase 1 plan after the gate is complete | `docs/superpowers/plans/**` |

## 4. Global Stop Conditions

Every worker AI must stop and report `BLOCKED` when any of these conditions applies:

1. An official API or manifest schema contradicts the implementation plan.
2. A required Zeus command cannot be confirmed from official documentation or local
   CLI help.
3. A task requires a physical watch, a QR-code scan, account login, or manual Zepp App
   action.
4. The worker would need to assume cross-runtime storage or runtime asset downloading.
5. Tests fail for a reason outside the files owned by the current task.
6. The worker encounters unrelated local changes that conflict with its files.

The worker must not work around the blocker silently. Its report must include:

```text
STATUS: BLOCKED
Observed behavior:
Evidence:
Files changed:
Commands run:
Recommended next action:
```

## 5. Global Verification Commands

Use PowerShell. On this Windows machine, use `npm.cmd`, not `npm`, because the
PowerShell execution policy blocks `npm.ps1`.

Run these after each suitable batch:

```powershell
npm.cmd test
npm.cmd run validate:pack
npm.cmd run stage:watchface
npm.cmd run measure:assets
git diff --check
git status --short
```

Only run commands that exist at the current implementation stage.

## 6. Architecture Traps

### 6.1 Step Settlement Must Use Entitlement, Not Delta Since Last Open

Correct daily food settlement:

```js
const entitledFood = Math.min(DAILY_FOOD_CAP, Math.floor(currentSteps / FOOD_PER_STEPS));
const earnedFood = Math.max(0, entitledFood - earnedToday);
```

Incorrect approach:

```js
Math.floor((currentSteps - lastSettledSteps) / FOOD_PER_STEPS)
```

The incorrect version loses partial progress. Example:

```text
open at 950 steps -> earn 0
open at 1200 steps -> delta is 250 -> earn 0
```

The user should earn one food at `1200` steps because the daily total crossed `1000`.

Also handle:

- date rollover;
- a sensor total that decreases after reset or data correction;
- repeated opens at the same total;
- daily cap;
- compact `30`-day history retention.

### 6.2 Date Keys Use Local Calendar Dates

Use local calendar fields:

```js
date.getFullYear()
date.getMonth() + 1
date.getDate()
```

Do not use `toISOString()` for the daily reward date. UTC conversion can shift the day
near midnight.

### 6.3 Canonical Pet Packs And Staged Watch-Face Assets Are Different

Edit canonical assets only:

```text
pet-packs/pixel-cat/**
```

Generated mirrors:

```text
watchface-spike/assets/gt.r/pixel-cat/**
watchface-spike/assets/gt.s/pixel-cat/**
```

Never hand-edit generated mirrors. Run:

```powershell
npm.cmd run stage:watchface
```

The staging script must verify destination paths remain inside
`watchface-spike/assets/` before recursive deletion.

### 6.4 AI Image Generation Does Not Produce Release-Ready Sprites Automatically

Use AI image generation for candidate concepts and frame drafts. Then validate:

- silhouette consistency across frames;
- no jitter in body placement;
- `24-32 px` complexity;
- `4-6` flat colors per creature where practical;
- transparent edges;
- no painterly shading;
- AOD silhouette readability;
- frame count and FPS limits;
- copyright and trademark review.

Do not accept an attractive sprite sheet merely because it looks good at desktop size.
Inspect it at actual watch scale.

### 6.5 AOD Is A Separate Product Surface

AOD must be static and minimal:

- use a silhouette;
- verify the screen-off path on physical watches;
- target lit pixels at or below the official `10%` requirement;
- do not reuse a bright normal-mode frame;
- do not assume simulator AOD behavior matches devices.

### 6.6 Tap Interaction Is An Experiment Until Verified

The watch-face tap target may fail at build time or on-device runtime. If it fails:

1. Remove only the experimental event block.
2. Record the evidence in `watchface-spike/README.md`.
3. Keep the watch face as a display surface.
4. Move Feed, Pet, and Play interactions into the Mini Program.

Do not block the product on watch-face tap support.

### 6.7 Cross-Runtime State Sharing Is An Experiment Until Verified

If the watch face cannot read the Mini Program's selected pet and food state:

- keep the Mini Program as the collection manager;
- derive watch-face display state from STEP where useful;
- package selected-pet watch-face variants for V1;
- revisit Side Service or supported settings APIs only after official verification.

Do not use undocumented filesystem paths or shared storage keys.

### 6.8 Keep Phase 0 Deliberately Small

Phase 0 uses:

- one pet;
- one Baby form;
- wiring sprites first;
- one settlement screen;
- one watch-face animation;
- one tap experiment;
- one round and one square physical device.

Do not add the final roster, evolution scoring, community catalog, account system,
accessories, or Side Service during Phase 0.

## 7. Orchestrator Prompt

Copy this prompt into the AI responsible for coordinating the execution:

```text
You are the orchestrator for Zepp Pet Universe Phase 0.

Workspace: D:\huami\desktop_pet

Read:
1. docs/superpowers/specs/2026-06-02-zepp-pet-universe-design.md
2. docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-0-feasibility.md
3. docs/superpowers/runbooks/2026-06-02-zepp-pet-universe-ai-execution-runbook.md

Your job is to delegate implementation sequentially and enforce review gates. Do not
implement the full Phase 1 product. Do not allow multiple implementation workers to
edit the repository at the same time.

Execution order:
1. Create or verify an isolated feature worktree or branch.
2. Dispatch Documentation Research AI.
3. Dispatch Core Logic AI for Tasks 1-3.
4. Dispatch Pet-Pack Pipeline AI for Task 4.
5. Dispatch Device-App AI for Tasks 5-6.
6. Dispatch Watch-Face Spike AI for Task 7.
7. Dispatch Pet-Pack Pipeline AI for Task 8.
8. Run spec-compliance and code-quality review after each implementation batch.
9. Stop for the Human Device Operator at Task 9.
10. Dispatch Phase 1 Planning AI only after the physical-device gate is completed.

Use PowerShell and npm.cmd. Require every worker to report:
- STATUS: DONE / DONE_WITH_CONCERNS / BLOCKED
- summary
- files changed
- commands run
- exact test output summary
- commit SHA
- remaining risks

Enforce these rules:
- official Zepp OS docs are the source of truth;
- no undocumented cross-runtime storage assumptions;
- no infinite watch-face animations or background timers;
- no GPS, heart-rate, or workout mode;
- canonical pet assets live under pet-packs/, staged copies live under
  watchface-spike/assets/;
- unsupported tap or state-sharing behavior must be recorded with a fallback;
- physical-watch tasks require a human operator.

Before moving to the next batch, dispatch a read-only spec reviewer and then a read-only
code-quality reviewer. Require all findings to be fixed and re-reviewed.
```

## 8. Documentation Research AI Prompt

Run this before implementation and again before Task 7:

```text
You are the Zepp OS documentation research agent for Zepp Pet Universe Phase 0.

Workspace: D:\huami\desktop_pet

Read:
- docs/superpowers/specs/2026-06-02-zepp-pet-universe-design.md
- docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-0-feasibility.md
- docs/superpowers/runbooks/2026-06-02-zepp-pet-universe-ai-execution-runbook.md

Use official Zepp OS documentation only. Verify:
1. V3 Device Mini Program app.json target syntax for round and square devices.
2. Step sensor import, constructor, getCurrent(), and required permission.
3. LocalStorage API availability and behavior.
4. V3 watch-face app.json schema, watchface module path, main, and lockscreen fields.
5. Watch-face STEP access.
6. hmUI.widget.IMG_ANIM fields for finite repeats, restart-on-resume, and default frame.
7. hmSetting.getDeviceInfo() and hmSetting.getScreenType().
8. Whether watch-face widgets support addEventListener and CLICK_UP.
9. Whether official docs describe persistence or state sharing between a watch face and
   a Device Mini Program.
10. Zeus CLI commands for preview, build, and physical-device installation.

Create:
docs/research/zepp-os-phase-0-api-verification.md

For each item include:
- result: verified / contradicted / not documented
- exact official URL
- exact API or schema name
- implications for the plan

Do not edit implementation files. Do not infer undocumented capability. If the plan
contains a contradicted field, report BLOCKED and name the exact change needed.
```

## 9. Core Logic AI Prompt

This worker executes Tasks 1-3:

```text
You are the Core Logic implementation agent for Zepp Pet Universe Phase 0.

Workspace: D:\huami\desktop_pet

Read:
- docs/superpowers/specs/2026-06-02-zepp-pet-universe-design.md
- docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-0-feasibility.md
- docs/superpowers/runbooks/2026-06-02-zepp-pet-universe-ai-execution-runbook.md

Implement only Tasks 1, 2, and 3 from the Phase 0 plan. Follow TDD:
1. write each failing test;
2. run it and confirm the expected failure;
3. write the minimal implementation;
4. run npm.cmd test;
5. run git diff --check;
6. commit each completed task with the planned commit message.

Critical settlement requirements:
- use local YYYYMMDD calendar dates, not UTC;
- use daily entitlement floor(currentSteps / 1000) minus already-earned-today;
- cap earned food at 10 per day;
- preserve partial progress across repeated opens;
- avoid duplicate claims;
- retain only 30 activity days;
- normalize corrupt counters to non-negative integers.

Do not touch watchface-spike/, pet-packs/, or Mini Program UI files.

Report:
STATUS
commits
files changed
tests and output summary
self-review
remaining risks
```

## 10. Pet-Pack Pipeline AI Prompt

This worker executes Task 4, then returns for Task 8:

```text
You are the Pet-Pack Pipeline implementation agent for Zepp Pet Universe Phase 0.

Workspace: D:\huami\desktop_pet

Read:
- docs/superpowers/specs/2026-06-02-zepp-pet-universe-design.md
- docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-0-feasibility.md
- docs/superpowers/runbooks/2026-06-02-zepp-pet-universe-ai-execution-runbook.md

First execute Task 4 exactly. Use TDD for core/pet-pack.js. Generate deterministic
one-pixel wiring PNGs, validate the canonical pack, and stage generated mirrors into
watchface-spike/assets/gt.r/ and watchface-spike/assets/gt.s/.

Rules:
- canonical source: pet-packs/pixel-cat/**
- generated mirrors: watchface-spike/assets/**
- never hand-edit mirrors;
- staging must verify its resolved recursive-delete destination remains under
  watchface-spike/assets/;
- validate required actions, 8-20 frames, and 8-12 FPS;
- do not generate release art yet.

After Task 7 is complete, execute Task 8 exactly: add asset measurement and the physical
device validation template.

Run:
npm.cmd test
npm.cmd run validate:pack
npm.cmd run stage:watchface
npm.cmd run measure:assets
git diff --check

Commit after Task 4 and Task 8 separately. Report STATUS, commits, files, commands,
test summary, and risks.
```

## 11. Device-App AI Prompt

This worker executes Tasks 5-6:

```text
You are the Device Mini Program implementation agent for Zepp Pet Universe Phase 0.

Workspace: D:\huami\desktop_pet

Read:
- docs/research/zepp-os-phase-0-api-verification.md
- docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-0-feasibility.md
- docs/superpowers/runbooks/2026-06-02-zepp-pet-universe-ai-execution-runbook.md

Implement Tasks 5 and 6 only.

Requirements:
- use API_LEVEL 3.0 Device Mini Program APIs;
- use data:user.hd.step permission only if official docs confirm it;
- keep round and square layouts separate;
- load profile with corrupt-JSON recovery;
- settle food only when the Mini Program opens;
- render PET UNIVERSE, current steps, food balance, and a settlement note;
- do not add GPS, heart rate, workout tracking, timers, background work, evolution,
  community, or additional pages;
- use npm.cmd on Windows.

Verify:
npm.cmd install
npm.cmd install --prefix device-app
npm.cmd test
git diff --check

Then run Zeus preview from device-app/. If Zeus needs manual UI interaction or fails
for an environment reason, report the command output and stop with DONE_WITH_CONCERNS
or BLOCKED. Do not fabricate a preview result.

Commit Tasks 5 and 6 separately. Report STATUS, commits, files, commands, exact
verification summary, and remaining risks.
```

## 12. Watch-Face Spike AI Prompt

This worker executes Task 7:

```text
You are the Watch-Face Spike implementation agent for Zepp Pet Universe Phase 0.

Workspace: D:\huami\desktop_pet

Read:
- docs/research/zepp-os-phase-0-api-verification.md
- docs/superpowers/specs/2026-06-02-zepp-pet-universe-design.md
- docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-0-feasibility.md
- docs/superpowers/runbooks/2026-06-02-zepp-pet-universe-ai-execution-runbook.md

Implement Task 7 only.

Before editing, reconcile the plan against the official docs. If any field is
contradicted, use the official value and document the discrepancy in
watchface-spike/README.md.

Prototype requirements:
- V3 watch-face app.json;
- STEP current value;
- screen width from hmSetting.getDeviceInfo();
- AOD detection from hmSetting.getScreenType();
- one finite 8-frame wake animation;
- repeat_count = 1;
- display_on_restart = true;
- default_frame_index = 0;
- no timers;
- no infinite loops;
- no GPS, heart-rate, workout mode, network, or dynamic downloads;
- experimental transparent FILL_RECT tap target and CLICK_UP listener only if official
  docs or the build permit it.

Build with the official Zeus command. If the tap listener fails, remove only the tap
listener block, record the evidence, rebuild, and mark watch-face tap as unsupported.
If AOD packaging, square packaging, persistence, or state sharing remains unverified,
record it as unverified for physical-device testing. Do not infer support.

Run:
npm.cmd run stage:watchface
Set-Location watchface-spike
zeus build
Set-Location ..
git diff --check

Commit once. Report STATUS, commit, files, commands, build output summary, capability
matrix, and remaining physical-device checks.
```

## 13. Spec Compliance Review Prompt

Run after each implementation batch:

```text
You are the read-only spec-compliance reviewer for Zepp Pet Universe Phase 0.

Workspace: D:\huami\desktop_pet
Review commits: {{COMMIT_RANGE}}
Batch scope: {{TASK_IDS}}

Read:
- docs/superpowers/specs/2026-06-02-zepp-pet-universe-design.md
- docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-0-feasibility.md
- docs/superpowers/runbooks/2026-06-02-zepp-pet-universe-ai-execution-runbook.md

Inspect the diff and report only:
1. missing requirements;
2. behavior that exceeds Phase 0 scope;
3. undocumented Zepp OS assumptions;
4. incorrect file ownership or runtime boundary violations;
5. missing tests or missing evidence.

Pay special attention to:
- daily-entitlement settlement rather than delta settlement;
- local dates rather than UTC;
- no watch-face timers or infinite animation;
- no GPS, heart rate, or workout mode;
- no assumed watch-face / Mini Program shared storage;
- canonical pet-pack versus staged asset mirrors;
- physical-device claims that lack evidence.

Return:
STATUS: APPROVED or CHANGES_REQUIRED
Findings ordered by severity with file and line references.
```

## 14. Code Quality Review Prompt

Run only after the spec reviewer approves:

```text
You are the read-only code-quality reviewer for Zepp Pet Universe Phase 0.

Workspace: D:\huami\desktop_pet
Review commits: {{COMMIT_RANGE}}

Inspect the diff for correctness, maintainability, and reliability. Do not redesign the
product. Report:
1. bugs and edge cases;
2. unsafe recursive file operations;
3. brittle path handling;
4. test gaps;
5. corrupt-data recovery issues;
6. Zepp resource leaks or lifecycle mistakes;
7. unnecessary complexity.

Check specifically:
- sensor values that decrease or reset;
- date rollover;
- repeated settlement;
- staging destinations before rm({ recursive: true });
- validation of asset existence;
- round/square asset paths;
- AOD branch returns early;
- no background timers;
- clear error messages from scripts.

Return:
STATUS: APPROVED or CHANGES_REQUIRED
Findings ordered by severity with file and line references.
```

## 15. Human Device Operator Prompt

Task 9 cannot be completed honestly by a code-only AI. Give this checklist to the
person with the watches:

```text
You are performing the Zepp Pet Universe Phase 0 physical-device gate.

Workspace: D:\huami\desktop_pet

Read:
- docs/validation/phase-0-device-spike.md
- watchface-spike/README.md

Use one round Zepp OS API_LEVEL >= 3.0 watch and one square Zepp OS API_LEVEL >= 3.0
watch. Install the watch-face spike and the Device Mini Program using the official Zeus
workflow.

For each watch, record:
1. exact model, resolution, and Zepp OS version;
2. whether STEP shows the current daily total;
3. whether raise-to-wake plays one short animation and then stops;
4. whether the static frame remains visible after the animation;
5. whether tapping the pet triggers a response;
6. whether AOD displays a static low-pixel silhouette;
7. whether the Mini Program settles food once without duplicate claims;
8. whether any supported state-sharing behavior exists between watch face and Mini
   Program;
9. package bytes, representative pet-pack bytes, memory observations, and AOD lit-pixel
   ratio;
10. baseline-face and pet-face battery observations over comparable 24-hour periods
    using the same AOD and raise-to-wake settings.

Update:
docs/validation/phase-0-device-spike.md
watchface-spike/README.md

Do not generalize one device's battery delta to all models. State what was measured.
Select the fallback checkboxes and make an explicit Go / No-Go recommendation.
```

## 16. AI Sprite Generation Prompt

Use this only after wiring assets work and before physical visual testing:

```text
Create a release-candidate sprite sequence for Zepp Pet Universe Phase 0.

Subject: Baby form of an orange pixel cat virtual pet.
Audience: international smartwatch users.
Art direction: colorful low-resolution pixel mascot, not realistic illustration.

Constraints:
- apparent sprite complexity: 24-32 px;
- flat 4-6 color palette where practical;
- strong readable silhouette at wrist-viewing distance;
- transparent background;
- consistent anchor point, scale, and body position across frames;
- no fur texture, painterly shading, gradients, accessories, logos, text, or watermark;
- friendly companion expression;
- AOD silhouette must remain recognizable with minimal lit pixels.

Produce:
- static.png
- aod.png
- wake_0.png ... wake_7.png at 8 FPS
- tap_0.png ... tap_7.png at 8 FPS
- feed_0.png ... feed_11.png at 10 FPS
- happy_0.png ... happy_9.png at 10 FPS
- no_food_0.png ... no_food_7.png at 8 FPS

Motion direction:
- Wake: eyes open, tiny stretch, return to calm.
- Tap: look toward the user, slight head tilt, return to calm.
- Feed: approach a simple food dot, bite, return to calm.
- Happy: one compact bounce, return to calm.
- No Food: gentle curious tilt, no sadness or punishment.

The first and last frame of each animation must transition cleanly to static.png.
wake_0.png must be suitable as a minimal AOD-safe fallback frame.
```

After generation, the implementation AI must still crop, align, inspect, and validate
the files. Do not copy a generated contact sheet directly into the watch-face assets.

## 17. Phase 1 Planning AI Prompt

Run only after the Human Device Operator completes Task 9:

```text
You are the Phase 1 planning agent for Zepp Pet Universe.

Workspace: D:\huami\desktop_pet

Read:
- docs/superpowers/specs/2026-06-02-zepp-pet-universe-design.md
- docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-0-feasibility.md
- docs/superpowers/runbooks/2026-06-02-zepp-pet-universe-ai-execution-runbook.md
- docs/validation/phase-0-device-spike.md
- watchface-spike/README.md

Write:
docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-1-product.md

Use the measured Phase 0 result as the architecture constraint. Do not assume direct
watch-face / Mini Program sharing unless the device gate verified it. Do not assume
watch-face tapping unless the device gate verified it.

The plan must include:
- Active / Steady / Explorer scoring with deterministic fixtures;
- Baby, Teen, mature, Rare, and Secret collection data model;
- close-score user choice;
- 8-10 reviewed launch pets;
- required and optional action protocol;
- collection, pet detail, 7-day history, and form-switch Mini Program pages;
- local-storage migration and corrupt-data recovery;
- verified watch-face integration path or selected-pet variant fallback;
- measured package, memory, AOD, and battery budgets derived from Phase 0;
- English-first UI;
- round and square verification;
- AI sprite generation, validation, and human visual-review workflow;
- release checklist.

Break work into small TDD tasks with exact paths, commands, expected output, and commit
messages. Run a placeholder scan and git diff --check before committing the plan.
```

## 18. Completion Criteria

Phase 0 is complete only when:

- Tasks 1-8 are committed and reviewed;
- a human has completed Task 9 on round and square physical devices;
- unsupported capabilities are documented with fallbacks;
- battery and asset measurements are recorded;
- the Go / No-Go decision is explicit;
- the Phase 1 plan uses measured results rather than assumptions.

Do not call the product ready for release at the end of Phase 0. The output is a
verified architecture and a measured implementation path.
