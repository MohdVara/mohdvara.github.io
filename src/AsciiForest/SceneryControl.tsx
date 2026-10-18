import { useEffect, useState } from "react";
import { readSceneryPreference, setSceneryPreference, subscribeSceneryPreference } from "./preference";

export function SceneryControl() {
  const [enabled, setEnabled] = useState(true);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const sync = () => {
      setEnabled(readSceneryPreference());
      setReduced(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
    };
    sync();
    return subscribeSceneryPreference(sync);
  }, []);
  return <div className="scenery-control">
    <label className="theme-control"><span>Animated scenery</span>
      <select value={enabled ? "enabled" : "paused"} disabled={reduced}
        aria-describedby={reduced ? "scenery-motion-note" : undefined}
        onChange={event => setSceneryPreference(event.target.value === "enabled")}>
        <option value="enabled">Enabled</option><option value="paused">Paused</option>
      </select>
    </label>
    {reduced && <small id="scenery-motion-note">Paused to follow your device’s reduced motion setting.</small>}
  </div>;
}
