/** Expose Vite's static startup graph as native, observable module preloads.
 * These are the imports the entry already requires, not optional lazy routes.
 * Production uses Vite's emitted chunk preloads instead of source modules. */
export async function devPreloads(server, entry = "/src/main.tsx") {
  const {default: ts} = await import("typescript");
  const urls = new Map(), queue = [entry];
  const key = url => { const parsed = new URL(url, "http://loader.local"); parsed.searchParams.delete("t"); return parsed.pathname + parsed.search; };
  urls.set(key(entry), entry);
  for (let index = 0; index < queue.length; index++) {
    const url = queue[index];
    const result = await server.transformRequest(url);
    if (!result) continue;
    const source = ts.createSourceFile(url, result.code, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    for (const node of source.statements) {
      if (!(ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) || !node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) continue;
      const specifier = node.moduleSpecifier.text;
      if (!specifier.startsWith("/") && !specifier.startsWith(".")) continue;
      const resolved = new URL(specifier, "http://loader.local" + url);
      if (resolved.origin !== "http://loader.local" || /^\/(?:@vite\/client|@react-refresh)$/.test(resolved.pathname)) continue;
      const next = resolved.pathname + resolved.search;
      if (urls.has(key(next))) continue;
      urls.set(key(next), next);
      queue.push(next);
    }
  }
  return [...urls.values()].filter(url => key(url) !== key(entry));
}
