import { escapeXml as esc } from '../svg.js';
import { UNICODE_VERSION, validateRequest } from './contract.js';
import { loadFont, assertFontCoverage } from './fonts.js';
import { BrowserTextMeasurer } from './measure.js';
import { layoutText } from './layout.js';
const artworkCache = new Map();
export async function renderUnicode(input) {
    const request = validateRequest(input), ids = [...new Set([request.settings.fontId, ...request.textPack.fallbackFonts, 'latin'])], fonts = await Promise.all(ids.map(loadFont));
    assertFontCoverage([...request.textPack.tokens.map(t => t.text), ...request.textPack.characters, ...request.textPack.densityMarks, ...Object.values(request.mainText), ...request.hiddenWords.map(t => t.text)], fonts);
    const start = performance.now(), cacheInput = JSON.stringify([request, fonts.map(f => f.sha256)]), cacheKey = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(cacheInput))), b => b.toString(16).padStart(2, '0')).join('');
    const cached = artworkCache.get(cacheKey);
    if (cached)
        return { artwork: structuredClone(cached), fonts, performance: { layoutMs: performance.now() - start, measurements: 0, cacheHits: 0, placementCacheHit: true } };
    const measurement = new BrowserTextMeasurer(fonts, request.settings, request.textPack);
    if (request.settings.writingMode === 'vertical-rl')
        await measurement.calibrateVertical([...request.textPack.tokens.map(t => t.text), ...request.textPack.characters, ...request.textPack.densityMarks, ...Object.values(request.mainText), ...request.hiddenWords.map(t => t.text)]);
    const artwork = layoutText(request, measurement);
    artworkCache.set(cacheKey, structuredClone(artwork));
    if (artworkCache.size > 4)
        artworkCache.delete(artworkCache.keys().next().value);
    return { artwork, fonts, performance: { layoutMs: performance.now() - start, measurements: measurement.misses, cacheHits: measurement.hits, placementCacheHit: false } };
}
export function unicodeSVG(art, fonts) {
    const { settings: s, textPack: p, geometry: g } = art.request;
    for (const [id, revision] of Object.entries(art.fontRevisions))
        if (!fonts.some(f => f.id === id && f.sha256 === revision))
            throw Error('Export requires the exact measured font revisions.');
    const family = fonts.map(f => '"' + f.family + '"').join(','), style = fonts.map(f => `@font-face{font-family:"${f.family}";src:url(data:font/woff2;base64,${f.data}) format("woff2");font-weight:400;font-style:normal}`).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${g.width}" height="${g.height}" viewBox="0 0 ${g.width} ${g.height}" lang="${p.locale}" xml:lang="${p.locale}" ${s.decorative ? 'aria-hidden="true"' : `role="img" aria-labelledby="unicode-title unicode-desc"`} style="${g.transparent ? '' : 'background:' + g.background}"><title id="unicode-title">${esc(g.id + ' · ' + p.locale)}</title><desc id="unicode-desc">${esc(s.description)}</desc><metadata>${esc(JSON.stringify({ schema: art.schema, settings: s, geometryRevision: g.revision, textPackRevision: p.sourceRevision, fontRevisions: art.fontRevisions, report: art.report, environment: art.environment }))}</metadata><metadata id="font-licenses">${esc(fonts.map(f => f.id + '\n' + f.license).join('\n\n'))}</metadata><defs><style>${style}</style></defs><g aria-hidden="true" style="font-family:${esc(family)};font-size:${s.fontSize}px;font-weight:400;letter-spacing:${s.tracking}px;font-kerning:normal;white-space:pre;writing-mode:${s.writingMode};text-orientation:mixed;direction:${p.direction};unicode-bidi:isolate" text-anchor="${p.direction === 'rtl' ? 'end' : 'start'}">${art.runs.map(run => `<text aria-hidden="true" x="${run.x.toFixed(4)}" y="${run.y.toFixed(4)}" fill="${run.ink}" data-run="${esc(run.id)}" data-region="${esc(run.region)}" data-kind="${run.kind}" xml:space="preserve">${esc(run.text.replace(/[\r\n]/g, ''))}</text>`).join('')}</g></svg>`;
}
/** Structured text keeps logical source order; proportional runs have no fixed-cell text equivalent. */
export function unicodeRunExport(art) { return { schema: 'NAAE/text-runs/1', warning: 'Logical text runs with measured positions. Plain-text fixed-cell alignment is not supported for this renderer.', locale: art.request.settings.locale, writingMode: art.request.settings.writingMode, runs: art.runs, fontRevisions: art.fontRevisions, passages: art.report.passages }; }
export function serializeUnicode(art) { return structuredClone({ schema: UNICODE_VERSION, request: art.request, fontRevisions: art.fontRevisions }); }
export async function restoreUnicode(value) {
    const data = value;
    if (!data || data.schema !== UNICODE_VERSION || !data.fontRevisions)
        throw Error('Unsupported Unicode scene.');
    const result = await renderUnicode(validateRequest(data.request));
    if (JSON.stringify(Object.entries(data.fontRevisions).sort()) !== JSON.stringify(Object.entries(result.artwork.fontRevisions).sort()))
        throw Error('Font revision differs from saved scene; reproducibility requires the original assets.');
    return result;
}
export async function unicodePNG(art, fonts, width = art.request.geometry.width) {
    if (!Number.isInteger(width) || width < 300 || width > 6000)
        throw Error('PNG width must be 300–6000px.');
    const g = art.request.geometry, height = Math.round(width * g.height / g.width);
    if (width * height > 24000000)
        throw Error('PNG surface exceeds 24 megapixels.');
    const svg = unicodeSVG(art, fonts), url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    try {
        const img = new Image();
        await new Promise((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(Error('This browser cannot rasterize the self-contained text SVG. Export SVG instead.')); img.src = url; });
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!g.transparent) {
            ctx.fillStyle = g.background;
            ctx.fillRect(0, 0, width, height);
        }
        ctx.drawImage(img, 0, 0, width, height);
        return await new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(Error('PNG encoding failed.')), 'image/png'));
    }
    finally {
        URL.revokeObjectURL(url);
    }
}
