import {readJson, coverage, atomicJson} from "./shared.mjs";
const source = await readJson("src/i18n/locales/en.json");
const registry = await readJson("src/i18n/languages.json");
const metadata = await readJson("scripts/i18n/metadata.json");
const report = {};
for (const {locale} of registry) {
  const target = await readJson(`src/i18n/locales/${locale}.json`);
  report[locale] = locale === "en" ? {total:Object.keys(source).length,translated:Object.keys(source).length,humanReviewed:0,stale:0,missing:0,percent:100,status:"original"} : coverage(source,target,metadata.locales[locale] || {});
}
console.table(report);
if (process.argv.includes("--write")) {
  await atomicJson("docs/portfolio/PME-V1-COVERAGE.json",report);
  await atomicJson("src/i18n/status.json",Object.fromEntries(Object.entries(report).map(([locale,item]) => [locale,{missing:item.missing,stale:item.stale,machine:locale === "en" ? 0 : item.translated-item.humanReviewed,reviewed:item.humanReviewed}])));
}
if (process.argv.includes("--strict") && Object.values(report).some(item => item.missing || item.stale)) process.exitCode = 1;
