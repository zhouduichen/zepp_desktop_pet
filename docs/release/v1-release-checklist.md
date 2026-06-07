# Pet Universe V1 Release Checklist

## Automated Tests
- [x] `npm test` — 84 tests passing
- [x] `npm run validate:roster` — 8 pet packs validated
- [x] `npm run measure:assets` — asset sizes measured

## Device Mini Program
- [x] 5 pages registered in app.json (home, collection, detail, history, form-switch)
- [x] All pages have round (480px) and square (390px) layouts
- [x] All user-facing strings use i18n `t()` function
- [x] Step settlement — daily food from steps, no duplicates
- [x] Feed consumes food, adds experience and affinity
- [x] Pet and Play interactions add affinity/experience
- [x] Evolution: Baby→Teen→Mature with scoring
- [x] Close-score user choice for mature branch
- [x] Collection page — all 8 pets with form counts
- [x] Detail page — stats, feed/pet/play, form switch, next pet
- [x] History page — 14-day activity log
- [x] Form-switch page — unlock status with USE button
- [x] Milestone unlocks — Rare (experience-based) and Secret (probability-based)
- [ ] Profile persists across app restarts — `[HW-NEEDED]`

## Watch Face
- [x] V3 manifest with round/square targets
- [x] Time and date display
- [x] Step count and goal progress
- [x] Food earned from steps
- [x] Wake animation on raise-to-wake (IMG_ANIM)
- [x] Pet pat reaction on tap (CLICK_DOWN)
- [x] AOD silhouette mode
- [x] zeus build produces .zab package
- [ ] Runtime behavior on physical device — `[HW-NEEDED]`

## Pet Assets
- [x] 8 pet packs with complete manifests
- [x] 7 forms per pet (baby, teen, active, steady, explorer, rare, secret)
- [x] All 9 required actions per form
- [x] Static and AOD frames for every form
- [x] 32x32 transparent PNG sprites
- [x] Device-app assets staged (key frames only)

## Platform Compliance
- [x] API Level 3.0
- [x] Permissions: `local_storage`, `hd.step`, `device.info`
- [x] No GPS, heart-rate, workout permissions
- [x] No background timers or infinite loops
- [x] English-only UI

## Production Configuration
- [x] appId set to registered ID (1099991)
- [x] App name: "Pet Universe" (no "Spike" suffix)
- [x] Version 1.0.0
- [x] watchface appId (1099992), version 1.0.0
- [x] watchface .gitignore excludes dist/ and node_modules/

## Hardware Verification (Pending)
- [ ] Install Mini Program on round watch
- [ ] Install Mini Program on square watch
- [ ] Install watch face on physical device
- [ ] Verify CLICK_DOWN works at runtime
- [ ] Verify STEP sensor returns accurate data
- [ ] Verify AOD mode switches correctly
- [ ] Verify wake animation plays once
- [ ] Verify tap animation plays on pet tap
- [ ] 24-hour battery measurement
