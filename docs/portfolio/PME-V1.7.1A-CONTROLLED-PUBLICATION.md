# PME v1.7.1a — Controlled Publication Runbook

Prepared 30 October 2026 (Asia/Kuching). **AWAITING OWNER AUTHORIZATION.** This is a reviewed preparation plan. No files have been staged, no source commits created, and no remote/configuration/deployment/rollback mutation performed by this task. Approval phrases quoted here are instructions, not granted authority.

## Verified mechanism and current production

Authenticated GET-only Cloudflare project APIs confirm both existing projects use GitHub integration, production branch `main`, enabled automatic production deployment and previews for all branches. Use exactly **native Git-triggered Pages deployment** for each application. Do not also run Wrangler upload or the legacy GitHub Pages deploy script.

| Application | Project / connected repository | Build / output | Provider canonical production deployment and rollback target |
|---|---|---|---|
| Portfolio | `mohdvara-portfolio` / `MohdVara/mohdvara.github.io` | `npm run build` / `dist` | `c22ade84-3449-4bb2-8ff8-16d8792819f3` |
| PACE-RAG | `pace-rag-git` / `MohdVara/pace-rag` | `npm run build:cloudflare` / `output/static-site` | `a5ecd965-6fbe-4f0d-a5d7-73a121865702` |

These IDs come from each project's **canonical_deployment**, not deployment-list order. Source commits are portfolio `9090099dc0bbd032b6d218371c9239bdff438b98` and PACE `9d66c8cf9c65ab887ce8f83c8a5f2893694ffbb8`. Immutable URLs are `https://c22ade84.mohdvara-portfolio.pages.dev` and `https://a5ecd965.pace-rag-git.pages.dev`. Both targets are successful production deployments; their current custom domains, homepage hashes, entry assets and all seven knowledge assets match the captured immutable manifest/assets. Both currently serve **b555f3ee70c516ab**, not the new b0 release.

Provider evidence confirms active domain registrations for `mohd.paramasvara.online` and `pace-rag.paramasvara.online`. Latest successful provider build logs report Node **22.23.4** for both; no explicit NODE_VERSION environment override is configured. Environment variable names only were retained; values, account IDs, credentials and raw build logs were not recorded. Source pins remain Node 22.23.4 / npm 10.9.9. Verify the actual new build runtime again during publication.

The operator has an accepted **Super Administrator - All Privileges** membership and existing OAuth `pages:write` scope. This confirms configured rollback authority; no write operation was exercised and no rollback authorization has been granted. Provider-retained complete deployments are the rollback artifacts. Their retention/eligibility must be reconfirmed immediately before publication; no complete offline production-site export is claimed. Local v1.7.1 archives are a different, newer local pair.

Older successful production candidates also observed: portfolio `fa589b09-6484-4cbd-943c-c562937711dc`; PACE `24a7387c-aa91-48af-846a-6e87e59af53c`. They are not selected merely because they appear second in a list. The captured current canonical deployments are the intended return-to-prior-state targets for this release.

Both proposed GitHub workflows validate without deploying. Existing GitHub Pages is legacy, sourced from portfolio `gh-pages`; its metadata still names the portfolio custom domain. A main-only push does not update that branch, and no workflow invokes `gh-pages`. Do not run `npm run deploy`, push `gh-pages`, create a second upload or change DNS/CNAME/settings under this plan. Unexpected webhook/workflow changes invalidate this trigger assessment.

## Source and publication boundaries

The staging manifest classifies every dirty path, the inherited source base and recursive excluded trees using A–H categories. Required prior typography/calendar, English-policy, knowledge, hardening and progressive-search dependencies are included coherently. The owner-only whitespace change in `PORTFOLIO_CASE_STUDY_EXPANSION.md`, the untracked PACE specification, browser sessions, context exports, logs and superseded knowledge/hardening integration archives are excluded. Existing tracked historical baseline archives remain because evaluation uses them.

The integration is `1.6.2-closure.2`; its archive and lockfile hashes are in the paired manifest. Archive inspection found 70 intended package members and no private/session/environment files. Three historical verification ledgers contain unnecessary user-home QA paths. Reviewed normalized copies are proposed under ignored `output/playwright/pme-v171a-publication/publication-overlays/`. **Original ledgers are untouched.** Gate 1 review includes those exact metadata-only copies; no approval packet, source/citation hash, measurement, date or application input is changed. Do not silently rewrite historical evidence or activate knowledge again.

Existing unpublished ancestor commits contain Entire configuration/hooks, not session traces in main ancestry. Entire Git hooks are enabled locally. The proposed staging/commit and later push commands use per-invocation `git -c core.hooksPath=/dev/null ...` after independent required checks, preserving hook files/settings while preventing unapproved checkpoint/session publication or hook side effects. This isolation is part of the plan requiring owner approval. Never push `--all`, `--mirror`, tags or Entire session/checkpoint refs.

