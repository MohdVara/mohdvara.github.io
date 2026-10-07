# Incident Zero

A deterministic, entirely synthetic engineering vignette. No company records, proprietary source, runtime LLM, account, analytics service or backend is used. The displayed salaries, employee identifier, dates, deadlines, scores and system relationships are fictional. The suggested 6–12 minutes is a design estimate, not measured visitor playtime.

## Boundaries

- `IncidentZeroRoute.tsx`: static landing, route-level CSS, start/loading/error shell. The browser loads this module only on `/incident-zero/`.
- `GameShell.tsx`: React owns story progression, evidence, dialogue, decisions, menus and report. `Modal.tsx` uses native modal focus containment and Escape handling.
- `state.ts`: pure typed reducer, prerequisite guards, puzzle validators and explicit ending rules. Reducer inputs come from the data-driven UI; puzzle validation happens before a completion action is dispatched.
- `story.ts`: fictional rooms, NPCs, dialogue nodes, evidence, consequences and optional explanations.
- `CanvasWorld.tsx`: one renderer instance per mounted spatial view, cancelled asynchronous creation, theme/reduced-motion sync and typed callbacks. Keyboard controls are scoped to the focused map. Coordinates remain inside the engine; React receives room/interaction changes, not frame-by-frame movement.
- `game.ts`: dynamically loaded Phaser 3 canvas renderer, movement, walk/idle sprite switching, collision, room doors, pointer destinations and original office-to-system vector drawing. The loop sleeps during overlays; destruction removes canvas, input handlers and renderer resources. The full story is also available through standard room/object buttons without spatial navigation.
- `Puzzles.tsx`: investigation choice, move-up/down date and delivery flows, checkbox-driven visual historical network. Closing an unfinished puzzle preserves the chapter and allows reopening; its draft arrangement resets.

The renderer has no story authority. A typed controller receives incident state and emits room changes or inspection intent. The React reducer gates progress and architecture access. To extract this feature later, replace the three portfolio-facing imports (`Navigation`, profile links and styling tokens) with host adapters.

## Explicit outcome rules

Keyboard play restores focus to the map after an interaction. Use WASD/arrows to move, E/Enter to inspect, R for the current investigation task, N/B for next/previous rooms, and Escape to pause. Dialog buttons support Tab and up/down navigation with Enter to activate; radio/checkbox fields retain native keyboard behaviour. Mobile provides persistent movement/interact controls and previous/next room buttons. Door traversal enters beside the opposite doorway instead of resetting to the room centre. Each NPC has a distinct original SVG; payroll, history and resolver terminals use different visual forms.

The introductory “I’m a recruiter” option previews a chosen primary ending by auto-selecting a deterministic sequence. Its report explicitly labels the shortcut; it does not award the Archaeologist insight or claim the visitor completed an investigation. Replay returns to normal gameplay.

Every device uses the same fitted 900×540 room and world coordinates, refreshed by ResizeObserver. Phone layouts use a directional cross with 48px buttons, room navigation and an Interact button. Direct inspection and the compact toolbar’s current-task button support touch play without precise walking. Keyboard tutorials are hidden on small screens and devices with a coarse primary pointer; touch guidance replaces them, including reorder-puzzle instructions.

1. Rewriting tonight produces **The Great Rewrite**, regardless of the handover plan: its migration misses this fictional deadline.
2. A targeted resolver fix with a staged migration produces **The Pragmatic Modernizer**.
3. All remaining choices produce **The Firefighter**, including targeted fixes without a migration path. This is a simplified narrative rule, not a universal assessment of engineering practice.
4. **The Archaeologist** is an additional insight, not a fourth competing primary ending. All six evidence sources must have been recorded before choosing the first production intervention. Later evidence cannot retroactively unlock it.

Assessment values are illustrative and clamped to 0–100 internally; the report displays Low/Moderate/High bands with an expandable explanation, not exact numerical claims. Manual intervention retains reliability risk; unverified replacement penalises delivery and reliability. The immediate fix changes the room's status annotation, tested route or migration boundary; each decision also presents immediate and subsequent consequences. Manual reconciliation does not mean the resolver was fixed. A successful HTTP request does not mean its business result was correct. The delivery list distinguishes producer event-ID creation, durable queueing, a worker claim, destination-side deduplication, same-key retry and reconciliation/escalation. It explicitly assumes atomic destination idempotency within a retention window; local flags alone cannot guarantee exactly-once effects.

## Production loading and hosting

The build creates `dist/incident-zero/index.html` with canonical, description, social metadata and existing Person/WebSite plus WebPage schema. Only this HTML includes the incident stylesheet. Homepage links appear both near the hero actions and after public engineering work. Native folder routing works with the same static output on GitHub Pages and Cloudflare Pages; no Pages Function or catch-all rewrite is required.

The game shell loads on Play or Preview; Phaser and its original SVG sprites load only when a spatial view mounts. The opening recruiter preview starts without a canvas. The homepage never downloads those chunks. Simplified navigation removes the canvas and stops its animation loop. No sound is required or implemented. In-memory progress resets on refresh or departure; the pause menu explains this.

## Testing

`npm test` includes eleven pure logic tests for metric clamping, evidence uniqueness, prerequisites, puzzle validation, all main endings, the secret condition and reset. Production tests verify static route content, CSS, SEO, sitemap and absence of eager game preloads on the homepage. Browser QA covers the same content through keyboard/spatial and non-spatial paths; browser scripts and screenshots stay outside the repository. Future puzzle/decision edits should repeat the manual, rewrite, targeted and full-investigation playthroughs.

See [assets/README.md](assets/README.md) for replaceable artwork slots. Keep text, controls, evidence and diagrams code-native even if room illustration improves.

## Review regression

Keyboard/touch guidance lives in Help; puzzle-specific arranging help is an expandable disclosure. The initial NPC provides one short onboarding cue. Active play retains portfolio/theme/accessibility links in a compact header. Ending focus/scroll runs once, only after the final consequence dialog is dismissed; replay resets progress, preview state and navigation mode.

`QA_MODULES_DIR=/tmp/portfolio-qa QA_OUTPUT_DIR=/tmp/incident-review node scripts/incident-review-qa.mjs` verifies six viewport sizes, pointer mapping, release/cancel/blur/pause, resize, native dialog focus, normal/preview ending paths and reset. See `docs/review/acceptance.md` for the current review and external evidence limitations.

Phaser 3.90’s stock visibility handler does not remove its document subscription and overwrites window blur/focus properties. The local `PortfolioGame` subclass preserves the protected start sequence but owns visibility/blur/focus subscriptions and removes them on DESTROY. Destruction wakes an asleep loop so Phaser can process its pending destroy frame. Recheck this small adapter when upgrading Phaser; the regression suite compares global listener balance across three paused renderer teardown cycles.
