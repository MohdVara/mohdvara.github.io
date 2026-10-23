# Light-mode foreground ink reconstruction v2

Selected **source-aware sepia ink mapping (B)**, implemented locally on 2026-10-23. This replaces the previous light-only ivory/honey, eye-sand and shadow-prominence colour passes on the active build path. It does not add environmental suppression. Dark output, portrait geometry, font, narrative, masks, copy and composition are preserved.

## Diagnosis: computed rendering, not declarations alone

The foreground was inspected before implementation in the actual page in both themes. A same-origin object loaded the exact external SVG to expose internal computed glyph styles; the actual `<img>` ancestry, theme, filter, mask, background and separate backing were also recorded. Probe media was dark in dark mode and light in light mode. Full computed values for all 4,632 glyphs and nearest-source samples are retained in `baseline-computed.json` and `selected-computed.json`.

- Actual paper: `#faf8f2`.
- Before and after, every glyph's computed foreground opacity and fill-opacity is **1**. All image ancestors have opacity 1. There are no SVG group opacity reductions. Blend mode is normal.
- Light image filter is identity (`saturate(1) brightness(1) contrast(1)`); dark remains `saturate(1.2) brightness(1.25) contrast(1)`.
- The image mask is opaque over core facial regions, feathering only the far-left crop and lower shoulders. The silhouette backing is below the image; forest alpha does not multiply portrait foreground alpha.
- Theme CSS propagation works. The old light palette genuinely reached the SVG; the washout was not caused by dark fills overriding light fills or an unselected theme stylesheet.

The main cause was an illumination-like light palette mapping much of the face into pale honey/ivory. At roughly 330 CSS px, the 900-unit glyph grid has small antialiased strokes and sparse ink coverage. Fully opaque vector fill does not make a partially covered raster pixel opaque. Hair already had dark source fill but remains thin/sparse at normal scale. The original glyph sizes also encode source brightness; preserving geometry means that density pattern is retained.

| Nearest source region | Before computed RGB | Selected computed RGB | Opaque ink/paper contrast before → after |
| --- | --- | --- | --- |
| Hair | 46,34,28 | 50,38,29 | 14.52 → 13.82 |
| Left eye support | 210,181,131 | 174,124,71 | 1.85 → 3.42 |
| Right eye support | 208,179,128 | 169,119,68 | 1.89 → 3.66 |
| Nose region | 200,161,91 | 144,94,52 | 2.27 → 5.15 |
| Cheek region | 177,132,66 | 124,79,45 | 3.16 → 6.56 |
| Mouth region | 152,101,45 | 106,69,41 | 4.67 → 7.92 |
| Jaw region | 209,175,108 | 157,106,60 | 1.97 → 4.34 |
| Neck region | 113,57,39 | 73,50,34 | 8.54 → 11.22 |

Samples are nearest existing source glyphs, not detected anatomical landmarks. Ratios use computed full-coverage ink against the real paper; antialiased pixels have lower effective contrast. These are not recognition scores or accessibility certification. Hair was already dark and is not falsely reported as having darker computed fill after this change.

## Selected foreground mapping

`scripts/artwork/portrait-paper-ink.mjs` runs at build time directly after the unchanged V3 glyph reconstruction. It replaces the active light-mode colour path rather than stacking another filter over the preceding palette. It emits grouped light-only CSS fill/stroke rules with explicit opacity/fill-opacity 1. The original dark attributes and dark CSS are untouched. The older colour modules remain for reproducing historical QA, but the selected build no longer calls them.

| Normalized ink tone | Opaque sepia |
| --- | --- |
| 0 | Deep brown `#30251c` |
| 0.30 | Shadow brown `#583a26` |
| 0.68 | Umber `#88562f` |
| 1 | Restrained ochre `#bb884f` |

Source luminance is 0.2126R + 0.7152G + 0.0722B. Candidate A linearly normalizes it over 0–0.82. B maps source luminance to ink tone through `(0,0), (.25,.10), (.45,.25), (.63,.48), (.72,.68), (.82,1)`, then quantizes to 64 bins. Cool source regions—existing hair and some clothing—use 42% of the mapped tone range to remain grounded in brown. Warm-source tone ordering remains monotonic; no new facial features, pupil highlights, contour or shading polygons are added.

Every visible foreground glyph has an opaque brown/ochre colour. Paper highlights come through the original spaces between letters and strokes, not newly painted ivory or low-alpha marks. No glyph is removed, resized or made transparent to invent highlights. Meaningful variation remains through the ordered ink ramp and the original glyph density. The existing image-mask fade is preserved as requested; it still softens the lower shoulders.

