# PME v1.7.1 — Release Hardening Results

Local implementation and verification, 29 October 2026 (Asia/Kuching). Internal ID: `pme-knowledge-1.7.1`.

**CONDITIONALLY READY.** The approved knowledge is intact, deferred loading is cheaper, and the demonstrated WebKit hydration failure is fixed. Full portfolio lint still fails on five errors in a generated third-party integration. Historical suggestion-ranking recovery targets remain unmet, and cold semantic initialization times out under the tested mobile conditions. These are explicit release-review items; this report does not certify unconditional production readiness. No commit, push, package publication, deployment, DNS change or remote redirect change was performed.

## Implementation and baseline

The work prioritizes the owner's follow-up: regression diagnosis and deferred knowledge loading, with the existing 215,000-byte main-script budget retained. No approved content was rewritten, reapproved, expanded or reindexed. No runtime dependency was added.

Starting branches remain `main`. Portfolio HEAD: `79e897e73bce97adf4347a4522513249154ca783`; PACE-RAG HEAD: `1a517cac30ec321944b3da5a2a18858a1bf53500`. The starting worktrees were dirty: the prior typography, calendar, English-policy/API, knowledge synchronization, case-study expansion and unrelated session/output work were preserved. Per-file starting hashes live in ignored `output/pme-v171/*-starting-state.json`. Baseline sources and built files were preserved outside the repositories in `/tmp/pme-v171-baseline/`; local rollback archives are listed below.

The read-only baseline audit is `output/pme-v171/baseline-audit.json`. Typechecks, 229 portfolio tests, 121 PACE-RAG tests, publication/index checks and production builds were freshly run. Initial build attempts hit sandbox restrictions on SWC cache and the loopback embedding server; authorized local retries passed. A source snapshot initially placed under `output/` was scanned by ESLint; moving it outside the repositories and rerunning the **full unchanged lint command** reproduced the original five errors. The extra copied-source errors are not application regressions and no lint ignore rule was added.

Fresh baseline bundles reproduce 211,828 raw main bytes and 85,417 raw lazy-assistant bytes. The actual professional corpus remains `b0e1b371c34d449b`: 35 documents, 51 active reviewed answers, 70 question rows, 196 chunks, 968,290 raw knowledge bytes and 408,576 vector bytes. The owner packet remains `9bde0ad5517a91f8317e133d9baeedb0c0b8b7d0cb06e7ab92beb591f58cf286`. The integration advances from `1.6.2-knowledge.1` to **`1.6.2-hardening.1`**; the PACE application/package contract remains 1.6.2, manifest schema 1 and the existing pinned MiniLM embedding specification.

Observations are classified explicitly: command/browser/profile results here are newly reproduced locally; the earlier v1.7 report is historical reference; public route/file results below are fresh read-only remote observations. Hosting dashboard state, previous production deployment IDs, physical devices, fluent translation review and independent holdout adjudication remain unverified/unavailable.

## Deferred loading and performance

`loadCorpus` now supports an optional deferred semantic stage; its default eager behavior remains compatible for other consumers. The assistant opts in. Opening still validates the complete core manifest, reviewed answers, source documents, chunks, technology facts, retirements and row/citation mappings. Only a custom query requesting semantic search loads `worker.json` and the two SHA-256-checked vectors. Concurrent requests share one load, failed/interrupted vectors preserve lexical results, explicit retry works, and an aborted component cannot publish late semantic state. The complete professional scope shares an identical immutable vector buffer instead of copying every row. Filtered scopes still preserve original row mappings.

Exact reviewed answers and deterministic facts need no vectors or model. Source/chunk text remains available immediately for conservative keyword evidence and offline use after opening. The first semantic query explicitly waits for its vectors; this also closes the prior baseline window where a query arriving before eager vector completion could silently remain lexical. Model initialization and remote-generation policy remain unchanged. No inference service is contacted automatically.

**Cold opening/exact-answer transfer improves from 1,230,792 to 821,704 bytes** in the uncompressed local Lab journey: 409,088 bytes saved (33.2%). Required knowledge assets before a semantic query fall from 968,290 to 559,714 raw bytes (42.2%); all 968,290 bytes remain available, with identical approved hashes. Two vector requests become zero. The final portfolio lifecycle probe also observes zero vector/model requests during initial navigation and exact-answer use.

