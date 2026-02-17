# Specification

## Summary
**Goal:** Move the VinylPlayer into the “shibhi.studio” header area on the right, and constrain the HDD arm rotation to a strict 20°–42° range mapped evenly across exactly 13 categories.

**Planned changes:**
- Reposition the VinylPlayer so it renders at the right end of the “shibhi.studio” header/title area on desktop, with a responsive layout on smaller screens that keeps it near the header (no overlap/cutoff, not far down the page).
- Update HDD arm rotation logic to clamp strictly between 20° and 42°, and linearly map exactly 13 visible/active categories so category 1 = 42° and category 13 = 20° (with evenly spaced angles for categories 2–12).

**User-visible outcome:** The vinyl appears at the right side of the “shibhi.studio” header on desktop (and stays near the header on smaller screens), and the HDD arm reliably rotates only within 20°–42° with predictable positions for all 13 categories.
