import type { StudioConfig } from './model.js';
export type CoverageProfile = 'sparse' | 'balanced' | 'dense' | 'continuous';
export type Material = 'atmosphere' | 'cloud' | 'rock' | 'leaves' | 'bark' | 'water' | 'soil' | 'shadow';
export type CellState = 'narrative' | 'texture' | 'eligible-empty' | 'narrative-space' | 'exclusion' | 'outside' | 'safe-margin' | 'unplaceable';
export interface CoverageSettings {
    profile: CoverageProfile;
    target: number;
    intensity: number;
    backgroundColor?: string;
    colorVariation?: number;
    textureMode: 'symbols' | 'mixed' | 'words';
    wordDensity: number;
    atmosphericDetail: number;
    backgroundDetail: number;
    foregroundDetail: number;
    textureComplexity: number;
    minWeight: number;
    maxWeight: number;
    depthContrast: number;
    narrativeContrast: number;
    minimumContrast: number;
    materialIntensity: Record<Material, number>;
    intent: 'digital' | 'print';
    fabricColor: string;
    process: 'dtg' | 'dtf' | 'screen';
    detailLoss: number;
    exclusions: {
        x: number;
        y: number;
        width: number;
        height: number;
        reason: string;
    }[];
}
export interface CoverageCell {
    col: number;
    row: number;
    x: number;
    y: number;
    state: CellState;
    region: string;
    layer: string;
    material: Material;
    depth: number;
    priority: number;
    targetIntensity: number;
    contrast: number;
    visualIntensity: number;
    inkCoverage: number;
    textureCategory: string;
    wordDomain: string;
    physicalHeightMm: number;
    printVisible: boolean;
    glyphIndex?: number;
    shapedRun?: {
        script: string;
        direction: 'ltr' | 'rtl' | 'ttb';
        sourceRange: [number, number];
        advance: number;
    };
}
export interface CoverageStats {
    eligible: number;
    occupied: number;
    coverage: number;
    averageIntensity: number;
    averageInkCoverage: number;
    structural: number;
    invisibleAssigned: number;
    protectedWhitespace: number;
}
export interface Gap {
    size: number;
    region: string;
    material: Material;
    classification: string;
    minCol: number;
    maxCol: number;
    minRow: number;
    maxRow: number;
}
export interface CoverageReport extends CoverageStats {
    profile: CoverageProfile;
    target: number;
    feasibleMaximum: number;
    targetSatisfied: boolean;
    textureBudget: number;
    states: Record<CellState, number>;
    byRegion: Record<string, CoverageStats>;
    byLayer: Record<string, CoverageStats>;
    byMaterial: Record<string, CoverageStats>;
    byProfile: Record<string, CoverageStats>;
    intensityDistribution: {
        low: number;
        medium: number;
        high: number;
    };
    requestedIntensity: number;
    clampedVisibility: number;
    actualTexture: number;
    narrativeCharacters: number;
    visibleNarrative: number;
    gapsBefore: Gap[];
    gapsAfter: Gap[];
    largestUnresolvedGap: number;
    refinement: {
        pass: number;
        filled: number;
        note: string;
    }[];
    warnings: string[];
    quality: {
        adjacentIntensityDifference: number;
        longIdenticalRuns: number;
        uniformIntensityFraction: number;
        minimumMaterialSeparation: number;
        interpretation: string;
    };
    print: {
        intent: string;
        process: string;
        fabricColor: string;
        physicalPrintTested: false;
        lowContrastGlyphs: number;
        fineDetailRisk: number;
        estimatedVisibleFraction: number;
        warnings: string[];
    };
    timingsExcluded: true;
}
export interface CoverageData {
    cells: CoverageCell[];
    report: CoverageReport;
}
export declare const coverageTargets: Record<CoverageProfile, number>;
export declare const coverageDefaults: CoverageSettings;
export declare function validateCoverage(c: StudioConfig): void;
