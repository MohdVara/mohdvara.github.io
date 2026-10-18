import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// GitHub Pages user site, Cloudflare Pages and custom domain use the root.
export default defineConfig({
  base: "/",
  plugins: [react()],
  // Shared static content stays available before hydration and is cached independently.
  // Do not split runtime dependencies or turn public copy into asynchronous fetching.
  build: { rolldownOptions: { output: { codeSplitting: { groups: [
    { name: "portfolio-content", test: /\/src\/(content|technology)\.ts$/ },
  ] } } } },
  // Avoid a dev-only full reload when the first player discovers this lazy
  // dependency. Prebundling does not make browsers or production eagerly load it.
  optimizeDeps: { include: ["phaser"] },
});
