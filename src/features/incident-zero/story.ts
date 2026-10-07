import type {
  EvidenceId,
  FixId,
  StrategyId,
  EndingId,
  Phase,
  RoomId,
} from "./state";
export const evidence: Record<EvidenceId, { title: string; text: string }> = {
  "finance-report": {
    title: "Finance reconciliation",
    text: "October preview: employee #1042 differs by RM1,000. Finance expected RM8,500; payroll used RM7,500. This is a synthetic incident, not a real payroll report.",
  },
  "hr-record": {
    title: "HR approval",
    text: "Employee #1042 · approved salary RM8,500 · effective 01 October. HR displays today’s approved record, not the record used by the export.",
  },
  "payroll-record": {
    title: "Payroll preview",
    text: "Target date: 15 October. Selected salary: RM7,500. Preview only; no money has been disbursed. Reconcile before closing payroll.",
  },
  "salary-history": {
    title: "Effective-dated history",
    text: "01 January: RM7,500. 01 October: RM8,500. 01 November: RM9,000. The future increase must not leak into October payroll.",
  },
  "integration-log": {
    title: "Integration log",
    text: "02:14 SUCCESS means the HTTP request completed. A timeout at 02:13 triggered a retry; the destination later accepted both deliveries. No stable event key or reconciliation check.",
  },
  "legacy-query": {
    title: "Legacy resolver",
    text: "The export takes the first matching history row without descending date order. An undocumented reporting job also consumes this resolver. Changing its contract affects two consumers.",
  },
};
export type DialogueNode = {
  id: string;
  speaker: string;
  text: string;
  next?: string;
  evidence?: EvidenceId;
  choices?: { label: string; next: string }[];
};
export type ObjectId =
  | "manager"
  | "finance"
  | "hr"
  | "operations"
  | "owner"
  | "payroll"
  | "history"
  | "query";
