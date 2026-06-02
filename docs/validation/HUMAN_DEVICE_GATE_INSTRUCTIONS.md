# Human Device Gate Instructions

**Project:** Zepp Pet Universe Phase 0  
**File:** `docs/validation/phase-0-device-spike.md` (record results here)  
**Total time:** ~2 hours for two devices (can be done in parallel if you have two testers)

---

## 0. Prerequisites

Check each box before starting:

- [ ] Two physical watches available: one **round** (e.g., GTR series) and one **square** (e.g., GTS series)
- [ ] Both watches charged to at least 80%
- [ ] Both watches running **Zepp OS 3.0 or newer** (check in Settings > About)
- [ ] Windows PC with **Node.js v18 or v20** (NOT v24 -- the Zeus CLI has a bug with Node v24)
- [ ] **Zeus CLI** installed and in PATH (`zeus --version` in cmd/PowerShell should work)
- [ ] Zepp App installed on your phone with **Developer Mode** enabled
- [ ] Both watches paired to the Zepp App on the same phone
- [ ] You are running commands from a **native Windows cmd or PowerShell** window (NOT git-bash -- Zeus CLI cannot spawn Node from git-bash)
- [ ] You have an internet connection (the first build downloads dependencies)
- [ ] Checkout this repository on your PC at the latest commit

---

## 1. One-Time Zeus Setup (5 minutes)

Open a **Windows cmd or PowerShell** window (not git-bash) and run:

```powershell
zeus login
# Follow the prompts to log in to your Zepp open platform account
```

This is only needed once. If you already have `zeus login` working, skip this step.

---

## 2. Build and Install the Companion Mini Program (20 minutes)

### 2a. Build

```powershell
cd D:\huami\desktop_pet\device-app
zeus preview
```

**Expected result:</strong> Zeus compiles the project and shows a QR code in the terminal. The QR code points to a `.zab` package hosted temporarily.

**If `zeus preview` fails:**
- Try `zeus build` instead -- this creates `dist/app.zab` on disk
- If `zeus build` also fails, check that Node.js is v18 or v20 (`node -v`). The zpm packaging library is incompatible with Node v24.

### 2b. Install via Zepp App

