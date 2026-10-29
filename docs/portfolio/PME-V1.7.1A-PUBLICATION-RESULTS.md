# PME v1.7.1a — Publication Preparation Results

30 October 2026 (Asia/Kuching). **AWAITING OWNER AUTHORIZATION for the final production-triggering release pair and companion-variable change.** Local source preparation and manifest remediation are complete. No push, preview, remote configuration change, registry publication, production deployment or rollback has occurred.

## Source preparation and remediation

Gate1's178 reviewed paths were committed as portfolio `3ccf3de7b5df5fdf377e96f59042672e78f7b953` and PACE `a86fe755a3cabfe3715e39d5d1e58d9cca81ff2b`. Metadata normalization was staged as approved blobs; original owner working files and excluded context/session/intermediate artifacts were preserved. The upstream font license retains its exact CRLF/trailing-space bytes and required checksum; whitespace checks elsewhere pass.

The ordinary clean repack initially differed because fresh index construction minted a new manifest artifact builtAt. That failure remains documented in `verification/pme-v171a-source-preparation.json`. It was resolved by local PACE commit **`b31157f319475c8736de9135e510b9cfc7f4d8c7`**, which pins the exact reviewed immutable manifest as a build input, checks its checksum/source identity and rejects any generated manifest difference. No packet, answers, vectors, citations, corpus identity or indexedAt changed. Application build/deployment times remain separate.

Five regression tests cover missing/edited pins, identity mismatch, generated citation/row/vector/packet/date changes, wall-clock independence and preview/Lab serialization. Fresh source export, without a prior index, passes **134 PACE tests** and cold/warm release builds. Together with233 clean portfolio tests,367 tests pass. The PACE workflow now explicitly installs companion tooling: synchronization tests import its TypeScript source projector. The initially missing companion-install prerequisite was corrected and all tests rerun.

## Reproduction and final freeze

The fresh rebuilt `1.6.2-closure.2` archive exactly matches the unchanged approved pin:

`5715304aa01f39a78fe542645dc2fb6790b9e98160358df762cd5173e75f8521`

The actual vendor archive and lockfiles were not overwritten. The earlier packaging experiment and quarantined mismatching outputs remain historical evidence; the ordinary remediated build now succeeds without substituting those files. Full/generated portfolio lint still has five unchanged Entire diagnostics; maintained application/PACE lint and typechecks pass. Prior clean browser evidence includes33 progressive cases across three engines plus33 multilingual freshness layouts/four assistant contexts. Clean main JS measured211,660 bytes under215,000; no production performance or native-device certification is claimed.

This documentation commit follows the application base commit. Final source refs, exact clean-build/archive hashes and authorization-time provider observations are recorded in the subsequent local paired-release sidecar to avoid circular commit identities. These preparation records do not claim that production serves the new code.

## Publication checkpoint

Both `main` branches automatically publish via existing Cloudflare Git integration. The controlled protocol requires review of the exact final refs/artifact pair, current canonical deployments/rollback targets and the required `PORTFOLIO_RELEASE_REF` change before execution. The request to publish to GitHub is being prepared against that production boundary; no alternate Wrangler/GitHub Pages deployment will be used.

Last observed production remains older b555f3ee70c516ab; the portfolio inventory dependency was404. Publish portfolio first and require HTTP200/JSON plus SHA-256 `af67eb6536c397e7cb2842224173a7bd609e31e88dd793a544f9b7f7e150f6bb`, then update/verify the separately authorized companion reference and publish PACE. Reconfirm canonical IDs, configured permissions and retained complete rollback targets before acting. No knowledge activation or source refresh is needed.

Ranking trade-offs, optional cold semantic timeouts, generated lint and independent/native/device review gaps remain disclosed for owner acceptance. Preview, production, remote variable mutation and rollback must follow their applicable explicit authorization scopes. No production success fields have been populated with local results.
