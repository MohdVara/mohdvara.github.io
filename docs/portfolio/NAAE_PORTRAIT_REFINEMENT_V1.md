# NAAE portrait refinement v1

Status: **COMPLETE WITH LIMITATIONS**. Local implementation; no deployment, commit or push. The artistic assessment below is subjective, not a recognition score.

## Source architecture and baseline

The homepage in `src/App.tsx` uses one external SVG image, `public/images/MohdVaraLetters.svg` (900 × 972), containing 4,632 authored text elements and an embedded licensed font. It is a saved export, not an output of the portfolio's NAAE landscape generator. No original photograph, landmark model or portrait generation program is available in this repository. The supplied SVG is the portrait source of truth and remains byte-for-byte unchanged by this refinement.

`AsciiForestBackdrop.tsx` lazily imports the canvas renderer after the semantic hero paints. `scene.ts` generates seeded terrain; the existing artwork adapter and pinned Unicode engine supply localized, shaped semantic runs. Four canvas layers cache terrain and text, with a smaller list of moving canopy glyphs. The portrait is a separate, responsive HTML image above this canvas. Existing object-fit, lower-edge dissolution, RTL placement, mobile scale and optional CJK typography remain in place.

The previous CSS added a visible polygonal dark plate behind the portrait and used the dark-theme brightness preset in light mode. A globally brighter face did not resolve conflicting green glyphs; on pale paper it washed the lettering out.

Baseline: working tree at `1b66ae1536259ed855d5165f2203937f606f2f97`, including owner changes. Seed 240916, DPR 1, dark theme, reduced motion, loaded fonts. English 1440 × 900 and 1920 × 1080 plus mobile/tablet/large desktop, Arabic desktop, Tamil mobile, Japanese horizontal/vertical captures are in the ignored QA directory. Baseline retries and incomplete attempts are retained separately, never used as selected evidence. See the verification manifest for hashes and paths.

## Implemented refinements

### Local portrait tone and light-theme ink

`scripts/artwork/portrait.mjs` deterministically derives `MohdVaraLetters-refined.svg` and `portraitGeometry.json` during the existing build. Editing the supplied SVG and rebuilding regenerates both. It validates the expected dimensions and transparent glyph-only source rather than accepting a photographic underlay or solid background.

The build-time pass compares existing glyph luminance with neighbouring glyphs within 36 source units. A broad, smoothly weighted face/neck support window applies strength 0.30, bounded to 0–0.50, with maximum luminance delta 0.055 and RGB gain 0.72–1.30. It adjusts 2,434 glyph colours; the actual largest channel change is 23/255. It preserves every character, x/y coordinate, font size, source metadata and licence. It neither creates eye/nose/jaw lines nor claims to recover unavailable photographic features. Dark-theme glyph density is unchanged.

For light mode, the same facial glyphs gain at most 0.28 source units of matching-colour ink around their own letter shapes (maximum allowed 0.40). This is glyph weight, not an outline around the face. It improves ink coverage at the portrait's small display scale without changing character identity or adding a photo. The SVG uses its embedding image's colour scheme; the CSS sets that explicitly for the selected site theme. [Embedded SVG colour-scheme behaviour](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-color-scheme). Older browser behaviour outside the tested Chrome version is not certified.

Retained dark presentation: saturation 1.55, brightness 1.65, contrast 1.0. Light presentation: saturation 1.20, brightness 0.64, contrast 1.08. Further brightness reductions (0.42 and 0.30) were rejected after comparison because they muddied the warm palette without solving thin ink coverage.

### Forest-glyph separation

The old CSS silhouette plate is removed. The precomputation derives a normalized head/shoulder envelope from authored glyph positions in 24-unit rows. `portraitSeparation.ts` measures signed distance to that envelope; a smoothstep field feathers on both sides over 6.5% of portrait width, bounded to 1–15%. The field is aligned to the actual fitted image rectangle, including letterboxing and RTL placement.

Only eligible green/olive forest ink is attenuated. Neutral, amber and blue inks are excluded. Default maximum attenuation is 0.48, clamped to 0–0.65; the hair receives a gentler factor and the lower shoulders fade. Background beyond the influence area is unchanged. Characters are retained, not erased. No visible rectangle, polygon, ring, glow, shadow or raster silhouette is drawn.

