import { VerticalText } from "./i18n/controls";
import { localizedHref } from "./i18n/config";
import { text, localizedContent } from "./i18n/config";
import { PageLandscape } from "./AsciiForest/PageLandscape";
import { Navigation } from './App';
import { profile } from './content';
import { problems, engagements } from './EngagementContent';
import { evidence } from './evidence';
import { SectionBranch, ContactConvergence } from './NaturalGraphics';
import { useSectionReveals, useSystemMotion } from './usePortfolioMotion';
import './Engagements.css';
export default function WorkWithMe() {
  useSectionReveals(); useSystemMotion();
  return <>
    <a className="skip-link" href="#main">{text("Skip to content")}</a>
    <Navigation home={false} />
    <main id="main" className="engagement-page" tabIndex={-1}>
      <PageLandscape scene="engagements"><section className="section container engagement-hero" aria-labelledby="engagement-title">
        <p className="engagement-breadcrumb mono"><a href={localizedHref("/")}>{text("Portfolio")}</a>{text(" / Work with me")}</p>
        <p className="eyebrow mono">{text("Principal engineering / Selected engagements")}</p>
        <h1 id="engagement-title">{text("Complex systems.")}<br /><span>{text("Clear engineering decisions.")}</span></h1>
        <p className="section-intro">{text("I work with teams on software problems where architecture, domain complexity, modernisation or technical leadership matter.")}</p>
        <p className="engagement-position">{text("Mohd. Paramasvara · Principal Full-Stack Engineer")}<br />{text("Based in Sabah, Malaysia. Discuss an engineering role or a scoped project engagement.")}</p>
        <div className="actions"><a className="button primary" href={localizedHref(profile.discovery)} target="_blank" rel="noopener noreferrer">{text("Book a conversation ")}<span aria-hidden="true">↗</span><span className="sr-only">{text(" (opens Cal.com in a new tab)")}</span></a><a className="text-link" href={localizedHref(`mailto:${profile.email}`)}>{text("Email the context")}</a></div>
        <a className="text-link" href="#engagement-problems">{text("Explore the problems I work on ")}<span aria-hidden="true">↓</span></a>
      </section></PageLandscape>
      <section className="section container" id="engagement-problems" aria-labelledby="engagement-problems-title">
        <div className="section-lead"><SectionBranch variant="work" /><div className="section-heading" data-reveal>
          <p className="eyebrow mono">{text("01 / Problems & evidence")}</p><h2 id="engagement-problems-title"><VerticalText>{text("Start with the system.")}</VerticalText></h2>
        </div></div>
        <div className="engagement-problems">
          {localizedContent(problems.map((item,index) => <article className="engagement-problem" key={item.title} data-reveal>
            <div><p className="eyebrow mono">0{localizedContent(index+1)} / {localizedContent(item.title)}</p><h3>{localizedContent(item.problem)}</h3></div>
            <div><p>{localizedContent(item.description)}</p><p className="engagement-evidence">{localizedContent(item.signal)}</p>
              <a className="text-link" href={localizedHref(evidence[item.proof].href)}>{localizedContent(evidence[item.proof].label)} <span aria-hidden="true">↗</span></a>
            </div>
          </article>))}
        </div>
        <a className="text-link engagement-link" href={localizedHref("/#public-engineering")}>{text("Inspect public engineering work ")}<span aria-hidden="true">↗</span></a>
      </section>
      <section className="section engagement-models" id="engagement-fit" aria-labelledby="engagement-fit-title">
        <div className="container">
          <div className="section-lead"><SectionBranch variant="public" /><div className="section-heading" data-reveal>
            <p className="eyebrow mono">{text("02 / Engagement fit")}</p><h2 id="engagement-fit-title"><VerticalText>{text("Agree the scope.")}<br />{text("Then own the work.")}</VerticalText></h2>
          </div></div>
          <div className="engagement-types" data-reveal>{localizedContent(engagements.map(item => <article key={item.title}><h3>{localizedContent(item.title)}</h3><p>{localizedContent(item.description)}</p><dl><dt>{text("Useful inputs")}</dt><dd>{localizedContent(item.inputs)}</dd><dt>{text("Possible deliverables")}</dt><dd>{localizedContent(item.deliverables)}</dd><dt>{text("Next step")}</dt><dd>{localizedContent(item.next)}</dd></dl><a className="text-link" href={localizedHref(evidence[item.proof].href)}>{localizedContent(evidence[item.proof].label)} ↗</a></article>))}</div>
          <p className="engagement-fit-note">{text("These are possible deliverables, not fixed packages. Bring a concrete problem, technical context and a decision maker. We can then agree scope, responsibilities and an engagement.")}</p>
        </div>
      </section>
      <PageLandscape scene="engagements" aerial><section className="section container contact" id="contact" data-motion-region="contact" aria-labelledby="contact-title">
        <div data-reveal>
          <p className="eyebrow mono">{text("03 / Let’s talk")}</p>
          <h2 id="contact-title"><VerticalText>{text("A complex problem.")}<br /><span>{text("A clear next step.")}</span></VerticalText></h2>
          <p className="engagement-contact-copy">{text("Bring a system that needs modernising, a difficult product workflow or an architecture question. We can discuss the problem and whether an engagement makes sense.")}</p>
          <div className="contact-booking"><a className="button primary" href={localizedHref(profile.discovery)} target="_blank" rel="noopener noreferrer" aria-label={text("Book a conversation (opens Cal.com in a new tab)")} data-conversation-cta="">{text("Book a conversation ")}<span aria-hidden="true">↗</span></a><p>{text("An introductory conversation. You can also email the context directly.")}</p></div>
          <a className="contact-email" href={localizedHref(`mailto:${profile.email}`)}>{localizedContent(profile.email)}<span aria-hidden="true">↗</span></a>
          <ContactConvergence />
          <div className="contact-links"><a className="text-link" href={localizedHref(profile.resume)} target="_blank" rel="noopener noreferrer">{text("2-page résumé ")}<span className="sr-only">{text(" (opens in a new tab)")}</span></a><a className="text-link" href={localizedHref(profile.cv)} target="_blank" rel="noopener noreferrer">{text("Full CV ")}<span className="sr-only">{text(" (opens in a new tab)")}</span></a><a className="text-link" href={localizedHref("/#work")}>{text("Explore selected work ")}<span aria-hidden="true">↗</span></a><a className="text-link" href={localizedHref(profile.linkedin)} target="_blank" rel="noopener noreferrer">{text("LinkedIn ")}<span aria-hidden="true">↗</span><span className="sr-only">{text(" (opens in a new tab)")}</span></a></div>
        </div>
      </section></PageLandscape>
    </main>
    <footer className="container footer"><p>{text("© Mohd. Paramasvara")}</p><p>{text("Based in Borneo. Building beyond it.")}</p><a href={localizedHref("/")}>{text("Back to portfolio ")}<span aria-hidden="true">↗</span></a></footer>
  </>;
}
