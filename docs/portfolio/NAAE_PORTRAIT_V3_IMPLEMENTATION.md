# NAAE portrait V3 implementation

Status: **COMPLETE WITH LIMITATIONS**. Local implementation and focused verification completed on 2026-10-23. Individual recognition and photo-level facial fidelity are not established. The broad legacy browser suite remains partial; see verification below.

## Source and root cause

The authoritative input is `public/images/MohdVaraLetters.svg`, SHA256 `ca1566fc68daddb96667c0b1205bcc754b0b62e13196907a6155d27db99750e1`. The owner explicitly instructed “Continue from the SVG.” No original photograph was found. The available illustrated portrait was viewed as a qualitative reference only; none of its pixels enters reconstruction. The original SVG remains unchanged.

This is a saved typography export, not a live photograph-to-glyph converter. It contains 4,632 text elements, 29 distinct strings, a 900 × 972 viewBox and an embedded NAAEMono font. Approximately 128 possible columns and 75 occupied bands constrain available detail. Font sizes span 5.19–11.17 source units; desktop display width is about 330 CSS pixels, with much smaller intentional mobile composition. Small strokes disappear or alias at those scales. Measured letter coverage varies from 0.08965 to 0.20875, so letter-dependent ink and horizontal bands can compete with source anatomy. The former brightness 1.65 / saturation 1.55 treatment clips warm highlights toward yellow. Green forest marks fill the portrait's negative spaces. These are distinct sources of ambiguity; increasing brightness alone cannot restore missing facial samples.

An analytical CSS-fill clipping estimate changes from 56.04% under the old preset to 42.68% under the selected preset. This is a calculation on original fills, not a rendered-pixel result or recognition score. Diagnostics and the pre-change investigation are retained under `output/playwright/naae-portrait-v3/`.

## Pipeline and selected configuration

`scripts/artwork/portrait-v3.mjs` performs deterministic build-time processing. It samples the authored glyph RGB/size field at radii 18, 32 and 72 source units, computes local least-squares luminance gradients, and combines bounded local contrast with mid/broad detail. It does not infer named facial landmarks or invent eyes, lips, expression or hair geometry.

`scripts/artwork/measure-portrait-glyphs.mjs` calibrates the exact embedded font in a development browser. Checked-in `portrait-glyph-metrics.json` records advance, ink bounds, coverage, centroid and stroke orientation for each authored letter in normal, modestly horizontal and modestly vertical forms. Normal builds use these measurements without browser, ML or network dependencies. A source-font hash mismatch requires recalibration.

The structural pass chooses among those forms of the **same authored letter**, penalizing orientation mismatch with the local source gradient. It normalizes letter-specific ink within ±10% scale bounds and introduces small negative-space adjustments in source-supported warm shadow regions. Existing x/y anchors and the complete text stream remain unchanged. Horizontal ink width is bounded to the source cell advance. This is source-field processing, not full reconstruction from original photographic luminance.

Selected preset: integrated strategy; local contrast 0.38; multiscale detail 0.12; density weight 0.40; structure weight 0.55; negative-space weight 0.045; maximum tone delta 0.065; maximum scale change 0.10. Result: 3,564 changed tones, 3,787 changed sizes, maximum channel change 28/255. Variants: 2,574 normal, 1,135 horizontal and 923 vertical. Estimated ink area falls 4.16% (ratio 0.95842); the result is not a global ink boost.

The generated `MohdVaraLetters-refined.svg` remains transparent and text-only. In light mode, a same-colour stroke of at most 0.28 source units adds glyph weight. It is disabled in dark mode and follows the embedding image's colour scheme. Dark CSS uses saturation 1.2 / brightness 1.25; light uses saturation 1.2 / brightness 0.64 / contrast 1.08. No visible panel, face contour, photo, raster shading or solid hair shape is added.

`portraitSeparation.ts` applies cached attenuation to eligible green/olive forest glyphs around an envelope derived from source glyph extents. Selected strength is 0.68, falloff 0.065 portrait widths. Hair attenuation is moderated and the lower shoulder region fades. Signed-distance smoothing avoids a rectangular or circular boundary. Actual fitted image bounds, including object-fit letterboxing, drive placement. Amber, neutral and blue marks are preserved. The algorithm also handles native vertical text runs; it does not mirror Arabic glyphs. No image analysis or distance transform runs per frame.

The pre-existing V1 refiner remains available for reproducibility. The selected build path uses the V3 output; the geometry report's nested `v3` object describes current reconstruction, while older top-level fields describe the retained V1 stage.

## Controlled candidate comparison

| Version | Treatment | Decision |
| --- | --- | --- |
| Original V1 | Original exported letter shapes and earlier global treatment | Preserved reference; weak fine-feature and forest separation |
| A | Bounded multiscale tonal treatment only | More controlled tones; does not address letter-dependent density |
| B | Calibrated density, same-letter shape variants and negative space | Reduces uneven ink; retains original tonal ambiguity |
| C | A + B, integrated separation | Selected conservative V3 strategy |
| Selected V3 | C with compact equivalent SVG serialization and selected theme/separation presets | Production asset, verified from the final build |

Candidate captures use matched DPR 1, viewport, locale, reduced motion, fonts, source and scene state. The original pre-refinement reference remains in `naae-portrait-refinement-v1/baseline-complete/`; the immediate pre-V3 refined baseline and its configuration are preserved in `naae-portrait-v3/baseline/`. The comparison gallery includes original V1, A, B, C and selected V3; it is ignored QA output, not a public control. The compact selected serialization preserves candidate geometry within rounding precision.

