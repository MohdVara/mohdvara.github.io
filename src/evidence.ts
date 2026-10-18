import type { ProjectId } from "./content";

export const projectHref = (id: ProjectId, onHome = false) => `${onHome ? "" : "/"}#case-${id}`;
const commercial = (id: ProjectId, label: string) => ({ href: projectHref(id), label });
// Destinations and descriptive link text share one source; client projects do
// not borrow implementation evidence from independent demonstrations.
export const evidence = {
  integration: commercial("insurance", "PolicyStreet · integration engineering"),
  leadership: commercial("insurance", "PolicyStreet · engineering leadership"),
  modernisation: commercial("campus", "Education systems · modernisation"),
  domain: commercial("rental", "Rental operations · domain modelling"),
  enterprise: commercial("wensymes", "WenSymes · enterprise full-stack work"),
  aiEngineering: { href: "/no-two-mondays/#ntm-process", label: "No Two Mondays · AI-assisted engineering" },
  aiCapabilities: { href: "/#ai-evidence", label: "RAG capabilities & evidence boundaries" },
} as const;
export type EvidenceId = keyof typeof evidence;
