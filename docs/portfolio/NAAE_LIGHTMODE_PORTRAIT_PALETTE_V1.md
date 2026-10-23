# Light-mode portrait palette v1

Status: **PARTIAL — implemented; visual selection and production build verification pending** (2026-10-23, Asia/Kuching).

The provisional implementation uses Candidate B, palette plus contrast mapping. This is not a visually verified winner. Dark mode retains every original glyph fill/stroke attribute and its existing CSS filter. All glyph text, x/y coordinates, sizes, transformations, stroke widths, source font and face reconstruction are preserved. No portrait or forest geometry, layout, professional copy, navigation or CTAs were changed.

## Light palette

`scripts/artwork/portrait-light-palette.mjs` runs at build time after V3 reconstruction. It computes source luminance from the reconstructed RGB values, quantizes to 48 tonal bins, and assigns only light-mode CSS classes. A light-only media query changes both fill and stroke to the same mapped colour. The image's existing `color-scheme: light` selects the treatment. The old light-mode saturation/brightness/contrast filter (1.2 / 0.64 / 1.08) is replaced with identity values so it does not distort the explicit palette. Dark CSS remains 1.2 / 1.25 / 1.

Warm source ink maps through brown `#57301f`, ochre `#99551e`, and amber `#c78a29`. Dark/cool source regions map through warm brown `#362820` to `#795335`, reducing blue/grey hair colour in light mode. Source colour is used as the classifier; it does not imply detected hair or facial landmarks, and some clothing shares this mapping. Tone ordering is preserved. Candidate B expands the normalized luminance distance from 0.48 by 1.12 before clamping, providing modest shadow/highlight separation. This colour-only pass does not move or reshape glyphs.

## Prepared candidates

| Candidate | Treatment | Current conclusion |
| --- | --- | --- |
| A | Palette only, identity normalized tone | Valid colour/geometry checks; visual review pending |
| B | Palette plus 1.12 tonal expansion | Provisional implementation; visual review pending |
| C | B plus light-only backing opacity 0.97 and backdrop saturation 0.70 | QA-only CSS prepared; visual review pending |

C uses a masked backdrop colour treatment behind the image, keeping portrait glyphs above it. It is not enabled in production. B preserves the existing white backing at 0.93, hair alpha 0.85–0.90, and environmental attenuation strength 0.68. No claim is made that stronger background treatment improves appearance. None of the candidates has been rejected on visual grounds. A/B each introduce 91/86 palette classes, respectively; B and C share an identical portrait asset. C's additional environmental treatment is in `C-background.css`.

## Evidence and verification

Ignored evidence directory: `output/playwright/light-portrait-palette-v1/`. It contains the exact pre-change SVG and CSS, A/B/C assets, candidate metadata, C background override and `comparison.html`. The HTML shows native colour treatments only, without the complete forest; it cannot establish integration or replace full-hero browser comparisons. No new screenshot captures were completed for this task. Earlier backing-task screenshots are historical evidence only.

- Full tests: **187 passed, 0 failed**.
- Focused portrait tests: **11 passed, 0 failed**. New checks verify deterministic output, exact original SVG preservation after removing only the added classes/media style, bounded palette colours, monotonic tone ordering and warm dark-region mapping.
- Typecheck and lint: PASS.
- Localization validation: zero errors, 97 retained editorial warnings. Build's extraction/coverage phase reported all eleven locales complete, 1,488 units, zero missing/stale; no new visitor text was introduced.
- Production build: **INCOMPLETE**, stopped while loading Vite config with `ERR_SWC_NATIVE_CACHE`. Preprocessing and TypeScript completed; bundling/prerender did not complete. The existing dist is not a verified build of this change. No current entry-size or route-audit pass is claimed.
- Browser visual comparison and dark-mode pixel regression: **NOT RUN**. Automatic approval review rejected the previous escalated capture because workspace credits were exhausted. It was a review failure, not a determination that the action was unsafe. The restriction was not bypassed.

## Performance and limits

Generated selected SVG increases from 1,600,107 to 1,662,033 bytes (+61,926 raw, 3.87%). Grouped colour rules use 86 classes. All computation occurs at build time; no added runtime JavaScript, image analysis, network inference, canvases or per-frame work. Browser CSS/rendering costs and total transferred gzip are not measured. The runtime entry budget remains 215,000 raw bytes; it was not raised, but a completed build is still needed to verify it.

Exact source-attribute preservation supports dark-mode compatibility, but does not prove pixel equivalence. Warm palette attractiveness, facial readability, hair separation, forest atmosphere, theme switching, RTL/vertical/mobile rendering and Candidate C backdrop support still require real browser inspection. No human recognition study or device/screen-reader certification was performed. Owner work was preserved. No commit, push, deployment, hosting or analytics change.

Next required steps after approval service recovery: complete production build; capture before/A/B/C under matched dark/light 1440×900 conditions; inspect native portrait crops and full heroes, then mobile and RTL/vertical; choose the smallest visually effective treatment; refresh bundle/route evidence and this report. Until then the variant choice remains provisional.

The later distinct palette task supersedes this provisional treatment and resolves the earlier build/approval blockers. See [Distinct light-mode portrait palette v1](NAAE_LIGHTMODE_DISTINCT_PALETTE_V1.md) for completed comparisons and current results.
