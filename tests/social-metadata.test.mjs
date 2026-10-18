import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const origin = 'https://mohd.paramasvara.online';
const routes = [
  ['work-with-me', 'work-with-me.png'],
  ['no-two-mondays', 'no-two-mondays.png'],
  ['incident-zero', 'incident-zero.png'],
  ['incident-zero/defence', 'incident-zero.png'],
];

function meta(html, name) {
  return html.match(new RegExp(`<meta\\s+(?:property|name)="${name}"\\s+content="([^"]*)"`))?.[1];
}

test('built route social cards use owned, correctly sized lightweight images and accurate alt descriptions', async () => {
  for (const [route, image] of routes) {
    const html = await readFile(`dist/${route}/index.html`, 'utf8');
    const imageUrl = `${origin}/images/social/${image}`;
    assert.equal(meta(html, 'og:image'), imageUrl, route);
    assert.equal(meta(html, 'twitter:image'), imageUrl, route);
    assert.equal(meta(html, 'twitter:card'), 'summary_large_image', route);
    assert.equal(meta(html, 'og:image:width'), '1200', route);
    assert.equal(meta(html, 'og:image:height'), '630', route);
    assert.match(meta(html, 'og:image:alt'), /[Cc]onceptual/, route);
    assert.equal(meta(html, 'twitter:image:alt'), meta(html, 'og:image:alt'), route);
    if (route.includes('incident-zero')) assert.match(meta(html, 'og:image:alt'), /fictional/, route);
    const png = await readFile(`dist/images/social/${image}`);
    assert.equal(png.subarray(1, 4).toString(), 'PNG', image);
    assert.equal(png.readUInt32BE(16), 1200, image);
    assert.equal(png.readUInt32BE(20), 630, image);
    assert.ok(png.length < 75_000, `${image}: ${png.length} bytes`);
  }
});

test('route sharing metadata preserves canonical URLs, schema, sitemap and 404 exclusion', async () => {
  const sitemap = await readFile('dist/sitemap.xml', 'utf8');
  for (const [route] of routes) {
    const html = await readFile(`dist/${route}/index.html`, 'utf8');
    const url = `${origin}/${route}/`;
    assert.ok(html.includes(`rel="canonical" href="${url}"`), route);
    assert.equal(meta(html, 'og:url'), url, route);
    const title = html.match(/<title>([^<]+)<\/title>/)[1];
    assert.equal(meta(html, 'og:title'), title, route);
    assert.equal(meta(html, 'twitter:title'), title, route);
    assert.equal(meta(html, 'og:description'), meta(html, 'description'), route);
    assert.equal(meta(html, 'twitter:description'), meta(html, 'description'), route);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1]);
    assert.ok(schema['@graph'].some(item => item['@type'] === 'WebPage' && item.url === url), route);
    assert.ok(schema['@graph'].some(item => item['@type'] === 'Person'), route);
    assert.ok(sitemap.includes(url), route);
  }
  const home = await readFile('dist/index.html', 'utf8');
  assert.equal(meta(home, 'og:image'), `${origin}/og-image.png`);
  const missing = await readFile('dist/404.html', 'utf8');
  assert.equal(meta(missing, 'robots'), 'noindex, follow');
  assert.doesNotMatch(missing, /rel="canonical"|property="og:url"|application\/ld\+json/);
});
