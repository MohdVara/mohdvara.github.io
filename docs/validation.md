# Validation — 6 October 2026

Final local production build. Nothing was pushed or deployed remotely. Detailed measured results are in [validation-results.json](validation-results.json).

## Executed

| Check | Result |
|---|---|
| Clean install | `npm ci` passed against updated lockfile |
| TypeScript | `npm run typecheck` passed; also checked by production build |
| Lint | `npm run lint` passed |
| Production build | `npm run build` passed, including static React rendering |
| Artifact tests | `npm test`: 4 passed |
| Browser QA | Chrome, using real UI inspection and Playwright against production preview |
| Responsive | 320, 375, 430, 768, 1024, 1440, 1920px; no horizontal overflow or clipped main content |
| Keyboard | Skip link focus/activation; mobile menu Enter/Escape and focus return; all four case disclosures; anchor navigation |
| Deep links | Work anchor loads and refreshes correctly at all seven sizes |
| Motion | Reduced-motion scrolling uses `auto`; no continuous animations |
| No JavaScript | Readable static content, native mobile navigation and case disclosures checked at 375px with reduced motion |
| Text enlargement | 200% root text at 320px; no overflow after correcting header/grid reflow |
| Console and resources | 0 console/page errors; 0 failed requests or HTTP errors on the portfolio |
| Accessibility | 0 axe WCAG A/AA violations at all seven sizes, with all case details open |
| Metadata | Title/description, canonical, OG/Twitter image, Person/WebSite schema, robots, sitemap and favicon checked |
| Sharing | 1200×630 branded PNG visually inspected; correct title and canonical domain |
| Public links | GitHub profile, LinkedIn profile and owner-supplied résumé opened successfully; mailto destination inspected without sending mail |
| GitHub Pages | Root base verified from user-site repository and existing gh-pages CNAME; dist assets exist; hash navigation needs no server fallback |
| Dependency security | Updated install's npm audit: 0 vulnerabilities; no runtime dependencies added |
| Preservation | Original index.html and every moved tracked asset verified byte-for-byte against HEAD |
| Diff hygiene | `git diff --check` passed |

## Lighthouse

Baseline audit before the subsequent project-content and monogram updates; not rerun for those edits. One local audit per preset, Chrome headless. Scores are laboratory measurements, not field Core Web Vitals or a promise about live hosting.

| Preset | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Mobile | 100 | 100 | 100 | 100 | 1.3s | 1.5s | 0ms | 0 |
| Desktop | 100 | 100 | 100 | 100 | 0.3s | 0.3s | 0ms | 0 |

Baseline deployment artifact totaled approximately 429KB including the social card and both portrait sizes. Updated main JavaScript is 158.7KB (51.3KB gzip), CSS 13.5KB (3.6KB gzip). Portrait variants are approximately 62KB and 28KB. No web fonts, jQuery, icon fonts, carousel, stock images or tracking scripts ship.

## Manual review and limits

Desktop and mobile rendered views were inspected. All seven homepage sizes were reviewed in a contact sheet; work, experience, contact and social-card layouts were also inspected. Automated accessibility left one contrast item for the decorative footer arrow; it is aria-hidden, and the inherited foreground/background contrast is 8.95:1. Primary text, secondary text and amber have 16.60:1, 8.95:1 and 11.18:1 contrast on the page background. This is not independent WCAG certification. Safari/Firefox, physical touch devices and full screen-reader narration were not tested.

The local default Node is 23.11, which triggers an engine warning from a lint-tool dependency. Commands passed; `.nvmrc`, CI and README recommend supported Node 22 LTS. Dev tooling was updated to remove known vulnerabilities; React/React DOM remain the existing runtime dependencies. SWC recommends Vite's alternative React plugin, but the existing compiler integration is retained and builds correctly.

GitHub Actions workflow is ready locally; its remote execution and live-domain behavior after deployment have not been tested. For Actions deployment the repository Pages Source must be GitHub Actions. Existing manual gh-pages deployment remains available and now publishes dist. No remote repository setting was changed.

## Next evidence improvements

Add approved system screenshots, project-specific architecture tradeoffs and verified outcomes (hosting savings, integration latency or operational time saved). These would strengthen technical credibility more than adding sections or decoration. Keep actual role dates synchronized with the hosted résumé.

## Editorial scores

These are subjective portfolio judgments, not test results.

| Dimension | Score / 10 |
|---|---:|
| First impression | 8.5 |
| Seniority signalling | 8.8 |
| Technical credibility | 8.0 |
| Visual design | 8.5 |
| Information architecture | 8.8 |
| Mobile UX | 8.7 |
| Accessibility | 9.0 |
| Performance | 9.5 |
| SEO | 9.0 |
| Recruiter effectiveness | 8.8 |

The main ceiling is evidence depth: real system visuals, precise tradeoffs and measured business impact are not supplied. Browser coverage and live deployment are the practical validation limits.

## Owner-requested content update

Replaced the featured campus case with classroom and meeting tools, added a collaborative HR management case, and reduced campus work to a brief experience mention. Insurance and rental cases remain. Updated the header, favicon, and touch icon to `mpv`. Production build, lint, and all four artifact tests were rerun. Responsive browser results and preview images reflect this update; Lighthouse figures above retain their baseline scope.
