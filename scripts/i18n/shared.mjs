import {readFile, writeFile, rename} from "node:fs/promises";
import {createHash} from "node:crypto";
export const readJson = async path => JSON.parse(await readFile(path, "utf8"));
export const hash = value => createHash("sha256").update(value).digest("hex");
export async function atomicJson(path, data) {
  const temporary = `${path}.tmp`;
  await writeFile(temporary, JSON.stringify(data, null, 2) + "\n");
  await rename(temporary, path);
}
export const placeholders = value => [...value.matchAll(/\{\{\s*([^}]+?)\s*\}\}/g)].map(match => match[1]).sort();
export function validateEntry(source, target, glossary = {protected: []}) {
  const errors = [], warnings = [];
  if (typeof target !== "string" || !target.trim()) return {errors:["empty or non-string value"], warnings};
  if (JSON.stringify(placeholders(source)) !== JSON.stringify(placeholders(target))) errors.push("interpolation placeholders differ");
  if (/<\/?[a-z][^>]*>/i.test(target)) errors.push("HTML is not supported; use plain text");
  if (/[\u202a-\u202e\u2066-\u2069]/u.test(target)) errors.push("unexpected bidi control characters");
  for (const term of glossary.protected) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`(?<!\\w)${escaped}(?!\\w)`).test(source) && !target.includes(term)) errors.push(`protected term changed: ${term}`);
  }
  if (target.length > Math.max(100, source.length * 4)) warnings.push("excessive expansion; review");
  if (source === target && /[A-Za-z]{3,}\s+[A-Za-z]{3,}/.test(source)) warnings.push("unchanged English; review or record as invariant");
  if (/\{[^{}]*(?:plural|select)\s*,/.test(source)) errors.push("ICU is not configured; use i18next plural keys");
  return {errors, warnings};
}
export function coverage(source, target, entries) {
  let translated = 0, reviewed = 0, stale = 0, missing = 0;
  for (const [key, value] of Object.entries(source)) {
    if (typeof target[key] !== "string" || !target[key].trim()) {missing++;continue;}
    translated++;
    if (entries[key]?.status === "human_reviewed") reviewed++;
    if (entries[key]?.sourceHash !== hash(value)) stale++;
  }
  return {total:Object.keys(source).length, translated, humanReviewed:reviewed, stale, missing, percent:Number((translated / Object.keys(source).length * 100).toFixed(2))};
}
export function planChanges(source, target, metadata, {force = false, overrideReviewed = false} = {}) {
  const pending = [], protectedReviewed = [], removed = Object.keys(target).filter(key => !(key in source));
  for (const [key, value] of Object.entries(source)) {
    const entry = metadata[key];
    const changed = !target[key] || entry?.sourceHash !== hash(value);
    if (entry?.status === "human_reviewed" && !overrideReviewed) {
      if (changed) protectedReviewed.push(key);
      continue;
    }
    if (force || changed) pending.push(key);
  }
  return {pending, protectedReviewed, removed};
}
