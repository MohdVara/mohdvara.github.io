import type { RunMeasurement, UnicodeSettings, LocaleTextPack } from './contract.js';
import type { LoadedFont } from './fonts.js';
export declare class BrowserTextMeasurer {
    readonly fonts: LoadedFont[];
    readonly settings: UnicodeSettings;
    readonly pack: LocaleTextPack;
    readonly family: string;
    readonly backend = "browser-native Canvas shaping + SVG vertical layout; rendered-alpha calibration";
    private calibrated;
    private canvas;
    private cache;
    hits: number;
    misses: number;
    constructor(fonts: LoadedFont[], settings: UnicodeSettings, pack: LocaleTextPack);
    calibrateVertical(texts: string[]): Promise<void>;
    measure(text: string): RunMeasurement;
}
