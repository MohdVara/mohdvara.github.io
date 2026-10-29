# PME v1.7.1a — Release Closure Results

Local implementation and verification, 29 October 2026 (Asia/Kuching). ID: `pme-knowledge-1.7.1a`.

## A. Executive summary

**READY FOR OWNER RELEASE REVIEW.** The search experience no longer waits for optional semantic readiness: approved, deterministic and lexical results remain usable while enhancement initializes, fails, is cancelled or retries. The browser MiniLM implementation, ranker, approval policy and approved knowledge remain intact. Maintained application lint passes through an enforceable generated-code boundary. Both applications are built, packaged and rehearsed as a compatible local pair.

All **355 starting tests remain passing; 362 tests now pass** (portfolio 233, PACE-RAG 129). No commit, push, tag, registry publication, deployment, DNS change or production setting change was performed. This recommendation is an engineering review state, not owner release approval or a claim that production serves these artifacts.

Remaining limitations are explicit: cold mobile model initialization can still time out; historical suggestion-ranking trade-offs remain; generated Entire lint still has five errors; independent holdout/native-language/physical-device review is pending; production alias, settings and rollback authority need operator confirmation before publication.

## B. Starting state

Candidate footer revisions identify the starting checkout HEAD; these uncommitted artifacts do not invent a new source commit. The ledger fingerprint identifies the reviewed dirty source. Both repositories remain on `main`, at portfolio `79e897e73bce97adf4347a4522513249154ca783` and PACE-RAG `1a517cac30ec321944b3da5a2a18858a1bf53500`. The starting status inventories contained 89 and 88 entries respectively, including earlier uncommitted PME work. Source files, status, hashes and actual existing production-build directories were copied to an isolated `/tmp/pme-v171a-baseline` before implementation. Comparison uses these actual v1.7.1 artifacts, not only the older English integration.

Baseline tests reproduced 231 + 124 passes; typechecks and PACE lint passed. Portfolio full lint reproduced the five generated-plugin errors. The starting assistant was `1.6.2-hardening.1`, main script 211,828 bytes, lazy assistant 85,952 bytes. Exact opening already deferred vectors. Custom search displayed lexical content quickly but disabled search/follow-up controls until enhancement terminated, including a roughly 31-second mobile timeout. This patch fixes that usability/lifecycle boundary.

The machine ledger lists task-specific changes relative to the preserved starting files, separately from the larger dirty Git diff. Earlier typography, calendar, NAAE, English-policy, knowledge and unrelated owner work were retained. Build-only `public-github.json` verification timestamps were restored to their starting source bytes after final builds. No private/ignored environment file was copied into release artifacts. Task changes pass whitespace validation; the larger Git diff retains the pre-existing owner whitespace at `docs/portfolio/PORTFOLIO_CASE_STUDY_EXPANSION.md:6`.

## C. Progressive semantic enhancement

The existing resolver still prioritizes exact reviewed answers, deterministic facts/technology composition and conservative lexical evidence. Exact/fact paths return without model or vector acquisition. Custom lexical results render first; enhancement runs separately, with enabled search, related-question and library controls. Semantic similarity never authorizes an automatic answer.

The UI provides ready, improving, updated, unavailable, cancelled and optional-enhancement states, plus explicit improve/retry/cancel controls. One polite live region reports state changes without download-percent announcements. Progress labels/actions use the existing localization system and their own locale attributes; professional questions, answers and evidence remain English (`lang=en`, LTR, translation isolation).

An active query ID, component lifecycle, corpus identity and abort scope guard every asynchronous publication. A replacement query cancels obsolete work; an identical pending query keeps its existing operation. Approved answers cannot be replaced by a later semantic suggestion. Suggestions upgrade only for the still-active unresolved query, after existing integrity/citation validation. Focus is retained when suggestions arrive. Close/unmount/cancel terminates pending embedding workers; an idle initialized worker can serve subsequent queries until closure.

Touch-sized screens, constrained connections, save-data and low-memory hints default to explicit enhancement. Visitors can opt in. Desktop enhancement remains available through the existing MiniLM/ONNX/WASM path. No provider, cloud generation, model, vector format, automatic-answer threshold or startup preload was added.

Asset acquisition and body reading have a separate 15-second deadline and operation abort signal. Validated vectors publish only for a live operation; failed vector retries bypass a potentially corrupt cached response. The existing 30-second worker/model request deadline remains unchanged. Worker crashes reject the operation and dispose the worker; their handled worker error does not also become an uncaught browser error. Network, native initialization and computation cannot all be individually interrupted inside the model library; worker termination and stale-output guards bound their effect. Ordinary application errors remain observable by QA.

