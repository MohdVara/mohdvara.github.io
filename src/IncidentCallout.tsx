import { localizedHref } from "./i18n/config";
import { text } from "./i18n/config";
export function IncidentCallout() {
  return (
    <section
      className="container incident-callout"
      aria-labelledby="incident-callout-title"
    >
      <div>
        <p className="eyebrow mono">{text("Interactive / Incident Zero")}</p>
        <h2 id="incident-callout-title">{text("Something is wrong in production.")}</h2>
        <p>{text("Payroll closes tomorrow. The systems disagree.")}</p>
      </div>
      <div>
        <a className="text-link" href={localizedHref("/incident-zero/")}>{text("Play the incident ")}<span aria-hidden="true">↗</span>
        </a>
        <p className="mono">{text("~8 min · keyboard / touch")}</p>
        <a className="text-link" href={localizedHref("/incident-zero/?mode=preview")}>{text("Preview engineering decisions ")}<span aria-hidden="true">↗</span>
        </a>
        <p className="mono">{text("A short, auto-selected demonstration")}</p>
      </div>
    </section>
  );
}
