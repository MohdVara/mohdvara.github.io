# Portfolio and Incident Zero review — 7 October 2026

Local implementation only. No deployment, external account changes, email or bookings. Existing uncommitted work preserved. No applicable AGENTS.md was found in the project or its ancestors. Actual stack: React 18.3.1, TypeScript 5.6, Vite 8.3.2, Phaser 3.90. Root-base static prerender supports all three folder routes on GitHub Pages and Cloudflare Pages.

| Area | Confirmed issue / evidence | Change | Verification |
| --- | --- | --- | --- |
| Mobile world | Fresh 390×844 load renders a cropped 360×300 camera over a 900×540 world; camera choice is fixed at mount and disagrees with wider-layout CSS thresholds | One fitted 900×540 room, shared aspect ratio, resize observer, no following-camera crop | Implemented and verified: six fresh-load/resize cases; DPR 1/2; pointer mapping and visually inspected frames |
| Game overhead | Large route heading and repeated modal/reorder tutorials | Compact active header; current task, Help, pause and evidence progress; expandable puzzle help | Implemented and verified: focused tests and Chrome browser journeys described below |
| Integration reasoning | Label conflated event ID creation and worker duplicate check | Separate producer ID, queue, worker claim, remote idempotency, retry and reconciliation responsibilities; explicit assumptions and responsibility feedback | Implemented and verified: focused tests and Chrome browser journeys described below |
| Decisions | Limited constraints; manual correction sounds inherently wrong | Unavailable reporting owner, limited consumer coverage, auditable one-run correction and a future migration plan | Implemented and verified: focused tests and Chrome browser journeys described below |
| Ending scroll/focus | Report mounts behind consequence dialog; modal closes back to old map focus | Wait until overlay closes, then focus and scroll report title once | Implemented and verified: focused tests and Chrome browser journeys described below |
| Assessment | Uncalibrated exact numbers and blanket “resolved” summary | Qualitative deterministic bands, disclosure of scoring assumptions, decision-specific summaries | Implemented and verified: focused tests and Chrome browser journeys described below |
| Professional proof | Features outweigh ownership/constraints | Campus, insurance and rental case framing; real work precedes supplementary code evidence | Implemented and verified: focused tests and Chrome browser journeys described below |
| Engagements | General descriptions | Audience, inputs, possible deliverables, next step and real-work links | Implemented and verified: focused tests and Chrome browser journeys described below |
| Résumé PDF | Legitimate export retrieved; four-page PDF has overlapping text on pages 3–4 | Keep online version; do not ship damaged asset; shared optional PDF configuration | Blocked: clean current résumé PDF |
| Discoverability | Preview buried in opening dialogue | Homepage secondary story link; opening Play / Preview choices | Implemented and verified: focused tests and Chrome browser journeys described below |
| React warning | React 18 camel-case fetchPriority unsupported in development | Lowercase native fetchpriority attribute, no dependency upgrade | Implemented and verified: fresh Vite development console has no warning/error |
| Contact/themes/hosting | Existing shared links, native routes, clipboard states and theme modes | Retained | Already working and verified: native navigation, themes, shared links, static refresh and clipboard success; failure wording improved and verified |
| Renderer lifecycle | Stock Phaser 3.90 retains a document visibility subscription; asleep loops defer destruction | Own visibility/blur/focus subscriptions, disconnect ResizeObserver and wake the pending destroy frame | Implemented and verified: three paused renderer teardown cycles with no global listener growth |
| Initial direction press | A mouse press moved focus from the map and its blur handler cancelled movement | Prevent pointer-only focus transfer on direction controls; keyboard focus still works | Implemented and verified: focused-map mouse and Chrome touch press/release |

## Verification and screenshots

`npm run build`, `npm run lint` and `npm test` passed; 28 tests passed. This sandbox needs `SWC_NATIVE_BINDING_CACHE=/private/tmp/portfolio-swc-cache` when building or starting Vite. No dependency upgrade was made. `git diff --check` passed.

Browser checks used Chrome 153.0.8010.55 on macOS arm64, with optional Playwright/Axe tooling outside the repository:

- Homepage: seven widths (320, 375, 430, 768, 1024, 1440, 1920), mobile menu opening/selection/Escape, native case disclosures, fragment refreshes, clipboard success, theme persistence and no-JavaScript content. No console errors, failed resources or horizontal overflow.
- Engagements: 14 width/theme cases, all service sections and proof links, static route refresh, contact destinations and no-JavaScript content.
- Incident Zero: fresh loads and resizes at all six requested dimensions, DPR 1/2, fitted-room geometry, visible spawn, scaled pointer inspection, room travel, release/cancellation/blur/pause stops, keyboard Help/Escape/focus restoration, simplified/spatial switching and renderer teardown. [Recorded results](game-results.json).
- All three major endings through normal play; incorrect/correct puzzle attempts; the Archaeologist trigger (all six evidence sources before the first fix); a path without that award; report focus/scroll; replay reset; all three clearly labelled previews without loading Phaser. Three paused renderer teardown cycles caused no global listener growth.
- Separate Chrome CDP touch press/hold/release check at 390×844; initial mouse direction press from the focused map at 1280×800. Desktop primary controls fit within the 800px viewport. Short landscape screens deliberately scroll.
- Fresh development console: no React fetch-priority warning or new errors. Clipboard denial produces honest failure text. System and Time-of-day modes retain their preferences; Time-of-day follows the local clock. Homepage requests do not include the game route, shell or engine.
- Axe reported zero violations in the tested views. Some homepage contrast checks were marked incomplete by Axe and inspected manually; this is not an accessibility certification.
- The ending's real-work action navigates to the homepage work fragment. Shared résumé and booking destinations were checked; Cal.com loaded successfully and showed a 20-minute discovery meeting. No booking or email was submitted.

