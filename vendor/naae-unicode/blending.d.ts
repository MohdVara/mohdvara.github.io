import type { RenderGlyph } from './svg.js';
/** Share local ink with the feature itself. Highlighting remains a view-only operation. */
export declare function blendNarratives<T extends RenderGlyph>(glyphs: T[]): T[];
