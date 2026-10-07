import { createAttemptId } from './session';
import { generatorVersion, levelBudgets } from './generation';
import type { WeaponId } from './simulation';
export const runKey = 'incident-zero-defence-v2';
export type LevelResult = {
    attemptId: string;
    level: number;
    flood: number;
    probe: number;
    hits: number;
    integrity: number;
    weapon: WeaponId;
    score: number;
    outcome: 'victory' | 'defeat';
};
export type Run = {
    version: 2;
    generatorVersion: number;
    runId: string;
    attemptId: string;
    seed: string;
    level: number;
    checkpoint: {
        integrity: number;
        weapon: WeaponId;
    };
    weapon: WeaponId;
    score: number;
    status: 'ready' | 'active' | 'paused' | 'intermission' | 'victory' | 'defeat';
    levels: LevelResult[];
    lastResult: LevelResult | null;
    best: number;
    completed: number;
};
export const freshRun = (): Run => ({ version: 2, generatorVersion, runId: '', attemptId: '', seed: '', level: 1, checkpoint: { integrity: 3, weapon: 'pulse' }, weapon: 'pulse', score: 0, status: 'ready', levels: [], lastResult: null, best: 0, completed: 0 });
export function startRun(previous: Run, seed = createAttemptId()): Run { return { ...freshRun(), seed, runId: createAttemptId(), attemptId: createAttemptId(), status: 'active', weapon: previous.weapon, checkpoint: { integrity: 3, weapon: previous.weapon }, best: previous.best, completed: previous.completed }; }
export function commitLevel(run: Run, result: LevelResult): Run {
    if (run.status !== 'active' || result.attemptId !== run.attemptId || result.level !== run.level)
        return run;
    if (result.outcome === 'defeat')
        return { ...run, status: 'defeat', lastResult: result, weapon: result.weapon };
    const final = run.level === 5, score = run.score + result.score + (final ? 1000 : 0);
    return { ...run, score, levels: [...run.levels, result], lastResult: result, weapon: result.weapon, status: final ? 'victory' : 'intermission', best: final ? Math.max(run.best, score) : run.best, completed: run.completed + (final ? 1 : 0) };
}
export function continueRun(run: Run): Run { if (run.status !== 'intermission' || !run.lastResult || run.level >= 5)
    return run; return { ...run, level: run.level + 1, attemptId: createAttemptId(), checkpoint: { integrity: Math.min(3, run.lastResult.integrity + 1), weapon: run.weapon }, status: 'active', lastResult: null }; }
export function recoverRun(run: Run): Run { return run.status === 'active' ? { ...run, status: 'paused', weapon: run.checkpoint.weapon } : run; }
const int = (v: unknown, max = 1e9): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= max;
const weapon = (v: unknown): v is WeaponId => v === 'pulse' || v === 'fan';
function validResult(r: LevelResult) { const b = levelBudgets[r?.level - 1]; return !!b && typeof r.attemptId === 'string' && int(r.flood, b.flood) && int(r.probe, b.probe) && int(r.hits, 10000) && int(r.integrity, 3) && weapon(r.weapon) && ['victory', 'defeat'].includes(r.outcome) && r.score === r.flood * 100 + r.probe * 150 + (r.outcome === 'victory' ? 500 + (r.hits === 0 ? 250 : 0) : 0) && (r.outcome === 'victory' ? (r.flood === b.flood && r.probe === b.probe && r.integrity > 0) : r.integrity === 0); }
export function parseRun(raw: string | null): Run {
    try {
        const r = JSON.parse(raw || 'null') as Run;
        if (!r || r.version !== 2 || r.generatorVersion !== generatorVersion || !['ready', 'active', 'paused', 'intermission', 'victory', 'defeat'].includes(r.status) || typeof r.seed !== 'string' || r.seed.length > 200 || typeof r.runId !== 'string' || typeof r.attemptId !== 'string' || !int(r.level, 5) || r.level < 1 || !r.checkpoint || !int(r.checkpoint.integrity, 3) || r.checkpoint.integrity < 1 || !weapon(r.checkpoint.weapon) || !weapon(r.weapon) || !int(r.score, 10050) || !int(r.best, 10050) || !int(r.completed) || !Array.isArray(r.levels) || r.levels.length > 5 || r.levels.some((x, i) => !validResult(x) || x.outcome !== 'victory' || x.level !== i + 1) || r.lastResult !== null && !validResult(r.lastResult))
            return freshRun();
        const finished = r.status === 'intermission' || r.status === 'victory', expected = r.level - (finished ? 0 : 1);
        if (r.status === 'ready')
            return r.score === 0 && r.levels.length === 0 ? r : freshRun();
        if (!r.seed || !r.runId || !r.attemptId || r.levels.length !== expected || r.score !== r.levels.reduce((s, x) => s + x.score, 0) + (r.status === 'victory' ? 1000 : 0) || r.status === 'victory' && r.level !== 5 || r.status === 'intermission' && r.level >= 5)
            return freshRun();
        if (finished || r.status === 'defeat') {
            if (!r.lastResult || r.lastResult.attemptId !== r.attemptId || r.lastResult.level !== r.level || r.lastResult.outcome !== (r.status === 'defeat' ? 'defeat' : 'victory'))
                return freshRun();
            if (finished && JSON.stringify(r.lastResult) !== JSON.stringify(r.levels[r.levels.length - 1]))
                return freshRun();
        }
        else if (r.lastResult !== null)
            return freshRun();
        return r;
    }
    catch {
        return freshRun();
    }
}
export function createRunStore(storage?: Pick<Storage, 'getItem' | 'setItem'>) { let memory = freshRun(); return { load() { try {
        if (storage)
            memory = parseRun(storage.getItem(runKey));
    }
    catch { /* keep memory */ } return memory; }, save(run: Run) { memory = run; try {
        storage?.setItem(runKey, JSON.stringify(run));
    }
    catch { /* session memory remains playable */ } } }; }
