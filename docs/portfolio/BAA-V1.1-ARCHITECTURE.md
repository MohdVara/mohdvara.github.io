# BAA v1.1 architecture

BAA adds an optional, full-bleed Canvas 2D rainforest behind the existing homepage hero. React owns mounting and preferences; procedural generation and frame rendering run outside React state. The introduction, links, portrait and navigation remain ordinary HTML. No game engine, WebGL, WASM, image conversion, third-party rendering dependency or photo asset is used by the forest.

## Source map

| File | Responsibility |
| --- | --- |
| `src/AsciiForest/AsciiForestBackdrop.tsx` | Decorative host, deferred import, theme/preference subscriptions and teardown |
| `src/AsciiForest/config.ts` | Scene seed, quality presets, tuning values and quality selection |
| `src/AsciiForest/scene.ts` | Coordinate noise, normalized ridges/crowns and four rasterized character grids |
| `src/AsciiForest/palette.ts` | Four depth palettes per theme, four inks per layer |
| `src/AsciiForest/renderer.ts` | Canvas allocation, cached layers, dynamic glyph drawing, visibility and resize lifecycle |
| `src/AsciiForest/animation.ts` | Injected-clock scheduler, elapsed simulation time, frame limiting and disposal |
| `src/AsciiForest/preference.ts` | Persisted scenery choice and effective OS motion permission |
| `src/AsciiForest/SceneryControl.tsx` | Existing Display panel integration |
| `src/AsciiForest/AsciiForest.css` | Full-bleed placement, directional masks, portrait sizing and forced-color behavior |

## Loading and semantic content

`App.tsx` wraps the existing hero in `.hero-environment`; the backdrop is an absolutely positioned sibling behind the hero. The host is `aria-hidden`, ignores pointer events and cannot capture scrolling or focus. Existing HTML content and prerendering do not depend on the canvas.

The backdrop waits two animation-frame callbacks before importing `renderer.ts`. This separates optional renderer fetching from the initial React render; two callbacks are a scheduling choice, not a guarantee about an observed paint or Largest Contentful Paint. The type-only renderer import does not introduce a runtime renderer dependency into the wrapper.

The existing botanical illustration remains available if the import or renderer fails. CSS reduces its opacity only after the forest host reports `data-ready="true"`. Forced-color mode hides the forest. When JavaScript is unavailable, the prerendered hero and botanical remain.

## Generation and scene identity

`createScene(cols, rows, seed)` returns four real grids. Each grid uses parallel `Uint8Array` channels for glyph index, ink index, depth and motion group. A zero glyph is empty. Depth is the grid's layer index; draw order is back to front.

Seeded coordinate noise avoids a mutable random-number stream. Ridges and tree crowns use normalized coordinates, so a resize changes rasterization density without relocating canonical trees. Layered terrain clears obscured distant glyphs. Crown footprints, branching trunks and irregular lobes also clear underlying glyphs, reducing the accumulation of unrelated characters in one cell. Three foreground emergents occupy deliberate positions toward the right side.

The scene signature hashes the seed and normalized crown positions. It is a useful composition identity across themes and resolutions, not a hash of every glyph, color, configuration setting or rasterized output. A palette change leaves the scene geometry intact. A resize regenerates grids from the same seed.

## Rendering pipeline

1. Measure the host and choose a column preset from its CSS width.
2. Measure Courier New at a reference size, derive the font size for the requested columns and tracking factor, then measure `M` for final cell width. Tracking defaults to 0.82 (clamped 0.75–1); nominal leading defaults to 0.78 (clamped 0.72–1.1), with final row spacing fitted to host height.
3. Clamp rows, then fit row spacing to the actual host height.
4. Allocate one displayed canvas and four detached layer-cache canvases.
5. Generate the four grids, then paint one layer cache per browser animation-frame callback, grouping static glyphs by ink.
6. Retain selected crown glyphs in dynamic arrays with shared motion phases.
7. Composite each cached layer, redraw its moving crown glyphs, and place soft mist between the distant and middle layers.

