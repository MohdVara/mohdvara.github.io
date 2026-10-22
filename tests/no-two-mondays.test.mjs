import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { join } from 'node:path';

test('No Two Mondays case study serves complete static content, metadata and accessible diagrams', async () => {
  const page = await readFile('dist/no-two-mondays/index.html', 'utf8');
  const home = await readFile('dist/index.html', 'utf8');
  assert.equal((page.match(/<h1[\s>]/g) || []).length, 1);
  assert.match(page, /<h1>Engineering No Two Mondays:/);
  const summary = page.match(/<section[^>]+id="ntm-summary"[\s\S]+?<\/section>/)?.[0];
  assert.ok(summary, 'Recruiters can read the executive summary without JavaScript');
  assert.match(summary, /Engineering at a Glance/);
  for (const label of ['Challenge', 'Role', 'Architecture', 'Engineering decisions', 'Verification', 'Limitations']) {
    assert.ok(summary.includes(`<dt>${label}</dt>`), `Missing summary topic: ${label}`);
  }
  assert.match(summary, /15 October 2026/);
  assert.match(summary, /0\.3\.0-rc\.1 \/ monday-8/);
  assert.match(summary, /two campaign target gaps remained/);
  assert.match(summary, /not current game-wide totals/);
  assert.match(page, /<nav[^>]+aria-label="Case study contents"[^>]*>[\s\S]+?href="#ntm-summary"[\s\S]+?href="#ntm-evidence"[\s\S]+?<\/nav>/);
  assert.match(page, /210/);
  assert.match(page, /112,402/);
  assert.match(page, /Known witness, unverified in this campaign/);
  assert.match(page, /Handling instructions/);
  assert.match(page, /Personal effects/);
  assert.match(page, /An inconvenient agenda/);
  assert.match(page, /Tags overlap/);
  assert.equal((page.match(/Diagram 0[1-4]/g) || []).length, 4);
  assert.doesNotMatch(page, /app-html|<canvas|<iframe/);
  assert.match(page, /rel="canonical" href="https:\/\/mohd.paramasvara.online\/no-two-mondays\/"/);
  assert.match(page, /<title>Engineering No Two Mondays: An Extensible Simulation with AI/);
  const ids = [...page.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const [, id] of page.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(id), `Missing case-study target ${id}`);
  for (const [, id] of page.matchAll(/href="\/#([^"]+)"/g)) assert.match(home, new RegExp(`id="${id}"`));
  const css = page.match(/href="(\/assets\/NoTwoMondaysCaseStudy-[^"]+\.css)"/);
  assert.ok(css, 'Route CSS must work without JavaScript');
  await access(join('dist', css[1]));
  await access('dist/images/no-two-mondays/office.jpg');
  for (const [, image] of page.matchAll(/<img[^>]+src="(\/images\/[^\"]+)"/g)) await access(join('dist', image));
  assert.match(home, /href="\/en\/no-two-mondays\/"/);
  assert.doesNotMatch(home, /NoTwoMondaysCaseStudy-/);
  const schema = JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1]);
  assert.ok(schema['@graph'].some(item => item['@type'] === 'WebPage' && item.url.endsWith('/no-two-mondays/')));
  assert.match(await readFile('dist/sitemap.xml', 'utf8'), /no-two-mondays\//);
});

test('case study contains no private report links or outcome identifiers', async () => {
  const page = await readFile('dist/no-two-mondays/index.html', 'utf8');
  assert.doesNotMatch(page, /(?:href|src)="[^"]*(?:reports\/|\.codex|discoveries\/|checkpoint|prompts\.json)/);
  assert.doesNotMatch(page, /production_interrupts|chain_of_custody|things_we_keep|IT[’']S NOT YOU, IT[’']S PRODUCTION|CURIOSITY KILLED THE CAREER|THE THINGS WE KEEP/);
});

test('public crawl histogram reconciles with newly executed campaign runs and excludes unverified targets', async () => {
  const summary = JSON.parse(await readFile('src/data/ntm-crawl-summary.json', 'utf8'));
  assert.equal(summary.completedRuns, 112402);
  assert.equal(summary.distribution.reduce((total, row) => total + row.runs, 0), summary.completedRuns);
  assert.equal(summary.distribution.length, 44);
  assert.equal(new Set(summary.distribution.map(row => row.title)).size, 44);
  assert.ok(summary.distribution.every(row => Number.isInteger(row.runs) && row.runs > 0));
  assert.ok(summary.distribution.every(row => Object.keys(row).sort().join(',') === 'runs,title'));
  assert.ok(!summary.distribution.some(row => row.title === 'An inconvenient agenda'));
  const page = await readFile('dist/no-two-mondays/index.html', 'utf8');
  assert.match(page, /112,402 unique, verified completed-run receipts/);
  assert.match(page, /40 reused baseline successes are excluded/);
});
