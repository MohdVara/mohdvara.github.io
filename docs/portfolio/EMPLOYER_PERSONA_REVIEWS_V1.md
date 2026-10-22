# Twelve fictional employer reviews — v1

22 October 2026 · Asia/Kuching.

**Simulated employer assessment, grounded in observed public-site behavior.** No employers participated. Every first-person reaction and interview disposition is fictional, not an endorsement or a hiring probability. One agent interpreted a shared evidence corpus with twelve predeclared role-specific rubrics.

Evidence labels: **OBSERVED** rendered public content/actions; **MEASURED** script/browser result; **SOURCE-VERIFIED** sampled public repository content; **REPORTED** historical documentation/test results; **SIMULATED JUDGMENT** reviewer interpretation; **NOT VERIFIED** unavailable or out-of-scope evidence. An observation of a reported test count does not mean this audit reran those tests.

## Method and scoring

Weights, expectations, planned journeys and initial notes were saved in `predeclared-rubrics.json` before deep case investigation and public source reads. Pass A used the clean English-home snapshot and desktop screenshot only. All twelve initial interpretations were locked before Pass B. Full prose was expanded during reporting from those notes; no later case-study result is credited to Pass A. The home snapshot includes offscreen DOM content, but the initial reactions credit only the visible 1440×900 opening. Mobile evidence was collected afterward.

This is twelve distinct evaluation passes over one evidence corpus, not twelve independent model reviewers or human sessions. Attention budgets constrain what a persona would reasonably inspect; browser execution time is not human reading time. Deep journeys combine actual clicked shared paths with role-specific selection of reached evidence. Direct navigations and connector source reads are marked; their clicks are not falsely counted as a completed human path. Home resets make some routes separate branches rather than one continuous session.

The baseline CLI context had no saved preferences. Dedicated Chrome contexts were ephemeral with no saved storage. Normal motion was used initially; reduced motion was a separate check. No analytics consent was enabled. External endpoints were read with GET only. Initial sandbox HTTP failures and harness selector/menu failures were resolved or retained in ignored attempt logs; they are not public-site outages.

1 weak/absent, 2 limited, 3 credible partial, 4 strong with gaps, 5 exceptional directly inspectable. Weighted result=sum(weight*rating/5), rounded to whole points. No probability interpretation. All twelve dimensions are applicable to these scenarios; low weights indicate low role relevance. Ratings assess visible portfolio evidence, not the person’s actual capability. Component order is fixed below; each persona has separate weights. A 1 is weak/absent evidence, not proof of absent skill. Weight definitions were frozen before scores. Whole-number scores avoid invented precision. No cross-persona average is a hiring probability.

| Persona | Score /100 | Fictional disposition | Strongest positive | Biggest concern |
|---|---:|---|---|---|
| 1. Singapore technical recruiter | 75 | INTERVIEW INTEREST | Role, location and résumé are explicit in the first viewport. | Principal/Director labels do not establish team size, decision authority or hiring-level equivalence. |
| 2. SaaS CTO | 73 | INTERVIEW INTEREST | Commercial integration and ongoing-system work provide plausible end-to-end context. | Commercial cases offer limited measured business or operational before/after evidence. |
| 3. Big-tech Staff / Principal engineer | 72 | CONDITIONAL INTEREST | PACE explains hybrid ranking, separate source scopes, citations and abstention; public retrieval/answer modules corroborate those mechanisms. | Agent-authored, previously inspected labels and pending independent holdout limit evaluation strength. |
| 4. Legacy modernization director | 78 | INTERVIEW INTEREST | MMCATS explicitly states that legacy source was inspected, the old application was not booted and historical data was not migrated. | This demonstration does not prove discovery against a running legacy system or real-data migration/cutover. |
| 5. Enterprise engineering manager | 68 | CONDITIONAL INTEREST | The experience section names long-running education work and separates concurrent engagement types. | No reviewed production incident, on-call ownership or recovery outcome was reached in the sampled commercial material. |
| 6. International frontend lead | 80 | INTERVIEW INTEREST | English/Malay/Arabic/Japanese/Tamil routes render with localized notices and matching English-original links; Arabic is RTL. | Machine translation is disclosed; no fluent editorial certification is established for professional claims. |
| 7. Applied AI engineering lead | 72 | CONDITIONAL INTEREST | Live case and public source separate cached answers, deterministic facts, retrieval suggestions and unavailable generation. | Independent holdout and label review remain pending; finite abstention observations cannot establish reliability probabilities. |
| 8. Application security / platform architect | 82 | INTERVIEW INTEREST | MMCATS public acceptance explicitly blocks release on unresolved security dispositions and native provider acceptance. | The reported AMD64 scan retains 43 HIGH and 1 UNKNOWN; it is not cleared for deployment. |
| 9. Creative technology director | 84 | INTERVIEW INTEREST | NAAE exposes saved stages, configuration, protected narrative allocation and separate coverage/intensity concepts. | NAAE studio is a local prototype; saved-image comparisons do not prove a publicly runnable generative tool. |
| 10. Startup founder / hiring manager | 72 | CONDITIONAL INTEREST | Work with me names concrete inputs and possible deliverables rather than an unbounded technology service list. | Business impact and time-to-value are not measured in the sampled commercial examples. |
| 11. Technical consulting buyer | 71 | CONDITIONAL INTEREST | Services are framed as business problems, with useful inputs, possible deliverables and a next step. | Commercial outcomes and permitted client corroboration are sparse in the reached material. |
| 12. Skeptical hiring committee reviewer | 65 | INSUFFICIENT EVIDENCE | Commercial contribution labels and independent project status disclosures reduce misleading ownership/deployment implications. | Principal/leadership scope and commercial impact lack sufficient independent corroboration in the sampled evidence. |

## 1. Singapore technical recruiter

### Reviewer identity and expectations

Target/context: Senior Full-Stack / Technical Lead; Principal scope requires interview. Attention constraint (first screen / follow-up): **30 seconds / 2 minutes**. Priorities are the weighted rubric below. Planned scenario: Experience navigation → résumé → Contact. This persona expects evidence appropriate to that vacancy, not exhaustive coverage of every project.

### Pass A — initial reaction

**Fictional employer simulation — not a real endorsement.**

