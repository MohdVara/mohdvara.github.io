import { bounded, forestConfig } from "./config";
import { noise, type ForestGrid, type ForestScene } from "./scene";

// The channel and crown field live in normalized map coordinates, so quality
// changes resample one landscape rather than choosing a different river.
export function* generateRiverScene(cols: number, rows: number, seed: number = forestConfig.seed): Generator<void, ForestScene> {
  cols = Math.round(bounded(cols, 40, 400));
  rows = Math.round(bounded(rows, 30, 150));
  const grids: ForestGrid[] = Array.from({ length: 4 }, (_, layer) => ({
    cols, rows, glyph: new Uint8Array(cols * rows), color: new Uint8Array(cols * rows),
    depth: new Uint8Array(cols * rows).fill(layer), motion: new Uint8Array(cols * rows),
  }));
  // Preserve the homepage composition; other pages select distinct bend phases
  // and amplitudes as well as different canopy grain.
  const variant = seed !== forestConfig.seed;
  const phase = (noise(18, 41, seed) - 0.5) * (variant ? 4 : 0.35);
  const amplitude = variant ? 0.085 + noise(39, 12, seed) * 0.045 : 0.105;
  // The river keeps one clear spine across the full-bleed landscape. Its upper
  // reach (after reflection) keeps winding rather than resolving to a straight stem.
  const center = (y: number) => {
    const winding = 0.70 + amplitude * Math.sin(y * 14 + phase) + 0.025 * Math.sin(y * 31 + phase);
    const t = bounded((y - 0.66) / 0.22, 0, 1);
    const resolved = t * t * (3 - 2 * t);
    const downstream = 0.66 + 0.085 * Math.sin((y - 0.66) * 13 + phase * 0.5)
      + 0.018 * Math.sin((y - 0.66) * 29 + phase);
    return winding * (1 - resolved) + downstream * resolved;
  };
  const halfWidth = (y: number) => 0.025 + 0.014 * (0.5 + 0.5 * Math.sin(y * 9 + phase + 1));
  let signature = seed >>> 0;
  for (let sample = 0; sample <= 32; sample++) {
    signature = Math.imul(signature ^ Math.round(center(sample / 32) * 1e6), 16777619) >>> 0;
  }
  const streamMask = new Uint8Array(cols * rows), bankMask = new Uint8Array(cols * rows);
  // Nonintersecting meandering catchments end in a downstream-aligned tangent. The
  // previous y(x) waves could cut across the main river at almost right angles.
  for (let branch = 0; branch < 4; branch++) {
    const joinY = [0.22, 0.52, 0.40, 0.65][branch];
    const left = branch < 2, startX = left ? 0.14 : 0.985;
    const sourceY = joinY - 0.21;
    const spread = Math.abs(startX - center(sourceY));
    const steps = cols * 4;
    for (let step = 0; step <= steps; step++) {
      const t = step / steps, u = 1 - t;
      // Tributaries follow smaller S bends through their own catchment. The
      // side-distance approaches zero with zero derivative, so each inlet
      // meets the main channel's downstream tangent instead of crossing it.
      const envelope = 4 * t * u;
      const bendPhase = left ? 0 : Math.PI;
      const y = bounded(sourceY + t * 0.21
        + (0.11 * Math.sin(t * Math.PI * 4 + bendPhase)
          + 0.025 * Math.sin(t * Math.PI * 6 + phase + bendPhase)) * envelope, 0.008, 0.96);
      const distanceFromMain = spread * u * u;
      const x = bounded(center(y) + (left ? -1 : 1) * distanceFromMain, 0.035, 0.985);
      const cx = x * (cols - 1), cy = y * (rows - 1);
      const rx = Math.max(0.8, (0.004 + t * 0.005) * cols);
      const ry = Math.max(0.72, (0.004 + t * 0.005) * rows);
      for (let r = Math.max(0, Math.floor(cy - ry - 1)); r <= Math.min(rows - 1, Math.ceil(cy + ry + 1)); r++) {
        for (let c = Math.max(0, Math.floor(cx - rx - 1)); c <= Math.min(cols - 1, Math.ceil(cx + rx + 1)); c++) {
          const i = r * cols + c;
          const d = ((c - cx) / rx) ** 2 + ((r - cy) / ry) ** 2;
          if (d < 2.5) bankMask[i] = 1;
          if (d < 1) streamMask[i] = branch + 1;
        }
      }
    }
    yield;
  }
  for (let row = 0; row < rows; row++) {
    const y = row / (rows - 1), cx = center(y), width = halfWidth(y);
    const bend = Math.sin(y * 7 + phase);
    for (let col = 0; col < cols; col++) {
      const x = col / (cols - 1), i = row * cols + col;
      const dx = x - cx;
      const distance = Math.abs(dx) / width;
      const branchIndex = streamMask[i] - 1;
      const branchBank = bankMask[i] !== 0;
      const branch = branchIndex >= 0;
      const grain = noise(Math.floor(x * 190), Math.floor(y * 140), seed);
      const bankRoughness = 0.035 * Math.sin(y * 57 + phase);
      const inside = distance <= 1 + bankRoughness || branch;
      if (inside) {
        // Pale point bars occupy the inside bend. The uninterrupted central
        // channel stays water; no solid polygon hides the character texture.
        const innerBend = dx * bend < 0;
        const bar = !branch && innerBend && distance > 0.64 + grain * 0.16;
        if (bar) {
          grids[1].glyph[i] = 1 + Math.floor(grain * 4);
          grids[1].color[i] = Math.floor(grain * 4);
        } else {
          grids[2].glyph[i] = grain > 0.72 ? 16 : 15;
          const outerDepth = bounded(1 - Math.abs(dx / width - bend * 0.24), 0, 1);
          grids[2].color[i] = branch ? 1 : Math.floor(outerDepth * 3);
          // After the last confluence, a quieter, brighter central current is
          // the one clear next step. Sparse carets indicate its upward flow
          // after the final vertical reflection; no separate diagram overlay.
          if (y > 0.70 && Math.abs(dx) < width * 0.22) {
            grids[2].color[i] = 3;
            if (row % 10 === 0 && col === Math.round(cx * (cols - 1))) grids[2].glyph[i] = 17;
          }
          if (row % 6 === 0 && grain > 0.7) grids[2].motion[i] = 1 + row % 6;
          if (branch && distance > 1 + bankRoughness) grids[2].motion[i] = 64 + branchIndex;
        }
        continue;
      }
      if (distance < 1.14 || branchBank) {
        grids[1].glyph[i] = 1 + Math.floor(grain * 4);
        grids[1].color[i] = Math.floor(grain * 4);
        continue;
      }
      if (grain > 0.19) {
        grids[0].glyph[i] = grain > 0.66 ? 5 : grain > 0.4 ? 3 : 2;
        grids[0].color[i] = Math.floor(grain * 4);
      }
      // Jittered overlapping crown lobes, shaded across their footprint, form
      // an aerial canopy without a repeated checkerboard or isolated dots.
      const cellX = Math.floor(x * 21), cellY = Math.floor(y * 16);
      let crownLight = -1;
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
        const tx = cellX + ox, ty = cellY + oy;
        const px = (tx + 0.22 + noise(tx, ty, seed) * 0.6) / 21;
        const py = (ty + 0.2 + noise(tx + 71, ty, seed) * 0.6) / 16;
        const rx = 0.018 + noise(tx, ty + 31, seed) * 0.025;
        const ry = rx * (0.9 + noise(tx + 43, ty, seed) * 0.55);
        const ellipse = ((x - px) / rx) ** 2 + ((y - py) / ry) ** 2;
        if (ellipse < 0.71 + noise(tx + 5, ty, seed) * 0.3) {
          crownLight = Math.max(crownLight, bounded(0.62 - (x - px) / rx * 0.25 - (y - py) / ry * 0.3 + grain * 0.14, 0, 1));
        }
      }
      if (crownLight >= 0 && grain > 0.06) {
        grids[3].glyph[i] = crownLight > 0.76 ? (grain > 0.5 ? 7 : 5)
          : crownLight > 0.5 ? [6, 7, 8][Math.floor(grain * 3)]
          : crownLight > 0.28 ? (grain > 0.5 ? 8 : 9) : (grain > 0.6 ? 10 : 9);
        grids[3].color[i] = Math.floor(crownLight * 3);
        grids[0].glyph[i] = 0;
      }
    }
    if (row % 12 === 11) yield;
  }
  // Reflect the map vertically: the upper stem now opens into a lower fan of
  // connected distributaries and forest islands, echoing the old branching
  // contact composition while remaining an aerial water landscape.
  for (const g of grids) {
    const channels = [g.glyph, g.color, g.motion];
    for (let row = 0; row < Math.floor(rows / 2); row++) for (let col = 0; col < cols; col++) {
      const a = row * cols + col, b = (rows - row - 1) * cols + col;
      for (const channel of channels) {
        const value = channel[a]; channel[a] = channel[b]; channel[b] = value;
      }
    }
  }
  return { grids, crowns: [], signature, seed };
}
