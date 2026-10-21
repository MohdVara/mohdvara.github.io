import sceneSource from "./scene.ts?raw";
import animationSource from "./animation.ts?raw";
import configSource from "./config.ts?raw";

// Explicit public UI sources only. No filesystem scanning, runtime fetching,
// environment files or unrelated workspace projects enter the artwork.
export const forestCodeLines = [sceneSource, animationSource, configSource]
  .flatMap(source => source.split(/\r?\n/))
  .map(line => line.trim())
  .filter(line => line.length >= 24 && line.length <= 140
    && /^(?:export (?:function|const)|const |let |return |if \(|for \(|[a-zA-Z]+\.)/.test(line)
    && /^[\x20-\x7e]+$/.test(line));

// Short actual expressions fit inside crowns without reading as a page of text.
export const forestCodeFragments = [...new Set(forestCodeLines.flatMap(line =>
  line.match(/\b(?:const|let|return)\s+[A-Za-z_$][\w$]*|\b[A-Za-z_$][\w$]*\.[A-Za-z_$][\w$]*(?:\([^();]{0,24}\)|\[[^\]]{1,16}\])?/g) || []))];

// Read consecutive source characters across each row, rather than sampling
// unrelated letters. Existing glyph occupancy still supplies the forest shape.
export function sourceTextureGlyph(glyph: string, col: number, row: number, layer: number, seed: number, aerial: boolean, codeCanopy = false, color = 0, theme: "light" | "dark" = "dark") {
  if (!glyph || glyph === " " || (aerial && layer !== 0 && layer !== 3)
    || (!aerial && "/\\|!".includes(glyph))) return glyph;
  if (codeCanopy && !aerial) {
    // Keep distant ridge silhouettes and the brightest crown rims. Code fills
    // the remaining canopy, while the original grid still defines every tree.
    if (layer === 0 || color === 3 || (theme === "light" && color === 2)) return glyph;
    const fragment = forestCodeFragments[(row + layer * 11 + (seed >>> 0)) % forestCodeFragments.length];
    return (fragment + " ")[col % (fragment.length + 1)];
  }
  // Distant ridges and bright crown edges carry the silhouette. Keep their
  // original tonal marks; embed code sparingly inside shaded near-canopy rows.
  if (!aerial && (layer < 2 || !"#%@".includes(glyph) || row % 3 !== 1)) return glyph;
  const line = forestCodeLines[(row + layer * 11 + (seed >>> 0)) % forestCodeLines.length];
  return line[col % line.length];
}
