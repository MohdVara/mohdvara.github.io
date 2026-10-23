import { escapeXml as esc } from '../svg.js';
const calibratedContexts = new Map();
const metricContexts = new Map();
export class BrowserTextMeasurer {
    fonts;
    settings;
    pack;
    family;
    backend = 'browser-native Canvas shaping + SVG vertical layout; rendered-alpha calibration';
    calibrated = new Set();
    canvas = document.createElement('canvas');
    cache = new Map();
    hits = 0;
    misses = 0;
    constructor(fonts, settings, pack) {
        this.fonts = fonts;
        this.settings = settings;
        this.pack = pack;
        this.family = fonts.map(f => '"' + f.family + '"').join(',');
        const key = JSON.stringify([fonts.map(f => f.sha256), settings.fontSize, settings.tracking, settings.writingMode, pack.direction]);
        this.cache = metricContexts.get(key) ?? new Map();
        metricContexts.set(key, this.cache);
        this.calibrated = calibratedContexts.get(key) ?? new Set();
        calibratedContexts.set(key, this.calibrated);
        if (metricContexts.size > 16) {
            const oldest = metricContexts.keys().next().value;
            metricContexts.delete(oldest);
            calibratedContexts.delete(oldest);
        }
    }
    async calibrateVertical(texts) {
        if (this.settings.writingMode !== 'vertical-rl')
            return;
        const unique = [...new Set(texts)].filter(t => t.trim() && (!this.calibrated.has(t) || !this.cache.has(t)));
        for (let offset = 0; offset < unique.length; offset += 48) {
            const group = unique.slice(offset, offset + 48), size = this.settings.fontSize, pad = Math.ceil(size * 2 + 4), tileWidth = pad * 2 + Math.ceil(size * 3), measurements = group.map(t => this.measure(t)), tileHeight = Math.ceil(Math.max(...measurements.map(m => m.height)) + pad * 2), columns = 6, rows = Math.ceil(group.length / columns);
            if (tileHeight * rows > 8192 || tileWidth * columns > 4096 || tileHeight * rows * tileWidth * columns > 8000000)
                throw Error('Vertical calibration surface exceeds its bounded workload.');
            const width = columns * tileWidth, height = rows * tileHeight;
            const style = this.fonts.map(f => `@font-face{font-family:"${f.family}";src:url(data:font/woff2;base64,${f.data}) format("woff2")}`).join('');
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><style>${style}</style><g style="font-family:${esc(this.family)};font-size:${size}px;letter-spacing:${this.settings.tracking}px;writing-mode:vertical-rl;text-orientation:mixed;white-space:pre" fill="white">${group.map((t, i) => `<text x="${i % columns * tileWidth + pad}" y="${Math.floor(i / columns) * tileHeight + pad}">${esc(t)}</text>`).join('')}</g></svg>`;
            const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })), image = new Image();
            try {
                await new Promise((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(Error('Native vertical ink calibration failed.')); image.src = url; });
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                ctx.drawImage(image, 0, 0);
                const pixels = ctx.getImageData(0, 0, width, height).data;
                for (let i = 0; i < group.length; i++) {
                    const ox = i % columns * tileWidth, oy = Math.floor(i / columns) * tileHeight;
                    let minX = tileWidth, minY = tileHeight, maxX = -1, maxY = -1, ink = 0;
                    for (let y = 0; y < tileHeight; y++)
                        for (let x = 0; x < tileWidth; x++) {
                            const alpha = pixels[((y + oy) * width + x + ox) * 4 + 3];
                            ink += alpha / 255;
                            if (alpha > 2) {
                                minX = Math.min(minX, x);
                                minY = Math.min(minY, y);
                                maxX = Math.max(maxX, x);
                                maxY = Math.max(maxY, y);
                            }
                        }
                    if (maxX < 0)
                        throw Error('Vertical text produced no painted glyphs.');
                    const m = measurements[i], top = Math.min(m.top, minY - pad - .35), bottom = Math.max(m.top + m.height, maxY + 1 - pad + .35), paintWidth = maxX - minX + 1 + .7;
                    this.cache.set(group[i], { ...m, left: minX - pad - .35, top, width: paintWidth, height: bottom - top, inkDensity: ink / Math.max(1, paintWidth * (bottom - top)) });
                    this.calibrated.add(group[i]);
                }
            }
            finally {
                URL.revokeObjectURL(url);
            }
        }
    }
    measure(text) {
        const existing = this.cache.get(text);
        if (existing) {
            this.hits++;
            return existing;
        }
        this.misses++;
        const { fontSize, tracking, writingMode } = this.settings, ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        const setup = () => { ctx.font = `${fontSize}px ${this.family}`; ctx.direction = this.pack.direction; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fontKerning = 'normal'; ctx.letterSpacing = tracking + 'px'; };
        setup();
        const m = ctx.measureText(text), left = Math.min(0, -m.actualBoundingBoxLeft), right = Math.max(m.width, m.actualBoundingBoxRight), ascent = Math.max(1, m.actualBoundingBoxAscent), descent = Math.max(0, m.actualBoundingBoxDescent);
        const width = Math.ceil(right - left) + 4, height = Math.ceil(ascent + descent) + 4;
        if (width > 4096 || height > 512)
            throw Error('Text run exceeds the bounded font measurement surface.');
        this.canvas.width = width;
        this.canvas.height = height;
        setup();
        ctx.fillStyle = '#fff';
        ctx.fillText(text, 2 - left, 2 + ascent);
        const pixels = ctx.getImageData(0, 0, width, height).data;
        let ink = 0;
        for (let i = 3; i < pixels.length; i += 4)
            ink += pixels[i] / 255;
        let result = { advance: m.width, left, top: -ascent, width: Math.max(.1, right - left), height: ascent + descent, ascent, descent, inkDensity: ink / Math.max(1, (right - left) * (ascent + descent)) };
        if (writingMode === 'vertical-rl') {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'), node = document.createElementNS(svg.namespaceURI, 'text');
            svg.style.cssText = 'position:fixed;left:-20000px;top:0;overflow:visible';
            node.textContent = text;
            node.setAttribute('style', `font:${fontSize}px ${this.family};writing-mode:vertical-rl;text-orientation:mixed;letter-spacing:${tracking}px;white-space:pre`);
            node.setAttribute('lang', this.pack.locale);
            svg.append(node);
            document.body.append(svg);
            const box = node.getBBox();
            svg.remove();
            result = { ...result, advance: box.height, left: box.x, top: box.y, width: Math.max(.1, box.width), height: Math.max(.1, box.height) };
        }
        this.cache.set(text, result);
        if (this.cache.size > 4096)
            this.cache.delete(this.cache.keys().next().value);
        return result;
    }
}
