import ts from "typescript";
import {readdir, readFile} from "node:fs/promises";
import {join} from "node:path";
import {readJson, atomicJson} from "./shared.mjs";
const source = await readJson("src/i18n/locales/en.json");
const exclusions = await readJson("scripts/i18n/exclusions.json");
for(const key of exclusions.keys) delete source[key];
const glossary = await readJson("scripts/i18n/glossary.json");
const locations = {};
const candidates = new Map();
const attributes = new Set(["alt","title","aria-label","placeholder"]);
const fields = new Set(["title","description","summary","result","scope","category","role","period","type","text","label","visualLabel","signal","problem","inputs","deliverables","next","name","notes","disclosure","detail","headline","decision","focus","status","caption","hint","message","tools"]);
async function files(dir) {return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(item => item.isDirectory() ? files(join(dir,item.name)) : join(dir,item.name)))).flat();}
const add = (value, file) => {
  const key = value.trim().replace(/\s+/g," ");
  if (exclusions.keys.includes(key) || !key || (!/[A-Za-z]/.test(key) && !/^20\d{2}\s*[–—-]\s*20\d{2}$/.test(key)) || /^(https?:|mailto:|\/(?!\s)|#)/.test(key) || glossary.protected.includes(key) || ["Maya","Adam","Lina"].includes(key)) return;
  candidates.set(key,key); (locations[key] ||= []).push(file);
};
for (const file of (await files("src")).filter(file => !exclusions.files.includes(file) && !file.startsWith("src/i18n/formatting") && /\.(ts|tsx)$/.test(file) && (!/AsciiForest|NarrativeArtwork|NaturalGraphics/.test(file) || file.endsWith("SceneryControl.tsx")))) {
  const raw = await readFile(file,"utf8"), ast = ts.createSourceFile(file,raw,ts.ScriptTarget.Latest,true);
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(ast) === "text" && ts.isStringLiteral(node.arguments[0])) add(node.arguments[0].text,file);
    if (ts.isJsxText(node) && node.text.trim()) add(node.text.replace(/\s+/g," ").replaceAll("&amp;","&"),file);
    if (ts.isStringLiteral(node) && ts.isJsxAttribute(node.parent) && attributes.has(node.parent.name.getText(ast))) add(node.text,file);
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && ts.isPropertyAssignment(node.parent) && fields.has(node.parent.name.getText(ast)) && (node.parent.name.getText(ast) === "period" || /[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(node.text) || /^[A-Z][a-z]+$/.test(node.text))) add(node.text,file);
    // Inline arrays and tuples carry project details, nav labels and skills.
    if (ts.isStringLiteral(node) && ts.isArrayLiteralExpression(node.parent) && (/[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(node.text) || /^[A-Z][a-z]+$/.test(node.text))) add(node.text,file);
    ts.forEachChild(node,visit);
  }
  visit(ast);
}

for (const repo of await readJson("src/data/public-github.json")) {
  for (const field of ["title", "kind", "description", "relevance"]) if (typeof repo[field] === "string") add(repo[field], "src/data/public-github.json");
}

for (const item of (await readJson("src/data/ntm-crawl-summary.json")).distribution) add(item.title, "src/data/ntm-crawl-summary.json");
const example = await readJson("src/data/pace-php-example.json");
for (const field of ["measurement"]) add(example[field],"src/data/pace-php-example.json");
for (const mapping of example.mappings) if (mapping.generation !== "Unspecified generation") add(`(${mapping.generation})`,"src/data/pace-php-example.json");
const added = [];
// Artwork shares catalog hashes, reviewed-entry protection and translation sync.
for (const entry of (await readJson("src/artwork/vocabulary.json")).entries) {
  candidates.set(entry.key, entry.source);
  (locations[entry.key] ||= []).push("src/artwork/vocabulary.json");
  source[entry.key] = entry.source;
}
for (const [key,value] of candidates) if (!(key in source)) {source[key]=value;added.push(key);}
console.log(`English: ${added.length} added units; ${Object.keys(source).length} total.`);
// Add-only extraction protects deliberately authored semantic/interpolation keys.
// Remove obsolete keys explicitly from en.json; translate reports/removes them.
await atomicJson("src/i18n/locales/en.json",Object.fromEntries(Object.entries(source).sort()));
await atomicJson("scripts/i18n/source-locations.json",locations);
