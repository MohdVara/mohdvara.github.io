# Incident Zero — System Defence / Stage 2

Optional local arcade route: `/incident-zero/defence/`. Five deterministic, compact 900×540 floors, each with 4–6 physical chambers and parallel crossings. Clear threats, restore the terminal, review results, then explicitly Continue. No combat runs behind intermission. The original portfolio/story, engine and dependencies remain.

| Level | Flood | Probe | Total |
|---|---:|---:|---:|
| 1 | 4 | 2 | 6 |
| 2 | 5 | 3 | 8 |
| 3 | 6 | 3 | 9 |
| 4 | 6 | 4 | 10 |
| 5 | 8 | 4 | 12 |

Enemy speed/health/projectile speed are unchanged. Nearby Flood pairs invite Fan; probes occupy separated positions with open sightlines and cover. Entry is at least 150px from every enemy, with two seconds of activation grace. Integrity starts at three, hit protection lasts 0.75 seconds. Clearing a level grants a fixed +1 repair on the next entry, capped at three.

- **Pulse:** one accurate damage-1 packet, 0.24s cadence, 500px range. Reliable across medium lanes; slower to clear nearby groups.
- **Fan:** five damage-2 packets, ±0.32 radians, 0.7s cadence, 190px range. Strong close group damage; spread wastes packets at distance and cannot reach distant probes. Both tools damage both enemy types; shared cooldown prevents switching exploits. Assisted targeting uses each weapon’s range and wall visibility.
- **Scoring:** Flood 100; Probe 150; restoration 500; undamaged level 250; five-level run 1,000. Maximum 10,050 with fixed budgets. Best counts completed runs only and is personal, unverified browser-session data; results show seed.

## Boundaries and checkpoints

`floor.ts` retains the exact authored Stage 1 arena. `generation.ts` has separate seeded layout/encounter/decorative streams, generator version 1, four bounded construction attempts and a validated four-room fallback derived from the authored geometry. It adds one wide-gapped divider; `authoredFloor` itself remains unchanged as the development benchmark. `navigation.ts` caches radius-aware walkability and adjacency with reusable BFS buffers. Combat budgets one replan per displayed frame, staggers requests, reuses path points and only recalculates changed/exhausted routes. Allocation-free slab visibility avoids rebuilding arrays for every ray.

`simulation.ts` remains pure mutable combat outside React, with bounded 120Hz substeps and 100ms maximum catch-up. `renderer.ts` rebuilds static floor graphics only on floor changes and bridges changed HUD values. Shared `PortfolioGame.ts` retains owned Phaser visibility/listener cleanup. `input.ts` retains focus-scoped controls, held-input clearing and latched terminal interaction. Touch movement/fire uses separate pointer capture, SVG arrows and scoped selection/callout prevention. Reduced motion suppresses expanding particles; no audio.

`run.ts` extends the existing narrow save/load port and reuses HTTP-safe `createAttemptId` from `session.ts`. Schema 2 uses key `incident-zero-defence-v2`; old Stage 1 data remains separate. Save entry integrity/tool, seed, generator version, IDs, current level, committed levels/score, status, last result and completed best/count. Writes occur at transitions and tool selection, never each simulation frame. Active refresh regenerates the current level at entry **paused**, rolling back that floor’s kills, damage, projectiles and provisional score together. Committed floors survive. Intermission/final refresh reads committed results without re-awarding. Continue persists the next checkpoint before loading combat. Invalid/unsupported data resets safely; blocked storage permits in-memory play. Future public scores would require server validation.

## Local verification

```sh
SWC_NATIVE_BINDING_CACHE=/private/tmp/portfolio-swc-cache npm run build
npm run typecheck
npm run lint
npm test
QA_MODULES_DIR=/private/tmp/portfolio-qa node scripts/defence-qa.mjs
QA_MODULES_DIR=/private/tmp/portfolio-qa node scripts/defence-playtest.mjs
QA_MODULES_DIR=/private/tmp/portfolio-qa QA_URL=http://localhost:4173 node scripts/defence-production-qa.mjs
```

QA reuses an existing external Playwright installation. `.qa/defence-stage2/` contains local ignored evidence. The isolated production profiler defaults to the exact authored arena:

```sh
node scripts/defence-profile-build.mjs after
python3 -m http.server 4189 --bind 127.0.0.1 --directory .qa/defence-stage2/after/build
QA_URL=http://127.0.0.1:4189 node scripts/defence-profile.mjs after
QA_URL='http://127.0.0.1:4189/?maximum' PROFILE_SCENARIOS=combined node scripts/defence-profile.mjs maximum
```

In development only, reproduce an owner-reported spike with `window.incidentZeroDiagnostics.start()`, then `stop()` and `capture()`. Capture records up to 7,200 frame intervals, simulation/render costs, navigation-search counts, enemy/projectile counts and supported long tasks. Loading is excluded; the first interval after pause includes that pause and is identified by status transitions. Read-only inspection supports local QA. The facility is absent in production.

See `docs/review/incident-zero-defence-stage2.md` for actual evidence and limitations. The 5–8 minute duration is a human-playtest target. Automated validity and scripted completions are not evidence of fun, physical iPhone performance or a passed five-player gate.
