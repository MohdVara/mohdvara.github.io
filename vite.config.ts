import { defineConfig } from "vite";
// @ts-expect-error Build-only JavaScript plugin; never included in the client.
import { loaderPlugin } from "./scripts/loader/shell.mjs";
// @ts-expect-error Build-only JavaScript metadata; never included in the client.
import { buildRevision, siteBuildInfo } from "./scripts/build-revision.mjs";
import react from "@vitejs/plugin-react-swc";

// GitHub Pages user site, Cloudflare Pages and custom domain use the root.
export default defineConfig({
  base: "/",
  define: { __BUILD_REVISION__: JSON.stringify(buildRevision()), __SITE_BUILD_INFO__: JSON.stringify(siteBuildInfo()) },
  plugins: [react(), loaderPlugin()],
  // Shared static content stays available before hydration and is cached independently.
  // Do not split runtime dependencies or turn public copy into asynchronous fetching.
  build: { rolldownOptions: { output: { codeSplitting: { groups: [
    { name: "i18n-core", test: /\/src\/i18n\/(config|languages|localeResolution|metadata|lookup|context|controls)\.(tsx?|json)$/ },
    { name: "i18n-vendor", test: /\/node_modules\/(i18next|react-i18next|html-parse-stringify|void-elements|@babel\/runtime)\// },
    { name: "portfolio-content", test: /\/src\/(content|technology)\.ts$/ },
  ] } } } },
  // Avoid a dev-only full reload when the first player discovers this lazy
  // dependency. Prebundling does not make browsers or production eagerly load it.
  optimizeDeps: { include: ["phaser"] },
});
