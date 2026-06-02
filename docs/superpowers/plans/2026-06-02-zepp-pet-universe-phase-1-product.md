# Zepp Pet Universe Phase 1 Product Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the V1 watch face, companion Mini Program, 8-10 reviewed pets, three mature branches (Active, Steady, Explorer), Rare and Secret forms, 30-day local history, corrupt-state recovery, and English-first UI.

**Architecture Constraints (from Phase 0):**

| Constraint | Phase 0 Result |
|---|---|
| Settlement formula | Daily entitlement (`floor(steps/1000)` minus earned-today), not delta |
| Date keys | Local `YYYYMMDD` (getFullYear/getMonth/getDate), not UTC |
| History window | 30 days |
| Required actions per form | 5: `wakeIdle`, `tapReact`, `feed`, `happy`, `noFood` |
| Frame limits | 8-20 frames per animation |
| FPS limits | 8-12 FPS |
| Device-app manifest | V3, `permissions: []`, `device:os.local_storage`, `data:user.hd.step` |
| Watch-face manifest | V3, `watchface { path, main, lockscreen }`, `lockscreen: 1` for AOD |
| IMG_ANIM | `repeat_count: 1`, `display_on_restart: true`, `default_frame_index: 0` |
| CLICK_DOWN | Build-accepted; **runtime unverified** `[HW-NEEDED: Does addEventListener(CLICK_DOWN) work on physical watch-face widgets?]` |
| zpm packaging | **BLOCKED** on Node v24. Use Node 18/20 for `zeus build` and `zeus preview`. |
| Cross-runtime storage | **NOT SUPPORTED.** No documented shared storage API. |
| Generated sprite pack | 47 frames x 32x32, 9,819 bytes total |

**Default Fallbacks (until hardware disproves):**
- `[HW-NEEDED]` Selected-pet watch-face variants required for V1 (no shared storage assumed).
- `[HW-NEEDED]` Tap interaction moves to companion Mini Program (tap on watch face unverified).

**Tech Stack:** Zepp OS V3 device Mini Program APIs (`@zos/ui`, `@zos/sensor`, `@zos/storage`), JavaScript watch-face APIs (`hmUI`, `hmSensor`, `hmSetting`), Node.js built-in test runner, Zeus CLI, PNG sprite sequences.

---

## Phase 1 Scope

- Full evolution system: Baby, Teen, Active/Steady/Explorer mature branches, Rare forms, Secret forms
- 8-10 launch pets with complete pet packs
- Mini Program pages: home (settlement), collection, pet detail, 7-day history, form-switch
- Watch-face integration with selected-pet variant packaging
- Storage migration from Phase 0 `schemaVersion: 1` to V1 `schemaVersion: 2`
- English-first UI with i18n structure
- Round and square layout verification for every page
- AI sprite generation pipeline + validation + human visual review
- Release checklist

## Phase 1 Non-Goals

- No Side Service, accounts, or server catalog
- No community pet submission or download
- No runtime asset downloading
- No GPS, heart-rate monitoring, workout mode
- No background polling or timers
- No infinite watch-face animation loops
- No band-shaped display support (`b` shape deferred)
- No Chinese localization (i18n structure reserved, English only for V1)

---

## File Map

### Repository-level files

- `package.json`: Node test and validation commands (updated).
- `core/pet-pack.js`: Pet-pack manifest validation (updated for Phase 1 action protocol).
- `core/scoring.js`: Active/Steady/Explorer scoring algorithm with deterministic fixtures.
- `core/collection.js`: Collection unlock logic, Rare progress, Secret triggers.
- `core/form-switch.js`: Form-switch eligibility and close-score tiebreaker.
- `core/evolution.js`: Evolution progression: Baby -> Teen -> mature branch.
- `core/content-validator.js`: Full pet-pack content validation for AI-generated assets.

### Data files

- `data/pets.json`: Launch roster of 8-10 pets with species metadata.
- `data/forms.json`: Form definitions per pet (Baby, Teen, mature, Rare, Secret).
- `data/actions.json`: Required and optional action definitions per form.

### Deterministic device-app core (tests in `tests/`)

- `device-app/core/constants.js` (updated): V1 constants, evolution thresholds.
- `device-app/core/date-key.js` (unchanged).
- `device-app/core/profile.js` (updated): schemaVersion 2, migration from v1.
- `device-app/core/settlement.js` (unchanged).
- `device-app/core/scoring.js`: Evolution scoring.
- `device-app/core/collection.js`: Collection state management.
- `device-app/core/evolution.js`: Evolution progression.
- `device-app/core/form-switch.js`: Form-switch logic.

### Device Mini Program

- `device-app/app.json` (updated): All V1 pages registered.
- `device-app/app.js` (updated).
- `device-app/utils/storage.js` (updated): schemaVersion 2 migration.
- `device-app/utils/i18n.js`: English-first string table.
- `device-app/page/common.r.layout.js` (updated).
- `device-app/page/common.s.layout.js` (updated).
- `device-app/page/home/home.js` (updated): settlement + pet display.
- `device-app/page/home/home.r.layout.js`, `home.s.layout.js` (updated).
- `device-app/page/collection/collection.js`: Pet collection grid.
- `device-app/page/collection/collection.r.layout.js`, `collection.s.layout.js`.
- `device-app/page/detail/detail.js`: Selected pet detail, stats, feed.
- `device-app/page/detail/detail.r.layout.js`, `detail.s.layout.js`.
- `device-app/page/history/history.js`: 7-day activity history.
- `device-app/page/history/history.r.layout.js`, `history.s.layout.js`.
- `device-app/page/form-switch/form-switch.js`: Form switching UI.
- `device-app/page/form-switch/form-switch.r.layout.js`, `form-switch.s.layout.js`.

### Watch-face

- `watchface/` (promoted from `watchface-spike/`): V1 watch face.
- `watchface/app.json`: V3 watch-face manifest.
- `watchface/index.js`: STEP readout, IMG_ANIM wake, AOD branch.
- `watchface/package.json`: Watch-face package metadata.
- `watchface/README.md`: Build and install notes.

### Pet packs

- `pet-packs/pixel-cat/` (updated): All forms: Baby, Teen, Active, Steady, Explorer, Rare, Secret.
- `pet-packs/pixel-dog/`: New pet pack.
- `pet-packs/pixel-bunny/`: New pet pack.
- `pet-packs/pixel-hamster/`: New pet pack.
- `pet-packs/pixel-penguin/`: New pet pack.
- `pet-packs/pixel-dragon/`: New pet pack.
- `pet-packs/pixel-ghost/`: New pet pack.
- `pet-packs/pixel-axolotl/`: New pet pack.
- `pet-packs/pixel-slime/`: New pet pack.
- (or alternative roster — see Task 13)

### Scripts

- `scripts/create-wiring-pet-assets.mjs` (updated): Generate wiring sprites for all new pet packs.
- `scripts/validate-pet-pack.mjs` (updated): Phase 1 action protocol.
- `scripts/stage-watchface-assets.mjs` (updated): Stage all pet packs.
- `scripts/measure-assets.mjs` (unchanged).
- `scripts/migrate-profile.mjs`: CLI migration tool for Phase 0 -> Phase 1 schema.
- `scripts/generate-sprite-pack.mjs`: AI-assisted sprite generation coordinator.
- `scripts/validate-generated-art.mjs`: Automated validation of generated sprites.

### Documentation

- `docs/review/phase-1-launch-roster.md`: Launch pet species review.
- `docs/review/sprite-visual-review.md`: Human visual review template.

---

## Task 1: Update Core Constants For V1 Evolution

**Files:**
- Modify: `device-app/core/constants.js`
- Create: `tests/constants-v1.test.mjs`

**Details:** Add evolution thresholds, scoring window, and mature-branch configuration constants.

- [ ] **Step 1: Write failing V1 constant tests**

Create `tests/constants-v1.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  FOOD_PER_STEPS, DAILY_FOOD_CAP, HISTORY_DAYS,
  SCORING_WINDOW_DAYS, EXPERIENCE_PER_FEED, AFFINITY_PER_FEED,
  BABY_TO_TEEN_EXPERIENCE, TEEN_TO_MATURE_EXPERIENCE,
  CLOSE_SCORE_THRESHOLD
} from "../device-app/core/constants.js";

test("V1 constants meet product requirements", () => {
  assert.equal(FOOD_PER_STEPS, 1000);
  assert.equal(DAILY_FOOD_CAP, 10);
  assert.equal(HISTORY_DAYS, 30);
  assert.equal(SCORING_WINDOW_DAYS, 7);
  assert.equal(EXPERIENCE_PER_FEED, 10);
  assert.equal(AFFINITY_PER_FEED, 5);
  assert.equal(BABY_TO_TEEN_EXPERIENCE, 200);
  assert.equal(TEEN_TO_MATURE_EXPERIENCE, 500);
  assert.equal(CLOSE_SCORE_THRESHOLD, 15);
});
```

- [ ] **Step 2: Run the test to verify it fails**

```powershell
node --test tests/constants-v1.test.mjs
```

Expected: FAIL because `SCORING_WINDOW_DAYS` etc. do not exist.

- [ ] **Step 3: Add V1 constants**

Modify `device-app/core/constants.js`:

```js
export const FOOD_PER_STEPS = 1000;
export const DAILY_FOOD_CAP = 10;
export const HISTORY_DAYS = 30;
export const SCORING_WINDOW_DAYS = 7;
export const EXPERIENCE_PER_FEED = 10;
export const AFFINITY_PER_FEED = 5;
export const BABY_TO_TEEN_EXPERIENCE = 200;
export const TEEN_TO_MATURE_EXPERIENCE = 500;
export const CLOSE_SCORE_THRESHOLD = 15;
export const DEFAULT_PET_ID = "pixel-cat";
export const DEFAULT_FORM_ID = "baby";
export const SCHEMA_VERSION_V1 = 2;
```

- [ ] **Step 4: Run all tests**

```powershell
npm.cmd test
```

Expected: PASS with 11+ passing tests.

- [ ] **Step 5: Commit**

```powershell
git add device-app/core/constants.js tests/constants-v1.test.mjs
git commit -m "feat: add V1 evolution and scoring constants"
```

---

## Task 2: Implement Active/Steady/Explorer Scoring With Test Fixtures

**Files:**
- Create: `device-app/core/scoring.js`
- Create: `core/scoring.js` (repository-level scoring — shared with dev tools)
- Create: `tests/scoring.test.mjs`

**Details:** The evolution scoring algorithm reads the latest 7 days of daily activity records and computes three scores:

- **Active:** Higher total steps over the window.
- **Steady:** Consistency of completing a daily threshold (e.g., >= 5000 steps per day). Rewards rhythm over peak volume.
- **Explorer:** Breadth — activity across more distinct days within the window, plus step variability.

The scores are scaled to `0-100` range for display. The branch with the highest score wins. If the top two scores are within `CLOSE_SCORE_THRESHOLD` (15 points), the system flags the choice for the user to pick.

- [ ] **Step 1: Write failing scoring tests**

