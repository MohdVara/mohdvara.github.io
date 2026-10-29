# PME v1.6 — Professional Typographic Identity

Local implementation and owner-review evidence, 29 October 2026. Internal ID:
`pme-type-1.6`. This is separate from PME-V1.6-CALENDAR; no calendar artifacts,
identifiers or preferences were changed. No commit, push or deployment authorized or performed.

## Objective and decision

Give the hero and editorial titles a recognizable engineering identity while keeping
body copy, evidence, controls and multilingual presentation readable. Retain **Space
Grotesk 2.000**, weight 600, for selected Latin display headings. Retain the existing
Avenir Next/Avenir/Segoe UI narrative stack and system monospace. Do not add a second
expressive face or a new monospace download.

The original system used the body stack for display too: the desktop hero at
1440×1000 resolved to Avenir Next Demi Bold, 57px/59.85px, tracking −3.135px.
Its name was tightly tracked and visually similar to ordinary interface typography.
The candidate keeps 57px and weight 600, changes the face, opens tracking to
−2.28px and line height to 61.56px. The same two-line brand name and existing
accent remain. Section headings use −.025em instead of the hero's −.04em.
The old display stack is retained as the fallback/control, rejected as the final
Latin display direction because it contributes less identity. No additional candidate
family was needed. The change is deliberately modest: more open counters and a
recognizable name silhouette, without bigger headings, new animation or new copy.

## Source, license and coverage

- Official source: https://github.com/floriankarsten/space-grotesk
- The full upstream variable WOFF2 is copied without subsetting or font modification.
- `public/fonts/editorial/manifest.json` pins upstream revision, exact asset URL,
  font version, axes, byte count, SHA-256, license checksum and audited cmap.
- `Space-Grotesk-OFL.txt` preserves the exact upstream SIL OFL 1.1 notice. Its
  permissions include embedding and redistribution subject to the bundled license.
- The asset is **49,256 bytes (48.10 KiB)**, weight range 300–700. Production uses 600.
- FontTools inspected the binary's 735-codepoint cmap: all 120 Latin/ASCII/mark
  characters required by the six Latin locale catalogs are covered. Quoted Arabic/
  Japanese names and the checkmark use existing fallback fonts; no coverage was
  removed to reach the budget. This is coverage verification, not fluent review.
- Chrome reports the variable binary's legacy family as `Space Grotesk Light`,
  PostScript `SpaceGrotesk-Light_wght…`; computed weight is 600. QA checks the
  actual custom PostScript family rather than rejecting that upstream naming.

## Roles and ownership

`src/Typography.css` owns the optional face, body/display/technical tokens and two
tracking tokens. `src/main.tsx` imports it beside the existing global styles.
The existing hero font rule in `src/i18n/i18n.css` accepts `--font-hero-display`
with its original fallback. No new specificity escalation or `!important` was added.

The explicit root-locale allowlist is en, ms, es, fr, de and pt-BR. Within those
locales, display applies to main page h1s, homepage section titles, engineering,
engagement, PACE-RAG and No Two Mondays headings, landscape endings and selected
project/contact headings. It does not apply to body text, h3/h4 evidence subsections,
translation notices, navigation, forms, PACE conversations, monograms or canvas labels.
The `.mono` role retains its exact existing stack. Technical identifiers and source
strings are unchanged; no new tracking or synthetic numerical formatting is imposed.

Arabic, Tamil, Hindi, Japanese and Chinese retain their current Noto fonts and
native system fallbacks. Their Latin hero name deliberately retains the existing
Avenir stack too: an English `lang` attribute inside a non-Latin page does not
trigger a cosmetic Latin download. Native names retain their existing colors,
shaping, line height, zero-tracking rules and reading direction. Japanese and Chinese
vertical editorial titles and the separate native name column remain independent
of horizontal controls and of the saved reading-mode preference.

## Loading and artwork isolation

One self-hosted WOFF2, `font-display: swap`, no preload, no external CSS import,
no new runtime dependency or typography JavaScript. Only a matching Latin display
element requests the asset. Initial non-Latin pages request none; locale switching
reuses the same resource. Existing active-locale Google/Noto loading is unchanged.
The loader retains its system typography and full existing architecture.

