# PACE-RAG v1.3 native portfolio integration

Prepared on 19 October 2026. No deployment or push performed. Existing PACE/BAA/ASCII/technology changes are preserved.

The expandable “Ask about my engineering experience” section near About uses the existing assistant package, scoped exclusively to Professional Experience. It has three starter questions, custom search, one-paragraph answers with citations, related questions and graceful abstention. The disclosure lazy-loads code on interaction; MiniLM starts only for a custom query needing semantic retrieval. Live AI is disabled. Technical inspection links to the full Lab.

`vendor/pace-rag-portfolio-assistant-1.3.0.tgz` and `package-lock.json` pin code and matching verified assets. `scripts/pace-rag-assets.mjs` rejects preview, tampered, unlisted and foreign-corpus assets. The default build prepares the integration; `VITE_PACE_RAG_ENABLED=false` disables it. Generated `public/pace-rag` is ignored. No deployment workflow was introduced.

The measured raw main JS entry is **207,632 bytes**, versus 205,843 before integration, leaving 7,368 bytes below the 215,000 limit. The lazy assistant JS is 74,424 bytes raw (23,627 gzip). Model/runtime transfer is separate and query-triggered.

Build, lint and **117 Node tests passed**. Chromium and WebKit integration each passed four journeys and eight Largest-text light/dark layouts with zero assistant axe violations, overflow, page errors or inference requests. Existing navigation and accessibility checks also passed. Native disclosure/static source fallback and original canonical routes remain intact.

Content publication approval does not certify ranking or production behavior. Professional semantic Top-3 recall remains **79%**, below 90%; all 70 critical questions abstained across professional/implementation evaluation, with zero invalid citations or cross-corpus references. The separate 140 technology cases passed. The RAG development dependency audit retains 6 high/4 moderate findings; no clean audit, live provider/billing, physical-device or actual screen-reader verification is claimed.

The complete report and exact file inventory are in the sibling RAG repository: `docs/PACE-RAG-V1.3-PUBLIC-RELEASE.md`, `evaluation/reports/public-release-v1.3.json` and `docs/PUBLIC-RELEASE-FILES.json`. The adapter is mirrored under `pace-rag/integration/portfolio/files/`. Changes are prepared locally for review; hosted sites remain unchanged.
