import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const registry = JSON.parse(await readFile('src/i18n/languages.json','utf8'));
const source = await readFile('src/UtilityRail.tsx','utf8');
const compiled = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
for (const locale of ['en','ar','ta','ja']) test(`utility SSR shell is stable without storage or browser globals: ${locale}`, () => {
  const module = { exports: {} };
  vm.runInNewContext(compiled,{exports:module.exports,require:name => {
    if(name === 'react' || name === 'react/jsx-runtime') return require(name);
    if(name.endsWith('/context')) return {useExperience:()=>({locale,path:'/'})};
    if(name.endsWith('/config')) return {text:value=>value};
    if(name.endsWith('/languages')) return {language:id=>registry.find(item=>item.locale===id)};
    return {};
  }});
  const html=renderToString(createElement(module.exports.default));
  assert.equal((html.match(/data-control=/g)||[]).length,5);
  for(const name of ['Language','Theme','Text size','Animated scenery','Privacy']) assert.ok(html.includes(`aria-label="${name}:`));
  assert.equal((html.match(/aria-expanded="false"/g)||[]).length,6);
  assert.ok(html.includes('aria-label="Open settings"'));
  assert.ok(!html.includes('role="region"'));
});