The benchmark uses Chromium 156.0.8078.73, reduced motion, desktop 1440×1000 and mobile 375×812. Mobile uses 4× CPU slowdown, 100ms latency, 500,000 B/s down and 125,000 B/s up through CDP. There are ten cold contexts and ten warm-cache page runs per scenario after warm-up, separately reported. Before and after runs are sequential and use matching static servers; these are descriptive synthetic results, not real-user Web Vitals or statistical significance. The readiness observer records the first enabled search control; network-idle includes a quiet interval and is reported separately. Query intervals include Playwright input/observation overhead.

| Scenario (10 each) | Before interactive median / p95 ms | After interactive median / p95 ms | Before exact median / p95 ms | After exact median / p95 ms |
|---|---:|---:|---:|---:|
| desktop-cold | 148.4 / 191.1 | 116.2 / 151.6 | 138.6 / 280.0 | 127.2 / 140.1 |
| desktop-warm | 104.0 / 170.4 | 97.3 / 129.5 | 140.0 / 206.0 | 124.4 / 221.0 |
| mobile-cold | 2,594.2 / 2,633.0 | 2,604.7 / 2,640.0 | 286.7 / 420.1 | 300.6 / 431.3 |
| mobile-warm | 524.8 / 833.1 | 701.4 / 883.1 | 290.9 / 420.6 | 298.7 / 327.3 |

First interactive mobile-cold readiness is effectively unchanged (2,594.2 → 2,604.7ms). Network settling improves from 4,172.7 to 3,131.4ms, with p95 4,203.5 → 3,243.2ms; this is not a claim of a one-second improvement to first interactivity. Exact/cached timing distributions and outliers remain in the raw samples; no latency improvement is claimed.

Separate semantic runs measure three desktop cold initializations and ten warm-cache initializations, plus subsequent queries with the same initialized worker. Desktop cold median/p95 is 1,151.8/1,253.2ms before and 1,421.6/1,493.7ms after; warm-cache initialization is 1,266.2/1,793.8ms before and 1,506.1/2,017.6ms after. The measured roughly 0.24–0.27-second median increase is a disclosed cost, not an unconditional speedup. Subsequent warm-worker median/p95 is 104.0/165.7 → 117.5/642.1ms; the after-series outlier is retained.

One mobile cold semantic attempt per artifact reaches the existing model timeout: 30,267.2ms before and 31,337.3ms after, safely returning keyword results. These single attempts are not percentile evidence or successful semantic responses. Repeating ten expensive timeout runs was not justified. Separate desktop diagnostic pilots capture `pace-rag:embedding`, next-frame measures, vector resource timings and worker model/runtime requests. A cold pilot requests a 22,972,370-byte quantized model and a 21,596,019-byte WASM runtime; warm model cache and runtime resource behavior are recorded separately. These assets are unchanged and deferred. Pure parser CPU, native model peak memory and physical-device behavior are not isolated by this instrumentation.

The ten close/open heap samples report page JS heap after forced GC, including the portfolio's artwork; they exclude worker/native/ArrayBuffer backing storage. Median open heap is 13,615,982 → 13,558,690 bytes, and median retained delta after close is 98,518 → 102,248 bytes. The after-series retained-delta p95 is 3,017,932 bytes versus 620,000 before; the noisy/outlier values are retained and do not establish a leak or a memory improvement. A separate final semantic-close probe identifies the remaining `layout.worker` as artwork and verifies **zero embedding workers after closing**. NAAE's lifecycle is unchanged.

| Emitted portfolio asset | Before raw / gzip-9 / Brotli-9 | Final raw / gzip-9 / Brotli-9 |
|---|---:|---:|
| Main JS | 211,828 / 64,856 / 60,877 | 211,828 / 64,850 / 60,874 |
| Lazy assistant JS | 85,417 / 27,407 / 25,876 | 85,952 / 27,564 / 26,012 |

The strict main limit remains 215,000 raw bytes with 3,172 bytes of headroom. Final bundle sizes were resampled after the date fix. The Lab benchmark component/data did not change in that correction. Gzip/Brotli figures are computed alternatives, not observed production transfer or promises about Cloudflare encoding.

