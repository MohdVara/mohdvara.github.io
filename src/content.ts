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
export const projectIds = ["insurance", "wensymes", "campus", "rental", "meetings", "hr"] as const;
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
    id: "campus", role: "Principal Full Stack Engineer", category: "Education / Modernisation", company: "Centre for Content Creation", period: "2023 onward",
    title: "Enterprise Education Systems — Modernization & Technical Consulting",
    summary: "Stakeholder-informed workflows across established and modernized education and administrative systems.",
    scope: "Education platform · full-stack engineering · technical leadership",
    result: "Helped align operational workflows with user responsibilities while supporting continued platform use and modernisation.",
    functions: ["Platform modernisation", "Full-stack engineering", "Maintainability"],
    visualLabel: "Education Platform Modernisation",
    details: [
      ["Business problem", "Established education and administrative systems needed workflows shaped around actual operational processes and responsibilities."],
      ["My contribution", "Led full-stack development and contributed technical direction as Principal Full Stack Engineer."],
      ["Key Engineering Decision", "Engaged stakeholders to understand existing operational processes, identify workflow requirements and design suitable workflows across established and modernized systems."],
      ["Verified workflow examples", "Online class activity tracking, HRMS document-expiration tracking and other stakeholder-informed operational workflows."],
      ["Constraints & priorities", "Modernise established software while supporting its ongoing use and development. Maintainability, dependable delivery and long-term platform development remain priorities. Internal product identities and implementation details remain private."],
      ["Delivered Capability", "Helped shape structured workflows aligned with actual user and stakeholder responsibilities, while supporting continued operation and modernization of existing systems."],
    ], stack: [],
  },
  {
    id: "meetings",
    role: "Principal Full Stack Engineer",
    scope: "Education applications · maintenance · integration",
    category: "Education / Enterprise applications",
    company: "Centre for Content Creation",
    period: "2021 onward",
    title: "Supporting established education applications.",
    summary: "Full-stack development and integration work in the education sector.",
    result: "Contributed to application maintenance and ongoing software delivery.",
    functions: ["Application maintenance", "Full-stack development", "Ongoing delivery"],
    visualLabel: "Education Application Engineering",
    details: [
      ["Role", "Full-stack development, progressing to principal engineering responsibilities."],
      ["Engineering focus", "Maintaining and evolving established applications while supporting their ongoing use."],
      ["Disclosure", "This summary is deliberately limited to broad professional responsibilities."],
    ],
    stack: [],
  },
  {
    id: "insurance",
    role: "Senior Full Stack Developer → Director, Engineering",
    scope: "Motor · medical · group medical · fire insurance",
    category: "Fintech / Integration",
    company: "PolicyStreet",
    period: "2019–2021",
    title: "PolicyStreet — Insurance Comparison Platform",
    summary:
      "Internal teams and partners needed consistent quoting and issuance across different insurers.",
    result:
      "Connected insurer quotations and policy issuance for internal teams and partners.",
    functions: [
      "Multiple insurance providers",
      "Normalized quotations",
      "Partner APIs & policy issuance",
    ],
    visualLabel: "Insurance Comparison System",
    details: [
      ["Problem", "Unify provider quotation and issuance flows across motor, medical, group medical and fire insurance."],
      ["Ownership", "Built backend and frontend rate-fetching and normalization as a Senior Full Stack Developer, then led development and operations as Engineering Director."],
      ["Key Engineering Decision", "Designed an event-driven quotation architecture using Node.js. Introduced quotation caching and pre-warmed data to reduce repeated processing and support faster quotations, including potential renewals for existing customers."],
      ["Business rules", "Quotations expire after seven days. Changes to customer information that affect quotation terms require quotation revision. Caching and pre-warming do not exempt quotations from these validity requirements."],
      ["Constraints & approach", "Integrated insurer APIs and internal services under changing business and regulatory requirements. Applied security and consistency checks; modernised legacy code for clarity and integration stability."],
      ["Delivered Capability", "Supported fast quotation workflows with rate normalization and integrated issuance for internal teams and partners, while accommodating expiry and changes affecting quotations."],
    ],
    stack: [],
  },
  {
    id: "wensymes",
    role: "Principal Full Stack Developer",
    scope: "HR and administration · full-stack engineering",
    category: "People / Enterprise applications",
    company: "WenSymes",
    period: "2025 onward",
    title: "WenSymes — Human Resources Management Platform",
    summary: "Adaptable HR and administration workflows, with full-stack web development, Google Cloud and Microsoft 365.",
    result: "Contributed adaptable internal tools; professional collaboration continues on an occasional basis.",
    functions: ["HR & administration", "Full-stack engineering", "Technical ownership"],
    visualLabel: "WenSymes HR Platform",
    details: [
      ["Business problem", "Internal HR and operational administration needed to accommodate changing employee roles and organizational needs."],
      ["Role & ownership", "Principal Full Stack Developer experience building internal administration tools and planning product-domain capabilities. The engagement continues as occasional professional collaboration."],
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
    period: "2016–2017",
    title: "HR workflows that adapt to different companies.",
    summary:
      "Helped build configurable HR workflows for multiple companies.",
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
    period: "2018–2020",
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
      ["Ownership", "Designed and implemented the business subletting and home rental management system as a freelance Principal Full Stack Solution Developer."],
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
    period: "Jun 2022 — Present",
    title: "Principal Full Stack Engineer",
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
      "Legacy modernization, multi-entity data modeling, and dependable integration between platforms.",
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
