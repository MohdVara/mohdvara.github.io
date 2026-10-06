import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// User-site repository + existing custom domain, both hosted at the root.
export default defineConfig({ base: "/", plugins: [react()] });
