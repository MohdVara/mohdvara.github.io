# Recruiter UX retest — v1

22 October 2026. Scripted simulations on the local production preview, not real recruiter participation. Baseline and candidate evidence remain separate from live publication claims.

| Scenario | Before | Candidate flow and expected/verified outcome | Evidence |
|---|---|---|---|
| Recruiter | Generic Explore engineering work CTA | Professional delivery → #work in one homepage action; commercial decision links, résumé and contact preserved. | home-390.png, home-1440.png; focused report; static tests |
| Principal engineer | Public evidence lower in the page with no direct overview shortcut | Independent engineering → #public-engineering in one homepage action, then MMCATS and its verification/sources actions. Blocked application status preserved. | independent-390/1440.png; mmcats-modern-*.png |
| Creative reviewer | NAAE discovered after scanning work | Independent engineering → NAAE → Compare artwork; reproduction/prototype status remains adjacent. | naae-*.png; existing case interaction QA |
| International frontend | Select Arabic, manually close panel, click English-original | Open + select Arabic, automatic close/summary focus, then immediate English-original pointer or keyboard activation. One manual dismissal removed. Query/fragment preserved. | before-popover.png; switches/dismissal in focused report |
| Consulting prospect | Work/service/contact links functional | Professional delivery → commercial decisions; existing Work with me inputs and booking/email alternatives remain. No submission. | journeys in focused report; work-with-me static routes |

All clicks exclude reading/scrolling; no measured human comprehension or conversion gain is asserted. The evidence shortcut replaces an existing link, so the home link count does not grow. Quick Reads replace one generic action with one to three relevant anchors; the separate duplicate contents row is removed on the three engineering pages.

Focused browser status: PASS. Full multilingual suite: PASS.

Final focused capture: 28 switches, 5 dismissal/failure scenarios, 64 layout/action records, 10 navigation records; 0 page errors. Four main-region axe samples have zero violations with incomplete contrast retained.

Existing full suite: 88 layouts, 9 additional scenarios, 11 English-only assistant/state checks.

Manual visual QA inspected desktop/mobile home, MMCATS action row and Arabic enlarged text. Native shaping and fluent terminology are not certified from screenshots. Browser screenshots use reduced motion; the portfolio artwork system and normal-motion design are unchanged. No booking/email destination was submitted.

Supplementary normal-motion acceptance run passed actual homepage → professional/independent paths → commercial decisions/MMCATS verification/NAAE comparison and Work with me inputs/contact alternatives. Whole-root homepage axe found no violations after the visible-name correction; aria-prohibited-attr and color-contrast remain incomplete for contextual review. `acceptance.json` records each clicked branch and `home-normal-motion.png` captures the final homepage.
