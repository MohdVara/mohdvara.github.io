import type { StudioConfig, DetailBudget } from './model.js';
/** Match the physical aspect to the chosen pixel canvas so its usable area is recomposed. */
export declare function resizeCanvas(config: StudioConfig, width: number, height: number): StudioConfig;
/** A square focal grid keeps the main tree upright; extra canvas becomes environment. */
export declare function objectFrame(b: DetailBudget, fit: boolean): {
    col: number;
    row: number;
    width: number;
    height: number;
};
