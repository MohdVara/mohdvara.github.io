# Portfolio case-study expansion v1

Completed locally on 22 October 2026 (Asia/Kuching). No commit, push or public deployment. Existing uncommitted owner work was preserved. This report covers the implementation, not approval to release the related applications.

## A. Implementation status

| Enhancement | Status | Scope |
| --- | --- | --- |
| MMCATS Modern | Complete | Evidence-backed case study; application public release remains blocked |
| NAAE evolution | Complete within available evidence | Interactive saved-output comparison; v0.2 reproduction labeled; no invented v0.1 image or official release dates |
| Multilingual engineering | Complete | Actual architecture, direction demo and all eleven catalogs; fluent editorial review pending |
| Quick Read | Complete | Six independent case studies plus four existing commercial cases |

## B. Routes and components

New routes follow existing conventions in every registered locale, with matching unprefixed x-default pages:

- `/{locale}/mmcats-modern/`
- `/{locale}/naae/`
- `/{locale}/multilingual-engineering/`

Main additions:

- `src/EngineeringCaseStudy.tsx` and `.css`: the three composed case-study views, architecture flows and bounded direction demonstration.
- `src/NaaeEvolution.tsx`: two-stage artifact comparison, keyboard-operable native radio selection, zoom, scrolling, configuration, downloads and missing-image fallback.
- `src/CaseStudyQuickRead.tsx` and `.css`: reusable accessible summary presentation.
- `src/CaseStudySummary.tsx`, `src/caseStudies.ts`: lazy-route summary adapter and evidence-bounded independent content model.
- `src/data/naae-evolution.json`, `public/images/naae/`: selected original assets, hashes, safe reproduction settings and font license.
- `tests/case-study-expansion.test.mjs`, `scripts/case-study-expansion-qa.mjs`: eight unit/static checks and local browser matrix.

Integration extends `Page.tsx`, `prerender.tsx`, `scripts/prerender.mjs`, `i18n/metadata.ts`, existing extraction/catalog/provenance files, `PublicEngineering`, `App`, PACE-RAG, No Two Mondays and Incident Zero. Shared summary styling is available in static HTML before JavaScript. New routes receive canonical/hreflang metadata, sitemap entries and locale-preserving links. Compact discovery cards include accurate status. Selected Work and top-level navigation remain in place.

## C. Evidence accuracy

See `CASE_STUDY_EVIDENCE_REGISTER.md` for claim-to-source boundaries.

The latest MMCATS source report is **22 October 2026**, not the earlier supplied baseline: 66 tests / 568 assertions, zero failures/errors/skips, a 38-check read-only viewer contract and local 31-check Docker/kind/Podman regressions. Earlier 21 October ARM64 evidence (61/518, isolated encrypted restores, passing resource/startup budgets) is dated separately and never used to certify the later AMD64 artifact. These are reported project executions; the portfolio task did not rerun Rails or historical applications.

Render Free preparation is implemented locally; strict emulated AMD64 load failed. Native provider acceptance, coordinated off-host recovery and public deployment are unverified. The latest web scan still reports 43 HIGH / 1 UNKNOWN findings and blocked clearance. No vulnerability-free, production-approved or historical-data-migration claim appears.

Legacy details were checked against archived source and forensic documentation. Modern business-policy/asset source corroborates the bounded policy/financial claims. PACE-RAG, No Two Mondays, Incident Zero and commercial summaries reuse the portfolio's existing approved evidence. No employer history was rewritten and no private modern source or raw reports were copied.

## D. NAAE evolution

See `NAAE_EVOLUTION_SOURCES.md` and the exact SVG/PNG hashes in `src/data/naae-evolution.json`.

| Stage | Evidence shown |
| --- | --- |
| v0.1 | Documented object allocator only; no verified output shown |
| v0.2 / renderer 0.2.0 | Saved compatible-renderer reproduction from the source workspace's v0.3 baseline export |
| v0.3 / renderer 0.3.0 | Saved Organic Borneo export |
| v0.4 / renderer 0.4.0 | Saved Pixel-Hybrid Borneo export |

The studio/package v0.4 label and internal renderer identifier are separate axes. Organic retains 0.3.0. No local Git history or tags were available, so no official release dates were invented. All selected scenes use seed 1842; framing and settings differ and are not presented as a controlled visual-quality benchmark. No new historical images were generated. Scene mode, physical printing and public studio release retain their limitations.

## E. Localization

All eleven locales remain: en, ms, ar, ta, ja, zh-Hans, es, fr, de, pt-BR, hi. Tamil follows Arabic. The existing system now has **1,455 canonical units per locale**, including **140 new units**, with **zero missing / zero stale** translations. Direct coding-assistant translations use machine provenance and source hashes; none is marked human-reviewed. No translation credentials or paid provider were used.

Validation: **0 errors / 98 editorial warnings** across the entire catalogs. Warnings and fluent editorial review remain pending. Native script, technical terminology and protected-identifier quality are not certified by coverage alone.

The existing localized disclosure, equivalent English-original links, RTL/LTR behavior and optional CJK writing controls remain intact. PACE-RAG professional questions, answers and evidence remain English-only; browser checks verify language semantics, non-English guards and conversation-state preservation across all eleven locales.

