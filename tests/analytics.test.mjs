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
  .replace(/import .* from "\.\/analyticsPreference";/, "")
  .replaceAll("import.meta.env", "env")
  .replace('import("posthog-js")', "loadSdk()")
  .replace("export async function", "async function");

function fixture(overrides = {}) {
  const events = [], pageviews = [], listeners = {}, observed = [], registrations = [];
  let consent = overrides.consent !== false, preferenceListener, optIns = 0, optOuts = 0, disconnects = 0;
  let loads = 0, config, releaseSdk;
  const sdkGate = overrides.deferSdk ? new Promise(resolve => { releaseSdk = resolve; }) : Promise.resolve();
  class Element { closest() { return null; } }
  class HTMLAnchorElement extends Element {
    constructor(href) { super(); this.href = href; this.pathname = new URL(href, "https://mohd.paramasvara.online").pathname; this.search = new URL(href, "https://mohd.paramasvara.online").search; }
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
    disconnect() { disconnects++; }
  }
  const client = {
    capture: (event, properties) => (event === "$pageview" ? pageviews : events).push({ event, properties }),
    opt_in_capturing: () => optIns++,
    opt_out_capturing: () => optOuts++,
    register: (properties) => registrations.push(properties),
  };
  const context = vm.createContext({
    env: { PROD: true, VITE_POSTHOG_PROJECT_TOKEN: "phc_test", ...overrides.env },
    window: { location: { hostname: overrides.hostname || "mohd.paramasvara.online", pathname: "/" }, IntersectionObserver },
    navigator: { ...overrides.navigator },
    readAnalyticsPreference: () => consent,
    subscribeAnalyticsPreference: fn => { preferenceListener = fn; },
    document: { addEventListener: (name, fn) => { listeners[name] = fn; }, removeEventListener: name => { delete listeners[name]; }, querySelectorAll: () => [{ id: "work" }] },
    profile: { discovery: "https://cal.com/test", resume: "https://resume.test/", cv: "https://cv.test/" },
    Element, HTMLAnchorElement, HTMLDetailsElement, IntersectionObserver, URLSearchParams,
    loadSdk: async () => {
      loads++;
      await sdkGate;
      if (overrides.fail) throw new Error("Blocked SDK");
      return { default: { init: (_token, options) => { config = options; options.loaded(client); } } };
    },
  });
  vm.runInContext(compiled, context);
  return { start: () => context.startAnalytics(), events, listeners, observed, registrations,
    anchor: (href) => new HTMLAnchorElement(href), details: () => new HTMLDetailsElement(),
    get loads() { return loads; }, get config() { return config; }, pageviews,
    releaseSdk: () => releaseSdk?.(),
    get optIns() { return optIns; }, get optOuts() { return optOuts; }, get disconnects() { return disconnects; },
    changeConsent: async value => { consent = value; preferenceListener(); await context.startAnalytics(); } };
}

test("analytics excludes unconfigured, local, preview, development, automated and DNT visits", async () => {
  for (const options of [
    { env: { VITE_POSTHOG_PROJECT_TOKEN: "" } }, { env: { PROD: false } },
    { hostname: "localhost" }, { hostname: "preview.pages.dev" },
    { navigator: { webdriver: true } }, { navigator: { doNotTrack: "1" } },
    { navigator: { globalPrivacyControl: true } }, { consent: false },
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


test("analytics minimizes automatic capture and keeps replay disabled despite environment flags", async () => {
  const f = fixture({ env: { VITE_POSTHOG_SESSION_REPLAY: "true" } }); await f.start();
  assert.equal(f.config.autocapture, false);
  assert.equal(f.config.disable_session_recording, true);
  assert.ok(f.config.property_denylist.includes("$current_url"));
  assert.ok(f.config.property_denylist.includes("$referrer"));
  assert.equal(f.config.capture_pageview, false);
  assert.equal(f.pageviews.length, 1);
  assert.equal(f.config.persistence, "sessionStorage");
  assert.equal(f.config.opt_out_persistence_by_default, true);
});


test("Incident entry clicks distinguish preview from play without retaining query values", async () => {
  const f = fixture(); await f.start();
  for (const href of ["/incident-zero/?mode=preview&context=private", "/incident-zero/?mode=unrecognized"])
    f.listeners.click({ target: f.anchor(href) });
  assert.deepEqual(f.events.map(item => item.properties.mode), ["preview", "play"]);
  assert.ok(f.events.every(item => item.event === "incident_zero_clicked"));
  assert.ok(!JSON.stringify(f.events).includes("private"));
});


test("consent gates SDK loading, revocation removes listeners, and regrant does not duplicate tracking", async () => {
  const f = fixture({ consent: false }); await f.start();
  assert.equal(f.loads, 0); assert.deepEqual(Object.keys(f.listeners), []);
  await f.changeConsent(true);
  assert.equal(f.loads, 1); assert.equal(f.optIns, 1); assert.equal(f.pageviews.length, 1);
  const staleClick = f.listeners.click;
  await f.changeConsent(false);
  assert.equal(f.optOuts, 1); assert.equal(f.disconnects, 1);
  assert.deepEqual(Object.keys(f.listeners), []);
  staleClick({ target: f.anchor("https://resume.test/") });
  assert.equal(f.events.length, 0);
  await f.changeConsent(true); await f.start();
  assert.equal(f.loads, 1); assert.equal(f.optIns, 2); assert.equal(f.pageviews.length, 2);
  f.listeners.click({ target: f.anchor("https://resume.test/") });
  assert.deepEqual(f.events.map(item => item.event), ["resume_clicked"]);
});


test("withdrawal during optional SDK download prevents initialization and pageview", async () => {
  const f = fixture({ deferSdk: true });
  const startup = f.start();
  assert.equal(f.loads, 1);
  await f.changeConsent(false);
  f.releaseSdk(); await startup;
  assert.equal(f.config, undefined);
  assert.equal(f.optIns, 0); assert.equal(f.pageviews.length, 0);
});
