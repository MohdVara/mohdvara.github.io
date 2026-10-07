import test from 'node:test';
import assert from 'node:assert/strict';
import { eligible, normalize, refresh } from '../scripts/public-github.mjs';
import { featured } from '../scripts/public-github-curation.mjs';
const now = Date.UTC(2026, 9, 7);
const repo = item => ({ full_name: `MohdVara/${item.name}`, html_url: `https://github.com/MohdVara/${item.name}`, private: false, visibility: 'public', fork: false, archived: false, size: 46, language: 'JavaScript' });
const ok = body => new Response(JSON.stringify(body), { status: 200 });
const cached = featured.map(item => normalize(repo(item), item, now));
const report = () => {};
test('visibility, identity, fork, archive and empty repository filters fail closed', () => {
  const item = featured[0], source = repo(item);
  assert.ok(eligible(source, item));
  for (const patch of [{ private: true }, { visibility: 'private' }, { visibility: undefined }, { fork: true }, { archived: true }, { size: 0 }, { html_url: 'https://example.com' }, { full_name: 'another/repo' }]) assert.equal(eligible({ ...source, ...patch }, item), false);
  assert.equal(eligible(repo(featured[1]), { ...featured[1], allowPortfolio: false }), false);
});
test('normalization retains only approved content and supports absent metadata', () => {
  const result = normalize({ ...repo(featured[0]), language: null, description: null, token: 'should-never-serialize', stars: 0 }, featured[0], now);
  assert.equal(result.language, null);
  assert.ok(result.description.length > 20);
  assert.ok(!JSON.stringify(result).includes('should-never-serialize'));
  assert.ok(!('stars' in result));
});
test('refresh uses only fixed unauthenticated public API destinations', async () => {
  const result = await refresh({ now, request: async (url, options) => {
    assert.match(url, /^https:\/\/api.github.com\/repos\/MohdVara\//);
    assert.equal(options.headers.Authorization, undefined);
    return ok(repo(featured.find(item => url.endsWith(item.name))));
  } });
  assert.equal(result.length, 2);
});
test('temporary retrieval failure uses a recent verified snapshot without extending its age', async () => {
  const result = await refresh({ cached, now: now + 86400000, report, request: async () => { throw new Error('network unavailable'); } });
  assert.equal(result.length, 2);
  assert.equal(result[0].verifiedAt, cached[0].verifiedAt);
});
test('unverified, expired or wrong-URL cache entries are omitted on failure', async () => {
  const request = async () => { throw new Error('offline'); };
  assert.deepEqual(await refresh({ now, request, report }), []);
  assert.deepEqual(await refresh({ now: now + 31 * 86400000, cached, request, report }), []);
  assert.deepEqual(await refresh({ now, cached: cached.map(item => ({ ...item, url: 'https://example.com' })), request, report }), []);
});
test('private, archived and access-denied responses never fall back to cached public content', async () => {
  for (const request of [async () => new Response('', { status: 404 }), async () => new Response('', { status: 403 }), async () => ok({ ...repo(featured[0]), visibility: 'private', private: true }), async () => ok({ ...repo(featured[0]), archived: true })]) assert.deepEqual(await refresh({ now, cached, request, report }), []);
});
test('rate limits and temporary server failures retain only verified curated links', async () => {
  for (const response of [new Response('', { status: 429 }), new Response('', { status: 503 }), new Response('', { status: 403, headers: { 'x-ratelimit-remaining': '0' } })]) assert.equal((await refresh({ now, cached, report, request: async () => response.clone() })).length, 2);
});
