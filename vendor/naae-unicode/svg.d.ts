export declare const escapeXml: (s: string) => string;
export interface RenderGlyph {
    tileRole?: string;
    tileX?: number;
    tileY?: number;
    char: string;
    x: number;
    y: number;
    col: number;
    row: number;
    layer: string;
    region?: string;
    kind: 'narrative' | 'texture';
    ink: string;
    index?: number;
    passageId?: string;
    readingOrder?: number;
    fontSize?: number;
    material?: string;
    depth?: number;
    visualIntensity?: number;
    inkCoverage?: number;
    targetIntensity?: number;
    contrast?: number;
    cellState?: string;
    textureWord?: {
        id: string;
        text: string;
        index: number;
        domain: string;
    };
}
export interface RenderInput {
    id: string;
    title: string;
    description: string;
    width: number;
    height: number;
    physicalWidth: number;
    physicalHeight: number;
    fontSize: number;
    glyphs: RenderGlyph[];
    metadata: unknown;
    transparent?: boolean;
    background?: string;
}
export declare function renderSVG(scene: RenderInput, fontBase64: string, highlight?: string | null): string;
export declare function renderASCII(cols: number, rows: number, glyphs: RenderGlyph[]): string;
