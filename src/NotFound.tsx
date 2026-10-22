import { TranslationNotice } from "./i18n/controls";
import { localizedHref } from "./i18n/config";
import { text } from "./i18n/config";
import { useEffect } from "react";
export default function NotFound() {
  useEffect(() => {
    document.title = text("Page not found | Mohd. Paramasvara");
    document.querySelector('link[rel="canonical"]')?.remove();
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) { robots = document.createElement("meta"); robots.name = "robots"; document.head.append(robots); }
    robots.content = "noindex, follow";
  }, []);
  return <><TranslationNotice /><main id="main" className="container section" aria-labelledby="missing-title">
    <p className="eyebrow mono">{text("404 / Page not found")}</p>
    <h1 id="missing-title">{text("This page could not be found.")}</h1>
    <p>{text("The address may be incorrect, or the page may have moved.")}</p>
    <div className="actions"><a className="button primary" href={localizedHref("/")}>{text("Return to portfolio")}</a><a className="text-link" href={localizedHref("/#contact")}>{text("Contact Mohd")}</a></div>
  </main></>;
}
