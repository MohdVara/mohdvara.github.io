import { useEffect, useRef, useState } from "react";
import type { GameController } from "./game";
import type { IncidentState, RoomId } from "./state";
import type { ObjectId } from "./story";
import { rooms } from "./story";
type Props = {
  state: IncidentState;
  room: RoomId;
  paused: boolean;
  onRoom: (room: RoomId) => void;
  onInspect: (id: ObjectId) => void;
  onNotice: (text: string) => void;

};
export default function CanvasWorld({
  state,
  room,
  paused,
  onRoom,
  onInspect,
  onNotice,

}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<GameController>();
  const callbacks = useRef({ state, room, onRoom, onInspect, onNotice });
  callbacks.current = { state, room, onRoom, onInspect, onNotice };
  const [near, setNear] = useState("");
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let disposed = false;
    const element = host.current!;
    const fail = () => {
      if (!disposed) {
        setFailed(true);
        queueMicrotask(() => {
          controller.current?.destroy();
          controller.current = undefined;
        });
      }
    };
    const sync = () =>
      controller.current?.sync(
        callbacks.current.state,
        document.documentElement.dataset.theme === "light",
        matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
    void import("./game")
      .then(({ createGame }) => {
        if (disposed) return;
        controller.current = createGame(
          element,
          {
            room: (id) => callbacks.current.onRoom(id),
            near: setNear,
            inspect: (id) => callbacks.current.onInspect(id),
            notice: (text) => callbacks.current.onNotice(text),
            failed: fail,
            ready: () => {
              if (disposed) return;
              const canvas = element.querySelector("canvas");
              canvas?.setAttribute("aria-hidden", "true");
              sync();
              controller.current?.travel(callbacks.current.room);
              setReady(true);
            },
          },
          callbacks.current.state,
        );
      })
      .catch(fail);
    const theme = new MutationObserver(sync);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    motion.addEventListener("change", sync);
    return () => {
      disposed = true;
      theme.disconnect();
      motion.removeEventListener("change", sync);
      controller.current?.destroy();
      controller.current = undefined;
    };
  }, [attempt]);
  useEffect(() => {
    controller.current?.sync(
      state,
      document.documentElement.dataset.theme === "light",
      matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, [state]);
  useEffect(() => {
    held.current.clear();
    controller.current?.pause(paused);
    if (!paused && ready) host.current?.focus({preventScroll:true});
  }, [paused, ready]);
  useEffect(() => {
    if (ready) controller.current?.travel(room);
  }, [room, ready]);
  const held = useRef(new Set<string>());
  useEffect(() => {
    const stop = () => { held.current.clear(); controller.current?.move(0, 0); };
    window.addEventListener("blur", stop);
    const visibility = () => { if (document.hidden) stop(); };
    document.addEventListener("visibilitychange", visibility);
    return () => { window.removeEventListener("blur", stop); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  const update = () => {
    const keys = held.current;
    controller.current?.move(
      Number(keys.has("ArrowRight") || keys.has("d")) -
        Number(keys.has("ArrowLeft") || keys.has("a")),
      Number(keys.has("ArrowDown") || keys.has("s")) -
        Number(keys.has("ArrowUp") || keys.has("w")),
    );
  };
  return (
    <div className="iz-world-wrap">
      <div
        className="iz-world"
        ref={host}
        tabIndex={0}
        role="group"
        aria-label="Top-down incident map. WASD or arrow keys move; E interacts. Use simplified navigation for a non-spatial alternative."
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          const key =
            event.key.length === 1 ? event.key.toLowerCase() : event.key;
          if (
            [
              "ArrowUp",
              "ArrowDown",
              "ArrowLeft",
              "ArrowRight",
              "w",
              "a",
              "s",
              "d",
            ].includes(key)
          ) {
            event.preventDefault();
            held.current.add(key);
            update();
          }
          if (["e", "Enter", " "].includes(key)) {
            event.preventDefault();
            if (!event.repeat) controller.current?.interact();
          }
        }}
        onKeyUp={(event) => {
          held.current.delete(
            event.key.length === 1 ? event.key.toLowerCase() : event.key,
          );
          update();
        }}
        onBlur={() => {
          held.current.clear();
          update();
        }}
      >
        {!ready && !failed && (
          <p className="iz-world-loading" role="status">
            Initialising the system map…
          </p>
        )}
      </div>
      {failed && (
        <div role="alert">
          <p>
            Incident map could not start. Simplified navigation keeps the entire
            story playable.
          </p>
          <button
            onClick={() => {
              setFailed(false);
              setReady(false);
              setAttempt((value) => value + 1);
            }}
          >
            Retry map
          </button>
        </div>
      )}
      <div className="iz-controls">
        <div className="iz-room-controls"><button disabled={paused} onClick={()=>controller.current?.travel((['reception','finance','hr','operations','server','architecture'] as RoomId[])[(['reception','finance','hr','operations','server','architecture'].indexOf(room)+5)%6])}>Previous room</button><button disabled={paused} onClick={()=>controller.current?.travel((['reception','finance','hr','operations','server','architecture'] as RoomId[])[(['reception','finance','hr','operations','server','architecture'].indexOf(room)+1)%6])}>Next room</button></div>
        <div className="iz-dpad" aria-label="Movement controls">
          {[
            ["↑", 0, -1],
            ["←", -1, 0],
            ["↓", 0, 1],
            ["→", 1, 0],
          ].map(([label, x, y]) => (
            <button
              key={label}
              disabled={paused || !ready}
              aria-label={`Move ${label === "↑" ? "up" : label === "↓" ? "down" : label === "←" ? "left" : "right"}`}
              onPointerDown={(event) => {
                // Keep pointer presses from moving focus off the map, whose
                // blur handler correctly stops keyboard movement.
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                controller.current?.move(Number(x), Number(y));
              }}
              onPointerUp={() => controller.current?.move(0, 0)}
              onPointerCancel={() => controller.current?.move(0, 0)}
              onLostPointerCapture={() => controller.current?.move(0, 0)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  controller.current?.move(Number(x), Number(y));
                }
              }}
              onKeyUp={() => controller.current?.move(0, 0)}
              onBlur={() => controller.current?.move(0, 0)}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          className="iz-interact"
          disabled={paused || !ready}
          onClick={() => controller.current?.interact()}
        >
          {near ? `Inspect ${near}` : "Interact"}
        </button>
      </div>
      <div className="iz-touch-only iz-touch-inspect">
        <strong>In this room</strong>
        <div className="iz-location-list">
          {rooms.find(item => item.id === room)?.objects.map(item => (
            <button key={item.id} disabled={paused || !ready} onClick={() => onInspect(item.id)}>
              Inspect {item.title}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
