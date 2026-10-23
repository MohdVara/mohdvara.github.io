import { type UnicodeArtwork, type ArtworkRenderRequest } from './contract.js';
import { type LoadedFont } from './fonts.js';
export declare function renderUnicode(input: ArtworkRenderRequest): Promise<{
    artwork: UnicodeArtwork;
    fonts: LoadedFont[];
    performance: {
        layoutMs: number;
        measurements: number;
        cacheHits: number;
        placementCacheHit: boolean;
    };
}>;
export declare function unicodeSVG(art: UnicodeArtwork, fonts: LoadedFont[]): string;
/** Structured text keeps logical source order; proportional runs have no fixed-cell text equivalent. */
export declare function unicodeRunExport(art: UnicodeArtwork): {
    schema: string;
    warning: string;
    locale: "en" | "ms" | "ar" | "ja" | "zh-Hans" | "es" | "fr" | "de" | "pt-BR" | "hi" | "ta";
    writingMode: import("./contract.js").WritingMode;
    runs: import("./contract.js").TextRun[];
    fontRevisions: Record<string, string>;
    passages: Record<string, {
        source: string;
        reconstructed: string;
        pass: boolean;
    }>;
};
export declare function serializeUnicode(art: UnicodeArtwork): {
    schema: "NAAE/Unicode-1";
    request: ArtworkRenderRequest;
    fontRevisions: Record<string, string>;
};
export declare function restoreUnicode(value: unknown): Promise<{
    artwork: UnicodeArtwork;
    fonts: LoadedFont[];
    performance: {
        layoutMs: number;
        measurements: number;
        cacheHits: number;
        placementCacheHit: boolean;
    };
}>;
export declare function unicodePNG(art: UnicodeArtwork, fonts: LoadedFont[], width?: number): Promise<Blob>;
