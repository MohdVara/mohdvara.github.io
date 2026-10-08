import { Component, type ReactNode } from "react";

/** A full navigation clears React.lazy's rejected promise and the module map.
 * Retry is explicitly user-triggered; never reload automatically. */
export default class RouteRecovery extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="container section" aria-labelledby="route-error-title">
      <h1 id="route-error-title" tabIndex={-1} ref={node => node?.focus()}>This experience could not load.</h1>
      <p>The download may have failed or the experience encountered an error. Check your connection, then retry.</p>
      <div className="actions"><button className="button primary" onClick={() => window.location.reload()}>Retry</button><a className="text-link" href="/">Return to portfolio</a></div>
    </main>;
  }
}
