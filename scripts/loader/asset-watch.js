// Capture native outcomes before head stylesheets can block the body bootstrap.
(() => {
  const states = new Map();
  const critical = node => {
    const module = node instanceof HTMLScriptElement && node.type === "module" && !/\/(?:@vite\/client|@react-refresh)$/.test(new URL(node.src, location.href).pathname);
    const style = node instanceof HTMLLinkElement && ["stylesheet", "modulepreload"].includes(node.rel);
    return (module || style) && new URL(node.src || node.href, location.href).origin === location.origin;
  };
  const capture = event => { if (critical(event.target)) states.set(event.target, event.type); };
  document.addEventListener("load", capture, true);
  window.addEventListener("error", capture, true);
  window.__portfolioAssetWatch = {states, critical, stop() {
    document.removeEventListener("load", capture, true);
    window.removeEventListener("error", capture, true);
  }};
})();
