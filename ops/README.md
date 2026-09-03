# ops/ — internal, not part of the website

These files are venue operating documents. They are **not** site pages and must
never be linked from `index.html` or `work.html`.

`ops/` is listed in `.assetsignore`, so Cloudflare does not upload it even when
this folder reaches `main`. If that line is ever removed, every file here
becomes publicly readable at `badblood.company/ops/…`.

| File | What it is |
|---|---|
| `klao-light-ops.html` | ร้านเกล้า — the full opening system: room states, run order, the fixed executor map, the MA2 build recipe |
| `klao-control-room.html` | ร้านเกล้า — the booth screen: tappable open/close checklists, state board, fault ladder |

Both are single-file HTML. Open them in any browser; no build step, no
dependencies, matching the rest of this repo.

**Status: proposal, not verified against the console.** The executor numbers
(1–9 on page 1, `Fix`ed) are a proposed standard read off a photograph of the
desk, not off the show file. Confirm those slots are free before programming.
