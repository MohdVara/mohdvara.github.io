import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./index.css";
import Page from "./Page";

const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <Page path={window.location.pathname} />
  </StrictMode>
);
const knownRoute = ["", "/work-with-me", "/incident-zero", "/incident-zero/defence"].includes(window.location.pathname.replace(/\/$/, ""));
// Vite preview may serve index.html for unknown URLs. Do not hydrate that
// homepage as a missing page; Cloudflare serves the matching static 404 tree.
if (root.querySelector("main") && (knownRoute || root.querySelector("#missing-title"))) hydrateRoot(root, app);
else createRoot(root).render(app);
