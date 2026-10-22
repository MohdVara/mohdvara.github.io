# Employer improvement backlog — v1

22 October 2026. Recommendations only; no website changes made.

**Simulated employer assessment, grounded in observed public-site behavior.** No employers participated. Every first-person reaction and interview disposition is fictional, not an endorsement or a hiring probability. One agent interpreted a shared evidence corpus with twelve predeclared role-specific rubrics.

Evidence labels: **OBSERVED** rendered public content/actions; **MEASURED** script/browser result; **SOURCE-VERIFIED** sampled public repository content; **REPORTED** historical documentation/test results; **SIMULATED JUDGMENT** reviewer interpretation; **NOT VERIFIED** unavailable or out-of-scope evidence. An observation of a reported test count does not mean this audit reran those tests.

No confirmed P0 website defect was established. MMCATS unresolved security is a disclosed gate on a separate application, not evidence that the portfolio is unsafe. The audit does not diagnose a specific harmful mistranslation or a broken résumé solely from HTTP status.

Top five must-address items for stronger employer evidence are E01–E05. They do not constitute a new publication approval gate. E06–E10 are useful refinements.

Ordering heuristic: Impact × Evidence Strength ÷ Estimated Effort. Impact 1–5, evidence 1–3, effort 1–4 are ordinal estimates. Priority/severity and relevance come first; within a priority band the heuristic helps compare effort, rather than automatically overruling a stronger hiring-evidence need. This explains why inexpensive E06/E09 can have higher heuristic values than P1 independent evaluation.

| Rank | ID | Priority | Improvement | Personas | I × E / effort | Complexity |
|---:|---|---|---|---|---:|---|
| 1 | E01 | P1 | Make senior-role scope independently understandable | 1, 2, 3, 4, 5, 10, 12 | 5 × 3 / 2 = 7.5 | Medium |
| 2 | E02 | P1 | Add one approved commercial outcome narrative | 1, 2, 3, 4, 5, 10, 11, 12 | 5 × 3 / 3 = 5.0 | Medium |
| 3 | E03 | P1 | Reconcile linked résumé and portfolio claim boundaries | 1, 7, 12 | 5 × 3 / 2 = 7.5 | Low/medium |
| 4 | E04 | P1 | Review consequential translated claims | 6 | 4 × 3 / 3 = 4.0 | Medium/high |
| 5 | E05 | P1 | Strengthen independent evaluation evidence | 3, 7, 12 | 4 × 3 / 4 = 3.0 | High |
| 6 | E06 | P2 | Provide an explicit commercial-versus-independent reading path | 9, 10, 12 | 3 × 3 / 1 = 9.0 | Low |
| 7 | E07 | P2 | Make long-case summaries easier to act on | 10, 11 | 3 × 3 / 2 = 4.5 | Low/medium |
| 8 | E08 | P2 | Clarify the shortest first consulting engagement | 11 | 3 × 2 / 2 = 3.0 | Low/medium |
| 9 | E09 | P2 | Close or clearly dismiss the language popover after selection | 6 | 2 × 3 / 1 = 6.0 | Low |
| 10 | E10 | P2 | Add precise current-build evidence links where available | 4, 8, 9, 12 | 3 × 3 / 3 = 3.0 | Medium |

## E01 — Make senior-role scope independently understandable

**P1** · affected personas 1, 2, 3, 4, 5, 10, 12.

Finding: Principal/Director titles and contribution labels are present; team size, decision authority and organizational reach remain sparse.

Evidence: `experience.json; case-campus-expanded.txt; case-insurance-expanded.txt` under `output/playwright/employer-experience-v1/`.

Proposed change: Add factual team/context/decision-owner lines, a permitted operational decision record and corroboration for the strongest commercial role. Do not infer management duties.

Expected qualitative benefit: High. Estimated complexity: Medium.

Acceptance criterion: A reviewer can identify individual versus team responsibility, time period and one decision owned without asking for clarification.

## E02 — Add one approved commercial outcome narrative

**P1** · affected personas 1, 2, 3, 4, 5, 10, 11, 12.

Finding: Commercial cards describe delivered capabilities but little measured before/after impact; no revenue/uptime/savings figures are established.

Evidence: `case-campus-expanded.txt; case-insurance-expanded.txt; services.json` under `output/playwright/employer-experience-v1/`.

Proposed change: Publish one redacted problem → constraint → decision → accepted result capsule, using only approved evidence; qualitative acceptance is valid if metrics do not exist.

Expected qualitative benefit: High. Estimated complexity: Medium.

Acceptance criterion: Every outcome has a date, source/permission boundary and personal contribution; no invented business metric.

## E03 — Reconcile linked résumé and portfolio claim boundaries

**P1** · affected personas 1, 7, 12.

Finding: Résumé HR role is Confidential / March 2025–Present; site names WenSymes and occasional collaboration. Résumé rental period May 2018–April 2019 differs from site 2018–2020. RAG wording lacks the site’s explicit experimental qualification.

Evidence: `followup.json resume.text; resume-destination.png; experience.json; home-fresh.json` under `output/playwright/employer-experience-v1/`.

Proposed change: Confirm the intended periods and confidentiality/engagement wording, then align or explicitly explain differences across résumé, CV and site. Qualify RAG project scope without erasing genuine training experience.

