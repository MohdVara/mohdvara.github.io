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
if (root.querySelector("main")) hydrateRoot(root, app);
else createRoot(root).render(app);
