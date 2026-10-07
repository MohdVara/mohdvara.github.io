# Incident Zero — System Defence: Stage 2 review

Local route: **http://localhost:5173/incident-zero/defence/**. Stage 2 is implemented locally; no deployment, push, merge or external-service change was made. Unrelated working-tree edits were preserved. React 18, TypeScript, Vite 8.3 and Phaser 3.90 remain; no dependency upgrade or replacement engine.

## What changed

Five seeded 900×540 floors, each with 4–6 chambers, parallel crossings, clear entry and a reachable lower-right terminal/transition. Generator version 1 separates layout, encounter and decorative random streams. It tries four candidates at most, with bounded spawn placement; rejected layouts use a known-good four-room fallback derived from Stage 1. The exact original three-bay authored arena remains exported as `authoredFloor` and is the profiling benchmark. The fallback adds one wide-gapped middle-bay divider rather than pretending three physical bays are four rooms.

Budgets are **4 Flood / 2 Probe**, **5 / 3**, **6 / 3**, **6 / 4**, **8 / 4**: 6→8→9→10→12 total enemies. Speeds, health and hostile projectile speed remain unchanged. Flood pairs are normally placed 45px apart; probes use separated positions with at least two open cardinal sightlines. Entry distance is at least 150px (five 30px tiles), plus two seconds of activation grace. Normal modular door gaps are 120px; radius-aware navigation verifies the physical clearance of grid edges. No actor or objective overlaps walls. Alternate routes are also checked by closing either parallel crossing on representative floors.

**Pulse:** damage 1, 0.24s cadence, range 500px, accurate. **Fan:** five damage-2 packets, spread ±0.32 radians, 0.7s cadence, range 190px. A controlled close-group test shows Fan deals more damage; a medium-range precision calculation shows Pulse has better sustained damage when Fan’s outer packets miss. These are tactical checks, not proof of enjoyment. Both tools damage both types, share a cooldown and retain assisted aim, which now respects the selected tool’s range and wall visibility.

Clear threats → explicitly restore terminal → review → explicitly Continue. Combat sleeps behind intermission. Three integrity and 0.75s hit protection remain. The next level receives a deterministic +1 repair, capped at three. Result actions are placed near the top so Continue/retry remain visible before scrolling on phone, landscape, tablet and desktop. Defeat ends the run; same-seed and new-seed retries reset progress while preserving completed personal best/count.

Flood 100, Probe 150, restoration 500, undamaged level 250, completed five-level run 1,000. Maximum completed score is 10,050 with the fixed budgets. Results show per-level totals, current-level components, run bonus, seed, level reached and personal **unverified browser-session** best. Incomplete scores never replace completed best.

## Checkpoints and lifecycle

Schema 2 uses `incident-zero-defence-v2`; unsupported/old/corrupt saves reset gracefully. The Stage 1 key remains separate. `run.ts` reuses the existing save/load port pattern and HTTP-safe attempt ID generator. It saves run/attempt IDs, seed/generator version, level, entry integrity/tool, committed level results/score, status, last result and best/count. No live projectile serialization or per-frame storage writes.

Active refresh regenerates the same floor **paused at entry**, rolling that floor’s damage, kills and provisional score back together. Completed floors remain committed. Intermission/final reload reads committed results without awards. Continue persists the next checkpoint before loading gameplay. Guards on status, attempt ID and level make terminal/level/run awards idempotent. Blocked sessionStorage still permits in-memory play; browser refresh cannot retain unavailable storage. Future public scores would require server validation.

Shared `PortfolioGame.ts` remains unchanged in Stage 2. Input capture/cancellation, focus-loss pause and explicit resume, native touch-selection prevention, reduced motion and no audio remain. Static floor graphics are rebuilt only on floor change; actor simulation stays outside React. HUD updates are changed-value emissions. Storage writes occur at transitions and tool selection, not ticks.

## Stutter investigation

The exact owner-reported intermittent physical-device stall was **not confirmed or ruled out**. An independently demonstrated desktop navigation bottleneck was fixed. Baseline code rebuilt radius-aware grid data, queue/maps and point objects for each search; nearby enemies could search together. Line-of-sight also allocated slab arrays repeatedly. A baseline combined sample contained a 92.8ms frame with 69.8ms simulation and a 68.9ms path search. Other spikes had small measured game costs, so navigation does not explain every stall.

