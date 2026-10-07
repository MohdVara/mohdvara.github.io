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

export function useHeroPointer() {
  useEffect(() => {
    const hero = document.getElementById("home");
    const drawing = hero?.querySelector<SVGElement>(".hero-botanical");
    if (!hero || !drawing) return;
    const allowed = matchMedia("(min-width: 761px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let raf = 0;
    let x = 0, y = 0;
    let bounds: DOMRect;
    const paint = () => {
      raf = 0;
      drawing.style.setProperty("--pointer-x", `${x}px`);
      drawing.style.setProperty("--pointer-y", `${y}px`);
    };
    const enter = () => { bounds = hero.getBoundingClientRect(); };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      bounds ||= hero.getBoundingClientRect();
      x = Math.max(-3, Math.min(3, (event.clientX - bounds.left) / bounds.width * 6 - 3));
      y = Math.max(-3, Math.min(3, (event.clientY - bounds.top) / bounds.height * 6 - 3));
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const leave = () => { x = 0; y = 0; if (!raf) raf = requestAnimationFrame(paint); };
    const remove = () => {
      hero.removeEventListener("pointerenter", enter);
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf); raf = 0;
      drawing.style.removeProperty("--pointer-x"); drawing.style.removeProperty("--pointer-y");
    };
    const setup = () => {
      remove();
      if (!allowed.matches) return;
      hero.addEventListener("pointerenter", enter, { passive: true });
      hero.addEventListener("pointermove", move, { passive: true });
      hero.addEventListener("pointerleave", leave);
    };
    setup(); allowed.addEventListener("change", setup);
    return () => { remove(); allowed.removeEventListener("change", setup); };
  }, []);
}

// A shared, input-driven controller. Geometry is cached after layout changes;
// scroll frames only calculate progress for nearby regions and write CSS vars.
export function useSystemMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const main = document.querySelector("main");
    const regions = [...document.querySelectorAll<HTMLElement>("[data-motion-region]")];
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const compact = matchMedia("(max-width: 760px)");
    type Region = { element: HTMLElement; kind: string; top: number; height: number; start: number; end: number; previous: number };
    const records: Region[] = regions.map((element) => ({ element, kind: element.dataset.motionRegion || "", top: 0, height: 0, start: 0, end: 1, previous: -1 }));
    const nearby = new Set<HTMLElement>();
    const visible = new Set<HTMLElement>();
    const properties = ["--section-progress", "--section-energy", "--visual-depth", "--portrait-depth", "--network-depth", "--outer-progress", "--merge-progress", "--final-progress", "--end-progress"];
    let frame = 0;
    let dirty = true;
    let signalHost: HTMLElement | undefined;
    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    const enabled = () => !motion.matches && !document.hidden;
    const measure = () => {
      const offset = scrollY;
      const viewport = innerHeight;
      const lastScroll = Math.max(0, root.scrollHeight - viewport);
      records.forEach((record) => {
        const bounds = record.element.getBoundingClientRect();
        record.top = bounds.top + offset;
        record.height = bounds.height;
        record.start = record.top - viewport * 0.85;
        record.end = record.top + record.height - viewport * 0.25;
        if (record.kind === "experience") {
          const roles = record.element.querySelectorAll(".timeline li");
          if (roles.length) {
            record.start = roles[0].getBoundingClientRect().top + offset - viewport * 0.45;
            record.end = roles[roles.length - 1].getBoundingClientRect().top + offset - viewport * 0.45;
          }
        }
        if (record.kind === "contact") {
          const email = record.element.querySelector(".contact-email");
          record.start = record.top - viewport * 0.95;
          record.end = Math.min(lastScroll, (email?.getBoundingClientRect().top || bounds.top) + offset - viewport * 0.42);
        }
        record.end = Math.max(record.start + 1, record.end);
        record.previous = -1;
      });
      dirty = false;
    };
    const paint = () => {
      frame = 0;
      if (!enabled()) return;
      if (dirty) measure();
      const position = scrollY;
      let candidate: HTMLElement | undefined;
      let nearest = Infinity;
      records.forEach((record) => {
        const { element, kind } = record;
        if (!nearby.has(element)) return;
        const progress = clamp((position - record.start) / (record.end - record.start));
        if (progress !== record.previous) {
          element.style.setProperty("--section-progress", progress.toFixed(4));
          element.style.setProperty("--section-energy", (1 - Math.abs(progress - 0.5) * 2).toFixed(4));
          const limit = compact.matches ? 6 : kind === "project" || kind === "capabilities" ? 10 : kind === "contact" ? 28 : 40;
          element.style.setProperty("--visual-depth", `${((progress - 0.5) * limit).toFixed(2)}px`);
          if (kind === "hero") {
            const depth = compact.matches ? 0 : clamp(position / Math.max(1, record.height)) * 8;
            element.style.setProperty("--portrait-depth", `${depth.toFixed(2)}px`);
            element.style.setProperty("--network-depth", `${depth.toFixed(2)}px`);
          }
          if (kind === "contact") {
            element.style.setProperty("--outer-progress", clamp(progress / 0.3).toFixed(4));
            element.style.setProperty("--merge-progress", clamp((progress - 0.3) / 0.35).toFixed(4));
            element.style.setProperty("--final-progress", clamp((progress - 0.65) / 0.25).toFixed(4));
            element.style.setProperty("--end-progress", clamp((progress - 0.9) / 0.1).toFixed(4));
          }
          record.previous = progress;
        }
        if (kind === "project" && visible.has(element)) {
          const distance = Math.abs(record.top + record.height / 2 - position - innerHeight / 2);
          if (distance < nearest) { nearest = distance; candidate = element; }
        }
      });
      if (candidate !== signalHost) {
        signalHost?.classList.remove("motion-signal-host");
        candidate?.classList.add("motion-signal-host");
        signalHost = candidate;
      }
    };
    const schedule = () => {
      if (enabled() && !frame) frame = requestAnimationFrame(paint);
    };
    const invalidate = () => { dirty = true; schedule(); };
    const proximity = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        const element = target as HTMLElement;
        if (isIntersecting) nearby.add(element); else nearby.delete(element);
      });
      schedule();
    }, { rootMargin: "180px 0px" });
    const visibility = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        const element = target as HTMLElement;
        element.classList.toggle("motion-visible", isIntersecting);
        if (isIntersecting) {
          visible.add(element);
          element.classList.add("motion-entered");
        } else visible.delete(element);
      });
      schedule();
    });
    const reset = () => {
      records.forEach(({ element }) => properties.forEach((property) => element.style.removeProperty(property)));
    };
    const sync = () => {
      root.classList.toggle("motion-enabled", enabled());
      root.classList.toggle("motion-ready", !motion.matches);
      cancelAnimationFrame(frame); frame = 0;
      if (motion.matches) reset();
      invalidate();
    };
    const layout = new ResizeObserver(invalidate);
    if (main) layout.observe(main);
    records.forEach(({ element }) => { proximity.observe(element); visibility.observe(element); });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", invalidate);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    compact.addEventListener("change", invalidate);
    sync();
    return () => {
      cancelAnimationFrame(frame);
      proximity.disconnect(); visibility.disconnect(); layout.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", invalidate);
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
      compact.removeEventListener("change", invalidate);
      root.classList.remove("motion-enabled", "motion-ready");
      records.forEach(({ element }) => element.classList.remove("motion-visible", "motion-entered", "motion-signal-host"));
      reset();
    };
  }, []);
}