## D. Performance verification

Measurements are local synthetic intervals, not real-user Web Vitals or statistical proof. Desktop: 1440×1000, unthrottled. Mobile: 375×812, touch, 4× CPU slowdown, 100ms latency, 500,000 B/s down and 125,000 B/s up. Reduced motion was enabled. Before/after runs were serial, without other heavy QA. Warm-up is excluded; p95 is nearest-rank. Input/result intervals include Playwright fill, click and observation overhead. First-control time starts at navigation; first-result time starts at the scripted interaction, after controls become ready.

| Exact question; 10 samples each | First result median / p95 before (ms) | Current (ms) | First control current median (ms) |
|---|---:|---:|---:|
| Desktop cold | 121.5 / 267.1 | 132.0 / 215.9 | 83.9 |
| Desktop warm | 135.4 / 183.5 | 122.2 / 152.8 | 64.3 |
| Mobile cold | 241.3 / 324.4 | 199.4 / 716.2 | 2,529.1 |
| Mobile warm | 257.7 / 1,045.6 | 205.3 / 253.3 | 402.2 |

Exact paths requested zero vectors/models before and after. Cold Lab page/knowledge transfer was 821,704 → 823,124 bytes; warm median was 600 bytes. This is a 1,420-byte increase, not a new payload-saving claim. The full approved knowledge remains 968,290 raw bytes, including 408,576 vector bytes; v1.7.1's vector deferral is preserved.

| Custom query | Before usable controls median (ms) | Current usable controls median (ms) | Enhancement outcome |
|---|---:|---:|---|
| Desktop cold, n=3 | 813.4 | 133.6 | 3/3 available; current terminal median 820.0ms |
| Desktop cache-warm restart, n=10 | 720.8 | 128.8 | 10/10 available; current terminal median 718.4ms |
| Mobile cold, n=1 comparison | 31,215.7 | 256.4 | Current default defers; prior model timed out |
| Mobile cache-warm explicit restart, n=3 | 30,316.0 | 209.8 | Model still times out; lexical remains usable |
| Mobile cold explicit opt-in, n=1 current | — | 247.3 | Model timeout at 31,411.2ms; not semantic success |

A larger current mobile-default sample confirms **first usable result/control median 217.8ms, p95 336ms (10 cold samples)**; warm median 202.4ms, p95 223.7ms (10 samples). All controls stayed enabled and these journeys requested zero model/vector resources. Cold initial control readiness still takes about 2.53 seconds under the profile; the 218ms value is not total navigation-to-result latency.

A retained, already initialized worker is different from a cache-only model restart. After an explicitly unthrottled warm-up, 10 mobile queries under the prescribed throttling produced semantic suggestions at median **113.4ms / p95 142.4ms**, versus 99.3 / 139.7ms before; first lexical result was 81.1 / 117.3ms. Desktop retained-worker semantic median/p95 was 72.8 / 699.5ms, versus 65.2 / 72.8ms before. The desktop outlier is retained, not discarded. This patch improves usability, not total model initialization or every latency statistic.

Stage evidence is recorded separately in raw resource timings and `pace-rag:embedding` measures. Current desktop cold vector requests took 2.2–4.5ms each; mobile cold explicit requests took 531.5ms and 921.7ms. Integrity validation remains in the measured pipeline. In the unthrottled worker warm-up, the 22,972,370-byte model downloaded in 21.9ms and the 21,596,019-byte WASM in 43.8ms on loopback; those are not mobile download predictions. End-to-end warm embedding median/p95 was 19.4 / 23.4ms on mobile. Exclusive native model initialization versus computation CPU is **not isolated**; successful warm-up, network resource durations, end-to-end embedding and ranking/result completion are observable separately. A timed-out mobile run has no successful initialization or first semantic suggestion. Initial network-settle timings, complete per-resource sizes/durations, warm-up and outliers remain in the ledger/raw profiles.

Current unforced main-realm JS-heap medians during initialized-worker sampling were about 7.5MB on desktop/mobile. These exclude worker/native/WASM/browser allocations and cannot establish a memory improvement or physical-device safety. Repeated close tests release embedding workers, and page-close samples report zero workers; the portfolio's unrelated artwork worker is not an embedding leak.

| Portfolio emitted bundle | Before raw / gzip-9 / Brotli-9 | Current |
|---|---:|---:|
| Main JS | 211,828 / 64,850 / 60,874 | 211,828 / 64,855 / 60,870 |
| Lazy assistant JS | 85,952 / 27,564 / 26,012 | 87,923 / 28,185 / 26,598 |

