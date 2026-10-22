import { useEffect, useRef, useState, type ReactNode } from "react";
import { profile, projects, experience } from "./content";
import { technologyExperience, type TechnologyExperience } from "./technology";
import { observeReadingPosition, useSectionReveals, useSystemMotion, useHeroPointer } from "./usePortfolioMotion";
import { BorneoBotanical, BotanicalDrawing, PortraitUnderstory, ContactConvergence, SystemTransition, SectionBranch } from "./NaturalGraphics";
import { ProjectDiagram, CapabilityMap, CareerPath } from "./SystemDiagrams";
import { PublicEngineering } from "./PublicEngineering";
import { projectHref } from "./evidence";
import { WhatISolve } from "./WhatISolve";
import { IncidentCallout } from "./IncidentCallout";
import { NoTwoMondays } from "./NoTwoMondays";
import "./App.css";
import "./NaturalGraphics.css";
import "./SystemDiagrams.css";
import "./VisualMotion.css";
import "./Readability.css";
import { readAnalyticsPreference, setAnalyticsPreference, subscribeAnalyticsPreference } from "./analyticsPreference";
import { NarrativeAccent } from "./NarrativeArtwork/NarrativeAccent";
import { AsciiForestBackdrop } from "./AsciiForest/AsciiForestBackdrop";
import { SceneryControl } from "./AsciiForest/SceneryControl";
import PaceAssistantLauncher from "./PaceAssistantLauncher";

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}
const navItems = [
  ["work", "Work"],
  ["experience", "Experience"],
  ["capabilities", "Capabilities"],
  ["about", "About"],
  ["contact", "Contact"],
] as const;
function TextSizeControl() {
  const [size, setSize] = useState("default");
  useEffect(() => {
    const sync = () => setSize(document.documentElement.dataset.textSize || "default");
    sync();
    window.addEventListener("text-size-change", sync);
    return () => window.removeEventListener("text-size-change", sync);
  }, []);
  return <label className="theme-control"><span>Text size</span>
    <select aria-label="Text size" value={size} onChange={(event) => {
      window.dispatchEvent(new CustomEvent("text-size-preference", { detail: event.target.value }));
    }}>
      <option value="default">Default</option><option value="large">Large</option><option value="largest">Largest</option>
    </select>
  </label>;
}
function AnalyticsControl() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const sync = () => setEnabled(readAnalyticsPreference());
    sync();
    return subscribeAnalyticsPreference(sync);
  }, []);
  return <div className="analytics-control">
    <label><input type="checkbox" checked={enabled} onChange={event => setAnalyticsPreference(event.target.checked)} aria-describedby="analytics-notice" />Usage analytics</label>
    <p id="analytics-notice">Optional usage events via PostHog: page paths and link intent, with a session identifier in this tab. No form contents, gameplay actions or recordings. Off until you enable it; switch off here to withdraw. Do Not Track and Global Privacy Control take priority.</p>
  </div>;
}
function DisplayControl() {
  const settings = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !settings.current?.contains(event.target)) {
        if (settings.current) settings.current.open = false;
      }
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);
  return <details className="display-settings" ref={settings} onKeyDown={(event) => {
    if (event.key === "Escape" && settings.current) {
      settings.current.open = false;
      settings.current.querySelector("summary")?.focus();
    }
  }}>
    <summary><span aria-hidden="true">Aa</span> Display</summary>
    <div className="display-panel"><TextSizeControl /><ThemeControl /><SceneryControl />
      <p>Display choices are remembered on this device.</p>
      <AnalyticsControl />
    </div>
  </details>;
}
function ThemeControl() {
  // Keep the server and first client render identical; the head script applies
  // the actual palette before paint, then this effect syncs the control.
  const [preference, setPreference] = useState("system");
  useEffect(() => {
    const sync = () => {
      setPreference(document.documentElement.dataset.themePreference || "system");
    };
    sync();
    window.addEventListener("theme-change", sync);
    return () => window.removeEventListener("theme-change", sync);
  }, []);
  return (
    <label className="theme-control">
      <span>Theme</span>
      <select
        aria-label="Color theme"
        value={preference}
        onChange={(event) => {
          window.dispatchEvent(
            new CustomEvent("theme-preference", {
              detail: event.target.value,
            }),
          );
        }}
      >
        <option value="system">System</option>
        <option value="time">Time of day</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
export function Navigation({ home = true, contactOnPage = true }: { home?: boolean; contactOnPage?: boolean }) {
  const [active, setActive] = useState("");
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    const update = () => {
      if (header.current) document.documentElement.style.setProperty("--header-height", `${header.current.offsetHeight}px`);
    };
    const observer = new ResizeObserver(update);
    if (header.current) observer.observe(header.current);
    update();
    return () => observer.disconnect();
  }, []);
  const navHref = (id: string) => !home && contactOnPage && id === "contact" ? "#contact" : `${home ? "" : "/"}#${id}`;
  useEffect(() => {
    if (!home) return;
    let current = "";
    let atEnd = false;
    const stopReading = observeReadingPosition(
      [...document.querySelectorAll("main > section[id]")],
      (section) => {
        current = ["public-engineering", "no-two-mondays"].includes(section?.id || "") ? "work" : ["problems", "engineering-principles"].includes(section?.id || "") ? "capabilities" : section?.id || "";
        setActive(atEnd ? "contact" : current);
      },
    );
    // A short final section cannot always reach the top reading band.
    const end = new IntersectionObserver(([entry]) => {
      atEnd = entry.isIntersecting;
      setActive(atEnd ? "contact" : current);
    });
    const footer = document.querySelector("footer");
    if (footer) end.observe(footer);
    return () => {
      stopReading();
      end.disconnect();
    };
  }, [home]);
  const menu = useRef<HTMLDetailsElement>(null);
  const closeMenu = () => {
    if (menu.current) menu.current.open = false;
  };
  return (
    <header className="site-header" ref={header}>
      <div className="container header-inner">
        <a className="wordmark" href={home ? "#home" : "/"} aria-label="mpv. Mohd. Paramasvara — home">
          <span className="monogram" aria-hidden="true">
            mpv<span>.</span>
          </span>
          <span>Mohd. Paramasvara</span>
        </a>
        <div className="header-controls">
          <nav className="desktop-nav" aria-label="Primary navigation">
            {navItems.map(([id, name]) => (
              <a key={id} href={navHref(id)} aria-current={active === id ? "location" : undefined}>
                {name}
              </a>
            ))}
          </nav>
          <DisplayControl />
          <details
            className="mobile-menu"
            ref={menu}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                closeMenu();
                menu.current?.querySelector("summary")?.focus();
              }
            }}
          >
            <summary>
              Menu <span aria-hidden="true">+</span>
            </summary>
            <nav aria-label="Mobile navigation">
              {navItems.map(([id, name]) => (
                <a key={id} href={navHref(id)} onClick={closeMenu} aria-current={active === id ? "location" : undefined}>
                  {name}
                </a>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
function Hero() {
  useHeroPointer();
  return (
    <section className="hero-environment" id="home" data-motion-region="hero" aria-labelledby="hero-title">
      <AsciiForestBackdrop codeCanopy />
      <div className="hero container">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="location-dot" aria-hidden="true" /> Based in Sabah,
          Malaysia
        </p>
        <h1 id="hero-title">
          Mohd.
          <br />
          <span>Paramasvara</span>
          <span className="period">.</span>
        </h1>
        <p className="hero-role">
          Principal Full-Stack Engineer
          <br />
          <span>Technical Lead &amp; Software Architect</span>
        </p>
        <p className="hero-description">
          From complex business requirements to production software. I build
          full-stack systems, modernize legacy platforms, and lead engineering
          delivery.
        </p>
        <nav className="hero-social engineering-evidence" aria-label="Engineering evidence">
          <a href="#case-campus">Enterprise modernisation <Arrow /></a>
          <a href="#case-insurance">Integration engineering <Arrow /></a>
          <a href="/pace-rag-case-study/">Applied AI · PACE-RAG <Arrow /></a>
        </nav>
        <div className="actions">
          <a className="button primary" href="#contact">
            Discuss an engineering opportunity <Arrow />
          </a>
          <a className="button secondary" href="#work">Explore engineering work <Arrow /></a>
          <a className="text-link" href={profile.resume} target="_blank" rel="noopener noreferrer">
            2-page résumé <Arrow /><span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <nav className="hero-social hero-projects" aria-label="Independent engineering projects">
          <a href="/no-two-mondays/">No Two Mondays · case study <Arrow /></a>
          <a href="/incident-zero/">Incident Zero · engineering story <Arrow /></a>
        </nav>
        <div className="hero-social">
          <a href="/work-with-me/">Work with me <Arrow /></a>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn <Arrow /><span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a href={profile.github} target="_blank" rel="noopener noreferrer">
            GitHub <Arrow /><span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
      <figure className="portrait">
        <BotanicalDrawing className="hero-botanical" />
        <div className="portrait-frame">
          <img
            src="/images/portrait.webp"
            srcSet="/images/portrait-small.webp 480w, /images/portrait.webp 900w"
            sizes="(max-width: 760px) 80vw, 420px"
            width="900"
            height="972"
            {...{ fetchpriority: "high" }}
            alt="Illustrated portrait of Mohd. Paramasvara"
          />
        </div>
        <PortraitUnderstory />
        <figcaption>
          <span>Engineer. Architect. Builder.</span>
          <span className="mono">01 / PROFILE</span>
        </figcaption>
      </figure>
      </div>
    </section>
  );
}
function Highlights() {
  return (
    <section className="container highlights" aria-label="Career highlights">
      <div>
        <strong>Since 2013</strong>
        <span>Full-stack engineering</span>
      </div>
      <div>
        <strong>Principal &amp; Director</strong>
        <span>Hands-on delivery &amp; leadership</span>
      </div>
      <div>
        <strong>20+ properties</strong>
        <span>Rental operations platform</span>
      </div>
    </section>
  );
}
function SectionHeading({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="section-heading" data-reveal>
      <p className="eyebrow mono">
        {number} / {title}
      </p>
      <h2>{children}</h2>
    </div>
  );
}
function expandEngineeringDetails(current: HTMLDetailsElement) {
  if (current.open) current.closest("#work")?.querySelectorAll<HTMLDetailsElement>(".case-details[open]").forEach(details => {
    if (details !== current) details.open = false;
  });
}
function TechnologySummary({ record }: { record: TechnologyExperience }) {
  return <div className="project-stack" role="group" aria-label={`Technology stack for ${record.projectTitle}`}>
    <h4>Technology stack</h4>
    {record.generations.map((generation, index) => <div className="technology-generation" key={generation.label || index}>
      {generation.label && <h5>{generation.label}</h5>}
      <dl>{generation.groups.map(group => <div key={group.label}>
        <dt>{group.label}</dt><dd>{group.technologies.join(" · ")}</dd>
      </div>)}</dl>
    </div>)}
    {record.note && <p className="technology-note">{record.note}</p>}
    <p className="technology-provenance">Technology experience confirmed by project owner · 18 October 2026.</p>
    {record.repository && <a className="text-link" href={record.repository.url}>Historical source repository for {record.projectTitle} <Arrow /></a>}
  </div>;
}
function AdditionalSystems() {
  return <details className="case-details additional-systems" id="additional-systems" name="engineering-case-studies" onToggle={event => expandEngineeringDetails(event.currentTarget)}>
    <summary>Additional engineering systems<span aria-hidden="true">+</span></summary>
    <div className="case-body">
      {technologyExperience.filter(record => !record.projectId).map(record => <article id={record.anchor} key={record.id}>
        <h3 tabIndex={-1}>{record.projectTitle}</h3>
        <TechnologySummary record={record} />
      </article>)}
    </div>
  </details>;
}
function SelectedWork() {
  return (
    <section
      id="work"
      className="section container"
      aria-labelledby="work-title"
    >
      <div className="section-lead">
      <SectionBranch variant="work" />
      <SectionHeading number="01" title="Selected work">
        <span id="work-title">
          Systems behind
          <br />
          the software.
        </span>
      </SectionHeading>
      <p className="section-intro" data-reveal>
        A selection of full-stack work across education, HR, insurance, and
        property operations.
      </p>
      </div>
      <NarrativeAccent region="river" />
      <div className="project-list" data-reveal>
        {projects.map((project, index) => (
          <article className={`project${index > 2 ? " project-secondary" : ""}`} id={`case-${project.id}`} key={project.id}>
            {index < 3 && <ProjectDiagram project={project} index={index} />}
            <div className="project-content">
              <p className="project-meta mono">
                {project.company} <span> / </span> {project.period}
              </p>
              <h3 tabIndex={-1}>{project.title}</h3>
              <p className="project-scope"><span className="mono">Role</span>{project.role}</p>
              <p className="project-summary">{project.summary}</p>
              {index > 2 && <p className="project-scope"><span className="mono">Scope</span>{project.scope}</p>}
              <p className="project-result">
                <span>Contribution</span>
                {project.result}
              </p>
              {index < 3 && <p className="project-primary-stack mono" aria-label="Primary technologies">{project.technology?.generations.slice(-1)[0]?.groups.flatMap(group => group.technologies).slice(0, 5).join(" · ")}</p>}
              <details
                className="case-details"
                name="engineering-case-studies"
                onToggle={event => expandEngineeringDetails(event.currentTarget)}
              >
                <summary>
                  View engineering details
                  <span className="sr-only"> for {project.visualLabel}</span>
                  <span aria-hidden="true">+</span>
                </summary>
                <div className="case-body">
                  <dl>
                    {project.details.map(([label, text]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{text}</dd>
                      </div>
                    ))}
                  </dl>
                  {project.id === "insurance" && <a className="text-link case-conversation" href="#contact">Discuss a similar problem <Arrow /></a>}
                  <a className="text-link" href={profile.cv} target="_blank" rel="noopener noreferrer">Professional role &amp; project background: full CV <Arrow /><span className="sr-only"> (opens in a new tab)</span></a>
                  {project.technology && <TechnologySummary record={project.technology} />}
                </div>
              </details>
            </div>
          </article>
        ))}
      </div>
      <AdditionalSystems />
      <a className="text-link work-link" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
        More work &amp; professional background on LinkedIn <Arrow /><span className="sr-only"> (opens in a new tab)</span>
      </a>
    </section>
  );
}
function Experience() {
  const timeline = useRef<HTMLOListElement>(null);
  const [activeRole, setActiveRole] = useState(0);
  useEffect(() => {
    const roles = [...(timeline.current?.children || [])];
    return observeReadingPosition(roles, (active) => {
      roles.forEach((role) => role.classList.toggle("reading-active", role === active));
      if (active) setActiveRole(roles.indexOf(active));
    }, "middle");
  }, []);
  return (
    <section
      className="section experience-section"
      id="experience"
      data-motion-region="experience"
      aria-labelledby="experience-title"
    >
      <div className="container">
        <div className="section-lead">
          <SectionBranch variant="work" />
        <SectionHeading number="02" title="Experience">
          <span id="experience-title">Ownership at every level.</span>
        </SectionHeading>
        </div>
        <NarrativeAccent region="earth" />
        <div className="experience-grid" data-reveal>
          <div className="experience-note">
            <p>
              Building since 2013.
              <br />
              Leading through the code.
            </p>
            <span>Selected roles. Several engagements run concurrently.</span>
            <div className="resume-links"><a className="text-link" href={profile.resume} target="_blank" rel="noopener noreferrer">
              2-page résumé <Arrow /><span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a className="text-link" href={profile.cv} target="_blank" rel="noopener noreferrer">Full CV <Arrow /><span className="sr-only"> (opens in a new tab)</span></a>
            </div><CareerPath active={activeRole} />
          </div>
          <ol className="timeline" ref={timeline}>
            {experience.map((role, index) => (
              <li id={`role-${index}`} key={role.company + role.title}>
                <p className="mono role-period"><span className="role-index">0{index + 1}</span> {role.period}</p>
                <h3>{role.title}</h3>
                <p className="role-company">
                  {role.company} <span>· {role.type}</span>
                </p>
                <p>{role.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
function Capabilities() {
  return (
    <section
      className="section container capabilities-section"
      id="capabilities"
      data-motion-region="capabilities"
      aria-labelledby="capabilities-title"
    >
      <div className="section-lead">
        <SectionBranch variant="public" />
      <SectionHeading number="03" title="Technical capabilities">
        <span id="capabilities-title">
          Across the stack.
          <br />
          Beyond the code.
        </span>
      </SectionHeading>
      </div>
      <p className="section-intro capability-evidence">Capabilities describe my wider practice. For project-specific application, data and cloud experience, <a className="text-link" href="#work">open the selected-work engineering details</a> or <a className="text-link" href="#additional-systems">additional engineering systems</a>. Independent AI engineering demonstrations and their evidence boundaries are linked below.</p>
      <NarrativeAccent region="mountains" />
      <CapabilityMap />
      <div className="ai-evidence" id="ai-evidence">
        <h3>AI capabilities &amp; evidence</h3>
        <p><a className="text-link" href="/no-two-mondays/#ntm-process">No Two Mondays</a> demonstrates my AI-assisted engineering process through a documented independent project. <a className="text-link" href="/pace-rag-case-study/">PACE-RAG</a> is my independently developed engineering demonstration of browser embeddings, retrieval, reviewed answers and technology-aware composition. Its <a className="text-link" href="/pace-rag-case-study/#evaluation">measured evaluations and limitations</a> distinguish experimental work from enterprise production RAG delivery, which is not established. Live AI is disabled.</p>
      </div>
      <section className="engineering-principles" id="engineering-principles" aria-labelledby="principles-title">
        <h3 id="principles-title">Engineering principles &amp; decision-making</h3>
        <p className="section-intro">Selected examples of the decisions behind the work.</p>
        <div className="principle-list">
          <article><h4>Make integration boundaries explicit</h4><p>At PolicyStreet, provider rate normalization connected differing insurance APIs to consistent quotation and issuance workflows. The engineering focus was interoperability across those boundaries.</p><a className="text-link" href={projectHref("insurance", true)}>Explore the integration work <Arrow /></a></article>
          <article><h4>Evolve systems with continuity in mind</h4><p>Education platform work centres on modernising established software while supporting ongoing use. Maintainability and continued delivery provide the context for change.</p><a className="text-link" href={projectHref("campus", true)}>Explore the modernisation work <Arrow /></a></article>
          <article><h4>Keep responsibility with the engineer</h4><p>No Two Mondays pairs AI-assisted implementation with human-directed architecture, save compatibility and deterministic replay. Automated verification and human review answer different questions.</p><a className="text-link" href="/no-two-mondays/#ntm-architecture">Explore architecture &amp; verification <Arrow /></a></article>
        </div>
      </section>
    </section>
  );
}
function About() {
  return (
    <section
      id="about"
      data-motion-region="about"
      className="section about-section"
      aria-labelledby="about-title"
    >
      <div className="container about-grid">
        <div data-reveal>
          <p className="eyebrow mono">04 / About</p>
          <h2 id="about-title">
            Good engineering
            <br />
            starts with <em>why.</em>
          </h2>
          <BorneoBotanical />
          <NarrativeAccent region="forest" />
        </div>
        <div className="about-copy" data-reveal>
          <p>
            I’m Mohd. Paramasvara, a full-stack software engineer based in
            Sabah, Malaysia. My work connects software architecture, hands-on
            implementation, and the business problem a system needs to solve.
          </p>
          <p>
            I look at domain rules, data and delivery together, so the implementation
            serves the wider system. Alongside building software, I teach
            development and help teams understand the decisions behind the code.
          </p>
          <p className="education">
            <span className="mono">Education</span>Computing &amp; Information
            Systems · University of Portsmouth
            <br />
            Computer Software Engineering · Multimedia College
          </p>
          {import.meta.env.VITE_PACE_RAG_ENABLED !== "false" && <PaceAssistantLauncher />}
        </div>
      </div>
    </section>
  );
}
function Contact() {
  const [copyStatus, setCopyStatus] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  const copyEmail = async () => {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopyStatus("Copied ✓");
      timer.current = setTimeout(() => setCopyStatus(""), 1500);
    } catch {
      setCopyStatus("Couldn’t copy automatically. Select the email to copy.");
      timer.current = setTimeout(() => setCopyStatus(""), 4000);
    }
  };
  return (
    <section
      className="section contact contact-environment"
      id="contact"
      data-motion-region="contact"
      aria-labelledby="contact-title"
    >
      <AsciiForestBackdrop aerial />
      <div className="container" data-reveal>
        <p className="eyebrow mono">05 / Let’s talk</p>
        <h2 id="contact-title">
          A complex problem.
          <br />
          <span>A clear next step.</span>
        </h2>
        <p>
          Discuss a senior engineering role, a system that needs modernising, or a
          technical project worth solving.
        </p>
        <div className="contact-booking">
          <a className="button primary" href={profile.discovery} target="_blank" rel="noopener noreferrer" aria-label="Book a conversation (opens Cal.com in a new tab)" data-conversation-cta="">
            Book a conversation <Arrow />
          </a>
          <p>An introductory conversation about an engineering opportunity, architecture problem or collaboration.</p>
        </div>
        <a className="contact-email" href={`mailto:${profile.email}`}>
          {profile.email} <Arrow />
        </a>
        <div className="email-copy">
          <button type="button" className="copy-email" onClick={copyEmail}>Copy email</button>
          <span className="copy-status" role="status">{copyStatus}</span>
        </div>
        <ContactConvergence />
        <div className="contact-links">
          <a className="text-link" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
            Connect on LinkedIn <Arrow /><span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a className="text-link" href={profile.resume} target="_blank" rel="noopener noreferrer">
            2-page résumé <Arrow /><span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a className="text-link" href={profile.cv} target="_blank" rel="noopener noreferrer">Full CV <Arrow /><span className="sr-only"> (opens in a new tab)</span></a>
        </div>
      </div>
    </section>
  );
}
function App() {
  useSectionReveals();
  useSystemMotion();
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navigation />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Highlights />
        <SelectedWork />
        <PublicEngineering />
        <IncidentCallout />
        <NoTwoMondays />
        <SystemTransition />
        <Experience />
        <Capabilities />
        <WhatISolve />
        <About />
        <Contact />
      </main>
      <footer className="container footer">
        <p>© Mohd. Paramasvara</p>
        <p>Based in Borneo. Building beyond it.</p>
        <a href="#home">
          Back to top <span aria-hidden="true">↑</span>
        </a>
      </footer>
    </>
  );
}
export default App;
