# Specification

## Summary
**Goal:** Make the ElectronHoverLink (PCB track) hover connection look more natural by limiting bends to 45° and slightly reducing glow intensity.

**Planned changes:**
- Update ElectronHoverLink path routing so the connection track uses only horizontal/vertical segments with 45° diagonal transitions, avoiding sharper corners and excessive detours.
- Reduce the intensity/brightness of the traveling glow trail and moving glow head while keeping the same style, timing, and existing fade behavior.

**User-visible outcome:** When hovering a category, the connection track routes more cleanly with max 45° bends, and the moving glow effect appears subtly dimmer while remaining clearly visible.
