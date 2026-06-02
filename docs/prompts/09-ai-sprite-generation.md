# Prompt: AI Sprite Generation

```text
Create a release-candidate Phase 0 sprite sequence for Zepp Pet Universe.

Subject:
Baby form of an orange pixel cat virtual pet for international smartwatch users.

Art direction:
- colorful low-resolution pixel mascot;
- not realistic illustration;
- 24-32 px apparent sprite complexity;
- flat 4-6 color palette where practical;
- strong silhouette at wrist-viewing distance;
- transparent background;
- consistent anchor, scale, and body position across frames;
- friendly expression;
- no fur texture, painterly shading, gradients, accessories, text, logo, or watermark.

Deliver:
- static.png
- aod.png
- wake_0.png ... wake_7.png at 8 FPS
- tap_0.png ... tap_7.png at 8 FPS
- feed_0.png ... feed_11.png at 10 FPS
- happy_0.png ... happy_9.png at 10 FPS
- no_food_0.png ... no_food_7.png at 8 FPS

Motion:
- Wake: eyes open, tiny stretch, calm.
- Tap: look toward user, gentle head tilt, calm.
- Feed: approach simple food dot, bite, calm.
- Happy: compact bounce, calm.
- No Food: curious tilt, no sadness or punishment.

The first and last frame of each animation must transition cleanly to static.png.
AOD must remain recognizable with minimal lit pixels.
```

After generation, crop, align, inspect at actual watch scale, validate the pack, and
stage assets. Do not use a generated contact sheet directly.
