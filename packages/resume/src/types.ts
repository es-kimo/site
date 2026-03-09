// =============================================================================
// Resume Type Definitions
// =============================================================================
// 채용 담당자 시선의 "증거 중심 구조"로 재설계한 타입입니다.
// positioning / featuredProjects / keyContributions / deepDives 등
// 강점-대표작-문제·행동·결과-깊이 있는 사례 흐름을 반영합니다.
// =============================================================================

// ── Basics ──────────────────────────────────────────────────────────────────

export interface Profile {
  network: string;
  username: string;
  url: string;
}

export interface Basics {
  name: string;
  nameKo: string;
  label: string;
  email: string;
  url: string;
  canonical: string;
  summary: string;
  profiles: Profile[];
}

// ── Positioning ─────────────────────────────────────────────────────────────

export interface CoreStrength {
  id: string;
  title: string;
  description: string;
  evidence: string[];
}

export interface Positioning {
  headline: string;
  targetRoles: string[];
  coreStrengths: CoreStrength[];
}

// ── Experience Summary ──────────────────────────────────────────────────────

export interface Metric {
  label: string;
  value: string;
}

export interface ExperienceSummary {
  totalExperience: string;
  notableMetrics: Metric[];
  focusAreas: string[];
}

// ── Skills ──────────────────────────────────────────────────────────────────

export interface Skills {
  frontend: string[];
  testing: string[];
  tooling: string[];
  design: string[];
  collaboration: string[];
  certifications: string[];
  english: string[];
}

// ── Key Contributions (공용) ────────────────────────────────────────────────

export interface KeyContribution {
  problem: string;
  action: string;
  result: string;
  ownershipEvidence?: string[];
  metrics?: Metric[];
}

// ── Featured Projects ───────────────────────────────────────────────────────

export interface FeaturedProject {
  id: string;
  name: string;
  company: string;
  period: string;
  scope: string;
  role: string;
  featured: boolean;
  techStack: string[];
  oneLiner: string;
  responsibilities: string[];
  keyContributions: KeyContribution[];
  collaboration?: string[];
  metrics?: Metric[];
  deepDiveRef?: string;
}

// ── Work Experience (회사 경력) ─────────────────────────────────────────────

export interface WorkProject {
  id: string;
  name: string;
  period: string;
  role: string;
  featured: boolean;
  techStack: string[];
  oneLiner: string;
  keyContributions?: KeyContribution[];
}

export interface WorkExperience {
  company: string;
  location: string;
  department: string;
  position: string;
  startDate: string;
  endDate: string;
  achievementSummary: string[];
  projects: WorkProject[];
}

// ── Side Projects ───────────────────────────────────────────────────────────

export type ProjectStatus = "awarded" | "completed" | "in-progress";

export interface SideProject {
  id: string;
  name: string;
  teamSize: number;
  status: ProjectStatus;
  awardNote?: string;
  description: string;
  metrics?: Metric[];
  keyContributions: string[];
  whyItMatters: string;
}

// ── Deep Dives (경험과 고민) ────────────────────────────────────────────────

export interface ExecutionStep {
  title: string;
  details: string[];
}

// ── Education & Training ────────────────────────────────────────────────────

export interface Education {
  institution: string;
  location: string;
  area: string;
  startDate: string;
  endDate: string;
}

export interface Training {
  institution: string;
  location: string;
  course: string;
  startDate: string;
  endDate: string;
}

// ── Common ──────────────────────────────────────────────────────────────────

export interface Meta {
  version: string;
  lastModified: string;
  notes: string[];
}

// ── Root ────────────────────────────────────────────────────────────────────

export interface ResumeData {
  basics: Basics;
  positioning: Positioning;
  experienceSummary: ExperienceSummary;
  skills: Skills;
  featuredProjects: FeaturedProject[];
  work: WorkExperience[];
  sideProjects: SideProject[];
  education: Education[];
  training: Training[];
  meta: Meta;
}
