import { technologyFor, technologyStack, type TechnologyExperience } from "./technology";

// Owner-supplied professional history; prior reviews are recorded in the source register.
// See docs/content-sources.md; do not publish inferred architecture as fact.
export const profile = {
  email: "mohd@paramasvara.online",
  discovery: "https://cal.com/mohd-paramasvara/discovery",
  github: "https://github.com/MohdVara",
  linkedin: "https://www.linkedin.com/in/mohdvara/",
  resume: "https://rxresu.me/mwara95/2-page-resume",
  cv: "https://rxresu.me/mwara95/curriculum-vitae",
  // Add only an owner-approved PDF after inspecting every page of the current export.
  resumePdf: null as string | null,
};
export const projectIds = ["insurance", "wensymes", "campus", "rental", "hr"] as const;
export type ProjectId = typeof projectIds[number];
interface Project {
  id: ProjectId;
  category: string;
  role: string;
  company: string;
  period: string;
  title: string;
  summary: string;
  result: string;
  scope: string;
  functions: string[];
  visualLabel: string;
  details: [string, string][];
  stack: string[];
  technology?: TechnologyExperience;
}
const projectContent: Project[] = [
  {
    id: "campus", role: "Full Stack Developer → Principal Full Stack Engineer", category: "Education / Modernisation", company: "Centre for Content Creation", period: "Jun 2021 — Present",
    title: "Enterprise Education Systems — Modernization & Technical Consulting",
    summary: "Joined in June 2021 after PolicyStreet; principal since June 2022. Before April 2023, developed the real-time online meeting and classroom system while maintaining and modernizing the existing HRMS. The education-platform modernization project began in April 2023.",
    scope: "Education platform · full-stack engineering · technical leadership",
    result: "Helped align operational workflows with user responsibilities while supporting continued platform use and modernisation.",
    functions: ["Platform modernisation", "Full-stack engineering", "Maintainability"],
    visualLabel: "Education Platform Modernisation",
    details: [
      ["Business problem", "Established education and administrative systems needed workflows shaped around actual operational processes and responsibilities."],
      ["My ownership", "Led full-stack development as Principal Full Stack Engineer during the returning engagement. Held final architectural decision authority, balancing modernization with available resources, established workflows and continuity of operations. Presented viable approaches and their operational consequences to stakeholders, generally seeking informed consensus."],
      ["Key Engineering Decision", "Engaged stakeholders to understand existing operational processes, identify workflow requirements and design suitable workflows across established and modernized systems."],
      ["Verified workflow examples", "Online class activity tracking, HRMS document-expiration tracking and other stakeholder-informed operational workflows."],
      ["Constraints & priorities", "Modernise established software while supporting its ongoing use and development. Maintainability, dependable delivery and long-term platform development remain priorities. Internal product identities and implementation details remain private."],
      ["Delivered Capability", "Helped shape structured workflows aligned with actual user and stakeholder responsibilities, while supporting continued operation and modernization of existing systems."],
    ], stack: [],
  },
  {
    id: "insurance",
    role: "Senior Full Stack Developer → Director, Engineering",
    scope: "Motor · medical · group medical · fire insurance",
    category: "Fintech / Integration",
    company: "PolicyStreet",
    period: "Apr 2019 — Apr 2021",
    title: "PolicyStreet — Insurance Comparison Platform",
    summary:
      "Real-time mass quotations across insurers served consumers, large commercial clients, internal teams and partners.",
    result:
      "Connected insurer quotations and policy issuance for consumers, large commercial clients, internal teams and partners.",
    functions: [
      "Multiple insurance providers",
      "Normalized quotations",
      "Partner APIs & policy issuance",
    ],
    visualLabel: "Insurance Comparison System",
    details: [
      ["Problem", "Unify provider quotation and issuance flows across motor, medical, group medical and fire insurance."],
      ["My ownership", "Built rate-fetching and normalization, then led development and operations as Engineering Director. Held final architectural decision authority, evaluating approaches against integration constraints, available resources and commercial requirements. Explained trade-offs to stakeholders and generally sought informed consensus."],
      ["Key Engineering Decision", "Designed an event-driven quotation architecture using Node.js. Introduced quotation caching and pre-warmed data to reduce repeated processing and support faster quotations, including potential renewals for existing customers."],
      ["Business rules", "Quotations expire after seven days. Changes to customer information that affect quotation terms require quotation revision. Caching and pre-warming do not exempt quotations from these validity requirements."],
      ["Constraints & approach", "Integrated insurer APIs and internal services under changing business and regulatory requirements. Applied security and consistency checks; modernised legacy code for clarity and integration stability."],
      ["Delivered Capability", "Supported real-time mass quotations with rate normalization and integrated issuance for consumers, large commercial clients, internal teams and partners, while accommodating expiry and changes affecting quotations."],
    ],
    stack: [],
  },
  {
    id: "wensymes",
    role: "Principal Full Stack Developer",
    scope: "HR and administration · full-stack engineering",
    category: "People / Enterprise applications",
    company: "WenSymes",
    period: "Mar 2025 — ongoing collaboration",
    title: "WenSymes — Human Resources Management Platform",
    summary: "Adaptable HR and administration workflows, with full-stack web development, Google Cloud and Microsoft 365.",
    result: "Contributed adaptable internal tools; professional collaboration continues on an occasional basis.",
    functions: ["HR & administration", "Full-stack engineering", "Technical ownership"],
    visualLabel: "WenSymes HR Platform",
    details: [
      ["Business problem", "Internal HR and operational administration needed to accommodate changing employee roles and organizational needs."],
      ["My ownership", "Principal Full Stack Developer with final architectural decision authority for HR and administration tools. Evaluated viable approaches against available resources, stakeholder requirements and changing business processes, generally seeking informed consensus. The engagement continues as occasional professional collaboration."],
      ["Key Engineering Decision", "Prioritized system flexibility so changing employee roles and responsibilities could be accommodated as organizational headcount and operational needs evolved."],
      ["Constraints & planning", "Organizational flexibility must account for clear responsibilities and appropriate access to HR information. Planning considers data consistency, access control and uptime; detailed internal rules and implementation remain private."],
      ["Delivered Capability", "Supported an adaptable approach to organizational roles and HR workflows without assuming that responsibilities would remain fixed."],
      ["Technical approach", "Full-stack web development with Google Cloud and Microsoft 365."],
    ],
    stack: [],
  },
  {
    id: "hr",
    role: "Web Developer · collaborative development",
    scope: "Multiple companies · configurable leave and attendance rules",
    category: "People / Business operations",
    company: "Centre for Content Creation",
    period: "May 2016 — Dec 2024",
    title: "HR workflows that adapt to different companies.",
    summary:
      "Helped build configurable HR workflows for multiple companies. Development continued after my May 2017 departure and ended in December 2024.",
    result:
      "Flexible HR workflows that accommodate each company’s corporate structure and policies within the same system.",
    functions: [
      "Multiple company structures",
      "Configurable leave entitlements",
      "Attendance policies & workflows",
    ],
    visualLabel: "Human Resource Management System",
    details: [
      [
        "Problem",
        "Different companies needed HR tools that could reflect their own corporate structures, leave rules, and attendance policies.",
      ],
      [
        "Ownership",
        "Collaborated on development of the HR management system during the Web Developer role at Centre for Content Creation.",
      ],
      [
        "Engineering",
        "Built support for multiple companies, configurable leave entitlements, and flexible attendance policies around real HR workflows.",
      ],
      [
        "Result",
        "Delivered configurable structures, leave and attendance workflows across companies.",
      ],
    ],
    stack: [],
  },
  {
    id: "rental",
    role: "Freelance Principal Full Stack Solution Developer",
    scope: "20+ properties · tenants · contracts · financial reporting",
    category: "Proptech / Business operations",
    company: "MegaInfinite",
    period: "May 2018 — May 2020",
    title: "Rental operations, from contracts to financial clarity.",
    summary:
      "Web-based rental operations for staff working in the office and on the move.",
    result:
      "Made key rental-management functions accessible from compatible mobile and desktop browsers.",
    functions: [
      "Properties, tenants & contracts",
      "Payments, renewals & cancellations",
      "Property-level financial reporting",
    ],
    visualLabel: "Home Rental Management System",
    details: [
      ["Problem", "Staff needed to manage contracts, renewals, cancellations and financial visibility across more than 20 rental properties, including operational work outside the office."],
      ["My ownership", "Designed and implemented the business subletting and home rental management system as a freelance Principal Full Stack Solution Developer."],
      ["Key Engineering Decision", "Designed and developed a mobile-friendly, web-based rental management system to support operational work outside the office."],
      ["Domain design", "Separated property, tenant and contract records to support multi-entity workflows, contract generation and payment tracking."],
      ["Operating constraints", "Access described here is internet-connected through compatible mobile or desktop browsers."],
      ["Delivered Capability", "Enabled access to property, tenant and rental records; supported rental contract renewals and sending contract PDFs directly from mobile devices. Staff could review rental and financial reports remotely, including property-level income, expenses and profit/loss. Supported rental operations involving more than 20 properties."],
    ],
    stack: [],
  },
];
export const projects: Project[] = projectContent.map(project => ({ ...project, stack: technologyStack(project.id), technology: technologyFor(project.id) }));
export const experience = [
  {
    period: "Mar 2025 — ongoing collaboration",
    title: "Principal Full Stack Developer",
    company: "WenSymes",
    type: "Occasional professional collaboration · Remote · Singapore",
    description:
      "Principal full-stack experience on HR and administration tools with cloud services. Planning considered data consistency, access control and uptime. Occasional engineering collaboration continues.",
  },
  {
    period: "Jun 2021 — Present",
    title: "Full Stack Developer → Principal Full Stack Engineer",
    company: "Centre for Content Creation",
    type: "Contract · Remote",
    description:
      "Leading classroom applications, meeting tools and integrations. Modernizing legacy systems and establishing DevOps and deployment standards. Progressed from Full Stack Developer (June 2021–June 2022).",
  },
  {
    period: "May 2019 — Jun 2021",
    title: "Senior Full Stack Developer → Director, Engineering",
    company: "PolicyStreet",
    type: "Full-time",
    description:
      "Built insurance rate normalization; progressed to engineering direction in October 2019. Led development, operations and partner integrations across quotation and policy issuance.",
  },
  {
    period: "Jun 2018 — Present",
    title: "Technical Trainer",
    company: "Tertiary Courses",
    type: "Training",
    description:
      "Teaching full-stack development from beginner to advanced levels, across backend frameworks and relational and non-relational databases.",
  },
  {
    period: "Feb 2018 — May 2018",
    title: "Senior Software Engineer",
    company: "Cryptoika",
    type: "Contract",
    description:
      "A roughly three-month engagement building a real-time cryptocurrency quotes dashboard.",
  },
  {
    period: "Aug 2017 — Jan 2018",
    title: "VOC Solution Proposal for TM",
    company: "Telekom Malaysia",
    type: "Project proposal",
    description:
      "Prepared a proposal for a consolidated customer complaints and feedback analytics system for Telekom Malaysia, gathering information from multiple channels to support decision-making.",
  },
  {
    period: "May 2016 — May 2017",
    title: "Web Developer",
    company: "Centre for Content Creation",
    type: "Contract",
    description:
      "My first employment at Centre for Content Creation. Left in May 2017 to continue my degree in Singapore, before later joining PolicyStreet and returning to Centre in June 2021.",
  },
];
export const capabilities = [
  {
    title: "Full-stack engineering",
    description:
      "User interfaces, backend services, and integrations, chosen around the needs of the system.",
    tools: "React · Vue · TypeScript · Laravel · Django · Rails · Node.js",
  },
  {
    title: "Architecture & modernization",
    description:
      "Compare viable approaches, explain costs, risks and business implications, then seek stakeholder consensus while retaining final technical decision authority.",
    tools: "System integrations · REST APIs · Technical documentation · CI/CD",
  },
  {
    title: "Data & infrastructure",
    description:
      "Relational, graph, and document databases, with repeatable development and deployment environments.",
    tools: "PostgreSQL · MySQL · MongoDB · Neo4j · Redis · Docker · AWS · GCP",
  },
  {
    title: "Leadership & applied AI",
    description:
      "Engineering direction and technical training. PACE-RAG demonstrates independently developed retrieval and evidence-aware answers; No Two Mondays demonstrates AI-assisted engineering. Enterprise production RAG delivery is not established.",
    tools:
      "Team enablement · Stakeholder alignment · RAG · Vector databases · AI-assisted engineering",
  },
];

// Real professional work leads; public exercises remain supplementary.
projects.sort((a, b) => projectIds.indexOf(a.id) - projectIds.indexOf(b.id));
