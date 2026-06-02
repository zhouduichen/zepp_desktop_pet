# Zepp Pet Universe Design

Date: 2026-06-02

## 1. Product Summary

Zepp Pet Universe is an international-facing virtual pet experience for Amazfit watches
running Zepp OS. The pet lives near the watch face so the user sees it after raising
their wrist. Daily activity produces food and influences evolution. A companion device
Mini Program handles collection, history, and lower-frequency interactions.

The product should feel like a lightweight, colorful pixel companion rather than a
fitness dashboard or a punitive habit tracker.

## 2. Goals

- Put a recognizable pet next to the time on a custom watch face.
- Reward normal daily walking without requiring workout mode, GPS, or heart-rate
  monitoring.
- Support multiple species, branching evolutions, rare forms, and hidden forms.
- Keep the watch-face runtime close to the cost of a normal watch face with short
  animations.
- Establish a pet-pack contract that can support curated community submissions later.
- Target non-China international markets first, with English as the default language.

## 3. Non-Goals

- The pet does not float above other watch faces or system screens.
- V1 does not require accounts, servers, online pet downloads, or a public community.
- The pet does not become sick, die, or lose an unlocked form when the user rests.
- V1 does not continuously run animation, timers, GPS, heart rate, or workout tracking.
- V1 does not target band-shaped displays or older Zepp OS versions.

## 4. Platform Facts And Technical Gate

The official Zepp OS documentation supports both Mini Programs and watch faces. The
watch-face STEP sensor exposes current and target step counts. The watch-face IMG_ANIM
widget supports finite repeats, restart-on-resume behavior, and a static power-saving
frame. Device Mini Programs can use LocalStorage from API_LEVEL 3.0.

The first implementation milestone is a device spike. It must resolve the following
before the full product is built:

1. Confirm tap interaction behavior on a JavaScript watch face on representative round
   and square devices.
2. Confirm the packaging and installation flow for the watch face and companion Mini
   Program.
3. Confirm the supported persistence path for watch-face interaction state.
4. Confirm whether the watch face and companion Mini Program can share selected-pet,
   food, and unlock state directly. If not, the fallback is to let the watch face derive
   lightweight display state from steps and expose pet selection through separately
   packaged watch-face variants while the Mini Program remains the collection manager.
5. Measure real package size, memory behavior, AOD behavior, and battery impact using
   one representative pet pack.

This spike is a release gate, not an optional optimization. The specification does not
assume undocumented cross-runtime storage or runtime asset downloading.

## 5. Product Architecture

### 5.1 Watch Face

The watch face is the high-frequency experience:

- Display time, date, today's step count, and food count.
- Show the selected pet as a pixel sprite.
- Play one 1-2 second wake animation after the watch face resumes.
- Play one short response after the user taps the pet.
- Display a low-pixel static pet silhouette in AOD mode.
- Read the system's existing step count only.

The watch face must remain useful if the companion Mini Program has never been opened.

### 5.2 Companion Device Mini Program

The Mini Program is the lower-frequency management surface:

- Show the current pet, experience, affinity, and evolution tendency.
- Settle newly earned food and growth progress.
- Show the last 7 days of activity inputs used for evolution scoring.
- Show the pet collection, unlocked forms, rare achievements, and hidden-form hints.
- Allow the user to switch unlocked pets and forms.
- Provide richer interactions such as petting and play.
- Reserve a future entry point for curated pet packs.

### 5.3 Future Community Layer

A later release may add a Side Service in the Zepp App and a server-backed catalog.
The official Side Service can communicate with device apps and servers and provides
messaging, fetch, and settings APIs.

Community content must remain curated:

- Authors submit a pet pack built against the published schema.
- Automated validation checks required assets, dimensions, frame limits, palette
  limits, metadata, and AOD silhouettes.
- Human review checks quality, copyright, safety, and consistency.
- Approved packs are distributed using a supported packaging path established after
  the V1 technical spike. V1 does not assume runtime download of arbitrary watch-face
  animation files.

## 6. Daily Experience

### 6.1 Watch-Face Loop

1. The user raises their wrist.
2. The pet randomly plays one available Wake Idle animation for 1-2 seconds.
3. The pet remains on a static frame next to the time.
4. Every 1,000 steps earns one food item, capped at 10 items per day.
5. Tapping the pet with food available plays Feed followed by Happy, consumes one food
   item, and adds experience and affinity.
6. Tapping without food plays No Food: a gentle tilt, shrug, or curious look.
7. Reaching a growth threshold plays Evolution Hint and sends the user to the Mini
   Program for the reveal.
8. AOD mode shows time and a static silhouette only.

### 6.2 Design Principle

