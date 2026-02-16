# Specification

## Summary
**Goal:** Replace placeholder/static visuals with the newly uploaded canonical public assets for the background and HDD/vinyl layers.

**Planned changes:**
- Copy bg-3.png to frontend/public/bg.png, vinyl-3.png to frontend/public/vinyl.png, bodyhdd-3.png to frontend/public/bodyhdd.png, disk-3.png to frontend/public/disk.png, and arm-3.png to frontend/public/arm.png.
- Preserve the original uploaded files (bg-3.png, vinyl-3.png, bodyhdd-3.png, disk-3.png, arm-3.png) in the repository in a non-conflicting public-accessible location for reference.
- Keep the app referencing only the canonical filenames via the existing base-path-safe asset resolver and fallback chain (no new root-absolute paths).

**User-visible outcome:** On fresh load, the app renders the real uploaded background, vinyl, and HDD hub imagery using the canonical asset filenames (bg.png, vinyl.png, bodyhdd.png, disk.png, arm.png).
