import { unicodeText } from './contract.js';
const loaded = new Map();
let catalog;
export function fontCatalog() { return catalog ??= fetch(new URL('/fonts/unicode/manifest.json', document.baseURI).pathname).then(async (r) => { if (!r.ok)
    throw Error('Font manifest unavailable.'); return await r.json(); }); }
export async function loadFont(id) {
    if (loaded.has(id))
        return loaded.get(id);
    const promise = (async () => {
        const record = (await fontCatalog()).find(f => f.id === id);
        if (!record || !/^[a-z-]+\.woff2$/.test(record.file))
            throw Error('Unsupported local typeface.');
        const root = new URL('/fonts/unicode/', document.baseURI).pathname;
        const [response, licenseResponse] = await Promise.all([fetch(root + record.file + '?revision=' + record.sha256), fetch(root + record.license)]);
        if (!response.ok || !licenseResponse.ok)
            throw Error('Local licensed font could not load.');
        const data = await response.arrayBuffer(), digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', data)), b => b.toString(16).padStart(2, '0')).join('');
        if (digest !== record.sha256)
            throw Error('Font revision checksum mismatch.');
        let binary = '';
        for (const b of new Uint8Array(data))
            binary += String.fromCharCode(b);
        const encoded = btoa(binary), family = 'NAAE-' + id;
        document.fonts.add(await new FontFace(family, data).load());
        return { id, family, data: encoded, sha256: digest, license: await licenseResponse.text(), coverage: record.coverage };
    })();
    loaded.set(id, promise);
    try {
        return await promise;
    }
    catch (e) {
        loaded.delete(id);
        throw e;
    }
}
export function assertFontCoverage(texts, fonts) {
    const missing = new Set();
    for (const text of texts)
        for (const ch of unicodeText(text)) {
            const cp = ch.codePointAt(0);
            if (/[\s\p{Cf}\p{Variation_Selector}]/u.test(ch))
                continue;
            if (!fonts.some(f => f.coverage.some(([a, b]) => cp >= a && cp <= b)))
                missing.add(cp);
        }
    if (missing.size)
        throw Error('Selected local fonts lack glyphs: ' + [...missing].slice(0, 12).map(cp => 'U+' + cp.toString(16).toUpperCase()).join(', '));
}
