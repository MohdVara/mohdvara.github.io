# BAA v1.1 design and tuning

The feature gives the portfolio a Borneo-inspired sense of place: receding rainforest ridges, an open valley, broad connected crowns and a few emergent trees. Character marks carry the terrain and vegetation; the result should read as a landscape before it reads as terminal texture. The existing engineering introduction and project navigation retain visual priority.

## Reference interpretation

The user supplied three photographic references. They guide composition and atmosphere, not pixel sampling or image-to-ASCII conversion:

- The first informs layered mountain/valley silhouettes and dense, connected rainforest crowns.
- The second informs warm dawn light and tall trees emerging above the canopy.
- The third informs cool atmospheric distance and separated mist bands.

The shipped forest is original procedural glyph artwork. The reference photographs are not shipped, embedded, traced or used as a canvas texture. The ASCII city reference informed investigation of character rendering; its bundle, visual assets and world code are not dependencies of this implementation.

The current palettes emphasize cool distant haze and moss/olive canopy highlights. There is no time-of-day system or separate sunrise color mode. Warm dawn is an influence on highlight placement and composition, rather than a claim that the current scene reproduces the photograph's colors.

## Landscape composition

Four independent depth grids establish distance. Ridge heights and a valley centered around normalized x = 0.57 form a descending sightline toward the center-right. Canonical crown positions persist across viewport changes. Broad asymmetric crown lobes, visible branching trunks and three deliberate foreground emergents distinguish tropical rainforest from conifers or isolated decorative trees.

The first static pass risked reading as terminal noise. The generation now clears distant glyphs beneath nearer terrain, trunks, branches and crown footprints. Coarser crown texture and directional shading group individual characters into forms. Sparse edge fronds frame the lower boundary. This describes the implementation's visual refinements; final visual acceptance and screenshot comparisons belong in QA.

The forest spans the environment wrapper while the existing hero content keeps its layout. Directional masks suppress detail behind text and reveal more structure toward the right and lower region. The art fades at the top and bottom rather than ending at a conspicuous rectangular panel edge. Largest text receives a stronger vertical reading mask.

## Portrait decision

Candidate A retains the existing illustrated portrait at a smaller maximum width: 330 px on desktop and 270 px at widths up to 760 px. Its saturation is reduced slightly so the surrounding forest can contribute atmosphere without competing with a large illustration. Desktop also supplies a small end margin.

Actual desktop/mobile screenshots of both candidates were inspected. Candidate A is selected: the smaller retained portrait balances the right column and preserves professional identity while leaving the mountain peak and forest visible. Candidate B exposed more trees but lost that focal point; a QA-only About relocation was visually awkward without further unrelated redesign. The original asset, semantic figure, dimensions and alternative text remain intact. Screenshot paths and review limits are recorded in QA.

## Palette and characters

`palette.ts` contains separate light and dark palettes, each with four layers and four inks per layer. Dark mode moves from cool blue-green distance to dark green foreground with muted moss highlights. Light mode uses stronger cool blue-gray distance (`#7894a0`–`#9db3b6`) and increasingly defined green slopes, ending in deep green foreground (`#22482c`–`#466f52`). This gives the light-theme landscape more definition than the earlier pale palette. Both modes share identical generated geometry; changing theme recolors cached layers.

The glyph vocabulary is ASCII: a space, punctuation for sparse texture, plus/letter/star marks for foliage, denser hash/percent/at-sign forms for shaded crowns, and slash/backslash/pipe/exclamation marks for branching structure. Zero-valued grid cells are skipped rather than painted as marks. Courier New is requested with a generic monospace fallback and measured at runtime. No external font download is required by this feature.

Typography uses tighter cell tracking (`0.82`) and nominal leading (`0.78`) to connect glyphs into canopy shapes rather than evenly spaced terminal marks. Tracking multiplies the measured character advance; font size compensates so the requested column count still spans the host. Leading informs the row count, then vertical spacing fits the host height within the row cap. It does not change semantic portfolio typography.

Mist is a translucent radial gradient between depth layers. It is the only continuous-tone atmosphere element; the land and vegetation themselves are constructed from glyphs. There is no photograph backdrop or particle field standing in for the forest.

## Motion language

Selected crown groups share a sinusoidal horizontal displacement, retaining coherent shapes rather than changing random characters. Low-amplitude pointer parallax separates layers on suitable desktop pointers. Mist drifts slowly. Paused and reduced-motion modes retain the composition without wind or pointer displacement.

