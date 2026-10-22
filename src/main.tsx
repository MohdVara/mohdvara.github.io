import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./index.css";
import "./i18n/i18n.css";
import RouteRecovery from "./RouteRecovery";
import Experience from "./i18n/Experience";
import { i18n, loadLocale } from "./i18n/config";
import { applyMetadata } from "./i18n/metadata";
import { localePreferenceKey, localizedPath, resolveLocale, routes, splitLocale } from "./i18n/localeResolution";
import { startAnalytics } from "./analytics";

export async function startup() {
  let saved: string | null = null;
  try {saved = localStorage.getItem(localePreferenceKey);} catch { /* Optional persistence. */ }
  const initialPath = window.location.pathname;
  let locale = resolveLocale(initialPath, saved, navigator.languages || [navigator.language]);
  try {await loadLocale(locale);}
  catch {locale = "en";}
  await i18n.changeLanguage(locale);
  // Keep the unprefixed route as an x-default static entry. Redirect only known
  // application routes; assets and 404s never enter a locale redirect loop.
  const route = splitLocale(initialPath).path.replace(/\/?$/, "/");
  const knownRoute = routes.includes(route);
  if (!splitLocale(initialPath).locale && knownRoute)
    history.replaceState({}, "", localizedPath(locale, initialPath) + location.search + location.hash);
  applyMetadata(locale, window.location.pathname);
  const root = document.getElementById("root")!;
  const app = <StrictMode><RouteRecovery><Experience path={window.location.pathname} /></RouteRecovery></StrictMode>;
  // A changed auto-detected language cannot hydrate an English static tree.
  const serverLocale = root.dataset.locale || "en";
  if (serverLocale === locale && root.querySelector("main") && (knownRoute || root.querySelector("#missing-title"))) hydrateRoot(root, app);
  else createRoot(root).render(app);
  void startAnalytics();
}
void startup().catch(() => window.dispatchEvent(new Event("portfolio:failed")));
