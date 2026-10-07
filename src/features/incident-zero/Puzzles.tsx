import { useState } from "react";
import {
  dateOrder,
  deliveryFeedback,
  resolveSalary,
  resilienceOrder,
  validOrder,
  validNetwork,
  type PuzzleId,
} from "./state";
import { explanations } from "./story";
const blocks: Record<string, { title: string; hint: string }> = {
  filter: {
    title: "effective_date ≤ target_date",
    hint: "Exclude future changes",
  },
  sort: {
    title: "ORDER BY effective_date DESC",
    hint: "Newest valid change first",
  },
  limit: { title: "LIMIT 1", hint: "Take one record" },
  identity: { title: "Producer: assign stable event ID", hint: "Create once; preserve through enqueueing, redelivery and retries" },
  deduplicate: {
    title: "Worker: check / claim processing",
    hint: "Durable claim by event ID; completed events can be skipped",
  },
  queue: { title: "Queue: persist and deliver", hint: "At-least-once delivery; duplicate messages are possible" },
  external: {
    title: "Destination: apply with idempotency key",
    hint: "Remote deduplication uses the same event ID",
  },
  retry: {
    title: "Retry transient failure",
    hint: "Timeout means unknown outcome; bounded retry with the same key",
  },
  failure: {
    title: "Failure record / escalation",
    hint: "Reconcile unknown outcomes; exhausted attempts need an owner",
  },
};
function Network({ edges, compact = false }: { edges: string[]; compact?: boolean }) {
  const positions: Record<string, [number, number]> = compact
    ? { HRMS: [150, 30], HISTORY: [150, 125], PAYROLL: [75, 235], REPORTING: [225, 235] }
    : { HRMS: [70, 100], HISTORY: [280, 100], PAYROLL: [500, 40], REPORTING: [500, 160] };
  return <svg className={`iz-network ${compact ? 'iz-network-mobile' : 'iz-network-desktop'}`} viewBox={compact ? '0 0 300 270' : '0 0 580 200'} role="img" aria-label="HRMS, history, payroll and reporting; selected connections shown below">
    {edges.map(edge => { const [a, b] = edge.split('>'); const [x, y] = positions[a]; const [tx, ty] = positions[b]; return <path key={edge} d={`M${x} ${y} Q${compact ? x : tx - 60} ${compact ? ty - 40 : y} ${tx} ${ty}`} />; })}
    {Object.entries(positions).map(([label, [x,y]]) => <g key={label}><rect x={x-(compact?66:58)} y={y-22} width={compact?132:116} height="44"/><text x={x} y={y+5} textAnchor="middle">{label}</text></g>)}
  </svg>;
}
export default function Puzzles({
  id,
  onSolved,
}: {
  id: PuzzleId;
  onSolved: () => void;
}) {
  const [order, setOrder] = useState(
    id === "date"
      ? ["limit", "filter", "sort"]
      : ["external", "failure", "queue", "retry", "deduplicate", "identity"],
  );
  const [source, setSource] = useState("");
  const [edges, setEdges] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [solved, setSolved] = useState(false);
  const move = (index: number, delta: number) =>
    setOrder((items) => {
      const next = [...items];
      [next[index], next[index + delta]] = [next[index + delta], next[index]];
      return next;
    });
  const validate = () => {
    const valid =
      id === "source"
        ? source === "history"
        : id === "architecture"
          ? validNetwork(edges)
          : validOrder(order, id === "date" ? dateOrder : resilienceOrder);
    setSolved(valid);
    setFeedback(
      valid
        ? id === "date"
          ? `October resolves to RM${resolveSalary([{effective:"2026-01-01",salary:7500},{effective:"2026-10-01",salary:8500},{effective:"2026-11-01",salary:9000}], "2026-10-15")?.toLocaleString("en-US")}. The RM9,000 future record is excluded.`
          : id === "resilience"
            ? "The producer creates the ID; the queue preserves it; the worker claims it and the destination deduplicates by it. Timeouts remain unknown until retried safely or reconciled."
            : id === "architecture"
              ? "Payroll and reporting retain the same historical contract."
              : "The discrepancy is a selection error in effective-dated history, rather than an incorrect HR approval."
        : id === "source"
          ? "That evidence shows an outcome, not which historical row was valid. Compare the salary history with the payroll target date."
          : id === "date"
            ? "Try excluding future rows first. Then put the newest valid row first before selecting one."
            : id === "architecture"
              ? "Both consumers need historical meaning. Connect HRMS to HISTORY, then branch HISTORY to payroll and reporting."
              : deliveryFeedback(order),
    );
  };
  const titles: Record<PuzzleId, string> = {
    source: "Which evidence explains the difference?",
    date: "Resolve history for 15 October",
    resilience: "A success log is not a guarantee",
    architecture: "Connect the historical contract",
  };
  return (
    <>
      <h2>{titles[id]}</h2>
      <p className="iz-muted">
        {id === "source"
          ? "You have compared the approvals and preview. Now identify the record that explains which salary applied."
          : id === "date"
            ? "01 Jan: RM7,500 · 01 Oct: RM8,500 · 01 Nov: RM9,000. Arrange the steps; the plain-language captions explain the SQL."
            : id === "resilience"
              ? "A delivery timed out: the destination may already have accepted it. Arrange the producer, queue, worker and destination responsibilities for the scenario below."
              : "Select three connections. Preserve the history boundary rather than exporting only today’s HR state."}
      </p>
      {id === "resilience" && <div className="iz-scenario">
        <strong>Scenario assumptions</strong>
        <p>The producer persists an event ID before enqueueing. The queue can redeliver. One worker checks durable processing state before delivery. The destination atomically deduplicates the same idempotency key within a documented retention window; retries stay within it.</p>
        <details className="iz-explanation"><summary>If safe retry is unavailable</summary><p>A local “already sent” flag cannot guarantee exactly-once remote effects. If the destination lacks idempotency support, its key has expired, or acceptance is unknown, stop automatic retry and reconcile destination records or escalate to an owner.</p></details>
      </div>}
      {id === "source" ? (
        <fieldset className="iz-options">
          <legend>Key evidence</legend>
          {[
            ["hr", "Today’s HR approval"],
            ["payroll", "The payroll preview"],
            ["history", "The effective-dated salary history"],
          ].map(([value, label]) => (
            <label key={value}>
              <input
                type="radio"
                name="source"
                value={value}
                checked={source === value}
                onChange={() => setSource(value)}
              />
              {label}
            </label>
          ))}
        </fieldset>
      ) : id === "architecture" ? (
        <>
          <Network edges={edges} />
          <Network edges={edges} compact />
          <fieldset className="iz-options">
            <legend>Connections</legend>
            {[
              "HRMS>HISTORY",
              "HISTORY>PAYROLL",
              "HISTORY>REPORTING",
              "HRMS>PAYROLL",
              "PAYROLL>HISTORY",
            ].map((edge) => (
              <label key={edge}>
                <input
                  type="checkbox"
                  checked={edges.includes(edge)}
                  onChange={() =>
                    setEdges((items) =>
                      items.includes(edge)
                        ? items.filter((item) => item !== edge)
                        : [...items, edge],
                    )
                  }
                />
                {edge.replace(">", " → ")}
              </label>
            ))}
          </fieldset>
        </>
      ) : (
        <>
        <details className="iz-explanation iz-puzzle-help">
          <summary>How to arrange the steps</summary>
          <p className="iz-keyboard-only">Tab to an ↑ / ↓ button, then Enter or Space to move its row. Shift + Tab goes back. Tab to “Test this reasoning” when ready.</p>
          <p className="iz-touch-only">Tap ↑ or ↓ beside a row to move it. Tap “Test this reasoning” when ready.</p>
        </details>
        <ol className="iz-blocks">
          {order.map((key, index) => (
            <li key={key}>
              <div>
                <strong>{blocks[key].title}</strong>
                <p>{blocks[key].hint}</p>
              </div>
              <div>
                <button
                  type="button"
                  disabled={index === 0 || solved}
                  onClick={() => move(index, -1)}
                  aria-label={`Move ${blocks[key].title} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={index === order.length - 1 || solved}
                  onClick={() => move(index, 1)}
                  aria-label={`Move ${blocks[key].title} down`}
                >
                  ↓
                </button>
              </div>
            </li>
          ))}
        </ol>
        </>
      )}
      <p className={`iz-feedback ${solved ? "iz-solved" : ""}`} role="status">
        {feedback}
      </p>
      {solved ? (
        <button className="button primary" onClick={onSolved}>
          Apply tested reasoning →
        </button>
      ) : (
        <button className="button primary" onClick={validate}>
          Test this {id === "architecture" ? "flow" : "reasoning"} →
        </button>
      )}
      <details className="iz-explanation">
        <summary>Why this matters</summary>
        <p>{explanations[id]}</p>
      </details>
    </>
  );
}
