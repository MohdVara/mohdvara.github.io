# PORTFOLIO-NAAE-LOADER v1

Implemented 22 October 2026. No production or development dependencies added.

## Bootstrap and first usable frame

`index.html` has a shell insertion point before `#root`. The build-only Vite plugin in `scripts/loader/shell.mjs` emits inline critical CSS, a precomputed three-depth rainforest canopy MicroScene, a small locale table, and a standalone classic script. It works before the React module and makes no requests. No NAAE scene generation, canvas, fonts, imagery, intervals, character rewriting or progress percentages are involved.

The shell borrows the system typography and dark/light surfaces from `src/index.css`, the native wordmarks from `src/i18n/languages.json`, and distance/forest inks from `src/AsciiForest/palette.ts`. The artwork remains actual text. A CSS clip reveals a brighter copy of the canopy and its ASCII loading track from left to right across the full width every 1.8 seconds, holding briefly before repeating. The blue-green distant canopy, green middle layer, lime foliage, gold sunlight and brown trunks keep distinct colors through the fill. It indicates activity, not measured progress. Confirmed failure stops the fill; reduced motion hides the animated copy. The loader monogram matches the header’s exact font metrics and accent dot, including responsive and locale-specific rules; browser QA compares computed styles in all eleven locales.

The initial state is hidden. At 120 ms, a still-pending startup reveals the shell. This threshold only prevents a flash; there is no minimum dwell. The prerendered portfolio remains available in the meantime. A fixed overlay reserves no document space, does not lock scrolling, never makes the root inert and has `pointer-events: none`.

`src/FirstFrame.tsx` signals `portfolio:ready` from an effect and a single animation frame after route content commits. It sits **inside** each lazy route's Suspense boundary, so the fallback does not signal readiness. The ordinary homepage and not-found route also signal. Scenery, analytics, optional images and assistant downloads do not gate readiness. A committed usable frame is authoritative, even if optional preloads remain pending. The shell immediately starts a 160 ms opacity exit; its 180 ms disposal timer only removes DOM and never delays application interaction. StrictMode cancels its disposable frame during effect cleanup.

`startup().catch`, the existing route error boundary and native script/stylesheet errors confirm failure. Elapsed time never does: after 30 seconds, the shell says “Still loading. You can wait or retry.” and offers recovery while downloads and animation continue. A real commit clears this state immediately. Confirmed errors retain a settled landscape in a bordered recovery card with connection guidance and styled Retry/Continue actions. A compact banner is used when static content is available. Retry preserves the current URL; Continue removes the shell and its observers/listeners/timers. It is offered only when static content exists.

A tiny head watcher captures resource outcomes before stylesheets or scripts can delay the body bootstrap. Resource `load` is captured on **document**, since that event does not propagate to window. Known startup files are counted from real `load`/`error` outcomes, with examples of pending and completed filenames. Counts can expand when the browser discovers new preload/style/script tags. They are file counts, not byte percentages. Once known files finish, “Starting portfolio…” covers initialization until the actual usable-frame signal.

For Vite development, a single entry tag otherwise hides dozens of in-flight source imports. `scripts/loader/dev-preloads.mjs` walks Vite-transformed **static** imports/reexports and emits observable modulepreload links after the loading shell. The browser reuses these requests when importing the modules. Dynamic optional routes/games are excluded. Production uses Vite's emitted chunk preloads and never ships development graph discovery code. This tracks the required startup graph and explicit new tags, rather than claiming to expose every browser-internal or optional network request.

A missing same-origin stylesheet retains recovery until dismissal/retry or actual stylesheet recovery; a failed speculative preload alone is not sufficient to declare the app failed. Parser reconciliation updates controls when an error arrives before static content exists.

## Localization and accessibility

The shell uses the central registry and existing translation catalogs at build time; a missing registered translation fails the build. Locale precedence matches the application: URL, saved preference, browser languages, English. Normalization parity is covered by tests, including unsupported Traditional Chinese and Portuguese aliases. Storage can be unavailable. Loading, slow-connection, connection-guidance, starting, asset-count and pending/completed labels are synchronized across all eleven locales with `development-assistant` / `session-assistant` machine-translation provenance. No human editorial review is claimed. The configured translation-provider command was attempted but credentials/model were unavailable.

Arabic copy/wordmark align RTL. The preformatted scene explicitly remains LTR, horizontally written, isolated and untranslated. The shell uses local font fallbacks and adds no external font requests. It does not alter the existing portfolio's locale font behavior.

