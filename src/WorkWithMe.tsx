import { Navigation } from './App';
import { profile } from './content';
import { problems, engagements } from './EngagementContent';
import { SectionBranch, ContactConvergence } from './NaturalGraphics';
import { useSectionReveals, useSystemMotion } from './usePortfolioMotion';
import './Engagements.css';
export default function WorkWithMe() {
  useSectionReveals(); useSystemMotion();
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <Navigation home={false} />
    <main id="main" className="engagement-page" tabIndex={-1}>
      <section className="section container engagement-hero" aria-labelledby="engagement-title">
        <p className="engagement-breadcrumb mono"><a href="/">Portfolio</a> / Work with me</p>
        <p className="eyebrow mono">Principal engineering / Selected engagements</p>
        <h1 id="engagement-title">Complex systems.<br /><span>Clear engineering decisions.</span></h1>
        <p className="section-intro">I work with teams on software problems where architecture, domain complexity, modernisation or technical leadership matter.</p>
        <p className="engagement-position">Mohd. Paramasvara · Principal Full-Stack Engineer<br />Based in Sabah, Malaysia. Remote-first project and contract work.</p>
        <a className="text-link" href="#engagement-problems">Explore the problems I work on <span aria-hidden="true">↓</span></a>
      </section>
      <section className="section container" id="engagement-problems" aria-labelledby="engagement-problems-title">
        <div className="section-lead"><SectionBranch variant="work" /><div className="section-heading" data-reveal>
          <p className="eyebrow mono">01 / Problems &amp; evidence</p><h2 id="engagement-problems-title">Start with the system.</h2>
        </div></div>
        <div className="engagement-problems">
          {problems.map((item,index) => <article className="engagement-problem" key={item.title} data-reveal>
            <div><p className="eyebrow mono">0{index+1} / {item.title}</p><h3>{item.problem}</h3></div>
            <div><p>{item.description}</p><p className="engagement-evidence">{item.signal}</p>
              {item.proof ? <a className="text-link" href={`/#case-${item.proof}`}>Inspect the related case study <span aria-hidden="true">↗</span></a> : <a className="text-link" href="/#capabilities">View technical capabilities <span aria-hidden="true">↗</span></a>}
            </div>
          </article>)}
        </div>
        <a className="text-link engagement-link" href="/#public-engineering">Inspect public engineering work <span aria-hidden="true">↗</span></a>
      </section>
      <section className="section engagement-models" id="engagement-fit" aria-labelledby="engagement-fit-title">
        <div className="container">
          <div className="section-lead"><SectionBranch variant="public" /><div className="section-heading" data-reveal>
            <p className="eyebrow mono">02 / Engagement fit</p><h2 id="engagement-fit-title">Agree the scope.<br />Then own the work.</h2>
          </div></div>
          <div className="engagement-types" data-reveal>{engagements.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.description}</p><dl><dt>Useful inputs</dt><dd>{item.inputs}</dd><dt>Possible deliverables</dt><dd>{item.deliverables}</dd><dt>Next step</dt><dd>{item.next}</dd></dl><a className="text-link" href={`/#case-${item.proof}`}>Related engineering work ↗</a></article>)}</div>
          <p className="engagement-fit-note">Scope is agreed after an introductory conversation. These are examples of possible deliverables, not fixed packages. A useful starting point is a concrete problem, access to the relevant technical context, and someone who can make decisions. We can then agree scope, responsibilities and a project or contract arrangement.</p>
        </div>
      </section>
      <section className="section container contact" id="contact" data-motion-region="contact" aria-labelledby="contact-title">
        <div data-reveal>
          <p className="eyebrow mono">03 / Let’s talk</p>
          <h2 id="contact-title">A complex problem.<br /><span>A clear next step.</span></h2>
          <p className="engagement-contact-copy">Bring a system that needs modernising, a difficult product workflow or an architecture question. We can discuss the problem and whether an engagement makes sense.</p>
          <div className="contact-booking"><a className="button primary" href={profile.discovery} target="_blank" rel="noopener noreferrer" aria-label="Book a conversation (opens Cal.com in a new tab)" data-conversation-cta="">Book a conversation <span aria-hidden="true">↗</span></a><p>An introductory conversation. You can also email the context directly.</p></div>
          <a className="contact-email" href={`mailto:${profile.email}`}>{profile.email}<span aria-hidden="true">↗</span></a>
          <ContactConvergence />
          <div className="contact-links"><a className="text-link" href="/#work">Explore selected work <span aria-hidden="true">↗</span></a><a className="text-link" href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a></div>
        </div>
      </section>
    </main>
    <footer className="container footer"><p>© Mohd. Paramasvara</p><p>Based in Borneo. Building beyond it.</p><a href="/">Back to portfolio <span aria-hidden="true">↗</span></a></footer>
  </>;
}
