export const problems = [
  { title: 'System modernisation', problem: 'Legacy software slowing delivery', description: 'Untangle domain rules, improve integration boundaries and modernise the parts of a system that make change difficult.', proof: 'insurance', signal: 'Legacy insurance systems and campus platforms.' },
  { title: 'Complex product engineering', problem: 'Business workflows that do not fit a simple app', description: 'Model the rules behind permissions, contracts, policies and reporting, then build the interfaces and services around them.', proof: 'rental', signal: 'Property, tenant and contract workflows across 20+ properties.' },
  { title: 'Architecture & delivery', problem: 'Systems becoming hard to extend or operate', description: 'Review data structures, APIs and delivery practices together to define a workable path from diagnosis to implementation.', proof: 'meetings', signal: 'Meeting systems with attendance, recordings and reporting integrations.' },
  { title: 'Applied AI integration', problem: 'A knowledge workflow that needs more than an AI demo', description: 'Explore RAG-based knowledge and onboarding tools around a defined workflow, with attention to data access and useful evaluation.', proof: null, signal: 'Résumé-listed RAG and knowledge-tool capabilities; discuss fit before defining a project.' },
];
export const engagements = [
  { title: 'Architecture review & technical diagnosis',
    description: 'For teams facing unclear system boundaries, integration failures or difficult delivery decisions.',
    inputs: 'A specific problem, architecture context, relevant code or API contracts, and known operational constraints.',
    deliverables: 'An agreed scope may include a findings document, prioritised risks and architectural options.',
    proof: 'campus', next: 'Bring the problem and the decisions you need to make to an introductory conversation.' },
  { title: 'Modernisation & delivery',
    description: 'For teams improving a legacy platform while existing business workflows still need to run.',
    inputs: 'The current codebase, business rules, consumer dependencies, test coverage and deployment constraints.',
    deliverables: 'An agreed scope may include migration options, a phased implementation plan or hands-on delivery of a bounded change.',
    proof: 'insurance', next: 'Start with the workflow or integration that makes change hardest.' },
  { title: 'Project technical leadership',
    description: 'For teams needing engineering direction alongside practical implementation of a complex product.',
    inputs: 'Product goals, current responsibilities, delivery risks and access to decision makers and technical context.',
    deliverables: 'An agreed scope may include decision records, an implementation plan, delivery priorities or technical guidance alongside the team.',
    proof: 'rental', next: 'Discuss the decisions, responsibilities and involvement the project needs.' },
];
