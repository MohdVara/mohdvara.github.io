# BAA v1.1 results

18 October 2026, Asia/Kuching. Implemented and prepared for owner review. The implementation is present in commit `940747e`; no deployment was performed during this work.

## Result

The homepage now carries two original ASCII landscapes. The full-bleed hero has layered Borneo-inspired ridges, valley, broad rainforest crowns and emergent trees. Contact has an aerial rainforest river: a narrow main channel near the center of the visible artwork, with four smaller streams curving into it and a calmer, brighter downstream outlet symbolizing one clear next step. The contact network preserves the earlier many-inputs/one-clear-path symbolism through physical water channels and scroll reveal rather than a separate abstract overlay.

The owner’s refinement requests are included: stronger light-theme separation and clean text backing, tighter character spacing, removal of repetitive X glyphs, a reflected delta-like composition, a smaller central river, smaller feeders, and smooth downstream-aligned confluences without crossing streams. The reference photographs were used only as visual references; no photo or external ASCII-city code ships.

## Visual decision and before/after

Before: constrained two-column introduction with a larger portrait and botanical drawing; Contact used a sparse abstract SVG convergence drawing.

After: semantic content and destinations remain, with bounded decorative Canvas 2D backgrounds and smaller retained portrait. Distinct light/dark palettes share canonical geometry. Tracking .82 and nominal leading .78 connect character shapes; weighted `* o + # % @` foliage replaces repeated x texture. Water uses `~` and `=`; banks use punctuation. Directional masks and local text backing preserve hierarchy.

Candidate A was selected after inspecting real desktop/mobile comparisons: keep the portrait at 330 px desktop / 270 px mobile. Candidate B moved it to About in an isolated QA context; it exposed more forest but weakened the hero’s professional focal point and introduced an awkward extra About grid item. The original asset remains intact. Baseline screenshots: `output/playwright/baa-v1.1/before/`; comparison: `behavior-chromium/candidate-{a,b}-*.png`.

## Architecture

A thin React host reads the resolved theme and shared Display preference, then dynamically imports a framework-independent renderer. Contact defers mounting until near the viewport. Seeded generators produce actual glyph/ink/depth/motion typed arrays. Finite generation batches and four cache builds yield between browser frames; continuous painting composites caches and selected moving cells. No per-frame React updates, WebGL, WASM or rendering dependency.

Motion is gated by effective OS preference, manual choice, hero/Contact intersection and Page Visibility. Disposal cancels scheduled generation/cache/animation work, observers and listeners. Static reduced-motion/paused scenery shows the complete composition. The existing botanical and Contact SVG remain graceful fallbacks; meaningful content stays prerendered HTML.

## Files

- `src/App.tsx`: Display control, minimal full-bleed hero/Contact integration; existing copy and destinations retained.
- `src/AsciiForest/AsciiForestBackdrop.tsx`, `AsciiForest.css`: deferred host, full-bleed composition, masks, text backing, portrait adjustment.
- `config.ts`, `palette.ts`, `scene.ts`, `river.ts`: quality/tuning, theme inks, deterministic landscape and connected meandering stream generation.
- `renderer.ts`, `animation.ts`: measured glyph layout, bounded backing canvases, staged caches, frame timing and resource lifecycle.
- `preference.ts`, `SceneryControl.tsx`: shared Animated scenery preference in the existing Display panel, persistence and OS priority.
- `tests/ascii-forest.test.mjs`, `ascii-preference.test.mjs`: deterministic geometry, channel connectivity/separation, no X glyphs, animation/lifecycle/preference coverage.
- `scripts/baa-qa.mjs`, `baa-contact-qa.mjs`, `baa-contrast-qa.mjs`: real browser/layout/behavior/screenshot and rendered-background contrast checks.
- `docs/portfolio/BAA-V1.1-{DESIGN,ARCHITECTURE,QA,RESULTS}.md`, `BAA-V1.1-LIGHTHOUSE.json`: design, tuning, implementation and measured evidence.

All `src/AsciiForest/` shorthand filenames above refer to that directory. Generated browser captures stay in ignored `output/playwright/baa-v1.1/`; no runtime dependency or lockfile changed.

## Validation

Production build and all five prerendered routes plus 404 pass. TypeScript, ESLint and diff checks pass. **107 automated tests pass**, zero failures/skips, including 23 forest/preference tests.