> I can identify the candidate’s intended level and practice immediately: principal full-stack engineering, technical leadership and architecture, based in Sabah. The production-software sentence is more useful to me than a list of frameworks. I can see a résumé link and an invitation to discuss a role without searching. I would continue to the employment history rather than start with the game. I have not yet established the scale of responsibility behind ‘Principal’, and I would not translate that title directly into a Singapore employer’s leveling system. The enterprise and integration links give me a sensible next step.

Locked screening note: Clear senior hands-on identity and Sabah location; résumé visible. Principal scope and concurrent employment are still unproven. Continue: yes, to the declared first relevant path; this indicates willingness to inspect, not shortlist approval. The hero makes role/location/contact important; unresolved ambiguity concerns the scope behind the title.

### Pass B — detailed assessment

Observed journey: `/en/ → #experience → résumé destination; /en/ → #contact`. Navigation accounting: Experience: 1 desktop navigation click, 2 mobile clicks via Menu; résumé: 1 outbound click; Contact: 1 desktop / 2 mobile.

**What impressed me — SIMULATED JUDGMENT grounded in OBSERVED evidence**

- Role, location and résumé are explicit in the first viewport.
- Employment history distinguishes occasional WenSymes collaboration, contract work and the PolicyStreet progression.

**What concerns me — uncertainty is not a demonstrated candidate failure**

- Principal/Director labels do not establish team size, decision authority or hiring-level equivalence.
- Linked résumé says Confidential / March 2025–Present while the site names WenSymes and qualifies occasional collaboration; the relationship needs explanation, not an inferred falsehood.

Not credited/missed: New technical case studies and NAAE would usually be outside the short screening budget.

### Interview and requested evidence

Question: At PolicyStreet, which decisions and delivery responsibilities were yours, and what team did you lead?

Requested artifact: A concise role-scope record with dates, team context and approved business outcomes.

**INTERVIEW INTEREST** — Enough relevant commercial breadth and clear contact paths for a technical screen; principal leveling remains open. This is a fictional scenario outcome.

### Score

**75/100**. Calculation: Σ(weight × rating ÷ 5), rounded to the nearest whole number.

| Dimension | Weight % | Rating /5 |
|---|---:|---:|
| positioning | 20 | 4 |
| technical depth | 2 | 3 |
| architecture | 2 | 3 |
| ownership | 8 | 3 |
| commercial | 15 | 4 |
| evidence | 5 | 3 |
| differentiation | 2 | 3 |
| discoverability | 12 | 4 |
| usability | 5 | 4 |
| contact | 12 | 4 |
| role fit | 12 | 4 |
| trust | 5 | 3 |

### Evidence trace and improvement

Evidence IDs: `home-fresh`, `home-mobile`, `experience`, `contact`. Each maps to `<id>.json` and, where captured, `<id>.png` in the ignored evidence directory. Exact URLs are in those JSON records and the journey matrix. Public source reads map to `public-source.json` / `public-code.json`; later public Lab/game opening observations are in `demos.json` (not credited to Pass A); do not credit them to the initial screen. Commercial expanded text is in `case-*-expanded.txt`.

Recommended improvement: Add one factual scope line to each senior role, preserving the disclosed overlap and employment type.

## 2. SaaS CTO

### Reviewer identity and expectations

Target/context: Hands-on technical leader. Attention constraint (first screen / follow-up): **30 seconds / 5–8 minutes**. Priorities are the weighted rubric below. Planned scenario: Enterprise modernisation → engineering details → MMCATS. This persona expects evidence appropriate to that vacancy, not exhaustive coverage of every project.

### Pass A — initial reaction

**Fictional employer simulation — not a real endorsement.**

> The opening presents someone who wants to connect business requirements, implementation and delivery rather than specialize in a single framework. That is relevant to a hands-on SaaS leadership role. The enterprise modernization and integration links are the first things I would follow; the decorative treatment is distinctive but does not obstruct those choices on desktop. I would not use the architecture title as proof of system ownership. I want to see a decision made under operational constraints, what was deliberately left simple, and who remained accountable after release. The homepage gives me a reason to investigate, rather than enough evidence to make that judgment already.

Locked screening note: Business requirements and modernization are relevant; I need decisions, operating trade-offs and team accountability beyond a title. Continue: yes, to the declared first relevant path; this indicates willingness to inspect, not shortlist approval. The hero makes role/location/contact important; unresolved ambiguity concerns the scope behind the title.

### Pass B — detailed assessment

Observed journey: `/en/ → #case-campus; /en/ → /en/mmcats-modern/ → public acceptance report`. Navigation accounting: Enterprise anchor: 1 click; MMCATS: 1 homepage case click after scroll; acceptance report: 1 further outbound click.

**What impressed me — SIMULATED JUDGMENT grounded in OBSERVED evidence**

- Commercial integration and ongoing-system work provide plausible end-to-end context.
- MMCATS chooses a Rails monolith with constraints, lifecycle events and private attachments rather than claiming distributed scale.

**What concerns me — uncertainty is not a demonstrated candidate failure**

- Commercial cases offer limited measured business or operational before/after evidence.
- Independent release governance does not establish production on-call, incident ownership or SaaS organizational influence.

Not credited/missed: No need to inspect every creative project or locale within this role’s budget.

### Interview and requested evidence

Question: Describe one modernization trade-off you rejected because its delivery or continuity cost exceeded the benefit.

Requested artifact: An approved production decision record connecting constraints, options, personal ownership and observed outcome.

**INTERVIEW INTEREST** — System boundaries and conservative scope justify discussion; organizational ownership still needs corroboration. This is a fictional scenario outcome.

### Score

**73/100**. Calculation: Σ(weight × rating ÷ 5), rounded to the nearest whole number.

| Dimension | Weight % | Rating /5 |
|---|---:|---:|
| positioning | 5 | 4 |
| technical depth | 8 | 4 |
| architecture | 18 | 4 |
| ownership | 17 | 3 |
| commercial | 14 | 3 |
| evidence | 10 | 4 |
| differentiation | 3 | 3 |
| discoverability | 3 | 4 |
| usability | 3 | 4 |
| contact | 4 | 4 |
| role fit | 10 | 4 |
| trust | 5 | 4 |

### Evidence trace and improvement

Evidence IDs: `home-fresh`, `insurance-details`, `mmcats`. Each maps to `<id>.json` and, where captured, `<id>.png` in the ignored evidence directory. Exact URLs are in those JSON records and the journey matrix. Public source reads map to `public-source.json` / `public-code.json`; later public Lab/game opening observations are in `demos.json` (not credited to Pass A); do not credit them to the initial screen. Commercial expanded text is in `case-*-expanded.txt`.

