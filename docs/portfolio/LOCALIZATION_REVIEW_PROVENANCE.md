# Localization review provenance — UX refinement v1

22 October 2026. Eleven locales retained: en, ms, ar, ta, ja, zh-Hans, es, fr, de, pt-BR, hi. Tamil remains immediately after Arabic. English is canonical.

Baseline: 1,455 units per locale, zero missing/stale, 98 warnings. Candidate: **1,458 units**, zero missing/stale, **97 warnings**. The three added functional units are Professional delivery, Compare artwork and Delivery decisions, translated into all ten non-English catalogs. Existing canonical career, ownership, chronology, commercial results and deployment restrictions are unchanged.

All catalog units were checked mechanically with the existing placeholder, protected-identifier, markup, bidi-control and source-hash validation. A selected set of 21 consequential keys × ten locales is queued with full texts and intended meanings. This is not a line-by-line fluent certification of 14,580 strings. Prioritized status/disclaimer translations were inspected for obvious scope/negation concerns with model assistance; unsupported stylistic alternatives remain reviewer questions.

## Warning disposition and corrections

Original warning set: 95 T3 preserved identifier rows, two T2 unchanged gateway/fallback labels, one T2 French interface label. French correction removes one unchanged-English warning; final set is 95 T3 + 2 T2. No warning class is suppressed. An additional Portuguese T1 joined-word defect was found outside the unchanged-English warning set. T0: none diagnosed. T1: one corrected. T2: one corrected and two pending. These counts describe diagnosed issues/validator rows, not linguistic error prevalence.

| Locale | Key | Before | After | Basis |
|---|---|---|---|---|
| fr | React interface | React interface | Interface React | Normal French noun followed by the protected product name; editorial T2 correction. |
| pt-BR | React interface | Reactinterface | Interface React | Restore readable separation and Portuguese interface label; T1. |

Each new/changed translation retains `status: machine_translated`, current SHA-256 of canonical English, `provider: coding-assistant`, `model: session-model`, `method: direct-generation` and this task ID. These are authoring provenance, not a claim of API model identification, human review or owner approval. Existing unrelated metadata and source hashes are preserved. Human-reviewed entry count remains zero; no reviewer names, dates, certifications or accuracy percentages were invented.

The exact 32 locale/key changes (30 new labels plus two corrections), prior provenance and before/after texts are in the ignored `translation-changes.json`; the portable refinement manifest contains the same change records. `verification/portfolio-translation-editorial-v1.json` retains warning and review detail. Mechanical statuses in that queue do not replace catalog provenance.

## Boundaries

Machine-translation disclosures remain present, compact by default, with corresponding English access. No disclaimer was weakened. PACE professional conversation stays English/LTR/horizontal/translate=no, and neither questions nor answers enter translation catalogs. No career ambiguity was reconciled, résumé edited, or separate project repository modified. Rendered script/layout checks and technical dates are separate from qualified language review. Screen readers, physical devices and qualified fluent review remain NOT VERIFIED until actual evidence exists.
