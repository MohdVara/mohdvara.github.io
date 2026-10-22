import {readJson, validateEntry, hash, atomicJson} from "./shared.mjs";
const source = await readJson("src/i18n/locales/en.json");
const registry = await readJson("src/i18n/languages.json");
const metadata = await readJson("scripts/i18n/metadata.json");
const glossary = await readJson("scripts/i18n/glossary.json");
let errors = 0, warnings = 0;
const review = [];
for (const {locale} of registry) {
  const target = await readJson(`src/i18n/locales/${locale}.json`);
  let missing = 0, stale = 0, suspicious = 0;
  for (const [key, value] of Object.entries(source)) {
    if (!(key in target)) {missing++; continue;}
    const result = validateEntry(value,target[key],glossary);
    for (const error of result.errors) {console.error(`${locale}: ${key}: ${error}`);errors++;}
    if (locale !== "en") {
      suspicious += result.warnings.length;
      if (result.warnings.length) review.push({locale,key,source:value,translation:target[key],warnings:result.warnings});
    }
    if (locale !== "en") {
      const entry = metadata.locales[locale]?.[key];
      if (!entry || !["machine_translated","human_reviewed"].includes(entry.status)) {console.error(`${locale}: missing provenance for ${key}`);errors++;}
      if (entry?.sourceHash !== hash(value)) stale++;
    }
  }
  for (const key of Object.keys(target)) if (!(key in source)) {console.warn(`${locale}: removed source key retained: ${key}`);warnings++;}
  const plurals = Object.keys(source).filter(key => key.endsWith("_one"));
  for (const key of plurals) if (!source[key.replace(/_one$/, "_other")]) {console.error(`Missing _other plural for ${key}`);errors++;}
  warnings += missing + stale + suspicious;
  console.log(`${locale}: missing=${missing}, stale=${stale}, reviewWarnings=${suspicious}`);
}
console.log(`Validation: ${errors} errors; ${warnings} warnings. Warnings require editorial review.`);
if (process.argv.includes("--write")) await atomicJson("docs/portfolio/PME-V1-TRANSLATION-REVIEW.json",review);
if (errors || (process.argv.includes("--strict") && warnings)) process.exitCode = 1;
