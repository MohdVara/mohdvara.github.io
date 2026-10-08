# Reliability, conversion and evidence pass — 8 October 2026

## Fixed defects

- Reproduced empty roots by aborting IncidentZeroRoute and DefenceRoute chunks on a fresh production build. Added route error recovery with focused heading, explicit Retry and portfolio link. Retry performs a user-triggered reload, clearing the rejected lazy import/module state; both routes recovered after request interception was removed. No automatic reload loop.
- Unknown paths now render NotFound. Build emits root 404.html with noindex, no canonical and useful links. Local Cloudflare Pages emulator returned HTTP 404. Also fixed the hydration mismatch exposed by Vite preview's homepage fallback; real static 404 hydration and normal routes pass.
- Inline arcade prose links are underlined. Eight theme/viewport accessibility scans returned no violations. Axe's incomplete aria-prohibited-attr and color-contrast checks remain manual-review items, not proof of full conformance.
- Arcade descriptions now consistently describe five generated levels and two tools; retained indexing and added the canonical route to sitemap. Static metadata tests cover descriptions and missing-page policy.
- Experience résumé links now have separate spacing/wrapping/focus targets.

## Enhancements

- Hero provides one-action Work with me access while Explore my work remains primary. Engagement introduction offers booking and email without changing destinations.
- Campus, insurance and rental remain prominent. Meetings and HR are compact visible articles with native engineering-detail disclosures; all case IDs and no-JavaScript content remain accessible. No outer disclosure is needed to expose deep links.
- Removed duplicated flagship prose and public editorial audit caveats, retained supported personal ownership and constraints, and introduced no new measured outcomes. Updated content provenance. Private evidence checklist: `.qa/reliability/evidence-request.md`, excluded by existing .gitignore.
- Arcade removes internal Stage 2 and storage API terminology, retains accurate save behaviour, and removes unvalidated duration copy. A readable mobile legend now remains visible outside the canvas. No rendering, geometry, physics, input or enemy behaviour changed.

## Measurements

Production Chrome, 390 × 844 CSS px, reduced motion, font layout settled:

| Measure | Before | After |
|---|---:|---:|
| Homepage height | 13,979 px | 12,762 px |
| Homepage JS, Vite raw | 203.71 kB | 204.98 kB |
| Homepage JS, Vite gzip | 63.46 kB | 63.60 kB |
| Lazy engine raw | 1,197.77 kB | 1,197.77 kB |
| Lazy engine gzip | 319.07 kB | 319.07 kB |

Height reduced by 1,217 px / 8.7%; the client route is now directly available near the hero. This is an information-access improvement, not a measured conversion-rate gain. Existing 205,000-byte homepage guard remains unchanged and passes (actual 204,980 bytes). The existing lazy-engine size warning remains; the engine is not eagerly requested by homepage or decision preview.

Canvas remains about 364 × 218 CSS px at 390, 294 × 176 at 320, and 404 × 242 at 430. Visual review found shapes distinguishable but in-canvas labels small; external legend supplies readable guidance. No camera or collision enlargement was made.

No new game frame-performance comparison was performed because no renderer/simulation changes were made. Historical intermittent stutter is not claimed resolved. The existing motion suite measured lab CLS 0–0.001824 across six widths; this is a scripted local observation, not field Core Web Vitals.

## Validation

- Fresh lint → build → tests: 61/61 passed. `git diff --check` passed.
- Seven-width homepage browser suite: no overflow, Axe violations, console errors or failed resources; keyboard, navigation, exclusive disclosures, copy email and no-JavaScript checks passed. This ran before the final additional prose trim; final engagement, fragment, recovery and motion checks cover the final build.
- Conversion suite: 14 width/theme combinations; recruiter, CTO and consulting journeys; touch destinations and no-JavaScript passed.
- Final Cloudflare-local reliability suite: both failed lazy imports recovered; no normal hydration errors; all four routes readable without JavaScript; eight arcade theme/viewport scans passed; mobile and short-landscape screenshots saved.
- Final fragment suite: 40 direct, refresh, cross-page and hash-navigation position assertions passed, normal and reduced motion. Scoped an existing ambiguous insurance-link selector to the engagement-problems section.
- Engagement suite: seven widths × two themes passed, including direct refresh and booking/email destinations, no-JavaScript and touch checks.
- Arcade control portion passed on static production at four viewports. The rest imports source-only fixtures, so the complete Stage 2 suite was run on Vite and passed; the dedicated production recovery suite separately passed. Stored final/intermission fixtures are persistence checks, not fresh full gameplay completion claims.
- Story suite: six viewports, pointer mapping, movement-stop and resize checks; three real scripted endings, three preview endings, report focus/replay and renderer teardown passed.
- Motion suite: six widths, normal/reduced motion, reverse/fast scrolling, visibility behaviour and layout checks passed.

Evidence: `.qa/reliability/results.json`, `.qa/reliability/*.png`, `.qa/engagement-results.json`, `.qa/incident-review/results.json`, `.qa/defence-stage2/production-results.json`, and existing suite outputs. These local artifacts are not deployed.

## Historical findings and limits

- Live homepage fetched during this pass already has both current résumé destinations. Earlier mismatch is no longer present.
- Current two-page résumé page rendered successfully. Download automation timed out; no current export was acquired or verified and no local PDF is shipped. The older damaged four-page export claim does not apply by inference.
- No physical iPhone/Android validation, field performance data, fresh human game-enjoyment study or measured conversion data. See the physical-device protocol in the release checklist.
- Manual review remains appropriate for Axe-inconclusive contrast, small canvas cues and owner-reported intermittent lag. No palette was weakened to satisfy transient flags.
- Build refreshed existing public GitHub verification timestamps, without adding repositories or accessing private data.
- No deployment, DNS changes, account changes, bookings or messages were performed.

Release instructions and artifact identity: `reliability-release-checklist.md`.
