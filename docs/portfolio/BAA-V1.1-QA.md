# BAA v1.1 QA

18 October 2026, Asia/Kuching. Local production preview at `http://127.0.0.1:4173`. No deployment performed. Optional browser tooling remains outside the project dependency graph in `/private/tmp/pace-qa`; Firefox/WebKit use `/private/tmp/pace-browsers`.

## Build and automated verification

- Production build: passed, including TypeScript and five prerendered routes plus static 404. Existing lazy Phaser chunk-size warning remains; no forest dependency was added.
- TypeScript and ESLint: passed.
- Automated suite: **107 passed, zero failed/skipped**, including 23 forest/preference cases.
- `git diff --check`: passed.
- Main client: **213,064 raw bytes / 65,700 gzip bytes**, against the unchanged strict **215,000 raw-byte ceiling**. Baseline 210,554 / 65,050; delta +2,510 raw / +650 gzip. Python `gzip.compress(..., mtime=0)` used for both comparisons. Renderer stays in a separate dynamic chunk; no initial renderer module preload.

Forest tests execute the actual TypeScript through a transpile/VM harness. They cover deterministic grids and canonical identity across resolutions, changed seeds, real glyph/depth/ink data, finite staged generation equivalence/cancellation, clock cadence at 60 Hz, timestamp zero, pause/resume/long gaps, disposal during draw and generation, theme changes, backing limits, visibility, teardown and unavailable Canvas. Preference tests cover persistence, blocked storage, OS priority and subscriptions. Browser evidence is recorded separately rather than inferred from these mocks.

## Existing regressions

The existing PACE Chromium layout suite completed 18 homepage combinations, five route checks and five JavaScript-disabled route checks with no page errors or failed local resources. The existing navigation suite completed 12 commercial direct-fragment/reload journeys at 375/1440 px, source/evidence links, NTM contents, native disclosure/history, no-JS and lazy-route recovery, with zero unexpected errors. These runs precede only the later forest-internal generation scheduling and stronger mobile copy backing; content/navigation code did not change afterward. Full gameplay was not rerun: no game source or behavior changed.

## Rendered-background contrast

`scripts/baa-contrast-qa.mjs` samples actual screenshot backgrounds under semantic hero text, with text temporarily transparent in an isolated browser page. It preserves canvas and button backgrounds, uses real computed foreground/opacity and text-node rectangles, and samples every two pixels including rectangle edges. All six final Chrome cases pass: 390/1440 default light/dark, plus 390 Largest light/dark. Per-case minimum ratios range **4.75:1–8.38:1**; normal text requires 4.5:1 and large text 3:1.

This caught real initial failures behind mobile secondary links and portrait captions. Directional reading backing, solid secondary-button backing and softly backed captions resolved them. A remaining GitHub arrow at 4.44:1 was also corrected by extending the mobile backing across the copy width. Decorative arrows were conservatively included rather than excluded to obtain a pass.

Artifacts: `output/playwright/baa-v1.1/contrast/results.json` and corresponding original/text-hidden PNGs. This is a bounded static rendered-pixel audit, not exhaustive animated-pixel coverage, screen-reader testing or full WCAG certification.

## Performance

Latest final-build isolated local mobile Lighthouse: **94 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**; LCP **2,191.2 ms**, CLS **.00224**, TBT **224.4 ms**. No run warnings. Exact compact values: `BAA-V1.1-LIGHTHOUSE.json`. Full report: `output/playwright/baa-v1.1/lighthouse-complete.json`.

The preceding isolated contact-integrated run scored **99/100/100/100**, LCP 1,985.5 ms, CLS .00224, TBT 9 ms (`lighthouse-final.json`). Final-build long-task attribution names the main portfolio bundle/document, with no forest-renderer long task in the reported list. This is evidence of variation, not proof that scenery has zero impact. The latest score is retained rather than replaced by the best sample; a repeatable performance improvement or unchanged score is not claimed.
Fresh pre-change baseline: 97/100/100/100, LCP about 2.3 s, CLS .00224, TBT 8 ms. Historical PACE record was 99/100/100/100, LCP about 1.8 s, CLS 0. These single laboratory samples do not establish a repeatable improvement or field Core Web Vitals.

