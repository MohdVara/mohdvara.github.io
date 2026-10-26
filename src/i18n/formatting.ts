import { language, type Locale } from "./languages";
import { conversionRevision, publishedMalaysianHijri, tamilSolar } from "./calendarConversion";
export const formatNumber = (value: number, locale: Locale, options?: Intl.NumberFormatOptions) => new Intl.NumberFormat(locale, options).format(value);
export const formatDate = (value: Date, locale: Locale, options?: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, {timeZone:"UTC", ...options}).format(value);
export type DatePrecision = "day" | "month" | "year";
const englishMonths = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export type CalendarDisplayMode = "cultural" | "gregorian";
export const calendarPreferenceKey = "portfolio.calendar.v1";
export const isCalendarDisplayMode = (value: unknown): value is CalendarDisplayMode => value === "cultural" || value === "gregorian";
const dateCache = new Map<string,string>();
/** Reject rollover and precision mismatches before touching a converter. */
export function parseCanonicalDate(iso: string, precision: DatePrecision): {start: Date; end: Date} | undefined {
  const pattern = precision === "year" ? /^\d{4}$/ : precision === "month" ? /^\d{4}-\d{2}$/ : /^\d{4}-\d{2}-\d{2}$/;
  if (!pattern.test(iso)) return undefined;
  const [year, month = 1, day = 1] = iso.split("-").map(Number);
  if (year < 100 || month < 1 || month > 12 || day < 1) return undefined;
  const start = new Date(Date.UTC(year, month - 1, day, 12));
  if (start.getUTCFullYear() !== year || start.getUTCMonth() !== month - 1 || start.getUTCDate() !== day) return undefined;
  const end = precision === "day" ? start : new Date(Date.UTC(year, precision === "year" ? 12 : month, 0, 12));
  return {start, end};
}
/** A source month/year is an interval, never an invented exact local day. */
export function calendarDate(iso: string, locale: Locale, precision: DatePrecision = "day", mode: CalendarDisplayMode = "cultural"): string {
  const cacheKey = `${locale}:${iso}:${precision}:${mode}:${conversionRevision}`;
  const cached = dateCache.get(cacheKey); if (cached) return cached;
  const interval = parseCanonicalDate(iso, precision);
  if (!interval) return iso;
  const {start, end} = interval;
  const policy = language(locale);
  const calendar = mode === "gregorian" ? "gregory" : policy.calendar;
  const options: Intl.DateTimeFormatOptions = {timeZone:"UTC", year:"numeric", ...(precision !== "year" ? {month:"long" as const}:{}), ...(precision === "day" ? {day:"numeric" as const}:{})};
  const gregorian = () => formatDate(start,locale,{...options,calendar:"gregory"});
  if (calendar === "gregory") return gregorian();
  let label = policy.calendarLabel;
  try {
    let first: string | undefined, last: string | undefined;
    if (calendar === "tamil-solar") {
      first = tamilSolar(start,precision); last = tamilSolar(end,precision);
      if (!first || !last) return `கிரிகோரியன் (தமிழ் மாற்றம் சரிபார்க்கப்படவில்லை): ${gregorian()} [${iso}]`;
    } else if (calendar === "malaysian-hijri") {
      first = publishedMalaysianHijri(start,precision); last = publishedMalaysianHijri(end,precision);
      if (!first || !last) {
        // Explicit calculated approximation, never relabelled as official Malaysia data.
        label = "Hijri (anggaran kiraan tabular; bukan takwim rasmi Malaysia)";
        const formatter = new Intl.DateTimeFormat(locale,{...options,calendar:"islamic-civil"});
        if (formatter.resolvedOptions().calendar !== "islamic-civil") return gregorian();
        first = formatter.format(start); last = formatter.format(end);
      }
    } else {
      const formatter = new Intl.DateTimeFormat(locale,{...options,calendar,...(calendar === "japanese" || calendar === "indian" ? {era:"short" as const}:{})});
      if (formatter.resolvedOptions().calendar !== calendar) return gregorian();
      first = formatter.format(start); last = formatter.format(end);
    }
    const local = first === last ? first : `${first} – ${last}`;
    // Isolate the numeric reference from surrounding Arabic prose.
    const reference = locale === "ar" ? `\u2066[${iso}]\u2069` : `[${iso}]`;
    const result = `${label}: ${local} ${reference}`;
    dateCache.set(cacheKey,result); return result;
  } catch {return gregorian();}
}
const monthPattern = englishMonths.map(month=>`${month}|${month.slice(0,3)}`).join("|");
const namedDate = new RegExp(`\\b(?:(\\d{1,2})\\s+)?(${monthPattern})\\s+(20\\d{2})\\b`,"g");
type RenderTemplate = (key: string, values: Record<string,string>) => string;
const dateAtom = `(?:20\\d{2}|(?:\\d{1,2}\\s+)?(?:${monthPattern})\\s+20\\d{2})`;
const onwardPeriod = new RegExp(`^(${dateAtom})\\s+onwards?$`);
const openPeriod = new RegExp(`^(${dateAtom})\\s*[–—-]\\s*(Present|ongoing collaboration)$`);
const closedPeriod = new RegExp(`^(${dateAtom})\\s*[–—-]\\s*(${dateAtom})$`);
function referenceDate(source: string, locale: Locale, mode: CalendarDisplayMode): string {
  if (/^20\d{2}$/.test(source)) return calendarDate(source,locale,"year",mode);
  // A single atom has been checked against dateAtom above.
  const match = [...source.matchAll(namedDate)][0];
  const month = englishMonths.findIndex(item=>item.startsWith(match[2]))+1;
  return calendarDate(`${match[3]}-${String(month).padStart(2,"0")}${match[1]?"-"+match[1].padStart(2,"0"):""}`,locale,match[1]?"day":"month",mode);
}
export function localizedPeriod(source: string, locale: Locale, render: RenderTemplate, mode: CalendarDisplayMode = "cultural"): string | undefined {
  const clean = source.trim();
  const since = clean.match(/^Since (20\d{2})$/);
  if (since) return render("Since {{date}}",{date:referenceDate(since[1],locale,mode)});
  const onward = clean.match(onwardPeriod);
  if (onward) return render("{{date}} onward",{date:referenceDate(onward[1],locale,mode)});
  const open = clean.match(openPeriod);
  if (open) return render(open[2] === "Present" ? "{{date}} — Present" : "{{date}} — ongoing collaboration",{date:referenceDate(open[1],locale,mode)});
  const closed = clean.match(closedPeriod);
  if (closed) return render("{{start}} — {{end}}",{start:referenceDate(closed[1],locale,mode),end:referenceDate(closed[2],locale,mode)});
  return undefined;
}
/** Prose keeps its translated sentence; precise calendar equivalents follow it.
 * Never infer a year for '15 October', or treat versions/counts as dates. */
