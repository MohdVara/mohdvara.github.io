import test from 'node:test';
import assert from 'node:assert/strict';
import {loadFormatting} from '../scripts/i18n/load-formatting.mjs';
const {calendarLabelText,calendarDate}=await loadFormatting();
test('Arabic ICU punctuation normalization preserves month/day/year/era fields across hydration',()=>{
 const parts=[{type:'day',value:'13'},{type:'literal',value:' '},{type:'month',value:'جمادى الأولى'},{type:'literal',value:'، '},{type:'year',value:'1448'},{type:'literal',value:' '},{type:'era',value:'هـ'}];
 const formatter={format:()=>parts.map(p=>p.value).join(''),formatToParts:()=>parts};
 assert.equal(calendarLabelText(formatter,new Date(),'ar'),'13 جمادى الأولى 1448 هـ');
 assert.equal(calendarLabelText(formatter,new Date(),'en'),formatter.format());
 const value=calendarDate('2026-10-24','ar','day','cultural');assert(value.includes('[2026-10-24]'));assert(!value.includes('،'));assert(value.includes('أم القرى'));
});
test('punctuation normalization applies to Intl literals only',()=>{
 const formatter={format:()=>'',formatToParts:()=>[{type:'month',value:'اسم، محفوظ'},{type:'literal',value:'، '},{type:'year',value:'1448'}]};
 assert.equal(calendarLabelText(formatter,new Date(),'ar'),'اسم، محفوظ 1448');
});
