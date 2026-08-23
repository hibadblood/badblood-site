# BAD BLOOD — V6.2 SAFE RECOVERY / IRIS PHASE BODY

## Order of work (as instructed)
1. **Recovery** — `recovery/draft-2026-v4.2.1-restored.html` is `git show da205ff:draft-2026.html` byte-for-byte
   (the working `draft-2026.html` still equals that commit). Contains no V6 code (0 matches for meshCanvas / v6lab /
   IRIS PHASE BODY). Build meta `v4.2.1-temporal-clean-2026-08-23`.
   `recovery/recovery-proof.json`: desktop 1512×805, 390×844, 430×932 and reduced-motion — page errors 0, console
   errors 0, `scrollWidth<=innerWidth` everywhere, nav visible, IRIS at its anchors, DNA/BLOOD/SKIN pupil
   [0,0,0,255], WORK media on (3 images active), Portal open → type → close restores scrollY exactly, mobile keyboard
   viewport 450 px → canvas 390×450 → back to 844, logo/CTA not colliding, RM: portal works, no WebGL requirement.
   **Stable Regression Gate: PASS.**
2. **Lab** — `lab/iris-phase-lab-v6.2.html` + `lab/iris-phase-engine-v6.2.js`: black background, the body only,
   corridor selector, q slider, play forward / reverse / pause, silhouette mode, landmark overlay, fps counter.
   No DOM/typography/portal imported.
3. **Integration** — `integrated/draft-2026-v6.2-integrated.html` = restored V4.2.1 + adapter + `<script src>` of the
   engine. **Default is the stable V4.2.1 path; the morph runs only with `?irisMorph=1`.**

## Architecture
- `IrisPhaseEngine` (single module, public API exactly `init / resize / update / render / setReducedMotion /
  destroy / getDiagnostics` + two path helpers `aperturePath / outerPath` used by the adapter to cut the world ground).
  It never reads the DOM, never scrolls, never touches Portal/nav/media, has no RAF loop of its own.
- One connected material surface: an annulus with 180 contour spokes and 96 material columns (stable ids, seeds,
  thickness, local angle). States are radial fields Ro(θ)/Ri(θ): AWARE disc · DNA = two organic lobes (58/42) from
  one tissue with a soft-max wet bridge and a spindle core (one core, never two) · BLOOD = reservoir + 5 rounded
  tributaries (Gaussian lobes, mass-compensated widths), ruby dye only inside, travelling front · SKIN = tributaries
  widen and zipper into one membrane with seams inside the material · WORK = the membrane opens an organic aperture
  from the centre; the inner contour is the mask the adapter cuts into the world ground, so the full-screen work
  media is revealed behind the body (no strips, no rectangle) · REVEAL = the aperture closes, stroma → pupil →
  limbus → glint in order. Fields are interpolated per spoke, so adjacency never changes and the surface never breaks.
- **IRIS_PLAN** is the only state. Global phase `G = corridorIndex + progress` (AWARE 0 … REVEAL 5), derived from
  the premeasured anchors; integer when settled; **no spring, no lag** — the plan is a pure function of scroll
  (the optional ≤70 ms spring was removed because it failed the no-settle capture gate). Serial choreography
  0–.10 copy out · .10–.20 carry to the safe stage · .20–.76 morph · .76–.84 settle · .84–.92 carry to the target ·
  .92–1 copy in. Copy opacity, body position, ownership and media all read the same q.
- Ownership: `canvasEyeAlpha = 1 − phaseAlpha`; in-place takeover during the first corridor's copy-out (0–.10),
  phase body owner through DNA/BLOOD/SKIN/WORK/REVEAL, in-place hand-back at the end of the last corridor (.92–1).
  Media: `ownsMedia` from SKIN→WORK q .20 through WORK and into REVEAL q .76; the V4.2.1 membrane is bypassed while
  the aperture owns the media and the first work image is developed by the aperture progress.
- Safe stage: centre 50vw / mid below the nav, radius = min(18.5vw desktop / 33vw mobile, fit-by-extent) so the
  whole silhouette (BLOOD tributaries ≈2.5R) stays inside a 4vw/4vh margin.
- Fallback: any engine throw → `html.iris-fallback`, phase canvas hidden, `canvasEyeAlpha = 1`, V4.2.1 membrane
  restored; Portal still opens (proved by a simulated failure). Reduced motion or no `?irisMorph=1` → V4.2.1.

