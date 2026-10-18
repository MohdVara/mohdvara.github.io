import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';
const source = await readFile('src/technology.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const context = { exports: {} };
vm.runInNewContext(compiled, context);
const { technologyExperience, technologyReview } = JSON.parse(JSON.stringify(context.exports));
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const records = technologyExperience.map(record => {
  const body = {
    canonicalProjectId: record.id,
    ...(record.projectId ? { selectedWorkId: record.projectId } : {}),
    projectTitle: record.projectTitle,
    canonicalPortfolioAnchor: `https://mohd.paramasvara.online/#${record.anchor}`,
    generations: record.generations,
    legacy: record.legacy || false,
    ...(record.note ? { note: record.note } : {}),
    provenance: [{ type: 'owner-confirmed', confirmedOn: technologyReview.ownerConfirmedOn, scope: technologyReview.authorization },
      ...(record.repository ? [{ type: 'public-repository', url: record.repository.url, commit: record.repository.commit, inspectedAt: technologyReview.reviewedAt, inspectedPaths: ['README.md', 'classes/DB.php'], scope: 'Historical README and PDO/MySQL driver references only; no deployment or security certification.' }] : [])],
    reviewedAt: technologyReview.reviewedAt,
    contentVersion: technologyReview.version,
  };
  return { ...body, contentHash: hash(body) };
});
const payload = { schemaVersion: 1, contentVersion: technologyReview.version, reviewedAt: technologyReview.reviewedAt, publicOnly: true,
  scope: 'Technology involvement only; not proof of sole responsibility, deployment topology, certification, scale or business outcomes.', records };
const artifact = { ...payload, contentHash: hash(payload) };
await mkdir('public/evidence', { recursive: true });
await writeFile('public/evidence/technology-experience.v1.json', JSON.stringify(artifact, null, 2) + '\n');
console.log(`Technology evidence: ${records.length} projects, ${artifact.contentHash}`);
