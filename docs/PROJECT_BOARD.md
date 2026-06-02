# Zepp Pet Universe Project Board

Date: 2026-06-02

## Delivery Order

| ID | Deliverable | Owner Prompt | Depends On | Status | Exit Evidence |
| --- | --- | --- | --- | --- | --- |
| P0-R | Zepp OS API verification | `docs/prompts/01-doc-research.md` | approved design | ready | `docs/research/zepp-os-phase-0-api-verification.md` |
| P0-1 | Core constants, profile, settlement | `docs/prompts/02-core-logic.md` | P0-R | ready | tests pass, 3 commits |
| P0-2 | Canonical pet-pack pipeline | `docs/prompts/03-pet-pack-pipeline.md` | P0-1 | ready | pack validation and staged mirrors |
| P0-3 | Device Mini Program spike | `docs/prompts/04-device-app.md` | P0-R, P0-1 | ready | Zeus preview evidence |
| P0-4 | Watch-face spike | `docs/prompts/05-watchface-spike.md` | P0-R, P0-2 | ready | Zeus build evidence and capability matrix |
| P0-5 | Measurement tooling and gate template | `docs/prompts/03-pet-pack-pipeline.md` | P0-2, P0-4 | ready | asset report and validation template |
| P0-6 | Physical-watch gate | `docs/prompts/08-human-device-gate.md` | P0-3, P0-4, P0-5 | human required | measured round and square results |
| P1-P | Phase 1 plan | `docs/prompts/10-phase-1-planning.md` | P0-6 Go decision | blocked | committed measured product plan |

## Review Gate After Every Implementation Batch

1. Run `docs/prompts/06-spec-review.md`.
2. Fix all findings.
3. Re-run spec review until approved.
4. Run `docs/prompts/07-code-quality-review.md`.
5. Fix all findings.
6. Re-run quality review until approved.
7. Move to the next batch.

## Phase 0 Commands

Commands become available incrementally as the scaffold is created:

```powershell
npm.cmd test
npm.cmd run validate:pack
npm.cmd run stage:watchface
npm.cmd run measure:assets
git diff --check
git status --short
```

## Manual Gate Questions

The human device operator must answer:

1. Does STEP show the true daily total?
2. Does raise-to-wake play one finite animation and then stop?
3. Does AOD remain static and low-pixel?
4. Does pet tapping work on the watch face?
5. Can watch face and Mini Program share selected-pet and food state through a
   documented path?
6. What is the measured package size and battery delta?

Unsupported behavior is acceptable when the fallback is explicit.

## Later Phases

| Phase | Scope | Start Condition |
| --- | --- | --- |
| Phase 1 | full local product, `8-10` pets, branching evolution, Rare and Secret forms | Phase 0 Go |
| Phase 2 | official curated pet packs and richer interactions | Phase 1 release evidence |
| Phase 3 | Side Service, server catalog, submission workflow, moderation | supported distribution path and governance plan |
