import { lazy, Suspense, type ComponentType } from "react";
import App from "./App";
import RouteRecovery from "./RouteRecovery";
import NotFound from "./NotFound";
import { useFragmentNavigation } from "./useFragmentNavigation";
// Static rendering injects the resolved component; the browser fetches it only
// for this route. Do not include a client-only lazy import in the SSR bundle.
const LazyWorkWithMe = import.meta.env.SSR
  ? () => null
  : lazy(() => import("./WorkWithMe"));
const LazyIncident = import.meta.env.SSR
  ? () => null
  : lazy(() => import("./features/incident-zero/IncidentZeroRoute"));
const LazyDefence = import.meta.env.SSR
  ? () => null
  : lazy(() => import("./features/incident-zero/defence/DefenceRoute"));
const LazyNtmCaseStudy = import.meta.env.SSR
  ? () => null
  : lazy(() => import("./NoTwoMondaysCaseStudy"));
export default function Page({
  path,
  incidentComponent,
  defenceComponent,
  ntmCaseStudyComponent,
  workWithMeComponent,
}: {
  path: string;
  incidentComponent?: ComponentType;
  defenceComponent?: ComponentType;
  ntmCaseStudyComponent?: ComponentType;
  workWithMeComponent?: ComponentType;
}) {
  useFragmentNavigation(path);
  const route = path.replace(/\/$/, "");
  const WorkWithMe = workWithMeComponent || LazyWorkWithMe;
  const Incident = incidentComponent || LazyIncident;
  const Defence = defenceComponent || LazyDefence;
  const NtmCaseStudy = ntmCaseStudyComponent || LazyNtmCaseStudy;
  return route === "/no-two-mondays" ? (
    <RouteRecovery><Suspense fallback={<main className="container section"><p role="status">Loading the No Two Mondays case study…</p><a href="/">Return to portfolio</a></main>}><NtmCaseStudy /></Suspense></RouteRecovery>
  ) : route === "/incident-zero/defence" ? (
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
    <RouteRecovery><Suspense fallback={<main className="container section"><p role="status">Loading engineering engagements…</p><a href="/">Return to portfolio</a></main>}><WorkWithMe /></Suspense></RouteRecovery>
  ) : route === "" ? (
    <App />
  ) : <NotFound />;
}
