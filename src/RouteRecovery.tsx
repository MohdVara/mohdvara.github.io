import { localizedHref } from "./i18n/config";
import { text } from "./i18n/config";
import { Component, type ReactNode } from "react";

/** A full navigation clears React.lazy's rejected promise and the module map.
 * Retry is explicitly user-triggered; never reload automatically. */
export default class RouteRecovery extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { window.dispatchEvent(new Event("portfolio:failed")); }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="container section" aria-labelledby="route-error-title">
      <h1 id="route-error-title" tabIndex={-1} ref={node => node?.focus()}>{text("This experience could not load.")}</h1>
      <p>{text("The download may have failed or the experience encountered an error. Check your connection, then retry.")}</p>
      <div className="actions"><button className="button primary" onClick={() => window.location.reload()}>{text("Retry")}</button><a className="text-link" href={localizedHref("/")}>{text("Return to portfolio")}</a></div>
    </main>;
  }
}
