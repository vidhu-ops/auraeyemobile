# What's My Vibe performance fix

This Cloud Agent repo (`auraeyemobile`) is empty; the live code is in `vidhu-ops/mobileauraeyefinal` (push was denied to that repo).

## Changes in `client/src/pages/vibe.tsx`
1. **Lazy-load** the meditation MP4 (~9MB) and demo PDF (~1.6MB) only when their modals open.
2. **Downsize** photos to max 900px before the aura particle canvas runs.
3. Particle **layer types and counts are unchanged** (600/800/1000/1200/800/600). Absolute radii are scaled with the canvas so the visualization look stays the same.

## How to apply
- Copy `client/src/pages/vibe.tsx` over the same path in `mobileauraeyefinal` / Replit, **or**
- From the app repo root: `patch -p0 < vibe-perf-fix.patch`