Two preliminary measurements under concurrent audits scored 58 and 77 with substantial blocking. Scene generation was subsequently split into finite terrain/crown batches, caches remain staged by layer, and a CPU-heavy QA PNG assertion was replaced with a bounded raw-canvas comparison. The final isolated run is a separate sample; earlier reports remain retained and are not represented as passes. Timers alone are not FPS measurements.

## Artifacts and visual review

Baseline: `output/playwright/baa-v1.1/before/`. Static iterations: `static/`. Interrupted/mixed-build browser artifacts: `preliminary-chromium/`, explicitly not complete final passes. Final engine-specific results and portrait comparison are recorded below after completed browser execution.

The owner rejected the initial light version as dirty and clarified that density meant tighter spacing between characters. Tracking is now .82 and nominal leading .78, with measured font advance, stronger blue-gray/green light palette, clearer negative space behind copy and preserved landscape geometry. Actual desktop/mobile dark/light screenshots were inspected during refinement.

## Boundaries

No physical-device or actual screen-reader certification. Browser engines are not shipping Safari/iOS-device testing. Background-tab handling is unit-tested through Page Visibility state; offscreen suspension and runtime media changes are exercised in real browser checks. No production deployment or real-user performance measurement. Canvas draw-call timing excludes GPU completion and does not equal full frame latency or heap usage.

## Forest browser method and portrait comparison

`scripts/baa-qa.mjs` compares the canvas's own `toDataURL()` before/after a pause, alongside a fixed painted-frame count. This verifies raw forest pixels independently of existing CSS animation beneath the transparent canvas. Theme testing checks a changed raw palette with unchanged terrain signature. A composed element screenshot was unsuitable for this assertion because it includes underlying page animation; the preliminary desktop failure is not presented as a forest-pause failure or a pass.

The completed focused Chromium behavior run is in `output/playwright/baa-v1.1/behavior-chromium/`: two viewport lifecycle journeys (390/1440), two intentional renderer/Canvas failures, two no-JavaScript journeys and two actual DOM portrait comparisons, with zero page errors. Active samples painted 132 frames over 5.270 s at 390 px (25.05 FPS), and 131 over 5.184 s at 1440 px (25.27 FPS). State-change paints are included; the interval includes brief UI activation/deactivation, so these are approximate observed paint rates. Mean JS draw-call cost was .910/.624 ms; maxima 2.4/3.4 ms. Initialization work was 24/12.4 ms with maximum staged slices 5/1.5 ms. These are local synthetic samples, not physical-device measurements.

Actual candidate A/B screenshots were inspected at 1440 and 390 px. Candidate A retains the smaller portrait; candidate B moves the real portrait node into About only in an isolated QA page, then restores it. A is recommended: it keeps a recognizable professional identity and balances the desktop right column while leaving the mountain peak visible. B exposes more trees, but the right column loses its focal point and the unstyled About relocation adds an awkward third grid item. Mobile first-view captures are similar because the retained portrait already sits below the introduction; the recommendation does not depend on hiding professional text. Production retains A.

## Completed hero browser matrix

Chromium, Firefox and WebKit each completed `scripts/baa-qa.mjs` against the reviewed hero build: **24 layout/theme/text combinations per engine, 72 total**, with zero detected axe violations and zero page errors. Viewports: 320×568, 375×667, 390×844, 430×932, 768×1024, 1024×768, 1280×720, 1440×900, 1920×1080, 3840×2160. Light/dark at every size; Largest adds both themes at 320 and 1440. Axe still lists incomplete color-contrast checks; the separate rendered-background audit above provides bounded contrast evidence.

All three engines also passed two actual animation/preference/offscreen journeys, two forced renderer/Canvas fallback journeys, two no-JavaScript content/navigation journeys and two QA-only portrait relocation comparisons. Raw canvas pause pixels, saved pause after reload, changed theme palette/stable terrain identity, runtime reduced motion and independent offscreen/reentry were actually exercised. Artifacts and fresh completion results: `output/playwright/baa-v1.1/{chromium,firefox,webkit}/results.json`, screenshots and `metrics.json`. These full engine runs overlapped on one host; their paint-rate samples describe that load and are distinct from the isolated focused samples above.

