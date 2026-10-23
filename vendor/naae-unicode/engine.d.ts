export { escapeXml } from './svg.js';
/** NAAE: pure, deterministic, glyph-only scene construction. No DOM or raster inputs. */
export declare const REGIONS: readonly ["canopy", "trunk", "roots"];
export type Region = typeof REGIONS[number];
export type Layer = Region | 'mountains' | 'forest' | 'water';
export declare const narratives: Record<Region, string>;
export declare const titles: Record<Region, string>;
export interface Config {
    narrativeGuards?: Partial<Record<Region, boolean[]>>;
    internalGrid?: boolean;
    seed: number;
    width: number;
    height: number;
    fontSize: number;
    tracking: number;
    lineHeight?: number;
    density: number;
    narrativeRatio: number;
    contrast: number;
    detail: number;
    printWidthMm: number;
    minCharacterMm: number;
    visible: Record<Layer, boolean>;
}
export declare const defaults: Config;
export interface Glyph {
    char: string;
    col: number;
    row: number;
    x: number;
    y: number;
    layer: Layer;
    kind: 'narrative' | 'texture';
    ink: string;
    index?: number;
}
export interface PassageReport {
    source: string;
    reconstructed: string;
    required: number;
    rendered: number;
    pass: boolean;
    overflow: boolean;
    hidden: boolean;
    unsupported: boolean;
}
export interface Scene {
    config: Config;
    cols: number;
    rows: number;
    advance: number;
    leading: number;
    glyphs: Glyph[];
    report: ReturnType<typeof diagnose>;
}
export declare function noise(x: number, y: number, seed: number): number;
export declare const normalize: (s: string) => string;
export declare function backgroundTreeAt(x: number, y: number, seed: number): {
    part: 'crown' | 'wood';
    tree: number;
    shade: number;
    understory?: boolean;
} | null;
/** Scene graph masks in normalized art coordinates. Geometry never enters the SVG. */
export declare function regionAt(x: number, y: number, seed: number): Layer | null;
export declare function generate(config?: Config, passages?: Record<Region, string>): Scene;
export declare function collisions(glyphs: Glyph[]): number;
declare function diagnose(c: Config, glyphs: Glyph[], passages: Record<Region, PassageReport>, cols: number, rows: number): {
    version: string;
    seed: number;
    normalization: string;
    passages: Record<"canopy" | "trunk" | "roots", PassageReport>;
    glyphCount: number;
    collisionCount: number;
    outOfBounds: number;
    fontSize: number;
    estimatedCapHeightMm: number;
    estimatedLowercaseHeightMm: number;
    printWidthMm: number;
    printHeightMm: number;
    density: number;
    histogram: {
        [k: string]: number;
    };
    warnings: string[];
    integrity: boolean;
    exportReady: boolean;
    physicalPrintTested: boolean;
    visualAssessment: string;
    collisionMethod: string;
};
export declare function toSVG(scene: Scene, fontBase64: string, highlight?: Region | null): string;
export declare function toASCII(scene: Scene): string;
