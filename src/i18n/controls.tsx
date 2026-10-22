import { useEffect, useRef, useState, type ReactNode } from "react";
import { language, languages } from "./languages";
import { useExperience } from "./context";
import { text } from "./config";
import status from "./status.json";
import { localizedPath } from "./localeResolution";
export function LanguageSwitcher() {
  const {locale, changeLocale, busy} = useExperience();
  const panel = useRef<HTMLDetailsElement>(null);
  return <details className="language-control" ref={panel} onKeyDown={event => {
    if (event.key === "Escape" && panel.current) {panel.current.open = false; panel.current.querySelector("summary")?.focus();}
  }}>
    <summary aria-label={text("Language")}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/></svg><bdi>{language(locale).nativeName}</bdi></summary>
    <div className="language-panel">
      <label><span>{text("Language")}</span><select aria-label={text("Language")} value={locale} aria-busy={busy} onChange={event => {
        const selected = languages.find(item => item.locale === event.target.value);
        if (selected) changeLocale(selected.locale);
      }}>{languages.map(item => <option key={item.locale} value={item.locale} lang={item.locale} dir={item.direction}>{item.nativeName} · {item.englishName}</option>)}</select></label>
      {locale !== "en" && <p className="translation-status">{text("Machine translated from English")}</p>}
      <ReadingModeToggle />
    </div>
  </details>;
}
export function ReadingModeToggle() {
  const {locale, writingMode, changeWritingMode} = useExperience();
  if (!language(locale).writingModes.includes("vertical")) return null;
  return <label className="reading-control"><span>{text("Reading mode")}</span><select aria-label={text("Reading mode")} value={writingMode} onChange={event => changeWritingMode(event.target.value === "vertical" ? "vertical" : "horizontal")}><option value="horizontal">{text("Horizontal")}</option><option value="vertical">{text("Vertical")}</option></select></label>;
}
export function VerticalText({children}: {children: ReactNode}) {
  const {locale, writingMode} = useExperience();
  return <span className={writingMode === "vertical" && language(locale).writingModes.includes("vertical") ? "vertical-text" : undefined}>{children}</span>;
}
export function TranslationNotice() {
  const {locale, path, changeLocale} = useExperience();
  const [suffix, setSuffix] = useState("");
  useEffect(() => {
    const update = () => setSuffix(window.location.search + window.location.hash);
    update();window.addEventListener("hashchange", update);window.addEventListener("popstate", update);
    return () => {window.removeEventListener("hashchange", update);window.removeEventListener("popstate", update);};
  }, [path]);
  if (locale === "en") return null;
  const href = localizedPath("en", path) + suffix;
  return <aside className="translation-notice container" aria-labelledby="translation-notice-title">
    <div className="translation-notice-panel">
      <details className="translation-disclosure">
      <summary><svg className="translation-info-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/></svg>
        <h2 id="translation-notice-title">{text("Machine Translation Notice")}</h2><span className="translation-chevron" aria-hidden="true">⌄</span></summary>
        <p>{text("This page has been automatically translated from English. Translations may contain errors, inaccuracies, or differences in meaning. For the most accurate information about my professional experience, projects, and achievements, please refer to the original English version.")}</p>
        {status[locale].missing > 0 && <p>{text("Some sections are still in English.")}</p>}
      </details>
        <a className="translation-original text-link" href={href} hrefLang="en" onClick={event => {
          if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {event.preventDefault();changeLocale("en");}
        }}>{text("View Original English Version")}</a>
    </div>
  </aside>;
}

export function NamePronunciation() {
  const {locale} = useExperience();
  return <div className="name-pronunciation">
    <p className="eyebrow">{text("Name pronunciation (approximate)")}</p>
    <p><bdi dir="auto" lang={locale}>{language(locale).pronunciation}</bdi></p>
  </div>;
}

export function HeroNameReading({portrait = false}: {portrait?: boolean}) {
  const {locale} = useExperience();
  const native = language(locale).nativeNameReading;
  if (!native) return null;
  const cjk = language(locale).writingModes.includes("vertical");
  if (portrait !== cjk) return null;
  return <p className={cjk ? "hero-native-name hero-native-column" : "hero-native-name"} lang={locale} dir={language(locale).direction}>
    <span className="sr-only">{text("Name pronunciation (approximate)")}: </span><bdi><span className="native-given-name">{native.given}</span><span className="native-name-separator">{cjk ? "・" : " "}</span><span className="native-family-name">{native.family}</span></bdi>
  </p>;
}
