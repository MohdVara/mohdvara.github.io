import { useEffect } from "react";

// Progressive enhancement: prerendered content is visible until observed.
export function useSectionReveals() {
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    const groups = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    const setup = () => {
      observer?.disconnect();
      groups.forEach((group) => group.classList.remove("reveal-pending"));
      if (motion.matches || !("IntersectionObserver" in window)) return;
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).dataset.revealed = "true";
          entry.target.classList.remove("reveal-pending");
          observer?.unobserve(entry.target);
        });
      }, { threshold: 0, rootMargin: "0px 0px -32px 0px" });
      // Never conceal content already in view, including a loaded fragment.
      groups.forEach((group) => {
        if (group.dataset.revealed === "true") return;
        if (group.getBoundingClientRect().top < innerHeight) {
          group.dataset.revealed = "true";
          return;
        }
        group.classList.add("reveal-pending");
        observer?.observe(group);
      });
    };
    setup();
    motion.addEventListener("change", setup);
    return () => {
      observer?.disconnect();
      motion.removeEventListener("change", setup);
      groups.forEach((group) => group.classList.remove("reveal-pending"));
    };
  }, []);
}

export function useHeroDepth() {
  useEffect(() => {
    const frame = document.querySelector<HTMLElement>(".portrait");
    const hero = document.getElementById("home");
    if (!frame || !hero) return;
    const allowed = matchMedia("(min-width: 761px) and (prefers-reduced-motion: no-preference)");
    let raf = 0;
    let range = 1;
    let previousDepth = -1;
    const paint = () => {
      raf = 0;
      const depth = Math.min(1, Math.max(0, scrollY / range)) * 16;
      if (depth === previousDepth) return;
      previousDepth = depth;
      frame.style.setProperty("--portrait-depth", `${depth}px`);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const resize = () => {
      range = hero.offsetHeight;
      schedule();
    };
    const setup = () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
      raf = 0;
      previousDepth = -1;
      frame.style.removeProperty("--portrait-depth");
      if (!allowed.matches) return;
      resize();
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", resize);
    };
    setup();
    allowed.addEventListener("change", setup);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      allowed.removeEventListener("change", setup);
      frame.style.removeProperty("--portrait-depth");
    };
  }, []);
}

// A narrow reading band works for both tall sections and individual roles.
export function observeReadingPosition(
  elements: Element[],
  onChange: (element: Element | undefined) => void,
) {
  let observer: IntersectionObserver;
  const visible = new Set<Element>();
  const setup = () => {
    observer?.disconnect();
    visible.clear();
    const top = Math.min(140, innerHeight * 0.25);
    const bottom = Math.max(0, innerHeight - top - 100);
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      // Prefer the next item once its beginning reaches the reading band.
      let active: Element | undefined;
      elements.forEach((element) => {
        if (visible.has(element)) active = element;
      });
      onChange(active);
    }, { rootMargin: `-${top}px 0px -${bottom}px 0px` });
    elements.forEach((element) => observer.observe(element));
  };
  setup();
  window.addEventListener("resize", setup);
  return () => {
    observer.disconnect();
    window.removeEventListener("resize", setup);
  };
}
