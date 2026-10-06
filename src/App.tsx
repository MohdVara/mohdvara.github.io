import { useEffect, useRef, useState, type ReactNode } from "react";
import { profile, projects, experience, capabilities } from "./content";
import { observeReadingPosition, useHeroDepth, useSectionReveals } from "./usePortfolioMotion";
import { BorneoBotanical, BotanicalDrawing, PortraitUnderstory, RiverNetwork, SystemTransition } from "./NaturalGraphics";
import "./App.css";
import "./NaturalGraphics.css";

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
function Navigation() {
  const [active, setActive] = useState("");
  useEffect(() => {
    let current = "";
    let atEnd = false;
    const stopReading = observeReadingPosition(
      [...document.querySelectorAll("main > section[id]")],
      (section) => {
        current = section?.id || "";
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
  }, []);
  const menu = useRef<HTMLDetailsElement>(null);
  const closeMenu = () => {
    if (menu.current) menu.current.open = false;
  };
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="wordmark" href="#home" aria-label="Mohd. Paramasvara — home">
          <span className="monogram" aria-hidden="true">
            mpv<span>.</span>
          </span>
          <span>Mohd. Paramasvara</span>
        </a>
        <div className="header-controls">
          <nav className="desktop-nav" aria-label="Primary navigation">
            {navItems.map(([id, name]) => (
              <a key={id} href={`#${id}`} aria-current={active === id ? "location" : undefined}>
                {name}
              </a>
            ))}
          </nav>
          <ThemeControl />
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
                <a key={id} href={`#${id}`} onClick={closeMenu} aria-current={active === id ? "location" : undefined}>
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
  useHeroDepth();
  return (
    <section className="hero container" id="home" aria-labelledby="hero-title">
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
        <div className="actions">
          <a className="button primary" href="#work">
            Explore my work <Arrow />
          </a>
          <a className="button secondary" href={profile.resume}>
            View résumé <Arrow />
          </a>
        </div>
        <div className="hero-social">
          <a href={profile.linkedin}>
            LinkedIn <Arrow />
          </a>
          <a href={profile.github}>
            GitHub <Arrow />
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
            fetchPriority="high"
            alt="Illustrated portrait of Mohd. Paramasvara"
          />
        </div>
        <PortraitUnderstory />
        <figcaption>
          <span>Engineer. Architect. Builder.</span>
          <span className="mono">01 / PROFILE</span>
        </figcaption>
      </figure>
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
function SelectedWork() {
  return (
    <section
      id="work"
      className="section container"
      aria-labelledby="work-title"
    >
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
      <div className="project-list" data-reveal>
        {projects.map((project, index) => (
          <article className="project" key={project.id}>
            <div
              className={`project-visual visual-${project.id}`}
              aria-hidden="true"
            >
              <div className="visual-top mono">
                <span>{project.category}</span>
                <span>0{index + 1}</span>
              </div>
              <div className="system-sketch">
                {project.functions.map((item, i) => (
                  <div key={item}>
                    <span className="sketch-index mono">0{i + 1}</span>
                    <span>{item}</span>
                    <span className="sketch-dot" />
                  </div>
                ))}
              </div>
              <p className="visual-bottom mono">{project.visualLabel}</p>
            </div>
            <div className="project-content">
              <p className="project-meta mono">
                {project.company} <span> / </span> {project.period}
              </p>
              <h3>{project.title}</h3>
              <p className="project-summary">{project.summary}</p>
              <p className="project-result">
                <span>Delivered</span>
                {project.result}
              </p>
              <details
                className="case-details"
                name="engineering-case-studies"
                onToggle={(event) => {
                  const current = event.currentTarget;
                  if (!current.open) return;
                  // Also support browsers without exclusive native details groups.
                  current.closest(".project-list")?.querySelectorAll<HTMLDetailsElement>("details[open]").forEach((details) => {
                    if (details !== current) details.open = false;
                  });
                }}
              >
                <summary>
                  Engineering details
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
                  {project.stack.length > 0 && (
                    <p className="project-stack">
                      <span>Stack</span>
                      {project.stack.join(" · ")}
                    </p>
                  )}
                </div>
              </details>
            </div>
          </article>
        ))}
      </div>
      <a className="text-link work-link" href={profile.linkedin}>
        More work &amp; professional background on LinkedIn <Arrow />
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
    });
  }, []);
  return (
    <section
      className="section experience-section"
      id="experience"
      aria-labelledby="experience-title"
    >
      <div className="container">
        <SectionHeading number="02" title="Experience">
          <span id="experience-title">Ownership at every level.</span>
        </SectionHeading>
        <div className="experience-grid" data-reveal>
          <div className="experience-note">
            <p>
              Building since 2013.
              <br />
              Leading through the code.
            </p>
            <span>Selected roles. Several engagements run concurrently.</span>
            <a className="text-link" href={profile.resume}>
              View full résumé <Arrow />
            </a>
          </div>
          <ol className="timeline" ref={timeline}>
            {experience.map((role) => (
              <li key={role.company + role.title}>
                <p className="mono role-period">{role.period}</p>
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
      aria-labelledby="capabilities-title"
    >
      <div className="capability-network"><RiverNetwork variant="roots" /></div>
      <SectionHeading number="03" title="Technical capabilities">
        <span id="capabilities-title">
          Across the stack.
          <br />
          Beyond the code.
        </span>
      </SectionHeading>
      <div className="capability-grid" data-reveal>
        {capabilities.map((group) => (
          <div className="capability" key={group.title}>
            <h3>{group.title}</h3>
            <p>{group.description}</p>
            <span>{group.tools}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
function About() {
  return (
    <section
      id="about"
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
        </div>
        <div className="about-copy" data-reveal>
          <p>
            I’m Mohd. Paramasvara, a full-stack software engineer based in
            Sabah, Malaysia. My work connects software architecture, hands-on
            implementation, and the business problem a system needs to solve.
          </p>
          <p>
            I’ve worked across education, financial services, and property
            technology — from legacy modernization and deployment processes to
            engineering leadership. Alongside delivery, I teach software
            development and help teams build their technical understanding.
          </p>
          <p className="education">
            <span className="mono">Education</span>Computing &amp; Information
            Systems · University of Portsmouth
            <br />
            Computer Software Engineering · Multimedia College
          </p>
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
      setCopyStatus("Select the email to copy");
      timer.current = setTimeout(() => setCopyStatus(""), 4000);
    }
  };
  return (
    <section
      className="section container contact"
      id="contact"
      aria-labelledby="contact-title"
    >
      <div className="contact-flow"><RiverNetwork variant="convergence" /></div>
      <div data-reveal>
        <p className="eyebrow mono">05 / Let’s talk</p>
        <h2 id="contact-title">
          A complex problem.
          <br />
          <span>A clear next step.</span>
        </h2>
        <p>
          Discuss a senior engineering role, a system that needs modernizing, or a
          product that needs an experienced technical lead.
        </p>
        <a className="contact-email" href={`mailto:${profile.email}`}>
          {profile.email} <Arrow />
        </a>
        <div className="email-copy">
          <button type="button" className="copy-email" onClick={copyEmail}>Copy email</button>
          <span className="copy-status" role="status">{copyStatus}</span>
        </div>
        <div className="contact-links">
          <a className="text-link" href={profile.linkedin}>
            Connect on LinkedIn <Arrow />
          </a>
          <a className="text-link" href={profile.resume}>
            View résumé <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}
function App() {
  useSectionReveals();
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
        <SystemTransition />
        <Experience />
        <Capabilities />
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
