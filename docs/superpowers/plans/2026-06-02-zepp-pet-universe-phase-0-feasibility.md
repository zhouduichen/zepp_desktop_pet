# Zepp Pet Universe Phase 0 Feasibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and measure a one-pet Zepp OS prototype that proves the light watch-face interaction model, the companion Mini Program settlement model, the asset contract, and the supported state-sharing path before the full product is implemented.

**Architecture:** Keep the uncertain watch-face runtime isolated under `watchface-spike/` and the API_LEVEL 3.0 device Mini Program under `device-app/`. Put deterministic growth, food, profile, and pet-pack logic in `core/` so Node tests can verify the product rules without a watch simulator. Record physical-device findings in `docs/validation/phase-0-device-spike.md`; the plan does not assume undocumented cross-runtime storage or runtime asset downloads.

**Tech Stack:** Zepp OS V3 device Mini Program APIs (`@zos/ui`, `@zos/sensor`, `@zos/storage`), JavaScript watch-face APIs (`hmUI`, `hmSensor`), Node.js built-in test runner, Zeus CLI, PNG sprite sequences.

---

## Scope And Release Gate

This plan implements only Phase 0 from the approved design:

- one representative pet: `pixel-cat`
- one Baby form
- round and square device-app layouts
- watch-face wake animation, step readout, tap reaction, and AOD wiring frame
- Mini Program food settlement and compact local profile storage
- automated pet-pack validation
- physical-device measurement notes

Do not generate the 8-10 pet launch roster, implement the full collection UI, or add Side Service work until this spike answers the gate questions in `docs/superpowers/specs/2026-06-02-zepp-pet-universe-design.md`.

## File Map

### Repository-level files

- `package.json`: Node test and validation commands.
- `.gitignore`: ignore installed dependencies, Zeus output, and temporary reports.
- `scripts/create-wiring-pet-assets.mjs`: generate deterministic one-pixel PNG frames for prototype wiring only.
- `scripts/validate-pet-pack.mjs`: validate pet-pack metadata and required assets.
- `scripts/stage-watchface-assets.mjs`: mirror the selected canonical pet pack into round and square watch-face asset trees.
- `scripts/measure-assets.mjs`: summarize file counts and bytes for physical-device notes.

### Deterministic device-app core

- `device-app/core/date-key.js`: format local dates as `YYYYMMDD`.
- `device-app/core/constants.js`: food and history limits.
- `device-app/core/profile.js`: valid default profile and safe profile normalization.
- `device-app/core/settlement.js`: convert current steps into guarded food rewards.
- `core/pet-pack.js`: load and validate pet-pack manifests.
- `tests/*.test.mjs`: Node tests for every deterministic rule.

### Device Mini Program

- `device-app/app.json`: API_LEVEL 3.0 device-app manifest.
- `device-app/app.js`: lifecycle shell.
- `device-app/global.d.ts`: device type references.
- `device-app/jsconfig.json`: JavaScript type checking.
- `device-app/utils/storage.js`: LocalStorage adapter with corrupt-data recovery.
- `device-app/page/common.r.layout.js`: round screen base dimensions.
- `device-app/page/common.s.layout.js`: square screen base dimensions.
- `device-app/page/home/home.js`: step settlement and prototype profile summary.
- `device-app/page/home/home.r.layout.js`: round home coordinates.
- `device-app/page/home/home.s.layout.js`: square home coordinates.

### Watch-face spike

- `watchface-spike/README.md`: explicit hypotheses, installation notes, and fallback rule.
- `watchface-spike/app.json`: V3 watch-face package manifest based on official docs verified during implementation.
- `watchface-spike/index.js`: watch-face STEP sensor, finite IMG_ANIM wake animation, tap reaction experiment, and AOD/static frame experiment.
- `pet-packs/pixel-cat/manifest.json`: one representative canonical pet-pack manifest.
- `pet-packs/pixel-cat/baby/*.png`: generated wiring static, AOD, and short-animation frames.
- `watchface-spike/assets/gt.r/pixel-cat/**`: generated round watch-face asset mirror.
- `watchface-spike/assets/gt.s/pixel-cat/**`: generated square watch-face asset mirror.

### Physical-device documentation

- `docs/validation/phase-0-device-spike.md`: measured round/square device findings, battery observations, supported persistence path, and go/no-go decision.

## Task 1: Scaffold The Testable Prototype Repository

**Files:**
- Create: `.gitignore`
- Create: `package.json`
- Create: `device-app/core/constants.js`
- Create: `tests/smoke.test.mjs`

- [ ] **Step 1: Write the failing smoke test**

Create `tests/smoke.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { FOOD_PER_STEPS, DAILY_FOOD_CAP, HISTORY_DAYS } from "../device-app/core/constants.js";

test("phase 0 constants keep the prototype lightweight", () => {
  assert.equal(FOOD_PER_STEPS, 1000);
  assert.equal(DAILY_FOOD_CAP, 10);
  assert.equal(HISTORY_DAYS, 30);
});
```

- [ ] **Step 2: Create the Node package metadata and ignore rules**

Create `package.json`:

```json
{
  "name": "zepp-pet-universe",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/*.test.mjs",
    "validate:pack": "node scripts/validate-pet-pack.mjs pet-packs/pixel-cat/manifest.json",
    "stage:watchface": "node scripts/stage-watchface-assets.mjs pet-packs/pixel-cat watchface-spike/assets",
    "measure:assets": "node scripts/measure-assets.mjs pet-packs/pixel-cat"
  },
  "devDependencies": {
    "@zeppos/device-types": "^3.0.0"
  },
  "dependencies": {
    "@zeppos/zml": "^0.0.9"
  }
}
```

