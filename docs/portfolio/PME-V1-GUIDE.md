# PME v1.3 — multilingual portfolio

Implementation uses the existing React 18, TypeScript, Vite, pathname routing and static prerenderer. Added dependencies: `i18next` and `react-i18next`. No new router, runtime translation widget or framework migration.

## Implementation map

| Area | Existing architecture and implementation |
| --- | --- |
| Runtime/routing | React 18 + TypeScript + Vite, existing `Page.tsx` pathname routing, `i18n/Experience.tsx` locale changes without remounting page state |
| Canonical content | Route JSX, `content.ts`, `technology.ts`, `EngagementContent.ts`, incident story/game data and generated public project data; explicit catalog lookups |
| Locale system | `i18n/languages.json`, `config.tsx`, `localeResolution.ts`, `formatting.ts`, `controls.tsx`, lazy per-locale JSON bundles |
| Layout/artwork | Existing App, readability, animation, ASCII forest and diagram styles; logical RTL layout, script fonts, isolated artwork and viewport hero |
| PACE-RAG | Lazy `PaceAssistantLauncher.tsx`, English package boundary, excluded conversation constants, sibling PACE-RAG source and API policy |
| SEO/build/hosting | Static `scripts/prerender.mjs`, translated metadata + sitemap; `wrangler.toml` serves `dist` on Cloudflare Pages; existing GitHub Pages workflow retained |
| Maintenance/QA | Incremental extraction/translation/provenance/validation/coverage scripts, CI gates, unit/static tests and multilingual browser QA; permanent `AGENTS.md` policy |

The ten original locales are retained. Tamil is an explicitly requested extension, for eleven locales total; it follows Arabic in the selector. No hosted deployment is part of these local implementation checks.

## Languages and preferences

`src/i18n/languages.json` is the registry for native/English names, BCP 47 IDs, direction, supported/default writing modes, font families and provenance category. `languages.ts` supplies TypeScript locale and writing-mode types.

| Locale | Language | Direction | Optional editorial mode |
| --- | --- | --- | --- |
| en | English, original | LTR | — |
| ms | Bahasa Melayu | LTR | — |
| ar | العربية | RTL | — |
| ta | தமிழ் | LTR | — |
| ja | 日本語 | LTR | vertical-rl |
| zh-Hans | 简体中文 | LTR | vertical-rl |
| es | Español | LTR | — |
| fr | Français | LTR | — |
| de | Deutsch | LTR | — |
| pt-BR | Português (Brasil) | LTR | — |
| hi | हिन्दी | LTR | — |

Resolution: explicit URL → saved manual preference → supported browser preferences, in order → English. `zh-TW`, `zh-HK`, `zh-MO` and `zh-Hant` do not silently become Simplified Chinese; the next browser preference or English wins. Generic `zh`, CN, SG and Hans map to `zh-Hans`. Portuguese regional preferences map to the one supported Portuguese locale, `pt-BR`.

Manual choices use `portfolio.locale.v1`; reading mode uses the separate `portfolio.writing.v1`. Storage failures do not prevent switching. A failed initial locale download falls back to the committed English catalog; a failed manual download keeps the current page and reports a localized error. Switching preserves the underlying page, query string, fragment, React state and focused control. Browser back/forward updates the language. A saved vertical preference becomes inactive outside Japanese/Chinese and is restored when returning.

## English source and rendering

`src/i18n/locales/en.json` is the flat canonical English catalog. Semantic keys are supported; existing prose uses readable English keys to keep the established content modules and technical identifiers intact. Source declarations remain in `content.ts`, `technology.ts`, `EngagementContent.ts`, `story.ts`, `src/data/public-github.json` and route JSX. `text(key, values)` resolves a catalog entry; `localizedContent(value)` translates string children and string arrays without changing React element identity, data models, events or attributes used by application logic. This is explicit React rendering, with no MutationObserver text replacement, HTML injection or automatic translation of arbitrary DOM nodes.

`npm run i18n:extract` discovers new JSX text, accessible labels, `text()` calls and data prose. It adds entries and records source locations. Extraction is deliberately add-only: remove obsolete units explicitly from the canonical JSON, then translation planning detects and removes obsolete machine entries. It never assumes that absence from a heuristic scan makes a semantic key obsolete. Update a canonical value under its existing key to retain stable provenance and flag reviewed translations stale. When changing an English-keyed declaration, update the declaration and remove its old catalog unit as part of the edit.

