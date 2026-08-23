# Bad Blood 2026 — V4.2.1 FINAL TEMPORAL CLEAN / TRUTH PASS

Build id: `v4.2.1-temporal-clean-2026-08-23` — identical in `<meta name="bb-build">`, `<html data-build>`, the
console line and this README. Live: https://claude.ai/code/artifact/937579e7-614b-43f7-b108-cd6a816458a8
`draft-2026.source.html` = the real file with image assets stripped. `proof-report.json` = every number below,
produced by one Playwright run (desktop 1512×805 fine pointer; 390×844 and 430×932 coarse pointer; two screencasts).

## Fixes
1. **BLOOD composite drain.** One tint value `bt = blood · clamp(front·1.1 + tension·(1−drain)·.45)` now drives
   every red layer: stroma base gradient, red stroma radial, fibre colours, collarette, pupil ember
   (`.04 + front·blood·.10`); the carrier's ruby already followed `heat`. Rendered ROIs at the same scrollY 4125:
   | ROI | pp 0 | pp .5 | pp 1 |
   |---|---|---|---|
   | external root (9 points on the cubic) | rgb(68,68,70) sat .105 | rgb(91,43,51) sat .788 | **rgb(67,65,67) sat .167** |
   | stroma ring (16 points at .62R) | rgb(36,36,41) sat .216 | rgb(42,30,36) sat .361 | **rgb(35,35,41) sat .219** |
   | inner clipped root (6 points) | rgb(40,40,44) sat .190 | rgb(55,25,32) sat .803 | **rgb(43,43,47) sat .184** |
   pp 1 is back to the pp 0 neutral within a few percent in every ROI; pupil centre [0,0,0,255] in all three.
2. **Tear onset.** The straight procedural stroke is removed entirely. The membrane envelope is two seeded
   tears (`TEAR`: t .11 width .085 near where the active root meets the edge; t ≈ .48–.74 width ≈ .05–.08) with
   a low-frequency vertical wander (18–40 px) from the first frame; the envelope opens to the whole edge only
   with `spread = smoother((photo−.28)/.24)`. Measured at scrollY 9752: photo .15 opening x 0–148 px,
   .25 x 0–264 px (**not both sides**), .35 reaches both sides, .50 and .70 unchanged from V4.2.
   (`exposedFraction` in the report counts only fully cleared pixels, alpha < 40 — .23 at .50 — the feathered
   area reads larger on screen.)
3. **Typography from iris presence.** `--wco = 1 − smoothstep(.30,.46, ip)` on every `.scar-in` group (opacity +
   −14 px translate as one block), `--rco = smoothstep(.56,.72, ip)` on `.reveal .hold`. ip is 0 in WORK and 1 in
   REVEAL, so this is the mirror of the brief's formula with the same .46–.56 anatomy-only gap. Measured across a
   41-sample WORK→REVEAL sweep: **max simultaneous opacity 0.000**; at ip .48 and .53 both are 0; reverse uses the
   same functions (CSS vars written only on change; reduced motion sets them in `staticFrame`).
4. **One pupilScale.** `pupilScale = pow(ip, 2.8)` computed once in `drawIris`; fibres, crypts, collarette and
   `PUP.r` use it; `drawPupil` draws exactly `PUP.r`. Measured ratios to the settled REVEAL radius (114 px):
   ip .66 → .225, ip .62 → .174, ip .53 → .097, ip .48 → .033, ip .35 and below → pupil absent (effective
   presence 0 because photo is still > .65 there). Centre pixel [0,0,0,255] wherever the pupil exists;
   the ip .40 still reads [0,0,0,187] — that is the ground/membrane with no pupil present, not a leak.
5. **Truth.** Videos are **1512×804**, VP8, container 25 fps, 690 frames / 27.6 s and 590 frames / 23.6 s
   (effective 25.0 fps) — measured by decoding with ffmpeg. `skinBoundaryCount/skinPlaneCount/activeBoundaryIndex`
   are constants; the measured facts are the five ascending boundary angles `[3.420,3.641,3.878,4.113,4.385]` and
   `BND[2].a === RE[ACTIVE].a`. `pp` deliberately uses `ka·1.4` (λ 6.2) so the pressure front keeps pace with
   the short BLOOD chapter; every other anatomy key uses `ka = 4.4`. No hot-path refactor in this pass.
   Hero phase-2 abort measured: phase 2 → 0, `c` 1 → 0, period back to rgb(242,242,239), u → .001 within 700 ms.
   Corneal residue measured: 0 outside the interval, .96–1.0 through it, .71 at ip .9, 0 in the Portal.

## Captures
A. 03/04/05 BLOOD pp 0 / .5 / 1 — scrollY 4125 · B. 07 membrane photo .15 / .25 / .35 / .50 / .70 — scrollY 9752 ·
C. 10a/10b/10c ip .40 / .51 / .90 (gap frame 10b: both copies 0) + 21-*.webm forward/reverse ·
D. pupil ratios above, `pupilCentre` per sample in the report · E. 20-*.webm with frame count/timing ·
06 SKIN · 14/15/16 mobile native coarse (ACTIVE 12, through 0, keyboard viewport 390×450, close → scroll to DNA).

## Perf
Chrome clean load, programmatic full-page scroll: draw CPU p95 0.6 ms, frame interval p95 18.6 ms (60 Hz).
The headless Playwright number (50 ms) is inflated by its own `getImageData` readbacks and is not representative.

## F — NOT PERFORMED
Physical iOS Safari / Android Chrome smoke (portal open/close, keyboard open/close, continue/reframe, close returns
to DNA, no horizontal overflow, ACTIVE visible) has not been run; only Chromium touch emulation. Not Final.