## Live gate (integrated, `?irisMorph=1`, 21 q steps forward and reverse, captured with **no settle**, 2 rAF)
| viewport | corridor | fwd vs rev max landmark err px | q1 vs settled target px | max copy opacity q.16–.84 | body on screen during morph |
|---|---|---|---|---|---|
| desktop | AWARE-DNA | 0 | 0.0 | 0 | yes |
| desktop | DNA-BLOOD | 0 | 0.0 | 0 | yes |
| desktop | BLOOD-SKIN | 0 | 0.0 | 0 | yes |
| desktop | SKIN-WORK | 0 | 0.0 | 0 | yes |
| desktop | WORK-REVEAL | 0 | 0.0 | 0 | yes |
| 390x844 | AWARE-DNA | 0 | 0.0 | 0 | yes |
| 390x844 | DNA-BLOOD | 0 | 0.0 | 0 | yes |
| 390x844 | BLOOD-SKIN | 0 | 0.0 | 0 | yes |
| 390x844 | SKIN-WORK | 0 | 0.0 | 0 | yes |
| 390x844 | WORK-REVEAL | 0 | 0.0 | 0 | yes |
| 430x932 | AWARE-DNA | 0 | 0.0 | 0 | yes |
| 430x932 | DNA-BLOOD | 0 | 0.0 | 0 | yes |
| 430x932 | BLOOD-SKIN | 0 | 0.0 | 0 | yes |
| 430x932 | SKIN-WORK | 0 | 0.0 | 0 | yes |
| 430x932 | WORK-REVEAL | 0 | 0.0 | 0 | yes |
Global phase forward vs reverse difference: 0 in every corridor. Page errors / console errors: 0 on all three
viewports. Portal: LISTEN with phaseAlpha 0; mobile keyboard viewport 450 px phaseAlpha 0, no overflow; close → scroll
continues (cur `dna`). Reduced motion (`?irisMorph=1` + RM): engine off, phase canvas hidden, eyeA 1.
Fallback test: simulated `update()` throw → fallback class, canvas hidden, eyeA 1, Portal opens afterwards, 0 errors.
Lab landmarks (12 spokes, 21 q fwd/rev): forward vs reverse **0 px** in all five corridors; lab 61 rAF/s, max frame gap
16.8 ms, engine render 0.1 ms.

## Performance — honest
Engine render CPU ≈ 0.1–0.3 ms; stable Canvas2D p95 0.9–1.1 ms. Frame-interval numbers in the JSON are from headless
Chromium (software raster): desktop p95 50 ms / max gap 175 ms, phones p95 33 ms. **A real-browser trace could not be
taken in this session: the Chrome tab available here is rendering at ~3 rAF/s on every page (including the untouched
stable file), i.e. the browser instance is degraded, not the page.** Treat the ≤20 ms / ≤24 ms targets as unverified.

## Videos
All screencasts are Playwright captures: **25 fps**, not 60 (Playwright cannot record 60). Metadata from ffmpeg decode:
- `AWARE-DNA`: 1512×804 vp8 25.0 fps, 482 frames / 19.28 s
- `DNA-BLOOD`: 1512×804 vp8 25.0 fps, 482 frames / 19.28 s
- `BLOOD-SKIN`: 1512×804 vp8 25.0 fps, 482 frames / 19.28 s
- `SKIN-WORK`: 1512×804 vp8 25.0 fps, 486 frames / 19.44 s
- `WORK-REVEAL`: 1512×804 vp8 25.0 fps, 489 frames / 19.56 s
- `fullDesktop`: 1512×804 vp8 25.0 fps, 2149 frames / 85.96000000000001 s
- `full390`: 390×844 vp8 25.0 fps, 1637 frames / 65.48 s

## Not done / not claimed
- Physical iOS Safari / Android Chrome smoke — not performed.
- 60 fps motion captures — not possible with this tooling (25 fps delivered, reported as such).
- Real-browser frame-interval p95 — not measured (see above).
- Lab 21-frame sheets show the DNA lobes still with a radial fibre texture; the silhouette is two organic lobes
  (no wedge cut), reviewer to judge "fan" reading.
**Stable Regression Gate: PASS. Morph Live Gate: PASS on determinism, ownership, copy, on-screen, fallback, RM.**
**Not called Final** (device smoke + real-browser perf outstanding). Production default remains V4.2.1.
