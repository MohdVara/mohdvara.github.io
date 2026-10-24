import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";
import {planChanges,hash,validateEntry,coverage} from "../scripts/i18n/shared.mjs";
import {createProvider} from "../scripts/i18n/provider.mjs";
const readJson=async path=>JSON.parse(await readFile(path,"utf8"));
const registry=await readJson("src/i18n/languages.json");
async function load(path,imports={}) {
  const context={exports:{},require:name=>imports[name]};
  vm.runInNewContext(ts.transpileModule(await readFile(path,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
  return context.exports;
}
const resolution=await load("src/i18n/localeResolution.ts",{"./languages":{isLocale:value=>registry.some(item=>item.locale===value)}});
const {translateSource}=await load("src/i18n/lookup.ts");
test("eleven registered locales have consistent direction and optional writing modes",()=>{
  assert.equal(registry.length,11);assert.equal(new Set(registry.map(item=>item.locale)).size,11);
  for(const item of registry){assert.equal(item.direction,item.locale==="ar"?"rtl":"ltr");assert.equal(item.defaultWritingMode,"horizontal");assert.equal(item.writingModes.includes("vertical"),["ja","zh-Hans"].includes(item.locale));assert.ok(item.fonts);}
});
test("locale resolution uses URL, then persisted preference, browser list and English",()=>{
  const {resolveLocale}=resolution;
  assert.equal(resolveLocale("/en/","ar",["ja"]),"en");
  assert.equal(resolveLocale("/","ms",["ar-SA"]),"ms");
  assert.equal(resolveLocale("/",null,["unsupported","de-DE"]),"de");
  assert.equal(resolveLocale("/",null,["unsupported"]),"en");
  for(const [input,expected]of Object.entries({"en-US":"en","ms-MY":"ms","ar-SA":"ar","ja-JP":"ja","zh-CN":"zh-Hans","zh-SG":"zh-Hans","pt-BR":"pt-BR","pt-PT":"pt-BR","hi-IN":"hi"}))assert.equal(resolveLocale("/",null,[input]),expected);
  assert.equal(resolveLocale("/",null,["zh-TW"]),"en");assert.equal(resolveLocale("/",null,["zh-Hant","ja"]),"ja");
});
test("localized switching preserves routes, fragments and queries without rewriting assets",()=>{
  assert.equal(resolution.localizedPath("ar","/ja/no-two-mondays/"),"/ar/no-two-mondays/");
  assert.equal(resolution.localizeHref("/work-with-me/?x=1#contact","fr"),"/fr/work-with-me/?x=1#contact");
  for(const href of ["#work","/images/photo.png","https://example.com/","mailto:a@example.com","//example.com/"])assert.equal(resolution.localizeHref(href,"ar"),href);
});
test("engineering discovery links preserve every visitor locale and URL suffix",()=>{
  for(const {locale} of registry)for(const route of ["mmcats-modern","naae","multilingual-engineering"]){
    assert.equal(resolution.localizeHref(`/${route}/?source=home#sources`,locale),`/${locale}/${route}/?source=home#sources`);
    assert.equal(resolution.localizeHref(`/en/${route}/`,locale),`/${locale}/${route}/`);
  }
});
test("source lookup preserves whitespace, safely falls back, and uses interpolation",()=>{
  const source={"Hello {{name}}":"Hello {{name}}"};
  const translator=(key,values)=>"مرحبا "+values.name;
  assert.equal(translateSource(" Hello {{name}} ",source,translator,{name:"React"})," مرحبا React ");
  assert.equal(translateSource("Unknown label",source,()=>{throw new Error("should not translate identifiers")}),"Unknown label");
});
test("incremental plans protect reviewed translations, including forced runs",()=>{
  const source={a:"Changed",b:"Original",c:"New"},target={a:"Reviewed",b:"Translated",removed:"Old"};
  const metadata={a:{status:"human_reviewed",sourceHash:hash("Before")},b:{status:"machine_translated",sourceHash:hash("Original")}};
  assert.deepEqual(planChanges(source,target,metadata),{pending:["c"],protectedReviewed:["a"],removed:["removed"]});
  assert.deepEqual(planChanges(source,target,metadata,{force:true}).pending,["b","c"]);
  assert.deepEqual(planChanges(source,target,metadata,{force:true,overrideReviewed:true}).pending,["a","b","c"]);
  assert.equal(coverage(source,target,metadata).stale,1);
});
test("translation validation rejects lost placeholders, changed brands and unsafe markup",()=>{
  assert.ok(validateEntry("Hi {{name}}","Hola").errors.length);
  assert.ok(validateEntry("Use React","Usar Reaccionar",{protected:["React"]}).errors.length);
  assert.ok(validateEntry("Text","<img src=x onerror=alert(1)>").errors.length);
  assert.ok(validateEntry("Text","\u202eevil").errors.length);
  assert.equal(validateEntry("Use React, {{count}} times","Usa React, {{count}} veces",{protected:["React"]}).errors.length,0);
  assert.ok(validateEntry("Hello world","Hello world").warnings.length);
});
test("provider requires explicit credentials/model and retries transient failures",async()=>{
  assert.throws(()=>createProvider({apiKey:"",model:""}));
  let calls=0;const waits=[];
  const provider=createProvider({apiKey:"test",model:"configured-model",wait:async value=>waits.push(value),fetchImpl:async(url,options)=>{
    assert.equal(url,"https://api.openai.com/v1/responses");const body=JSON.parse(options.body);assert.equal(body.store,false);assert.equal(body.text.format.strict,true);
    calls++;if(calls===1)return {ok:false,status:429};
    return {ok:true,json:async()=>({status:"completed",model:"configured-model",output:[{content:[{type:"output_text",text:'{"Hello":"Hola"}'}]}],usage:{input_tokens:10,output_tokens:3}})};
  }});
  const result=await provider.translate({locale:"es",strings:{Hello:"Hello"},glossary:{instructions:"Preserve claims",protected:[]},context:"Test"});
  assert.deepEqual(result.translations,{Hello:"Hola"});assert.equal(calls,2);assert.deepEqual(waits,[1000]);
});
test("provider rejects malformed schema and incomplete/refused responses",async()=>{
  for(const payload of [{status:"incomplete"},{status:"completed",output:[{content:[{type:"output_text",text:'{"Unexpected":"x"}'}]}]}]) {
    const provider=createProvider({apiKey:"test",model:"explicit",fetchImpl:async()=>({ok:true,json:async()=>payload})});
    await assert.rejects(provider.translate({locale:"fr",strings:{Hello:"Hello"},glossary:{instructions:"",protected:[]},context:"Test"}));
  }
});
test("all localized static routes contain real translated HTML and reciprocal SEO",async()=>{
  for(const item of registry)for(const route of ["","work-with-me/","no-two-mondays/","pace-rag-case-study/","incident-zero/","incident-zero/defence/"]) {
    const html=await readFile(`dist/${item.locale}/${route}index.html`,"utf8");
    assert.match(html,new RegExp(`<html lang="${item.locale}" dir="${item.direction}"`));
    assert.match(html,/<main/);
    if (!route) assert.match(html,/>Mohd\.</);
    assert.doesNotMatch(html,/多用途车/);assert.equal((html.match(/<h1[\s>]/g)||[]).length,1);
    assert.match(html,new RegExp(`rel="canonical" href="https://mohd.paramasvara.online/${item.locale}/${route}"`));
    assert.equal((html.match(/hreflang=/g)||[]).length,registry.length+1);
    assert.doesNotMatch(html,/app-html|\{\{(?:language|value\d+)\}\}/);
    if(item.locale!=="en") {
      const catalog=await readJson(`src/i18n/locales/${item.locale}.json`);
      assert.ok(html.includes(catalog["This page has been automatically translated from English. Translations may contain errors, inaccuracies, or differences in meaning. For the most accurate information about my professional experience, projects, and achievements, please refer to the original English version."]));
      if(!route) assert.ok(html.includes(catalog["Trusted with final architectural decisions. I align stakeholders on trade-offs and build full-stack systems around business needs."]));
    }
  }
});

const calendarModule=await load("src/i18n/formatting.ts",{"./languages":{language:locale=>registry.find(item=>item.locale===locale)}});
test("localized calendars retain exact Gregorian dates and partial-date precision",()=>{
  const {calendarDate,withCalendarDates}=calendarModule;
  for(const locale of ["ja","zh-Hans","hi","ar","ms","ta"]) {
    const result=calendarDate("2026-10-15",locale);
    assert.ok(result.includes("[2026-10-15]"));assert.ok(result.includes(registry.find(item=>item.locale===locale).calendarLabel));
    assert.ok(calendarDate("2025-03",locale,"month").includes("[2025-03]"));
    const monthValue=calendarDate("2025-03",locale,"month");
    const yearValue=calendarDate("2019",locale,"year");
    assert.ok(!yearValue.includes("日"),"year-only source must never display days");
    assert.ok(!yearValue.includes("月"),"year-only source must never display months");
    assert.ok(!monthValue.includes("日"),"month-only source must never display days");
    assert.equal(withCalendarDates("15 October","translated",locale),"translated","never infer absent years");
    assert.equal(withCalendarDates("version 0.3.0, 733 tests","translated",locale),"translated");
  }
  assert.match(calendarDate("2026-10-15","ja"),/令和8/);
  assert.equal(calendarDate("2019","ja","year"),"和暦: 平成31年 – 令和元年 [2019]");
  assert.equal(calendarDate("2021","ja","year"),"和暦: 令和3年 [2021]");
  assert.ok(!withCalendarDates("15 October 2026","15 octobre 2026","fr").includes("["));
});

test("Tamil is immediately after Arabic, with browser resolution and distinct script typography",()=>{
  assert.equal(registry[registry.findIndex(item=>item.locale==="ar")+1].locale,"ta");
  assert.equal(resolution.resolveLocale("/",null,["ta-IN"]),"ta");
  assert.equal(resolution.resolveLocale("/",null,["ta-LK"]),"ta");
  const tamil=registry.find(item=>item.locale==="ta");
  assert.equal(tamil.direction,"ltr");assert.match(tamil.fonts,/Tamil/);
  assert.equal(tamil.calendar,"indian");
});
test("open-ended and closed career periods use localized grammar and preserve precision",async()=>{
  const templates={};
  for(const item of registry) templates[item.locale]=await readJson(`src/i18n/locales/${item.locale}.json`);
  const render=locale=>(key,values)=>templates[locale][key].replace(/\{\{(\w+)\}\}/g,(_,name)=>values[name]);
  const {withCalendarDates}=calendarModule;
  assert.equal(withCalendarDates("2025 onward","2025 onward","en",render("en")),"2025 onward");
  assert.equal(withCalendarDates("2025 onward","ignored","ja",render("ja")),"和暦: 令和7年 [2025]以降");
  assert.equal(withCalendarDates("2025 onward","ignored","fr",render("fr")),"Depuis 2025");
  for(const item of registry.filter(item=>item.locale!=="en")) {
    const onward=withCalendarDates("2025 onward","ignored",item.locale,render(item.locale));
    assert.ok(!onward.includes("onward"),`${item.locale} translates onward`);
    assert.ok(!onward.includes("{{"));
    if(item.calendar!=="gregory")assert.ok(onward.includes("[2025]"));
    const closed=withCalendarDates("2019–2021","ignored",item.locale,render(item.locale));
    const open=withCalendarDates("Jun 2022 — Present","ignored",item.locale,render(item.locale));
    assert.ok(!open.includes("Present"));
    assert.ok(!closed.includes("月")&&!closed.includes("日"),`${item.locale}: no invented months or days in year range`);
    if(item.calendar!=="gregory") {
      assert.ok(closed.includes("[2019]")&&closed.includes("[2021]"));
      assert.ok(open.includes("[2022-06]"));
    }
    for(const source of ["Since 2013","2021 onward","2023 onward","Mar 2025 — ongoing collaboration","May 2019 — Jun 2021","2016–2017"]) {
      const result=withCalendarDates(source,"ignored",item.locale,render(item.locale));assert.ok(result!=="ignored");
    }
    if(item.calendar!=="gregory")assert.ok(withCalendarDates("Building since 2013.","translated",item.locale,render(item.locale)).includes("[2013]"));
    assert.equal(withCalendarDates("0.3.0-rc.1","unchanged",item.locale,render(item.locale)),"unchanged");
  }
});

test("PACE-RAG conversations are permanently excluded while surrounding notices stay synchronized",async()=>{
  const exclusions=await readJson("scripts/i18n/exclusions.json");
  const english=await readJson("src/i18n/locales/en.json");
  for(const item of registry){
    const catalog=await readJson(`src/i18n/locales/${item.locale}.json`);
    for(const key of exclusions.keys)assert.ok(!(key in catalog),`${item.locale}: conversation excluded`);
    for(const key of ["PACE-RAG supports English questions and answers only. Please ask your question in English.","Enter an English question. Suggested questions and answers remain in English when you change the portfolio language."])assert.ok(catalog[key]);
  }
  assert.ok(english["Engineering experience assistant"]);
  const source=await readFile("src/PaceAssistant.tsx","utf8");
  assert.match(source,/lang="en" dir="ltr" translate="no"/);
  assert.match(await readFile("AGENTS.md","utf8"),/intentionally English-only/);
  const bundle=await readFile("node_modules/@pace-rag/portfolio-assistant/dist/assistant.js","utf8");
  assert.match(bundle,/Please rephrase your question in English/);
  assert.match(bundle,/Generated answer must be in English/);
});

test("translation transparency is localized once above main content, with a short selector status",async()=>{
  const title="Machine Translation Notice";
  const body="This page has been automatically translated from English. Translations may contain errors, inaccuracies, or differences in meaning. For the most accurate information about my professional experience, projects, and achievements, please refer to the original English version.";
  for(const item of registry)for(const route of ["","work-with-me/","no-two-mondays/","pace-rag-case-study/","incident-zero/","incident-zero/defence/"]) {
    const html=await readFile(`dist/${item.locale}/${route}index.html`,"utf8");
    if(item.locale==="en") {assert.ok(!html.includes('class="translation-notice '));assert.ok(!html.includes('class="translation-status"'));continue;}
    const catalog=await readJson(`src/i18n/locales/${item.locale}.json`);
    assert.ok(html.includes(catalog[title]));assert.ok(html.includes(catalog[body]));
    assert.equal(html.split(catalog[body]).length-1,1,"full disclaimer occurs once");
    const start=html.indexOf('class="translation-notice ');
    assert.ok(start>html.indexOf('</header>')&&start<html.indexOf('<main'),`${item.locale}/${route} notice immediately follows navigation`);
    assert.match(html,new RegExp(`href="/en/${route}" hrefLang="en"`,"i"));
    assert.ok(catalog["Machine translated from English"]);
    assert.ok(!html.includes('id="utility-panel"'), "contextual panel stays closed in the prerendered shell; browser QA verifies its short status");
  }
});

test("Incident Zero opening and conditional canvas labels have localized catalog entries",async()=>{
  const opening="You are the engineer. Explore a small office, collect the evidence and decide what should change before production moves again.";
  const labels=["TERMINAL / RESTORE","RM8,500 / REVIEWED","RM7,500 / MISMATCH"];
  for(const {locale} of registry.filter(item=>item.locale!=="en")) {
    const catalog=await readJson(`src/i18n/locales/${locale}.json`);
    assert.ok(catalog[opening],locale);
    assert.ok(!catalog[opening].includes("Explore a small office"),`${locale}: partially untranslated opening`);
    for(const key of labels) {assert.ok(catalog[key],`${locale}: ${key}`);assert.notEqual(catalog[key],key,`${locale}: ${key}`);}
  }
});
