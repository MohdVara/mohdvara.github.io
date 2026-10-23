/** Match the physical aspect to the chosen pixel canvas so its usable area is recomposed. */
export function resizeCanvas(config, width, height) {
    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 300 || width > 3000 || height < 300 || height > 3000)
        throw new Error('Canvas width and height must be whole pixels between 300 and 3000.');
    const c = structuredClone(config), ratio = width / height, longest = Math.max(c.profile.widthMm, c.profile.heightMm), shortest = Math.max(40, c.profile.safeMarginMm * 2 + 10), long = Math.min(2000, Math.max(c.mode === 'object' ? Math.min(c.profile.widthMm, c.profile.heightMm) * Math.max(ratio, 1 / ratio) : longest, shortest * Math.max(ratio, 1 / ratio)));
    if (long > 2000)
        throw new Error('This shape needs a larger physical area than the supported 2000 mm maximum.');
    const pixelScale = c.mode === 'object' ? Math.min(width, height) / Math.min(c.width, c.height) : Math.max(width, height) / Math.max(c.width, c.height);
    c.fontSize = Math.max(8, Math.min(36, c.fontSize * pixelScale));
    c.tracking = Math.max(0, Math.min(4, c.tracking * pixelScale));
    c.width = width;
    c.height = height;
    c.pngWidth = width;
    c.canvasFit = 'recompose';
    c.profile = { ...c.profile, id: 'custom', widthMm: ratio >= 1 ? long : long * ratio, heightMm: ratio >= 1 ? long / ratio : long, aspectRatio: ratio };
    return c;
}
/** A square focal grid keeps the main tree upright; extra canvas becomes environment. */
export function objectFrame(b, fit) {
    if (!fit)
        return { col: 0, row: 0, width: b.drawWidth + 64, height: b.drawHeight + 64 };
    const cols = Math.max(1, Math.min(b.cols, Math.floor(b.rows * b.leading / b.advance))), rows = Math.max(1, Math.min(b.rows, Math.floor(cols * b.advance / b.leading)));
    return { col: Math.floor((b.cols - cols) / 2), row: Math.floor((b.rows - rows) / 2), width: cols * b.advance + 64 + 1e-6, height: rows * b.leading + 64 + 1e-6 };
}
