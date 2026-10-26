# PME v1.6 calendar localization

Implemented locally on 26 October 2026. Cultural calendars remain the default. English Gregorian career/project dates remain authoritative. No runtime calendar API or astronomical dependency is used.

## Visitor behavior

The existing Language utility panel now contains Calendar display: Cultural calendar (Default) / Gregorian only, followed by the existing reading controls. All four added interface strings have translations in all ten target catalogs; metadata accurately records assistant machine translation. No human editorial review is claimed. Translation notices, English access and English-only PACE-RAG conversations remain intact.

`Experience` owns `calendarMode`; `changeCalendarMode` validates and saves `portfolio.calendar.v1` independently of locale, reading mode, theme and other preferences. Storage failures retain an in-memory choice; invalid values are ignored. No URL, analytics, reload or extra rail icon is involved. Mode changes rerender the existing component tree without keys/remounting. The existing imperative `text()` API reads a formatting adapter synchronized by Experience; direct formatter callers can pass an explicit mode.

Static HTML and first hydration always use cultural mode. Restoration waits for the existing `portfolio:ready` event, emitted by FirstFrame after the route content inside Suspense commits, then uses a transition. Applying the adapter earlier produced lazy-route hydration errors in browser testing; the route-ready gate fixes that failure. A saved preference may briefly show cultural static text before hydration finishes; content is never hidden or obstructed. There is no artificial timer or persistent flash. This adapter assumes the site's existing single Experience root, as the imperative locale adapter already does.

The native select has an associated label and explanatory description, keyboard access, existing visible-focus styles, and a minimum 44px height. Arabic keeps RTL; controls remain horizontal in CJK reading modes. Tamil largest-text mode permits wrapping long words at narrow widths.

## Policy matrix

“Native range” below means the host Intl/ICU implementation's range, **not** exhaustive independent verification of every date in that range. Unsupported native calendars are detected using resolvedOptions and fall back to localized Gregorian dates.

| Locale | Cultural default and implementation | Independently checked source/coverage | Cultural fallback | Gregorian-only |
|---|---|---|---|---|
| en | Gregorian, Intl | Gregorian validation/leap-year fixtures | Gregorian | Localized Gregorian |
| ms | Published Malaysian-context Hijri, compact Perak state calendar table | Perak Mufti 2026 publication; full civil 2026 table, boundary fixtures | Explicitly labelled calculated **tabular islamic-civil** approximation, with Gregorian reference; Gregorian if unsupported | Localized Gregorian |
| ar | Hijri, native islamic-umalqura, explicitly labelled أم القرى | Saudi official publication: 18 February 2026 = 1 Ramadan 1447; native range otherwise | Gregorian | Localized Gregorian, Arabic digits/grammar |
| ta | Distinct Tamil solar month-boundary table; no Saka conversion | Golden Chennai 108 monthly pages, **2018-01-01 through 2026-12-31**; 2026 April–December cross-check against Gnanananda; named years from Sringeri's published table | Explicit Tamil message that conversion is unverified, localized Gregorian date and original source reference | Localized Gregorian |
| ja | Japanese imperial, native japanese | Japanese government: Reiwa starts 1 May 2019; era/year interval fixtures | Gregorian | Localized Gregorian |
| zh-Hans | Chinese lunisolar, native chinese | HKO 2023 table: 22 January New Year; 22 March leap second month; native range otherwise | Gregorian | Localized Gregorian |
| es | Gregorian, Intl | Gregorian validation fixtures | Gregorian | Localized Gregorian |
| fr | Gregorian, Intl | Gregorian validation fixtures | Gregorian | Localized Gregorian |
| de | Gregorian, Intl | Gregorian validation fixtures | Gregorian | Localized Gregorian |
| pt-BR | Gregorian, Intl | Gregorian validation fixtures | Gregorian | Localized Gregorian |
| hi | Indian National Calendar (Saka), native indian | IMD National Calendar rule: 1 Chaitra is 22 March, or 21 March in Gregorian leap years; 2024/2025 fixtures | Gregorian | Localized Gregorian |

## Conversion conventions and limitations

The tables map Gregorian **civil dates**, not times of religious observance. Parsing and native formatting use UTC noon deterministically, independent of browser timezone or daylight saving time. These are date labels attached to historical portfolio records; the site does not infer sunset boundaries, time of birth, solar ingress instants or religious event times.