Use `text("There are {{count}} items", {count})` for dynamic text; avoid concatenating translated sentence fragments. There are no ICU messages; future plurals should use i18next `_one`/`_other` keys and `count`. `formatting.ts` provides explicit `Intl.NumberFormat` and `Intl.DateTimeFormat` helpers. URLs, filenames, identifiers, source code, logos, product/company names and deliberate ASCII compositions remain unchanged. Proper names are protected by `scripts/i18n/glossary.json`.

## Translation generation

Normal builds need no credentials and never contact a translation provider. They extract English, refresh coverage, build Vite assets and prerender static pages. Generation is an independent authoring command:

```sh
npm ci
npm run i18n:extract
npm run i18n:translate -- --dry-run
npm run i18n:translate -- --locale ar --changed-only --dry-run
npm run i18n:translate
npm run i18n:translate -- --locale ja
npm run i18n:translate -- --locale ja --force
npm run i18n:validate -- --write
npm run i18n:coverage -- --write --strict
```

Changed keys are the default; `--changed-only` explicitly documents that intent. `--force` regenerates unreviewed entries. Reviewed entries remain protected unless `--override-reviewed` is also supplied. Unsupported locales fail rather than producing an empty success. Commit catalogs, `scripts/i18n/metadata.json`, the coverage report and review warnings together.

The initial catalogs were generated during development using a public translation service, with selected assistant-authored initial translations and terminology corrections. Provenance distinguishes `google-translate-development-bootstrap` from `development-assistant`. These are machine translations, not native-speaker or human-reviewed translations. The public bootstrap endpoint is not a supported production dependency and is deliberately absent from the application and repeatable provider adapter. The service does not expose model versions, token usage or cost, so those are not invented.

For repeatable updates, configure these **local/server-only** variables:

```sh
export OPENAI_API_KEY='your-local-key'
export OPENAI_TRANSLATION_MODEL='your-chosen-structured-output-capable-model'
npm run i18n:translate -- --locale ar
```

The command reads the process environment; it does not automatically source `.env.local`. Never use `VITE_` for credentials. `.env.example` contains empty placeholders. No default model is assumed. Choose one supported by your account. The adapter uses the OpenAI Responses API with a strict JSON schema, `store: false`, plain text output and local schema/glossary/placeholder validation. See [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses).

Generation compares SHA-256 hashes, caps batches at 24 units/5,000 source characters, uses two workers by default, retries network/429/5xx failures with bounded exponential backoff and persists completed batches atomically. Failed batches leave existing committed translations available and can be resumed. `I18N_CONCURRENCY` is capped at four. Token usage is recorded when supplied by OpenAI. Optional `I18N_INPUT_USD_PER_MILLION` and `I18N_OUTPUT_USD_PER_MILLION` produce an estimate; unset prices are explicitly flagged as unconfigured, not a claim of free usage.

## Review and provenance

English is `original`. Each non-English unit records `machine_translated` or `human_reviewed`, source hash, provider and model/service version where available. To correct a translation, edit its locale JSON, have an appropriate reviewer verify it, then run:

```sh
npm run i18n:review -- ar 'Canonical English key'
```

This records the current source hash. A source change flags a reviewed entry as stale; automation does not replace it silently. `--force` alone never bypasses review protection.

Validation rejects missing placeholders, protected-term changes, unexpected bidi controls, HTML, invalid types, empty values and missing provenance. Missing units, unchanged English passages, stale hashes and excessive expansion require editorial review. Default validation fails on structural errors and reports warnings; `--strict` also fails warnings. The review JSON lists specific suspicious units rather than hiding them behind coverage percentages. Some unchanged entries are legitimate technical labels. Coverage measures catalog availability, not linguistic correctness or the completeness of external packages.

## Direction, typography and animation