Recommended improvement: Publish one redacted commercial decision narrative with a dated result and clear individual/team boundary.

## 3. Big-tech Staff / Principal engineer

### Reviewer identity and expectations

Target/context: Staff / Principal IC; intentionally skeptical. Attention constraint (first screen / follow-up): **30 seconds / 5–10 minutes**. Priorities are the weighted rubric below. Planned scenario: PACE-RAG → evaluation → public source. This persona expects evidence appropriate to that vacancy, not exhaustive coverage of every project.

### Pass A — initial reaction

**Fictional employer simulation — not a real endorsement.**

> I see a broad principal-engineer claim, but the first viewport does not show the size of a technical problem or an architectural decision. That is not a defect in a homepage; it means my initial judgment must remain provisional. The integration and applied-AI links are useful paths into concrete work. I would choose the AI case because retrieval quality and the boundary between a demo and a reliable system are easy places for a portfolio to overclaim. I would continue only if the subsequent material exposes decisions, evaluation methods and failure cases, rather than replacing evidence with a large test count.

Locked screening note: Broad principal positioning and applied AI link invite scrutiny; no scale or difficult decision is established in the first viewport. Continue: yes, to the declared first relevant path; this indicates willingness to inspect, not shortlist approval. The hero makes role/location/contact important; unresolved ambiguity concerns the scope behind the title.

### Pass B — detailed assessment

Observed journey: `/en/ → /en/pace-rag-case-study/ → #evaluation → public retrieval/answers source`. Navigation accounting: PACE case: 1 click; evidence anchor: 1 click; public implementation link: 1 outbound click.

**What impressed me — SIMULATED JUDGMENT grounded in OBSERVED evidence**

- PACE explains hybrid ranking, separate source scopes, citations and abstention; public retrieval/answer modules corroborate those mechanisms.
- Published evaluation acknowledges regression-set reuse, provisional labels and two unmet recovery targets.

**What concerns me — uncertainty is not a demonstrated candidate failure**

- Agent-authored, previously inspected labels and pending independent holdout limit evaluation strength.
- Commercial cross-team influence, scale and measurable decision impact remain insufficient for staff/principal leveling.

Not credited/missed: NAAE aesthetics and consulting packaging are not relevant to this screen.

### Interview and requested evidence

Question: Why is similarity insufficient for answer reuse, and how would you design a genuinely independent holdout?

Requested artifact: A frozen independently prepared evaluation set with adjudication rules, failure analysis and per-query results.

**CONDITIONAL INTEREST** — Technical reasoning is interview-worthy; the evidence does not independently establish staff/principal scope. This is a fictional scenario outcome.

### Score

**72/100**. Calculation: Σ(weight × rating ÷ 5), rounded to the nearest whole number.

| Dimension | Weight % | Rating /5 |
|---|---:|---:|
| positioning | 3 | 4 |
| technical depth | 20 | 4 |
| architecture | 17 | 4 |
| ownership | 10 | 3 |
| commercial | 5 | 3 |
| evidence | 20 | 3 |
| differentiation | 3 | 4 |
| discoverability | 2 | 4 |
| usability | 2 | 4 |
| contact | 1 | 3 |
| role fit | 10 | 3 |
| trust | 7 | 5 |

### Evidence trace and improvement

Evidence IDs: `home-fresh`, `pace`. Each maps to `<id>.json` and, where captured, `<id>.png` in the ignored evidence directory. Exact URLs are in those JSON records and the journey matrix. Public source reads map to `public-source.json` / `public-code.json`; later public Lab/game opening observations are in `demos.json` (not credited to Pass A); do not credit them to the initial screen. Commercial expanded text is in `case-*-expanded.txt`.

Recommended improvement: Place a short evaluation validity panel beside the headline results and link an independently reviewed holdout when available.

## 4. Legacy modernization director

### Reviewer identity and expectations

Target/context: Engagement technical lead. Attention constraint (first screen / follow-up): **30 seconds / 5–8 minutes**. Priorities are the weighted rubric below. Planned scenario: Enterprise modernisation → MMCATS → source and release acceptance. This persona expects evidence appropriate to that vacancy, not exhaustive coverage of every project.

### Pass A — initial reaction

**Fictional employer simulation — not a real endorsement.**

> The strongest opening signal for my consultancy is the explicit focus on established systems and business requirements. I would follow enterprise modernization before looking at independent demonstrations. I want an engineer who discovers behavior and keeps a customer operating while changes are made. A technology replacement alone would not persuade me, and neither would a polished new interface. The homepage does not yet tell me whether an actual migration was completed or how acceptance was negotiated. I would continue to the commercial details and the public modernization case, keeping those two evidence types separate throughout the review.

Locked screening note: Continuity and existing-system framing fit my work; I need proof of behavior preservation and migration responsibility. Continue: yes, to the declared first relevant path; this indicates willingness to inspect, not shortlist approval. The hero makes role/location/contact important; unresolved ambiguity concerns the scope behind the title.

### Pass B — detailed assessment

Observed journey: `/en/ → #case-campus; /en/ → /en/mmcats-modern/ → GitHub acceptance`. Navigation accounting: Commercial anchor: 1 click; MMCATS: 1 case click after scroll; source/report: 1 additional outbound click each.

**What impressed me — SIMULATED JUDGMENT grounded in OBSERVED evidence**

- MMCATS explicitly states that legacy source was inspected, the old application was not booted and historical data was not migrated.
- Parity contracts cover relationships, attachments, lifecycle and money/time rules; public release acceptance remains inspectable.

**What concerns me — uncertainty is not a demonstrated candidate failure**

- This demonstration does not prove discovery against a running legacy system or real-data migration/cutover.
- Commercial modernization does not expose an accepted parity matrix, stakeholder sign-off or approved measurable outcome.

Not credited/missed: No inference that commercial PHP modernization and the Rails demonstration are the same migration.

### Interview and requested evidence

Question: How would you discover undocumented behavior and agree parity before choosing incremental replacement versus a rewrite?

Requested artifact: A redacted commercial parity/acceptance example and phased cutover/rollback decision record.

**INTERVIEW INTEREST** — The candidate shows the right risk vocabulary and bounded evidence; engagement leadership needs commercial verification. This is a fictional scenario outcome.

### Score

