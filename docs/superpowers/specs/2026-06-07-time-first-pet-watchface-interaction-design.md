# Time-First Pet Watch Face Interaction Design

Date: 2026-06-07

## 1. Purpose

This design refines the Zepp Pet Universe watch-face experience into a normal,
usable sport watch face with a lightweight pet companion layer. The watch face must
feel close to an Apple Fitness-style information surface: clean, modern, readable at
small size, and useful even when the pet is ignored.

The pet adds companionship and a small interaction entry point. It must not turn the
watch face into the full pet game. Feeding, dressing, growth management, collection,
status details, task lists, and richer interactions stay in the companion Device Mini
Program.

## 2. Design Direction

Use the selected A direction: balanced sport-watch metrics with a pet at the bottom
edge.

The screen is designed as the original device canvas, not as a marketing render inside
a watch shell. Round and square layouts should be judged at their real target canvases:

- round: `480 x 480`
- square: `390 x 450`

## 3. Information Hierarchy

Time is the highest-priority information in every state.

Rules:

- The time stays at the top center.
- The time uses the largest type on the screen.
- The time does not move during pet state transitions.
- The pet, health metrics, and animations never cover or compete with the time.
- Date remains secondary under the time.
- Health data is tertiary but still useful and legible.
- The pet is a companion layer, not the primary visual subject.

## 3.1 Health Information Visual Language

Health information should use an Apple Fitness-inspired visual language without copying
Apple assets or exact proprietary compositions.

Use:

- black or near-black background
- large numeric values
- compact uppercase metric labels
- vivid but restrained activity colors
- ring, arc, or progress-dial motifs
- clear grouping between primary and secondary metrics
- generous spacing around values
- minimal text

Avoid:

- dense dashboards
- card-heavy management panels
- long labels or explanatory copy
- decorative gradients unrelated to activity data
- pet-game UI chrome
- buttons inside the watch face

Recommended health metrics:

- primary: Move / calories or today's steps, depending on the selected product emphasis
- secondary: activity minutes or progress, heart rate, battery, steps

When the default half-body pet state is active, the central health area may show a
large ring or progress cluster plus one primary number. When the full-body reveal is
active, that same health language should compress into smaller side rings or compact
metric modules.

## 4. Default Half-Body State

The default state is the long-term daily watch-face state.

Layout:

- Large time at the top center.
- Date below time.
- A compact central health module fills the middle space above the pet.
- Smaller health metrics sit below or around the central module where space allows.
- The pet appears as a half-body figure peeking from the bottom edge, as if leaning on
  the watch-face border.
- The pet does not cover the time, date, or central health module.

Recommended central module:

- primary value: Move / calories or today's steps
- supporting value: daily activity progress through a small ring, arc, or progress dial
- secondary compact metrics: heart rate, calories, battery, steps, or active minutes

On round screens, the default central health module should be a flatter summary strip,
not a tall card. Use a small activity-ring symbol on the left and a large value on the
right. Keep the module low-profile so the time remains dominant and the bottom pet area
has room to breathe.

The half-body pet state may play a finite wake animation, then stop on a static frame.
It must not run an infinite animation loop.

## 4.1 Round Screen Safety

Round screens need their own coordinates. Do not reuse square-screen left/right edge
positions.

Rules:

- Keep all text and metrics inside the circular safe area.
- Pull side metrics inward from the edge.
- Avoid placing text in the lower left and lower right corners where round screens crop
  the most.
- Keep the default health summary flatter and narrower than on square screens.
- Move secondary metrics upward enough that they do not collide with the half-body pet.
- Keep the full-body reveal below the time/date zone.

For a `480 x 480` round screen, the design target is:

- time: top center, largest element
- date: directly below time
- default health strip: centered and flat in the middle
- secondary metrics: inside the lower-middle safe area
- half-body pet: bottom center
- full-body pet: center-lower, with side metrics pulled inward

## 5. Full-Body Reveal State

