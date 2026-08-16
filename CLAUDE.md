# CLAUDE.md — BAD BLOOD COMPANY 🩸

Read this before touching anything in this repo. These are locked decisions,
not suggestions. When a request conflicts with something marked **LOCKED**,
say so and ask before proceeding.

---

## 1. WHO THIS IS

BAD BLOOD COMPANY — a Bangkok-based cross-medium creative company.
Not a normal agency. Not just a production house. Not a generic AI studio.

**LOCKED positioning lines — use these words exactly, do not paraphrase:**
- WE GIVE IDEAS A BODY.
- BAD BLOOD IS AN IDEA ENGINE. STRATEGY ENTERS. WORLDS COME OUT.
- ONE BRIEF. ONE BRAIN. EVERY MEDIUM.

**LOCKED name meaning:**
- BLOOD = instinct, energy, identity, pulse.
- BAD = untamed, refuses the old frame.
- It does NOT mean feud, gore, or low quality. Never write copy that implies it does.
- Darkness / blood / chrome are **controlled tension**, never shock value.

**LOCKED three layers** (this is the site's spine — chapters I, II, III):
| Layer | Promise | Covers |
|---|---|---|
| DNA | Make it work | strategy, research, web, apps, platforms, digital systems |
| BLOOD | Make it matter | creative direction, film, photography, identity, campaign, sound |
| SKIN | Make it real | events, space, installation, retail, exhibition |

**Method:** FIND THE PULSE → BUILD THE DNA → GIVE IT BLOOD → GIVE IT SKIN → MAKE IT MOVE

**Tone:** premium, intelligent, dangerous with restraint, design-driven.
**Never:** generic AI-studio voice, generic cyberpunk, fake luxury, empty
disruption language, overclaiming.

---

## 2. HARD RULES — DO NOT BREAK

**Logo.** Only ever use the real files: `assets/bb-logo-horizontal.png` and
`assets/bb-logo-stacked.png`. **Never redraw, regenerate, trace, or "improve"
the logo** in SVG, CSS, or any generated image. A past AI recreation lost part
of the mark and was rejected. If a logo variant is needed and no file exists,
stop and ask.

**Honesty about the work.** Spec/concept films featuring real brands are
**concept work**. Every surface that shows them must say so. Never write copy
implying those brands commissioned us. Work that is still being pitched is not
a case study. No invented metrics, no view counts presented as results.

**Language.** The site is **English only**. Do not reintroduce Thai copy into
the pages. (Talk to the owner in Thai; write the site in English.)

**Homepage restraint.** `index.html` is a deliberate sequence with **no top nav**
and **no portfolio items**. Do not add a nav bar. Do not add a work list, grid,
or thumbnails to the homepage. The only doorway to the work is the single
"See the work" CTA. If asked to add work to the homepage, confirm first — this
was an explicit decision.

---

## 3. STACK

Static HTML + CSS + vanilla JS. **No framework, no build step, no bundler,
no npm dependencies.** Keep it that way unless the owner explicitly asks.

- Hosting: Cloudflare (Workers static assets) — config in `wrangler.jsonc`
- Deploy: automatic on push to `main`. No manual upload step.
- Build command must stay **empty**. Root directory is `/`.
- Files live at repo root — never nest them inside a subfolder.

```
index.html      one-page site (the experience)
work.html       the archive — a grid of real frames, tap to play
style.css       all styles, shared
wrangler.jsonc  Cloudflare config
assets/         logos + hero.mp4
```

---

## 4. DESIGN SYSTEM

Defined as CSS variables at the top of `style.css`. Use the variables, never
hardcode a hex.

| Token | Value | Use |
|---|---|---|
| `--ink` | `#08080A` | background |
| `--bone` | `#F2F2EF` | primary text |
| `--chrome` | `#9EA2A6` | secondary text |
| `--dim` | `#5C5C61` | tertiary / labels |
| `--blood` | `#C8102E` | the only accent — use sparingly |
| `--line` | `#232326` | borders, dividers |

**Type:** Space Grotesk only (300/400/500/700). No second typeface.
Uppercase + wide letter-spacing for display and labels; sentence case for prose.

**Red is punctuation, not paint.** One accent moment per screen. If red starts
appearing in several places at once, that's a signal something is wrong.

---

## 5. HOMEPAGE SEQUENCE — the order matters

Rebuilt 2026-08-16 at the owner's direction, twice: first away from the dark
veil, then away from cutting the film into pieces. The page is now three acts
and runs about twelve screens instead of twenty.

1. **Opening** (`.open`) — black. The logo slides down on arrival (a CSS
   entrance, deliberately *not* scroll-driven — tying it to the scrollbar left
   the first screen empty). Then scroll brings the three lines in one at a
   time; they accumulate rather than replace each other.
2. **Blood drop** — scroll-driven: stretches → snaps → falls → lands
3. **The reel** (`.reel`) — **ONE continuous scroll-scrubbed take of the whole
   film**, `assets/reel/` (170 webp frames, 1000px, 4.9 MB). Scroll down runs it
   forward, scroll up runs it backward.
4. **Doorway** — the single "See the work" CTA
5. **Footer** — closing lines + the poem

**Two things the owner asked for that must not be undone:**

- **Do not dim the footage.** No veil, no overlay across the frame. If type is
  unreadable, give the type its own local pool of shade (`.reel-copy::before`)
  — never a layer over the film.
- **Do not cut the film into sections.** DNA / BLOOD / SKIN are *moments inside
  one take*, not separate sections. Their captions fade in when the film reaches
  what they name. Splitting it into three made the page feel chopped.

Captions are pinned dead centre and never travel with the scroll — on a phone,
type sliding under your thumb while the picture moves reads as a fault.

Caption timings live in `CAPS` in `index.html` as fractions of the film's own
running time: DNA on the helix (0.055–0.215), BLOOD on the red body with the
skeleton inside it (0.260–0.405), SKIN on the surfaces (0.440–0.675). The last
third runs clean with no type at all. **Re-cut the source and these must be
re-checked.** The roman-numeral rail is driven by the same scrub, not by
section intersection.

Frames, not `<video>`: seeking a video on every scroll event stutters badly on
mobile, which is where this site is mostly read. A phone gets its own 640px set
(`assets/reel-sm/`) — 170 frames held at 1000px is ~364 MB of bitmap, which a
phone evicts, turning the scrub into a slideshow.

**Removed 2026-08-16, on purpose — do not put them back without being asked:**
the curtain preloader (a 0→100 counter announces a slow site), the film-grain
overlay, the roman-numeral rail, the "Scroll" cue, the "Chapter I/II/III"
labels, and the word-by-word text stagger. All of them are the visual signature
of an agency template; the brief was A24 / Apple, which means fewer devices and
more picture. Display type is large and tightly tracked; only the small utility
type keeps wide letter-spacing, and that contrast is the point.

---

## 6. ANIMATION SAFETY RULE — non-negotiable

Every effect on this site is built so **failure degrades to "no animation",
never to "invisible or broken content."** Keep it that way.

- Content is **visible by default in CSS**. JS only *adds* the class that hides
  it right before it starts animating it. Never ship CSS that hides content and
  relies on JS to reveal it.
- The drip section is `height: 0` by default; JS adds `.live` to open the scroll
  runway, so a no-JS visitor never scrolls through empty space.
- The reel and the opening both work without JS: the reel shows its poster frame
  and every caption stays readable, stacked.
- Honour `prefers-reduced-motion: reduce` everywhere.
- Scroll handlers must be `passive` and rAF-throttled.
- **Never use localStorage or sessionStorage.**

Before you commit any new effect, ask: *if JS fails here, what does the visitor
see?* The answer must be "the content, just without motion."

---

## 7. WORKING AGREEMENT

- Explain what you changed and why, briefly. The owner is a director, not a
  full-time developer — no jargon dumps.
- Small, reviewable commits with clear messages.
- Never commit secrets, API keys, or `.env` files.
- Don't refactor or restructure things nobody asked about.
- If something looks wrong or risky, say so plainly rather than quietly working
  around it. Honest pushback is wanted.

---

## 8. OPEN ITEMS

- Homepage reel — **done**. `assets/reel/f-001..170.webp`, 1000px wide, 4.9 MB
  total, one continuous pass over the whole 74.7s master. Frame count is
  declared once as `data-count` on the `.reel` section and read by the scrub;
  if you re-extract, keep the two in sync. The master stays local and
  git-ignored (`assets/*.m4v`) — always re-encode from it, never from the
  delivered frames.
- **Unreferenced after the rebuild, kept for now — ask before deleting:**
  `assets/hero.mp4` (8 MB) and `assets/hero-frames/` (120 webp, 4.6 MB). Both
  belonged to the old scroll-scrub hero. Deleting them would cut ~12.6 MB from
  the deploy; both remain recoverable in git history.
- Video playback could not be verified in the automated browser here — its
  media loader stalls on any local `<video>` even though the files decode
  cleanly and the server serves byte-identical content with working Range
  requests. Layout, act order and line timing were verified; **playback itself
  needs a check on a real machine.**
- Domain `badblood.company` — waiting on nameserver change at Porkbun to
  finish pointing at Cloudflare.
- Videos currently embed from Google Drive on `work.html`. Planned migration to
  Vimeo; when that happens, swap the iframe `src` values only.