Arabic sets `html.lang="ar"` and `dir="rtl"`. Navigation follows DOM reading order; semantic spacing, borders, menus and timeline positions use logical CSS. Relevant link arrows/hover movement adapt. Photographs, diagrams, game coordinates, media, code, monograms and ASCII artwork retain their natural orientation. Code and embedded identifiers use isolation; the hero’s proper name remains LTR. For Arabic, the hero’s portrait and scenery sit on the left, and the background visibility/reading-surface gradients reverse spatial emphasis without mirroring pixels or glyphs. Background motion is unchanged and existing reduced-motion behavior remains active.

`VerticalText` uses real `writing-mode: vertical-rl` and `text-orientation: mixed`, on selected section headings across the portfolio and case studies. The reusable component and `ReadingModeToggle` activate only for Japanese and Simplified Chinese. Navigation, technical descriptions, forms and game controls remain horizontal. Mobile column height is bounded by the viewport. The Japanese/Chinese name reading is always a separate vertical column beside the portrait, including when other editorial headings are horizontal. Arabic, Hindi and Tamil show an approximate native-script full-name reading alongside the Latin identity. The native reading includes a phonetic rendering of Mohd. as written, without expanding the Latin abbreviation. The first name uses the main text color and the surname uses the same accent color as the Latin name. The header contains only a compact localized monogram; the original full name remains accessible through its label. Phonetic guides are approximations for owner review, not an asserted legal/native spelling. Desktop opening frames account for the header and visible disclosure within one viewport. Responsive spacing keeps content readable; short screens, expanded disclosures and enlarged text reflow through normal page scrolling without an internal hero scrollbar.

Latin retains the existing brand fonts. Arabic, Japanese, Simplified Chinese Hindi and Tamil request only the active Noto family from Google Fonts with `display=swap`, with native system fallbacks. Fonts are not all downloaded for every visitor. A blocked font service leaves fallbacks available. Canvas game labels use the active font and redraw on language/font changes without resetting gameplay; physical movement controls keep their original spatial meaning.

## Routes, SEO and Cloudflare Pages

All six public application routes are generated for each locale: home, Work With Me, No Two Mondays, PACE-RAG case study, Incident Zero and System Defence. Existing unprefixed routes remain static x-default entries. Localized HTML includes translated body content, title/description, document direction, self canonical, reciprocal eleven-language alternates plus x-default, and localized social metadata where available. The sitemap contains 72 public routes. Assets, the knowledge library, external URLs and mail links are not locale-prefixed.

Root auto-selection uses `history.replaceState`, preserving the x-default HTML entry and avoiding HTTP redirect loops. Localized refreshes hydrate the correct locale; an English root automatically resolved to another language uses a fresh React render rather than hydrating mismatched text. Unknown pages retain the existing 404 behavior.

Cloudflare Pages continues to serve `dist`; `wrangler.toml` is unchanged. Every localized route has its own `index.html`, so no broad rewrite or function is needed. Locale catalogs become hashed Vite chunks and are independently cacheable; only the selected locale plus the canonical English fallback is loaded. i18next dependencies and foundation code are split from the entry chunk. No visitor request reaches a translation API. Static output also remains compatible with GitHub Pages.

## Verification

```sh
npm run typecheck
npm run lint
npm run build
npm test
npm run i18n:validate -- --write
npm run i18n:coverage -- --write --strict
npm run preview -- --host 127.0.0.1 --port 4173
# Existing repository convention: install Playwright in your QA tools folder.
QA_MODULES_DIR=/path/to/qa/node_modules node scripts/i18n-qa.mjs
```

On this restricted macOS execution environment SWC needs a writable native cache:
`SWC_NATIVE_BINDING_CACHE=/private/tmp/pme-swc npm run build`. This is an environment workaround, not a deployment requirement.

The browser script checks 320/375/390/768/1024/1440/1920/3840px across all eleven languages, detection, persistence, URL priority, history, English-original access, nested route/query/fragment preservation, RTL mobile navigation, mixed script isolation, CJK vertical mode and requests. Screenshots and machine results go to `output/playwright/pme/`. Unit tests cover resolution, fallbacks, provenance plans, review protection, validation and mocked provider behavior. Static tests inspect all 66 localized pages.

## Remaining boundaries

