import { bounded, forestConfig, qualityFor, type ForestTheme } from "./config";
import { palettes } from "./palette";
import { generateScene, type ForestScene } from "./scene";
import { createAnimation } from "./animation";
import { generateRiverScene } from "./river";

export type ForestState = { theme: ForestTheme; enabled: boolean };
export type ForestHandle = { update: (state: ForestState) => void; dispose: () => void };
type MovingCell = { x: number; y: number; glyph: string; color: number; group: number };

export function mountForest(host: HTMLElement, initial: ForestState, aerial = false): ForestHandle {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return { update() {}, dispose() {} };
  const ctx = context;
  let state = initial, disposed = false, intersecting = false;
  let width = 0, height = 0, scale = 1, cellWidth = 0, cellHeight = 0;
  let scene: ForestScene;
  let caches: HTMLCanvasElement[] = [];
  let moving: MovingCell[][] = [];
  let rebuildFrame = 0;
  let buildFrame = 0, building = false;
  let generationFrame = 0;
  let initializationWorkMs = 0, maxInitializationSliceMs = 0;
  let pointerX = 0, pointerY = 0;
  let totalFrames = 0, paintMs = 0, maxPaintMs = 0;
  let font = "";
  function getPalette() {
    if (!aerial) return palettes[state.theme];
    return state.theme === "light" ? [palettes.light[2], ["#c1b994", "#b6b18e", "#9aa080", "#7b9579"], ["#659b9d", "#4a8d91", "#337f88", "#246d7d"], palettes.light[3]] : [palettes.dark[2], ["#4e5b3f", "#67704c", "#718062", "#829078"], ["#24464b", "#315c61", "#46797d", "#79a2a0"], palettes.dark[3]];
  }
  const pointer = matchMedia("(hover: hover) and (pointer: fine) and (min-width: 761px)");
  const hero = host.parentElement!;
  const clock = createAnimation({ request: callback => requestAnimationFrame(callback), cancel: id => cancelAnimationFrame(id) }, time => {
    try { paint(time); } catch { fail(); }
  }, forestConfig.fps);
  function publish() {
    host.dataset.frames = String(totalFrames);
    host.dataset.paintMs = (paintMs / Math.max(1, totalFrames)).toFixed(3);
    host.dataset.maxPaintMs = maxPaintMs.toFixed(3);
  }
  function paint(time: number) {
    if (disposed || !scene || building || caches.length !== 4) return;
    const started = performance.now();
    ctx.clearRect(0, 0, width, height);
    const palette = getPalette();
    const branchProgress = aerial && state.enabled ? bounded(Number.parseFloat(getComputedStyle(host).getPropertyValue("--outer-progress")) || 0, 0, 1) : 1;
    if (aerial) host.dataset.branchProgress = branchProgress.toFixed(3);
    ctx.font = font; ctx.textBaseline = "alphabetic";
    for (let layer = 0; layer < 4; layer++) {
      const px = state.enabled && pointer.matches ? pointerX * layer / 3 : 0;
      const py = state.enabled && pointer.matches ? pointerY * layer / 3 : 0;
      ctx.drawImage(caches[layer], px, py, width, height);
      for (const cell of moving[layer]) {
        if (cell.group >= 64) {
          const across = cell.x / width;
          const reach = cell.group < 66 ? across : 1 - across;
          if (reach > 0.12 + branchProgress * 0.82) continue;
        }
        const wind = state.enabled && cell.group < 64 ? Math.sin(time * forestConfig.speed + cell.group * 1.7) * (aerial ? 0.55 : forestConfig.wind) : 0;
        ctx.fillStyle = palette[layer][cell.color];
        ctx.fillText(cell.glyph, cell.x + px + wind, cell.y + py);
      }
      if (layer === 1 && !aerial) {
        const drift = state.enabled ? Math.sin(time * 0.08) * width * 0.035 : 0;
        const fog = ctx.createRadialGradient(width * 0.59 + drift, height * 0.5, 0, width * 0.59 + drift, height * 0.5, width * 0.33);
        fog.addColorStop(0, state.theme === "dark" ? `rgba(145,175,161,${forestConfig.mist})` : `rgba(250,248,242,${forestConfig.mist * 2})`);
        fog.addColorStop(1, "transparent");
        ctx.fillStyle = fog; ctx.fillRect(0, 0, width, height);
      }
    }
    const cost = performance.now() - started;
    totalFrames++; paintMs += cost; maxPaintMs = Math.max(maxPaintMs, cost);
    if (totalFrames % 25 === 1) publish();
  }
  function cacheLayers() {
    cancelAnimationFrame(buildFrame); buildFrame = 0;
    building = true; clock.setActive(false); host.dataset.running = "false";
    caches.forEach(c => { c.width = 0; c.height = 0; });
    caches = []; moving = [];
    const started = performance.now();
    let layer = 0;
    const buildLayer = () => {
      buildFrame = 0;
      if (disposed) return;
      const sliceStart = performance.now();
      try {
      const palette = getPalette();
      const cache = document.createElement("canvas");
      cache.width = canvas.width; cache.height = canvas.height;
      const c = cache.getContext("2d");
      if (!c) throw Error("Canvas cache unavailable");
      c.setTransform(scale, 0, 0, scale, 0, 0);
      c.font = font; c.textBaseline = "alphabetic";
      const g = scene.grids[layer];
      const dynamic: MovingCell[] = [];
      // Group static glyph painting by ink. Only selected coherent crown groups
      // are redrawn each animation frame; all terrain remains cached.
      for (let color = 0; color < 4; color++) {
        c.fillStyle = palette[layer][color];
        for (let i = 0; i < g.glyph.length; i++) {
          if (!g.glyph[i] || g.color[i] !== color) continue;
          const glyph = forestConfig.glyphs[g.glyph[i]];
          const x = (i % g.cols) * cellWidth;
          const y = (Math.floor(i / g.cols) + 0.84) * cellHeight;
          if (g.motion[i]) dynamic.push({ x, y, glyph, color, group: g.motion[i] });
          else c.fillText(glyph, x, y);
        }
      }
      caches.push(cache); moving.push(dynamic);
      layer++;
      const work = performance.now() - sliceStart;
      initializationWorkMs += work; maxInitializationSliceMs = Math.max(maxInitializationSliceMs, work);
      if (layer < 4) buildFrame = requestAnimationFrame(buildLayer);
      else {
        building = false;
        paint(clock.time); sync();
        host.dataset.ready = "true";
        host.dataset.initializationMs = initializationWorkMs.toFixed(2);
        host.dataset.initializationElapsedMs = (performance.now() - started).toFixed(2);
        host.dataset.maxInitializationSliceMs = maxInitializationSliceMs.toFixed(2);
      }
      } catch { fail(); }
    };
    buildFrame = requestAnimationFrame(buildLayer);
  }
  function rebuild() {
    rebuildFrame = 0;
    if (disposed) return;
    const started = performance.now();
    const bounds = host.getBoundingClientRect();
    const nextWidth = Math.round(bounds.width), nextHeight = Math.round(bounds.height);
    if (!nextWidth || !nextHeight) return;
    if (nextWidth === width && nextHeight === height && scene) return;
    width = nextWidth; height = nextHeight;
    // Bound both dimensions, including 4K and tall Largest-text heroes.
    scale = Math.min(devicePixelRatio || 1, forestConfig.maxDpr, 1920 / width, forestConfig.maxHeight / height);
    canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    const quality = qualityFor(width), cols = forestConfig.columns[quality];
    // Measure the actual font, then tighten its advance independently of ink
    // size. Larger glyphs on a tighter pitch connect the landscape forms.
    const tracking = bounded(forestConfig.tracking, 0.75, 1);
    ctx.font = '10px "Courier New", monospace';
    const unitWidth = ctx.measureText("M").width / 10;
    const fontSize = width / cols / unitWidth / tracking;
    font = `${fontSize}px "Courier New", monospace`;
    ctx.font = font;
    cellWidth = ctx.measureText("M").width * tracking;
    cellHeight = fontSize * bounded(forestConfig.leading, 0.72, 1.1);
    const rows = Math.round(bounded(height / cellHeight, 30, 150));
    // Grid positions use the measured aspect ratio, while the last row is fitted
    // to the container to avoid an abrupt empty edge in unusually tall heroes.
    cellHeight = height / rows;
    initializationWorkMs = performance.now() - started;
    maxInitializationSliceMs = initializationWorkMs;
    cancelAnimationFrame(generationFrame); cancelAnimationFrame(buildFrame);
    building = true; clock.setActive(false); host.dataset.running = "false";
    const steps = aerial ? generateRiverScene(cols, rows) : generateScene(cols, rows);
    const generate = () => {
      generationFrame = 0;
      if (disposed) return;
      const start = performance.now();
      try {
        const next = steps.next();
        const work = performance.now() - start;
        initializationWorkMs += work; maxInitializationSliceMs = Math.max(maxInitializationSliceMs, work);
        if (next.done) { scene = next.value; host.dataset.signature = String(scene.signature); cacheLayers(); }
        else generationFrame = requestAnimationFrame(generate);
      } catch { fail(); }
    };
    generationFrame = requestAnimationFrame(generate);
    host.dataset.quality = quality;
    host.dataset.cells = String(cols * rows * 4);
    host.dataset.backingPixels = String(canvas.width * canvas.height * 5);
  }
  function scheduleResize() {
    if (!rebuildFrame && !disposed) rebuildFrame = requestAnimationFrame(safeRebuild);
  }
  function fail() { host.dataset.ready = "false"; dispose(); }
  function safeRebuild() { try { rebuild(); } catch { fail(); } }
  function sync() {
    const active = state.enabled && intersecting && !document.hidden && !disposed && !building;
    clock.setActive(active);
    host.dataset.running = String(active);
    if (!active && scene && !disposed) {
      try { paint(clock.time); publish(); } catch { fail(); }
    }
  }
  function move(event: PointerEvent) {
    if (!state.enabled || !pointer.matches || event.pointerType !== "mouse") return;
    const rect = hero.getBoundingClientRect();
    pointerX = bounded((event.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5) * forestConfig.parallax * 2;
    pointerY = bounded((event.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5) * forestConfig.parallax * 2;
  }
  function leave() { pointerX = 0; pointerY = 0; }
  const resize = new ResizeObserver(scheduleResize);
  const visibility = new IntersectionObserver(([entry]) => { intersecting = entry.isIntersecting; sync(); });
  function dispose() {
    if (disposed) return;
    disposed = true; clock.dispose(); cancelAnimationFrame(rebuildFrame); cancelAnimationFrame(buildFrame); cancelAnimationFrame(generationFrame);
    resize.disconnect(); visibility.disconnect();
    document.removeEventListener("visibilitychange", sync);
    hero.removeEventListener("pointermove", move); hero.removeEventListener("pointerleave", leave);
    caches.forEach(c => { c.width = 0; c.height = 0; }); caches = []; moving = [];
    canvas.width = 0; canvas.height = 0; canvas.remove();
    host.dataset.running = "false";
  }
  host.appendChild(canvas);
  host.style.setProperty("--forest-left", String(forestConfig.mask.left));
  host.style.setProperty("--forest-right", String(forestConfig.mask.right));
  host.style.setProperty("--forest-bottom-start", `${forestConfig.mask.bottomStart * 100}%`);
  host.style.opacity = String(forestConfig.opacity);
  safeRebuild();
  if (!disposed) {
    resize.observe(host); visibility.observe(hero);
    document.addEventListener("visibilitychange", sync);
    hero.addEventListener("pointermove", move, { passive: true });
    hero.addEventListener("pointerleave", leave);
  }
  return {
    update(next) {
      if (disposed) return;
      const changed = next.theme !== state.theme;
      state = next;
      try { if (changed && scene) { initializationWorkMs = 0; maxInitializationSliceMs = 0; cacheLayers(); } sync(); if (scene) paint(clock.time); }
      catch { fail(); }
    },
    dispose,
  };
}
