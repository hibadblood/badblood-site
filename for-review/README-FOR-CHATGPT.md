# Bad Blood 2026 — draft for review (V3.1 — final taste + release pass)

Build id: `v3.1-taste-release-2026-08-22` (also in `<html data-build>` and the console line `[BB] build …`).
Live draft: https://claude.ai/code/artifact/937579e7-614b-43f7-b108-cd6a816458a8

`draft-2026.source.html` is the full single-file prototype with the embedded logo/poster assets stripped
(`ASSET_PNG_REMOVED` / `ASSET_WEBP_REMOVED`) so the file stays small. Everything else — CSS, the world-canvas
IRIS, scroll physics, portal — is the real code.

## Captures (all fresh from this build, scroll frozen at the anchor before capture)

| # | File | Viewport | State values (P.x P.y P.d P.o photo) |
|---|---|---|---|
| 01 | 01-hero | 1512×805 | .88 .50 .86 .94 · photo 0 · 5 dominant roots visible |
| 02 | 02-dna | 1512×805 | .91 .77 .40 .82 · dna 1 · 6 roots, microcopy outside limbus |
| 03 | 03-blood-before-pulse | 1512×805 | .83 .42 .52 .86 · blood 1 · pulse disarmed (already fired once on entry) |
| 04 | 04-blood-during-pulse | 1512×805 | same · pulse fired via `__BB.PULSE`, carrier root = ROOTS.DOM[0] — ruby only in that root |
| 05 | 05-skin | 1512×805 | .15 .68 .50 .78 · skin 1 · 4 lamellae (inside + outside) |
| 06a | 06a-one-vein-early | 1512×805 | .50 .62 1.23 .44 · photo .25 · skin .25 |
| 06 | 06-one-vein-midpoint | 1512×805 | .50 .62 1.30 .40 · photo .62 · headline pinned 152–517px, clear of nav (86px) |
| 07 | 07-work-burning-city | 1512×805 | .16 .28 .34 .34 · photo 1 · marks hidden, scars headline released |
| 08 | 08-portal-listen | 1512×805 | .72 .54 1.00 .62 · column 44vw · placeholder "State the problem." |
| 09 | 09-portal-reframe | 1512×805 | tags only: intended outcome / medium — selected too early |
| 10 | 10-mobile-pressure | 390×844 | .86 .60 .77 .52 |
| 11 | 11-mobile-reveal | 390×844 | .50 .66 1.38 .70 · CTA centre 233px from pupil · headline top 70px, nav bottom 39px |
| 12 | 12-mobile-portal-keyboard | 390×457 (844 with keyboard emulated) | input 194–215px, focused, in view |
| 13 | 13-mobile-reveal | 430×932 | .50 .66 1.38 · CTA 302px from pupil |

Mobile captures come from a real 390-wide / 430-wide document (iframe harness, scaled for the screenshot),
not a narrowed desktop window.

## Test results
- Reduced-motion close (forced `prefers-reduced-motion`): open → close leaves `.closing` off, `body.raised` off,
  `#pOut` cleared, focus back on the opener. PASS.
- Reverse-scroll root stability: root endpoints at the BLOOD seam reached from above vs from below —
  max delta 20px (inertia residue), nodeK binding identical both ways. PASS.
- No `Math.random`, no `drawImage` inside the iris, one canvas, no console errors.

## Known deliberate breaks of the old CLAUDE.md (for the owner's decision, not bugs)
top nav, work on the homepage, sectioned anatomy, Archivo display face, new positioning line.