Create `.gitignore`:

```text
node_modules/
dist/
*.log
reports/*.json
```

- [ ] **Step 3: Run the smoke test to verify it fails**

Run:

```powershell
npm.cmd test
```

Expected: FAIL because `device-app/core/constants.js` does not exist.

- [ ] **Step 4: Add the lightweight constants**

Create `device-app/core/constants.js`:

```js
export const FOOD_PER_STEPS = 1000;
export const DAILY_FOOD_CAP = 10;
export const HISTORY_DAYS = 30;
export const DEFAULT_PET_ID = "pixel-cat";
export const DEFAULT_FORM_ID = "baby";
```

- [ ] **Step 5: Run the smoke test to verify it passes**

Run:

```powershell
npm.cmd test
```

Expected: PASS with `1` passing test.

- [ ] **Step 6: Commit**

```powershell
git add .gitignore package.json device-app/core/constants.js tests/smoke.test.mjs
git commit -m "chore: scaffold pet universe phase zero"
```

## Task 2: Add Date Keys And Safe Profile Normalization

**Files:**
- Create: `device-app/core/date-key.js`
- Create: `device-app/core/profile.js`
- Create: `tests/profile.test.mjs`

- [ ] **Step 1: Write failing profile tests**

Create `tests/profile.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { toDateKey } from "../device-app/core/date-key.js";
import { createDefaultProfile, normalizeProfile } from "../device-app/core/profile.js";

test("toDateKey formats local calendar fields", () => {
  assert.equal(toDateKey(new Date(2026, 5, 2, 23, 59)), "20260602");
});

test("createDefaultProfile returns a compact valid profile", () => {
  assert.deepEqual(createDefaultProfile("20260602"), {
    schemaVersion: 1,
    selectedPetId: "pixel-cat",
    selectedFormId: "baby",
    foodBalance: 0,
    affinity: 0,
    experience: 0,
    lastSettlementDate: "20260602",
    lastSettledSteps: 0,
    dailyActivity: []
  });
});

test("normalizeProfile recovers invalid counters and keeps readable activity", () => {
  assert.deepEqual(
    normalizeProfile({
      selectedPetId: "",
      selectedFormId: "",
      foodBalance: -4,
      affinity: "8",
      experience: 12.8,
      lastSettlementDate: "bad",
      lastSettledSteps: -2,
      dailyActivity: [{ date: "20260601", settledSteps: 3000, earnedFood: 3 }, { broken: true }]
    }, "20260602"),
    {
      schemaVersion: 1,
      selectedPetId: "pixel-cat",
      selectedFormId: "baby",
      foodBalance: 0,
      affinity: 8,
      experience: 12,
      lastSettlementDate: "20260602",
      lastSettledSteps: 0,
      dailyActivity: [{ date: "20260601", settledSteps: 3000, earnedFood: 3 }]
    }
  );
});
```

- [ ] **Step 2: Run the profile tests to verify they fail**

Run:

```powershell
node --test tests/profile.test.mjs
```

Expected: FAIL because `device-app/core/date-key.js` and `device-app/core/profile.js` do not exist.

- [ ] **Step 3: Implement date formatting**

Create `device-app/core/date-key.js`:

```js
const pad2 = (value) => String(value).padStart(2, "0");

export function toDateKey(date) {
  return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;
}
```

- [ ] **Step 4: Implement profile normalization**

Create `device-app/core/profile.js`:

```js
import { DEFAULT_FORM_ID, DEFAULT_PET_ID, HISTORY_DAYS } from "./constants.js";

const DATE_KEY = /^\d{8}$/;
const toNonNegativeInt = (value) => Math.max(0, Math.floor(Number(value) || 0));

export function createDefaultProfile(today) {
  return {
    schemaVersion: 1,
    selectedPetId: DEFAULT_PET_ID,
    selectedFormId: DEFAULT_FORM_ID,
    foodBalance: 0,
    affinity: 0,
    experience: 0,
    lastSettlementDate: today,
    lastSettledSteps: 0,
    dailyActivity: []
  };
}

export function normalizeProfile(value, today) {
  const source = value && typeof value === "object" ? value : {};
  const dailyActivity = Array.isArray(source.dailyActivity)
    ? source.dailyActivity
        .filter((entry) => entry && DATE_KEY.test(entry.date))
        .map((entry) => ({
          date: entry.date,
          settledSteps: toNonNegativeInt(entry.settledSteps),
          earnedFood: toNonNegativeInt(entry.earnedFood)
        }))
        .slice(-HISTORY_DAYS)
    : [];

  return {
    schemaVersion: 1,
    selectedPetId: typeof source.selectedPetId === "string" && source.selectedPetId
      ? source.selectedPetId
      : DEFAULT_PET_ID,
    selectedFormId: typeof source.selectedFormId === "string" && source.selectedFormId
      ? source.selectedFormId
      : DEFAULT_FORM_ID,
    foodBalance: toNonNegativeInt(source.foodBalance),
    affinity: toNonNegativeInt(source.affinity),
    experience: toNonNegativeInt(source.experience),
    lastSettlementDate: DATE_KEY.test(source.lastSettlementDate) ? source.lastSettlementDate : today,
    lastSettledSteps: toNonNegativeInt(source.lastSettledSteps),
    dailyActivity
  };
}
```

- [ ] **Step 5: Run all Node tests**

Run:

```powershell
npm.cmd test
```

Expected: PASS with `4` passing tests.