Fixes: cached static walkability/adjacency in a floor-keyed WeakMap; reusable BFS buffers; one replan per displayed frame; staggered requests and changed/exhausted-route checks; path cursors instead of shifting points; allocation-free collision movement/slab visibility; nearest assisted target scanned without filter/sort. Collision, wall visibility and bounded 120Hz catch-up remain. Tests confirm enemies traverse cover, paths have physically clear segments, wall-adjacent targets work and navigation work is bounded. No teleporting, obstacle bypass, reduced enemy count or health/speed reduction.

### Measurement conditions

Production Vite profiling harnesses built from preserved Stage 1 and Stage 2 copies, Phaser Canvas, **headless Chrome 153 / macOS / eight logical processors**, 1280×800 page with 900×540 arena. Same authored geometry, initial eight actors, Pulse, deterministic movement/firing workload; all actors kept alive and active with protective player bookkeeping to sustain a full-load sample. The harness resets actor HP to 1,000 to avoid early deaths; this also inflates health-bar overdraw compared with normal play, equally in both matched phases. These controlled stress states are separate from the ordinary-controls completion tests and are not a normal-play raster benchmark or human play. Enemy trajectories naturally differ after navigation changes.

Idle, pursuit and firing each have one 60-second sample; navigation and combined each have **three 60-second samples before and after**. Initial 1.2s warm-up/loading was excluded explicitly. Navigation sample 1 in both phases includes extra trace-flush time before the capture was stopped (approximately 63s baseline / 62s after rather than exactly 60s); it is retained and labelled here. Other samples are approximately 60s. Intervals are Phaser update start-to-start; simulation timing includes the small workload hook. “Render” measures Graphics command preparation, **not full Canvas rasterization/compositing**. Long tasks use the supported browser observer. Spikes retain enemy/projectile counts and paired simulation/render costs in the JSON.

This was a shared working Mac; some samples overlapped local builds or other browser QA. This limits causal attribution of isolated worst frames. Poor samples were retained. A separate maximum-load rerun without concurrent agent browser QA is recorded below. React commits were not directly profiled; source inspection verifies the changed-value HUD bridge and absence of per-tick storage writes.

All costs below are milliseconds. Long-task counts exclude the initial warm-up in steady samples.