The scene is decorative (`aria-hidden`). Loading text, counters and filenames are readable but not live regions; download completions do not generate repeated announcements. Recovery uses a polite status and native focusable controls with visible focus treatment. There is no focus trap or forced focus change. Reduced motion removes glyph animation and exit transitions, and readiness removes the shell immediately. Without JavaScript the shell stays hidden and the existing localized, prerendered portfolio and native links/disclosures remain available. SEO metadata and static route generation are preserved.

## Measured size

Local production builds, raw bytes and gzip bytes measured with Node's `gzipSync`; compression and chunk splitting may differ on the deployed CDN. Baseline was the existing working tree before loader integration, not a clean historical commit.

| Artifact | Before raw / gzip | After raw / gzip | Difference raw / gzip |
| --- | ---: | ---: | ---: |
| Homepage HTML | 70,369 / 15,939 | 88,631 / 22,397 | +18,262 / +6,458 |
| Entry JavaScript | 211,235 / 64,919 | 211,622 / 65,047 | +387 / +128 |
| All emitted JavaScript, including lazy games/locales | 4,522,436 / 1,387,179 | 4,530,464 / 1,387,899 | +8,028 / +720 |

The minified standalone shell is 18,180 raw / 6,508 gzip bytes, including the early watcher, all languages, CSS and artwork. The existing Vite minifier keeps authored scripts readable without shipping comments/whitespace. A 22 KB authored-source budget includes both classic scripts; production output is smaller. The all-chunk gzip difference includes chunk redistribution and is not a claim of reduced startup transfer.

## Validation and limits

- Production build, TypeScript and ESLint pass. The build retains its existing warning for large optional game/analytics chunks.
- All 153 Node tests pass (including eleven loader, dependency-graph and hydration regressions). Tests cover readiness, locale parity, storage failure, timeout, early-parser failures, dismissal and reduced motion.
- `scripts/loader-qa.mjs` uses the repository's existing Playwright QA pattern. It exercises all eleven languages, 320/390/768/1440 px viewports, light/dark, reduced motion, real network latency/throughput throttling, delayed entry and lazy-route modules, module/startup/route/stylesheet failures, 30-second slow-connection guidance followed by successful recovery, empty-root recovery and JavaScript disabled. Screenshots and detailed measurements are under `output/playwright/loader/`.
- The separate throttled Vite test recorded **61 live counter updates**, reaching **58 completed startup files**, while showing actual pending/completed names before React became usable. It uses 400 ms latency and 100,000 bytes/second download throughput.
- Fast local navigation removes the waiting shell before it becomes visible. Throttled navigation exposes it and hands off on commit. The shell has no animation JavaScript work or repeat frame loop. Whole-page long tasks can still arise from existing HTML/style/font work; this is not a claim that the portfolio has no long tasks.
- Fixed-position shell show/removal does not move the portfolio. Small locale-font shifts can still occur in the existing underlying page; recorded layout-shift sources distinguish these from loader nodes.
- The current `scripts/i18n-qa.mjs` passes for English, Arabic and Tamil at eight widths each (24 layout checks), including RTL and localized static refresh. The earlier mobile layout failure is no longer reproduced in the current working tree.
- Chromium local preview validation only; no live deployment, Lighthouse score, cross-browser or fluent translation-review claim.

## Files changed for this feature

- `index.html`, `vite.config.ts`: early shell insertion and build-only plugin.
- `scripts/loader/{shell.mjs,shell.css,bootstrap.js,asset-watch.js,dev-preloads.mjs}`: composition, critical styling, locale subset and standalone lifecycle.
- `src/FirstFrame.tsx`, `src/Page.tsx`, `src/main.tsx`, `src/RouteRecovery.tsx`: commit readiness and startup recovery integration.
- `src/i18n/locales/*.json`, `scripts/i18n/metadata.json`, generated i18n status/coverage/source-location evidence: synchronized loading label.
- `tests/loader.test.mjs`, `tests/loader-graph.test.mjs`, `tests/hydration.test.mjs`, `scripts/loader-qa.mjs`, `scripts/loader-dev-qa.mjs`: regression and browser validation.
- This document, `PORTFOLIO-NAAE-LOADER-V1-QA.json` and the loader entry in `PME-V1-QA.json`: measured implementation evidence.

Future palette/locale-resolution changes should update the tiny standalone equivalents and their parity checks. Keep the full rendering engine out of the shell. Build normally with `npm run build`; test with `npm test`. Browser QA accepts the same `QA_URL` / `QA_MODULES_DIR` overrides as the existing i18n scripts.
