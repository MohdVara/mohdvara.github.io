// Reproducible, local-only concept fixtures. No variant controls ship in the UI.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import ts from 'typescript';
import vm from 'node:vm';
const context = { exports: {} };
vm.runInNewContext(ts.transpileModule(await readFile('src/notFoundGeometry.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
const html = await readFile('dist/404.html', 'utf8');
const out = 'output/playwright/404-experience-v1';
await mkdir(out, { recursive: true });
const vocabulary = ['Trace', 'Path', 'Beyond', 'Explore', 'Horizon', 'Onward'];
for (const concept of ['vanishing', 'diverging', 'beyond']) {
  const scene = [false, true].map(compact => `<svg class="${compact ? 'unmapped-mobile' : 'unmapped-wide'}" viewBox="${compact ? '0 0 420 440' : '0 0 1600 900'}" preserveAspectRatio="${compact ? 'xMidYMid meet' : 'xMidYMid slice'}" focusable="false">${context.exports.groupTrailRuns(context.exports.trailScene(concept, compact)).map(g => `<g class="unmapped-ink ${g.layer}" font-size="${g.size}" style="opacity:calc(${g.alpha} * var(--unmapped-strength))" text-anchor="middle">${g.runs.map(r=>`<text x="${r.x}" y="${r.y}">${r.word === undefined ? r.glyph : vocabulary[r.word]}</text>`).join('')}</g>`).join('')}</svg>`).join('');
  // Remove the entry only in fixtures: variant geometry must survive hydration.
  const fixture = html.replace(/<div class="unmapped-landscape"[\s\S]*?<\/svg><\/div>/, `<div class="unmapped-landscape" aria-hidden="true">${scene}</div>`).replace(/<script[\s\S]*?<\/script>/g, '').replace("</head>", "<style>#portfolio-loader{display:none!important}</style></head>");
  await writeFile(`${out}/${concept}.html`, fixture);
}
console.log('Three concept fixtures written to ignored QA output.');