No changes to NAAE fonts/manifests, renderer, adapter, workers, scene seeds, glyph
calibration, portrait assets or geometry. Delayed and failed editorial-font browser
checks prove semantic content and loader completion do not wait on this font. The
real ready artwork's scene signature, geometry build count, texture revision,
text-run count and canvas dimensions remain equal across font completion. This is
bounded lifecycle evidence, not an all-device rendering performance certification.

## Responsive and accessibility work

Keep the existing responsive scales, semantic headings, RTL spatial placement,
normal document scrolling, focus outlines and motion preferences. The light-theme
hero description now uses the existing darker `--strong-muted` palette token.
No translated text was shortened to fit. No fixed text heights or hidden essential
content were introduced.

The original baseline fails German at 320px/150% text: document width is 385px.
Long diagram labels also exceeded their columns. Fixes are small and owned locally:

- `src/SystemDiagrams.css`: allow grid buttons and their text span to shrink and wrap.
- `src/Readability.css`: allow long words to reflow at the largest text setting;
  restore the mobile hero's two explicit columns so full-width prose spans both
  columns instead of stopping at the implicit portrait column; size the comparison
  arrow column with text rather than a fixed 16px.

The largest setting retains 150% root text. Default and large presets are checked.
Keyboard skip-link focus, forced-colors semantic text, reduced motion, small and
short viewports, dark/light surfaces, script direction and editorial writing modes
are browser-tested. The zoom check is a **200% reflow equivalent** (720×500 CSS
viewport at deviceScaleFactor 2 for a 1440×1000 window), not a test of the browser
chrome zoom control. Screen-reader speech and fluent native editorial review were
not performed. Existing machine-translation disclosures remain visible.

## Evidence and reproduction

Local browser assets live in ignored `output/playwright/pme-type-1.6/`:

- `before/` and `after/`: matched 58-case matrices, PNGs and computed-style/resource/
  bounds reports. Original HEAD was separately built from a local Git archive;
  the archive has no Git footer revision. Hero content and styles are the original.
- `comparison.html`: paired English, Arabic, Tamil and Japanese desktop/mobile
  screenshots plus English editorial pages, with original/candidate labels.
- `loading/report.json`: delayed/failed font, unchanged artwork, locale cache,
  keyboard/forced-colors and reflow-equivalent scenarios.
- `native-fonts.json`: actual Chrome platform-font inspection of native name text.
- `performance.json`: separate local alternating original/final samples, conditions
  and individual values. Do not reinterpret them as live-site or statistical results.
- `contrast/`, `loader/`, `i18n/`: existing browser-suite results.
- Initial exploratory captures are retained in separately named directories;
  they are not the final visual acceptance evidence.

Capture waits for locale readiness, fonts and the actual seeded reduced-motion
artwork texture. Earlier exploratory images could differ because texture generation
had not completed; those timing differences are not evidence of typographic change.
The final comparison has 17 byte-identical native-script samples. Ten expected
differences come from largest-text reflow and the light-theme paragraph contrast
correction; normal dark, large and writing-mode samples remain pixel-identical.
The 58-case final matrix passed; only the 16 light-theme cases were then resampled
after the contrast-only correction. All 58 stored results pass.

Run with an external audit-only Playwright install, as existing repository scripts do:

```sh
QA_MODULES_DIR=/path/to/node_modules QA_URL=http://127.0.0.1:4178 node scripts/typography-qa.mjs
QA_MODULES_DIR=/path/to/node_modules node scripts/typography-loading-qa.mjs
python scripts/typography-font-audit.py # audit-only fonttools[woff] environment
QA_MODULES_DIR=/path/to/node_modules node scripts/typography-performance-qa.mjs # run alone; original server on 4179
```

Use `QA_STAGE=before` against an unchanged baseline server. The expected original
German failure remains in its report; the final candidate must have no failures.
No screenshot binary was added to source control.

## Validation, limitations and release

