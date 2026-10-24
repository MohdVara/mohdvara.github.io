import { TranslationNotice } from "../../../i18n/controls";
import { localizedHref, labelParts } from "../../../i18n/config";
import { text, localizedContent } from "../../../i18n/config";
import { useEffect, useRef, useState, useMemo, type PointerEvent } from 'react';
import type { DefenceController, Hud } from './renderer';
import { weapons } from './simulation';
import { createRunStore, freshRun, recoverRun, startRun, commitLevel, continueRun, type Run } from './run';
import { generateFloor } from './generation';
import './defence.css';
const initialHud: Hud = { status: 'ready', integrity: 3, weapon: 'pulse', score: 0, threats: 6, near: false, flood: 0, probe: 0, hits: 0 };
export default function DefenceRoute() {
    const host = useRef<HTMLDivElement>(null), controller = useRef<DefenceController>(), heading = useRef<HTMLHeadingElement>(null);
    const store = useRef(createRunStore()), saved = useRef<Run>(freshRun());
    const [session, setSession] = useState(saved.current), [loaded, setLoaded] = useState(false), [ready, setReady] = useState(false), [failed, setFailed] = useState(false), [recovered, setRecovered] = useState(false), [hud, setHud] = useState(initialHud);
    const [stick, setStick] = useState({ x: 0, y: 0 });
    const movementPointer = useRef<number | null>(null), firePointer = useRef<number | null>(null);
    const persist = (next: Run) => { saved.current = next; store.current.save(next); setSession(next); };
    const didLoad = useRef(false);
    useEffect(() => {
        if (didLoad.current)
            return;
        didLoad.current = true;
        let storage: Storage | undefined;
        try {
            storage = window.sessionStorage;
        }
        catch { /* memory fallback */ }
        store.current = createRunStore(storage);
        const recovery = recoverRun(store.current.load());
        saved.current = recovery;
        store.current.save(recovery);
        setSession(recovery);
        setRecovered(recovery.status === 'paused');
        setLoaded(true);
    }, []);
    useEffect(() => {
        if (!loaded)
            return;
        let disposed = false;
        void import('./renderer').then(({ createDefence }) => {
            if (disposed)
                return;
            controller.current = createDefence(host.current!, saved.current.weapon, (next) => {
                if (disposed)
                    return;
                setHud(next);
                if (next.weapon !== saved.current.weapon) {
                    saved.current = { ...saved.current, weapon: next.weapon };
                    store.current.save(saved.current);
                    setSession(saved.current);
                }
                if ((next.status === 'victory' || next.status === 'defeat') && saved.current.status === 'active') {
                    const r = saved.current;
                    persist(commitLevel(r, { attemptId: r.attemptId, level: r.level, outcome: next.status, score: next.score, flood: next.flood, probe: next.probe, hits: next.hits, integrity: next.integrity, weapon: next.weapon }));
                }
            }, () => controller.current?.pause(), () => {
                if (!disposed) {
                    setReady(true);
                    const r = saved.current;
                    if (r.status === 'paused')
                        controller.current?.loadFloor(generateFloor(r.seed, r.level), r.checkpoint.weapon, r.checkpoint.integrity, 'paused');
                }
            }, () => {
                if (!disposed)
                    setFailed(true);
            }, generateFloor(saved.current.seed || 'preview', saved.current.level), saved.current.checkpoint.integrity);
        }).catch(() => {
            if (!disposed)
                setFailed(true);
        });
        const stop = () => { controller.current?.pause(); controller.current?.input.clear(); movementPointer.current = null; firePointer.current = null; setStick({ x: 0, y: 0 }); };
        const visibility = () => {
            if (document.hidden)
                stop();
        };
        window.addEventListener('blur', stop);
        document.addEventListener('visibilitychange', visibility);
        return () => { disposed = true; window.removeEventListener('blur', stop); document.removeEventListener('visibilitychange', visibility); controller.current?.destroy(); controller.current = undefined; };
    }, [loaded]);
    const result = ['victory', 'defeat', 'intermission'].includes(session.status) ? session.lastResult : null;
    const overlay = result ? 'result' : hud.status === 'ready' ? 'ready' : hud.status === 'paused' ? 'pause' : null;
    useEffect(() => {
        if (overlay) {
            heading.current?.focus({ preventScroll: true });
            heading.current?.scrollIntoView({ block: overlay === 'result' ? 'start' : 'nearest', behavior: 'instant' });
        }
    }, [overlay]);
    useEffect(() => {
        if (hud.status !== 'playing') {
            movementPointer.current = null;
            firePointer.current = null;
            setStick({ x: 0, y: 0 });
        }
    }, [hud.status]);
    const begin = (same = false) => {
        const next = startRun(saved.current, same ? saved.current.seed : undefined);
        persist(next);
        setRecovered(false);
        controller.current?.loadFloor(generateFloor(next.seed, 1), next.weapon, 3);
    };
    const advance = () => { const next = continueRun(saved.current); if (next === saved.current)
        return; persist(next); controller.current?.loadFloor(generateFloor(next.seed, next.level), next.weapon, next.checkpoint.integrity); };
    const resume = () => { persist({ ...saved.current, status: 'active' }); setRecovered(false); controller.current?.resume(); };
    const floor = useMemo(() => generateFloor(session.seed || 'preview', session.level), [session.seed, session.level]);
    const shownIntegrity = result?.integrity ?? hud.integrity;
    const active = hud.status === 'playing' && !result;
    useEffect(() => {
        if (active && ready)
            host.current?.focus({ preventScroll: true });
    }, [active, ready]);
    const moveStick = (event: PointerEvent<HTMLDivElement>) => {
        if (movementPointer.current !== event.pointerId)
            return;
        const r = event.currentTarget.getBoundingClientRect(), x = (event.clientX - r.left - r.width / 2) / (r.width / 2 - 12), y = (event.clientY - r.top - r.height / 2) / (r.height / 2 - 12), length = Math.max(1, Math.hypot(x, y));
        const v = { x: x / length, y: y / length };
        setStick(v);
        controller.current?.input.move(v.x, v.y);
    };
    const releaseMove = (event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerId !== movementPointer.current)
            return;
        movementPointer.current = null;
        setStick({ x: 0, y: 0 });
        controller.current?.input.move(0, 0);
    };
    const releaseFire = (event: PointerEvent<HTMLButtonElement>) => {
        if (event.pointerId !== firePointer.current)
            return;
        firePointer.current = null;
        controller.current?.input.fire(false);
    };
    return <div className="defence-page">
    <header className="defence-header"><a href={localizedHref("/incident-zero/")}>{text("← Incident Zero")}</a><h1>{text("System Defence")}</h1><span className="defence-tag">{text("LEVEL ")}{localizedContent(session.level.toString().padStart(2, '0'))} / 05 · {localizedContent(labelParts(floor.name))}</span></header><TranslationNotice /><main className="defence-content">
    <div className="defence-hud" role="group" aria-label={text("Encounter status")}>
      <div><small>{text("Integrity")}</small><strong><span aria-hidden="true">{localizedContent('◆'.repeat(shownIntegrity))}<span className="defence-empty">{localizedContent('◇'.repeat(3 - shownIntegrity))}</span></span><span className="sr-only">{localizedContent(shownIntegrity)}{text(" of 3 integrity")}</span></strong></div>
      <div><small>{text("Tool")}</small><strong>{localizedContent(weapons[hud.weapon].name)}</strong></div>
      <div><small>{text("Run score / personal best")}</small><strong>{localizedContent(session.score + (session.status === 'active' || session.status === 'paused' ? hud.score : session.status === 'defeat' ? (result?.score || 0) : 0))} / {localizedContent(session.best)}</strong></div>
      <div><small>{text("Threats remaining")}</small><strong>{localizedContent((result ? floor.spawns.length - result.flood - result.probe : hud.threats).toString().padStart(2, '0'))}</strong></div>
      <button disabled={!active} onClick={() => controller.current?.pause()}>{text("Pause / help")}</button>
    </div>
    <div className="defence-stage">
      <div className="defence-world" ref={host} tabIndex={overlay ? -1 : 0} role="group" aria-label={text("{{value0}} combat arena. WASD or arrows move, pointer aims and fires, 1 and 2 select tools, E restores service, Escape pauses.", {value0: labelParts(floor.name)})} onBlur={() => controller.current?.input.clear()}/>
      {localizedContent(overlay && <section className="defence-overlay" aria-labelledby="defence-overlay-title">
        <div className={`defence-panel${overlay === "ready" && !result ? " defence-editorial-ready" : ""}`}>
          <p className="defence-tag">{localizedContent(result ? 'ENCOUNTER REPORT' : overlay === 'pause' ? 'SIMULATION PAUSED' : 'INCIDENT ZERO / SYSTEM DEFENCE')}</p>
          <h2 ref={heading} tabIndex={-1} id="defence-overlay-title">{localizedContent(result ? (session.status === 'victory' ? 'Run complete.' : session.status === 'intermission' ? 'Service restored.' : 'System breached.') : overlay === 'pause' ? 'Hold position.' : recovered ? 'Ready to retry.' : 'Defend the edge.')}</h2>
          {localizedContent(result ? <>
            <p>{localizedContent(result.outcome === 'victory' ? (session.status === 'victory' ? 'All five services are back online.' : 'Floor clear. Continue when you are ready. A fixed +1 integrity repair (maximum 3) is applied on entry to the next level.') : 'Integrity exhausted. Retry immediately with both tools available.')}</p>
            <div className="defence-actions">
              {localizedContent(session.status==='intermission'?<button className="defence-primary" onClick={advance}>{text("Continue to level ")}{localizedContent(session.level+1)}</button>:<><button className="defence-primary" disabled={!ready||failed} onClick={()=>begin(true)}>{text("Retry same seed")}</button><button onClick={()=>begin(false)}>{text("New seed")}</button></>)}
              <a href={localizedHref("/#work")}>{text("Explore real engineering work ↗")}</a><a href={localizedHref("/incident-zero/")}>{text("Return to Incident Zero")}</a>
            </div>
            <dl className="defence-breakdown"><div><dt>{text("Flood Packets · ")}{localizedContent(result.flood)} × 100</dt><dd>{localizedContent(result.flood * 100)}</dd></div><div><dt>{text("Injection Probes · ")}{localizedContent(result.probe)} × 150</dt><dd>{localizedContent(result.probe * 150)}</dd></div><div><dt>{text("Service restored")}</dt><dd>{localizedContent(result.outcome === 'victory' ? 500 : 0)}</dd></div><div><dt>{text("Undamaged completion")}</dt><dd>{localizedContent(result.outcome === 'victory' && result.hits === 0 ? 250 : 0)}</dd></div><div><dt>{localizedContent(result.outcome === 'victory' ? 'Level score' : 'Incomplete level score')}</dt><dd>{localizedContent(result.score)}</dd></div></dl>
            {localizedContent(session.levels.length > 0 && <dl className="defence-breakdown">{localizedContent(session.levels.map(r => <div key={r.level}><dt>{text("Level ")}{localizedContent(r.level)} · {localizedContent(r.hits === 0 ? 'undamaged' : 'damage taken')}</dt><dd>{localizedContent(r.score)}</dd></div>))}{localizedContent(session.status === 'victory' && <div><dt>{text("Five-level completion bonus")}</dt><dd>1000</dd></div>)}<div><dt>{localizedContent(session.status === 'defeat' ? 'Incomplete run total' : 'Committed run total')}</dt><dd>{localizedContent(session.score + (session.status === 'defeat' ? result.score : 0))}</dd></div></dl>)}
            <p className="defence-small">{text("Level reached: ")}{localizedContent(session.level)}{text(" / 5 · Seed: ")}{localizedContent(session.seed)}<br />{text("Personal best completed run: ")}{localizedContent(session.best)}{text(" · Completed runs: ")}{localizedContent(session.completed)}{text(". Unverified browser-session data. The real engineering work explores resilient delivery, reconciliation and system modernisation.")}</p>
          </> : <>
            <p>{localizedContent(recovered ? 'Refresh restored this level’s entry checkpoint. Current-floor kills, damage and score were rolled back together; completed levels remain committed.' : overlay === 'pause' ? 'Simulation is frozen. Resume when you are ready.' : 'Restore five generated services. Clear each floor, approach its terminal and restore service, then choose Continue.')}</p>
            <p className="defence-desktop-help">{text("WASD / arrows move · pointer aims · hold click to fire")}<br />{text("1 / 2 or Q switch · E / Enter at terminal · Esc pauses")}</p>
            <p className="defence-touch-help">{text("Drag the left pad to move. Hold FIRE for nearby, visible targets. Switch tools freely; restore at the unlocked terminal.")}</p>
            <p className="defence-small"><b>{text("Pulse:")}</b>{text(" precise, repeatable, medium range. ")}<b>{text("Fan:")}</b>{text(" five double-damage short-range packets for nearby groups; slower cadence and wide spread. Pulse reaches distant probes and narrow lanes. Diamonds pursue; triangles mark an amber aim line before firing. A cyan ring signals temporary damage protection.")}</p>
            {localizedContent(overlay === 'ready' && <p className="defence-small">{text("Three integrity. Each cleared level repairs one point for the next level, capped at three. The real-time action is spatial; the ")}<a href={localizedHref("/incident-zero/")}>{text("original story")}</a>{text(" offers non-spatial navigation.")}</p>)}
          </>)}
          {localizedContent(!result&&<div className="defence-actions">
            {localizedContent(overlay==='pause'?<><button className="defence-primary" onClick={resume}>{text("Resume run")}</button><button onClick={()=>begin(true)}>{text("Restart same seed")}</button></>:<button className="defence-primary" disabled={!ready||failed} onClick={()=>begin(false)}>{text("Start run")}</button>)}
            <a href={localizedHref("/incident-zero/")}>{text("Return to Incident Zero")}</a>
          </div>)}

          <p className="defence-small">{text("Progress is saved in this tab when browser storage is available. Closing the tab may clear it. No permanent account history. Personal best counts completed five-level runs only. Refresh during combat restores this level’s entry checkpoint paused.")}</p>
        </div>
      </section>)}
      {localizedContent(failed && <div className="defence-error" role="alert">{text("Renderer could not start. ")}<button onClick={() => location.reload()}>{text("Retry loading")}</button> <a href={localizedHref("/incident-zero/")}>{text("Return to story")}</a></div>)}
    </div>
    <div className="defence-controls" onContextMenu={event => event.preventDefault()}>
      <div className="defence-stick" role="group" aria-label={text("Touch movement pad; drag to move")} aria-disabled={!active} onPointerDown={e => {
            e.preventDefault();
            if (!active || movementPointer.current !== null)
                return;
            movementPointer.current = e.pointerId;
            e.currentTarget.setPointerCapture(e.pointerId);
            moveStick(e);
        }} onPointerMove={moveStick} onPointerUp={releaseMove} onPointerCancel={releaseMove} onLostPointerCapture={releaseMove}><svg viewBox="0 0 80 80" aria-hidden="true" focusable="false"><path d="M40 10v16m-6-10 6-6 6 6M40 70V54m-6 10 6 6 6-6M10 40h16m-10-6-6 6 6 6M70 40H54m10-6 6 6-6 6"/></svg><i style={{ transform: `translate(${stick.x * 22}px,${stick.y * 22}px)` }}/></div>
      <p className="defence-control-hint">{text("Neutralise threats → restore terminal")}<br /><span>{text("Diamonds: Flood · Triangles: Probe")}</span></p>
      <div className="defence-tool-controls"><button disabled={!active} onClick={() => controller.current?.select('switch')}>{text("Switch tool ")}<span>{localizedContent(hud.weapon === 'pulse' ? '1 → 2' : '2 → 1')}</span></button><button className="defence-fire" disabled={!active} onPointerDown={e => {
            if (firePointer.current !== null)
                return;
            e.preventDefault();
            firePointer.current = e.pointerId;
            e.currentTarget.setPointerCapture(e.pointerId);
            controller.current?.input.fire(true);
        }} onPointerUp={releaseFire} onPointerCancel={releaseFire} onLostPointerCapture={releaseFire} onKeyDown={e => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                controller.current?.input.fire(true);
            }
        }} onKeyUp={() => controller.current?.input.fire(false)} onBlur={() => controller.current?.input.fire(false)}>{text("FIRE ")}<span>{text("Assisted aim")}</span></button></div>
      {localizedContent(hud.threats === 0 && active && <button className="defence-restore" disabled={!active || !hud.near} onClick={() => controller.current?.input.interact()}>{localizedContent(hud.near ? 'Restore service' : 'Approach terminal →')}</button>)}
    </div>
    <footer className="defence-footer"><span>{localizedContent(session.status==='victory'?'Five services restored · Run complete':session.status==='intermission'?'Floor clear · Choose Continue when ready':session.status==='defeat'?'Run ended · Retry when ready':hud.threats===0?'Floor clear. Restore at the lower-right terminal.':'Both tools available · Unlimited packets · No audio')}</span><a href={localizedHref("/")}>{text("Portfolio ↗")}</a></footer>
  </main></div>;
}