| Phase | Scenario | Sample | Median | p95 | p99 | Max | >33.3 | >50 | >100 | Sim p99 | Sim max | Nav p99 | Nav max | Render p99 | Long tasks |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| baseline | idle | 1 | 16.7 | 17.6 | 18.1 | 28.6 | 0 | 0 | 0 | 0.1 | 0.8 | 0 | 0 | 0.4 | 0 |
| baseline | pursuit | 1 | 16.7 | 17.6 | 19.1 | 58.7 | 4 | 1 | 0 | 4.7 | 15.4 | 2.8 | 11.2 | 0.5 | 1 |
| baseline | navigation | 1 | 16.7 | 17.5 | 18 | 45.9 | 1 | 0 | 0 | 2.7 | 7 | 2.1 | 3 | 0.5 | 0 |
| baseline | navigation | 2 | 16.7 | 17.4 | 17.8 | 24 | 0 | 0 | 0 | 2.9 | 6.6 | 2 | 4.2 | 0.4 | 0 |
| baseline | navigation | 3 | 16.7 | 17.6 | 18.1 | 30.6 | 0 | 0 | 0 | 3.6 | 6.6 | 2.3 | 3.9 | 0.4 | 0 |
| baseline | firing | 1 | 16.7 | 17.6 | 18 | 59.2 | 3 | 1 | 0 | 4.4 | 17.4 | 5.9 | 6.5 | 0.4 | 0 |
| baseline | combined | 1 | 16.7 | 17.5 | 17.9 | 92.8 | 4 | 1 | 0 | 13.2 | 69.8 | 8.8 | 68.9 | 0.4 | 1 |
| baseline | combined | 2 | 16.7 | 17.5 | 18.1 | 77.9 | 1 | 1 | 0 | 13.3 | 27.1 | 7.7 | 10.1 | 0.4 | 0 |
| baseline | combined | 3 | 16.7 | 17.6 | 18 | 27.9 | 0 | 0 | 0 | 11.6 | 27.4 | 7.2 | 8.3 | 0.4 | 0 |
| after | idle | 1 | 16.7 | 17.5 | 17.7 | 23.5 | 0 | 0 | 0 | 0.1 | 0.6 | 0 | 0 | 0.3 | 0 |
| after | pursuit | 1 | 16.7 | 17.4 | 17.7 | 23.6 | 0 | 0 | 0 | 0.2 | 0.5 | 0.1 | 0.2 | 0.2 | 0 |
| after | navigation | 1 | 16.7 | 17.5 | 17.7 | 24.8 | 0 | 0 | 0 | 0.2 | 1.1 | 0.2 | 0.6 | 0.3 | 0 |
| after | navigation | 2 | 16.7 | 17.5 | 17.8 | 47.1 | 2 | 0 | 0 | 0.3 | 2.5 | 0.2 | 0.8 | 0.3 | 0 |
| after | navigation | 3 | 16.7 | 17.5 | 17.8 | 29.5 | 0 | 0 | 0 | 0.3 | 7.6 | 0.2 | 1 | 0.3 | 0 |
| after | firing | 1 | 16.7 | 17.5 | 17.7 | 20.8 | 0 | 0 | 0 | 0.7 | 1.9 | 0 | 0 | 0.3 | 0 |
| after | combined | 1 | 16.7 | 17.5 | 17.7 | 20.4 | 0 | 0 | 0 | 1 | 2 | 0.6 | 0.9 | 0.2 | 0 |
| after | combined | 2 | 16.7 | 17.5 | 17.7 | 23.9 | 0 | 0 | 0 | 1.2 | 2.7 | 0.9 | 1.6 | 0.3 | 0 |
| after | combined | 3 | 16.7 | 17.5 | 17.7 | 26 | 0 | 0 | 0 | 1.1 | 2.6 | 0.9 | 1.5 | 0.3 | 0 |
| maximum | combined | 1 | 16.7 | 17.6 | 17.9 | 54 | 1 | 1 | 0 | 1.8 | 3.2 | 1.2 | 2 | 0.3 | 0 |
| maximum | combined | 2 | 16.7 | 17.7 | 18.5 | 73.7 | 1 | 1 | 0 | 2.4 | 7.1 | 1.4 | 5.4 | 0.4 | 0 |
| maximum | combined | 3 | 16.7 | 17.5 | 17.9 | 28.2 | 0 | 0 | 0 | 2 | 5.5 | 1.4 | 4.8 | 0.3 | 0 |
| maximum-isolated | combined | 1 | 16.7 | 17.5 | 17.9 | 26.5 | 0 | 0 | 0 | 2.1 | 5.6 | 1.4 | 2 | 0.3 | 0 |
| maximum-isolated | combined | 2 | 16.7 | 17.5 | 18 | 31.9 | 0 | 0 | 0 | 2.2 | 7.1 | 1.5 | 1.9 | 0.3 | 0 |
| maximum-isolated | combined | 3 | 16.7 | 17.6 | 18.5 | 52.7 | 4 | 1 | 0 | 2.2 | 12 | 1.4 | 2.9 | 0.3 | 0 |

Combined-workload simulation p99 dropped from **11.6–13.3ms to 1.0–1.2ms**; path-search p99 from **7.2–8.8ms to 0.6–0.9ms**. Before combined samples had 5 frames above 33.3ms and 2 above 50ms total; after combined samples had none, with worst frames 20.4 / 23.9 / 26.0ms. Navigation after sample 2 still had 47.1 and 41.1ms frames; one measured 15ms Graphics preparation. Maximum-load samples had 54 and 73.7ms frames with twelve live enemies, despite paired update costs of only 0.4/0.1ms and 1.3/0.4ms simulation/render respectively. These remain unresolved scheduling/render/environment spikes; they are not silently attributed to the fixed search code.

