import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

const source = await readFile("src/main.tsx", "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX,
} }).outputText;
function startup(pathname, { staticMain = true, missing = false } = {}) {
  const calls = [];
  vm.runInNewContext(compiled, {
    exports: {}, window: { location: { pathname } },
    document: { getElementById: () => ({ querySelector: selector => selector === "main" ? staticMain : missing }) },
    require: name => name === "react-dom/client" ? {
      hydrateRoot: () => calls.push("hydrate"),
      createRoot: () => ({ render: () => calls.push("render") }),
    } : name === "react/jsx-runtime" ? { jsx: () => ({}) }
      : name === "./analytics" ? { startAnalytics: () => {} } : {},
  });
  return calls;
}
test("all statically generated routes hydrate, including direct NTM visits", () => {
  for (const path of ["/", "/work-with-me", "/no-two-mondays", "/incident-zero", "/incident-zero/defence"])
    for (const suffix of path === "/" ? [""] : ["", "/"])
      assert.deepEqual(startup(path + suffix), ["hydrate"], path + suffix);
});
test("empty development roots and preview fallback use client rendering; static 404 hydrates", () => {
  assert.deepEqual(startup("/no-two-mondays/", { staticMain: false }), ["render"]);
  assert.deepEqual(startup("/unknown/"), ["render"]);
  assert.deepEqual(startup("/unknown/", { missing: true }), ["hydrate"]);
});