**78/100**. Calculation: Σ(weight × rating ÷ 5), rounded to the nearest whole number.

| Dimension | Weight % | Rating /5 |
|---|---:|---:|
| positioning | 5 | 4 |
| technical depth | 10 | 4 |
| architecture | 15 | 4 |
| ownership | 13 | 4 |
| commercial | 14 | 3 |
| evidence | 18 | 4 |
| differentiation | 2 | 3 |
| discoverability | 3 | 4 |
| usability | 2 | 4 |
| contact | 3 | 4 |
| role fit | 10 | 4 |
| trust | 5 | 5 |

### Evidence trace and improvement

Evidence IDs: `home-fresh`, `mmcats`. Each maps to `<id>.json` and, where captured, `<id>.png` in the ignored evidence directory. Exact URLs are in those JSON records and the journey matrix. Public source reads map to `public-source.json` / `public-code.json`; later public Lab/game opening observations are in `demos.json` (not credited to Pass A); do not credit them to the initial screen. Commercial expanded text is in `case-*-expanded.txt`.

Recommended improvement: Link a permitted commercial continuity example next to MMCATS, with real scope and acceptance boundaries.

## 5. Enterprise engineering manager

### Reviewer identity and expectations

Target/context: Senior / Lead; intentionally skeptical. Attention constraint (first screen / follow-up): **30 seconds / 3–5 minutes**. Priorities are the weighted rubric below. Planned scenario: Experience → insurance details → MMCATS governance. This persona expects evidence appropriate to that vacancy, not exhaustive coverage of every project.

### Pass A — initial reaction

**Fictional employer simulation — not a real endorsement.**

> The opening is legible and the enterprise emphasis is relevant, but my first screen is about dependable delivery rather than novelty. I would go directly to Experience, then look at a long-lived system and the responsibilities behind it. The title suggests seniority; it does not tell me how the candidate coordinates changes with stakeholders or handles failures. I can see a direct contact route and résumé, which reduces screening friction. I would continue for a senior technical discussion, while withholding any inference about regulated delivery, incident command, line management or operational accountability until the evidence supports it.

Locked screening note: Readable role and professional entry points help; visual originality does not establish dependable operational ownership. Continue: yes, to the declared first relevant path; this indicates willingness to inspect, not shortlist approval. The hero makes role/location/contact important; unresolved ambiguity concerns the scope behind the title.

### Pass B — detailed assessment

Observed journey: `/en/ → #experience → #case-insurance; /en/mmcats-modern/ → release evidence`. Navigation accounting: Experience: 1 desktop click; insurance anchor: 1 click; details disclosed by anchor/open control; MMCATS: 1 case click after home reset.

**What impressed me — SIMULATED JUDGMENT grounded in OBSERVED evidence**

- The experience section names long-running education work and separates concurrent engagement types.
- MMCATS documents fail-closed release gates and does not convert test success into security clearance.

**What concerns me — uncertainty is not a demonstrated candidate failure**

- No reviewed production incident, on-call ownership or recovery outcome was reached in the sampled commercial material.
- Engineering direction is named, but hiring, coaching, team size and delivery-governance responsibilities remain unclear.

Not credited/missed: Creative novelty deliberately carries little weight.

### Interview and requested evidence

Question: Who approved releases in your commercial role, and how did you manage a change that threatened ongoing operations?

Requested artifact: A redacted production change/incident record and factual management-scope summary.

**CONDITIONAL INTEREST** — Credible senior engineering context; insufficient direct operational and people-management evidence for a mission-critical leadership hire. This is a fictional scenario outcome.

### Score

**68/100**. Calculation: Σ(weight × rating ÷ 5), rounded to the nearest whole number.

| Dimension | Weight % | Rating /5 |
|---|---:|---:|
| positioning | 5 | 4 |
| technical depth | 5 | 3 |
| architecture | 10 | 4 |
| ownership | 18 | 3 |
| commercial | 20 | 3 |
| evidence | 12 | 3 |
| differentiation | 1 | 2 |
| discoverability | 4 | 4 |
| usability | 5 | 4 |
| contact | 3 | 4 |
| role fit | 10 | 3 |
| trust | 7 | 5 |

### Evidence trace and improvement

Evidence IDs: `experience`, `insurance-details`, `mmcats`. Each maps to `<id>.json` and, where captured, `<id>.png` in the ignored evidence directory. Exact URLs are in those JSON records and the journey matrix. Public source reads map to `public-source.json` / `public-code.json`; later public Lab/game opening observations are in `demos.json` (not credited to Pass A); do not credit them to the initial screen. Commercial expanded text is in `case-*-expanded.txt`.

Recommended improvement: Add one approved operational case with decision owner, stakeholder coordination and measured recovery/continuity evidence.

## 6. International frontend lead

### Reviewer identity and expectations

Target/context: Senior frontend / i18n engineer. Attention constraint (first screen / follow-up): **30 seconds / 5–7 minutes**. Priorities are the weighted rubric below. Planned scenario: Public engineering → multilingual → Arabic → English → Japanese/Tamil/Malay. This persona expects evidence appropriate to that vacancy, not exhaustive coverage of every project.

### Pass A — initial reaction

**Fictional employer simulation — not a real endorsement.**

> The visible language and display controls make this more interesting than a portfolio that treats internationalization as a footer option. On desktop I can still find the professional role, résumé and primary navigation easily. I would investigate whether language switching preserves the page and whether Arabic changes layout intentionally. I have not yet seen a translation disclaimer or tested another script, so I would not credit linguistic quality at this stage. The glyph artwork makes the interface memorable, but my hiring interest depends on readable mobile layouts, keyboard behavior and a maintainable localization boundary, especially around any embedded assistant.

Locked screening note: Language and display controls signal intentional interface engineering; editorial accuracy and behavior need inspection. Continue: yes, to the declared first relevant path; this indicates willingness to inspect, not shortlist approval. The hero makes role/location/contact important; unresolved ambiguity concerns the scope behind the title.

### Pass B — detailed assessment

Observed journey: `/en/ → /en/multilingual-engineering/ → language menu → Arabic → English original; direct ms/ja/ta counterparts`. Navigation accounting: Case: 1 homepage click after scroll; language disclosure + selection: 2 actions; English original: 1 click; Japanese vertical: disclosure + selection.

**What impressed me — SIMULATED JUDGMENT grounded in OBSERVED evidence**