| Immutable knowledge asset | Raw bytes | Gzip-9 | Brotli-9 |
|---|---:|---:|---:|
| answers | 82,060 | 12,518 | 10,884 |
| documents | 96,784 | 22,851 | 20,575 |
| chunks | 374,229 | 45,177 | 38,523 |
| technology | 6,239 | 1,760 | 1,610 |
| retirements | 402 | 278 | 245 |
| questionVectors | 107,520 | 99,774 | 99,541 |
| chunkVectors | 301,056 | 277,778 | 277,145 |

Vector deferral was accepted because it removes measurable unnecessary work without altering the corpus or ranker. Serialized deduplication was not implemented: repeated metadata compresses well, and rewriting immutable assets would complicate compatibility for a smaller gain. Project filtering was rejected for this patch because cross-project discovery and technology relationships need global evidence. Chunk-text deferral would change immediate passage/offline behavior; it was not traded away to chase a target. No lossy quantization, model change, new cache/database or speculative architecture was introduced.

Artifacts: PACE `output/playwright/pme-v171/profile-{before,after}.json`, `semantic-{before,after}.json`, `semantic-*-detail.json`, `close-*.json`, `portfolio-lifecycle.json` and `performance-summary.json`. An initial semantic exploration that could start before baseline vectors were ready is separately marked exploratory; it is not mixed into the final timing series.

## Retrieval diagnosis and recovery decision

The ranker, thresholds, automatic-answer policy and frozen labels are unchanged. Fresh actual-artifact semantic and lexical evaluations reproduce v1.7's results. Before below means the integrity-pinned original English integration, not the pre-hardening v1.7 artifact. Current v1.7.1 equals pre-hardening v1.7 on these sets.

| Set | Original semantic Top-1 / Top-3 | v1.7 and v1.7.1 semantic | Original lexical Top-1 / Top-3 | v1.7 and v1.7.1 lexical |
|---|---|---|---|---|
| development | 76/100 · 99/100 | 75/100 · 99/100 | 55/100 · 82/100 | 53/100 · 82/100 |
| verification50 | 38/50 · 47/50 | 40/50 · 48/50 | 32/50 · 40/50 | 33/50 · 41/50 |
| verification40 | 30/40 · 40/40 | 30/40 · 39/40 | 23/40 · 33/40 | 22/40 · 32/40 |
| newKnowledge | 0/8 · 0/8 | 8/8 · 8/8 | 0/8 · 0/8 | 8/8 · 8/8 |

All 128 professional critical cases and ten implementation critical cases abstain. There are zero incorrect automatic answers, citation failures or cross-corpus references. The eight existing and eight new approved exact questions remain valid. These inspected, agent-authored sets are regression gates, not independent generalization evidence.

The audit identifies 17 positive-query rank declines. The table gives the intended document(s), exact current rank where available, intended candidate score and current leader. Full competing candidates, semantic/BM25/intent scores, retrieved chunk text and citations are preserved in `output/playwright/pme-v171/retrieval-diagnosis.json`. Reviewed answer ranking is separate from chunk selection; changing chunk boundaries would not fix these candidate-score declines.

