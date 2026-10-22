import registry from "./languages.json";
export type Locale = "en" | "ms" | "ar" | "ta" | "ja" | "zh-Hans" | "es" | "fr" | "de" | "pt-BR" | "hi";
export type WritingMode = "horizontal" | "vertical";
export const languages = registry as (Omit<typeof registry[number], "locale" | "direction"> & {locale: Locale; direction: "ltr" | "rtl"})[];
export const language = (locale: Locale) => languages.find(item => item.locale === locale)!;
export const isLocale = (value: string): value is Locale => languages.some(item => item.locale === value);
