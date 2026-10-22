# Localization case-study notes

22 October 2026. Eleven registered locales remain: en, ms, ar, ta, ja, zh-Hans, es, fr, de, pt-BR, hi. Tamil remains immediately after Arabic. Arabic is horizontal RTL; other locales are LTR. Japanese/Chinese retain optional editorial vertical typography while controls stay horizontal.

## Architecture and content maintenance

The existing i18next/React integration, `languages.json`, `text()`, locale resolution, source catalogs and provenance metadata remain the only localization system. New data fields `decision`, `focus` and `status` were added to existing AST extraction. Canonical metadata is extracted from its normal array values. No second translation provider or runtime translation service was introduced.

The task adds **140 canonical units** to the initial 1,315-unit catalog: **1,455 units per locale**, with zero missing or stale units in all ten non-English catalogs. These include shared labels, six independent summaries, status disclosure for commercial cases, page content, navigation, metadata, artwork provenance and accessibility text. Protected project names, code, directions, versions and ASCII artwork are deliberately preserved.

At the owner's request, translations were generated directly by the coding assistant without provider credentials. Entries are marked `machine_translated`, provider `coding-assistant`, method `direct-generation`, with canonical SHA-256 source hashes. `session-model` records session provenance rather than inventing an API model identifier. No entry is called human-reviewed. Existing translations outside this task's additions were preserved; an obsolete newly introduced v0.2 caption was replaced with the accurate reproduction label.

`i18n:extract`, validation, strict coverage and date audit passed. Validation reports **0 errors / 98 editorial warnings** across the entire catalogs. Warnings and fluent terminology review remain explicit follow-up, not a claim of translation quality.

## Disclosure, routes and professional Q&A

Every non-English route retains the localized native translation disclosure near navigation and the compact selector status. Its always-visible English-original action targets the matching `/en/<case-study>/` route and preserves query/fragment through the existing context. Canonical URLs remain locale-specific; reciprocal hreflang plus x-default connect equivalent static pages. New routes appear in the sitemap.

PACE-RAG questions, approved answers, citations and evidence were not translated. Its English `lang`, LTR `dir`, `translate=no`, horizontal presentation and state-preserving locale switch remain intact. The existing browser QA passed English-only guards and state preservation for all eleven locales; no PACE-RAG source package or backend was changed.

The direction demonstration switches between English LTR, Arabic RTL and horizontal Japanese using a bounded portfolio navigation sample. Technical identifiers use bidi isolation. The existing Japanese writing preference was also exercised: the demo controls remain horizontal in vertical mode.

## Regression found during visual QA

A conditional expression inside `text()` originally hid two new eyebrow strings from AST extraction. These were changed to explicit calls and translated in all ten target catalogs. Static regression checks now require the localized eyebrow on every non-English new route. The Arabic value `الموقع المهني بوصفه منتجًا هندسيًا` was verified on both port 5174 and the production preview, with screenshots. Complete catalog coverage is not by itself proof that every JSX expression was extracted; rendered checks remain necessary.

## QA scope

New cases: 33 localized routes; 72 layouts at widths 320, 390, 768, 1280, 1920 and 3840 for en/ar/ta/ja; 24 main-region light/dark axe scans, zero violations. Axe left contrast checks over the existing artwork-backed opening region incomplete; this is not universal contrast or screen-reader certification. Desktop, mobile, Arabic and artwork-detail screenshots were visually inspected.

Existing `scripts/i18n-qa.mjs`: 88 homepage layout checks across eleven locales, nine switching/history/fallback scenarios, no page errors, no runtime translation requests, no missing rendered source units, plus English-only assistant checks. No physical devices, actual screen readers or fluent editorial review were used.
