export function NoTwoMondays() {
  return (
    <section className="container no-two-mondays" aria-labelledby="no-two-mondays-title">
      <div>
        <p className="eyebrow mono">Independent game / modvar</p>
        <h2 id="no-two-mondays-title">No Two Mondays: Trial Period</h2>
        <p className="no-two-mondays-description">
          One Monday, three coworkers, and a production outage. An interactive
          office story about the systems you repair and the people you work with.
        </p>
        <div className="no-two-mondays-links">
        <a className="text-link" href="/no-two-mondays/">
          Read the development case study <span aria-hidden="true">↗</span>
        </a>
        <a
          className="text-link"
          href="https://modvar.itch.io/no-two-mondays"
          target="_blank"
          rel="noopener noreferrer"
        >
          Play on itch.io <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        </div>
      </div>
      <iframe
        className="no-two-mondays-embed"
        title="No Two Mondays: Trial Period by modvar on itch.io"
        src="https://itch.io/embed/5140208?bg_color=EEE0BD&fg_color=29343B&link_color=365C5A&border_color=4a585d"
        width="552"
        height="167"
        loading="lazy"
      />
    </section>
  );
}
