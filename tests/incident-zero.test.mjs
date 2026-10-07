import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const source = await readFile("src/features/incident-zero/state.ts", "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText;
const logic = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);
const { initialState, incidentReducer: reduce, evidenceIds } = logic;
function investigate(all = true) {
  return (all ? evidenceIds : evidenceIds.slice(0, 4)).reduce(
    (state, id) => reduce(state, { type: "evidence", id }),
    initialState(),
  );
}
function finish(fix, strategy = "migrate", all = true) {
  let state = investigate(all);
  for (const id of ["source", "date"])
    state = reduce(state, { type: "puzzle", id });
  state = reduce(state, { type: "fix", id: fix });
  state = reduce(state, { type: "evidence", id: "integration-log" });
  for (const id of ["resilience", "architecture"])
    state = reduce(state, { type: "puzzle", id });
  return reduce(state, { type: "strategy", id: strategy });
}
test("simulation metrics clamp at both bounds without changing unaffected scores", () => {
  const metrics = initialState().metrics;
  assert.deepEqual(
    logic.adjust(metrics, { reliability: 500, technicalDebt: -500 }),
    { ...metrics, reliability: 100, technicalDebt: 0 },
  );
  assert.equal(metrics.reliability, 35);
});
test("evidence is unique and source investigation requires all four relevant records", () => {
  let state = initialState();
  assert.equal(logic.canResolveSource(state), false);
  state = reduce(state, { type: "evidence", id: "salary-history" });
  assert.equal(
    reduce(state, { type: "evidence", id: "salary-history" }),
    state,
  );
  assert.equal(logic.canResolveSource(investigate(false)), true);
});
test("progression prevents premature decisions, missing evidence and out-of-order puzzles", () => {
  const start = initialState();
  for (const action of [
    { type: "fix", id: "targeted" },
    { type: "strategy", id: "migrate" },
    { type: "puzzle", id: "source" },
    { type: "puzzle", id: "resilience" },
  ])
    assert.equal(reduce(start, action), start);
  assert.equal(logic.canEnter("architecture", start), false);
  let state = investigate(false);
  state = reduce(reduce(state, { type: "puzzle", id: "source" }), {
    type: "puzzle",
    id: "date",
  });
  state = reduce(state, { type: "fix", id: "targeted" });
  assert.equal(reduce(state, { type: "puzzle", id: "resilience" }), state);
  assert.equal(logic.canEnter("server", state), true);
});
test("puzzles validate ordering and exact historical connections rather than partial answers", () => {
  assert.equal(
    logic.validOrder(["sort", "filter", "limit"], logic.dateOrder),
    false,
  );
  assert.equal(logic.validOrder(logic.dateOrder, logic.dateOrder), true);
  assert.equal(
    logic.validOrder(logic.resilienceOrder, logic.resilienceOrder),
    true,
  );
  assert.equal(
    logic.validOrder(["deduplicate", "queue"], logic.resilienceOrder),
    false,
  );
  assert.equal(
    logic.validNetwork([
      "HRMS>HISTORY",
      "HISTORY>PAYROLL",
      "HISTORY>REPORTING",
    ]),
    true,
  );
  assert.equal(
    logic.validNetwork([
      "HRMS>PAYROLL",
      "HISTORY>PAYROLL",
      "HISTORY>REPORTING",
    ]),
    false,
  );
});
test("all main outcomes use explicit intervention and handover rules", () => {
  assert.equal(logic.endingFor(finish("manual")), "firefighter");
  assert.equal(logic.endingFor(finish("rewrite")), "rewrite");
  assert.equal(logic.endingFor(finish("targeted")), "modernizer");
  assert.equal(logic.endingFor(finish("targeted", "contain")), "firefighter");
  assert.equal(logic.endingFor(finish("targeted", "observe")), "firefighter");
  assert.equal(finish("targeted").phase, "ending");
});
test("Archaeologist is earned before modification; late evidence does not unlock it", () => {
  assert.equal(finish("targeted", "migrate", true).archaeologist, true);
  assert.equal(finish("targeted", "migrate", false).archaeologist, false);
});
test("completed games are immutable until replay resets every field", () => {
  const state = finish("rewrite");
  assert.equal(reduce(state, { type: "strategy", id: "contain" }), state);
  assert.deepEqual(reduce(state, { type: "reset" }), initialState());
});

