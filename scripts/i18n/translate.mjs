import {readJson, atomicJson, hash, planChanges, validateEntry} from "./shared.mjs";
import {createProvider} from "./provider.mjs";
const args = process.argv.slice(2);
const option = name => {const i = args.indexOf(name); return i >= 0 ? args[i+1] : undefined;};
const dry = args.includes("--dry-run");
const registry = await readJson("src/i18n/languages.json");
const exclusions = await readJson("scripts/i18n/exclusions.json");
const source = Object.fromEntries(Object.entries(await readJson("src/i18n/locales/en.json")).filter(([key]) => !exclusions.keys.includes(key)));
const metadata = await readJson("scripts/i18n/metadata.json");
const glossary = await readJson("scripts/i18n/glossary.json");
const requested = option("--locale");
if (requested && !registry.some(item => item.locale === requested && item.locale !== "en")) throw new Error(`Unsupported target locale: ${requested}`);
const provider = dry ? null : createProvider({apiKey:process.env.OPENAI_API_KEY,model:process.env.OPENAI_TRANSLATION_MODEL});
const rawConcurrency = Number(process.env.I18N_CONCURRENCY || 2);
const concurrency = Number.isFinite(rawConcurrency) ? Math.max(1, Math.min(4, Math.floor(rawConcurrency))) : 2;
let failures = 0;
for (const {locale} of registry.filter(item => item.locale !== "en" && (!requested || item.locale === requested))) {
  const file = `src/i18n/locales/${locale}.json`;
  const target = await readJson(file);
  const entries = metadata.locales[locale] ||= {};
  const plan = planChanges(source, target, entries, {force:args.includes("--force"),overrideReviewed:args.includes("--override-reviewed")});
  console.log(`${locale}: ${plan.pending.length} pending; ${plan.removed.length} removed; ${plan.protectedReviewed.length} stale reviewed (protected)`);
  if (dry) continue;
  for (const key of plan.removed) {
    if (entries[key]?.status === "human_reviewed" && !args.includes("--override-reviewed")) continue;
    delete target[key];delete entries[key];
  }
  // Related strings stay in canonical ordering; cap both string count and bytes.
  const batches = []; let batch = {}, bytes = 0;
  for (const key of plan.pending) {
    if (Object.keys(batch).length && (Object.keys(batch).length >= 24 || bytes + source[key].length > 5000)) {batches.push(batch);batch = {};bytes = 0;}
    batch[key] = source[key]; bytes += source[key].length;
  }
  if (Object.keys(batch).length) batches.push(batch);
  let cursor = 0, saving = Promise.resolve();
  const save = () => saving = saving.then(async () => {
    await atomicJson(file,target);
    await atomicJson("scripts/i18n/metadata.json",metadata);
  });
  await Promise.all(Array.from({length:concurrency}, async () => {
    while (cursor < batches.length) {
      const index = cursor++, strings = batches[index];
      try {
        const result = await provider.translate({locale,strings,glossary,context:"Professional portfolio: public work, factual qualifications, case studies, interface and accessibility labels. Never translate technical names or embellish scope."});
        for (const [key,value] of Object.entries(result.translations)) {
          const {errors,warnings} = validateEntry(source[key],value,glossary);
          if (errors.length) throw new Error(`Invalid translation for ${key}: ${errors.join(", ")}`);
          if (warnings.length) console.warn(`${locale}: review ${key}: ${warnings.join(", ")}`);
        }
        for (const [key,value] of Object.entries(result.translations)) {
          target[key] = value;
          entries[key] = {status:"machine_translated",sourceHash:hash(source[key]),provider:"openai",model:result.model};
        }
        const usage = metadata.usage ||= {inputTokens:0,outputTokens:0,estimatedCostUSD:0};
        usage.inputTokens += result.usage.input_tokens || 0;
        usage.outputTokens += result.usage.output_tokens || 0;
        usage.estimatedCostUSD += ((result.usage.input_tokens || 0) * Number(process.env.I18N_INPUT_USD_PER_MILLION || 0) + (result.usage.output_tokens || 0) * Number(process.env.I18N_OUTPUT_USD_PER_MILLION || 0))/1e6;
        usage.costRatesConfigured = Boolean(process.env.I18N_INPUT_USD_PER_MILLION && process.env.I18N_OUTPUT_USD_PER_MILLION);
        await save();
        console.log(`${locale}: saved batch ${index+1}/${batches.length}`);
      } catch (error) {failures++; console.error(`${locale}: batch ${index+1} failed: ${error.message}. Completed batches remain cached.`);}
    }
  }));
  await save();
}
if (failures) process.exitCode = 1;
