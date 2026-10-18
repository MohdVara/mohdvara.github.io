import { useEffect } from "react";
import { projectIds, type ProjectId } from "./content";

export function projectIdFromHash(hash: string): ProjectId | null {
  let id: string;
  try { id = decodeURIComponent(hash.replace(/^#/, "")); }
  catch { return null; }
  if (!id.startsWith("case-")) return null;
  const project = id.slice(5);
  return projectIds.find(candidate => candidate === project) ?? null;
}

// Native details remain the state owner. Run after hydration, before measuring
// fragment geometry; ordinary scrolling never changes disclosure or focus.
export function useFragmentNavigation(path: string) {
  useEffect(() => {
    let generation = 0;
    let frame = 0;
    let observer: MutationObserver | undefined;
    let keyboardHash: string | null = null;
    let keyboardAnchor: Element | null = null;
    const cancel = () => {
      generation++;
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
    const reveal = (hash: string) => {
      const project = projectIdFromHash(hash);
      if (!project) {
        const target = document.getElementById(decodeURIComponent(hash.slice(1)));
        const details = target?.closest<HTMLDetailsElement>(".additional-systems");
        if (details) {
          details.closest("#work")?.querySelectorAll<HTMLDetailsElement>(".case-details[open]").forEach(item => {
            if (item !== details) item.open = false;
          });
          details.open = true;
        }
        return;
      }
      const target = document.getElementById(`case-${project}`);
      const details = target?.querySelector<HTMLDetailsElement>(".case-details");
      if (!details) return;
      target?.closest(".project-list")?.querySelectorAll<HTMLDetailsElement>(".case-details[open]").forEach(item => {
        if (item !== details) item.open = false;
      });
      details.open = true;
    };
    const navigate = (hash: string, focus = false) => {
      cancel();
      if (!hash) return;
      const current = generation;
      let id: string;
      try { id = decodeURIComponent(hash.slice(1)); }
      catch { return; }
      const locate = () => {
        if (generation !== current || window.location.hash !== hash) return;
        const target = document.getElementById(id);
        if (!target) return;
        observer?.disconnect();
        reveal(hash);
        void document.fonts.ready.then(() => {
          if (generation !== current || window.location.hash !== hash) return;
          frame = requestAnimationFrame(() => {
            target.scrollIntoView({ behavior: "instant", block: "start" });
            if (focus && (projectIdFromHash(hash) || target.closest(".additional-systems"))) {
              target.querySelector<HTMLElement>("h3")?.focus({ preventScroll: true });
            }
          });
        });
      };
      // Lazy routes may still be hydrating; observe actual DOM readiness rather
      // than guessing with a delay. An invalid fragment is harmless until cleanup.
      if (!document.getElementById(id)) {
        observer = new MutationObserver(locate);
        observer.observe(document.getElementById("root")!, { childList: true, subtree: true });
      }
      locate();
    };
    const changed = () => {
      const hash = window.location.hash;
      navigate(hash, keyboardHash === hash);
      keyboardHash = null;
    };
    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target || anchor.hasAttribute("download")) return;
      const destination = new URL(anchor.href);
      if (destination.origin !== window.location.origin ||
          destination.pathname.replace(/\/$/, "") !== window.location.pathname.replace(/\/$/, "") ||
          destination.search !== window.location.search || !projectIdFromHash(destination.hash)) return;
      const keyboard = event.detail === 0 || anchor === keyboardAnchor;
      keyboardAnchor = null;
      event.preventDefault();
      reveal(destination.hash);
      if (destination.hash === window.location.hash) navigate(destination.hash, keyboard);
      else {
        keyboardHash = keyboard ? destination.hash : null;
        window.location.hash = destination.hash;
      }
    };
    const interruptions = ["pointerdown", "wheel", "touchstart", "keydown"] as const;
    // Firefox can report detail=1 even for Enter-activated links. Remember
    // the actual key target instead of treating click count as input modality.
    const interrupt = (event: Event) => {
      cancel();
      keyboardAnchor = event instanceof KeyboardEvent && event.key === "Enter" && event.target instanceof Element
        ? event.target.closest("a[href]") : null;
    };
    interruptions.forEach(event => window.addEventListener(event, interrupt, { passive: true }));
    window.addEventListener("hashchange", changed);
    document.addEventListener("click", click);
    navigate(window.location.hash);
    return () => {
      cancel();
      interruptions.forEach(event => window.removeEventListener(event, interrupt));
      window.removeEventListener("hashchange", changed);
      document.removeEventListener("click", click);
    };
  }, [path]);
}