- [ ] **Step 6: Commit**

```powershell
git add device-app/core/date-key.js device-app/core/profile.js tests/profile.test.mjs
git commit -m "feat: add compact profile normalization"
```

## Task 3: Implement Guarded Step-To-Food Settlement

**Files:**
- Create: `device-app/core/settlement.js`
- Create: `tests/settlement.test.mjs`

- [ ] **Step 1: Write failing settlement tests**

Create `tests/settlement.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { createDefaultProfile } from "../device-app/core/profile.js";
import { settleSteps } from "../device-app/core/settlement.js";

test("settleSteps grants one food per 1000 new steps", () => {
  const result = settleSteps(createDefaultProfile("20260602"), "20260602", 2450);
  assert.equal(result.earnedFood, 2);
  assert.equal(result.profile.foodBalance, 2);
  assert.equal(result.profile.lastSettledSteps, 2450);
});

test("settleSteps does not duplicate food on repeated settlement", () => {
  const once = settleSteps(createDefaultProfile("20260602"), "20260602", 2450).profile;
  const twice = settleSteps(once, "20260602", 2450);
  assert.equal(twice.earnedFood, 0);
  assert.equal(twice.profile.foodBalance, 2);
});

test("settleSteps keeps partial progress across incremental opens", () => {
  const at950 = settleSteps(createDefaultProfile("20260602"), "20260602", 950);
  const at1200 = settleSteps(at950.profile, "20260602", 1200);
  const at1950 = settleSteps(at1200.profile, "20260602", 1950);
  const at2000 = settleSteps(at1950.profile, "20260602", 2000);
  assert.deepEqual(
    [at950.earnedFood, at1200.earnedFood, at1950.earnedFood, at2000.earnedFood],
    [0, 1, 0, 1]
  );
});

test("settleSteps carries partial progress and caps daily food", () => {
  const profile = settleSteps(createDefaultProfile("20260602"), "20260602", 9500).profile;
  const result = settleSteps(profile, "20260602", 15800);
  assert.equal(result.earnedFood, 1);
  assert.equal(result.profile.foodBalance, 10);
  assert.equal(result.profile.dailyActivity.at(-1).earnedFood, 10);
});

test("settleSteps starts a new daily activity record after rollover", () => {
  const profile = settleSteps(createDefaultProfile("20260602"), "20260602", 2800).profile;
  const result = settleSteps(profile, "20260603", 1200);
  assert.equal(result.earnedFood, 1);
  assert.equal(result.profile.lastSettledSteps, 1200);
  assert.deepEqual(result.profile.dailyActivity, [
    { date: "20260602", settledSteps: 2800, earnedFood: 2 },
    { date: "20260603", settledSteps: 1200, earnedFood: 1 }
  ]);
});
```

- [ ] **Step 2: Run settlement tests to verify they fail**

Run:

```powershell
node --test tests/settlement.test.mjs
```

Expected: FAIL because `device-app/core/settlement.js` does not exist.

- [ ] **Step 3: Implement guarded settlement**

Create `device-app/core/settlement.js`:

```js
import { DAILY_FOOD_CAP, FOOD_PER_STEPS, HISTORY_DAYS } from "./constants.js";
import { normalizeProfile } from "./profile.js";

const toNonNegativeInt = (value) => Math.max(0, Math.floor(Number(value) || 0));

export function settleSteps(inputProfile, today, currentSteps) {
  const profile = normalizeProfile(inputProfile, today);
  const steps = toNonNegativeInt(currentSteps);
  const isNewDay = profile.lastSettlementDate !== today;
  const existing = isNewDay ? null : profile.dailyActivity.find((entry) => entry.date === today);
  const earnedToday = existing?.earnedFood ?? 0;
  const entitledFood = Math.min(DAILY_FOOD_CAP, Math.floor(steps / FOOD_PER_STEPS));
  const earnedFood = Math.max(0, entitledFood - earnedToday);
  const updatedActivity = profile.dailyActivity.filter((entry) => entry.date !== today);

  updatedActivity.push({
    date: today,
    settledSteps: steps,
    earnedFood: earnedToday + earnedFood
  });

  return {
    earnedFood,
    profile: {
      ...profile,
      foodBalance: profile.foodBalance + earnedFood,
      lastSettlementDate: today,
      lastSettledSteps: steps,
      dailyActivity: updatedActivity.slice(-HISTORY_DAYS)
    }
  };
}
```

- [ ] **Step 4: Run all Node tests**

Run:

```powershell
npm.cmd test
```

Expected: PASS with `9` passing tests.

- [ ] **Step 5: Commit**

```powershell
git add device-app/core/settlement.js tests/settlement.test.mjs
git commit -m "feat: settle step rewards without duplicates"
```

## Task 4: Define And Validate The Representative Pet Pack

**Files:**
- Create: `core/pet-pack.js`
- Create: `tests/pet-pack.test.mjs`
- Create: `pet-packs/pixel-cat/manifest.json`
- Create: `scripts/create-wiring-pet-assets.mjs`
- Create: `scripts/validate-pet-pack.mjs`
- Create: `scripts/stage-watchface-assets.mjs`

- [ ] **Step 1: Write failing manifest tests**

