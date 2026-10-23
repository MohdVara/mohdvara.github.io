import { text } from "./i18n/config";
import { groupTrailRuns, trailScene, type TrailConcept } from "./notFoundGeometry";

/** Native SVG text shaping: each semantic run has its own generously spaced slot.
 * Geometry never depends on character counts or reverses Arabic glyphs. */
export default function NotFoundLandscape({ concept = "vanishing" }: { concept?: TrailConcept }) {
  const vocabulary = [text("Trace"), text("Path"), text("Beyond"), text("Explore"), text("Horizon"), text("Onward")];
  return <div className="unmapped-landscape" aria-hidden="true">
    {([false, true] as const).map(compact => <svg key={String(compact)} className={compact ? "unmapped-mobile" : "unmapped-wide"}
      viewBox={compact ? "0 0 420 440" : "0 0 1600 900"} preserveAspectRatio={compact ? "xMidYMid meet" : "xMidYMid slice"} focusable="false">
      {groupTrailRuns(trailScene(concept, compact)).map((group, i) => <g key={i}
        className={`unmapped-ink ${group.layer}`} fontSize={group.size}
        style={{ opacity: `calc(${group.alpha} * var(--unmapped-strength))` }} textAnchor="middle" direction="ltr">
        {group.runs.map((run, j) => <text key={j} x={run.x} y={run.y}>
          {run.word === undefined ? run.glyph : <tspan direction="auto" unicodeBidi="plaintext">{vocabulary[run.word]}</tspan>}
        </text>)}
      </g>)}
    </svg>)}
  </div>;
}
