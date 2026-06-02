# Architecture Risk Register

Date: 2026-06-02

| ID | Risk | Severity | Validation | Fallback |
| --- | --- | --- | --- | --- |
| R1 | Watch-face widgets may not support tap events | high | build and test transparent `FILL_RECT` hit target | move Feed, Pet, and Play to Mini Program |
| R2 | Watch face and Mini Program may not share LocalStorage | high | verify official docs and physical devices | ship selected-pet watch-face variants |
| R3 | Runtime asset download may be unsupported | high | verify official packaging docs | distribute reviewed installable packs only |
| R4 | AOD rendering differs by device | high | test round and square physical watches | simplify or omit pet AOD on affected devices |
| R5 | Short animation still affects battery materially | high | comparable 24-hour baseline measurement | reduce frames, FPS, or wake frequency |
| R6 | Daily food settlement duplicates or drops rewards | high | deterministic fixtures around thresholds and rollover | use daily entitlement minus earned-today |
| R7 | UTC date conversion shifts rewards near midnight | medium | local-date fixture | use local calendar fields only |
| R8 | Generated sprite frames jitter or read poorly on wrist | medium | inspect at actual display scale | align anchors, reduce palette, redraw frames |
| R9 | Recursive staging deletes outside generated directory | high | resolved-path guard before `rm({ recursive: true })` | stop script with explicit error |
| R10 | AI agents expand Phase 0 into product scope | medium | spec review after each batch | reject unrelated UI, evolution, or community code |

## Logic Traps

### Reward Entitlement

Correct:

```js
const entitledFood = Math.min(10, Math.floor(currentSteps / 1000));
const earnedFood = Math.max(0, entitledFood - earnedToday);
```

Incorrect:

```js
Math.floor((currentSteps - lastSettledSteps) / 1000)
```

The incorrect form loses partial progress across repeated app opens.

### Local Dates

Use `getFullYear()`, `getMonth() + 1`, and `getDate()`. Do not use
`toISOString()` for reward-day keys.

### Generated Assets

Edit `pet-packs/**`. Never manually edit `watchface-spike/assets/**`.
