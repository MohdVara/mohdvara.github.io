import { isLocale, type Locale } from "./languages";
export const localePreferenceKey = "portfolio.locale.v1";
export const writingPreferenceKey = "portfolio.writing.v1";
export function browserLocale(value: string): Locale | undefined {
  const normalized = value.toLowerCase().replace(/_/g, "-");
  if (normalized === "zh" || normalized.startsWith("zh-hans") || /^zh-(cn|sg)(-|$)/.test(normalized)) return "zh-Hans";
  // Traditional Chinese is deliberately unsupported; try the next browser
  // preference, then English. Never silently substitute Simplified Chinese.
  if (normalized.startsWith("zh")) return undefined;
  if (normalized === "pt" || normalized.startsWith("pt-")) return "pt-BR";
  const base = normalized.split("-")[0];
  return isLocale(base) ? base : undefined;
}
export function splitLocale(path: string): {locale?: Locale; path: string} {
  const [first, ...rest] = path.replace(/^\//, "").split("/");
  return isLocale(first) ? {locale: first, path: "/" + rest.join("/")} : {path};
}
export function resolveLocale(path: string, saved: string | null, preferred: readonly string[]): Locale {
  return splitLocale(path).locale || (saved && isLocale(saved) ? saved : undefined) || preferred.map(browserLocale).find(Boolean) || "en";
}
export const routes = ["/", "/work-with-me/", "/no-two-mondays/", "/pace-rag-case-study/", "/incident-zero/", "/incident-zero/defence/"];
export function localizedPath(locale: Locale, path: string) {
  const clean = splitLocale(path).path;
  return `/${locale}${clean.startsWith("/") ? clean : "/" + clean}`;
}
export function localizeHref(href: string, locale: Locale) {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const [pathname] = href.split(/[?#]/);
  const unlocalized = splitLocale(pathname).path;
  if (!routes.includes(unlocalized.endsWith("/") ? unlocalized : unlocalized + "/")) return href;
  return localizedPath(locale, href);
}
