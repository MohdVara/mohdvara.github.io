# Translation editorial review queue — UX refinement v1

22 October 2026 · English remains canonical. **PENDING HUMAN REVIEW**. This is a model-assisted triage package, not qualified linguistic approval. No T0 material semantic reversal was established; this is not proof that none exists. No professional facts were rewritten.

Machine-readable detail: [portfolio-translation-editorial-v1.json](../../verification/portfolio-translation-editorial-v1.json). It includes all 97 current warning rows and 210 prioritized critical locale/key pairs with full English/translation, intended meaning, provenance, reviewer questions and empty reviewer/evidence fields. Those 210 pairs are a selected review scope, not all catalog prose and not 210 diagnosed defects.

| Scope | Classification | Disposition |
|---|---|---|
| Material semantic defects | T0: 0 diagnosed | No security/ownership/deployment reversal demonstrated by this pass. Fluent semantic review remains open. |
| Confirmed separator defect | T1: 1 corrected | Portuguese `Reactinterface` → `Interface React`; remains machine-translated. |
| French noun/brand ordering | T2: 1 corrected | `React interface` → `Interface React`; conservative editorial edit, no human approval. |
| Unchanged edge gateway labels | T2: 2 pending | Malay and German; technical noun and fallback terminology require contextual confirmation. |
| Proper nouns/stack labels | T3: 95 retained | Individually classified; not suppressed from validator output. |

## Priority review items

Severity below is diagnosed T2 or review priority, not a false assertion that an unreviewed consequential claim is defective.

