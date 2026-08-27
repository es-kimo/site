// =============================================================================
// Resume Type Definitions
// =============================================================================
// resume.yaml 구조를 기준으로 관리되는 타입입니다.
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

export interface Positioning {
  headline: string;
  targetRoles: string[];
}

// ── Skills ──────────────────────────────────────────────────────────────────

export interface Skills {
  frontend: string[];
  testing: string[];
  tooling: string[];
}

// ── Projects (공용) ─────────────────────────────────────────────────────────

/**
 * 프로젝트에서 한 일 하나.
 * `summary`에는 수행한 판단과 행동을, `impact`에는 검증 가능한 결과만 담습니다.
 */
export interface Highlight {
  title: string;
  summary: string;
  /** 수치나 근거가 확인되는 결과만 기재합니다. */
  impact?: string[];
}

export interface ProjectLinks {
  repo?: string;
  npm?: string;
  docs?: string;
  demo?: string;
}

/**
 * 렌더링 비중.
 * primary는 가장 크게, secondary는 그다음, supporting은 요약 수준으로 노출합니다.
 */
export type ProjectEmphasis = "primary" | "secondary" | "supporting";

/** 모든 프로젝트 종류가 공유하는 필드 */
export interface ProjectBase {
  id: string;
  name: string;
  period?: string;
  /** 맡은 직책 (예: Development Lead) */
  role: string;
  /** 실제 책임 범위. role만으로 드러나지 않는 담당 영역. */
  scope?: string;
  techStack: string[];
  oneLiner: string;
  /** 해결책의 수준을 판단하는 데 필요한 제약만 기재합니다. */
  constraints?: string[];
  highlights: Highlight[];
  links?: ProjectLinks;
}

// ── Work Experience (회사 경력) ─────────────────────────────────────────────

export interface WorkProject extends ProjectBase {
  period: string;
  scope: string;
  emphasis: ProjectEmphasis;
}

export interface WorkExperience {
  company: string;
  location: string;
  department: string;
  position: string;
  startDate: string;
  endDate: string;
  projects: WorkProject[];
}

// ── Open Source ─────────────────────────────────────────────────────────────

export interface OpenSourceProject extends ProjectBase {
  period: string;
  scope: string;
}

// ── Side Projects ───────────────────────────────────────────────────────────

export type SideProject = ProjectBase;

// ── Awards ──────────────────────────────────────────────────────────────────

export interface Award {
  title: string;
  /** 수상 대상 프로젝트명 */
  project?: string;
  summary: string;
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
}

export interface Certification {
  name: string;
}

export interface Language {
  name: string;
  level: string;
}

// ── Root ────────────────────────────────────────────────────────────────────

export interface ResumeData {
  basics: Basics;
  positioning: Positioning;
  skills: Skills;
  work: WorkExperience[];
  openSource: OpenSourceProject[];
  sideProjects: SideProject[];
  awards: Award[];
  education: Education[];
  training: Training[];
  certifications: Certification[];
  languages: Language[];
  meta: Meta;
}

// ── Interview Stories ───────────────────────────────────────────────────────

export interface AlternativeConsidered {
  approach: string;
  whyNotViable: string;
}

export interface TechnicalStep {
  title: string;
  insight: string;
  code?: string;
  layerBehavior?: Record<string, string>;
}

export interface TechnicalDeepDive {
  title: string;
  summary: string;
  steps: TechnicalStep[];
}

export interface InterviewQuestion {
  q: string;
  conclusion: string;
  reason?: string;
  example?: string;
  retrospective?: string;
}

// ── Branch‑style questions (tree structure) ─────────────────────────────────

export interface BranchQuestion {
  id: string;
  q: string;
  answer: string;
  followUps?: BranchQuestion[];
}

export interface QuestionBranch {
  id: string;
  trigger: string;
  questions: BranchQuestion[];
}

export interface EntryQuestion {
  q: string;
  answer: string;
}

export interface InterviewStory {
  id: string;
  tags: string[];
  relatedProject: string;
  title: string;
  /** Flat Q&A list (legacy / simple stories) */
  questions: InterviewQuestion[];
  /** Tree-structured entry point + branches (new format) */
  entryQuestion?: EntryQuestion;
  branches?: QuestionBranch[];
  ownership: string[];
  technicalDeepDives?: TechnicalDeepDive[];
  alternativesConsidered?: AlternativeConsidered[];
}

export interface InterviewStoriesData {
  stories: InterviewStory[];
}
