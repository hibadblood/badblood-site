# Bad Blood 2026 — V4.1 SIGNATURE TRUTH + DEVICE IDENTITY

Build id: `v4.1-signature-truth-2026-08-23` — identical in `<meta name="bb-build">`, `<html data-build>`,
the console line `[BB] build …` and this README.
Live draft: https://claude.ai/code/artifact/937579e7-614b-43f7-b108-cd6a816458a8
`draft-2026.source.html` = the real file with embedded image assets stripped (`ASSET_*_REMOVED`).

## Corrections made
1. **One canonical iris.** `FIB_N = 340` on every device; a phone skips one fibre in four *at draw time only*, never
   a root fibre (`ROOTFI`). Separate PRNG streams: fibres `RND`, roots `RR`, anatomy `RA`, topology its own.
   `ACTIVE_EXPECT = 12` is baked in and asserted at start-up (`console.error` on mismatch). Computed fine/coarse:
   both resolve to 12 (`node` evaluation of the seeding prelude with COARSE=false and true). Topology path 0 is
   reserved for the active root (`pth = isAct ? 0 : 1 + r % (n-1)`); on a phone the root turns its heading to
   that path, so 91–121 px stay on screen in every chapter (measured: arrival 91, dna 116, pressure 121, blood 107,
   skin 108, reveal 119).
2. **Physical match.** `line:[0,.335,1,.315]` — the water surface / waterfall boundary — through
   `naturalWidth/Height` + cover. Exposure: 4–18 px until photo .30 (`2+7·e1` px), then `(e2)^1.5 · .6·CH`
   → ≈42% of the frame at .50, full by .70. The procedural stroke is gone before .45; `--hx` withdraws .45→.63.
3. **SKIN as matter.** Five boundary roots → four planes, ACTIVE between the middle two (`LAMI = [2,1,12,7,8]`).
   Occlusion .58 (+38%), depth 4–6 px, base fibres −30% under planes (`1−ws·.82`), one grazing edge on plane 1.
4. **Scar.** ACTIVE is a cubic Bézier with an S-inflection at 38%/62% of its length, ±(8 px desktop / 4 px mobile).
5. **Pupil never shows imagery.** Render order: ground → topology → exposure cut → non-active roots → ACTIVE →
   lamellae → noise → IRIS surface → final opaque pupil mask (exact geometry: eccentricity, pupilAspect, aperture;
   radius → 0 only as presence → 0). Canvas pixel at the pupil centre at photo .25 and .50: `[0,0,0,255]`.
6. **Presence, not fade.** `ip` (irisPresence) is its own state key: WORK 0, everything else 1, and
   `min(ip, 1−(photo−.42)/.23)`. Stroma/fibres by seeded threshold, roots at `ip/.35`, limbus at `(ip−.45)/.55`,
   wet surface at `(ip−.6)/.4`. REVEAL rebuilds in that order (capture 10a at ip .45).
7. **match forced off.** Entering REVEAL: `P.match = T.match = 0`; opening the Portal: same, before the next frame.
8. **Motion.** Anticipation keeps the last non-zero direction; Hero aborts on any scroll (period back to bone, root
   released); BLOOD front eased in/out (`smoother((pp−.21)/.09)`, drain `smoother((pp−.72)/.12)`); quiet = 1−sig·.9
   (non-active max 0.034 during the pressure front); `PT` interpolates (λ 6); close waits for portalT 0 **and**
   eye within .015 of the restored pose (measured close 675 ms, Δ .011).

## Proof
| # | File | Pixels | Evidence |
|---|---|---|---|
| 01 | hero ruby period | 1512×805 | `ruby:true`, u 1 |
| 02 | DNA | 1512×805 | aperture .84 |
| 03/04/05 | BLOOD pp 0 / .5 / 1 | 1512×805 | **same scrollY 4126**, same eye .83/.42/.52 — only `QA.pp` changed; front 0 / 1 / 0, drain 0 / 0 / 1 |
| 06 | SKIN | 1512×805 | four planes, seam = root 12 |
| 07/08/09 | WORK photo .25 / .50 / .70 | 1512×805 | pupil px [0,0,0,255] at .25 and .50; `--hx` 1 / .77 / 0; pupil off and root alpha 0 at .70 |
| 10a/10 | REVEAL rebuilding (ip .45) / settled | 1512×805 | roots through pupil: none |
| 11/12/13 | Portal | 1512×805 | **13 captured with the label reading `IRIS / ANSWERING`** (beat timers ×2.4 under `#qa` only) |
| 14 | mobile pressure pp .5 | **390×844 native** (two viewport captures stitched, no resampling) | active root 107 px visible |
| 15 | mobile reveal | **390×844 native** | through pupil: none |
| 16 | keyboard viewport | **390×450 native** | canvas CSS 390×450, backing 585×675 |
| 17 | mobile pressure | **430×932 native** | |
| 20 | motion | 1512×805 WebM, Playwright screencast | 11 s forward + 11 s reverse DNA→PRESSURE→BLOOD→SKIN→WORK, eased, real frames |

Not done here, honestly: **16 shows the keyboard-height viewport (450 px), not a rendered OS keyboard** — a
desktop browser cannot draw one. **E. real-device smoke** (iOS Safari / Android Chrome) cannot be run from this
machine. Open `…/draft-2026.html?smoke` on the phone: a fixed readout prints build, `ACTIVE (expect 12)`,
coarse, `limb0 0.9640`, `crypt0 4.810`, visual-viewport vs canvas height, roots-through-pupil count and error count.
Expected on any device: `ACTIVE 12 (expect 12)`, limb0 0.9640, crypt0 4.810, through 0, errors 0.
Perf here: draw CPU p95 0.6 ms; frame interval p95 18.4 ms (60 Hz vsync + jitter) at 1512×805.
