import type { DetailBudget, NarrativeRegion } from './model.js';
import type { SceneGraph, StudioConfig, Geometry } from './model.js';
export declare function buildPixelEnvironment(c: StudioConfig, detail: number): SceneGraph;
export declare function pixelCell(g: Extract<Geometry, {
    kind: 'pixelGrid';
}>, x: number, y: number): number;
/** Pixel contours sample the existing tree, preserving its authored anatomy and branch hierarchy. */
export declare function buildPixelObjectEnvironment(c: StudioConfig, b: DetailBudget, regions: NarrativeRegion[]): SceneGraph;
