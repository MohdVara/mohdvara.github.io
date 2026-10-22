import { bounded, forestConfig } from "./config";

export type ForestGrid = {
  cols: number; rows: number;
  glyph: Uint8Array; color: Uint8Array; depth: Uint8Array; motion: Uint8Array;
};
export type Crown = { x: number; y: number; radius: number; height: number; phase: number; layer: number };
export type ForestScene = { grids: ForestGrid[]; crowns: Crown[]; signature: number; seed: number };

// Coordinate noise is independent of call order, theme, and rendering size.
export function noise(x: number, y: number, seed: number = forestConfig.seed) {
  let n = Math.imul(x ^ seed, 374761393) ^ Math.imul(y, 668265263);
  n = Math.imul(n ^ n >>> 13, 1274126177);
  return ((n ^ n >>> 16) >>> 0) / 4294967296;
}
export function ridge(x: number, layer: number, seed: number) {
  const phase = noise(layer, 30, seed) * 2;
  const valleyCenter = seed === forestConfig.seed ? 0.57 : 0.43 + noise(63, 19, seed) * 0.28;
  const valley = Math.exp(-(((x - valleyCenter) / 0.21) ** 2));
  return forestConfig.ridgeHeights[layer] + valley * forestConfig.valleyDepth * (layer / 3)
    + Math.sin(x * 9 + phase) * 0.055
    + Math.sin(x * 23 + layer * 2.6) * 0.023
    + Math.sin(x * 49 + phase) * 0.01;
}
function grid(cols: number, rows: number, layer: number): ForestGrid {
  const size = cols * rows;
  return { cols, rows, glyph: new Uint8Array(size), color: new Uint8Array(size), depth: new Uint8Array(size).fill(layer), motion: new Uint8Array(size) };
}

