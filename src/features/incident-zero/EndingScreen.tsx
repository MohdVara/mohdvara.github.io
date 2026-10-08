import { useEffect, useRef } from "react";
import { profile } from "../../content";
import { endingFor, type IncidentState } from "./state";
import { endings, fixes, strategies } from "./story";
export default function EndingScreen({ state, onReplay, preview = false, active = true }: {
  state: IncidentState; onReplay: () => void; preview?: boolean; active?: boolean;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const announced = useRef(false);
  useEffect(() => {
    if (!active || announced.current) return;
    const frame = requestAnimationFrame(() => {
      announced.current = true;
      heading.current?.focus({ preventScroll: true });
      // Active play's site header is static. Do not inherit the homepage's
      // scroll-padding for its taller sticky navigation.
      if (heading.current) window.scrollTo({
        top: heading.current.getBoundingClientRect().top + window.scrollY - 24,
        behavior: "instant",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [active]);
  const ending = endings[endingFor(state)];
  const metrics = [
    ["Reliability", state.metrics.reliability, state.fix === "manual" ? "The preview is corrected for one run; the selector remains unchanged." : state.fix === "rewrite" ? "The replacement needs consumer validation; delivery is held." : "A bounded resolver correction adds regression protection."],
    ["Delivery readiness", state.metrics.deliverySpeed, state.fix === "rewrite" ? "Migration exceeds the available window; payroll is held." : state.fix === "manual" ? "A reviewed correction supports the deadline with a manual audit trail." : "The narrower change preserves the deadline under the scenario’s test assumptions."],
    ["Remaining technical debt", state.metrics.technicalDebt, state.strategy === "migrate" ? "A staged plan reduces future debt in the simulation; implementation is still future work." : "The migration is deferred and the shared legacy boundary remains."],
    ["Stakeholder confidence", state.metrics.stakeholderTrust, state.fix === "rewrite" ? "Missing the deadline damages confidence even with a cleaner design." : "A reconciled preview and an explicit handover support confidence."],
    ["Observability", state.metrics.observability, state.strategy === "contain" ? "The incident record keeps known risks visible; ongoing reconciliation is deferred." : "Reconciliation and failure ownership make unknown outcomes visible."],
  ] as const;
  const band = (value: number) => value < 40 ? "Low" : value < 75 ? "Moderate" : "High";
  return <section className="iz-report" aria-labelledby="iz-report-title">
    <p className="eyebrow mono">Incident report / {preview ? "Recruiter simulation preview" : "Synthetic simulation"}</p>
    <h2 id="iz-report-title" ref={heading} tabIndex={-1} aria-describedby="iz-completion-note">{ending.title}</h2>
    <p id="iz-completion-note" role="status" className="iz-muted">{preview ? "Preview ready. Decisions and evidence were auto-selected; no investigation credit claimed." : "Investigation complete. Your incident report is ready."}</p>
    <p className="iz-report-line">{ending.line}</p>
    <p>{ending.body}</p>
    {state.archaeologist && <aside className="iz-discovery"><h3>The Archaeologist / additional insight</h3><p>You inspected every major evidence source before modifying production. The undocumented reporting consumer was found before the intervention. Investigation made the boundary visible.</p></aside>}
    <div className="iz-metrics">{metrics.map(([label, value]) => <div key={label}><span>{label}</span><strong>{band(value)}{label === "Remaining technical debt" ? " · lower is better" : ""}</strong></div>)}</div>
    <p className="iz-muted">These are illustrative simulation bands, not measured business outcomes, predictions or an assessment of your professional ability.</p>
    <details className="iz-explanation"><summary>How this outcome was assessed</summary>
      <p>The deterministic model starts with the same incident, adds puzzle safeguards, then applies your intervention and handover trade-offs. Values are clamped to 0–100 internally: below 40 is Low, 40–74 Moderate, and 75–100 High. These thresholds are narrative design choices, not calibrated measurements.</p>
      <ul>{metrics.map(([label,, explanation]) => <li key={label}><strong>{label}:</strong> {explanation}</li>)}</ul>
      <p>Every solved reasoning step adds the same reliability and observability credit. Manual reconciliation favours delivery but retains debt; replacement favours debt reduction but loses delivery readiness; the targeted patch improves reliability with a narrower change. Containment adds speed and debt; observation improves signals and confidence; a staged migration trades some speed for lower future debt and stronger safeguards.</p>
    </details>
    <h3>{preview ? "Auto-selected demonstration" : "Your decisions"}</h3>
    <ul>
      <li>{preview ? "Evidence and puzzle steps were simulated for this preview." : `Inspected ${state.evidence.length} of 6 evidence sources.`}</li>
      <li>Identified the historical selection rule and tested the delivery responsibilities.</li>
      <li>{fixes.find(item => item.id === state.fix)?.title}</li>
      <li>{strategies.find(item => item.id === state.strategy)?.title}</li>
      <li>{state.fix === "targeted" ? "Corrected the resolver with captured payroll and reporting regression checks." : state.fix === "manual" ? "Reconciled this payroll run; the resolver still needs a code correction." : "Held the export while validating the replacement and its consumers."}</li>
      <li>{state.strategy === "migrate" ? "Recorded a staged migration plan; migration has not been completed." : state.strategy === "observe" ? "Added reconciliation and an escalation owner; migration is deferred." : "Closed with dependency risks documented for follow-up."}</li>
    </ul>
    <p className="iz-portfolio-note">{preview ? "You just previewed" : "You just worked through"} a simplified, fictional version of the kinds of systems problems I enjoy solving.</p>
    <div className="iz-actions"><a className="button primary" href="/#work">Explore real engineering work ↗</a><a className="text-link" href={profile.discovery} target="_blank" rel="noopener noreferrer">Book a conversation <span className="sr-only">(opens in a new tab)</span> ↗</a></div>
    <div className="iz-actions">
      {profile.resumePdf && <a className="text-link" href={profile.resumePdf} download>Download résumé (PDF) ↗</a>}
      <a className="text-link" href={profile.resume} target="_blank" rel="noopener noreferrer">2-page résumé <span className="sr-only">(opens in a new tab)</span> ↗</a>
      <a className="text-link" href={profile.cv} target="_blank" rel="noopener noreferrer">Full CV <span className="sr-only">(opens in a new tab)</span> ↗</a>
      <a className="text-link" href={`${profile.github}/mohdvara.github.io`} target="_blank" rel="noopener noreferrer">View source on GitHub <span className="sr-only">(opens in a new tab)</span> ↗</a><button onClick={onReplay}>Replay incident</button>
    </div>
  </section>;
}
