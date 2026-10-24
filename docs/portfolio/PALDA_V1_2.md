# PALDA v1.2 — Career alignment, performance and reviewer readiness

24 October 2026 · Asia/Kuching. **CLOSEOUT COMPLETE — implemented locally, with documented review and publication limits.** The two-page résumé and full CV were edited and verified externally. Repository changes remain uncommitted; no push or deployment occurred. Cloudflare settings, DNS and production configuration were not changed.

The complete field matrix and exact before/replacement text are in [CAREER_ALIGNMENT_V1_2.md](CAREER_ALIGNMENT_V1_2.md). The neutral review process is in [RECRUITER_FEEDBACK_KIT.md](RECRUITER_FEEDBACK_KIT.md). Measurements and validation are retained in [the verification manifest](../../verification/portfolio-career-performance-v1.2.json); raw captures and exports remain ignored under `output/playwright/palda-v1.2/`.

Publication follow-up — 24 October 2026: the owner subsequently authorized structured commits and a push to origin. The implementation/validation Git and publication fields below preserve their pre-commit snapshot. Consult Git history and `origin/main` for the resulting publication state. The push may trigger Cloudflare's existing Git integration; no deployment result or live artifact parity is established by this report. Raw exports, diagnostics, the owner's whitespace edit and nine initial browser snapshots are excluded from the publication candidate.

## Baseline and implementation plan

Initial/final branch `main`, HEAD `5bf7f9740e48fe6c1283c3c9ef4e9ef6e0e2e4e7`. The initial owner whitespace edit in `PORTFOLIO_CASE_STUDY_EXPANSION.md` and nine untracked `.playwright-cli` snapshots remain untouched. Fresh baseline build and 206 tests passed. The implementation plan was stated before edits: audit current career documents, measure actual startup dependencies, reduce optional work, prepare authentic-review materials, and convert the unnecessary Pages deployment to CI-only. The owner subsequently added public-asset cleanup.

Inspected `AGENTS.md`, content, App, quick reads, engagement content, locale initialization/registry, Vite/TypeScript/package configuration, workflow and Wrangler configuration, source/timeline/PALDA records, tests, prerendering, analytics, motion, scenery and asset generation. The current source and fresh build govern, rather than older performance reports. No new dependency or public-facing prose was required; all eleven locales and the existing evidence copy remain intact.

## Career documents

Authenticated Reactive Resume editors were available. Original rendered content was preserved locally and the full CV's JSON backup exported. Edits used supported form controls and autosave; fresh public reads confirmed them. All employment/project dates, engagement types, hidden entries, template, sections and typography settings were retained.

Both documents now describe WenSymes occasional collaboration and actual controlled API integrations; the approved Centre Engineer title; final technical architectural authority with stakeholder input; production quoting across up to 12 insurers; and meeting capabilities with correctly attributed Chime/S3 and older supported browsers. Summaries distinguish professional AI training data, AI-assisted engineering and independent RAG experimentation. The full CV adds qualified recalled analytics and historical collaborative HRMS configuration evidence. The short résumé intentionally omits that recalled number and keeps historical hidden entries hidden. Full CV “Advance” was aligned editorially to the current résumé's “Advanced”; this does not certify an official HR-issued title.

Public résumé/CV links remain unchanged. Final exports are **two pages / five pages**, respectively. All seven pages were rendered with pdfplumber's available renderer and visually inspected; text extraction confirms selectable text and zero out-of-page glyphs. No visible clipping or overlap was found. An initial six-page CV export revealed a nearly empty overflow page; redundant prose was shortened to restore five pages without shrinking fonts or removing career entries. Export sizes are 90,339 / 153,255 bytes. Exact hashes and text counts are in the manifest. Poppler executables were unavailable; pdfplumber rendering/extraction succeeded. Browser download-event capture timed out, but actual downloaded files were subsequently located and verified. LinkedIn was not edited.

