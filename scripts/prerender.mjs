import { build } from "vite";
import { mkdtemp, readFile, writeFile, rm, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

// Render the same React tree at build time. Both hosting providers serve HTML;
// the content, links and native disclosures also work without JavaScript.
const output = await mkdtemp(join(process.cwd(), ".prerender-"));
try {
  await build({
    build: {
      ssr: "src/prerender.tsx",
      outDir: output,
      copyPublicDir: false,
      emptyOutDir: true,
      rollupOptions: { output: { entryFileNames: "render.mjs" } },
    },
  });
  const { render, localizedMetadata } = await import(
    pathToFileURL(join(output, "render.mjs")).href
  );
  const path = "dist/index.html";
  const html = await readFile(path, "utf8");
  if (!html.includes("<!--app-html-->"))
    throw new Error("Static rendering placeholder missing");
  await writeFile(path, html.replace("<!--app-html-->", await render()));
  const escape = (value) =>
    value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
  for (const { route, title, description, image, imageAlt } of [
    {"route": "mmcats-modern", "title": "MMCATS Modern | Mohd. Paramasvara", "description": "Evidence-backed Rails modernization, local verification and release limitations."},
    {"route": "naae", "title": "NAAE evolution | Mohd. Paramasvara", "description": "Narrative ASCII Art Engine: saved artwork, rendering architecture and version boundaries."},
    {"route": "multilingual-engineering", "title": "Multilingual engineering | Mohd. Paramasvara", "description": "Eleven portfolio locales: canonical English, direction-aware presentation and translation maintenance."},
    { route: "pace-rag-case-study", title: "PACE-RAG — Browser Retrieval Engineering | Mohd. Paramasvara", description: "PACE-RAG: Portfolio Assistant with Cited Evidence — Retrieval-Augmented Generation. Reviewed answers and local retrieval; live generative inference disabled." },
    { route: "404", title: "Page not found | Mohd. Paramasvara", description: "This page could not be found. Return to the portfolio or contact Mohd. Paramasvara." },
    {
      route: "no-two-mondays",
      title: "Engineering No Two Mondays: An Extensible Simulation with AI | Mohd. Paramasvara",
      description: "Human-directed engineering of an extensible simulation with AI: modular state ownership, save compatibility and verification, with a historical 15 October 2026 automated traversal campaign.",
      image: "no-two-mondays.png",
      imageAlt: "No Two Mondays — engineering an extensible simulation with AI. Conceptual diagram of simulation, interface and persistence; not a gameplay screenshot.",
    },
    {
      route: "work-with-me",
      title:
        "Work with Mohd. Paramasvara | Software Architecture & Technical Leadership",
      description:
        "Software architecture, system modernisation and technical leadership for complex product and operational workflows. Selected project and contract engagements with Mohd. Paramasvara.",
      image: "work-with-me.png",
      imageAlt: "Work with Mohd. Paramasvara — software architecture, modernisation and technical leadership. Conceptual connected-system illustration.",
    },
    {
      route: "incident-zero/defence",
      title: "System Defence — Incident Zero Arcade Prototype | Mohd. Paramasvara",
      description: "Protect the system from malicious requests in a short, optional top-down combat prototype. Five generated levels, two defensive tools, and five services to restore.",
      image: "incident-zero.png",
      imageAlt: "Incident Zero — fictional engineering investigation and optional System Defence arcade prototype. Conceptual decision-path illustration; not a gameplay screenshot or real security control.",
    },
    {
      route: "incident-zero",
      title:
        "Incident Zero — Interactive Engineering Story | Mohd. Paramasvara",
      description:
        "A short interactive systems-engineering puzzle about debugging a failing production workflow and making architecture decisions under pressure. A fictional incident with synthetic data.",
      image: "incident-zero.png",
      imageAlt: "Incident Zero — a fictional engineering investigation using synthetic data. Conceptual observe, decide and review illustration; not a gameplay screenshot.",
    },
  ]) {
    const url = `https://mohd.paramasvara.online/${route}/`;
    let work = html.replace("<!--app-html-->", await render(`/${route}/`));
    if (["mmcats-modern", "naae", "multilingual-engineering", "pace-rag-case-study", "no-two-mondays", "incident-zero"].includes(route)) {
      const css = (await readdir('dist/assets')).find(name => name.startsWith('CaseStudyQuickRead-') && name.endsWith('.css'));
      if (css) work = work.replace('</head>', `<link rel="stylesheet" href="/assets/${css}"></head>`);
    }
    if (["mmcats-modern", "naae", "multilingual-engineering"].includes(route)) {
      const css = (await readdir('dist/assets')).find(name => name.startsWith('EngineeringCaseStudy-') && name.endsWith('.css'));
      if (!css) throw new Error('Engineering case study stylesheet missing');
      work = work.replace('</head>', `<link rel="stylesheet" href="/assets/${css}"></head>`);
    }
    if (route === 'no-two-mondays') {
      const css = (await readdir('dist/assets')).find(name => name.startsWith('NoTwoMondaysCaseStudy-') && name.endsWith('.css'));
      if (!css) throw new Error('No Two Mondays case study stylesheet missing');
      work = work.replace('</head>', `<link rel="stylesheet" href="/assets/${css}"></head>`);
    }
    if (route === 'incident-zero' || route === 'incident-zero/defence') {
      // Style the static landing even without JavaScript. The homepage never
      // receives this route's stylesheet or a game preload.
      const css = (await readdir('dist/assets')).find(name => name.startsWith(route === 'incident-zero' ? 'IncidentZeroRoute-' : 'DefenceRoute-') && name.endsWith('.css'));
      if (!css) throw new Error('Incident Zero route stylesheet missing');
      work = work.replace('</head>', `<link rel="stylesheet" href="/assets/${css}"></head>`);
    }
    work = work.replace(
      /<title>[^<]*<\/title>/,
      `<title>${escape(title)}</title>`,
    );
    for (const name of ["description", "twitter:description", "og:description"])
      work = work.replace(
        new RegExp(`(<meta\\s+(?:name|property)="${name}"\\s+content=")[^"]*`),
        `$1${escape(description)}`,
      );
    for (const name of ["twitter:title", "og:title"])
      work = work.replace(
        new RegExp(`(<meta\\s+(?:name|property)="${name}"\\s+content=")[^"]*`),
        `$1${escape(title)}`,
      );
    if (image) {
      for (const name of ["og:image", "twitter:image"])
        work = work.replace(
          new RegExp(`(<meta\\s+(?:name|property)="${name}"\\s+content=")[^"]*`),
          `$1https://mohd.paramasvara.online/images/social/${image}`,
        );
      for (const name of ["og:image:alt", "twitter:image:alt"])
        work = work.replace(
          new RegExp(`(<meta\\s+(?:name|property)="${name}"\\s+content=")[^"]*`),
          `$1${escape(imageAlt)}`,
        );
    }
    work = work.replace(/(rel="canonical" href=")[^"]*/, `$1${url}`);
    work = work.replace(/(property="og:url" content=")[^"]*/, `$1${url}`);
    work = work.replace(
      /(<script type="application\/ld\+json">)([\s\S]+?)(<\/script>)/,
      (_, start, data, end) => {
        const schema = JSON.parse(data);
        schema["@graph"].push({
          "@type": "WebPage",
          "@id": `${url}#page`,
          url,
          name: title,
          description,
          about: { "@id": schema["@graph"][0]["@id"] },
          isPartOf: {
            "@id": schema["@graph"].find((item) => item["@type"] === "WebSite")[
              "@id"
            ],
          },
        });
        return start + JSON.stringify(schema) + end;
      },
    );
    if (route === "404") {
      work = work.replace(/<link rel="canonical"[^>]*>/, "").replace(/<meta property="og:url"[^>]*>/, "").replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, "").replace("</head>", '<meta name="robots" content="noindex, follow"></head>');
      await writeFile("dist/404.html", work);
      continue;
    }
    await mkdir(`dist/${route}`, { recursive: true });
    await writeFile(`dist/${route}/index.html`, work);
  }

  const registry = JSON.parse(await readFile("src/i18n/languages.json", "utf8"));
  const localeRoutes = ["mmcats-modern", "naae", "multilingual-engineering", "", "work-with-me", "no-two-mondays", "pace-rag-case-study", "incident-zero", "incident-zero/defence"];
  const escapeText = value => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
  const domain = "https://mohd.paramasvara.online";
  const sitemap = [];
  for (const route of localeRoutes) {
    const basePath = route ? `/${route}/` : "/";
    const baseHtml = await readFile(route ? `dist/${route}/index.html` : "dist/index.html", "utf8");
    const alternates = registry.map(item => `<link rel="alternate" hreflang="${item.locale}" href="${domain}/${item.locale}${basePath}" />`).join("") + `<link rel="alternate" hreflang="x-default" href="${domain}${basePath}" />`;
    // Also annotate the x-default entry reciprocally.
    await writeFile(route ? `dist/${route}/index.html` : "dist/index.html", baseHtml.replace("</head>", alternates + "</head>"));
    sitemap.push(domain + basePath);
    for (const item of registry) {
      const catalog = JSON.parse(await readFile(`src/i18n/locales/${item.locale}.json`, "utf8"));
      const translate = value => catalog[value] || value;
      const path = `/${item.locale}${basePath}`;
      const markup = await render(path);
      const localizedSeo = localizedMetadata(item.locale, path);
      let localized = baseHtml.replace(/<html lang="en">/, `<html lang="${item.locale}" dir="${item.direction}" style="--locale-font:${escapeText(item.fonts)}">`);
      localized = localized.replace(/<div id="root">[\s\S]*<\/div>(\s*<script type="module"[^>]*><\/script>)?\s*<\/body>/, `<div id="root" data-locale="${item.locale}">${markup}</div></body>`);
      // Vite places its module entry in <head>; never replace scripts or JSON-LD.
      localized = localized.replace(/<title>[^<]*<\/title>/, `<title>${escapeText(localizedSeo.title)}</title>`);
      localized = localized.replace(/(<meta\s+(?:name|property)="(?:description|twitter:description|og:description|twitter:title|og:title|og:image:alt|twitter:image:alt)"\s+content=")([^"]*)/g,
        (_, start, value) => start + escapeText(/description/.test(start) ? localizedSeo.description : /:title/.test(start) ? localizedSeo.title : translate(value.replaceAll("&amp;", "&"))));
      localized = localized.replace(/(rel="canonical" href=")[^"]*/, `$1${domain}${path}`).replace(/(property="og:url" content=")[^"]*/, `$1${domain}${path}`);
      localized = localized.replace(/(<script type="application\/ld\+json">)([\s\S]+?)(<\/script>)/, (_, start, data, end) => {
        const schema = JSON.parse(data);
        for (const node of schema["@graph"]) if (node["@type"] === "WebPage") {node.url = domain + path; node["@id"] = domain + path + "#page"; node.inLanguage = item.locale; node.name = translate(node.name); node.description = translate(node.description);}
        return start + JSON.stringify(schema) + end;
      });
      const font = item.fontQuery ? `<link id="locale-font" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${item.fontQuery}&amp;display=swap" />` : "";
      localized = localized.replace("</head>", alternates + font + "</head>");
      await mkdir(`dist${path}`, {recursive: true});
      await writeFile(`dist${path}index.html`, localized);
      sitemap.push(domain + path);
    }
  }
  await writeFile("dist/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemap.map(url => `<url><loc>${url}</loc></url>`).join("")}</urlset>`);
  console.log(
    "Portfolio, Work With Me, No Two Mondays, Incident Zero and System Defence pre-rendered to static HTML.",
  );
} finally {
  await rm(output, { recursive: true, force: true });
}
