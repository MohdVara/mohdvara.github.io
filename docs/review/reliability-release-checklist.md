# Reliability and conversion release checklist — 8 October 2026

This is a prepared local release, not a deployed change.

## Artifact identity

- Base commit: `b5a203e136fcad5b936f311941d9ff0d0cffb…` (working-tree changes are additional).
- Homepage bundle: `index-DlK9EzvC.js` — 204,980 bytes; Vite gzip 63.60 kB.
- Lazy engine: `PortfolioGame-DO2-KZRZ.js` — 1,197,779 bytes; Vite gzip 319.07 kB.
- `dist/index.html` SHA-256: `2d0368813a6676dc351373be3cf4b54282ae83d285655399f38970a58d579265`.
- Rebuilds refresh public GitHub verification timestamps and may change the artifact hash. Record a fresh commit, working-tree status and SHA-256 before release. Do not identify this uncommitted build using the base commit alone.

## Before an authorised preview/release

- [ ] Review local diff and record final revision; retain the established static architecture and lazy engine boundary.
- [ ] Run `npm run lint`, `npm run build`, then `npm test`; record all results.
- [ ] Confirm `wrangler.toml`: Pages project `mohdvara-portfolio`, output `./dist`. No Workers migration, DNS change or blanket SPA rewrite is required.
- [ ] Deploy only after explicit owner authorisation. No deployment was performed during this pass.

## On the authorised Cloudflare preview URL

- [ ] Open and refresh `/`, `/work-with-me/`, `/incident-zero/`, `/incident-zero/defence/` directly.
- [ ] Check an arbitrary root and nested missing URL: real HTTP 404, useful HTML, `noindex, follow`, no misleading homepage canonical. Cloudflare Pages uses root `404.html`: https://developers.cloudflare.com/pages/configuration/serving-pages/ . Local Wrangler Pages returned 404; Vite preview alone returns an SPA fallback and is not a status-code proof.
- [ ] Check `/#case-campus`, `/#case-insurance`, `/#case-rental`, `/#case-meetings`, `/#case-hr` after direct navigation and refresh.
- [ ] Confirm titles, descriptions, Open Graph/Twitter descriptions and canonical URLs. Arcade remains indexable and is included in sitemap; 404 is excluded. `robots.txt` allows the public routes.
- [ ] Confirm the new build identifier/hash rather than assuming the CDN is current.
- [ ] Check both résumé links: `https://rxresu.me/mwara95/2-page-resume` and `https://rxresu.me/mwara95/curriculum-vitae`. The public homepage already matched these on 8 October; the earlier mismatch is stale.
- [ ] Open `https://cal.com/mohd-paramasvara/discovery` and email link; do not submit/book a meeting. Do not hard-code a duration unless maintained deliberately.
- [ ] Abort each lazy route chunk, verify recovery heading and keyboard focus, remove the interception and select Retry. No automatic retry loop.
- [ ] Disable JavaScript: portfolio, engagement and game introduction content remain readable; games themselves require JavaScript.
- [ ] Check desktop and mobile, both themes, reduced and normal motion, keyboard focus, enquiry journey and résumé spacing.

## Physical-device protocol (not completed in desktop emulation)

- [ ] On an actual iPhone/Safari and Android/Chrome, record model, OS, browser, viewport, refresh rate and thermal/battery state.
- [ ] At 320/390/430 CSS px where available and short landscape, identify diamond Flood, triangle Probe, player, amber attack warning and terminal without zooming. The in-canvas text remains small; the external legend is the readable reference.
- [ ] Hold movement plus FIRE simultaneously, release each independently, cancel touch, rotate, background/foreground and pause/resume. Confirm no stuck input or accidental selection.
- [ ] Play through a dense later floor. Record seed, level, active enemies, visible hitch and timestamp. Reproduce the same seed twice; do not infer a device-wide FPS claim from desktop emulation.
- [ ] For an owner-reported hitch, capture the existing development diagnostics (start/stop/capture), identify pause/loading boundaries and correlate frame, simulation, pathfinding and render timings. No renderer changes or fresh performance improvement claim were made in this pass.

## Conditional PDF follow-up

- [ ] Obtain the current official export; inspect every page for clipping, dates, links, content consistency and layout.
- [ ] Obtain owner approval for the exact local asset, then configure `profile.resumePdf` consistently if desired. Keep both hosted formats.
- [ ] No PDF is bundled in this release. Current download automation timed out; the older four-page overlap finding does not establish a defect in the present export.
