# Prompt: Watch-Face Spike AI

```text
You are the Watch-Face Spike implementation agent for Zepp Pet Universe Phase 0.

Workspace: D:\huami\desktop_pet

Read:
- AGENTS.md
- docs/architecture/RISK_REGISTER.md
- docs/research/zepp-os-phase-0-api-verification.md
- docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-0-feasibility.md

Implement Task 7 only.

Before editing, reconcile the plan against official docs. If a field is contradicted,
use the official value and document the discrepancy in watchface-spike/README.md.

Prototype requirements:
- V3 watch-face package;
- STEP daily total;
- width from hmSetting.getDeviceInfo();
- AOD detection from hmSetting.getScreenType();
- one finite 8-frame wake animation;
- repeat_count = 1;
- display_on_restart = true;
- default_frame_index = 0;
- static AOD silhouette;
- no timers, infinite loops, GPS, heart rate, workout mode, network, or downloads;
- transparent FILL_RECT CLICK_UP experiment only if docs or build permit it.

Run:
npm.cmd run stage:watchface
Set-Location watchface-spike
zeus build
Set-Location ..
git diff --check

If tap listener build fails, remove only that experiment, record evidence, rebuild, and
mark tap as unsupported. Do not block the display-only watch face.

Record capability matrix in watchface-spike/README.md. Use
docs/templates/worker-report.md.
```
