// Dependency-injected clock makes visibility, pause, and disposal testable without
// pretending a configured frame rate is an observed performance measurement.
export type Clock = { request: (cb: FrameRequestCallback) => number; cancel: (id: number) => void };
export function createAnimation(clock: Clock, draw: (time: number) => void, fps = 25) {
  let frame = 0, active = false, disposed = false, previous: number | undefined, time = 0, painted = 0;
  const tick = (now: number) => {
    frame = 0;
    if (!active || disposed) return;
    if (previous === undefined) previous = now;
    time += Math.min(80, Math.max(0, now - previous));
    previous = now;
    const interval = 1000 / fps;
    if (now - painted >= interval) {
      // Keep the fractional remainder: resetting to `now` quantizes 25 FPS down
      // to 20 on a 60 Hz display (three browser frames per paint).
      painted = now - (now - painted) % interval;
      draw(time / 1000);
    }
    if (active && !disposed) frame = clock.request(tick);
  };
  return {
    setActive(value: boolean) {
      if (disposed || active === value) return;
      active = value; previous = undefined;
      if (active) frame = clock.request(tick);
      else { clock.cancel(frame); frame = 0; }
    },
    dispose() { disposed = true; active = false; clock.cancel(frame); frame = 0; },
    get time() { return time / 1000; },
  };
}
