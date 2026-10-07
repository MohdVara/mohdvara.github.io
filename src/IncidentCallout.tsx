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
          Investigate the incident <span aria-hidden="true">↗</span>
        </a>
        <p className="mono">~8 min · keyboard / touch</p>
      </div>
    </section>
  );
}