Compared forest strengths 0.48, 0.68 and 0.82. The selected 0.68 improves separation without the more cleared appearance of 0.82. Compared brighter former treatment and restrained/balanced dark presets; selected balanced 1.25 brightness. Earlier light-mode 0.42/0.30 brightness experiments were rejected as muddy. No golden files were automatically replaced.

## Visual assessment

The head, forehead/hair division and warm facial mass are easier to separate from competing green text. Source-supported nose and cheek transitions remain typographic. The mouth and eye/brow regions remain subtle at actual desktop size and are not reliably individually resolved at thumbnail or mobile size. Jaw and neck remain source-proportioned, with lower shoulders intentionally integrated into the forest. The light-mode glyph weight improves visibility without a dark backing patch. Native-size inspection confirms actual letters and no smooth face layer. These are qualitative inspection findings, not evidence that human participants recognize the individual or that illustrated-reference fidelity has been achieved.

## Verification and performance

- Typecheck, lint, production build/prerender: PASS.
- Full unit/integration suite: **184 passed, 0 failed**; includes deterministic output, source/text/anchor preservation, bounded parameters and ink, glyph integrity, theme treatment, separation and geometry checks.
- Focused final-build captures: **13 cases**, widths 320, 390, 768, 1024, 1440, 1920, 2560 and 3840; English dark/light, Arabic RTL, Tamil, Japanese horizontal/vertical. Zero overflow or page errors; complete artwork textures. One final case required a hydration reload; prior attempts and retries are retained in the evidence.
- Separate eleven-locale homepage matrix: **88 layouts passed**, with zero overflow or page errors; four locales required one startup reload. Covers eight widths per locale, correct direction, source portrait and English-original links.
- Home flows: six checks passed, zero page errors. Contact CTA, keyboard navigation, mobile work menu and Escape, live Arabic switching, English-only assistant semantics and English-original return. No email, booking or assistant question submitted.
- The required existing `scripts/i18n-qa.mjs` was attempted. A QA-only copy with fresh requests/readiness recovery passed 48 layouts through Simplified Chinese, then stopped at the existing `.pace-starters button` assertion before Spanish. Earlier attempts also encountered startup readiness timeouts. Assertions were not weakened. This broad legacy suite is **PARTIAL**, not passed; the separate matrix covers the portrait scope directly.
- Localization validation: zero errors, 97 retained editorial warnings. Strict coverage: all eleven locales, 1,488 units, zero missing/stale. No professional translation edits were needed for this portrait change.
- Static route/SEO/internal fragment audit: **108 routes, 0 issues**.
- axe: zero reported violations in both English themes, **19 incomplete colour-contrast checks per theme**. This is not complete WCAG, physical-device or screen-reader certification.
- Entry: **214,359 raw bytes**, 65,541 gzip, under unchanged 215,000 budget. Same raw size as immediate V1 refinement baseline; eight bytes above the earlier original baseline. Lazy forest renderer: 49.80 kB raw / 20.05 kB gzip, versus immediate V1 49.07 / 19.68. Chunk regrouping is not a total-load reduction.
- Generated SVG: 1,600,107 bytes, versus source 1,452,097 (+10.2%) and immediate V1 derived asset 1,567,782 (+2.1%). One portrait resource observed in home-flow checks.
- Single build-time measurement: 199.633 ms; heap 6,320,560 → 16,340,032 bytes; process max RSS 79,312 KiB including Node/font/source strings, not isolated peak analysis memory.
- Observed normal-motion paint averages: dark 0.378 ms across 51 frames; light 0.388 ms across 26 frames. Reduced-motion scenes report paused. These are local samples, not a comparative speedup. Detailed texture/initialization costs and geometry rebuilds are retained per capture, including a 53.8 ms maximum initialization slice in one case; this work does not establish a universal no-long-task guarantee.

## Evidence and safety

All 13 final comparisons retain identical copy and portrait bounds and scene signature. Twelve have zero changed pixels outside the portrait rectangle plus 30 pixels. Japanese vertical mode has 33,125 residual changed pixels outside that region, 522 over ten channel levels, maximum delta 18/255. Its bounds are unchanged; this residual raster/compositing difference was not resolved to a unique cause, so exact pixel locality is not claimed for that mode.

Primary evidence: `output/playwright/naae-portrait-v3/comparison.html`, `thumbnail-comparison.png`, `selected-native-glyphs.png`, `full-homepage-1440.png`, `after-verified/`, `baseline/`, candidate/preset/separation captures, `locale-matrix.json`, `home-flows.json`, `accessibility-motion.json`, `outside-comparison.json`, source-field diagnostics and `artifact/artifact.json`. Machine-readable hashes/configuration/results are in `verification/naae-portrait-v3.json`.

Only portfolio portrait integration/build/test/report work is included. Owner changes already in the working tree were preserved. No photographic or illustrated underlay, hard facial outline, unrelated repository change, résumé/career-copy edit, analytics change, commit, push, deployment or hosting change was performed. QA images and calibration diagnostics are excluded from production assets. The remaining fine-feature/recognition limits arise from SVG sampling, source font, glyph size and intentional scene composition. A higher-detail authorized source or actual participant review would be required to substantiate stronger fidelity claims.
