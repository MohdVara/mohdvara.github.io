import { useEffect } from "react";
export default function NotFound() {
  useEffect(() => {
    document.title = "Page not found | Mohd. Paramasvara";
    document.querySelector('link[rel="canonical"]')?.remove();
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) { robots = document.createElement("meta"); robots.name = "robots"; document.head.append(robots); }
    robots.content = "noindex, follow";
  }, []);
  return <main id="main" className="container section" aria-labelledby="missing-title">
    <p className="eyebrow mono">404 / Page not found</p>
    <h1 id="missing-title">This page could not be found.</h1>
    <p>The address may be incorrect, or the page may have moved.</p>
    <div className="actions"><a className="button primary" href="/">Return to portfolio</a><a className="text-link" href="/#contact">Contact Mohd</a></div>
  </main>;
}
