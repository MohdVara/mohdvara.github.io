// Facts from the supplied LinkedIn profile, reviewed 6 October 2026.
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
interface Project {
  id: string;
  category: string;
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
    id: "campus", category: "Education / Modernisation", company: "Centre for Content Creation", period: "2023 onward",
    title: "University branches, brought into a shared codebase.",
    summary: "Separate university-branch implementations needed a shared foundation while retaining core academic workflows.",
    scope: "Multiple university branches · students · classes · academic structures",
    result: "Rebuilt Campus Management System V3 into a more unified codebase supporting branch workflows.",
    functions: ["Branch implementations", "Shared campus codebase", "Students, classes & academic structures"],
    visualLabel: "Campus Management Modernisation",
    details: [
      ["Problem", "Unify separate branch implementations while preserving student, class and academic workflows."],
      ["My contribution", "Led full-stack campus and classroom development as Principal Full Stack Developer, including rebuilding Campus Management System V3 from April 2023 onward."],
      ["Constraints", "Existing branch variations and core academic workflows had to remain supported during modernisation."],
      ["Approach", "Consolidated branch implementations. Introduced multi-environment DevOps and deployment procedures across the wider campus work."],
      ["Delivered result", "A rebuilt, more unified campus-management codebase. Maintainability and hosting efficiency guided the modernisation work."],
    ], stack: [],
  },
  {
    id: "meetings",
    scope: "Live sessions · participation · recordings · reporting APIs",
    category: "Education / Collaboration",
    company: "Centre for Content Creation",
    period: "2021 onward",
    title: "Online classes, with attendance and reporting built in.",
    summary:
      "Connected live classes, participation, recordings and reporting to existing systems.",
    result:
      "Minute-by-minute attendance tracking, meeting recordings stored in S3, and APIs that make session data available for reporting and class metrics.",
    functions: [
      "Online classes & meetings",
      "Attendance & recordings",
      "Reporting & integration APIs",
    ],
    visualLabel: "Classroom & Meeting Tools",
    details: [
      [
        "Ownership",
        "Full-stack development of the meeting management system, alongside classroom applications and integrations at Centre for Content Creation.",
      ],
      [
        "Meeting system",
        "Used JavaScript and AWS Chime for online classes and meetings. Implemented minute-by-minute attendance tracking, recordings, automated storage in Amazon S3, and APIs for other systems to access meeting data.",
      ],
      [
        "Classroom applications",
        "Developed an embeddable class management application used by multiple institutions, covering scheduling, participation tracking, and integration with existing systems. Later in-house classroom work integrated third-party applications and internal systems, reducing reliance on external subscriptions.",
      ],
      [
        "Delivery",
        "Supported legacy modernization, multi-environment DevOps, and deployment procedures across the wider engineering work.",
      ],
    ],
    stack: ["JavaScript", "AWS Chime", "Amazon S3 (meeting system)"],
  },
  {
    id: "insurance",
    scope: "Motor · medical · group medical · fire insurance",
    category: "Fintech / Integration",
    company: "PolicyStreet",
    period: "2019–2021",
    title: "From insurance rates to integrated policy issuance.",
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
    id: "hr",
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
    company: "Confidential engagement",
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
      "Engineering direction, practical technical training, and RAG-based onboarding and knowledge tools.",
    tools:
      "Team enablement · Stakeholder alignment · RAG · Vector databases · AI-assisted engineering",
  },
];

// Real professional work leads; public exercises remain supplementary.
projects.sort((a, b) => ["campus", "insurance", "rental", "meetings", "hr"].indexOf(a.id) - ["campus", "insurance", "rental", "meetings", "hr"].indexOf(b.id));