The reusable `scripts/career-consistency-audit.mjs` checks approved wording/date presence in supplied current captures or extracted PDF text. Both public captures and final PDF text pass. It does not infer contextual attribution or replace manual review. Exact historical enhancement attribution and any separate primary WenSymes end remain unsupported; no dates were invented.

## Loading and bundle measurements

Same checkout, build pipeline and gzip level 9 for both columns:

| Metric | Fresh baseline | Final candidate |
| --- | ---: | ---: |
| Entry JavaScript raw | 214,958 | 210,686 |
| Entry JavaScript gzip-9 | 65,715 | 64,496 |
| Headroom under unchanged 215,000 ceiling | 42 | 4,314 |
| Entry and recursive static JS dependencies raw | 529,739 | 525,467 |
| Same eager dependencies gzip-9 | 145,255 | 144,036 |
| Entry CSS raw / gzip-9 | 79,466 / 15,751 | 79,466 / 15,751 |
| Generated assets JS/CSS, all lazy/localized/game chunks raw | 5,302,377 | 5,302,878 |
| Same generated chunks gzip-9 | 1,612,759 | 1,613,291 |
| Total deployed artifact bytes | 89,234,640 | 87,742,498 |

Source-map inspection found React DOM as the largest mandatory entry contributor, followed by App and motion/graphics code. i18n core remains 292,120 raw bytes and content 16,711; static content, locale initialization, route recovery and hydration were not deferred. React dependencies were not moved to a mandatory vendor chunk to manipulate the entry metric. PACE-RAG, games and analytics retain their existing optional/consent boundaries.

The input-driven pointer/parallax controller now imports on first pointer movement or scroll. The existing semantic content and static artwork are already rendered. Section reveals, reading-position navigation, keyboard controls and professional copy retain their original behavior. Reduced motion avoids the download; existing controllers still respond to preference changes after mounting. Unmount during download installs nothing; failed import leaves static artwork and disclosures usable. New lifecycle tests cover these cases. The optional chunk is 4,773 raw / 1,737 gzip-9 bytes: total generated code grows 501 raw bytes, while the eager graph shrinks 4,272. First interaction incurs an extra request; this is the explicit trade-off.

**The preferred 10 KB and stretch 20 KB headroom targets are not achieved.** The verified improvement is retained. More extensive savings would need a separate architecture change to static/hydrated sections or framework/runtime decisions; blindly splitting mandatory code would not improve loading. No dependency replacement, visual redesign or compressed source tricks were introduced.

`scripts/startup-qa.mjs` preserves a baseline artifact and compares three isolated cold Chrome contexts per build at 1440×1000, no reduced motion, identical local Vite preview settings. It waits for scenery readiness before sampling. Both load 19 resources / 10 JS requests before interaction; total resource transfer is **572,276 → 571,059 bytes** in each matched sample. The optional motion chunk is absent before input, loads on input, and remains absent under reduced motion. Blocked-chunk checks retain contact access and native case disclosure without page errors.

Readiness event observations range 328–523 ms baseline and 369–1,282 ms candidate. Script duration, task duration and heap vary materially; individual samples are retained in the manifest. These noisy local observations do **not** establish a speed or memory improvement. Sampled layout-shift totals are zero in these brief sessions, not a sitewide/RUM CLS certification. Local preview transfer differs from production compression. Node's default gzip in the static audit reports 64,662 entry bytes; it is not substituted for the level-9 comparison.

## Public-asset cleanup

Vite copies `public/` regardless of UI references. The 1,452,097-byte original glyph portrait is needed only for build reconstruction/tests, so it moved byte-for-byte to `assets/source/MohdVaraLetters.svg`. The unused 28,250-byte small portrait moved alongside it. Scripts and portrait tests now read the source location. The refined public portrait, mask, geometry and active image references are unchanged. Two Finder metadata files were moved out of public. Total artifact reduction is **1,492,142 bytes** after the small new motion chunk; this is deployment storage reduction, not initial image-transfer savings.

