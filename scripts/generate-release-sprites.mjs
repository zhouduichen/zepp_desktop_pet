/**
 * Generates the release-candidate Phase 0 Pixel Cat sprite pack.
 *
 * The historical `create-wiring-pet-assets.mjs` script now contains the reviewed
 * deterministic 32 px source-grid renderer and scales frames to 128 x 128 PNGs.
 * Keep this entrypoint as the canonical command for humans and AI workers.
 */

await import("./create-wiring-pet-assets.mjs");
