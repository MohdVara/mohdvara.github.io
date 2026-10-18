import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

const source = await readFile("src/analytics.ts", "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
}).outputText
  .replace(/import .* from "\.\/content";/, "")
  .replaceAll("import.meta.env", "env")
  .replace('import("posthog-js")', "loadSdk()")
  .replace("export async function", "async function");

function fixture(overrides = {}) {
  const events = [], listeners = {}, observed = [], registrations = [];
  let loads = 0, config;
  class Element { closest() { return null; } }
  class HTMLAnchorElement extends Element {
    constructor(href) { super(); this.href = href; this.pathname = new URL(href, "https://mohd.paramasvara.online").pathname; }
    closest(selector) { return selector === "a, button" ? this : { id: "contact" }; }
    getAttribute() { return this.href; }
    matches() { return false; }
  }
  class HTMLDetailsElement extends Element {
    open = true;
    matches() { return true; }
    closest() { return { id: "case-insurance" }; }
  }
  class IntersectionObserver {
    constructor(callback) { this.callback = callback; observed.push(this); }
    observe() {}
    unobserve(target) { this.removed = target; }
  }
  const client = {
    capture: (event, properties) => events.push({ event, properties }),
    register: (properties) => registrations.push(properties),
  };
  const context = vm.createContext({
    env: { PROD: true, VITE_POSTHOG_PROJECT_TOKEN: "phc_test", ...overrides.env },
    window: { location: { hostname: overrides.hostname || "mohd.paramasvara.online", pathname: "/" }, IntersectionObserver },
    navigator: { ...overrides.navigator },
    document: { addEventListener: (name, fn) => { listeners[name] = fn; }, querySelectorAll: () => [{ id: "work" }] },
    profile: { discovery: "https://cal.com/test", resume: "https://resume.test/", cv: "https://cv.test/" },
    Element, HTMLAnchorElement, HTMLDetailsElement, IntersectionObserver,
    loadSdk: async () => {
      loads++;
      if (overrides.fail) throw new Error("Blocked SDK");
      return { default: { init: (_token, options) => { config = options; options.loaded(client); } } };
    },
  });
  vm.runInContext(compiled, context);
  return { start: () => context.startAnalytics(), events, listeners, observed, registrations,
    anchor: (href) => new HTMLAnchorElement(href), details: () => new HTMLDetailsElement(),
    get loads() { return loads; }, get config() { return config; } };
}

test("analytics excludes unconfigured, local, preview, development, automated and DNT visits", async () => {
  for (const options of [
    { env: { VITE_POSTHOG_PROJECT_TOKEN: "" } }, { env: { PROD: false } },
    { hostname: "localhost" }, { hostname: "preview.pages.dev" },
    { navigator: { webdriver: true } }, { navigator: { doNotTrack: "1" } },
  ]) {
    const f = fixture(options); await f.start(); assert.equal(f.loads, 0);
  }
});

test("production initializes once and SDK failures do not reject startup", async () => {
  const f = fixture(); await f.start(); await f.start();
  assert.equal(f.loads, 1);
  assert.equal(f.config.disable_session_recording, true);
  assert.equal(f.config.session_recording.maskAllInputs, true);
  assert.equal(f.config.session_recording.recordBody, false);
  const broken = fixture({ fail: true }); await assert.doesNotReject(broken.start());
});

test("named conversions distinguish résumé, booking, email and disclosures", async () => {
  const f = fixture(); await f.start();
  for (const href of ["https://cal.com/test", "https://resume.test/", "mailto:owner@example.com"])
    f.listeners.click({ target: f.anchor(href) });
  f.listeners.toggle({ target: f.details() });
  const target = { id: "work" };
  f.observed[0].callback([{ isIntersecting: true, target }]);
  assert.deepEqual(f.events.map(item => item.event), ["booking_clicked", "resume_clicked", "email_clicked", "case_study_opened", "section_viewed"]);
  assert.equal(f.events[0].properties.placement, "contact");
  assert.equal(f.events[3].properties.case_id, "case-insurance");
  assert.equal(f.observed[0].removed, target);
  assert.ok(f.events.every(item => item.properties.page_path === "/"));
  assert.equal(f.config.enable_recording_console_log, false);
});


test("NTM engineering and experience paths emit distinct existing-vendor events", async () => {
  const f = fixture(); await f.start();
  for (const href of ["/no-two-mondays/", "https://modvar.itch.io/no-two-mondays"])
    f.listeners.click({ target: f.anchor(href) });
  assert.deepEqual(f.events.map(item => item.event), ["ntm_case_study_clicked", "external_project_clicked"]);
  assert.ok(f.events.every(item => Object.keys(item.properties).sort().join(",") === "page_path,placement"));
});
