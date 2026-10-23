/** Shared word-aware allocator. Spaces retain source indices, including at wraps. */
export declare const normalizeText: (s: string) => string;
export declare const FONT: {
    readonly advance: number;
    readonly xHeight: number;
    readonly capHeight: number;
    readonly strokeEstimate: 0.07;
};
export interface TextCell {
    char: string;
    col: number;
    row: number;
    index: number;
    passageId: string;
    readingOrder: number;
}
export interface FlowOptions {
    id: string;
    source: string;
    cols: number;
    rows: number;
    enabled: boolean;
    valid: (col: number, row: number) => boolean;
    occupied?: (col: number, row: number) => boolean;
    preserveSource?: boolean;
    shapeRun?: (run: number[], row: number) => number[];
    preferCol?: number;
}
export declare function flowText(options: FlowOptions): {
    cells: TextCell[];
    report: {
        source: string;
        reconstructed: string;
        required: number;
        rendered: number;
        pass: boolean;
        overflow: boolean;
        hidden: boolean;
        unsupported: boolean;
    };
};
/** Explicit continuation through ordered masks, with one protected source sequence. */
export declare function flowContinuation(id: string, input: string, zones: {
    regionId: string;
    layout: Omit<FlowOptions, 'id' | 'source'>;
}[]): {
    cells: (TextCell & {
        region: string;
    })[];
    report: {
        source: string;
        reconstructed: string;
        required: number;
        rendered: number;
        pass: boolean;
        overflow: boolean;
        hidden: boolean;
        unsupported: boolean;
    };
};
