import { bounded, forestConfig, qualityFor, type ForestTheme } from "./config";
import { daylightCodeCanopy, palettes } from "./palette";
import { generateScene, type ForestScene } from "./scene";
import { createAnimation } from "./animation";
import { generateRiverScene } from "./river";
import { emptySceneCells, narrativeForestInks, narrativeColumns, narrativeInk, narrativeRiverInk, narrativeRiverInks } from "./narrativeField";
import { sourceTextureGlyph } from "./sourceTexture";
import { geometryForScene, layerOf, renderSceneTexture } from "../artwork/adapter";
import { unicodeSVG } from "../../vendor/naae-unicode/unicode/render.js";
import type { Locale, WritingMode } from "../i18n/languages";
import { portraitWeight, portraitInkAlpha, portraitInkLuminance, portraitLightForestInk, portraitSeparationPreset, type PortraitBounds } from "./portraitSeparation";

export type ForestState = { theme: ForestTheme; enabled: boolean; locale?: Locale; writingMode?: WritingMode };
export type ForestHandle = { update: (state: ForestState) => void; dispose: () => void };
type MovingCell = { x: number; y: number; glyph: string; color: number; group: number; alpha: number; ink?: string };

export function mountForest(host: HTMLElement, initial: ForestState, aerial = false, seed: number = forestConfig.seed, codeCanopy = false, narrativeStyle = false): ForestHandle {
  if (narrativeStyle) host.dataset.narrative = "naae-v0.3";
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
  let textureGeneration = 0;
  let transition: HTMLCanvasElement | undefined;
  let portraitBox: PortraitBounds | undefined;
  let portraitStrength: number = portraitSeparationPreset.strength;
  let portraitLuminance: number = portraitSeparationPreset.luminance;
  let portraitLightSage=0;
  const portraitImage = !aerial && host.closest?.('.hero-environment')?.querySelector<HTMLImageElement>('.portrait img');
  function separationAlpha(ink: string, x: number, y: number) {
    return portraitBox ? portraitInkAlpha(ink, portraitWeight(x,y,portraitBox),portraitStrength) : 1;
  }
  function separationInk(ink: string, x: number, y: number) {
    if(!portraitBox || (!portraitLuminance && !portraitLightSage)) return ink;
    const weight=portraitWeight(x,y,portraitBox);
    return portraitLightForestInk(portraitInkLuminance(ink,weight,state.theme,portraitLuminance),weight,state.theme,portraitLightSage);
  }
  let geometry: ReturnType<typeof geometryForScene> | undefined, geometryKey = '', geometryBuilds = 0;
  function getPalette() {
    if (narrativeStyle) return aerial ? narrativeRiverInks[state.theme] : narrativeForestInks[state.theme];
    if (codeCanopy && !aerial && state.theme === "light") return daylightCodeCanopy;
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
    // Editorial rivers show their complete catchments without a page scroll controller.
    const branchProgress = aerial && state.enabled && seed === forestConfig.seed ? bounded(Number.parseFloat(getComputedStyle(host).getPropertyValue("--outer-progress")) || 0, 0, 1) : 1;
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
        ctx.fillStyle = cell.ink || palette[layer][cell.color];
        ctx.globalAlpha = cell.alpha;
        ctx.fillText(cell.glyph, cell.x + px + wind, cell.y + py);
        ctx.globalAlpha = 1;
      }
      if (layer === 1 && !aerial && !narrativeStyle) {
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
  async function cacheLayers() {
    if (portraitImage) {
      const h=host.getBoundingClientRect(),p=portraitImage.getBoundingClientRect();
      const fit=Math.min(p.width/900,p.height/972),w=900*fit,hh=972*fit;
      portraitBox={x:p.left-h.left+(p.width-w)/2,y:p.top-h.top+(p.height-hh)/2,width:w,height:hh};
      const style=getComputedStyle(host);
      const configured=parseFloat(style.getPropertyValue('--portrait-separation-strength'));
      const luminance=parseFloat(style.getPropertyValue('--portrait-separation-luminance'));
      const sage=parseFloat(style.getPropertyValue('--portrait-light-sage'));
      portraitLightSage=state.theme==='light'&&Number.isFinite(sage)?Math.max(0,Math.min(.25,sage)):0;
      portraitLuminance=Number.isFinite(luminance)?luminance:portraitSeparationPreset.luminance;
      portraitStrength=Number.isFinite(configured)?configured:portraitSeparationPreset.strength;
      host.dataset.portraitSeparation=JSON.stringify({...portraitBox,strength:portraitStrength,luminance:portraitLuminance,lightSage:portraitLightSage});
    }
    const generation = ++textureGeneration;
    host.dataset.textureStatus = 'loading';
    cancelAnimationFrame(buildFrame); buildFrame = 0;
    building = true; clock.setActive(false); host.dataset.running = "false";
    caches.forEach(c => { c.width = 0; c.height = 0; });
    caches = []; moving = [];
    const started = performance.now();
    let texture: Awaited<ReturnType<typeof renderSceneTexture>> | undefined;
    let verticalImages: HTMLImageElement[] | undefined;
    const locale = state.locale || "en";
    const textureStarted = performance.now();
    let textureStatus = 'fallback';
    if (narrativeStyle) try {
      const nextGeometryKey = `${scene.signature}:${width}:${height}:${state.theme}`;
      if (nextGeometryKey !== geometryKey) {
        geometry = geometryForScene(scene, width, height, aerial, getPalette(), state.theme);
        geometryKey = nextGeometryKey;host.dataset.geometryBuilds = String(++geometryBuilds);
      }
      texture = await renderSceneTexture(geometry!, locale, state.writingMode || "horizontal", state.theme);
      if (disposed || generation !== textureGeneration) return;
      if (texture.artwork.request.settings.writingMode === 'vertical-rl') {
        verticalImages = await Promise.all([0,1,2,3].map(async layer => {
          const gw=texture!.artwork.request.geometry.width,gh=texture!.artwork.request.geometry.height;
          const runs=texture!.artwork.runs.filter(run => layerOf(run) === layer).map(run => {
            const alpha=separationAlpha(run.ink,run.x*width/gw,run.y*height/gh);
            const ink=separationInk(run.ink,run.x*width/gw,run.y*height/gh);
            return alpha===1&&ink===run.ink?run:{...run,ink:ink+Math.round(alpha*255).toString(16).padStart(2,'0')};
          });
          const svg = unicodeSVG({...texture!.artwork,runs},texture!.fonts);
          const url = URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
          try {const image = new Image(); await new Promise<void>((resolve,reject) => {image.onload=()=>resolve();image.onerror=()=>reject(Error('Vertical artwork rasterization failed'));image.src=url;});return image;}
          finally {URL.revokeObjectURL(url);}
        }));
      }
      textureStatus = texture.status === 'incomplete' ? 'stale' : 'complete';
    } catch {
      if (disposed || generation !== textureGeneration) return;
      // Geometry-only punctuation remains language-neutral if assets are unavailable.
      textureStatus = 'fallback';
    }
    if (disposed || generation !== textureGeneration) return;
    host.dataset.textureMs = (performance.now()-textureStarted).toFixed(2);
    host.dataset.locale = locale;
    host.dataset.writingMode = state.writingMode || 'horizontal';
    host.dataset.textRuns = String(texture?.artwork.runs.length || 0);
    host.dataset.clippedRuns = String(texture?.artwork.report.clipped || 0);
    host.dataset.textureRevision = texture?.artwork.request.textPack.sourceRevision || '';
    host.dataset.placementCacheHit = String(texture?.placementCacheHit || false);
    let layer = 0;
    const buildLayer = () => {
      buildFrame = 0;
      if (disposed || generation !== textureGeneration) return;
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
      if (narrativeStyle && !aerial && layer === 0) {
        const empty = emptySceneCells(scene);
        c.fillStyle = state.theme === "dark" ? "#25372b" : "#e0e7e3";
        for (let i = 0; i < empty.length; i++) if (empty[i]) {
          const col = i % g.cols, row = Math.floor(i / g.cols);
          c.fillText("·", col * cellWidth, (row + 0.84) * cellHeight);
        }
      }
      // Group static glyph painting by ink. Only selected coherent crown groups
      // are redrawn each animation frame; all terrain remains cached.
      for (let color = 0; color < 4; color++) {
        c.fillStyle = palette[layer][color];
        for (let i = 0; i < g.glyph.length; i++) {
          if (!g.glyph[i] || g.color[i] !== color) continue;
          const originalGlyph = forestConfig.glyphs[g.glyph[i]];
          const glyph = narrativeStyle ? originalGlyph : sourceTextureGlyph(originalGlyph, i % g.cols, Math.floor(i / g.cols), layer, seed, aerial, codeCanopy, g.color[i], state.theme);
          // Letters have more ink than small punctuation. Match their visual
          // weight so distant crowns stay light and nearer shadows stay deep.
          const weight = !narrativeStyle && codeCanopy && !aerial && glyph !== originalGlyph
            ? (".,:;".includes(originalGlyph) ? 0.5 : "+*o".includes(originalGlyph) ? 0.75 : 0.95) : 1;
          const daylightWeight = narrativeStyle && state.theme === "light" && /[a-z]/i.test(glyph) ? (aerial || layer > 1 ? 0.78 : 0.55) : 1;
          let alpha = weight * daylightWeight * (!narrativeStyle && codeCanopy && !aerial && state.theme === "light" && glyph !== originalGlyph
            ? [0.5, 0.58, 0.72, 0.82][layer] : 1);
          let ink = narrativeStyle ? (aerial ? narrativeRiverInk(i % g.cols, Math.floor(i / g.cols), layer, color, seed, state.theme) : narrativeInk(originalGlyph, i % g.cols, Math.floor(i / g.cols), layer, color, seed, state.theme)) : undefined;
          const x = (i % g.cols) * cellWidth;
          const y = (Math.floor(i / g.cols) + 0.84) * cellHeight;
          alpha *= separationAlpha(ink || palette[layer][color],x,y);
          if(portraitBox) ink=separationInk(ink || palette[layer][color],x,y);
          if (g.motion[i]) dynamic.push({ x, y, glyph, color, group: g.motion[i], alpha, ink });
          else {
            c.globalAlpha = alpha;
            if (ink) c.fillStyle = ink;
            c.fillText(glyph, x, y);
            c.fillStyle = palette[layer][color];
          }
        }
      }
      // Whole native-shaped runs replace their patch of stipple; no character-cell
      // positioning is used for Arabic, Indic or localized semantic words.
      const textureScaleX = width / (texture?.artwork.request.geometry.width || width), textureScaleY = height / (texture?.artwork.request.geometry.height || height);
      c.save(); c.scale(textureScaleX,textureScaleY);
      const runs = texture?.artwork.runs.filter(run => layerOf(run) === layer) || [];
      for (const run of runs) c.clearRect(run.box.x-.5,run.box.y-.5,run.box.width+1,run.box.height+1);
      if (verticalImages) c.drawImage(verticalImages[layer],0,0,texture!.artwork.request.geometry.width,texture!.artwork.request.geometry.height);
      else if (texture) {
        c.font = `${texture.artwork.request.settings.fontSize}px ${texture.fonts.map(f => `"${f.family}"`).join(',')}`;
        c.direction = texture.artwork.request.textPack.direction; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
        c.globalAlpha = 1;
        for (const run of runs) {
          c.fillStyle = separationInk(run.ink,run.x*textureScaleX,run.y*textureScaleY);
          c.globalAlpha=separationAlpha(run.ink,run.x*textureScaleX,run.y*textureScaleY);
          c.fillText(run.text,run.x,run.y);
        }
      }
      c.restore();
      // Punctuation inside a semantic run must not animate back over its glyphs.
      const occupied = new Uint8Array(g.cols*g.rows);
      for (const run of runs) for (let row=Math.max(0,Math.floor(run.box.y*textureScaleY/cellHeight));row<=Math.min(g.rows-1,Math.ceil((run.box.y+run.box.height)*textureScaleY/cellHeight));row++)
        for (let col=Math.max(0,Math.floor(run.box.x*textureScaleX/cellWidth));col<=Math.min(g.cols-1,Math.ceil((run.box.x+run.box.width)*textureScaleX/cellWidth));col++) occupied[row*g.cols+col]=1;
      const visibleMotion = dynamic.filter(cell => !occupied[Math.min(g.rows-1,Math.floor(cell.y/cellHeight))*g.cols+Math.floor(cell.x/cellWidth)]);
      caches.push(cache); moving.push(visibleMotion);
      layer++;
      const work = performance.now() - sliceStart;
      initializationWorkMs += work; maxInitializationSliceMs = Math.max(maxInitializationSliceMs, work);
      if (layer < 4) buildFrame = requestAnimationFrame(buildLayer);
      else {
        transition?.remove(); transition = undefined;
        if (state.enabled && totalFrames > 0) {
          transition = document.createElement('canvas'); transition.width=canvas.width;transition.height=canvas.height;
          transition.getContext('2d')?.drawImage(canvas,0,0);transition.style.cssText='position:absolute;inset:0;pointer-events:none';host.append(transition);
          const previous = transition;previous.animate([{opacity:1},{opacity:0}],{duration:180}).finished.then(()=>previous.remove()).catch(()=>previous.remove());
        }
        building = false;
        paint(clock.time); sync();
        host.dataset.ready = "true";
        host.dataset.textureStatus = textureStatus;
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
    host.dataset.textureStatus = 'loading';
    // Bound both dimensions, including 4K and tall Largest-text heroes.
    scale = Math.min(devicePixelRatio || 1, forestConfig.maxDpr, 1920 / width, forestConfig.maxHeight / height);
    canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    const quality = qualityFor(width), cols = narrativeStyle ? narrativeColumns(width) : forestConfig.columns[quality];
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
    textureGeneration++; cancelAnimationFrame(generationFrame); cancelAnimationFrame(buildFrame);
    building = true; clock.setActive(false); host.dataset.running = "false";
    const steps = aerial ? generateRiverScene(cols, rows, seed) : generateScene(cols, rows, seed);
    const generate = () => {
      generationFrame = 0;
      if (disposed) return;
      const start = performance.now();
      try {
        const next = steps.next();
        const work = performance.now() - start;
        initializationWorkMs += work; maxInitializationSliceMs = Math.max(maxInitializationSliceMs, work);
        if (next.done) { scene = next.value; host.dataset.signature = String(scene.signature); void cacheLayers(); }
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
  // Reflow can move the portrait while leaving the forest container unchanged.
  let portraitResizeFrame=0;
  const portraitResize = portraitImage ? new ResizeObserver(() => {
    cancelAnimationFrame(portraitResizeFrame);
    portraitResizeFrame=requestAnimationFrame(() => { if(scene && !building && !disposed) void cacheLayers(); });
  }) : undefined;
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
    disposed = true; textureGeneration++; transition?.remove(); clock.dispose(); cancelAnimationFrame(rebuildFrame); cancelAnimationFrame(buildFrame); cancelAnimationFrame(generationFrame);
    resize.disconnect(); visibility.disconnect(); portraitResize?.disconnect(); cancelAnimationFrame(portraitResizeFrame);
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
    if(portraitImage) portraitResize?.observe(portraitImage);
    document.addEventListener("visibilitychange", sync);
    hero.addEventListener("pointermove", move, { passive: true });
    hero.addEventListener("pointerleave", leave);
  }
  return {
    update(next) {
      if (disposed) return;
      const changed = next.theme !== state.theme || next.locale !== state.locale || next.writingMode !== state.writingMode;
      state = next;
      try { if (changed && scene) { initializationWorkMs = 0; maxInitializationSliceMs = 0; void cacheLayers(); } sync(); if (scene) paint(clock.time); }
      catch { fail(); }
    },
    dispose,
  };
}
