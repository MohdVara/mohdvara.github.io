import type { Geometry, SceneGraph, StudioConfig, SceneLayer } from './model.js';
export declare const clamp: (v: number, a?: number, b?: number) => number;
export declare function ridge(g: Extract<Geometry, {
    kind: 'ridge';
}>, x: number): number;
export declare function riverCenter(g: Extract<Geometry, {
    kind: 'river';
}>, y: number): number;
export declare function contains(g: Geometry, x: number, y: number): boolean;
export declare function ownerAt(graph: SceneGraph, x: number, y: number): SceneLayer | null;
export declare function buildEnvironment(c: StudioConfig, detail: number, iteration?: number): SceneGraph;
export declare function visibleOwner(graph: SceneGraph, c: StudioConfig, x: number, y: number): SceneLayer | null;
export declare function narrativeMask(region: string, x: number, y: number, graph: SceneGraph, c: StudioConfig): boolean;