Create `tests/pet-pack.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { validatePetPack } from "../core/pet-pack.js";

const validPack = {
  schemaVersion: 1,
  id: "pixel-cat",
  name: "Pixel Cat",
  author: "Zepp Pet Universe",
  version: "0.0.1",
  minimumApiLevel: "3.0",
  screenShapes: ["r", "s"],
  forms: {
    baby: {
      static: "baby/static.png",
      aod: "baby/aod.png",
      actions: {
        wakeIdle: { prefix: "baby/wake_", frames: 8, fps: 8 },
        tapReact: { prefix: "baby/tap_", frames: 8, fps: 8 },
        feed: { prefix: "baby/feed_", frames: 12, fps: 10 },
        happy: { prefix: "baby/happy_", frames: 10, fps: 10 },
        noFood: { prefix: "baby/no_food_", frames: 8, fps: 8 }
      }
    }
  }
};

test("validatePetPack accepts the phase 0 representative pack", () => {
  assert.deepEqual(validatePetPack(validPack), []);
});

test("validatePetPack rejects missing required actions", () => {
  const broken = structuredClone(validPack);
  delete broken.forms.baby.actions.feed;
  assert.deepEqual(validatePetPack(broken), ["forms.baby.actions.feed is required"]);
});

test("validatePetPack rejects long or high-fps watch-face actions", () => {
  const broken = structuredClone(validPack);
  broken.forms.baby.actions.happy = { prefix: "baby/happy_", frames: 30, fps: 20 };
  assert.deepEqual(validatePetPack(broken), [
    "forms.baby.actions.happy.frames must be between 8 and 20",
    "forms.baby.actions.happy.fps must be between 8 and 12"
  ]);
});
```

- [ ] **Step 2: Run the manifest tests to verify they fail**

Run:

```powershell
node --test tests/pet-pack.test.mjs
```

Expected: FAIL because `core/pet-pack.js` does not exist.

- [ ] **Step 3: Implement manifest validation**

Create `core/pet-pack.js`:

```js
const REQUIRED_ACTIONS = ["wakeIdle", "tapReact", "feed", "happy", "noFood"];

export function validatePetPack(pack) {
  const errors = [];
  if (pack?.schemaVersion !== 1) errors.push("schemaVersion must be 1");
  if (!pack?.id) errors.push("id is required");
  if (!pack?.name) errors.push("name is required");
  if (!pack?.forms?.baby) errors.push("forms.baby is required");

  const baby = pack?.forms?.baby;
  for (const actionName of REQUIRED_ACTIONS) {
    const path = `forms.baby.actions.${actionName}`;
    const action = baby?.actions?.[actionName];
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
  return errors;
}
```

- [ ] **Step 4: Create the representative manifest**

Create `pet-packs/pixel-cat/manifest.json`:

```json
{
  "schemaVersion": 1,
  "id": "pixel-cat",
  "name": "Pixel Cat",
  "author": "Zepp Pet Universe",
  "version": "0.0.1",
  "minimumApiLevel": "3.0",
  "screenShapes": ["r", "s"],
  "forms": {
    "baby": {
      "static": "baby/static.png",
      "aod": "baby/aod.png",
      "actions": {
        "wakeIdle": { "prefix": "baby/wake_", "frames": 8, "fps": 8 },
        "tapReact": { "prefix": "baby/tap_", "frames": 8, "fps": 8 },
        "feed": { "prefix": "baby/feed_", "frames": 12, "fps": 10 },
        "happy": { "prefix": "baby/happy_", "frames": 10, "fps": 10 },
        "noFood": { "prefix": "baby/no_food_", "frames": 8, "fps": 8 }
      }
    }
  }
}
```

- [ ] **Step 5: Add a deterministic wiring-asset generator**

Create `scripts/create-wiring-pet-assets.mjs`:

```js
import { mkdir, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

const root = path.resolve("pet-packs/pixel-cat/baby");
const actions = { wake: 8, tap: 8, feed: 12, happy: 10, no_food: 8 };

function chunk(type, data) {
  const name = Buffer.from(type);
  const body = Buffer.concat([name, data]);
  let crc = 0xffffffff;
  for (const byte of body) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  const trailer = Buffer.alloc(4);
  trailer.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([Buffer.from([(data.length >>> 24) & 255, (data.length >>> 16) & 255, (data.length >>> 8) & 255, data.length & 255]), body, trailer]);
}

function png(width, height, rgba) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  const rows = [];
  for (let y = 0; y < height; y += 1) rows.push(Buffer.concat([Buffer.from([0]), Buffer.from(rgba)]));
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", zlib.deflateSync(Buffer.concat(rows))),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

await mkdir(root, { recursive: true });
const solid = png(1, 1, [255, 207, 112, 255]);
await writeFile(path.join(root, "static.png"), solid);
await writeFile(path.join(root, "aod.png"), png(1, 1, [170, 170, 170, 255]));
for (const [prefix, count] of Object.entries(actions)) {
  for (let index = 0; index < count; index += 1) {
    await copyFile(path.join(root, "static.png"), path.join(root, `${prefix}_${index}.png`));
  }
}
await copyFile(path.join(root, "aod.png"), path.join(root, "wake_0.png"));
console.log("created wiring pixel-cat assets");
```

These one-pixel files exist for wiring only. Replace them with reviewed low-pixel sprites before physical visual evaluation.

- [ ] **Step 6: Add the CLI manifest validator**

Create `scripts/validate-pet-pack.mjs`:

```js
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { validatePetPack } from "../core/pet-pack.js";

const manifestPath = path.resolve(process.argv[2]);
const pack = JSON.parse(await readFile(manifestPath, "utf8"));
const errors = validatePetPack(pack);
const baseDir = path.dirname(manifestPath);
const baby = pack.forms?.baby;
const assetPaths = [baby?.static, baby?.aod];
for (const action of Object.values(baby?.actions ?? {})) {
  for (let index = 0; index < action.frames; index += 1) assetPaths.push(`${action.prefix}${index}.png`);
}
for (const relativePath of assetPaths.filter(Boolean)) {
  try {
    await access(path.join(baseDir, relativePath));
  } catch {
    errors.push(`missing asset: ${relativePath}`);
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`valid pet pack: ${pack.id}`);
}
```

