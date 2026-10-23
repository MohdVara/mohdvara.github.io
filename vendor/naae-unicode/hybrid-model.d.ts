import type { Material } from './coverage-model.js';
export type RenderStyle = 'organic' | 'pixelHybrid';
export type PixelRole = 'sky' | 'cloud' | 'mountainFar' | 'mountainNear' | 'forestFar' | 'forestNear' | 'wood' | 'water' | 'waterLight' | 'ground' | 'foreground' | 'highlight';
export interface PixelSettings {
    refinement?: number;
    tileEmphasis: number;
    shapeSimplification: number;
    steppedContours: number;
    palettePreset: 'borneoDusk' | 'monsoon' | 'sunlit';
    paletteDepth: number;
    layerSeparation: number;
    macroBalance: number;
    glyphSets: Record<Material, string>;
}
export declare const pixelDefaults: PixelSettings;
export declare const pixelNarratives: Record<string, string>;
export declare const pixelRoles: PixelRole[];
export interface HybridDiagnostics {
    mode: 'pixelHybrid';
    palettePreset: string;
    paletteLimit: number;
    actualInkCount: number;
    paletteUsage: {
        ink: string;
        glyphs: number;
        roles: string[];
    }[];
    roleOccupancy: Record<string, number>;
    grid: {
        columns: number;
        rows: number;
    };
    contourEdges: number;
    contourSimplification: number;
    tileUniformity: number;
    sameLayerNeighborInkAgreement: number;
    layerIntensity: Record<string, {
        glyphs: number;
        average: number;
    }>;
    adjacentLayerSeparation: number;
    macroReadabilityNote: string;
    glyphCount: number;
    narrativeGlyphs: number;
    textureGlyphs: number;
}
/** Coordinate geometry controls without changing palette, background or coverage. */
export declare function refinePixel(s: PixelSettings, value: number): PixelSettings;
export declare const pixelDetailGain: (s: PixelSettings) => number;
export declare function validatePixel(s: PixelSettings | undefined): void;
