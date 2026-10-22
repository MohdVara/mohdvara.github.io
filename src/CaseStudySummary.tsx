import CaseStudyQuickRead from "./CaseStudyQuickRead";
import { quickReads, type StudyId } from "./caseStudies";
export default function CaseStudySummary({study}: {study: StudyId}) {
  return <CaseStudyQuickRead item={quickReads[study]} id={study} />;
}