The implementation caches whole rendered layers, rather than a reusable glyph atlas. Initial construction, resize and theme recoloring stage the four caches across separate animation-frame callbacks. Initial construction and resize also advance a scene generator over separate browser frames: it yields after each terrain layer and every four crowns. The synchronous `createScene` helper drains that same generator for tests and other callers. Each generation slice and individual cache-layer build is still synchronous. Rendering waits for the complete cache set, preventing partial/mixed-theme output. Replacing generation or a cache build cancels its pending callback and releases previous caches. No worker or OffscreenCanvas pipeline is implemented. Staging creates scheduling opportunities, but does not prove that every individual slice is short on every target device.

## Resolution and allocation limits

| Limit | Actual behavior |
| --- | --- |
| Host width below 600 CSS px | 84 columns |
| Host width from 600 to below 1100 CSS px | 128 columns |
| Host width from 1100 CSS px | 176 columns |
| Scene generator input bounds | 40–200 columns; 30–150 rows |
| Tree density | Default 1; clamped to 0.3–1.5, scales base layer counts before rounding; three emergents remain additional |
| Foreground fronds | Default 3 stems per side; clamped to 0–5 and rounded |
| Renderer rows | Height-derived, clamped to 30–150 |
| Device-pixel scale | Minimum of device DPR, 1.5, `1920 / width`, `1100 / height` |
| Backing dimensions | At most approximately 1920 × 1100 per canvas after rounding |
| Resident render canvases | One output plus four layer caches |

The same backing bounds apply to every layer. Old cache dimensions are zeroed when replaced; all dimensions are zeroed on disposal. Character-grid memory is also bounded by the preset and generator clamps. The five-canvas backing-pixel diagnostic describes allocated pixel counts; it is not a browser heap measurement.

## Animation and lifecycle

The scheduler owns at most one continuous animation callback. Its configured paint target is 25 FPS; this is a target, not a measured result. Paint scheduling retains the fractional interval remainder so a 60 Hz callback stream can approach 25 paints per second instead of rounding each paint up to three display frames. Elapsed simulation time advances independently of React and is capped to 80 ms per active callback. Pause and resume reset the previous wall-clock timestamp, excluding suspended time. Timestamp zero is valid.

Continuous rendering requires all of the following: effective scenery permission, hero intersection, a visible document, a complete cache set and a live renderer. Manual pause keeps the static drawing. Visibility transitions and state updates may repaint once while stopped; they do not intentionally maintain a continuous loop. Resize work uses a separately cancellable frame. Paused scenery still requires finite generation slices during initialization/resize and a four-frame cache build during initialization or recoloring; that work is separate from continuous animation.

Fine-pointer movement is read from the hero without intercepting its interactions. Parallax applies only when scenery is enabled and the device matches hover, fine pointer and a minimum width of 761 px. Touch does not need hover to see the composition.

Disposal cancels animation, resize, staged-generation and staged-cache frames, disconnects both observers, removes document and pointer listeners, clears buffers and removes the output canvas. Wrapper teardown also cancels delayed import scheduling and ignores an import that resolves after unmount.

## Preferences and accessibility

`baa-scenery` stores `enabled` or `paused`. With no saved choice, scenery is enabled unless the operating system requests reduced motion. Blocked storage retains an explicit choice in memory for the current page. Same-page custom events, cross-tab storage events and OS motion changes resynchronize subscribers.

`readSceneryPreference()` returns effective animation permission, so OS reduced motion wins even over a saved enabled choice. The Display panel shows Paused with a short explanation and disables the select while reduced motion applies. Turning off the OS preference restores the saved choice; it does not overwrite a manual pause.

The renderer receives effective permission from the integration wrapper; it does not query reduced motion itself. Meaningful content remains semantic HTML. The artwork has no screen-reader narration, interactive controls or keyboard shortcuts.