Main-script headroom remains **3,172 bytes** under the unchanged 215,000-byte limit. Compression figures are computed alternatives, not observed production transfer. No aggressive bundle reduction was attempted.

## E. Lint and tooling

Entire CLI 0.12.2 identifies `.opencode/plugins/entire.ts` as generated by `entire enable --agent opencode`. Its supported local help exposes no lint-output configuration. Isolated regeneration, with initial commits/session pushes disabled, produced byte-identical code and the same five `no-explicit-any` diagnostics. The real generated plugin and hooks were not modified.

`verification/generated-integrations.json` names only that exact path, tool, provenance and SHA-256 (`569fb4bd1e10bfbdd2eb5b379c4e6e541c9f254d893e22ac3c8ca8604c94dafb`). `lint:app` runs the original TypeScript ESLint rules plus maintained .mjs syntax checks, classifying only this verified generated file separately. Unknown changes to it fail the boundary. Tests prove a newly authored OpenCode plugin still fails on explicit `any`. There is no broad directory ignore or weakened ESLint rule.

`lint:app` passes with zero errors/warnings. `lint:generated` and original `lint`/`lint:full` still **FAIL** with five errors at lines 18, 199, 244, 254 and 402. Generated syntax/provenance checks pass; SDK type integration and a live OpenCode session are **NOT VERIFIED** because that SDK/runtime is not an application dependency. CI gates maintained code and visibly reports generated/full diagnostics independently. Upstream generator remediation remains required; re-review its output and update the exact registry only when that changes.

