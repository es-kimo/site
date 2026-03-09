// =============================================================================
// Resume Type Definitions
// =============================================================================
// JSON Resume 표준을 기반으로 확장한 타입입니다.
// 경력 내 프로젝트, 사이드 프로젝트, 케이스 스터디 등 실무 이력서에
// 필요한 구조를 모두 포함합니다.
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
  summary: string;
  profiles: Profile[];
}

// ── Interests ───────────────────────────────────────────────────────────────

export interface Interest {
  name: string;
  description: string;
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

// ── Qualifications ──────────────────────────────────────────────────────────

export interface Qualifications {
  design: string[];
  collaboration: string[];
  certifications: string[];
  english: string[];
}

// ── Work Experience (회사 경력) ─────────────────────────────────────────────

export interface ContributionMetric {
  label: string;
  value: string;
}

export interface ContributionMetrics {
  period: string;
  items: ContributionMetric[];
}

export interface WorkProject {
  name: string;
  period: string;
  techStack: string[];
  description: string;
  highlights: string[];
  commits?: string;
  linesChanged?: string;
}

export interface WorkExperience {
  company: string;
  location: string;
  department: string;
  position: string;
  startDate: string;
  endDate: string;
  contributionMetrics?: ContributionMetrics;
  achievementSummary: string[];
  projects: WorkProject[];
}

// ── Side Projects ───────────────────────────────────────────────────────────

export type ProjectStatus = "awarded" | "completed" | "in-progress";

export interface SideProject {
  name: string;
  teamSize: number;
  status: ProjectStatus;
  awardNote: string;
  description: string;
  highlights: string[];
}

// ── Case Studies (경험과 고민) ──────────────────────────────────────────────

export interface ExecutionStep {
  title: string;
  details: string[];
}

export interface CaseStudy {
  title: string;
  project: string;
  background: string[];
  execution: ExecutionStep[];
  impact: string[];
}

// ── Common ──────────────────────────────────────────────────────────────────

export interface Meta {
  version: string;
  lastModified: string;
  canonical: string;
}

// ── Root ────────────────────────────────────────────────────────────────────

export interface ResumeData {
  basics: Basics;
  interests: Interest[];
  education: Education[];
  training: Training[];
  qualifications: Qualifications;
  work: WorkExperience[];
  sideProjects: SideProject[];
  caseStudies: CaseStudy[];
  meta: Meta;
}
