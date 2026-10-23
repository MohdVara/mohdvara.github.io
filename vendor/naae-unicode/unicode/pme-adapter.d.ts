import { type ArtworkGeometry, type LocaleTextPack, type UnicodeSettings, type SemanticToken } from './contract.js';
/** Browser adapter: PME supplies data, not React/i18next objects or HTML. */
export interface PMEArtworkInput {
    schema: 'NAAE/PME/1';
    geometry: ArtworkGeometry;
    textPack: LocaleTextPack;
    mainText: Record<string, string>;
    settings?: Partial<UnicodeSettings>;
    hiddenWords?: SemanticToken[];
}
export declare function requestForPME(input: PMEArtworkInput): import("./contract.js").ArtworkRenderRequest;
export declare const renderForPME: (input: PMEArtworkInput) => Promise<{
    artwork: import("./contract.js").UnicodeArtwork;
    fonts: import("./fonts.js").LoadedFont[];
    performance: {
        layoutMs: number;
        measurements: number;
        cacheHits: number;
        placementCacheHit: boolean;
    };
}>;
