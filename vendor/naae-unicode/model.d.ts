import type { RenderStyle, PixelSettings, PixelRole, HybridDiagnostics } from './hybrid-model.js';
import type { CoverageSettings, CoverageData } from './coverage-model.js';
import type { RenderGlyph } from './svg.js';
import type { PassageReport } from './engine.js';
export type Mode = 'object' | 'landscape' | 'scene';
export type Preset = 'borneo' | 'valley' | 'coast' | 'night';
export type ProfileID = 'digital' | 'front' | 'back' | 'poster' | 'custom' | 'panel';
export interface OutputProfile {
    id: ProfileID;
    widthMm: number;
    heightMm: number;
    safeMarginMm: number;
    minCharacterMm: number;
    minStrokeMm: number;
    minSpacingMm: number;
    aspectRatio: number;
}
export interface Environment {
    mountains: number;
    forest: number;
    terrain: number;
    atmosphere: number;
    foreground: number;
    river: boolean;
}
export interface StudioConfig {
    rendererVersion: '0.2.0' | '0.3.0' | '0.4.0';
    mode: Mode;
    preset: Preset;
    seed: number;
    width: number;
    height: number;
    profile: OutputProfile;
    fontSize: number;
    tracking: number;
    lineHeight: number;
    density: number;
    contrast: number;
    narrativeRatio: number;
    narrativePriority: number;
    strategy: 'balanced' | 'narrative' | 'silhouette';
    maxTexture: number;
    palette: 'botanical' | 'monochrome';
    curve: number;
    transparent: boolean;
    pngWidth: number;
    renderStyle?: RenderStyle;
    pixel?: PixelSettings;
    canvasFit?: 'recompose';
    coverage?: CoverageSettings;
    environment: Environment;
    visible: Record<string, boolean>;
}
export interface Point {
    x: number;
    y: number;
}
export type Geometry = {
    kind: 'ridge';
    base: number;
    amplitude: number;
    frequency: number;
    phase: number;
    octaves: number;
} | {
    kind: 'forest';
    base: number;
    count: number;
    height: number;
    phase: number;
} | {
    kind: 'river';
    start: number;
    end: number;
    halfWidth: number;
    bend: number;
    phase: number;
} | {
    kind: 'atmosphere';
    bands: {
        cx: number;
        cy: number;
        rx: number;
        ry: number;
    }[];
} | {
    kind: 'vegetation';
    side: 'left' | 'right' | 'floor';
    complexity: number;
} | {
    kind: 'rocks';
    centers: Point[];
    radius: number;
} | {
    kind: 'cabin';
    center: Point;
    size: number;
} | {
    kind: 'pixelGrid';
    cols: number;
    rows: number;
    cells: number[];
    role: PixelRole;
} | {
    kind: 'legacy-object';
};
export interface SceneLayer {
    id: string;
    depth: number;
    regionId: string;
    geometry: Geometry;
    density: number;
    contrast: number;
    occlusion: 'opaque';
    narrativePriority: number;
}
export interface NarrativeRegion {
    id: string;
    title: string;
    feature: string;
    passage: string;
    continuation?: string[];
    visualImportance: number;
    narrativeImportance: number;
    minBudget: number;
    maxBudget: number;
}
export interface SceneGraph {
    id: string;
    title: string;
    mode: Mode;
    seed: number;
    rendererVersion: '0.2.0' | '0.3.0' | '0.4.0';
    world: {
        width: 1;
        height: 1;
    };
    camera: {
        x: 0;
        y: 0;
        zoom: 1;
    };
    layers: SceneLayer[];
    regions: NarrativeRegion[];
    detailLevel: number;
    simplifications: string[];
}
export interface RegionBudget {
    regionId: string;
    usable: number;
    narrativeCapacity: number;
    required: number;
    narrativeAllocated: number;
    textureBudget: number;
    actualTexture: number;
    unallocated: number;
    deficit: number;
    minBudget: number;
    maxBudget: number;
}
export interface DetailBudget {
    protectedWhitespace?: number;
    visibleUsage?: number;
    coverageTarget?: number;
    theoretical: number;
    usable: number;
    reservedNarrative: number;
    availableTexture: number;
    unallocated: number;
    actualNarrative: number;
    actualTexture: number;
    utilization: number;
    regions: RegionBudget[];
    fontSize: number;
    advance: number;
    leading: number;
    scaleMm: number;
    glyphHeightMm: number;
    spacingMm: number;
    strokeEstimateMm: number;
    cols: number;
    rows: number;
    marginX: number;
    marginY: number;
    drawWidth: number;
    drawHeight: number;
    detailLevel: number;
    decisions: string[];
}
export interface Attempt {
    iteration: number;
    integrity: boolean;
    deficit: number;
    texture: number;
    geometryDetail: number;
    selectionReason: string;
}
export interface Composition {
    hybrid?: HybridDiagnostics;
    coverage?: CoverageData;
    config: StudioConfig;
    graph: SceneGraph;
    glyphs: RenderGlyph[];
    budget: DetailBudget;
    passages: Record<string, PassageReport>;
    warnings: string[];
    integrity: boolean;
    collisionCount: number;
    outOfBounds: number;
    attempts: Attempt[];
    feasibility: {
        digitalChecksPassed: boolean;
        physicalPrintTested: false;
        warnings: string[];
        alternatives: string[];
    };
    metrics: {
        byDepth: Record<string, number>;
        occupied: number;
        leftRightBalance: number;
        minimumSolidInkContrast: number;
        visualJudgement: string;
    };
}
/** Reference guidance is interfaces only in v0.2; no reference image is rendered. */
export interface ReferenceSource {
    type: 'photo' | 'illustration' | 'sketch' | 'mask' | 'height-map' | 'procedural';
    width: number;
    height: number;
    aspectRatio: number;
    segmentation?: {
        regionId: string;
        mask: number[];
    }[];
    depth?: number[];
    semanticRegions?: NarrativeRegion[];
}
export interface CompositionAnalysis {
    silhouettes: Point[][];
    relationships: {
        from: string;
        to: string;
        relation: string;
    }[];
    contrast: number[];
    focalPoints: Point[];
    negativeSpace: Point[][];
    candidateRegions: NarrativeRegion[];
}
export interface ReferenceAnalyzer {
    analyze(source: ReferenceSource): CompositionAnalysis;
}
export interface GlyphReconstruction {
    reconstruct(analysis: CompositionAnalysis, config: StudioConfig): Composition;
}
