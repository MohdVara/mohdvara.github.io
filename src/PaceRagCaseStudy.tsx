import BuildRevision from "./BuildRevision";
import CaseStudyQuickRead from "./CaseStudySummary";
import { VerticalText } from "./i18n/controls";
import { localizedHref } from "./i18n/config";
import { text, localizedContent } from "./i18n/config";
import { PageLandscape } from "./AsciiForest/PageLandscape";
import phpExample from "./data/pace-php-example.json";
import { paceLinks } from "./paceLinks";
import { Navigation } from "./App";

const source = "https://github.com/MohdVara/pace-rag/blob/main/";
export default function PaceRagCaseStudy() {
  return <><a className="skip-link" href="#main">{text("Skip to content")}</a><Navigation home={false} contactOnPage={false} /><main id="main" tabIndex={-1} className="container section rag-case-study">
    <PageLandscape scene="pace" contained><header className="container page-landscape-intro">
    <p className="eyebrow mono">{text("PACE-RAG v1.6.2 · Independent applied AI")}</p>
    <h1>{text("Knowledge first. Inference optional. Evidence always.")}</h1>
    <p className="section-intro">{text("Ask a professional question, look up approved knowledge and inspect the sources behind a reviewed answer, supported technology composition, suggestions or abstention. This independent demonstration is experimental; live generation is disabled.")}</p>
    <p><strong>{text("PACE-RAG = Portfolio Assistant with Cited Evidence — Retrieval-Augmented Generation.")}</strong>{text(" This is the official expansion going forward, not a claim about the name’s historical origin. RAG describes the architectural approach and direction; each query does not invoke a generative model.")}</p>
    <p><a href={localizedHref(paceLinks.lab)}>{text("Explore the Engineering RAG Lab")}</a> · <a href="https://github.com/MohdVara/pace-rag">{text("Inspect the implementation")}</a> · <a href={localizedHref("/#about")}>{text("Ask about my engineering experience")}</a></p>
    </header></PageLandscape>
    <CaseStudyQuickRead study="pace" />
    <p className="muted">{text("Live AI is disabled.")}</p>
    <section className="rag-worked-example" aria-labelledby="rag-php-example"><h2 id="rag-php-example">{text("A real technology lookup")}</h2>
      <p lang="en" dir="ltr" translate="no"><strong>{phpExample.question}</strong></p>
      <ol>
        <li>{text("Recognized category: ")}<strong>{localizedContent(phpExample.category.language)}{text(" web ")}{localizedContent(phpExample.category.categories.join(", "))}</strong>.</li>
        <li>{text("Ontology matches: ")}<strong>{localizedContent(phpExample.technologies.join(" and "))}</strong>.</li>
        <li>{text("Verified project mappings:")}<ul>{localizedContent(phpExample.mappings.map(mapping=><li key={mapping.projectId}>{localizedContent(mapping.projectTitle)} → {localizedContent(mapping.technology)}{localizedContent(mapping.generation!=="Unspecified generation"?` (${mapping.generation})`:"")}</li>))}</ul></li>
        <li>{text("Approved fact composition: ")}<span lang="en" dir="ltr" translate="no">{phpExample.answer}</span></li>
        <li>{text("Supporting citations:")}<ul>{localizedContent(phpExample.sources.map(item=><li key={item.sourceId}><a href={localizedHref(item.url)}>{localizedContent(item.title)}</a></li>))}</ul></li>
        <li>{text("Workers AI inference calls: ")}<strong>{localizedContent(phpExample.workersAiInferenceCalls)}</strong>.</li>
      </ol>
      <p className="muted">{localizedContent(phpExample.measurement)}{text(" Evidence version: ")}{localizedContent(phpExample.trace.evidenceVersion)}{text(". The portfolio build verifies this generated example against the packaged corpus.")}</p>
    </section>
    <section aria-labelledby="rag-summary"><h2 id="rag-summary"><VerticalText>{text("A one-minute overview")}</VerticalText></h2><p>{text("PACE-RAG is a browser-first assistant for reviewed professional information, with a separate engineering Lab. Cached answers and deterministic technology lookups avoid hosted inference; other questions can use a locally loaded model to suggest relevant reviewed questions. Every direct answer retains its own validated sources.")}</p><p>{text("Measured retrieval results below show how well expected answers appear in the ranked suggestions. They do not prove factual certainty or production readiness. Live generation, enterprise security and provider billing remain unverified; the public demo is experimental.")}</p></section>
    <section aria-labelledby="rag-architecture"><h2 id="rag-architecture">{text("Architecture at a glance")}</h2><p>{text("Two paths share source validation. Technology relationships use confirmed facts; other wording uses retrieval.")}</p><ol className="rag-flow" aria-label={text("Question-to-answer architecture")}>
      <li><strong>{text("Question")}</strong><span>{text("The visitor chooses a knowledge source.")}</span></li>
      <li><strong>{text("Entity / intent detection")}</strong><span>{text("Identify supported technology relationships and question intent.")}</span></li>
      <li><strong>{text("Approved facts or hybrid retrieval")}</strong><span>{text("Compose from confirmed technology facts, or rank reviewed questions using semantic and lexical signals.")}</span></li>
      <li><strong>{text("Citation validation")}</strong><span>{text("Check source ownership, version, hash, URL and review status.")}</span></li>
      <li><strong>{text("Reviewed answer, suggestions or abstention")}</strong><span>{text("Unsupported wording remains a limitation, never a similarity-based factual claim.")}</span></li>
    </ol><p>{text("Exact reviewed questions can reuse the cache directly. None of these paths automatically calls Workers AI.")}</p></section>
    <h2>{text("The problem and constraints")}</h2>
    <p>{text("Recruiters need concise answers supported by public sources. A free-tier-oriented design keeps reviewed answers and retrieval usable without hosted inference, provider quota or a live API. Browser inference trades a model download, CPU and memory for fewer remote dependencies; free-tier billing and production capacity have not been verified.")}</p>
    <h2>{text("From query to evidence")}</h2>
    <ol>
      <li>{text("Load a checksum-verified corpus and its versioned source and answer registries. Opening the assistant does not initialize the embedding model.")}</li>
      <li>{text("Exact reviewed questions reuse approved cached answers with their own citations. Bounded technology questions compose answers from owner-confirmed project facts using a directed ontology of entities, categories and relationships.")}</li>
      <li>{text("Other semantic queries initialize the pinned MiniLM q8 WASM model in a browser worker. Professional suggestions combine question-vector cosine, answer-body BM25 and bounded intent adjustments. Other Lab views retain reviewed-question-and-answer BM25. Distinct answer records are ranked once. Passage retrieval remains a separate evidence-discovery path.")}</li>
      <li>{text("Similarity suggests related questions; it does not establish answer equivalence. Unsupported requests abstain. Lexical retrieval and static sources remain available when model initialization fails.")}</li>
    </ol>
    <p>{text("Cached answers, technology composition and local retrieval make zero Workers AI inference calls. A guarded gateway exists in source, but live generation is disabled. Mocked quota/provider tests do not establish deployed runtime or billing behaviour.")}</p>
    <p><a href={localizedHref(source + "packages/semantic-core/src/retrieval.mjs")}>{text("Retrieval and hybrid ranking")}</a> · <a href={localizedHref(source + "packages/semantic-core/src/technology/resolve.mjs")}>{text("Technology entity resolution")}</a> · <a href={localizedHref(source + "packages/semantic-core/src/answers.mjs")}>{text("Answer composition and validation")}</a> · <a href={localizedHref(paceLinks.architecture)}>{text("Architecture and methodology")}</a></p>
    <h2>{text("Provenance and publication boundaries")}</h2>
    <p>{text("Reuse requires current approval, matching source hash, document version, citation URL and corpus ownership. Professional Experience is isolated from implementation documentation and fictional test documents; scoped vector rows follow the same filtered records. Retrieved passages are labelled separately from sources supporting an answer.")}</p>
    <p>{text("Hash-bound owner publication approval covers the existing source and answer registries. Generated Q&A is never automatically promoted. Content changes need renewed review, and integrity or licensing failures block packaging. Historic professional snapshots retain their review context; the current portfolio clarifies ongoing WenSymes collaboration and the existence of this demonstration.")}</p>
    <p><a href={localizedHref(source + "docs/PACE-RAG-CORPUS-PROVENANCE.md")}>{text("Corpus provenance")}</a> · <a href={localizedHref(source + "scripts/publication-check.mjs")}>{text("Publication checks")}</a> · <a href={localizedHref(source + "packages/semantic-core/src/scope.mjs")}>{text("Scope and vector isolation")}</a></p>
    <h2 id="evaluation">{text("Measured retrieval and limitations")}</h2>
    <p>{text("19 October 2026 · Local, versioned evaluation with the pinned browser model. Owner-approved v1.6 knowledge refresh adds commercial evidence and five reviewed answers. The v1.6.1 investigation reproduces prior results and partially recovers rankings through bounded question-facet adjustments. All approved knowledge is preserved; recovery targets remain unmet on two metrics. Automatic semantic reuse remains disabled.")}</p>
    <table><caption>{text("Previously inspected regression sets; not independent review")}</caption><thead><tr><th>{text("Questions")}</th><th>{text("v1.5 Top-1 / Top-3")}</th><th>{text("v1.6 Top-1 / Top-3")}</th><th>{text("v1.6.1 Top-1 / Top-3")}</th></tr></thead><tbody><tr><td>{text("Original 100 (development)")}</td><td>80% / 98%</td><td>72% / 99%</td><td>76% / 99%</td></tr><tr><td>{text("Preserved 50 (verification)")}</td><td>72% / 96%</td><td>72% / 94%</td><td>76% / 94%</td></tr><tr><td>{text("Preserved 40 (v1.4)")}</td><td>72.5% / 100%</td><td>75% / 95%</td><td>75% / 100%</td></tr></tbody></table>
    <p>{text("Labels are agent-authored and await independent review. These are unchanged provisional regression labels. The content-refresh baseline used the unchanged prior ranker. The v1.6.1 correction was investigated on these published sets without relabeling. Original-set Top-1 remains below the 80% recovery target, and preserved-50 Top-3 remains below 96%; content approval does not certify these trade-offs. None is now unseen. A fresh independently prepared holdout and real-user review remain pending; the independent 80% Top-1 target has not been demonstrated. All 124 professional critical questions across the regression and new-feature suites abstain, with zero observed incorrect automatic answers, invalid citation references or cross-corpus references. These finite observations do not establish correctness probabilities or live-generation grounding.")}</p>
    <p>{text("Reviewed wording can return its cached answer; other paraphrases usually require choosing a suggested question. Lexical/static fallbacks remain available. Actual screen-reader sessions, physical-device memory, enterprise authorization and deployed provider billing remain unverified.")}</p>
    <p><a href={localizedHref(paceLinks.evaluation)}>{text("Current evaluation and per-query reports")}</a> · <a href={localizedHref(source + "evaluation/verification-v14.mjs")}>{text("Preserved verification wording")}</a> · <a href={localizedHref(source + "docs/PACE-RAG-V1.6.1-RETRIEVAL-REVIEW.md")}>{text("Trade-offs and reproducibility")}</a></p>
    <PageLandscape scene="pace" aerial contained><section className="container page-landscape-ending" aria-labelledby="rag-inspect"><h2 id="rag-inspect"><VerticalText>{text("How to inspect it")}</VerticalText></h2>
    <p>{text("Start with the Lab’s three separated knowledge views, then inspect a result’s matched questions, supporting sources and resource usage. Fictional documents and simulated failures are explicitly labelled. Production security and inference availability must be evaluated separately before applying this design to confidential material.")}</p>
    <p><a href={localizedHref("/work-with-me/#engagement-fit")}>{text("Explore an engagement approach")}</a> · <a href={localizedHref("/#contact")}>{text("Discuss an engineering problem")}</a></p>
    </section></PageLandscape>
  </main><footer className="container footer"><BuildRevision /></footer></>;
}
