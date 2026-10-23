# Portfolio engineering case-study evolution v1

23 October 2026 · Asia/Kuching. **Complete locally, with verification limits.** No commit, push or deployment.

## Source and changes discovered

Inspected branch/HEAD, tracked and untracked changes, history, current implementations, generated glyph assets, tests and existing verification manifests. Starting branch: `main`. Starting revision: `3da08e49b937fa348a33e53cd353cb190b921a20`. The previous case-study implementation is `215bc73`, with later baseline checks in `0ab00f4` and `7c27a4e`; the expansion report is dated 22 October. The owner’s existing whitespace edit in that report and untracked Playwright snapshots were preserved.

| Finding | Source/status at inspection | Narrative treatment |
| --- | --- | --- |
| Glyph reconstruction | `8d267c8`; IMPLEMENTED_AND_TESTED, source/test verified locally | Portfolio-specific processing of an existing 4,632-glyph SVG; not reconstruction directly from a photograph |
| Light glyph palettes and ink reconstruction | Retained source/tests and historical manifests; EXPERIMENTAL / SUPERSEDED for homepage display | Failures and tonal lessons, never portrayed as the final light portrait |
| Current theme selection | `src/App.tsx`; IMPLEMENTED_AND_TESTED / VISUALLY_OBSERVED | Dark selects glyph SVG; light selects separate raster illustration |
| Script-adaptive landscapes | `2f941f6`; IMPLEMENTED_AND_TESTED | Context for multilingual composition, without repeating the entire localization architecture |
| Narrative 404 | `36709fb`; IMPLEMENTED_AND_TESTED; local Pages HTTP evidence recorded previously | Brief NAAE application: distinct glyph composition, accessible recovery and static fallbacks |
| Adaptive utility rail | `f710fc9`, dark default `b8c68c0`; IMPLEMENTED_AND_TESTED | Reused preference services, nonmodal focus behavior, responsive/RTL docking and privacy-state boundaries |
| This content expansion | LOCAL_UNCOMMITTED | Two existing case studies, all eleven locales, source links and static evidence |

Committed local source is not proof of remote publication or live deployment. No new LIVE_DEPLOYMENT_VERIFIED claim is made. Older manifests describe their own then-uncommitted snapshots, not the current Git status. Unrelated employer navigation, project layouts, Incident Zero and GitHub refresh changes were inspected for scope and excluded from the new narratives.

## Placement and engineering narrative

The existing NAAE case study gains **Engineering the Visual Identity: From Narrative Landscapes to Glyph-Based Portraits**. It explains the competing requirements of distant recognizability and authentic nearby typography, the grid’s information limit, multiscale luminance analysis, font-calibrated ink coverage and constrained same-letter shape/size variants. The alternatives are tonal adjustment, structural reconstruction and theme-specific ink treatment. Deterministic build-time processing keeps these calculations out of the runtime path. No facial-landmark detector or new anatomy is claimed.

Dark luminous strokes and light ink-on-paper require different figure-ground mappings. Historical palette/eye-highlight experiments are summarized as limits, including pale small glyphs and excessive highlights. The actual current light illustration is explicitly distinguished from dark SVG typography. No invented recognition score, participant result or photographic source provenance is published.

**The Unmapped Path** adds a bounded second application: seeded SVG-text scenery supports localized HTML recovery instead of carrying the error message itself. Separate compact geometry and static fallback content matter more than spectacle. Recorded local Pages HTTP 404/200 checks are attributed to the earlier verification; this task did not rerun Wrangler or certify production HTTP behavior.

The Multilingual Engineering case study gains **Adaptive Preferences Across Scripts and Layouts**. It explains discovery as a design motivation, not measured usability research. The rail manages disclosures while existing services own theme, size, scenery and consent. It documents on-demand loading/retry, focus without a trap, dismissal, logical docking, compact expansion, horizontal CJK controls and post-hydration indicators. Consent UI, stored consent, effective DNT/GPC suppression and analytics activation remain distinct.

No fourth case study is justified: the existing Multilingual Engineering page already represents portfolio product architecture. The new stories complement one another without duplicating engine architecture or localization foundations.

## Existing content retained

Quick Reads remain concise and unchanged. Existing `architecture`, `evolution`, `naae-limitations`, `localization-pipeline`, `direction-demo` and `language-boundary` anchors, saved-output comparison, standalone release/version caveats and English-only PACE-RAG region remain. New anchors: `visual-identity`, `unmapped-path`, `adaptive-preferences`. No route, canonical, hreflang, sitemap, publication date, professional fact or résumé change.

## Evidence presentation

Three fresh, reviewed application captures are optimized to WebP at 1440 × 900, DPR 1, reduced motion, with landscape readiness and complete textures verified:

| Asset | Bytes | Evidence |
| --- | ---: | --- |
| `public/images/engineering/identity-dark.webp` | 154,272 | Actual dark SVG glyph portrait within the narrative landscape |
| `public/images/engineering/identity-light.webp` | 153,986 | Separate current light illustration |
| `public/images/engineering/utility-ar.webp` | 107,112 | Arabic RTL rail with language panel open on the left |

