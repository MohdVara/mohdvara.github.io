import ContentFreshness from "./ContentFreshness";
import BuildRevision from "./BuildRevision";
import { useOptionalMotion } from "./useOptionalMotion";
import CaseStudyQuickRead from "./CaseStudyQuickRead";
import { useExperience } from "./i18n/context";
import { language } from "./i18n/languages";
import { NamePronunciation, HeroNameReading } from "./i18n/controls";
import { localizedHref } from "./i18n/config";
import { TranslationNotice, VerticalText } from "./i18n/controls";
import { text, localizedContent } from "./i18n/config";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { profile, projects, experience } from "./content";
import { technologyExperience, type TechnologyExperience } from "./technology";
import { observeReadingPosition, useSectionReveals } from "./usePortfolioMotion";
import { BorneoBotanical, BotanicalDrawing, PortraitUnderstory, ContactConvergence, SystemTransition, SectionBranch } from "./NaturalGraphics";
import { ProjectDiagram, CapabilityMap } from "./SystemDiagrams";
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
import { NarrativeAccent } from "./NarrativeArtwork/NarrativeAccent";
import { AsciiForestBackdrop } from "./AsciiForest/AsciiForestBackdrop";
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
export function Navigation({ home = true, contactOnPage = true }: { home?: boolean; contactOnPage?: boolean }) {
  const {locale} = useExperience();
  const [active, setActive] = useState("");
  const header = useRef<HTMLElement>(null);
  const notice = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const update = () => {
      document.documentElement.style.setProperty("--translation-notice-height", `${notice.current?.offsetHeight || 0}px`);
      if (header.current) document.documentElement.style.setProperty("--header-height", `${header.current.offsetHeight}px`);
    };
    const observer = new ResizeObserver(update);
    if (header.current) observer.observe(header.current);
    if (notice.current) observer.observe(notice.current);
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
    <><header className="site-header" ref={header}>
      <div className="container header-inner">
        <a className="wordmark" href={localizedHref(home ? "#home" : "/")} aria-label={text("mpv. Mohd. Paramasvara — home")}>
          <span className="monogram" lang={locale} dir="auto" aria-hidden="true">{language(locale).brandMark}<span>.</span>
          </span>
        </a>
        <div className="header-controls">
          <nav className="desktop-nav" aria-label={text("Primary navigation")}>
            {localizedContent(navItems.map(([id, name]) => (
              <a key={id} href={localizedHref(navHref(id))} aria-current={active === id ? "location" : undefined}>
                {localizedContent(name)}
              </a>
            )))}
          </nav>
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
            <summary>{text("Menu ")}<span aria-hidden="true">+</span>
            </summary>
            <nav aria-label={text("Mobile navigation")}>
              {localizedContent(navItems.map(([id, name]) => (
                <a key={id} href={localizedHref(navHref(id))} onClick={closeMenu} aria-current={active === id ? "location" : undefined}>
                  {localizedContent(name)}
                </a>
              )))}
            </nav>
          </details>
        </div>
      </div>
    </header><div ref={notice}><TranslationNotice /></div></>
  );
}
function Hero() {
  return (
    <section className="hero-environment" id="home" data-motion-region="hero" aria-labelledby="hero-title">
      <AsciiForestBackdrop codeCanopy />
      <div className="hero container">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="location-dot" aria-hidden="true" />{text(" Based in Sabah, Malaysia")}</p>
        <h1 id="hero-title" lang="en" dir="ltr">{text("Mohd.")}<br />
          <span>{text("Paramasvara")}</span>
          <span className="period">.</span>
        </h1>
        <HeroNameReading />
        <p className="hero-role">{text("Principal Full-Stack Engineer")}<br />
          <span>{text("Technical Lead & Software Architect")}</span>
        </p>
        <p className="hero-description">{text("Trusted with final architectural decisions. I align stakeholders on trade-offs and build full-stack systems around business needs.")}</p>
        <nav className="hero-social engineering-evidence" aria-label={text("Engineering evidence")}>
          <a href="#case-campus">{text("Enterprise modernisation ")}<Arrow /></a>
          <a href="#case-insurance">{text("Integration engineering ")}<Arrow /></a>
          <a href={localizedHref("/pace-rag-case-study/")}>{text("Applied AI · PACE-RAG ")}<Arrow /></a>
        </nav>
        <div className="actions">
          <a className="button primary" href="#contact">{text("Discuss an engineering opportunity ")}<Arrow />
          </a>
          <a className="button secondary" href="#work">{text("Professional delivery ")}<Arrow /></a>
          <a className="text-link" href={localizedHref(profile.resume)} target="_blank" rel="noopener noreferrer">{text("2-page résumé ")}<Arrow /><span className="sr-only">{text(" (opens in a new tab)")}</span>
          </a>
        </div>
        <nav className="hero-social hero-projects" aria-label={text("Independent engineering projects")}>
          <a href="#public-engineering">{text("Independent engineering ")}<Arrow /></a>
          <a href={localizedHref("/incident-zero/")}>{text("Incident Zero · engineering story ")}<Arrow /></a>
        </nav>
        <div className="hero-social">
          <a href={localizedHref("/work-with-me/")}>{text("Work with me ")}<Arrow /></a>
          <a href={localizedHref(profile.linkedin)} target="_blank" rel="noopener noreferrer">{text("LinkedIn ")}<Arrow /><span className="sr-only">{text(" (opens in a new tab)")}</span>
          </a>
          <a href={localizedHref(profile.github)} target="_blank" rel="noopener noreferrer">{text("GitHub ")}<Arrow /><span className="sr-only">{text(" (opens in a new tab)")}</span>
          </a>
        </div>
      </div>
      <figure className="portrait">
        <HeroNameReading portrait />
        <BotanicalDrawing className="hero-botanical" />
        <div className="portrait-frame">
          <PortraitImage />
        </div>
        <PortraitUnderstory />
        <figcaption>
          <span>{text("Engineer. Architect. Builder.")}</span>
          <span className="mono">{text("01 / PROFILE")}</span>
        </figcaption>
      </figure>
      </div>
    </section>
  );
}
function PortraitImage() {
  const [isLight, setIsLight] = useState(false);
  useEffect(() => {
    const sync = () => setIsLight(document.documentElement.dataset.theme === "light");
    sync();
    window.addEventListener("theme-change", sync);
    return () => window.removeEventListener("theme-change", sync);
  }, []);
  return <img
    src={isLight ? "/images/portrait.webp" : "/images/MohdVaraLetters-refined.svg"}
    sizes="(max-width: 760px) 80vw, 420px"
    width="900"
    height="972"
    {...{ fetchpriority: "high" }}
    alt={text("Illustrated portrait of Mohd. Paramasvara")}
  />;
}
function Highlights() {
  return (
    <section className="container highlights" aria-label={text("Career highlights")}>
      <div>
        <strong>{text("Since 2013")}</strong>
        <span>{text("Full-stack engineering")}</span>
      </div>
      <div>
        <strong>{text("Principal & Director")}</strong>
        <span>{text("Hands-on delivery & leadership")}</span>
      </div>
      <div>
        <strong>{text("20+ properties")}</strong>
        <span>{text("Rental operations platform")}</span>
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
        {localizedContent(number)} / {localizedContent(title)}
      </p>
      <h2><VerticalText>{localizedContent(children)}</VerticalText></h2>
    </div>
  );
}
function expandEngineeringDetails(current: HTMLDetailsElement) {
  if (current.open) current.closest("#work")?.querySelectorAll<HTMLDetailsElement>(".case-details[open]").forEach(details => {
    if (details !== current) details.open = false;
  });
}
function TechnologySummary({ record }: { record: TechnologyExperience }) {
  return <div className="project-stack" role="group" aria-label={text("Technology stack for {{value0}}", {value0: record.projectTitle})}>
    <h4>{text("Technology stack")}</h4>
    {localizedContent(record.generations.map((generation, index) => <div className="technology-generation" key={generation.label || index}>
      {localizedContent(generation.label && <h5>{localizedContent(generation.label)}</h5>)}
      <dl>{localizedContent(generation.groups.map(group => <div key={group.label}>
        <dt>{localizedContent(group.label)}</dt><dd>{localizedContent(group.technologies.join(" · "))}</dd>
      </div>))}</dl>
    </div>))}
    {localizedContent(record.note && <p className="technology-note">{localizedContent(record.note)}</p>)}
    <p className="technology-provenance">{text("Technology experience confirmed by project owner · 18 October 2026.")}</p>
    {localizedContent(record.repository && <a className="text-link" href={localizedHref(record.repository.url)}>{text("Historical source repository for ")}{localizedContent(record.projectTitle)} <Arrow /></a>)}
  </div>;
}
function AdditionalSystems() {
  return <details className="case-details additional-systems" id="additional-systems" name="engineering-case-studies" onToggle={event => expandEngineeringDetails(event.currentTarget)}>
    <summary>{text("Additional engineering systems")}<span aria-hidden="true">+</span></summary>
    <div className="case-body">
      {localizedContent(technologyExperience.filter(record => !record.projectId).map(record => <article id={record.anchor} key={record.id}>
        <h3 tabIndex={-1}>{localizedContent(record.projectTitle)}</h3>
        <ContentFreshness contentId={record.id}/><TechnologySummary record={record} />
      </article>))}
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
      <SectionHeading number="01" title={text("Selected work")}>
        <span id="work-title">{text("Systems behind")}<br />{text("the software.")}</span>
      </SectionHeading>
      <p className="section-intro" data-reveal>{text("A selection of full-stack work across education, HR, insurance, and property operations.")}</p>
      </div>
      <NarrativeAccent region="river" />
      <div className="project-list" data-reveal>
        {localizedContent(projects.map((project, index) => (
          <article className={`project${index > 2 ? " project-secondary" : ""}`} id={`case-${project.id}`} key={project.id}>
            {localizedContent(index < 3 && <ProjectDiagram project={project} index={index} />)}
            <div className="project-content">
              <div className="project-overview">
              <p className="project-meta mono">
                {localizedContent(project.company)} <span> / </span> {localizedContent(project.period)}
              </p>
              <h3 tabIndex={-1}>{localizedContent(project.title)}</h3>
              <p className="project-scope"><span className="mono">{text("Role")}</span>{localizedContent(project.role)}</p>
              <p className="project-summary">{localizedContent(project.summary)}</p>
              {localizedContent(index > 2 && <p className="project-scope"><span className="mono">{text("Scope")}</span>{localizedContent(project.scope)}</p>)}
              <p className="project-result">
                <span>{text("Contribution")}</span>
                {localizedContent(project.result)}
              </p>
              {localizedContent(index < 3 && <p className="project-primary-stack mono" aria-label={text("Primary technologies")}>{localizedContent(project.technology?.generations.slice(-1)[0]?.groups.flatMap(group => group.technologies).slice(0, 5).join(" · "))}</p>)}
              </div>
              <details
                className="case-details"
                name="engineering-case-studies"
                onToggle={event => expandEngineeringDetails(event.currentTarget)}
              >
                <summary>{text("View engineering details")}<span className="sr-only">{text(" for ")}{localizedContent(project.visualLabel)}</span>
                  <span aria-hidden="true">+</span>
                </summary>
                <div className="case-body">
                  <ContentFreshness contentId={project.id}/>
                  {project.details.some(([label]) => label === "Key Engineering Decision") && <CaseStudyQuickRead commercial id={`commercial-${project.id}`} item={{
                    name: project.title,
                    problem: project.details.find(([label]) => /problem/i.test(label))?.[1] || project.summary,
                    role: project.details.find(([label]) => label === "My ownership")?.[1] || project.role,
                    decision: project.details.find(([label]) => label === "Key Engineering Decision")![1],
                    result: project.result,
                    status: "Owner-reported delivery · public verification limited.",
                    focus: project.scope,
                    evidence: `#delivery-${project.id}`,
                  }} />}

                  <dl id={`delivery-${project.id}`}>
                    {localizedContent(project.details.filter(([label]) => label !== "My ownership").map(([label, text]) => (
                      <div key={label}>
                        <dt>{localizedContent(label)}</dt>
                        <dd>{localizedContent(text)}</dd>
                      </div>
                    )))}
                  </dl>
                  {localizedContent(project.id === "insurance" && <a className="text-link case-conversation" href="#contact">{text("Discuss a similar problem ")}<Arrow /></a>)}
                  <a className="text-link" href={localizedHref(profile.cv)} target="_blank" rel="noopener noreferrer">{text("Professional role & project background: full CV ")}<Arrow /><span className="sr-only">{text(" (opens in a new tab)")}</span></a>
                  {localizedContent(project.technology && <TechnologySummary record={project.technology} />)}
                </div>
              </details>
            </div>
          </article>
        )))}
      </div>
      <AdditionalSystems />
      <a className="text-link work-link" href={localizedHref(profile.linkedin)} target="_blank" rel="noopener noreferrer">{text("More work & professional background on LinkedIn ")}<Arrow /><span className="sr-only">{text(" (opens in a new tab)")}</span>
      </a>
    </section>
  );
}
function Experience() {
  const timeline = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const roles = [...(timeline.current?.children || [])];
    return observeReadingPosition(roles, (active) => {
      roles.forEach((role) => role.classList.toggle("reading-active", role === active));
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
        <SectionHeading number="02" title={text("Experience")}>
          <span id="experience-title">{text("Ownership at every level.")}</span>
        </SectionHeading>
          <div className="experience-note">
            <p>{text("Building since 2013.")}<br />{text("Leading through the code.")}</p>
            <span>{text("Selected roles and project work. Several engagements run concurrently.")}</span>
            <div className="resume-links"><a className="text-link" href={localizedHref(profile.resume)} target="_blank" rel="noopener noreferrer">{text("2-page résumé ")}<Arrow /><span className="sr-only">{text(" (opens in a new tab)")}</span>
            </a>
            <a className="text-link" href={localizedHref(profile.cv)} target="_blank" rel="noopener noreferrer">{text("Full CV ")}<Arrow /><span className="sr-only">{text(" (opens in a new tab)")}</span></a>
            </div>
          </div>
        </div>
        <NarrativeAccent region="earth" />
        <div className="experience-grid" data-reveal>
          <ol className="timeline" ref={timeline}>
            {localizedContent(experience.map((role, index) => (
              <li id={`role-${index}`} key={role.company + role.title}>
                <svg className="role-connector" viewBox="0 0 64 100" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false">
                  <path className="role-contour" d="M24 0C-6 28 54 72 24 100" />
                  <path className="role-river" d="M32 0C2 28 62 72 32 100" />
                  <path className="role-twigs" d="M24 28C12 32 15 38 5 40M40 72C50 75 48 80 59 83M10 35Q1 32 3 27Q13 28 10 35M54 79Q63 75 61 70Q51 72 54 79" />
                </svg>
                <p className="mono role-period"><span className="role-index">0{localizedContent(index + 1)}</span> {localizedContent(role.period)}</p>
                <h3>{localizedContent(role.title)}</h3>
                <p className="role-company">
                  {localizedContent(role.company)} <span>· {localizedContent(role.type)}</span>
                </p>
                <p>{localizedContent(role.description)}</p>
              </li>
            )))}
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
      <SectionHeading number="03" title={text("Technical capabilities")}>
        <span id="capabilities-title">{text("Across the stack.")}<br />{text("Beyond the code.")}</span>
      </SectionHeading>
      </div>
      <p className="section-intro capability-evidence">{text("Capabilities describe my wider practice. For project-specific application, data and cloud experience, ")}<a className="text-link" href="#work">{text("open the selected-work engineering details")}</a>{text(" or ")}<a className="text-link" href="#additional-systems">{text("additional engineering systems")}</a>{text(". Independent AI engineering demonstrations and their evidence boundaries are linked below.")}</p>
      <NarrativeAccent region="mountains" />
      <CapabilityMap />
      <div className="ai-evidence script-editorial" id="ai-evidence">
        <h3>{text("AI capabilities & evidence")}</h3>
        <p><a className="text-link" href={localizedHref("/no-two-mondays/#ntm-process")}>{text("No Two Mondays")}</a>{text(" demonstrates my AI-assisted engineering process through a documented independent project. ")}<a className="text-link" href={localizedHref("/pace-rag-case-study/")}>{text("PACE-RAG")}</a>{text(" is my independently developed engineering demonstration of browser embeddings, retrieval, reviewed answers and technology-aware composition. Its ")}<a className="text-link" href={localizedHref("/pace-rag-case-study/#evaluation")}>{text("measured evaluations and limitations")}</a>{text(" distinguish experimental work from enterprise production RAG delivery, which is not established. Live AI is disabled.")}</p>
      </div>
      <section className="engineering-principles" id="engineering-principles" aria-labelledby="principles-title">
        <h3 id="principles-title">{text("Engineering principles & decision-making")}</h3>
        <p className="section-intro">{text("Selected examples of the decisions behind the work.")}</p>
        <div className="principle-list">
          <article><h4>{text("Make integration boundaries explicit")}</h4><p>{text("At PolicyStreet, provider rate normalization connected differing insurance APIs to consistent quotation and issuance workflows. The engineering focus was interoperability across those boundaries.")}</p><a className="text-link" href={localizedHref(projectHref("insurance", true))}>{text("Explore the integration work ")}<Arrow /></a></article>
          <article><h4>{text("Evolve systems with continuity in mind")}</h4><p>{text("Education platform work centres on modernising established software while supporting ongoing use. Maintainability and continued delivery provide the context for change.")}</p><a className="text-link" href={localizedHref(projectHref("campus", true))}>{text("Explore the modernisation work ")}<Arrow /></a></article>
          <article><h4>{text("Keep responsibility with the engineer")}</h4><p>{text("No Two Mondays pairs AI-assisted implementation with human-directed architecture, save compatibility and deterministic replay. Automated verification and human review answer different questions.")}</p><a className="text-link" href={localizedHref("/no-two-mondays/#ntm-architecture")}>{text("Explore architecture & verification ")}<Arrow /></a></article>
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
          <p className="eyebrow mono">{text("04 / About")}</p>
          <h2 id="about-title"><VerticalText>{text("Good engineering")}<br />{text("starts with ")}<em>{text("why.")}</em>
          </VerticalText></h2>
          <BorneoBotanical />
          <NarrativeAccent region="forest" />
        </div>
        <div className="about-copy" data-reveal>
          <p>{text("I’m Mohd. Paramasvara, a full-stack software engineer based in Sabah, Malaysia. My work connects software architecture, hands-on implementation, and the business problem a system needs to solve.")}</p>
          <p>{text("I look at domain rules, data and delivery together, so the implementation serves the wider system. Alongside building software, I teach development and help teams understand the decisions behind the code.")}</p>
          <NamePronunciation />
          <p className="education">
            <span className="mono">{text("Education")}</span>{text("Computing & Information Systems · University of Portsmouth")}<br />{text("Computer Software Engineering · Multimedia College")}</p>
          {localizedContent(import.meta.env.VITE_PACE_RAG_ENABLED !== "false" && <PaceAssistantLauncher />)}
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
        <p className="eyebrow mono">{text("05 / Let’s talk")}</p>
        <h2 id="contact-title"><VerticalText>{text("A complex problem.")}<br />
          <span>{text("A clear next step.")}</span>
        </VerticalText></h2>
        <p>{text("Discuss a senior engineering role, a system that needs modernising, or a technical project worth solving.")}</p>
        <div className="contact-booking">
          <a className="button primary" href={localizedHref(profile.discovery)} target="_blank" rel="noopener noreferrer" aria-label={text("Book a conversation (opens Cal.com in a new tab)")} data-conversation-cta="">{text("Book a conversation ")}<Arrow />
          </a>
          <p>{text("An introductory conversation about an engineering opportunity, architecture problem or collaboration.")}</p>
        </div>
        <a className="contact-email" href={localizedHref(`mailto:${profile.email}`)}>
          {localizedContent(profile.email)} <Arrow />
        </a>
        <div className="email-copy">
          <button type="button" className="copy-email" onClick={copyEmail}>{text("Copy email")}</button>
          <span className="copy-status" role="status">{localizedContent(copyStatus)}</span>
        </div>
        <ContactConvergence />
        <div className="contact-links">
          <a className="text-link" href={localizedHref(profile.linkedin)} target="_blank" rel="noopener noreferrer">{text("Connect on LinkedIn ")}<Arrow /><span className="sr-only">{text(" (opens in a new tab)")}</span>
          </a>
          <a className="text-link" href={localizedHref(profile.resume)} target="_blank" rel="noopener noreferrer">{text("2-page résumé ")}<Arrow /><span className="sr-only">{text(" (opens in a new tab)")}</span>
          </a>
          <a className="text-link" href={localizedHref(profile.cv)} target="_blank" rel="noopener noreferrer">{text("Full CV ")}<Arrow /><span className="sr-only">{text(" (opens in a new tab)")}</span></a>
        </div>
      </div>
    </section>
  );
}
function App() {
  useSectionReveals();
  useOptionalMotion();
  return (
    <>
      <a className="skip-link" href="#main">{text("Skip to content")}</a>
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
        <p>{text("© Mohd. Paramasvara")}</p>
        <p>{text("Based in Borneo. Building beyond it.")}</p>
        <a href="#home">{text("Back to top ")}<span aria-hidden="true">↑</span>
        </a>
        <BuildRevision />
      </footer>
    </>
  );
}
export default App;
