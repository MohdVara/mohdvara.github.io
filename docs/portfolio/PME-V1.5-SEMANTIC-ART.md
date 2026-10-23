# PME v1.5 — Script-adaptive semantic text art

Status: local implementation; verification results are recorded in `verification/pme-v1.5-semantic-art.json`. No hosting change or deployment is part of this task. Machine translations remain pending qualified review.

## Architecture map and discovery

The application is React 18, TypeScript and Vite 8. Both Cloudflare Pages and GitHub Pages deployment commands exist; this change uses neither. `src/i18n/languages.json` remains the only portfolio locale/profile registry. `Experience` resolves and preserves locale and reading-mode state; `controls.tsx` owns the translation disclosure and original-English action. PACE-RAG's conversation subtree and English-only boundary remain independent of decorative artwork.

The homepage and editorial routes already use `AsciiForestBackdrop`, `PageLandscape`, the seeded `scene.ts`/`river.ts` generators, four cached canvas layers and a 25 FPS scenery controller. Before v1.5, `narrativeField.ts` sampled individual English vocabulary characters into the geometry. `NarrativeAccent` also displayed English material words. Existing timing attributes and bounded backing canvases provided the baseline instrumentation.

The sibling `portfolio-inspired-ascii-art` repository contains NAAE 0.5.0, including its Unicode contract, native browser measurement, vertical calibration, placement algorithm and `NAAE/PME/1` adapter. This implementation vendors that available interface into `vendor/naae-unicode` rather than depending on a relative runtime import from another repository. `UPSTREAM.json` records source hashes and the root-relative hosting-path and revision-keyed font-request patches. NAAE remains responsible for Unicode validation, word-run placement, measurement and vertical SVG construction. PME owns scene selection, locale packs, typography settings, loading, caching, worker transport and compositing. There is no second shaping engine and no dependency on a translation provider in production.

PME v1.4 is partly represented by existing locale fonts, RTL layouts, CJK editorial modes, native title/name columns and display controls; there was no separate comprehensive v1.4 typography-profile subsystem to replace. v1.5 adds artwork settings to those same registry entries. Latin locales retain their current editorial type; Arabic, Hindi and Tamil use zero tracking and whole shaped runs. Per the v1.5 request, Japanese/Chinese use horizontal defaults and retain optional vertical-rl presentation plus saved visitor preferences. This replaces the immediately preceding vertical-default setting; no saved preference is removed.

## Three layers

| Layer | Implementation | Responsibility |
| --- | --- | --- |
| Universal geometry | `AsciiForest/scene.ts`, `river.ts`, `artwork/adapter.ts` | Keep scene seeds, silhouettes, depth and viewport geometry independent of language. Close only short stipple gaps when deriving placement regions. No RTL mirroring. |
| Semantic texture | `artwork/vocabulary.json`, existing locale catalogs/metadata, generated locale packs | 24 material/engineering words and three discoverable phrases, with weights, regions, roles, visibility, tone and priority metadata. |
| Script presentation | NAAE Unicode modules, `artwork/engine.ts`, `layout.worker.ts`, existing canvas renderer | Native font measurement, joined words, calibrated vertical layout, bounded placement and four-layer compositing. |

The vocabulary contains material language such as wind, ridge, leaf, river and root, plus build, design, verify, evidence, learn and preserve. Discoverable phrases include “Build with evidence.” Essential career information is never conveyed only through artwork. Tokens with `role: highlight` become complete, optional embedded phrases; a constrained region may omit one and report it as unplaced rather than truncate it. Regions, roles and weights are passed to NAAE. `visible: false` omits a token. Optional long continuous source passages are not enabled in this runtime integration; word/phrase texture runs are the supported configuration. For full passage reconstruction use NAAE's precomputed export interface.

## Localization maintenance

`i18n:extract` reads the canonical vocabulary into the existing English catalog as stable `artwork.*` keys. Existing `i18n:translate` planning, source hashes and human-review protection therefore apply unchanged. The translation command finishes with artwork synchronization. `npm run artwork:sync` validates all registry locales and writes content-addressed packs; production builds run its strict form. No build performs paid translation calls.

1. Edit `src/artwork/vocabulary.json` and run `npm run i18n:extract`.
2. Synchronize all ten target locales using the existing configured translation workflow, or record accurate assistant-generated provenance when doing the translations locally. Never overwrite a human-reviewed entry merely to clear a stale flag.
3. If new glyphs are needed, regenerate the licensed font subsets using the explicit maintenance command below.
4. Run `npm run artwork:check`, `npm run i18n:validate`, strict coverage and relevant rendering tests.

The sync step never marks missing/stale text complete. It retains the prior pack path only when the geometry revision is compatible, marks the manifest entry incomplete and fails strict builds. The runtime can display that compatible prior pack with `data-texture-status="stale"`; it does not relabel it current. Without a compatible pack, font or worker, the established punctuation geometry remains visible with `fallback` status. It never silently paints English texture for a non-English selection. Asset work has bounded deadlines, and later locale/resize generations discard obsolete results.

