# Ambient and scroll-reactive motion pass

Validated locally on 6 October 2026. The existing working tree, layout, content, portrait, Borneo graphics and deployment configuration were preserved. No deployment was performed.

The previously read owner-linked Frontend App Builder, Frontend Testing & Debugging and React Best Practices instructions were applied selectively. Implementation remains React + TypeScript + Vite with native browser APIs.

## Ambient system

| Element | Idle behavior | Timing |
| --- | --- | --- |
| Hero network | Rigid diagram translation up to 5px horizontally and 4px vertically | 43s alternating |
| Selected Work | One faint segment travels through the relevant path in the visible diagram nearest the reading area | 12s interval; 15s mobile |
| Work/Experience transition | Whole network translation up to 5px/4px | 47s alternating |
| Capability spine | Up to 3px/3px drift; mobile keeps only the smaller scroll response | 53s alternating |
| About illustration | Whole rigid diagram layer translates up to 9px/6px; no leaf/stem deformation | 55s alternating |
| About annotations | Separate 2px/2px layer translation; omitted on mobile | 51s alternating |
| Contact network | Whole composition translates up to 5px/4px; 3px vertical on mobile | 59s alternating; 57s mobile |

Predetermined durations prevent synchronized oscillation. Offscreen regions pause ambient work. `document.hidden` pauses CSS motion and cancels pending scroll frames. There is no always-running JavaScript animation loop. A single project signal host prevents multiple idle packets. Hover/focus receives a stronger single path pass; functional selection remains authoritative.

## Scroll progression

- Hero: portrait depth capped at 8px, network reaching 16px overall; existing desktop pointer response remains capped at 3px.
- Selected Work: connections reveal once per row; only the SVG background receives small scroll depth. Text/buttons stay in their existing layout.
- Transition: shared progress strengthens the primary route, crossfades downstream branches and adds a small translation. SVG geometry is not morphed.
- Experience: a muted complete trunk remains visible beneath a progressively activated overlay. Role nodes follow content in the 40–50% viewport reading band. The mobile vertical route also progresses.
- Capabilities: the spine activates progressively; background connections gain visibility. The selected branch keeps stronger emphasis than the background.
- About: veins draw once over 1.1 seconds. The complete technical plate receives restrained scroll translation while its text/caption stay stable.
- Contact: outer paths, merge, main line and endpoint use progress stages 0–0.30, 0.30–0.65, 0.65–0.90 and 0.90–1.00. The end range is calibrated to the reachable email/CTA position, so short final sections finish at the page bottom. Reverse scrolling reverses the route.

No foreground text parallax, custom inertia, wheel interception, snapping, path morphing or new geographic/terrain imagery was introduced.

## Architecture and React review

`useSystemMotion` uses separate IntersectionObservers for nearby-region work and actual visibility. A ResizeObserver invalidates cached geometry when main content changes size, including disclosure expansion. Resizes also invalidate the cache. A single passive scroll handler schedules requestAnimationFrame only when input or observer/layout changes require an update.

Frames calculate normalized progress and update CSS properties on nearby region elements. Layout reads are confined to cache invalidation; the ordinary scroll frame does not read bounding rectangles. Progress is not held in React state. Role selection changes only on reading-band observer transitions. Effects disconnect observers, remove listeners and cancel pending frames.

`--section-progress`, `--section-energy`, `--visual-depth` and the four Contact stage properties drive CSS transforms, opacity and normalized SVG strokes. Six lightweight paths were added for signals/activation overlays; existing illustrations were retained. No runtime dependency was added.

## Accessibility and validation

- Reduced motion removes decorative drift, depth, pulses and path drawing and displays completed graphics. Controls, native navigation/disclosure and diagram selections remain usable.
- Existing keyboard focus and 44px targets were checked, alongside touch emulation and pointer restrictions.
- Production build, lint, TypeScript and all eight existing tests passed. `git diff --check` passed.
- Standard Chrome browser suite covered 320, 375, 430, 768, 1024, 1440 and 1920px, dark/light themes, navigation jumps, disclosure, keyboard, email copying, resources and no-JavaScript content/native controls. No console errors, resource failures or overflow were detected. Axe reported zero detected A/AA violations; some contrast checks remained incomplete.
- Normalized SVG dash drawing was corrected to scale with the stretched viewboxes, eliminating gaps in completed paths. A browser geometry regression checks stroke coverage at 99% of every visible project, capability and Contact path at all seven widths. Screenshots confirmed the completed routes.
- Systems suite checked every node selection, explanation and stable capability dimensions, career anchors, touch behavior, pointer/scroll limits and reduced-motion changes.
- Motion suite checked slow, fast and reverse native scroll, progressive roles/capabilities, reachable and reversible Contact stages, theme switching, offscreen pausing, 30 seconds of idle movement and one occasional signal at the six requested widths.
- Scroll-stress CLS was 0 at five widths and 0.00182 at 768px. A larger shift found during QA came from Contact's translated copy wrapper changing the absolute SVG containing block. Keeping the Contact reveal opacity-only fixed that positioning change.
- Section and full-page screenshots at 1440/375px in both palettes were compared with the baseline; intermediate responsive screenshots were inspected. Idle start/end images confirmed subtle movement with stable copy.
- Headless Chrome did not mark inactive tabs hidden, and the attempted headed tab test exited. The visibility-change pause/resume contract was therefore tested using simulated browser events. Physical tab backgrounding, physical mobile hardware and Safari/Firefox were not validated.

Repeatable checks: `scripts/browser-qa.mjs`, `scripts/systems-qa.mjs`, `scripts/motion-qa.mjs`. Tools remain external to runtime dependencies. Artifacts: `/private/tmp/portfolio-ambient-qa/`.

## Measured performance

Final local Lighthouse lab run:

| Mode | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 99 | 100 | 100 | 100 | 1.680s | 0 | 34.5ms |
| Desktop | 100 | 100 | 100 | 100 | 0.372s | 0 | 0ms |

An earlier mobile sample taken concurrently with the interaction suite scored 66 (LCP 2.953s, TBT 1,114ms). The isolated run above avoids that test-load contention; scores remain machine- and run-dependent. These are lab measurements. Field INP was not measured; TBT is not INP.

Node gzip bundle measurements relative to the approved implementation before this pass:

| Asset | Before raw / gzip | After raw / gzip | Gzip growth |
| --- | ---: | ---: | ---: |
| JavaScript | 176,358 / 56,035 bytes | 179,379 / 56,956 bytes | 921 bytes |
| CSS | 32,110 / 7,141 bytes | 37,898 / 8,069 bytes | 928 bytes |

During the observed 30-second headless idle interval, Chrome recorded 0.115s of main-thread task time and 0.000063s of script time; the interval includes QA queries/screenshots. A separate two-second frame sample averaged 16.52ms with a 16.8ms maximum. Two-second slow/fast/reverse scroll samples at 375/1440px under simulated 4× CPU slowdown averaged 16.50–16.60ms, with a 16.8ms maximum and no intervals above 34ms. These short lab samples do not establish frame rates on physical devices.