The current feature does not include fireflies, falling leaves, camera travel or an explorable world. Those effects are not necessary to recognize the landscape and should not be implied by documentation or controls.

## TypeScript tuning controls

Edit `src/AsciiForest/config.ts` and check both themes, mobile and Largest text after visual changes.

| Setting | Current value | Effect and constraints |
| --- | --- | --- |
| `seed` | `240916` | Changes seeded ridge phases, tree placement and texture. Preserve it for a stable identity. |
| `columns` | 84 / 128 / 176 | Mobile/tablet/desktop character density. Breakpoints are in `qualityFor`. More columns generally mean more glyph work. |
| `maxDpr` | `1.5` | Upper backing-pixel scale; width and height caps may reduce scale further. |
| `maxHeight` | `1100` | Backing-canvas height cap, not CSS hero height. Width is separately capped at 1920 in the renderer. |
| `tracking` | `0.82` | Multiplies measured glyph advance, clamped to 0.75–1; font size compensates to retain configured column coverage. |
| `leading` | `0.78` | Nominal cell-height multiplier, clamped to 0.72–1.1. Rows are bounded and spacing fitted to host height. |
| `fps` | `25` | Paint-rate target, not measured performance. |
| `wind` | `1.65` | Maximum sinusoidal horizontal glyph displacement in CSS pixels. |
| `speed` | `0.6` | Multiplier for crown sway phase progression; not a universal speed control. Mist has separate renderer constants. |
| `parallax` | `3` | Approximate maximum foreground pointer displacement per axis in CSS pixels. |
| `mist` | `0.09` | Dark-mode center opacity; light mode doubles this value. Mist size, position and drift are in the renderer. |
| `density` | `0.9` | Multiplies terrain occupancy. Tree crowns and frond counts use separate generation rules. |
| `treeDensity` | `1` | Scales ordinary tree counts, clamped to 0.3–1.5 before counts are rounded. Three deliberate emergents remain additional trees. |
| `foregroundFronds` | `3` | Frond stems per side, clamped to 0–5 and rounded. Zero removes these edge fronds. |
| `opacity` | `0.95` | Overall forest opacity, applied inline to the decorative host. |
| `valleyDepth` | `0.23` | Normalized extra ridge descent near the valley center, weighted by depth layer. |
| `ridgeHeights` | `[0.15, 0.27, 0.41, 0.58]` | Normalized ridge baselines. Larger values place terrain lower in the image. |
| `glyphs` | ASCII lookup string | Numeric scene indices depend on its ordering. Reordering characters changes the meaning of generated indices. |
| `mask` | left `.12`, right `.86`, bottomStart `.81` | Renderer writes inline CSS variables for desktop edge opacity and bottom fade start. Mobile/Largest-text gradients have separate fixed stops. |

Additional limits live in code: 30–150 generated rows, generator column bounds of 40–200, column breakpoints of 600 and 1100 px, 80 ms maximum simulation delta, pointer eligibility at 761 px, and a backing width cap of 1920 px. Changing `columns` alone does not change those bounds.

Base tree counts, emergent positions/sizes, branch geometry, valley center/width, crown shading and motion-group selection remain scene-generation parameters in `scene.ts`. Use `treeDensity` and `foregroundFronds` for exposed tree/frond quantity controls. Palette hex values live in `palette.ts`.

## CSS composition controls

`AsciiForest.css` defines the mask shapes. The renderer applies overall opacity and the configurable edge/bottom variables inline. The desktop horizontal mask starts at `--forest-left: .12`, stays faint through the reading area and increases toward `--forest-right: .86`. A second gradient fades the top and bottom; its lower transition begins at `--forest-bottom-start`, currently 81%. The two masks intersect.

Up to 760 px, a single vertical gradient replaces the desktop pair: it is quiet near the text, reveals more forest lower down and fades at the bottom. Largest text applies its own quiet-to-dense vertical distribution. These are responsive composition choices, independent of the renderer's 600/1100 px quality breakpoints.

`forestConfig.mask` controls the desktop edge/bottom values. Intermediate horizontal stops and the top fade remain CSS parameters. Mobile and Largest-text replace the desktop mask entirely, so use their CSS rules to tune reading clearance. The inline desktop custom properties do not override those alternative gradient definitions.

Light desktop uses a separate directional mask: the forest is suppressed through 39% of the width, begins revealing around 51%, and reaches strong opacity toward the right. Its bottom fade still consumes the configurable bottom-start value. The dark desktop edge variables do not change this light-specific horizontal mask.