These hero runs precede the subsequent Contact aerial-river addition. Contact integration and its final shared-renderer verification are recorded separately.

## Contact aerial-river browser verification

`scripts/baa-contact-qa.mjs` completed in Chromium, Firefox and WebKit after the Contact addition. Each engine passed **12 Contact combinations**: 320/390/1440 widths × light/dark × default/Largest, **36 total**, with no horizontal overflow, usable booking/email controls, decorative-canvas semantics, positive glyph-grid data and zero detected Contact axe violations. Incomplete checks remain recorded in each results file.

All three engines passed shared scenery pause/resume, unchanged raw river pixels while paused, runtime reduced motion and independent offscreen switching between hero and Contact. Four scroll samples per engine showed nondecreasing branch progress and complete branches at the reachable document end: Chromium .337→1→1→1; Firefox .712→1→1→1; WebKit .332→1→1→1. These samples establish growth/completion, not an exact zero-valued initial frame: the test first initializes Contact, returns toward entry and samples after 250 ms of existing scroll-controller settling.

Actual Contact desktop light and mobile dark screenshots, plus entry/final branch frames, were inspected. Desktop presents a recognizable aerial channel and forest banks; protected copy remains readable. Mobile keeps scenery subdued behind the introduction and exposes more river beneath the copy. Artifacts: `output/playwright/baa-v1.1/contact-{chromium,firefox,webkit}/results.json`, twelve layout captures per engine and `river-scroll-{0..3}.png`. These are browser-engine checks, not physical-device or screen-reader passes.

## Final connected-delta and glyph follow-up

After the owner's final clarification, the Contact artwork uses actual connected glyph water channels with a mirrored delta fan, stronger branch curvature and widening confluences; the abstract overlay is absent. Foliage uses round and varied crown glyphs in place of the repeated x pattern. The earlier full 72-case hero/36-case Contact matrices apply to the immediately preceding scene geometry, not these final curve/glyph pixels.

All three engines then completed a fresh targeted follow-up (`QA_PHASE=behavior node scripts/baa-contact-qa.mjs`): four Contact cases each (390/1440 × light/dark/default), **12 new Contact axe/layout checks total**, plus fresh hero screenshots at the same four combinations in each engine. All passed with zero page errors. Shared pause/resume, raw river pixel freeze, runtime reduced motion and independent hero/Contact offscreen suspension passed again. Final branch samples: Chromium .337→1→1→1; Firefox .688→1→1→1; WebKit .332→1→1→1. The exact initial-zero limitation stated above remains.

Final desktop light/dark river and desktop/mobile hero screenshots were inspected. The river reads as a continuous water channel with attached smaller streams; there is no separate abstract line overlay. The revised round/varied foliage remains distinct from the water and protected semantic copy. Final artifacts: `output/playwright/baa-v1.1/contact-final-{chromium,firefox,webkit}/results.json`, `contact-*.png`, `hero-final-*.png` and four `river-scroll-*.png` frames per engine. Largest/320 full matrices were not repeated for this final glyph/curve-only change; their immediately preceding passing scope is retained above rather than overstated.

## Last river-width/position adjustment

The final owner-requested adjustment narrows the main channel and centers it within the visible right-side artwork, with smaller tributaries retaining their connected confluences. This changed river geometry parameters only; the hero and interaction architecture were unchanged. A final Chromium follow-up passed four Contact combinations (390/1440 × light/dark), raw river pause pixels, shared controls, runtime reduced motion, independent offscreen suspension and scroll growth/completion, with no page errors or detected axe violations. Incomplete color-contrast checks remain recorded.

The final 1440 light screenshot was inspected: the narrower main channel remains recognizable, the tributaries connect to it and copy is readable. Exact final artifacts: `output/playwright/baa-v1.1/contact-centered-chromium/`. Firefox/WebKit and 320/Largest results above concern the immediately preceding curve widths; they were not rerun for this last parameter-only adjustment.

## Natural tributary confluences — final geometry

