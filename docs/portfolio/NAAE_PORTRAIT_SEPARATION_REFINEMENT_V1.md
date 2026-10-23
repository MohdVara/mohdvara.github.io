# Portrait separation refinement v1

Implemented locally on 2026-10-23. Selected **opacity-only**, increasing the existing silhouette-field strength from **0.68 to 0.76**, with the same 0.065-width feather. The portrait SVG, glyph colours, narrative, composition, copy, CTAs and navigation are unchanged. No panel, glow, halo, density removal or additional canvas was introduced.

## Field and comparison

The existing normalized envelope comes from the actual portrait glyph extents. It is fitted to the rendered SVG's 900 × 972 aspect ratio, including object-fit letterboxing, and positioned relative to the forest host. Signed distance to this envelope feeds a smoothstep transition. Hair receives moderated attenuation; the lower shoulder region fades back into the forest. Only eligible green/olive environmental ink is affected. Updates are cached on resize/reflow/theme/locale changes; moving glyphs retain their cached alpha.

Three incremental alternatives were captured against the current V3 baseline, using the same source, seed, fonts, DPR 1 and reduced motion:

| Variant | Total field opacity strength | Additional colour treatment | Decision |
| --- | ---: | --- | --- |
| Opacity-only | 0.76 | None | Selected: small visible recession, original ink colours preserved |
| Luminance-only | 0.68 baseline | 0.16 blend toward scene background | Less visible separation in dark mode |
| Hybrid | 0.72 | 0.08 blend toward scene background | No clear benefit over opacity; unnecessary colour adjustment |

“Luminance-only” describes the incremental change over the pre-existing opacity field. Its dark-mode treatment reduces luminance; light mode instead converges toward the light scene background, since darkening green ink would increase competition. Both alternative colour amounts are bounded to 0–0.25 and disabled in the selected preset. Internal comparison variables add no visitor controls.

At full field weight, eligible forest ink retains 24% of its original alpha versus 32% before. This is an eight-percentage-point change, not a new opaque backing. Hair and feathered boundaries retain more forest. Visual inspection of native portrait crops, full heroes and quarter-size thumbnails found no obvious mask edge, rectangular patch, glow or detached portrait. This is a qualitative judgement.

## Validation and impact

- Typecheck, lint, production build/prerender: PASS. Full tests: **185 passed, zero failed**.
- Nine variant captures and six final-default captures: desktop 1440/1920, dark/light, mobile 390, Arabic RTL and Japanese vertical. Zero page errors/overflow; matching copy bounds, portrait bounds and forest signatures.
- Separate eleven-locale alignment matrix: **44 layouts**, widths 320/768/1440/1920. Correct direction, English-original links, no overflow, and cached field position within two pixels of actual fitted image bounds. Final counts/retries are recorded in the verification JSON.
- Existing `scripts/i18n-qa.mjs` attempted for English/Arabic/Tamil/Japanese; stopped at startup locale-readiness timeout. It is not reported as passed. The direct alignment matrix covers this change separately.
- Strict coverage: eleven locales, 1,488 units each, zero missing/stale. Validation: zero errors, 97 retained editorial warnings. Static route audit: **108 routes, zero issues**.
- Entry bundle remains **214,359 bytes**, under the unchanged 215,000 budget. Lazy forest renderer rises **606 raw / 186 gzip bytes**, measured consistently by the artifact audit (49,804 → 50,410 raw; 19,711 → 19,897 gzip).
- No new per-frame field calculation, image analysis, canvas or network dependency. Colour alternatives are cache-time only and short-circuit in the selected preset. Capture paint/texture timings are retained, but concurrent browser startup samples vary substantially (including Japanese vertical texture build 259 → 1,066 ms); they do not establish a speedup or a statistically isolated regression.

Desktop horizontal comparisons have zero changed pixels beyond portrait bounds plus 30 pixels. Mobile is pixel-identical: its forest already contributes little visible competition. Japanese vertical has 26,379 low-level outside-region pixel differences, maximum channel delta 8/255 and none over ten; this raster/compositing variation is retained as a limitation rather than claiming exact pixel locality.

## Evidence and limits

Ignored evidence: `output/playwright/portrait-separation-v1/comparison.html`, `comparison.png`, `baseline/`, `variants/`, `selected/`, `comparison-metrics.json`, `pixel-comparison.json`, `locale-matrix.json`, logs and artifact audit. Machine-readable results and hashes: `verification/naae-portrait-separation-refinement-v1.json`.

The effect is deliberately small and most visible at desktop scale. No participant study or new physical-device/screen-reader certification was performed. The source and refined portrait hashes match the prior V3 artifacts. Owner work was preserved; only this portfolio was changed. No commit, push, deployment, hosting or analytics change was performed.

Current treatment was subsequently clarified by the owner to use a translucent black/white silhouette backing. See [Translucent portrait backing v1](NAAE_PORTRAIT_BACKING_V1.md). This report preserves the earlier opacity-only comparison.