Readability also has local backing in CSS. A softly faded pseudo-element behind `.hero-copy` mixes 92–94% of the page background into the scene on desktop, with uniform 96% backing on mobile to protect the complete link row including external arrows. Portrait caption spans receive a 96% background mix and soft surrounding shadow; the secondary action receives 95% backing. These remain in place during the rendered-background contrast audit. They are deliberate text protection, independent of the forest palette, and do not change text content or layout. Sampled contrast results belong in QA rather than being inferred from these percentages.

## Design acceptance criteria

- Ridges, broad crowns and emergents remain recognizable at normal viewing distance.
- The landscape retains depth in both themes without resembling a uniform field of marks.
- Introductory text, links and focus indicators remain clear at every text-size preference.
- The portrait and forest form one composition rather than two competing illustrations.
- Mobile keeps a deliberate landscape crop and needs no pointer interaction.
- Pausing retains a composed artwork and stops continuous motion.
- OS reduced motion, forced colors and missing JavaScript preserve access to the portfolio.

These are review criteria, not claims that every browser/device combination has passed. Consult the implementation and QA records for measured results and outstanding limitations.

## Contact: aerial ASCII river

Contact changes viewpoint from the hero's distant valley to an aerial rainforest river. A narrow central river spine, restrained meanders, light inside-bend bars, deeper water and four smaller tributaries feeding from both banks give the river a readable hierarchy. Broad irregular shaded crowns with varied radii and aspect ratios surround the banks, with small gaps suggesting shadow between the aerial canopy forms. The composition is original glyph artwork and ships no photographic river asset.

The river uses the same light/dark setting and Animated scenery preference. Its small deterministic water-band movement becomes static when paused or when the OS requests reduced motion. The Contact instance loads as the section approaches view; the existing abstract river remains available as a fallback. Contact text and links remain semantic HTML above the decorative layer. Contrast and full-section visual results should be verified independently of the earlier hero-only contrast sample.

While motion is enabled, the four tributaries progressively reveal as the existing Contact scroll progress advances. The aerial view keeps the river's geographic layout stable while restoring the earlier branching interaction. Pausing and reduced motion show every branch completely. The old abstract SVG remains a fallback and is hidden only when the new river is ready; it is not removed from the document. The deferred 200 px proximity mount keeps Contact generation out of the initial hero construction.

The four tributaries are physical water streams in the aerial scene, with banks and water cells joining the main river. They are not abstract convergence lines drawn over the landscape. The four-into-one symbolism is expressed through hydrology: distinct curved streams merge into one continuous channel. Scroll progression grows those same water streams toward their joins; static/reduced-motion mode presents the completed network. A dedicated connectivity regression checks that every tagged tributary cell reaches main-channel water through adjacent water cells, accepting diagonal adjacency at rasterized bends.

The final aerial map is reflected vertically after generation, swapping glyph, ink and motion rows together. It is presented as a delta-like branching water landscape while retaining one clear narrow main river and subordinate connected streams among forest islands. This is a compositional interpretation, not a geospatial reconstruction of a named Borneo delta. The four-into-one relationship remains in the channel network even where the reflected view reads visually as one-into-four. There is no separate abstract line overlay. Scroll growth still reveals the actual tagged water cells; static mode displays the complete network.

The glyph vocabulary replaces lowercase `x` with rounded `o`; neither uppercase nor lowercase X is used. Weighted combinations of `*`, `o`, `+`, `#`, `%` and `@` produce varied foliage rather than a uniform cross pattern. Water retains `~` and `=`. Connectivity checks run against the final reflected grids, including all four tagged channels.

The final narrow-spine composition places the main-channel center at normalized x = `0.70 + 0.105 sin(14y + phase) + 0.025 sin(31y + phase)`, central within the visible artwork beside the protected copy rather than at the center of the full page. Its normalized half-width varies from 0.025 to 0.039. Four smaller tributaries physically feed this dominant channel, preserving the four-into-one motif without an abstract overlay. Tributaries use densely sampled analytic side-offset paths with separate stream/bank masks. Each path follows the winding main centerline with its own smaller S bends; its signed distance from that centerline decays quadratically toward the join. Their staggered pre-reflection join positions are y = 0.26, 0.70, 0.46 and 0.91. The side-distance reaches zero with zero derivative at the endpoint, aligning the joining tangent with the main channel rather than crossing it at a right angle. A 0.045 vertical wiggle is tapered by `16 t² (1-t)²`; a 0.45 oscillation modulates side-distance during the approach, while its `(1-t)²` factor preserves the smooth join. Tapering widths use small normalized radii with minimum raster radii of 0.8 columns and 0.72 rows; dense sampling preserves continuity at low resolution. Vertical reflection, seeded geometry, bank shading, progressive reveal and full static presentation remain in place. The delta-like description refers to the composition; the visual hierarchy is one main river receiving smaller streams.