Double tapping the pet reveals the pet's full body.

Layout:

- Time remains fixed, largest, and unobstructed.
- Date remains fixed under time.
- The pet rises from the bottom and expands into the center-lower area.
- The large central health module breaks down into smaller modules, preferably side
  rings or compact high-contrast activity metrics.
- The smaller health modules shift left and right to create space for the full-body pet.
- The pet full body must stay below the locked time/date zone.

This state is a lightweight reveal, not a management screen. It must not show feeding,
dressing, collection, task, status, or menu buttons.

## 6. Motion Model

The transition should feel like a spatial reallocation of the watch face:

1. Default state shows the pet half-body at the bottom and central health information in
   the middle.
2. On double tap, the central health module compresses into compact metrics.
3. The compact metrics slide toward the left and right columns.
4. The pet moves upward and scales from half-body to full-body presentation.
5. On timeout or return, the pet moves back down and the health metrics merge back into
   the central health module.

The time and date are locked layers and should not participate in the transition.

Recommended duration:

- quick reveal: approximately `250-450 ms`
- no continuous looping after the transition completes

If Zepp OS watch-face runtime cannot support this transition reliably, use the closest
supported finite-frame animation and document the fallback.

## 7. Watch-Face Interaction Boundary

Only two pet interactions are allowed on the watch face:

- Single tap pet: play a finite pat reaction.
- Double tap pet: reveal the full-body pet state.

No other complex interactions are allowed on the watch face.

Forbidden on the watch face:

- feed button
- play button
- dress-up or accessory controls
- pet switching
- collection view
- growth/status panel
- task list
- dialogue box
- shop or reward menu
- background timers
- background polling
- GPS
- continuous heart-rate monitoring
- workout mode
- runtime asset downloading

If tap or double-tap support is not documented or fails on physical watches, record the
capability as unsupported and move that interaction to the Device Mini Program.

## 8. Companion Device Mini Program Boundary

The companion app owns the complete pet experience:

- feeding
- petting and richer interactions
- play
- growth status
- evolution
- form switching
- collection
- history
- unlocks
- later dressing or accessories

The watch face remains a daily glance surface and lightweight companion entry point.

## 9. Asset Reality

No final animal assets are assumed by this design.

Current visual mockups use placeholder shapes only. They validate layout, hierarchy, and
motion intent. They do not validate final pet charm, sprite readability, animation
quality, AOD suitability, or package size.

Before implementation can be considered visually complete, real pet assets must be
provided or generated under the canonical pet-pack pipeline:

- `pet-packs/` is the source of truth.
- `watchface-spike/assets/` contains generated mirrors only.
- assets must include static, AOD, finite wake, finite pat, and full-body reveal frames
  or the closest supported watch-face representation.
- assets must be checked at actual watch scale.
- AOD must remain static and minimal.

## 10. Verification

Design verification:

- Check round original canvas at `480 x 480`.
- Check square original canvas at `390 x 450`.
- Confirm time remains the largest element in both states.
- Confirm half-body state uses central space for health information.
- Confirm full-body state moves health metrics to the sides.
- Confirm no forbidden watch-face controls appear.
- Confirm placeholder pet assets are not treated as release assets.

Runtime verification:

- Confirm single-tap support on physical watch or document fallback.
- Confirm double-tap support on physical watch or document fallback.
- Confirm finite transition or frame-based fallback.
- Confirm AOD remains static and minimal.
- Confirm no background timers, polling, GPS, workout mode, or continuous heart-rate
  monitoring are introduced.

## 11. Open Hardware Dependencies

These questions require physical watch or official Zepp OS verification:

- Does watch-face double tap work reliably on target devices?
- Can the watch-face runtime animate the health-metric transition directly?
- If direct transition animation is unsupported, what finite-frame fallback builds and
  runs?
- Does the full-body reveal remain readable on both round and square physical devices?
- Does AOD remain compliant after adding the pet companion layer?