Representative screenshots were inspected visually and copied here for review:

| Homepage | Game | Consequences |
| --- | --- | --- |
| [Desktop](screenshots/home-desktop.png) | [Desktop spawn and controls](screenshots/game-desktop-1280x800.png) | [Reviewed payroll](screenshots/consequence-payroll.png) |
| [Mobile](screenshots/home-mobile.png) | [Mobile fitted room and touch controls](screenshots/game-mobile-390x844.png) | [Delivery safeguards](screenshots/consequence-delivery.png) |
| | [Modernizer report](screenshots/ending-modernizer.png) | [Dependency connections](screenshots/consequence-dependencies.png) |

Physical iOS/Android devices, Safari and Firefox were not tested. Chrome emulation and CDP touch checks do not establish complete cross-browser or real-device compatibility. The 6–12 minute playtime is a design estimate, not a measured completion time.

Reproduce browser checks with existing scripts: `scripts/browser-qa.mjs`, `scripts/engagement-qa.mjs` and `scripts/incident-review-qa.mjs`. Set `QA_MODULES_DIR` to an external directory containing Playwright and `@axe-core/playwright`, `QA_URL` to the preview URL and `QA_OUTPUT_DIR` to an artifact directory. Example:

```sh
QA_MODULES_DIR=/private/tmp/portfolio-qa QA_URL=http://127.0.0.1:4175 QA_OUTPUT_DIR=/private/tmp/portfolio-review/game node scripts/incident-review-qa.mjs
```

## Production-build lab measurements

Lighthouse 12.8.2 measured the production homepage served locally at `http://127.0.0.1:4175/` using Chrome 153 on macOS arm64. Runs were isolated from other browser QA. These are lab measurements of the local production build, not the deployed site or field Core Web Vitals. [Actual measurements and throttling settings](performance.json).

| Run | FCP | LCP | Total blocking time | CLS | Speed index |
| --- | --- | --- | --- | --- | --- |
| Mobile: 150ms RTT, 1,638.4kbps, 4× CPU slowdown | 1.544s | 1.694s | 17.23ms | 0.000300 | 1.544s |
| Desktop: 40ms RTT, 10,240kbps, 1× CPU | 0.479s | 0.479s | 2.50ms | 0.000478 | 0.639s |

Homepage JavaScript is 203,503 bytes raw / 63,013 bytes gzip. The Phaser-containing engine chunk is 1,205,558 bytes raw / 319,442 bytes gzip and remains lazy; it is not requested by the homepage or opening recruiter preview. Gzip sizes use Node's default compression. The Vite large-chunk warning remains for the lazy game engine. [Final asset sizes](bundles.json). No claim of measured live-site improvement is made.

## Acceptance checklist

| Requested area | Status |
| --- | --- |
| 1. Current state, documentation and preservation | Already working and verified; baseline and reproduced issues recorded |
| 2. Mobile spatial gameplay | Implemented and verified in the six Chrome viewport cases |
| 3. Compact active interface and Help | Implemented and verified |
| 4. Technically defensible integration puzzle | Implemented and verified |
| 5. Constraints, consequences, endings and reset | Implemented and verified |
| 6. Ending focus and scroll | Implemented and verified |
| 7. Explained qualitative simulation assessment | Implemented and verified |
| 8. Source-grounded flagship evidence | Implemented and verified; unavailable metrics omitted |
| 9. Concrete client engagements | Implemented and verified |
| 10. Résumé and contact resilience | PDF blocked by clean current owner-approved export; existing contact links verified and copy failure improved |
| 11. Homepage story shortcut and opening preview | Implemented and verified |
| 12. React warning, cleanup, lazy loading and performance | Implemented and verified within the stated browser/lab scope |
| 13. Complete experience validation | Implemented and verified within Chrome; physical devices and other engines untested |
| 14. Review artifacts and preview | Implemented and verified; screenshots and results linked above |

## Local preview

Development: `http://localhost:5173/`. Production preview for this review: `http://127.0.0.1:4175/`. All three routes load and refresh directly. To start again, run `npm run dev -- --host 127.0.0.1`, or `npm run build` followed by `npm run preview -- --host 127.0.0.1`; Vite prints the chosen port. Use the SWC cache environment setting above if running in the same sandbox.

## Evidence boundaries and private follow-up

The public résumé was read through Chrome after the web tool could not open it. It states Campus Management System V3 (April 2023 onward), branch consolidation, hosting-cost work and multi-environment DevOps/deployment procedures. It supports the existing insurance and 20+ property rental claims. No savings, branch count, traffic, latency, uptime, team size or new project-specific stack was added. The older owner instruction to minimise campus work is superseded by this review's explicit request for flagship evidence.

Needed to strengthen proof later: approved before/after campus architecture and cutover constraints; measured hosting baseline and comparable post-change cost; regression/deployment results; insurer integration counts and measured latency; role-specific leadership scope; approved anonymised screenshots. None appears as a placeholder on the public site.

## PDF update procedure

Supply a clean current owner-approved PDF, or fix the public résumé template and export it again. Check name, contact details, dates, all pages, links and overlapping text before storing `public/documents/Mohd-Paramasvara-Resume.pdf`. Set `profile.resumePdf` in `src/content.ts` to `/documents/Mohd-Paramasvara-Resume.pdf`; homepage and ending actions must use this shared setting. Keep the hosted résumé as the optional online version. Do not generate new résumé claims to fill a missing asset.
