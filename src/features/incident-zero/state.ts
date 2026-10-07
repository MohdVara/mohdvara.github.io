export type RoomId =
  "reception" | "finance" | "hr" | "operations" | "server" | "architecture";
export type EvidenceId =
  | "finance-report"
  | "hr-record"
  | "payroll-record"
  | "salary-history"
  | "integration-log"
  | "legacy-query";
export type PuzzleId = "source" | "date" | "resilience" | "architecture";
export type FixId = "manual" | "rewrite" | "targeted";
export type StrategyId = "contain" | "observe" | "migrate";
export type EndingId = "firefighter" | "rewrite" | "modernizer";
export type Phase =
  | "investigation"
  | "date"
  | "fix"
  | "resilience"
  | "architecture"
  | "strategy"
  | "ending";
export type Metrics = {
  reliability: number;
  deliverySpeed: number;
  technicalDebt: number;
  stakeholderTrust: number;
  observability: number;
};
export type IncidentState = {
  phase: Phase;
  evidence: EvidenceId[];
  solved: PuzzleId[];
  fix: FixId | null;
  strategy: StrategyId | null;
  archaeologist: boolean;
  metrics: Metrics;
};
export type Action =
  | { type: "evidence"; id: EvidenceId }
  | { type: "puzzle"; id: PuzzleId }
  | { type: "fix"; id: FixId }
  | { type: "strategy"; id: StrategyId }
  | { type: "reset" }
  | { type: "preview"; fix: FixId };
export const evidenceIds: EvidenceId[] = [
  "finance-report",
  "hr-record",
  "payroll-record",
  "salary-history",
  "integration-log",
  "legacy-query",
];
export const initialState = (): IncidentState => ({
  phase: "investigation",
  evidence: [],
  solved: [],
  fix: null,
  strategy: null,
  archaeologist: false,
  metrics: {
    reliability: 35,
    deliverySpeed: 70,
    technicalDebt: 75,
    stakeholderTrust: 55,
    observability: 25,
  },
});
export function adjust(metrics: Metrics, delta: Partial<Metrics>): Metrics {
  return Object.fromEntries(
    Object.entries(metrics).map(([key, value]) => [
      key,
      Math.max(0, Math.min(100, value + (delta[key as keyof Metrics] || 0))),
    ]),
  ) as Metrics;
}
export const canResolveSource = (state: IncidentState) =>
  ["finance-report", "hr-record", "payroll-record", "salary-history"].every(
    (id) => state.evidence.includes(id as EvidenceId),
  );
export const canEnter = (room: RoomId, state: IncidentState) =>
  room !== "architecture" ||
  ["architecture", "strategy", "ending"].includes(state.phase);
export const dateOrder = ["filter", "sort", "limit"];
export const resilienceOrder = [
  "identity",
  "queue",
  "deduplicate",
  "external",
  "retry",
  "failure",
];
export function deliveryFeedback(order: string[]): string {
  if (!validOrder([...order].sort(), [...resilienceOrder].sort()))
    return "Include every responsibility once, including creating the event ID and checking for duplicate processing.";
  const at = (id: string) => order.indexOf(id);
  if (at("identity") > at("queue")) return "The producer must assign the stable event ID before durable enqueueing; redelivery and retries must carry that same ID.";
  if (at("queue") > at("deduplicate")) return "In this scenario, the worker claims the event after consuming it from the queue, using durable processing state.";
  if (at("deduplicate") > at("external")) return "The worker checks or claims processing before calling the destination. This local claim alone cannot prevent duplicate remote effects.";
  if (at("external") > at("retry")) return "A retry follows an attempted remote delivery. A timeout leaves its outcome unknown; reuse the destination’s idempotency key.";
  if (at("retry") > at("failure")) return "Escalate exhausted retries after the bounded retry policy. Unsupported or expired destination keys require reconciliation instead of a blind retry.";
  return "";
}
export type DatedSalary = { effective: string; salary: number };
export function resolveSalary(rows: DatedSalary[], target: string): number | null {
  return [...rows].filter(row => row.effective <= target)
    .sort((a, b) => b.effective.localeCompare(a.effective))[0]?.salary ?? null;
}
// Keep previews on the same reducer path as real play; the UI labels simulation.
export function previewState(fix: FixId): IncidentState {
  let state = evidenceIds.reduce((current, id) => incidentReducer(current, { type: "evidence", id }), initialState());
  for (const id of ["source", "date"] as PuzzleId[]) state = incidentReducer(state, { type: "puzzle", id });
  state = incidentReducer(state, { type: "fix", id: fix });
  for (const id of ["resilience", "architecture"] as PuzzleId[]) state = incidentReducer(state, { type: "puzzle", id });
  state = incidentReducer(state, { type: "strategy", id: "migrate" });
  return { ...state, archaeologist: false };
}
export const validOrder = (actual: string[], expected: string[]) =>
  actual.length === expected.length &&
  actual.every((value, index) => value === expected[index]);
