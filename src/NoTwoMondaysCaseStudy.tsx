import { PageLandscape } from "./AsciiForest/PageLandscape";
import { Navigation } from "./App";
import { profile } from "./content";
import crawlSummary from "./data/ntm-crawl-summary.json";
import "./NoTwoMondaysCaseStudy.css";

const workflowTags = [
  ["Bug fixing", 23], ["QA / review", 22], ["Refinement", 19],
  ["New functionality", 16], ["Refactoring", 2],
] as const;

const visualIterations = [
  { version: "v1", image: "visual-v1.png", title: "Early presentation", width: 1280, height: 960,
    description: "Simple characters and a functional office layout established the starting point for visual review.",
    alt: "Early No Two Mondays office capture with simple block-shaped characters and flat desks." },
  { version: "v2", image: "visual-v2.png", title: "Character remaster", width: 1280, height: 960,
    description: "More detailed character likenesses reached the game. Scale, frame registration and walking still needed further correction.",
    alt: "Character-remaster office capture with illustrated characters, detailed desks and the game interface." },
  { version: "v3", image: "visual-v3.jpg", title: "Sizing and walking corrections", width: 1200, height: 722,
    description: "The correction pass separated idle, blink and walking poses and aligned visible character sizing. A still capture cannot demonstrate gait quality; some pose limitations remained documented.",
    alt: "Office capture after the character sizing and walking correction, showing the player, Maya and Adam." },
  { version: "Latest", image: "visual-latest.png", title: "Environment and interaction redesign", width: 1366, height: 900,
    description: "15 October 2026 · Local 0.3.0-rc.1 / monday-8 capture. The redesigned office adds detailed furniture, clearer circulation and contextual interaction cues, alongside the visible priorities panel. This shows the reviewed local build, not a newly verified itch.io upload.",
    alt: "Latest reviewed No Two Mondays office with detailed workstations, storage, open walking space and a visible priorities panel at the start of Monday." },
] as const;

const officeDialogue = [
  { name: "Maya", role: "Manager", line: "Coffee received. I will resist sending an acknowledgement email." },
  { name: "Adam", role: "Developer", line: "You brought coffee. I had only implemented the empty cup." },
  { name: "Lina", role: "IT operations coordinator", line: "A cup with no escalation policy. Refreshing." },
] as const;

const dialogueHistory = [
  { version: "Early", image: "dialogue-early.jpg", title: "A focused office update", width: 1280, height: 587,
    description: "10 October capture. The dark dialogue panel keeps Maya’s request, response choices and time cost together, with a small event illustration.",
    alt: "Early dark dialogue panel with Maya asking for an update and three unanswered response choices." },
  { version: "Paper UI", image: "dialogue-paper.png", title: "Stronger document hierarchy", width: 1280, height: 960,
    description: "11 October capture. The paper treatment separates event classification, spoken text and responses, with a collapsed record of earlier decisions. This is a different office event, not a matched replay.",
    alt: "Paper-style client-call dialogue with a tone label, unanswered choices and a collapsed previous-results section." },
  { version: "Latest UI", image: "dialogue-latest.png", title: "Context before the next decision", width: 840, height: 650,
    description: "15 October capture of the current DialoguePanel in the read-only development harness. Recorded feedback appears inside the interruption; responses use the available width. No response was selected. This is a component preview, not a continuous playthrough.",
    alt: "Latest Maya update dialogue, with a routine previous-action receipt, three unanswered responses and the response time cost." },
] as const;

const puzzleHistory = [
  { version: "Early", image: "puzzle-early.jpg", title: "An empty recovery plan", width: 1280, height: 587,
    description: "10 October capture. Available operations sit beside an empty proposed order, with explicit execution cost and optional notes. The image shows no selected steps or submitted solution.",
    alt: "Early dark recovery puzzle with unordered operation choices and an empty proposed-order panel." },
  { version: "Paper UI", image: "puzzle-paper.png", title: "The recovery workspace on paper", width: 961, height: 600,
    description: "12 October hosted-build QA capture. The paper interface retains the operation list and separate planning area. The plan is empty; option position is not a solution sequence.",
    alt: "Paper recovery console with no operations selected and the recovery execution button disabled." },
  { version: "Latest UI", image: "puzzle-latest.png", title: "The current puzzle component", width: 960, height: 814,
    description: "15 October read-only preview of the current WorkPuzzle with an initial-state fixture. The empty plan, disabled submit, closed notes and visible time costs show the interface without a diagnosis answer, ordered solution or revealed hint. No gameplay action was executed.",
    alt: "Latest recovery puzzle preview with an empty plan, unselected operation buttons, closed notes and disabled execution." },
] as const;

