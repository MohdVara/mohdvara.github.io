import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
const source = await readFile('src/useFragmentNavigation.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const ids = ['insurance', 'wensymes', 'campus', 'rental', 'meetings', 'hr'];
const context = { exports: {}, require: name => name === './content' ? { projectIds: ids } : {} };
vm.runInNewContext(compiled, context);

test('commercial fragments allow only known projects, including encoded valid links', () => {
  for (const id of ids) assert.equal(context.exports.projectIdFromHash(`#case-${id}`), id);
  assert.equal(context.exports.projectIdFromHash('#case-%69nsurance'), 'insurance');
  for (const hash of ['#case-unknown', '#case-insurance/extra', '#case-__proto__', '#work', '#ntm-summary', '#case-%E0%A4%A', ''])
    assert.equal(context.exports.projectIdFromHash(hash), null, hash);
});

test('all generated service evidence links resolve to actual static fragments', async () => {
  const work = await readFile('dist/work-with-me/index.html', 'utf8');
  const cases = [...work.matchAll(/href="(\/en\/#case-[^"]+)"/g)].map(match => match[1]);
  assert.ok(cases.length >= 7);
  const home = await readFile('dist/index.html', 'utf8');
  for (const hash of cases) assert.ok(home.includes(`id="${hash.split("#")[1]}"`), hash);
  assert.match(work, /PolicyStreet · engineering leadership/);
  assert.match(work, /PACE-RAG · implementation &amp; evidence boundaries/);
  assert.match(work, /href="\/en\/pace-rag-case-study\/"/);
  const rag = await readFile("dist/pace-rag-case-study/index.html", "utf8");
  assert.match(rag, /72.5%/);
  assert.match(rag, /Architecture at a glance/);
  assert.match(rag, /Citation validation/);
  assert.doesNotMatch(rag, /https?:\/\/(?:localhost|127\.0\.0\.1)/);
  assert.match(rag, /Live AI is disabled/);
  assert.match(rag, /rel="canonical" href="https:\/\/mohd.paramasvara.online\/pace-rag-case-study\/"/);
  assert.match(home, /id="ai-evidence"/);
  assert.match(home, /independently developed engineering demonstration/);
  assert.match(home, /enterprise production RAG delivery, which is not established/);
  assert.doesNotMatch(home, /WorkWithMe-[^" ]+\.js/);
  assert.match(home, /name="engineering-case-studies"/);
});
