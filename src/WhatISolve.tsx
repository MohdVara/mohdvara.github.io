import { VerticalText } from "./i18n/controls";
import { localizedHref } from "./i18n/config";
import { text, localizedContent } from "./i18n/config";
import { problemSummaries } from './problemSummaries';
import { SectionBranch } from './NaturalGraphics';
import './Engagements.css';
export function WhatISolve() {
  return <section id="problems" className="section container problems-section" aria-labelledby="problems-title">
    <div className="section-lead">
      <SectionBranch variant="work" />
      <div className="section-heading" data-reveal>
        <p className="eyebrow mono">{text("03A / What I solve")}</p>
        <h2 id="problems-title"><VerticalText>{text("When the software")}<br />{text("becomes the problem.")}</VerticalText></h2>
      </div>
    </div>
    <div className="problem-translation" data-reveal>
      {localizedContent(Object.values(problemSummaries).map(item => <div className="problem-translation-row" key={item.title}>
        <p>{localizedContent(item.problem)}</p><span aria-hidden="true">→</span><p>{localizedContent(item.title)}</p>
      </div>))}
    </div>
    <a className="text-link engagement-link" href={localizedHref("/work-with-me/")}>{text("Explore working together ")}<span aria-hidden="true">↗</span></a>
  </section>;
}
