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
work.html       the archive — video showcase
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

1. **Curtain** — black screen, logo, counter 0→100, lifts
2. **Hero** — scroll-scrubbed frame sequence (`assets/hero-frames/`), the three-line
   poem. The visitor drives the film's timeline: scroll down runs it forward,
   scroll up runs it backward. The copy fades out over the first third of the scrub.
3. **Blood drop** — scroll-driven: stretches → snaps → falls → lands
4. **Statement** — "We give ideas a body."
5. **Chapters I / II / III** — DNA, BLOOD, SKIN, with the roman-numeral rail
6. **Doorway** — the single "See the work" CTA
7. **Footer** — closing lines + the poem:
   *Every idea has a structure. / Every structure finds a pulse. / Every pulse deserves a body.*

---

## 6. ANIMATION SAFETY RULE — non-negotiable

Every effect on this site is built so **failure degrades to "no animation",
never to "invisible or broken content."** Keep it that way.

- Content is **visible by default in CSS**. JS only *adds* the class that hides
  it right before it starts animating it. Never ship CSS that hides content and
  relies on JS to reveal it.
- The curtain is created **by JS only** and has a hard timeout — it can never
  trap a visitor on a black screen.
- The drip section is `height: 0` by default; JS adds `.live` to open the scroll
  runway, so a no-JS visitor never scrolls through empty space.
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

- Hero scroll-scrub — **done**. `assets/hero-frames/f-001..120.webp`, 1280x720,
  4.6 MB total, extracted from the 1080p master. Frame count is defined once as
  `COUNT` in the scrub block in `index.html`; if you re-extract, keep the two in
  sync. The master is kept locally but git-ignored (`assets/*.m4v`) — always
  re-encode from it, never from the delivered frames.
- `assets/hero.mp4` — **no longer referenced by any page.** Superseded by the
  frame sequence. Left in the repo for now; safe to delete (it stays recoverable
  in git history at commit `3d5aa9a`).
- Domain `badblood.company` — waiting on nameserver change at Porkbun to
  finish pointing at Cloudflare.
- Videos currently embed from Google Drive on `work.html`. Planned migration to
  Vimeo; when that happens, swap the iframe `src` values only.