Malay uses the 2026 *published* Perak calendar, not a claim that every later national religious determination matches a prepublished schedule. The first Ramadan boundary differs from Umm al-Qura: 19 February 2026 in this Malaysian publication versus 18 February in the Saudi reference. Historical records outside the table use a conspicuously labelled calculated tabular approximation, not Saudi calculations described as official Malaysian dates. A whole source interval must fit the published coverage; otherwise the whole interval uses the labelled approximation. The religious-calendar policy reference is the Federal Territories Mufti's Falak FAQ.

Tamil follows the civil month labels published for Tamil Nadu/Chennai. Regional, temple, vakya/drik and sunrise conventions can disagree by a day; this is not a universal Tamil diaspora calendar. Only published day-one boundaries are retained, plus a December 2017 anchor derived from the published January 2018 day count. Month lengths and order are checked. Several daily entries in the publisher's historical pages contain typos; arbitrary daily rows and their inconsistent year-name labels are **not** copied into conversion data. Year names are separately transcribed from the Sringeri sixty-year table for 2017–2026, with no extrapolation. The April 2026 transition is Panguni 30 / Visvavasu on 13 April to Chithirai 1 / Parabhava on 14 April. The independent Gnanananda PDF itself has some weekday typos, so this implementation does not adopt its weekday column.

**Incomplete historical coverage:** Tamil 2013, 2016 and 2017 records currently fall back explicitly to Gregorian. All dated canonical records from 2018 through 2026 are covered. Unsupported 2027+ records also fall back. This is a deliberate limitation, not a claim that the requested historical conversion coverage is complete. Expanding the table requires verified source pages and a conversion revision increment; never extrapolate a fixed mid-month rule. Native year names and Tamil spelling still need qualified editorial review.

Arabic is a language, not a country: the configured calculation does not claim universal official religious authority. Arabic Gregorian reference brackets are isolated with Unicode LTR isolates. Hindi is specifically Indian National/Saka, distinct from Tamil solar and Vikram Samvat. Japanese year-only intervals include both Heisei and Reiwa in 2019. Chinese year/month intervals preserve year boundaries, cyclical-year labels and leap-month distinctions from Intl; ICU output details can differ between platforms.

## Precision, validation and integration

`formatting.ts` validates exact YYYY / YYYY-MM / YYYY-MM-DD shapes and rejects impossible Gregorian dates and mismatched precision. Invalid inputs are returned unchanged, never rolled into another date. Years before 0100 are outside this parser's supported input range (portfolio sources are modern).

A month/year is an interval. Start/end dates are inspected internally, while only year or month precision is displayed. Equal endpoints collapse; differing cultural endpoints display a range. All non-Gregorian results retain the original Gregorian reference; no canonical content is overwritten. Gregorian mode preserves translated surrounding prose and uses localized Gregorian dates for period templates. Existing since/onward/open/closed period grammar is retained. Versions, identifiers, undated fragments and statistics are not inferred as dates.

`config.tsx` is the sole production caller of `withCalendarDates`; referenceDate/localizedPeriod/calendarDate are internal formatting helpers. Existing text/localizedContent callers therefore update through the existing Experience render. Direct formatting tests and the date-audit script pass the mode explicitly. Cache keys include locale, source, precision, display mode and both dataset revisions.

Data is small and bundled synchronously to avoid delayed date replacements: 109 Tamil month anchors and 13 Malaysian month anchors. No heavyweight library, performance-budget increase, optional external download, or visitor data transfer was added.

## Sources and reproducibility

Access date for references: **26 October 2026**. The full Tamil source URL/hash inventory is in [PME-V1.6-CALENDAR-SOURCES.json](PME-V1.6-CALENDAR-SOURCES.json). The source data resides in `src/i18n/tamilSolar.json` and `src/i18n/malaysianHijri.json`.