Visual review found a conditional eyebrow that had escaped AST extraction. It now uses explicit translation calls in every language, with a static regression test. The Arabic text **الموقع المهني بوصفه منتجًا هندسيًا** was verified on both the user's development server (5174) and production preview (4173). See `LOCALIZATION_CASE_STUDY_NOTES.md` for architecture, provenance and limitations.

## F. Quick Read coverage

Independent pages: MMCATS Modern, NAAE, Multilingual Portfolio Engineering, PACE-RAG, No Two Mondays and Incident Zero. Canonical summaries are 76–88 English words including project name, with problem, ownership, decision, bounded result, status, technical focus and evidence link.

Commercial cases: PolicyStreet, WenSymes, education modernization and rental management, inside their existing expandable details. These reuse already-approved project strings, label results as contributions and disclose that current production status is not independently verified. Thin historical education/HR descriptions remain conservatively scoped rather than gaining invented decisions or results.

## G. Performance and QA

| Check | Result |
| --- | --- |
| TypeScript | Pass |
| ESLint | Pass |
| Production build and prerender | Pass |
| Full unit/static suite | **161 passed / 0 failed** (eight added tests) |
| Localization extraction / validation / strict coverage / date audit | Pass; 0 missing/stale, 0 validation errors; editorial warnings disclosed above |
| New localized route checks | **33**; static tests cover canonical URLs, 12 alternates, equivalent English links, fragments, styles and internal assets |
| New case responsive matrix | **72** measurements across en/ar/ta/ja at 320, 390, 768, 1280, 1920, 3840; no document overflow |
| Existing multilingual browser QA | **88** homepage layouts, nine switching/history/fallback scenarios; no page errors, runtime translation requests or missing rendered units |
| New case accessibility | **24** main-region axe scans in light/dark; **zero violations** |
| Interaction checks | Stage radio keyboard selection, range zoom, focused arrow scrolling, reset, configuration disclosure, missing artwork, RTL/LTR sample, Arabic largest text, matching English original and Japanese vertical preference pass |
| Visual review | Desktop artwork details, mobile controls, Arabic RTL and corrected Arabic eyebrow inspected; MMCATS opening inspected |
| Links | Internal generated links/assets validated; no public loopback/file CTAs; legacy GitHub and existing PACE Lab HTTP 200 |
| Whitespace | `git diff --check` passes |

Axe left contrast over the existing artwork-backed opening region incomplete. Screenshots and bounded DOM checks support review, but no universal pixel-contrast, actual screen-reader, physical-device or fluent editorial certification is claimed. No fresh Lighthouse score or production traffic claim was made.

Measured production bundle comparison against the starting working tree (raw bytes / gzip bytes):

| Artifact | Before | After | Difference |
| --- | --- | --- | --- |
| Entry JavaScript | 211,622 / 65,051 | 214,720 / 66,017 | +3,098 / +966 |
| All JS/CSS chunks | 4,638,897 / 1,411,066 | 4,979,210 / 1,524,548 | +340,313 / +113,482 |
| New lazy case-study JS | — | 16,742 / 6,348 | Route-only |
| New case-study CSS | — | 3,127 / 986 | Route-only |

The existing 215,000-byte entry budget passes without adjustment. All-chunk growth includes translated catalogs; it is not an initial-transfer measurement. The existing large-chunk warning remains. The three PNG previews total 1,454,720 bytes and load lazily only in the NAAE viewer. Original SVG downloads total 10,329,476 bytes; they are not embedded or preloaded. The whole artwork engine is never imported. Compression is local `gzipSync`, not a claim about CDN transfer or production latency.

Sanitized aggregate results are in `CASE_STUDY_EXPANSION_QA.json`; detailed screenshots/logs remain local under ignored `output/playwright/case-study-expansion/` and `output/playwright/pme/`. `PME-V1-QA.json` preserves its historical records and adds this run's explicit evidence.

## H. Commercial metrics

**Deferred — awaiting owner-provided evidence. No commercial metrics were invented.**

The owner-only evidence-gap table is ignored at `.qa/COMMERCIAL_IMPACT_EVIDENCE_GAPS.md`; it contains only project, metric category, required evidence, availability and verification requirement. No fictional KPI or public placeholder was added.

## I. Safety

Only the portfolio was modified. MMCATS, legacy, NAAE and other related project repositories were treated as read-only evidence. Historical applications were not run. Existing owner changes were preserved. No commit, push, public deployment, hosting change, new dependency, paid service, private source publication, credentials or private records were introduced. Local preview and browser verification are not deployment.

## J. Remaining work

1. Fluent editorial review of all new translations and the recorded catalog warnings.
2. Actual screen-reader and physical-device review, including mixed-direction technical text and long translated content.
3. Add authentic early NAAE snapshots or trustworthy Git/tag dates if the owner recovers them; preserve the current reproduction labels.
4. In a separately authorized MMCATS task, resolve security dispositions and obtain native provider/operational acceptance before any public application release.
5. Add quantified commercial outcomes only after owner evidence and publication review.