| Locale | Stable key / canonical English | Current translation | Intended meaning / concern | Suggested revision | Reviewer question | Status / provenance |
|---|---|---|---|---|---|---|
| ms | `EDGE GATEWAY · FALLBACK` | EDGE GATEWAY · FALLBACK | Edge gateway and fallback path; unchanged English UI words may be unnatural. | None asserted | Is the local technical term clearer than the English loanword in this architecture label? | HUMAN_REVIEW_PENDING; machine_translated |
| de | `EDGE GATEWAY · FALLBACK` | EDGE GATEWAY · FALLBACK | Edge gateway and fallback path; unchanged English UI words may be unnatural. | None asserted | Is the local technical term clearer than the English loanword in this architecture label? | HUMAN_REVIEW_PENDING; machine_translated |
| ms | `Locally verified · public release blocked` | Disahkan setempat · pelepasan awam disekat | Local checks do not authorize public release. | None without supported correction | Does the negation/status preserve the English scope naturally? | HUMAN_REVIEW_PENDING; machine_translated |
| ms | `Production status not independently verified.` | Status produksi belum disahkan secara bebas. | Absence of independent verification, not a declaration of failure. | None without supported correction | Does the negation/status preserve the English scope naturally? | HUMAN_REVIEW_PENDING; machine_translated |
| ar | `Locally verified · public release blocked` | تحقق محليًا · الإصدار العام محظور | Local checks do not authorize public release. | None without supported correction | Does the negation/status preserve the English scope naturally? | HUMAN_REVIEW_PENDING; machine_translated |
| ar | `Production status not independently verified.` | حالة الإنتاج غير متحقق منها بصورة مستقلة. | Absence of independent verification, not a declaration of failure. | None without supported correction | Does the negation/status preserve the English scope naturally? | HUMAN_REVIEW_PENDING; machine_translated |
| ta | `Locally verified · public release blocked` | உள்ளூரில் சரிபார்க்கப்பட்டது · பொதுவெளியீடு தடுக்கப்பட்டுள்ளது | Local checks do not authorize public release. | None without supported correction | Does the negation/status preserve the English scope naturally? | HUMAN_REVIEW_PENDING; machine_translated |
| ta | `Production status not independently verified.` | உற்பத்தி நிலை தனியாகச் சரிபார்க்கப்படவில்லை. | Absence of independent verification, not a declaration of failure. | None without supported correction | Does the negation/status preserve the English scope naturally? | HUMAN_REVIEW_PENDING; machine_translated |
| ja | `Locally verified · public release blocked` | ローカル検証済み · 一般公開はブロック中 | Local checks do not authorize public release. | None without supported correction | Does the negation/status preserve the English scope naturally? | HUMAN_REVIEW_PENDING; machine_translated |
| ja | `Production status not independently verified.` | 本番稼働状況は独立検証されていません。 | Absence of independent verification, not a declaration of failure. | None without supported correction | Does the negation/status preserve the English scope naturally? | HUMAN_REVIEW_PENDING; machine_translated |
| zh-Hans | `Locally verified · public release blocked` | 已本地验证 · 公开发布被阻止 | Local checks do not authorize public release. | None without supported correction | Does the negation/status preserve the English scope naturally? | HUMAN_REVIEW_PENDING; machine_translated |
| zh-Hans | `Production status not independently verified.` | 生产状态未经独立验证。 | Absence of independent verification, not a declaration of failure. | None without supported correction | Does the negation/status preserve the English scope naturally? | HUMAN_REVIEW_PENDING; machine_translated |
| es | `Locally verified · public release blocked` | Verificado localmente · publicación bloqueada | Local checks do not authorize public release. | None without supported correction | Does the negation/status preserve the English scope naturally? | HUMAN_REVIEW_PENDING; machine_translated |
| es | `Production status not independently verified.` | Estado de producción no verificado independientemente. | Absence of independent verification, not a declaration of failure. | None without supported correction | Does the negation/status preserve the English scope naturally? | HUMAN_REVIEW_PENDING; machine_translated |
| fr | `Locally verified · public release blocked` | Vérifié localement · publication bloquée | Local checks do not authorize public release. | None without supported correction | Does the negation/status preserve the English scope naturally? | HUMAN_REVIEW_PENDING; machine_translated |
| fr | `Production status not independently verified.` | État de production non vérifié indépendamment. | Absence of independent verification, not a declaration of failure. | None without supported correction | Does the negation/status preserve the English scope naturally? | HUMAN_REVIEW_PENDING; machine_translated |
| de | `Locally verified · public release blocked` | Lokal verifiziert · öffentliche Freigabe blockiert | Local checks do not authorize public release. | None without supported correction | Does the negation/status preserve the English scope naturally? | HUMAN_REVIEW_PENDING; machine_translated |
| de | `Production status not independently verified.` | Produktionsstatus nicht unabhängig verifiziert. | Absence of independent verification, not a declaration of failure. | None without supported correction | Does the negation/status preserve the English scope naturally? | HUMAN_REVIEW_PENDING; machine_translated |
| pt-BR | `Locally verified · public release blocked` | Verificado localmente · publicação bloqueada | Local checks do not authorize public release. | None without supported correction | Does the negation/status preserve the English scope naturally? | HUMAN_REVIEW_PENDING; machine_translated |
| pt-BR | `Production status not independently verified.` | Status de produção não verificado independentemente. | Absence of independent verification, not a declaration of failure. | None without supported correction | Does the negation/status preserve the English scope naturally? | HUMAN_REVIEW_PENDING; machine_translated |
| hi | `Locally verified · public release blocked` | स्थानीय रूप से सत्यापित · सार्वजनिक रिलीज़ अवरुद्ध | Local checks do not authorize public release. | None without supported correction | Does the negation/status preserve the English scope naturally? | HUMAN_REVIEW_PENDING; machine_translated |
| hi | `Production status not independently verified.` | उत्पादन स्थिति स्वतंत्र रूप से सत्यापित नहीं है। | Absence of independent verification, not a declaration of failure. | None without supported correction | Does the negation/status preserve the English scope naturally? | HUMAN_REVIEW_PENDING; machine_translated |

