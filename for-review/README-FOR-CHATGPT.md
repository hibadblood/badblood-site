# BAD BLOOD — 2026 SITE DRAFT · design review package

## What this is
An interactive visual prototype of the next badblood.company. It sits beside
the live site; `index.html` is untouched.

## Look at the pictures first
`draft-2026.source.html` is one file with no build step, but almost everything
you would judge is drawn into a canvas at runtime. Reading the HTML alone will
not show you the design. The JPEGs are the design.

- `01-arrival.jpg` — first frame, desktop
- `02-dna.jpg` — DNA state
- `03-blood.jpg` — BLOOD state
- `04-work.jpg` — a project, developed under corneal exposure
- `05-iris-portal.jpg` — a brief taken apart as typography
- `06-mobile-pressure.jpg`, `07-mobile-iris-reveal.jpg` — mobile art direction

Media is stripped from the source (`ASSET_..._REMOVED`) so it is 74 KB rather
than 1.2 MB. Keep those placeholders exactly; do not invent replacement imagery.

## The architecture, in one paragraph
There is **one** `<canvas>` on the page. `#worldCanvas` renders the
environment, the DNA lattice, the BLOOD pressure, the SKIN planes, IRIS
herself, the corneal reflections and the transition residue, from a single
requestAnimationFrame scheduler. Every section is `background: transparent`.
IRIS is generated once from a seeded PRNG (mulberry32) and never regenerated —
there is no `Math.random` in executable code — so the same fibre pattern,
crypt placement and collarette asymmetry survive from boot to footer and into
the portal. Visual state is a pure function of scroll position: anchors are
precomputed after `fonts.ready`, the two adjacent states are smootherstepped,
and every parameter is approached with frame-rate-independent inertia. Scroll
backwards and the identical transformation reverses.

## The system
- **Ground:** `--void #050506`, `--ink #08080A`, `--carbon #0B0B0F`,
  `--graphite #15151A`.
- **Light:** `--bone #F2F2EF`, `--chrome #9EA2A6`, `--smoke #5C5C61`.
- **Signal:** `--blood #C8102E`, with `--blood-deep #4A0710` living only under
  the iris fibres. Red is punctuation and biological pressure, never paint.
- **Type, three roles:** Archivo compressed/heavy for DISPLAY, Archivo normal
  width for EDITORIAL, Space Grotesk for MICRO (technical annotations).
- **Motion:** named curves with mass — `--lux`, `--focus`, `--cut`. Inertia
  lambdas: position 7, world geometry 5, gaze 11, pupil 8, opacity 9.
- **Gaze:** dwelt-on element → active headline → reading direction → rest. The
  cursor is worth at most 18%, and only after a 260 ms dwell. Micro-saccades,
  asymmetric blinks (upper lid 70% of the closure), 2–3% pupil breathing, and
  no blinking while the visitor is scrolling fast.

## Rules that are not up for redesign
- Never redraw the logo. Only the supplied PNG is ever used.
- Concept films are self-initiated. Every surface says so, and no result is
  ever asserted — where a scar has not been measured the copy says exactly that.
- English only.
- Everything degrades to "no animation", never to invisible or broken content.
- No `localStorage`, no `sessionStorage`.
- One canvas. Do not reintroduce per-section canvases or a second eye.

## Known open questions
1. **A second typeface.** The repo's locked rule was "Space Grotesk only".
   Archivo was introduced for DISPLAY and EDITORIAL. Still awaiting a decision.
2. **The live homepage** is a locked single-take scrubbed film with no nav and
   no work on it. This draft breaks all three because the new strategy asks it
   to. Merging them is a decision, not a merge.

## What would help
Art direction, composition, typography, pacing, and the believability of the
eye. Not more features, not more copy, not a backend.
