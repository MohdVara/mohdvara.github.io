import { renderToString } from "react-dom/server";
import Page from "./Page";
import WorkWithMe from "./WorkWithMe";
import IncidentZeroRoute from "./features/incident-zero/IncidentZeroRoute";
import DefenceRoute from "./features/incident-zero/defence/DefenceRoute";
import NoTwoMondaysCaseStudy from "./NoTwoMondaysCaseStudy";
import PaceRagCaseStudy from "./PaceRagCaseStudy";
export function render(path = "/") {
  return renderToString(
    <Page paceRagCaseStudyComponent={PaceRagCaseStudy} workWithMeComponent={WorkWithMe} path={path} incidentComponent={IncidentZeroRoute} defenceComponent={DefenceRoute} ntmCaseStudyComponent={NoTwoMondaysCaseStudy} />,
  );
}
