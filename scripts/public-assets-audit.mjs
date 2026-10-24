import {readdir, readFile, access} from 'node:fs/promises';
import {resolve, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

export async function auditPublicAssets(root = 'public') {
  const {files} = JSON.parse(await readFile(new URL('./public-assets.json', import.meta.url), 'utf8'));
  const approved = new Set(files);
  const unexpected = [];
  async function walk(folder) {
    for (const entry of await readdir(folder, {withFileTypes: true})) {
      const path = resolve(folder, entry.name), name = relative(resolve(root), path);
      // The build verifies and replaces this generated directory from the pinned
      // package's signed-off release manifest before Vite copies public assets.
      if (name === 'pace-rag' && entry.isDirectory()) continue;
      if (entry.isDirectory()) await walk(path);
      else if (entry.isSymbolicLink() || !approved.has(name)) unexpected.push(name);
    }
  }
  await walk(resolve(root));
  const missing = [];
  for (const name of approved) {
    try { await access(resolve(root, name)); } catch { missing.push(name); }
  }
  if (unexpected.length || missing.length) throw new Error(`Public asset inventory mismatch: ${JSON.stringify({unexpected, missing})}. Review new publication assets explicitly; keep downloads and source-only files outside public/.`);
  return {approved: approved.size, unexpected, missing};
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(await auditPublicAssets()));