## Controlled comparison

| Version | Result | Decision |
| --- | --- | --- |
| Existing light baseline | Pale honey/ivory, low eye/nose/jaw ink contrast | Preserved reference |
| A: direct sepia | More deliberate print colour, but less separation of facial planes than B | Not selected |
| B: sepia + source-aware mapping | Clearer warm shadow hierarchy at normal size and in isolation, with readable tonal variation | Selected |
| Optional forest change | Not needed to establish a foreground improvement | Not introduced |

The comparison includes fixed-scene full heroes/crops in both themes, isolated 330px portrait views on actual paper, 165px small-scale views, and a 900 × 972 enlarged glyph image. Mean paper-minus-pixel luminance in a fixed face ROI at 330px is baseline **0.1401**, A **0.1499**, B **0.1670**. This is a measured increase in dark-ink signal, not proof of identity recognition or feature fidelity.

The source-aware version was selected after inspecting the same fixed geometry in isolation and on the existing forest. It reads more like sepia type on paper and retains the atmosphere rather than adding a plate or cutout. Eyes, nose, mouth and jaw retain their source-supported placement and tonal transitions; fine feature recognition remains constrained at small size. Dark candidate captures are pixel-identical to baseline, and the final default dark capture is checked independently. Copy/portrait bounds, forest scene signature, separation settings and backing styles remain identical.

## Verification and evidence

- Typecheck, lint, production build/prerender: PASS. **194 tests passed, zero failed**, including three new actual-build-path ink tests for opaque bounded colours, paper contrast, tonal order, exact raw SVG preservation and deterministic output.
- Static route/SEO/internal-fragment audit: **108 routes, zero issues**.
- Build localization coverage: eleven locales, 1,488 units, zero missing/stale. Validation: zero errors, 97 retained editorial warnings. No visitor copy changes.
- Six matched candidate cases (before/A/B × dark/light), each with full hero and crop. Five final-default captures cover English dark/light desktop, light mobile, Arabic RTL and Japanese vertical. No page errors or overflow in final captures.
- Targeted eleven-locale light-mode alignment matrix: **44 layouts**, widths 320/768/1440/1920, fitted field within two pixels, correct direction and English-original links, no overflow. Initial attempt completed 16 cases before a readiness timeout; the final complete attempt is recorded separately.
- Existing `scripts/i18n-qa.mjs` attempted for en/ar/ta/ja; stopped at startup locale-readiness timeout and is **incomplete**. It is not called passed. The targeted portrait matrix is separate.
- Hero axe scans: zero reported violations, **19 incomplete contrast checks in each theme**. Reduced-motion scenes pause; sampled normal paint averages 0.435 ms dark / 0.492 ms light. These local samples do not establish a speedup or universal performance result.
- Live light→dark UI switching passed while the OS preference stayed dark, with matching image colour scheme, correct filters and no page errors. The first live check used an incorrect QA selector; the corrected run passed.
- One multi-image isolated screenshot attempt timed out after fonts loaded; retrying one asset at a time completed all normal, small and enlarged glyph captures. Failed attempt/script/log are retained.

Entry bundle remains **214,359 raw bytes**, under the unchanged 215,000-byte budget. Generated SVG is **1,661,916 bytes**, down 11,981 from the immediate 1,673,897-byte baseline. The lazy forest chunk is 51,206 raw / 20,176 gzip bytes; exact hashes are in verification. The new colour pass is build-time only, with no new canvas, runtime image analysis, network inference or per-frame work. No scene/background code or attenuation values changed.

Evidence root: `output/playwright/ink-reconstruction-v2/`. Start with `comparison.html`, `DIAGNOSIS.md`, before/selected computed-style reports, `colour-and-raster-measurements.json`, `B-native-glyphs.png`, `selected/`, and the artifact report. Machine-readable verification: `verification/naae-lightmode-ink-reconstruction-v2.json`.

## Limits and safety

This preserves a fixed exported glyph reconstruction; colour cannot recover anatomy absent from its samples or make tiny mobile strokes carry native-size detail. Existing sparse hair/shoulder coverage and mask fade remain. Negative space is preserved, not reconstructed into new highlights. Appearance and human recognition are qualitative; no participant study, physical-device or real screen-reader session was performed. The external-image computed-style probe uses the same SVG loaded as an object, with actual image compositing recorded separately; final screenshots provide the complementary raster evidence.

Original source, mask, glyph text/geometry, professional content, layout, CTAs, navigation and responsive composition remain unchanged. Owner work was preserved. No photographic underlay, raster face shading, new facial outline, panel, halo, extra forest suppression, commit, push, deployment, hosting or analytics change.