## Gate 1 — local source preparation

Required separate owner instruction: **`APPROVE PME V1.7.1A SOURCE PREPARATION`**.

Before that instruction, only review/check the manifest and ignored authorization snapshot. No staging or commits are authorized now. Review includes proposed path-normalization overlays and hook isolation. The default `stage-proposed.py --check` verifies original file hashes and overlay hashes without modifying Git; its staging mode must not be invoked until actual authorization.

After approval, reconfirm starting HEADs, empty indexes, source hashes and exclusions. Stage only explicit included paths; for the three normalized records, stage the reviewed blob using `git hash-object -w` / `git update-index --cacheinfo`, preserving original working files. Inspect `git diff --cached --stat` and the complete staged patch. Run the source/security/gate checks before committing. Do not use `git add .` or `git add -A`.

Prepare one coherent local portfolio source commit, then one coherent PACE source commit. Proposed subjects:

- `Release PME v1.7.1a portfolio prerequisites and progressive assistant`
- `Release PME v1.7.1a approved knowledge and progressive search`

These commits incorporate the actual dependent earlier work rather than artificial intermediate deployment states. Preserve unrelated owner deltas and all audit history. Record real full commit SHAs. No push is authorized by Gate 1.

## Dependency graph and final clean verification

The integration archive depends on immutable approved assets and integration source, not a Git commit/footer or PORTFOLIO_RELEASE_REF. Therefore there is no circular commit dependency: freeze/verify PACE package → portfolio pins exact bytes → actual portfolio commit → real companion SHA becomes available → PACE source commit/CI reference → clean builds/final freeze.

`PORTFOLIO_RELEASE_REF` is a GitHub repository variable, not a value to invent in source. Its authenticated read was unavailable; it is **NOT VERIFIED** for this release. After the actual portfolio SHA exists, prepare the exact `gh variable set PORTFOLIO_RELEASE_REF --repo MohdVara/pace-rag --body <REAL_PORTFOLIO_SHA>` operation. It is a remote configuration mutation and needs separate authorization covering that operation; Gate 1 does not permit it. Set/verify it before the PACE push, after the companion commit is remotely available. Do not weaken the workflow to a moving branch or old sparse checkout.

After authorized commits exist, clone only their reviewed main ancestry into isolated directories, check out exact SHAs with hook isolation and verify clean sources. Do not copy private environment files, browser caches or context. Use Node 22.23.4 / npm 10.9.9 and lockfile installs. The paired manifest supplies command lists for both applications. Fresh clones need checksum-pinned model/runtime/worker/index preparation before semantic tests; indexing unchanged approved input must retain `2026-10-29T05:03:43.315Z`. No activation or public-source refresh is required.

Run all tests, typechecks, app lint and PACE lint, index/approval/citation/evaluation/localization/artwork/public inventory gates and builds. Record generated/full portfolio lint as the same five upstream failures. Repack the integration **to ignored output**, compare its bytes to the pinned archive and stop on mismatch; never overwrite vendor/lockfile to conceal a difference. Run cross-application, deferred exact-download and progressive lifecycle smoke checks. Preserve the 215,000-byte main-script limit. Reuse established bounded QA; no new optimization cycle or production stress benchmark.

Generated build-time metadata or evaluation reports must be identified separately from source inputs in the isolated clone; preserve original committed source bytes and record generated outputs. Final artifact records must identify the actual source commits, lockfiles, archive, tree/archive hashes, file count, runtime, build time and approved corpus/packet/schema. Current pre-commit archives are historical review evidence and cannot substitute for this final freeze. A code/dependency/build-input change invalidates it.

## Gate 2 — preview, if separately approved

Required instruction: **`APPROVE PME V1.7.1A PREVIEW PUBLICATION`**, explicitly naming branches/repositories/projects. Preview creation is remote publication because all branches currently trigger previews. No preview is created now.

Preview can check provider build runtime and ordinary UI/asset behavior. Approved citations use absolute production evidence URLs; that inventory is still 404. Consequently a preview cannot certify the full evidence dependency before portfolio production publication. Do not rewrite approved citations or pretend a local fixture validates live production. Preview may be skipped by an explicit reviewed decision, relying on isolated-host tests plus mandatory live rollout gates; it is not silently treated as passed.

## Gate 3 — production publication

Required instruction: **`APPROVE PME V1.7.1A PRODUCTION PUBLICATION`** for the exact pair. Before requesting it, present real portfolio/PACE SHAs, final paired manifest/artifact hashes, fresh canonical production IDs and eligible rollback targets, configured operator permissions, native Git triggers, the exact proposed GitHub variable mutation, limitations and any configuration changes (none for Cloudflare are proposed). Owner acceptance must cover ranking trade-offs, cold optional semantics, generated lint and remaining independent/native/device gaps. Any changed identified artifact requires renewed approval.

