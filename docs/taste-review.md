# Taste review: personal portfolio

Reviewed 6 October 2026 against the latest local production preview at http://127.0.0.1:4173/. This is an audit, not an implemented redesign. Website source, dependencies, and deployment were not changed by this review.

## Method and design read

Applied the official [Taste skill](https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/SKILL.md), especially its redesign protocol, content-density guidance, and pre-flight criteria, with the companion [redesign audit](https://github.com/Leonxlnx/taste-skill/blob/main/skills/redesign-skill/SKILL.md). Public instructions were read directly; no global skill installation was performed.

Reading this as a developer portfolio for recruiters and technical clients, with a restrained dark-and-amber visual language. Mode: preserve and refine. Current dial reading: DESIGN_VARIANCE 5, MOTION_INTENSITY 2, VISUAL_DENSITY 4. Recommended direction: variance 6, motion 3, density 4. Native CSS and the existing React/Vite architecture are suitable; no framework or styling-library migration is warranted.

Evidence: read App.tsx, content.ts, App.css, index.css, package.json, and existing validation records; reloaded the production preview; inspected desktop and mobile rendering in Chrome. Desktop DOM reported 1435 x 584; mobile override was 375 x 812. Measurements are viewport-specific observations, not field analytics. Temporary viewport override was reset afterwards.

## Preserve

- The illustrated portrait and owner-requested `mpv` wordmark: the clearest personal identity on the page.
- Warm charcoal, off-white, and amber; strong readable contrast and restrained surfaces.
- Four factual project cases, with classroom/meeting and HR work at Centre for Content Creation prominent. Campus modernization stays a brief experience mention.
- Stable navigation labels, anchor IDs, canonical domain, metadata, and social card.
- Native case disclosures, keyboard navigation, visible focus, reduced-motion support, and static content without JavaScript.
- Lightweight architecture. Previous checks recorded no overflow or axe violations across seven widths; earlier Lighthouse results are a baseline, not newly measured results from this audit.

## Prioritized improvements

| Priority | Finding and evidence | Proposed improvement | Why it matters |
|---|---|---|---|
| High | Four project panels use the same numbered, boxed function lists. They summarize features, but do not show the actual product or an engineering decision. On mobile each panel precedes the title and outcome. | Give the meeting/classroom case a distinctive lead treatment. Use an approved real screenshot where available, or a clearly labeled conceptual diagram based on documented integrations. Use compact editorial summaries for the other cases. Put project title, contribution, and outcome before supporting visuals on mobile. | Visitors see the work and its relevance sooner, with stronger technical credibility. |
| High | Main hero buttons start at approximately y=594 and end at y=644 in the 584px-high desktop viewport. The header is 91px high. Hero contains location, name, two role lines, description, two buttons, social links, and portrait caption. | Reduce normal desktop header height toward 72px while retaining text-enlargement reflow. Keep name, primary role, one concise positioning sentence, and the two useful CTAs together. Move secondary roles/social links into supporting areas. | The primary action becomes visible on shorter laptop windows; the first impression is easier to scan. |
| High | Six uppercase eyebrows across seven main sections, five numbered section headings, project numbering, repeated row numbers, decorative dots, and `01 / PROFILE` on the portrait. | Remove section numbers, row numbers, decorative dots, and the profile index. Use plain section headings, retaining only a small number of labels that add information. | Taste specifically flags repeated micro-labels and decoration. Removing them makes the existing identity feel more deliberate. |
| Medium | All four cases use the same left-panel/right-copy composition. Closed work section measures about 2189px on desktop and 3665px on mobile; entire mobile document is about 9041px. | One featured Centre for Content Creation case, followed by a more compact supporting-project layout. Preserve all four projects and native engineering disclosures; shorten redundant summaries/results. | Creates visual rhythm and reduces scanning effort without hiding the owner's project breadth. |
| Medium | Avenir/Segoe/system fallbacks make typography depend on the visitor's OS. Project metadata is 0.6-0.65rem, capability tools 0.7rem, and several labels 0.6rem. | Consider one licensed, self-hosted variable sans font with a matching fallback and reserved metrics. Raise important metadata/tool text toward 0.8-0.875rem, and reserve mono for genuinely technical content. | A consistent type voice and more legible detail are higher-value changes than decorative effects. System fonts remain a valid performance choice if preferred. |
| Medium | Headings such as “Systems behind the software”, “Ownership at every level”, and “Across the stack. Beyond the code.” repeat broad positioning. Role history and About repeat modernization/leadership claims. | Use direct headings and make each section contribute distinct information: work demonstrates delivery, experience establishes responsibility, capabilities describe strengths, About explains approach and teaching. | Recruiters learn more with less reading. |
| Low | Hover/focus states exist, but buttons have no pressed state; summary icons rotate instantly. Navigation has no scroll-aware current-section indication. | Add restrained pressed feedback and short disclosure-icon transitions, honoring reduced motion. Optionally use IntersectionObserver for current-section navigation styling. | Makes the interface feel complete without adding animation dependencies or continuous effects. |

## Suggested first pass

1. Simplify hero and reduce the normal header height. Verify both buttons at typical short laptop heights, without shrinking text or compromising enlarged-text reflow.
2. Remove decorative numbering and repeated eyebrows. Preserve the `mpv` mark, portrait, navigation labels, and anchor targets.
3. Recompose selected work around a featured classroom/meeting case and three supporting cases. Keep the HR case recognizable as Centre for Content Creation work.
4. Improve project metadata and capabilities text size, then evaluate whether a self-hosted display font offers enough improvement to justify its cost.
5. Polish press/disclosure feedback and rerun existing responsive, keyboard, static-content, and accessibility checks.

A possible shorter positioning sentence, using existing facts: “I build classroom tools, business systems, and integrations, and lead teams through legacy modernization.” This is a proposed edit, not published copy.

## Evidence needed from the owner

Approved screenshots and one concrete engineering decision per case would offer the greatest improvement. For meeting tools, a real example of attendance tracking or recordings would be useful. For HR, a configurable leave or company-structure workflow would clarify the product. Do not invent impact metrics, user counts, project stacks, or customer endorsements. Generated product screenshots would not constitute evidence of these real systems.

## Applying Taste with context

This review does not treat every rule as a requirement to add features. Loading/error/empty states are not applicable to a static portfolio without fetching or forms. New consent UI, legal pages, testimonials, dashboards, stock imagery, and animation libraries are not justified by the current request. Theme support is a possible future preference feature, not the first design priority for the established dark identity. Taste's strict dash and separator rules are stylistic findings, not accessibility defects. The function panels are not literal counterfeit screenshots, but their repeated boxes and status-like dots still offer less value than actual evidence or clear editorial presentation.

The site's foundation is sound. Its next improvement should make the work more tangible and the page more concise, while retaining the owner-specific identity.