PACE-RAG Q&A and its professional source library are permanently English-only. The portfolio feature descriptions, availability notice and usage/accessibility guidance remain localized. The Q&A has `lang="en" dir="ltr" translate="no"`, horizontal writing and left alignment; Japanese/Chinese writing modes and Arabic RTL cannot alter it. Visitors keep their chosen portfolio locale. Its component identity, current question and answer survive portfolio language changes.

Conversation constants live in `src/paceConversation.ts`; `scripts/i18n/exclusions.json` excludes them and the worked Q&A example from extraction and provider synchronization. No visitor questions, answers, conversation history, source excerpts or retrieved evidence enter translation requests. Source evidence remains publication-approved English.

The local PACE-RAG source (`../pace-rag`) supplies the `1.6.2-english.1` assistant package. Its approved public corpus remains release 1.6.2, with unchanged asset hashes. Conservative query checks reject confidently foreign-language sentences and invite English rephrasing, while allowing ambiguous queries, names and technical identifiers. The generation service requires English in its system instructions and validates every returned claim's language before preserving the existing grounding/citation checks. Client validation also rejects non-English generated claims. Unknown generated prose fails closed; language identification is heuristic and cannot certify natural-language correctness. Live generation remains disabled in the scoped portfolio integration. Server changes are local and require the normal PACE-RAG deployment workflow to affect a hosted API; nothing was deployed.

The permanent exception is recorded in both repositories' `AGENTS.md`. Text embedded in historical screenshots and deliberate ASCII art also remains original.

All ten non-English catalogs require fluent-language editorial review; automated structural validation cannot certify factual equivalence, natural grammar or regional Portuguese usage. The OpenAI provider is verified with mocked responses; no live OpenAI request was run without credentials. Local refreshes and output structure are tested, but this work does not deploy or claim a fresh live Cloudflare verification or a new Lighthouse score.

## Calendar policy

At the owner's request, Japanese uses `japanese` era dates; Simplified Chinese uses `chinese` lunisolar dates; Hindi uses India's `indian` Saka national calendar; Arabic and Malay show explicitly labeled `islamic-umalqura` Hijri dates. English, Spanish, French, German and Brazilian Portuguese retain localized Gregorian dates. This is a display policy, not an assumption about every speaker's religion or preferred civil calendar. Umm al-Qura is not claimed to match local Malaysian moon-sighting decisions.

`formatting.ts` derives calendar dates from canonical English dates with explicit years. Each alternate date carries an unambiguous Gregorian ISO equivalent in brackets. Month-only/year-only dates display only corresponding months/years (or a range when a calendar boundary requires it), preserving source precision without adding days or months. For example, 2019 becomes 平成31年 – 令和元年 [2019], and 2021 becomes 令和3年 [2021]. Embedded prose keeps its translated sentence and adds calendar equivalents after it; an isolated date is replaced directly. Day/month references without a year stay as translated because converting them would require inventing a year. Versions, counts, timestamps inside fictional logs and source-code dates remain unchanged. No new time zone or clock time is inferred. UTC fixes the civil-date conversion consistently between browser and prerendering.