- English/Malay/Arabic/Japanese/Tamil routes render with localized notices and matching English-original links; Arabic is RTL.
- Live language switching preserves route/query/fragment; Japanese vertical mode keeps demo controls horizontal.

**What concerns me — uncertainty is not a demonstrated candidate failure**

- Machine translation is disclosed; no fluent editorial certification is established for professional claims.
- Keyboard and limited axe samples cannot establish screen-reader usability, all-theme contrast or physical-device performance.

Not credited/missed: No claim of native fluency, screen-reader certification or comprehensive translation correctness.

### Interview and requested evidence

Question: How do you detect stale strings and keep the English-only assistant stable while changing locale and writing mode?

Requested artifact: A qualified multilingual editorial review plus an actual screen-reader task record.

**INTERVIEW INTEREST** — A functioning direction-aware, statically routed implementation is stronger evidence than a selector alone. This is a fictional scenario outcome.

### Score

**80/100**. Calculation: Σ(weight × rating ÷ 5), rounded to the nearest whole number.

| Dimension | Weight % | Rating /5 |
|---|---:|---:|
| positioning | 4 | 4 |
| technical depth | 15 | 4 |
| architecture | 10 | 4 |
| ownership | 5 | 4 |
| commercial | 4 | 3 |
| evidence | 13 | 4 |
| differentiation | 8 | 4 |
| discoverability | 5 | 4 |
| usability | 18 | 4 |
| contact | 2 | 4 |
| role fit | 10 | 4 |
| trust | 6 | 5 |

### Evidence trace and improvement

Evidence IDs: `multilingual`, `ms-multilingual`, `ar-multilingual`, `ja-multilingual`, `ta-multilingual`, `language-controls`. Each maps to `<id>.json` and, where captured, `<id>.png` in the ignored evidence directory. Exact URLs are in those JSON records and the journey matrix. Public source reads map to `public-source.json` / `public-code.json`; later public Lab/game opening observations are in `demos.json` (not credited to Pass A); do not credit them to the initial screen. Commercial expanded text is in `case-*-expanded.txt`.

Recommended improvement: Commission review of titles, ownership, release status and contact wording in priority locales, recording actual reviewer scope.

## 7. Applied AI engineering lead

### Reviewer identity and expectations

Target/context: Senior AI-enabled product engineer. Attention constraint (first screen / follow-up): **30 seconds / 5–10 minutes**. Priorities are the weighted rubric below. Planned scenario: Applied AI → PACE-RAG summary/evaluation → source. This persona expects evidence appropriate to that vacancy, not exhaustive coverage of every project.

### Pass A — initial reaction

**Fictional employer simulation — not a real endorsement.**

> The applied-AI link is visible without making me search the full project list, which is useful. I am interested in the engineer’s judgment around evidence, not simply whether an assistant can produce fluent text. The homepage does not yet establish retrieval quality, model costs or what is actually deployed. I would open PACE-RAG and look for a clear distinction between reviewed answers, retrieval and generation. If that distinction is explicit, I would keep reading even if the system is deliberately conservative. I would not infer enterprise AI delivery, production safety or evaluation validity from the project name or the architecture title.

Locked screening note: Applied AI is directly discoverable, but the label alone cannot establish retrieval quality or deployed inference. Continue: yes, to the declared first relevant path; this indicates willingness to inspect, not shortlist approval. The hero makes role/location/contact important; unresolved ambiguity concerns the scope behind the title.

### Pass B — detailed assessment

Observed journey: `/en/ → /en/pace-rag-case-study/ → evaluation → GitHub implementation`. Navigation accounting: Case: 1 hero click; evaluation: 1 anchor; implementation: 1 outbound click.

**What impressed me — SIMULATED JUDGMENT grounded in OBSERVED evidence**

- Live case and public source separate cached answers, deterministic facts, retrieval suggestions and unavailable generation.
- Source validates citation version/hash/URL membership; live case openly reports critical-question abstention and unmet targets.

**What concerns me — uncertainty is not a demonstrated candidate failure**

- Independent holdout and label review remain pending; finite abstention observations cannot establish reliability probabilities.
- Linked résumé says builds RAG-based onboarding and knowledge tools without the portfolio’s adjacent independent/experimental boundary; deployed commercial inference is not established.

Not credited/missed: No live inference was enabled or tested, and no private knowledge was submitted.

### Interview and requested evidence

Question: What failure would your critical-question suite miss, and how would you evaluate useful answers rather than only safe abstention?

Requested artifact: Independent answer-utility and retrieval holdout with error taxonomy and reproducible configuration.

**CONDITIONAL INTEREST** — Evidence discipline and inspectable implementation justify an AI-product interview, but not a production-RAG leadership assumption. This is a fictional scenario outcome.

### Score

**72/100**. Calculation: Σ(weight × rating ÷ 5), rounded to the nearest whole number.

| Dimension | Weight % | Rating /5 |
|---|---:|---:|
| positioning | 4 | 4 |
| technical depth | 20 | 4 |
| architecture | 15 | 4 |
| ownership | 6 | 4 |
| commercial | 5 | 2 |
| evidence | 20 | 3 |
| differentiation | 5 | 4 |
| discoverability | 2 | 4 |
| usability | 3 | 4 |
| contact | 2 | 4 |
| role fit | 10 | 3 |
| trust | 8 | 4 |

### Evidence trace and improvement

Evidence IDs: `home-fresh`, `pace`. Each maps to `<id>.json` and, where captured, `<id>.png` in the ignored evidence directory. Exact URLs are in those JSON records and the journey matrix. Public source reads map to `public-source.json` / `public-code.json`; later public Lab/game opening observations are in `demos.json` (not credited to Pass A); do not credit them to the initial screen. Commercial expanded text is in `case-*-expanded.txt`.

Recommended improvement: Add a small practical query walkthrough linking observed behavior to the exact evaluation boundary and unmet targets.

## 8. Application security / platform architect

### Reviewer identity and expectations

Target/context: Senior platform / secure delivery; intentionally skeptical. Attention constraint (first screen / follow-up): **30 seconds / 5–8 minutes**. Priorities are the weighted rubric below. Planned scenario: Public engineering → MMCATS → release/security public source. This persona expects evidence appropriate to that vacancy, not exhaustive coverage of every project.

### Pass A — initial reaction

**Fictional employer simulation — not a real endorsement.**