Immediately before each push, read remote main SHA and require fast-forward ancestry. Use exact reviewed SHA refspecs, with approved hook isolation:

```sh
# Only after exact-SHA production approval; these are templates, not executed actions.
git -c core.hooksPath=/dev/null push origin <PORTFOLIO_SHA>:refs/heads/main
# Wait for actual Pages success and all portfolio live gates below.
# Perform separately authorized, exact companion-variable update and verify it.
git -c core.hooksPath=/dev/null push origin <PACE_SHA>:refs/heads/main
```

No force push, tag, package publication, Worker API deployment, second Wrangler upload or provider setting change is included. Monitor provider success; a successful Git push is insufficient.

### Mandatory portfolio gates, before PACE push

Record actual new canonical provider deployment, source SHA, immutable URL and deployment time from the provider. Verify custom-domain content, new footer source/build metadata, representative commercial/independent pages, all eleven locale routes/disclosures, Arabic cultural/Gregorian/RTL and CJK metadata. Open/close the English-only assistant, exercise approved/new exact and structured answers/citations, confirm no critical JS errors or unexpected paid inference, and ensure source/private routes do not expose private files.

Fetch the actual full response body for `https://mohd.paramasvara.online/evidence/portfolio-knowledge-inventory.v1.json`. Require HTTP200, JSON content type, expected schema and SHA-256 **`af67eb6536c397e7cb2842224173a7bd609e31e88dd793a544f9b7f7e150f6bb`**. An HTML fallback with 200 fails. This URL is currently 404. **Any failure stops PACE publication.**

Bounded smoke examples: GET English/Arabic/Japanese/case-study pages; GET current pointer, manifest and seven assets and compare full SHA-256; check inventory body/content type; one exact, one new exact, one structured, one conservative lexical/unknown query. Use existing Playwright tooling for keyboard/focus, cancellation, unavailable-model/retry and close/reopen. Block model download for failure-path smoke rather than repeatedly transferring large model/WASM assets. A single bounded real enhancement is sufficient where practical; timeout is not semantic success. Reconfirm knowledge indexing/source-check dates are unchanged.

### Mandatory PACE gates

Require new provider canonical deployment/source match. Verify `/pace-rag/`, a valid deep page and refresh, actual `/page-rag/` redirect and deep/query preservation, no loops, unknown-route behavior, canonical metadata and intended asset origins. A static host may canonicalize `/index.html` with 308; follow only bounded redirects and verify the intended body.

Fetch live corpus/manifest/assets and require b0e1b371c34d449b, packet9bde…f286, schema1, minilm-q8-wasm-v1, retained indexedAt/checkedAt and 35 documents/51 active answers/2 retired/70 rows/196 chunks. Verify mappings and inventory citations, English-only evidence, conservative unknown handling, exact/structured/lexical/mobile paths, cancellation, safe retry, cache reopen and no unexpected inference. Run bounded Chromium, WebKit and Firefox smoke at desktop/mobile sizes. Do not claim physical-device/native editorial certification.

## Gate 4 — rollback and failure decisions

Required separate instruction: **`APPROVE PME V1.7.1A PRODUCTION ROLLBACK`**, naming affected deployment(s). No emergency authority has been granted. Read-only permission discovery does not authorize use.

Before any publication change, no rollback is needed. If portfolio publication fails, stop before PACE and determine whether production changed. If portfolio succeeds but PACE fails, assess the observed old/new compatibility; do not automatically roll back a healthy compatible portfolio. Record the incident and ask for the applicable rollback/hold authorization. Never continue after a failed mandatory gate or try random code changes/deployments.

For restoration of the captured old pair: provider rollback **PACE first** to `a5ecd965-6fbe-4f0d-a5d7-73a121865702`, verify b555/old routes/asset identities, then portfolio to `c22ade84-3449-4bb2-8ff8-16d8792819f3`, verify its old source/footer/assets and assistant. Use provider-supported complete production deployment rollback after rechecking eligibility. Do not swap pointers/answers/vectors, remove audit history or use the local newer v1.7.1 archives as substitutes.

## Evidence and follow-up

Read-only observations, public-safe selected provider configuration and asset hashes are in `verification/pme-v171a-production-verification.json`, explicitly pending for the new release. Security, classification and pair manifests are adjacent. Raw local logs and exact record-family authorization hashes remain ignored. The public security record omits credential/account/environment values and private context contents.

Only actual successful deployments may populate new production deployment timestamps/results. After verification, update publication records and appropriate documentation in both repositories. Any later documentation commit/push needs its own applicable authorization because main pushes can redeploy. No editorial revision, knowledge review/indexing or source-check date is renewed by publication.
