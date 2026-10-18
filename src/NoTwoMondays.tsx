export function NoTwoMondays() {
  return (
    <section id="no-two-mondays" className="container no-two-mondays" aria-labelledby="no-two-mondays-title">
      <div>
        <p className="eyebrow mono">Independent engineering / modvar</p>
        <h2 id="no-two-mondays-title">No Two Mondays: Trial Period</h2>
        <p className="no-two-mondays-description">
          An independently developed office simulation: modular system design,
          state management, save compatibility and deterministic verification.
          The case study examines AI-assisted implementation, human engineering
          decisions and the limits of automated testing.
        </p>
        <div className="no-two-mondays-links">
        <a className="text-link" href="/no-two-mondays/">
          Explore the engineering <span aria-hidden="true">↗</span>
        </a>
        <a
          className="text-link"
          href="https://modvar.itch.io/no-two-mondays"
          target="_blank"
          rel="noopener noreferrer"
        >
          Experience the project on itch.io <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        </div>
      </div>
      <figure className="no-two-mondays-preview">
        <img src="/images/no-two-mondays/office.jpg" width="1280" height="587" loading="lazy"
          alt="Early No Two Mondays office simulation, showing the workspace and character interface" />
        <figcaption>Early development capture · 10 October 2026</figcaption>
      </figure>
    </section>
  );
}
