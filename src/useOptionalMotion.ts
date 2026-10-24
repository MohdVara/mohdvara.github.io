import { useEffect } from "react";

// Static artwork and all professional content are already rendered. Download the
// input-driven parallax controller only when a visitor starts moving or scrolling.
export function useOptionalMotion() {
  useEffect(() => {
    let cancelled = false;
    let dispose: (() => void) | undefined;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const remove = () => {
      window.removeEventListener("pointermove", load);
      window.removeEventListener("scroll", load);
    };
    const load = () => {
      if (motion.matches) return;
      remove();
      void import("./portfolioMotion").then(module => {
        if (cancelled) return;
        const stopPointer = module.mountHeroPointer();
        const stopSystem = module.mountSystemMotion();
        dispose = () => { stopPointer?.(); stopSystem(); };
      }).catch(() => { /* Static artwork remains available if enhancement fails. */ });
    };
    window.addEventListener("pointermove", load, { passive: true });
    window.addEventListener("scroll", load, { passive: true });
    return () => { cancelled = true; remove(); dispose?.(); };
  }, []);
}
