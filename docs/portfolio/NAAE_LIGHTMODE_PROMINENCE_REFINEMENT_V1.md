# Light-mode portrait prominence refinement v1

Selected **B — background attenuation plus local portrait contrast**, implemented locally on 2026-10-23. The concurrent eye refinement uses its smallest colour-only candidate; see `NAAE_LIGHTMODE_EYE_HIGHLIGHT_REFINEMENT_V1.md`.

## Portrait/background balance

The current glyph portrait, distinct ivory/honey/sepia palette, silhouette mask, composition and responsive layout are retained. Light mode gains presence through two small changes:

- Existing silhouette-aware environmental alpha suppression rises from **0.68 to 0.78**, light mode only. White silhouette backing rises from **93% to 96%** maximum opacity. The source-derived envelope, fitted bounds, 18-source-unit edge feather, hair alpha 85–90% and lower-shoulder fade are unchanged. No new backing shape, vignette, halo, panel or glow is introduced.
- Existing face/hair/jaw/neck ink receives up to **12% local shadow anchoring** in light mode. Per-glyph RGB is scaled by `1 − 0.12 × region × shadow`, where region rises from source y=25 to 110 and fades from y=700 to 840; `shadow=clamp((0.84−mappedLuminance)/0.5)`. Bright ivory samples at luminance ≥0.84 are unchanged. This reinforces source-supported shadows without boosting eye highlights, moving glyphs or painting contours.

All processing occurs after the colour palette mapping and before the light-only stylesheet is emitted. Dark SVG attributes and existing dark CSS remain unchanged. No source glyph size, position, transform, font, stroke width or text changes. The current local sage blend stays **0.18**; it is not increased in the selected result. No global forest dimming or desaturation is applied.

## Compared variants

All prominence candidates include the selected softer eye colours, so the prominence comparison isolates the subsequent balance changes.

| Variant | Treatment | Decision |
| --- | --- | --- |
| A | Light-only suppression 0.78 + white backing 0.96 | Forest recedes but portrait tonal structure remains relatively weak |
| B | A plus local shadow anchoring 0.12 | Selected: more grounded hair/face/neck without extra desaturation |
| C | B plus sage blend increase 0.18 → 0.24 | Visually similar at homepage scale; extra forest flattening was unnecessary |

The stronger background treatment remains feathered and local to the same silhouette; the forest stays visible through the backing and gaps between portrait letters. Native crops and full-hero comparison show no new hard edge, rectangular patch, glow or detached illustration. The effect is deliberately moderate; equal subjective prominence to dark mode is not asserted. Fine eyes/nose/mouth retain their original sampled geometry and source expression.

## Evidence and verification

Ignored evidence: `output/playwright/light-prominence-v1/comparison.html`, candidate SVGs/configurations, before/A/B/C dark/light full heroes and crops, `selected/` final-default captures, `selected-comparison.json`, `locale-matrix.json`, accessibility/motion and artifact reports. Eye-only evidence remains separately preserved. All captures use DPR 1, reduced motion, matched source/font and deterministic scene seed.

- **191 tests passed, zero failed.** Typecheck, lint, production build/prerender: PASS.
- Eight prominence candidate cases plus eight eye candidate cases, each with hero/crop images. All candidate dark screenshots are pixel-identical to their respective baselines. Final combined dark screenshot is also checked against the unchanged baseline; exact results are recorded in verification.
- Five final-default captures: English dark/light desktop, English light mobile, Arabic RTL light desktop and Japanese vertical light desktop. No overflow/page errors. Silhouette placement remains aligned and glyphs unmirrored.
- **44 targeted light-mode layouts across eleven locales passed**, with no page errors/overflow and fitted field alignment within two pixels; startup recovery results are recorded in `verification/naae-lightmode-prominence-refinement-v1.json`. Widths 320, 768, 1440 and 1920; verifies actual fitted portrait bounds within two pixels, direction, English-original links and no overflow.
- Route/SEO/internal-fragment audit: 108 routes, zero issues. Build localization coverage: eleven locales × 1,488 units, zero missing/stale. Validation: zero errors, 97 retained editorial warnings. No visitor copy or translations changed.
- axe hero scans reported zero violations and 19 incomplete colour-contrast checks in each theme. Reduced motion pauses. Sampled normal-motion average paint times were 0.384 ms dark and 0.523 ms light; these are local samples, not a comparative speedup. Entry size is **214,359 raw bytes**, 65,543 gzip. Incomplete contrast checks do not establish full accessibility certification. The broad application locale/browser suite was not rerun for this colour-only change; the portrait-specific matrix is the current browser regression evidence.

## Performance and limits

The shadow and eye colour passes are build-time only. Runtime changes consist of light-only values read when existing forest layers are cached; there is no new canvas, per-frame image analysis, glyph geometry reconstruction or network inference. Extra palette classes increase the generated SVG from the preceding distinct-palette asset's 1,661,924 to **1,673,897 bytes** (+11,973 raw bytes); the original V3 glyph asset was 1,600,107 bytes. The lazy forest chunk is 51,367 raw / 20,284 gzip bytes (+198 raw / +114 gzip versus the preceding distinct-palette build). Exact artifacts are recorded in verification. The 215,000-byte entry budget is unchanged.

At the small mobile portrait size, antialiasing and the existing sparse glyphs still limit contrast and recognizable fine detail. No larger face, heavier font or different layout was introduced to compensate. Human recognizability and equivalent dark/light prominence remain subjective; no participant study, physical-device session or real screen-reader certification was performed. Owner changes were preserved. No commit, push, deployment, hosting or analytics change.

The later [ink reconstruction v2](NAAE_LIGHTMODE_INK_RECONSTRUCTION_V2.md) replaces the foreground colour pipeline after computed-style diagnosis. This report preserves the earlier masking/prominence experiment; v2 retains its background/mask settings without adding suppression.
