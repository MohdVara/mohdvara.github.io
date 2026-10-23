/** Opaque ink values for a dark proof ground. Depth comes from hue and density, not vanishing opacity. */
export const PROOF_GROUND = '#101713';
const palettes = {
    forestFar: ['#70a99a', '#8bbba3', '#aacbb0'], forestNear: ['#86ae57', '#b3cb74', '#d1dc98'], forestWood: ['#b1a06e', '#c4b384', '#d8c89b'],
    sky: ['#8cb9b1', '#abd0c4', '#d3dec7'], mountains: ['#70aca8', '#95c2b1', '#bcd5bc'],
    forest: ['#72a568', '#9cbe75', '#c7d792'], river: ['#87c3bd', '#afd8cc', '#d7e5cb'], earth: ['#b0a65f', '#cebc77', '#e5d29c'],
    backgroundWood: ['#79afa6', '#96beb0', '#bad4ba'],
    canopy: ['#73a662', '#9cc075', '#c8d993'], trunk: ['#b69b62', '#d0b67d', '#e3ce9f'], roots: ['#a89d62', '#c3b575', '#ddca93'], water: ['#88c4bb', '#b3d3c1', '#d4e4c7']
};
const rgb = (hex) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
export function luminance(hex) { const [r, g, b] = rgb(hex).map(v => { const s = v / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; }
export function contrastRatio(ink, ground = PROOF_GROUND) { const a = luminance(ink), b = luminance(ground); return (Math.max(a, b) + .05) / (Math.min(a, b) + .05); }
export function featureInk(region, intensity, contrast, monochrome = false) {
    const bank = palettes[region] ?? palettes.forest;
    const color = monochrome ? '#d8dec0' : bank[Math.max(0, Math.min(2, Math.floor(intensity * 3)))];
    const factor = .84 + contrast * .20;
    let channels = rgb(color).map(v => Math.min(255, Math.round(v * factor)));
    const hex = () => '#' + channels.map(v => v.toString(16).padStart(2, '0')).join('');
    // A digital proof heuristic only: real fabric/ink contrast still needs a physical proof.
    while (contrastRatio(hex()) < 4.5 && channels.some(v => v < 255))
        channels = channels.map(v => Math.min(255, v + 2));
    return hex();
}