Both repositories pin **Node 22.23.4**, verified with **npm 10.9.9**. The official [Node archive/checksums](https://nodejs.org/dist/v22.23.4/SHASUMS256.txt) verified the isolated local binary. Engines, .nvmrc, runtime checks, CI and development/build instructions now agree on the supported Node 22 minimum. Local clean lockfile installs, tests, typechecks and production builds pass without EBADENGINE. A first offline portfolio install lacked one cached locked tarball; a lockfile-pinned online install supplied it, and the final offline clean install passed. Existing dependency deprecation notices remain. Only the local assistant package version changed; no unrelated dependency upgrade was made.

The PACE CI workflow requires a full 40-character `PORTFOLIO_RELEASE_REF`, checks out complete canonical companion sources, and prepares existing pinned fixtures before running the full suite. This closes the older sparse-checkout test gap. The remote variable, actual CI execution and Cloudflare dashboard runtime overrides are pending verification; local source configuration does not change the hosted build environment.

## F. Retrieval acceptance

Fresh lexical and semantic paired suites ran against the actual release candidate. Comparison with the preserved v1.7.1 candidate metrics is identical across every recorded set. The older historical comparison is retained separately. No verification-set tuning, ranker change, content edit or threshold relaxation was performed.

| Positive set | Semantic Top-1 / Top-3 | Lexical Top-1 / Top-3 |
|---|---:|---:|
| Development, 100 | 75 / 99 | 53 / 82 |
| Verification50 | 40 / 48 | 33 / 41 |
| Verification40 | 30 / 39 | 22 / 32 |
| New exact knowledge, 8 | 8 / 8 | 8 / 8 |

All 51 active answers remain available, two retired answers remain retired, eight existing reviewed examples and all eight new exact questions pass. All 128 professional critical requests and 10 implementation critical requests abstain. Current suites report zero incorrect automatic answers, invalid citations or cross-corpus references.

**Explicit engineering acceptance:** the 17 historical positive-query rank declines are an **ACCEPTED LIMITATION for local closure**, with noncritical recommendation-quality impact. Corpus growth/BM25 normalization and changed evidence wording were already diagnosed in v1.7.1; this patch does not worsen those results. Mitigation is conservative suggestion-only semantics, unchanged critical protections and approved exact/fact answers. This is not acceptance on the owner's behalf: **owner release acceptance of those trade-offs remains PENDING**. Independent holdout preparation/integrity tooling remains intact; external labels/adjudication remain pending. Existing agent-authored benchmarks do not establish independent generalization or correctness probabilities.

## G. Knowledge and timestamp integrity

The approved packet remains `9bde0ad5517a91f8317e133d9baeedb0c0b8b7d0cb06e7ab92beb591f58cf286`; corpus remains `b0e1b371c34d449b`, with 35 documents, 51 active reviewed answers, 70 question rows and 196 chunks. Receipt, publication register, approved packet/source projections, source inventory, retirements, every manifest/asset/vector hash, index history and per-record revision ledger match the starting bytes. No approval or activation was performed; no factual correction was needed. Intake `draft` statuses are preserved raw artifacts; the unchanged approval overlay supplies approved runtime records.

Knowledge indexing remains `2026-10-29T05:03:43.315Z`, oldest included source check `2026-10-29T03:52:05.964Z`. Build time remains separate from deployment, source revision and editorial review. No deployment timestamp or review date was invented.

Nine progress/action units are machine-authored in the ten target locales with source hashes and truthful session-assistant provenance. All **11 × 1,593** catalog units are complete; zero missing/stale translations/errors, 97 existing editorial warnings, incremental translation dry-run zero pending. Cultural/Gregorian policy, Arabic deterministic Hijri handling, UTC/RTL isolation, CJK horizontal metadata, canonical-English date disclosure and translation notices are preserved. Fluent review and screen-reader speech are not certified.

## H. Release rehearsal

The pinned private integration is **`1.6.2-closure.2`**, installed from the local archive with matching lockfile. Complete portfolio `dist` and PACE `output/static-site` candidates, plus complete local v1.7.1 rollback artifacts, are archived under ignored `output/playwright/pme-v171a/releases/`. The ledger records SHA-256, tree fingerprint, file count, lockfiles, source state and integration hash. Compatibility remains manifest schema 1, `minilm-q8-wasm-v1`, exact approved corpus/packet and retained indexing timestamp.

Six isolated-host pair checks pass: old/old, new portfolio/old Lab, new/new, old local portfolio/new Lab, Lab-first rollback, then portfolio rollback. Both applications return the approved exact answer and b0 identity in every window. The rollback Lab root wraps the preserved old `dist/lab` with unchanged static routing wrappers; the candidate uses the complete new static package. The local old v1.7.1 portfolio already contains the inventory URL; a separate production-like missing-inventory fixture correctly returns 404 and **blocks Lab rollout**. Missing/stale manifests fail closed without false freshness. Browser cache from the previous release reloads the matching current artifact safely. Corrupt vectors, failed/interrupted acquisition and obsolete pending requests are covered by loader/unit and browser fault checks.

Canonical `/pace-rag/`, a valid deep link, prepared `/page-rag/` redirects with query preservation, unknown-route 404 and canonical metadata pass locally. The isolated server emulates the prepared static redirect rules; it is not proof that Cloudflare has installed them. Complete-directory switching rehearses **portfolio first → verify evidence → Lab second**, and rollback in reverse. No isolated pointer/answer/vector replacement is proposed. Rollback archives are local v1.7.1, **not today's older hosted production deployment**.

Read-only provider listing and HTTP capture identified these production candidates:

| Project | Latest listed deployment | Source | Immutable candidate |
|---|---|---|---|
| mohdvara-portfolio | `c22ade84-3449-4bb2-8ff8-16d8792819f3` | `9090099` | `https://c22ade84.mohdvara-portfolio.pages.dev` |
| pace-rag-git | `a5ecd965-6fbe-4f0d-a5d7-73a121865702` | `9d66c8c` | `https://a5ecd965.pace-rag-git.pages.dev` |

Prior listed candidates are portfolio `fa589b09-6484-4cbd-943c-c562937711dc` (`15d4214`) and PACE `24a7387c-aa91-48af-846a-6e87e59af53c` (`0dfab5a`). Candidate URLs respond; latest HTML/entry-script fingerprints match live responses. Both PACE candidates have identical sampled HTML, so HTTP equivalence does not uniquely identify its active alias. Read-only list access does not establish rollback-write permission. Active production aliases, complete retained provider artifacts, dashboard build/runtime settings and operator permissions remain **NOT VERIFIED / pending before deployment**.

Live read-only checks still show the inventory evidence URL as **404**, canonical Lab as 200, mistaken `/page-rag/` as 404, and hosted corpus `b555f3ee70c516ab`. These observations are not a b0 deployment claim.

Production capture procedure: use `wrangler pages deployment list --project-name <project> --environment production --json`, reconcile the exact active production alias and previous retained deployment in the dashboard, capture their immutable URLs/source/build settings and current corpus pointers, verify assets/inventory, and confirm the operator has Pages deployment/rollback authority. Record complete matching production rollback choices before any authorized rollout; listing and these probes alone are insufficient. Do not execute rollback or deployment mutations during capture.

## I. Final release gates

| Gate | Outcome | Evidence / scope |
|---|---|---|
| Approved knowledge, exact answers, citation identity | PASS | Exact baseline hashes and current runtime approval checks |
| Critical abstention | PASS | 128 professional + 10 implementation; no incorrect automatic answers |
| Progressive fallback / mobile timeout UX | PASS | Usable controls/results while optional work continues or fails |
| Cancellation, retry, stale results, worker closure | PASS | Unit regression coverage + 33 browser scenarios |
| Maintained app lint / PACE lint | PASS | Original application rules; PACE syntax/unused checks |
| Generated lint / original full portfolio lint | FAIL | Five unchanged upstream diagnostics, independently visible |
| Generated syntax/provenance | PASS | Byte-identical regeneration; exact boundary enforcement |
| Generated SDK/live OpenCode integration | NOT VERIFIED | External runtime not installed as application dependency |
| Supported local Node clean install | PASS | Node 22.23.4/npm 10.9.9; no engine warnings |
| Tests / typechecks / production builds | PASS | 233 + 129; both applications |
| Main JS budget | PASS | 211,828 ≤ 215,000 raw bytes |
| Localization / timestamp integrity | PASS | 11 complete catalogs; preserved semantic dates/calendar policy |
| Cross-browser / accessibility semantics | PASS | Chromium, WebKit, Firefox; functional scope below |
| Compatible release pair / local rollback | PASS | Complete artifacts, six transition checks, fault paths |
| Historical suggestion-ranking trade-offs | ACCEPTED LIMITATION | Engineering acceptance explicit; owner release acceptance pending |
| Cold mobile semantics | ACCEPTED LIMITATION | Can time out; optional, cancellable, retryable; useful results unaffected |
| Native/physical-device/production performance | NOT VERIFIED | No broad certification from local synthetic checks |
| Independent holdout | NOT VERIFIED | External preparation/adjudication pending |
| Production alias/settings/rollback authority | NOT VERIFIED | Read-only candidates captured; dashboard confirmation pending |
| Publication/deployment | NOT VERIFIED | Intentionally not performed; separate authorization required |

Final browser evidence includes **33 progressive scenarios across Chromium 156.0.8078.73, WebKit 26.0 and Firefox 142.0.1**, 18 additional portfolio journeys across all three engines (English commercial and independent cases, Arabic Hijri/Gregorian/RTL, Japanese metadata and keyboard utility controls), existing Lab QA, 33 localized freshness layouts (320/375/1440, largest text at 320), and four host/Lab contexts exercising all eight new exact questions. Fault workers are explicitly synthetic fixtures; real model success/timeouts are measured separately above. Errors and paid inference requests are zero in final suites. An initial run exposed duplicate uncaught worker-crash errors in WebKit/Firefox; scoped worker error handling was corrected and all 33 cases rerun cleanly. Full physical devices, native-language editorial quality and assistive-technology speech remain outside this evidence.

## J. Owner release decision

There is no unresolved critical local citation, corpus, compatibility or data-integrity failure. The candidate is ready for owner review with the limitations above; publication is not authorized.

Before release, the owner must accept the historical recommendation-ranking trade-offs, optional cold-mobile model failure behavior, generated-code lint disposition and disclosed review gaps. The operator must confirm actual production/rollback identities and permissions, compatible hosted Node settings, a complete retained production pair, and the intended Git-connected deployment path. Complete the separate CI companion reference using an actual reviewed 40-character portfolio commit; no commit identity is invented for dirty source.

Review and selectively stage the dependency chain of prior PME changes plus this patch, excluding unrelated owner files, private output and browser sessions. Agree matching source commits and frozen artifacts. After authorized commits exist, rebuild/re-freeze the pair with actual footer and companion commit identities and rerun the applicable gates. Any preview push or main push needs separate authorization; a main push can deploy through native Cloudflare Git integration independently of CI. Avoid indiscriminate staging or publishing one side prematurely.

After authorization, publish portfolio first, then require the canonical inventory URL to return 200 with SHA-256 `af67eb6536c397e7cb2842224173a7bd609e31e88dd793a544f9b7f7e150f6bb`. Verify portfolio manifest/package, footer revision, timestamps and assistant. Only then publish PACE. Verify canonical/deep/legacy routes, query redirects, all asset hashes, b0 corpus/packet/indexedAt, English-only approved answers, lexical fallback, optional semantic behavior and zero unexpected inference. Capture deployment IDs and UTC deployment times from the provider only after those deployments actually occur.

If rollback is required, restore the complete captured previous PACE deployment first, then the complete captured previous portfolio deployment; verify their actual old corpus/routes and source identities. Preserve approval archives/index history. Do not substitute the local v1.7.1 rollback pair for the older hosted production pair or swap isolated pointers/vectors.

Reproduction commands and exact artifact/log hashes are in `verification/pme-knowledge-1.7.1a.json`; operational instructions also live in portfolio `docs/DEVELOPMENT.md` and PACE `docs/RELEASE-CLOSURE.md`.
