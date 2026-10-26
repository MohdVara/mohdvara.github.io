import { startTransition, useEffect, useRef, useState, type ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import Page from "../Page";
import UtilityRail from "../UtilityRail";
import { currentLocale, i18n, loadLocale, text, setCalendarModeForText } from "./config";
import { ExperienceContext } from "./context";
import { language, type Locale, type WritingMode } from "./languages";
import { applyMetadata } from "./metadata";
import { localePreferenceKey, writingPreferenceKey, localizedPath, splitLocale } from "./localeResolution";
import { createLocaleRestorer } from "./history";
import { calendarPreferenceKey, isCalendarDisplayMode, type CalendarDisplayMode } from "./formatting";
export default function Experience(props: ComponentProps<typeof Page>) {
  useTranslation(undefined, {i18n});
  const locale = currentLocale();
  const [calendarMode, setCalendarMode] = useState<CalendarDisplayMode>("cultural");
  // Match static HTML on the first render. A transition lets lazy SSR boundaries hydrate first.
  setCalendarModeForText(calendarMode);
  const [path, setPath] = useState(props.path);
  const [writingPreference, setWriting] = useState<WritingMode | null>(null);
  const writingMode = writingPreference ?? language(locale).defaultWritingMode;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [announcement, announce] = useState("");
  const navigation = useRef(0);
  const historySync = useRef<ReturnType<typeof createLocaleRestorer>>();
  useEffect(() => {
    // FirstFrame fires only after the content inside the route's Suspense boundary
    // has committed. Restoring sooner changes imperative text() during hydration.
    const restoreCalendar = () => {
      try { const saved = localStorage.getItem(calendarPreferenceKey); if (isCalendarDisplayMode(saved)) startTransition(() => setCalendarMode(saved)); } catch { /* Storage is optional. */ }
    };
    window.addEventListener("portfolio:ready", restoreCalendar, {once:true});
    // A saved preference must not interrupt hydration of a lazy case-study boundary.
    try {const saved = localStorage.getItem(writingPreferenceKey);if (saved === "vertical" || saved === "horizontal") startTransition(() => setWriting(saved));} catch { /* Private browsing can disable storage. */ }
    return () => window.removeEventListener("portfolio:ready", restoreCalendar);
  }, []);
  useEffect(() => {
    applyMetadata(locale, path);
    document.documentElement.dataset.localeReady = locale;
    document.documentElement.dataset.writingMode = language(locale).writingModes.includes(writingMode) ? writingMode : "horizontal";
  }, [locale, path, writingMode]);
  useEffect(() => {
    const sync = createLocaleRestorer({
      path: () => location.pathname,
      load: loadLocale,
      change: next => i18n.changeLanguage(next),
      commit: restored => { setPath(restored); setError(""); },
      failed: () => setError(text("Could not load this language. Please try again.")),
    });
    historySync.current = sync;
    const invalidate = () => { navigation.current++; };
    const back = () => {
      invalidate();
      void sync.restore();
    };
    const restored = (event: PageTransitionEvent) => { if (event.persisted) back(); };
    window.addEventListener("popstate", back);
    window.addEventListener("pageshow", restored);
    return () => { sync.cancel(); invalidate(); window.removeEventListener("popstate", back); window.removeEventListener("pageshow", restored); };
  }, []);
  const changeLocale = async (next: Locale) => {
    if (busy) return false;
    historySync.current?.cancel();
    const current = ++navigation.current;
    setBusy(true); setError("");
    try {
      await loadLocale(next);
      if (current !== navigation.current) return false;
      await i18n.changeLanguage(next);
      if (current !== navigation.current) return false;
      const destination = localizedPath(next, location.pathname) + location.search + location.hash;
      history.pushState({}, "", destination);
      setPath(location.pathname);
      try {localStorage.setItem(localePreferenceKey, next);} catch { /* Preferences still work in memory. */ }
      announce(text("Language changed to {{language}}.", {language: language(next).nativeName}));
      return true;
    } catch {if (current === navigation.current) setError(text("Could not load this language. Please try again."));return false;}
    finally {setBusy(false);}
  };
  return <ExperienceContext.Provider value={{path, locale, calendarMode, changeCalendarMode: mode => {
    if (!isCalendarDisplayMode(mode)) return;
    startTransition(() => setCalendarMode(mode));
    try { localStorage.setItem(calendarPreferenceKey, mode); } catch { /* Keep the in-memory selection. */ }
  }, writingMode, busy, error, changeLocale, changeWritingMode: mode => {
    setWriting(mode); try {localStorage.setItem(writingPreferenceKey, mode);} catch { /* Optional persistence. */ }
  }}}>
    <Page {...props} path={splitLocale(path).path} />
    <UtilityRail />
    {error && <p role="alert">{error}</p>}
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
  </ExperienceContext.Provider>;
}
