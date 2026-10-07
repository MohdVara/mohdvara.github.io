# Incident Zero — System Defence: Stage 1 review

Local playable route: **http://localhost:5173/incident-zero/defence/**. The Incident Zero opening has a restrained optional arcade entry; existing play and preview actions remain. No deployment, push, merge or external-service changes were made. Unrelated working-tree edits were preserved.

React 18 / TypeScript / Vite 8.3 / Phaser 3.90 were confirmed from the implementation and dependencies. Stage 1 uses the existing Phaser renderer technology with a pure, independently tested combat model. The story's visibility-handler cleanup was extracted unchanged into `PortfolioGame.ts` and reused to avoid Phaser's default document-listener leak. No second engine, added dependencies, procedural floors or future content placeholders.

## What is playable

One authored Edge Gateway with connected spaces, two wide crossing routes, cover, a protected entry and a visible lower-right terminal. Eight fixed enemies: four diamond Flood Packets pursue/contact; four triangular Injection Probes position, telegraph a fixed aim line for 0.85 seconds and fire wall-blocked packets. Navigation uses a small grid only when a clear direct route is unavailable.

Packet Pulse and Firewall Fan are available immediately, with distinct accuracy/spread, range and cooldown. Desktop movement/aim/fire/tool/terminal shortcuts; touch movement plus simultaneous assisted fire, tool switch and contextual terminal restoration. Three integrity, 0.75-second visible protection, immediate retry, pause/help, explicit resume after focus loss, victory/defeat, scoring breakdown and links back to portfolio work. Reduced motion suppresses expanding dissolution effects; no audio.

Session progress is stored behind a small sessionStorage interface when available, with an in-memory fallback. Active refresh resets temporary combat and score to a ready-to-retry beginning; best completed score, completed count and tool survive. Completed result reload is read-only. Attempt IDs and terminal/transition guards prevent repeat awards. No accounts or permanent history.

## Checks and evidence

- `npm run build`: passed with `SWC_NATIVE_BINDING_CACHE=/private/tmp/portfolio-swc-cache` to accommodate the sandbox. Existing shared Phaser chunk warning remains (~1.20MB / 319KB gzip); it is route-lazy.
- `npm run typecheck` and `npm run lint`: passed.
- `npm test`: **46 passed, 0 failed**. Seventeen focused arcade logic/input/persistence tests plus an additional production-route test; existing tests retained. Covers cooldown/shared switching lock, damage/protection, contact-type distinction, unique enemy awards, terminal gating/bonuses, terminal states, restart, pause, frame-rate movement, wall blocking/range, navigation including wall-adjacent targets, interaction latching, focus filtering, held-key clearing, recovery and invalid/unavailable storage.
- Arcade browser matrix: **390×844, 844×390, 768×1024, 1280×800**. Canvas aspect/framing and essential control bounds asserted; rendered canvas screenshots visually inspected at all four sizes. Keyboard controls, switching, pause freeze/cleared input, touch movement and firing together, touch cancellation, focus loss and active refresh checked. Defeat and one-action retry checked through actual combat.
- Browser gameplay script used ordinary controls and canvas-pixel observations, with both tools; neutralised all eight threats and explicitly restored the terminal. Recorded **1,500 points**, session best 1,500, completed count 1, with damage taken. The machine-controlled run took **16.3 seconds** with continuous assisted firing and known geometry. This is not a human completion-time or enjoyment measurement; 60–120 seconds remains an initial encounter design target to evaluate with people.
- Production browser checks: static-route hydration, active recovery, stored result refresh, replay, invalid storage, unavailable-storage in-memory play, portfolio/story routes and absence of arcade/engine downloads on unrelated opening routes passed without console/page errors. Stored result tests are clearly separate from the real gameplay completion test.
- Existing Incident Zero full browser regression suite: six viewports, spatial/touch mapping and cancellation, WCAG axe checks, three normal endings, three previews, report focus, replay, route refresh and paused teardown passed. Story behaviour was retained.
- Renderer lifecycle: three repeated start/pause/destroy cycles returned zero retained canvases and zero owned global listeners in each cycle. The shared lifecycle prevents Phaser's default visibility callback retention and window handler replacement.

