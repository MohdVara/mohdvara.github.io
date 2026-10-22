// Evidence queue, not a linguistic certification or a warning suppression list.
import {readJson,validateEntry,hash,atomicJson} from './shared.mjs';
const source=await readJson('src/i18n/locales/en.json');
const registry=await readJson('src/i18n/languages.json');
const metadata=await readJson('scripts/i18n/metadata.json');
const glossary=await readJson('scripts/i18n/glossary.json');
const accepted=new Map([
 ['AWS ECS','Cloud service identifier'],['Active Storage','Rails component name'],['Google Cloud (GCP)','Cloud service identifier'],['Microsoft Azure','Cloud service identifier'],['MMCATS Modern','Project identifier'],
 ['Incident Zero | Mohd. Paramasvara','Project and author title'],['MMCATS Modern | Mohd. Paramasvara','Project and author title'],['No Two Mondays | Mohd. Paramasvara','Project and author title'],['System Defence — Incident Zero | Mohd. Paramasvara','Project and author title'],['← Incident Zero','Directional navigation glyph plus project identifier'],['TypeScript · React · Transformers.js · MiniLM · Web Workers','Technical stack identifiers'],
]);
const critical=[
 ['Principal Full-Stack Engineer','Job level; do not inflate into management or change level.'],
 ['Technical Lead & Software Architect','Technical leadership and architecture roles, not a certified qualification.'],
 ['Locally verified · public release blocked','Local checks do not authorize public release.'],
 ['Local prototype · public studio pending','Prototype exists locally; public studio not released.'],
 ['Implemented · editorial review pending','Implementation complete does not imply fluent review.'],
 ['Production status not independently verified.','Absence of independent verification, not a declaration of failure.'],
 ['Public source and recorded verification are available for inspection. Source publication does not authorize application deployment; security and provider acceptance remain blocked or unverified.','Source availability is separate from security/deployment authorization.'],
 ['Independent project · historical campaign','Historical independent verification, not commercial production.'],
 ['Experimental engineering demonstration','Experiment, not production certification.'],
 ['Machine translated from English','Machine origin must remain explicit.'],
 ['View Original English Version','Access corresponding canonical English page.'],
 ['This page has been automatically translated from English. Translations may contain errors, inaccuracies, or differences in meaning. For the most accurate information about my professional experience, projects, and achievements, please refer to the original English version.','Preserve machine origin, possible errors/difference and canonical English boundary.'],
 ['My ownership','Individual contribution scope; do not imply sole delivery.'],
 ['I directed the modernization, defined parity contracts and reviewed implementation and verification.','Direction/contracts/review; do not add historical data migration.'],
 ['Professional delivery','Commercial work navigation, not delivery guarantee.'],
 ['Independent engineering','Independent technical work, not employment.'],
 ['Compare artwork','Compare saved artifacts, not launch a public studio.'],
 ['Delivery decisions','Navigate to existing documented commercial decisions.'],
 ['Book a conversation','Introductory contact action, no guaranteed engagement.'],
 ['Copy email','Copy address locally; do not send email.'],
 ['PACE-RAG supports English questions and answers only. Please ask your question in English.','Only conversation content stays English; surrounding UI is localized.'],
];
const warnings=[],criticalUnits=[],failures=[];
for(const {locale}of registry.filter(x=>x.locale!=='en')){
 const target=await readJson(`src/i18n/locales/${locale}.json`);
 for(const [key,english]of Object.entries(source)){
  const check=validateEntry(english,target[key],glossary);const provenance=metadata.locales[locale]?.[key];
  if(check.errors.length||provenance?.sourceHash!==hash(english))failures.push({locale,key,errors:check.errors,stale:provenance?.sourceHash!==hash(english)});
  if(check.warnings.length)warnings.push({locale,key,canonical:english,translation:target[key],warnings:check.warnings,classification:accepted.has(key)?'T3':'T2',reason:accepted.get(key)||'Unchanged prose/interface wording; qualified contextual review required.',status:accepted.has(key)?'TECHNICAL_IDENTIFIER_ACCEPTED':'HUMAN_REVIEW_PENDING',provenance});
 }
 for(const [key,meaning]of critical){if(!source[key])throw Error('Missing critical source: '+key);criticalUnits.push({locale,key,canonical:source[key],translation:target[key],meaning,classification:'REVIEW_PRIORITY_A_B_C',severity:'NOT_DIAGNOSED',concern:'Consequential meaning requires qualified linguistic confirmation; no material defect established by automated checks.',suggested_revision:null,reviewer_question:'Does this preserve the stated meaning, negation, ownership and scope in natural domain language?',status:'HUMAN_REVIEW_PENDING',technical_status:'MACHINE_TRANSLATED_AUTOMATICALLY_CHECKED',provenance:metadata.locales[locale][key],reviewer:null,review_evidence:null});}
}
const report={schema_version:'1.0',observed_at:new Date().toISOString(),scope:'All ten non-English catalogs checked mechanically; prioritized consequential units queued. Model-assisted triage is not fluent review.',locales:registry.map(x=>x.locale),units_per_locale:Object.keys(source).length,errors:failures,warnings_before:98,warnings_after:warnings.length,warning_classifications:{T0:0,T1:0,T2:warnings.filter(x=>x.classification==='T2').length,T3:warnings.filter(x=>x.classification==='T3').length},corrections:{T1:1,T2:1,details:'pt-BR Reactinterface → Interface React; fr React interface → Interface React. Remain machine translated.'},warnings,critical_units:criticalUnits,human_reviewed:0,limits:['No semantic accuracy percentage','T0=0 means none diagnosed, not proof none exist','Date/browser rendering checked separately','English career ambiguities remain owner questions; no canonical claims changed']};
await atomicJson('verification/portfolio-translation-editorial-v1.json',report);
console.log(JSON.stringify({warnings:report.warnings_after,classifications:report.warning_classifications,criticalUnits:criticalUnits.length,mechanicalErrors:failures.length}));if(failures.length)process.exitCode=1;
