import { startTransition, useEffect, useState, type ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import Page from "../Page";
import { currentLocale, i18n, loadLocale, text } from "./config";
import { ExperienceContext } from "./context";
import { language, type Locale, type WritingMode } from "./languages";
import { applyMetadata } from "./metadata";
import { localePreferenceKey, writingPreferenceKey, localizedPath, splitLocale } from "./localeResolution";
export default function Experience(props: ComponentProps<typeof Page>) {
  useTranslation(undefined, {i18n});
  const locale = currentLocale();
  const [path, setPath] = useState(props.path);
  const [writingMode, setWriting] = useState<WritingMode>("horizontal");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [announcement, announce] = useState("");
  useEffect(() => {
    // A saved preference must not interrupt hydration of a lazy case-study boundary.
    try {const saved = localStorage.getItem(writingPreferenceKey);startTransition(() => setWriting(saved === "vertical" ? "vertical" : "horizontal"));} catch { /* Private browsing can disable storage. */ }
  }, []);
  useEffect(() => {
    applyMetadata(locale, path);
    document.documentElement.dataset.localeReady = locale;
    document.documentElement.dataset.writingMode = language(locale).writingModes.includes(writingMode) ? writingMode : "horizontal";
  }, [locale, path, writingMode]);
  useEffect(() => {
    const back = () => {
      const next = splitLocale(location.pathname).locale || "en";
      void loadLocale(next).then(() => i18n.changeLanguage(next)).then(() => setPath(location.pathname)).catch(() => setError(text("Could not load this language. Please try again.")));
    };
    window.addEventListener("popstate", back);
    return () => window.removeEventListener("popstate", back);
  }, []);
  const changeLocale = async (next: Locale) => {
    if (busy) return false;
    setBusy(true); setError("");
    try {
      await loadLocale(next);
      await i18n.changeLanguage(next);
      const destination = localizedPath(next, location.pathname) + location.search + location.hash;
      history.pushState({}, "", destination);
      setPath(location.pathname);
      try {localStorage.setItem(localePreferenceKey, next);} catch { /* Preferences still work in memory. */ }
      announce(text("Language changed to {{language}}.", {language: language(next).nativeName}));
      return true;
    } catch {setError(text("Could not load this language. Please try again."));return false;}
    finally {setBusy(false);}
  };
  return <ExperienceContext.Provider value={{path, locale, writingMode, busy, error, changeLocale, changeWritingMode: mode => {
    setWriting(mode); try {localStorage.setItem(writingPreferenceKey, mode);} catch { /* Optional persistence. */ }
  }}}>
    <Page {...props} path={splitLocale(path).path} />
    {error && <p role="alert">{error}</p>}
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
  </ExperienceContext.Provider>;
}
