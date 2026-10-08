import { useState } from "react";
import { capabilities, projects } from "./content";

// These describe documented functions, not inferred infrastructure topology.
const explanations: Record<string, string[]> = {
  campus: ["Different university branches had separate system implementations.", "Rebuilt campus management into a more unified, general codebase.", "Core student, class and academic workflows remain the subject of the modernisation."],
  meetings: ["Online classes and meetings built with JavaScript and AWS Chime.", "Minute-by-minute participation tracking, with recordings automatically stored in Amazon S3.", "Integration APIs make meeting data available to other systems for reporting and class metrics."],
  insurance: ["Rate fetching across multiple insurance providers and product types.", "Backend and frontend normalization brings different provider rates into a consistent interface.", "External insurer APIs and internal services connect quotation and policy issuance for teams and partners."],
  hr: ["A shared HR system supports the corporate structures of multiple companies.", "Leave entitlements can be configured around each company’s policies.", "Attendance policies and HR workflows adapt to the organization rather than one fixed process."],
  rental: ["Reliable multi-entity data structures connect properties, tenants, and contracts.", "Contract generation, payment tracking, renewals, and cancellations support day-to-day operations.", "Property-level income, expenses, and profit/loss reporting covers more than 20 properties."],
};
const projectPaths: Record<string, { d: string; nodes: number[] }[]> = {
  campus: [{ d: "M20 28C20 55 50 48 50 75", nodes: [0, 1] }, { d: "M80 28C80 55 50 48 50 75", nodes: [0, 1] }, { d: "M50 75V130", nodes: [1, 2] }],
  meetings: [{ d: "M35 28C35 50 62 46 62 75", nodes: [0, 1] }, { d: "M62 75C62 105 35 103 35 126", nodes: [1, 2] }],
  insurance: [{ d: "M12 10C12 38 35 35 35 65", nodes: [0, 1] }, { d: "M75 10C75 38 35 35 35 65", nodes: [0, 1] }, { d: "M35 65C35 95 60 91 60 130", nodes: [1, 2] }],
  hr: [{ d: "M50 24C50 57 22 55 22 100", nodes: [0, 1] }, { d: "M50 24C50 57 78 55 78 100", nodes: [0, 2] }],
  rental: [{ d: "M20 28C20 61 45 52 45 77", nodes: [0, 1] }, { d: "M45 77C45 109 76 97 76 130", nodes: [1, 2] }, { d: "M20 28C6 90 8 137 76 130", nodes: [0, 2] }],
};
export function ProjectDiagram({ project, index }: { project: typeof projects[number]; index: number }) {
  const [selected, setSelected] = useState(0);
  const [preview, setPreview] = useState<number | null>(null);
  const active = preview ?? selected;
  return <div className={`project-visual visual-${project.id}`} data-motion-region="project">
    <div className="visual-top mono"><span>{project.category}</span><span>0{index + 1}</span></div>
    <div className={`project-network network-${project.id}`} onMouseLeave={() => setPreview(null)}>
      <svg viewBox="0 0 100 155" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false">
        {projectPaths[project.id].map(({ d, nodes }) => <path key={d} d={d} pathLength="1" className={nodes.includes(active) ? "diagram-connection connected" : "diagram-connection"} />)}
        <path key={active} className="flow-signal" pathLength="1" d={projectPaths[project.id].find(({ nodes }) => nodes.includes(active))?.d} />
      </svg>
      {project.functions.map((item, i) => <button type="button" key={item} aria-pressed={selected === i} aria-describedby={`${project.id}-explanation`}
        className={active === i ? "node active" : "node"} onMouseEnter={() => setPreview(i)} onFocus={() => setPreview(i)} onBlur={() => setPreview(null)} onClick={() => setSelected(i)}>
        <span className="mono">0{i + 1}</span><span>{item}</span><span className="node-dot" aria-hidden="true" />
      </button>)}
    </div>
    <p className="node-explanation" id={`${project.id}-explanation`}>{explanations[project.id][active]}</p>
    <p className="visual-bottom mono">{project.visualLabel}</p>
  </div>;
}
const capabilitySummaries = [
  "Interfaces, services and integrations.",
  "Legacy systems, domain models and delivery.",
  "Databases and repeatable environments.",
  "Engineering direction, training and knowledge tools.",
];
const branches = [
  ["Interfaces", "React · Vue · TypeScript"], ["Services", "Laravel · Django · Rails · Node.js"],
  ["Integration", "System integrations · REST APIs"], ["Delivery", "Technical documentation · CI/CD"],
  ["Data models", "PostgreSQL · MySQL · MongoDB · Neo4j · Redis"], ["Environments", "Docker · AWS · GCP"],
  ["Team enablement", "Technical training · Stakeholder alignment"], ["Knowledge tools", "RAG · Vector databases · AI-assisted engineering"],
] as const;
export function CapabilityMap() {
  const [selected, setSelected] = useState(0);
  const [preview, setPreview] = useState<number | null>(null);
  const active = preview ?? selected;
  const group = Math.floor(active / 3);
  const label = active % 3 ? branches[group * 2 + active % 3 - 1] : null;
  return <div className="capability-system" data-reveal>
    <div className="capability-map" role="group" aria-label="Engineering capability relationships" onMouseLeave={() => setPreview(null)}>
      <p className="map-caption mono">One system. Four connected disciplines.</p>
      <svg viewBox="0 0 600 400" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false">
        <path className="map-spine" d="M20 28C6 104 37 189 20 365" />
        <path className="map-growth" pathLength="1" d="M20 28C6 104 37 189 20 365" />

      </svg>
      <div className="capability-branches">
        {capabilities.map((item, i) => <div className={`capability-branch ${group === i ? "branch-active" : "branch-rest"}`} key={item.title}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false">
            <path d="M0 50H54C60 50 60 25 66 25H100M54 50C60 50 60 75 66 75H100" />
          </svg>
          {[item.title, branches[i * 2][0], branches[i * 2 + 1][0]].map((name, j) => {
            const node = i * 3 + j;
            return <button key={name} type="button" aria-pressed={selected === node} aria-describedby="capability-explanation"
              className={active === node ? "active" : ""} onMouseEnter={() => setPreview(node)} onFocus={() => setPreview(node)} onBlur={() => setPreview(null)} onClick={() => setSelected(node)}>
              {j === 0 && <span className="mono" aria-hidden="true">0{i + 1}</span>}<span>{name}</span>{j === 0 && <span className="capability-summary">{capabilitySummaries[i]}</span>}
            </button>;
          })}
        </div>)}
      </div>
      <p className="map-caption mono">Select a branch or practice to explore.</p>
    </div>
    <div className="capability-detail" id="capability-explanation">
      <p className="eyebrow mono">0{group + 1} / Connected practice</p>
      <h3>{label ? label[0] : capabilities[group].title}</h3>
      <p>{capabilities[group].description}</p>
      <p className="capability-tools mono">{label ? label[1] : capabilities[group].tools}</p>
      <span className="capability-context">{label ? capabilities[group].title : "Interfaces, architecture, infrastructure, and people work together."}</span>
    </div>
  </div>;
}
const career = [
  { year: "2018", name: "Technical training", role: 3, x: 38, y: 82 },
  { year: "2019", name: "Engineering direction", role: 2, x: 66, y: 60 },
  { year: "2021", name: "Full-stack → Principal", role: 1, x: 36, y: 36 },
  { year: "2025", name: "Principal delivery", role: 0, x: 62, y: 12 },
];
export function CareerPath({ active }: { active: number }) {
  return <figure className="career-path" data-reveal>
    <svg viewBox="0 0 280 410" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false">
      <path className="career-trunk" pathLength="1" d="M106 336C65 301 190 287 185 246C183 205 70 191 101 148C130 112 210 92 174 49" />
      <path className="career-progress" pathLength="1" d="M174 49C210 92 130 112 101 148C70 191 183 205 185 246C190 287 65 301 106 336" />
      <path className="career-continuation" d="M106 336C52 248 72 120 32 18M101 148C77 106 107 58 90 18M174 49C187 34 191 24 191 18" />
      {career.map(({role,x,y}) => <g key={role} className={active === role ? "career-current" : role > active ? "career-past" : "career-later"}><circle cx={x * 2.8} cy={y * 4.1} r="6" /><circle cx={x * 2.8} cy={y * 4.1} r="11" /></g>)}
    </svg>
    {career.map(({year,name,role,x,y}) => <a key={role} href={`#role-${role}`} aria-current={active === role ? "location" : undefined} className={active === role ? "career-node active" : "career-node"} style={{left:`${x}%`,top:`calc(${y}% - ${y * .3}px)`}}><span className="mono">0{role + 1} / {year}</span><span>{name}</span></a>)}
    <figcaption className="mono">Selected role starts / overlapping engagements</figcaption>
  </figure>;
}
