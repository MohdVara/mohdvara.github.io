import type { CoverageSettings } from './coverage-model.js';
import type { SemanticSample } from './semantic.js';
export declare const backgroundPresets: readonly [{
    readonly name: "Forest dark · studio";
    readonly color: "#101713";
}, {
    readonly name: "Black";
    readonly color: "#171717";
}, {
    readonly name: "White";
    readonly color: "#ffffff";
}, {
    readonly name: "Cream / natural";
    readonly color: "#e9dfc8";
}, {
    readonly name: "Warm paper";
    readonly color: "#f5f1e7";
}, {
    readonly name: "Heather grey";
    readonly color: "#a7a7a4";
}, {
    readonly name: "Charcoal";
    readonly color: "#414447";
}, {
    readonly name: "Navy";
    readonly color: "#17263f";
}, {
    readonly name: "Forest green";
    readonly color: "#263f32";
}, {
    readonly name: "Burgundy";
    readonly color: "#612b3a";
}, {
    readonly name: "Royal blue";
    readonly color: "#244b91";
}, {
    readonly name: "Red";
    readonly color: "#a42f38";
}];
export declare const artworkGround: (s?: CoverageSettings) => string;
export declare const isLightGround: (ground: string) => boolean;
/** Coherent hue variation follows material and light fields, never per-character random RGB. */
export declare function materialInk(sample: SemanticSample, field: number, s: CoverageSettings, monochrome: boolean): string;
/** Contrast on arbitrary backgrounds; selects the attainable polarity, including midtones. */
export declare function contrastInk(original: string, ground: string, goal: number): {
    ink: string;
    contrast: number;
    limited: boolean;
};