Chromium/Firefox/WebKit completed 72 hero and 36 Contact layout/accessibility combinations and actual motion/preference/offscreen behavior. Fallback/no-JS checks and actual portrait comparisons pass. Later visual-only refinements received targeted checks; the last winding-channel revision was retested in Chromium at mobile/desktop light/dark, not the entire three-engine matrix. QA documents precise version boundaries rather than claiming every earlier capture is final.

Final sampled rendered-background contrast passes 12 cases: hero minimum 4.75:1, Contact minimum 5.81:1. Actual connected-channel tests ensure all tagged tributary water reaches main-channel water and different tributaries do not cross outside the main channel.

Observed focused hero samples were approximately 25 FPS at 390/1440 widths, average synchronous draw cost below 1 ms; samples include state-change paints and exclude GPU completion. Concurrent full-engine runs were slower and remain separately recorded. Final bundle: **213,064 raw bytes / 65,700 gzip**, +2,510/+650 against the PACE baseline, under the unchanged **215,000 raw-byte limit**. The larger forest/river rendering module remains lazy.

Latest final-build Lighthouse was **94/100/100/100**, LCP **2.19 s**, CLS **.00224**, TBT **224 ms**. A preceding isolated sample scored **99/100/100/100**; the fresh baseline scored 97. This variation remains a review limitation; no unchanged performance score is claimed. Exact values are recorded in `BAA-V1.1-LIGHTHOUSE.json` and QA. Preliminary overloaded reports are retained as failed measurements, not hidden or represented as passes. Local lab scores are not field performance.

## Review artifacts

- Hero: `contact-final-chromium/hero-*.png`, `chromium/home-*.png` and equivalent engine directories.
- Current natural river: `contact-winding-chromium/contact-*.png`, `river-scroll-{0..3}.png`.
- Latest direct desktop river review: `contact-light.png`, `contact-dark.png`.
- Reduced motion: static layout captures; actual runtime reduced-motion behavior is in each results JSON.
- Contrast: `contrast/`, `contrast-contact/`, with text-hidden background captures and sample details.

## Readiness and limitations

Ready for local owner review; functional checks pass. The latest Lighthouse performance score is lower than the fresh baseline, despite an earlier99 sample; performance variability remains explicitly documented. Do not deploy without a separate instruction. Existing gameplay was not changed and full playthroughs were not repeated. No physical-device, actual screen-reader or exhaustive WCAG/animated-pixel certification. Mobile prioritizes text: the river is more visible below the copy than behind the headline. The delta is an original composition, not a geographic reconstruction. Font rasterization can differ across engines, and backing pixels are an allocation bound rather than a measured heap value.


## Symbolism refinement

The final Contact scene explicitly gathers complex winding inputs into one quieter outlet. Sparse ASCII current-direction marks and brighter existing water ink guide the eye without a separate schematic overlay. The existing motion preference, scroll reveal, semantic copy and contact destinations are unchanged. Geometry tests and targeted Chromium checks cover this refinement; it is not represented as a rerun of every earlier engine matrix. Current artifacts: `output/playwright/baa-v1.1/contact-symbolism-chromium/`.

## Other-page landscapes — 19 October 2026

Added a forest introduction and aerial river closing scene to Work with Me, No Two Mondays, the PACE-RAG case study and the Incident Zero landing page. Every page has its own stable forest valley/canopy layout and river bend geometry, using the established character density and theme palettes. Text stays protected, mobile has room to show the art below the copy, and the shared scenery/reduced-motion preferences apply throughout. Incident Zero removes the scenery when its interactive experience begins. The homepage composition and System Defence gameplay are unchanged.

Validation: 123 tests, lint and production build passed; 16 Chromium layout/theme combinations, eight mobile Largest combinations, four JavaScript-free journeys, shared pause/raw-pixel freeze and entry-to-game cleanup passed with zero page errors. Exact scope and remaining accessibility limitations are recorded in `BAA-V1.1-QA.md`; screenshots are in `output/playwright/baa-pages/`. This extension is prepared locally for review; no deployment was performed.

## Forests made from the portfolio's own code — 21 October 2026

The forest and aerial canopy now use real source lines from their scene generator, animation clock and configuration, replacing the decorative character selection at paint time. Source characters stay in order along rows and are masked into the existing landscape. Directional trunks/branches and river water keep their readable shapes. This applies to the homepage and all four added page scenes, retaining their distinct geometry and shared display controls.

Validation: 124 tests, lint, production build and 20 Chromium page/viewport/theme combinations passed, with zero page errors. Preview artifacts: `output/playwright/baa-source-texture/`. No deployment was performed.

## Restored forest definition — 21 October 2026

