# Localization editorial triage — 22 October 2026

Original warnings: **98**. Final warnings: **98**, validation errors **0**. Eleven locales retained in registry order (Tamil after Arabic), 1455 units each; missing/stale **0/0**, human-reviewed **0**. Standards were not relaxed and warnings were not suppressed to imply approval.

| Priority | Rows | Classification and action |
| --- | --- | --- |
| P0 | 0 identified in warning set | No warning row demonstrates false employment, ownership, release status, security clearance or contact meaning. This is heuristic triage, not a guarantee of linguistic safety across all catalog prose |
| P1 review items | 3 | Malay/German `EDGE GATEWAY · FALLBACK`; French `React interface`. Unchanged prose/interface wording needs qualified contextual review; no confirmed mistranslation or broken identifier was inferred |
| P2 | 95 | Unchanged product names, cloud/service identifiers, project-title metadata and technology lists. Usually appropriate invariants; retain recorded warnings for contextual review |

Per-locale warning rows: ms: 11, ar: 9, ta: 9, ja: 9, zh-Hans: 8, es: 9, fr: 12, de: 11, pt-BR: 11, hi: 9. Every row is retained in `PME-V1-TRANSLATION-REVIEW.json`; the only warning class is unchanged English. The warning validator is not a semantic translation checker. Names include Active Storage, Google Cloud (GCP), MMCATS Modern, Incident Zero, No Two Mondays, System Defence and author names; technology names should not be blindly translated.

Supported fix in this task: replace the now-incorrect “modern evidence is local-only” paragraph across all eleven locales with public-source availability and explicit lack of application-deployment authorization. Preserve protected identifiers, current source hashes, `machine_translated` status and development-assistant provenance. Existing localized source/evidence labels were reused; no new credentials/provider was needed. Direct modern source and public acceptance-report links work in every locale.

Fresh extraction, validation, strict coverage and date audit pass. Existing multilingual browser QA: 88 layouts, nine scenarios, eleven assistant-boundary checks, zero missing rendered source units or runtime translation requests. Case QA verifies Arabic largest text, RTL/LTR samples, Japanese writing preference and equivalent English originals. PACE professional Q&A remains `lang=en`, `dir=ltr`, `translate=no`, with state preserved and no conversation translation.

**Qualified fluent review remains NOT VERIFIED**, including critical employment/ownership/security/status/contact strings and the replacement paragraph. Translation disclosures and equivalent English access mitigate uncertainty but do not supply reviewer approval. Native shaping, terminology and mixed-direction content still require actual editorial and assistive-technology review. No catalog entry was promoted to human-reviewed.
