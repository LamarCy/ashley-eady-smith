# Ashley Eady Smith — site notes for Claude

Astro 5, zero JS frameworks, vanilla CSS with custom properties. Static output to `dist/`, deployed by Netlify on every push to `main`.

## The rule

**Follow cprice.studio's design language; calls to action are the gateway's sticky notes, never conventional buttons; the signature is the mark.**

- Every CTA is a `<NoteCTA>`. The only exceptions: inline text links (ink or `.textlink`), and the contact form submit (flat ink `.btn`).
- The only glass element is the back-to-top pill.
- Ashley's handwritten signature replaces any monogram: header mark, footer mark, fixed bottom-right medallion, favicon (a simplified loop), and the OG image.
- Placeholder copy carries `<!-- ASHLEY TO REVIEW -->`. Don't invent facts about Ashley.

## Tokens (`src/styles/tokens.css`)

| Token | Value | Use |
|---|---|---|
| `--paper` | `#f4f2ed` | page ground |
| `--off-white` | `#f9f9f7` | panels, footer, inputs |
| `--ink` / `--ink-mid` / `--ink-light` | `#111110` / `#444440` / `#888882` | text; `--ink-light` only for borders/decoration (fails contrast as text) |
| `--rule` | `#d6d3cc` | hairlines between rows |
| `--naples` | `#fbe6a0` | washes, placeholders, hover fills. **Never text.** |
| `--grenadine` | `#f48067` | fills only: pull-quote rule, ident glow. **Never text** (2.3:1). |
| `--porcelain` | `#00908a` | italic headline word (h1/h2 only, large text), callout rule, focus rings |
| `--porcelain-deep` | `#00726d` | small green text: links, mono labels, small italics (5.2:1) |

Palette: Sanzo Wada, *Dictionary of Color Combinations* no. 193.
Type: EB Garamond (400, 500, italic) for headlines and body; DM Mono caps at `0.14em` tracking for eyebrows, metadata, prices, labels. Keep mono at `.76rem` or larger (Lighthouse legibility). h1 `clamp(2.6rem … 5rem)`.

## NoteCTA (`src/components/NoteCTA.astro`)

Copied from the cprice.studio gateway (`public/gateway/` → `public/notes/`).
Props: `href`, `who` (big hand line), `role` (small hand line), `label` (DM Mono caption), `face` (`a`–`d`), `external`.

- `--nw: clamp(120px, 15.5vw, 152px)`; `.eggwrap` is a `--nw` square.
- Photo note: `note-blank-{a..d}.webp` with a double drop-shadow; fallback paper gradient `#f6e9a0 → #e7d678` + curled corner.
- Hand: Rock Salt as `DashHand`, `.who` at `.099 × nw`, `.role` at `.069 × nw`, rotated −2°. Keep each hand line short (about 16 characters max) or it overflows the note.
- Siblings tilt −2.4°, 1.6°, −1°, 2.2°, −1.8° and bob ±8px on 9.5/11/8.4/10.3/9s with negative delays. No bob under reduced motion.
- Hover/focus: deeper shadow + `brightness(1.04)`; focus ring 3px Porcelain Green.
- Rotate faces so neighbours differ. Wrap rows of notes in `.notes` so the nth-child tilt applies.

## SignatureIdent (`src/components/SignatureIdent.astro`)

Only on `/`, only when `sessionStorage.aesIdentSeen` is unset, or always when the URL has `?intro` (the replay link for demos). A head script in `Base.astro` adds `html.ident` (and `html.ident-rm` for reduced motion) before first paint; without that class the overlay is `display:none`, so crawlers and no-JS visitors get the page directly and the hero image paints immediately underneath (LCP unaffected).

**Don't give the overlay element the class `ident`.** `<html>` carries that class, so a `.ident { display:none }` rule hides the whole page. The overlay is `.ident-overlay`.

| Beat | Time | What happens |
|---|---|---|
| 0 | 0–0.3s | paper `#f4f2ed` + four gateway fog spans (radial white, `blur(44px)`, `drift-a/b` 24–36s) |
| 1 | 0.3–2.5s | filled signature path revealed through a `<mask>` holding one stroked centerline (width 110, round caps/joins); `stroke-dashoffset` animates from `getTotalLength()` to 0 over 2.2s, `cubic-bezier(.4,0,.2,1)` |
| 2 | 2.5–2.9s | mask removed (full ink guaranteed); Grenadine radial glow blooms to 18% and fades |
| 3 | 2.9–3.4s | FLIP: big signature translates and scales into `.site-mark img` (140px) while fog and paper fade; hero copy fades up (600ms). Then the overlay is removed and `aesIdentSeen = "1"` is set |

Skip: any pointerdown or keydown jumps to beat 3. Reduced motion: no draw-on and no FLIP; fade in 600ms, hold 400ms, fade out 400ms (about 1.4s).

The centerline lives in `scripts/centerline.mjs` (66 hand-traced points in writing order, Catmull-Rom → cubic Béziers). `node scripts/verify-centerline.mjs out.png` reports ink coverage (currently 100%) and writes an overlay. If the signature art changes, re-trace with `node scripts/trace-signature.mjs`, then re-check coverage.

Brand assets: `npm run brand` regenerates `public/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` and `public/og.jpg` (signature over the sky).

## Content collections (`src/content.config.ts`)

- **clips** `src/content/clips/*.md`: `videoId`, `title?`, `event?`, `year?`, `caption?`, `featured` (bool), `hidden` (bool). At build time `src/lib/clips.ts` fetches the channel feed (`UCNWaQf6xlGaYAOry-ZCb9OA`, @ashleysmith_esq) and merges these files in by `videoId`. Featured clips come first; the top one is the Home clip. If the feed fails, the build logs a warning and uses these files only.
- **art** `src/content/art/*.md`: `title`, `year`, `medium`, `dimensions`, `image?` (path to `src/assets/...`; leave it out for a Naples placeholder), `alt?`, `available` (bool → "Ask about this piece" note linking `/contact?interest=artwork&piece=<slug>`), `order`.
- **music** `src/content/music/*.md`: `title`, `year`, `credits`, `youtubeId?`, `audio?` (path under `public/`, e.g. `/audio/x.mp3`), `cover?`, `buyUrl?` (→ "Own it" note), `order`. YouTube wins over audio when both are set.
- **offers** `src/content/offers/*.md`: `name`, `tagline`, `price` (display string), `format`, `cta_label`, `cta_url`, `kind` (`product|session|retreat`), `order`. The body renders on /shop.

## Layout and imagery

- Hero: `src/assets/sky.jpg` (sunflower, 8/31/26 camera date stamp; keep it visible and keep the photo bright and cool). Full-bleed overlay only at ≥1100px, where the copy column clears the sunflower; stacked below that.
- Portrait: drop `src/assets/portrait.jpg` (or .png/.webp) and `<Portrait>` uses it everywhere; otherwise a 4:5 Naples placeholder.
- Images go through `astro:assets` (WebP, srcset, 1600px max).

## Verify

`npm run build` then `npx astro preview --port 4332`. The Claude browser pane may be hidden, which freezes animations; capture the ident with headless Playwright instead. Lighthouse (mobile) was 95–100 on every page with the ident active.
