import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const folder = 'public/fonts/editorial/';
const manifest = JSON.parse(await readFile(folder + 'manifest.json', 'utf8'));
const css = await readFile('src/Typography.css', 'utf8');

test('editorial font and license are the audited upstream assets within budget', async () => {
  for (const [file, hash] of [[manifest.asset, manifest.sha256], [manifest.licenseFile, manifest.licenseSha256]]) {
    const bytes = await readFile(folder + file);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), hash);
  }
  const bytes = await readFile(folder + manifest.asset);
  assert.equal(bytes.subarray(0, 4).toString(), 'wOF2');
  assert.equal(bytes.length, manifest.bytes);
  assert.ok(bytes.length <= 50 * 1024);
  assert.deepEqual(manifest.locales, ['en', 'ms', 'es', 'fr', 'de', 'pt-BR']);
  assert.match(await readFile(folder + manifest.licenseFile, 'utf8'), /SIL OPEN FONT LICENSE Version 1.1/);
});

test('production typography has one optional face and no artwork or loader dependency', async () => {
  assert.equal((css.match(/@font-face/g) || []).length, 1);
  assert.match(css, /font-display: swap/);
  assert.doesNotMatch(css, /!important|canvas\s*\{|\.vertical-text\s*\{|\.monogram\s*\{|button\s*\{|@import/);
  for (const file of ['src/i18n/metadata.ts', 'scripts/loader/shell.css', 'src/AsciiForest/AsciiForestBackdrop.tsx', 'src/NarrativeArtwork/NarrativeArtwork.css']) {
    assert.doesNotMatch(await readFile(file, 'utf8'), /Space Grotesk|fonts\/editorial/);
  }
  const inventory = JSON.parse(await readFile('scripts/public-assets.json', 'utf8'));
  for (const file of [manifest.asset, manifest.licenseFile, 'manifest.json']) assert.ok(inventory.files.includes('fonts/editorial/' + file));
});