The additional three 60-second maximum-load samples ran after other agent browser QA/builds finished. They recorded p99 **17.9 / 18.0 / 18.5ms**, maxima **26.5 / 31.9 / 52.7ms**, and **0 / 0 / 4** frames above 33.3ms. The final sample still contained a >50ms frame. The working Mac was not an otherwise idle lab machine. This confirms that removing concurrent QA did not eliminate every tail stall; the phone report remains unresolved. All original maximum-load samples remain in the table and JSON.

Navigation trace top-level MinorGC events: **284 / 130.2ms total / 2.89ms maximum before**, **53 / 63.4ms total / 4.63ms maximum after**. MajorGC: **6 / 28.2ms total / 15.86ms maximum before**, **none after**. Nested GC categories were not summed with their parent spans. This supports reduced allocation pressure in that one trace pair; individual GC pauses did not all shrink, and the trace alone does not establish the phone’s cause.

A separate three-by-1,000 identical-path microbenchmark recorded baseline medians 0.226–0.231ms, p99 0.726–0.851ms; cached after medians 0.0028–0.0032ms, p99 0.0031 / 0.0032 / 0.0843ms (first after sample includes JIT effects). This isolates navigation improvement but is not a frame-rate guarantee.

Short entry/restart profile: five fresh renderer entries per phase, two seconds each with midpoint restart; transition frames deliberately retained. Baseline first cycle reached **125.5ms**, including two >100ms frames; later cycle maxima were 18.0–19.2ms. After cycle maxima were **48.8 / 38.9 / 17.7 / 20.7 / 20.8ms**, with two >33.3ms frames total. These short transition samples are separate from steady combat. All five cycles in each phase returned zero retained canvases and zero owned window/document listeners. Final app lifecycle checks likewise passed five start/restart/pause/destroy cycles.

Development-only spike capture: `window.incidentZeroDiagnostics.start()`, reproduce, then `stop()` and `capture()`. Up to 7,200 samples include frame intervals, simulation/render costs, navigation-search counts, actors/projectiles and supported long tasks. Explicit status-transition timestamps distinguish pauses/resumes. A browser check confirmed capture and pause boundaries. It is absent from production globals and the production renderer bundle. Use it on the owner’s development setup if the intermittent stall recurs; phone/desktop screenshots of average fps would not settle it.

## Checks and actual gameplay evidence

- Build, typecheck, lint and **60 tests passed, zero failed**. Build used `SWC_NATIVE_BINDING_CACHE=/private/tmp/portfolio-swc-cache`; the existing lazy Phaser chunk warning remains (~1.20MB / 319KB gzip).
- **1,000 seeds × five levels = 5,000 floors**, same-seed reproducibility, radius-aware reachability/clearance, objectives, spawn validity, entry/terminal distance, spacing and exact budgets passed. There were **4,994 distinct layouts**, with **seven bounded fallbacks**. Fallback regression cases preserved in tests: `trial-133/2`, `trial-427/3`, `trial-457/3`, `trial-479/3`, `trial-699/1`, `trial-731/2`, `trial-836/2`. Forced validator rejection calls exactly four candidates before fallback; all five fallback budgets validate.
- Another 500 representative seed/level floors retained terminal access with either parallel crossing closed. Spawn-to-entry paths on 500 floors had clear initial and subsequent radius-13 segments. Entry grace and one-search-per-frame checks passed. This does not prove every encounter is enjoyable or equally difficult.
- Final browser matrix **390×844, 844×390, 768×1024, 1280×800**: fitted canvas/control bounds, no horizontal overflow, simultaneous movement/fire, cancellation, tool switching, pause freeze, focus-loss pause, checkpoint reset and selection/context-menu suppression passed. Four viewport screenshots were visually inspected. Final result actions were also checked before scrolling.
- A separate level-three recovery check supplied two committed floors as a clearly labelled persistence fixture, then used ordinary controls for real current-floor kills and damage. Before refresh: score 2800, integrity 1, 8 enemies alive. After refresh: paused, committed score 2650, entry integrity 2, entry tool Fan, nine live enemies and identical geometry; both earlier results remained unchanged. This directly checks rollback after real provisional changes.
- Real defeat was reached through ordinary keyboard movement and enemy damage; same-seed and new-seed retry passed. Fixture reloads separately test intermission/final idempotence and best preservation; fixture scores are not presented as gameplay completions.
- Ordinary keyboard/pointer five-level scripted completion: initial random seed finished at **10,050 / three integrity**, **92.7s** in an earlier iteration. Final encounter placement was then verified with `stage2-varied-b`: **9,300 points / one integrity**, **121.4s**, both weapons, four actual intermissions refreshed and final result refreshed without re-awarding. Level integrity was **2, 3, 2, 3, 1**, demonstrating repair and damage retention. Observation uses read-only development geometry/actor snapshots; combat state is never altered. These times include automation overhead and known geometry and are not human completion times or evidence of the 5–8 minute target.
- An exploratory scripted pass initially stalled at a cover corner because its 4px steering deadband ignored a needed 3px vertical correction. The script’s tolerance was reduced to 1.5px and the same seed completed without a combat-model workaround. A separate run interrupted by editing/hot reload was rerun after edits stopped. These were QA-driver limitations, not substituted victory states.
- Production LAN HTTP at `http://192.168.0.4:4173/`, iPhone-size **428×926** browser touch simulation: hydration/start, missing randomUUID, simultaneous touch, paused active recovery, intermission/final reload, new seed, old/corrupt/unavailable storage and lazy unrelated routes passed without page errors. **No physical iPhone Stage 2 testing was performed by the agent.**
- Existing story regression passed six viewports, spatial/pointer/touch mapping and cancellation, axe checks, all three ordinary endings, all three previews, focus/replay/refresh and paused teardown. Portfolio/story opening routes still avoid DefenceRoute/renderer/Phaser downloads. No story implementation changes were needed.

