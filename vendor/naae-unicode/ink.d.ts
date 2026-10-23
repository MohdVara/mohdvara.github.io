/** Opaque ink values for a dark proof ground. Depth comes from hue and density, not vanishing opacity. */
export declare const PROOF_GROUND = "#101713";
export declare function luminance(hex: string): number;
export declare function contrastRatio(ink: string, ground?: string): number;
export declare function featureInk(region: string, intensity: number, contrast: number, monochrome?: boolean): string;