The owner rejected right-angle/crisscross branches. This intermediate geometry replaced the prior branch equations with four separate cubic Bézier catchments at staggered joins, aligning endpoint tangents with the main river. Chromium then passed four fresh 390/1440 light/dark Contact axe/layout checks and all shared pause/raw-pixel, runtime reduced-motion, offscreen and scroll-completion checks with zero page errors. Final 1440 light/dark screenshots were inspected: branches approach the main channel along curves without visible channel crossings or right-angle elbows.

Final geometry artifacts supersede the earlier centered-river visual captures: `output/playwright/baa-v1.1/contact-natural-chromium/`. The broader previous three-engine and Largest/320 matrices remain scoped to their recorded earlier geometries; only this targeted Chromium follow-up was rerun for the final Bézier geometry.

## Final stronger meanders

The final geometry-only adjustment strengthens the main river's S bends and the feeders' winding approaches. Chromium repeated the four 390/1440 light/dark Contact cases and all shared pause/raw-canvas, reduced-motion, offscreen and scroll-completion checks: passed, zero page errors. Both final 1440 themes were inspected; the main channel shows clear S meanders and attached curved feeders while semantic copy remains protected.

The final visual/behavior artifact directory is `output/playwright/baa-v1.1/contact-winding-chromium/`. Earlier broader engine/viewport matrices remain explicitly scoped above; they were not repeated for these last curvature parameters. The hero is unchanged by this adjustment.


## Final delivery boundary

The retained version is the stronger winding river; the owner's withdrawn pool comment produced no further change. Final feeders use analytic meanders with side-distance decaying quadratically to zero at the join, preserving the main river's tangent. They are not the intermediate cubic paths described in the earlier verification record. All 107 tests pass, including all-water connectivity and tributary separation. Final Contact sampled contrast passes all six layouts at 5.81:1–8.95:1; final hero contrast passes all six at 4.75:1–8.38:1. No production deployment was performed.

## Symbolism refinement — latest verification

The winding tributaries now gather into a calmer, brighter outlet, with sparse ASCII `^` current cues confined to that outlet. This carries the many-inputs/one-clear-next-step symbolism within the water itself. The stronger meanders remain; the withdrawn pool comment prompted no revision.

The production build, ESLint and all **107 tests** pass. A fresh targeted Chromium run passed four Contact layouts (390/1440 × light/dark), shared scenery preference, raw canvas pause pixels, runtime reduced motion, independent offscreen suspension and scroll completion, with zero page errors. The final desktop light capture was visually inspected. Artifacts: `output/playwright/baa-v1.1/contact-symbolism-chromium/`. Earlier Firefox/WebKit matrices retain their explicitly stated earlier-geometry scope.

The rendered-background Contact contrast audit also passed all six default/Largest combinations at **5.81:1–8.95:1**, with no failing sampled text nodes. These are bounded local browser checks, not physical-device or assistive-technology certification. The current production bundle measures 213,064 raw / 65,700 gzip bytes; the strict 215,000 raw-byte ceiling is unchanged. Lighthouse was not rerun for this river-only refinement; its previously recorded results remain scoped to that earlier build. No deployment was performed.

## Other-page scenes — 19 October 2026

Work with Me, No Two Mondays, PACE-RAG and the Incident Zero landing each now have a distinct seeded forest and river. All **123 tests**, ESLint and the production build pass. Geometry checks cover every page seed at mobile/tablet/desktop quality: uninterrupted main channels, physically attached tributaries, separate catchments and distinct water shapes. Forest and river signatures stay stable across resolutions.

`scripts/baa-pages-qa.mjs` passed **16 Chromium page/layout/theme combinations** (four routes × 390/1440 widths × light/dark), examining both landscapes in each combination. It verifies the actual applied theme, decorative semantics, reduced-motion suspension, complete tributaries, distinct route signatures and absence of horizontal overflow. Axe reported no detected violations in the new landscape regions; incomplete checks, including canvas-related contrast limitations, remain recorded. This is not a rendered-pixel contrast certification.

