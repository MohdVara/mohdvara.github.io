import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// GitHub Pages user site, Cloudflare Pages and custom domain use the root.
export default defineConfig({ base: "/", plugins: [react()] });