| Mode / query ID | Intended source(s) | Rank before → current | Intended score before → current | Current leader (answer suffix) | Classification |
|---|---|---:|---:|---|---|
| semantic · `p-ntm-overview-0` | ntm | 1 → 2 | 0.5891 → 0.5730 | ntm-architecture | growth / BM25 normalization |
| semantic · `p-rag-evidence-3` | rag | 1 → 2 | 0.5600 → 0.5071 | rag-scale | growth + revised body |
| semantic · `p-availability-3` | engagement, resume | 1 → 2 | 0.3337 → 0.2949 | sync-laravel-evidence | growth / BM25 normalization |
| semantic · `v14-positive-8` | education | 3 → 4 | 0.4453 → 0.4573 | independent-work | growth / BM25 normalization |
| lexical · `p-insurance-leadership-2` | insurance | 2 → 3 | 0.7605 → 0.7079 | sync-inspectable-work | growth / BM25 normalization |
| lexical · `p-rental-domain-3` | rental | 2 → 3 | 0.9164 → 0.9282 | rental-lifecycle | growth / BM25 normalization |
| lexical · `p-ntm-overview-0` | ntm | 3 → 4 | 0.7539 → 0.7077 | ntm-verification | growth / BM25 normalization |
| lexical · `p-ntm-rag-0` | ntm, rag | 2 → 3 | 0.8223 → 0.7796 | rag-scale | growth / BM25 normalization |
| lexical · `p-ntm-rag-1` | ntm, rag | 1 → 2 | 1.0000 → 0.9926 | rag-evidence | growth / BM25 normalization |
| lexical · `p-ntm-rag-2` | ntm, rag | 1 → 5 | 1.0000 → 0.5032 | sync-commercial-independent | growth / BM25 normalization |
| lexical · `p-rag-evidence-0` | rag | 1 → 3 | 1.0000 → 0.9409 | ntm-rag | growth + revised body |
| lexical · `p-rag-evidence-1` | rag | 1 → 4 | 1.0000 → 0.6533 | resume-links | growth + revised body |
| lexical · `p-rag-evidence-3` | rag | 2 → 4 | 0.5833 → 0.3382 | rag-scale | growth + revised body |
| lexical · `verification-education-disclosure-1` | education | 1 → 2 | 1.0000 → 0.9574 | public-boundaries | growth / BM25 normalization |
| lexical · `v14-positive-7` | education | 3 → 6 | 0.7123 → 0.7061 | hr-distinction | growth / BM25 normalization |
| lexical · `v14-positive-23` | engagement, resume | 1 → 2 | 1.0000 → 0.5829 | sync-react-next | growth / BM25 normalization |
| lexical · `v14-positive-29` | rental | 2 → 3 | 0.9283 → 0.9114 | rental-lifecycle | growth / BM25 normalization |

Corpus expansion changes document frequency, average answer length and normalized BM25; new approved questions add competitors. Legitimate RAG wording corrections also change answer-body terms. The traces exclude stale cache/citation mismatches and threshold changes. No answer-specific exception or restrictive project filter was added.

Development-only experiments were deliberately not activated: compound product token normalization gives lexical 52/82 versus 53/82; bounding term frequency gives 53/81; question-fields-only gives 39/61 and semantic 61/82 versus 75/99. None improves the combined objectives. Verification sets were not used to tune those experiments. Recovery to all pre-v1.7 targets remains **unmet**, so no unconditional retrieval improvement is claimed. Further ranking policy work needs its own evidence-backed comparison under the preserved review guard.

The independent holdout is **pending external preparation and adjudication**. `evaluation/independent-holdout/README.md` and `scripts/evaluate-independent-holdout.mjs` provide locked-input SHA-256 validation, required source-grounded labels and per-query lexical outcomes. Running without external input explicitly reports pending; no queries, independent reviewer or results are fabricated. Semantic independent holdout preparation remains pending too.

## Evidence and approval audit

The active approval receipt, published synchronization, approvals, publication register, index history and all runtime asset bytes match the preserved pre-hardening state. The packet remains `9bde0ad5517a91f8317e133d9baeedb0c0b8b7d0cb06e7ab92beb591f58cf286`; indexedAt remains `2026-10-29T05:03:43.315Z`; release checkedAt remains `2026-10-29T03:52:05.964Z`. The new read-only checks do not silently renew those release-bound dates.

The audit covers the eight new questions, the two wording corrections, all 32 affected prior answer records and both retired answers. Commercial outcomes retain owner-reported classification. MMCATS Rails modernization does not prove historical migration, complete parity/security or deployment readiness, and is distinct from legacy PHP education work. PACE remains a public independent RAG demonstration without an enterprise-production claim. Deployed portfolio/NAAE features remain distinct from the local studio prototype. Incident Zero and fictional Lab scenarios remain outside actual employer experience. No factual correction was found requiring altered knowledge or new owner approval.

Fresh read-only HTTP requests to all nine pinned raw public files return 200 and match the recorded UTF-8 SHA-256 bytes. A separate audit of all 33 distinct approved canonical HTTPS URLs observes 32 returning 200 and the new `/evidence/portfolio-knowledge-inventory.v1.json` returning 404 on the current production portfolio. That generated inventory is present and approved in the local artifact; its pending publication is a deployment dependency, not a factual correction. Portfolio-first deployment must make it available before the new standalone PACE corpus. HTTP availability does not independently verify fragment targets or every claim on a moving page. Results are in `output/pme-v171/canonical-evidence-links.json`. These observations prove availability of the pinned evidence, not reproduction of repository-reported tests or a check of every moving repository HEAD. Publication/source/citation checks still enforce exact identity, version, URL, hash, review status/deadline and scope. Retired answers cannot become active. The claim audit is `output/playwright/pme-v171/claim-integrity-audit.json`; remote results are portfolio `output/pme-v171/public-source-verification.json`.