Career exports downloaded into the browser's current project folders during verification were moved to ignored output, including a complete CV backup and duplicate résumé PDFs. None is in the final public inventory or build. Build-only originals remain recoverable; no source history or evidence reports were deleted. Existing `docs/`, `verification/`, `archive/` and `assets/source/` do not enter `dist`, so deleting those documents would not improve the deployed site.

The reviewed 69-file inventory in `scripts/public-assets.json` is checked before each build by `public-assets-audit.mjs`. Unexpected downloads, metadata, symlinks or missing reviewed assets stop the build. PACE-RAG's generated directory retains its separate pinned-package manifest/hash validation and replacement process. Active NAAE version evidence, galleries, fonts/licenses, social images and PACE-RAG runtime/model files are required or linked and were retained. The new regression proves accidental exports and missing assets fail the inventory check.

## Recruiter readiness and CI

Current journeys remain usable: recruiters can move from seniority/selected roles to résumé and contact; managers can open ownership/decision/outcome details; architects can inspect constraints and evidence limitations. These are automated/editorial checks, not human reactions. No material discovery failure justified another UI feature. The actual-review kit supplies two neutral invitation drafts, five open questions, 30-second and two-minute exercises, separate note/quotation consent, a private recording template and factual/functional-first triage. The checked-in response register is empty. No invitations, feedback, ratings or hiring outcomes were fabricated or sent.

`.github/workflows/pages.yml` now displays **Portfolio CI**, retaining pinned checkout/setup, Node 22/npm caching, locked install, main/PR/manual triggers, existing public build variables, lint/build/i18n strict checks and tests. Explicit typecheck, date/artwork checks and the static-route audit are included. Pages artifact upload, deploy job, Pages/id-token write permissions and deployment environment were removed; concurrency is CI-specific and permissions remain contents-read. No artifact consumer was present beyond the removed Pages job. Owner confirmation establishes Cloudflare Pages as the primary production provider; repository configuration is consistent with a separate Git integration and `dist` output. No Cloudflare trigger, setting, credential or deployment changed.

YAML parses with the installed `js-yaml`; assertions pass for triggers, branch, single job, read-only permissions and 40-character action pins. `actionlint` is unavailable. Local equivalent gates pass; no GitHub execution of the edited workflow has occurred. README and current release checklist explain the independent hosting/CI responsibilities; historical audit records remain historical.

## Validation and limits

From repository root, raw results under the task output directory:

| Command / check | Result |
| --- | --- |
| `SWC_NATIVE_BINDING_CACHE=/private/tmp/palda-swc npm run build` | Baseline/final PASS; existing large-chunk warning retained |
| `npm run typecheck`, `npm run lint`, `npm test` | PASS; 210 tests, zero failures |
| `npm run i18n:validate`, `npm run i18n:coverage -- --strict` | PASS; 1,565 units, 11 complete catalogs, zero missing/stale/errors; 97 retained editorial warnings |
| `npm run i18n:audit-dates`, `npm run artwork:check` | PASS; date artifact unchanged, 11 complete artwork packs |
| `npm run assets:check` | PASS; 69 reviewed source files, no unexpected/missing files |
| `QA_OUTPUT=output/playwright/palda-v1.2/static node scripts/release-readiness-audit.mjs` | PASS; 108 routes, zero SEO/link/fragment/asset issues |
| Career consistency audit with fresh public text and final extracted PDF text | Presence checks PASS for all supplied documents |
| Workflow parse/structural assertions; scoped `git diff --check` | PASS; original owner whitespace excluded |

Existing browser scripts use Chrome and the preinstalled external QA tools, with `QA_URL=http://127.0.0.1:4206`, baseline preview at port 4207, `QA_MODULES_DIR=/Users/mohd.vara/.npm/_npx/9833c18b2d85bc59/node_modules`, and `QA_AXE=/Users/mohd.vara/.npm/_npx/2613f46d5c6aba5c/node_modules/axe-core/axe.min.js`:

- `QA_OUTPUT=output/playwright/palda-v1.2/focused node scripts/palda-qa.mjs`: 90 layouts across nine widths/light/dark/largest text, 44 localized case pairs at both small widths, 11 no-JavaScript checks, four deep-link journeys, five scoped axe scans/zero violations and zero page errors.
- `QA_OUTPUT=output/playwright/palda-v1.2/locales node scripts/i18n-qa.mjs`: 88 layouts, nine switching/history scenarios, 11 period groups and 11 English-only assistant checks; zero page errors, missing source or provider requests. Includes Arabic direction, Tamil and optional CJK vertical behavior.
- `node scripts/startup-qa.mjs` with the same module/URL environment: six matched samples plus reduced-motion and blocked enhancement recovery; passed. Static and no-JS content do not depend on the new optional chunk.

An initial candidate typecheck caught the second motion-hook consumer in Work With Me; it was updated before passing build/checks. The first public inventory run caught Finder metadata, which was moved out. The first static fingerprint audit did not handle unstaged moved/deleted paths; it now excludes nonexistent paths while still throwing other read errors, and the complete route audit passes. These failures were corrected, not counted as passes. No package/browser was installed. No physical-device, assistive-technology, fluent-language or production telemetry certification is claimed.

## Changed files and publication

Motion: `App.tsx`, `WorkWithMe.tsx`, `usePortfolioMotion.ts`, new `useOptionalMotion.ts` / `portfolioMotion.ts`, lifecycle tests and startup QA. Assets: source-image moves, portrait scripts/tests, public inventory/audit/test, package build gate. CI: workflow, README, current release checklist and fingerprint handling. Career/review evidence: source register, pending-status follow-up, current field matrix, audit script/rules, feedback kit/empty register, this report and manifest. No localized UI strings, dependency/lockfile, privacy/analytics logic or hosting configuration were edited. Build-time GitHub metadata matches the initial snapshot.

Repository changes are local and uncommitted; initial/final HEAD is unchanged. External résumé/CV edits are saved and publicly observed separately from repository status. No push, deployment, outreach, sibling-repository write or production-parity claim. Original owner work remains preserved.

Highest-value follow-ups: obtain actual voluntary recruiter/manager reviews; arrange qualified consequential-language and assistive-technology review; seek original analytics/precise historical attribution only if available; consider further hydration/runtime savings against the remaining 4,314-byte headroom; separately authorize publication and verify the resulting Cloudflare deployment identity/artifact.


## Closeout disposition

All feasible implementation and documentation work in this brief is complete. External document edits are applied; repository publication remains separate. This closeout does not claim the preferred bundle headroom target, real human feedback, qualified language review or deployment verification has been achieved.

| Deliverable | Completion evidence |
| --- | --- |
| Career alignment and exact amendments | `CAREER_ALIGNMENT_V1_2.md`; public captures and final two-/five-page PDF checks |
| Performance and recovery | Comparable baseline/candidate measurements above; lifecycle regressions and startup QA |
| Image/document cleanup | Source-only files retained outside public; 69-file publication inventory passes; 1,492,142-byte artifact reduction |
| Authentic reviewer process | `RECRUITER_FEEDBACK_KIT.md`; empty `verification/recruiter-feedback-register.json` |
| CI-only workflow | Locally edited pinned workflow; YAML/structure checks and equivalent local gates pass; remote run not claimed |
| Validation and publication boundaries | `verification/portfolio-career-performance-v1.2.json`; 210 tests / 108 routes; uncommitted and unpushed |

The earlier production-polish report now links to this follow-up while preserving its original historical results. No additional implementation, commit, push, deployment or external edit was performed while finalizing this report.
