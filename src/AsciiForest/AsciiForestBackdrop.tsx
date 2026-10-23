import { useEffect, useRef } from "react";
import { readSceneryPreference, subscribeSceneryPreference } from "./preference";
import type { ForestHandle } from "./renderer";
import { currentLocale } from "../i18n/config";
import "./AsciiForest.css";

export function AsciiForestBackdrop({ aerial = false, seed, codeCanopy = false }: { aerial?: boolean; seed?: number; codeCanopy?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let cancelled = false, renderer: ForestHandle | undefined;
    const state = () => ({ theme: document.documentElement.dataset.theme === "light" ? "light" as const : "dark" as const, enabled: readSceneryPreference(), locale: currentLocale(), writingMode: document.documentElement.dataset.writingMode === "vertical" ? "vertical" as const : "horizontal" as const });
    const sync = () => renderer?.update(state());
    // Two browser frames let the semantic hero paint before optional scenery is
    // fetched. The import is not a modulepreload or an SSR dependency.
    let first = 0, second = 0;
    const load = () => { first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        import("./renderer").then(module => {
          if (!cancelled) renderer = module.mountForest(element, state(), aerial, seed, codeCanopy, true);
        }).catch(() => { /* Existing botanical drawing remains the fallback. */ });
      });
    }); };
    const proximity = aerial ? new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { proximity?.disconnect(); load(); }
    }, { rootMargin: "200px" }) : undefined;
    if (proximity) proximity.observe(element); else load();
    const unsubscribe = subscribeSceneryPreference(sync);
    const presentation = new MutationObserver(sync);
    presentation.observe(document.documentElement, {attributes:true,attributeFilter:['lang','data-writing-mode']});
    window.addEventListener("theme-change", sync);
    return () => {
      cancelled = true; proximity?.disconnect(); cancelAnimationFrame(first); cancelAnimationFrame(second);
      presentation.disconnect(); unsubscribe(); window.removeEventListener("theme-change", sync); renderer?.dispose();
    };
  }, [aerial, seed, codeCanopy]);
  return <div className={aerial ? "ascii-river" : "ascii-forest"} ref={host} aria-hidden="true" />;
}
