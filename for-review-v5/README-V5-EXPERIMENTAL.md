# BAD BLOOD — V5 EXPERIMENTAL SIGNATURE MOTION PROTOTYPE
## ONE IRIS / SIX PHYSIOLOGIES — Phase 1 (FISSION · PERFUSION · RECONSTITUTION)

**Not Production Final.** Fork of V4.2.1 (`draft-2026.html`, commit `da205ff`, still the rollback and untouched).
Source: `draft-2026-v5.html` · build `v5-experimental-signature-motion-2026-08-23`.
Everything locked from V4.2.1 is inherited unchanged (layout, copy, membrane .50/.70, BLOOD drain, SKIN 5/4,
typography gap, opaque pupil, mobile compositions, Portal, reverse behaviour).

## What was built
**DNA — FISSION.** Inside the approach to the DNA anchor (`anatomy → dna` segment) the outer stroma
(r > .52R) splits into three asymmetric lobes along seeded cleavage lines — the first is the active scar angle.
Each lobe carries its own stroma fill and fibres, translated along its bisector; the vacated ground shows through;
six seeded tether fibres cross the cleavages. Phase curve `fissionBell(u) = sstep(.12,.40,u)·(1−sstep(.50,.84,u))`
— pre-tension, split, settle, calm — a pure function of scroll; the DNA anchor itself is already calm.
Measured (desktop, iris Ø 379 px): gap 26.5 px = **7.0%**, max lobe offset 12.7 px = **3.35%**; mobile (Ø 246/271 px):
gap 11.1 / 12.2 px = **4.5%**. Settled geometry after forward vs after reverse: **Δ 0.000 px** (`V5.stroma()`,
three stroma reference points). One pupil, one catchlight, no roots through the pupil.

**BLOOD — PERFUSION.** 8 ribbons desktop / 6 mobile (the six dominant-root bundles + seeded), each a 14-point
spline from the pupil edge to the limbus with a travelling displacement `amp·sin(s·2π·k − pp·9 + φ)·sin(sπ)`;
amplitude = `front·(1−drain)·blood` capped at 22 px desktop / 10 px mobile; three strokes per ribbon: dark edge,
graphite→ruby core (front-driven gradient, head = pressure head), a 1 px offset highlight (the only "refraction").
Width pulses with the phase (surface tension). Phase is `P.pp` → scrolling up runs the same flow backwards;
`P.pp` lags with λ 6.2 desktop (≈160 ms) / 9.7 mobile (≈75 ms). As the chapter ends the amplitude goes to 0, the
colour drains through the V4.2.1 `bt` tint, and each ribbon's angle coagulates onto the nearest SKIN boundary.

**WORK → REVEAL — RECONSTITUTION** on `P.ip` (0 = WORK, 1 = REVEAL):
- 0–.22 emulsion veil around the future anatomy (canvas, graphite, ≤ .42) — the image itself is not filtered;
- .22–.46 **14 filaments desktop / 9 mobile** from seeded fibre ids are pulled home along the active root
  (`far = R·L·(1−q)`), conserved, no particles;
- .46–.56 anatomy-only: pupil (`pupilScale = ip^2.8`), root and a .14 glint floor survive; both headline groups 0;
- .56–.86 ordered: root (.56–.62) → dominant fibres (.60–.68) → stroma (.66–.74) → limbus (.72–.78) → catchlight
  (.78–.86). Reverse runs the same windows backwards.
Measured sweep (`recon-sweep.json`): ip .39 work .42/reveal 0 · ip .50 both 0, pupil r 6, centre [0,0,0,255] ·
ip .61 reveal .23, pupil 19 · ip .72 pupil 35 · ip .84 pupil 56 · ip 1 pupil 116. No root through the pupil.
**Honest gap:** the active scar does not yet read during ip 0–.22 (outside-root alpha is still gated by the
effective presence, which is 0 while photo > .65); it appears from ip ≈ .50 (alpha .11). Next pass.

## Proof files
A `A-fission-forward-reverse` (1512×804, 25 fps, 481 f / 19.2 s) + A1 midpoint, A2 settled, A3 settled after reverse
B `B-perfusion-forward-reverse` (531 f / 21.2 s) + B1/B2/B3 pp .35 / .5 / 1
C `C-reconstitution-forward-reverse` (534 f / 21.4 s) + C1–C10 stills from the fraction sweep
D `D-dna-to-reveal-reading-speed-forward-reverse` (1240 f / 49.6 s; 22 s each way)
E `E-mobile-390x844-dna-to-reveal` (390×844, 933 f / 37.3 s) + 390/430 coarse stills (fission, perfusion, ip .34)
F reduced motion: fis 0 at the midpoint, ip snapped 0/1 at the 50% anchor, no filaments
G `fissionSettle.maxDeltaPx = 0.0`
H CPU: draw p95 **2.2 ms desktop**, **1.0 ms coarse 390/430** (targets < 3 / < 5). Frame interval p95 in Chrome on a
  clean load: 18.3 ms (60 Hz). Headless frame numbers in the JSON (33–50 ms) are inflated by the proof's own
  `getImageData` readbacks and are not representative.
All videos: VP8/WebM, container 25 fps, frame counts decoded with ffmpeg.

## Not done
No real-device test. Phase-2 systems (DELAMINATION, DEVELOP as separate verbs, ECHO) not started.
