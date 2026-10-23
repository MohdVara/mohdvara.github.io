/** Dedicated 404 composition. These are glyph positions, never drawn paths.
 * Seeded and bounded; no animation, canvas analysis, or homepage scene imports. */
export type TrailConcept = "vanishing" | "diverging" | "beyond";
export type TrailRun = { x: number; y: number; size: number; alpha: number; layer: string; glyph?: string; word?: number };
export function trailScene(concept: TrailConcept = "vanishing", compact = false): TrailRun[] {
  const w = compact ? 420 : 1600, h = compact ? 440 : 900;
  const runs: TrailRun[] = [];
  let seed = 40419;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const put = (x: number, y: number, layer: string, alpha: number, glyph: string, size = 11) => {
    if (x < 8 || x > w - 8 || y < 10 || y > h - 12) return;
    runs.push({ x: +x.toFixed(2), y: +y.toFixed(2), layer, alpha: +alpha.toFixed(3), glyph, size });
  };
  // Unequal, interleaved ridges leave the editorial area open on desktop.
  for (let band = 0; band < 4; band++) {
    for (let x = 10; x < w - 10; x += compact ? 10 : 13) {
      const nx = x / w;
      const ridge = (compact ? .20 : .24) + band * .105 - .12 * Math.abs(Math.sin(nx * 6.2 + band * .76)) - .035 * Math.sin(nx * 21 + band);
      const y = ridge * h;
      const quiet = !compact && nx < .45 ? .30 : 1;
      put(x, y, "ridge", (.38 + band * .045) * quiet, x % 3 ? "/" : "^", 11);
      for (let row = 1; row <= 5 + band * 2; row++) {
        if (random() < .45) continue;
        put(x, y + row * 11, "terrain", (.20 + band * .035) * quiet, ["·", ":", "~", "-", "/"][Math.floor(random() * 5)], 10);
      }
    }
  }
  // The near trail is broad, becoming a thin trace that vanishes behind a ridge.
  const trailX = (t: number) => w * (compact ? .48 : .75) + Math.sin(t * 6.4 - .7) * w * (compact ? .19 : .115) * (1 - t * .62);
  const start = h * .98, end = h * (compact ? .30 : .34);
  for (let j = 0; j <= 55; j++) {
    const t = j / 55, y = start + (end - start) * t, x = trailX(t);
    const half = (compact ? 43 : 75) * (1 - t) ** 1.7 + 2;
    const fade = .4 + .6 * (1 - t);
    if (concept !== "beyond") {
      for (const side of [-1, 1]) {
        put(x + side * half, y, "trail", fade, side < 0 ? "/" : "\\", 12 - t * 3);
        if (j % 2 === 0) put(x + side * half * .7, y + 3, "trail", fade * .5, ":", 9);
      }
      if (j % 4 === 0 && t < .84) put(x, y, "trail", fade * .6, "·", 11);
      if (concept === "diverging" && t > .38) {
        const fork = x - (t - .38) * w * .4;
        put(fork - half * .55, y, "trail", fade * .8, "/", 10);
        put(fork + half * .55, y, "trail", fade * .8, "\\", 10);
      }
    }
    // Contour fields curve around the trail. Variant C fades the map entirely.
    for (let k = 0; k < (compact ? 15 : 38); k++) {
      const tx = 12 + random() * (w - 24);
      if (Math.abs(tx - x) < half + 22) continue;
      if (!compact && tx < w * .45 && y < h * .77) continue;
      const edge = concept === "beyond" ? Math.max(0, 1 - tx / w) : 1;
      put(tx, y + random() * 7, "contour", (.22 + random() * .20) * edge, ["~", "·", ":", "_", "∴"][Math.floor(random() * 5)], 10);
    }
    // Semantics are sparse, shaped as complete words, and never drawn over UI.
    if (j % 7 === 0 && t < .86 && y < h - 20) {
      const tx = Math.min(w - 65, x + half + 64);
      runs.push({ x: tx, y: y + 5, size: 11, alpha: .64 - t * .20, layer: "word", word: (j / 7) % 6 });
    }
  }
  // Sparse sedges: stems and leaves are entirely individual glyphs.
  for (let n = 0; n < (compact ? 12 : 26); n++) {
    const x = random() * w, y = h * (.77 + random() * .20);
    if (Math.abs(x - trailX(.15)) < w * .12) continue;
    for (let s = 0; s < 4; s++) {
      put(x, y - s * 9, "grass", .38, "|", 11);
      if (s > 0) { put(x - s * 3, y - s * 9, "grass", .43, "\\", 10); put(x + s * 3, y - s * 9, "grass", .43, "/", 10); }
    }
  }
  // A small trail marker at the bend, not a warning symbol.
  const mx = trailX(.35) + (compact ? 45 : 70), my = start + (end - start) * .35;
  for (let j = 0; j < 4; j++) put(mx, my - j * 10, "marker", .60, j === 3 ? "+" : "|", 11);
  return runs;
}

/** Share paint attributes across glyph runs to keep static 404 HTML compact. */
export function groupTrailRuns(runs: TrailRun[]) {
  const groups = new Map<string, { layer: string; size: number; alpha: number; runs: TrailRun[] }>();
  for (const run of runs) {
    const size = Math.round(run.size * 2) / 2, alpha = Math.max(.025, Math.round(run.alpha * 20) / 20);
    const key = `${run.layer}/${size}/${alpha}`;
    if (!groups.has(key)) groups.set(key, { layer: run.layer, size, alpha, runs: [] });
    groups.get(key)!.runs.push(run);
  }
  return [...groups.values()];
}
