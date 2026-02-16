# Specification

## Summary
**Goal:** Ensure HDDHub background and layered HDD images load correctly by placing the uploaded canonical PNG assets in `frontend/public` and wiring the selected HDDHub `<img>` elements to resolve them via the existing asset fallback chains.

**Planned changes:**
- Create `frontend/public/` if it does not exist.
- Add the five uploaded PNG assets to `frontend/public/` using the exact canonical filenames: `bg.png`, `vinyl.png`, `bodyhdd.png`, `disk.png`, `arm.png`.
- Update only the three selected HDDHub `<img>` elements (body, disk, arm layers) so they render `bodyhdd.png`, `disk.png`, and `arm.png` from the public root using the existing fallback chains (no other UI/code changes).

**User-visible outcome:** On a fresh build/preview, the HDDHub background and HDD layers (body, platter, arm) render correctly without missing images/404s.
