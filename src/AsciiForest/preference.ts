const key = "baa-scenery";
const change = "baa-scenery-change";
const motionQuery = "(prefers-reduced-motion: reduce)";
let transientChoice: boolean | undefined;

// Effective animation permission: the OS always takes priority over a saved choice.
export function readSceneryPreference(): boolean {
  if (typeof window === "undefined") return true;
  if (window.matchMedia?.(motionQuery).matches) return false;
  if (transientChoice !== undefined) return transientChoice;
  try { return localStorage.getItem(key) !== "paused"; }
  catch { return true; }
}

export function setSceneryPreference(enabled: boolean) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, enabled ? "enabled" : "paused");
    transientChoice = undefined;
  } catch { transientChoice = enabled; }
  window.dispatchEvent(new Event(change));
}

export function subscribeSceneryPreference(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const motion = window.matchMedia?.(motionQuery);
  const storage = (event: StorageEvent) => {
    if (event.key !== key && event.key !== null) return;
    transientChoice = undefined;
    listener();
  };
  window.addEventListener(change, listener);
  window.addEventListener("storage", storage);
  motion?.addEventListener("change", listener);
  return () => {
    window.removeEventListener(change, listener);
    window.removeEventListener("storage", storage);
    motion?.removeEventListener("change", listener);
  };
}
