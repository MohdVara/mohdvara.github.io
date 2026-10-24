import { VerticalText } from "./i18n/controls";
import { useEffect } from "react";
import { Navigation } from "./App";
import { localizedHref, text } from "./i18n/config";
import NotFoundLandscape from "./NotFoundLandscape";
import "./NotFound.css";
export default function NotFound() {
  const title = text("Page not found | Mohd. Paramasvara");
  const description = text("The address may be incorrect, or the page may have moved.");
  useEffect(() => {
    document.title = title;
    document.querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]').forEach(node => node.setAttribute("content", title));
    document.querySelectorAll('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]').forEach(node => node.setAttribute("content", description));
    document.querySelectorAll('link[rel="canonical"], link[hreflang], meta[property="og:url"], script[type="application/ld+json"]').forEach(node => node.remove());
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) { robots = document.createElement("meta"); robots.name = "robots"; document.head.append(robots); }
    robots.content = "noindex, follow";
  }, [title, description]);
  return <>
    <a className="skip-link" href="#main">{text("Skip to content")}</a>
    <Navigation home={false} contactOnPage={false} />
    <main id="main" className="unmapped-page" aria-labelledby="missing-title" tabIndex={-1}>
      <NotFoundLandscape />
      <section className="container unmapped-content"><div className="unmapped-copy script-editorial-labelled">
        <p className="eyebrow mono">{text("404 / Page not found")}</p>
        <h1 id="missing-title">{text("This page could not be found.")}</h1>
        <p className="unmapped-explanation">{text("The address may be incorrect, or the page may have moved.")}</p>
        <blockquote className="unmapped-quote"><p><VerticalText>{text("The map may end here. The possibilities don't.")}</VerticalText></p></blockquote>
        <div className="actions unmapped-actions">
          <a className="button primary" href={localizedHref("/")}>{text("Return to portfolio")}</a>
          <a className="text-link" href={localizedHref("/#public-engineering")}>{text("Explore engineering work")}</a>
        </div>
        <a className="text-link unmapped-contact" href={localizedHref("/#contact")}>{text("Contact Mohd")}</a>
      </div></section>
    </main>
  </>;
}
