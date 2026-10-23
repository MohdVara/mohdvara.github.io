# Portfolio production polish closeout v1

23 October 2026 · Asia/Kuching. Initial branch `main`, HEAD `e6ea36550b9fc11e3c232137fe38835e1ab7d6ec`. **COMPLETE WITH EXTERNAL/EDITORIAL EXCEPTIONS**. Local engineering corrections are complete; source-document edits, owner chronology clarification and qualified human review remain separate. Public content was observed; Cloudflare deployment identity and parity with this local build are unverified. No deployment was performed.

Machine-readable results: [portfolio-production-polish-closeout-v1.json](../../verification/portfolio-production-polish-closeout-v1.json). Career matrix and exact external replacements: [CAREER_ARTIFACT_ALIGNMENT_PENDING.md](CAREER_ARTIFACT_ALIGNMENT_PENDING.md).

## Freeze, inventory and baseline

Initial worktree contained an owner whitespace change in `docs/portfolio/PORTFOLIO_CASE_STUDY_EXPANSION.md` and nine untracked `.playwright-cli` snapshots. They remain untouched. No reset, clean, commit, push or deployment occurred. Recent commits already reconciled chronology, consolidated education work, verified localized career dates and documented source evidence (`e6ea365`, `3cd376e`, `b0f2127`, `00584e3`, `fa15408`, `3991232`).

Sources inspected: `AGENTS.md`; `src/content.ts` (career, projects, CV/résumé links); `src/caseStudies.ts`, `src/EngineeringCaseStudy.tsx`, `src/PublicEngineering.tsx`; `src/UtilityRail.*`, `UtilityPanel.tsx`, preference services; `src/NotFound*`, `Page.tsx`, portrait build/selection and engineering evidence assets; locale registry/catalogs/provenance; existing tests, QA scripts and verification manifests. Latest owner confirmations in `TIMELINE_ALIGNMENT_V1.md` and `docs/content-sources.md` supersede older findings. Related repositories were not modified.

The checked-in Actions workflow validates/builds and contains a GitHub Pages deployment job; npm also exposes Cloudflare deploy commands. Neither proves the identity of the Cloudflare production deployment. No workflow, hosting configuration, analytics behavior or DNS was changed.

Fresh baseline: typecheck/lint passed; 201 tests passed; build passed after sandbox retry for SWC native-cache access. Initial entry JS: 214,762 raw bytes. The first sandbox build failure was environmental (`ERR_SWC_NATIVE_CACHE`), not silently counted as a pass. Existing source is React/TypeScript/Vite, eleven locales, static prerendering. Baseline browser work reproduced the discovery-link locale defect described below; later checks cover the corrections.

## Findings and corrections

| Finding | Classification | Result |
| --- | --- | --- |
| MMCATS said “Locally verified · public release blocked” despite public source | CONFIRMED — FIXED | Homepage and quick read: **Public source · locally verified · application deployment blocked**; security/provider/migration limitations retained |
| Four commercial quick reads repeated an unexplained production-verification disclaimer | CONFIRMED — FIXED | **Owner-reported delivery · public verification limited.** Approved capabilities/ownership stay direct; no independent acceptance or current deployment is invented |
| Arabic discovery navigation could enter English MMCATS/NAAE/Multilingual Engineering | CONFIRMED — FIXED | Three existing routes added to `localeResolution.ts`; all-locale query/fragment preservation regression added; Arabic click-through retested |
| 404 QA targeted removed header language selectors and overwrote a historical output directory | CONFIRMED — FIXED | Current utility selectors; optional task-specific output path; original recovery/status assertions retained |
| Case QA counted headings before a lazy hydration boundary finished | CONFIRMED — FIXED | Wait for visible heading before the unchanged exactly-one-heading assertion |
| Rail edge/a11y scripts hardcoded a historical host | CONFIRMED — FIXED | Configurable QA URLs; checks run against the task's actual emulator |
| MegaInfinite April/May discrepancy | ALREADY RESOLVED | Both public documents say role ends April 2020; separate rental project ends May 2020; no arbitrary reconciliation |
| Centre dates, duplicate education card and art captions | ALREADY RESOLVED | June 2021 return / June 2022 principal / April 2023 project; five selected-work cards; current illustration/glyph provenance is explicit |
| WenSymes “Present” without occasional qualifier | CONFIRMED — REQUIRES OWNER APPROVAL | External suggested wording provided; no primary-employment end inferred |
| External Centre Developer versus owner-approved Engineer title; AI summary scope; CV “Advance” spelling | CONFIRMED — EXTERNAL SYSTEM | Exact suggested replacements in career matrix; no external edit claimed |
| Fluent translation and physical screen-reader assurance | CONFIRMED — REQUIRES QUALIFIED HUMAN REVIEW | Prioritized queue retained/extended; no certification claimed |
| Rail obstruction, RTL overflow, stale portrait and broken recovery actions | NOT REPRODUCED | Focused automated browser and screenshot review passed within the tested matrix |
| LinkedIn request throttled | CONFIRMED — EXTERNAL SYSTEM | HTTP 429; no assertion that the profile is broken |
| Prototype/experimental labels and finite historical results | ACCEPTED LIMITATION | NAAE studio pending, PACE-RAG experimental/English-only, Incident Zero fictional, No Two Mondays historical campaign retained |