## Diagnostics and boundaries

The host publishes readiness, running state, quality, composition signature, cell count, estimated backing pixels and renderer paint timing. `initializationMs` accumulates synchronous generation/cache work for the current build, `initializationElapsedMs` measures elapsed cache-build wall time including frame gaps, and `maxInitializationSliceMs` records the largest synchronous generation/cache slice. Elapsed cache timing starts after scene generation; these are diagnostics with distinct scopes, not interchangeable page-load metrics. Paint timing covers synchronous paint calls; it does not measure GPU completion, total frame latency, React work, image loading or page-level responsiveness. Recorded measurements and browser checks belong in the separate QA documents.

Tuning is split between TypeScript generation/render configuration and CSS composition masks. The renderer writes `forestConfig.mask.left`, `.right` and `.bottomStart` into inline host custom properties and applies `forestConfig.opacity` inline. The dark desktop CSS gradient consumes those edge variables. Light desktop uses its own horizontal reveal stops while sharing the bottom-start variable. Mobile and Largest-text styles deliberately replace the desktop gradient with their own fixed vertical composition; the desktop mask controls therefore do not change those alternative masks. Intermediate gradient stops, top fade and mobile/Largest-text distribution remain CSS controls.

The hero copy also has a softly faded page-background backing; caption spans and the secondary action receive local backing. These protect reading contrast independently of the scene palette. The stronger light palette retains visible forest detail toward the right. Actual rendered-background contrast must include these layers; computed CSS background colors alone omit the canvas.

## Contact aerial river

Contact uses a second `AsciiForestBackdrop` with `aerial` enabled. The same renderer selects `generateRiverScene` from `river.ts`, and reuses the four-grid contract, bounded canvas resolution, staged generation/cache work, theme subscriptions, animation permission and cleanup. It is a separate renderer instance, so its visibility and frame scheduling belong to Contact rather than the hero.

The aerial wrapper waits until its host is within a 200 px intersection margin before scheduling the two-frame deferred import/mount sequence. The existing abstract river remains the graceful fallback. Loading the hero renderer earlier can populate the shared module cache, but does not cause the Contact instance to allocate canvases immediately.

River geometry uses normalized map coordinates: a seeded meandering main channel, varying width, inside-bend point bars, a deeper outer-shifted water channel, four dendritic tributaries approaching from both banks and jittered overlapping canopy crowns. Layer 0 contains sparse terrain; layer 1 contains bank/bar marks; layer 2 contains water glyphs `~` and `=`; layer 3 contains shaded surrounding canopy. The water does not use a solid polygon or photograph fill. Water and bank inks are selected separately by the renderer while the forest retains the existing theme palettes. The aerial scene reports empty `crowns`; its signature hashes canonical channel coordinates rather than the perspective forest's crown positions.

The river generator yields after each of its four tributary-mask builds and every twelve scene rows. Selected main-channel cells in spaced row bands receive a shared motion group for subtle current shimmer using the existing wave mechanism. Tributary water outside the main channel uses separate groups 64–67, allowing the renderer to progressively reveal the four feeders without changing canonical geometry; reduced-motion/static presentation retains the completed river. This is deterministic displacement, not random frame-to-frame character substitution. Pause and OS reduced motion retain a static river. Tests verify seed repeatability, resolution-independent signature, all four populated layers, valid water motion and a four-neighbor-connected water path from the top to the bottom at representative resolutions.

The Contact river inherits `--outer-progress` from the existing scroll-motion controller. When animation is enabled, the renderer reads that bounded 0–1 value and reveals tagged tributary cells according to their horizontal reach from the relevant edge. This restores scroll-responsive branching while keeping a stable canonical river. It currently consumes `--outer-progress`; the renderer does not separately read `--merge-progress` or `--final-progress`. Paused/reduced-motion state forces branch progress to 1 so the static artwork is complete.