Current phrases are machine translated with `development-assistant` / `session-assistant` provenance. Those labels describe how this implementation was produced and do not constitute linguistic review. The visible translated top notice and selector status continue to cover the artwork. Neither disclaimer is embedded into the decorative texture.

## Fonts and NAAE packaging

Font subsets retain OpenType shaping tables and the original SIL OFL licenses. Their manifest records exact bytes, SHA-256, Unicode coverage and upstream font hashes. Only the selected script font and its Latin fallback are loaded. The font coverage check fails a strict artwork build when a vocabulary change requires unsupported glyphs. A system font is not silently substituted for a measured artwork font.

Explicit maintenance commands (not build dependencies):

```sh
node scripts/vendor-naae-unicode.mjs /path/to/portfolio-inspired-ascii-art
/path/to/fonttools-python scripts/artwork/subset-fonts.py /path/to/portfolio-inspired-ascii-art/public/fonts/unicode
npm run artwork:sync
```

The Python environment needs `fontTools` with WOFF2 support. The local validation used the already available `/private/tmp/naae-font-build` environment. Vendoring first copies the original licensed fonts; always run subsetting afterward. All generated JS/declarations, fonts, licenses and packs are checked-in local assets, so ordinary builds and hosting do not require that sibling repository or Python environment. Do not manually edit the copied NAAE shaping implementation.

## Rendering, transitions and cache budgets

The original scene generator still runs incrementally across browser frames. Geometry is retained across language and reading-mode changes; only resized/rethemed scenes require a new field. Browser-native Canvas measurements and NAAE's SVG vertical calibration happen after local fonts are ready. NAAE placement runs in one module worker, leaving the interaction thread available. Complete shaped runs replace local stipple patches; Arabic words and Indic combining sequences are never cut into independently positioned cells. CJK vertical compositions use native SVG writing modes rasterized into the same cached canvas layers.

Placement keys include scene identity, geometry revision/dimensions, locale, text revision, profile revision, measured font revision, writing mode, theme and renderer revision. Packs are fetched lazily by locale, with a six-entry placement LRU. Fonts and packs are shared per document. Four composited layer caches and a transient transition snapshot use the existing capped backing resolution. Artwork is not regenerated per animation frame.

A successful reconstruction crossfades the previous canvas snapshot over 180 ms. Reduced-motion/scenery-paused states switch statically. Offscreen and hidden-page animation remains suspended; disposal cancels scheduled generation, observers and transitions. A late asset response cannot repaint a disposed or superseded landscape.

## Consistent artwork width

Opening forests and ending rivers now share the same full-bleed host width and edge attenuation across the homepage and editorial routes. The previous contact/ending masks made the reading side fully transparent, and the case-study content overlay covered the full left viewport. Both made a full-width canvas appear confined to one side.

The shared mask has nonzero horizontal edge opacity on both sides. Arabic reverses attenuation around the reading column, without flipping geometry or glyphs. Localized copy shields stay around the reading area rather than covering the viewport edge. Mobile uses one common vertical fade. The scene host does not expand the document or create an internal scrollbar. `scripts/artwork-width-qa.mjs` checks both host bounds and identical opening/ending mask values across eight routes. Three engineering case-study routes have an opening landscape only; their existing text-only endings are preserved.

The river follow-up replaces the previously straightened upper reach with a broader S curve and increases the winding of lateral tributaries. Tributaries still meet the main channel tangentially. Geometry remains deterministic, locale-independent and resolution-independent; connectivity and minimum channel width are tested.

## Accessibility and verification boundaries

Landscape canvases and repeated accent words are decorative and `aria-hidden`. They add no glyph-by-glyph accessibility tree. Existing semantic headings, descriptions, links, disclosures, reduced-motion controls, forced-colors fallback and document scrolling remain available. Meaningful NAAE evidence images elsewhere retain their existing textual descriptions; archived original engine exports are not rewritten as localized portfolio scenery.

The QA scripts cover locale packs, missing/stale/reviewed entries, glyph coverage, complete native runs, deterministic geometry, actual render comparisons, all eight requested viewport widths, optional vertical modes, missing assets, scenery state, original English restoration, disclosure preservation and existing PACE-RAG isolation. Fixed-scene pixel comparisons are coarse silhouette checks, not a claim of identical glyph pixels across platforms. Local results do not establish fluent translation quality, physical-device font fidelity or a real screen-reader session. Performance measurements are local Chrome observations, including a before/after baseline; worker memory is not included in Chrome's main-thread heap estimate.


## Changed implementation files