export function* generateScene(cols: number, rows: number, seed: number = forestConfig.seed): Generator<void, ForestScene> {
  cols = Math.round(bounded(cols, 40, 400)); rows = Math.round(bounded(rows, 30, 150));
  const grids = Array.from({ length: 4 }, (_, layer) => grid(cols, rows, layer));
  const crowns: Crown[] = [];
  // Broad terrain is entirely glyph-defined. Distant cells thin toward each edge.
  for (let layer = 0; layer < 4; layer++) {
    const g = grids[layer];
    for (let col = 0; col < cols; col++) {
      const x = col / (cols - 1);
      const top = ridge(x, layer, seed);
      for (let row = 0; row < rows; row++) {
        const y = row / rows;
        const surface = layer === 3 ? Math.max(0.88, top + 0.17) : top;
        if (y < surface) continue;
        // Empty spaces inside a nearer slope are real negative space, not an
        // invitation to pile every distant texture into the same character cell.
        for (let back = 0; back < layer; back++) { grids[back].glyph[row * cols + col] = 0; grids[back].motion[row * cols + col] = 0; }
        const d = y - top;
        const n = noise(col * 3, row * 5 + layer * 77, seed);
        const cluster = noise(Math.floor(x * 38), Math.floor(y * 29) + layer * 50, seed);
        const density = (layer === 0 ? 0.82 : layer === 3 ? 0.22 : 0.61 + cluster * 0.16) * forestConfig.density;
        if (n > density) continue;
        const i = row * cols + col;
        const rim = d < 0.025;
        g.glyph[i] = layer === 0 ? (n < 0.3 ? 3 : 2) : rim ? 4 + Math.floor(cluster * 4) : 1 + Math.floor(cluster * 5);
        g.color[i] = Math.floor(bounded((1 - cluster) * 3 + (rim ? 0.8 : 0), 0, 3));
      }
    }
    yield;
  }
  // Canonical tree coordinates are generated once in normalized landscape space.
  // Broad, irregular crowns evoke emergent tropical trees rather than conifers.
  for (let layer = 1; layer < 4; layer++) {
    const count = Math.round([0, 52, 37, 23][layer] * bounded(forestConfig.treeDensity, 0.3, 1.5));
    for (let t = 0; t < count + (layer === 3 ? 3 : 0); t++) {
      const emergent = t >= count;
      const x = emergent ? [0.64, 0.82, 0.96][t - count] : (t + noise(t, layer * 13, seed) * 0.9) / count;
      const baseline = ridge(x, layer, seed);
      const y = emergent ? [0.43, 0.48, 0.4][t - count] : baseline + noise(t, layer * 17, seed) * (layer === 3 ? 0.18 : 0.13);
      const radius = emergent ? [0.048, 0.042, 0.05][t - count] : (0.011 + noise(t, layer * 19, seed) * 0.016) * (layer === 3 ? 1.8 : layer === 2 ? 1.2 : 0.7);
      const crown: Crown = { x, y, radius, height: radius * (1.1 + noise(t, 71, seed) * 0.7), phase: noise(t, layer * 23, seed) * Math.PI * 2, layer };
      crowns.push(crown);
      const g = grids[layer];
      const rx = radius * cols;
      const ry = crown.height * rows;
      const cx = x * cols, cy = y * rows;
      const bottom = Math.min(rows - 1, Math.ceil(cy + ry * 4.5));
      const trunkX = Math.round(cx);
      for (let r = Math.max(0, Math.round(cy)); r <= bottom; r++) {
        if (trunkX >= cols) continue;
        const i = r * cols + trunkX;
        for (let back = 0; back < layer; back++) { grids[back].glyph[i] = 0; grids[back].motion[i] = 0; }
        g.glyph[i] = r % 4 ? 13 : 14; g.color[i] = 2;
      }
      for (let branch = -1; branch <= 1; branch += 2) {
        for (let step = 0; step < Math.ceil(rx * 0.85); step++) {
          const c = Math.round(cx + branch * step), r = Math.round(cy + ry * 1.7 - step * 0.55);
          if (c < 0 || c >= cols || r < 0 || r >= rows) continue;
          const i = r * cols + c;
          for (let back = 0; back < layer; back++) { grids[back].glyph[i] = 0; grids[back].motion[i] = 0; }
          g.glyph[i] = branch === 1 ? 11 : 12; g.color[i] = 1;
        }
      }
      // Several lobes produce asymmetric connected crowns and ragged margins.
      for (let lobe = 0; lobe < 5; lobe++) {
        const ox = Math.cos(lobe * 1.4 + crown.phase) * rx * 0.42;
        const oy = Math.sin(lobe * 1.8 + crown.phase) * ry * 0.28;
        for (let r = Math.max(0, Math.floor(cy - ry * 1.5)); r < Math.min(rows, cy + ry); r++) {
          for (let c = Math.max(0, Math.floor(cx - rx * 1.5)); c < Math.min(cols, cx + rx * 1.5); c++) {
            const ellipse = ((c - cx - ox) / rx) ** 2 + ((r - cy - oy) / ry) ** 2;
            const n = noise(c + t * 13, r + layer * 39, seed);
            if (ellipse > 0.65 + n * 0.35 || n < 0.09) continue;
            const i = r * cols + c;
            for (let back = 0; back < layer; back++) { grids[back].glyph[i] = 0; grids[back].motion[i] = 0; }
            const texture = noise(Math.floor(c / 2) + t * 13, Math.floor(r / 2) + layer * 39, seed);
            const light = bounded(0.55 - (r - cy) / (ry * 2) - (c - cx) / (rx * 5) + texture * 0.22, 0, 1);
            g.glyph[i] = light > 0.7 ? (n > 0.5 ? 5 : 7)
              : light > 0.35 ? [6, 7, 8][Math.floor(n * 3)] : (n > 0.7 ? 10 : 9);
            g.color[i] = Math.floor(light * 3);
            g.motion[i] = layer > 1 && t % 4 === 0 ? 1 + t % 12 : 0;
          }
        }
      }
      if (t % 4 === 3) yield;
    }
  }
  // Edge fronds: arching stems with alternating leaflets, all actual ASCII.
  const front = grids[3];
  for (let side = 0; side < 2; side++) {
    for (let stem = 0; stem < Math.round(bounded(forestConfig.foregroundFronds, 0, 5)); stem++) {
      for (let t = 0; t < 26; t++) {
        const u = t / 26;
        const x = side ? 1 - stem * 0.034 - u * 0.16 : stem * 0.035 + u * 0.16;
        const y = 0.96 - u * (0.18 + stem * 0.022) - Math.sin(u * Math.PI) * 0.045;
        const c = Math.round(x * (cols - 1)), r = Math.round(y * (rows - 1));
        const i = r * cols + c;
        front.glyph[i] = side ? 12 : 11; front.color[i] = 2;
        if (t % 2 === 0) for (let k = 1; k < 4; k++) {
          const cc = c + (side ? -1 : 1) * k;
          const rr = r + (t % 4 ? -1 : 1) * Math.ceil(k / 2);
          if (cc < 0 || cc >= cols || rr < 0 || rr >= rows) continue;
          front.glyph[rr * cols + cc] = k === 3 ? 5 : 12;
          front.color[rr * cols + cc] = 2;
        }
      }
    }
  }
  let signature = seed;
  for (const c of crowns) signature = Math.imul(signature ^ Math.round(c.x * 1e6) ^ Math.round(c.y * 1e6), 16777619) >>> 0;
  return { grids, crowns, seed, signature };
}

// Pure synchronous entrypoint for deterministic tests and offline callers.
export function createScene(cols: number, rows: number, seed: number = forestConfig.seed): ForestScene {
  const steps = generateScene(cols, rows, seed);
  let next = steps.next();
  while (!next.done) next = steps.next();
  return next.value;
}
