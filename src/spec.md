# Specification

## Summary
**Goal:** Visually tune the HDDHub component by adjusting arm angle mapping, overall opacity, platter brightness/size, adding a subtle arm shadow, and scaling down the full HDD visualization—without changing existing interactions or overlays.

**Planned changes:**
- Update HDDHub arm rotation mapping so lane/category 1 renders at 42° and lane/category 13 renders at 20°, linearly interpolated across lanes; default/rest angle remains 42° when nothing is hovered/selected.
- Apply ~75% opacity to the entire HDDHub composite (body + platter + arm) while keeping the left menu and VinylPlayer overlay unchanged and interactions intact.
- Reduce only the platter (disk layer) brightness to improve contrast while keeping the existing spin behavior and centered rotation.
- Add a subtle arm-cast shadow between the arm and platter layers that follows the arm’s movement/rotation.
- Reduce platter render size by ~2% (keep 1:1 aspect ratio and centered rotation).
- Scale down the entire HDDHub visualization by ~25% while keeping it centered in the right column and preserving alignment and interaction hit areas.

**User-visible outcome:** The HDDHub appears smaller, slightly transparent, and more legible (dimmer platter + arm shadow), with the arm resting at 42° by default and smoothly mapping down to 20° on the last category, while all hover/click behaviors and the VinylPlayer remain the same.