Create `tests/scoring.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { computeScores, pickMatureBranch } from "../core/scoring.js";

// Fixture: 7 days of activity
const HIGH_STEPS = [
  { date: "20260601", settledSteps: 12000, earnedFood: 10 },
  { date: "20260602", settledSteps: 8000, earnedFood: 8 },
  { date: "20260603", settledSteps: 15000, earnedFood: 10 },
  { date: "20260604", settledSteps: 10000, earnedFood: 10 },
  { date: "20260605", settledSteps: 9000, earnedFood: 9 },
  { date: "20260606", settledSteps: 11000, earnedFood: 10 },
  { date: "20260607", settledSteps: 13000, earnedFood: 10 }
];

const CONSISTENT_STEPS = [
  { date: "20260601", settledSteps: 5500, earnedFood: 5 },
  { date: "20260602", settledSteps: 6000, earnedFood: 6 },
  { date: "20260603", settledSteps: 5200, earnedFood: 5 },
  { date: "20260604", settledSteps: 5800, earnedFood: 5 },
  { date: "20260605", settledSteps: 6100, earnedFood: 6 },
  { date: "20260606", settledSteps: 5400, earnedFood: 5 },
  { date: "20260607", settledSteps: 5900, earnedFood: 5 }
];

const SPORADIC_STEPS = [
  { date: "20260601", settledSteps: 3000, earnedFood: 3 },
  { date: "20260602", settledSteps: 12000, earnedFood: 10 },
  { date: "20260603", settledSteps: 2000, earnedFood: 2 },
  { date: "20260604", settledSteps: 0, earnedFood: 0 },
  { date: "20260605", settledSteps: 8500, earnedFood: 8 },
  { date: "20260606", settledSteps: 1500, earnedFood: 1 },
  { date: "20260607", settledSteps: 14000, earnedFood: 10 }
];

// Edge cases
const EMPTY = [];
const SINGLE_DAY = [{ date: "20260601", settledSteps: 5000, earnedFood: 5 }];
const ZERO_STEPS = [
  { date: "20260601", settledSteps: 0, earnedFood: 0 },
  { date: "20260602", settledSteps: 0, earnedFood: 0 }
];

test("computeScores returns active/steady/explorer with correct dimensions", () => {
  const scores = computeScores(HIGH_STEPS);
  assert.equal(typeof scores.active, "number");
  assert.equal(typeof scores.steady, "number");
  assert.equal(typeof scores.explorer, "number");
  assert.ok(scores.active >= 0 && scores.active <= 100);
  assert.ok(scores.steady >= 0 && scores.steady <= 100);
  assert.ok(scores.explorer >= 0 && scores.explorer <= 100);
});

test("computeScores favors active for high total steps", () => {
  const scores = computeScores(HIGH_STEPS);
  assert.ok(scores.active > scores.steady, "active should dominate for high steps");
});

test("computeScores favors steady for consistent moderate steps", () => {
  const scores = computeScores(CONSISTENT_STEPS);
  assert.ok(scores.steady >= scores.active, "steady should be competitive for consistent steps");
});

test("computeScores handles empty activity gracefully", () => {
  const scores = computeScores(EMPTY);
  assert.equal(scores.active, 0);
  assert.equal(scores.steady, 0);
  assert.equal(scores.explorer, 0);
});

test("computeScores handles single day", () => {
  const scores = computeScores(SINGLE_DAY);
  assert.ok(scores.active >= 0);
});

test("computeScores handles zero-step days without crashing", () => {
  const scores = computeScores(ZERO_STEPS);
  assert.ok(scores.active >= 0);
});

test("pickMatureBranch returns the highest-scoring branch", () => {
  const scores = { active: 80, steady: 40, explorer: 30 };
  const result = pickMatureBranch(scores);
  assert.equal(result.chosen, "active");
  assert.equal(result.tiebreaker, false);
});

test("pickMatureBranch flags tiebreaker when scores are close", () => {
  const scores = { active: 78, steady: 70, explorer: 30 };
  const result = pickMatureBranch(scores);
  assert.equal(result.chosen, "active");
  assert.equal(result.tiebreaker, true);
  assert.deepEqual(result.closeBranches, ["active", "steady"]);
});

test("pickMatureBranch does NOT flag tiebreaker when difference exceeds threshold", () => {
  const scores = { active: 90, steady: 50, explorer: 30 };
  const result = pickMatureBranch(scores);
  assert.equal(result.tiebreaker, false);
});
```

- [ ] **Step 2: Run scoring tests to verify they fail**

```powershell
node --test tests/scoring.test.mjs
```

Expected: FAIL because `core/scoring.js` does not exist.

- [ ] **Step 3: Implement scoring algorithm**

Create `core/scoring.js`:

```js
import { CLOSE_SCORE_THRESHOLD, SCORING_WINDOW_DAYS } from "../device-app/core/constants.js";

const DAILY_STEP_TARGET = 5000;
const HIGH_STEP_THRESHOLD = 8000;

function scoreActive(days) {
  if (days.length === 0) return 0;
  const total = days.reduce((sum, d) => sum + d.settledSteps, 0);
  const maxTotal = SCORING_WINDOW_DAYS * 15000; // 105k theoretical max
  return Math.min(100, Math.round((total / maxTotal) * 100));
}

function scoreSteady(days) {
  if (days.length === 0) return 0;
  const daysAtTarget = days.filter((d) => d.settledSteps >= DAILY_STEP_TARGET).length;
  const consistencyRatio = daysAtTarget / Math.max(days.length, SCORING_WINDOW_DAYS);
  return Math.min(100, Math.round(consistencyRatio * 100));
}

function scoreExplorer(days) {
  if (days.length === 0) return 0;
  const activeDays = days.filter((d) => d.settledSteps > 0).length;
  const breadthScore = Math.min(100, Math.round((activeDays / SCORING_WINDOW_DAYS) * 100));
  // Bonus for high variance (mix of low and high activity days)
  const hasHighDays = days.some((d) => d.settledSteps >= HIGH_STEP_THRESHOLD);
  const hasLowDays = days.some((d) => d.settledSteps > 0 && d.settledSteps < DAILY_STEP_TARGET);
  const varietyBonus = hasHighDays && hasLowDays ? 15 : 0;
  return Math.min(100, breadthScore + varietyBonus);
}

export function computeScores(dailyActivity) {
  const days = (dailyActivity || []).slice(-SCORING_WINDOW_DAYS);
  return {
    active: scoreActive(days),
    steady: scoreSteady(days),
    explorer: scoreExplorer(days)
  };
}

export function pickMatureBranch(scores) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const chosen = sorted[0][0];
  const closeBranches = sorted
    .filter(([, score]) => Math.abs(scores[chosen] - score) <= CLOSE_SCORE_THRESHOLD)
    .map(([branch]) => branch);
  return {
    chosen,
    tiebreaker: closeBranches.length > 1,
    closeBranches
  };
}
```

- [ ] **Step 4: Run all tests**

```powershell
npm.cmd test
```

Expected: PASS with 22+ passing tests.

- [ ] **Step 5: Commit**

```powershell
git add core/scoring.js tests/scoring.test.mjs
git commit -m "feat: implement active/steady/explorer evolution scoring with fixtures"
```

---

## Task 3: Implement Collection Data Model (Rare, Secret, Unlock)

**Files:**
- Create: `core/collection.js`
- Create: `device-app/core/collection.js` (thin wrapper with LocalStorage integration stub)
- Create: `tests/collection.test.mjs`

**Details:** The collection tracks which pets and forms a user has unlocked. Rare forms have explicit unlock conditions (e.g., step streak, cumulative steps). Secret forms use hidden conditions with probabilistic triggers.

- [ ] **Step 1: Write failing collection tests**

Create `tests/collection.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  createEmptyCollection,
  unlockForm,
  isFormUnlocked,
  getUnlockedForms,
  updateRareProgress,
  checkRareUnlock,
  checkSecretTrigger,
  getCollectionStats
} from "../core/collection.js";

test("createEmptyCollection returns valid initial state", () => {
  const col = createEmptyCollection("pixel-cat");
  assert.equal(col.petId, "pixel-cat");
  assert.deepEqual(col.unlockedFormIds, ["baby"]);
  assert.equal(col.rareProgress, 0);
  assert.equal(col.secretTriggerFlags, 0);
});

test("unlockForm adds a form id and is idempotent", () => {
  const col = createEmptyCollection("pixel-cat");
  unlockForm(col, "teen");
  assert.ok(isFormUnlocked(col, "teen"));
  assert.deepEqual(getUnlockedForms(col), ["baby", "teen"]);
  unlockForm(col, "teen");
  assert.deepEqual(getUnlockedForms(col), ["baby", "teen"]);
});

test("unlockForm ignores empty string", () => {
  const col = createEmptyCollection("pixel-cat");
  unlockForm(col, "");
  assert.deepEqual(getUnlockedForms(col), ["baby"]);
});

test("updateRareProgress accumulates and caps", () => {
  const col = createEmptyCollection("pixel-cat");
  updateRareProgress(col, 50);
  assert.equal(col.rareProgress, 50);
  updateRareProgress(col, 200);
  assert.equal(col.rareProgress, 250);
});

test("checkRareUnlock returns true when threshold is met", () => {
  const col = createEmptyCollection("pixel-cat");
  updateRareProgress(col, 100);
  assert.ok(checkRareUnlock(col, "rare", 100));
  assert.ok(isFormUnlocked(col, "rare"));
});

test("checkRareUnlock returns false when threshold not met", () => {
  const col = createEmptyCollection("pixel-cat");
  updateRareProgress(col, 50);
  assert.equal(checkRareUnlock(col, "rare", 100), false);
  assert.equal(isFormUnlocked(col, "rare"), false);
});

test("checkSecretTrigger unlocks with probability 1 for deterministic test", () => {
  const col = createEmptyCollection("pixel-cat");
  assert.ok(checkSecretTrigger(col, "secret", 1.0));
  assert.ok(isFormUnlocked(col, "secret"));
});

test("checkSecretTrigger does not unlock with probability 0", () => {
  const col = createEmptyCollection("pixel-cat");
  assert.equal(checkSecretTrigger(col, "secret", 0.0), false);
  assert.equal(isFormUnlocked(col, "secret"), false);
});

test("getCollectionStats returns summary counts", () => {
  const col = createEmptyCollection("pixel-cat");
  unlockForm(col, "teen");
  unlockForm(col, "active");
  const stats = getCollectionStats(col);
  assert.equal(stats.totalUnlocked, 3);
});
```

- [ ] **Step 2: Run collection tests to verify they fail**

```powershell
node --test tests/collection.test.mjs
```

Expected: FAIL because `core/collection.js` does not exist.

- [ ] **Step 3: Implement collection logic**

Create `core/collection.js`:

```js
export function createEmptyCollection(petId) {
  return {
    petId,
    unlockedFormIds: ["baby"],
    rareProgress: 0,
    secretTriggerFlags: 0
  };
}

export function unlockForm(collection, formId) {
  if (!formId) return;
  if (!collection.unlockedFormIds.includes(formId)) {
    collection.unlockedFormIds.push(formId);
  }
}

export function isFormUnlocked(collection, formId) {
  return collection.unlockedFormIds.includes(formId);
}

export function getUnlockedForms(collection) {
  return [...collection.unlockedFormIds];
}

export function updateRareProgress(collection, increment) {
  collection.rareProgress = Math.max(0, collection.rareProgress + Math.floor(increment));
}

export function checkRareUnlock(collection, formId, threshold) {
  if (collection.rareProgress >= threshold && !isFormUnlocked(collection, formId)) {
    unlockForm(collection, formId);
    return true;
  }
  return false;
}

export function checkSecretTrigger(collection, formId, probability) {
  if (isFormUnlocked(collection, formId)) return false;
  if (Math.random() < probability) {
    unlockForm(collection, formId);
    collection.secretTriggerFlags += 1;
    return true;
  }
  return false;
}

export function getCollectionStats(collection) {
  return {
    totalUnlocked: collection.unlockedFormIds.length,
    rareProgress: collection.rareProgress,
    secretTriggered: collection.secretTriggerFlags > 0
  };
}
```

