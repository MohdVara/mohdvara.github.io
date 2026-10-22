import { language, type Locale } from "./languages";
export const formatNumber = (value: number, locale: Locale, options?: Intl.NumberFormatOptions) => new Intl.NumberFormat(locale, options).format(value);
export const formatDate = (value: Date, locale: Locale, options?: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, {timeZone:"UTC", ...options}).format(value);
export type DatePrecision = "day" | "month" | "year";
const englishMonths = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const dateCache = new Map<string,string>();
/** A source month/year is an interval, never an invented exact local day. */
export function calendarDate(iso: string, locale: Locale, precision: DatePrecision = "day"): string {
  const cacheKey = `${locale}:${iso}:${precision}`;
  const cached = dateCache.get(cacheKey); if (cached) return cached;
  const [year,month = 1,day = 1] = iso.split("-").map(Number);
  const start = new Date(Date.UTC(year, precision === "year" ? 0 : month-1, precision === "day" ? day : 1,12));
  if (!Number.isFinite(start.getTime()) || start.getUTCFullYear()!==year) return iso;
  const {calendar,calendarLabel} = language(locale);
  const gregorian = precision === "year" ? String(year) : precision === "month" ? `${year}-${String(month).padStart(2,"0")}` : `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  if (calendar === "gregory") return formatDate(start,locale,{calendar:"gregory",year:"numeric",...(precision!=="year"?{month:"long" as const}:{}),...(precision==="day"?{day:"numeric" as const}:{})});
  try {
    const formatter = new Intl.DateTimeFormat(locale,{calendar,timeZone:"UTC",year:"numeric",...(precision !== "year" ? {month:"long" as const}:{}),...(precision === "day" ? {day:"numeric" as const}:{}),...(calendar === "japanese" || calendar === "indian" ? {era:"short" as const}:{})});
    let local = formatter.format(start);
    if (precision !== "day") {
      const end = new Date(Date.UTC(year,precision === "year" ? 12 : month,0,12));
      const last = formatter.format(end);
      if (last !== local) local += " – " + last;
    }
    const result = `${calendarLabel}: ${local} [${gregorian}]`;
    dateCache.set(cacheKey,result); return result;
  } catch {return gregorian;}
}
const monthPattern = englishMonths.map(month=>`${month}|${month.slice(0,3)}`).join("|");
const namedDate = new RegExp(`\\b(?:(\\d{1,2})\\s+)?(${monthPattern})\\s+(20\\d{2})\\b`,"g");
type RenderTemplate = (key: string, values: Record<string,string>) => string;
const dateAtom = `(?:20\\d{2}|(?:\\d{1,2}\\s+)?(?:${monthPattern})\\s+20\\d{2})`;
const onwardPeriod = new RegExp(`^(${dateAtom})\\s+onwards?$`);
const openPeriod = new RegExp(`^(${dateAtom})\\s*[–—-]\\s*(Present|ongoing collaboration)$`);
const closedPeriod = new RegExp(`^(${dateAtom})\\s*[–—-]\\s*(${dateAtom})$`);
function referenceDate(source: string, locale: Locale): string {
  if (/^20\d{2}$/.test(source)) return calendarDate(source,locale,"year");
  // A single atom has been checked against dateAtom above.
  const match = [...source.matchAll(namedDate)][0];
  const month = englishMonths.findIndex(item=>item.startsWith(match[2]))+1;
  return calendarDate(`${match[3]}-${String(month).padStart(2,"0")}${match[1]?"-"+match[1].padStart(2,"0"):""}`,locale,match[1]?"day":"month");
}
export function localizedPeriod(source: string, locale: Locale, render: RenderTemplate): string | undefined {
  const clean = source.trim();
  const since = clean.match(/^Since (20\d{2})$/);
  if (since) return render("Since {{date}}",{date:referenceDate(since[1],locale)});
  const onward = clean.match(onwardPeriod);
  if (onward) return render("{{date}} onward",{date:referenceDate(onward[1],locale)});
  const open = clean.match(openPeriod);
  if (open) return render(open[2] === "Present" ? "{{date}} — Present" : "{{date}} — ongoing collaboration",{date:referenceDate(open[1],locale)});
  const closed = clean.match(closedPeriod);
  if (closed) return render("{{start}} — {{end}}",{start:referenceDate(closed[1],locale),end:referenceDate(closed[2],locale)});
  return undefined;
}
/** Prose keeps its translated sentence; precise calendar equivalents follow it.
 * Never infer a year for '15 October', or treat versions/counts as dates. */
export function withCalendarDates(source: string, translated: string, locale: Locale, render?: RenderTemplate): string {
  if (locale !== "en" && render) {
    const period = localizedPeriod(source,locale,render);
    if (period) return period;
  }
  if (language(locale).calendar === "gregory") return translated;
  if (/^20\d{2}$/.test(source.trim())) return calendarDate(source.trim(),locale,"year");
  if (/^20\d{2}[–—-]20\d{2}$/.test(source.trim())) return source.trim().split(/[–—-]/).map(year=>calendarDate(year,locale,"year")).join(" — ");
  const matches = [...source.matchAll(namedDate)];
  const sinceYears = [...source.matchAll(/\bsince (20\d{2})\b/gi)];
  if (!matches.length && !sinceYears.length) return translated;
  const values = [...new Set([...matches.map(match=>{
    const month = englishMonths.findIndex(item=>item.startsWith(match[2]))+1;
    const iso = `${match[3]}-${String(month).padStart(2,"0")}${match[1]?"-"+match[1].padStart(2,"0"):""}`;
    return calendarDate(iso,locale,match[1]?"day":"month");
  }), ...sinceYears.map(match=>calendarDate(match[1],locale,"year"))])];
  if (matches.length===1 && matches[0][0]===source.trim()) return values[0];
  return `${translated} (${values.join("; ")})`;
}
