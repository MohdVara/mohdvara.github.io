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
      <p className="eyebrow mono">01A / Public engineering</p>
      <h2 id="public-engineering-title">Open to inspection.</h2>
    </div>
    <p className="section-intro" data-reveal>Selected public engineering work you can inspect directly — from domain rules and tests to frontend delivery.</p>
    </div>
    <div className="public-repositories">
      <article className="public-repository" data-reveal>
        <div className="public-repository-heading"><p className="eyebrow mono">Independent applied AI</p><h3>PACE-RAG</h3><p className="public-repository-name mono">Experimental engineering demonstration</p></div>
        <div className="public-repository-detail"><p>Portfolio Assistant with Cited Evidence — Retrieval-Augmented Generation. Reviewed cached answers, deterministic technology composition and local retrieval; live generative inference is disabled.</p><p className="public-repository-stack mono">TypeScript · React · Transformers.js · MiniLM · Web Workers</p><a href="/pace-rag-case-study/">Inspect implementation, evaluation &amp; limitations <span aria-hidden="true">↗</span></a></div>
      </article>
      {repositories.map(repo => <article className="public-repository" key={repo.name} data-reveal>
        <div className="public-repository-heading">
          <p className="eyebrow mono">{repo.kind}</p>
          <h3>{repo.title}</h3>
          <p className="public-repository-name mono">{repo.name}</p>
        </div>
        <div className="public-repository-detail">
          <p>{repo.description || 'Public source available for inspection.'}</p>
          <p className="public-repository-context">{repo.relevance}</p>
          {(repo.technologies.length > 0 || repo.language) && <p className="public-repository-stack mono">{repo.technologies.length ? repo.technologies.join(' · ') : repo.language}</p>}
          <a href={repo.url} target="_blank" rel="noopener noreferrer" aria-label={`View source on GitHub for ${repo.name} (opens in a new tab)`}>View source on GitHub <span aria-hidden="true">↗</span></a>
        </div>
      </article>)}
    </div>
    <a className="public-engineering-more" href="https://github.com/MohdVara" target="_blank" rel="noopener noreferrer">View more public work on GitHub <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a>
  </section>;
}
