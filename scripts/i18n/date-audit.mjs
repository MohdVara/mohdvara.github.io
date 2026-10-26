import {loadFormatting} from './load-formatting.mjs';
import {readFile,writeFile} from 'node:fs/promises';
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const registry=await json('src/i18n/languages.json');
const formatting = await loadFormatting();
const periods=['Since 2013','Building since 2013.',...new Set([...((await readFile('src/content.ts','utf8')).matchAll(/period: "([^"]+)"/g))].map(match=>match[1]))];
const rows=[];
for(const item of registry)for(const mode of ["cultural","gregorian"]){const catalog=await json(`src/i18n/locales/${item.locale}.json`);const render=(key,values)=>catalog[key].replace(/\{\{(\w+)\}\}/g,(_,name)=>values[name]);rows.push({locale:item.locale,calendar:item.calendar,mode,periods:periods.map(source=>({source,display:formatting.withCalendarDates(source,catalog[source]||source,item.locale,render,mode)}))});}
await writeFile('docs/portfolio/PME-V1-DATE-AUDIT.json',JSON.stringify({policy:'Preserve source precision; alternate calendars include Gregorian equivalents; localize open-ended grammar.',rows},null,2)+'\n');
