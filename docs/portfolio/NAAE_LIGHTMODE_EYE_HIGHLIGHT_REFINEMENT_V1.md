# Light-mode eye-highlight refinement v1

Selected **A — highlight colour reduction only**, implemented locally on 2026-10-23. The later prominence request was incorporated into the final build; its separate comparison is documented in `NAAE_LIGHTMODE_PROMINENCE_REFINEMENT_V1.md`.

## Adjustment and source support

Native-resolution inspection of the existing SVG identified two small tonal supports around existing eye-area samples: centres `(497,305)` and `(635,314)` in the unchanged 900 × 972 viewBox, with radii `(39,25)` and `(49,25)`. These manually inspected supports are recorded in `scripts/artwork/portrait-eye-highlight.mjs`. They are colour-treatment regions, not detected pupils or newly drawn anatomical geometry. Their edge weighting fades through smoothstep over the outer 30% of each support.

Within these supports only, light-mapped samples at luminance ≥0.69 blend 72% × local support weight toward warm sand `#d1b17c`. Original source colours were pale ivory rather than literal pure white. The selected adjustment reduces their isolation while retaining the surrounding source shadows and all facial feature placement. It changes **23 of 4,632 glyph inks**. All text, positions, transforms, sizes, stroke widths and dark attributes remain unchanged. No photographic/illustrated pixels, pupil circles, outlines, new marks or eye sharpening are added.

Measured within the 71 glyphs whose anchors lie in the tonal supports, maximum mapped luminance changes from 0.8482 to 0.7464; the count at luminance ≥0.78 changes from seven to zero. These are mapped-glyph colour statistics, not rendered-pixel area or human recognition measurements.

## Compared candidates

| Variant | Treatment | Decision |
| --- | --- | --- |
| A | Warm sand highlight compression | Selected smallest sufficient softening |
| B | A plus extra peripheral highlight compression toward `#c5a169` | Additional bright-area reduction offered little benefit at homepage scale |
| C | B plus 5.5% existing warm socket-shadow blend toward `#76503a` | Adds unnecessary shadow manipulation; no clear recognizability benefit |

“Reduced area” means fewer/highly reduced bright tonal samples at the highlight periphery; no glyph is removed or shrunk. B changes the same 23 ink samples more strongly; C changes 40. Neither is used in the final output. The global ivory/honey/sepia palette, light-only sage forest treatment and existing silhouette geometry are preserved by this eye pass.

## Evidence, validation and limits

Eight matched before/A/B/C captures cover dark/light 1440 × 900 full heroes and native portrait crops. `output/playwright/eye-highlight-v1/comparison.html` links them; `baseline/native.png` records the initial 900 × 972 inspection. All candidate dark screenshots are pixel-identical to the eye-task baseline. Final combined-build dark/full-hero/crop and light equivalents are saved under `output/playwright/light-prominence-v1/selected/` and cross-referenced in the verification JSON.

Shared final verification: 191 tests passed, zero failed; typecheck/lint/build/prerender passed; static route audit 108 routes, zero issues. The machine-readable record is `verification/naae-lightmode-eye-highlight-refinement-v1.json`. The separate prominence report includes responsive, accessibility, bundle and final-build evidence.

The supports are manually inspected source coordinates, not biometric landmarks. They remain valid while the source hash/reconstruction is unchanged; a new portrait requires review. Facial readability is a qualitative assessment with no participant study. Fine details remain limited by glyph sampling and display size. No commit, push, deployment or unrelated copy/layout/navigation change.
