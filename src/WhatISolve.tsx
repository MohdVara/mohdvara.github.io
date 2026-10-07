import { problems } from './EngagementContent';
import { SectionBranch } from './NaturalGraphics';
import './Engagements.css';
export function WhatISolve() {
  return <section id="problems" className="section container problems-section" aria-labelledby="problems-title">
    <div className="section-lead">
      <SectionBranch variant="work" />
      <div className="section-heading" data-reveal>
        <p className="eyebrow mono">03A / What I solve</p>
        <h2 id="problems-title">When the software<br />becomes the problem.</h2>
      </div>
    </div>
    <div className="problem-translation" data-reveal>
      {problems.map(item => <div className="problem-translation-row" key={item.title}>
        <p>{item.problem}</p><span aria-hidden="true">→</span><p>{item.title}</p>
      </div>)}
    </div>
    <a className="text-link engagement-link" href="/work-with-me/">Explore working together <span aria-hidden="true">↗</span></a>
  </section>;
}
