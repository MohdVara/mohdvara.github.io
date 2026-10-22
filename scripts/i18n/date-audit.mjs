import ts from 'typescript';
import vm from 'node:vm';
import {readFile,writeFile} from 'node:fs/promises';
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const registry=await json('src/i18n/languages.json');
const context={exports:{},require:()=>({language:locale=>registry.find(item=>item.locale===locale)})};
vm.runInNewContext(ts.transpileModule(await readFile('src/i18n/formatting.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
const periods=['Since 2013','Building since 2013.',...new Set([...((await readFile('src/content.ts','utf8')).matchAll(/period: "([^"]+)"/g))].map(match=>match[1]))];
const rows=[];
for(const item of registry){const catalog=await json(`src/i18n/locales/${item.locale}.json`);const render=(key,values)=>catalog[key].replace(/\{\{(\w+)\}\}/g,(_,name)=>values[name]);rows.push({locale:item.locale,calendar:item.calendar,periods:periods.map(source=>({source,display:context.exports.withCalendarDates(source,catalog[source]||source,item.locale,render)}))});}
await writeFile('docs/portfolio/PME-V1-DATE-AUDIT.json',JSON.stringify({policy:'Preserve source precision; alternate calendars include Gregorian equivalents; localize open-ended grammar.',rows},null,2)+'\n');
