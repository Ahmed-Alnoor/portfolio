# Portfolio — contributor & agent guide

Single-file static site: everything lives in **`index.html`** (inline `<style>` blocks + inline
`<script>` IIFEs). No build step. Pushing to `main` auto-deploys to GitHub Pages via
`.github/workflows/deploy.yml`. Develop on a feature branch; don't push `main` directly.

## Mobile-first rules (KEEP EVERY EDIT PHONE-FRIENDLY)

The site has a desktop "wow" layer (WebGL eclipse, particle canvases, custom cursor) that is
**switched off on phones only** for speed and battery. iPads and other large touch tablets are
close enough in size to a laptop to get the full desktop build. When you add or change anything,
follow these:

1. **Low-graphics flag.** An early `<head>` script sets `window.__LOWFX` (true on
   `(max-width:768px)`, or on `(pointer:coarse)` **only when** the viewport's shorter side is
   ≤700px) and adds `html.lowfx` / `html.no-webgl`. That 700px cutoff is deliberate: it sits
   between the widest phone's short side (~430px) and the narrowest iPad's (~744px), so a coarse
   pointer alone no longer demotes a tablet — only an actually phone-sized screen does.
   - Any **WebGL / 2D-canvas / `requestAnimationFrame` loop you add MUST be guarded**:
     `if(!window.__LOWFX){ ...start loop... }`, and provide a static CSS fallback.
   - The hero's WebGL eclipse is replaced on phones by the CSS `#static-sky` element — follow that
     pattern for any new heavy background.
   - Don't reintroduce a bare `(pointer:coarse)` or `(hover:none)` check to gate the desktop
     layer — that catches iPads too. Always go through `window.__LOWFX`.

2. **Sizing tokens.** Use the fluid CSS variables in `:root` instead of new fixed pixels:
   - Type: `--fs-xs … --fs-3xl`, `--fs-title`, `--fs-display` (all `clamp()`; max = desktop value).
   - Space: `--sp-1 … --sp-6`.
   - Never set a fixed width wider than the viewport. `html, body` already use `overflow-x:clip`.

3. **Images.**
   - Add `loading="lazy"` + `decoding="async"` to any below-the-fold `<img>`.
   - Keep source files web-sized (re-run the optimizer below); don't commit multi-MB images.
   - **Layered images** (a background + a foreground over it): give BOTH the same `object-fit`
     and `object-position` so they crop together. See the Capabilities slides — on mobile both
     `.cap-char` and `.cap-bg-img` use `object-fit:cover; object-position:50% 20%`.

4. **Touch.** Don't rely on `:hover` for essential interactions. Mirror hover with a class toggled
   on tap and neutralise sticky hover under `@media(hover:none)` (see `.cert-card.flipped`).
   Tap targets ≥ 44px (see the `@media(pointer:coarse)` block).

5. **Desktop-only flourishes** go behind `@media(min-width:769px)` or `@media(hover:hover)`.

6. **Test widths:** 360, 390, 768 (phone), 810/820/834 (iPad portrait — now desktop build),
   1024–1366 (iPad landscape / desktop). No horizontal scrollbar at any of them.

## Optimizing images

```bash
# one-time: npm i sharp   (kept outside the repo)
node /tmp/imgopt/optimize.mjs      # resizes/compresses referenced images in place
```
Delete unused assets — confirm a file is unreferenced first:
`grep -F 'filename.ext' index.html` (ignore matches that are only in comments).

## Videos (Vimeo-hosted)

The **001.4 — Real Estate Reel** section plays films from Vimeo — **no video bytes live in this
repo**, so don't commit `.mp4`s. Rules for anything video-related:

- **Use the Player SDK, not a bare iframe.** A plain Vimeo/YouTube/Drive iframe is cross-origin
  and cannot tell you when a film ends, which kills the auto-advance. `player.js` +
  `new Vimeo.Player(iframe)` exposes `play` / `pause` / `ended` / `timeupdate`. Drive has no
  equivalent — don't move the clips there.
- **Autoplay needs `muted=1` + `playsinline=1`** in the embed URL, or iOS refuses inline.
- **Never assume a clip's aspect ratio.** Each card sets `--ar` from the film's real ratio
  (`100 ÷ the padding-top %` in the embed snippet Vimeo gives you). Add a new clip → add its
  `--ar`, or the frame will letterbox.
- **Adding a film** = one `<article class="rl-card">` (copy an existing one: swap the video id in
  `data-src` + the `Watch ↗` href, set `--ar`, set `rl-wide` or `rl-tall`) **plus** one more
  `.rl-dot` button. The JS picks up card and dot counts on its own.
- **Keep the three fallbacks working**: a card only drops its `Watch ↗` placeholder once
  `player.ready()` resolves (proof Vimeo actually loaded — don't set `rl-live` just because the
  `src` was assigned, or a blocked Vimeo leaves blank black cards); no `player.js` calls
  `degrade()`, which keeps those placeholders and hides the `.rl-hit` shield so the link is
  clickable; and a refused `play()` shows the tap-to-play glyph. Silently swallowing a rejected
  `play()` freezes the reel.
- **Lazy by default.** Iframes carry `data-src` and only get a real `src` when the section first
  scrolls into view. Don't move that to a plain `src` — it would load four players on every page
  load. Only the centre film ever plays; the rest stay paused, which is what keeps the blur
  affordable on phones.

## Local preview

```bash
python3 -m http.server 8000        # then open http://localhost:8000
```
Note: Three.js / GSAP / Google Fonts load from CDNs, so a fully offline environment shows the
mobile/static path only (which is the intended phone experience anyway).
