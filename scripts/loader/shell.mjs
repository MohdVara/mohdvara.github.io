import {devPreloads} from "./dev-preloads.mjs";
import {readFileSync} from "node:fs";
const read = name => readFileSync(new URL(name, import.meta.url), "utf8");
const registry = JSON.parse(read("../../src/i18n/languages.json"));
const escape = value => value.replaceAll("<", "\\u003c");
export function loadingShell() {
  const locales = Object.fromEntries(registry.map(item => {
    const catalog = JSON.parse(read(`../../src/i18n/locales/${item.locale}.json`));
    const translate = key => {
      if (!catalog[key]) throw new Error(`Loader translation missing: ${item.locale}: ${key}`);
      return catalog[key];
    };
    return [item.locale, [item.direction, item.brandMark, translate("Loading portfolio…"), translate("This experience could not load."), translate("Retry"), translate("Continue"), translate("Still loading. You can wait or retry."), translate("Check your connection, then retry."), translate("Startup files: {{loaded}} loaded · {{pending}} pending"), translate("Starting portfolio…"), translate("Pending: {{file}}"), translate("Completed: {{file}}")]];
  }));
  const scene = `<span class="loader-far">        .-~~-.     .-~~~-.
   .-~~( . : .)~~~( . : . )~~-.
  ( . : '----' . : '-----' : . )</span><span class="loader-mid">    .-~~~~-.      .-~~~~~-.
 .-( : : :  )-..-( : : :  )-.
( : : '--' : : : : '---' : : )</span><span class="loader-near"> .-~~~-.    .-~~~~~-.    .-~~-.
( ;:;:; )--( ;:<i class="loader-sunlit">;:;</i>: )--( ;:; )
<i class="loader-bark"> '==|=='    '==||==='    '=|='
   /|\\        /||\\       /|\\</i></span><span class="loader-track">[................................]</span>`;
  return `<style id="portfolio-loader-css">${read("shell.css").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\n/g, "")}</style>
<aside id="portfolio-loader" data-state="waiting" lang="en" dir="ltr">
  <div class="loader-card">
    <div class="loader-scene" aria-hidden="true" dir="ltr" translate="no">
      <pre class="loader-art">${scene}</pre>
      <pre class="loader-highlight">${scene.replace("[................................]", "[================================]")}</pre>
    </div>
    <p class="loader-brand" translate="no"><span class="monogram" lang="en" dir="auto">mpv<span>.</span></span></p>
    <p class="loader-message"></p>
    <p class="loader-progress"></p>
    <p class="loader-files loader-pending"></p>
    <p class="loader-files loader-completed"></p>
    <p class="loader-detail"></p>
    <div class="loader-recovery"><a href="/">Retry</a><button type="button">Continue</button></div>
  </div>
</aside>
<script id="portfolio-loader-locales" type="application/json">${escape(JSON.stringify(locales))}</script>
<script>${read("bootstrap.js")}</script>`;
}
export function assetWatch() { return `<script>${read("asset-watch.js")}</script>`; }
export function loaderPlugin() {
  return { name: "portfolio-loading-shell", transformIndexHtml: {order: "pre", handler: async (html, context) => {
    // Use the existing Vite minifier; keep authored classic scripts readable.
    const {minify} = await import("vite");
    let markup = assetWatch() + loadingShell();
    for (const match of markup.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
      const result = await minify("portfolio-loader.js", match[1]);
      if (result.errors?.length) throw new Error("Loader script minification failed");
      markup = markup.replace(match[0], `<script>${result.code}</script>`);
    }
    let preloads = "";
    if (context.server) {
      try {
        const urls = await devPreloads(context.server);
        preloads = urls.map(url => `<link rel="modulepreload" href="${url.replaceAll("&", "&amp;").replaceAll('"', "&quot;")}">`).join("");
      } catch (error) {
        context.server.config.logger.warn(`Loader startup graph unavailable: ${error.message}`);
      }
    }
    const split = markup.indexOf("</script>") + "</script>".length;
    return html.replace("<head>", "<head>" + markup.slice(0, split)).replace("<!--loading-shell-->", markup.slice(split) + preloads);
  }} };
}