- [ ] **Step 7: Add the round and square watch-face asset staging script**

Create `scripts/stage-watchface-assets.mjs`:

```js
import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const source = path.resolve(process.argv[2]);
const watchfaceAssets = path.resolve(process.argv[3]);

for (const target of ["gt.r", "gt.s"]) {
  const destination = path.join(watchfaceAssets, target, path.basename(source));
  if (!destination.startsWith(`${watchfaceAssets}${path.sep}`)) {
    throw new Error(`refusing to stage outside ${watchfaceAssets}`);
  }
  await rm(destination, { recursive: true, force: true });
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true });
}
console.log("staged pixel-cat assets for gt.r and gt.s");
```

- [ ] **Step 8: Generate wiring assets and run validation**

Run:

```powershell
node scripts/create-wiring-pet-assets.mjs
npm.cmd test
npm.cmd run validate:pack
npm.cmd run stage:watchface
```

Expected:

```text
created wiring pixel-cat assets
...
valid pet pack: pixel-cat
staged pixel-cat assets for gt.r and gt.s
```

- [ ] **Step 9: Commit**

```powershell
git add core/pet-pack.js tests/pet-pack.test.mjs scripts/create-wiring-pet-assets.mjs scripts/validate-pet-pack.mjs scripts/stage-watchface-assets.mjs pet-packs/pixel-cat watchface-spike/assets
git commit -m "feat: define representative pet pack contract"
```

## Task 5: Scaffold The Companion Device Mini Program

**Files:**
- Create: `device-app/package.json`
- Create: `device-app/jsconfig.json`
- Create: `device-app/global.d.ts`
- Create: `device-app/app.js`
- Create: `device-app/app.json`
- Create: `device-app/page/common.r.layout.js`
- Create: `device-app/page/common.s.layout.js`
- Create: `device-app/page/home/home.r.layout.js`
- Create: `device-app/page/home/home.s.layout.js`

- [ ] **Step 1: Create the device-app package metadata**

Create `device-app/package.json`:

```json
{
  "name": "zepp-pet-universe-device-app",
  "version": "0.0.1",
  "private": true,
  "main": "app.js",
  "devDependencies": {
    "@zeppos/device-types": "^3.0.0"
  },
  "dependencies": {
    "@zeppos/zml": "^0.0.9"
  }
}
```

Create `device-app/jsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es6",
    "checkJs": true
  },
  "exclude": ["node_modules", "**/node_modules/*"],
  "files": ["node_modules/@zeppos/device-types/dist/index.d.ts"]
}
```

Create `device-app/global.d.ts`:

```ts
/// <reference types="@zeppos/device-types" />
```

- [ ] **Step 2: Add the lifecycle shell and API_LEVEL 3.0 manifest**

Create `device-app/app.js`:

```js
App({
  globalData: {},
  onCreate() {
    console.log("Zepp Pet Universe created");
  },
  onDestroy() {
    console.log("Zepp Pet Universe destroyed");
  }
});
```

Create `device-app/app.json`:

```json
{
  "configVersion": "v3",
  "app": {
    "appId": 1099991,
    "appName": "Pet Universe Spike",
    "appType": "app",
    "version": { "code": 1, "name": "0.0.1" },
    "vender": "zepp",
    "description": "Pet Universe feasibility spike"
  },
  "permissions": [
    "data:os.device.info",
    "device:os.local_storage",
    "data:user.hd.step"
  ],
  "runtime": {
    "apiVersion": {
      "compatible": "3.0.0",
      "target": "3.0.0",
      "minVersion": "3.0"
    }
  },
  "debug": false,
  "targets": {
    "gt.r": {
      "module": {
        "page": {
          "pages": ["page/home/home"]
        }
      },
      "platforms": [{ "st": "r" }],
      "designWidth": 480
    },
    "gt.s": {
      "module": {
        "page": {
          "pages": ["page/home/home"]
        }
      },
      "platforms": [{ "st": "s" }],
      "designWidth": 390
    }
  },
  "i18n": {
    "en-US": { "appName": "Pet Universe Spike" }
  },
  "defaultLanguage": "en-US"
}
```

The numeric `appId` is temporary for the local spike. Replace it with the registered app ID before distribution.

- [ ] **Step 3: Add round and square layout constants**

Create `device-app/page/common.r.layout.js`:

```js
import { px } from "@zos/utils";

export const SCREEN = { x: px(0), y: px(0), w: px(480), h: px(480) };
```

Create `device-app/page/common.s.layout.js`:

```js
import { px } from "@zos/utils";
import { setStatusBarVisible } from "@zos/ui";

setStatusBarVisible(false);
export const SCREEN = { x: px(0), y: px(0), w: px(390), h: px(450) };
```

Create `device-app/page/home/home.r.layout.js`:

```js
import { px } from "@zos/utils";
import { align } from "@zos/ui";

export const TITLE = { x: px(70), y: px(72), w: px(340), h: px(44), color: 0xffffff, text_size: px(28), align_h: align.CENTER_H };
export const STEPS = { x: px(70), y: px(170), w: px(340), h: px(40), color: 0x91d1b2, text_size: px(24), align_h: align.CENTER_H };
export const FOOD = { x: px(70), y: px(225), w: px(340), h: px(40), color: 0xffd276, text_size: px(24), align_h: align.CENTER_H };
export const NOTE = { x: px(60), y: px(300), w: px(360), h: px(76), color: 0xada79c, text_size: px(18), align_h: align.CENTER_H };
```

