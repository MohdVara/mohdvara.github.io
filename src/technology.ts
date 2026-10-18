import type { ProjectId } from "./content";

export interface TechnologyGroup {
  label: string;
  technologies: string[];
}
export interface TechnologyGeneration {
  label?: "Legacy systems" | "Modern systems";
  legacy?: boolean;
  groups: TechnologyGroup[];
}
export interface TechnologyExperience {
  id: string;
  projectId?: ProjectId;
  projectTitle: string;
  anchor: string;
  generations: TechnologyGeneration[];
  legacy?: boolean;
  note?: string;
  repository?: { url: string; commit: string };
}
export const technologyReview = {
  version: "pace-technology-v1.2",
  reviewedAt: "2026-10-18T15:47:43.951Z",
  ownerConfirmedOn: "2026-10-18",
  sourceType: "owner-confirmed",
  authorization: "Owner-confirmed technology inventory, 18 October 2026; names, explicit versions and broad hosting categories only.",
} as const;

// Canonical mapping: Project.stack and the public JSON export are projections.
// Technology involvement does not establish sole infrastructure ownership.
export const technologyExperience: TechnologyExperience[] = [
  {
    id: "hostel", projectTitle: "Hostel Management System", anchor: "system-hostel", legacy: true,
    generations: [{ groups: [
      { label: "Backend", technologies: ["Plain PHP", "PHP Data Objects (PDO)"] },
      { label: "Database", technologies: ["MySQL"] },
    ] }],
    note: "Historical personal/academic presentation project; unmaintained and not production-ready. The README notes possible bugs and omitted security precautions. These practices are not current recommendations.",
    repository: { url: "https://github.com/MohdVara/Hostel-Management-System/tree/master", commit: "4e5d12fa53809873a0eb33920bc6912a9d005a5e" },
  },
  {
    id: "rental", projectId: "rental", projectTitle: "Rental Management System", anchor: "case-rental",
    generations: [{ groups: [
      { label: "Backend", technologies: ["Symfony"] },
      { label: "Database", technologies: ["MySQL"] },
      { label: "Web server", technologies: ["Apache"] },
      { label: "Hosting", technologies: ["Third-party cloud provider"] },
    ] }],
  },
  {
    id: "campus", projectId: "campus", projectTitle: "Education Platform Modernization", anchor: "case-campus",
    generations: [
      { label: "Legacy systems", legacy: true, groups: [
        { label: "Application", technologies: ["PHPMaker", "PHP 5"] },
        { label: "Database", technologies: ["MySQL 5.7"] },
        { label: "Web server", technologies: ["Apache"] },
        { label: "Hosting", technologies: ["On-premises", "AWS EC2"] },
      ] },
      { label: "Modern systems", groups: [
        { label: "Application", technologies: ["Laravel", "Node.js", "React"] },
        { label: "Data", technologies: ["PostgreSQL", "MySQL"] },
        { label: "Web servers", technologies: ["Nginx", "Apache"] },
        { label: "Hosting & orchestration", technologies: ["On-premises", "AWS ECS", "AWS EC2", "Kubernetes", "Third-party cloud provider"] },
      ] },
    ],
    note: "Technology inventory across distinct platform generations; not a single deployment or a claim that every legacy system was replaced.",
  },
  {
    id: "insurance", projectId: "insurance", projectTitle: "PolicyStreet — Insurance Comparison Platform", anchor: "case-insurance",
    generations: [{ groups: [
      { label: "Frontend", technologies: ["React", "Next.js"] },
      { label: "Backend", technologies: ["Node.js"] },
      { label: "Database", technologies: ["PostgreSQL"] },
      { label: "Engineering tools", technologies: ["Docker", "Playwright"] },
      { label: "Infrastructure", technologies: ["Nginx", "AWS EC2", "AWS ECS"] },
    ] }],
  },
  {
    id: "wensymes", projectId: "wensymes", projectTitle: "WenSymes — Human Resources Management Platform", anchor: "case-wensymes",
    generations: [{ groups: [
      { label: "Application", technologies: ["Laravel", "PHP 8"] },
      { label: "Database", technologies: ["MySQL"] },
      { label: "Web servers", technologies: ["Apache", "Nginx"] },
      { label: "Containers & orchestration", technologies: ["Docker", "Kubernetes"] },
      { label: "Cloud", technologies: ["Google Cloud (GCP)"] },
    ] }],
  },
  {
    id: "asset", projectTitle: "Asset Management System", anchor: "system-asset",
    generations: [{ groups: [
      { label: "Application", technologies: ["Ruby on Rails"] },
      { label: "Database", technologies: ["MySQL"] },
      { label: "Web server", technologies: ["Nginx"] },
      { label: "Cloud", technologies: ["Microsoft Azure"] },
    ] }],
  },
];
export const technologyFor = (id: ProjectId) => technologyExperience.find(record => record.projectId === id);
export const technologyStack = (id: ProjectId) => [...new Set(technologyFor(id)?.generations.flatMap(generation => generation.groups.flatMap(group => group.technologies)) || [])];
