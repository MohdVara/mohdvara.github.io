// Standalone: runs before React, with no imports, network requests or render loop.
(() => {
  const shell = document.getElementById("portfolio-loader");
  const data = JSON.parse(document.getElementById("portfolio-loader-locales").textContent);
  const locales = Object.keys(data);
  const normalize = value => {
    const tag = value.toLowerCase().replaceAll("_", "-");
    if (tag === "zh" || tag.startsWith("zh-hans") || /^zh-(cn|sg)(-|$)/.test(tag)) return "zh-Hans";
    if (tag.startsWith("zh")) return undefined;
    if (tag === "pt" || tag.startsWith("pt-")) return "pt-BR";
    return locales.find(locale => locale === tag.split("-")[0]);
  };
  let saved;
  try { saved = localStorage.getItem("portfolio.locale.v1"); } catch { /* Optional storage. */ }
  const segment = location.pathname.split("/")[1];
  const locale = (locales.includes(segment) && segment) || (locales.includes(saved) && saved) || (navigator.languages || [navigator.language]).map(normalize).find(Boolean) || "en";
  const [direction, brand, loading, failed, retry, dismiss, slow, connection, progressLabel, starting, pendingLabel, completedLabel] = data[locale];
  shell.lang = locale;
  shell.dir = direction;
  const monogram = shell.querySelector(".monogram");
  monogram.firstChild.nodeValue = brand;
  monogram.lang = locale;
  const message = shell.querySelector(".loader-message");
  message.textContent = loading;
  const retryLink = shell.querySelector("a");
  retryLink.textContent = retry;
  retryLink.href = location.href;
  const dismissButton = shell.querySelector("button");
  dismissButton.textContent = dismiss;
  const watch = window.__portfolioAssetWatch;
  watch?.stop();
  delete window.__portfolioAssetWatch;
  // Count declared same-origin startup files, not the undiscovered import graph.
  const assets = watch?.states || new Map();
  for (const node of document.querySelectorAll('script[type="module"][src],link[rel="stylesheet"][href],link[rel="modulepreload"][href]')) {
    if (watch?.critical(node) && !assets.has(node)) assets.set(node, node.sheet ? "load" : "pending");
  }
  const progress = shell.querySelector(".loader-progress");
  const number = new Intl.NumberFormat(locale);
  const updateProgress = () => {
    const counts = [...assets.values()];
    const pendingCount = counts.filter(state => state === "pending").length;
    progress.hidden = !counts.length;
    progress.textContent = progressLabel.replace("{{loaded}}", number.format(counts.filter(state => state === "load").length)).replace("{{pending}}", number.format(pendingCount));
    const filename = node => new URL(node.src || node.href, location.href).pathname.split("/").pop();
    const names = state => [...assets].filter(([, outcome]) => outcome === state).map(([node]) => filename(node));
    shell.querySelector(".loader-pending").textContent = pendingLabel.replace("{{file}}", names("pending").slice(0, 2).join(", ") || "—");
    shell.querySelector(".loader-completed").textContent = completedLabel.replace("{{file}}", names("load").slice(-2).join(", ") || "—");
    if (counts.length && !pendingCount && !counts.includes("error") && ["waiting", "loading"].includes(shell.dataset.state)) message.textContent = starting;
  };
  // Vite can discover locale/route styles after entry execution begins.
  const discover = new MutationObserver(records => {
    let changed = false;
    for (const record of records) {
      if (record.target !== document.head && record.target !== document.body) continue;
      for (const node of record.addedNodes) {
      if (watch?.critical(node) && !assets.has(node)) {
        assets.set(node, node.sheet ? "load" : "pending");
        changed = true;
      }
    }
    }
    if (changed) updateProgress();
  });
  discover.observe(document.documentElement, {childList: true, subtree: true});
  const failedStyles = new Set();
  let done = false, committed = false;
  shell.querySelector(".loader-detail").textContent = connection;
  let showTimer, slowTimer, removal;
  const cleanup = () => {
    clearTimeout(showTimer); clearTimeout(slowTimer);
    discover.disconnect();
    document.removeEventListener("DOMContentLoaded", parsed);
    window.removeEventListener("portfolio:ready", ready);
    window.removeEventListener("portfolio:failed", fail);
    window.removeEventListener("error", assetError, true);
    document.removeEventListener("load", assetLoaded, true);
    window.removeEventListener("unhandledrejection", fail);
  };
  const remove = () => { cleanup(); clearTimeout(removal); shell.remove(); };
  const ready = () => {
    if (done) return;
    committed = true;
    if (failedStyles.size) { fail(); return; }
    // The committed usable frame is authoritative; optional preloads never gate it.
    done = true;
    cleanup();
    if (!["loading", "slow"].includes(shell.dataset.state) || matchMedia("(prefers-reduced-motion: reduce)").matches) remove();
    else {
      shell.dataset.state = "leaving";
      removal = setTimeout(remove, 180); // Removal only; never delays readiness.
    }
  };
  const recover = state => {
    if (done || (state === "slow" && shell.dataset.state === "failed")) return;
    // Asset failures can arrive before the parser reaches the static root.
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", parsed, { once: true });
    clearTimeout(showTimer); clearTimeout(slowTimer);
    const hasStatic = !!document.querySelector("#root main");
    shell.dataset.static = String(hasStatic);
    dismissButton.hidden = !hasStatic;
    shell.dataset.state = state;
    // Announce a state change once; parser reconciliation only refreshes controls.
    const nextMessage = state === "failed" ? failed : slow;
    if (message.textContent !== nextMessage) {
      message.setAttribute("role", "status");
      message.textContent = nextMessage;
    }
  };
  const parsed = () => recover(shell.dataset.state);
  const fail = () => recover("failed");
  function assetError(event) {
    if (watch?.critical(event.target)) {
      if (assets.has(event.target)) assets.set(event.target, "error");
      updateProgress();
      if (event.target.rel === "modulepreload") return;
      if (event.target instanceof HTMLLinkElement) failedStyles.add(event.target);
      fail();
    } else if (event instanceof ErrorEvent) fail();
  }
  function assetLoaded(event) {
    if (!watch?.critical(event.target)) return;
    if (assets.has(event.target)) assets.set(event.target, "load");
    updateProgress();
    failedStyles.delete(event.target);
    if (committed) ready();
  }
  dismissButton.addEventListener("click", () => { done = true; remove(); });
  window.addEventListener("portfolio:ready", ready);
  window.addEventListener("portfolio:failed", fail);
  window.addEventListener("error", assetError, true);
  document.addEventListener("load", assetLoaded, true);
  window.addEventListener("unhandledrejection", fail);
  showTimer = setTimeout(() => { if (!done) shell.dataset.state = "loading"; }, 120);
  // A slow response is not evidence of failure. Offer recovery while downloads
  // and CSS motion continue; a later real commit still dismisses the shell.
  slowTimer = setTimeout(() => recover("slow"), 30000);
  updateProgress();
  for (const [target, outcome] of watch?.states || []) if (outcome === "error") assetError({target});
})();