The old Contact SVG remains in the document as the fallback and is hidden through `.contact:has(.ascii-river[data-ready="true"]) .contact-convergence` only after the aerial renderer reports readiness. No-JavaScript or failed initialization therefore retains that existing graphic. Local page-background backing protects Contact text, links and copy-email controls independently of the river palette. The Contact-specific sampled contrast audit uses `QA_CONTACT=1 node scripts/baa-contrast-qa.mjs`; its artifacts are separate from hero results under `output/playwright/baa-v1.1/contrast-contact`.

The four tributaries are physical water streams in the aerial scene, with banks and water cells joining the main river. They are not abstract convergence lines drawn over the landscape. The four-into-one symbolism is expressed through hydrology: distinct curved streams merge into one continuous channel. Scroll progression grows those same water streams toward their joins; static/reduced-motion mode presents the completed network. A dedicated connectivity regression checks that every tagged tributary cell reaches main-channel water through adjacent water cells, accepting diagonal adjacency at rasterized bends.

The final aerial map is reflected vertically after generation, swapping glyph, ink and motion rows together. It is presented as a delta-like branching water landscape while retaining one clear narrow main river and subordinate connected streams among forest islands. This is a compositional interpretation, not a geospatial reconstruction of a named Borneo delta. The four-into-one relationship remains in the channel network even where the reflected view reads visually as one-into-four. There is no separate abstract line overlay. Scroll growth still reveals the actual tagged water cells; static mode displays the complete network.

The glyph vocabulary replaces lowercase `x` with rounded `o`; neither uppercase nor lowercase X is used. Weighted combinations of `*`, `o`, `+`, `#`, `%` and `@` produce varied foliage rather than a uniform cross pattern. Water retains `~` and `=`. Connectivity checks run against the final reflected grids, including all four tagged channels.

The final narrow-spine composition places the main-channel center at normalized x = `0.70 + 0.105 sin(14y + phase) + 0.025 sin(31y + phase)`, central within the visible artwork beside the protected copy rather than at the center of the full page. Its normalized half-width varies from 0.025 to 0.039. Four smaller tributaries physically feed this dominant channel, preserving the four-into-one motif without an abstract overlay. Tributaries use densely sampled analytic side-offset paths with separate stream/bank masks. Each path follows the winding main centerline with its own smaller S bends; its signed distance from that centerline decays quadratically toward the join. Their staggered pre-reflection join positions are y = 0.26, 0.70, 0.46 and 0.91. The side-distance reaches zero with zero derivative at the endpoint, aligning the joining tangent with the main channel rather than crossing it at a right angle. A 0.045 vertical wiggle is tapered by `16 t² (1-t)²`; a 0.45 oscillation modulates side-distance during the approach, while its `(1-t)²` factor preserves the smooth join. Tapering widths use small normalized radii with minimum raster radii of 0.8 columns and 0.72 rows; dense sampling preserves continuity at low resolution. Vertical reflection, seeded geometry, bank shading, progressive reveal and full static presentation remain in place. The delta-like description refers to the composition; the visual hierarchy is one main river receiving smaller streams.

The four analytic catchments remain separate outside the main channel, avoiding crisscross junctions. Stream and bank masks are generated from `4 × columns` samples per path before the glyph grid is filled. The final vertical reflection preserves the tangent relationship and masks. Geometry tests check physical connections and separation of differently tagged streams; perceived naturalness of the curved junctions still requires visual review.


## Complex problem → clear next step

The Contact artwork now uses an explicit many-to-one visual narrative. Four winding tributaries join the main channel before the final portion of its course. In generation coordinates their joins are at .22, .52, .40 and .65; after vertical reflection the complex catchments sit below a calmer outlet. The pronounced upstream meanders remain. A smoothstep blend from .66 to .88 reduces their amplitude into a gentle course near x=.66, keeping the transition smooth rather than introducing a hard straight segment.

