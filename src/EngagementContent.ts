import type { EvidenceId } from './evidence';
import { problemSummaries } from './problemSummaries';
interface Problem {
  title: string;
  problem: string;
  description: string;
  proof: EvidenceId;
  signal: string;
}
export const problems: Problem[] = [
  { ...problemSummaries.modernisation, description: 'Untangle domain rules, improve integration boundaries and modernise the parts of a system that make change difficult.', proof: 'modernisation', signal: 'Education systems: established-platform modernisation and maintainability.' },
  { ...problemSummaries.domain, description: 'Model the rules behind permissions, contracts, policies and reporting, then build the interfaces and services around them.', proof: 'domain', signal: 'Rental operations: connected property, tenant and contract workflows.' },
  { ...problemSummaries.integration, description: 'Review data structures, APIs and delivery practices together to define a workable path from diagnosis to implementation.', proof: 'integration', signal: 'PolicyStreet: provider rate normalization and integrated quotation and issuance.' },
  { title: 'Enterprise full-stack engineering', problem: 'Enterprise tools that need technical ownership', description: 'Work across interfaces and services while planning around data consistency, access control and ongoing operation.', proof: 'enterprise', signal: 'WenSymes: principal full-stack development of HR and administration tools; internal implementation remains private.' },
  { title: 'AI-assisted engineering', problem: 'AI-generated implementation that needs engineering judgment', description: 'Keep architecture, acceptance criteria and implementation review under human direction, with verification suited to the behaviour being changed.', proof: 'aiEngineering', signal: 'No Two Mondays: an independent development case, not evidence of a production RAG deployment.' },
  { ...problemSummaries.rag, description: 'Explore RAG-based knowledge and onboarding tools around a defined workflow, with attention to data access and useful evaluation.', proof: 'aiCapabilities', signal: 'PACE-RAG: inspect an independent retrieval implementation, measured evaluation and limitations. Commercial production RAG delivery is not established.' },
];
interface Engagement {
  title: string;
  description: string;
  inputs: string;
  deliverables: string;
  proof: EvidenceId;
  next: string;
}
export const engagements: Engagement[] = [
  { title: 'Architecture review & technical diagnosis',
    description: 'Compare architectural options, resource needs, costs and risks with stakeholders, then recommend a workable approach for the business.',
    inputs: 'A specific problem, architecture context, relevant code or API contracts, and known operational constraints.',
    deliverables: 'An agreed scope may include a findings document, prioritised risks and architectural options.',
    proof: 'integration', next: 'Bring the problem and the decisions you need to make to an introductory conversation.' },
  { title: 'Modernisation & delivery',
    description: 'For teams improving a legacy platform while existing business workflows still need to run.',
    inputs: 'The current codebase, business rules, consumer dependencies, test coverage and deployment constraints.',
    deliverables: 'An agreed scope may include migration options, a phased implementation plan or hands-on delivery of a bounded change.',
    proof: 'modernisation', next: 'Start with the workflow or integration that makes change hardest.' },
  { title: 'Project technical leadership',
    description: 'For teams needing engineering direction alongside practical implementation of a complex product.',
    inputs: 'Product goals, current responsibilities, delivery risks and access to decision makers and technical context.',
    deliverables: 'An agreed scope may include decision records, an implementation plan, delivery priorities or technical guidance alongside the team.',
    proof: 'leadership', next: 'Discuss the decisions, responsibilities and involvement the project needs.' },
];
