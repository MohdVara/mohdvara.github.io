import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import vm from 'node:vm';
const context = { exports: {} };
vm.runInNewContext(ts.transpileModule(await readFile('src/notFoundGeometry.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
const { trailScene } = context.exports;
test('404 compositions are distinct, seeded and bounded at both aspect ratios', () => {
  for (const compact of [false, true]) {
    const scenes = ['vanishing', 'diverging', 'beyond'].map(c => trailScene(c, compact));
    assert.equal(new Set(scenes.map(s => JSON.stringify(s))).size, 3);
    assert.equal(JSON.stringify(scenes[0]), JSON.stringify(trailScene('vanishing', compact)));
    for (const runs of scenes) {
      assert.ok(runs.length > 500 && runs.length < 5000);
      for (const r of runs) { assert.ok(r.x >= 8 && r.x <= (compact ? 412 : 1592)); assert.ok(r.y >= 10 && r.y <= (compact ? 428 : 888)); assert.ok(r.alpha > 0 && r.alpha <= 1); }
    }
    assert.ok(scenes[0].some(r => r.layer === 'trail'));
    assert.ok(!scenes[2].some(r => r.layer === 'trail'));
  }
});
test('404 quote is localized HTML outside decorative glyph artwork', async () => {
  const ui = await readFile('src/NotFound.tsx', 'utf8');
  assert.match(ui, /<blockquote[^>]*><p><VerticalText>\{text\("The map may end here\. The possibilities don't\."\)\}/);
  const art = await readFile('src/NotFoundLandscape.tsx', 'utf8');
  assert.match(art, /aria-hidden="true"/);
  assert.ok(!art.includes('possibilities'));
  const locales = JSON.parse(await readFile('src/i18n/languages.json', 'utf8'));
  const metadata = JSON.parse(await readFile('scripts/i18n/metadata.json', 'utf8'));
  for (const {locale} of locales) {
    const cat = JSON.parse(await readFile(`src/i18n/locales/${locale}.json`, 'utf8'));
    for (const key of ['Trace', 'Path', 'Beyond', 'Explore', 'Horizon', 'Onward', "The map may end here. The possibilities don't."]) {
      assert.ok(cat[key]);
      if (locale !== 'en' && key !== 'Explore') assert.equal(metadata.locales[locale][key].status, 'machine_translated');
    }
  }
});