Additional checks passed shared scenery pause and raw river pixel freeze, four JavaScript-disabled page journeys, eight mobile Largest/theme combinations, and landscape unmounting when Incident Zero opens its interactive preview. The completed run has **zero page errors**. Desktop light/dark and mobile captures were visually reviewed. Artifacts and exact incomplete-check records: `output/playwright/baa-pages/results.json` and adjacent screenshots. The earlier setup attempts used an incorrect theme key/premature DOM access in the QA initialization script; those attempts are superseded by the corrected successful run.

This follow-up used Chromium; earlier Firefox/WebKit results do not certify these new page compositions. No Lighthouse rerun, physical-device test, full gameplay campaign or deployment was performed.

## Portfolio source-code texture — 21 October 2026

All **124 tests**, ESLint and production build pass after replacing canopy/terrain ink with actual portfolio code. The new test verifies that every selected line exists in the allowlisted source files, characters retain source order, water/direction glyphs remain unchanged and tree structural glyphs/negative space are preserved. Existing geometry, lifecycle and page-seed tests continue to pass.

`scripts/baa-source-qa.mjs` passed **20 Chromium combinations**: homepage plus four editorial/landing pages × 390/1440 widths × actual light/dark themes. Both forest and river hosts initialized in every combination, remained decorative, produced unchanged raw canvas pixels under reduced motion, and introduced no horizontal overflow or page errors. Forty screenshots are retained in `output/playwright/baa-source-texture/`; desktop light forest and dark river captures were visually inspected. This targeted texture check does not repeat the earlier full axe, Largest, Firefox/WebKit, contrast or performance matrices, whose recorded scopes remain unchanged. No deployment was performed.

## Selective code restores forest clarity — 21 October 2026

124 tests, lint and production build pass. Added assertions protect distant ridges, crown highlights and most foliage rows, and verify the aerial substitution remains identical. A targeted Chromium check passed eight combinations (homepage/Work with Me × 390/1440 × light/dark), both decorative hosts, reduced-motion raw-pixel stability and no overflow/page errors. All eight new river PNG captures are byte-identical to the previous code-texture captures. The desktop light forest was visually inspected for restored ridgelines and crown/trunk structure. Artifacts: `output/playwright/baa-forest-clarity/`. Other page forests share this revised paint rule; their broader earlier matrices were not rerun.

## Homepage-only richer code canopy — 21 October 2026

125 tests, lint, type checking and production build pass. The new regression verifies actual-source fragments, retained ridge/rim/structural marks, substantially increased code-letter coverage (over three times the selective version in the sampled desktop canopy), and unchanged aerial substitution. Eight targeted Chromium combinations passed (homepage/Work with Me × 390/1440 × light/dark), with ready decorative hosts, raw-pixel freeze under reduced motion, no overflow and zero page errors. All twelve unaffected river/secondary-forest PNGs are byte-identical to the preceding clarity version. Desktop light/dark homepage captures were visually inspected. Artifacts and comparison manifest: `output/playwright/baa-home-code-canopy/`. The other pages retain the accepted selective forest treatment. This targeted trial does not rerun the broader earlier browser/accessibility/performance matrices.

## Unified forests and light-mode remedy — 21 October 2026

125 tests, lint and production build pass. Fresh Chromium verification covers 16 editorial-page combinations (four routes × 390/1440 × light/dark), eight additional mobile Largest combinations, four JavaScript-disabled journeys, shared pause/raw-pixel freeze and removal of scenery on entering Incident Zero. No detected axe violations, horizontal overflow or page errors were recorded; incomplete accessibility checks remain in the results rather than being treated as complete certification. Desktop dark Work with Me and light PACE-RAG forest captures were visually reviewed. Artifacts: `output/playwright/baa-unified-pages/`.

A separate four-combination homepage check passed in both themes and widths. Its two dark forest captures and all four river captures are byte-identical to the accepted rich-code trial; light forest changes are intentional. Artifacts/comparison manifest: `output/playwright/baa-unified-home/`. The other pages retain distinct seeded geometry; their aerial renderer remains unchanged. No blanket pixel-identity assertion is made for every secondary-page whole-region screenshot. Earlier Firefox/WebKit, rendered contrast and performance measurements retain their stated earlier-build scopes. No deployment was performed.