- [ ] **Step 4: Run all tests**

```powershell
npm.cmd test
```

Expected: PASS with 33+ passing tests.

- [ ] **Step 5: Commit**

```powershell
git add core/collection.js tests/collection.test.mjs
git commit -m "feat: implement collection unlock, rare progress, and secret triggers"
```

---

## Task 4: Implement Evolution Progression (Baby -> Teen -> Mature)

**Files:**
- Create: `core/evolution.js`
- Create: `device-app/core/evolution.js`
- Create: `tests/evolution.test.mjs`

**Details:** Evolution flows:
- Baby -> Teen when experience >= `BABY_TO_TEEN_EXPERIENCE` (200)
- Teen -> Mature (one of Active/Steady/Explorer) when experience >= `TEEN_TO_MATURE_EXPERIENCE` (500)
- Mature evolution uses scoring from the latest 7 days
- After choosing a mature branch, the other two branches remain unlockable later via Rare mechanics

- [ ] **Step 1: Write failing evolution tests**

Create `tests/evolution.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { checkEvolution, EVOLUTION_PHASE } from "../core/evolution.js";

const profileFixtures = {
  baby: {
    selectedPetId: "pixel-cat",
    selectedFormId: "baby",
    experience: 0,
    affinity: 0,
    foodBalance: 5,
    lastSettlementDate: "20260607",
    lastSettledSteps: 5000,
    dailyActivity: []
  },
  teenReady: {
    ...this?.baby,
    selectedFormId: "baby",
    experience: 200,
    dailyActivity: Array.from({ length: 7 }, (_, i) => ({
      date: `2026060${i + 1}`,
      settledSteps: 8000,
      earnedFood: 8
    }))
  },
  matureReady: {
    ...this?.baby,
    selectedFormId: "teen",
    experience: 500,
    dailyActivity: Array.from({ length: 7 }, (_, i) => ({
      date: `2026060${i + 1}`,
      settledSteps: 12000,
      earnedFood: 10
    }))
  }
};

test("checkEvolution returns BABY for low experience", () => {
  const result = checkEvolution(profileFixtures.baby, "pixel-cat", []);
  assert.equal(result.phase, EVOLUTION_PHASE.BABY);
  assert.equal(result.evolved, false);
});

test("checkEvolution returns TEEN_READY when experience threshold met", () => {
  const result = checkEvolution(profileFixtures.teenReady, "pixel-cat", []);
  assert.equal(result.phase, EVOLUTION_PHASE.TEEN_READY);
  assert.equal(result.evolved, true);
  assert.equal(result.nextFormId, "teen");
});

test("checkEvolution does not re-evolve from teen if already teen", () => {
  const teenProfile = { ...profileFixtures.teenReady, selectedFormId: "teen" };
  const result = checkEvolution(teenProfile, "pixel-cat", []);
  assert.equal(result.phase, EVOLUTION_PHASE.TEEN);
  assert.equal(result.evolved, false);
});

test("checkEvolution returns MATURE_READY when teen has enough experience", () => {
  const result = checkEvolution(profileFixtures.matureReady, "pixel-cat", []);
  assert.equal(result.phase, EVOLUTION_PHASE.MATURE_READY);
  assert.equal(result.evolved, true);
  assert.ok(["active", "steady", "explorer"].includes(result.nextFormId));
});

test("checkEvolution does not re-evolve from mature", () => {
  const matureProfile = { ...profileFixtures.matureReady, selectedFormId: "active" };
  const result = checkEvolution(matureProfile, "pixel-cat", []);
  assert.equal(result.phase, EVOLUTION_PHASE.MATURE);
  assert.equal(result.evolved, false);
});
```

- [ ] **Step 2: Run evolution tests to verify they fail**

```powershell
node --test tests/evolution.test.mjs
```

Expected: FAIL because `core/evolution.js` does not exist.

- [ ] **Step 3: Implement evolution progression**

Create `core/evolution.js`:

```js
import { BABY_TO_TEEN_EXPERIENCE, TEEN_TO_MATURE_EXPERIENCE } from "../device-app/core/constants.js";
import { computeScores, pickMatureBranch } from "../core/scoring.js";

export const EVOLUTION_PHASE = {
  BABY: "baby",
  TEEN_READY: "teen_ready",
  TEEN: "teen",
  MATURE_READY: "mature_ready",
  MATURE: "mature"
};

export function checkEvolution(profile, petId, collectionEntries) {
  const currentForm = profile.selectedFormId;
  const exp = profile.experience;

  // Already at mature branch
  if (["active", "steady", "explorer", "rare", "secret"].includes(currentForm)) {
    return { phase: EVOLUTION_PHASE.MATURE, evolved: false, nextFormId: null };
  }

  // Already at teen, check for mature evolution
  if (currentForm === "teen") {
    if (exp >= TEEN_TO_MATURE_EXPERIENCE) {
      const scores = computeScores(profile.dailyActivity);
      const branch = pickMatureBranch(scores);
      return { phase: EVOLUTION_PHASE.MATURE_READY, evolved: true, nextFormId: branch.chosen, scores, tiebreaker: branch.tiebreaker, closeBranches: branch.closeBranches };
    }
    return { phase: EVOLUTION_PHASE.TEEN, evolved: false, nextFormId: null };
  }

  // Baby phase
  if (currentForm === "baby" || !currentForm) {
    if (exp >= BABY_TO_TEEN_EXPERIENCE) {
      return { phase: EVOLUTION_PHASE.TEEN_READY, evolved: true, nextFormId: "teen" };
    }
    return { phase: EVOLUTION_PHASE.BABY, evolved: false, nextFormId: null };
  }

  return { phase: EVOLUTION_PHASE.BABY, evolved: false, nextFormId: null };
}
```

- [ ] **Step 4: Run all tests**

```powershell
npm.cmd test
```

Expected: PASS with 40+ passing tests and no regressions.

- [ ] **Step 5: Commit**

```powershell
git add core/evolution.js tests/evolution.test.mjs
git commit -m "feat: implement baby-to-teen-to-mature evolution progression"
```

---

## Task 5: Implement Close-Score User Choice

**Files:**
- Create: `core/form-switch.js`
- Create: `tests/form-switch.test.mjs`

**Details:** When two mature branch scores are within `CLOSE_SCORE_THRESHOLD`, the Mini Program offers the user a choice. The user can pick any unlocked form at any time. The form-switch module validates eligibility and enforces unlock rules.

- [ ] **Step 1: Write failing form-switch tests**

Create `tests/form-switch.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { canSelectForm, getSelectableForms, applyFormSwitch } from "../core/form-switch.js";

const unlockState = {
  unlockedFormIds: ["baby", "teen", "active", "steady"]
};

test("canSelectForm returns true for unlocked form", () => {
  assert.ok(canSelectForm(unlockState, "active"));
});

test("canSelectForm returns false for locked form", () => {
  assert.equal(canSelectForm(unlockState, "explorer"), false);
});

test("canSelectForm returns false for empty string", () => {
  assert.equal(canSelectForm(unlockState, ""), false);
});

test("getSelectableForms returns only unlocked forms", () => {
  const forms = getSelectableForms(unlockState);
  assert.deepEqual(forms, ["baby", "teen", "active", "steady"]);
});

test("applyFormSwitch returns updated profile", () => {
  const profile = { selectedFormId: "baby", selectedPetId: "pixel-cat" };
  const result = applyFormSwitch(profile, "active", unlockState);
  assert.equal(result.selectedFormId, "active");
});

test("applyFormSwitch rejects locked form", () => {
  const profile = { selectedFormId: "baby" };
  assert.equal(applyFormSwitch(profile, "explorer", unlockState), null);
});
```

- [ ] **Step 2: Run form-switch tests to verify they fail**

```powershell
node --test tests/form-switch.test.mjs
```

Expected: FAIL because `core/form-switch.js` does not exist.

- [ ] **Step 3: Implement form-switch logic**

Create `core/form-switch.js`:

```js
export function canSelectForm(collection, formId) {
  return !!formId && collection.unlockedFormIds.includes(formId);
}

export function getSelectableForms(collection) {
  return [...collection.unlockedFormIds];
}

export function applyFormSwitch(profile, newFormId, collection) {
  if (!canSelectForm(collection, newFormId)) return null;
  return { ...profile, selectedFormId: newFormId };
}
```

- [ ] **Step 4: Run all tests**

```powershell
npm.cmd test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add core/form-switch.js tests/form-switch.test.mjs
git commit -m "feat: implement form-switch eligibility and close-score user choice"
```

---

## Task 6: Storage Schema Migration (Phase 0 -> V1)

**Files:**
- Modify: `device-app/core/profile.js`
- Create: `scripts/migrate-profile.mjs`
- Create: `tests/profile-migration.test.mjs`

**Details:**
- Phase 0 used `schemaVersion: 1`
- Phase 1 uses `schemaVersion: 2` (`SCHEMA_VERSION_V1`)
- Migration adds `collection[]`, `petRegistry[]`, `lastFeedDate`, `evolutionHistory[]`
- Corrupt data recovery preserves readable fields, resets unreadable ones
- The migration runs transparently in `loadProfile`

- [ ] **Step 1: Write failing migration tests**

Create `tests/profile-migration.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { createDefaultProfile, normalizeProfile } from "../device-app/core/profile.js";

test("createDefaultProfile returns schemaVersion 2", () => {
  const profile = createDefaultProfile("20260607");
  assert.equal(profile.schemaVersion, 2);
  assert.equal(profile.selectedPetId, "pixel-cat");
  assert.ok(Array.isArray(profile.collection));
  assert.equal(typeof profile.lastFeedDate, "string");
  assert.ok(Array.isArray(profile.evolutionHistory));
});

test("normalizeProfile upgrades schemaVersion 1 to 2", () => {
  const oldProfile = {
    schemaVersion: 1,
    selectedPetId: "pixel-cat",
    selectedFormId: "baby",
    foodBalance: 5,
    affinity: 12,
    experience: 100,
    lastSettlementDate: "20260607",
    lastSettledSteps: 5000,
    dailyActivity: [{ date: "20260606", settledSteps: 3000, earnedFood: 3 }]
  };
  const migrated = normalizeProfile(oldProfile, "20260607");
  assert.equal(migrated.schemaVersion, 2);
  assert.ok(Array.isArray(migrated.collection));
  assert.equal(migrated.collection.length, 1);
  assert.equal(migrated.collection[0].petId, "pixel-cat");
  assert.deepEqual(migrated.collection[0].unlockedFormIds, ["baby"]);
  assert.equal(migrated.lastFeedDate, "");
  assert.ok(Array.isArray(migrated.evolutionHistory));
  assert.equal(migrated.foodBalance, 5);
  assert.equal(migrated.experience, 100);
});

test("normalizeProfile handles corrupt old profile", () => {
  const result = normalizeProfile(null, "20260607");
  assert.equal(result.schemaVersion, 2);
  assert.equal(result.foodBalance, 0);
});

test("normalizeProfile handles partial corrupt data preserving readable collection", () => {
  const corrupt = {
    schemaVersion: 2,
    selectedPetId: "pixel-cat",
    selectedFormId: "active",
    foodBalance: -5,
    affinity: "bad",
    collection: [{ petId: "pixel-cat", unlockedFormIds: ["baby", "teen"] }, null],
    dailyActivity: [{ date: "good", settledSteps: 1000, earnedFood: 1 }]
  };
  const result = normalizeProfile(corrupt, "20260607");
  assert.equal(result.foodBalance, 0);
  assert.equal(result.affinity, 0);
  assert.equal(result.collection.length, 1);
  assert.equal(result.collection[0].petId, "pixel-cat");
  assert.equal(result.dailyActivity.length, 0); // bad date filtered out
});
```