export const dialogue: Record<string, DialogueNode> = {
  manager: {
    id: "manager",
    speaker: "Delivery lead",
    text: "Monday, 08:47. Payroll closes tomorrow. Finance, HR and Operations each have a different version of “correct”. Find evidence before changing production.",
    choices: [
      { label: "What is the boundary?", next: "boundary" },
      { label: "I will inspect the records.", next: "brief" },
    ],
  },
  boundary: {
    id: "boundary",
    speaker: "Delivery lead",
    text: "Keep the payroll preview safe. We can stop an export; we cannot undo a payment with a prettier architecture diagram.",
    next: "brief",
  },
  brief: {
    id: "brief",
    speaker: "Engineer",
    text: "Visit Finance, HR and Operations. Compare what was approved, what was selected, and what actually arrived. The evidence desk keeps your notes.",
  },
  finance: {
    id: "finance",
    speaker: "Finance analyst",
    text: "The total does not match what HR approved. One synthetic employee is enough to trace it: #1042. The difference is RM1,000.",
    next: "finance-proof",
  },
  "finance-proof": {
    id: "finance-proof",
    speaker: "Finance analyst",
    text: "We have not disbursed anything. The preview is the right place to investigate. Please preserve the reconciliation trail.",
    evidence: "finance-report",
  },
  hr: {
    id: "hr",
    speaker: "HR partner",
    text: "The approved record is RM8,500 from 01 October. I checked it this morning. That does not tell us which historical row payroll selected.",
    next: "hr-proof",
  },
  "hr-proof": {
    id: "hr-proof",
    speaker: "HR partner",
    text: "History matters here. There is also a future increase. “Latest” and “valid for payroll date” are different questions.",
    evidence: "hr-record",
  },
  operations: {
    id: "operations",
    speaker: "Operations engineer",
    text: "The job finished at 02:14. No errors in the completion log. A request timed out just before that, so the worker retried.",
    next: "ops-proof",
  },
  "ops-proof": {
    id: "ops-proof",
    speaker: "Operations engineer",
    text: "We count completed requests, not reconciled outcomes. The destination accepted the original and the retry. A successful job can still deliver the wrong thing twice.",
    evidence: "integration-log",
  },
  owner: {
    id: "owner",
    speaker: "System owner",
    text: "This resolver predates the current HR interface. The payroll export and a reporting job share it. Nobody wrote that second dependency down.",
    next: "owner-note",
  },
  "owner-note": {
    id: "owner-note",
    speaker: "System owner",
    text: "Inspect the resolver terminal. If you change date semantics, test both consumers. A small change still needs an explicit boundary.",
  },
  payroll: {
    id: "payroll",
    speaker: "Payroll terminal",
    text: evidence["payroll-record"].text,
    evidence: "payroll-record",
  },
  history: {
    id: "history",
    speaker: "History terminal",
    text: evidence["salary-history"].text,
    evidence: "salary-history",
  },
  query: {
    id: "query",
    speaker: "Resolver terminal",
    text: evidence["legacy-query"].text,
    evidence: "legacy-query",
  },
};
export const rooms: {
  id: RoomId;
  title: string;
  subtitle: string;
  objects: {
    id: ObjectId;
    title: string;
    x: number;
    y: number;
    npc: boolean;
  }[];
}[] = [
  {
    id: "reception",
    title: "Reception",
    subtitle: "01 / The wrong number",
    objects: [
      { id: "manager", title: "Delivery lead", x: 450, y: 210, npc: true },
    ],
  },
  {
    id: "finance",
    title: "Finance",
    subtitle: "02 / The deadline",
    objects: [
      { id: "finance", title: "Finance analyst", x: 300, y: 210, npc: true },
      { id: "payroll", title: "Payroll preview", x: 630, y: 200, npc: false },
    ],
  },
  {
    id: "hr",
    title: "HR",
    subtitle: "03 / History has state",
    objects: [
      { id: "hr", title: "HR partner", x: 300, y: 210, npc: true },
      { id: "history", title: "Salary history", x: 630, y: 200, npc: false },
    ],
  },
  {
    id: "operations",
    title: "Operations",
    subtitle: "04 / Success is not correctness",
    objects: [
      {
        id: "operations",
        title: "Operations engineer",
        x: 450,
        y: 210,
        npc: true,
      },
    ],
  },
  {
    id: "server",
    title: "Server room",
    subtitle: "05 / Behind the interface",
    objects: [
      { id: "owner", title: "System owner", x: 300, y: 210, npc: true },
      { id: "query", title: "Legacy resolver", x: 630, y: 200, npc: false },
    ],
  },
  {
    id: "architecture",
    title: "Architecture space",
    subtitle: "06 / What we leave behind",
    objects: [],
  },
];
export const objectives: Record<Phase, string> = {
  investigation:
    "Compare Finance, HR, the payroll preview and salary history. Then resolve the discrepancy at the evidence desk.",
  date: "Build a date resolver: include valid history, put the newest valid row first, then select one row.",
  fix: "Choose the smallest acceptable production intervention before payroll closes.",
  resilience:
    "Inspect Operations’ integration log. Design safeguards for duplicate delivery and a transient failure.",
  architecture:
    "Enter Architecture Space. Preserve historical state for both payroll and reporting.",
  strategy: "Choose what the team owns after this deadline.",
  ending: "The incident report is ready.",
};
export const fixes: {
  id: FixId;
  title: string;
  summary: string;
  immediate: string;
  later: string;
}[] = [
  {
    id: "manual",
    title: "Reconcile this payroll run manually",
    summary:
      "Reconcile the preview now. Get Finance approval and preserve an audit trail; leave the resolver unchanged.",
    immediate: "Finance reviews an auditable one-run correction. This run can close without changing the shared resolver.",
    later:
      "A second record still uses the old date selector. Next month’s recurrence risk remains; your manual trail must be maintained.",
  },
  {
    id: "rewrite",
    title: "Rewrite the integration tonight",
    summary:
      "Replace the resolver and export together. Accept a broad change under the current deadline.",
    immediate:
      "Service boundaries become clearer. The export is held during migration.",
    later:
      "Testing the shared reporting consumer takes longer than expected. Payroll misses its deadline; rollback and data reconciliation need explicit owners.",
  },
  {
    id: "targeted",
    title: "Patch the date resolver + regression test",
    summary:
      "Change the historical selection rule. Test the payroll and reporting consumers; preserve a rollback.",
    immediate:
      "October resolves to RM8,500. The preview reconciles with the approved record.",
    later:
      "Captured consumer outputs cover the known cases and rollback is ready. The reporting owner is unavailable: unusual historical cases remain a regression risk, and testing uses most of the deadline window.",
  },
];
export const strategies: {
  id: StrategyId;
  title: string;
  summary: string;
  consequence: string;
}[] = [
  {
    id: "contain",
    title: "Close the incident after reconciliation",
    summary:
      "Prioritise the deadline. Keep the remaining dependency risk in the incident record.",
    consequence:
      "The next payroll run will rely on the same operators noticing the same signals. Containment is a choice, not removal of the debt.",
  },
  {
    id: "observe",
    title: "Add reconciliation and an operational owner",
    summary:
      "Compare approved and delivered outcomes; name an escalation owner. Defer the migration.",
    consequence:
      "Incorrect outcomes become visible sooner. Better signals do not by themselves remove the shared historical resolver.",
  },
  {
    id: "migrate",
    title: "Plan a staged migration behind the tested boundary",
    summary:
      "Keep reconciliation and failure ownership. Plan incremental migration after the consumer owner returns; require funded test time and rollback.",
    consequence:
      "The team gets a bounded migration path. It still needs funded time, consumer tests and operational ownership; the diagram is not the delivery plan.",
  },
];
export const endings: Record<
  EndingId,
  { title: string; line: string; body: string }
