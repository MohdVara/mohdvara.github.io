# Portfolio audit and direction

## Before

The checkout serves a customized HTML template; React is still the unused Vite starter. package.json has a trailing comma and an invalid package name; deployment references build although Vite produces dist. No tests or Actions workflow exists. Stock carousel, icon fonts, jQuery/Bootstrap and scroll plugins overlap with React tooling. Content is hidden behind reveal scripts and multiple hero slides delay understanding.

Confirmed professional details in local HTML are limited to the name, public email, Sabah location and stated Principal positioning. Sample Cambridge jobs, stock design projects, percentage skill meters, invented-looking template counters, dead résumé buttons and dummy contact details make the site untrustworthy. The contact form has no functional backend. Blog links point to a missing page. Metadata lacks canonical, description, sharing image and structured data. The deployed site has a valuable illustrated portrait absent from this checkout.

## Sections

| Section | Decision | Reason |
|---|---|---|
| Dark palette, amber accent, portrait identity | KEEP / POLISH | Recognizable owner-specific identity; portrait restored from existing public site |
| Hero carousel | RESTRUCTURE | One immediately readable name, role, differentiator and two working CTAs |
| About | REWRITE | Professional narrative; omit birth date and street/postal detail |
| Résumé / experience | REWRITE | Replace template history with sourced selected roles; full hosted résumé is linked |
| Services | RESTRUCTURE | Group real engineering capabilities rather than generic design services |
| Skills | RESTRUCTURE | No arbitrary proficiency percentages or colorful badge wall |
| Projects | REWRITE | Three sourced systems; functions, contribution and outcomes, with native disclosure details |
| Template blog / counters / social placeholders | REMOVE from shipped site | No real evidence or destinations; archive preserves originals |
| Contact | REWRITE | Owner's public email and LinkedIn; remove nonfunctional form |

## Audience assessment

Recruiter: immediate name/Principal position, selected roles, visible résumé link. Hiring manager: concrete systems rather than a technology inventory. CTO: consolidation, integrations, operational workflows and deployment ownership. Founder/client: product and business context, end-to-end role, contact. Designer: retain portrait and warm amber with quieter typography, editorial spacing, restrained borders and no carousel.

## Design system

Warm charcoal / amber / off-white; system typography eliminates font-network cost. Clear large name, quieter role and restrained mono labels. 1180px content width, consistent section rhythm, desktop paired project panels and mobile single columns. Panels summarize system functions rather than simulate dashboards or fabricate screenshots. Native details/summary for progressive depth; native mobile disclosure menu, anchor navigation, visible focus and reduced-motion scrolling. No continuous animations, tracking or added runtime dependencies.

## Priorities and limits

The hosted résumé enables real case studies without invention. Published summaries intentionally omit unsupported project stacks, system scale and exact savings. The next evidence improvements are screenshots approved for public use, project-specific decisions/tradeoffs and measured business outcomes. Preserve the original template and assets in archive/template, excluded from the build and lint; this is reference material, not public portfolio content.