The four analytic catchments remain separate outside the main channel, avoiding crisscross junctions. Stream and bank masks are generated from `4 × columns` samples per path before the glyph grid is filled. The final vertical reflection preserves the tangent relationship and masks. Geometry tests check physical connections and separation of differently tagged streams; perceived naturalness of the curved junctions still requires visual review.


## Complex problem → clear next step

The Contact artwork now uses an explicit many-to-one visual narrative. Four winding tributaries join the main channel before the final portion of its course. In generation coordinates their joins are at .22, .52, .40 and .65; after vertical reflection the complex catchments sit below a calmer outlet. The pronounced upstream meanders remain. A smoothstep blend from .66 to .88 reduces their amplitude into a gentle course near x=.66, keeping the transition smooth rather than introducing a hard straight segment.

The outlet's central current uses the brightest existing water ink and sparse ASCII `^` marks to indicate upward flow in the reflected view. This is a water-current cue, not an interactive button or separate diagram overlay. Terrain, canopy and water still use the same character-grid renderer and shared motion policy. Paused/reduced-motion presentation shows the complete stream network and direction cue.

Tests check that the outlet course is calmer than the winding catchments, cue glyphs stay in the outlet, all tagged tributaries connect to the main channel, and separate tributaries do not cross outside it. The hero art is unchanged by this refinement.

## NAAE v0.3 integration — 21 October 2026

This section supersedes the earlier character/palette treatment for forests. Each existing forest now uses one finer native Canvas grid with NAAE-derived landscape words and varied seeded material marks. Directional trunks and branches retain their shapes. Moss, olive and warm timber distinguish the dark forest; the separate daylight palette uses blue-gray distance, fern/sage canopy, umber branches and restrained ochre patches. Nearby light foliage and letters have more contrast than the first faded trial; distant atmosphere remains quiet. Reading masks still protect the professional content. The final light-only adjustment leaves the tested 390/1440 dark screenshots identical.

The actual NAAE v0.3 Borneo export is available through “Explore the written landscape”, with five authored passages, region highlighting, zoom and pan. Small semantic accents connect selected work, experience, capabilities and About to the same material vocabulary. Professional copy remains ordinary HTML. The full export has its own dark proof ground in either theme; portfolio scenes use their dedicated theme palettes.

A separately scaled SVG overlay was rejected during visual review because it produced competing glyph sizes and a gray wash. The native forest uses a single grid, its existing silhouettes and animation. This is an adaptation of NAAE vocabulary and material color, not a claim that the animated forest is the original NAAE composition or contains all five passages. River geometry, tributaries and motion retain their established treatment.

Desktop columns scale with width (approximately one column per six CSS pixels, 128–400 columns); mobile below 600px keeps 84 columns. This adds fine detail without shrinking a full panoramic poster onto a phone. Continuous source coverage and visual intensity are independent: a cell can contain a faint character while still giving the landscape breathing room. Website masks deliberately reduce visible intensity behind content.

The subsequent desktop framing refinement reduces oversized top/bottom whitespace, title size and stacked link gaps. At widths from 1100px, default text uses a minimum hero height of the available viewport below the measured header. Content remains intrinsically sized: there is no fixed height or clipping if a short screen or text enlargement needs more room. Mobile and Largest text keep their natural stacked layout. The result fits 1440×900, 1900×960 and 1920×1080, preserving the complete scene fade-out and links within the first screen. This changes desktop framing in both themes; the earlier identical-dark screenshot claim concerns the light-color adjustment alone.

## Current follow-up: consistent river and page art

All five forest/river pairs now share the same fine botanical character treatment. Each page retains its own seeded composition. Aerial scenes use warm exposed silt, teal/blue-green water, fern/olive canopy and occasional water words, with most channel characters staying as flowing marks. Light and dark inks are independently tuned. This extends the homepage's visual language without replacing natural tributaries with diagram lines or repeating a single scene across pages.

The two optional reading links and their explorer interface have been removed at the user's request. Artwork remains decorative and the existing portfolio content/actions keep their hierarchy. The desktop first-screen framing remains; removing the extra hero reading link reduces stacked content further.
