# UX and localization refinement — v1

22 October 2026 · Local candidate only. No publication performed.

## Scope and baseline

Read the employer audit, twelve personas, navigation matrix, improvement backlog, release-readiness report and localization triage. Work addresses E04/E06/E07/E09 only. Career-evidence changes, résumé/CV reconciliation, independent PACE evaluation and related repositories are out of scope.

The initial owner change in `PORTFOLIO_CASE_STUDY_EXPANSION.md`, previous untracked audit documents and Playwright scratch were preserved. Base Git revision: `7c27a4e9aa765a6c86889aaa37e28bb688ee03a0` on main. This work is uncommitted; base SHA does not identify the modified candidate or live deployment.

Fresh baseline: eleven catalogs × 1,455 units; no missing/stale entries; 98 warnings. The local build produced an entry of 214,727 bytes, leaving 273 bytes below 215,000. One fresh public homepage read still observed `/assets/index-DOvSQCFI.js`; it was a read-only baseline check, not verification of these local changes.

## UX-01 — native disclosure/select behavior

Root cause: `changeLocale` loaded the catalog and changed route asynchronously, but the caller had no success result and never closed its native details disclosure. At 390×844, selecting Arabic left the panel over the English-original action. Baseline automation reproduced the intercepted pointer click.

`Experience.changeLocale` now returns true only after the catalog, language and route update succeed; false on busy/failure. The selector closes only on success. If focus remains inside, it returns to the native summary with preventScroll. Escape closes/restores focus; outside pointer dismissal restores hidden focus before the browser applies normal pointer focus; history navigation closes stale state. No menu/listbox ARIA role or focus trap was added. The native select exposes selected state and existing polite language-change announcement remains. A supplementary whole-root axe check found the trigger’s accessible name excluded its visible selected-language label. The summary now includes both the localized Language label and the native selected-language name; static checks cover all eleven locales. A failed catalog load retains the open control and reports the existing error.

A persisted Japanese vertical preference exposed React #421 on some lazy case pages during the focused test. Restoring the preference in a React transition avoids an urgent parent update interrupting boundary hydration. This is a presentation-state correction; assistant identity and conversation boundaries are preserved.

## UX-02 — two existing homepage paths

The secondary hero CTA now reads **Professional delivery** and still targets #work. The existing first project shortcut now reads **Independent engineering** and targets #public-engineering, replacing the individual NTM shortcut. PACE and Incident Zero shortcuts remain; NTM remains in the independent section. No new menu, hero section, carousel or animation was added. Résumé/contact and existing commercial claims are unchanged. Both destinations remain available in static HTML and all ten non-English locales.

## UX-03 — concise contextual Quick Read actions

`CaseStudySummary` supplies a semantic action row to the existing Quick Read component. MMCATS links architecture, verification and sources/limitations; NAAE links saved artwork comparison, rendering concepts and limitations; multilingual links architecture, direction sample and language boundary; PACE links architecture and evaluation/limits; NTM links architecture, verification and evidence; Incident links synthetic evidence. Existing source/live-game destinations remain where already accurate. No MMCATS or NAAE live-app action was invented.

The adjacent duplicate engineering contents row was removed. Commercial Quick Reads now jump to their existing delivery-decision details rather than duplicating the nearby full-CV action. All target IDs are static and tested. Action links have visible focus, 44px minimum height, wrapping logical layout and horizontal control presentation under CJK vertical mode. Sticky-header anchor offset is applied without a custom scroll animation. Summary prose and result/limitation fields were not expanded.

## Localization and review boundaries

See `LOCALIZATION_REVIEW_PROVENANCE.md`, `TRANSLATION_EDITORIAL_REVIEW_QUEUE.md` and `verification/portfolio-translation-editorial-v1.json`. Candidate has 1,458 units × eleven locales, no missing/stale translations, and 97 retained warnings: 95 T3 identifiers, two pending T2 labels. One Portuguese T1 and one French T2 were corrected; 30 translations of new functional UI labels were added. All remain machine-translated. The critical queue contains 210 selected locale/key pairs, not a claim that the entire catalog was certified.

## Performance and architecture

The first implementation measured 215,210 entry bytes and failed the unchanged limit. Moving existing language-control code to the existing i18n-core chunk keeps the entry within budget without deferring those controls or hiding their startup cost. No runtime dependency or budget increase. Main and i18n-core are both initial resources; their combined cost is reported below, not called a total-load reduction. Case actions remain in existing lazy case routes, and NAAE image/engine loading stays separate.

Final entry: **209,235 raw / 64,539 gzip bytes**. Localization core: **273,623 raw / 67,569 gzip**. Combined two chunks: **482,858 raw / 132,108 gzip**. Baseline log rounds these chunks to 214.72 kB + 267.42 kB; exact baseline entry is preserved in baseline.json. No performance speedup is inferred from this regrouping.

## Verification

| Check | Result |
|---|---|
| Typecheck | PASS |
| Lint | PASS |
| Production build/prerender | PASS |
| Unit/integration tests | PASS — 164 |
| Focused browser | PASS |
| Existing eleven-locale browser | PASS |
| Static route/SEO/internal fragment audit | PASS — 108 routes, 0 issues |
| Localization validation/strict coverage/date audit | PASS; 97 editorial warnings retained |
| Qualified linguistic / screen-reader / physical devices | NOT VERIFIED |
| Production deployment | NOT PERFORMED |

The full existing locale and case suites ran after the hydration correction; the final subsequent change only amended the language-summary accessible name. That name is checked in all eleven static locales, in the focused locale matrix and in whole-root homepage axe. No full-suite result is represented as a new human accessibility assessment.

Raw logs/screenshots: ignored `output/playwright/ux-localization-v1/`. Before/after assertions are deterministic browser tasks, not employer feedback. Axe incomplete contrast findings remain contextual review items; zero violations is not WCAG certification. Saved settings, provider cache, network and browser versions limit any performance comparison. Initial sandbox SWC cache failures were resolved using a repo-local cache; approval-service quota interruption was later resolved and testing resumed.

## Evidence integrity and safety

Canonical employment history, dates, outcomes and ownership were not changed. MMCATS security/deployment restrictions, NAAE reproduction labels, NTM historical scope, and PACE English-only Q&A remain. No human review metadata fabricated. No related-repository writes, dependency changes, tracking changes, hosting modifications, commits, pushes, deployments, real bookings or emails.

Remaining work: qualified review of the prioritized translated claims and two pending gateway labels; actual screen-reader/physical-device review; owner review of the exact uncommitted candidate before any separate publication authorization. No publication is authorized by passing these checks.

Existing case-study suite: PASS — 33 routes, 72 layout checks, 24 main-region axe scans, 3 interaction groups, 0 page errors. NAAE keyboard stages/zoom/panning/reset/configuration, failed-image fallback, Arabic English-original and Japanese writing mode remain functional. All axe violations zero; contrast incomplete retained.

Scoped whitespace check passes for this task’s tracked changes and new files. Repository-wide git diff --check flags pre-existing trailing whitespace in the owner’s PORTFOLIO_CASE_STUDY_EXPANSION.md edit, preserved byte-for-byte rather than silently changed.
