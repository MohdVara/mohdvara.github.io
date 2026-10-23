# Distinct light-mode portrait palette v1

Selected **C: palette + tonal remapping + local sage forest de-emphasis**, implemented and verified locally on 2026-10-23. This supersedes the provisional palette in `NAAE_LIGHTMODE_PORTRAIT_PALETTE_V1.md`. No commit, push or deployment.

## Separate palette family, shared reconstruction

The light portrait uses an ivory/honey/sepia family defined in `scripts/artwork/portrait-light-palette.mjs`. It is not produced by filtering dark-mode amber. The SVG's 4,632 original reconstructed text elements retain their text, positions, size, transforms, stroke widths, font and original dark fill/stroke attributes. Only additional light-mode classes and a media stylesheet assign alternate colours. The embedding image's existing colour scheme selects them. Light CSS filtering is identity; dark mode retains saturation 1.2, brightness 1.25 and contrast 1.

Exact light colour stops (normalized tone → colour):

| Tone | Role | Colour |
| --- | --- | --- |
| 0 | Cocoa shadow | `#482c24` |
| 0.28 | Burnt sienna / sepia shadow | `#85432d` |
| 0.58 | Ochre midtone | `#ae7732` |
| 0.83 | Honey / muted amber | `#d3ad63` |
| 1 | Cream / ivory highlight | `#f3e5c7` |

Cool/dark source regions use a separate warm-brown ramp `#30241f` → `#694733`. This is a source-colour classifier, not anatomical detection: clothing shares some of these dark colours. Source-supported jaw and neck shadows remain in the warm ramp. No new hair, eye, mouth or jaw geometry is drawn.

Source luminance uses 0.2126R + 0.7152G + 0.0722B. Candidate A linearly normalizes luminance over 0–0.82. B/C instead use monotonic source-luminance → palette-tone anchors `(0,0), (.25,.15), (.45,.35), (.63,.57), (.72,.77), (.82,1)`. Quantization uses 48 bins per ramp. This grounds the midtones/shadows while reserving ivory for upper-range samples. Source warm-ink luminance has median 0.624, 75th percentile 0.721 and 98th percentile 0.757; simply raising saturation does not redistribute those tones.

## Candidate comparison

| Candidate | Changes | Inspection and decision |
| --- | --- | --- |
| A | Distinct palette only | Too much facial mass stays near highlights; weaker grounded shadow structure |
| B | A plus monotonic tonal remapping | Stronger honey/ochre mass and brown shadows, with geometry preserved |
| C | B plus 0.18 local sage-grey ink blend | Selected small additional reduction in environmental competition; no stronger silhouette backing needed |

C blends eligible vegetation ink toward `#b4b5a4`, weighted by the existing source-derived silhouette field and bounded to 0–0.25. It is light-only; neutral, blue and amber environmental marks remain protected. The computation is cached with forest layers, including native vertical runs and moving glyph ink. It changes colour rather than removing words, glyphs or density. The same field positions, feather, hair moderation, shoulder fade and responsive fit are retained. White backing stays 93%, black backing 82.5%, hair backing alpha 85–90%, and environmental alpha strength 0.68. No extra mask, panel, outline or visible colour plate is added.

All three variants were actually captured in full-hero and portrait-crop form at 1440 × 900, DPR 1, reduced motion, with the same portrait source, font and deterministic forest scene. A/B/C dark screenshots are pixel-identical to the baseline. The final build's default dark screenshot is also pixel-identical. The light screenshot changes only around the portrait region, with identical copy/portrait bounds and forest signature.

## Visual assessment and evidence

The selected light treatment has a separate honey/ivory highlight family, source-supported sepia shadows, and warm dark hair/clothing regions. The forest remains visible and atmospheric. Portrait, silhouette and text geometry remain unchanged; the light-mode backing is the same one already approved by the owner. No obvious new edge, rectangular patch or detached face was observed in the compared crops and full scenes. Eyes, nose and mouth retain their existing sampled detail; the colour pass does not create missing anatomy. The small mobile portrait remains pale at tiny glyph sizes because antialiasing mixes glyph strokes with the canvas; no increased mobile recognition is claimed.

Evidence: `output/playwright/distinct-light-palette-v1/comparison.html` links matched before/A/B/C dark/light full heroes and crops. Final-default captures are in `selected/`: English dark/light desktop, English light mobile, Arabic RTL light desktop, Japanese vertical light desktop. Source/configuration snapshots remain in `baseline/`; candidates and metadata are saved separately. `selected-comparison.json` records exact dark pixel equivalence and unchanged geometry. Machine-readable results and hashes are in `verification/naae-lightmode-distinct-palette-v1.json`.

## Verification and performance

- Typecheck and lint: PASS.
- Full tests: **189 passed, zero failed**. Final focused portrait tests: **13 passed, zero failed**. Covers exact geometry/dark-attribute preservation, deterministic mapping, tonal ordering, distinct colour endpoints, bounded forest treatment, locality and dark-mode identity.
- Production build/prerender: PASS. Entry **214,359 raw bytes**, 65,538 gzip, below unchanged **215,000-byte** budget.
- Static route/SEO/internal-fragment audit: **108 routes, zero issues**.
- Localization validation: zero errors, 97 retained editorial warnings. Build extraction/coverage: eleven locales, 1,488 units, zero missing/stale. No professional translation or visitor-facing copy changes.
- Eight candidate captures plus five final-default captures: zero overflow/page errors. Direct light-mode eleven-locale alignment matrix: **44 layouts passed** at widths 320/768/1440/1920, with no overflow and field alignment within two pixels; startup retries are recorded in verification. Arabic and Japanese vertical captures use the selected light treatment without mirrored glyphs.
- Existing `scripts/i18n-qa.mjs` attempted for English/Arabic/Tamil/Japanese; **incomplete**, stopped at startup locale-readiness timeout. The separate portrait-scope alignment matrix is reported independently. Readiness recovery is QA-only and does not change application bootstrap.
- Hero axe scans: zero reported violations in both themes; **19 incomplete contrast checks per theme** remain for manual review. Reduced-motion rendering pauses; observed normal-motion average paint costs: dark 0.433 ms (51 frames), light 0.800 ms (26 frames). These local samples are not a comparative speedup or universal performance guarantee.
- Selected SVG: **1,661,924 bytes**, versus immediate provisional baseline 1,662,033 (109 fewer bytes), and original V3 glyph asset 1,600,107 (+61,817). Build-time colour rules add no runtime JavaScript or network inference. Light-only environmental ink adjustment adds cached arithmetic, no new canvas, per-frame analysis or distance transform. Lazy forest renderer is 51,169 raw / 20,170 gzip, versus the preceding backing build 50,410 raw / 19,897 gzip.

No unrelated repository, layout, copy, CTA, navigation, mask geometry, analytics, hosting, commit, push or deployment change. Owner changes already present in the working tree were preserved. Human identity recognition, fluent linguistic review, physical-device coverage and real screen-reader certification were not performed. Appearance remains a visual judgement; small-size feature detail is limited by the original glyph samples and responsive display size.

Subsequent local refinements preserve this palette family and reconstruction: [eye-highlight softening](NAAE_LIGHTMODE_EYE_HIGHLIGHT_REFINEMENT_V1.md) and [light-mode prominence](NAAE_LIGHTMODE_PROMINENCE_REFINEMENT_V1.md). The original comparisons here remain historical evidence.
