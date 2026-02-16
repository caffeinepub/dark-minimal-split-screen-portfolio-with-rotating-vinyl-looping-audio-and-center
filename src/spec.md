# Specification

## Summary
**Goal:** Refine the HDDHub visualization so the arm rotation is constrained, the platter renders as a true square with correct centered spin, and the glow ring is centered/tangent to the arm tip across lane transitions.

**Planned changes:**
- Constrain the HDD arm’s maximum downward rotation to ~30° and remap the 13 lanes to fit within the reduced rotation range while keeping hover-to-move and click-to-open-modal behavior unchanged.
- Render `disk.png` with a strict 1:1 aspect ratio at all sizes and ensure its spin animation rotates about the image’s visual center, with correct layering between `bodyhdd.png` and `arm.png`.
- Rework glow ring positioning so it is centered on the `disk.png` center axis and stays continuously tangent/in contact with the arm tip during hover motion and lane transitions, using the uploaded HDD assets as alignment reference.

**User-visible outcome:** The HDD arm no longer swings excessively downward, all 13 lanes still hover/select distinctly, the platter looks perfectly circular (not stretched) and spins smoothly around its center, and the glow ring stays centered on the platter and consistently touches the arm tip throughout movement.
