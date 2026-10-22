# Portfolio release readiness — 22 October 2026

**RELEASE BLOCKED — EVIDENCE OR DEPLOYMENT MISMATCH.** The local technical candidate passes its checks. The current source is eligible for owner preview/review, with qualified critical-content editorial review still NOT VERIFIED. This is not unconditional publishability and is not a verified public deployment.

## Candidate and parity

- Repository: `/Users/mohd.vara/Projects/Personal/mohdvara.github.io`; branch `main`; local HEAD and freshly queried GitHub `main`: `44fdbb392a56c9cb736e29997871ed947519243f`.
- GitHub was queried through the connected GitHub API, without fetch or remote mutation. `src/EngineeringCaseStudy.tsx` returns 404 at that immutable commit. The expansion lives in the dirty working tree, not unpublished commits or another branch. Initial inventory: 130 changed/untracked paths. The machine manifest records the initial inventory and final source file hashes. Existing owner work remains intact.
- Source SHA-256: `16c3c82be9403667414d4a234dbd7a2ee1ed8dc746427abac90170d9ae045e05`. Scope: Sorted git tracked + nonignored untracked path/SHA256 pairs; excludes docs/, verification/, output/, .playwright-cli/ to avoid report self-reference. Includes build scripts, lockfile, vendor, public assets and source.
- Built artifact SHA-256: `a12d2f32868c2034eb53b846bf5a39c478a8fdd246ec6ba8135955290d06e99f`. Exact per-file SHA-256, route HTML hashes, lockfile hash and build timestamp are in `verification/portfolio-release-readiness.json`. This identity describes this dirty source snapshot, not a Git commit. Ignored environment values are not disclosed; the build is identified by its output, not claimed byte-reproducible across arbitrary environments.
- Node v23.11.0, npm 10.9.2; existing lockfile/install and pinned local vendor tarball used. No install/dependency change. CI config specifies Node 22; a fresh Linux CI execution is pending.
- Public domain: 108 intended URLs checked over HTTP; **102 return not-found HTML**, six older unprefixed pages remain. All eleven locale homepages and all localized new cases are absent. The live entry is `/assets/index-D_YMW02E.js`, versus local `/assets/index-Bzew5xyJ.js`. Live commit/artifact identity remains unknown. Five older public pages plus the missing localized MMCATS page were refreshed in Chrome; zero runtime errors observed. Script loading alone does not prove all hydration features.

## Hosting and sitemap

`.github/workflows/pages.yml` builds `dist/` and deploys through GitHub Pages on main push or workflow dispatch, excluding PR deployments. `npm run deploy` is a separate gh-pages branch command. `wrangler.toml` names `mohdvara-portfolio`, output `./dist`; `npm run deploy:cloudflare` invokes Wrangler. `public/CNAME` names the custom domain. These configurations coexist; none proves current domain ownership or origin deployment.

Cloudflare HTTP headers are observed. They may reflect a proxy and do not establish Cloudflare Pages, its project, production branch, deployed SHA, or build settings. The unauthenticated GitHub Pages metadata endpoint returns 404; it does not prove Pages is disabled. **Identify the domain-serving project before publication. A push may already trigger one or both providers.**

`public/sitemap.xml` is a six-route legacy input. The build copies public assets and then `scripts/prerender.mjs` replaces `dist/sitemap.xml` with 108 generated URLs (nine families × English/unprefixed and eleven locales). Local canonical/hreflang, x-default and sitemap agree; zero generated local target/fragment defects. The live sitemap still has six URLs. No manual generated-sitemap edit is appropriate; publish the full built output through the correct provider.

## Defects and changes

