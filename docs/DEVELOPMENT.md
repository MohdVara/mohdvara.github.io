# Portfolio development guide

This repository builds the static portfolio at [mohd.paramasvara.online](https://mohd.paramasvara.online/en/). Start with the [README](../README.md) for the work and source map. Earlier implementation reports are historical evidence, not current deployment status.

## Local setup

Use the Node 22 line from [`.nvmrc`](../.nvmrc), at least 22.13, and npm. CI uses Node 22. Install locked dependencies with `npm ci`, then run `npm run dev`.

No account or service credential is needed for a local portfolio preview. `npm run build` refreshes public GitHub metadata and prepares assets from the pinned PACE-RAG package, so a build can require network access. Review generated data changes before committing.

On restricted macOS environments where SWC cannot write its default native cache, use the established writable-cache override:

```sh
SWC_NATIVE_BINDING_CACHE=/private/tmp/palda-swc npm run build
```

## Validation

Run from the repository root:

```sh
npm run typecheck
npm run lint
npm run build
npm test
npm run i18n:validate
npm run i18n:coverage -- --strict
npm run i18n:audit-dates
npm run artwork:check
npm run assets:check
node scripts/release-readiness-audit.mjs
```

Tests inspect `dist`, so build first. Validation covers static content, internal fragments, routes, assets, structured data and bundle budgets. Automated results do not certify fluent translations, assistive-technology behavior or independent application acceptance.

### Browser checks

Browser QA tools are intentionally outside application dependencies. With an existing Playwright/Chrome installation, start `npm run preview -- --host 127.0.0.1 --port 4173`, then supply its module location and a task-specific output directory:

```sh
QA_URL=http://127.0.0.1:4173 \
QA_MODULES_DIR=/absolute/path/to/qa/node_modules \
QA_OUTPUT=output/playwright/local-review \
node scripts/palda-evidence-qa.mjs
```

The evidence runner optionally accepts `QA_AXE` pointing to `axe.min.js`. Use separate output directories for [`i18n-qa.mjs`](../scripts/i18n-qa.mjs), [`loader-qa.mjs`](../scripts/loader-qa.mjs) and [`palda-loading-qa.mjs`](../scripts/palda-loading-qa.mjs). Loading checks distinguish visible obstruction from hidden loader markup. Raw screenshots and diagnostics belong in ignored output.

## Editing and localization

Professional facts live in [`src/content.ts`](../src/content.ts), with provenance in [content sources](content-sources.md). Route JSX and [`src/caseStudies.ts`](../src/caseStudies.ts) own independent case copy. Keep capabilities, ownership, historical measurements and verification limits consistent with their sources.

English is canonical. All visitor-facing changes must preserve the eleven registered locales, machine-translation disclosures, equivalent English links, protected identifiers and source date precision. See [`AGENTS.md`](../AGENTS.md) for the complete policy.

```sh
npm run i18n:extract
npm run i18n:translate
npm run i18n:validate
npm run i18n:coverage -- --strict
```

Translation sync requires explicit `OPENAI_API_KEY` and `OPENAI_TRANSLATION_MODEL` authoring credentials. Preserve human-reviewed text and accurate source hashes/provenance; machine output is not human review. Professional PACE-RAG questions, answers and evidence remain English-only. Change the source package in its own repository rather than editing generated assistant assets here.

## Public assets

Vite copies everything in `public/` into production, including files the UI never references. [`scripts/public-assets.json`](../scripts/public-assets.json) is the reviewed inventory; `npm run assets:check` rejects unexpected or missing files, and the build runs it first. Generated assistant assets have a separate pinned-package integrity check.

Keep source-only portrait originals in `assets/source/`. Keep exported career documents, backups, raw captures and diagnostics in ignored output. Repository `docs/`, `verification/`, `archive/` and `assets/source/` do not enter `dist`. Review any new public asset and its references before adding it to the inventory.

## Optional analytics

Copy [`.env.example`](../.env.example) to `.env.local` only if configuring optional services. The PostHog browser token and ingestion host are public build values; never use a personal API key. Variables prefixed `VITE_` become browser-visible. Authoring credentials must never use that prefix.

Analytics defaults off. The utility rail’s privacy panel lets visitors grant or withdraw consent; DNT/GPC and excluded environments remain respected. The SDK is optional and failure must not block content. Session recording is disabled. See [`src/analytics.ts`](../src/analytics.ts) for the implementation and [earlier operational notes](reference/README_IMPLEMENTATION_HISTORY.md#posthog-analytics) for the event/configuration detail.

## CI and hosting

[`.github/workflows/pages.yml`](../.github/workflows/pages.yml) is named **Portfolio CI**. Despite the historical filename, it has no Pages deployment job: main pushes, pull requests and manual runs validate the project with read-only repository permissions.

Cloudflare Pages is the production provider. The existing Git integration is independent of GitHub CI; its build command is `npm run build`, with output `dist` and production branch `main`. [`wrangler.toml`](../wrangler.toml) names the project `mohdvara-portfolio`. CI success does not establish the deployed SHA or live artifact parity.

The legacy `npm run deploy` command targets GitHub Pages and is not the production procedure. The separate `npm run deploy:cloudflare` command invokes a build and Wrangler upload; publication should follow the owner’s authorized hosting path. DNS or provider settings are not changed by local validation.

The footer resolves its revision during the build from `CF_PAGES_COMMIT_SHA`, `GITHUB_SHA`, or local Git, and links the short displayed ID to the full GitHub commit. It makes no browser request to a moving branch head. Missing or invalid revision metadata hides the link.

## Historical evidence

[PALDA v1.3](portfolio/PALDA_V1_3.md) records the evidence-first hierarchy and loading investigation. Its [manifest](../verification/portfolio-evidence-first-v1.3.json) retains exact measurements and scope. The [earlier README](reference/README_IMPLEMENTATION_HISTORY.md) preserves previous implementation details; its dated counts and publication statements are snapshots.


## PME v1.7.1a release tooling

Use the exact Node 22.23.4 patch in `.nvmrc` (`nvm install && nvm use`); clean installs/builds were verified with npm 10.9.9. `npm run check:runtime` enforces the supported Node 22 minimum; source configuration does not verify or change the Cloudflare dashboard runtime.

`npm run lint:app` is the maintained application/tooling gate: original TypeScript ESLint rules and .mjs tooling syntax checks. Only the exact generated Entire integration in `verification/generated-integrations.json` is classified separately; unknown changes to it fail the boundary check. `npm run lint:generated` reports its five upstream no-explicit-any errors and syntax/provenance verification. `npm run lint` and `npm run lint:full` retain the original repository-wide command and currently fail on those five errors. The generated implementation is not hand-edited, no global rule is disabled, and authored integration files remain linted. CI gates on application lint and visibly reports generated/full diagnostics independently.

The current pinned assistant is `1.6.2-closure.2`. Its progress controls/status labels are localized; questions, answers and evidence remain English-only. See [release closure](portfolio/PME-V1.7.1A-RELEASE-CLOSURE-RESULTS.md) for the complete paired-artifact, deployment and rollback procedure.
