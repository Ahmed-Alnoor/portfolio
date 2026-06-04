# Portfolio — contributor & agent guide

Single-file static site: everything lives in **`index.html`** (inline `<style>` blocks + inline
`<script>` IIFEs). No build step. Pushing to `main` auto-deploys to GitHub Pages via
`.github/workflows/deploy.yml`. Develop on a feature branch; don't push `main` directly.

## Mobile-first rules (KEEP EVERY EDIT PHONE-FRIENDLY)

The site has a desktop "wow" layer (WebGL eclipse, particle canvases, custom cursor) that is
**switched off on phones/tablets** for speed and battery. When you add or change anything, follow these:

1. **Low-graphics flag.** An early `<head>` script sets `window.__LOWFX` (true on
   `(max-width:768px)` or `(pointer:coarse)`) and adds `html.lowfx` / `html.no-webgl`.
   - Any **WebGL / 2D-canvas / `requestAnimationFrame` loop you add MUST be guarded**:
     `if(!window.__LOWFX){ ...start loop... }`, and provide a static CSS fallback.
   - The hero's WebGL eclipse is replaced on mobile by the CSS `#static-sky` element — follow that
     pattern for any new heavy background.

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

6. **Test widths:** 360, 390, 768 (mobile/tablet) and a desktop width. No horizontal scrollbar.

## Optimizing images

```bash
# one-time: npm i sharp   (kept outside the repo)
node /tmp/imgopt/optimize.mjs      # resizes/compresses referenced images in place
```
Delete unused assets — confirm a file is unreferenced first:
`grep -F 'filename.ext' index.html` (ignore matches that are only in comments).

## Local preview

```bash
python3 -m http.server 8000        # then open http://localhost:8000
```
Note: Three.js / GSAP / Google Fonts load from CDNs, so a fully offline environment shows the
mobile/static path only (which is the intended phone experience anyway).