> A senior architecture title tells me little about secure delivery on its own. The first viewport offers credible professional routes, but no security evidence I could responsibly credit yet. I would continue to a project with inspectable authorization, data handling and release decisions. My standard is not the absence of every vulnerability in an independent prototype; it is whether the engineer understands what the evidence permits and blocks release when necessary. I would look for explicit separation between source publication and application deployment. A large passing test count would not substitute for that distinction or for a reviewed operational security posture.

Locked screening note: Architecture wording is plausible; no authentication, restore or release evidence appears in the first viewport. Continue: yes, to the declared first relevant path; this indicates willingness to inspect, not shortlist approval. The hero makes role/location/contact important; unresolved ambiguity concerns the scope behind the title.

### Pass B — detailed assessment

Observed journey: `/en/ → /en/mmcats-modern/ → public acceptance report → sampled controller source`. Navigation accounting: MMCATS: 1 homepage case click after scroll; report/source: 1 further link; controller inspected through public connector, not discovered by a recruiter.

**What impressed me — SIMULATED JUDGMENT grounded in OBSERVED evidence**

- MMCATS public acceptance explicitly blocks release on unresolved security dispositions and native provider acceptance.
- Source shows editor/admin action guards; reported private-byte, TLS refusal and restart checks have dated boundaries.

**What concerns me — uncertainty is not a demonstrated candidate failure**

- The reported AMD64 scan retains 43 HIGH and 1 UNKNOWN; it is not cleared for deployment.
- Native provider performance and coordinated off-host recovery are unverified; source sampling is not a security assessment.

Not credited/missed: No private endpoints, credentials, exploit checks or application vulnerability scan were used.

### Interview and requested evidence

Question: How would you bind security disposition and restore acceptance to the exact provider-built artifact before launch?

Requested artifact: An artifact-specific disposition record and independently witnessed restore/provider acceptance record.

**INTERVIEW INTEREST** — The willingness to block deployment is a positive judgment signal; it does not make the application production-approved. This is a fictional scenario outcome.

### Score

**82/100**. Calculation: Σ(weight × rating ÷ 5), rounded to the nearest whole number.

| Dimension | Weight % | Rating /5 |
|---|---:|---:|
| positioning | 2 | 3 |
| technical depth | 12 | 4 |
| architecture | 12 | 4 |
| ownership | 10 | 4 |
| commercial | 5 | 3 |
| evidence | 23 | 4 |
| differentiation | 1 | 3 |
| discoverability | 2 | 4 |
| usability | 4 | 4 |
| contact | 1 | 3 |
| role fit | 10 | 4 |
| trust | 18 | 5 |

### Evidence trace and improvement

Evidence IDs: `mmcats`. Each maps to `<id>.json` and, where captured, `<id>.png` in the ignored evidence directory. Exact URLs are in those JSON records and the journey matrix. Public source reads map to `public-source.json` / `public-code.json`; later public Lab/game opening observations are in `demos.json` (not credited to Pass A); do not credit them to the initial screen. Commercial expanded text is in `case-*-expanded.txt`.

Recommended improvement: Keep a concise dated status panel with unresolved gates and direct links; update only when evidence changes.

## 9. Creative technology director

### Reviewer identity and expectations

Target/context: Senior creative technologist. Attention constraint (first screen / follow-up): **30 seconds / 5–10 minutes**. Priorities are the weighted rubric below. Planned scenario: Public engineering → NAAE → comparison → No Two Mondays. This persona expects evidence appropriate to that vacancy, not exhaustive coverage of every project.

### Pass A — initial reaction

**Fictional employer simulation — not a real endorsement.**

> The first screen has an authored visual identity: a portrait emerging through a landscape of text, restrained color and a clear typographic hierarchy. That makes me curious about the engine behind the aesthetic. I can see a game case-study link, but I would have to explore further to discover NAAE. I would continue because the visual treatment suggests an engineer interested in representation as well as implementation. I have not yet established whether the artwork is procedural, interactive or simply an exported image, so I would reserve that judgment until I reach the actual comparison and its provenance.

Locked screening note: The portrait and glyph landscape are memorable; I would look for authored interactive systems beyond the illustration. Continue: yes, to the declared first relevant path; this indicates willingness to inspect, not shortlist approval. The hero makes role/location/contact important; unresolved ambiguity concerns the scope behind the title.

### Pass B — detailed assessment

Observed journey: `/en/ → /en/naae/ → comparison radios/zoom/configuration; /en/ → /en/no-two-mondays/ → itch listing`. Navigation accounting: NAAE: 1 case click after scroll; comparison: scroll + radio/keyboard/configuration actions; NTM: 1 home case click; itch: 1 outbound link.

**What impressed me — SIMULATED JUDGMENT grounded in OBSERVED evidence**

- NAAE exposes saved stages, configuration, protected narrative allocation and separate coverage/intensity concepts.
- NTM explains simulation/rendering boundaries and documents iterative art/interface decisions rather than only showing a final screenshot.

**What concerns me — uncertainty is not a demonstrated candidate failure**

- NAAE studio is a local prototype; saved-image comparisons do not prove a publicly runnable generative tool.
- Stages differ in framing/settings, v0.2 is a reproduction and physical printing is unverified; NTM launch reached a real build/menu and unaccepted consent prompt; gameplay and hosted/source equivalence were not verified.

Not credited/missed: No verified v0.1 image, official release chronology, physical print or public studio runtime was inferred.

### Interview and requested evidence

Question: How do you preserve narrative integrity while changing glyph density, and which aesthetic choices still require human review?

Requested artifact: A short reproducible engine walkthrough with exact seed/configuration and a permitted interactive build.

**INTERVIEW INTEREST** — Distinctive visual-system reasoning and a working comparison merit discussion; runtime creative-tool delivery remains to be demonstrated. This is a fictional scenario outcome.

### Score

**84/100**. Calculation: Σ(weight × rating ÷ 5), rounded to the nearest whole number.

| Dimension | Weight % | Rating /5 |
|---|---:|---:|
| positioning | 4 | 4 |
| technical depth | 10 | 4 |
| architecture | 5 | 4 |
| ownership | 6 | 4 |
| commercial | 3 | 3 |
| evidence | 10 | 4 |
| differentiation | 23 | 5 |
| discoverability | 5 | 3 |
| usability | 14 | 4 |
| contact | 2 | 4 |
| role fit | 14 | 4 |
| trust | 4 | 5 |

### Evidence trace and improvement

