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
  const { render } = await import(
    pathToFileURL(join(output, "render.mjs")).href
  );
  const path = "dist/index.html";
  const html = await readFile(path, "utf8");
  if (!html.includes("<!--app-html-->"))
    throw new Error("Static rendering placeholder missing");
  await writeFile(path, html.replace("<!--app-html-->", render()));
  const escape = (value) =>
    value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
  for (const { route, title, description } of [
    {
      route: "work-with-me",
      title:
        "Work with Mohd. Paramasvara | Software Architecture & Technical Leadership",
      description:
        "Software architecture, system modernisation and technical leadership for complex product and operational workflows. Selected project and contract engagements with Mohd. Paramasvara.",
    },
    {
      route: "incident-zero/defence",
      title: "System Defence — Incident Zero Arcade Prototype | Mohd. Paramasvara",
      description: "Protect the system from malicious requests in a short, optional top-down combat prototype. One arena, two defensive tools, and a service to restore.",
    },
    {
      route: "incident-zero",
      title:
        "Incident Zero — Interactive Engineering Story | Mohd. Paramasvara",
      description:
        "A short interactive systems-engineering puzzle about debugging a failing production workflow and making architecture decisions under pressure. A fictional incident with synthetic data.",
    },
  ]) {
    const url = `https://mohd.paramasvara.online/${route}/`;
    let work = html.replace("<!--app-html-->", render(`/${route}/`));
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
    await mkdir(`dist/${route}`, { recursive: true });
    await writeFile(`dist/${route}/index.html`, work);
  }
  console.log(
    "Portfolio, Work With Me, Incident Zero and System Defence pre-rendered to static HTML.",
  );
} finally {
  await rm(output, { recursive: true, force: true });
}
