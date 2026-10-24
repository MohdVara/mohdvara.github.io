import CaseStudyQuickRead from "./CaseStudyQuickRead";
import { quickReads, type StudyId } from "./caseStudies";
import { localizedHref, text } from "./i18n/config";
const actions: Record<StudyId, [string, string][]> = {
  "mmcats-modern": [["Architecture and decisions", "#architecture"], ["Inspect the evidence", "#verification"], ["Sources and limitations", "#sources"]],
  naae: [["Compare artwork", "#evolution"], ["Architecture and decisions", "#architecture"], ["Limitations", "#naae-limitations"]],
  "multilingual-engineering": [["Architecture and decisions", "#localization-pipeline"], ["Direction follows the language", "#direction-demo"], ["Limitations", "#language-boundary"]],
  pace: [["A real technology lookup", "#rag-php-example"], ["Architecture and decisions", "#rag-architecture"], ["Measured retrieval and limitations", "#evaluation"]],
  ntm: [["Architecture", "#ntm-architecture"], ["Verification", "#ntm-traversal"], ["Evidence sources", "#ntm-evidence"]],
  incident: [["Evidence sources", "#incident-evidence"]],
};
export default function CaseStudySummary({study}: {study: StudyId}) {
  return <CaseStudyQuickRead item={quickReads[study]} id={study} actions={<nav className="quick-read-actions" aria-label={text("Case study contents")}>
    {actions[study].map(([label, href]) => <a key={href} href={href}>{text(label)}</a>)}
    <a href={localizedHref("/#contact")}>{text("Contact")}</a>
  </nav>} />;
}
