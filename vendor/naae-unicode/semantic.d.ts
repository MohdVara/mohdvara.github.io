import type { PixelRole } from './hybrid-model.js';
import type { Composition } from './model.js';
import type { Material, CoverageSettings } from './coverage-model.js';
export declare function smoothNoise(x: number, y: number, seed: number): number;
export interface SemanticSample {
    hybridRole?: PixelRole;
    tileX?: number;
    tileY?: number;
    region: string;
    layer: string;
    material: Material;
    depth: number;
    orientation: 'horizontal' | 'vertical' | 'rising' | 'falling' | 'organic';
    structure: number;
    light: number;
    u: number;
    v: number;
    wordDomain: string;
}
export declare function sampleSemantic(s: Composition, col: number, row: number, settings: CoverageSettings): SemanticSample;
export declare function textureField(sample: SemanticSample, col: number, row: number, seed: number, s: CoverageSettings): number;
