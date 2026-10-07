# Borneo Systems — implementation and validation

> This records the earlier Borneo Systems pass. The subsequent motion pass is documented in [ambient-motion-validation.md](ambient-motion-validation.md).

Validated locally on 6 October 2026. The working tree on `main`, including existing Cloudflare configuration changes, was treated as authoritative. No commit, push or deployment was performed. The live domain could not be fetched by the web tool; rendered comparison used the approved local production build captured before edits.

## Skills used

The owner-linked [Frontend App Builder](https://github.com/openai/plugins/blob/main/plugins/build-web-apps/skills/frontend-app-builder/SKILL.md), [Frontend Testing & Debugging](https://github.com/openai/plugins/blob/main/plugins/build-web-apps/skills/frontend-testing-debugging/SKILL.md), and [React Best Practices](https://github.com/openai/plugins/blob/main/plugins/build-web-apps/skills/react-best-practices/SKILL.md) instructions were read and applied selectively. Existing design and Vite constraints took priority. Browser QA used external Playwright with installed Google Chrome; the Browser plugin was unavailable.

## Visual system and changes

- **Flow:** project workflows and a once-only Contact convergence; the existing river transition remains.
- **Branching:** a chronological role-start path and a twelve-node capability map with four disciplines and eight supporting practices.
- **Botanical:** the approved fern becomes a field-style technical plate with numbering, leaders and dimension ticks. The transparent portrait, shoulder mask and lower-left understory remain.

The editorial typography, horizontal project rows, existing factual case studies, colors, theme control, enlarged wordmark, SEO and root-domain hosting remain. Project visuals show documented functional relationships rather than inferred production infrastructure. Career starts are 2018 (training), 2019 (PolicyStreet), 2021 (return to Centre for Content Creation; Principal from 2022), and 2025 (confidential engagement). Labels and dashed branches acknowledge concurrent engagements.

Project and capability controls support mouse preview, focus preview and persistent click/tap selection. Connected paths receive emphasis and explanations follow the selected function or discipline. Career links jump to their corresponding role and the path follows the reading position. Existing native disclosures, navigation and email copying continue to work.

## Motion and React review

- Entrance: existing grouped, once-only observer reveals; 14px displacement and 420ms transition.
- Scroll: portrait displacement capped at 12px; backdrop adds 6px relative displacement, reaching 18px overall.
- Ambient: Hero and About each use a 3px, 16-second drift, paused offscreen. These separated sections keep ambient density restrained.
- Pointer: only the desktop hero backdrop responds, bounded to 3px in each axis. Fine mouse pointers and normal motion are required; touch movement is ignored. No rotation or portrait tilt.
- SVG: three major draw events — transition, career and Contact. Contact resolves outer branches, merge, final path and node in 1.1 seconds without looping.

Selections use local component state. Motion updates CSS properties through refs/DOM nodes rather than React state each frame. Scroll and pointer handlers use requestAnimationFrame; scroll is passive. Observers, animation frames, media listeners and event listeners have cleanup. No runtime dependency was added. Reduced motion cancels decorative animations and resets scroll/pointer variables while keeping functional controls usable.

Topographic contours, mountains, terrain/elevation imagery, tourism imagery, unverified cultural motifs, particles, custom cursors, 3D and animation frameworks were not introduced.

## Validation

- `npm run lint`, `npm run typecheck`, production build and all eight existing tests passed.
- `git diff --check` passed.
- `scripts/browser-qa.mjs`: 320, 375, 430, 768, 1024, 1440 and 1920px; both palettes; keyboard navigation, menu Escape/close, exclusive disclosure, focus, clipboard success, theme persistence/system changes, anchors/deep-link refresh, asset responses, console, overflow and no-JavaScript content/native controls.
- `scripts/systems-qa.mjs`: all project and capability controls, career anchors, 44px targets, explanation changes, stable capability dimensions, bounded pointer/scroll motion, ambient visibility/pause, completed once-only Contact paths, dynamic reduced-motion changes and mobile touch emulation.
- Additional normal-motion regression: active section navigation, grouped reveals, role reading cues, clipboard denial fallback and disclosure interaction at six widths from 320 to 1440px.
- Zero detected axe A/AA violations in the tested states; color-contrast checks had incomplete results. Meaningful palette/text colors and both rendered themes were visually reviewed. This is not a full WCAG certification or screen-reader audit.
- No console errors, failed resources or horizontal overflow in the seven-width browser suite.
- Before/after section and full-page screenshots at 1440 and 375px in dark/light were reviewed, plus responsive graph compositions. Artifacts: `/private/tmp/portfolio-systems-qa/`.
- Chrome was tested; Safari/Firefox and physical touch hardware were not tested.

## Measured performance

Final production build, local Lighthouse lab run:

| Mode | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 99 | 100 | 100 | 100 | 1.663s | 0 | 0ms |
| Desktop | 100 | 100 | 100 | 100 | 0.387s | 0 | 0ms |

These are local lab results, not field Core Web Vitals. Field INP was not measured; TBT is not INP.

Bundle sizes measured with Node's gzip:

| Asset | Before raw / gzip | After raw / gzip | Gzip change |
| --- | ---: | ---: | ---: |
| JavaScript | 167,772 / 53,916 bytes | 176,358 / 56,035 bytes | +2,119 bytes |
| CSS | 24,876 / 5,829 bytes | 32,110 / 7,141 bytes | +1,312 bytes |

Portrait assets and React runtime dependencies were unchanged. Production tests verified static HTML, fragment targets, asset budgets, canonical/schema/domain agreement, CNAME and sitemap. Vite base remains `/`; existing GitHub Pages workflow and local Cloudflare configuration were preserved.
