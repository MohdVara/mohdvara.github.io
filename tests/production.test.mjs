import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access, stat } from "node:fs/promises";
import { join } from "node:path";
const html = await readFile("dist/index.html", "utf8");

test("production delivers real content without client-side JavaScript", () => {
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
  assert.match(html, /<main/);
  assert.match(html, /Principal Full-Stack Engineer/);
  assert.match(html, /Minute-by-minute attendance tracking/);
  assert.match(html, /Human Resource Management System/);
  assert.doesNotMatch(
    html,
    /app-html|Vite \+ React|Cambridge|Duden|info@yoursite|single\.html/,
  );
});
test("all fragment links have unique targets", () => {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g))
    assert.ok(ids.includes(id), `Missing target: ${id}`);
  assert.doesNotMatch(html, /href="#"/);
});
test("all shipped HTML asset paths exist and are lightweight", async () => {
  const paths = [...html.matchAll(/(?:src|href)="(\/[^"#]+)"/g)].map(
    (match) => match[1],
  );
  for (const path of paths) await access(join("dist", path));
  assert.ok((await stat("dist/images/portrait.webp")).size < 100_000);
  for (const [, path] of html.matchAll(/src="(\/assets\/[^" ]+\.js)"/g))
    // Reviewed source-grounded flagship and engagement copy adds ~4.5KB.
    // Keep a tight homepage-only budget; the Phaser runtime stays lazy.
    assert.ok((await stat(join("dist", path))).size < 205_000);
});
test("metadata, schema and domain agree", async () => {
  assert.match(
    html,
    /rel="canonical" href="https:\/\/mohd\.paramasvara\.online\/"/,
  );
  const schema = JSON.parse(
    html.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1],
  );
  assert.equal(schema["@graph"][0].name, "Mohd. Paramasvara");
  assert.ok(
    schema["@graph"][0].sameAs.includes(
      "https://www.linkedin.com/in/mohdvara/",
    ),
  );
  assert.equal(
    (await readFile("dist/CNAME", "utf8")).trim(),
    "mohd.paramasvara.online",
  );
  assert.match(
    await readFile("dist/sitemap.xml", "utf8"),
    /https:\/\/mohd\.paramasvara\.online\//,
  );
  await access("dist/og-image.png");
});

test('Work With Me is a real static page with distinct metadata and functioning native links', async () => {
  const page = await readFile('dist/work-with-me/index.html', 'utf8');
  assert.equal((page.match(/<h1[\s>]/g) || []).length, 1);
  assert.match(page, /Complex systems/);
  assert.match(page, /Architecture review &amp; technical diagnosis/);
  assert.match(page, /href="https:\/\/cal.com\/mohd-paramasvara\/discovery"/);
  assert.match(page, /href="mailto:mohd@paramasvara.online"/);
  assert.match(page, /rel="canonical" href="https:\/\/mohd.paramasvara.online\/work-with-me\/"/);
  assert.match(page, /<title>Work with Mohd/);
  assert.doesNotMatch(page, /20-minute|Only \d+ slots|app-html/);
  const ids = [...page.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const [, id] of page.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(id), `Missing commercial-page target ${id}`);
  for (const [, id] of page.matchAll(/href="\/#([^"]+)"/g)) assert.match(html, new RegExp(`id="${id}"`));
  const schema = JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1]);
  assert.ok(schema['@graph'].some(item => item['@type'] === 'Person'));
  assert.ok(schema['@graph'].some(item => item['@type'] === 'WebPage' && item.url.endsWith('/work-with-me/')));
  assert.match(await readFile('dist/sitemap.xml','utf8'), /work-with-me\//);
});

test('Incident Zero ships static route content and no eager game-engine preload on the homepage', async () => {
  const page=await readFile('dist/incident-zero/index.html','utf8');
  assert.match(page,/<title>Incident Zero/);
  assert.match(page,/Payroll closes tomorrow/);
  assert.match(page,/all incident data is synthetic/i);
  assert.match(page,/rel="canonical" href="https:\/\/mohd.paramasvara.online\/incident-zero\/"/);
  assert.match(page,/href="\/#contact"/);
  const routeCss=page.match(/href="(\/assets\/IncidentZeroRoute-[^"]+\.css)"/);
  assert.ok(routeCss,'Static incident landing requires its route stylesheet');
  await access(join('dist',routeCss[1]));
  assert.doesNotMatch(page,/app-html/);
  assert.match(html,/href="\/incident-zero\/"/);
  assert.doesNotMatch(html,/<link[^>]+(?:GameShell|game-|IncidentZeroRoute)/);
  assert.match(await readFile('dist/sitemap.xml','utf8'),/incident-zero\//);
});

test('System Defence ships its own static route and stays optional and lazy on portfolio/story entry', async () => {
  const arcade = await readFile('dist/incident-zero/defence/index.html', 'utf8');
  assert.match(arcade, /Defend the edge/);
  assert.match(arcade, /LEVEL/);
  assert.match(arcade, /\/ 05/);
  assert.match(arcade, /Start run/);
  assert.match(arcade, /https:\/\/mohd\.paramasvara\.online\/incident-zero\/defence\//);
  const opening = await readFile('dist/incident-zero/index.html', 'utf8');
  assert.match(opening, /System Defence — arcade prototype/);
  assert.match(opening, /Protect the system from malicious requests/);
  const home = await readFile('dist/index.html', 'utf8');
  assert.doesNotMatch(home, /DefenceRoute|renderer-|phaser-|PortfolioGame-/);
});

 test('missing-page and arcade discovery metadata are consistent', async () => {
 const missing = await readFile('dist/404.html', 'utf8');
 assert.match(missing, /This page could not be found/);
 assert.match(missing, /name="robots" content="noindex, follow"/);
 assert.doesNotMatch(missing, /rel="canonical"/);
 const arcade = await readFile('dist/incident-zero/defence/index.html', 'utf8');
 for (const name of ['description', 'og:description', 'twitter:description']) {
   assert.match(arcade, new RegExp(`${name}"\\s+content="[^"]*Five generated levels, two defensive tools`));
 }
 assert.match(await readFile('dist/sitemap.xml', 'utf8'), /https:\/\/mohd.paramasvara.online\/incident-zero\/defence\//);
 });
