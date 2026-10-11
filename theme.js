// Runs before first paint and independently of React hydration.
(() => {
  const key = "portfolio-theme";
  const valid = (value) => ["system", "time", "light", "dark"].includes(value);
  const system = window.matchMedia("(prefers-color-scheme: dark)");
  let preference = "system";
  try {
    const saved = localStorage.getItem(key);
    if (valid(saved)) preference = saved;
  } catch { /* Storage may be disabled; theme changes still work in memory. */ }

  const apply = () => {
    const hour = new Date().getHours();
    const theme = preference === "system"
      ? (system.matches ? "dark" : "light")
      : preference === "time"
        ? (hour >= 7 && hour < 19 ? "light" : "dark")
        : preference;
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.themePreference = preference;
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      "content", theme === "light" ? "#faf8f2" : "#101110",
    );
    window.dispatchEvent(new Event("theme-change"));
  };

  window.addEventListener("theme-preference", (event) => {
    if (!valid(event.detail)) return;
    preference = event.detail;
    try { localStorage.setItem(key, preference); } catch { /* Use memory. */ }
    apply();
  });
  window.addEventListener("storage", (event) => {
    if (event.key !== key && event.key !== null) return;
    preference = valid(event.newValue) ? event.newValue : "system";
    apply();
  });
  system.addEventListener("change", apply);
  window.addEventListener("focus", apply);
  document.addEventListener("visibilitychange", apply);
  // Recheck the local clock, including clock/timezone changes, every minute.
  window.setInterval(() => { if (preference === "time") apply(); }, 60_000);
  apply();
})();