The full queue also covers seniority, individual contribution, MMCATS source/deployment separation, NAAE pending studio, historical results, translation disclaimer, English-original access, contact actions and the English-only professional assistant boundary. The three new functional labels are queued in every non-English locale.

## Accepted identifiers

- `AWS ECS`: preserved project/author, component, cloud service or technical stack identifier. Each locale row remains in the JSON warning ledger.
- `Active Storage`: preserved project/author, component, cloud service or technical stack identifier. Each locale row remains in the JSON warning ledger.
- `Google Cloud (GCP)`: preserved project/author, component, cloud service or technical stack identifier. Each locale row remains in the JSON warning ledger.
- `Incident Zero | Mohd. Paramasvara`: preserved project/author, component, cloud service or technical stack identifier. Each locale row remains in the JSON warning ledger.
- `MMCATS Modern`: preserved project/author, component, cloud service or technical stack identifier. Each locale row remains in the JSON warning ledger.
- `MMCATS Modern | Mohd. Paramasvara`: preserved project/author, component, cloud service or technical stack identifier. Each locale row remains in the JSON warning ledger.
- `Microsoft Azure`: preserved project/author, component, cloud service or technical stack identifier. Each locale row remains in the JSON warning ledger.
- `No Two Mondays | Mohd. Paramasvara`: preserved project/author, component, cloud service or technical stack identifier. Each locale row remains in the JSON warning ledger.
- `System Defence — Incident Zero | Mohd. Paramasvara`: preserved project/author, component, cloud service or technical stack identifier. Each locale row remains in the JSON warning ledger.
- `TypeScript · React · Transformers.js · MiniLM · Web Workers`: preserved project/author, component, cloud service or technical stack identifier. Each locale row remains in the JSON warning ledger.
- `← Incident Zero`: preserved project/author, component, cloud service or technical stack identifier. Each locale row remains in the JSON warning ledger.

## Reviewer workflow

1. Select a locale and exact key in the JSON; read English, translation, meaning and live/local page context side by side.
2. Record **approve existing**, **propose correction** or **request clarification**. Include an actual reviewer identity/qualification, date, scope and evidence reference only when supplied by that reviewer.
3. Keep questions about employer permission, dates and ownership with the owner; do not guess a revised career history.
4. Apply agreed corrections with current source hashes and preserve prior provenance. Until actual qualified review is evidenced, retain `machine_translated` in the catalog metadata. `OWNER_APPROVED` and `HUMAN_REVIEWED` require their separate actual evidence.
5. Re-run extraction, validation, strict coverage, date audit, build/static route audit and affected browser tasks. Review the diff before any later publication request.

The existing `i18n:review` command changes status immediately; do not invoke it from this automatic audit or treat its existence as reviewer evidence. No complex translation application was added.

## Case-study evolution v1 — 23 October 2026

Pending qualified review in all ten target locales: **19 canonical units / 190 new translations**. Exact English keys and source-to-evidence mapping are in `verification/portfolio-case-study-evolution-v1.json` (`claims`); localized values are in the corresponding catalogs. All retain machine provenance and current source hashes. This queue entry does not approve them.

Prioritize glyph luminance, ink coverage, local gradients, anatomical limits, reconstruction versus illustration, nonmodal focus behavior, hydration, consent versus DNT/GPC suppression, and the distinction between local HTTP checks and live deployment. Check negation and scope carefully. The heading “Engineering the Visual Identity” and poetic “The Unmapped Path” also need natural editorial phrasing. Screenshot alt text and captions describe actual local captures and must preserve the separate light illustration / dark glyph distinction. Existing 97 validator warnings remain separately tracked; no new warning was suppressed.

## Timeline alignment — 23 October 2026

Six new canonical units / 60 target translations need fluent review: five month-precision periods and “Principal engineering”. Exact month boundaries follow the résumé/CV and owner resolution in `TIMELINE_ALIGNMENT_V1.md`. Preserve the distinct rental role end (April 2020) and project end (May 2020). Runtime dates use the existing registered-calendar formatter; the displayed alternate-calendar interval must retain its Gregorian `[YYYY-MM]` equivalent. The corrected principal career node is 2022, year-only. All entries retain machine provenance; no review approval is implied.

