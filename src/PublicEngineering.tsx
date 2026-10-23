import { VerticalText } from "./i18n/controls";
import { localizedHref } from "./i18n/config";
import { text, localizedContent } from "./i18n/config";
import { SectionBranch } from './NaturalGraphics';
import snapshot from './data/public-github.json';
import './PublicEngineering.css';

type PublicRepo = {
  name: string; url: string; title: string; kind: string;
  description: string | null; technologies: string[]; relevance: string;
  language: string | null; visibility: string; verifiedAt: string;
};
const repositories: PublicRepo[] = snapshot;
export function PublicEngineering() {
  return <section id="public-engineering" className="section container public-engineering" aria-labelledby="public-engineering-title">
    <div className="section-lead">
    <SectionBranch variant="public" />
    <div className="section-heading" data-reveal>
      <p className="eyebrow mono">{text("01A / Public engineering")}</p>
      <h2 id="public-engineering-title"><VerticalText>{text("Open to inspection.")}</VerticalText></h2>
    </div>
    <p className="section-intro" data-reveal>{text("Selected public engineering work you can inspect directly — from domain rules and tests to frontend delivery.")}</p>
    </div>
    <nav className="case-study-discovery" aria-label={text("Engineering case studies")}>
      <a href={localizedHref("/mmcats-modern/")}><bdi>MMCATS Modern</bdi><span>{text("Legacy behavior → modern contracts")}</span><span data-case-status>{text("Locally verified · public release blocked")}</span></a>
      <a href={localizedHref("/naae/")}><bdi>NAAE</bdi><span>{text("Narrative glyphs → visual worlds")}</span><span data-case-status>{text("Local prototype · public studio pending")}</span></a>
      <a href={localizedHref("/multilingual-engineering/")}><strong>{text("Multilingual portfolio engineering")}</strong><span>{text("Eleven languages, one source")}</span><span>{text("Routes, direction and content integrity")}</span><span data-case-status>{text("Implemented · editorial review pending")}</span></a>
    </nav>
    <div className="public-repositories">
      <article className="public-repository" data-reveal>
        <div className="public-repository-heading"><p className="eyebrow mono">{text("Independent applied AI")}</p><h3>{text("PACE-RAG")}</h3><p className="public-repository-name mono">{text("Experimental engineering demonstration")}</p></div>
        <div className="public-repository-detail"><p>{text("Portfolio Assistant with Cited Evidence — Retrieval-Augmented Generation. Reviewed cached answers, deterministic technology composition and local retrieval; live generative inference is disabled.")}</p><p className="public-repository-stack mono">{text("TypeScript · React · Transformers.js · MiniLM · Web Workers")}</p><a href={localizedHref("/pace-rag-case-study/")}>{text("Inspect implementation, evaluation & limitations ")}<span aria-hidden="true">↗</span></a></div>
      </article>
      {localizedContent(repositories.map(repo => <article className="public-repository" key={repo.name} data-reveal>
        <div className="public-repository-heading">
          <p className="eyebrow mono">{localizedContent(repo.kind)}</p>
          <h3>{localizedContent(repo.title)}</h3>
          <p className="public-repository-name mono">{localizedContent(repo.name)}</p>
        </div>
        <div className="public-repository-detail">
          <p>{localizedContent(repo.description || 'Public source available for inspection.')}</p>
          <p className="public-repository-context">{localizedContent(repo.relevance)}</p>
          {localizedContent((repo.technologies.length > 0 || repo.language) && <p className="public-repository-stack mono">{localizedContent(repo.technologies.length ? repo.technologies.join(' · ') : repo.language)}</p>)}
          <a href={localizedHref(repo.url)} target="_blank" rel="noopener noreferrer" aria-label={text("View source on GitHub for {{value0}} (opens in a new tab)", {value0: repo.name})}>{text("View source on GitHub ")}<span aria-hidden="true">↗</span></a>
        </div>
      </article>))}
    </div>
    <a className="public-engineering-more" href="https://github.com/MohdVara" target="_blank" rel="noopener noreferrer">{text("View more public work on GitHub ")}<span aria-hidden="true">↗</span><span className="sr-only">{text(" (opens in a new tab)")}</span></a>
  </section>;
}
