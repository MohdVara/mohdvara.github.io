import { useReducer, useState, useRef } from "react";
import {
  incidentReducer,
  initialState,
  canResolveSource,
  canEnter,
  worldStatus,
  type RoomId,
  type PuzzleId,
  type FixId,
  type StrategyId,
} from "./state";
import {
  rooms,
  dialogue,
  evidence,
  objectives,
  fixes,
  strategies,
  type ObjectId,
} from "./story";
import CanvasWorld from "./CanvasWorld";
import Modal from "./Modal";
import Puzzles from "./Puzzles";
import EndingScreen from "./EndingScreen";
type Overlay =
  | { type: "dialogue"; node: string }
  | { type: "puzzle"; id: PuzzleId }
  | { type: "fix" }
  | { type: "strategy" }
  | { type: "consequence"; title: string; immediate: string; later: string }
  | { type: "pause" }
  | { type: "recruiter" }
  | { type: "help" }
  | null;
export default function GameShell({ preview = false }: { preview?: boolean }) {
  const toolbar = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(
    incidentReducer,
    undefined,
    initialState,
  );
  const [room, setRoom] = useState<RoomId>("reception");
  const [simplified, setSimplified] = useState(preview);
  const [overlay, setOverlay] = useState<Overlay>(preview ? { type: "recruiter" } : { type: "dialogue", node: "manager" });
  const [notice, setNotice] = useState("");
  const [onboarded, setOnboarded] = useState(false);
  const [recruiterPreview,setRecruiterPreview]=useState(false);
  const previewEnding=(fix:FixId)=>{
    dispatch({type: 'preview', fix});
    setRecruiterPreview(true);setOverlay(null);
  };
  const inspect = (id: ObjectId) => {
    setNotice("");
    setOverlay({ type: "dialogue", node: id });
  };
  const reset = () => {
    setRecruiterPreview(false);
    setSimplified(false);
    requestAnimationFrame(() => toolbar.current?.scrollIntoView({ behavior: "instant", block: "start" }));
    dispatch({ type: "reset" });
    setRoom("reception");
    setOverlay({ type: "dialogue", node: "manager" });
    setNotice("");
  };
  const finishDialogue = (skip = false) => {
    if (overlay?.type !== "dialogue") return;
    if (overlay.node === "manager") setOnboarded(true);
    let node = dialogue[overlay.node];
    if (skip) {
      while (node.next || node.choices)
        node = dialogue[node.next || node.choices![0].next];
    } else if (node.next) {
      setOverlay({ type: "dialogue", node: node.next });
      return;
    }
    if (node.evidence) {
      dispatch({ type: "evidence", id: node.evidence });
      setNotice(`Evidence collected: ${evidence[node.evidence].title}`);
    }
    setOverlay(null);
  };
  const phase = state.phase;
  const sourceReady = canResolveSource(state);
  const openTask = () => {
    if (phase === "fix" || phase === "strategy") setOverlay({ type: phase });
    else if (phase === "investigation")
      setOverlay({ type: "puzzle", id: "source" });
    else if (
      phase === "date" ||
      phase === "resilience" ||
      phase === "architecture"
    )
      setOverlay({ type: "puzzle", id: phase });
  };
  const taskDisabled =
    (phase === "investigation" && !sourceReady) ||
    (phase === "resilience" && !state.evidence.includes("integration-log")) ||
    (phase === "architecture" && room !== "architecture");
  const chooseFix = (id: FixId) => {
    const choice = fixes.find((item) => item.id === id)!;
    dispatch({ type: "fix", id });
    setOverlay({
      type: "consequence",
      title: choice.title,
      immediate: choice.immediate,
      later: choice.later,
    });
  };
  const chooseStrategy = (id: StrategyId) => {
    const choice = strategies.find((item) => item.id === id)!;
    dispatch({ type: "strategy", id });
    setOverlay({
      type: "consequence",
      title: choice.title,
      immediate: "Your handover plan is recorded.",
      later: choice.consequence,
    });
  };
  const location = rooms.find((item) => item.id === room)!;
  return (
    <div
      className="iz-game"
      onKeyDown={(event) => {
        if(!overlay && event.target instanceof HTMLElement && event.target.classList.contains('iz-world')) {
          if(event.key.toLowerCase()==='r'){event.preventDefault();if(!taskDisabled)openTask();}
          if(event.key.toLowerCase()==='n'){event.preventDefault();const next=rooms[(rooms.findIndex(item=>item.id===room)+1)%rooms.length].id;if(canEnter(next,state))setRoom(next);}
          if(event.key.toLowerCase()==='b'){event.preventDefault();const next=rooms[(rooms.findIndex(item=>item.id===room)+5)%rooms.length].id;if(canEnter(next,state))setRoom(next);}
        }
        if (event.key === "Escape" && !overlay && phase !== "ending") {
          event.preventDefault();
          setOverlay({ type: "pause" });
        }
      }}
    >
      {phase === "ending" ? (
        <><p className="iz-muted">{recruiterPreview?'Recruiter preview / Decisions were auto-selected for this demonstration. No investigation credit claimed.':''}</p><EndingScreen active={!overlay} preview={recruiterPreview} state={{...state,archaeologist:state.archaeologist&&!recruiterPreview}} onReplay={reset} /></>
      ) : (
        <>
          <div className="iz-toolbar" ref={toolbar}>
            <div>
              <span className="mono">
                FIELD / {location.title.toUpperCase()}
              </span>
              <p>{objectives[phase]}</p>
            </div>
            <div className="iz-toolbar-actions">
              <span className="iz-muted">{state.evidence.length} / 6 evidence</span>
              <button className="iz-current-task" disabled={taskDisabled} onClick={openTask}>Open current task →</button>
              <button onClick={() => setOverlay({ type: "help" })}>Help</button>
              <button onClick={() => setOverlay({ type: "pause" })}>Pause</button>
            </div>
          </div>
          <details className="iz-system-status">
            <summary>Current system status</summary>
            <ul aria-live="polite">{worldStatus(state).map(text => <li key={text}>{text}</li>)}</ul>
          </details>
          <div className="iz-game-layout">
            <section aria-label="Incident exploration">
              <div className="iz-mode">
                <button
                  aria-pressed={simplified}
                  onClick={() => setSimplified((value) => !value)}
                >
                  {simplified ? "Use spatial map" : "Use simplified navigation"}
                </button>

              </div>
              {simplified ? (
                <div className="iz-structured">
                  <p className="eyebrow mono">
                    Current room / {location.title}
                  </p>
                  <h2>{location.subtitle.slice(5)}</h2>
                  <p>
                    Visit a location, then inspect its people or records. This
                    mode contains the complete incident.
                  </p>
                  <h3>Available locations</h3>
                  <div className="iz-location-list">
                    {rooms.map((item) => (
                      <button
                        key={item.id}
                        disabled={!canEnter(item.id, state)}
                        aria-pressed={room === item.id}
                        onClick={() => setRoom(item.id)}
                      >
                        {item.title}
                        {!canEnter(item.id, state) ? " / locked" : ""}
                      </button>
                    ))}
                  </div>
                  <h3>People &amp; terminals</h3>
                  {location.objects.length ? (
                    <div className="iz-location-list">
                      {location.objects.map((item) => (
                        <button key={item.id} onClick={() => inspect(item.id)}>
                          Inspect {item.title}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p>
                      The historical contract is ready to connect at the
                      evidence desk.
                    </p>
                  )}
                </div>
              ) : (
                <CanvasWorld
                  state={state}
                  room={room}
                  paused={!!overlay}
                  onRoom={setRoom}
                  onInspect={inspect}
                  onNotice={setNotice}
                />
              )}
              <p className="iz-notice" role="status">
                {notice}
              </p>
              {!simplified && (
                <details className="iz-room-shortcuts">
                  <summary>Location directory / accessible travel</summary>
                  <div className="iz-location-list">
                    {rooms.map((item) => (
                      <button
                        key={item.id}
                        disabled={!canEnter(item.id, state)}
                        onClick={() => setRoom(item.id)}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                </details>
              )}
            </section>
            <aside className="iz-evidence" aria-labelledby="iz-evidence-title">
              <p className="eyebrow mono">Investigation desk</p>
              <h2 id="iz-evidence-title">Evidence, before edits.</h2>
              <ul>
                {state.evidence.map((id) => (
                  <li key={id}>
                    <details>
                      <summary>{evidence[id].title}</summary>
                      <p>{evidence[id].text}</p>
                    </details>
                  </li>
                ))}
              </ul>
              {!state.evidence.length && (
                <p className="iz-muted">
                  Talk to the delivery lead, then compare the records in Finance
                  and HR.
                </p>
              )}
              <button
                className="button primary iz-task"
                disabled={taskDisabled}
                onClick={openTask}
              >
                {phase === "investigation"
                  ? "Resolve the discrepancy"
                  : phase === "date"
                    ? "Build date resolution"
                    : phase === "fix"
                      ? "Choose immediate fix"
                      : phase === "resilience"
                        ? "Build integration safeguards"
                        : phase === "architecture"
                          ? "Connect system boundaries"
                          : "Choose the handover"}{" "}
                →
              </button>
              {taskDisabled && (
                <p className="iz-muted">
                  {phase === "resilience"
                    ? "Inspect the Operations engineer’s log first."
                    : phase === "architecture"
                      ? "Enter Architecture Space using a side door or the location directory."
                      : "Collect the Finance report, HR approval, payroll preview and salary history first."}
                </p>
              )}
              {state.fix && (
                <p className="iz-world-state">
                  {fixes.find((item) => item.id === state.fix)?.immediate}
                </p>
              )}
              <p className="iz-small">
                All names, records and system relationships are synthetic.
                Nothing here changes a real production system.
              </p>
            </aside>
          </div>
        </>
      )}
      {overlay && (
        <Modal key={overlay.type==='dialogue'?overlay.node:overlay.type} onClose={() => setOverlay(null)}>
          {overlay.type === "help" && <>
            <h2>Find the evidence. Test the reasoning.</h2>
            <p>Compare Finance, HR, payroll history and Operations. Open the current task when its evidence is ready. The location directory and simplified navigation provide the complete story without precise movement.</p>
            <div className="iz-keyboard-only"><h3>Keyboard</h3><p>WASD / arrows move. E / Enter inspects. R opens the current task. N / B changes rooms. Escape pauses or closes a dialog.</p><p>Tab highlights the next choice or ↑ / ↓ button; Shift + Tab goes back. Enter / Space activates it. In dialogs, up/down changes the highlighted button, not the list order. Radio choices use arrow keys; checkboxes use Space.</p></div>
            <div className="iz-touch-only"><h3>Touch</h3><p>Tap the map to walk, or hold a direction on the pad. Release to stop. Tap Interact nearby or use the direct inspection buttons. Previous / Next room travels; tap dialog choices or puzzle arrows.</p></div>
            <button className="button primary" onClick={() => setOverlay(null)}>Return to investigation</button>
          </>}
          {overlay.type==='recruiter'&&<><h2>The calendar invite is in five minutes.</h2><p>Choose the ending you want to preview. I’ll select its decisions for you. This is a demonstration, not a completed investigation.</p><div className="iz-decision-list">{[['manual','The Firefighter / shipped today, paged tomorrow'],['rewrite','The Great Rewrite / impeccable diagram, awkward Monday'],['targeted','The Pragmatic Modernizer / a boundary and a sensible bedtime']].map(([id,label])=><button key={id} onClick={()=>previewEnding(id as FixId)}>{label}</button>)}</div></>}
          {overlay.type === "dialogue" && (
            <>
              <p className="eyebrow mono">{dialogue[overlay.node].speaker}</p>
              <h2>
                {dialogue[overlay.node].speaker.includes("terminal")
                  ? "Inspect the record"
                  : "Follow the evidence."}
              </h2>
              <p className="iz-dialogue-text">{dialogue[overlay.node].text}</p>
              {overlay.node === "manager" && !onboarded && <p className="iz-small">Travel between rooms, inspect people and records, then open the current task. Help keeps the controls available throughout.</p>}
              <div className="iz-actions">
                {overlay.node==='manager'&&<button onClick={()=>setOverlay({type:'recruiter'})}>I’m a recruiter. Show me the ending.</button>}
                {dialogue[overlay.node].choices ? (
                  dialogue[overlay.node].choices!.map((choice) => (
                    <button
                      key={choice.next}
                      onClick={() =>
                        setOverlay({ type: "dialogue", node: choice.next })
                      }
                    >
                      {choice.label}
                    </button>
                  ))
                ) : (
                  <button
                    className="button primary"
                    onClick={() => finishDialogue()}
                  >
                    {dialogue[overlay.node].next
                      ? "Continue"
                      : "Record & return"}{" "}
                    →
                  </button>
                )}
                <button onClick={() => finishDialogue(true)}>
                  Skip conversation
                </button>
              </div>
            </>
          )}
          {overlay.type === "puzzle" && (
            <Puzzles
              key={overlay.id}
              id={overlay.id}
              onSolved={() => {
                dispatch({ type: "puzzle", id: overlay.id });
                setNotice(
                  "Reasoning recorded. The next investigation step is available.",
                );
                setOverlay(null);
              }}
            />
          )}
          {(overlay.type === "fix" || overlay.type === "strategy") && (
            <>
              <p className="eyebrow mono">Decision / Trade-offs</p>
              <h2>
                {overlay.type === "fix"
                  ? "What changes before tomorrow?"
                  : "What do we leave behind?"}
              </h2>
              <p className="iz-muted">
                Payroll closes tomorrow. The reporting consumer has limited regression coverage and its owner is unavailable today. A reviewed one-run correction can meet the deadline; a code change needs captured outputs and rollback. A full migration cannot be verified tonight.
              </p>
              {overlay.type === "fix" && <p className="iz-world-state">{state.evidence.includes("legacy-query") ? "Your resolver evidence exposed the second reporting consumer. Include its captured output in the test scope." : "You have not inspected the legacy resolver. The shared consumer contract is still unverified; the Server room can reduce that uncertainty before you choose."}</p>}
              <div className="iz-decision-list">
                {overlay.type === "fix"
                  ? fixes.map((item) => (
                      <button key={item.id} onClick={() => chooseFix(item.id)}>
                        <strong>{item.title}</strong>
                        <span>{item.summary}</span>
                      </button>
                    ))
                  : strategies.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => chooseStrategy(item.id)}
                      >
                        <strong>{item.title}</strong>
                        <span>{item.summary}</span>
                      </button>
                    ))}
              </div>
            </>
          )}
          {overlay.type === "consequence" && (
            <>
              <p className="eyebrow mono">Decision recorded</p>
              <h2>{overlay.title}</h2>
              <h3>Immediate effect</h3>
              <p>{overlay.immediate}</p>
              <h3>What follows</h3>
              <p>{overlay.later}</p>
              <button
                className="button primary"
                onClick={() => setOverlay(null)}
              >
                {phase === "ending"
                  ? "Read the incident report"
                  : "Continue investigation"}{" "}
                →
              </button>
            </>
          )}
          {overlay.type === "pause" && (
            <>
              <h2>The incident can wait.</h2>
              <p>
                Progress lives in this tab. Leaving or refreshing starts a fresh
                incident.
              </p>
              <div className="iz-actions">
                <button
                  className="button primary"
                  onClick={() => setOverlay(null)}
                >
                  Resume investigation
                </button>
                <button onClick={reset}>Restart incident</button>
                <a className="text-link" href="/">
                  Return to portfolio ↗
                </a>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