Run scripts with `QA_MODULES_DIR` pointing at an existing Playwright installation (the repository's established convention). Scripts: `scripts/defence-qa.mjs`, `scripts/defence-playtest.mjs`, `scripts/defence-production-qa.mjs`, and the existing `scripts/incident-review-qa.mjs`.

Local ignored artifacts:

- `.qa/defence/play-1280x800.png` — desktop arena/HUD/controls.
- `.qa/defence/play-390x844.png` — portrait touch layout.
- `.qa/defence/play-844x390.png` — landscape touch layout.
- `.qa/defence/play-768x1024.png` — tablet layout.
- `.qa/defence/playtest-result.png` — actual combat victory report.
- `.qa/defence/pause-*.png`, `defeat.png`, `stored-result.png` — overlay states.
- `.qa/defence/results.json`, `playtest-results.json`, `story/results.json` — machine-readable evidence.

## Performance and limits

Actual Phaser canvas render calls were counted over ten seconds of active combat at 1280×800, using headless Chrome 153 on macOS, with eight logical processors reported. Initial samples: 600 frames / ~9.984s (**60.0fps**), 16.6ms median, 19.3ms p95; a later sample: 594 frames / ~9.984s (**59.4fps**), 16.7ms median, 19.1ms p95. This is a short local measurement, not a guarantee across devices. After lifecycle integration, the final sample recorded 600 frames / 9.983s (**60.0fps**), 16.7ms median and **17.6ms p95**. The current `results.json` contains this sample.

Agent-run mobile validation used browser viewport/CDP multi-touch simulation, **not physical-phone testing by the agent**. The owner subsequently reported physical iPhone 12 Pro Max gameplay as fun and easy with assisted targeting; their feedback is recorded below. This is one player’s subjective assessment, not a five-player trial or evidence that the Stage 2 gate has been achieved. Fine silhouettes and telegraph readability still warrant broader phone testing. The browser session data is intentionally temporary and can be unavailable under privacy restrictions. No audio is included.

## Human playtest feedback — desktop and mobile

Feedback comes from **one player**, the portfolio owner. Desktop feedback followed two playthroughs; the mobile follow-up concerns the iPhone 12 Pro Max already used in the reported device tests. The number of mobile attempts and human completion times were not recorded. Desktop and mobile feedback are not separate trial participants.

### Desktop feedback

1. **Learning:** Easy to learn; no timed 30-second measurement was taken.
2. **Weapon choice:** Preferred Packet Pulse. The current encounter does not create a clear need for Firewall Fan.
3. **Damage feedback:** Noticed the integrity/health indicator decreasing. Identifying the specific source of each hit was not separately established.
4. **Completion:** Could complete the encounter without verbal coaching.
5. **Replay:** Wanted to retry, but the second playthrough felt repetitive.

Overall impression: the game has potential to be fun, but needs more variety in arena layout, enemy placement, enemy types and encounter situations.

### Mobile follow-up

**Mobile gameplay is fun and quite easy with auto aim.** Assisted targeting makes the combat approachable on touch controls. The player reports the **same critique as on desktop**: the encounter provides little reason to choose Firewall Fan over Packet Pulse, and repeated plays need more variety in layout, enemy placement, enemy types and encounter situations.

This is a positive user-reported physical-device gameplay result. It does not establish that every iPhone/browser combination works, that the text-selection issue was specifically retested, or that a wider trial has passed.

### Priorities from this feedback

- Give each weapon a clear tactical purpose, especially a reason to choose Firewall Fan.
- Plan encounter variety through layouts, enemy placement and distinct enemy behaviours.
- Assess whether assisted targeting makes mobile combat too easy while retaining its approachable controls.
- Measure first-play and replay duration with new players before tuning difficulty or adding content.

This feedback informs the next iteration; it is not automatic approval for procedural generation or broad content expansion.

## Human playtest gate and next decision

Ask each of five new trial players:

1. Can you move, fire and switch tools within 30 seconds?
2. Can you explain when you would use each weapon?
3. Can you identify what damaged you?
4. Can you complete the encounter without verbal coaching?
5. Do you want to retry?

Record completion time, integrity lost, tool choice, missed interactions and recurring control/fairness problems. The proposed future Stage 2 gate is **at least four of five players understanding the loop without coaching, with no recurring control or fairness problem**. It has not been met or evaluated with five players; the feedback above represents one participant.

Tune mobile target/telegraph readability, Pulse versus Fan usefulness and real first-play encounter duration before expanding content. Adjust speeds, spacing, health and cadence only from those findings. Keep the single arena and existing scope until the core loop clears that gate.

## LAN HTTP / iPhone startup follow-up

An iPhone 12 Pro Max report at `http://192.168.0.4:5174/` exposed a gap in localhost-only checks. Reproduced on that exact LAN origin: `isSecureContext` was false, `crypto.randomUUID` was undefined, and pressing Start threw `crypto.randomUUID is not a function`. Rendering had loaded; attempt creation failed.

Replaced the direct randomUUID call with a local attempt-ID generator using `getRandomValues` when available, plus a timestamp/counter/random fallback for unavailable crypto. These IDs guard local scoring transitions and are not authentication tokens. Added coverage for crypto objects without randomUUID and unavailable/throwing entropy. The primary button also keeps readable accent colours under touch's retained hover state.

Build, typecheck, lint and all **47 tests** passed. Start, restart, active/result refresh, replay and storage fallback passed over the reported LAN origin with randomUUID unavailable. iPhone-size 428×926 browser/CDP touch simulation verified Start and simultaneous movement/fire without page errors. Screenshot: `.qa/defence/iphone-lan-fixed.png`. The owner subsequently reported physical iPhone gameplay as working, fun and easy with auto aim (see human feedback above). The agent’s browser check itself does not claim real-device validation.

## iPhone control selection follow-up

Replaced the movement pad's text arrows with an aria-hidden, non-focusable SVG. Scoped `-webkit-user-select: none`, standard `user-select: none` and `-webkit-touch-callout: none` to gameplay controls/descendants and the canvas. Native context menus are cancelled inside the controls, and the pad prevents native pointer-down behaviour even while inactive. Reports, instructions and navigation keep normal text/link behaviour.

LAN browser validation checked a long hold on the disabled pad (no selected text), context-menu cancellation, and the existing four-viewport simultaneous-touch/input-release matrix. Typecheck, lint and build passed. iPhone-specific styling still requires physical-device confirmation. Refreshing the iPhone page clears any pre-existing selection.
