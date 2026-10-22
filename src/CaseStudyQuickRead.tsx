import { text } from "./i18n/config";
import type { QuickRead } from "./caseStudies";
import type { ReactNode } from "react";
import "./CaseStudyQuickRead.css";
export default function CaseStudyQuickRead({ item, id, commercial = false, actions }: { item: QuickRead; id: string; commercial?: boolean; actions?: ReactNode }) {
  const Heading = commercial ? "h4" : "h2";
  return <aside className="case-quick-read" aria-labelledby={`quick-${id}`}>
    <p className="eyebrow mono">{text("30-second overview")}</p>
    <Heading id={`quick-${id}`}><bdi>{text(item.name)}</bdi></Heading>
    <dl>{([
      ["Problem", item.problem], ["My ownership", item.role], ["Key decision", item.decision],
      [commercial ? "Contribution" : "Verified result", item.result], ["Current status", item.status], ["Technical focus", item.focus],
    ] as const).map(([label, value]) => <div key={label}><dt>{text(label)}</dt><dd>{text(value)}</dd></div>)}</dl>
    {actions || <a href={item.evidence}>{commercial ? text("Delivery decisions") : text("Explore the evidence")} <span aria-hidden="true">↓</span></a>}
  </aside>;
}
