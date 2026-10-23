import { validateRequest } from './contract.js';
import { renderUnicode } from './render.js';
export function requestForPME(input) {
    if (input.schema !== 'NAAE/PME/1')
        throw Error('Unsupported PME adapter schema.');
    const p = input.textPack;
    return validateRequest({ schema: 'NAAE/render-request/1', geometry: input.geometry, textPack: p, mainText: input.mainText, hiddenWords: input.hiddenWords ?? [], settings: { locale: p.locale, writingMode: 'horizontal-tb', strategy: 'words', fontSize: 9, density: .96, tracking: 0, lineHeight: p.metrics.lineHeight, columnSpacing: 1.05, phraseFrequency: .2, seed: input.geometry.seed, fontId: p.preferredFont, regionPriority: Object.keys(input.mainText), description: 'Narrative artwork.', decorative: false, maxRuns: 6000, ...input.settings } });
}
export const renderForPME = (input) => renderUnicode(requestForPME(input));