The experience encourages activity without punishing rest. Missing a goal does not
cause sickness, death, regression, or guilt-oriented messaging.

## 7. Growth And Collection

Each species has the following forms:

- Baby
- Teen
- Active mature form
- Steady mature form
- Explorer mature form
- At least one Rare form
- Optional Secret forms

The mature branch is selected using the last 7 days of data:

- Active favors higher total steps.
- Steady favors consistent goal completion.
- Explorer favors activity across more days and a broader distribution of movement.

All branches are positive outcomes. Exact scoring weights are calibrated during
implementation using fixtures and real-device data. The rules shown to users must be
understandable: move more, keep a rhythm, or stay broadly active.

If two mature scores are close, the Mini Program offers the user a choice between the
two leading branches. Mature forms never regress automatically. Every unlocked form
enters the collection permanently and can be selected again.

Rare and Secret forms extend long-term play:

- Rare forms use explicit goals such as a long streak or cumulative step milestone.
- Secret forms require a hidden precondition and then trigger at low probability.
- Rare and Secret forms are collectible alternatives, not replacements that erase
  prior forms.

## 8. Interaction Action Protocol

### 8.1 Required Watch-Face Actions

Every pet pack must provide:

- Wake Idle: short random wake-up animation.
- Species Idle: one recognizable species-specific short animation.
- Tap React: glance, head tilt, or move closer.
- Feed: consume food.
- Happy: jump, spin, wave, or equivalent positive response.
- No Food: gentle response with no punishment.
- Goal Celebrate: response after a step goal or streak milestone.
- Sleep / AOD: night pose and static low-pixel silhouette.
- Evolution Hint: short glow or anticipation reaction.
- Secret Hint: subtle hidden-form teaser.

### 8.2 Companion Mini Program Actions

The Mini Program may add:

- Pet: swipe to pet the companion.
- Play: simple ball play or species-specific activity.
- Walk Return: settle activity rewards and occasionally reveal a found object.
- Switch Form: select an unlocked form.
- Dress Up: reserved for a later release with a limited accessory contract.

### 8.3 Market Reference Policy

The action vocabulary may be informed by current virtual-pet products such as Nomi,
SoPets, UPochi, PlayPets, and Tamagotchi. The product must not copy their characters,
sprites, animations, names, or proprietary progression rules.

## 9. Visual System

The chosen art direction is colorful low-resolution pixel mascot art for international
markets:

- Approximately 24-32 px sprite complexity, scaled cleanly for display.
- Flat color blocks with a small palette and strong silhouette.
- No realistic fur rendering, painterly shading, or dense illustration details.
- Recognizable companion animals first; fantasy pets remain friendly and pet-like.
- Mature branches change silhouette or meaningful features, not color alone.
- AOD silhouettes preserve species recognition with minimal lit pixels.

Initial roster planning should use 8-10 pets. A curated international mix may include
familiar companions such as a cat, dog, bunny, penguin, and hamster, alongside a few
friendly distinctive companions such as a baby dragon or axolotl.

The roster is intentionally not locked in this specification. The implementation phase
must first validate one complete representative pack, then generate and review the
launch roster against the same contract.

## 10. Pet-Pack Contract

Each pet pack includes:

- `id`
- English display name
- author and license metadata
- semantic version
- preview image
- supported screen shapes and minimum API level
- species theme colors
- form manifest for Baby, Teen, Active, Steady, Explorer, Rare, and optional Secret
- per-form sprite assets
- required action manifest
- static AOD silhouette

Resource rules:

- Use PNG sprite sequences.
- Use 8-12 FPS.
- Use 8-20 frames per short animation.
- Avoid infinite animation loops.
- Load only the current pet and the assets needed for the current watch-face state where
  the runtime and packaging model allow it.
- Keep collection previews and non-active content in the companion Mini Program or
  separately installable packs where supported.

AI can generate candidate sprites and animation frames, but generated assets still go
through automated contract validation and visual review. AI output does not remove
device resource limits or copyright review.

## 11. Data Model

The Mini Program stores compact local records:

```text
profile
  selectedPetId
  selectedFormId
  foodBalance
  affinity
  experience
  lastSettlementDate

dailyActivity[]
  date
  settledSteps
  earnedFood

collection[]
  petId
  unlockedFormIds[]
  rareProgress
  secretTriggerFlags

packRegistry[]
  petId
  version
  schemaVersion
```

Storage rules:

- Retain daily activity records for 30 days.
- Evolution scoring reads only the latest 7 days.
- Use integer counters and short arrays.
- Do not store large logs on the watch.
- Guard settlement with the last processed step total and date so food cannot be
  claimed twice.
