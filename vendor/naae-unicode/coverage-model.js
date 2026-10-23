export const coverageTargets = { sparse: .38, balanced: .68, dense: .9, continuous: 1 };
export const coverageDefaults = { profile: 'continuous', target: 1, intensity: .7, backgroundColor: '#101713', colorVariation: .8, textureMode: 'mixed', wordDensity: .48, atmosphericDetail: .6, backgroundDetail: .7, foregroundDetail: .85, textureComplexity: .65, minWeight: .015, maxWeight: .4, depthContrast: .7, narrativeContrast: 4.5, minimumContrast: 2.3, materialIntensity: { atmosphere: .25, cloud: .36, rock: .55, leaves: .78, bark: .85, water: .5, soil: .67, shadow: .3 }, intent: 'digital', fabricColor: '#101713', process: 'dtg', detailLoss: .25, exclusions: [] };
export function validateCoverage(c) {
    const s = c.coverage;
    if (!s)
        throw new Error('v0.3 requires coverage settings.');
    if (s.backgroundColor !== undefined && !/^#[0-9a-f]{6}$/i.test(s.backgroundColor))
        throw new Error('Invalid artwork background color.');
    if (s.colorVariation !== undefined && (!Number.isFinite(s.colorVariation) || s.colorVariation < 0 || s.colorVariation > 1))
        throw new Error('Invalid color variation.');
    if (!Object.hasOwn(coverageTargets, s.profile))
        throw new Error('Invalid coverage profile.');
    for (const k of ['target', 'intensity', 'wordDensity', 'atmosphericDetail', 'backgroundDetail', 'foregroundDetail', 'textureComplexity', 'minWeight', 'maxWeight', 'depthContrast', 'detailLoss'])
        if (typeof s[k] !== 'number' || !Number.isFinite(s[k]) || s[k] < 0 || s[k] > 1)
            throw new Error(`Invalid coverage ${k}.`);
    if (!['symbols', 'mixed', 'words'].includes(s.textureMode))
        throw new Error('Invalid texture text mode.');
    if (s.minWeight > s.maxWeight || s.maxWeight < .02)
        throw new Error('Invalid glyph weight range.');
    for (const k of ['narrativeContrast', 'minimumContrast'])
        if (!Number.isFinite(s[k]) || s[k] < 1.1 || s[k] > 12)
            throw new Error(`Invalid ${k}.`);
    if (!/^#[0-9a-f]{6}$/i.test(s.fabricColor) || !['dtg', 'dtf', 'screen'].includes(s.process) || !['digital', 'print'].includes(s.intent))
        throw new Error('Invalid print-intensity configuration.');
    for (const key of Object.keys(coverageDefaults.materialIntensity))
        if (!Number.isFinite(s.materialIntensity?.[key]) || s.materialIntensity[key] < 0 || s.materialIntensity[key] > 2)
            throw new Error(`Invalid intensity for ${key}.`);
    if (!Array.isArray(s.exclusions) || s.exclusions.length > 30)
        throw new Error('Invalid exclusions.');
    for (const r of s.exclusions)
        if (['x', 'y', 'width', 'height'].some(k => typeof r[k] !== 'number' || !Number.isFinite(r[k])) || r.x < 0 || r.y < 0 || r.width < 0 || r.height < 0 || r.x + r.width > 1 || r.y + r.height > 1 || typeof r.reason !== 'string')
            throw new Error('Invalid exclusion rectangle.');
}
