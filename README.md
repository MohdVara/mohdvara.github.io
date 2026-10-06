# Mohd. Paramasvara — engineering portfolio

React + TypeScript + Vite, served as a static GitHub Pages site at **https://mohd.paramasvara.online/**. The repository is a user site (`MohdVara/mohdvara.github.io`), so the Vite base is `/` for both github.io and the existing custom domain.

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

Desktop portrait depth is capped at 16px; mobile and reduced-motion users receive a stable portrait. A shared IntersectionObserver reveal enhances major visual groups once, with all prerendered content visible before JavaScript. Navigation tracks the reading position, including Contact at the page bottom. Experience uses a small reading-position marker without dimming role text. Email copying has inline success or failure feedback and retains the mailto link.

`src/usePortfolioMotion.ts` owns the reveal and reading-position observers and the passive, requestAnimationFrame-throttled portrait listener. Effects clean up observers, listeners, and animation frames. Motion uses native APIs with no added runtime dependencies.

## Borneo visual identity

The portfolio uses two restrained natural motifs: abstract frond/leaf-vein geometry and branching river/network lines. `src/NaturalGraphics.tsx` contains two reusable SVG primitives, with composition-specific variants for the transition, capabilities, and contact; `src/NaturalGraphics.css` controls placement, theme colors, and responsive density. These are illustrative forms, not a botanical specimen, mapped coordinates, or assertions about project architecture.

About supplies the strongest botanical anchor and the existing Sabah/Borneo context. The hero has faint botanical lines and the existing transparent portrait, without a rectangular panel; a CSS mask softens the shoulder baseline and left edge, with a faint understory branch at the lower left, Selected Work keeps its engineering diagrams with a fine grid texture, Experience gains a thin reading axis, and Contact uses a faint converging network. Narrow screens omit hero and capabilities backdrops and shorten the transition. All six inline SVG instances are decorative and hidden from assistive technology. The transition's primary path draws once using the existing section observer; reduced-motion and no-JavaScript visitors receive the static final drawing. No graphical libraries, image downloads, or additional scroll listeners are involved.

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

## Optional browser QA

Browser/accessibility/performance tools are intentionally outside the project dependency graph. With Google Chrome installed:

```sh
npm install --prefix /tmp/portfolio-qa --no-save playwright @axe-core/playwright lighthouse
npm run preview -- --host 127.0.0.1 --port 4173
# In another terminal:
QA_MODULES_DIR=/tmp/portfolio-qa QA_OUTPUT_DIR=/tmp/portfolio-results node scripts/browser-qa.mjs
```

The script checks 320, 375, 430, 768, 1024, 1440 and 1920px; keyboard navigation, exclusive disclosures, copy-email confirmation, menu close/Escape, anchors and refresh; console and resources; axe WCAG A/AA checks; and a no-JavaScript page. Artifacts are written to `QA_OUTPUT_DIR` (ignored `.qa/` by default). Set `QA_URL` to test another local production preview. Automated checks complement visual inspection, not WCAG certification.

## References used

- [Vite static deployment](https://vite.dev/guide/static-deploy.html)
- [React hydration](https://react.dev/reference/react-dom/client/hydrateRoot)
- [MDN native details disclosures](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details)
- [WCAG 2.2 reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [web.dev LCP optimization](https://web.dev/articles/optimize-lcp)
- [Google profile structured data](https://developers.google.com/search/docs/appearance/structured-data/profile-page)

Earlier validation is documented in `docs/validation.md`; those results describe the earlier revision. For the polish pass, the owner-linked Frontend App Builder, Frontend Testing & Debugging, and React Best Practices instructions were read and applied selectively to the existing design. Browser QA used Playwright with Chrome because the Browser plugin was unavailable.