Evidence IDs: `home-fresh`, `naae`, `naae-viewer`, `ntm`. Each maps to `<id>.json` and, where captured, `<id>.png` in the ignored evidence directory. Exact URLs are in those JSON records and the journey matrix. Public source reads map to `public-source.json` / `public-code.json`; later public Lab/game opening observations are in `demos.json` (not credited to Pass A); do not credit them to the initial screen. Commercial expanded text is in `case-*-expanded.txt`.

Recommended improvement: Make a clearly labelled short process demonstration easy to reach from the NAAE overview, without presenting it as an archived historical release.

## 10. Startup founder / hiring manager

### Reviewer identity and expectations

Target/context: Hands-on founding / lead engineer. Attention constraint (first screen / follow-up): **30 seconds / 2–5 minutes**. Priorities are the weighted rubric below. Planned scenario: Explore work → commercial card → NTM → Work with me. This persona expects evidence appropriate to that vacancy, not exhaustive coverage of every project.

### Pass A — initial reaction

**Fictional employer simulation — not a real endorsement.**

> I can tell what this person wants to do and how to start a conversation, which is valuable when I am screening quickly. The enterprise and integration entry points suggest practical experience, while the independent project links suggest range. My next question is whether that range translates into selecting the smallest useful scope. I would look at one commercial example and one project with a clear ownership boundary, rather than spend my entire budget in every technical case. The principal and architect labels could fit a hands-on lead, but I need evidence of shipping trade-offs before assuming the candidate would suit a small team.

Locked screening note: Clear offer and direct contact help; several parallel project directions raise a scope and prioritization question. Continue: yes, to the declared first relevant path; this indicates willingness to inspect, not shortlist approval. The hero makes role/location/contact important; unresolved ambiguity concerns the scope behind the title.

### Pass B — detailed assessment

Observed journey: `/en/ → #work → insurance summary; /en/ → /en/no-two-mondays/; /en/ → /en/work-with-me/`. Navigation accounting: Work: 1 click; NTM: 1 case click after reset; services: 1 click; reading and scrolls are not timed human effort.

**What impressed me — SIMULATED JUDGMENT grounded in OBSERVED evidence**

- Work with me names concrete inputs and possible deliverables rather than an unbounded technology service list.
- MMCATS monolith choice and NTM state/rendering separation show deliberate architectural boundaries.

**What concerns me — uncertainty is not a demonstrated candidate failure**

- Business impact and time-to-value are not measured in the sampled commercial examples.
- Several sophisticated independent projects may distract from the practical shipping narrative; this is presentation ambiguity, not proof of poor prioritization.

Not credited/missed: Long NTM campaign detail would exceed the short budget; only summary and architecture are credited.

### Interview and requested evidence

Question: What did you deliberately cut from a commercial delivery, and how did you decide it was enough to ship?

Requested artifact: A bounded delivery example with timeline, constraints, trade-off and approved outcome.

**CONDITIONAL INTEREST** — Versatility is attractive, but prioritization and commercial delivery evidence need discussion. This is a fictional scenario outcome.

### Score

**72/100**. Calculation: Σ(weight × rating ÷ 5), rounded to the nearest whole number.

| Dimension | Weight % | Rating /5 |
|---|---:|---:|
| positioning | 8 | 4 |
| technical depth | 5 | 4 |
| architecture | 8 | 4 |
| ownership | 15 | 3 |
| commercial | 18 | 3 |
| evidence | 8 | 3 |
| differentiation | 5 | 4 |
| discoverability | 6 | 4 |
| usability | 6 | 4 |
| contact | 5 | 4 |
| role fit | 12 | 4 |
| trust | 4 | 4 |

### Evidence trace and improvement

Evidence IDs: `home-fresh`, `insurance-details`, `ntm`, `services`. Each maps to `<id>.json` and, where captured, `<id>.png` in the ignored evidence directory. Exact URLs are in those JSON records and the journey matrix. Public source reads map to `public-source.json` / `public-code.json`; later public Lab/game opening observations are in `demos.json` (not credited to Pass A); do not credit them to the initial screen. Commercial expanded text is in `case-*-expanded.txt`.

Recommended improvement: Add a short commercial delivery capsule showing smallest useful scope and the result, linked from the hero’s enterprise path.

## 11. Technical consulting buyer

### Reviewer identity and expectations

Target/context: Non-engineering buyer; modernization engagement. Attention constraint (first screen / follow-up): **30 seconds / 2–4 minutes**. Priorities are the weighted rubric below. Planned scenario: Work with me → services → contact alternatives. This persona expects evidence appropriate to that vacancy, not exhaustive coverage of every project.

### Pass A — initial reaction

**Fictional employer simulation — not a real endorsement.**

> I understand that this engineer helps with difficult existing software and business workflows. The invitation to discuss an opportunity is easy to see, and I would use Work with me to learn what an engagement involves. I do not need the architecture title or the game to persuade me at this stage. I need to understand what problem can be taken on, what information I should bring and what I might receive. I would continue because there is a plain contact route. I have not yet seen a business result, client confirmation or a simple example that lets me estimate whether my problem is a good fit.

Locked screening note: I understand modernization and complex software help; I need a simple engagement path and evidence of business results. Continue: yes, to the declared first relevant path; this indicates willingness to inspect, not shortlist approval. The hero makes role/location/contact important; unresolved ambiguity concerns the scope behind the title.

### Pass B — detailed assessment

Observed journey: `/en/ → /en/work-with-me/ → #engagement-fit → booking destination (view only)`. Navigation accounting: Services: 1 home click; fit: scroll or anchor; booking: 1 outbound click; email href inspected without sending.

**What impressed me — SIMULATED JUDGMENT grounded in OBSERVED evidence**

- Services are framed as business problems, with useful inputs, possible deliverables and a next step.
- Email and booking alternatives are visible; the public Cal.com destination displays a 20-minute discovery meeting.

**What concerns me — uncertainty is not a demonstrated candidate failure**

- Commercial outcomes and permitted client corroboration are sparse in the reached material.
- Possible deliverables are clear but broad; a nontechnical buyer may still struggle to choose the smallest starting engagement.

Not credited/missed: No need to read code, NAAE configuration or retrieval evaluation to judge the service offer.

### Interview and requested evidence

Question: What would you need from us to determine whether a limited architecture review or a modernization delivery is the right first step?

Requested artifact: A permitted anonymized engagement example showing starting problem, bounded deliverable and client-accepted outcome.

