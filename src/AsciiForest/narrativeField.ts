import { narrativeWords } from "../NarrativeArtwork/texture";
import { noise, type ForestScene } from "./scene";
import type { ForestTheme } from "./config";

// A single character grid carries both atmosphere and the animated landscape.
// Geometry and motion groups remain those of the established forest generator.
export const narrativeForestInks: Record<ForestTheme, readonly (readonly string[])[]> = {
  dark: [
    ["#23382f", "#334b40", "#425d4b", "#57725a"],
    ["#354a37", "#526346", "#6c7b50", "#859460"],
    ["#526637", "#74834a", "#92a05b", "#acb773"],
    ["#435532", "#647541", "#85944e", "#a5b464"],
  ],
  light: [
    ["#d2dcdd", "#bfcece", "#a9bdbb", "#95adaa"],
    ["#c6d2be", "#afc0a4", "#93ab86", "#78976b"],
    ["#648960", "#87a17a", "#a8bd98", "#c5d4b6"],
    ["#4f7652", "#73976b", "#9ab38e", "#bdd1ad"],
  ],
};

export function narrativeGlyph(original: string, col: number, row: number, layer: number, seed: number) {
  if ("/\\|!".includes(original)) return original;
  const vocabulary = layer < 2 ? narrativeWords.mountains : narrativeWords.forest;
  const block = Math.floor(col / 16);
  const word = vocabulary[Math.floor(noise(block, row + layer * 71, seed) * vocabulary.length)];
  const slot = col % 16;
  // Word groups sit among varied, seeded material marks. No fixed o+ pattern.
  if (slot < word.length && noise(block, row + 37, seed) > 0.22) return word[slot];
  const marks = layer < 2 ? "/\\^=:-.," : "*oO%+:;,.";
  return marks[Math.floor(noise(col * 3, row * 7 + layer, seed) * marks.length)];
}

export function atmosphereGlyph(col: number, row: number, seed: number) {
  const words = narrativeWords.sky;
  const word = words[(row * 5 + Math.floor(col / 24) + seed) % words.length];
  const phrase = word + "....'...~...";
  return phrase[col % phrase.length];
}

export function emptySceneCells(scene: ForestScene) {
  const size = scene.grids[0].glyph.length;
  const empty = new Uint8Array(size).fill(1);
  for (const grid of scene.grids) for (let i = 0; i < size; i++) if (grid.glyph[i]) empty[i] = 0;
  return empty;
}

export function narrativeColumns(width: number) {
  // Desktop text stays around 12px instead of growing with the whole canvas.
  // Mobile retains a separate, legible pitch rather than shrinking a panorama.
  return width < 600 ? 84 : Math.round(Math.max(128, Math.min(400, width / 6)));
}

const woodInks = {
  dark: ["#816747", "#a08355", "#c2a16c", "#dfc18c"],
  light: ["#9a7b56", "#876439", "#73542c", "#a88a61"],
} as const;
const warmLeaves = {
  dark: ["#64743c", "#83904b", "#a5ad60", "#c4c780"],
  light: ["#8d8b58", "#a29d68", "#bbb283", "#d1c79f"],
} as const;
export function narrativeInk(original: string, col: number, row: number, layer: number, color: number, seed: number, theme: ForestTheme) {
  if (layer > 0 && "/\\|!".includes(original)) return woodInks[theme][color];
  // Coherent sunlit patches avoid rainbow-colored individual character noise.
  if (layer > 1 && noise(Math.floor(col / 7), Math.floor(row / 4), seed) > 0.78) return warmLeaves[theme][color];
  return narrativeForestInks[theme][layer][color];
}


// Aerial materials follow the same botanical palette, with distinct water and
// exposed silt. Layer membership comes from the existing catchment geometry.
export const narrativeRiverInks: Record<ForestTheme, readonly (readonly string[])[]> = {
  dark: [
    ["#283e2e", "#3b5036", "#526940", "#70814c"],
    ["#6e5b3d", "#8a744d", "#aa9365", "#c9b184"],
    ["#315961", "#487a80", "#6e9e9e", "#a5c4b5"],
    narrativeForestInks.dark[3],
  ],
  light: [
    ["#a3b796", "#8ba57d", "#708e62", "#54774f"],
    ["#b6a27d", "#a58c61", "#8e7149", "#795a35"],
    ["#5e9195", "#487e85", "#326974", "#235462"],
    narrativeForestInks.light[3],
  ],
};

export function narrativeRiverGlyph(original: string, col: number, row: number, layer: number, seed: number) {
  // Keep the sparse directional current and an uninterrupted flowing channel.
  if (layer === 2) {
    if (original === "^") return original;
    if (row % 5 !== 1) return original;
    const words = narrativeWords.river;
    const block = Math.floor(col / 20);
    const word = words[Math.floor(noise(block, row, seed) * words.length)];
    return (word + "~~~~~~~~~~~~~~~~~~~~")[col % 20];
  }
  const words = layer === 1 ? narrativeWords.earth : narrativeWords.forest;
  const block = Math.floor(col / 16), slot = col % 16;
  const word = words[Math.floor(noise(block, row + layer * 71, seed) * words.length)];
  if (slot < word.length && noise(block, row + 37, seed) > (layer === 1 ? 0.65 : 0.22)) return word[slot];
  const marks = layer === 1 ? ".,:;-" : "*oO%+:;,.";
  return marks[Math.floor(noise(col * 3, row * 7 + layer, seed) * marks.length)];
}

export function narrativeRiverInk(col: number, row: number, layer: number, color: number, seed: number, theme: ForestTheme) {
  if (layer === 3 && noise(Math.floor(col / 7), Math.floor(row / 4), seed) > 0.78) return warmLeaves[theme][color];
  return narrativeRiverInks[theme][layer][color];
}
