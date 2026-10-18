import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';
import { resolve, dirname } from 'node:path';
const cache = new Map();
function load(path) {
  path = resolve(path);
  if (cache.has(path)) return cache.get(path);
  const context = { exports: {}, require: name => load(resolve(dirname(path), name + '.ts')) };
  cache.set(path, context.exports);
  vm.runInNewContext(ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, context);
  return context.exports;
}
const mapping = load('src/technology.ts');
const content = load('src/content.ts');
const records = JSON.parse(JSON.stringify(mapping.technologyExperience));
const technologies = generation => generation.groups.flatMap(group => group.technologies).sort();
const expected = {
  hostel: [['Plain PHP', 'PHP Data Objects (PDO)', 'MySQL']],
  rental: [['Symfony', 'MySQL', 'Apache', 'Third-party cloud provider']],
  campus: [
    ['PHPMaker', 'PHP 5', 'MySQL 5.7', 'Apache', 'On-premises', 'AWS EC2'],
    ['Laravel', 'Node.js', 'React', 'PostgreSQL', 'MySQL', 'Nginx', 'Apache', 'On-premises', 'AWS ECS', 'AWS EC2', 'Kubernetes', 'Third-party cloud provider'],
  ],
  insurance: [['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Docker', 'Playwright', 'Nginx', 'AWS EC2', 'AWS ECS']],
  wensymes: [['Laravel', 'PHP 8', 'MySQL', 'Apache', 'Nginx', 'Docker', 'Kubernetes', 'Google Cloud (GCP)']],
  asset: [['Ruby on Rails', 'MySQL', 'Nginx', 'Microsoft Azure']],
};
test('all six owner inventories contain exactly the confirmed technologies with no cross-assignment', () => {
  assert.deepEqual(records.map(record => record.id).sort(), Object.keys(expected).sort());
  for (const record of records) assert.deepEqual(record.generations.map(technologies), expected[record.id].map(values => [...values].sort()), record.id);
});
test('education generations and explicit legacy versions remain distinct', () => {
  const education = records.find(record => record.id === 'campus');
  assert.deepEqual(education.generations.map(g => g.label), ['Legacy systems', 'Modern systems']);
  assert.equal(education.generations[0].legacy, true);
  assert.ok(!technologies(education.generations[1]).includes('PHP 5'));
  assert.match(education.note, /not a single deployment/);
  assert.match(education.note, /every legacy system was replaced/);
});
test('Project.stack is a generated projection and existing work IDs/order and uninventoried cases stay intact', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(content.projects.map(p => p.id))), ['insurance', 'wensymes', 'campus', 'rental', 'meetings', 'hr']);
  for (const project of content.projects) assert.deepEqual(JSON.parse(JSON.stringify(project.stack)), JSON.parse(JSON.stringify(mapping.technologyStack(project.id))));
  for (const id of ['meetings', 'hr']) {
    const project = content.projects.find(p => p.id === id);
    assert.equal(project.stack.length, 0); assert.equal(project.technology, undefined);
  }
  assert.match(content.projects.find(p => p.id === 'wensymes').summary, /Microsoft 365/);
});
test('additional systems preserve historical context and have no invented employment or product metadata', () => {
  const hostel = records.find(record => record.id === 'hostel');
  assert.equal(hostel.legacy, true);
  for (const phrase of [/presentation/, /unmaintained/, /not production-ready/, /omitted security precautions/]) assert.match(hostel.note, phrase);
  for (const record of records.filter(r => !r.projectId)) {
    for (const key of ['company', 'employer', 'period', 'role', 'customer', 'users', 'scale', 'outcomes']) assert.equal(key in record, false);
  }
  assert.equal(records.find(r => r.id === 'asset').repository, undefined);
});
test('technology naming remains normalized without adding unspecified versions', () => {
  const text = JSON.stringify(records);
  assert.doesNotMatch(text, /Symphony|Reactjs|Nodejs|Nextjs|Laravel [0-9]|PHP 8\.[0-9]/);
  for (const name of ['Symfony', 'React', 'Node.js', 'Next.js', 'Ruby on Rails', 'PHP Data Objects (PDO)', 'Microsoft Azure', 'AWS EC2', 'AWS ECS', 'PHP 5', 'PHP 8', 'MySQL 5.7']) assert.ok(text.includes(name), name);
});
const home = await readFile('dist/index.html', 'utf8');
const artifact = JSON.parse(await readFile('public/evidence/technology-experience.v1.json', 'utf8'));
const hash = body => createHash('sha256').update(JSON.stringify(body)).digest('hex');
test('versioned public export is hash-bound, attributed and shipped unchanged', async () => {
  assert.equal(artifact.schemaVersion, 1); assert.equal(artifact.publicOnly, true);
  const {contentHash, ...body} = artifact; assert.equal(contentHash, hash(body));
  for (const record of artifact.records) {
    const {contentHash, ...body} = record; assert.equal(contentHash, hash(body));
    assert.ok(Number.isFinite(Date.parse(record.reviewedAt)));
    assert.equal(record.provenance[0].type, 'owner-confirmed');
    assert.equal(record.provenance[0].confirmedOn, '2026-10-18');
    const anchor = new URL(record.canonicalPortfolioAnchor);
    assert.equal(anchor.origin, 'https://mohd.paramasvara.online');
    assert.ok(home.includes(`id="${anchor.hash.slice(1)}"`));
    for (const source of record.provenance.filter(p => p.url)) assert.equal(source.url, 'https://github.com/MohdVara/Hostel-Management-System/tree/master');
    assert.equal(record.provenance.some(p => p.type === 'public-repository'), record.canonicalProjectId === 'hostel');
  }
  assert.equal(await readFile('dist/evidence/technology-experience.v1.json', 'utf8'), await readFile('public/evidence/technology-experience.v1.json', 'utf8'));
});
test('all required technology information is present in static project-specific native disclosures', () => {
  for (const record of records) {
    const fragment = home.split(`id="${record.anchor}"`)[1].split('</article>')[0];
    assert.match(fragment, /Technology stack/);
    assert.match(fragment, /class="project-stack" role="group" aria-label="Technology stack for /);
    for (const generation of record.generations) for (const value of technologies(generation)) assert.ok(fragment.includes(value), `${record.id}/${value}`);
    assert.match(fragment, /Technology experience confirmed by project owner/);
  }
  assert.match(home, /Legacy systems/); assert.match(home, /Modern systems/);
  assert.match(home, /Professional role &amp; project background: full CV/);
  assert.match(home, /additional-systems[^>]+name="engineering-case-studies"/);
  const ids = [...home.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length);
});
test('main JavaScript stays below the unchanged 215,000-byte ceiling and export is not a startup fetch', async () => {
  const entry = home.match(/<script[^>]+src="(\/assets\/index-[^"]+\.js)"/)[1];
  assert.ok((await stat('dist' + entry)).size < 215000);
  const js = await readFile('dist' + entry, 'utf8');
  assert.doesNotMatch(js, /technology-experience\.v1\.json/);
  assert.match(home, /modulepreload[^>]+portfolio-content-/);
});