Create `device-app/page/home/home.s.layout.js`:

```js
import { px } from "@zos/utils";
import { align } from "@zos/ui";

export const TITLE = { x: px(40), y: px(62), w: px(310), h: px(44), color: 0xffffff, text_size: px(28), align_h: align.CENTER_H };
export const STEPS = { x: px(40), y: px(150), w: px(310), h: px(40), color: 0x91d1b2, text_size: px(24), align_h: align.CENTER_H };
export const FOOD = { x: px(40), y: px(205), w: px(310), h: px(40), color: 0xffd276, text_size: px(24), align_h: align.CENTER_H };
export const NOTE = { x: px(30), y: px(275), w: px(330), h: px(76), color: 0xada79c, text_size: px(18), align_h: align.CENTER_H };
```

- [ ] **Step 4: Commit the Mini Program skeleton**

```powershell
git add device-app
git commit -m "feat: scaffold pet universe device app"
```

## Task 6: Add The Device-App Storage Adapter And Settlement Screen

**Files:**
- Create: `device-app/utils/storage.js`
- Create: `device-app/page/home/home.js`

- [ ] **Step 1: Add the LocalStorage adapter**

Create `device-app/utils/storage.js`:

```js
import { LocalStorage } from "@zos/storage";
import { createDefaultProfile, normalizeProfile } from "../core/profile.js";

const PROFILE_KEY = "pet_universe_profile_v1";
const localStorage = new LocalStorage();

export function loadProfile(today) {
  const raw = localStorage.getItem(PROFILE_KEY, "");
  if (!raw) return createDefaultProfile(today);
  try {
    return normalizeProfile(JSON.parse(raw), today);
  } catch {
    return createDefaultProfile(today);
  }
}

export function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
```

- [ ] **Step 2: Add the step-settlement home screen**

Create `device-app/page/home/home.js`:

```js
import { createWidget, widget } from "@zos/ui";
import { Step } from "@zos/sensor";
import * as Common from "zosLoader:./../common.[pf].layout.js";
import * as Styles from "zosLoader:./home.[pf].layout.js";
import { toDateKey } from "../../core/date-key.js";
import { settleSteps } from "../../core/settlement.js";
import { loadProfile, saveProfile } from "../../utils/storage.js";

const step = new Step();

Page({
  build() {
    const today = toDateKey(new Date());
    const currentSteps = Math.max(0, Math.floor(step.getCurrent() || 0));
    const result = settleSteps(loadProfile(today), today, currentSteps);
    saveProfile(result.profile);

    createWidget(widget.FILL_RECT, { ...Common.SCREEN, color: 0x101111 });
    createWidget(widget.TEXT, { ...Styles.TITLE, text: "PET UNIVERSE" });
    createWidget(widget.TEXT, { ...Styles.STEPS, text: `${currentSteps} STEPS` });
    createWidget(widget.TEXT, { ...Styles.FOOD, text: `${result.profile.foodBalance} FOOD` });
    createWidget(widget.TEXT, {
      ...Styles.NOTE,
      text: result.earnedFood > 0
        ? `WALK REWARD +${result.earnedFood}`
        : "Walk 1,000 steps to earn food"
    });
  }
});
```

- [ ] **Step 3: Install dependencies and run deterministic tests**

Run:

```powershell
npm.cmd install
npm.cmd install --prefix device-app
npm.cmd test
```

Expected: dependency installation succeeds and all Node tests pass.

- [ ] **Step 4: Verify the Mini Program in Zeus**

Run:

```powershell
zeus preview
```

Run this from `device-app/`.

Expected: Zeus opens or builds the device-app preview without JavaScript import or manifest errors. On a simulator or watch, the home page displays `PET UNIVERSE`, current steps, and food balance.

- [ ] **Step 5: Commit**

```powershell
git add device-app
git commit -m "feat: settle pet food in companion device app"
```

## Task 7: Build The Watch-Face Runtime Experiment

**Files:**
- Create: `watchface-spike/README.md`
- Create: `watchface-spike/app.json`
- Create: `watchface-spike/index.js`

- [ ] **Step 1: Verify the current official watch-face scaffold**

Open the current official watch-face development documentation and confirm the exact V3 file names, `app.json` shape, page entry naming, and supported interaction hooks before creating the files below:

```text
https://docs.zepp.com/zh-cn/docs/watchface/watchface-quick-start/
https://docs.zepp.com/zh-cn/docs/watchface/app-json/
https://docs.zepp.com/zh-cn/docs/watchface/api/hmSensor/sensorId/STEP/
https://docs.zepp.com/docs/watchface/api/hmUI/widget/IMG_ANIM/
https://docs.zepp.com/docs/watchface/api/hmSetting/getDeviceInfo/
https://docs.zepp.com/docs/watchface/api/hmSetting/getScreenType/
```

The implementation must use the official scaffold if it differs from the draft file map. Do not copy a device-app `app.json` into the watch-face package.

- [ ] **Step 2: Document the spike hypotheses**

Create `watchface-spike/README.md`:

```md
# Watch-Face Spike

Official scaffold sources:

- https://docs.zepp.com/zh-cn/docs/watchface/watchface-quick-start/
- https://docs.zepp.com/zh-cn/docs/watchface/app-json/
- https://docs.zepp.com/zh-cn/docs/watchface/api/hmSensor/sensorId/STEP/
- https://docs.zepp.com/docs/watchface/api/hmUI/widget/IMG_ANIM/
- https://docs.zepp.com/docs/watchface/api/hmSetting/getDeviceInfo/
- https://docs.zepp.com/docs/watchface/api/hmSetting/getScreenType/

## Hypotheses

1. STEP exposes the current daily step total.
2. IMG_ANIM can play a finite wake animation and stop on a static frame.
3. The watch face can render a static low-pixel AOD frame.
4. Pet tap reaction support is either verified or explicitly rejected by the runtime.
5. The supported persistence and cross-runtime state-sharing path is documented after physical-device testing.

## Fallback

If the watch face cannot persist or share the selected-pet profile with the companion Mini Program, use separately packaged selected-pet watch-face variants for V1. The Mini Program remains the collection manager.
```

- [ ] **Step 3: Create the official watch-face manifest**

Create `watchface-spike/app.json`:

```json
{
  "configVersion": "v3",
  "app": {
    "appId": 1099992,
    "appName": "Pet Universe Face Spike",
    "appType": "watchface",
    "version": { "code": 1, "name": "0.0.1" },
    "vender": "zepp",
    "description": "Pet Universe watch-face feasibility spike"
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
    "en-US": { "appName": "Pet Universe Face Spike" }
  },
  "defaultLanguage": "en-US"
}
```

The numeric `appId` is temporary for the local spike. Replace it with the registered watch-face ID before distribution.

- [ ] **Step 4: Add the watch-face experiment implementation**

Create `watchface-spike/index.js`:

```js
const stepSensor = hmSensor.createSensor(hmSensor.id.STEP);

Page({
  build() {
    const { width } = hmSetting.getDeviceInfo();
    const petSize = 160;
    const petX = Math.round((width - petSize) / 2);
    const isAod = hmSetting.getScreenType() === hmSetting.screen_type.AOD;

    if (isAod) {
      hmUI.createWidget(hmUI.widget.IMG, {
        x: petX,
        y: 205,
        w: petSize,
        h: petSize,
        src: "pixel-cat/baby/aod.png",
        auto_scale: true
      });
      return;
    }

    hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: 92,
      w: width,
      h: 52,
      color: 0xffffff,
      text_size: 30,
      align_h: hmUI.align.CENTER_H,
      text: "PET UNIVERSE"
    });
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: 142,
      w: width,
      h: 44,
      color: 0x91d1b2,
      text_size: 24,
      align_h: hmUI.align.CENTER_H,
      text: `${stepSensor.current} STEPS`
    });
    const wakeAnimation = hmUI.createWidget(hmUI.widget.IMG_ANIM, {
      x: petX,
      y: 205,
      w: petSize,
      h: petSize,
      anim_path: "pixel-cat/baby",
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

    const petHitTarget = hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: petX,
      y: 205,
      w: petSize,
      h: petSize,
      color: 0xffffff,
      alpha: 0
    });
    petHitTarget.addEventListener(hmUI.event.CLICK_UP, () => {
      wakeAnimation.setProperty(hmUI.prop.ANIM_STATUS, hmUI.anim_status.START);
      console.log("pet tap reaction verified");
    });
  }
});
```

`hmSetting.getDeviceInfo()` provides screen width and height. `hmSetting.getScreenType()` distinguishes the main watch face from AOD. `display_on_restart` and `default_frame_index` are the official IMG_ANIM power-saving fields. The representative pack must make `wake_0.png` an AOD-safe silhouette frame. Do not add background timers or infinite animation loops.

- [ ] **Step 5: Build the watch-face package with the official Zeus command**

Run from the repository root:

```powershell
npm.cmd run stage:watchface
Set-Location watchface-spike
zeus build
Set-Location ..
```

Expected: the watch-face package builds without schema, asset-path, or unsupported-API errors.

If the build rejects the experimental `addEventListener` block, remove only that block, record `pet tap reaction = unsupported by build` in the capability matrix, and rebuild. The prototype remains valid with interactions moved to the companion Mini Program.

- [ ] **Step 6: Record unsupported capabilities immediately**

If tap events, AOD entry configuration, square packaging, persistence, or cross-runtime access is unsupported, append a concrete result to `watchface-spike/README.md`:

```md
## Verified Capability Matrix

| Capability | Result | Evidence |
| --- | --- | --- |
| STEP readout | supported / unsupported | device, API, observed behavior |
| finite wake animation | supported / unsupported | device, observed behavior |
| pet tap reaction | supported / unsupported | device, observed behavior |
| static AOD frame | supported / unsupported | device, observed behavior |
| state persistence | supported / unsupported | storage path or rejection |
| Mini Program state sharing | supported / unsupported | storage path or rejection |
```

- [ ] **Step 7: Commit**

```powershell
git add watchface-spike
git commit -m "feat: add watch face feasibility experiment"
```

## Task 8: Add Asset Measurement And Device Validation Notes

**Files:**
- Create: `scripts/measure-assets.mjs`
- Create: `docs/validation/phase-0-device-spike.md`

- [ ] **Step 1: Add the asset measurement script**

Create `scripts/measure-assets.mjs`:

```js
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv[2]);
const files = [];

async function walk(directory) {
  for (const name of await readdir(directory)) {
    const filePath = path.join(directory, name);
    const info = await stat(filePath);
    if (info.isDirectory()) await walk(filePath);
    else files.push({ file: path.relative(root, filePath), bytes: info.size });
  }
}

await walk(root);
const bytes = files.reduce((total, file) => total + file.bytes, 0);
console.log(JSON.stringify({ root, fileCount: files.length, bytes, files }, null, 2));
```

