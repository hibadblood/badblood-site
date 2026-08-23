# Bad Blood 2026 — ONE THOUGHT. ONE VEIN. (V4)

Build id: `v4-one-thought-one-vein-2026-08-23` (console `[BB] build …`, `<html data-build>`).
Live draft: https://claude.ai/code/artifact/937579e7-614b-43f7-b108-cd6a816458a8

`draft-2026.source.html` is the real single-file prototype with embedded image assets stripped
(`ASSET_*_REMOVED`). Everything else is the code that produced these captures.

## What changed (against the brief)
- **ACTIVE_ROOT** = `ROOTS.DOM[0]` (root id 0), the same id through HERO → DNA → BLOOD → SKIN → WORK → REVEAL → PORTAL.
  During any signature event the other roots are multiplied by `quiet = 1 − sig·.85` (≤ 8–12%).
- **Morphology** is its own interpolated state (`MORPH` / `MP`): aperture, pupilAspect, limbusAspect, curl, bundle,
  cryptDepth, wetness, dissolve, scar — per chapter and per Portal mode (LISTEN/READ/THINK/ANSWER).
- **Anticipation** is scroll-domain: attention leads geometry by 9% of the chapter in the direction of travel
  (≈180–300 ms at reading speed), skipped above 1600 px/s, reversed when scrolling up. No cursor following.
- **Hero**: the period of "THAT LIVE." is a span. After 0.52 s of stillness IRIS looks at it, pupil −4%,
  the active root travels from the limbus and stops 3 px short, the period is ruby for 180 ms, then bone;
  the root remains at 13% graphite. Abandoned instantly on scroll.
- **Document-space topology**: 12 paths (7 on mobile) through every chapter anchor; path 0 passes through the active
  root's tip at each chapter. Only segments near the viewport are drawn; any segment within 1.12·R of the eye is skipped.
- **BLOOD pressure** is `P.pp` (0 before the chapter, linear inside, 1 after): 0–25% tension, 25–75% front travels
  outward, 75–100% drains to a warm graphite scar. Carrier +0.6 px max, neighbours compress toward it, pupil −2.5% and
  offset. Scrolling up pulls it back along the same root. No clock.
- **SKIN → WORK**: lamellae start at the active root (it is the seam); `projectLine()` uses `naturalWidth/Height`
  and true cover geometry; the photograph is revealed by a **destination-out cut** on the world canvas along the
  water line. Order: ground/topology → cut → roots → lamellae → IRIS/pupil. `match` (vein ↔ line) is a separate key
  from `photo`, forced 0 in REVEAL and PORTAL. Headline withdraws .45→.63, IRIS gone by .52, active root by .65.
- **Portal**: every `input` event is one ≤2 px impulse through the active root; READ → root goes to the struck medium;
  THINK → `.struck` ruby strike only across that word; ANSWER → root settles under the next question
  ("Who should care enough to pass it on?"); pupil opens. The root's heading turns toward its target so it never
  crosses the pupil.
- **Release fixes**: `visualViewport.resize` + genuine height change rebuild the backing store; overflow/inert restored
  only inside `finishPortalClose()`; `dataset.on === '1'`; no per-frame DOM measurement (anchors, headline targets,
  scar and rail rects are measured in `measure()`); no per-frame arrays (lamella indices precomputed).

## Captures
| # | File | Viewport | Notes |
|---|---|---|---|
| 01a/b/c | hero before / ruby period / consequence | 1512×805 | phase 0 → ruby at t+1.2 s → root 13% |
| 02 | DNA morphology | 1512×805 | aperture .84, bundle 1, crypts .3 |
| 03/04/05 | BLOOD pressure 0% / 50% / 100% | 1512×805 | pp 0 → .5 (front 1, head .5) → 1 (drain 1, scar) |
| 06 | SKIN seam | 1512×805 | lamellae roots [0,7,11,12], seam = root 0 |
| 07/08/09 | WORK exposure photo .25 / .50 / .70 | 1512×805 | --hx 1 / .77 / 0 |
| 10 | REVEAL | 1512×805 | roots through pupil: none (measured) |
| 11/12/13 | Portal LISTENING / THINKING / ANSWERING | 1512×805 | root min distance to pupil centre 465 / 457 px, pupil r 86–104 |
| 14/15 | mobile pressure 50% / reveal | 390×844 native | reveal: headline 143 px, nav 39 px, no root through pupil |
| 16 | mobile portal, keyboard open | 390×450 native | canvas CSS 390×450, backing 585×675 (rebuilt) |
| 17 | mobile pressure 50% | 430×932 native | |
| 18 | reduced motion after close | 1512×805 | `.closing` off, raised off, overflow '', inert off, focus restored |
| 19 | scroll forward then reverse (GIF) | 1512×805 → 756×402 | arrival→reveal→arrival, 17 frames |

## Performance (this machine, Chrome)
- Draw CPU per frame p95: 0.5 ms desktop (1512×805, PX 1.19), 0.5 ms at 390×844 (PX 1.5).
- Frame interval p95: 18.1 ms desktop / 18.4 ms mobile harness — vsync-bound at 60 Hz (16.7 ms) with ~1.5 ms jitter
  under a continuous programmatic scroll. Not measured on a real phone.
- No WebGL, no shadowBlur, no animated full-screen CSS filters, no Math.random in a frame.
