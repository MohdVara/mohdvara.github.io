const key = "portfolio-analytics-consent-v1";
let transientChoice: boolean | undefined;

export function readAnalyticsPreference() {
  if (typeof window === "undefined") return false;
  if (transientChoice !== undefined) return transientChoice;
  try { return localStorage.getItem(key) === "granted"; }
  catch { return false; }
}

export function setAnalyticsPreference(enabled: boolean) {
  try {
    localStorage.setItem(key, enabled ? "granted" : "denied");
    transientChoice = undefined;
  } catch { transientChoice = enabled; }
  window.dispatchEvent(new Event("analytics-preference-change"));
}

export function subscribeAnalyticsPreference(listener: () => void) {
  const storage = (event: StorageEvent) => {
    if (event.key !== key && event.key !== null) return;
    transientChoice = undefined;
    listener();
  };
  window.addEventListener("analytics-preference-change", listener);
  window.addEventListener("storage", storage);
  return () => {
    window.removeEventListener("analytics-preference-change", listener);
    window.removeEventListener("storage", storage);
  };
}