## Timestamp, localization and WebKit correction

Per-case semantic revision records remain byte-identical, independent and Git-history-derived; they are not editorial-review certification. Existing tests cover isolated changes, missing-ledger failure, stable unrelated records and source precision. The artifact build date is generated once for prerender/client and is never called deployment. Knowledge history is unchanged across repeated successful builds; a source check cannot renew indexedAt, unknown historical dates remain null, and failed load/index paths cannot fabricate successful freshness.

Cross-browser QA exposed a **pre-existing** Arabic hydration failure in both the preserved baseline and initial candidate: WebKit formats Hijri dates with an extra literal comma relative to Node. `calendarLabelText` now removes that comma only from Arabic Intl literal parts. Day/month/year/era fields, Umm al-Qura selection, precision, machine-translation policy, Gregorian references, direction, native text and date values remain intact. No `suppressHydrationWarning`, client-only replacement or calendar fallback was introduced. Two new tests verify literal-only normalization and preservation of date fields. Final WebKit/Chromium Arabic interaction checks report zero hydration/browser errors.

The final 33-layout freshness matrix covers all 11 locales at 320/375/1440, Gregorian and cultural settings, 150% text at 320, RTL and horizontal date metadata in CJK editorial views. Four host/Lab contexts run all eight new exact questions and validate loaded-manifest dates. Catalogs remain 11 × 1,584 complete units, zero missing/stale, zero validation errors and 97 existing editorial warnings. No visitor-facing phrase was added. Fluent native review and screen-reader speech remain unperformed.

## Routing and cross-application compatibility

Canonical configuration and final Lab metadata use **`https://pace-rag.paramasvara.online/pace-rag/`**. Vite base, static packaging, portfolio external links and source libraries agree; the portfolio case-study route remains its separate `/pace-rag-case-study/` page. No portfolio prose/source URL needed a factual correction.

Fresh public curl GET checks observe `/pace-rag/` 200, root HTML forwarding to `/pace-rag/`, `/page-rag/` **404**, and hosted professional pointer **`b555f3ee70c516ab`**. Thus the new approved corpus has not been claimed as deployed. A different HTTP client returned 403; those failures are retained separately rather than treated as successful checks. Portfolio `/en/` returns 200. Dashboard configuration and live deployment IDs were not accessed.

The packager now emits `/page-rag → /pace-rag/` and `/page-rag/* → /pace-rag/:splat` 301 rules, and the local exact-file server exercises them with query preservation. Local canonical/deep-library paths return 200, unknown paths 404, and aliases redirect once without loops. **The new redirect is prepared locally, not active remotely.** Post-deployment checks must verify Cloudflare behavior and clean canonicalized deep links.

Eighteen release scenarios pass across Chromium 156 and WebKit 26: current approved exact/lexical/offline paths; corrupted core data; missing, stale and incompatible manifests; interrupted deferred vectors; new portfolio UI with original English knowledge; previous v1.7 portfolio UI with current assets; and localized keyboard/close/RTL behavior. Firefox executable `firefox-1495` is absent and was not certified. Existing Chromium Lab browser checks also pass, including genuine local semantic retrieval and offline reuse. There are zero new suite inference requests/errors after the date fix. Missing/corrupt core assets expose no answer or false freshness; unavailable vectors preserve valid lexical sources.

## Validation and known blockers

Final validation uses Node **22.12.0**; initial local baseline tooling used Node 23.11.0. Model/embedding bytes and Chrome are pinned/recorded. Both production builds and typechecks pass. Portfolio tests: **231 passed**; PACE-RAG: **124 passed**; no failures or skips. PACE lint, content, publication, ranking-review, index, integration package, public inventory (73 assets), i18n and static link/artifact checks pass. The main-script budget passes unchanged. No typography fonts, NAAE implementation, renderer, artwork pack or geometry was modified.

Full portfolio lint remains **FAIL**: five no-explicit-any errors at `.opencode/plugins/entire.ts:18,199,244,254,402`. That file identifies itself as generated by `entire enable --agent opencode` and warns against manual edits. It is a third-party-managed local tool integration, not application source. Per the task's generated-code rule, it was preserved rather than patched or hidden. An upstream maintained generator/plugin fix is required for a clean full gate. No lint rule/exclusion or evaluation threshold was relaxed.

