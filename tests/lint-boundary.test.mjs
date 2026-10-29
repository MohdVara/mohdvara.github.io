import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ESLint} from 'eslint';
import {generatedBoundary} from '../scripts/lint-scopes.mjs';
const registry=JSON.parse(await readFile('verification/generated-integrations.json','utf8'));
const source=await readFile(registry.files[0].path,'utf8');
test('generated lint boundary requires exact generator bytes and valid syntax',()=>{
 assert.equal(generatedBoundary(source,registry.files[0]).syntax,'PASS');
 assert.throws(()=>generatedBoundary(source+'\n// changed\n',registry.files[0]),/changed/);
 assert.throws(()=>generatedBoundary('export const authored = true;',registry.files[0]),/markers/);
});
test('authored integration TypeScript remains under application lint rules',async()=>{
 const eslint=new ESLint();const results=await eslint.lintText('export const identity = (value: any) => value;',{filePath:'.opencode/plugins/maintained.ts'});
 assert(results[0].messages.some(m=>m.ruleId==='@typescript-eslint/no-explicit-any'));
});
