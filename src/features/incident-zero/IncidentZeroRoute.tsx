import { Component, lazy, Suspense, useState, type ReactNode } from "react";
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
        <h2>Incident simulation could not start.</h2>
        <p>Please retry, or return to the engineering portfolio.</p>
        <button onClick={() => window.location.reload()}>Retry</button>
        <a className="text-link" href="/">
          Return to portfolio ↗
        </a>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function IncidentZeroRoute() {
  const [mode, setMode] = useState<"play" | "preview" | null>(null);
  return (
    <div className={`iz-experience ${mode ? "iz-active" : ""}`}>
      <a className="skip-link" href="#incident-main">
        Skip to incident
      </a>
      <Navigation home={false} contactOnPage={false} />
      <main className="container iz-page" id="incident-main" tabIndex={-1}>
        {mode ? <h1 className="sr-only">Incident Zero · interactive engineering story</h1> : <div className="iz-page-heading">
          <div>
            <a className="text-link" href="/">
              Portfolio /
            </a>
            <h1>
              Incident Zero<span className="iz-title-dot">.</span>
            </h1>
            <p>An interactive systems-engineering story.</p>
          </div>
          <span className="mono iz-edition">
            A FICTIONAL INCIDENT
            <br />A REAL KIND OF QUESTION
          </span>
        </div>
        }
        {mode ? (
          <GameBoundary>
            <Suspense fallback={<p role="status">Initialising incident…</p>}>
              <GameShell preview={mode === "preview"} />
            </Suspense>
          </GameBoundary>
        ) : (
          <section className="iz-opening" aria-labelledby="iz-opening-title">
            <div>
              <p className="eyebrow mono">Monday / 08:47</p>
              <h2 id="iz-opening-title">
                Payroll closes tomorrow.
                <br />
                The systems disagree.
              </h2>
              <p>
                Finance says the total is wrong. HR says the record is correct.
                Operations says the integration succeeded.
              </p>
              <p>
                You are the engineer. Explore a small office, collect the
                evidence and decide what should change before production moves
                again.
              </p>
              <div className="iz-actions">
                <button
                  className="button primary"
                  onClick={() => setMode("play")}
                >
                  Play the incident →
                </button>
                <button onClick={() => setMode("preview")}>Preview the engineering decisions</button>
                <span className="iz-muted">Allow about 6–12 minutes · keyboard / touch</span>
              </div>
              <p className="iz-small iz-keyboard-only">
                WASD / arrows to move. E / Enter to inspect. Esc to pause. A
                non-spatial navigation mode and plain-language puzzles are
                available throughout.
              </p>
              <p className="iz-small iz-touch-only">
                Tap to explore, hold the direction pad to walk, and tap choices
                to investigate. Direct room and inspection buttons are available
                throughout.
              </p>
              <aside className="iz-arcade-entry">
                <a href="/incident-zero/defence/">System Defence — arcade prototype →</a>
                <p>Protect the system from malicious requests. A short playable combat prototype.</p>
              </aside>
              <noscript>
                This interactive story requires JavaScript. The engineering
                portfolio and public source remain available through normal
                links.
              </noscript>
            </div>
            <svg
              className="iz-opening-map"
              viewBox="0 0 440 430"
              role="img"
              aria-label="Three systems converge on an unresolved historical record"
            >
              <path d="M54 58H158V122H244V208M382 54V122H290V208M54 366H158V302H244V208M382 366V302H290V208" />
              <path
                className="iz-organic-line"
                d="M244 208C213 163 210 162 158 122M290 208C326 254 332 274 382 302"
              />
              {[
                [54, 58, "HR"],
                [382, 54, "OPS"],
                [54, 366, "FIN"],
                [268, 215, "?"],
              ].map(([x, y, label]) => (
                <g key={label}>
                  <circle cx={x} cy={y} r={label === "?" ? 33 : 20} />
                  <text x={x} y={Number(y) + 5} textAnchor="middle">
                    {label}
                  </text>
                </g>
              ))}
              <text x="220" y="414" textAnchor="middle">
                EXECUTED ≠ CORRECT
              </text>
            </svg>
          </section>
        )}
        <footer className="iz-footer">
          <span>All incident data is synthetic.</span>
          <a href="/#work">Explore real engineering work ↗</a>
        </footer>
      </main>
    </div>
  );
}