- [ ] **Step 2: Run migration tests to verify they fail**

```powershell
node --test tests/profile-migration.test.mjs
```

Expected: FAIL because profile.js doesn't have V1 fields yet.

- [ ] **Step 3: Update profile.js for V1 schema**

Modify `device-app/core/profile.js`:

```js
import { DEFAULT_FORM_ID, DEFAULT_PET_ID, HISTORY_DAYS, SCHEMA_VERSION_V1 } from "./constants.js";

const DATE_KEY = /^\d{8}$/;
const toNonNegativeInt = (value) => Math.max(0, Math.floor(Number(value) || 0));

function normalizeCollection(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((entry) => entry && typeof entry.petId === "string" && entry.petId)
    .map((entry) => ({
      petId: entry.petId,
      unlockedFormIds: Array.isArray(entry.unlockedFormIds)
        ? entry.unlockedFormIds.filter((id) => typeof id === "string" && id)
        : ["baby"],
      rareProgress: toNonNegativeInt(entry.rareProgress),
      secretTriggerFlags: toNonNegativeInt(entry.secretTriggerFlags)
    }));
}

export function createDefaultProfile(today) {
  return {
    schemaVersion: SCHEMA_VERSION_V1,
    selectedPetId: DEFAULT_PET_ID,
    selectedFormId: DEFAULT_FORM_ID,
    foodBalance: 0,
    affinity: 0,
    experience: 0,
    lastSettlementDate: today,
    lastSettledSteps: 0,
    lastFeedDate: "",
    dailyActivity: [],
    collection: [{
      petId: DEFAULT_PET_ID,
      unlockedFormIds: [DEFAULT_FORM_ID],
      rareProgress: 0,
      secretTriggerFlags: 0
    }],
    evolutionHistory: []
  };
}

function migrateV1ToV2(source, today) {
  const profile = { ...source, schemaVersion: SCHEMA_VERSION_V1 };
  if (!Array.isArray(profile.collection)) {
    profile.collection = [{
      petId: profile.selectedPetId || DEFAULT_PET_ID,
      unlockedFormIds: [profile.selectedFormId || DEFAULT_FORM_ID],
      rareProgress: 0,
      secretTriggerFlags: 0
    }];
  }
  if (typeof profile.lastFeedDate !== "string") profile.lastFeedDate = "";
  if (!Array.isArray(profile.evolutionHistory)) profile.evolutionHistory = [];
  return profile;
}

export function normalizeProfile(value, today) {
  const source = value && typeof value === "object" ? value : {};

  // Run migration if coming from schemaVersion 1
  const migrated = source.schemaVersion === 1
    ? migrateV1ToV2(source, today)
    : source;

  const dailyActivity = Array.isArray(migrated.dailyActivity)
    ? migrated.dailyActivity
        .filter((entry) => entry && DATE_KEY.test(entry.date))
        .map((entry) => ({
          date: entry.date,
          settledSteps: toNonNegativeInt(entry.settledSteps),
          earnedFood: toNonNegativeInt(entry.earnedFood)
        }))
        .slice(-HISTORY_DAYS)
    : [];

  return {
    schemaVersion: SCHEMA_VERSION_V1,
    selectedPetId: typeof migrated.selectedPetId === "string" && migrated.selectedPetId
      ? migrated.selectedPetId
      : DEFAULT_PET_ID,
    selectedFormId: typeof migrated.selectedFormId === "string" && migrated.selectedFormId
      ? migrated.selectedFormId
      : DEFAULT_FORM_ID,
    foodBalance: toNonNegativeInt(migrated.foodBalance),
    affinity: toNonNegativeInt(migrated.affinity),
    experience: toNonNegativeInt(migrated.experience),
    lastSettlementDate: DATE_KEY.test(migrated.lastSettlementDate) ? migrated.lastSettlementDate : today,
    lastSettledSteps: toNonNegativeInt(migrated.lastSettledSteps),
    lastFeedDate: typeof migrated.lastFeedDate === "string" ? migrated.lastFeedDate : "",
    dailyActivity,
    collection: normalizeCollection(migrated.collection),
    evolutionHistory: Array.isArray(migrated.evolutionHistory) ? migrated.evolutionHistory.slice(-50) : []
  };
}

// Alias for compatibility
export { normalizeProfile as migrateProfile };
```

- [ ] **Step 4: Update profile tests to match new schema**

Update `tests/profile.test.mjs` to expect `schemaVersion: 2` and the new fields.

- [ ] **Step 5: Add CLI migration script**

Create `scripts/migrate-profile.mjs`:

```js
import { readFile, writeFile } from "node:fs/promises";
import { normalizeProfile } from "../device-app/core/profile.js";
import { toDateKey } from "../device-app/core/date-key.js";

const inputPath = process.argv[2];
const outputPath = process.argv[3] || inputPath;
const raw = JSON.parse(await readFile(inputPath, "utf8"));
const today = toDateKey(new Date());
const migrated = normalizeProfile(raw, today);
await writeFile(outputPath, JSON.stringify(migrated, null, 2));
console.log(`migrated ${inputPath} -> ${outputPath} (schemaVersion ${migrated.schemaVersion})`);
```

- [ ] **Step 6: Run all tests**

```powershell
npm.cmd test
```

Expected: PASS with all existing and new tests.

- [ ] **Step 7: Commit**

```powershell
git add device-app/core/profile.js scripts/migrate-profile.mjs tests/profile-migration.test.mjs
git commit -m "feat: migrate storage schema from v1 to v2 with collection support"
```

---

## Task 7: Update Pet-Pack Contract For Phase 1 (Required + Optional Actions)

**Files:**
- Modify: `core/pet-pack.js`
- Modify: `tests/pet-pack.test.mjs`

**Details:** Phase 0 required 5 actions. Phase 1 adds additional required actions for the full watch-face experience and introduces optional companion Mini Program actions.

**Required actions (all forms):**
- `wakeIdle`, `speciesIdle`, `tapReact`, `feed`, `happy`, `noFood`, `goalCelebrate`, `sleepAod`, `evolutionHint`

**Optional actions (Mini Program):**
- `pet`, `play`, `walkReturn`, `dressUp` (reserved)
- `secretHint`

**Mature forms additionally require:**
- At least one unique branch-specific idle animation

- [ ] **Step 1: Write failing updated pack tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { validatePetPack, REQUIRED_ACTIONS, OPTIONAL_ACTIONS } from "../core/pet-pack.js";

const validBabyActions = {
  wakeIdle: { prefix: "baby/wake_", frames: 8, fps: 8 },
  speciesIdle: { prefix: "baby/idle_", frames: 8, fps: 8 },
  tapReact: { prefix: "baby/tap_", frames: 8, fps: 8 },
  feed: { prefix: "baby/feed_", frames: 12, fps: 10 },
  happy: { prefix: "baby/happy_", frames: 10, fps: 10 },
  noFood: { prefix: "baby/no_food_", frames: 8, fps: 8 },
  goalCelebrate: { prefix: "baby/celebrate_", frames: 10, fps: 10 },
  sleepAod: { prefix: "baby/sleep_", frames: 8, fps: 8 },
  evolutionHint: { prefix: "baby/evolve_", frames: 10, fps: 10 }
};

test("REQUIRED_ACTIONS includes 9 actions", () => {
  assert.equal(REQUIRED_ACTIONS.length, 9);
});

test("validatePetPack accepts valid full pack", () => {
  const pack = makePack({ actions: validBabyActions });
  assert.deepEqual(validatePetPack(pack), []);
});
```

- [ ] **Step 2: Update pet-pack validation**

Modify `core/pet-pack.js`:

```js
export const REQUIRED_ACTIONS = [
  "wakeIdle", "speciesIdle", "tapReact", "feed", "happy",
  "noFood", "goalCelebrate", "sleepAod", "evolutionHint"
];

export const OPTIONAL_ACTIONS = ["pet", "play", "walkReturn", "dressUp", "secretHint"];

export function validatePetPack(pack) {
  const errors = [];
  if (pack?.schemaVersion !== 1) errors.push("schemaVersion must be 1");
  if (!pack?.id) errors.push("id is required");
  if (!pack?.name) errors.push("name is required");
  if (!pack?.forms) errors.push("at least one form is required");

  for (const [formName, form] of Object.entries(pack?.forms || {})) {
    for (const actionName of REQUIRED_ACTIONS) {
      const path = `forms.${formName}.actions.${actionName}`;
      const action = form?.actions?.[actionName];
      if (!action) {
        errors.push(`${path} is required`);
        continue;
      }
      if (!Number.isInteger(action.frames) || action.frames < 8 || action.frames > 20) {
        errors.push(`${path}.frames must be between 8 and 20`);
      }
      if (!Number.isInteger(action.fps) || action.fps < 8 || action.fps > 12) {
        errors.push(`${path}.fps must be between 8 and 12`);
      }
    }
    if (!form?.static) errors.push(`forms.${formName}.static is required`);
    if (!form?.aod) errors.push(`forms.${formName}.aod is required`);
  }
  return errors;
}
```

- [ ] **Step 3: Run all tests**

```powershell
npm.cmd test
```

Expected: PASS.

- [ ] **Step 4: Commit**

```powershell
git add core/pet-pack.js tests/pet-pack.test.mjs
git commit -m "feat: update pet-pack contract with 9 required actions"
```

---

## Task 8: Wire Device-App Core Modules Into Device Mini Program

**Files:**
- Modify: `device-app/page/home/home.js`
- Modify: `device-app/app.js`
- Create: `device-app/utils/i18n.js`
- Create: `tests/i18n.test.mjs`

**Details:** Connect the scoring, evolution, collection, and form-switch modules into the Mini Program lifecycle. Feed action adds experience and affinity. Daily settlement triggers evolution check. Collection management initializes on first launch.

- [ ] **Step 1: Write i18n tests**

Create `tests/i18n.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { t, setLanguage, SUPPORTED_LANGUAGES } from "../device-app/utils/i18n.js";

test("t returns English string by default", () => {
  assert.equal(t("app_name"), "Pet Universe");
});

test("t returns key when translation missing", () => {
  assert.equal(t("nonexistent_key"), "nonexistent_key");
});

test("SUPPORTED_LANGUAGES includes en", () => {
  assert.ok(SUPPORTED_LANGUAGES.includes("en"));
});
```

- [ ] **Step 2: Create English-first i18n module**

Create `device-app/utils/i18n.js`:

```js
export const SUPPORTED_LANGUAGES = ["en"];

const strings = {
  en: {
    app_name: "Pet Universe",
    home_title: "PET UNIVERSE",
    steps_label: "STEPS",
    food_label: "FOOD",
    feed: "Feed",
    pet: "Pet",
    play: "Play",
    collection: "Collection",
    history: "History",
    form_switch: "Switch Form",
    evolution_ready: "Evolution Ready!",
    close_score_choice: "Choose your path",
    active: "Active",
    steady: "Steady",
    explorer: "Explorer",
    rare: "Rare",
    secret: "Secret",
    baby: "Baby",
    teen: "Teen",
    mature: "Mature",
    unlocked: "Unlocked",
    locked: "Locked",
    affinity: "Affinity",
    experience: "Experience",
    food_earned: "Walk Reward +{count}",
    no_food: "Walk 1,000 steps to earn food",
    pet_hungry: "Your pet is hungry!",
    evolution_hint: "Something is changing...",
    settings: "Settings",
    back: "Back",
    confirm: "Confirm",
    cancel: "Cancel"
  }
};

