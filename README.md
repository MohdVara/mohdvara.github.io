# Mohd. Paramasvara — engineering portfolio

React + TypeScript + Vite, deployable as a static site to GitHub Pages or Cloudflare Pages. The production domain is **https://mohd.paramasvara.online/**. The repository is a user site (`MohdVara/mohdvara.github.io`), so the Vite base is `/` for github.io, Cloudflare's pages.dev subdomain and the existing custom domain.

## Development and validation

Use a supported Node LTS version (Node 22.13+ or Node 24+) and npm.

```sh
npm ci
npm run dev
npm run typecheck
npm run lint
npm run build
npm test
npm run preview
```

`npm test` inspects the production artifact; run the build first. It checks static content, heading/fragment integrity, asset existence and size budgets, schema and custom-domain consistency. The build generates readable HTML from the same React components and hydrates it in the browser; no server runs in production. Content and native disclosures remain usable without JavaScript.

## Color themes

The header’s theme selector offers **System** (default, follows the device’s color preference), **Time of day** (light from 07:00 to 18:59, dark otherwise, using the visitor’s local clock), **Light**, and **Dark**. Choices are remembered locally and synced across tabs. Automatic modes update while the page is open and when visitors return to it. If browser storage is unavailable, the choice still works for the current page.

`public/theme.js` applies the theme before the page renders to avoid a flash of the wrong palette. Without JavaScript, the CSS follows the device’s preference; manual selection requires JavaScript.

## Motion and interaction

Native case-study disclosures share one exclusive group, with a fallback for older browsers. Their engineering copy and stack remain sourced from `src/content.ts`. The project panels use varied arrangements of documented functions rather than claiming implementation topology.

Desktop portrait depth is capped at 8px, with the background network reaching 16px; mobile and reduced-motion users receive a stable portrait. A shared IntersectionObserver reveal enhances major visual groups once, with all prerendered content visible before JavaScript. Navigation tracks the reading position, including Contact at the page bottom. Experience synchronizes a branching career path with the role being read, without dimming role text. Email copying has inline success or failure feedback and retains the mailto link.

`src/usePortfolioMotion.ts` owns reveal/reading observers and one passive, requestAnimationFrame-throttled scroll controller. It caches layout geometry after resize or disclosure changes and updates nearby regions through CSS variables; there is no perpetual JavaScript animation loop or per-frame React state. Effects clean up observers, listeners, and animation frames. Motion uses native APIs with no added runtime dependencies.

## Borneo visual identity

The Borneo Systems visual language combines flow, branching and botanical structure. `src/NaturalGraphics.tsx` holds the decorative fern, portrait understory, river transition and Contact convergence. `src/SystemDiagrams.tsx` holds interactive project workflows, a twelve-node capability map and chronological role-start links. The graphics describe documented functions and overlapping engagements; they do not assert infrastructure topology or depict a botanical specimen or geographic map.

Project and capability nodes support hover previews, keyboard focus and persistent click/tap selection. Their explanations use the existing content sources. Career nodes link to the corresponding role; the current reading position receives gold emphasis. About retains the approved fern with field-plate leader lines, numbering and ticks. The existing portrait mask and lower-left understory remain.

Motion now combines long ambient cycles with reversible section progress. Hero, transition, About and Contact use predetermined 43–59 second alternating translations; the capability spine has a smaller 53-second drift. About annotations form a second restrained layer. Only the most relevant visible project can emit a faint signal, with a 12-second interval (15 on mobile); interaction receives a stronger single pass. Offscreen regions and hidden documents pause ambient animations.

Project connectors reveal once on row entry, and About veins draw once over 1.1 seconds. Experience activates its path as roles cross the 40–50% viewport reading band. Contact outer branches, merge, main line and endpoint activate through four scroll stages; the range is calibrated to the reachable email/CTA position, including the page bottom. Reversing scroll reverses progress. The regional graphics share `--section-progress`, `--section-energy` and bounded depth variables instead of a new global overlay.

