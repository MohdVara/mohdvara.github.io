import { build } from "vite";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

// Render the same React tree at build time. GitHub Pages serves plain HTML;
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
  console.log("Portfolio pre-rendered to static HTML.");
} finally {
  await rm(output, { recursive: true, force: true });
}