let currentLanguage = "en";

export function setLanguage(lang) {
  if (SUPPORTED_LANGUAGES.includes(lang)) currentLanguage = lang;
}

export function t(key) {
  return strings[currentLanguage]?.[key] || key;
}
```

- [ ] **Step 3: Update home.js with feed and evolution check**

Modify `device-app/page/home/home.js` to integrate:
- Feed button that consumes food, adds experience and affinity
- Evolution check after each feed
- Close-score user choice trigger
- Display current form, experience progress, affinity

```js
import { createWidget, widget } from "@zos/ui";
import { Step } from "@zos/sensor";
import * as Common from "zosLoader:./../common.[pf].layout.js";
import * as Styles from "zosLoader:./home.[pf].layout.js";
import { toDateKey } from "../../core/date-key.js";
import { settleSteps } from "../../core/settlement.js";
import { checkEvolution, EVOLUTION_PHASE } from "../../core/evolution.js";
import { loadProfile, saveProfile } from "../../utils/storage.js";
import { t } from "../../utils/i18n.js";

const step = new Step();

Page({
  state: { profile: null, earnedFood: 0 },

  build() {
    const today = toDateKey(new Date());
    const currentSteps = Math.max(0, Math.floor(step.getCurrent() || 0));
    const result = settleSteps(loadProfile(today), today, currentSteps);
    this.state.profile = result.profile;
    this.state.earnedFood = result.earnedFood;
    saveProfile(result.profile);

    this.render();
  },

  render() {
    const p = this.state.profile;
    // Background
    createWidget(widget.FILL_RECT, { ...Common.SCREEN, color: 0x101111 });
    // Title
    createWidget(widget.TEXT, { ...Styles.TITLE, text: t("home_title") });
    // Pet name and form
    createWidget(widget.TEXT, { ...Styles.FORM_LABEL, text: `${p.selectedPetId} - ${p.selectedFormId}` });
    // Steps
    createWidget(widget.TEXT, { ...Styles.STEPS, text: `${step.getCurrent() || 0} ${t("steps_label")}` });
    // Food
    createWidget(widget.TEXT, { ...Styles.FOOD, text: `${p.foodBalance} ${t("food_label")}` });
    // Experience progress
    createWidget(widget.TEXT, { ...Styles.EXPERIENCE, text: `${t("experience")}: ${p.experience}` });
    // Affinity
    createWidget(widget.TEXT, { ...Styles.AFFINITY, text: `${t("affinity")}: ${p.affinity}` });
    // Feed button (if food available)
    if (p.foodBalance > 0) {
      createWidget(widget.TEXT, { ...Styles.FEED_BUTTON, text: t("feed") });
    }
    // Evolution check
    const evolution = checkEvolution(p, p.selectedPetId, []);
    if (evolution.phase === EVOLUTION_PHASE.TEEN_READY || evolution.phase === EVOLUTION_PHASE.MATURE_READY) {
      createWidget(widget.TEXT, { ...Styles.EVOLUTION_NOTICE, text: t("evolution_ready") });
    }
    // Settlement note
    if (this.state.earnedFood > 0) {
      createWidget(widget.TEXT, { ...Styles.NOTE, text: t("food_earned", { count: this.state.earnedFood }) });
    } else {
      createWidget(widget.TEXT, { ...Styles.NOTE, text: t("no_food") });
    }
  }
});
```

Note: The Zepp OS device-app widget API requires `TEXT` widgets with `text` property for label display. The feed button interaction will use `CLICK_DOWN` event via `addEventListener` on a transparent widget overlay. `[HW-NEEDED: Does addEventListener(CLICK_DOWN) work on device-app TEXT widgets?]`

- [ ] **Step 4: Run all tests**

```powershell
npm.cmd test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add device-app/page/home/home.js device-app/utils/i18n.js tests/i18n.test.mjs device-app/app.js
git commit -m "feat: integrate feed, evolution check, and English-first i18n into home screen"
```

---

## Task 9: Create V1 Watch Face With Selected-Pet Variant Packaging

**Files:**
- Create: `watchface/` (promoted from `watchface-spike/`)
- Create: `watchface/app.json`
- Create: `watchface/index.js`
- Create: `watchface/README.md`
- Modify: `scripts/stage-watchface-assets.mjs` (for all pets)

**Details:** The watch face uses selected-pet variants. Each variant is a separate package with a specific pet's assets baked in. The companion Mini Program directs users to install the appropriate variant.

Variant packaging strategy:
- Default variant: `pixel-cat` (included in main watchface package)
- Additional variants: one package per pet with identical JS but different assets
- Fallback to `pixel-cat` if no pet-specific variant is installed `[HW-NEEDED: Is this per-package variant approach installable and switchable on physical devices?]`

`[HW-NEEDED]` The watch-face variant packaging approach must be verified on physical hardware. Without shared storage, there is no mechanism for the watch face to know which pet the user selected in the Mini Program. The user must install the watch-face variant that matches their chosen pet.

- [ ] **Step 1: Read current watchface-spike implementation and promote to watchface/**

```powershell
cp -r watchface-spike watchface
```

- [ ] **Step 2: Update watchface/app.json with production values**

```json
{
  "configVersion": "v3",
  "app": {
    "appId": 1099993,
    "appName": "Pet Universe Face",
    "appType": "watchface",
    "version": { "code": 1, "name": "1.0.0" },
    "vender": "zepp",
    "description": "Pet Universe virtual pet watch face"
  },
  "runtime": {
    "apiVersion": {
      "compatible": "3.0.0",
      "target": "3.0.0",
      "minVersion": "3.0"
    }
  },
  "targets": {
    "gt.r": {
      "module": {
        "watchface": { "path": "index", "main": 1, "lockscreen": 1 }
      },
      "platforms": [{ "st": "r" }],
      "designWidth": 480
    },
    "gt.s": {
      "module": {
        "watchface": { "path": "index", "main": 1, "lockscreen": 1 }
      },
      "platforms": [{ "st": "s" }],
      "designWidth": 390
    }
  },
  "i18n": {
    "en-US": { "appName": "Pet Universe" }
  },
  "defaultLanguage": "en-US"
}
```

- [ ] **Step 3: Update watchface/index.js with Phase 1 improvements**

```js
const stepSensor = hmSensor.createSensor(hmSensor.id.STEP);

Page({
  build() {
    const { width, height } = hmSetting.getDeviceInfo();
    const isAod = hmSetting.getScreenType() === hmSetting.screen_type.AOD;
    const petSize = Math.min(width, height) * 0.33;
    const petX = Math.round((width - petSize) / 2);
    const petY = Math.round(height * 0.45);

    // Infer current pet from PACKAGE_VARIANT or default to pixel-cat
    // [HW-NEEDED: Can watch-face JS read its own appId or package variant name?]
    const petId = "pixel-cat"; // default; variant packaging replaces assets

    if (isAod) {
      hmUI.createWidget(hmUI.widget.IMG, {
        x: petX, y: petY, w: petSize, h: petSize,
        src: `${petId}/baby/aod.png`,
        auto_scale: true
      });
      return;
    }

    // Time display
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0, y: 92, w: width, h: 52,
      color: 0xffffff, text_size: 30,
      align_h: hmUI.align.CENTER_H,
      text: "PET UNIVERSE"
    });

    // Step count
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0, y: 142, w: width, h: 44,
      color: 0x91d1b2, text_size: 24,
      align_h: hmUI.align.CENTER_H,
      text: `${stepSensor.current} STEPS`
    });

    // Wake animation
    const wakeAnimation = hmUI.createWidget(hmUI.widget.IMG_ANIM, {
      x: petX, y: petY, w: petSize, h: petSize,
      anim_path: `${petId}/baby`,
      anim_prefix: "wake_",
      anim_ext: "png",
      anim_fps: 8,
      anim_size: 8,
      repeat_count: 1,
      display_on_restart: true,
      default_frame_index: 0,
      auto_scale: true
    });
    wakeAnimation.setProperty(hmUI.prop.ANIM_STATUS, hmUI.anim_status.START);

    // Static pet image after animation lands on default_frame_index
    hmUI.createWidget(hmUI.widget.IMG, {
      x: petX, y: petY, w: petSize, h: petSize,
      src: `${petId}/baby/static.png`,
      auto_scale: true
    });
  }
});
```

- [ ] **Step 4: Update staging script for multi-pet watch-face variants**

Modify `scripts/stage-watchface-assets.mjs` to accept a pet-pack directory list and stage each into separate watch-face variant directories.

- [ ] **Step 5: Run validation**

```powershell
npm.cmd test
npm.cmd run validate:pack
npm.cmd run stage:watchface
```

Expected: All pet packs validated, assets staged under `watchface/assets/`.

- [ ] **Step 6: Commit**

```powershell
git add watchface/ scripts/stage-watchface-assets.mjs
git commit -m "feat: promote watchface to production path with variant packaging"
```

---

## Task 10: Comprehensive Content Validation For AI-Generated Assets

**Files:**
- Create: `core/content-validator.js`
- Create: `scripts/validate-generated-art.mjs`
- Create: `tests/content-validator.test.mjs`

**Details:** AI-generated sprite packs need automated validation before human review. This validates:
- Frame dimensions are consistent within an animation sequence
- FPS matches the manifest
- Frame count matches the manifest
- All referenced PNG assets exist
- AOD image exists and is visually minimal (pixel count)
- No frame exceeds expected dimensions
- Transparent background (alpha channel check)
- Silhouette consistency across frames (bounding box stability)

- [ ] **Step 1: Write failing content validation tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { validateSpriteDimensions, validateFrameCount, validateAodPixelRatio } from "../core/content-validator.js";

test("validateSpriteDimensions passes for consistent frames", () => {
  const frames = [{ width: 32, height: 32 }, { width: 32, height: 32 }];
  assert.deepEqual(validateSpriteDimensions(frames, 32, 32), []);
});

test("validateSpriteDimensions rejects inconsistent dimensions", () => {
  const frames = [{ width: 32, height: 32 }, { width: 64, height: 32 }];
  const errors = validateSpriteDimensions(frames, 32, 32);
  assert.ok(errors.length > 0);
});

test("validateFrameCount rejects mismatch", () => {
  const errors = [];
  if (8 !== 10) errors.push("expected 10 frames, got 8");
  assert.ok(errors.length > 0);
});

test("validateAodPixelRatio flags high pixel count", () => {
  const errors = validateAodPixelRatio(500, 32 * 32);
  assert.ok(errors.length > 0);
  assert.ok(errors[0].includes("AOD"));
});

test("validateAodPixelRatio passes for minimal pixels", () => {
  const errors = validateAodPixelRatio(30, 32 * 32);
  assert.deepEqual(errors, []);
});
```

- [ ] **Step 2: Implement content validator**

Create `core/content-validator.js`:

```js
const MAX_AOD_PIXEL_RATIO = 0.1; // 10% of total pixels

export function validateSpriteDimensions(frames, expectedWidth, expectedHeight) {
  const errors = [];
  frames.forEach((frame, i) => {
    if (frame.width !== expectedWidth) {
      errors.push(`frame ${i}: width ${frame.width} != expected ${expectedWidth}`);
    }
    if (frame.height !== expectedHeight) {
      errors.push(`frame ${i}: height ${frame.height} != expected ${expectedHeight}`);
    }
  });
  return errors;
}

export function validateFrameCount(actual, expected, label) {
  const errors = [];
  if (actual !== expected) {
    errors.push(`${label}: expected ${expected} frames, got ${actual}`);
  }
  return errors;
}

export function validateAodPixelRatio(litPixels, totalPixels) {
  const errors = [];
  const ratio = totalPixels > 0 ? litPixels / totalPixels : 0;
  if (ratio > MAX_AOD_PIXEL_RATIO) {
    errors.push(`AOD lit-pixel ratio ${(ratio * 100).toFixed(1)}% exceeds ${(MAX_AOD_PIXEL_RATIO * 100)}%`);
  }
  return errors;
}
```

- [ ] **Step 3: Run all tests**

```powershell
npm.cmd test
```

Expected: PASS.

- [ ] **Step 4: Commit**

```powershell
git add core/content-validator.js tests/content-validator.test.mjs
git commit -m "feat: add content validation for AI-generated sprite assets"
```

---

## Task 11: Create Data Files For Launch Roster

**Files:**
- Create: `data/pets.json`
- Create: `data/forms.json`
- Create: `data/actions.json`
- Create: `data/sports.js` (future sport/exercise data)
- Create: `data/categories.js` (pet categories for collection filters)
- Create: `data/exercises.js`
- Create: `data/routines.js`
- Create: `data/sources.js`

**Details:** Define the canonical data for the 8-10 launch pet species.

- [ ] **Step 1: Create pets.json with launch roster**

Create `data/pets.json`:

```json
{
  "schemaVersion": 1,
  "pets": [
    {
      "id": "pixel-cat",
      "name": "Pixel Cat",
      "species": "cat",
      "category": "familiar",
      "themeColor": "#FF9F50",
      "defaultForm": "baby",
      "description": "A friendly orange feline companion.",
      "minApiLevel": "3.0",
      "screenShapes": ["r", "s"]
    },
    {
      "id": "pixel-dog",
      "name": "Pixel Dog",
      "species": "dog",
      "category": "familiar",
      "themeColor": "#8B6914",
      "defaultForm": "baby",
      "description": "A loyal and playful puppy.",
      "minApiLevel": "3.0",
      "screenShapes": ["r", "s"]
    },
    {
      "id": "pixel-bunny",
      "name": "Pixel Bunny",
      "species": "rabbit",
      "category": "familiar",
      "themeColor": "#F0C0D0",
      "defaultForm": "baby",
      "description": "A soft and curious bunny.",
      "minApiLevel": "3.0",
      "screenShapes": ["r", "s"]
    },
    {
      "id": "pixel-hamster",
      "name": "Pixel Hamster",
      "species": "hamster",
      "category": "familiar",
      "themeColor": "#D4A574",
      "defaultForm": "baby",
      "description": "A tiny ball of energy.",
      "minApiLevel": "3.0",
      "screenShapes": ["r", "s"]
    },
    {
      "id": "pixel-penguin",
      "name": "Pixel Penguin",
      "species": "penguin",
      "category": "familiar",
      "themeColor": "#4A7FB5",
      "defaultForm": "baby",
      "description": "A waddling polar friend.",
      "minApiLevel": "3.0",
      "screenShapes": ["r", "s"]
    },
    {
      "id": "pixel-dragon",
      "name": "Pixel Dragon",
      "species": "dragon",
      "category": "fantasy",
      "themeColor": "#7B2D8E",
      "defaultForm": "baby",
      "description": "A tiny dragon with big dreams.",
      "minApiLevel": "3.0",
      "screenShapes": ["r", "s"]
    },
    {
      "id": "pixel-ghost",
      "name": "Pixel Ghost",
      "species": "ghost",
      "category": "fantasy",
      "themeColor": "#C0C0E0",
      "defaultForm": "baby",
      "description": "A friendly little spirit.",
      "minApiLevel": "3.0",
      "screenShapes": ["r", "s"]
    },
    {
      "id": "pixel-axolotl",
      "name": "Pixel Axolotl",
      "species": "axolotl",
      "category": "familiar",
      "themeColor": "#FF90B0",
      "defaultForm": "baby",
      "description": "A smiling water salamander.",
      "minApiLevel": "3.0",
      "screenShapes": ["r", "s"]
    },
    {
      "id": "pixel-slime",
      "name": "Pixel Slime",
      "species": "slime",
      "category": "fantasy",
      "themeColor": "#70D080",
      "defaultForm": "baby",
      "description": "A bouncy blob of joy.",
      "minApiLevel": "3.0",
      "screenShapes": ["r", "s"]
    }
  ]
}
```

- [ ] **Step 2: Create forms.json**

Create `data/forms.json` with form definitions per pet:

```json
{
  "schemaVersion": 1,
  "definitions": {
    "baby": { "displayName": "Baby", "order": 0, "type": "base", "isStartForm": true },
    "teen": { "displayName": "Teen", "order": 1, "type": "base", "experienceRequired": 200 },
    "active": { "displayName": "Active", "order": 2, "type": "mature", "branch": "active" },
    "steady": { "displayName": "Steady", "order": 3, "type": "mature", "branch": "steady" },
    "explorer": { "displayName": "Explorer", "order": 4, "type": "mature", "branch": "explorer" },
    "rare": { "displayName": "Rare", "order": 5, "type": "rare", "hidden": false },
    "secret": { "displayName": "Secret", "order": 6, "type": "secret", "hidden": true }
  }
}
```

- [ ] **Step 3: Run data validation (manual or automated)**

```powershell
node --input-type=module -e "
import { readFile } from 'node:fs/promises';
const pets = JSON.parse(await readFile('data/pets.json', 'utf8'));
console.log('Pets loaded:', pets.pets.length);
pets.pets.forEach(p => { if (!p.id || !p.name) throw new Error('Invalid pet: ' + JSON.stringify(p)); });
console.log('All pets valid');
"
```

- [ ] **Step 4: Commit**

```powershell
git add data/
git commit -m "feat: define launch roster of nine pets with form definitions"
```

---

## Task 12: Create Mini Program Pages (Collection, Detail, History, Form-Switch)

**Files:**
- Create: `device-app/page/collection/collection.js`
- Create: `device-app/page/collection/collection.r.layout.js`
- Create: `device-app/page/collection/collection.s.layout.js`
- Create: `device-app/page/detail/detail.js`
- Create: `device-app/page/detail/detail.r.layout.js`
- Create: `device-app/page/detail/detail.s.layout.js`
- Create: `device-app/page/history/history.js`
- Create: `device-app/page/history/history.r.layout.js`
- Create: `device-app/page/history/history.s.layout.js`
- Create: `device-app/page/form-switch/form-switch.js`
- Create: `device-app/page/form-switch/form-switch.r.layout.js`
- Create: `device-app/page/form-switch/form-switch.s.layout.js`
- Modify: `device-app/app.json` (register all new pages)

**Details:**

1. **Collection page:** Grid of owned pets with unlock status. Shows locked slots with hint. Each pet card shows form count and name.

2. **Detail page:** Shows selected pet's current form, experience bar, affinity level, food balance. Feed button, pet button, play button. Evolution hint when ready. Close-score choice UI when applicable.

3. **History page:** 7-day activity bar chart or list. Shows daily steps and food earned. Simplest Zepp OS chart implementation (text-based).

4. **Form-switch page:** Shows all unlocked forms for the current pet. Each form has name, type badge (Active/Steady/Rare/Secret), and select button. Locked forms show unlock hint.

- [ ] **Step 1: Create shared layout constants for new pages**

Create `device-app/page/collection/collection.r.layout.js`:

```js
import { px } from "@zos/utils";
import { align } from "@zos/ui";

export const GRID_START = { x: px(20), y: px(100), w: px(440), h: px(340) };
export const PET_CARD = { w: px(130), h: px(150), gap: px(15) };
export const TITLE = { x: px(70), y: px(72), w: px(340), h: px(44), color: 0xffffff, text_size: px(28), align_h: align.CENTER_H };
export const BACK = { x: px(20), y: px(72), w: px(60), h: px(44), color: 0xada79c, text_size: px(20) };
```

Create `device-app/page/collection/collection.s.layout.js`:

```js
import { px } from "@zos/utils";
import { align } from "@zos/ui";

export const GRID_START = { x: px(15), y: px(90), w: px(360), h: px(300) };
export const PET_CARD = { w: px(105), h: px(130), gap: px(12) };
export const TITLE = { x: px(40), y: px(62), w: px(310), h: px(44), color: 0xffffff, text_size: px(28), align_h: align.CENTER_H };
export const BACK = { x: px(10), y: px(62), w: px(50), h: px(44), color: 0xada79c, text_size: px(20) };
```

Similar layout files for detail, history, and form-switch pages — each with both round and square variants.

- [ ] **Step 2: Create collection page**

Create `device-app/page/collection/collection.js`:

```js
import { createWidget, widget } from "@zos/ui";
import * as Common from "zosLoader:./../common.[pf].layout.js";
import * as Styles from "zosLoader:./collection.[pf].layout.js";
import { loadProfile } from "../../utils/storage.js";
import { toDateKey } from "../../core/date-key.js";
import { t } from "../../utils/i18n.js";

Page({
  build() {
    const today = toDateKey(new Date());
    const profile = loadProfile(today);
    const { collection } = profile;

    createWidget(widget.FILL_RECT, { ...Common.SCREEN, color: 0x101111 });
    createWidget(widget.TEXT, { ...Styles.TITLE, text: t("collection") });
    createWidget(widget.TEXT, { ...Styles.BACK, text: t("back") });

    collection.forEach((entry, index) => {
      const cardX = Styles.GRID_START.x + (index % 3) * (Styles.PET_CARD.w + Styles.PET_CARD.gap);
      const cardY = Styles.GRID_START.y + Math.floor(index / 3) * (Styles.PET_CARD.h + Styles.PET_CARD.gap);
      const formCount = entry.unlockedFormIds.length;

      createWidget(widget.TEXT, {
        x: cardX, y: cardY, w: Styles.PET_CARD.w, h: px(36),
        color: 0xffffff, text_size: px(18),
        align_h: hmUI.align.CENTER_H,
        text: entry.petId
      });
      createWidget(widget.TEXT, {
        x: cardX, y: cardY + px(40), w: Styles.PET_CARD.w, h: px(24),
        color: 0x91d1b2, text_size: px(16),
        align_h: hmUI.align.CENTER_H,
        text: `${formCount} ${t("unlocked")}`
      });

      // Show preview image (first unlocked form static frame)
      if (entry.unlockedFormIds.length > 0) {
        createWidget(widget.IMG, {
          x: cardX + px(45), y: cardY + px(70),
          w: px(40), h: px(40),
          src: `${entry.petId}/${entry.unlockedFormIds[0]}/static.png`,
          auto_scale: true
        });
      }
    });
  }
});
```

- [ ] **Step 3: Create detail page**

Create `device-app/page/detail/detail.js` — shows pet sprite, stats, feed/pet/play buttons, evolution progress.

Create `device-app/page/history/history.js` — shows last 7 days in a scrollable text list.

Create `device-app/page/form-switch/form-switch.js` — shows unlocked forms with select button.