Desktop pointer response remains restricted to the hero backdrop, capped at 3px. Mobile reduces displacement/layers and omits pointer response. Reduced motion immediately shows complete static vectors and retains functional selections, disclosure and navigation. CSS/SVG/native observers provide these effects with no new runtime dependencies. See `docs/ambient-motion-validation.md` for measured QA and limitations.

## Editing

- `src/content.ts`: sourced roles, case studies, capabilities and public contact/profile links.
- `src/App.tsx`: focused section components and native mobile/disclosure interactions.
- `src/index.css` and `src/App.css`: palette, typography, responsive layout and reduced motion.
- `index.html`: metadata, canonical and Person/WebSite structured data.
- `public`: optimized original portrait, favicon, social card, CNAME, robots and sitemap.
- `scripts/prerender.mjs`: static rendering during the build.
- `docs/content-sources.md`: source facts and conflicts resolved in favor of the owner-supplied résumé.
- `docs/audit.md`: original section decisions and design rationale.
- `archive/template`: original template, starter assets and unused vendor code retained for reference, excluded from the shipped site.

Do not add fictional metrics, sample employers or unverified project stacks. Current case panels summarize real functions and do not claim to be product screenshots. Update metadata and sitemap together if the domain changes. The social card is 1200 × 630 pixels; keep it aligned with current positioning.

## GitHub Pages

`.github/workflows/pages.yml` validates, builds and uploads `dist`. Pull requests build without deploying. Main pushes and manual dispatches deploy through the GitHub Pages environment.

For this workflow, set **Settings → Pages → Source → GitHub Actions**. The workflow and source setting have not been published or changed remotely by this task. Existing CNAME was recovered from the gh-pages branch and preserved in `public/CNAME`.

The existing branch deployment command also remains available:

```sh
npm run deploy
```

It builds and publishes `dist` to gh-pages. Choose either Actions deployment or branch deployment, not both. Hash section links avoid SPA route fallback problems when refreshed. There is no router, backend, tracking or contact-form service.

## Cloudflare Pages

Both providers use the same prerendered `dist` output. `wrangler.toml` declares the Pages project name (`mohdvara-portfolio`) and output directory; change the name if your project has a different name. No Worker or Pages Functions are required.

### Deploy from GitHub

In Cloudflare's **Workers & Pages**, create a **Pages** project and connect this repository. Use these settings:

| Setting | Value |
| --- | --- |
| Project name | `mohdvara-portfolio` (match `wrangler.toml`) |
| Production branch | `main` |
| Framework preset | None |
| Root directory | Repository root (leave blank) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Build system | v3 |

Cloudflare installs dependencies before building. The checked-in `.nvmrc` selects Node 22; use its latest patch release, which meets Vite's Node requirement. Pushes to `main` deploy production, and other branches can produce preview deployments. Do not use `npm run deploy` as the Cloudflare build command: that command publishes to GitHub Pages.

### Deploy from your computer

For a CLI upload, install dependencies and sign in to your Cloudflare account:

```sh
npm ci
npx wrangler@4 login
npm run deploy:cloudflare
```

The npm predeploy hook builds the site first, then Wrangler uploads `dist` using `wrangler.toml`. The first invocation downloads Wrangler 4 through npx; it is not a production dependency. If the Pages project does not exist, Wrangler prompts to create it; select `main` as its production branch. To target a differently named existing project without editing the file:

```sh
npm run deploy:cloudflare -- --project-name your-project-name --branch main
```

For automatic GitHub builds, create the project with Git integration from the start. Cloudflare does not support converting a Direct Upload project to Git integration later.

### Custom domain

After verifying the pages.dev deployment, add `mohd.paramasvara.online` under the Pages project's **Custom domains** and follow Cloudflare's DNS setup instructions. `public/CNAME` supports GitHub Pages only; it does not configure a Cloudflare custom domain. Canonical URLs, structured data, social-image URLs, robots and sitemap continue to use the production domain. If you choose a new production domain, update those files together.

