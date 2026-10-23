import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { text } from "./i18n/config";
import { useExperience } from "./i18n/context";
import { language } from "./i18n/languages";
import { readSceneryPreference, subscribeSceneryPreference } from "./AsciiForest/preference";
import { readAnalyticsPreference, subscribeAnalyticsPreference } from "./analyticsPreference";
import "./UtilityRail.css";

const Preferences = lazy(() => import("./UtilityPanel").catch(() => ({ default: () => <button onClick={() => location.reload()}>{text("Retry")}</button> })));

type Control = "language" | "theme" | "size" | "motion" | "privacy";
const controls: Control[] = ["language", "theme", "size", "motion", "privacy"];
function Icon({ control, paused, light }: { control: Control; paused: boolean; light: boolean }) {
  if (control === "theme" || control === "size" || control === "motion") return <span className="utility-symbol" aria-hidden="true">{control === "theme" ? light ? "☀" : "☾" : control === "size" ? "Aa" : paused ? "▷" : "Ⅱ"}</span>;
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    {control === "language" ? <><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/></> : <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Zm-4 9 3 3 5-6"/>}
  </svg>;
}
export default function UtilityRail() {
  const { locale, path } = useExperience();
  const [active, setActive] = useState<Control | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [state, setState] = useState({ light: false, motion: true, consent: false, suppressed: false, size: "default" });
  const root = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const close = useCallback((restore = true) => {
    if (restore && panel.current?.contains(document.activeElement)) trigger.current?.focus({ preventScroll: true });
    setActive(null);
  }, []);
  useEffect(() => {
    const sync = () => setState({ light: document.documentElement.dataset.theme === "light", motion: readSceneryPreference(), consent: readAnalyticsPreference(), suppressed: navigator.doNotTrack === "1" || !!(navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl, size: document.documentElement.dataset.textSize || "default" });
    sync();
    const stops = [subscribeSceneryPreference(sync), subscribeAnalyticsPreference(sync)];
    window.addEventListener("theme-change", sync); window.addEventListener("text-size-change", sync);
    return () => { stops.forEach(stop => stop()); window.removeEventListener("theme-change", sync); window.removeEventListener("text-size-change", sync); };
  }, []);
  useEffect(() => {
    if (active) panel.current?.focus({ preventScroll: true });
  }, [active]);
  useEffect(() => { close(); }, [path, close]);
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) { close(); } };
    const back = () => close();
    // Navigation and fullscreen viewers take precedence over this nonmodal disclosure.
    const overlay = () => { if (document.querySelector('.mobile-menu[open]')) { close(false); setExpanded(false); } };
    document.addEventListener("pointerdown", outside); document.addEventListener("toggle", overlay, true); window.addEventListener("popstate", back); window.addEventListener("hashchange", back);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("toggle", overlay, true); window.removeEventListener("popstate", back); window.removeEventListener("hashchange", back); };
  }, [close]);
  const labels = { language: text("Language"), theme: text("Theme"), size: text("Text size"), motion: text("Animated scenery"), privacy: text("Privacy") };
  const values = { language: `${language(locale).nativeName} · ${locale}`, theme: state.light ? text("Light") : text("Dark"), size: state.size === "largest" ? text("Largest") : state.size === "large" ? text("Large") : text("Default"), motion: state.motion ? text("Enabled") : text("Paused"), privacy: state.suppressed ? text("Tracking suppressed by your privacy signal.") : state.consent ? text("Analytics on") : text("Analytics off") };
  return <aside ref={root} className="utility-rail" aria-label={text("Settings")} data-expanded={expanded} onKeyDown={event => {
    if (event.key === "Escape") { event.stopPropagation(); close(); if (!active) { setExpanded(false); root.current?.querySelector<HTMLButtonElement>(".utility-entry")?.focus({ preventScroll: true }); } }
  }}>
    <button className="utility-entry" aria-label={expanded ? text("Close settings") : text("Open settings")} aria-expanded={expanded} aria-controls="utility-controls" onClick={() => { close(); setExpanded(!expanded); }}><span aria-hidden="true">{expanded ? "×" : "⚙"}</span></button>
    <div className="utility-controls" id="utility-controls" role="group" aria-label={text("Settings")}>
      {controls.map(control => <button key={control} data-control={control} aria-label={`${labels[control]}: ${values[control]}`} aria-expanded={active === control} aria-controls={active === control ? "utility-panel" : undefined} onClick={event => {
        document.querySelectorAll<HTMLDetailsElement>(".mobile-menu[open]").forEach(menu => { menu.open = false; });
        trigger.current = event.currentTarget; setActive(active === control ? null : control);
      }}>
        <Icon control={control} paused={!state.motion} light={state.light}/>
        {control === "language" && <small aria-hidden="true">{locale.split("-")[0]}</small>}
        <span className="utility-tooltip" aria-hidden="true">{labels[control]} · {values[control]}</span>
      </button>)}
    </div>
    {active && <div className="utility-panel" id="utility-panel" ref={panel} role="region" aria-labelledby="utility-title" tabIndex={-1}>
      <div className="utility-panel-heading"><h2 id="utility-title">{labels[active]}</h2><button aria-label={text("Close settings")} onClick={() => close()}>×</button></div>
      <p className="utility-current" role="status">{values[active]}</p>
      <Suspense fallback={<p role="status">{labels[active]}</p>}><Preferences control={active} close={close} /></Suspense>
    </div>}
  </aside>;
}
