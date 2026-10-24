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

// A narrow reading band works for both tall sections and individual roles.
export function observeReadingPosition(
  elements: Element[],
  onChange: (element: Element | undefined) => void,
  band: "top" | "middle" = "top",
) {
  let observer: IntersectionObserver;
  const visible = new Set<Element>();
  const setup = () => {
    observer?.disconnect();
    visible.clear();
    const top = band === "middle" ? innerHeight * 0.4 : Math.min(140, innerHeight * 0.25);
    const height = band === "middle" ? innerHeight * 0.1 : 100;
    const bottom = Math.max(0, innerHeight - top - height);
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