References: [Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/), [build image and Node selection](https://developers.cloudflare.com/pages/configuration/build-image/), [Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/), [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/), and [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).

## Optional browser QA

Browser/accessibility/performance tools are intentionally outside the project dependency graph. With Google Chrome installed:

```sh
npm install --prefix /tmp/portfolio-qa --no-save playwright @axe-core/playwright lighthouse
npm run preview -- --host 127.0.0.1 --port 4173
# In another terminal:
QA_MODULES_DIR=/tmp/portfolio-qa QA_OUTPUT_DIR=/tmp/portfolio-results node scripts/browser-qa.mjs
QA_MODULES_DIR=/tmp/portfolio-qa QA_OUTPUT_DIR=/tmp/portfolio-results node scripts/systems-qa.mjs
QA_MODULES_DIR=/tmp/portfolio-qa QA_OUTPUT_DIR=/tmp/portfolio-results node scripts/motion-qa.mjs
```

The script checks 320, 375, 430, 768, 1024, 1440 and 1920px; keyboard navigation, exclusive disclosures, copy-email confirmation, menu close/Escape, anchors and refresh; console and resources; axe WCAG A/AA checks; and a no-JavaScript page. Artifacts are written to `QA_OUTPUT_DIR` (ignored `.qa/` by default). Set `QA_URL` to test another local production preview. The systems suite also checks every project/capability selection, stable diagram dimensions, career links, pointer/scroll bounds, offscreen ambient pause, completed scroll convergence, reduced motion changes, and touch selection. The motion suite checks progressive/reverse paths, slow/fast native scroll, a 30-second idle interval, one occasional signal, frame cadence and visibility-event pause/resume. Automated checks complement visual inspection, not WCAG certification.

## References used

- [Vite static deployment](https://vite.dev/guide/static-deploy.html)
- [React hydration](https://react.dev/reference/react-dom/client/hydrateRoot)
- [MDN native details disclosures](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details)
- [WCAG 2.2 reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [web.dev LCP optimization](https://web.dev/articles/optimize-lcp)
- [Google profile structured data](https://developers.google.com/search/docs/appearance/structured-data/profile-page)

Earlier validation is documented in `docs/validation.md`; those results describe the earlier revision. For the polish pass, the owner-linked Frontend App Builder, Frontend Testing & Debugging, and React Best Practices instructions were read and applied selectively to the existing design. Browser QA used Playwright with Chrome because the Browser plugin was unavailable.

## Curated public GitHub evidence

`PublicEngineering` adds two inspectable source examples after Selected Work. It uses the existing editorial palette, thin branching dividers and shared once-only reveal; it does not add a new motion controller, interactive graph or header navigation item. The existing Work navigation indicator also covers this subsection. Repository details and source links remain visible without hover or JavaScript.

Verified without authentication on **7 October 2026**:

- [nodejs-hotel-problem](https://github.com/MohdVara/nodejs-hotel-problem): public, non-fork, non-archived. Its README, `src/controllers/ApiController.js` and `test/test.js` support the interview-experiment label, occupancy rules, reusable constraint parser and valid/rejected request tests. This is not presented as a production service or a current dependency recommendation.
- [mohdvara.github.io](https://github.com/MohdVara/mohdvara.github.io): public, non-fork, non-archived. Explicitly included as a meta/example: its public README/package/source document React, TypeScript, Vite, prerendering, native disclosures, themes and production-artifact checks. The claims describe publicly inspectable features rather than unpublished local additions.
- [MohdVara profile](https://github.com/MohdVara): the final “View more public work” destination. All three displayed destinations returned HTTP 200 without authentication.

Two entries were chosen instead of padding to three. Public discovery inspected both repository-list pages and author PR search. Unmodified forks were excluded; Sanity/Gatsby starters, the Next.js comments demo and `starter-template-check` do not establish original engineering depth. `continuous-integration-travis` and its small PRs are learning material, not sufficient evidence for a contributions area. The old site and résumé repository are not code evidence. The hostel presentation README explicitly describes unmaintained, non-production code; the house-sale student project, scaffolded Edulo README and practice-derived Ruby server were not selected. No private repositories or authenticated history were queried, so no private item names are recorded. No “open-source contributions” claim is made.

### Build data and fallback

Every `npm run build` first runs `scripts/public-github.mjs`, including Cloudflare Pages builds that use that command. `npm run refresh:github` can refresh the snapshot separately. No remote hosting configuration was changed.

- `scripts/public-github-curation.mjs` is the small explicit editorial allowlist. New items require source review; metadata discovery never automatically adds repositories.
- The fetcher calls only `https://api.github.com/repos/MohdVara/<allowlisted-name>`, unauthenticated, with an eight-second timeout. It requires `private === false`, `visibility === 'public'`, exact owner/name/URL, non-fork, non-archived and non-empty metadata. The portfolio is a deliberate exception to the portfolio exclusion rule.
- Only minimal normalized fields are written to `src/data/public-github.json`: editorial copy, technologies, primary language, public URL and verification timestamp. No raw API payloads, code, commit history, stars/forks or credentials are stored. API descriptions do not override reviewed copy.
- Network/server/rate-limit failures may reuse a previously verified, exact-URL allowlisted snapshot for up to 30 days. Its timestamp is not extended. Without a valid snapshot, the item is omitted and the profile CTA remains. This is a prior public verification, not a claim of a fresh check during an outage.
- Private/fork/archive/empty responses and explicit access failures (including ordinary 403/404) omit the item immediately, even when cached. An unauthenticated API cannot distinguish a removed repository from one made private; both are omitted.
- No token is required or supported. There is no `VITE_GITHUB_TOKEN`, authentication header, GitHub SDK, browser fetch or polling. TLS certificate verification is enabled even if the execution environment supplied a disabled verification setting.

The checked-in snapshot keeps development/prerendering functional offline. Refresh and review it before publishing; the generator updates it during the build. A change in visibility can only be detected at a successful build-time verification, so the deployed static site must be rebuilt to update links. No private content is retrieved or serialized.

### Public engineering QA

`tests/public-github.test.mjs` exercises visibility/identity filtering, forks/archives/empty repositories, normalized missing metadata, no authentication, outage fallback, expiry, wrong URLs, explicit access failures and rate limiting.

```sh
QA_MODULES_DIR=/tmp/portfolio-qa QA_OUTPUT_DIR=/tmp/portfolio-public-github-qa node scripts/public-github-qa.mjs
```

The focused browser suite checks seven widths in both palettes, keyboard focus, 44px link targets, touch popup behavior, external-link semantics, oversized names/descriptions, no runtime GitHub API calls, axe A/AA checks and static no-JavaScript rendering. External destination availability is checked separately without authentication; the touch navigation check intercepts the destination to isolate popup behavior.

Validated locally on 7 October 2026: build, TypeScript, lint and all 15 tests passed. The focused Chrome suite passed all 14 viewport/theme cases (320, 375, 430, 768, 1024, 1440 and 1920px, light/dark), with zero detected axe violations, console errors, oversized-content overflow or runtime GitHub API requests. Touch popup and no-JavaScript checks passed. Desktop dark and mobile light screenshots were inspected. Missing API descriptions/languages and low/no stars are handled by reviewed editorial copy and omitted counters; normalization tests cover absent metadata. Archived/fork/access/failure cases were tested with mocked API responses rather than querying private repositories.

Bundle comparison against the preceding local motion pass: JavaScript 179,379 → 182,311 raw bytes and 56,956 → 57,730 Node-gzip bytes; CSS 37,898 → 39,576 raw bytes and 8,069 → 8,328 gzip bytes. Combined gzip growth is **1,033 bytes**. No runtime dependency was added. Lighthouse and field Web Vitals were not remeasured for this integration. Artifacts are in `/private/tmp/portfolio-public-github-qa/`; no commit or deployment was performed.

The existing full-site Chrome regression also passed all seven widths: native navigation/deep-link refresh, keyboard, exclusive disclosures, email copy, responsive themes, resources and no-JavaScript content. No overflow, console errors or failed resources were detected. Axe reported zero detected violations; some full-site color-contrast checks remained incomplete and require manual review. Physical devices and Safari/Firefox were not tested for this integration.

## Conversion and content hierarchy polish

The 7 October 2026 polish keeps engineering credibility first: Hero retains **Explore my work** as primary and **View résumé** as secondary, with LinkedIn/GitHub as text links. Contact now uses **Book a conversation**, with direct email and quieter professional links. The Cal.com destination stays `https://cal.com/mohd-paramasvara/discovery`; its public configuration currently defaults to 30 minutes, with 60/90-minute options. No 20-minute promise is made and no provider setting was changed. A 20-minute introductory format would require updating the event in Cal.com. Public booking fields indicate name/email, optional notes and a hidden optional phone field; the portfolio adds no form, account requirement or provider embed.

Selected Work uses **View engineering details** and retains native inline expansion. One contextual **Discuss a similar problem** link appears inside the insurance case study. Public Engineering explains its verifiable domain-rule/test/frontend signals and retains the two reviewed public repositories. External professional CTAs now consistently use normal anchors with new-tab notices and `noopener noreferrer`.

Experience descriptions prioritize ownership and scope. Shared 01–04 references connect career-path nodes with role entries; the active path node has an accessible current-location indicator. Four always-visible capability summaries make the disciplines understandable before interaction, while existing practice exploration remains available. About explains domain rules, data and delivery rather than repeating sectors from the résumé; illustration opacity increased from .35 to .39 (about 11%). The completed desktop Contact route is aligned toward the conversation action.

At the owner's follow-up request, two lightweight code-native header SVGs fill the open areas beside Selected Work and Public Engineering. They combine branching paths, leaf-vein forms and restrained system nodes, using existing gold/theme values. They are decorative, non-interactive and static; mobile retains a compact simplified route without the secondary leaf branches. No library, raster asset, new animation loop or extra scroll listener was added.

Title, metadata and the 1200×630 social image were reviewed and already communicate Principal Full-Stack Engineer, technical leadership and architecture. No analytics infrastructure exists in the local project, so no conversion event helper or tracking was introduced. No uncertain availability, testimonials, metrics or client proof was added.

Validation includes build, TypeScript, lint, 15 tests; seven-width Chrome regression in both palettes; a 14-case simulated recruiter/CTO/consulting journey suite (`scripts/conversion-qa.mjs`); keyboard focus, touch résumé/scheduling popups, direct email and no-JavaScript conversion links; all career anchors and capability selections with stable selection dimensions. A five-second Hero and thirty-second six-section walkthrough were captured for heuristic visual review, not measured user-comprehension research. Public source, profile, LinkedIn, résumé and scheduling destinations returned HTTP 200 without authentication; both surfaced GitHub repositories again reported `visibility: public` and `private: false`.

Repeat the focused journey checks with:

```sh
QA_MODULES_DIR=/tmp/portfolio-qa QA_OUTPUT_DIR=/tmp/portfolio-conversion-qa node scripts/conversion-qa.mjs
```

Artifacts are in `/private/tmp/portfolio-conversion-qa/` and `/private/tmp/section-graphics-*.png`. No new runtime dependency, deployment or commit was added. Lighthouse/field Web Vitals were not remeasured for this polish.

Final SVG placement was checked at all seven widths in light/dark, with desktop/tablet/mobile screenshots inspected. Compact mobile routes occupy the existing header padding and do not add section height. The final whole-page regression detected no overflow, console errors or failed resources and zero axe violations; some full-site color-contrast checks remained incomplete. The graphics are `aria-hidden`, unfocusable and use `pointer-events: none`. Physical-device and Safari/Firefox testing was not performed.

The subsequent SVG consistency refinement applies the shared header treatment to Selected Work, Public Engineering, Experience and Capabilities. All four use the same 170px desktop illustration frame, placement, stroke, theme opacity and compact mobile treatment; the Public Engineering-only vertical offset was removed. Short desktop headers reserve room for the illustration so it cannot spill into the content. Hero, About, career, capability and Contact graphics retain their section-specific roles. Chrome checks at seven widths in both themes found no header text/SVG overlap or horizontal overflow; build, TypeScript and lint passed.