The commercial editorial change identifies the evidence basis without upgrading any case to independently certified production. Existing delivered-capability → owner evidence → public-verification limit structure remains; historical status strings stay in add-only catalogs but are no longer used in these UI locations. No new outcomes, dates, client endorsement, scale or acceptance claims were added.

## Career consistency

Fresh public Chrome reads of both Reactive Resume documents confirm WenSymes is named (older “Confidential” observations are stale), MegaInfinite April 2020 role ends, Invisible Technologies March 2025 ends, Centre progression and distinct project dates. The full matrix separates aligned facts from owner/external decisions. The site's Engineer title is already explicitly owner-confirmed; external documents still print Developer. The selected timeline intentionally omits some CV roles; omission is not an employment contradiction.

Professional AI training-data work is established in the source documents and remains distinct from AI-assisted development and independent RAG prototypes. Existing portfolio wording explicitly says enterprise production RAG delivery is not established. Suggested résumé/CV summary edits clarify this scope without weakening the real AI trainer contract. There is no supported exact WenSymes primary-employment end date; only ongoing occasional collaboration is asserted on the website.

## Utility rail acceptance

All five panels tested across seven widths (320–3840 CSS px), single-panel replacement, inward placement, fixed scrolling, 44px targets, Escape, focus restoration, outside dismissal, native selects, saved theme/text/scenery preferences and reduced motion. Arabic docks left; Japanese vertical editorial mode keeps controls horizontal. Tamil shaping and Chinese typography are covered by the locale matrix. Deep routes, query/fragment/history and equivalent English-original navigation pass. Failed locale download preserves a recoverable panel; failed lazy panel shows Retry and can be dismissed. No rebuilt rail or new preference state.

Edge checks pass at 320×568, 844×390 and 720×450 with largest text; native modal precedence, forced colors, blocked storage and HTTP 404 pass. Desktop viewport resizing provides 200%/400% reflow equivalents; this is not physical browser-zoom/soft-keyboard certification. Safe-area CSS is retained; no physical notched-device or mobile keyboard session was available.

Privacy defaults off; merely opening panels grants no consent. Explicit grant, refresh and withdrawal, stored preferences and DNT/GPC effective-state checks pass; independent privacy-signal gating is also covered by unit tests. No local PostHog requests were observed. Local builds lack production analytics configuration, so this is not a claim about live opted-in telemetry. No tracking or analytics behavior changed.

## Visual and 404 QA

Dark homepage selects `/images/MohdVaraLetters-refined.svg`; light selects `/images/portrait.webp`. Light/dark/light switching and decoded-image dimensions are checked; the illustration is intentionally different from glyph artwork. Art direction, forest geometry, portrait and 404 scene were not redesigned. Existing captions distinguish portfolio source-field reconstruction from direct photo input and standalone NAAE capabilities. Engineering evidence images decode at 1440×900 with captions/alt text and lazy loading; historical reproduction is not a controlled quality benchmark.

404: 54 layout/theme combinations, 44 axe scans, 33 localized recovery destinations, eleven no-JavaScript checks and 108 valid-route HTTP checks pass. Tested custom scene has one H1, localized explanation/quote and home/engineering/contact actions; decorative glyphs remain hidden from assistive technology. Unknown routes return actual HTTP 404 through local **Wrangler Pages**, not Vite's SPA fallback. Public English/Arabic/Tamil unknown routes also returned 404. Missing artwork chunk preserves static recovery. Titles, `noindex, follow`, absence of canonical/hreflang on missing routes and Japanese vertical quote are checked.

## Localization and accessibility

Current catalogs: **1,545 canonical units per locale, eleven locales; zero missing, stale or validation errors; 97 retained editorial warnings**. Two new status strings / twenty target translations have current SHA-256 source hashes and machine-authored provenance (`development-assistant` / `session-assistant`). Provider credentials/model are unavailable; dry-run sync reports zero pending units. A final Malay refinement makes source code and the technical deployment term explicit; eight focused homepage/case responsive checks cover that catalog edit. No human-reviewed status was assigned. Source hashes, placeholders, protected identifiers, bidi validation and source date precision pass; no calendar precision was invented.

Locale browser matrix: 88 responsive layouts, nine switching/history scenarios and eleven English-only assistant isolation checks; zero page errors, missing rendered source units or runtime provider requests. Date audit regenerated without introducing differences. New critical status translations are queued alongside employment, seniority, consent, recovery and technical limitations in [TRANSLATION_EDITORIAL_REVIEW_QUEUE.md](TRANSLATION_EDITORIAL_REVIEW_QUEUE.md). PACE-RAG conversations remain English-only.

