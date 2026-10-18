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
}
export const projects: Project[] = [
  {
    id: "campus", role: "Principal Full Stack Engineer", category: "Education / Modernisation", company: "Centre for Content Creation", period: "2023 onward",
    title: "Enterprise Education Systems — Modernization & Technical Consulting",
    summary: "Full-stack engineering and technical leadership on an established platform in the education sector.",
    scope: "Education platform · full-stack engineering · technical leadership",
    result: "Contributed to platform modernisation with a focus on maintainability and ongoing delivery.",
    functions: ["Platform modernisation", "Full-stack engineering", "Maintainability"],
    visualLabel: "Education Platform Modernisation",
    details: [
      ["My contribution", "Led full-stack development and contributed technical direction as Principal Full Stack Engineer."],
      ["Focus", "Modernising established software while supporting its ongoing use and development."],
      ["Engineering priorities", "Maintainability, dependable delivery and long-term platform development."],
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
      "Normalized rates from multiple providers into one interface, with integrated quotation and policy issuance flows.",
    functions: [
      "Multiple insurance providers",
      "Normalized quotations",
      "Partner APIs & policy issuance",
    ],
    visualLabel: "Insurance Comparison System",
    details: [
      [
        "Problem",
        "Unify provider quotation and issuance flows across motor, medical, group medical and fire insurance.",
      ],
      [
        "Ownership",
        "Built backend and frontend rate-fetching and normalization as a Senior Full Stack Developer, then led development and operations as Engineering Director.",
      ],
      [
        "Constraints & approach",
        "Integrated insurer APIs and internal services under changing business and regulatory requirements. Applied security and consistency checks; modernised legacy code for clarity and integration stability.",
      ],
      [
        "Result",
        "Delivered rate normalization and integrated quoting and issuance for internal and partner workflows.",
      ],
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
    summary: "Building internal HR and administration tools for day-to-day operations, using full-stack web development, Google Cloud and Microsoft 365.",
    result: "Contributing principal full-stack development to HR and administration software.",
    functions: ["HR & administration", "Full-stack engineering", "Technical ownership"],
    visualLabel: "WenSymes HR Platform",
    details: [
      ["Context", "Internal administration tools supporting HR and operational workflows within the WenSymes engagement."],
      ["Role & ownership", "Principal Full Stack Developer, building internal administration tools and planning product-domain capabilities."],
      ["Constraints & planning", "Data consistency, access control and uptime matter for daily operations. Planning considers these requirements; detailed internal rules and implementation remain private."],
      ["Technical approach", "Full-stack web development with Google Cloud and Microsoft 365."],
      ["Contribution", "Developing internal HR and operational tools while planning further domain-specific capabilities."],
    ],
    stack: ["Full-stack web", "Google Cloud", "Microsoft 365"],
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
      "Rental staff needed connected property, tenant, contract and financial workflows.",
    result:
      "Tracked 20+ properties, with contract workflows and property-level income, expenses, and profit/loss reporting.",
    functions: [
      "Properties, tenants & contracts",
      "Payments, renewals & cancellations",
      "Property-level financial reporting",
    ],
    visualLabel: "Home Rental Management System",
    details: [
      [
        "Problem",
        "Staff needed to manage contracts, renewals, cancellations, and financial visibility across more than 20 rental properties.",
      ],
      [
        "Ownership",
        "Designed and implemented the business subletting and home rental management system as a freelance Principal Full Stack Solution Developer.",
      ],
      [
        "Constraints & approach",
        "Separated property, tenant and contract records to support multi-entity workflows, contract generation and payment tracking.",
      ],
      [
        "Result",
        "Clear renewal and cancellation workflows, rental income versus expenses, and profit/loss visibility for individual properties.",
      ],
    ],
    stack: [],
  },
];
export const experience = [
  {
    period: "Mar 2025 — Present",
    title: "Principal Full Stack Developer",
    company: "WenSymes",
    type: "Remote · Singapore",
    description:
      "Building full-stack HR and administration tools with cloud services. Planning domain tools around data consistency, access control and uptime.",
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
      "Engineering direction and technical training. AI-assisted engineering is illustrated by No Two Mondays; RAG and vector databases are résumé-listed capabilities.",
    tools:
      "Team enablement · Stakeholder alignment · RAG · Vector databases · AI-assisted engineering",
  },
];

// Real professional work leads; public exercises remain supplementary.
projects.sort((a, b) => projectIds.indexOf(a.id) - projectIds.indexOf(b.id));
