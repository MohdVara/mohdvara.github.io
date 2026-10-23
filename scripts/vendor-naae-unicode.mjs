// Explicit maintenance command; production builds never access the sibling repo.
import ts from 'typescript';
import {readFile,mkdir,writeFile,readdir,copyFile} from 'node:fs/promises';
import {resolve,relative,join} from 'node:path';
import {createHash} from 'node:crypto';
const source=resolve(process.argv[2]||'../portfolio-inspired-ascii-art');
const out=resolve('vendor/naae-unicode');await mkdir(out,{recursive:true});
const options={target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,moduleResolution:ts.ModuleResolutionKind.Bundler,declaration:true,outDir:out,rootDir:join(source,'src'),skipLibCheck:true,strict:true,lib:['lib.es2022.d.ts','lib.es2022.intl.d.ts','lib.dom.d.ts','lib.dom.iterable.d.ts']};
const program=ts.createProgram(['unicode/pme-adapter.ts','unicode/render.ts'].map(p=>join(source,'src',p)),options);
const diagnostics=ts.getPreEmitDiagnostics(program);if(diagnostics.length)throw Error(ts.formatDiagnosticsWithColorAndContext(diagnostics,{getCanonicalFileName:p=>p,getCurrentDirectory:()=>source,getNewLine:()=> '\n'}));
program.emit();
const sha=s=>createHash('sha256').update(s).digest('hex');
const upstream=program.getSourceFiles().filter(f=>f.fileName.startsWith(join(source,'src'))).map(f=>({path:relative(source,f.fileName),sha256:sha(f.text)}));
// Hosting paths must be root-relative on every localized route. Do not alter shaping.
const fontPath=join(out,'unicode/fonts.js');let fonts=await readFile(fontPath,'utf8');fonts=fonts.replaceAll("'fonts/unicode/", "'/fonts/unicode/").replace("fetch(root + record.file)", "fetch(root + record.file + '?revision=' + record.sha256)");await writeFile(fontPath,fonts);
await writeFile(join(out,'package.json'),JSON.stringify({name:'@portfolio/naae-unicode',private:true,type:'module',version:'0.5.0-pme.1'},null,2)+'\n');
await writeFile(join(out,'UPSTREAM.json'),JSON.stringify({source:'portfolio-inspired-ascii-art',version:JSON.parse(await readFile(join(source,'package.json'))).version,entrypoint:'src/unicode/pme-adapter.ts',upstream,patches:['fonts.js: root-relative /fonts/unicode paths and revision-keyed font requests'],shaping:'Unmodified NAAE BrowserTextMeasurer/layoutText/renderForPME'},null,2)+'\n');
await mkdir('public/fonts/unicode',{recursive:true});
for(const file of await readdir(join(source,'public/fonts/unicode')))if(/(?:\.woff2|-OFL\.txt|manifest\.json)$/.test(file))await copyFile(join(source,'public/fonts/unicode',file),join('public/fonts/unicode',file));
console.log(`Vendored NAAE Unicode ${upstream.length} source modules, licensed local fonts; no runtime sibling dependency.`);