The existing dependency tree emits an engine warning for eslint-visitor-keys 5.0.1 (requires Node 22.13+ within Node 22); production's configured `22` patch version must be verified before a clean install. Native Git build/dashboard settings, Firefox, physical-device memory, slow-network semantic success, independent holdout and fluent editorial review remain explicitly unverified or limited. Full lint and retrieval recovery prevent an unconditional release claim.

## Reproduction and deployment runbook

```sh
# PACE-RAG: local checks and approved release, no activation needed.
npm test
npm run typecheck
npm run lint
npm run knowledge:check
npm run build:release
npm run index:verify
npm run eval:knowledge-sync
npm run eval:knowledge-sync -- --semantic
npm run release:check
npm run package:portfolio
npm pack --workspace @pace-rag/portfolio-assistant --pack-destination ../mohdvara.github.io/vendor
npm run package:static -- --release
npm run release:artifact-check
npm run check:portfolio-budget

# Portfolio: install its existing pinned local archive, then validate/build.
npm install --offline --ignore-scripts
npm run typecheck
npm test
npm run lint  # known generated integration blocker; do not hide it
npm run build
npm run i18n:validate
npm run i18n:coverage -- --strict
npm run knowledge:check
npm run assets:check
```

Use the two repositories for their respective command blocks. Profiling/QA commands are `node scripts/hardening-profile.mjs`, `hardening-semantic-profile.mjs`, `hardening-close-profile.mjs`, `hardening-retrieval-audit.mjs`, `hardening-browser-qa.mjs` in PACE, with `QA_STAGE`, `QA_URL` and `QA_PORTFOLIO_URL` selecting preserved/final loopback hosts. `hardening-summary.mjs` produces the comparison. Portfolio freshness uses `QA_URL`, `QA_LAB_URL`, `QA_OUTPUT` with `scripts/knowledge-browser-qa.mjs`. Baseline-dependent audits require the preserved directory (`QA_BASELINE_ROOT` for the integrity audit). Logs record actual executed commands and tool versions; a clean checkout must prepare its existing model/runtime assets as the deployment build already does.

1. Resolve the generated-plugin full-lint blocker upstream; review the disclosed ranking and semantic/mobile trade-offs. Confirm the intended Node 22 patch meets dependency engines, and rerun affected gates. Do not treat this conditional report as a waived lint gate or a new content/ranker approval.
2. Review all dirty task and earlier owner hunks. Explicit authorization is required before commits, pushes and deployment. Both native Git integrations may deploy on an authorized `main` push, so a push is a release action; no such action has occurred.
3. Verify actual Cloudflare projects/settings against `docs/HOSTING.md`: PACE Git-connected project `pace-rag-git`, repository root, production `main`, `npm run build:cloudflare`, output `output/static-site`, custom hostname and Node version. Verify portfolio settings independently. Capture **current production deployment IDs and complete rollback artifacts** before publishing; local v1.7 rollback archives are not a capture of today's older hosted production release.
4. Freeze matching artifacts and hashes below. The integration archive is `vendor/pace-rag-portfolio-assistant-1.6.2-hardening.1.tgz`, installed by the portfolio lockfile. Schema/embedding/packet/corpus identities must match the verification ledger. A rebuild should be checked against the recorded knowledge asset hashes before upload. Never mix individual pointers, documents, answers or vectors from different versions.
5. After explicit authorization, deploy the **complete portfolio artifact first**, verify its canonical inventory evidence JSON returns 200 with the expected contents, then deploy the complete PACE static artifact. The new standalone corpus cites that portfolio evidence URL, which is currently 404. The portfolio carries its own pinned knowledge assets and can temporarily link to the older compatible Lab; source-first ordering avoids publishing standalone answers whose new canonical inventory is still unavailable. The Lab redirect becomes active with its later deployment. Use the intended native Git build or an explicitly authorized complete static artifact procedure; do not publish the private integration package to a registry.
6. Post-deployment, verify root/canonical/legacy paths, redirect query/deep-link behavior, real 404s, canonical metadata and locale routes. Fetch both professional pointers and manifests; confirm b0e1b371c34d449b, packet identity and actual indexedAt. Exercise all eight new exact questions, citations, a conservative semantic query, lexical fallback, offline current-session behavior, Gregorian/Arabic/CJK views and keyboard close/focus. Confirm no paid inference. Check actual compression/cache headers and versioned worker assets; local computed compression is not proof of host behavior.
7. If either application fails, **roll back the PACE complete artifact first, then the portfolio**, using the captured previous production deployment pair to restore the previous live state. This stops the standalone corpus requiring the new portfolio inventory before that file is removed. For local v1.7.1→v1.7 regression rollback, the complete local archives below preserve the approved b0 corpus; they do not restore the older hosted b555 deployment. Restore matching source hunks only if needed, preserving earlier owner work. Keep approval archives/index history as audit evidence. Never rollback isolated corpus files or fabricate a new indexing/review date.