- [ ] **Step 2: Run the asset measurement script**

Run:

```powershell
npm.cmd run measure:assets
```

Expected: JSON output with a non-zero `fileCount` and `bytes`.

- [ ] **Step 3: Create the physical-device validation template**

Create `docs/validation/phase-0-device-spike.md`:

```md
# Phase 0 Device Spike Results

Date:
Tester:
Commit:

## Devices

| Device | Shape | Resolution | Zepp OS version | Result |
| --- | --- | --- | --- | --- |
|  | round |  |  | pending |
|  | square |  |  | pending |

## Capability Matrix

| Capability | Round result | Square result | Evidence |
| --- | --- | --- | --- |
| STEP readout | pending | pending | |
| 1-2 second wake animation | pending | pending | |
| static idle frame after animation | pending | pending | |
| pet tap reaction | pending | pending | |
| static AOD silhouette | pending | pending | |
| profile persistence | pending | pending | |
| watch-face / Mini Program sharing | pending | pending | |

## Lightweight Measurements

| Measurement | Baseline face | Pet face | Notes |
| --- | --- | --- | --- |
| watch-face package bytes | | | |
| representative pet-pack bytes | | | |
| measured memory behavior | | | |
| 24-hour battery delta | | | |
| AOD lit-pixel ratio | | | target <= 10% |

## Fallback Decision

- [ ] Direct shared state is supported.
- [ ] Selected-pet watch-face variants are required for V1.
- [ ] Tap interaction is supported on the watch face.
- [ ] Tap interaction moves to the companion Mini Program.

## Go / No-Go

Decision:
Evidence:
Required follow-up:
```

- [ ] **Step 4: Run automated verification**

Run:

```powershell
npm.cmd test
npm.cmd run validate:pack
npm.cmd run stage:watchface
npm.cmd run measure:assets
git diff --check
```

Expected: Node tests pass, pet-pack validation passes, measurement JSON prints, and `git diff --check` reports no whitespace errors.

- [ ] **Step 5: Commit**

```powershell
git add scripts/measure-assets.mjs docs/validation/phase-0-device-spike.md
git commit -m "docs: add phase zero device measurement gate"
```

## Task 9: Perform The Physical-Device Gate

**Files:**
- Modify: `watchface-spike/README.md`
- Modify: `docs/validation/phase-0-device-spike.md`

- [ ] **Step 1: Replace wiring assets with one reviewed low-pixel cat pack**

Generate or draw the `pixel-cat` Baby sprites against the approved art direction:

```text
24-32 px sprite complexity
flat 4-6 color palette
strong silhouette
8-12 FPS
8-20 frames per short action
static AOD silhouette
no illustration-style fur texture
```

Run:

```powershell
npm.cmd run validate:pack
npm.cmd run measure:assets
```

Expected: both commands pass and the measured pack size is recorded in `docs/validation/phase-0-device-spike.md`.

- [ ] **Step 2: Install on one round physical watch**

Install both the watch-face spike and companion Mini Program using the official Zeus workflow. Fill the round-device column in `docs/validation/phase-0-device-spike.md`.

Expected: every supported capability has evidence. Unsupported capability rows name the exact fallback.

- [ ] **Step 3: Install on one square physical watch**

Repeat the same checks on a square watch and fill the square-device column.

Expected: layout, AOD, and interaction differences are recorded rather than inferred.

- [ ] **Step 4: Run the battery observation**

Measure one baseline watch face and the pet face for comparable 24-hour periods with the same AOD and raise-to-wake settings. Record the observed delta and device settings.

Expected: the release decision contains measured evidence. Do not claim a universal battery percentage from one device.

- [ ] **Step 5: Make the gate decision**

Complete `## Go / No-Go` and select the correct fallback checkboxes.

Go criteria:

```text
STEP readout verified
finite wake animation verified
static idle after animation verified
AOD behavior verified or removed from V1 with rationale
tap reaction supported or moved to Mini Program
persistence/state-sharing path documented
representative asset and battery measurements recorded
```

- [ ] **Step 6: Commit the measured spike result**

```powershell
git add watchface-spike/README.md docs/validation/phase-0-device-spike.md pet-packs/pixel-cat watchface-spike/assets
git commit -m "docs: record pet universe device spike results"
```

## Task 10: Write The Phase 1 Plan From Measured Results

**Files:**
- Create: `docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-1-product.md`

- [ ] **Step 1: Read the completed device gate**

Read:

```text
docs/validation/phase-0-device-spike.md
watchface-spike/README.md
```

- [ ] **Step 2: Write the Phase 1 product implementation plan**

Create `docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-1-product.md`.

The next plan must use the verified runtime path and include:

```text
Active / Steady / Explorer scoring fixtures
Baby, Teen, mature, Rare, and Secret collection model
8-10 reviewed launch pets
required and optional action protocol
collection, details, history, and form-switch Mini Program pages
corrupt-storage recovery
round and square visual verification
measured per-pack budgets derived from Phase 0
English-first UI and release checklist
```

Do not assume direct watch-face / Mini Program state sharing unless Task 9 verified it.

- [ ] **Step 3: Self-review and commit the Phase 1 plan**

Run:

```powershell
rg -n "TBD|TODO|FIXME|implement later|similar to" docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-1-product.md
git diff --check
```

Expected: no red-flag matches and no whitespace errors.

Commit:

```powershell
git add docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-1-product.md
git commit -m "docs: plan pet universe phase one product"
```