The outlet's central current uses the brightest existing water ink and sparse ASCII `^` marks to indicate upward flow in the reflected view. This is a water-current cue, not an interactive button or separate diagram overlay. Terrain, canopy and water still use the same character-grid renderer and shared motion policy. Paused/reduced-motion presentation shows the complete stream network and direction cue.

Tests check that the outlet course is calmer than the winding catchments, cue glyphs stay in the outlet, all tagged tributaries connect to the main channel, and separate tributaries do not cross outside it. The hero art is unchanged by this refinement.

## Other-page landscapes — 19 October 2026

`PageLandscape` places the existing decorative renderer around introductory and closing content on Work with Me, No Two Mondays, the PACE-RAG case study and the Incident Zero entry. Each route has a stable seed in `config.ts`; forest valley positions, ridge phases and crown fields vary with it. River bend phase and amplitude also vary, so the water geometry differs rather than only its canopy texture. The homepage seed retains its original geometry.

The backdrop passes the seed through lazy renderer initialization and resize regeneration. Canonical signatures remain stable through quality/theme changes. Editorial rivers display their complete connected catchments without relying on the homepage scroll controller; wind/current animation still follows the shared scenery preference, reduced motion and offscreen suspension. The homepage retains its scroll-driven branch reveal.

The wrapper protects text with a background gradient and gives mobile scenery space below the copy. Contained case-study layouts use a full-width background while preserving their content container. Incident Zero unmounts both landscapes when play or preview begins; the System Defence arcade remains unchanged. No raster assets or runtime dependencies were added.

## Forest made from portfolio source — 21 October 2026

`sourceTexture.ts` imports the actual `scene.ts`, `animation.ts` and `config.ts` contents through Vite's `?raw` imports. A fixed selection of printable ASCII code lines supplies the canopy and terrain characters in source order across each row. Lines are read from these explicit public UI files at build time; there is no workspace scan or browser fetch. Updating those files updates the artwork's text on the next build.

The existing deterministic grids remain the shape/ink/motion masks. The renderer substitutes source characters when constructing its static caches and moving-cell lists. Hero trunks/branches retain their directional glyphs; aerial water and banks retain their existing marks. Thus every page uses the new code texture without changing its seed, topography, water connectivity, spacing, theme or motion controls. Spaces within the source remain spaces. The source strings remain in the deferred renderer chunk.

## Forest clarity follow-up — 21 October 2026

The full source fill weakened the forest silhouette. Hero/forest views now retain original distant ridge ink, bright crown edges and two out of every three shaded canopy rows. Source characters appear only in `#`, `%`, `@` shadow cells of layers 2–3 on the remaining row. Directional structural marks stay intact. This balances recognizable trees with small real-code details. The aerial path is unchanged and continues its fuller code canopy.

## Homepage-only code-canopy trial — 21 October 2026

The homepage hero explicitly enables `codeCanopy`; other forest and river instances keep their previous mode. Short verbatim declarations/member expressions extracted from the same public source lines fill most canopy cells. The far ridge layer, maximum-light crown rims and directional trunks/branches retain their original ink. Per-cell opacity compensates for the greater visual weight of letters compared with punctuation. Static cache and moving-cell painting use the same opacity, preserving shared pause/motion behavior. Original seeds, masks, spacing, palettes and geometry are unchanged.

## Shared code canopy and daylight structure — 21 October 2026

`PageLandscape` now enables `codeCanopy` for every forest, retaining each route's seed. Work with Me, No Two Mondays, PACE-RAG and Incident Zero use the same compact-source canopy as the homepage. Aerial instances keep the established river rendering. The earlier homepage-only trial is now extended to these four pages.

Light code forests use `daylightCodeCanopy`: pale sage interiors, softer distant layers and firmer green crown/trunk ink. Original highlight glyphs survive at ink levels 2–3 in light mode, while the code fills quieter interior cells with opacity graded by distance. Dark mode keeps its accepted fragments, palette and weights exactly. Neither theme changes the underlying tree geometry, character spacing or page seed.
