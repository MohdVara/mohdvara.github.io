import { text } from "./config";
import { language, languages, type Locale } from "./languages";
import { localizedPath, splitLocale } from "./localeResolution";
export const domain = "https://mohd.paramasvara.online";
export const seo: Record<string, [string,string]> = {
  "/mmcats-modern/": ["MMCATS Modern | Mohd. Paramasvara", "Evidence-backed Rails modernization, local verification and release limitations."],
  "/naae/": ["NAAE evolution | Mohd. Paramasvara", "Narrative ASCII Art Engine: saved artwork, rendering architecture and version boundaries."],
  "/multilingual-engineering/": ["Multilingual engineering | Mohd. Paramasvara", "Eleven portfolio locales: canonical English, direction-aware presentation and translation maintenance."],

  "/": ["Mohd. Paramasvara | Principal Full-Stack Engineer", "Mohd. Paramasvara — Principal Full-Stack Engineer, technical lead and software architect. Full-stack systems, legacy modernization and engineering leadership."],
  "/work-with-me/": ["Work with Mohd. Paramasvara | Software Architecture & Technical Leadership", "Software architecture, system modernisation and technical leadership for complex product and operational workflows."],
  "/no-two-mondays/": ["No Two Mondays — Engineering case study | Mohd. Paramasvara", "Human-directed engineering of an extensible simulation with AI: modular state ownership, save compatibility and verification."],
  "/pace-rag-case-study/": ["PACE-RAG — Engineering case study | Mohd. Paramasvara", "PACE-RAG: Portfolio Assistant with Cited Evidence — Retrieval-Augmented Generation. Reviewed answers and local retrieval; live generative inference disabled."],
  "/incident-zero/": ["Incident Zero — Interactive engineering story | Mohd. Paramasvara", "A short interactive systems-engineering puzzle. A fictional incident with synthetic data."],
  "/incident-zero/defence/": ["System Defence — Arcade prototype | Mohd. Paramasvara", "A short, optional top-down combat prototype. Five generated levels, two defensive tools, and five services to restore."],
};
export function localizedMetadata(locale: Locale, pathname: string) {
  const path = splitLocale(pathname).path.replace(/\/?$/, "/");
  const [title, description] = seo[path] || seo["/"];
  return {title: text(title), description: text(description), canonical: domain + localizedPath(locale, path), path};
}
export function applyMetadata(locale: Locale, pathname: string) {
  const {title, description, canonical, path} = localizedMetadata(locale, pathname);
  const root = document.documentElement;
  root.lang = locale; root.dir = language(locale).direction;
  root.style.setProperty("--locale-font", language(locale).fonts);
  let font = document.querySelector<HTMLLinkElement>("#locale-font");
  const query = language(locale).fontQuery;
  if (query) {
    if (!font) {font = document.createElement("link"); font.id = "locale-font"; font.rel = "stylesheet"; document.head.append(font);}
    font.href = `https://fonts.googleapis.com/css2?family=${query}&display=swap`;
  } else font?.remove();
  if (!seo[path]) return;
  document.title = title;
  const setMeta = (selector: string, value: string) => document.querySelector(selector)?.setAttribute("content", value);
  for (const name of ["description", "twitter:description", "og:description"]) setMeta(`meta[name="${name}"],meta[property="${name}"]`, description);
  for (const name of ["twitter:title", "og:title"]) setMeta(`meta[name="${name}"],meta[property="${name}"]`, title);
  setMeta('meta[property="og:url"]', canonical);
  let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonicalLink) {canonicalLink = document.createElement("link"); canonicalLink.rel = "canonical"; document.head.append(canonicalLink);}
  canonicalLink.href = canonical;
  document.querySelectorAll('link[hreflang]').forEach(element => element.remove());
  for (const item of [...languages.map(item => ({code:item.locale, href: domain + localizedPath(item.locale, path)})), {code:"x-default",href:domain+path}]) {
    const link = document.createElement("link"); link.rel = "alternate"; link.hreflang = item.code; link.href = item.href; document.head.append(link);
  }

}
