import { useEffect, useState } from "react";
import { text } from "./i18n/config";
import { readAnalyticsPreference, setAnalyticsPreference, subscribeAnalyticsPreference } from "./analyticsPreference";
export function TextSizeControl() {
  const [size, setSize] = useState("default");
  useEffect(() => {
    const sync = () => setSize(document.documentElement.dataset.textSize || "default");
    sync();
    window.addEventListener("text-size-change", sync);
    return () => window.removeEventListener("text-size-change", sync);
  }, []);
  return <label className="theme-control"><span>{text("Text size")}</span>
    <select aria-label={text("Text size")} value={size} onChange={(event) => {
      window.dispatchEvent(new CustomEvent("text-size-preference", { detail: event.target.value }));
    }}>
      <option value="default">{text("Default")}</option><option value="large">{text("Large")}</option><option value="largest">{text("Largest")}</option>
    </select>
  </label>;
}
export function AnalyticsControl() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const sync = () => setEnabled(readAnalyticsPreference());
    sync();
    return subscribeAnalyticsPreference(sync);
  }, []);
  return <div className="analytics-control">
    <label><input type="checkbox" checked={enabled} onChange={event => setAnalyticsPreference(event.target.checked)} aria-describedby="analytics-notice" />{text("Usage analytics")}</label>
    <p id="analytics-notice">{text("Optional usage events via PostHog: page paths and link intent, with a session identifier in this tab. No form contents, gameplay actions or recordings. Off until you enable it; switch off here to withdraw. Do Not Track and Global Privacy Control take priority.")}</p>
  </div>;
}
export function ThemeControl() {
  // Keep the server and first client render identical; the head script applies
  // the actual palette before paint, then this effect syncs the control.
  const [preference, setPreference] = useState("system");
  useEffect(() => {
    const sync = () => {
      setPreference(document.documentElement.dataset.themePreference || "system");
    };
    sync();
    window.addEventListener("theme-change", sync);
    return () => window.removeEventListener("theme-change", sync);
  }, []);
  return (
    <label className="theme-control">
      <span>{text("Theme")}</span>
      <select
        aria-label={text("Color theme")}
        value={preference}
        onChange={(event) => {
          window.dispatchEvent(
            new CustomEvent("theme-preference", {
              detail: event.target.value,
            }),
          );
        }}
      >
        <option value="system">{text("System")}</option>
        <option value="time">{text("Time of day")}</option>
        <option value="light">{text("Light")}</option>
        <option value="dark">{text("Dark")}</option>
      </select>
    </label>
  );
}
