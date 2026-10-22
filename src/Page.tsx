import { localizedHref } from "./i18n/config";
import { text } from "./i18n/config";
import { lazy, Suspense, type ComponentType } from "react";
import FirstFrame from "./FirstFrame";
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
const LazyPaceRagCaseStudy = import.meta.env.SSR ? () => null : lazy(() => import("./PaceRagCaseStudy"));
const LazyEngineeringCaseStudy = import.meta.env.SSR ? () => null : lazy(() => import("./EngineeringCaseStudy"));
export default function Page({
  path,
  incidentComponent,
  defenceComponent,
  ntmCaseStudyComponent,
  workWithMeComponent,
  paceRagCaseStudyComponent,
  engineeringCaseStudyComponent,
}: {
  path: string;
  incidentComponent?: ComponentType;
  defenceComponent?: ComponentType;
  ntmCaseStudyComponent?: ComponentType;
  workWithMeComponent?: ComponentType;
  paceRagCaseStudyComponent?: ComponentType;
  engineeringCaseStudyComponent?: ComponentType;
}) {
  useFragmentNavigation(path);
  const route = path.replace(/\/$/, "");
  const WorkWithMe = workWithMeComponent || LazyWorkWithMe;
  const Incident = incidentComponent || LazyIncident;
  const Defence = defenceComponent || LazyDefence;
  const NtmCaseStudy = ntmCaseStudyComponent || LazyNtmCaseStudy;
  const PaceRagCaseStudy = paceRagCaseStudyComponent || LazyPaceRagCaseStudy;
  const EngineeringCaseStudy = engineeringCaseStudyComponent || LazyEngineeringCaseStudy;
  return ["/mmcats-modern", "/naae", "/multilingual-engineering"].includes(route) ? (
    <RouteRecovery><Suspense fallback={<main className="container section"><p role="status">{text("Loading case study…")}</p></main>}><FirstFrame><EngineeringCaseStudy /></FirstFrame></Suspense></RouteRecovery>
  ) : route === "/pace-rag-case-study" ? (
    <RouteRecovery><Suspense fallback={<main className="container section"><p role="status">{text("Loading the PACE-RAG case study…")}</p></main>}><FirstFrame><PaceRagCaseStudy /></FirstFrame></Suspense></RouteRecovery>
  ) : route === "/no-two-mondays" ? (
    <RouteRecovery><Suspense fallback={<main className="container section"><p role="status">{text("Loading the No Two Mondays case study…")}</p><a href={localizedHref("/")}>{text("Return to portfolio")}</a></main>}><FirstFrame><NtmCaseStudy /></FirstFrame></Suspense></RouteRecovery>
  ) : route === "/incident-zero/defence" ? (
    <RouteRecovery><Suspense fallback={<main className="container section"><p role="status">{text("Initialising System Defence…")}</p><a href={localizedHref("/incident-zero/")}>{text("Return to Incident Zero")}</a></main>}>
      <FirstFrame><Defence /></FirstFrame>
    </Suspense></RouteRecovery>
  ) : route === "/incident-zero" ? (
    <RouteRecovery><Suspense
      fallback={
        <main className="container section">
          <p role="status">{text("Initialising Incident Zero…")}</p>
          <a href={localizedHref("/")}>{text("Return to portfolio")}</a>
        </main>
      }
    >
      <FirstFrame><Incident /></FirstFrame>
    </Suspense></RouteRecovery>
  ) : route === "/work-with-me" ? (
    <RouteRecovery><Suspense fallback={<main className="container section"><p role="status">{text("Loading engineering engagements…")}</p><a href={localizedHref("/")}>{text("Return to portfolio")}</a></main>}><FirstFrame><WorkWithMe /></FirstFrame></Suspense></RouteRecovery>
  ) : route === "" ? (
    <FirstFrame><App /></FirstFrame>
  ) : <FirstFrame><NotFound /></FirstFrame>;
}