| Priority | Finding | Disposition |
| --- | --- | --- |
| P0, public parity | 102/108 intended public routes return 404; live site lacks candidate | Open; publish only after exact owner approval and provider confirmation, then public smoke test |
| P1, evidence | MMCATS page falsely described newly public modern evidence as local-only; modern source/report absent | Fixed locally in `src/EngineeringCaseStudy.tsx`, all eleven catalogs and provenance; direct modern source and acceptance links; bounded deployment warning retained |
| P1, release governance | Domain-serving origin and automatic deployment source are not verified | Owner/provider evidence required; do not guess a deploy command |
| P1, editorial review | Three unchanged interface/prose labels; critical multilingual fluency unverified | Retain machine provenance; see editorial triage; no invented editor approval |
| P2, performance | 280-byte entry headroom and existing large optional chunk | Budget unchanged; avoid initial-JS additions |

`tests/case-study-expansion.test.mjs` now guards modern source/report links and publication/deployment separation. `scripts/release-readiness-audit.mjs` repeats built-artifact link/SEO/fingerprint checks, HTTP parity and rendered journeys. Existing browser scripts accept `QA_OUTPUT` to keep future runs separate from historical evidence. No redesign or top-level navigation change was justified.

## Fresh verification

| Check | Result |
| --- | --- |
| TypeScript / ESLint / production build | PASS |
| Full suite after fix | 161 passed, zero failures/skips; final native execution |
| Generated routes / internal targets / fragments / canonical / 12 alternates | 108 routes; zero audit findings |
| Localization validation / strict coverage / date audit | PASS; 1455 units × 11, zero missing/stale/errors; 98 warnings retained |
| New-case browser matrix | 33 routes, 72 responsive measurements, 24 main-region axe scans; zero violations/page errors |
| Existing multilingual browser matrix | 88 layouts, nine switching/history/fallback scenarios, eleven assistant-boundary checks; zero page errors/translation requests/missing source |
| NAAE / direction interactions | Native radio arrows, range zoom, focused pan, reset, config, failed artwork fallback, reduced motion, RTL/LTR samples, Arabic largest text, English original and Japanese writing controls pass |
| Recruiter / refresh / no-JS | Five simulated journeys; eight English route refreshes; static MMCATS source/content available without JS |
| Link checks | Nine critical external destinations plus PACE Lab/source HTTP 200; email syntax inspected, no email sent; no booking submitted |
| Secret scans | Candidate allowlist and dist: no findings; no claim about all ignored files or history |
| Whitespace | `git diff --check` PASS |

A sandboxed build initially failed loading the existing SWC native cache; the full final build succeeded outside the sandbox. One browser attempt targeted inactive 4173; final QA uses 4183. A journey selector initially assumed prefixed English links; actual English navigation intentionally uses unprefixed routes and the corrected journey passes. The sandboxed final suite stalled in package-integrity filesystem work; a separate complete unsandboxed suite passed. Failed logs are retained and are not counted as passes. Prior committed/aggregate QA reports remain historical.

## Accessibility, assets and privacy

Manual semantic/focus inspection and the existing interaction scripts supplement axe. Desktop MMCATS opening was visually inspected. Actual screen-reader, physical-device, fluent editorial, exhaustive animated-background contrast and universal accessibility certification are **NOT VERIFIED**. Axe incomplete checks remain in local evidence.

Entry: 214,720 raw / 66,020 local gzip, limit 215,000 (280 bytes spare). Vite JS/CSS: 4,977,779 raw / 1,523,887 gzip, versus prior 4,979,210 / 1,524,548; scopes match Vite `assets/` only. All output JS/CSS including copied PACE worker: 5,831,872 / 1,741,760; this broader scope is not a regression comparison or initial transfer. Largest game chunk remains optional. Lazy case JS 17,003 / 6,402 gzip; CSS 3,127 / 986. PNGs 1,454,720 bytes; original SVGs 10,329,476; hashes unchanged. Font and largest-chunk inventories are in the manifest. Original download SVGs are not automatically requested; no full NAAE engine imported. Observed mobile homepage: 13 requests at the captured checkpoint, no NAAE previews/downloads or analytics provider requests; not an all-session request total.

One local mobile Lighthouse sample: 96 Performance / 100 Accessibility / 100 Best Practices / 100 SEO; LCP 2438 ms, CLS 0, TBT 42 ms; total resource byte weight 259,116. No warnings. Synthetic results under concurrent audit load are not RUM, public CWV, INP, or a statistically controlled comparison.

