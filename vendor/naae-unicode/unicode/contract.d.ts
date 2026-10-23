/** NAAE ↔ PME contract. No UI framework or translation service dependency. */
export declare const UNICODE_VERSION: "NAAE/Unicode-1";
export declare const locales: readonly ["en", "ms", "ar", "ja", "zh-Hans", "es", "fr", "de", "pt-BR", "hi", "ta"];
export type SupportedLocale = typeof locales[number];
export type WritingMode = 'horizontal-tb' | 'vertical-rl';
export type TextureStrategy = 'characters' | 'words' | 'phrases';
export interface SemanticToken {
    id: string;
    text: string;
    role: 'texture' | 'highlight' | 'semantic';
    weight: number;
    regionIds?: string[];
    materials?: string[];
}
export interface LocaleTextPack {
    schema: 'NAAE/text-pack/1';
    locale: SupportedLocale;
    script: 'Latin' | 'Arabic' | 'Japanese' | 'Han' | 'Devanagari' | 'Tamil';
    direction: 'ltr' | 'rtl';
    writingModes: WritingMode[];
    preferredFont: string;
    fallbackFonts: string[];
    strategies: TextureStrategy[];
    characters: string[];
    densityMarks: string[];
    tokens: SemanticToken[];
    densityPreference: number;
    metrics: {
        lineHeight: number;
        trackingSafe: boolean;
    };
    sourceRevision: string;
    reviewStatus: 'machine-authored-unreviewed' | 'user-provided';
}
export interface GeometryCell {
    x: number;
    y: number;
    width: number;
    height: number;
    region: string;
    material: string;
    depth: number;
    tone: number;
    ink: string;
}
export interface ArtworkGeometry {
    schema: 'NAAE/geometry/1';
    id: string;
    width: number;
    height: number;
    seed: number;
    background: string;
    transparent: boolean;
    cells: GeometryCell[];
    revision: string;
}
export interface UnicodeSettings {
    locale: SupportedLocale;
    writingMode: WritingMode;
    strategy: TextureStrategy;
    fontSize: number;
    density: number;
    tracking: number;
    lineHeight: number;
    columnSpacing?: number;
    phraseFrequency: number;
    seed: number;
    fontId: string;
    regionPriority: string[];
    description: string;
    decorative: boolean;
    maxRuns: number;
}
export interface ArtworkRenderRequest {
    schema: 'NAAE/render-request/1';
    geometry: ArtworkGeometry;
    textPack: LocaleTextPack;
    settings: UnicodeSettings;
    mainText: Record<string, string>;
    hiddenWords: SemanticToken[];
}
export interface RunMeasurement {
    advance: number;
    left: number;
    top: number;
    width: number;
    height: number;
    inkDensity: number;
    ascent: number;
    descent: number;
}
export interface TextRun {
    id: string;
    text: string;
    region: string;
    material: string;
    kind: 'semantic' | 'texture' | 'highlight';
    x: number;
    y: number;
    box: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    ink: string;
    measurement: RunMeasurement;
    sourceRange?: [number, number];
}
export interface UnicodeArtwork {
    schema: typeof UNICODE_VERSION;
    request: ArtworkRenderRequest;
    runs: TextRun[];
    fontRevisions: Record<string, string>;
    report: {
        integrity: boolean;
        passages: Record<string, {
            source: string;
            reconstructed: string;
            pass: boolean;
        }>;
        runs: number;
        placedAreaFraction: number;
        meanInkDensity: number;
        estimatedInkAreaFraction: number;
        unplacedTokens: string[];
        warnings: string[];
        measurementBackend: string;
        clipped: number;
    };
    environment: {
        userAgent: string;
        dpr: number;
    };
}
export declare function unicodeText(value: unknown, max?: number): string;
export declare const graphemes: (text: string, locale?: string) => string[];
export declare const wordSegments: (text: string, locale: string) => string[];
export declare function validatePack(value: unknown): LocaleTextPack;
export declare function validateGeometry(value: unknown): ArtworkGeometry;
export declare function validateRequest(value: unknown): ArtworkRenderRequest;