**CONDITIONAL INTEREST** — Enough clarity for an introductory conversation; procurement confidence requires stronger delivery evidence. This is a fictional scenario outcome.

### Score

**71/100**. Calculation: Σ(weight × rating ÷ 5), rounded to the nearest whole number.

| Dimension | Weight % | Rating /5 |
|---|---:|---:|
| positioning | 15 | 4 |
| technical depth | 1 | 3 |
| architecture | 3 | 3 |
| ownership | 8 | 3 |
| commercial | 22 | 3 |
| evidence | 8 | 3 |
| differentiation | 2 | 3 |
| discoverability | 10 | 4 |
| usability | 10 | 4 |
| contact | 12 | 4 |
| role fit | 5 | 4 |
| trust | 4 | 4 |

### Evidence trace and improvement

Evidence IDs: `home-fresh`, `services`, `contact`. Each maps to `<id>.json` and, where captured, `<id>.png` in the ignored evidence directory. Exact URLs are in those JSON records and the journey matrix. Public source reads map to `public-source.json` / `public-code.json`; later public Lab/game opening observations are in `demos.json` (not credited to Pass A); do not credit them to the initial screen. Commercial expanded text is in `case-*-expanded.txt`.

Recommended improvement: Add one short worked engagement example alongside the existing fit descriptions, without inventing a package or promise.

## 12. Skeptical hiring committee reviewer

### Reviewer identity and expectations

Target/context: Principal / engineering leadership; intentionally skeptical. Attention constraint (first screen / follow-up): **30 seconds / 10 minutes**. Priorities are the weighted rubric below. Planned scenario: Experience → commercial details → MMCATS → PACE → NAAE → sources. This persona expects evidence appropriate to that vacancy, not exhaustive coverage of every project.

### Pass A — initial reaction

**Fictional employer simulation — not a real endorsement.**

> The opening makes several seniority claims at once: principal engineer, technical lead and software architect. They may be justified, but I would not treat them as interchangeable evidence. I can see clear navigation, résumé and contact paths, so the site gives me a fair opportunity to challenge the claims rather than merely admire the presentation. My initial concern is whether a broad set of independent projects will carry more visible proof than the commercial leadership work. I would inspect the employment chronology, contribution wording and evidence boundaries before deciding whether this supports the principal-level vacancy I am screening for.

Locked screening note: Principal, lead and architect are adjacent claims. I will look for individual scope, commercial impact and contradictions rather than infer seniority from breadth. Continue: yes, to the declared first relevant path; this indicates willingness to inspect, not shortlist approval. The hero makes role/location/contact important; unresolved ambiguity concerns the scope behind the title.

### Pass B — detailed assessment

Observed journey: `/en/ → #experience → #case-insurance; /en/mmcats-modern/ → acceptance; /en/pace-rag-case-study/ → evaluation; /en/naae/ → provenance`. Navigation accounting: Experience and insurance: 1 anchor each; each case: 1 home link after reset; acceptance/source: 1 outbound each. Broader synthesis exceeds a simple recruiter path.

**What impressed me — SIMULATED JUDGMENT grounded in OBSERVED evidence**

- Commercial contribution labels and independent project status disclosures reduce misleading ownership/deployment implications.
- Public PACE and MMCATS sources expose limitations and failed gates rather than presenting every recorded check as a success.

**What concerns me — uncertainty is not a demonstrated candidate failure**

- Principal/leadership scope and commercial impact lack sufficient independent corroboration in the sampled evidence.
- Résumé/site HR engagement framing, rental dates and RAG scope differ; these are unresolved consistency questions, not proof of misrepresentation.

Not credited/missed: No rejection inferred from AI assistance itself, no hidden defects manufactured, and no salary/market-probability inference.

### Interview and requested evidence

Question: Which single commercial result best establishes your principal-level influence, and what can a referee or approved artifact substantiate?

Requested artifact: One approved commercial impact/scope dossier with a clear owner/team boundary and independently checkable acceptance.

**INSUFFICIENT EVIDENCE** — For this deliberately demanding principal panel, the site warrants inquiry but does not yet establish the required organizational scope. This is a fictional scenario outcome.

### Score

**65/100**. Calculation: Σ(weight × rating ÷ 5), rounded to the nearest whole number.

| Dimension | Weight % | Rating /5 |
|---|---:|---:|
| positioning | 5 | 4 |
| technical depth | 12 | 4 |
| architecture | 10 | 4 |
| ownership | 12 | 2 |
| commercial | 10 | 3 |
| evidence | 22 | 3 |
| differentiation | 2 | 4 |
| discoverability | 3 | 4 |
| usability | 3 | 4 |
| contact | 1 | 4 |
| role fit | 10 | 2 |
| trust | 10 | 4 |

### Evidence trace and improvement

Evidence IDs: `experience`, `insurance-details`, `mmcats`, `pace`, `naae`. Each maps to `<id>.json` and, where captured, `<id>.png` in the ignored evidence directory. Exact URLs are in those JSON records and the journey matrix. Public source reads map to `public-source.json` / `public-code.json`; later public Lab/game opening observations are in `demos.json` (not credited to Pass A); do not credit them to the initial screen. Commercial expanded text is in `case-*-expanded.txt`.

Recommended improvement: Lead a principal-specific evidence path with commercial scope and outcome before independent project depth.

## Dimension-level descriptive comparison

These means summarize this rubric exercise only; different weights, targets and evidence budgets make scores non-equivalent.

| Dimension | Rating range /5 | Mean /5 |
|---|---:|---:|
| positioning | 3–4 | 3.9 |
| technical depth | 3–4 | 3.8 |
| architecture | 3–4 | 3.8 |
| ownership | 2–4 | 3.3 |
| commercial | 2–4 | 3.0 |
| evidence | 3–4 | 3.4 |
| differentiation | 2–5 | 3.5 |
| discoverability | 3–4 | 3.9 |
| usability | 4–4 | 4.0 |
| contact | 3–4 | 3.8 |
| role fit | 2–4 | 3.6 |
| trust | 3–5 | 4.4 |

The high trust ratings reflect candid evidence boundaries, not security certification. Low principal role-fit reflects missing demonstrated organizational scope, not a conclusion that the candidate cannot operate at that level. Creative differentiation does not compensate for enterprise operations evidence. The intentionally skeptical reviewers are 3, 5, 8 and 12; the recruiter and consulting buyer predominantly assess non-code screening/conversion.
