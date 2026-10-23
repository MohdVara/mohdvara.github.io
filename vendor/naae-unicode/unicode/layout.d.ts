import { type ArtworkRenderRequest, type UnicodeArtwork } from './contract.js';
import type { BrowserTextMeasurer } from './measure.js';
/** Bounded field lookup and spatial occupancy. Grid spacing never estimates text width. */
export declare function layoutText(request: ArtworkRenderRequest, measure: BrowserTextMeasurer): UnicodeArtwork;
