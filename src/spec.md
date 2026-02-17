# Specification

## Summary
**Goal:** Refine the VinylPlayer and HDD UI animations/layout (alignment, mirrored tonearm motion, spin acceleration, glow/particles) and redeploy the updated app.

**Planned changes:**
- Adjust VinylPlayer layout so the vinyl record sits closer to the “shibhi.studio” header wordmark and aligns its visual axis/centerline with the wordline across relevant breakpoints.
- Mirror the HDD tonearm animation across the X axis so the arm’s swing appears on the right side of the platter while preserving existing category-to-angle behavior.
- Increase the HDD platter baseline spin speed to ~3×, and implement smooth hover/active acceleration (ease-in) and smooth return to baseline.
- Slightly reduce opacity of the VinylPlayer play/pause toggle button while keeping hover/focus-visible clarity and accessibility.
- Increase glow intensity of the existing electron-link line and add visible moving particles along it only while a target category is hovered (ElectronHoverLink active).
- Run a clean build and redeploy so the updated UI/animations are visible in the deployed app.

**User-visible outcome:** The vinyl sits closer and better aligned with the “shibhi.studio” header, the HDD tonearm swings on the right side, the HDD platter spins faster with smooth hover acceleration, the play/pause button is slightly more translucent but still clear to use, and hovered category links show a brighter glow with moving particles—live after redeploy.