## Evidence and repeat commands

Local ignored artifacts under `.qa/defence-stage2/`:

- `baseline/performance.json`, `after/performance.json`, `maximum/performance.json`, `maximum-isolated/performance.json`; navigation traces and top-level GC summaries in baseline/after.
- `baseline/pristine/` retains pre-change simulation/renderer source for rebuilding that local benchmark. Profiling instruments copied sources only; normal game bundles have no profiling workload hooks.
- `baseline/restart-profile.json`, `after/restart-profile.json`, path microbenchmarks and `development-capture.json`.
- `browser-results.json`, `production-results.json`, `checkpoint-results.json`, `generation-results.json`, `story/results.json`.
- `play-390x844.png`, `play-844x390.png`, `play-768x1024.png`, `play-1280x800.png`; final result images for those sizes, actual defeat and `iphone-lan.png`.
- `playtest-results.json` and `varied-b/playtest-results.json`; generated floor screenshots and actual level reports within both directories.

Use the repository’s external Playwright convention (`QA_MODULES_DIR=/private/tmp/portfolio-qa`). The additional `defence-checkpoint-qa.mjs` checks real provisional changes against a committed checkpoint fixture. Current entry scripts `defence-qa.mjs`, `defence-playtest.mjs` and `defence-production-qa.mjs` exercise Stage 2. Detailed repeat commands and profiling setup are in `src/features/incident-zero/defence/README.md`. `scripts/defence-restart-profile.mjs` compares the two local benchmark servers at ports 4188/4189. No QA dependency was added to the project.

## Human playtest and next decision

Stage 1’s **one participant** reported approachable desktop/mobile play, little need for Fan and repetition; that history remains in the Stage 1 report. There are **no new Stage 2 human participant results**, no measured human run duration and no five-player gate claim. Agent visual inspection and two scripted full runs are narrower evidence. Physical Safari/touch long-press behaviour and the owner’s intermittent stall still need retesting. Phone silhouettes/telegraphs are small at the existing fitted arena size and need broader readability feedback.

Ask new players and the owner:

1. Is there now a clear reason to use each weapon?
2. Do generated encounters feel varied but fair?
3. Can you identify what caused each hit?
4. Does mobile assistance remain enjoyable?
5. What are first-run time, level reached, integrity lost, tool use and retry interest?
6. Does the owner still experience intermittent stutter? Capture a spike with environment and status boundaries if so.

**Recommend tuning before Stage 3 content.** The measured navigation bottleneck improved, but residual tail stalls, mobile readability, weapon choice and real duration/fairness still need evidence. The two scripted full runs were much shorter than the human design target. Keep the two tools/two types and bounded five-level run while testing those questions; do not add the future weapon/power-up inventory yet.