Consent defaults, withdrawal, DNT/GPC, disabled recording, minimization and single subscription remain intact; analytics regression tests pass. New source/report links add no events. Source review confirms no free text, configuration body, question, form value or query capture added. Local automated traffic cannot exercise the real production-domain opt-in path; that is not represented as newly live-tested.

## Decision and approval

Local build/regression/routes/coverage/security checks PASS within scope; editorial safety remains NOT VERIFIED. Deployment parity FAILS, owner publication authorization is PENDING. Full gate states appear in the manifest. The portfolio can proceed to exact-diff and qualified editorial review; it must not be called publicly verified.

No commit, push, deployment, DNS/hosting change, paid resource or related-project write occurred. No MMCATS application test/build was run. Follow `RELEASE_CHECKLIST.md`; no application release clearance is granted by this portfolio task. Detailed raw logs/screenshots are ignored under `output/playwright/release-readiness/`.

## Gate matrix

| Gate | Status | Evidence scope |
| --- | --- | --- |
| Source integrity | PASS | Mechanical source inventory, hashes, existing owner changes preserved; owner exact-diff review pending separately |
| Build correctness | PASS | Final npm run build; SWC needed unsandboxed native-cache access |
| Automated regressions | PASS | Final unsandboxed npm test: 161 pass, 0 fail/skip |
| Route completeness | PASS | 108 generated sitemap routes; all canonical/alternate/local targets/fragments checked |
| Localization completeness | PASS | 11 x 1455 units; zero missing/stale |
| Editorial safety | NOT VERIFIED | No P0 found in 98 warning rows; qualified fluent review of critical claims remains outstanding |
| Accessibility | PASS | 24 main-region axe scans, focused keyboard/semantic/reduced-motion checks; no screen-reader or device certification |
| Performance | PASS | 214720 raw entry under 215000; one local mobile Lighthouse run |
| Link correctness | PASS | Generated local links/assets/fragments; nine public critical destinations HTTP 200 plus PACE Lab/source HTTP 200; not proof of external app functionality |
| Evidence integrity | PASS | MMCATS current public README/report corroboration; historical other-project evidence remains dated |
| Privacy | PASS | Consent regression tests and code inspection; no analytics requests in observed local homepage; production-domain opt-in was not exercised |
| Security | PASS | Gitleaks candidate allowlist and dist scans clean; not dependency/security certification or Git history clearance |
| Deployment parity | FAIL | 102 intended public URLs serve 404; different entry asset; production SHA unknown |
| Owner release authorization | PENDING OWNER APPROVAL | No commit/push/deploy authorized or performed |

## Historical raw-report preservation limitation

The first failed browser attempt reused the legacy default output and replaced `output/playwright/case-study-expansion/report.json`. Its original raw JSON was not recovered or reconstructed. Historical `CASE_STUDY_EXPANSION_QA.json` and screenshots remain intact. The failed empty report is retained as `output/playwright/release-readiness/initial-default-output-failure.json`; fresh complete results are under `release-readiness/cases/`. `QA_OUTPUT` support now isolates future runs. This limitation does not turn the historical aggregate into fresh evidence.

## Subsequent commit/push authorization

After this audit snapshot, the owner explicitly requested structured commits and a push to origin. The source and dist fingerprints were rechecked before committing and matched the audited candidate. The historical manifest and no-commit/no-push statements above describe the audit-time state; they are not current branch status after this authorization. Pushing main triggers the configured GitHub Pages workflow, but its successful execution and public artifact parity still require separate verification.

Staging newly tracked files exposed inherited trailing whitespace in the original SVGs’ embedded license and `LICENSE_LIBERATION.txt`. Those bytes are preserved to retain the verified artwork hashes. The rest of the staged changes pass the whitespace check; no test threshold or global whitespace rule was relaxed. The Playwright scratch snapshot remains untracked and excluded from the commits.
