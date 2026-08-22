# BAD BLOOD — 2026 SITE DRAFT · design review package

## What this is
An interactive visual prototype of the next badblood.company. It is a draft
beside the live site, not a replacement for it — `index.html` is untouched.

## What is in this folder
- `draft-2026.source.html` — the whole prototype, one file, no build step.
  Media has been stripped out (base64 replaced with `ASSET_..._REMOVED`) so it
  is 69 KB instead of 1.2 MB and can be pasted or uploaded whole.
- `*.jpg` — still frames. Look at these first. The site is canvas-heavy, so
  reading the HTML alone will not show you what it looks like.

## The system, in short
- **Ground:** near-black with depth — `--void #050506`, `--ink #08080A`,
  `--carbon #0B0B0F`, `--graphite #15151A`.
- **Light:** `--bone #F2F2EF`, `--chrome #9EA2A6`, `--smoke #5C5C61`.
- **Signal:** `--blood #C8102E` and a subsurface `--blood-deep #4A0710` that
  exists only inside the eye. Red is punctuation — one accent per screen.
- **Type, three roles:** Archivo compressed/heavy for DISPLAY, Archivo normal
  for EDITORIAL, Space Grotesk for MICRO (technical annotations).
- **Motion:** four named curves with mass — `--lux`, `--focus`, `--cut`.
- **The eye** is procedural canvas built in layers: socket, limbus, stroma with
  fibre at three depths, an off-centre collarette, crypts, an aperture with
  depth behind it, and a cornea that parallaxes against the stroma. Attention
  is modelled — it acquires after a dwell, overshoots, settles, drifts, and
  sometimes declines to look. It is deliberately not a 1:1 cursor follower.
- **Anatomy** is one continuous transformation, not three cards: DNA (a
  registration grid — measured space), a seam where order destabilises and one
  red beat crosses it, BLOOD (rhythm, the grid still underneath), a seam where
  rhythm congeals into planes, SKIN (material and reflection).
- **The IRIS portal** is not a chat. A brief is taken apart into typography —
  each word annotated, the medium struck through and labelled "medium selected
  too early" — then the verdict and the question that should have been asked.

## Rules that are not up for redesign
- Never redraw the logo. Only the supplied PNG files are ever used.
- Concept films are self-initiated. Every surface that shows them says so, and
  no result is ever asserted — where a scar has not been measured the copy
  says exactly that.
- The site is English only.
- Everything degrades to "no animation", never to invisible or broken content.
- No localStorage or sessionStorage anywhere.

## What would actually help
Art direction, composition, typography and pacing. Not more features, not more
copy, not a backend.
