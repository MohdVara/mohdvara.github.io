import phpExample from "./data/pace-php-example.json";
import { paceLinks } from "./paceLinks";
import { Navigation } from "./App";

const source = "https://github.com/MohdVara/pace-rag/blob/main/";
export default function PaceRagCaseStudy() {
  return <><a className="skip-link" href="#main">Skip to content</a><Navigation home={false} contactOnPage={false} /><main id="main" tabIndex={-1} className="container section rag-case-study">
    <p className="eyebrow mono">PACE-RAG v1.6.1 · Independent applied AI</p>
    <h1>Knowledge first. Inference optional. Evidence always.</h1>
    <p className="section-intro">An independently developed, experimental RAG engineering demonstration for exploring public professional evidence. Enterprise production deployment, commercial RAG delivery and production-hardened security are not established. Live AI is disabled.</p>
    <p><strong>PACE-RAG = Portfolio Assistant with Cited Evidence — Retrieval-Augmented Generation.</strong> This is the official expansion going forward, not a claim about the name’s historical origin. RAG describes the architectural approach and direction; each query does not invoke a generative model.</p>
    <p><a href={paceLinks.lab}>Explore the Engineering RAG Lab</a> · <a href="https://github.com/MohdVara/pace-rag">Inspect the implementation</a> · <a href="/#about">Ask about my engineering experience</a></p>
    <section aria-labelledby="rag-summary"><h2 id="rag-summary">A one-minute overview</h2><p>PACE-RAG is a browser-first assistant for reviewed professional information, with a separate engineering Lab. Cached answers and deterministic technology lookups avoid hosted inference; other questions can use a locally loaded model to suggest relevant reviewed questions. Every direct answer retains its own validated sources.</p><p>Measured retrieval results below show how well expected answers appear in the ranked suggestions. They do not prove factual certainty or production readiness. Live generation, enterprise security and provider billing remain unverified; the public demo is experimental.</p></section>
    <section aria-labelledby="rag-architecture"><h2 id="rag-architecture">Architecture at a glance</h2><p>Two paths share source validation. Technology relationships use confirmed facts; other wording uses retrieval.</p><ol className="rag-flow" aria-label="Question-to-answer architecture">
      <li><strong>Question</strong><span>The visitor chooses a knowledge source.</span></li>
      <li><strong>Entity / intent detection</strong><span>Identify supported technology relationships and question intent.</span></li>
      <li><strong>Approved facts or hybrid retrieval</strong><span>Compose from confirmed technology facts, or rank reviewed questions using semantic and lexical signals.</span></li>
      <li><strong>Citation validation</strong><span>Check source ownership, version, hash, URL and review status.</span></li>
      <li><strong>Reviewed answer, suggestions or abstention</strong><span>Unsupported wording remains a limitation, never a similarity-based factual claim.</span></li>
    </ol><p>Exact reviewed questions can reuse the cache directly. None of these paths automatically calls Workers AI.</p></section>
    <section className="rag-worked-example" aria-labelledby="rag-php-example"><h2 id="rag-php-example">A real technology lookup</h2>
      <p><strong>{phpExample.question}</strong></p>
      <ol>
        <li>Recognized category: <strong>{phpExample.category.language} web {phpExample.category.categories.join(", ")}</strong>.</li>
        <li>Ontology matches: <strong>{phpExample.technologies.join(" and ")}</strong>.</li>
        <li>Verified project mappings:<ul>{phpExample.mappings.map(mapping=><li key={mapping.projectId}>{mapping.projectTitle} → {mapping.technology}{mapping.generation!=="Unspecified generation"?` (${mapping.generation})`:""}</li>)}</ul></li>
        <li>Approved fact composition: {phpExample.answer}</li>
        <li>Supporting citations:<ul>{phpExample.sources.map(item=><li key={item.sourceId}><a href={item.url}>{item.title}</a></li>)}</ul></li>
        <li>Workers AI inference calls: <strong>{phpExample.workersAiInferenceCalls}</strong>.</li>
      </ol>
      <p className="muted">{phpExample.measurement} Evidence version: {phpExample.trace.evidenceVersion}. The portfolio build verifies this generated example against the packaged corpus.</p>
    </section>
    <h2>The problem and constraints</h2>
    <p>Recruiters need concise answers supported by public sources. A free-tier-oriented design keeps reviewed answers and retrieval usable without hosted inference, provider quota or a live API. Browser inference trades a model download, CPU and memory for fewer remote dependencies; free-tier billing and production capacity have not been verified.</p>
    <h2>From query to evidence</h2>
    <ol>
      <li>Load a checksum-verified corpus and its versioned source and answer registries. Opening the assistant does not initialize the embedding model.</li>
      <li>Exact reviewed questions reuse approved cached answers with their own citations. Bounded technology questions compose answers from owner-confirmed project facts using a directed ontology of entities, categories and relationships.</li>
      <li>Other semantic queries initialize the pinned MiniLM q8 WASM model in a browser worker. Professional suggestions combine question-vector cosine, answer-body BM25 and bounded intent adjustments. Other Lab views retain reviewed-question-and-answer BM25. Distinct answer records are ranked once. Passage retrieval remains a separate evidence-discovery path.</li>
      <li>Similarity suggests related questions; it does not establish answer equivalence. Unsupported requests abstain. Lexical retrieval and static sources remain available when model initialization fails.</li>
    </ol>
    <p>Cached answers, technology composition and local retrieval make zero Workers AI inference calls. A guarded gateway exists in source, but live generation is disabled. Mocked quota/provider tests do not establish deployed runtime or billing behaviour.</p>
    <p><a href={source + "packages/semantic-core/src/retrieval.mjs"}>Retrieval and hybrid ranking</a> · <a href={source + "packages/semantic-core/src/technology/resolve.mjs"}>Technology entity resolution</a> · <a href={source + "packages/semantic-core/src/answers.mjs"}>Answer composition and validation</a> · <a href={paceLinks.architecture}>Architecture and methodology</a></p>
    <h2>Provenance and publication boundaries</h2>
    <p>Reuse requires current approval, matching source hash, document version, citation URL and corpus ownership. Professional Experience is isolated from implementation documentation and fictional test documents; scoped vector rows follow the same filtered records. Retrieved passages are labelled separately from sources supporting an answer.</p>
    <p>Hash-bound owner publication approval covers the existing source and answer registries. Generated Q&amp;A is never automatically promoted. Content changes need renewed review, and integrity or licensing failures block packaging. Historic professional snapshots retain their review context; the current portfolio clarifies ongoing WenSymes collaboration and the existence of this demonstration.</p>
    <p><a href={source + "docs/PACE-RAG-CORPUS-PROVENANCE.md"}>Corpus provenance</a> · <a href={source + "scripts/publication-check.mjs"}>Publication checks</a> · <a href={source + "packages/semantic-core/src/scope.mjs"}>Scope and vector isolation</a></p>
    <h2 id="evaluation">Measured retrieval and limitations</h2>
    <p>19 October 2026 · Local, versioned evaluation with the pinned browser model. Owner-approved v1.6 knowledge refresh adds commercial evidence and five reviewed answers. The v1.6.1 investigation reproduces prior results and partially recovers rankings through bounded question-facet adjustments. All approved knowledge is preserved; recovery targets remain unmet on two metrics. Automatic semantic reuse remains disabled.</p>
    <table><caption>Previously inspected regression sets; not independent review</caption><thead><tr><th>Questions</th><th>v1.5 Top-1 / Top-3</th><th>v1.6 Top-1 / Top-3</th><th>v1.6.1 Top-1 / Top-3</th></tr></thead><tbody><tr><td>Original 100 (development)</td><td>80% / 98%</td><td>72% / 99%</td><td>76% / 99%</td></tr><tr><td>Preserved 50 (verification)</td><td>72% / 96%</td><td>72% / 94%</td><td>76% / 94%</td></tr><tr><td>Preserved 40 (v1.4)</td><td>72.5% / 100%</td><td>75% / 95%</td><td>75% / 100%</td></tr></tbody></table>
    <p>Labels are agent-authored and await independent review. These are unchanged provisional regression labels. The content-refresh baseline used the unchanged prior ranker. The v1.6.1 correction was investigated on these published sets without relabeling. Original-set Top-1 remains below the 80% recovery target, and preserved-50 Top-3 remains below 96%; content approval does not certify these trade-offs. None is now unseen. A fresh independently prepared holdout and real-user review remain pending; the independent 80% Top-1 target has not been demonstrated. All 124 professional critical questions across the regression and new-feature suites abstain, with zero observed incorrect automatic answers, invalid citation references or cross-corpus references. These finite observations do not establish correctness probabilities or live-generation grounding.</p>
    <p>Reviewed wording can return its cached answer; other paraphrases usually require choosing a suggested question. Lexical/static fallbacks remain available. Actual screen-reader sessions, physical-device memory, enterprise authorization and deployed provider billing remain unverified.</p>
    <p><a href={paceLinks.evaluation}>Current evaluation and per-query reports</a> · <a href={source + "evaluation/verification-v14.mjs"}>Preserved verification wording</a> · <a href={source + "docs/PACE-RAG-V1.6.1-RETRIEVAL-REVIEW.md"}>Trade-offs and reproducibility</a></p>
    <h2>How to inspect it</h2>
    <p>Start with the Lab’s three separated knowledge views, then inspect a result’s matched questions, supporting sources and resource usage. Fictional documents and simulated failures are explicitly labelled. Production security and inference availability must be evaluated separately before applying this design to confidential material.</p>
    <p><a href="/work-with-me/#engagement-fit">Explore an engagement approach</a> · <a href="/#contact">Discuss an engineering problem</a></p>
  </main></>;
}
