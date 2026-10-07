// Opt-in, development-only two-minute capture. Nothing is stored per frame.
export type FrameSample = {
    interval: number;
    simulation: number;
    navigationSearches: number;
    rendering: number;
    enemies: number;
    projectiles: number;
    status: string;
};
export function createDiagnostics() {
    let enabled = false, previous = 0, lastStatus = '';
    const transitions: {
        at: number;
        status: string;
    }[] = [];
    const samples: FrameSample[] = [], longTasks: {
        start: number;
        duration: number;
    }[] = [];
    let observer: PerformanceObserver | undefined;
    const api = { start() {
            observer?.disconnect();
            enabled = true;
            previous = 0;
            samples.length = 0;
            transitions.length = 0;
            lastStatus = '';
            longTasks.length = 0;
            try {
                observer = new PerformanceObserver(list => {
                    for (const e of list.getEntries())
                        longTasks.push({ start: e.startTime, duration: e.duration });
                });
                observer.observe({ type: 'longtask', buffered: false });
            }
            catch { /* Unsupported in some browsers. */ }
        }, stop() { enabled = false; observer?.disconnect(); }, capture() { return { samples: [...samples], transitions: [...transitions], longTasks: [...longTasks], environment: { userAgent: navigator.userAgent, cores: navigator.hardwareConcurrency }, note: 'Intervals can include pauses; transition timestamps identify their boundaries; loading is not recorded. Start capture immediately before reproducing the spike.' }; }, get enabled() { return enabled; } };
    return { api, transition(status: string) { if (enabled && status !== lastStatus) {
            transitions.push({ at: performance.now(), status });
            lastStatus = status;
        } }, record(sample: Omit<FrameSample, 'interval'>, now: number) {
            if (!enabled)
                return;
            if (previous)
                samples.push({ ...sample, interval: now - previous });
            previous = now;
            if (samples.length > 7200)
                samples.shift();
        }, destroy() { api.stop(); } };
}