The forest now uses code sparingly inside shaded near-canopy regions, preserving the original ridge silhouettes, bright crown outlines and most foliage texture. This restores the tree shapes while retaining real portfolio code as a detail. River scenes remain unchanged: eight targeted light/dark/mobile/desktop river captures exactly match their previous PNGs. 124 tests, lint, build and eight targeted Chromium combinations pass. No deployment was performed.

## Homepage-only richer code trial — 21 October 2026

The homepage forest now contains more compact real-code expressions across its canopy, retaining original distant ridge ink, bright crown rims and directional tree structure. Letters receive weight compensation to preserve the foliage's tonal hierarchy. Other page forests and all rivers retain their previous treatment. 125 tests, lint, type checking, production build and eight targeted Chromium combinations pass; twelve unaffected comparison screenshots match exactly. Previous forest reference: `output/playwright/baa-forest-clarity/`; this trial: `output/playwright/baa-home-code-canopy/`. No deployment was performed.

## Unified forest treatment and clearer daylight canopy — 21 October 2026

Work with Me, No Two Mondays, PACE-RAG and the Incident Zero landing now share the homepage's code-rich forest treatment while retaining their individual landscapes. Light mode emphasizes crown edges/trunks and softens code-filled interiors with a dedicated sage palette and distance-based ink weight; dark mode retains the accepted rich-code treatment. Rivers retain their existing style and geometry.

125 tests, lint and production build pass. Chromium checks passed 20 default viewport/theme combinations, eight mobile Largest combinations, four JavaScript-free journeys and shared scenery/game-entry lifecycle checks, with zero page errors. The homepage's dark forest and river comparison captures match the prior version exactly. New review captures are in `output/playwright/baa-unified-pages/` and `output/playwright/baa-unified-home/`. No deployment was performed.

## NAAE v0.3 narrative landscape — 21 October 2026

The existing animated forests now use finer, varied NAAE-derived material words and theme-specific greens, wood and earth inks on a single native grid. Distinct page scenes and winding river geometry/motion remain. Light mode has stronger near-canopy and timber definition while distant ridges and the reading area stay quiet. The actual reviewed NAAE v0.3 panorama is available in an optional lazy explorer with region highlights, zoom/pan and all five complete passages, including a no-JavaScript text view. Versioned source configuration, seed, coverage, font license and deterministic regeneration are recorded with the assets.

The homepage desktop hero now fits the available first-screen height at 1440×900, 1900×960 and 1920×1080 by tightening whitespace, title scale and link gaps. Mobile, Largest text and short screens keep natural scrolling instead of clipping. Animation and reading controls are preserved.

Validation: 129 tests pass; lint and production build pass. Chromium's full width/route/lifecycle/fallback matrix, final targeted Chrome/Firefox/WebKit explorer checks, four Largest cases, 14 framing cases and six post-framing rendered-text contrast cases pass. Contrast minima remain at least 4.77:1 in the sampled hero text. Mobile Lighthouse scores 95 Performance / 100 Accessibility / 100 Best Practices / 100 SEO; baseline 97/100/100/100. Main-thread/LCP/TBT costs and point-sample memory limitations are retained in QA rather than presented as a speed improvement. No physical-device, assistive-technology or complete gameplay certification is claimed. See `BAA-V1.1-QA.md` for exact artifact scope and reproducibility, and architecture/design docs for the native adaptation versus complete NAAE export. No staging, commit, push or deployment was performed.

## Shared river art and removal of reading controls — 21 October 2026

The homepage river and rivers on Work with Me, No Two Mondays, PACE-RAG and Incident Zero now use the same finer NAAE-derived material style as their forests. Teal water, warm silt banks, varied canopy marks and occasional landscape words preserve readable channels, existing meanders, tributary connections and animation. Each page retains a different seeded scene.

Removed “Explore the written landscape”, “Read the river passage” and their explorer interface as requested. No replacement reading controls are introduced. Earlier explorer descriptions above are historical; the current site retains the artwork and ordinary portfolio actions.

Final checks: 130 tests, lint and production build pass. All 16 page/theme/viewport combinations, eight mobile Largest cases, four no-JavaScript journeys, four homepage/contact combinations, 14 hero framing cases and shared lifecycle checks pass. WebKit confirms river animation, pause and reduced-motion behavior. Remaining contact text passes six rendered-background contrast cases, minimum 5.82:1. Main client is 210,689 raw bytes, within the existing 215,000-byte limit. Exact scope and intermediate failures are recorded in QA. No staging, commit, push or deployment was performed.