Axe: 30 rail-panel scans, 24 case-study scans and 44 404 scans report zero violations. Case-study color-contrast incompletes are retained in raw evidence. A focused computed-color review covers 124 text/background pairs across home, MMCATS, NAAE, 404 and privacy controls in both themes: minimum **5.49:1**, zero sampled pairs below 4.5:1. Those flat pairs have no background-image layer; decorative artwork/gradient pixels and all untranslated or unreviewed text are not thereby certified. Focus, native controls, reduced motion, target size, headings and error semantics are checked. No physical screen-reader, fluent-language or physical-device certification.

## Recruiter journeys

These are deterministic scripted scenarios, not employer participation or conversion research.

| Scenario | Actions / outcome |
| --- | --- |
| Singapore recruiter | Read summary → employment anchor → résumé destination → contact anchor; chronology and occasional collaboration explicit |
| Technical hiring manager | Open insurance disclosure → decision/delivery evidence → CV destination; owner evidence and public limits clear |
| Staff/Principal Engineer | Open MMCATS → verification anchor → source/limitations; public source distinct from blocked deployment |
| Creative reviewer | Open NAAE → identity section → decoded artwork evidence → implementation source; illustration/glyph boundaries explicit |
| International visitor | Arabic theme/text options → Arabic engineering case → equivalent English original; original locale-loss defect corrected |
| Lost visitor | Invalid Tamil URL → localized engineering recovery → invalid URL → localized contact recovery; actual 404 and useful anchors |

Final journey run records exact actions, errors and failed requests in ignored `journeys.json`; two console resource errors correspond to deliberate HTTP 404 visits, with no other console errors, page errors or failed requests; no email, booking or external résumé edits are submitted. Transient test failures from unscoped duplicate contact links and unsynchronized lazy hydration were corrected in the task harness, not labeled product fixes. The locale-loss failure was a genuine product defect and received a source regression test.

## Technical and performance verification

Typecheck, lint, production build and **202 tests pass** (201 at baseline plus the locale-link regression). Localization validation/strict coverage, date audit, static route/SEO/fragment/asset audit and scoped whitespace checks pass. Static audit: **108 routes, zero issues**, canonical URLs, twelve alternates, exactly one H1 and valid internal destinations. Final source/artifact hashes and gate results are recorded in the manifest.

Final entry JS: **214,797 raw / 65,823 local gzip bytes**, against unchanged **215,000 raw** ceiling (203 bytes headroom). Baseline raw 214,762 → final +35 bytes; no performance improvement claimed. All JS/CSS chunks total 6,047,704 raw / 1,816,949 gzip bytes, including lazy/localization/game assets; this is not initial transfer. Engineering case JS/CSS: 22,370/3,372 raw bytes; 404 JS/CSS: 4,948/2,735; utility panel: 3,948 JS bytes. Existing large-chunk warning remains.

An initial desktop dark-home sample recorded 13 resources / 540,463 transferred bytes including the glyph SVG, bootstrap, i18n/runtime/content chunks and scenery renderer; no NAAE evidence images loaded there. It precedes the final registry-only correction; final entry raw size is unchanged. This is a bounded local resource observation, not a Web Vitals benchmark. No measured CLS, INP or real-user performance gain is claimed. Screenshot/image-bound checks assess visible stability only.

Build-time public GitHub metadata refresh was restored to its initially clean snapshot after validation to avoid an unrelated publication change. The source and artifact fingerprints are independent observations: the build intentionally refreshes public data and is not claimed bit-for-bit reproducible from a network-independent snapshot. Raw diagnostics, downloaded source documents and screenshots remain ignored under `output/playwright/production-polish-v1/`; none are new public assets.

## Public verification and remaining boundaries

Read-only production requests: 108 known routes returned 200 with expected canonical URLs; homepage exposes twelve hreflang alternates; sitemap and both portrait assets return 200; unknown English/Arabic/Tamil routes return 404. Nine case-study GitHub evidence links return 200. Résumé/CV, MMCATS source and acceptance report, PACE-RAG, itch.io and booking links are reachable; LinkedIn returned 429. Contact links are inspected as `mailto:` destinations without sending messages.

**LIVE CONTENT OBSERVED — DEPLOYMENT IDENTITY UNVERIFIED.** Public entry `/assets/index-B21BXwwj.js` is 214,594 bytes, SHA-256 `823d1d6b7051c101df23cc902f628a626743572b7abc55fdab530f4c12777abc`; final local entry differs. Public `main`, a successful local build or Cloudflare headers do not identify a Cloudflare deployed SHA. These local corrections have not been published and live parity is not established.

Remaining actions: owner confirm any distinct WenSymes primary-engagement end; approve/apply suggested external document text; qualified review of consequential translations; actual assistive-technology/physical-device review; authorized future deployment with identity/artifact verification. These are external/editorial exceptions, not unresolved reproduced engineering regressions. No release certification is claimed for MMCATS or other independent applications.

## Safety

No commits, pushes, deployments, hosting/DNS changes, external document edits, messages, new telemetry, dependencies or sibling-project writes. Existing owner work is preserved. Publication-candidate secret scanning uses Gitleaks with redacted local evidence; scoped whitespace excludes the owner's unrelated expansion-document change. No raw résumé captures, private photos or diagnostic screenshots are shipped.
