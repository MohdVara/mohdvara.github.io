import type { Composition, StudioConfig } from './model.js';
import type { HybridDiagnostics } from './hybrid-model.js';
import type { SemanticSample } from './semantic.js';
export declare function hybridSemantic(scene: Composition, u: number, v: number): SemanticSample;
export declare function createHybridRenderer(c: StudioConfig): {
    tone: (sample: SemanticSample) => {
        ink: string;
        contrast: number;
        clamped: boolean;
    };
    glyph: (sample: SemanticSample, field: number, target: number) => {
        char: string;
        constrained: boolean;
    };
};
export declare function diagnoseHybrid(s: Composition): HybridDiagnostics;
