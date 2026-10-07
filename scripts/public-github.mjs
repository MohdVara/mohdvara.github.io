import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { featured } from './public-github-curation.mjs';

const owner = 'MohdVara';
const ttl = 30 * 24 * 60 * 60 * 1000;
const output = new URL('../src/data/public-github.json', import.meta.url);
const urlFor = name => `https://github.com/${owner}/${name}`;
export function eligible(repo, item) {
  return repo?.private === false && repo.visibility === 'public' &&
    repo.full_name === `${owner}/${item.name}` && repo.html_url === urlFor(item.name) &&
    !repo.fork && !repo.archived && repo.size > 0 &&
    (item.name !== 'mohdvara.github.io' || item.allowPortfolio === true);
}
export function normalize(repo, item, now) {
  return { name: item.name, url: urlFor(item.name), title: item.title, kind: item.kind,
    description: item.description, technologies: item.technologies,
    relevance: item.relevance, language: repo.language || null,
    visibility: 'public', verifiedAt: new Date(now).toISOString() };
}
// Explicit access failures/visibility changes omit the item. Temporary network/rate
// failures may reuse only a recent public verification of this exact allowlisted URL.
export async function refresh({ request = fetch, cached = [], now = Date.now(), report = console.warn } = {}) {
  return Promise.all(featured.map(async item => {
    try {
      const response = await request(`https://api.github.com/repos/${owner}/${item.name}`, {
        headers: { Accept: 'application/vnd.github+json' },
        signal: AbortSignal.timeout(8000),
      });
      if ([401, 404, 410, 451].includes(response.status)) return null;
      if (!response.ok) {
        if (response.status === 429 || response.status >= 500 ||
            (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0')) throw new Error('temporary');
        return null;
      }
      const repo = await response.json();
      return eligible(repo, item) ? normalize(repo, item, now) : null;
    } catch {
      const prior = cached.find(repo => repo.name === item.name && repo.url === urlFor(item.name) && repo.visibility === 'public');
      const age = now - Date.parse(prior?.verifiedAt || '');
      if (age >= 0 && age <= ttl) {
        report(`Public GitHub: using recent verified snapshot for ${item.name}.`);
        return normalize({ language: prior.language }, item, Date.parse(prior.verifiedAt));
      }
      report(`Public GitHub: omitting unverified item ${item.name}.`);
      return null;
    }
  })).then(items => items.filter(Boolean));
}
async function main() {
  // Never inherit a disabled TLS verification setting for public-source verification.
  if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  let cached = [];
  try { cached = JSON.parse(await readFile(output, 'utf8')); } catch { /* First build may omit unavailable items. */ }
  const items = await refresh({ cached });
  await writeFile(output, `${JSON.stringify(items, null, 2)}\n`);
  console.log(`Public GitHub: ${items.length} curated public repositories; no authentication used.`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