type HistoryItem = { version: string; image: string; title: string; width: number; height: number; description: string; alt: string };
function HistoryGallery({ items, ui = false }: { items: readonly HistoryItem[]; ui?: boolean }) {
  return <div className={`ntm-visual-history${ui ? " ntm-ui-history" : ""}`}>{items.map(({ version, image, title, width, height, description, alt }) => <figure key={image}>
    <p className="eyebrow mono">{version} / {ui ? "UI milestone" : "Visual milestone"}</p><h4>{title}</h4>
    <a href={`/images/no-two-mondays/${image}`} aria-label={`Open full-size ${version} ${title.toLowerCase()} capture`}><img src={`/images/no-two-mondays/${image}`} width={width} height={height} loading="lazy" alt={alt} /></a>
    <figcaption>{description}</figcaption>
  </figure>)}</div>;
}

function Flow({ steps, label }: { steps: [string, string][]; label: string }) {
  return <ol className="ntm-flow" aria-label={label}>{steps.map(([title, description], index) =>
    <li key={title}><span className="mono ntm-step">0{index + 1}</span><h3>{title}</h3><p>{description}</p></li>,
  )}</ol>;
}

export default function NoTwoMondaysCaseStudy() {
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <Navigation home={false} contactOnPage={false} />
    <main id="main" className="ntm-case" tabIndex={-1}>
      <PageLandscape scene="mondays"><header className="container ntm-case-hero">
        <p className="mono ntm-breadcrumb"><a href="/">Portfolio</a> / Independent game case study</p>
        <p className="eyebrow mono">No Two Mondays: Trial Period / modvar</p>
        <h1>Engineering No Two Mondays:<br /><span>An extensible simulation with AI.</span></h1>
        <p className="ntm-deck">How I used AI-assisted development to build an office narrative game, applying human judgment and engineering expertise to turn repeated feedback into a system I could keep extending.</p>
        <p className="ntm-byline">Mohd. Paramasvara · Product direction, engineering and playtest iteration</p>
        <div className="actions"><a className="button primary" href="#ntm-summary">Read the engineering summary ↓</a><a className="text-link" href="https://modvar.itch.io/no-two-mondays" target="_blank" rel="noopener noreferrer">Play on itch.io <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a></div>
        <dl className="ntm-facts">
          <div><dt>210</dt><dd>recovered human prompts</dd></div>
          <div><dt>20</dt><dd>interactive Codex sessions</dd></div>
          <div><dt>37</dt><dd>prompts tagged as corrections or refinement</dd></div>
        </dl>
        <p className="ntm-note">Historical local audit: 9 October–14 October 2026, cutoff 00:05 MYT. Counts describe recovered records through that cutoff; development continued afterward. <a href="#ntm-evidence">How these numbers were counted</a>.</p>
      </header></PageLandscape>

      <nav className="container ntm-contents" aria-label="Case study contents">
        <a href="#ntm-summary">Engineering at a Glance</a><a href="#ntm-brief">The brief</a><a href="#ntm-process">AI workflow</a><a href="#ntm-iterations">Revisions</a><a href="#ntm-dialogue-history">Dialogue UI</a><a href="#ntm-puzzle-history">Puzzle UI</a><a href="#ntm-architecture">Architecture</a><a href="#ntm-traversal">Verification</a><a href="#ntm-lessons">Lessons</a><a href="#ntm-evidence">Evidence sources</a>
      </nav>

      <section className="container ntm-chapter ntm-summary" id="ntm-summary" aria-labelledby="ntm-summary-title">
        <p className="eyebrow mono">Executive summary / Independent engineering project</p>
        <h2 id="ntm-summary-title">Engineering at a Glance</h2>
        <dl className="ntm-summary-list">
          <div><dt>Challenge</dt><dd>Build an extensible office simulation where technical work, conversations and spatial interactions have connected consequences.</dd></div>
          <div><dt>Role</dt><dd>I directed the product and architecture, set engineering constraints, reviewed AI-assisted implementation and iterated through playtesting.</dd></div>
          <div><dt>Architecture</dt><dd>A TypeScript simulation owns state; React presents the interface and Phaser handles spatial presentation. Validated saves, migrations and headless verification support change. <a href="#ntm-architecture">Inspect the boundaries</a>.</dd></div>
          <div><dt>Engineering decisions</dt><dd>Separate state ownership from rendering, reproduce recorded actions deterministically, preserve supported historical saves and require evidence for each bounded iteration. <a href="#ntm-process">Review the workflow</a>.</dd></div>
          <div><dt>Verification</dt><dd>The 15 October 2026 campaign against the recorded 0.3.0-rc.1 / monday-8 snapshot verified 112,402 completed simulation runs and independently replayed 8,050 retained artifacts. It verified 44 ending targets; two campaign target gaps remained. <a href="#ntm-traversal">Read the scope and gaps</a>.</dd></div>
          <div><dt>Limitations</dt><dd>Historical campaign figures are not current game-wide totals or evidence of the hosted build. Automated traversal does not establish human understanding, enjoyment, browser accessibility or production infrastructure scale. <a href="#ntm-evidence">Check the evidence sources</a>.</dd></div>
        </dl>
      </section>

      <section className="container ntm-chapter" id="ntm-brief" aria-labelledby="ntm-brief-title">
        <p className="eyebrow mono">01 / The product problem</p>
        <h2 id="ntm-brief-title">A small office. A growing system.</h2>
        <div className="ntm-prose"><p>No Two Mondays starts with a simple premise: one working day, three coworkers and a production outage. The challenge was to make decisions feel connected across technical work, conversations and the office around you. The setting could stay compact while the underlying system became richer.</p>
        <p>I used Codex throughout development, directing features, playing the results, reporting what felt wrong and asking for focused revisions. My work included setting the product constraints, deciding which changes belonged in the game, and requiring evidence that new work preserved existing behaviour.</p>
        <p>Here, scalability means being able to add and revise behaviour without losing consistency, save compatibility or a usable browser experience. This is a client-side game; the project does not demonstrate multiplayer concurrency or backend traffic scaling.</p></div>
        <figure className="ntm-game-capture"><a href="/images/no-two-mondays/office.jpg" aria-label="Open the full-size No Two Mondays office screenshot"><img src="/images/no-two-mondays/office.jpg" width="1280" height="587" loading="lazy" alt="No Two Mondays office at the beginning of the day, with coworkers, desks, room doors and the game toolbar." /></a><figcaption>Actual game capture, 10 October 2026. An earlier presentation snapshot of the office; later development continued to refine the interface and artwork.</figcaption></figure>
        <h3 className="ntm-subheading">A little office conversation.</h3>
        <div className="ntm-prose"><p>I wanted the characters to sound like people carrying their work into an ordinary conversation. These are authored in-game coffee responses, shown as separate excerpts rather than one exchange. They give a taste of the office humour without revealing incident explanations or story outcomes.</p></div>
        <div className="ntm-dialogue-excerpts">{officeDialogue.map(({ name, role, line }) => <figure key={name}><blockquote><p>“{line}”</p></blockquote><figcaption><strong>{name}</strong> · {role}</figcaption></figure>)}</div>
      </section>

      <section className="container ntm-chapter" id="ntm-process" aria-labelledby="ntm-process-title">
        <p className="eyebrow mono">02 / Working with AI</p><h2 id="ntm-process-title">The prompt started the work. Human judgment steered it.</h2>
        <div className="ntm-prose"><p>Codex accelerated implementation, but each change still needed a human decision about what belonged in the game and whether the result worked. I set the direction, played the results, identified what felt unclear or inconsistent, and turned those observations into focused revisions. Keeping a human in the loop meant shaping the work throughout development: framing the problem, inspecting the result and deciding what needed to change.</p>
        <p>Domain expertise made that feedback actionable. Software engineering knowledge helped me translate a feature request into requirements for state ownership, persistence, compatibility and regression checks. Interaction decisions needed a different lens: could a player understand a choice, notice its consequences and navigate the interface comfortably? The useful brief connected the intended experience to the constraints and evidence needed to evaluate it.</p></div>
        <figure className="ntm-diagram"><p className="mono ntm-figure-label">Diagram 01 / The development loop</p><Flow label="AI-assisted development cycle" steps={[["Direct", "Human: define the experience, constraints and acceptance criteria."], ["Implement", "Codex: implement a bounded change and supporting checks."], ["Inspect", "Human: play and review the result alongside automated evidence."], ["Refine", "Human: identify the gap and make the next brief more precise."]]} /><figcaption>Each review feeds the next brief. This is a synthesis of the recorded workflow, rather than a transcript of one session.</figcaption></figure>
        <div className="ntm-two-column"><div><h3>What I directed</h3><p>Product scope, interaction clarity, engineering constraints and acceptance criteria. I judged the results against the intended experience and directed follow-up changes.</p></div><div><h3>What AI accelerated</h3><p>Implementation, test scaffolding, diagnostic tools, documentation and asset iteration. I used those outputs as material to inspect, test and refine.</p></div></div>
      </section>

      <section className="container ntm-chapter" id="ntm-iterations" aria-labelledby="ntm-iterations-title">
        <p className="eyebrow mono">03 / The cost of iteration</p><h2 id="ntm-iterations-title">210 prompts did not mean 210 finished features.</h2>
        <div className="ntm-prose"><p>The historical audit recovered 210 deduplicated human prompts across 20 interactive sessions. A union of its bug-fixing, refinement and refactoring tags contains 37 distinct prompts. The project feedback log separately records 21 feedback entries at the time of this review. These are different measures: a feedback entry may summarize several requests, and a prompt may address several concerns.</p>
        <p>The tagging is automated and lexical. It describes the requests that were recovered, rather than proving how many code modifications were necessary or how much time each feature took. The audit is a partial historical record, not the total lifetime prompt count.</p></div>
        <figure className="ntm-diagram"><p className="mono ntm-figure-label">Diagram 02 / Selected request types</p><ul className="ntm-bars" aria-label="Selected workflow tags in the historical prompt audit">{workflowTags.map(([label, count]) => <li key={label}><span>{label}</span><span className="ntm-bar-track" aria-hidden="true"><span style={{ width: `${count / 23 * 100}%` }} /></span><strong>{count}</strong></li>)}</ul><figcaption>Tags overlap. These selected categories do not sum to 210; requests with other or unspecified tags are omitted from this chart.</figcaption></figure>
        <div className="ntm-table-wrap"><table><caption>Examples of documented revision work</caption><thead><tr><th scope="col">Observed issue</th><th scope="col">Engineering response</th><th scope="col">Why human judgment mattered</th></tr></thead><tbody>
          <tr><th scope="row">Choices were ambiguous</th><td>Named the affected character and added clearer action feedback.</td><td>Recognising ambiguity required evaluating the player’s understanding as well as the state change.</td></tr>
          <tr><th scope="row">Too much information at once</th><td>Grouped interactions and introduced contextual disclosure.</td><td>Interaction judgment helped determine when additional depth became too much information.</td></tr>
          <tr><th scope="row">Menus and reading competed with the game viewport</th><td>Contained the game surface and refined keyboard, mouse and internal scrolling.</td><td>Browser interaction knowledge turned layout and input problems into explicit acceptance checks.</td></tr>
          <tr><th scope="row">Generated character art needed correction</th><td>Retained approved sources, recorded generation provenance and used deterministic extraction and registration.</td><td>Visual review and asset requirements determined whether generated artwork was usable in the game.</td></tr>
          <tr><th scope="row">New systems had to preserve earlier progress</th><td>Made migration, historical fixtures and recovery paths part of the release requirements.</td><td>Engineering judgment made preservation of earlier progress a release requirement.</td></tr>
        </tbody></table></div>
        <h3 className="ntm-subheading">Art and animation took repeated correction.</h3>
        <div className="ntm-prose"><p>Getting the character art right took several rounds of direction and visual review. I asked for changes to the player’s proportions and facial treatment, then had to preserve that approved likeness across different directions and walking poses. I preferred the original, unnormalised artwork; the generation notes record that preference alongside the extraction and registration requirements.</p>
        <p>Walking exposed problems that a still image could hide. Equal-sized frame cells did not guarantee equal visible character sizes, and the earlier sequence mixed walking contacts with idle and blink poses. The correction work separated those states, used a uniform scale per character and tied animation to measured movement. A live check also caught gait resets between fixed-step physics updates. These were asset and runtime problems that needed different checks.</p>
        <p>The art review still records subtle support-leg differences in some generated poses, including Maya’s front passing frames. Automated bounds, registration and sequence checks could verify parts of the asset contract; they could not establish convincing anatomical motion on their own. I needed to inspect the artwork and movement in the game, and the remaining pose limitations were kept explicit.</p></div>
        <h3 className="ntm-subheading">From early visuals to the current build.</h3>
        <div className="ntm-prose"><p>These retained development captures show the early presentation, the character remaster, its sizing/walking correction and the latest reviewed environment redesign. Here, v1–v3 label historical visual milestones, not game release numbers. The latest entry shows the local build captured on 15 October 2026. The captures use different viewport sizes and are not a matched animation comparison. Select an image to inspect the original full-size capture.</p></div>
        <HistoryGallery items={visualIterations} />
        <section className="ntm-ui-evolution" id="ntm-dialogue-history" aria-labelledby="ntm-dialogue-history-title">
          <h3 className="ntm-subheading" id="ntm-dialogue-history-title">Dialogue UI: from a reply to a decision with context.</h3>
          <div className="ntm-prose"><p>The dialogue interface evolved alongside the feedback system. These selected captures show changes in hierarchy, reading space and the relationship between previous results and the next choice. They show routine office interruptions before a response is chosen; no incident explanation or story outcome is revealed. The latest image was captured from the current source on 15 October 2026.</p></div>
          <HistoryGallery items={dialogueHistory} ui />
        </section>
        <section className="ntm-ui-evolution" id="ntm-puzzle-history" aria-labelledby="ntm-puzzle-history-title">
          <h3 className="ntm-subheading" id="ntm-puzzle-history-title">Puzzle UI: make the plan readable before executing it.</h3>
          <div className="ntm-prose"><p>The recovery puzzle separates available operations from the player’s proposed order. These historical and current captures keep the plan empty and the notes closed. They illustrate interface evolution, rather than three different solutions or new puzzle rules. I have omitted diagnosis logs, submitted plans and revealed hints so the reasoning stays in the game.</p></div>
          <HistoryGallery items={puzzleHistory} ui />
        </section>
      </section>

      <section className="container ntm-chapter" id="ntm-architecture" aria-labelledby="ntm-architecture-title">
        <p className="eyebrow mono">04 / Making change manageable</p><h2 id="ntm-architecture-title">Give each layer a clear responsibility.</h2>
        <div className="ntm-prose"><p>The game uses TypeScript, React, Phaser 3 and Vite. Its simulation owns the world state and publishes snapshots. React subscribes to those snapshots for interface updates; Phaser handles spatial presentation and traversal. A bridge carries room, proximity and interaction signals between the office and the interface.</p>
        <p>This boundary lets the simulation run without rendering the office. It supports deterministic tests, automated traversal and save-restoration checks, while interface and artwork changes can be inspected separately. Shared state still needs care: the main simulation runtime coordinates many systems, and adding a module is not free of integration work.</p></div>
        <figure className="ntm-diagram"><p className="mono ntm-figure-label">Diagram 03 / Runtime responsibilities</p><div className="ntm-architecture">
          <div className="ntm-arch-box"><h3>React interface</h3><p>Menus, reading, feedback and player actions</p></div><div className="ntm-arch-box"><h3>Phaser office</h3><p>Rooms, movement and spatial interaction</p></div>
          <p className="ntm-arch-bridge">Room and interaction signals pass through the GameBridge</p>
          <div className="ntm-arch-core"><p className="mono">Actions in ↓ / State snapshots out ↑</p><h3>TypeScript simulation runtime</h3><p>State transitions · authored rules · seeded randomness · consequence records</p></div>
          <div className="ntm-arch-box"><h3>Persistence</h3><p>Validated snapshots, migrations and local archives</p></div><div className="ntm-arch-box"><h3>Headless verification</h3><p>Tests, traversal and independent replay</p></div>
        </div><figcaption>Responsibility diagram simplified from the runtime, UI subscriptions and game bridge. It shows engineering boundaries without disclosing narrative rules.</figcaption></figure>
        <div className="ntm-two-column"><div><h3>Extend content through explicit rules</h3><p>Authored registries, typed actions and state predicates give new content a defined integration point. The event Director filters and scores authored possibilities; it is not a runtime language model inventing the story.</p><p>Seeded randomness makes a recorded sequence reproducible under matching code and settings. That is useful for debugging; it does not make the whole possibility space exhaustively tested.</p></div><div><h3>Keep optional work out of startup</h3><p>The game defers Phaser, optional panels and other modules. Bundle checks inspect the startup graph and enforce size budgets, including keeping the analytics SDK outside startup until optional consent.</p><p>These controls make growth measurable. They do not establish a universal frame-rate or mobile performance guarantee.</p></div></div>
        <h3 className="ntm-subheading">Preserve progress while the system evolves</h3><div className="ntm-prose"><p>Save loading validates the record and applies explicit incremental migrations. Supported historical saves receive conservative defaults; loading restores a snapshot without replaying gameplay. Original bytes are retained before browser conversion, and unsupported or unreadable records have recovery paths.</p></div>
        <figure className="ntm-diagram"><p className="mono ntm-figure-label">Diagram 04 / Save compatibility</p><Flow label="Safe save upgrade sequence" steps={[["Identify", "Check the stored version and supported format."], ["Preserve", "Retain the original before rewriting."], ["Migrate", "Apply ordered changes and validate the result."], ["Restore", "Resume the snapshot without rerunning actions."]]} /><figcaption>Invalid or unsupported records are preserved for recovery. Browser origin, storage access and quota remain real constraints; local saves are not cloud sync.</figcaption></figure>
      </section>

      <section className="container ntm-chapter" id="ntm-traversal" aria-labelledby="ntm-traversal-title">
        <p className="eyebrow mono">05 / Verification at scale</p><h2 id="ntm-traversal-title">Eight hours of automated exploration.</h2>
        <div className="ntm-prose"><p>The latest reviewed completion campaign ran on 15 October 2026 against a recorded 0.3.0-rc.1 / monday-8 source snapshot. Its eight-hour execution budget produced 112,402 completed simulation runs with matching verified receipts and unique run identifiers. The integrity report passed.</p>
        <p>The tool used witness-guided exploration through normal simulation actions, with recorded settings and source identity. Of the retained artifacts, 8,050 were independently replayed. A compact suite selected 44 replay witnesses covering 118 observed targets. Those targets mix endings, achievements and challenges; they are not 118 separate stories.</p></div>
        <h3 className="ntm-subheading">How the CLI turns timelines into reviewable evidence.</h3>
        <div className="ntm-prose"><p>The developer-only <code>pnpm ntm:traverse</code> CLI exercises the real simulation through legal inputs. It records the order of decisions and semantic state changes, rather than treating every seed or wording change as a new story. That gives me evidence for deciding which variations deserve a closer playtest and which missing paths need investigation.</p></div>
        <figure className="ntm-diagram ntm-traversal-diagram"><p className="mono ntm-figure-label">Diagram 05 / From story traversal to gameplay review</p>
          <Flow label="Story traversal diagnostic pipeline" steps={[["Configure", "Record source, seed, settings, strategy and resource budgets."], ["Explore", "Run legal action sequences through the actual simulation."], ["Verify", "Replay retained traces and check their recorded state witnesses."], ["Compare", "Group semantic timelines and report diversity, dependencies and gaps."]]} />
          <div className="ntm-diagnostic-branches">
            <div><h4>Timeline variants</h4><p>Compare ordered, meaningful decisions and state changes. Cosmetic wording and seed-only differences do not create separate route identities.</p></div>
            <div><h4>Essential variations</h4><p>Inspect distinct verified route families and canonical prerequisites. A frequent event in sampled runs is an association, not proof that the event is necessary.</p></div>
            <div><h4>Blocking states and gaps</h4><p>Distinguish unmet prerequisites, legitimate refusals and stalled attempts from replay failures or a search that exhausted its budget. An unobserved path is not proven impossible.</p></div>
          </div>
          <div className="ntm-diagnostic-review"><h4>Human review → a focused revision or playtest</h4><p>I can inspect retained timelines, compare counterfactual branches and prioritise suspected bottlenecks. The reports provide investigation leads; they do not rewrite the game or establish that a variation is enjoyable. Any change still needs a clear brief, regression checks and human evaluation.</p></div>
          <figcaption>Simplified from the ASTDE and targeted-search documentation. Replay verifies a recorded trace under matching source and settings, not every possible timeline. Raw traces, route conditions and specific blockers remain private; the diagram discloses no solution or unlock sequence.</figcaption>
        </figure>
        <dl className="ntm-facts ntm-traversal-facts"><div><dt>112,402</dt><dd>completed runs / verified receipts</dd></div><div><dt>8,050</dt><dd>independently replayed artifacts</dd></div><div><dt>44</dt><dd>replay witnesses in the compact suite</dd></div></dl>
        <p className="ntm-note">The execution budget elapsed in about 8 hours; final reporting finished afterward. Counts are specific to this campaign and its recorded source snapshot.</p>
        <section className="ntm-ui-evolution" id="ntm-ending-distribution" aria-labelledby="ntm-ending-distribution-title">
          <h3 className="ntm-subheading" id="ntm-ending-distribution-title">Endings found, with their files still sealed.</h3>
          <div className="ntm-prose"><p>The latest reviewed crawl verified {crawlSummary.verifiedEndingCount} ending targets. Below are all their public locked titles and the number of newly executed runs that finished in each outcome. The labels describe sealed files; real ending names, conditions and route traces stay private.</p></div>
          <figure className="ntm-diagram ntm-ending-chart">
            <p className="mono ntm-figure-label">Automated crawl / {crawlSummary.reviewedDate}</p>
            <p className="ntm-chart-summary"><strong>{crawlSummary.completedRuns.toLocaleString("en-US")} completed runs</strong> · {crawlSummary.verifiedEndingCount} locked labels · linear bar scale</p>
            <p className="ntm-note">Scroll to read all labels. Each run contributes to one final ending; repeated runs of the same route still count as runs.</p>
            <div className="ntm-ending-chart-scroll" tabIndex={0} role="region" aria-label="Scrollable chart of automated completed runs by locked ending title">
              <ol className="ntm-bars ntm-ending-bars">{crawlSummary.distribution.map(({ title, runs }) => <li key={title}>
                <span>{title}</span><span className="ntm-bar-track" aria-hidden="true"><span style={{ width: `${runs / crawlSummary.distribution[0].runs * 100}%` }} /></span>
                <strong>{runs.toLocaleString("en-US")}<span className="sr-only"> completed runs</span></strong>
              </li>)}</ol>
            </div>
            <figcaption>Counts reconcile to 112,402 unique, verified completed-run receipts from this campaign. The 40 reused baseline successes are excluded. Targeted exploration and repeated attempts shape this distribution: it is not human-player popularity, natural ending probability, unique storyline count or exhaustive coverage. Achievement awards can overlap within one run and are not added to these ending counts.</figcaption>
          </figure>
        </section>
        <div className="ntm-table-wrap"><table><caption>Unverified ending target, kept separate from the chart</caption><thead><tr><th scope="col">Locked title</th><th scope="col">Campaign status</th></tr></thead><tbody><tr><th scope="row">An inconvenient agenda</th><td>Known witness, unverified in this campaign</td></tr></tbody></table></div>
        <div className="ntm-prose"><p>The campaign ended at its duration budget with two target gaps: the unverified outcome above and its associated achievement. That is an unresolved verification gap, not proof that the outcome is impossible. A long run is useful precisely because it can expose a stubborn blind spot rather than manufacture an all-green coverage claim.</p>
        <p>Headless traversal does not exercise room collision, visual layout, keyboard focus or whether a person enjoys the pacing. Those need browser checks and human playtests. The 15 October release notes separately record 733 automated tests and a 133-test save-compatibility gate for the prepared release candidate; these are historical release checks, not tests rerun by this case study.</p></div>
        <section className="ntm-ui-evolution" id="ntm-data-collection" aria-labelledby="ntm-data-collection-title">
          <h3 className="ntm-subheading" id="ntm-data-collection-title">Collect evidence about understanding, not just completion.</h3>
          <div className="ntm-prose"><p>The crawl records deterministic actions, semantic changes and verification receipts so I can investigate the system’s behaviour. Human playtesting answers different questions: did someone understand the next task, recognise the result of a choice or know why a puzzle attempt failed? The game’s optional analytics is designed to support those questions alongside direct feedback.</p></div>
          <div className="ntm-table-wrap"><table><caption>Implemented playtest instrumentation and the questions it can support</caption><thead><tr><th scope="col">Collected signals</th><th scope="col">Question for review</th><th scope="col">Interpretation limit</th></tr></thead><tbody>
            <tr><th scope="row">Puzzle views, attempts, repeated wrong plans, hints and active time</th><td>Does a viewed stage receive an attempt? Where might instructions or feedback need attention?</td><td>A long visit or repeated attempt can mean deliberation, difficulty or confusion; the metric alone cannot tell which.</td></tr>
            <tr><th scope="row">Presented events, committed choices, consequence receipts and ordered run context</th><td>What did the player encounter, choose and observe before the next decision?</td><td>Recorded sequence and linked consequences do not prove that the player noticed or understood them.</td></tr>
            <tr><th scope="row">Run milestones, completions, resumes, replay activity and active/paused timing</th><td>Where was a run last observed, and how does a repeat visit differ from an initial run?</td><td>Missing completion is not confirmed abandonment. Pauses, later returns, consent changes and delivery gaps matter.</td></tr>
          </tbody></table></div>
          <div className="ntm-prose"><p>Gameplay sharing is consent-gated and uses explicit event/property allowlists. Automatic click capture and session replay are disabled in the game’s adapter. Local run records and diagnostic exports serve a separate purpose; a playtest report is copied or downloaded explicitly rather than automatically submitted.</p><p>No private player records or live analytics results are published here. These are implemented collection capabilities, not a claim that player behaviour has already established a particular improvement. I still need to inspect the evidence, ask players what they understood and evaluate any revision in context.</p></div>
        </section>
      </section>

      <section className="container ntm-chapter" id="ntm-lessons" aria-labelledby="ntm-lessons-title">
        <p className="eyebrow mono">06 / What I learned</p><h2 id="ntm-lessons-title">AI accelerated the work. Expertise guided the decisions.</h2>
        <div className="ntm-prose"><p>AI made it practical to move quickly between a feature idea, implementation and a diagnostic tool. My responsibility was to decide what the game should become, recognise where the result fell short and make the next change reviewable. Human involvement mattered at every stage: setting priorities, interpreting feedback and deciding what evidence was sufficient for the question being asked.</p>
        <p>The value of domain expertise was in turning observations into durable requirements. Ambiguous choices called for clearer feedback. Evolving systems needed boundaries and save compatibility. Generated artwork needed visual inspection and reliable extraction. Automated traversal could verify recorded behaviour at scale, while pacing, clarity and the experience of playing still needed human evaluation.</p>
        <p>I would carry that approach into another project: define acceptance criteria early, preserve observations alongside decisions, and evaluate each change at the appropriate layer. Better prompts emerged from understanding the product and its constraints. The outcome I am aiming for is maintainable behaviour and a coherent player experience.</p></div>
        <div className="ntm-next"><h3>Try the Monday for yourself.</h3><p>The game is available on itch.io. This case study covers development snapshots and does not assert that every reviewed change is in the currently hosted build.</p><div className="actions"><a className="button primary" href="https://modvar.itch.io/no-two-mondays" target="_blank" rel="noopener noreferrer">Play No Two Mondays ↗<span className="sr-only"> (opens in a new tab)</span></a><a className="text-link" href={`mailto:${profile.email}`}>Discuss the engineering</a></div></div>
      </section>

      <PageLandscape scene="mondays" aerial><section className="container ntm-chapter ntm-evidence" id="ntm-evidence" aria-labelledby="ntm-evidence-title">
        <p className="eyebrow mono">Evidence / Reviewed 15 October 2026</p><h2 id="ntm-evidence-title">How the case study was grounded.</h2>
        <p>The prompt figures come from an existing local development audit of surviving Codex records. It deduplicates human messages and excludes machine-agent tasks from the human-prompt count. The 37-prompt figure is the distinct union of three overlapping workflow tags: bug fixing, refinement and refactoring. Classification is lexical and can miss or misclassify requests. Missing history and later development are outside that snapshot.</p>
        <p>The revision examples come from the project feedback log, refinement notes and art review. Architecture was checked against the TypeScript simulation, React subscriptions, Phaser bridge, save migrations and bundle checks. Traversal figures come from the 15 October completion campaign’s coverage, integrity, checkpoint and replay-suite reports. Public locked labels were checked against the game’s hint registry.</p>
        <p>Only aggregate evidence and spoiler-safe descriptions are reproduced here. Private chat transcripts, raw traversal traces, puzzle solutions, hidden conditions and real ending titles are not published.</p>
      </section></PageLandscape>
    </main>
    <footer className="container footer"><p>© Mohd. Paramasvara</p><p>Based in Borneo. Building beyond it.</p><a href="/">Back to portfolio ↗</a></footer>
  </>;
}