Expected qualitative benefit: High for screening trust. Estimated complexity: Low/medium.

Acceptance criterion: Dates, ongoing engagement type and production-versus-independent AI claims can be reconciled from the public artifacts; do not change either record without owner-confirmed facts.

## E04 — Review consequential translated claims

**P1** · affected personas 6.

Finding: Machine translations are clearly disclosed; qualified editorial review remains pending. No specific mistranslation was diagnosed.

Evidence: `ms/ar/ja/ta-multilingual.json; multilingual.json` under `output/playwright/employer-experience-v1/`.

Proposed change: Prioritize role titles, contribution scope, release/security status and contact instructions for qualified review; retain notices for unreviewed content.

Expected qualitative benefit: High for international trust. Estimated complexity: Medium/high.

Acceptance criterion: Named review scope and date are recorded; human-reviewed status applies only to actually reviewed strings; equivalent English links remain correct.

## E05 — Strengthen independent evaluation evidence

**P1** · affected personas 3, 7, 12.

Finding: PACE labels are agent-authored and evaluation sets were already inspected; two recovery targets remain unmet.

Evidence: `pace.json; public-code.json; public-source.json` under `output/playwright/employer-experience-v1/`.

Proposed change: Prepare an independent frozen holdout and adjudicated error taxonomy; report retrieval, utility and abstention separately. Until then keep validity limits beside the metric.

Expected qualitative benefit: High for AI-specific hiring. Estimated complexity: High.

Acceptance criterion: Dataset provenance, freeze date, judging rules and all outcomes are published; no development score is represented as unseen validation.

## E06 — Provide an explicit commercial-versus-independent reading path

**P2** · affected personas 9, 10, 12.

Finding: Commercial work and public engineering are separated, but the strongest public technical proof sits below several work cards; NAAE is absent from the opening hero.

Evidence: `home-fresh.png; home-mobile.png; home-fresh.json` under `output/playwright/employer-experience-v1/`.

Proposed change: Offer a compact labelled path to commercial scope and to inspectable independent evidence using existing content. Avoid adding another feature carousel.

Expected qualitative benefit: Moderate. Estimated complexity: Low.

Acceptance criterion: Recruiter and specialist can each reach their relevant evidence in one clear home action without confusing demo with client delivery.

## E07 — Make long-case summaries easier to act on

**P2** · affected personas 10, 11.

Finding: PACE and NTM contain substantial caveat/history detail; headline summary content can extend beyond the opening screen.

Evidence: `pace.png; ntm.png; services.json` under `output/playwright/employer-experience-v1/`.

Proposed change: Use existing summaries and anchors to foreground the decision, result boundary and next relevant evidence; retain deep records below.

Expected qualitative benefit: Moderate. Estimated complexity: Low/medium.

Acceptance criterion: At 390×844 and 1440×900 a reviewer can locate summary, evidence and next action without reading the historical narrative.

## E08 — Clarify the shortest first consulting engagement

**P2** · affected personas 11.

Finding: Useful inputs and possible deliverables exist, but all remain broad and conditional; the buyer must map their problem to a starting scope.

Evidence: `services.json; external-2.txt` under `output/playwright/employer-experience-v1/`.

Proposed change: Add one permitted worked example of a bounded diagnosis or modernization engagement, showing input and accepted deliverable.

Expected qualitative benefit: Moderate. Estimated complexity: Low/medium.

Acceptance criterion: A nontechnical reviewer can say what to bring and what decision the initial engagement could resolve; no fabricated booking or fixed promise.

## E09 — Close or clearly dismiss the language popover after selection

**P2** · affected personas 6.

Finding: At 390×844, selecting Arabic left the popover open; it intercepted the English-original click until the summary was closed.

Evidence: `followup-attempt2.json; followup.json; ar-mobile-stable.png` under `output/playwright/employer-experience-v1/`.

Proposed change: Consider closing after successful selection with intentional focus restoration, or make the dismiss action clearer. Preserve keyboard/state behavior.

Expected qualitative benefit: Moderate, workaround available. Estimated complexity: Low.

Acceptance criterion: Select Arabic on the same query/hash route, then reach English-original by pointer and keyboard without an obscuring overlay; route/state persist.

## E10 — Add precise current-build evidence links where available

**P2** · affected personas 4, 8, 9, 12.

Finding: Portfolio deployment ID/SHA cannot be bound; NTM historical local campaign does not verify hosted gameplay; NAAE studio remains pending.

Evidence: `public-route-audit/public.json; public-source.json; naae.json; ntm.json` under `output/playwright/employer-experience-v1/`.

Proposed change: When authorized evidence exists, add dated build/artifact identifiers and a small reproducible demonstration; retain pending labels otherwise.

Expected qualitative benefit: Moderate. Estimated complexity: Medium.

Acceptance criterion: A reviewer can distinguish source revision, historical evidence and actual hosted artifact without treating HTTP 200 as functional certification.

## Optional lower priority

P3: tune secondary-link contrast and visual grouping only after real task testing identifies a problem. No confirmed contrast defect is inferred from a screenshot or an axe incomplete rule. Do not add more projects, animation or AI features to solve an evidence problem.
