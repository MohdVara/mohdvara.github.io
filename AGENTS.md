# Portfolio localization policy

PACE-RAG Q&A in the About section is intentionally English-only. Translate its surrounding interface and availability notice, but never automatically translate its suggested questions, user questions, generated answers, or retrieved evidence.

- Keep all supported portfolio locales available, including Tamil after Arabic. Visitors do not need to switch the portfolio to English to use the assistant.
- Keep the Q&A region `lang="en"`, `dir="ltr"`, `translate="no"`, horizontal writing and left alignment. Localize surrounding descriptions, accessibility guidance and availability notices.
- Store conversational constants in `src/paceConversation.ts`, excluded by `scripts/i18n/exclusions.json`. Do not add conversation history, source excerpts or evidence to translation catalogs or providers. Keep ordinary feature descriptions synchronized.
- Preserve assistant component identity and conversation state when changing locale or writing mode. Never retranslate stored conversations.
- Reject only confidently non-English questions, with an English invitation to rephrase. Allow ambiguous input, names, acronyms, technical terms and mixed-script identifiers; never silently translate questions.
- Enforce English generation in PACE-RAG's server prompt and output validation, preserving evidence grounding, citations, uncertainty handling, safety and publication controls. The source package is in the sibling `../pace-rag` repository; update and package it rather than editing installed dependencies.
- Preserve source date precision in localized calendars: years stay years, months stay months; include Gregorian equivalents in brackets for alternate calendars. Open-ended period grammar must be localized.

## Permanent multilingual maintenance

English is the canonical source. Every visitor-facing content addition or edit must update translations for every registered non-English locale in the same task. The ten original locales plus explicitly requested Tamil are required; Tamil stays immediately after Arabic. Never remove a locale to match an older specification's count.

- Use `src/i18n/languages.json` as the central locale, direction, typography, writing-mode and calendar registry. Respect URL locale, saved preference, browser preference, then English fallback. Preserve route, query and fragment on language switches.
- Use explicit `text()`/`localizedContent()` for portfolio prose and accessibility labels. Preserve protected product/library/API/repository names, code, email addresses, paths, URLs, ASCII artwork and the PACE-RAG exception above. Do not send private visitor data or conversation content to translation providers.
- Keep conditional labels extractable: translate each literal branch (`condition ? text("A") : text("B")`), including canvas labels. Check both runtime states; catalog coverage alone cannot detect prose left partly in English.
- Run `npm run i18n:extract`, incremental translation sync (`npm run i18n:translate`, requiring configured credentials/model), `npm run i18n:validate`, and `npm run i18n:coverage -- --strict`. Preserve human-reviewed translations and update source hashes when content changes. If credentials are unavailable, complete translations using available authorized means, record accurate machine-translation provenance and report unresolved gaps; never call unreviewed text human-reviewed.
- Non-English pages must display the localized machine-translation notice and link to the English original. Keep all metadata, canonical/hreflang links, page titles, static localized routes and sitemap synchronized.
- Arabic uses horizontal RTL with artwork and portrait placed left, without mirroring glyphs or the face. Japanese/Chinese default to vertical editorial titles/text, with an optional horizontal mode and saved visitor preference; keep controls, navigation and interactive Q&A horizontal. Native name spelling/colors must match the Latin name treatment.
- The header plus hero must fit one viewport. Preserve readable text and reachable controls, using responsive layout and normal page scrolling when the viewport is short or text is enlarged. Do not create an internal hero scrollbar. Check Tamil shaping, caption wrapping, RTL placement, overflow and font fallbacks when modifying typography.
- Validate the production build with `npm run typecheck`, `npm run lint`, appropriate tests and `npm run build`. Run `scripts/i18n-qa.mjs` for changes affecting locale switching, layout, writing mode or PACE-RAG isolation. Refresh `docs/portfolio/PME-V1-*` coverage, audit and QA evidence honestly. Do not claim fluent editorial review, a deployed API change or a live deployment from local checks.

## TRANSLATION TRANSPARENCY POLICY

English is the canonical portfolio language.

Every non-English localized page must clearly disclose that its content is machine-translated from English and may contain errors, inaccuracies, or differences in meaning.

Maintain two disclosure mechanisms:
1. A clearly visible localized notice below the navigation, with the full disclaimer and a link to the equivalent original English content.
2. A compact localized translation-status indicator within the language selector. Use only the short “Machine translated from English” label there; do not duplicate the disclaimer paragraph.

Always provide direct access to the equivalent original English content. Treat this action as an explicit English preference while preserving route, query, fragment and application state.

Keep the primary notice available near the top. At the owner’s explicit request, use a native collapsible disclosure, compact by default, with the English-original link always visible. Do not persist its collapsed state or add dismissal storage or acknowledgement requirements. Do not claim human review without an actual review.

Maintain RTL compatibility for Arabic and horizontal notice presentation for Japanese/Chinese vertical editorial modes. Keep the notice static and accessible, without assertive live announcements or focus stealing.

Keep PACE-RAG Q&A English-only as established in PME v1.2. Its separate localized availability notice must remain; do not translate conversation content or change its retrieval/generation boundary for disclaimer work.

Any future changes to navigation, layout, localization, or translated content must preserve these requirements.

Portfolio artwork is script-adaptive. New or modified English semantic artwork content must be synchronized across all ten target locales. Preserve NAAE compatibility, PME v1.4 typography, RTL/TTB behavior, translation provenance, disclaimers, accessibility, and performance. Do not introduce hard-coded English-only decorative artwork without an explicit localization exception. See `docs/portfolio/PME-V1.5-SEMANTIC-ART.md` for pack, font and adapter maintenance.

For normal desktop resolutions, keep each editorial page’s opening hero and final section within the available viewport using readable responsive spacing and typography. Account for navigation and the visible compact translation disclosure in the opening frame. Do not add internal hero scroll containers or clip content to force a fit. Short screens, expanded notices and enlarged text must reflow with normal document scrolling.
