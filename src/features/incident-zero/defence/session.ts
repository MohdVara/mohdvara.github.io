import type { WeaponId } from './simulation';
export const sessionKey = 'incident-zero-defence-v1';
export type Result = {
    attemptId: string;
    outcome: 'victory' | 'defeat';
    score: number;
    flood: number;
    probe: number;
    undamaged: boolean;
};
export type Session = {
    version: 1;
    attemptId: string;
    status: 'ready' | 'active' | 'victory' | 'defeat';
    checkpoint: 'edge-gateway';
    weapon: WeaponId;
    best: number;
    completed: number;
    lastResult: Result | null;
};
type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;
const fresh = (): Session => ({ version: 1, attemptId: '', status: 'ready', checkpoint: 'edge-gateway', weapon: 'pulse', best: 0, completed: 0, lastResult: null });
const integer = (v: unknown, max: number) => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= max;
export function parseSession(raw: string | null): Session {
    try {
        const v = JSON.parse(raw || 'null');
        if (!v || v.version !== 1 || v.checkpoint !== 'edge-gateway' || !['ready', 'active', 'victory', 'defeat'].includes(v.status) || !['pulse', 'fan'].includes(v.weapon) || typeof v.attemptId !== 'string' || !integer(v.best, 1750) || !integer(v.completed, 1e9))
            return fresh();
        const r = v.lastResult;
        if (r !== null && (!r || typeof r.attemptId !== 'string' || !['victory', 'defeat'].includes(r.outcome) || !integer(r.score, 1750) || !integer(r.flood, 4) || !integer(r.probe, 4) || typeof r.undamaged !== 'boolean' || r.score !== r.flood * 100 + r.probe * 150 + (r.outcome === 'victory' ? 500 + (r.undamaged ? 250 : 0) : 0)))
            return fresh();
        if ((v.status === 'victory' || v.status === 'defeat') && (!r || r.attemptId !== v.attemptId || r.outcome !== v.status))
            return fresh();
        return v;
    }
    catch {
        return fresh();
    }
}
export function recoverSession(session: Session) { return { session: session.status === 'active' ? { ...session, status: 'ready' as const } : session, recovered: session.status === 'active' }; }
export function finishSession(session: Session, result: Result): Session {
    if (session.status !== 'active' || session.attemptId !== result.attemptId)
        return session;
    return { ...session, status: result.outcome, best: result.outcome === 'victory' ? Math.max(session.best, result.score) : session.best, completed: session.completed + (result.outcome === 'victory' ? 1 : 0), lastResult: result };
}
export function createSessionStore(storage?: StoragePort) {
    let memory = fresh();
    return { load() { try {
            if (storage)
                memory = parseSession(storage.getItem(sessionKey));
        }
        catch { /* memory fallback */ } return memory; }, save(value: Session) { memory = value; try {
            storage?.setItem(sessionKey, JSON.stringify(value));
        }
        catch { /* restricted storage remains playable */ } } };
}

// Attempt IDs are local scoring guards, not account or authentication tokens.
// getRandomValues works on LAN HTTP too; randomUUID requires a secure context.
let attemptSequence = 0;
export function createAttemptId(entropy: Pick<Crypto, 'getRandomValues'> | null = globalThis.crypto ?? null): string {
    const prefix = `attempt-${Date.now().toString(36)}-${(++attemptSequence).toString(36)}`;
    try {
        if (entropy) {
            const bytes = entropy.getRandomValues(new Uint8Array(16));
            return `${prefix}-${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')}`;
        }
    } catch { /* restricted crypto still permits local play */ }
    return `${prefix}-${Math.random().toString(36).slice(2)}`;
}
