import { renderToString } from "react-dom/server";
import Experience from "./i18n/Experience";
import { i18n, loadLocale } from "./i18n/config";
import { splitLocale } from "./i18n/localeResolution";
import EngineeringCaseStudy from "./EngineeringCaseStudy";
import WorkWithMe from "./WorkWithMe";
import IncidentZeroRoute from "./features/incident-zero/IncidentZeroRoute";
import DefenceRoute from "./features/incident-zero/defence/DefenceRoute";
import NoTwoMondaysCaseStudy from "./NoTwoMondaysCaseStudy";
import PaceRagCaseStudy from "./PaceRagCaseStudy";
export async function render(path = "/") {
  const locale = splitLocale(path).locale || "en";
  await loadLocale(locale);
  await i18n.changeLanguage(locale);
  return renderToString(
    <Experience engineeringCaseStudyComponent={EngineeringCaseStudy} paceRagCaseStudyComponent={PaceRagCaseStudy} workWithMeComponent={WorkWithMe} path={path} incidentComponent={IncidentZeroRoute} defenceComponent={DefenceRoute} ntmCaseStudyComponent={NoTwoMondaysCaseStudy} />,
  );
}

export { localizedMetadata } from "./i18n/metadata";