Total: 415,370 bytes. These show current local treatments, not invented historical before/after images. All have localized descriptions/captions, explicit dimensions, preserved aspect ratios, asynchronous decoding and lazy loading. No comparison library, renderer import or dependency was added. Homepage resource inspection found no requests for these case-study images. No private source photograph or diagnostic raw data was published.

Revision-pinned links point to existing renderer, rail, implementation notes and evidence. The machine-readable manifest maps every new canonical unit to sources/artifacts and records hashes, statuses and limits. Historical glyph palette, eye-highlight and paper-ink records remain inspectable rather than being described as current homepage behavior. Raw captures, failed attempts, browser logs and uncompressed screenshots remain ignored under `output/playwright/case-study-evolution/`.

## Localization

All eleven locales retained: en, ms, ar, ta, ja, zh-Hans, es, fr, de, pt-BR, hi. Added **19 canonical units / 190 target translations**; **1,520 units per locale**, zero missing/stale, zero validation errors, 97 retained editorial warnings. Extraction, source hashes, coverage and date audit pass. The configured translation command was attempted but requires unavailable explicit credentials/model; direct machine authoring follows the repository’s allowed fallback. Provenance is `machine_translated`, `development-assistant`, `session-model-unspecified`; no human review was invented.

Technical terminology and privacy/status negations are queued in `TRANSLATION_EDITORIAL_REVIEW_QUEUE.md`. Disclosures and equivalent English-original links remain. PACE-RAG questions/answers/evidence stay English-only. Current coverage/date audit artifacts and PME QA records are updated without overwriting historical results.

## Verification

Final check results are recorded in `verification/portfolio-case-study-evolution-v1.json`. The production build required access to the existing native compiler cache; the first sandboxed attempt failed. CLI browser startup/session persistence also failed; browser verification used the repository’s established Playwright library scripts and cached browser tooling. Capture retries corrected theme initialization and waited for complete landscape textures; only reviewed final captures were published.

| Gate | Result |
| --- | --- |
| TypeScript / lint | Pass |
| Production build / prerender | Pass; existing large-chunk warning retained |
| Full unit/integration/static tests after build | 201 passed, 0 failed, 0 skipped |
| Localization extraction / validation / strict coverage / date audit | Pass; 0 missing/stale/errors, 97 editorial warnings |
| Static route, SEO, asset and internal-fragment audit | 108 routes, 0 issues |
| Existing case-study browser matrix | 33 localized routes; 72 layouts across en/ar/ta/ja at 320–3840 px; 0 page errors or horizontal overflow |
| Automated accessibility | 24 main-region scans across en/ar/ta/ja and both themes; 0 reported violations; existing artwork-region contrast incompletes remain |
| Image/interaction checks | New images decode with descriptions/captions across eleven locales; native comparison keyboard/zoom/reset/fallback, Arabic enlarged text, equivalent English navigation and Japanese vertical controls pass |
| Existing multilingual browser suite | 88 layouts, 9 scenarios, 11 assistant isolation checks; 0 page errors, translation requests or missing rendered source units |
| Focused new-section review | English desktop/mobile, Arabic mobile, Tamil mobile and Japanese desktop captured; 0 horizontal overflow |
| Entry budget | 214,948 raw / 65,855 local gzip bytes; baseline 214,948 / 65,856; unchanged 215,000-byte ceiling |
| Lazy case-study chunks | JS 22,370 raw / 8,080 gzip; CSS 3,372 / 1,029 |
| Homepage evidence-media requests | 0 |
| Task-owned whitespace | Pass; whole-worktree check still finds the preserved owner report’s pre-existing trailing whitespace |

All JS/CSS chunks total 6,007,929 raw / 1,803,361 local gzip bytes, including translated catalogs and other existing lazy code. This is not initial transfer or a speedup measurement. The entry budget has only 52 bytes of headroom. Fixed navigation can appear over the top of ignored element-only review captures; it is not included as a modification to the public evidence images.

The QA script’s stale language-menu selector now opens the existing utility rail; its assertions remain in place. Added image checks verify actual loading, intrinsic dimensions, lazy loading and localized descriptions/captions. No test dependency or performance budget changed. The build’s automatic GitHub snapshot timestamp refresh was restored to the starting source file; it is unrelated to this content task and not a new publication claim.

## Limits and publication status

Automated scans do not establish complete WCAG compliance. Existing contrast incompletes still require contextual manual assessment. No real screen-reader, physical-device, qualified linguistic, participant recognition or usability study was performed. New content and reviewed assets remain **LOCAL_UNCOMMITTED**. Source links are revision-pinned references from local Git; their remote HTTP availability and public deployment parity were not independently rechecked. Local browser and static artifact checks do not certify Cloudflare production behavior.

No invented commercial outcome, algorithm, historical screenshot, official release date or performance gain was added. Portfolio-specific reconstruction remains distinct from standalone NAAE. Underlying artwork, 404 generation, utility preferences, analytics/consent, hosting, career facts and résumé are untouched. Other repositories were not modified. No commit, push or deployment occurred. Existing owner modifications remain.

## Remaining recommendations

1. Obtain fluent technical editorial review of the 190 new translations and the retained warning queue.
2. Review actual screen-reader and mobile-device behavior, including the existing contrast incompletes.
3. If historical visual comparisons are later published, review original artifacts and provenance first; do not relabel current theme captures as before/after evidence.
