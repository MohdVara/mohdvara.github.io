import CaseStudyQuickRead from "../../CaseStudySummary";
import { localizedHref } from "../../i18n/config";
import { text, localizedContent } from "../../i18n/config";
import { PageLandscape } from "../../AsciiForest/PageLandscape";
import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { Navigation } from "../../App";
import "./incident.css";
const GameShell = lazy(() => import("./GameShell"));
class GameBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div role="alert">
        <h2>{text("Incident simulation could not start.")}</h2>
        <p>{text("Please retry, or return to the engineering portfolio.")}</p>
        <button onClick={() => window.location.reload()}>{text("Retry")}</button>
        <a className="text-link" href={localizedHref("/")}>{text("Return to portfolio ↗")}</a>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function IncidentZeroRoute() {
  const [mode, setMode] = useState<"play" | "preview" | null>(null);
  // Read the optional shortcut after hydration so prerendered opening content
  // stays identical to the first browser render. Unknown modes keep the entry.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("mode") === "preview") {
      setMode("preview");
    }
  }, []);
  return (
    <div className={`iz-experience ${mode ? "iz-active" : ""}`}>
      <a className="skip-link" href="#incident-main">{text("Skip to incident")}</a>
      <Navigation home={false} contactOnPage={false} />
      <main className="container iz-page" id="incident-main" tabIndex={-1}>
        {localizedContent(mode ? <h1 className="sr-only">{text("Incident Zero · interactive engineering story")}</h1> : <PageLandscape scene="incident" contained><div className="container page-landscape-intro"><div className="iz-page-heading">
          <div>
            <a className="text-link" href={localizedHref("/")}>{text("Portfolio /")}</a>
            <h1>{text("Incident Zero")}<span className="iz-title-dot">.</span>
            </h1>
            <p>{text("An interactive systems-engineering story.")}</p>
          </div>
          <span className="mono iz-edition">{text("A FICTIONAL INCIDENT")}<br />{text("A REAL KIND OF QUESTION")}</span>
        </div></div></PageLandscape>)
        }
        {!mode && <CaseStudyQuickRead study="incident" />}
        {localizedContent(mode ? (
          <GameBoundary>
            <Suspense fallback={<p role="status">{text("Initialising incident…")}</p>}>
              <GameShell preview={mode === "preview"} />
            </Suspense>
          </GameBoundary>
        ) : (
          <section className="iz-opening" aria-labelledby="iz-opening-title">
            <div className="script-editorial-labelled">
              <p className="eyebrow mono">{text("Monday / 08:47")}</p>
              <h2 id="iz-opening-title">{text("Payroll closes tomorrow.")}<br />{text("The systems disagree.")}</h2>
              <p>{text("Finance says the total is wrong. HR says the record is correct. Operations says the integration succeeded.")}</p>
              <p>{text("You are the engineer. Explore a small office, collect the evidence and decide what should change before production moves again.")}</p>
              <div className="iz-actions">
                <button
                  className="button primary"
                  onClick={() => setMode("play")}
                >{text("Play the incident →")}</button>
                <button onClick={() => setMode("preview")}>{text("Preview the engineering decisions")}</button>
                <span className="iz-muted">{text("Allow about 6–12 minutes · keyboard / touch")}</span>
              </div>
              <p className="iz-small iz-keyboard-only">{text("WASD / arrows to move. E / Enter to inspect. Esc to pause. A non-spatial navigation mode and plain-language puzzles are available throughout.")}</p>
              <p className="iz-small iz-touch-only">{text("Tap to explore, hold the direction pad to walk, and tap choices to investigate. Direct room and inspection buttons are available throughout.")}</p>
              <aside className="iz-arcade-entry">
                <a href={localizedHref("/incident-zero/defence/")}>{text("System Defence — arcade prototype →")}</a>
                <p>{text("Protect the system from malicious requests. A short playable combat prototype.")}</p>
              </aside>
              {/* noscript is raw text when scripting is enabled. Escape only HTML text
                  delimiters so apostrophes hydrate identically in French. */}
              <noscript dangerouslySetInnerHTML={{__html: text("This interactive story requires JavaScript. The engineering portfolio and public source remain available through normal links.").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}} />
            </div>
            <svg
              className="iz-opening-map"
              viewBox="0 0 440 430"
              role="img"
              aria-label={text("Three systems converge on an unresolved historical record")}
            >
              <path d="M54 58H158V122H244V208M382 54V122H290V208M54 366H158V302H244V208M382 366V302H290V208" />
              <path
                className="iz-organic-line"
                d="M244 208C213 163 210 162 158 122M290 208C326 254 332 274 382 302"
              />
              {localizedContent([
                [54, 58, "HR"],
                [382, 54, "OPS"],
                [54, 366, "FIN"],
                [268, 215, "?"],
              ].map(([x, y, label]) => (
                <g key={label}>
                  <circle cx={x} cy={y} r={label === "?" ? 33 : 20} />
                  <text x={x} y={Number(y) + 5} textAnchor="middle">
                    {localizedContent(label)}
                  </text>
                </g>
              )))}
              <text x="220" y="414" textAnchor="middle">{text("EXECUTED ≠ CORRECT")}</text>
            </svg>
          </section>
        ))}
        {localizedContent(mode ? null : <PageLandscape scene="incident" aerial contained><div className="container page-landscape-ending">
          <p className="eyebrow mono">{text("From conflicting signals to a clear decision")}</p>
          <a className="text-link" href={localizedHref("/#contact")}>{text("Discuss a real engineering problem ↗")}</a>
        </div></PageLandscape>)}
        <footer className="iz-footer">
          <span>{text("All incident data is synthetic.")}</span>
          <a href={localizedHref("/#work")}>{text("Explore real engineering work ↗")}</a>
        </footer>
        {!mode && <p id="incident-evidence">{text("A fictional incident with synthetic data.")} <a href={localizedHref("/#public-engineering")}>{text("Public engineering")}</a></p>}
      </main>
    </div>
  );
}
