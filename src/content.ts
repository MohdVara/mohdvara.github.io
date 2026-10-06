// Facts from the supplied LinkedIn profile, reviewed 6 October 2026.
// See docs/content-sources.md; do not publish inferred architecture as fact.
export const profile = {
  email: "mohd@paramasvara.online",
  github: "https://github.com/MohdVara",
  linkedin: "https://www.linkedin.com/in/mohdvara/",
  resume: "https://rxresu.me/mwara95/distinguished-acceptable-tern",
};
interface Project {
  id: string;
  category: string;
  company: string;
  period: string;
  title: string;
  summary: string;
  result: string;
  functions: string[];
  visualLabel: string;
  details: [string, string][];
  stack: string[];
}
export const projects: Project[] = [
  {
    id: "meetings",
    category: "Education / Collaboration",
    company: "Centre for Content Creation",
    period: "2021 onward",
    title: "Online classes, with attendance and reporting built in.",
    summary:
      "Built classroom and meeting tools that connect live sessions, participation tracking, recordings, and reporting with existing systems.",
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
    category: "Fintech / Integration",
    company: "PolicyStreet",
    period: "2019–2021",
    title: "From insurance rates to integrated policy issuance.",
    summary:
      "An insurance comparison platform connecting internal users and partner systems to quoting and issuance across multiple insurance products.",
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
        "Providers exposed different quotation and issuance flows. Internal teams and partner systems needed consistent access across motor, medical, group medical, and fire insurance.",
      ],
      [
        "Ownership",
        "Built backend and frontend rate-fetching and normalization as a Senior Full Stack Developer, then led development and operations as Engineering Director.",
      ],
      [
        "Engineering",
        "Integrated external insurer APIs and internal services; applied security and consistency checks. Revamped legacy systems with emphasis on code clarity, performance, and integration stability.",
      ],
      [
        "Result",
        "Consistent quoting and policy issuance experiences across internal and partner workflows, aligned with changing business and regulatory requirements.",
      ],
    ],
    stack: [],
  },
  {
    id: "hr",
    category: "People / Business operations",
    company: "Centre for Content Creation",
    period: "2016–2017",
    title: "HR workflows that adapt to different companies.",
    summary:
      "Helped develop a human resource management system supporting multiple companies, with configurable structures, leave entitlements, and attendance policies.",
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
        "A configurable system supporting varied company structures and HR policies, rather than requiring one fixed workflow for every organization.",
      ],
    ],
    stack: [],
  },
  {
    id: "rental",
    category: "Proptech / Business operations",
    company: "MegaInfinite",
    period: "2018–2020",
    title: "Rental operations, from contracts to financial clarity.",
    summary:
      "A home rental and subletting management system bringing property, tenant, and contract workflows into a single operational platform.",
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
        "Engineering",
        "Focused on reliable data structures and multi-entity handling of properties, tenants, and contracts. Included contract generation and payment tracking.",
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
      "Building internal administration tools for HR and operational workflows, using full-stack technologies and cloud services. Planning domain tools with attention to data consistency, access control, and uptime.",
  },
  {
    period: "Jun 2022 — Present",
    title: "Principal Full Stack Engineer",
    company: "Centre for Content Creation",
    type: "Contract · Remote",
    description:
      "Leading classroom applications, meeting tools, and integrations alongside campus modernization. Building in-house tools, modernizing legacy code, and establishing DevOps and deployment standards. Previously Full Stack Developer here, June 2021–June 2022.",
  },
  {
    period: "May 2019 — Jun 2021",
    title: "Senior Full Stack Developer → Director, Engineering",
    company: "PolicyStreet",
    type: "Full-time",
    description:
      "Built insurance rate normalization, then progressed to engineering direction in October 2019. Led development and operations, partner integrations, and quoting and issuance systems through changing business and regulatory requirements.",
  },
  {
    period: "Jun 2018 — Present",
    title: "Technical Trainer",
    company: "Tertiary Courses",
    type: "Training",
    description:
      "Hands-on instruction from beginner to advanced levels in Laravel, Django, Rails, Node.js, and relational and non-relational databases.",
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