Calendar background: [MDN supported calendars](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/supportedValuesOf), [India Meteorological Department national calendar](https://packolkata.imd.gov.in/panchang/en/explanation), [Hong Kong Observatory conversion tables](https://www.hko.gov.hk/en/gts/time/conversion1_text.htm), [JAKIM Hijri/Miladi context](https://www.e-solat.gov.my/index.php?pageId=26&siteId=24).


## Date-period audit and Tamil

Tamil (`ta`) appears immediately after Arabic. Tamil uses Noto Sans Tamil, LTR navigation, a localized compact monogram and phonetic name guide. Its alternate date display is explicitly labeled as the Indian national Saka calendar, the same `indian` calendar used for Hindi; this is not presented as the traditional Tamil solar calendar. The Gregorian equivalent remains in brackets.

The Tamil hero uses the selected script font, compact viewport padding and a stacked portrait caption; decorative background fades do not create scrollbars. Short screens and enlarged text retain accessible normal page scrolling.

Period labels are parsed from canonical English, not guessed from translated wording. `Since 2013`, `2025 onward`, month/year-to-present, ongoing-collaboration periods and closed year/month ranges use localized interpolation templates. Year-only periods stay year-only in every calendar. `2025 onward` therefore becomes `和暦: 令和7年 [2025]以降` in Japanese and `Depuis 2025` in French. English remains unchanged. The extractor now includes numeric-leading `period` fields so these phrases cannot disappear from catalog coverage. Tests cover the actual project/experience periods rather than only isolated dates.


## Translation transparency addendum

`TranslationNotice` in `src/i18n/controls.tsx` is rendered immediately after the shared navigation and before main content on every non-English application route. The 404 view also shows the notice. The static prerender includes the localized heading, complete disclaimer paragraph and a real English-original link. At the owner’s later request, the notice uses a native `details` disclosure, compact by default. The full paragraph expands with mouse or keyboard; the original-English action stays visible. Expansion is not stored, so the compact disclosure remains available on every visit without acknowledgement or permanent dismissal. The information icon, neutral surface, logical grid spacing and 44px action use existing theme tokens. Arabic follows RTL; the notice and compact selector status always use horizontal writing even in CJK editorial modes. English shows neither machine-translation disclosure.

The existing language selector's expanded menu contains only the short localized “Machine translated from English” status. It does not duplicate the disclaimer paragraph. Four critical strings are synchronized across all ten non-English locales with machine-translation provenance and no claim of human review.

The English-original link points to the equivalent `/en/` route. Normal clicks reuse `changeLocale`, updating the deliberate saved preference and retaining query, fragment and React state; modified clicks retain native link behavior. The header and notice are measured when calculating available hero space. Desktop first/last screens use viewport-aware typography and spacing; the No Two Mondays introduction places its facts alongside supporting text. No hero creates an internal scrollbar. If a short screen, expanded notice or enlarged text needs more space, the document scrolls naturally without clipping content. PACE-RAG prompts, retrieval, generation, evidence and English-only boundaries were not changed by this addendum.


Desktop section checks cover 1366×768, 1440×900 and 1920×1080 across all locales and the five editorial pages. The final section is measured below the sticky navigation; case-study evidence is included as the last section on No Two Mondays. Interactive System Defence retains its game controls and receives the same disclosure and locale selector in its own header layout. `scripts/i18n-disclosure-qa.mjs` records geometry, keyboard disclosure behavior and runtime translation-request checks in `output/playwright/pme-disclosure/`.

Addendum files: `src/i18n/controls.tsx` contains the shared disclosure and compact selector status; `context.ts` and `Experience.tsx` provide the route to the original link; `src/App.tsx` places and measures the disclosure below navigation; `i18n.css` owns the theme-aware panel and responsive section sizing. The custom System Defence header and 404 view also expose the disclosure. `IncidentZeroRoute.tsx` safely renders its no-JavaScript text without apostrophe-related hydration mismatches. Locale catalogs, source hashes, coverage/status, static/unit tests, both browser QA scripts and `AGENTS.md` complete the maintenance changes. PACE-RAG's conversational package and generation/retrieval logic are untouched by this addendum.

Validation evidence is recorded in `PME-V1-QA.json`; screenshots and detailed browser geometry remain in the ignored `output/playwright/` artifacts. Machine translations still require fluent editorial review. No deployment was performed.


## Native vertical titles in secondary project cards

At widths of 900px and above, the Japanese and Simplified Chinese secondary project cards use their available full width: metadata spans the top, the existing title is written natively with `vertical-rl` in the left column, and the role, summary, scope, contribution and expandable details remain horizontal on the right. The same heading stays in the DOM once, with unchanged text and anchors. This owner-requested title treatment is independent of the optional editorial reading mode, just like the native hero name column. Other locales retain their existing layout. Narrow screens and the largest-text setting revert to horizontal titles and natural reflow. No translation keys, career claims or PACE-RAG behavior changed.

Verification for this change is recorded separately in `verification/cjk-project-titles-v1.json`, with screenshots and browser-check artifacts in `output/playwright/cjk-project-titles/`.


## Incident Zero localization and history follow-up

The Japanese opening previously contained an English sentence inside an otherwise translated catalog value. The complete paragraph is now Japanese, with machine-translation provenance retained. Three conditional canvas labels (terminal restoration, reviewed payroll and mismatched payroll) are now extracted and translated in every non-English locale. Each conditional branch calls `text()` with a literal; the terminal caption is centered and wrapped within the canvas bounds, including the generated terminal position near the lower-right edge.

History restoration now discards obsolete asynchronous locale loads, invalidates pending manual language switches when history moves, and resynchronizes the URL locale on a persisted `pageshow` event. Focused tests exercise deliberately reordered loads, cancellation, cached restoration and current versus obsolete failures. The owner's exact mixed-language screenshot was not reproduced before this change; this is a fix for the identified history race and missing cache-restoration synchronization, with local regression evidence in `verification/incident-localization-fixes-v1.json`. No production deployment or fluent linguistic review is claimed.


## Text link feedback

Ordinary text links share an accent color, underline and theme background on hover and keyboard focus. Non-menu disclosure summaries use the same feedback. Button links and header menu items keep their existing treatment. The multilingual case-study card now displays its existing localized project title above the description. Scoped browser evidence and the incomplete broader locale-browser run are recorded in `verification/text-link-feedback-v1.json`. No deployment is claimed.


## Additional systems cards

The Hostel and Asset Management systems share a two-column card grid from 1000px, with subtle surfaces, accent borders and consistent padding. Japanese and Simplified Chinese titles use native vertical typography from 900px while details stay horizontal. Narrow screens use one column; the largest-text setting also restores horizontal titles. Existing text, translations, historical disclaimers and repository links are preserved. Verification is recorded in `verification/additional-systems-layout-v1.json`.


## Expanded project details and CJK reading preference

Expanded Rental, Meeting and HR project details sit beside the always-visible overview from 1100px. The divider follows reading direction; smaller screens and the largest-text setting retain normal stacked flow. Japanese and Simplified Chinese now default to vertical editorial mode. Visitors can select Horizontal or Vertical in the language panel, and their saved choice takes precedence on refresh and language changes. Project titles, including Additional Systems, follow that setting on supported desktop widths. Navigation, controls, detail prose and PACE-RAG stay horizontal. This supersedes the earlier horizontal-default and independently vertical project-title descriptions above. See `verification/project-details-reading-v1.json` for current local evidence.


## PME v1.5 semantic artwork

Portfolio forests, rivers and accent words now use localized semantic vocabulary through the vendored NAAE Unicode adapter. The shared scene geometry remains independent of language; Arabic and Indic words use complete shaped runs, with optional native CJK vertical artwork. Opening and ending scenery share full-width masks, and river tributaries have stronger S bends.

The v1.5 specification restores horizontal Japanese/Chinese defaults, superseding the preceding default-setting description; saved visitor choices still take precedence. See [PME v1.5 implementation and maintenance](PME-V1.5-SEMANTIC-ART.md) and `verification/pme-v1.5-semantic-art.json` for architecture, synchronization, measured results and limitations. New translations remain machine-authored and require qualified review. No deployment is claimed.


## CJK vertical editorial presentation — 25 October 2026

Japanese and Simplified Chinese once again default to vertical editorial mode. This supersedes the horizontal-default choice documented for PME v1.5. Existing saved reading preferences remain authoritative: use the Language control, then Reading mode → Vertical, if Horizontal was previously saved.

The homepage retains its vertical section and project titles and adds a vertical experience motto and AI-evidence heading. Selected MMCATS Modern, multilingual-engineering, NAAE and PACE-RAG sections use a vertical heading column with a fine accent rule beside horizontal explanatory copy. The same treatment extends to No Two Mondays chapters, Work With Me problem cards, the Incident Zero introduction and the 404 heading. System Defence uses a vertical ready-screen title; its active HUD, controls and pause/report headings stay horizontal. Existing translations and semantic heading elements are reused; no prose or translation provenance is changed. The added columns apply from 1000px in vertical mode and revert to ordinary flow below that breakpoint or with Largest text. Other languages, navigation, notices, controls and English-only assistant content retain their normal horizontal presentation. Localized static documents include the registry writing-mode default before JavaScript runs, including the 404 document; explicit saved reading preferences still apply after hydration.

Local validation and screenshots are recorded in `verification/cjk-vertical-restore-v2.json` and `output/playwright/cjk-vertical-restore-v2/`. No deployment is part of this change.