- `src/artwork/{adapter.ts,engine.ts,layout.worker.ts,vocabulary.json}`: NAAE contract adapter, lazy assets, measured worker layout, vocabulary and placement cache.
- `src/AsciiForest/{AsciiForestBackdrop.tsx,renderer.ts,river.ts,AsciiForest.css}`: locale/reading-mode updates, cached shaped-run painting, transition guards, river meanders and common scenery masks.
- `src/NarrativeArtwork/{NarrativeAccent.tsx,NarrativeArtwork.css}`: localized decorative accents and script typography.
- `src/i18n/{languages.json,languages.ts,i18n.css,locales/*.json,status.json}` and `scripts/i18n/{extract.mjs,metadata.json,source-locations.json}`: central artwork profiles, canonical extraction, translations, provenance and coverage.
- `scripts/artwork/{packs.mjs,sync.mjs,subset-fonts.py}`, `scripts/vendor-naae-unicode.mjs`, `vendor/naae-unicode/`, `public/artwork/`, `public/fonts/unicode/`: reproducible local integration assets and explicit maintenance tools.
- `scripts/artwork-{qa,width-qa,fixture-qa}.mjs`, `tests/artwork.test.mjs`, `tests/ascii-forest.test.mjs`, `tests/i18n.test.mjs`: browser and contract/regression checks.
- `AGENTS.md`, `package.json`, `eslint.config.js`, this guide, `PME-V1-{GUIDE,COVERAGE,QA}` and the scoped verification record: maintenance policy, build gates and evidence.

Earlier Incident Zero history/localization fixes and the owner's other interface changes remain in the working tree. No sibling repository, career claim, booking submission, analytics setting or deployment is changed by the artwork work.


## Local measurements and results — 23 October 2026

The full portfolio suite passed 175 tests before the final river follow-up. The artwork contract/font suite passed six tests, and the final scenery suite passed 25 tests after the stronger lateral S bends. TypeScript, ESLint, production build/prerender, strict pack generation, translation coverage/validation and date audit passed. The catalogs contain 1,488 source units, with zero missing or stale translations and 97 retained editorial warnings.

The production artwork matrix passed 88 layouts (11 locales × eight widths), two native CJK vertical presentations, seven locale changes with stable geometry, and three asset-failure scenarios, with zero page errors. The fixed-scene browser fixture confirmed complete vocabulary runs for all 11 scripts, zero clipped runs, and a minimum coarse silhouette intersection-over-union of 0.9959. This measures recognizable occupancy, not linguistic correctness or identical font pixels. The width audit passed 117 hosts across 72 page/locale/viewport combinations, with equal opening/ending masks and full-width bounds. The final existing localization regression passed 88 layouts, nine navigation/preference scenarios and 11 PACE-RAG isolation checks, with zero page errors, translation API requests or missing rendered source units. The final static artifact audit passed 108 routes with zero issues. These broad rendering/width checks preceded the final tributary-path adjustment; its connectivity tests, production rebuild and separate Arabic visual check validate that follow-up.

| 1440 × 900 homepage, local Chrome | Before | After |
| --- | ---: | ---: |
| Entry JS, raw | 209,903 B | 214,415 B |
| Main i18n chunk, raw | 273,745 B | 275,528 B |
| Scenery JS, raw | 27,021 B | approximately 45.6 KB |
| Cold scenery ready, elapsed | 72.90 ms | 369.90 ms |
| Instrumented scene/cache work | 40.00 ms | 36.80 ms |
| Largest instrumented initialization slice | 9.70 ms | 7.40 ms |
| Mean cached frame paint | 1.691 ms | 0.231 ms |
| Main-thread JS heap snapshot | 6,633,206 B | 13,813,517 B |
| Capped canvas backing pixels | 5,824,800 | 5,824,800 |

The final normal-motion sample advanced 50 frames in two seconds, passed pause/resume checks and observed no layout shifts. Three page-wide startup long tasks measured 107, 183 and 108 ms; these are not attributed solely to scenery. The before and after observations are individual local samples with different warm-up duration, rather than a controlled benchmark or a mobile performance guarantee. The viewport/locale stress matrix also observed larger initialization slices under load; one small 1440px slice measurement is not a universal latency bound.

NAAE adds a roughly 12.8 KB raw / 4.9 KB gzip lazy worker. Each selected locale pack is 6.1–8.6 KB raw / 2.1–2.4 KB gzip. Licensed script font subsets range from 12.4 to 35.3 KB, with a 12.6 KB Latin fallback when needed; other locales are not eagerly fetched. Total network payload and cold initialization increase. The entry remains within the unchanged 215,000-byte budget, but chunk splitting is not described as a total-load reduction. Worker heap, browser GPU allocations and physical-device memory are outside the JS heap snapshot.

Detailed evidence, asset hashes and the final existing localization/assistant regression result are recorded in `verification/pme-v1.5-semantic-art.json`. Qualified linguistic review, screen-reader sessions, physical-device rendering and production deployment remain unverified. Runtime continuous prose passages require precomputed NAAE runs; the shipped portfolio scenery uses complete words and short phrases.