The field is evaluated when cached layers are built, including whole native-script runs and vertical SVG text runs. Moving canopy cells reuse cached alpha. No image analysis or distance transform runs per animation frame. Resize, portrait resize, locale and writing-mode/theme updates reuse the existing rebuild lifecycle. The field exists only for a homepage portrait; editorial forests and rivers have no portrait attenuation.

## Candidate comparison

Ignored evidence root: `output/playwright/naae-portrait-refinement-v1/`.

| Candidate | Local tone | Green separation | Assessment |
| --- | --- | --- | --- |
| Baseline | Original export | Prior CSS solid plate | Recognizable plate; light-mode washout |
| A | 0.30 | 0 | Glyph detail alone remains obscured by the forest |
| B | None | 0.48 | Better subject/background organization; local portrait tones remain flatter |
| C, selected | 0.30 | 0.48 | Conservative combined treatment; preserves the environmental texture |
| Light alternatives | Brightness 0.42 / 0.30 | 0.60 | Rejected: muted warm identity; limited benefit |
| Selected light | Brightness 0.64; glyph ink ≤0.28 units | 0.48 | More readable letter coverage without a photographic layer |

Candidate A/B/C comparisons at both desktop sizes are in `candidates-final/`. Selected theme/layout evidence and final paths are enumerated in `verification/naae-portrait-refinement-v1.json`. Diagnostic `density.svg`, `luminance.svg` and `envelope.svg` are QA-only visualizations, not visible production layers.

At full scene scale the combined treatment reads more clearly as a head and shoulders than detail-only. Close inspection shows genuine lettering throughout; facial transitions still depend on the supplied export. The small mobile portrait remains subordinate to professional content. Light mode benefits more from glyph ink coverage than from further darkening. These are visual judgments, not measured recognition improvements.

## Validation and performance

- 180 unit/integration tests pass, including four focused refinement regressions. The existing forest VM loader now supports the generated JSON import; production behaviour is not mocked away.
- Typecheck, lint and production build/prerender pass. Strict localization coverage remains complete for all eleven locales; validation retains 97 editorial warnings and zero errors. No visitor-facing copy was added.
- Focused screenshots cover 320, 390, 768, 1024, 1440, 1920, 2560 and 3840 widths, RTL, Tamil, Japanese and CJK vertical mode; see the manifest for actual records, console errors and overflow.
- The existing locale suite passed 88 homepage layout checks and eleven assistant-boundary checks across two runs. Its shared editorial scenario later fails the Arabic work-with-me left-mask assertion. That route/style is outside this portrait change and was left unchanged; the full suite is therefore **partial**, not passed.
- Automated axe checks on the hero in dark and light themes report zero violations; 19 contrast checks per theme remain incomplete. This is not human screen-reader or physical-device certification.
- Reduced motion stops the forest clock. Normal-motion samples paint 51 frames; local measured averages are recorded in the manifest. No additional per-frame portrait work or canvas backing surfaces were added. Timings are environment-specific samples, not benchmarks.
- Raw entry JavaScript: 214,351 bytes before, 214,359 after; historical 215,000-byte budget unchanged. The field remains in the lazy renderer (approximately 45.60 → 49.07 kB raw; 18.07 → 19.68 kB gzip). The refined SVG replaces the prior single portrait request; no extra portrait requests or inference libraries are needed.
- The generated SVG is approximately 1.57 MB versus 1.45 MB for the supplied export; matching-colour glyph-weight attributes add roughly 8%. The embedded font remains the dominant shared content. The original stays available as the source artifact.
- Desktop pixel comparison keeps hero-copy geometry unchanged. Small antialiasing differences outside the expanded portrait area are reported explicitly, not called zero. Detailed measurements are in the manifest.

## Limitations and safety

The original photo and portrait generator are unavailable. This pass cannot reliably reconstruct or certify eyes, nose, jaw and neck beyond information already represented by the glyph export. No recognition model or arbitrary anatomical outlines were introduced. More aggressive tonal remapping was avoided to preserve likeness and narrative texture.

Some local browser runs intermittently stalled before React's locale-ready marker, also during baseline capture. Final captures record whether a reload was required; SVG decode is awaited again if theme hydration replaces the image. This was not presented as an artistic success or silently marked as a full browser-suite pass.

Professional content, links, translations, PACE-RAG boundaries, landscape geometry/seed, analytics and consent were not changed. Existing owner modifications remain. No standalone NAAE repository changes, photographic overlays, source uploads, commits, pushes or deployments were performed.
