import { withCalendarDates } from "./formatting";
import { translateSource } from "./lookup";
import { localizeHref } from "./localeResolution";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { isValidElement, type ReactNode } from "react";
import en from "./locales/en.json";
import { isLocale, type Locale } from "./languages";

export const i18n = i18next.createInstance();
void i18n.use(initReactI18next).init({
  lng: "en", fallbackLng: "en", resources: {en: {translation: en}},
  initAsync: false, keySeparator: false, nsSeparator: false,
  interpolation: {escapeValue: false}, returnEmptyString: false,
  react: {useSuspense: false},
});
const loaders = import.meta.glob<Record<string, string>>(["./locales/*.json", "!./locales/en.json"], {import: "default"});
const pending = new Map<Locale, Promise<void>>();
export function loadLocale(locale: Locale): Promise<void> {
  if (i18n.hasResourceBundle(locale, "translation")) return Promise.resolve();
  if (!pending.has(locale)) pending.set(locale, (async () => {
    try {
      const data = await loaders[`./locales/${locale}.json`]();
      i18n.addResourceBundle(locale, "translation", data);
    } finally { pending.delete(locale); }
  })());
  return pending.get(locale)!;
}
export function currentLocale(): Locale { return isLocale(i18n.language) ? i18n.language : "en"; }
export function text(source: string, values?: Record<string, string | number>): string {
  const translated = translateSource(source, en, (key, interpolation) => i18n.t(key, {defaultValue: key, ...interpolation}), values);
  return withCalendarDates(source, translated, currentLocale(), (key, interpolation) => i18n.t(key, {defaultValue: key, ...interpolation}));
}
export function localizedContent(value: ReactNode): ReactNode {
  if (typeof value === "string") return text(value);
  if (Array.isArray(value)) return value.map(localizedContent);
  if (isValidElement(value)) return value;
  return value;
}

export function localizedHref(href: string): string { return localizeHref(href, currentLocale()); }

export function labelParts(source: string): string { return source.split(" · ").map(part => text(part)).join(" · "); }
