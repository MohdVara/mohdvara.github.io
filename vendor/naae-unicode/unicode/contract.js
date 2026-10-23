/** NAAE ↔ PME contract. No UI framework or translation service dependency. */
export const UNICODE_VERSION = 'NAAE/Unicode-1';
export const locales = ['en', 'ms', 'ar', 'ja', 'zh-Hans', 'es', 'fr', 'de', 'pt-BR', 'hi', 'ta'];
export function unicodeText(value, max = 12000) {
    if (typeof value !== 'string' || value.length > max)
        throw Error('Text must be a bounded Unicode string.');
    for (let i = 0; i < value.length; i++) {
        const n = value.charCodeAt(i);
        if (n >= 0xd800 && n <= 0xdbff) {
            const next = value.charCodeAt(++i);
            if (!(next >= 0xdc00 && next <= 0xdfff))
                throw Error('Unpaired Unicode surrogate.');
        }
        else if (n >= 0xdc00 && n <= 0xdfff)
            throw Error('Unpaired Unicode surrogate.');
    }
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value))
        throw Error('Unsupported control character.');
    return value.normalize('NFC');
}
export const graphemes = (text, locale = 'en') => Array.from(new Intl.Segmenter(locale, { granularity: 'grapheme' }).segment(unicodeText(text)), s => s.segment);
export const wordSegments = (text, locale) => Array.from(new Intl.Segmenter(locale, { granularity: 'word' }).segment(unicodeText(text)), s => s.segment);
const num = (v, min, max) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
export function validatePack(value) {
    const p = value;
    if (!p || p.schema !== 'NAAE/text-pack/1' || !locales.includes(p.locale))
        throw Error('Unsupported or missing language pack.');
    const script = p.locale === 'ar' ? 'Arabic' : p.locale === 'hi' ? 'Devanagari' : p.locale === 'ta' ? 'Tamil' : p.locale === 'ja' ? 'Japanese' : p.locale === 'zh-Hans' ? 'Han' : 'Latin';
    if (p.script !== script || p.direction !== (p.locale === 'ar' ? 'rtl' : 'ltr') || !Array.isArray(p.writingModes) || !p.writingModes.includes('horizontal-tb') || p.writingModes.some(m => !['horizontal-tb', 'vertical-rl'].includes(m) || m === 'vertical-rl' && !['ja', 'zh-Hans'].includes(p.locale)))
        throw Error('Invalid language script, direction or writing mode.');
    if (!Array.isArray(p.tokens) || p.tokens.length > 256 || !p.tokens.length || !Array.isArray(p.characters) || p.characters.length > 128 || !Array.isArray(p.strategies) || !p.strategies.length || p.strategies.some(s => !['characters', 'words', 'phrases'].includes(s)) || (['ar', 'hi', 'ta'].includes(p.locale) && p.strategies.includes('characters')))
        throw Error('Invalid script texture strategy.');
    const ids = new Set();
    for (const t of p.tokens) {
        if (!t || typeof t.id !== 'string' || !t.id || t.id.length > 100 || ids.has(t.id) || !['texture', 'semantic', 'highlight'].includes(t.role) || !num(t.weight, .01, 100) || !unicodeText(t.text, 300).trim() || t.regionIds && (!Array.isArray(t.regionIds) || t.regionIds.length > 24 || t.regionIds.some(r => typeof r !== 'string' || r.length > 80)))
            throw Error('Invalid semantic token.');
        if (t.materials && (!Array.isArray(t.materials) || t.materials.length > 16 || t.materials.some(m => typeof m !== 'string' || m.length > 60)))
            throw Error('Invalid token material constraints.');
        ids.add(t.id);
    }
    for (const ch of p.characters)
        if (graphemes(ch, p.locale).length !== 1 || /[\p{Script=Arabic}\p{Script=Devanagari}\p{Script=Tamil}]/u.test(ch))
            throw Error('Character texture requires safe complete graphemes; complex-script text belongs in word/phrase vocabulary.');
    if (!Array.isArray(p.densityMarks) || p.densityMarks.length > 128)
        throw Error('Invalid density mark inventory.');
    for (const mark of p.densityMarks) {
        if (!unicodeText(mark, 30).trim() || graphemes(mark, p.locale).length !== 1 || /[\p{Script=Arabic}\p{Script=Devanagari}\p{Script=Tamil}]/u.test(mark))
            throw Error('Density marks must be complete symbol, digit or safe-script graphemes; complex-script words belong in vocabulary.');
    }
    if (typeof p.preferredFont !== 'string' || !Array.isArray(p.fallbackFonts) || p.fallbackFonts.some(f => typeof f !== 'string') || !num(p.densityPreference, .1, 1) || !p.metrics || !num(p.metrics.lineHeight, 1, 3) || typeof p.metrics.trackingSafe !== 'boolean' || p.metrics.trackingSafe !== !['ar', 'hi', 'ta'].includes(p.locale) || typeof p.sourceRevision !== 'string' || !['machine-authored-unreviewed', 'user-provided'].includes(p.reviewStatus))
        throw Error('Invalid language pack metadata.');
    return { ...p, characters: p.characters.map(c => unicodeText(c, 50)), densityMarks: p.densityMarks.map(c => unicodeText(c, 30)), tokens: p.tokens.map(t => ({ ...t, text: unicodeText(t.text, 300) })) };
}
export function validateGeometry(value) {
    const g = value;
    if (!g || g.schema !== 'NAAE/geometry/1' || typeof g.id !== 'string' || g.id.length > 100 || !num(g.width, 300, 3000) || !num(g.height, 240, 3000) || !num(g.seed, 0, 4294967295) || !/^#[a-f\d]{6}$/i.test(g.background) || typeof g.transparent !== 'boolean' || typeof g.revision !== 'string' || !Array.isArray(g.cells) || !g.cells.length || g.cells.length > 60000)
        throw Error('Invalid geometry envelope.');
    for (const c of g.cells)
        if (!num(c.x, 0, g.width) || !num(c.y, 0, g.height) || !num(c.width, .01, g.width) || !num(c.height, .01, g.height) || c.x + c.width > g.width + .01 || c.y + c.height > g.height + .01 || !num(c.tone, 0, 1) || !num(c.depth, -100, 100) || !/^#[a-f\d]{6}$/i.test(c.ink) || typeof c.region !== 'string' || c.region.length > 80 || typeof c.material !== 'string' || c.material.length > 80)
            throw Error('Invalid geometry cell.');
    return g;
}
export function validateRequest(value) {
    const r = value;
    if (!r || r.schema !== 'NAAE/render-request/1')
        throw Error('Unsupported render request schema.');
    const p = validatePack(r.textPack);
    validateGeometry(r.geometry);
    const s = r.settings;
    if (!s || s.locale !== p.locale || !p.writingModes.includes(s.writingMode) || !p.strategies.includes(s.strategy) || !num(s.fontSize, 5, 64) || !num(s.density, 0, 1) || !num(s.tracking, 0, 4) || !num(s.lineHeight, 1, 3) || s.columnSpacing !== undefined && !num(s.columnSpacing, .8, 3) || !num(s.phraseFrequency, 0, 1) || !num(s.seed, 0, 4294967295) || !Number.isInteger(s.maxRuns) || !num(s.maxRuns, 100, 16000) || typeof s.fontId !== 'string' || typeof s.decorative !== 'boolean' || typeof s.description !== 'string' || !Array.isArray(s.regionPriority) || s.regionPriority.length > 24 || s.regionPriority.some(k => typeof k !== 'string' || k.length > 80) || !p.metrics.trackingSafe && s.tracking !== 0)
        throw Error('Invalid or unsafe Unicode typography settings. Complex scripts require zero tracking.');
    if (!r.mainText || typeof r.mainText !== 'object' || Array.isArray(r.mainText) || Object.keys(r.mainText).length > 24 || !Array.isArray(r.hiddenWords) || r.hiddenWords.length > 64)
        throw Error('Invalid semantic source.');
    const mainText = Object.fromEntries(Object.entries(r.mainText).map(([k, v]) => { if (k.length > 80)
        throw Error('Region id too long.'); return [k, unicodeText(v, 6000)]; }));
    const hiddenWords = r.hiddenWords.map((t, i) => { const pack = validatePack({ ...p, tokens: [{ ...t, id: 'hidden-' + i, role: 'highlight' }] }); return pack.tokens[0]; });
    unicodeText(s.description, 1000);
    return { ...r, textPack: p, mainText, hiddenWords };
}
