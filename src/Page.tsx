import { lazy, Suspense, useEffect, type ComponentType } from "react";
import App from "./App";
import WorkWithMe from "./WorkWithMe";
import RouteRecovery from "./RouteRecovery";
import NotFound from "./NotFound";
// Static rendering injects the resolved component; the browser fetches it only
// for this route. Do not include a client-only lazy import in the SSR bundle.
const LazyIncident = import.meta.env.SSR
  ? () => null
  : lazy(() => import("./features/incident-zero/IncidentZeroRoute"));
const LazyDefence = import.meta.env.SSR
  ? () => null
  : lazy(() => import("./features/incident-zero/defence/DefenceRoute"));
export default function Page({
  path,
  incidentComponent,
  defenceComponent,
}: {
  path: string;
  incidentComponent?: ComponentType;
  defenceComponent?: ComponentType;
}) {
  useEffect(() => {
    // Vite renders into an empty root, so native fragment navigation can run
    // before its target exists. Wait for the rendered page's font geometry.
    const hash = window.location.hash;
    if (!hash) return;
    let cancelled = false;
    let frame = 0;
    const cancel = () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
    const events = ["pointerdown", "wheel", "touchstart", "keydown"] as const;
    events.forEach((event) =>
      window.addEventListener(event, cancel, { passive: true, once: true }),
    );
    void document.fonts.ready.then(() => {
      if (cancelled || window.location.hash !== hash) return;
      frame = requestAnimationFrame(() => {
        let id: string;
        try {
          id = decodeURIComponent(hash.slice(1));
        } catch {
          return;
        }
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: "instant", block: "start" });
      });
    });
    return () => {
      cancel();
      events.forEach((event) => window.removeEventListener(event, cancel));
    };
  }, [path]);
  const route = path.replace(/\/$/, "");
  const Incident = incidentComponent || LazyIncident;
  const Defence = defenceComponent || LazyDefence;
  return route === "/incident-zero/defence" ? (
    <RouteRecovery><Suspense fallback={<main className="container section"><p role="status">Initialising System Defence…</p><a href="/incident-zero/">Return to Incident Zero</a></main>}>
      <Defence />
    </Suspense></RouteRecovery>
  ) : route === "/incident-zero" ? (
    <RouteRecovery><Suspense
      fallback={
        <main className="container section">
          <p role="status">Initialising Incident Zero…</p>
          <a href="/">Return to portfolio</a>
        </main>
      }
    >
      <Incident />
    </Suspense></RouteRecovery>
  ) : route === "/work-with-me" ? (
    <WorkWithMe />
  ) : route === "" ? (
    <App />
  ) : <NotFound />;
}
