export interface FontAsset {
    id: string;
    file: string;
    sha256: string;
    bytes: number;
    license: string;
    coverage: [number, number][];
    family?: string;
}
export interface LoadedFont {
    id: string;
    family: string;
    data: string;
    sha256: string;
    license: string;
    coverage: [number, number][];
}
export declare function fontCatalog(): Promise<FontAsset[]>;
export declare function loadFont(id: string): Promise<LoadedFont>;
export declare function assertFontCoverage(texts: string[], fonts: LoadedFont[]): void;
