# Bad Blood 2026 — V4.2 LIVING MEMBRANE / SURGICAL SIGNATURE PASS

Build id: `v4.2-living-membrane-2026-08-23` — identical in `<meta name="bb-build">`, `<html data-build>`,
the console line `[BB] build …` and this README.
Live draft: https://claude.ai/code/artifact/937579e7-614b-43f7-b108-cd6a816458a8
`draft-2026.source.html` = the real file with embedded image assets stripped (`ASSET_*_REMOVED`).
`proof-report.json` = machine-readable output of the Playwright run (coarse-pointer mobile + videos).

## What changed
1. **SKIN structural truth.** Lamellae no longer come from angle-selected roots. Five boundary curves are derived
   from the ACTIVE cubic every frame (`BND[0..4]`, offsets `[-.52,-.24,0,+.25,+.55]` × seeded asymmetry, tapered
   toward the tip); index 2 *is* the active curve; planes 0–1, 1–2, 2–3, 3–4 are always drawn — no conditional skip,
   outside and inside the iris. QA: `skinBoundaryCount 5 · skinPlaneCount 4 · activeBoundaryIndex 2`;
   measured boundary angles `[3.42, 3.64, 3.88, 4.11, 4.39]`, `BND[2].a === RE[ACTIVE].a`.
2. **Living membrane.** The symmetric band is gone. Eight seeded samples (`MEM_UP/MEM_DN`) along the physical
   line `[0,.335,1,.315]`, Catmull-Rom between them, asymmetric up/down, four nested `destination-out` fills for an
   18–36 px feather (no blur). photo .25 → irregular 4–18 px slit; .50 → ~40% exposed, no straight frontier
   (samples every ~14 vw); .70 → frame owned, stroke and edge gone.
3. **Pupil seals.** Final opaque pass kept; radius = settled × ip^1.4, inside the iris too, so it contracts as the
   stroma goes and rebuilds in exact reverse. Measured: ip .65 → 35% of settled (≤72%), ip .35 → 12% (≤35%),
   centre pixel `[0,0,0,255]` at every non-zero presence sampled (desktop and both phones).
4. **BLOOD cycle.** `heat = max(PRESS.front·.9, MP.scar·ws·.25)`; the scar is warm graphite, not redness.
   Sampled on the carrier at the same scroll (4126): pp .5 → `rgb(151,31,49)` sat .795; pp 1 → `rgb(34,33,36)`
   sat .083 — **90% less ruby saturation**.
5. **Material inertia.** x/y/scale keep the catch-up boost; dna/blood/skin/photo/match/ip/pp/resid and all MORPH keys
   use `LAM.anat = 4.4` with no boost (τ ≈ 230 ms, 6–8 frames at 30 fps).
6. **Corneal residue.** `T.resid = sin(raw·π)` only between the WORK and REVEAL anchors; one curved reflection of
   the sampled palette (`ENV.r/g/b`), max alpha .08, clipped inside the limbus, under the final pupil pass;
   0 in the Portal (measured `resid 0` after open).
7. **Behaviour / hot path.** Hero aborts in phase 1 and 2 on any scroll (measured phase 2 → 0, `c 0`, `u 0`, period
   bone). Cached: `eyestate`, `eyeState`, `workStage.children`, first image, projected line (recomputed on resize
   and on image load); gaze output object reused; filter/transform strings written only when they change.

## Proof
| # | File | Pixels | Evidence |
|---|---|---|---|
| 06 | SKIN | 1512×805 | planeCount 4, activeBoundaryIndex 2 |
| 03/04/05 | BLOOD pp 0 / .5 / 1 | 1512×805 | same scrollY 4126; front 0/1/0; ruby saturation .795 → .083 |
| 07/08/09 | WORK photo .25 / .50 / .70 | 1512×805 | **same scrollY 9753** (`QA.photo` override); pupil px [0,0,0,255] |
| 10a/10b | WORK→REVEAL ip .65 / .35 | 1512×805 | pupil 35% / 12% of settled; residue on the stroma |
| 01 | Hero after abort and return | 1512×805 | |
| 14/15 | mobile pressure / reveal | **390×844 and 430×932 native, coarse pointer** (Playwright `has_touch`, `(pointer:coarse)` true) | ACTIVE 12, through 0, pupil px [0,0,0,255] in every chapter |
| 16 | keyboard viewport | **390×450 native** | canvas CSS 390×450, backing 390×450 (dpr 1), input visible & focused; then close → scroll to DNA: raised off, overflow '', curName dna |
| 20 | DNA→WORK forward + reverse | 1512×805 | WebM/VP8, **25.0 fps** (Playwright screencast rate — not 30), 27.7 s |
| 21 | SCARS→REVEAL forward + reverse | 1512×805 | WebM/VP8, **25.0 fps**, 23.6 s |

Perf (this machine): draw CPU p95 0.6 ms; frame interval p95 17.4 ms on a clean load and 17.5 ms inside the
membrane chapter (60 Hz vsync + jitter).

## Still not done, stated plainly
- **Real iOS Safari / Android Chrome testing has not been performed.** The coarse-pointer captures are Chromium
  with touch emulation. The keyboard proof is the 450 px visual viewport, not a rendered OS keyboard.
- The motion proof is 25 fps, not 30 — that is what Playwright's screencast produces; dimensions and durations
  above are read from the container with ffmpeg.
- Not called Final: the real-device "keyboard → close Portal → continue scroll" pass is still outstanding.
  On a phone, open `…/draft-2026.html?smoke` — expected `ACTIVE 12 (expect 12)`, `limb0 0.9640`, `crypt0 4.810`,
  `roots through pupil 0`, `errors 0`.
