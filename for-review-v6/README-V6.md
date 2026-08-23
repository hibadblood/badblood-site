# BAD BLOOD V6 — IRIS PHASE BODY (final candidate, NOT Production Final)

Build `v6-iris-phase-body-final-candidate-2026-08-23` · source `draft-2026-v6.html` · lab `?v6lab=1`
Base: V4.2.1 (`draft-2026.html`, `da205ff`) untouched = rollback. V5 renderer rejected; imported only seeded ids,
typed arrays, reverse/settle, perf guards, QA hooks. All V4.2.1 locks inherited.

## The engine
One pre-seeded polar tissue mesh, **96 strands × 28 samples**, each vertex with conserved strand id, canonical polar
coordinate, channel / sheet / tape ownership, photo UV, shade, alpha. Rendered on a dedicated **WebGL2** canvas
(`#meshCanvas`, one dynamic VBO, one program, the current project image as a texture); the V4.2.1 Canvas2D eye
stays the canonical AWARE body and hands its mass to the mesh by **paired alpha transfer** (`EYEA + MESHA = 1.00`
measured at every sample). No WebGL2 or reduced motion → V4.2.1 canonical path (`meshOn:false` in the RM run).
Scroll selects the state deterministically; time only damps (`MESHQ` λ 8 desktop / 12 mobile). Six layouts:
AWARE (radial stroma, solid outer ring, core), MITOTIC (two unequal bodies 58/42 along the curved active scar,
ligaments from strand ids, core → spindle), VASCULAR (5 filled C1 cubic channels 12–26 px tapering into the
ROOTS.DOM endpoints, strands advected across the width, ruby = travelling dye front by `PRESS.head`),
LAMELLAR (strands fill the four sheets between the five V4.2.1 boundaries, active seam in the middle, thickness at
edges), PHOTOGRAPHIC (96 tapes tile the viewport, image develops through seeded pores led by the active tape, grain
in the shader), RECONSTITUTED (tapes detach carrying the image, curl to the scar, desaturate, braid, widen into
stroma; limbus and glint last via the 2D hand-back). Corridor: body carried to 38 vw desktop / 68 vw mobile at
viewport centre for q .04–.96; copy: outgoing `1−sstep(.02,.16,q)`, incoming `sstep(.84,.97,q)`.

## Gate results (measured, `proof-report-v6.json`, `landmark-report-v6.json`)
1. **Silhouette** — `G1-silhouette-contact-sheet-100-25-10pct.png`: AWARE / DNA / BLOOD / SKIN / WORK distinguishable at
   100/25/10%. **REVEAL's settled state is, by design, the AWARE eye again** → 5 of 6 distinct; the REVEAL *journey* is
   distinct (see G2 WORK-REVEAL). Partial.
2. **Five-frame** — `G2-five-frames-*.png` for all five transitions (q 0/.25/.5/.75/1). Pass.
3. **No-circle** — at q .5 of DNA, BLOOD, SKIN, WORK no intact disc/limbus (P-*-q050 stills; EYEA 0). Pass.
4. **Material continuity** — 12 landmark strands, 51 samples fwd + 50 rev, settled: max velocity 4.2 / 14.1 / 29.2 /
   52.4 / 70.1 px per 2% q (continuous, no teleport), min landmark alpha .94, paired alpha sum 1.00–1.00,
   reverse-vs-forward max error **0 / 0 / 1.5 / 1.64 / 0 px**. Pass (≤1.64 px, not ≤1 px everywhere).
5. **Fission pixel** — outer contour displaced (13% of Ø desktop, 8% mobile), the gap is transparent (world visible,
   silhouette shows it), no gap stroke. **External roots do not yet follow their owning body** (they are still the
   V4.2.1 2D roots) → root-to-body endpoint error not met. Partial.
6. **Flow** — filled polygons, C1 cubic, ruby confined to the front, reverse runs the front backwards (`PRESS.head`
   is a scroll function). Head moves by spline parameter, **not true arc length**; turn angle not measured. Partial.
7. **Reconstruction** — image-derived tapes visible at normal size (6 px desktop / 4.5 px mobile), no dropout
   (min alpha .94), no completed-iris fade (2D eye alpha is paired), limbus/glint last (hand-back q .84–.96).
   **The scar/core appears from q .60, not .18** → partial.
8. **Typography** — outgoing and incoming copy measured 0.00 at q .25/.5/.75 in all five transitions. Pass.
9. **Mobile** — 390×844 and 430×932 coarse: body 68 vw, fully on-screen, `scrollWidth <= innerWidth`, Portal
   LISTEN with keyboard viewport (MESHA 0, label LISTENING, input focused), close → scroll → DNA. Pass.
10. **Squint** — subjective; DNA/BLOOD/SKIN/WORK no longer read as "the same eye with an overlay". The DNA body still
    carries a fan-like radial texture at the midpoint (risk of "sliced disc"). Reviewer call.

Perf (Chrome, clean, no readbacks): Canvas2D p95 0.8 ms + mesh JS p95 0.3 ms = **1.0 ms total render CPU**
(< 4 ms); headless coarse 390/430 Canvas2D 2.8 / 2.7 ms (mesh JS not separately timed there; < 7 ms).
Frame interval p95 18.6 ms in Chrome (60 Hz). Headless frame numbers in JSON are readback-inflated.
Videos: 5 isolated transitions + full page (1512×804, VP8, 25 fps, frames decoded) + 390×844 full page.
Reduced motion: `RM-*-q050.png`, V4.2.1 path, mesh off.

## Not done
Physical iOS Safari / Android Chrome smoke — not performed. Roots following the mitotic bodies, arc-length
pressure head, turn-angle metric, scar by q .18 — open. Therefore **not Production Final**.