1. Open the **Zepp App** on your phone
2. Go to **Profile > Developer Mode** (if you don't see Developer Mode, enable it in Settings)
3. Tap **"Scan to install"** or **"Install from QR code"**
4. Scan the QR code from the terminal (or if using `zeus build`, transfer `dist/app.zab` to your phone and open it in Developer Mode)

**Do this for both watches** (the build output is the same -- it will adapt to round and square at runtime).

### 2c. Verify Installation

On each watch, find the app in the app list. It should be called **"Pet Universe Spike"**. Open it.

**Quick check:** You should see:
- "PET UNIVERSE" title
- A step count number (e.g., "5243 STEPS")
- A food balance number (e.g., "3 FOOD")
- A note at the bottom

If the app does not appear or crashes on open, record the issue and move to troubleshooting.

---

## 3. Build and Install the Watch-Face Spike (20 minutes)

### 3a. Build

```powershell
cd D:\huami\desktop_pet\watchface-spike
zeus preview
```

**Expected result:** Zeus compiles the watch face and shows a QR code.

**Note:** The watch-face spike has one-pixel placeholder sprites (just colored squares). It is expected to look ugly. You are testing whether the runtime features work, not whether the art looks good.

### 3b. Install via Zepp App

Same process as step 2b: scan the QR code in the Zepp App, then apply the watch face on each watch.

1. On the watch, go to **Settings > Watch Faces**
2. Find the new face called **"Pet Universe Face Spike"**
3. Apply it

### 3c. Switch Between AOD and Normal Mode

- **Normal mode:** The watch is awake (wrist raised or screen tapped)
- **AOD mode (Always-On Display):** The watch screen dims after a few seconds, or you can cover the screen with your palm to trigger it early

---

## 4. What to Check on Each Watch (30 minutes per device)

Record results in `docs/validation/phase-0-device-spike.md`.

For each check below, fill in one column for round and one for square.

### Check 1: STEP Readout

| Step | Action | Expected |
|------|--------|----------|
| 1 | Apply the watch face | A number followed by "STEPS" should appear below "PET UNIVERSE" |
| 2 | Walk a few steps and wait 10 seconds | The step count should update (it may take a moment to refresh) |

**Pass criteria:** The text "XXXX STEPS" (with a real number) is visible on the watch face in normal mode.  
**Fail evidence:** The area is blank, shows "undefined STEPS", or shows "0 STEPS" and does not change after walking.

| Device | Pass / Fail | Notes |
|--------|------------|-------|
| Round  | [ ] / [ ]  | |
| Square | [ ] / [ ]  | |

### Check 2: Wake Animation (1-2 seconds)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Put the watch to sleep (lower wrist or cover screen) | Watch dims to AOD |
| 2 | Raise wrist or tap screen to wake | The pet area (160x160px region) plays a short animation for ~1 second, then stops on a static frame |

**Pass criteria:** A visible animation plays on wake for about 1 second, then the pet stays still.  
**Fail evidence:** No animation plays, the animation loops forever, or the pet disappears after the animation.

| Device | Pass / Fail | Notes |
|--------|------------|-------|
| Round  | [ ] / [ ]  | |
| Square | [ ] / [ ]  | |

### Check 3: Static Idle Frame After Animation

| Step | Action | Expected |
|------|--------|----------|
| 1 | Let the wake animation finish | The pet remains visible as a static image |
| 2 | Wait 30 seconds without touching the watch | The pet should still be visible (before AOD kicks in) |

**Pass criteria:** The face shows a static pet image in normal mode. It does not go blank after the animation ends.  
**Fail evidence:** The pet area goes blank after the animation, or the animation restarts by itself.

| Device | Pass / Fail | Notes |
|--------|------------|-------|
| Round  | [ ] / [ ]  | |
| Square | [ ] / [ ]  | |

### Check 4: Pet Tap Reaction

| Step | Action | Expected |
|------|--------|----------|
| 1 | With the watch face in normal mode, tap the pet area (the approximate 160x160px square in the middle of the screen) | The wake animation plays again |

**Pass criteria:** Tapping the pet area triggers the animation.  
**Fail evidence:** Nothing happens when you tap. (Note: This is an experimental feature. If it fails, we move tap interactions to the Mini Program instead.)

| Device | Pass / Fail | Notes |
|--------|------------|-------|
| Round  | [ ] / [ ]  | |
| Square | [ ] / [ ]  | |

### Check 5: Static AOD Silhouette

| Step | Action | Expected |
|------|--------|----------|
| 1 | Wait for the watch to enter AOD mode (or cover the screen with your palm) | A simpler, dimmer image (aod.png) should appear in the pet area |
| 2 | Look closely at the AOD frame | It should show a static silhouette, not an animation |

**Pass criteria:** A static, dim image is visible on the watch face during AOD. The pet does not animate in AOD.  
**Fail evidence:** The AOD screen is blank, shows the full-color animation, or shows garbled graphics.

| Device | Pass / Fail | Notes |
|--------|------------|-------|
| Round  | [ ] / [ ]  | |
| Square | [ ] / [ ]  | |

### Check 6: Profile Persistence

This check uses the companion Mini Program (not the watch face).

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open "Pet Universe Spike" in the app list | Note the FOOD balance |
| 2 | Close the app (press back or switch to another app) | -- |
| 3 | Reopen the app immediately | The FOOD balance should show the same number |
| 4 | Walk 1000+ steps, then reopen the app | The FOOD balance should increase by 1 each time you cross a 1000-step threshold (capped at 10 per day) |

**Pass criteria:** The food balance persists across app opens/closes. Walking more steps increases the food balance.  
**Fail evidence:** The food balance resets to 0 every time you open the app, or the step count is always 0.

| Device | Pass / Fail | Notes |
|--------|------------|-------|
| Round  | [ ] / [ ]  | |
| Square | [ ] / [ ]  | |

### Check 7: Watch-Face / Mini Program State Sharing

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open the Mini Program and note the FOOD balance | -- |
| 2 | Switch to the watch face | -- |
| 3 | Check if the watch face can show the food balance | The watch face currently does NOT show food balance in its implementation, so the expected result is "not possible" |

**Pass criteria:** N/A -- this is a discovery check. Record whether any undocumented shared state mechanism exists.  
**Fail evidence:** No cross-runtime state sharing API is documented, and our experiments confirm this.

| Device | Pass / Fail | Notes |
|--------|------------|-------|
| Round  | [ ] / [ ]  | |
| Square | [ ] / [ ]  | |

---

## 5. Measurements to Record (30 minutes)

### 5a. Package Sizes

Open the repository and run:

```powershell
cd D:\huami\desktop_pet
npm run measure:assets
```

This will show the file count and total bytes for all pet pack assets. Record in the table.

For the watch-face and Mini Program package sizes, look at:

- **Mini Program:** `device-app/dist/app.zab` file size (after a successful `zeus build`)
- **Watch face:** `watchface-spike/dist/app.zab` file size (after a successful `zeus build`)

If `zeus build` failed (Node v24 issue), write "BLOCKED (Node v24 zpm bug)" and move on.

### 5b. 24-Hour Battery Delta (optional but valuable)

This is an overnight observation. Do this step last so it runs in the background.

1. Fully charge the watch
2. Apply a normal / default watch face. Record the time and battery percentage.
3. After 24 hours with normal use, record the battery percentage again. This is the **baseline**.
4. Fully charge the watch again
5. Apply "Pet Universe Face Spike". Record time and battery percentage.
6. After 24 hours with the same usage pattern, record battery percentage. This is the **pet face**.
7. The difference between baseline and pet face drop is the delta.

**Important:** Keep AOD and raise-to-wake settings identical between the two 24-hour periods.

### 5c. AOD Lit-Pixel Ratio

Use the `measure:assets` script output and note the `aod.png` file size for the pixel-cat pack. A small file size (under 1 KB for a 160x160 image) indicates a low lit-pixel ratio, which is good for battery.

**Target:** AOD lit-pixel ratio <= 10% of total pixels.

---

## 6. What to Photograph / Video as Evidence

For each capability on each device, capture the following:

| Check | What to capture |
|-------|----------------|
| STEP readout | Photo of the watch face showing the step number |
| Wake animation | **Video** (2-3 seconds) showing the animation playing on wrist raise |
| Static idle frame | Photo showing the pet visible in normal mode |
| Pet tap reaction | **Video** showing tap -> animation replay |
| AOD silhouette | Photo of the watch in AOD mode (dimmed screen with pet silhouette) |
| Profile persistence | **Screen recording** of Zepp App: open Mini Program, close it, reopen, see food count unchanged |
| Both devices | Photo of the round and square watches side-by-side showing the same watch face |

**File naming convention:** Save evidch as `evidence/{shape}-{check}.{jpg/mp4}` e.g.:
- `evidence/round-step-readout.jpg`
- `evidence/square-tap-reaction.mp4`

If you don't have separate photo evidence, you can describe what you saw in the "Evidence" column of the capability matrix.

---

## 7. Record Results

Open `docs/validation/phase-0-device-spike.md` and fill in:

### 7a. Device Info Table

| Column | What to put |
|--------|-------------|
| Device | e.g., "Amazfit GTR 4" |
| Shape | "round" or "square" |
| Resolution | From watch settings or specs |
| Zepp OS version | Settings > About > System Version |
| Result | "pass", "fail", or "partial" |

### 7b. Capability Matrix

For each of the 7 capabilities, enter one of:
- **pass** -- works correctly on this shape
- **fail** -- does not work, with a brief note on what happened
- **not tested** -- skipped due to tooling limitations

In the Evidence column, write a brief description of what you observed, e.g.:
"Shows 1234 STEPS, updates after walking"
"Animation plays on wake for ~1 second, stops on frame 0"

### 7c. Lightweight Measurements

Fill in the numbers from Step 5 above.

### 7d. Fallback Decision

Check the appropriate boxes based on your findings.

### 7e. Go / No-Go

Make the final call using the criteria below.

---

## 8. Go / No-Go Criteria

The spike is a **GO** when ALL of the following are true:

- [ ] **STEP readout verified** on at least one device (round or square)
- [ ] **Finite wake animation verified** -- animation plays on wake and stops
- [ ] **Static idle after animation verified** -- pet is visible between sleeps
- [ ] **AOD behavior documented** -- AOD shows a static silhouette, OR a clear rationale for removing AOD from V1 is recorded
- [ ] **Tap interaction path decided** -- tap works on watch face OR is moved to Mini Program with rationale
- [ ] **State-sharing path documented** -- how the pet profile is shared (or not shared) between watch face and Mini Program is clearly stated
- [ ] **Asset and battery measurements recorded** (package bytes + battery delta)

If ANY of the above is missing, the decision is **NO-GO** and the Required follow-up section must list what is needed before a GO can be given.

---

## 9. Troubleshooting

### `zeus build` fails with zpm TypeError (Node v24)

**Problem:** `TypeError [ERR_INVALID_ARG_TYPE]: The "paths[2]" argument must be of type string. Received undefined`

**Cause:** The Zeus CLI's internal `zpm` library is incompatible with Node.js v24.

**Fix:** Install Node.js v18 or v20 from https://nodejs.org/ and switch to it for this session. You can use `nvm-windows` to manage multiple Node versions.

Alternatively, if only `zeus build` fails but `zeus preview` works, use `zeus preview` instead.

### `zeus preview` says 'node' is not recognized

**Problem:** Zeus CLI spawns a child process that cannot find Node.js.

**Cause:** You are running from git-bash, which doesn't pass PATH correctly to child processes.

**Fix:** Use Windows cmd or PowerShell instead of git-bash.

### Watch face shows blank screen

- Make sure assets were staged correctly: run `node scripts/stage-watchface-assets.mjs pet-packs/pixel-cat watchface-spike/assets` from the repo root, then rebuild.
- The placeholder sprites are 1x1 pixel images. They may be invisible on some screens. Replace with larger test images if needed.

### Mini Program crashes on open

- Check that `device-app/core/date-key.js`, `profile.js`, `settlement.js`, and `utils/storage.js` are all present.
- Check that `app.json` has the correct permissions.

---

## Quick Reference

| Command | Where to run | What it does |
|---------|-------------|--------------|
| `zeus login` | Anywhere | One-time auth |
| `zeus preview` | `device-app/` | Build + QR code for Mini Program |
| `zeus preview` | `watchface-spike/` | Build + QR code for watch face |
| `zeus build` | Any Zeus project | Create `dist/app.zab` |
| `node --test tests/*.test.mjs` | Repo root | Run 14 automated tests |
| `node scripts/validate-pet-pack.mjs pet-packs/pixel-cat/manifest.json` | Repo root | Validate pet pack |
| `npm run measure:assets` | Repo root | Measure asset file sizes |

---

## Summary Checklist

- [ ] Prerequisites checked (watches, Node v18/20, Zeus CLI, cmd/PowerShell)
- [ ] Zeus login done
- [ ] Round watch: Companion Mini Program installed and working
- [ ] Square watch: Companion Mini Program installed and working
- [ ] Round watch: Watch-face spike installed and working
- [ ] Square watch: Watch-face spike installed and working
- [ ] ALL 7 capabilities recorded for round device with evidence
- [ ] ALL 7 capabilities recorded for square device with evidence
- [ ] Package sizes measured and recorded
- [ ] Battery delta observed (or noted as skipped due to time)
- [ ] AOD lit-pixel ratio recorded
- [ ] Fallback decision checkboxes filled in
- [ ] Go / No-Go decision made with evidence
- [ ] `docs/validation/phase-0-device-spike.md` saved and committed
- [ ] Photos/videos saved to repository or linked in evidence column
