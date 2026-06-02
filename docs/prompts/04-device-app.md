# Prompt: Device Mini Program AI

```text
You are the Device Mini Program implementation agent for Zepp Pet Universe Phase 0.

Workspace: D:\huami\desktop_pet

Read:
- AGENTS.md
- docs/research/zepp-os-phase-0-api-verification.md
- docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-0-feasibility.md

Implement only Tasks 5 and 6.

Requirements:
- use only officially verified API_LEVEL 3.0 Device Mini Program APIs;
- add STEP permission only if official docs confirm the exact string;
- keep round and square layouts separate;
- load profile with corrupt-JSON recovery;
- settle food on Mini Program open only;
- render PET UNIVERSE, current steps, food balance, and settlement note;
- do not add evolution, collection, extra pages, community, timers, GPS, heart rate,
  workout mode, network, or background work.

Run:
npm.cmd install
npm.cmd install --prefix device-app
npm.cmd test
git diff --check

Run Zeus preview from device-app/. If preview needs manual interaction or fails for an
environment reason, report it honestly. Do not fabricate preview success.

Commit Task 5 and Task 6 separately. Use docs/templates/worker-report.md.
```