### Centre continuity follow-up

The owner superseded the education flagship's project-led period with the full June 2021–Present engagement and clarified the June 2022 principal progression, pre-April-2023 meeting/classroom development and existing HRMS maintenance/modernization. May 2016 is now the first Centre employment and earlier HRMS start. Cryptoika stays February–May 2018 per the CV, with no claim of 2–3 months' overlap. Review the two new career summaries, combined role label and historical month ranges across all ten target locales; current total 1,536 canonical units. Existing machine provenance and review requirements remain.

### TM proposal and HRMS end-date clarification

Review seven canonical units / 70 target translations: TM proposal name, type, scope and August 2017–January 2018 period; HRMS May 2016–December 2024 period and continued-development summary; timeline introduction including project work. Preserve proposal-versus-employment and development-versus-employment distinctions. December 2024 is owner-confirmed development completion, not an extension of the first Centre employment or proof of continuous personal involvement. Current canonical count 1,543; machine provenance and fluent-review requirement retained.

## Production polish closeout — 23 October 2026

The old status keys above remain historical/add-only catalog entries. Current UI now uses `Public source · locally verified · application deployment blocked` and `Owner-reported delivery · public verification limited.` All ten target locales have new machine-authored translations with current source hashes (`development-assistant` / `session-assistant`), not human approval. Review all 20 new locale/key pairs before treating these consequential claims as linguistically approved; current values are in the locale catalogs and closeout manifest.

| Priority | Scope | Required reviewer decision |
| --- | --- | --- |
| P1 | New MMCATS status, all ten target locales | Public **source** is available; application **deployment** remains blocked. Local verification grants neither security clearance nor migration/provider acceptance. Check especially Malay technical deployment loanword, Arabic negation and Tamil compounding. |
| P1 | New commercial status, all ten target locales | Delivery is owner-reported professional work; limited public verification does not make the work hypothetical or independently certify acceptance. |
| P1 | WenSymes employment terms; Centre seniority/progression | Preserve occasional collaboration versus full-time employment; June 2021 return, June 2022 principal progression and April 2023 project start remain distinct. |
| P1 | Contact, consent, English-original and 404 recovery actions | Preserve permission, opt-out/withdrawal and recovery destinations; no reversal of choice. |
| P2 | Technical limitations, prototype labels and PACE-RAG boundary | Keep machine-translation disclosure; professional questions, answers and evidence remain English-only. |

The 97 validator warnings remain visible (95 previously classified proper noun/stack labels; two gateway-label editorial questions). Warning counts do not measure fluent quality. Qualified native-language review and actual screen-reader review are still pending. No translation was promoted to `human_reviewed`.

## PALDA v1 — 24 October 2026

Six new canonical units / 60 target translations require qualified review in every non-English locale. Exact keys are recorded in `verification/portfolio-architectural-leadership-v1.json`; source locations are the hero, three commercial ownership fields, architecture capability and Work With Me architecture-review description. Entries retain `machine_translated` / `development-assistant` / `session-assistant` provenance and current source hashes. The configured API key/model were unavailable; the established direct-assistant fallback was used. No human review is asserted.

P1: retain **authorization to make final technical architectural decisions**, without implying business/executive approval or sole control. Consensus is the owner's usual collaborative preference, not the source of or a prerequisite for that authority. Review the meaning of viable alternatives, resource constraints, costs, risks and business implications. Preserve Centre's returning-engagement boundary, principal seniority and WenSymes's occasional collaboration. English job titles retained in ownership translations preserve seniority and existing protected terminology; assess naturalness without demoting the role. Tamil, Arabic and Hindi need particular shaping/terminology review. No specific meeting, approval procedure or measured outcome may be inferred.