- [Federal Territories Mufti: Falak FAQ](https://muftiwp.gov.my/en/unit-falak2/149-soalan-soalan-lazim-falak).
- [Perak Mufti: 2026 Zone 1 published calendar](https://mufti.perak.gov.my/images/waktu_solat/2026/Zon%201%202026.pdf), Gregorian/Hijri columns on pages 3–14. Source civil month starts are transcribed, not generated from Intl.
- [Gnanananda: 2026–2027 Panchangam](https://gnanananda.org/wp-content/uploads/2026/03/panchangam26_27.pdf), April–December 2026 Tamil month starts.
- [Sringeri: 2019–2020 Tamil Panchangam](https://www.sringeri.net/assets/documents/panchangam/tamil_panchangam_2019_2020_vikari_samvatsara.pdf), page 54, published sixty-year name table.
- [Saudi official gazette: Ramadan 1447 announcement](https://www.uqn.gov.sa/news/4000353).
- [Japanese government: Reiwa effective date](https://japan.kantei.go.jp/98_abe/actions/201904/_00015.html).
- [HKO: 2023 Gregorian–lunar conversion table](https://my.weather.gov.hk/en/gts/time/calendar/pdf/files/2023e.pdf).
- [India Meteorological Department: National Calendar explanation](https://packolkata.imd.gov.in/panchang/en/explanation).

To recheck retained Tamil boundaries and original page hashes, download the 108 manifest URLs as YYYY-MM.html into a reference directory and run `python3 scripts/i18n/import-tamil-boundaries.py /path/to/reference-directory`. Unsupported archive URLs can redirect to the current calendar; the script checks the page title and exact row count to reject those responses. Source updates require review, not automatic trust in an unchanged URL. No original third-party publications are shipped in the website.

The generated `PME-V1-DATE-AUDIT.json` now exercises all **22 locale/mode** combinations through the same formatter loader as tests. `tests/calendar.test.mjs` uses independently published expected boundaries instead of snapshots generated by its converter. `scripts/calendar-qa.mjs` checks preference, hydration and responsive behavior; `scripts/i18n-qa.mjs` remains the existing broad regression harness. Actual verification results and remaining limits are recorded in the accompanying verification report.

## Verification results

The final [generated verification report](PME-V1.6-CALENDAR-QA.json) combines actual test output and both browser harness reports. Typecheck, lint, extraction, validation, strict coverage, date audit, production build and npm test passed. All 220 tests passed, with zero failures/skips. Catalog coverage is 1578 units per locale, with zero missing/stale entries. Validation reports 97 editorial warnings and zero errors; machine translations remain unreviewed.

The calendar browser harness passed 22 locale/mode configurations, 76 layout checks and 14 persistence/storage scenarios with zero errors. It exercised all eleven locales, 320/390/768/1440px, Arabic RTL, Tamil shaping, CJK reading modes, largest text in Arabic/Tamil/Japanese/Chinese, both themes and reduced motion. English native keyboard selection and settings focus restoration passed. Refresh and lazy case-study hydration, navigation, browser history, invalid persisted settings and throwing storage were covered. The existing i18n harness passed 88 layouts (eleven locales at eight widths), nine additional scenarios, eleven date-period checks and eleven assistant-isolation checks; no browser errors, missing source units or runtime translation requests were recorded. Screenshots were inspected for Tamil and Arabic settings. Browser checks used Chrome; no Safari/Firefox/native-speaker certification is claimed.

Early failures were resolved rather than hidden: lazy-route hydration required the route-ready gate; narrow Tamil largest text required word wrapping; the public asset audit rejected a stray Finder metadata file, which was preserved at `/tmp/pme-images-DS_Store`; SWC's native cache required running the build outside the filesystem sandbox. The remote translation provider had no configured credentials/model, so new text was supplied by the assistant with accurate machine provenance. The direct incremental translation plan now reports zero pending units in every target locale.

## Changed files and repository state

Implementation: `src/UtilityPanel.tsx`; `src/i18n/Experience.tsx`, `context.ts`, `config.tsx`, `controls.tsx`, `formatting.ts`, `calendarConversion.ts`, `languages.json`, `i18n.css`, `tamilSolar.json`, `malaysianHijri.json`; all eleven `src/i18n/locales/*.json` catalogs; generated `src/i18n/status.json`.

Pipeline/tests: `scripts/calendar-qa.mjs`; `scripts/i18n/date-audit.mjs`, `load-formatting.mjs`, `import-tamil-boundaries.py`, `metadata.json`, `source-locations.json`; `tests/calendar.test.mjs`, `tests/i18n.test.mjs`.

Documentation/evidence: `PME-V1.6-CALENDAR.md`, `PME-V1.6-CALENDAR-SOURCES.json`, `PME-V1.6-CALENDAR-QA.json`, refreshed `PME-V1-COVERAGE.json` and `PME-V1-DATE-AUDIT.json`.

At the implementation verification checkpoint, all changes were local and uncommitted; no push, publication or deployment had occurred. The owner subsequently authorized organizing these changes into commits and pushing to origin. The pre-existing edit to `PORTFOLIO_CASE_STUDY_EXPANSION.md` and pre-existing untracked `.playwright-cli` snapshots were preserved. The build's unrelated GitHub verification timestamp refresh was removed from the working changes. A full `git diff --check` still flags pre-existing whitespace in that unrelated document; the feature's own diff passes.