export const validNetwork = (edges: string[]) =>
  ["HRMS>HISTORY", "HISTORY>PAYROLL", "HISTORY>REPORTING"].every((edge) =>
    edges.includes(edge),
  ) && edges.length === 3;
export function endingFor(state: IncidentState): EndingId {
  if (state.fix === "rewrite") return "rewrite";
  return state.fix === "targeted" && state.strategy === "migrate"
    ? "modernizer"
    : "firefighter";
}
export function worldStatus(state: IncidentState): string[] {
  return [
    state.fix === "targeted" ? "Payroll preview: RM8,500; resolver corrected with regression protection." : state.fix === "manual" ? "Payroll preview: RM8,500 for this reviewed run; resolver unchanged." : state.fix === "rewrite" ? "Payroll export: held while replacement consumers are validated." : "Payroll preview: RM7,500; reconciliation pending.",
    state.solved.includes("resilience") ? "Delivery: same-key retry and reconciliation safeguards tested; unknown outcomes have an owner." : "Delivery: timeout outcome unknown; duplicate-delivery risk unresolved.",
    state.solved.includes("architecture") ? "Dependencies: HRMS → history → payroll and reporting preserved in the tested model." : "Dependencies: historical consumer contract still under investigation.",
  ];
}
export function incidentReducer(
  state: IncidentState,
  action: Action,
): IncidentState {
  if (action.type === "reset") return initialState();
  if (action.type === "preview") return previewState(action.fix);
  if (state.phase === "ending") return state;
  if (action.type === "evidence")
    return state.evidence.includes(action.id)
      ? state
      : { ...state, evidence: [...state.evidence, action.id] };
  if (action.type === "puzzle") {
    const next: Record<PuzzleId, [Phase, Phase]> = {
      source: ["investigation", "date"],
      date: ["date", "fix"],
      resilience: ["resilience", "architecture"],
      architecture: ["architecture", "strategy"],
    };
    const [required, phase] = next[action.id];
    if (
      state.phase !== required ||
      (action.id === "source" && !canResolveSource(state)) ||
      (action.id === "resilience" &&
        !state.evidence.includes("integration-log"))
    )
      return state;
    return {
      ...state,
      phase,
      solved: [...state.solved, action.id],
      metrics: adjust(state.metrics, { reliability: 8, observability: 10 }),
    };
  }
  if (action.type === "fix" && state.phase === "fix") {
    const delta: Record<FixId, Partial<Metrics>> = {
      manual: { reliability: -20, deliverySpeed: 20, technicalDebt: 15, stakeholderTrust: 5 },
      rewrite: {
        reliability: -10,
        deliverySpeed: -50,
        technicalDebt: -10,
        stakeholderTrust: -25,
      },
      targeted: {
        reliability: 20,
        deliverySpeed: 10,
        technicalDebt: -15,
        stakeholderTrust: 15,
      },
    };
    return {
      ...state,
      phase: "resilience",
      fix: action.id,
      archaeologist: evidenceIds.every((id) => state.evidence.includes(id)),
      metrics: adjust(state.metrics, delta[action.id]),
    };
  }
  if (action.type === "strategy" && state.phase === "strategy") {
    const delta: Record<StrategyId, Partial<Metrics>> = {
      contain: { deliverySpeed: 10, technicalDebt: 10 },
      observe: { observability: 20, stakeholderTrust: 10 },
      migrate: {
        technicalDebt: -20,
        reliability: 10,
        observability: 15,
        deliverySpeed: -5,
      },
    };
    return {
      ...state,
      phase: "ending",
      strategy: action.id,
      metrics: adjust(state.metrics, delta[action.id]),
    };
  }
  return state;
}
