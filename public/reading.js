// Apply saved text sizing before paint, with no dependency on React.
(() => {
  const key = "portfolio-text-size";
  const valid = (value) => ["default", "large", "largest"].includes(value);
  let size = "default";
  try {
    const saved = localStorage.getItem(key);
    if (valid(saved)) size = saved;
  } catch { /* The control also works with storage disabled. */ }
  const apply = () => {
    document.documentElement.dataset.textSize = size;
    window.dispatchEvent(new Event("text-size-change"));
    // Notify motion observers to refresh geometry after text reflows.
    window.dispatchEvent(new Event("resize"));
  };
  window.addEventListener("text-size-preference", (event) => {
    if (!valid(event.detail)) return;
    size = event.detail;
    try { localStorage.setItem(key, size); } catch { /* Keep the in-memory choice. */ }
    apply();
  });
  window.addEventListener("storage", (event) => {
    if (event.key !== key && event.key !== null) return;
    size = valid(event.newValue) ? event.newValue : "default";
    apply();
  });
  apply();
})();