- If local data is corrupt, restore a valid default profile while preserving readable
  collection entries where possible.

The cross-runtime representation used by the watch face is finalized by the technical
spike described in Section 4.

## 12. Lightweight Runtime Rules

### Watch Face

- Do not activate GPS, heart rate, or workout mode.
- Use the system's existing step count.
- Play one finite wake animation and stop on a static frame.
- Play interaction animations only after user input or a milestone.
- Do not run background timers.
- Keep AOD static and within official screen-off constraints.

### Mini Program

- Settle growth when the user opens the Mini Program or at another explicitly supported
  lightweight lifecycle point established during implementation.
- Write at most one compact daily snapshot plus guarded incremental settlement data.
- Score only the latest 7 days.
- Load collection views and history on demand.

### Resource Budget

The implementation plan must define measured budgets after the representative-pack
spike. Do not guess final package-size or memory limits. Treat smooth wake animation,
legible time display, AOD compliance, and acceptable battery behavior as release gates.

## 13. Device Scope

V1 targets Zepp OS devices with API_LEVEL 3.0 or later:

- Round displays (`r`)
- Square displays (`s`)

Use the V3 platform configuration fields for screen shape and resolution adaptation.
Band-shaped screens (`b`) and older devices are follow-up compatibility work.

The watch face must preserve:

- clear time hierarchy
- readable steps and food count
- recognizable pet silhouette
- safe spacing around screen edges and reserved status areas

English is the default product language. Watch-face release assets must also satisfy
Zepp OS multilingual release requirements.

## 14. Verification

### 14.1 Technical Spike Acceptance

- Install the prototype watch face and companion Mini Program on at least one round and
  one square physical watch.
- Confirm tap reactions, resume animation, static AOD frame, and step reading.
- Record the supported state-sharing approach or document the watch-face-variant
  fallback.
- Measure package size, memory behavior, and a representative battery comparison.

### 14.2 Functional Verification

- Verify food settlement across step boundaries and date rollover.
- Verify that repeated app opens do not duplicate food.
- Verify Active, Steady, and Explorer scoring with deterministic fixtures.
- Verify close-score user choice behavior.
- Verify permanent collection unlocks.
- Verify explicit Rare unlocks and deterministic testing hooks for Secret triggers.
- Verify corrupt local-data recovery.

### 14.3 Visual Verification

- Verify round and square layouts at representative resolutions.
- Verify 1-2 second animations at 8-12 FPS.
- Verify that each launch pet reads clearly at wrist-viewing distance.
- Verify that mature branches differ by silhouette or meaningful features.
- Verify AOD pixel use and readability on real devices.

## 15. Release Phases

### Phase 0: Feasibility Spike

Build one pet, one round layout, one square layout, minimal watch-face tap behavior,
STEP reading, AOD, and the smallest useful Mini Program. Resolve Section 4.

### Phase 1: V1 Product

Ship the watch face, companion Mini Program, 8-10 reviewed pets, three mature branches,
Rare and Secret collection behavior, 30-day local history, and English-first UI.

### Phase 2: Curated Packs

Publish official themed packs, add richer Mini Program interactions, and validate the
pack installation path.

### Phase 3: Community

Add Side Service and server catalog capabilities, author submission, automated
validation, human moderation, and curated distribution.

## 16. References

Official Zepp OS documentation:

- [Introduction to Zepp OS](https://docs.zepp.com/docs/intro/)
- [Mini Program Configuration](https://docs.zepp.com/docs/reference/app-json/)
- [Watch-Face STEP Sensor](https://docs.zepp.com/zh-cn/docs/watchface/api/hmSensor/sensorId/STEP/)
- [Watch-Face IMG_ANIM](https://docs.zepp.com/docs/watchface/api/hmUI/widget/IMG_ANIM/)
- [Device Mini Program Step Sensor](https://docs.zepp.com/docs/reference/device-app-api/newAPI/sensor/Step/)
- [Device Mini Program LocalStorage](https://docs.zepp.com/docs/reference/device-app-api/newAPI/storage/localStorage/)
- [Side Service Introduction](https://docs.zepp.com/docs/guides/framework/side-service/intro/)
- [Watchface Design Guidance](https://docs.zepp.com/docs/designs/customization/watchface/)
- [Watchface Specification](https://docs.zepp.com/docs/watchface/specification/)

Public market references for action vocabulary only:

- [Nomi](https://www.nomi.pet/)
- [SoPets](https://sopetsofficial.com/)
- [UPochi](https://www.upochi.com/)
- [PlayPets](https://www.playpets.io/)
- [Tamagotchi Connection Manual](https://tamagotchi-official.com/manual/toy/connection/connection_web_manual_IS_EN.pdf)
