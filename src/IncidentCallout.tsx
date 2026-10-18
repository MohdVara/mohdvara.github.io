export function IncidentCallout() {
  return (
    <section
      className="container incident-callout"
      aria-labelledby="incident-callout-title"
    >
      <div>
        <p className="eyebrow mono">Interactive / Incident Zero</p>
        <h2 id="incident-callout-title">Something is wrong in production.</h2>
        <p>Payroll closes tomorrow. The systems disagree.</p>
      </div>
      <div>
        <a className="text-link" href="/incident-zero/">
          Play the incident <span aria-hidden="true">↗</span>
        </a>
        <p className="mono">~8 min · keyboard / touch</p>
        <a className="text-link" href="/incident-zero/?mode=preview">
          Preview engineering decisions <span aria-hidden="true">↗</span>
        </a>
        <p className="mono">A short, auto-selected demonstration</p>
      </div>
    </section>
  );
}
