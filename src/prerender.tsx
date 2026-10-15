import { renderToString } from "react-dom/server";
import Page from "./Page";
import IncidentZeroRoute from "./features/incident-zero/IncidentZeroRoute";
import DefenceRoute from "./features/incident-zero/defence/DefenceRoute";
import NoTwoMondaysCaseStudy from "./NoTwoMondaysCaseStudy";
export function render(path = "/") {
  return renderToString(
    <Page path={path} incidentComponent={IncidentZeroRoute} defenceComponent={DefenceRoute} ntmCaseStudyComponent={NoTwoMondaysCaseStudy} />,
  );
}
