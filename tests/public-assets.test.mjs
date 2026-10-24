import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, dirname} from 'node:path';
import {auditPublicAssets} from '../scripts/public-assets-audit.mjs';

test('publication inventory rejects accidental exports and missing reviewed assets', async () => {
  const root = await mkdtemp(join(tmpdir(), 'portfolio-assets-'));
  try {
    const {files} = JSON.parse(await readFile('scripts/public-assets.json','utf8'));
    for (const file of files) {await mkdir(dirname(join(root,file)), {recursive:true}); await writeFile(join(root,file),'fixture');}
    assert.equal((await auditPublicAssets(root)).approved,files.length);
    await writeFile(join(root,'Downloaded-CV.json'),'private export');
    await assert.rejects(auditPublicAssets(root),/Downloaded-CV.json/);
    await rm(join(root,'Downloaded-CV.json'));await rm(join(root,files[0]));
    await assert.rejects(auditPublicAssets(root),/missing/);
  } finally {await rm(root,{recursive:true,force:true});}
});