The following local artifacts are prepared and hashed. Extract complete roots into empty staging directories before any authorized deployment; the `.tgz` files are transport/audit archives, not remote publications. The PACE local rollback root reconstructs the pre-hardening Lab plus its unchanged root/404/header wrapper and omits the new legacy redirect.

| Artifact under `output/pme-v171/releases/` | Bytes | SHA-256 |
|---|---:|---|
| portfolio-v171-local.tgz | 34,334,642 | `52a8a36181c5bdd31b30c2eb337ef38fce4a29fdd7f45ff4f98340d9191cd023` |
| pace-rag-v171-local.tgz | 52,767,898 | `97df14f36e16f7ddc43d05398f9c61b5ffd7dccb42dcf82d2139ca948bf77d86` |
| portfolio-v17-local-rollback.tgz | 34,335,130 | `82b51325ffe2bf16e0fddd4112599f702b75cfaa7b886773f2df6d741ca68aca` |
| pace-rag-v17-local-rollback.tgz | 52,767,506 | `1017fdfc430127592730160318395851404c8464a59c85f68a7f7c59e70bb413` |

## Files and final disposition

These are v1.7.1 changes relative to the preserved dirty v1.7 starting state, grouped by repository; earlier owner/v1.7 changes are excluded from this list. Generated public-GitHub source timestamps were restored to their starting bytes after the final build. The Git ignore additions cover local hardening evidence/archives and generated build metadata only; they do not change ESLint exclusions. Screenshot binaries and local archives remain ignored. Exact file/artifact hashes and command outcomes are in `verification/pme-knowledge-1.7.1.json`.

**mohdvara.github.io**

- `.gitignore`
- `docs/portfolio/PME-V1.7.1-RELEASE-HARDENING-RESULTS.md`
- `package-lock.json`
- `package.json`
- `scripts/knowledge-browser-qa.mjs`
- `src/i18n/formatting.ts`
- `tests/calendar-hydration.test.mjs`
- `vendor/pace-rag-portfolio-assistant-1.6.2-hardening.1.tgz`
- `verification/pme-knowledge-1.7.1.json`

**pace-rag**

- `apps/rag-lab/index.html`
- `evaluation/independent-holdout/README.md`
- `evaluation/reports/knowledge-sync-lexical-paired.json`
- `evaluation/reports/knowledge-sync-semantic-paired.json`
- `package-lock.json`
- `packages/portfolio-assistant/package.json`
- `packages/portfolio-assistant/src/Assistant.tsx`
- `packages/semantic-core/src/load.ts`
- `packages/semantic-core/src/scope.mjs`
- `scripts/evaluate-independent-holdout.mjs`
- `scripts/hardening-browser-qa.mjs`
- `scripts/hardening-close-profile.mjs`
- `scripts/hardening-hydration-audit.mjs`
- `scripts/hardening-integrity-audit.mjs`
- `scripts/hardening-profile.mjs`
- `scripts/hardening-retrieval-audit.mjs`
- `scripts/hardening-semantic-profile.mjs`
- `scripts/hardening-summary.mjs`
- `scripts/package-static.mjs`
- `scripts/serve-static.mjs`
- `tests/deferred-loading.test.mjs`

**Final status: CONDITIONALLY READY.** Local hardening and integrity/compatibility validation are complete. Owner release review must address the failing full lint gate, unmet suggestion-ranking recovery targets and measured semantic/mobile trade-offs before claiming production readiness. Independent/native/device review and unavailable Firefox remain limitations. No approval-bound knowledge was changed or activated, and nothing was committed, pushed or deployed.
