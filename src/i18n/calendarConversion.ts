import tamil from "./tamilSolar.json";
import malaysian from "./malaysianHijri.json";
import type { DatePrecision } from "./formatting";

export const conversionRevision = `${tamil.revision}:${malaysian.revision}`;
const dayMs = 86400000;
const stamp = (iso: string) => Date.parse(`${iso}T12:00:00Z`);
const inRange = (date: Date, range: string[]) => date.getTime() >= stamp(range[0]) && date.getTime() <= stamp(range[1]);

/** Civil date tables, never the visitor's timezone or an inferred event time. */
export function tamilSolar(date: Date, precision: DatePrecision): string | undefined {
  if (!inRange(date, tamil.coverage)) return undefined;
  const row = [...tamil.boundaries].reverse().find(([iso]) => stamp(String(iso)) <= date.getTime());
  if (!row) return undefined;
  const [iso, month] = row as [string, number];
  const startYear = Number(iso.slice(0, 4)) - (month > 8 ? 1 : 0);
  const year = tamil.years[String(startYear) as keyof typeof tamil.years];
  if (!year) return undefined;
  if (precision === "year") return year;
  const day = precision === "day" ? ` ${Math.round((date.getTime() - stamp(iso)) / dayMs) + 1}` : "";
  return `${tamil.months[month]}${day}, ${year}`;
}


export function publishedMalaysianHijri(date: Date, precision: DatePrecision): string | undefined {
  if (!inRange(date, malaysian.coverage)) return undefined;
  const row = [...malaysian.boundaries].reverse().find(([iso]) => stamp(String(iso)) <= date.getTime()) as [string, number, number] | undefined;
  if (!row) return undefined;
  const [iso, year, month] = row;
  if (precision === "year") return `${year} H`;
  const day = precision === "day" ? `${Math.round((date.getTime() - stamp(iso)) / dayMs) + 1} ` : "";
  return `${day}${malaysian.months[month - 1]} ${year} H`;
}
