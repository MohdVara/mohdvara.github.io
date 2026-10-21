export type ForestTheme = "light" | "dark";
export const forestConfig = Object.freeze({
  seed: 240916,
  columns: { mobile: 84, tablet: 128, desktop: 176 },
  maxDpr: 1.5,
  maxHeight: 1100,
  tracking: 0.82,
  leading: 0.78,
  fps: 25,
  wind: 1.65,
  speed: 0.6,
  parallax: 3,
  mist: 0.09,
  density: 0.9,
  treeDensity: 1,
  foregroundFronds: 3,
  opacity: 0.95,
  valleyDepth: 0.23,
  ridgeHeights: [0.15, 0.27, 0.41, 0.58],
  glyphs: " .,:;+o*#%@/\\|!~=^",
  mask: { left: 0.12, right: 0.86, bottomStart: 0.81 },
});
export function qualityFor(width: number) {
  return width < 600 ? "mobile" : width < 1100 ? "tablet" : "desktop";
}
export function bounded(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

// Stable page identities keep the terrain consistent through theme/size changes.
export const pageSceneSeeds = {
  engagements: 731029,
  mondays: 482173,
  pace: 916403,
  incident: 365819,
} as const;