export function withCalendarDates(source: string, translated: string, locale: Locale, render?: RenderTemplate, mode: CalendarDisplayMode = "cultural"): string {
  if (locale !== "en" && render) {
    const period = localizedPeriod(source,locale,render,mode);
    if (period) return period;
  }
  if (mode === "gregorian" || language(locale).calendar === "gregory") return translated;
  if (/^20\d{2}$/.test(source.trim())) return calendarDate(source.trim(),locale,"year",mode);
  if (/^20\d{2}[–—-]20\d{2}$/.test(source.trim())) return source.trim().split(/[–—-]/).map(year=>calendarDate(year,locale,"year",mode)).join(" — ");
  const matches = [...source.matchAll(namedDate)];
  const sinceYears = [...source.matchAll(/\bsince (20\d{2})\b/gi)];
  if (!matches.length && !sinceYears.length) return translated;
  const values = [...new Set([...matches.map(match=>{
    const month = englishMonths.findIndex(item=>item.startsWith(match[2]))+1;
    const iso = `${match[3]}-${String(month).padStart(2,"0")}${match[1]?"-"+match[1].padStart(2,"0"):""}`;
    return calendarDate(iso,locale,match[1]?"day":"month",mode);
  }), ...sinceYears.map(match=>calendarDate(match[1],locale,"year",mode))])];
  if (matches.length===1 && matches[0][0]===source.trim()) return values[0];
  return `${translated} (${values.join("; ")})`;
}