> = {
  firefighter: {
    title: "The Firefighter",
    line: "You survived today. Next month is waiting.",
    body: "The incident is contained, but recurring work and historical dependencies remain. The report records the trade-off rather than mistaking a green preview for a durable system.",
  },
  rewrite: {
    title: "The Great Rewrite",
    line: "Beautiful architecture. Payroll missed its deadline.",
    body: "The new boundary is cleaner. Migration and shared consumers were larger than the available window. Reliability work now includes restoring delivery and stakeholder confidence.",
  },
  modernizer: {
    title: "The Pragmatic Modernizer",
    line: "The deadline held. The next change has a boundary.",
    body: "Historical selection is corrected with regression protection. Duplicate-delivery handling and a staged migration path reduce risk without pretending the legacy system has disappeared.",
  },
};
export const explanations: Record<string, string> = {
  source:
    "A source of truth answers a specific question. HR approval answers what was authorised; history answers what applied at a date; the payroll preview shows what the process selected. Reconcile these meanings before deciding that a whole system is wrong. Here the approved record is valid, but the resolver selects an older row. The evidence supports a bounded change to selection, not an overwrite of history.",
  date: "Effective dating represents business validity, not the time a row was created. First exclude rows after the target date. Then order the remaining rows from newest to oldest and take one. The November increase must not affect an October payroll. Production rules also need tie-breaking, time-zone semantics and a defined result when no row exists. Test boundary dates and both consumers; this vignette deliberately simplifies those details.",
  resilience:
    "The producer assigns and persists a stable event ID before enqueueing. The at-least-once queue may redeliver; the worker checks durable processing state and claims the event. A local flag alone cannot make a remote effect exactly-once. In this scenario the destination atomically deduplicates the same key, and bounded retries stay within its retention window. A timeout means the result is unknown, not failed. Preserve identity across retries and reconcile unknown or exhausted outcomes with an owner. Without destination support, or after key expiry, stop blind retry and compare destination records before another attempt. In plain language: keep one receipt number, ask the recipient whether it was accepted, and involve a person when that cannot be established safely.",
  architecture:
    "Historical state is shared business meaning. Both reporting and payroll need the same explicit date semantics; bypassing history with today’s HR record changes the answer for previous periods. A shared boundary can make that contract testable, but also creates a dependency that needs ownership. Migration should preserve consumer behaviour, compare outputs and retain rollback. Observability helps catch a divergence; it does not replace correct domain modelling.",
};