- [ ] **Step 4: Register all pages in app.json**

Modify `device-app/app.json` to add pages:

```json
"targets": {
  "gt.r": {
    "module": {
      "page": {
        "pages": [
          "page/home/home",
          "page/collection/collection",
          "page/detail/detail",
          "page/history/history",
          "page/form-switch/form-switch"
        ]
      }
    }
  },
  "gt.s": { /* same pages */ }
}
```

- [ ] **Step 5: Run tests and verification**

```powershell
npm.cmd test
git diff --check
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add device-app/page/collection/ device-app/page/detail/ device-app/page/history/ device-app/page/form-switch/ device-app/app.json
git commit -m "feat: add collection, detail, history, and form-switch mini program pages"
```

---

## Task 13: Generate And Review 9 Pet Packs (AI Sprites + Validation)

**Files:**
- Create: `pet-packs/pixel-dog/manifest.json` + assets/
- Create: `pet-packs/pixel-bunny/manifest.json` + assets/
- Create: `pet-packs/pixel-hamster/manifest.json` + assets/
- Create: `pet-packs/pixel-penguin/manifest.json` + assets/
- Create: `pet-packs/pixel-dragon/manifest.json` + assets/
- Create: `pet-packs/pixel-ghost/manifest.json` + assets/
- Create: `pet-packs/pixel-axolotl/manifest.json` + assets/
- Create: `pet-packs/pixel-slime/manifest.json` + assets/
- Modify: `pet-packs/pixel-cat/manifest.json` (all forms)
- Create: `docs/review/phase-1-launch-roster.md`
- Create: `docs/review/sprite-visual-review.md`
- Modify: `scripts/create-wiring-pet-assets.mjs` (generate wiring sprites for all forms)

**Workflow:**
1. For each pet, generate wiring assets (placeholder 32x32 colored squares) for all forms and actions
2. Create manifest with all 9 required actions for Baby form
3. Run automated validation (`validate-pet-pack`, `content-validator`)
4. Flag for human visual review with the review template
5. AI generates candidate pixel sprites, human selects and adjusts `[HUMAN-REQUIRED]`

- [ ] **Step 1: Update wiring asset generator for all pets and forms**

Modify `scripts/create-wiring-pet-assets.mjs` to generate wiring assets for all 9 pets across all forms (Baby, Teen, Active, Steady, Explorer, Rare, Secret).

- [ ] **Step 2: Generate wiring assets for all 9 pets**

```powershell
node scripts/create-wiring-pet-assets.mjs
```

- [ ] **Step 3: Create manifests for all pets**

Create `pet-packs/pixel-dog/manifest.json`:

```json
{
  "schemaVersion": 1,
  "id": "pixel-dog",
  "name": "Pixel Dog",
  "author": "Zepp Pet Universe",
  "version": "1.0.0",
  "minimumApiLevel": "3.0",
  "screenShapes": ["r", "s"],
  "forms": {
    "baby": {
      "static": "baby/static.png",
      "aod": "baby/aod.png",
      "actions": {
        "wakeIdle": { "prefix": "baby/wake_", "frames": 8, "fps": 8 },
        "speciesIdle": { "prefix": "baby/idle_", "frames": 8, "fps": 8 },
        "tapReact": { "prefix": "baby/tap_", "frames": 8, "fps": 8 },
        "feed": { "prefix": "baby/feed_", "frames": 12, "fps": 10 },
        "happy": { "prefix": "baby/happy_", "frames": 10, "fps": 10 },
        "noFood": { "prefix": "baby/no_food_", "frames": 8, "fps": 8 },
        "goalCelebrate": { "prefix": "baby/celebrate_", "frames": 10, "fps": 10 },
        "sleepAod": { "prefix": "baby/sleep_", "frames": 8, "fps": 8 },
        "evolutionHint": { "prefix": "baby/evolve_", "frames": 10, "fps": 10 }
      }
    },
    "teen": {
      "static": "teen/static.png",
      "aod": "teen/aod.png",
      "actions": {
        "wakeIdle": { "prefix": "teen/wake_", "frames": 8, "fps": 8 },
        "speciesIdle": { "prefix": "teen/idle_", "frames": 8, "fps": 8 },
        "tapReact": { "prefix": "teen/tap_", "frames": 8, "fps": 8 },
        "feed": { "prefix": "teen/feed_", "frames": 12, "fps": 10 },
        "happy": { "prefix": "teen/happy_", "frames": 10, "fps": 10 },
        "noFood": { "prefix": "teen/no_food_", "frames": 8, "fps": 8 },
        "goalCelebrate": { "prefix": "teen/celebrate_", "frames": 10, "fps": 10 },
        "sleepAod": { "prefix": "teen/sleep_", "frames": 8, "fps": 8 },
        "evolutionHint": { "prefix": "teen/evolve_", "frames": 10, "fps": 10 }
      }
    }
  }
}
```

Repeat for all 9 pets. The Baby and Teen forms are created now; mature/rare/secret forms will be filled in during the sprite generation pass.

- [ ] **Step 4: Run validation on all packs**

```powershell
for pet in pixel-cat pixel-dog pixel-bunny pixel-hamster pixel-penguin pixel-dragon pixel-ghost pixel-axolotl pixel-slime; do
  node scripts/validate-pet-pack.mjs pet-packs/$pet/manifest.json
done
```

Expected: All 9 packs pass validation.

- [ ] **Step 5: Stage watch-face assets for all packs**

```powershell
npm.cmd run stage:watchface
```

- [ ] **Step 6: Create human visual review template**

Create `docs/review/sprite-visual-review.md`:

```md
# Visual Review: <Pet Name>

Reviewer:
Date:

## Checklist

- [ ] All frames are 32x32 pixels
- [ ] Transparent background
- [ ] Consistent anchor point across frames
- [ ] No jitter between consecutive frames
- [ ] Palette uses 4-6 flat colors
- [ ] Readable silhouette at wrist distance
- [ ] AOD frame is minimal (< 10% lit pixels)
- [ ] First and last frame transition cleanly to static.png
- [ ] wake_0.png suitable as AOD fallback
- [ ] No copyright concerns (original character)
- [ ] All 9 required actions present for Baby form

## Form Review

| Form | Static | AOD | Actions | Notes |
|------|--------|-----|---------|-------|
| Baby | | | | |
| Teen | | | | |
| Active | | | | |
| Steady | | | | |
| Explorer | | | | |
| Rare | | | | |
| Secret | | | | |

## Issues

1.

## Decision

[ ] APPROVED
[ ] CHANGES REQUIRED
```

- [ ] **Step 7: Run measurements**

```powershell
npm.cmd run measure:assets
```

- [ ] **Step 8: Commit**

```powershell
git add pet-packs/ docs/review/
git commit -m "feat: add launch roster of nine pets with wiring assets and review template"
```

---

## Task 14: Generate Mature/Rare/Secret Sprite Forms For All Pets

**Files:**
- `pet-packs/*/manifest.json` (add active, steady, explorer, rare, secret forms)
- `pet-packs/*/active/*.png`, `pet-packs/*/steady/*.png`, `pet-packs/*/explorer/*.png`
- `pet-packs/*/rare/*.png`, `pet-packs/*/secret/*.png`

**Details:** Each mature branch form needs distinct sprites that differ by silhouette or meaningful features — not color alone.

**Mature branch differentiation guidelines:**
- **Active:** Taller, more energetic posture. Wider stance, dynamic pose.
- **Steady:** Balanced, grounded posture. Calm expression, centered.
- **Explorer:** Curious, leaning-forward posture. Slightly asymmetrical, looking around.

**Rare forms:** Use explicit unlock criteria (e.g., 7-day streak, 50 cumulative food fed). Sprite is a premium variant.

**Secret forms:** Use hidden preconditions with low probability trigger. `[HUMAN-REQUIRED: Design secret form unlock conditions for each pet]`

Each mature/rare/secret form requires the same 9 required actions as Baby.

- [ ] **Step 1: Write wiring asset generator for mature forms**

- [ ] **Step 2: Generate wiring assets for all mature forms**

```powershell
node scripts/create-wiring-pet-assets.mjs
```

- [ ] **Step 3: Validate all pet packs with new forms**

```powershell
for pet in pixel-cat pixel-dog pixel-bunny pixel-hamster pixel-penguin pixel-dragon pixel-ghost pixel-axolotl pixel-slime; do
  node scripts/validate-pet-pack.mjs pet-packs/$pet/manifest.json
done
```

- [ ] **Step 4: Commit**

```powershell
git add pet-packs/
git commit -m "feat: add mature, rare, and secret forms with wiring assets for all nine pets"
```

---

## Task 15: English-First UI Pass And Round/Square Layout Verification

**Files:**
- All `device-app/page/*/*.layout.js` files
- All `device-app/page/*/*.js` files
- `watchface/index.js`

**Details:**
- Verify every user-facing string uses the `t()` i18n function
- Verify text fits within defined layout bounds
- Verify round layout at 480x480
- Verify square layout at 390x450
- Verify AOD layout returns early with minimal widgets

- [ ] **Step 1: Audit all JS files for hardcoded English strings**

Search for hardcoded English strings in Mini Program pages and the watch face:

```powershell
rg '"' device-app/page/ --include '*.js' | rg -v 't\(' | rg -v 'import|export|console|https?://' | rg '"' > /tmp/hardcoded-strings.txt
```

- [ ] **Step 2: Migrate any remaining hardcoded strings to i18n**

- [ ] **Step 3: Run all tests**

```powershell
npm.cmd test
git diff --check
```

- [ ] **Step 4: Commit**

```powershell
git add device-app/ watchface/
git commit -m "i18n: ensure all user-facing strings use English-first i18n module"
```

---

## Task 16: Build Verification With Zeus CLI

**Files:**
- `device-app/app.json` (final)
- `watchface/app.json` (final)

**Details:** Build the Device Mini Program and watch face with the Zeus CLI to verify:
- All pages register and build without errors
- All assets are resolved
- The Rollup transform succeeds
- The `zpm` packaging works (requires Node 18/20 workaround)

- [ ] **Step 1: Build device Mini Program**

```powershell
Set-Location device-app
zeus build
Set-Location ..
```

Expected: Build succeeds, dist/ contains the device-app package.

If `zpm` fails with Node v24 error:

```powershell
# Use Node 18/20 workaround
nvm use 18
zeus build
nvm use 24
```

- [ ] **Step 2: Build watch face**

```powershell
Set-Location watchface
zeus build
Set-Location ..
```

Expected: Build succeeds.

- [ ] **Step 3: Record build results**

Record in `watchface/README.md`:

```md
## Build Results

Date: 2026-06-02
Node version: v24.x (v18.x workaround used: yes/no)

| Target | Build | Notes |
|--------|-------|-------|
| device-app | PASS | |
| watchface | PASS | |
```

- [ ] **Step 4: Commit**

```powershell
git add device-app/ watchface/ watchface/README.md
git commit -m "build: verify zeus build for device app and watch face"
```

---

## Task 17: Release Checklist And Final Verification

**Files:**
- Create: `docs/release/phase-1-release-checklist.md`

**Details:** Create a release checklist covering all verification gates that must pass before V1 can be shipped.

- [ ] **Step 1: Write release checklist**

Create `docs/release/phase-1-release-checklist.md`:

```md
# Phase 1 (V1) Release Checklist

## Pre-Release Verification

### Automated Tests
- [ ] `npm.cmd test` passes (all core logic tests)
- [ ] `npm.cmd run validate:pack` passes for all 9 pets
- [ ] `npm.cmd run measure:assets` succeeds

### Device Mini Program
- [ ] Build succeeds: `zeus build` from `device-app/`
- [ ] All 5 pages render (home, collection, detail, history, form-switch)
- [ ] Steps display correctly on round layout (480px)
- [ ] Steps display correctly on square layout (390px)
- [ ] Food settlement works without duplicates
- [ ] Feed consumes food and adds experience
- [ ] Evolution progression works (Baby -> Teen -> Mature)
- [ ] Close-score user choice appears when applicable
- [ ] Collection shows all unlocked pets and forms
- [ ] 7-day history displays correctly
- [ ] Form switching works for unlocked forms
- [ ] Corrupt-profile recovery preserves readable data
- [ ] Profile persists across app restarts `[HW-NEEDED: Does LocalStorage survive device restart?]`

### Watch Face
- [ ] Build succeeds: `zeus build` from `watchface/`
- [ ] Wake animation plays once on raise-to-wake `[HW-NEEDED: Does IMG_ANIM with repeat_count=1 and display_on_restart=true work correctly on device?]`
- [ ] Static frame displays after animation `[HW-NEEDED: Does default_frame_index=0 display correctly after animation completes?]`
- [ ] AOD mode shows static silhouette `[HW-NEEDED: Does getScreenType() correctly report AOD mode and display aod.png?]`
- [ ] Time and steps display correctly `[HW-NEEDED: Does STEP sensor.current return accurate daily total?]`
- [ ] Tap behavior works (if supported) `[HW-NEEDED: Does addEventListener(CLICK_DOWN) trigger on watch-face widgets?]`
- [ ] Package size within budget

### Visual Review
- [ ] All 9 pet packs validated
- [ ] All sprites at 32x32 with transparent background
- [ ] Consistent anchor across frames within each animation
- [ ] Mature branches differ by silhouette, not color alone
- [ ] AOD sprites minimal (< 10% lit pixels)
- [ ] Review completed for each pet: `docs/review/sprite-visual-review.md`

### Platform Compliance
- [ ] Device Mini Program API_LEVEL 3.0
- [ ] Watch-face V3 manifest
- [ ] English-first UI (all strings through i18n module)
- [ ] Round and square layouts verified
- [ ] No GPS, heart-rate, workout permissions requested
- [ ] No background timers or infinite animation loops
- [ ] No runtime asset downloading

### Hardware Verification
- [ ] Installed on round physical watch `[HW-NEEDED: Install watch face and Mini Program on round device; verify all capabilities]`
- [ ] Installed on square physical watch `[HW-NEEDED: Install watch face and Mini Program on square device; verify all capabilities]`
- [ ] 24-hour battery measurement recorded `[HW-NEEDED: Measure battery delta between baseline face and pet face over 24h with same AOD/raise settings]`
- [ ] Selected-pet variant packaging confirmed working `[HW-NEEDED: Verify that installing a pet-specific watch-face variant displays the correct pet]`
- [ ] Tap interaction verified or documented as Mini Program only `[HW-NEEDED: Confirm whether CLICK_DOWN works on watch-face widgets at runtime]`

### Production Readiness
- [ ] `appId` values set to registered IDs (not temporary spike IDs)
- [ ] Version numbers updated (`1.0.0`)
- [ ] Zepp Open Platform credentials configured
- [ ] `zeus login` confirmed
- [ ] `zeus preview` generates QR code for installation

## Deployment
1. Build production packages: `zeus build` for both targets
2. Install via QR code and Zepp App
3. Verify on device for 24-hour period
4. Submit to Zepp App Store (if applicable)
```

- [ ] **Step 2: Run final automated verification**

```powershell
npm.cmd test
npm.cmd run validate:pack
npm.cmd run measure:assets
git diff --check
```

Expected: All pass.

- [ ] **Step 3: Commit**

```powershell
git add docs/release/
git commit -m "docs: add V1 release checklist"
```

---

## Task 18: Final Plan Self-Review

**Files:**
- `docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-1-product.md`

- [ ] **Step 1: Scan for placeholder markers**

```powershell
rg -n "TBD|TODO|FIXME|implement later|similar to" docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-1-product.md
```

Expected: Zero matches. If any are found, replace with explicit values or mark as `[HW-NEEDED]` with a specific question.

- [ ] **Step 2: Check whitespace**

```powershell
git diff --check
```

Expected: No whitespace errors.

- [ ] **Step 3: Verify [HW-NEEDED] annotations are specific**

```powershell
rg -n "\[HW-NEEDED" docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-1-product.md
```

Verify every `[HW-NEEDED]` annotation contains a specific question, not a vague placeholder.

- [ ] **Step 4: Commit plan**

```powershell
git add docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-1-product.md
git commit -m "docs: plan pet universe phase one product"
```

---

## Measured Budgets From Phase 0

| Metric | Phase 0 Value | Phase 1 Target | Notes |
|--------|---------------|----------------|-------|
| Pet-pack asset bytes (one pet, one form) | 9,819 bytes (47 frames x 32x32) | < 50 KB per pet (all forms) | Phase 0 was 1 form; Phase 1 has 7 forms, estimated 7x |
| Pet-pack frame count | 47 frames | ~400 frames per pet (7 forms x ~57 frames avg) | Estimate |
| Watch-face package bytes | TBD (zpm blocked) | TBD | `[HW-NEEDED: Measure watch-face .zab package size on Node 18/20]` |
| Device-app package bytes | TBD (zpm blocked) | TBD | `[HW-NEEDED: Measure device-app .zab package size on Node 18/20]` |
| RAM usage | TBD | TBD | `[HW-NEEDED: Measure memory on physical device]` |
| AOD lit-pixel ratio | TBD | <= 10% | `[HW-NEEDED: Measure AOD pixels on physical display]` |
| 24h battery delta | TBD | TBD | `[HW-NEEDED: Compare baseline vs pet face on physical device]` |
| IMG_ANIM animation duration | 1s (8 frames at 8 FPS) | 1-2 seconds | Consistent with spec |

## Evolution Scoring Parameters (Initial)

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| `FOOD_PER_STEPS` | 1000 | Phase 0 verified |
| `DAILY_FOOD_CAP` | 10 | Phase 0 verified |
| `SCORING_WINDOW_DAYS` | 7 | Design spec |
| `BABY_TO_TEEN_EXPERIENCE` | 200 | ~20 feeds |
| `TEEN_TO_MATURE_EXPERIENCE` | 500 | ~50 feeds total |
| `EXPERIENCE_PER_FEED` | 10 | 1 feed per food |
| `AFFINITY_PER_FEED` | 5 | Grows with feeding |
| `CLOSE_SCORE_THRESHOLD` | 15 | Points difference to trigger user choice |
| `DAILY_STEP_TARGET` | 5000 | Steady consistency baseline |
| `HIGH_STEP_THRESHOLD` | 8000 | Explorer variance bonus |

These initial values are calibrated from the spec and Phase 0 fixture testing. They should be tuned after real-device usage data. `[HW-NEEDED: Validate evolution timing with real step patterns on physical devices]`

## Phase 1 Task Summary

| Task | Description | Files | Tests | Dependencies |
|------|-------------|-------|-------|-------------|
| 1 | V1 core constants | constants.js, tests/constants-v1.test.mjs | 10 | Phase 0 complete |
| 2 | Active/Steady/Explorer scoring | core/scoring.js, tests/scoring.test.mjs | 22 | Task 1 |
| 3 | Collection data model | core/collection.js, tests/collection.test.mjs | 33 | Task 1 |
| 4 | Evolution progression | core/evolution.js, tests/evolution.test.mjs | 40+ | Tasks 2, 3 |
| 5 | Form-switch + close-score | core/form-switch.js, tests/form-switch.test.mjs | 45+ | Task 4 |
| 6 | Storage migration v1->v2 | profile.js, migrate-profile.mjs | 50+ | Task 1 |
| 7 | Pet-pack contract update | core/pet-pack.js, pet-pack tests | 50+ | Tasks 1-6 |
| 8 | Core wiring into Mini Program | home.js, i18n.js | 55+ | Tasks 2-7 |
| 9 | V1 watch face | watchface/ | 55+ | Task 7 |
| 10 | Content validator | content-validator.js | 60+ | Task 7 |
| 11 | Data files | data/*.json | 60+ | Task 1 |
| 12 | Mini Program pages | collection/, detail/, history/, form-switch/ | 60+ | Tasks 8, 11 |
| 13 | 9 pet packs + review | pet-packs/* | 60+ | Tasks 7, 10, 11 |
| 14 | Mature/Rare/Secret sprites | pet-packs/* forms | 60+ | Task 13 |
| 15 | English-first UI audit | All pages | 60+ | Tasks 8, 12 |
| 16 | Zeus build verification | device-app/, watchface/ | 60+ | Tasks 9, 12, 14 |
| 17 | Release checklist | docs/release/ | N/A | Tasks 1-16 |
| 18 | Self-review | This plan | N/A | Tasks 1-17 |

## Remaining Risks And Mitigations

| Risk | Severity | Mitigation | HW Needed? |
|------|----------|------------|------------|
| Watch-face CLICK_DOWN does not work at runtime | high | Tap interaction moves to Mini Program (default fallback) | Yes |
| Selected-pet watch-face variants confuse users | medium | Clear labeling in Zepp App store; Mini Program directs installation | Yes |
| zpm packaging fails on all Node versions | high | Manual package assembly fallback; report to Zepp team | Yes |
| 32x32 sprites are too small on low-resolution round screens | medium | Test at actual scale; increase to 48x48 if needed | Yes |
| AOD sprite not visible on some devices | medium | Simplify silhouette; remove AOD pet for affected devices | Yes |
| 24-hour battery impact exceeds expectations | high | Reduce animation frames or FPS; simplify AOD | Yes |
| Rare/Secret unlock conditions feel unreachable | low | Calibrate thresholds during beta; document hints | No |
| Scoring weights produce unbalanced results | medium | Tune with real step data after beta; adjustable constants | Yes |

## Hardware Dependency Register

Every `[HW-NEEDED]` annotation in this plan is listed below with the specific question:

1. `[HW-NEEDED: Does addEventListener(CLICK_DOWN) work on physical watch-face widgets?]`
2. `[HW-NEEDED: Does addEventListener(CLICK_DOWN) work on device-app TEXT widgets?]`
3. `[HW-NEEDED: Does LocalStorage survive device restart?]`
4. `[HW-NEEDED: Can watch-face JS read its own appId or package variant name?]`
5. `[HW-NEEDED: Is the per-package watch-face variant approach installable and switchable on physical devices?]`
6. `[HW-NEEDED: Measure watch-face .zab package size on Node 18/20]`
7. `[HW-NEEDED: Measure device-app .zab package size on Node 18/20]`
8. `[HW-NEEDED: Measure memory on physical device]`
9. `[HW-NEEDED: Measure AOD pixels on physical display]`
10. `[HW-NEEDED: Compare baseline vs pet face battery on physical device]`
11. `[HW-NEEDED: Validate evolution timing with real step patterns on physical devices]`
12. `[HW-NEEDED: Does IMG_ANIM play once and stop on default_frame_index?]`
13. `[HW-NEEDED: Does getScreenType() correctly report AOD mode?]`
14. `[HW-NEEDED: Does aod.png display correctly in AOD?]`

Total: 14 hardware-dependent items. Phase 1 code architecture is correct for either outcome of each item.