test('effective-date resolution covers before, on and after boundaries and excludes future rows', () => {
  const rows = [{effective:'2026-11-01',salary:9000},{effective:'2026-01-01',salary:7500},{effective:'2026-10-01',salary:8500}];
  assert.equal(logic.resolveSalary(rows,'2025-12-31'),null);
  assert.equal(logic.resolveSalary(rows,'2026-09-30'),7500);
  assert.equal(logic.resolveSalary(rows,'2026-10-01'),8500);
  assert.equal(logic.resolveSalary(rows,'2026-10-15'),8500);
  assert.equal(logic.resolveSalary(rows,'2026-11-01'),9000);
  assert.equal(logic.resolveSalary(rows,'2026-12-01'),9000);
  assert.equal(rows[0].salary,9000);
});
test('delivery ordering distinguishes producer identity from worker claim and remote effects', () => {
  assert.equal(logic.deliveryFeedback(logic.resilienceOrder),'');
  assert.match(logic.deliveryFeedback(['queue','identity','deduplicate','external','retry','failure']),/producer.*before/);
  assert.match(logic.deliveryFeedback(['identity','deduplicate','queue','external','retry','failure']),/worker.*after/);
  assert.match(logic.deliveryFeedback(['identity','queue','external','deduplicate','retry','failure']),/local claim alone/);
  assert.match(logic.deliveryFeedback(['identity','queue','deduplicate','retry','external','failure']),/timeout.*unknown/);
  assert.match(logic.deliveryFeedback(['identity','queue','deduplicate','external','failure','retry']),/reconciliation/);
  assert.match(logic.deliveryFeedback(['queue','deduplicate','external','retry','failure']),/every responsibility/);
});
test('previews use the normal reducer outcome without awarding secret insight or leaking into replay', () => {
  for(const [fix,ending] of [['manual','firefighter'],['rewrite','rewrite'],['targeted','modernizer']]) {
    const preview=logic.previewState(fix);
    assert.equal(logic.endingFor(preview),ending);
    assert.equal(preview.archaeologist,false);
    assert.deepEqual(preview.metrics,finish(fix).metrics);
    const reset=reduce(preview,{type:'reset'});
    assert.deepEqual(reset,initialState());
    assert.equal(logic.canEnter('architecture',reset),false);
    assert.deepEqual(reduce(initialState(),{type:'preview',fix}),preview);
  }
});
test('system status and scores agree with every intervention and handover combination', () => {
 for(const fix of ['manual','rewrite','targeted']) for(const strategy of ['contain','observe','migrate']) {
  const state=finish(fix,strategy);
  assert.ok(Object.values(state.metrics).every(n=>Number.isFinite(n)&&n>=0&&n<=100));
  const status=logic.worldStatus(state);
  assert.match(status[0],fix==='manual'?/resolver unchanged/:fix==='rewrite'?/held/:/resolver corrected/);
  assert.match(status[1],/same-key retry/);
  assert.match(status[2],/history.*payroll and reporting/);
 }
 assert.ok(finish('manual').metrics.deliverySpeed > finish('rewrite').metrics.deliverySpeed);
 assert.ok(finish('manual').metrics.technicalDebt > finish('targeted').metrics.technicalDebt);
 assert.ok(finish('rewrite').metrics.reliability < finish('targeted').metrics.reliability);
 assert.ok(finish('manual').metrics.reliability < finish('targeted').metrics.reliability);
});
