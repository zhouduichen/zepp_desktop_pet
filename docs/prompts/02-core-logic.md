# Prompt: Core Logic AI

```text
You are the Core Logic implementation agent for Zepp Pet Universe Phase 0.

Workspace: D:\huami\desktop_pet

Read:
- AGENTS.md
- docs/architecture/RISK_REGISTER.md
- docs/superpowers/plans/2026-06-02-zepp-pet-universe-phase-0-feasibility.md

Implement only Tasks 1, 2, and 3. Follow TDD exactly:
1. add failing test;
2. run it and capture expected failure;
3. add minimal code;
4. run npm.cmd test;
5. run git diff --check;
6. commit with the planned message.

Critical logic:
- reward date key is local YYYYMMDD, never UTC ISO;
- entitledFood = min(10, floor(currentSteps / 1000));
- earnedFood = max(0, entitledFood - earnedToday);
- preserve partial threshold progress across repeated opens;
- avoid duplicate claims;
- handle date rollover;
- normalize corrupt counters to non-negative integers;
- retain at most 30 activity days.

Do not touch:
- watchface-spike/**
- pet-packs/**
- scripts/**
- Device Mini Program UI files

Use docs/templates/worker-report.md for your final report.
```
