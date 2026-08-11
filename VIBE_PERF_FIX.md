# What's My Vibe — hang / scroll / image fix

## Why it still broke
The previous downsize-only change was **not in your live app** (`mobileauraeyefinal` still had the old full-resolution sync canvas). Even at 900px, drawing ~5000 `shadowBlur` particles in one frame freezes phones after the scan finishes — that blocks scrolling and can leave the image looking broken.

## This fix
1. **Lazy-load** meditation video + demo PDF
2. **Downsize** to max **480px** before aura drawing (matches on-screen size)
3. **Chunk** particle drawing across animation frames (same 6 layers & counts: 600/800/1000/1200/800/600) so the UI stays scrollable
4. **Fix image layout** — explicit `w-full max-w-[400px]`, `object-contain`, lighter glow (the old box had no width + huge shadows, so the photo could collapse / crop badly)
5. Show the photo immediately, with an “Applying aura…” overlay while particles finish

## Apply to live app / Replit
Replace `client/src/pages/vibe.tsx` with this file, or from the app repo root:

```bash
curl -L -o client/src/pages/vibe.tsx \
  https://raw.githubusercontent.com/vidhu-ops/auraeyemobile/cursor/vibe-perf-lazy-downsize-5e41/client/src/pages/vibe.tsx
```

Then republish.