The machine-readable ledger is `verification/pme-type-1.6.json`; it records actual
commands, outcomes, payload/paint measurements, screenshots and source changes.
Full lint has five pre-existing `no-explicit-any` errors in
`.opencode/plugins/entire.ts` (18, 199, 244, 254, 402). That file was not modified.
A separate lint run excluding that one pre-existing file passes; the full lint gate
is still reported as failing. i18n validation has 97 existing editorial warnings,
zero errors, zero missing/stale translations. No gate or configuration was weakened.

Initial HEAD: `79e897e73bce97adf4347a4522513249154ca783`, branch `main`, original
worktree. The pre-existing edit to `PORTFOLIO_CASE_STUDY_EXPANSION.md`, 15 untracked
Playwright YAMLs and `output/MACE_CLAUDE_COMPLETE_CONTEXT.md` were preserved.
Build-generated `public-github.json` timestamps were restored to their starting
content; unrelated registries and translations were not changed.

**Recommendation: Ready for owner review.** Review the paired English hero,
Arabic RTL, Tamil and Japanese vertical views before release authorization. The
existing lint errors, measured local LCP increase and native-language/editorial
review remain explicit review items. No production performance, live deployment or publication readiness beyond
these local checks is claimed.

## Recorded validation and performance

| Check | Final local result |
|---|---|
| Typecheck / build | PASS / PASS |
| Application tests | 222 passed, zero failures/skips |
| i18n validation / strict coverage | Zero errors, 97 editorial warnings / 11 × 1,578 units complete |
| Artwork / public inventory | 11 packs / 72 approved assets |
| Typography browser matrix | 58 passed, zero browser errors; 16 light cases resampled after contrast correction |
| Existing multilingual browser QA | 88 layouts plus direction, preferences, disclosure and English-only assistant checks |
| Existing loader / new lifecycle QA | 21 / 7 scenarios passed |
| Sampled hero contrast | 6/6 passed; minimum 5.06:1 across the six final scenarios |
| Full lint | Five pre-existing errors; supplemental run excluding that file passes |

The original sampled desktop light case failed at 4.18:1. The initial candidate
was 4.11:1; changing only the hero description to the existing darker token makes
that scenario pass at 5.11:1. Artwork and contrast thresholds remain unchanged.
This sampled audit is not a complete WCAG certification.

| Measurement | Original | Final |
|---|---:|---:|
| Initial English editorial WOFF2 requests | 0 | 1 |
| Editorial font body bytes | 0 | 49,256 |
| Editorial request transfer incl. local HTTP overhead | 0 | 49556 |
| All emitted CSS, raw bytes | 124,126 | 125,687 |
| All emitted JavaScript, raw bytes | 5,234,339 | 5,234,339 |
| Local LCP median, five samples (ms) | 520 | 640 |
| Local LCP range (ms) | 476–660 | 504–828 |
| Local CLS maximum | 0.00000168 | 0.00066015 |

Measurements use separate, sequential alternating cold browser contexts against
local original/final production builds, 1440×1000, reduced motion, no CPU/network
throttling, after other QA finished. The original archive has no Git footer SHA.
The **120ms median LCP increase is a measured trade-off**, not an unchanged-LCP
claim. Ranges overlap and five samples do not establish significance; production
LCP under representative throttling remains an unresolved release-review item.
Maximum CLS is 0.00066015; typography adds 1,561 raw CSS bytes and no JS bytes.
Initial non-Latin pages request zero new display fonts. The existing application
bundle tests and shell budget pass. A first exploratory timing set overlapped
contrast QA and is explicitly marked discarded.

The task changes five tracked implementation/inventory files and adds eleven files
(including this report, the verification register and three licensed font assets);
exact paths are listed in the register. Existing owner changes are excluded.

## Maintenance

Keep the root-locale allowlist explicit; do not broaden it to every `h1:lang(en)`.
When adding a Latin locale or upgrading the face, re-audit the actual binary cmap,
update source/license/checksums and approved public inventory, then compare real
localized headings. Use the full upstream asset unless a coverage-preserving
optimization is measured. Keep ordinary display-font loading outside NAAE lifecycle
and loader readiness. Retain body/interface stacks and script-specific rules; add
new display selectors only for deliberate editorial hierarchy.
