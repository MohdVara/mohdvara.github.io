import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";
const source = (await readFile("src/main.tsx", "utf8")).replace(/void startup\(\)\.catch\([^\n]+/, "");
const compiled = ts.transpileModule(source, { compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX} }).outputText;
const registry = JSON.parse(await readFile("src/i18n/languages.json","utf8"));
const resolutionModule = {exports:{}, require: () => ({isLocale:value => registry.some(item => item.locale === value)})};
vm.runInNewContext(ts.transpileModule(await readFile("src/i18n/localeResolution.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,resolutionModule);
async function startup(pathname, { staticMain = true, missing = false, serverLocale = "en", saved = null, browserLanguage = "en" } = {}) {
  const calls = [], location = {pathname,search:"",hash:""};
  const context = {exports:{},window:{location},location,navigator:{languages:[browserLanguage]},localStorage:{getItem:()=>saved},history:{replaceState:(_,__,path)=>{location.pathname=path;}},
    document:{getElementById:()=>({dataset:{locale:serverLocale},querySelector:selector=>selector === "main" ? staticMain : missing})},
    require: name => name === "react-dom/client" ? {hydrateRoot:()=>calls.push("hydrate"),createRoot:()=>({render:()=>calls.push("render")})} : name === "react/jsx-runtime" ? {jsx:()=>({})} : name === "./analytics" ? {startAnalytics:()=>{}} : name === "./i18n/config" ? {i18n:{changeLanguage:async()=>{}},loadLocale:async()=>{}} : name === "./i18n/metadata" ? {applyMetadata:()=>{}} : name === "./i18n/localeResolution" ? resolutionModule.exports : {},
  };
  vm.runInNewContext(compiled,context);
  await context.exports.startup();
  return {calls,pathname:location.pathname};
}
test("all English static routes hydrate, including localized and PACE-RAG visits",async()=>{
  for(const path of ["/","/work-with-me/","/no-two-mondays/","/pace-rag-case-study/","/incident-zero/","/incident-zero/defence/"]) {
    assert.deepEqual((await startup(path)).calls,["hydrate"]);
    assert.deepEqual((await startup(`/en${path}`)).calls,["hydrate"]);
  }
});
test("development and fallback shells render; correct localized static trees hydrate",async()=>{
  assert.deepEqual((await startup("/no-two-mondays/",{staticMain:false})).calls,["render"]);
  assert.deepEqual((await startup("/unknown/")).calls,["render"]);
  assert.deepEqual((await startup("/unknown/",{missing:true})).calls,["hydrate"]);
  assert.deepEqual((await startup("/ar/",{serverLocale:"ar"})).calls,["hydrate"]);
  const detected=await startup("/",{browserLanguage:"ar-SA"});
  assert.deepEqual(detected.calls,["render"]);assert.equal(detected.pathname,"/ar/");
});
