import type { ProjectBase, ResumeData } from "../types.js";

/** YAML folded scalar(`>`)로 들어온 문단을 한 줄로 정규화합니다. */
function line(text: string): string {
  return text.replace(/\s*\n\s*/g, " ").trim();
}

/** highlight 하나를 `제목: 요약 (결과, 결과)` 형태의 한 줄로 만듭니다. */
function highlightLine(highlight: ProjectBase["highlights"][number]): string {
  const base = `${line(highlight.title)}: ${line(highlight.summary)}`;
  if (!highlight.impact || highlight.impact.length === 0) return base;
  return `${base} (${highlight.impact.map(line).join(", ")})`;
}

/** JSON Resume 의 projects 항목으로 변환합니다. */
function toProjectEntry(project: ProjectBase): Record<string, unknown> {
  return {
    name: project.name,
    description: line(project.oneLiner),
    highlights: project.highlights.map(highlightLine),
    keywords: project.techStack,
    roles: [project.role],
    ...(project.period ? { period: project.period } : {}),
    ...(project.scope ? { scope: project.scope } : {}),
    ...(project.constraints ? { constraints: project.constraints.map(line) } : {}),
    ...(project.links?.repo ? { url: project.links.repo } : {}),
  };
}

/**
 * ResumeData → JSON Resume 표준에 가깝게 변환합니다.
 * 표준에 없는 필드(scope, constraints, training 등)는 커스텀 키로 포함합니다.
 * https://jsonresume.org/schema
 */
export function toJsonResume(data: ResumeData): Record<string, unknown> {
  return {
    $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: {
      name: data.basics.name,
      label: data.basics.label,
      email: data.basics.email,
      url: data.basics.url,
      summary: line(data.basics.summary),
      profiles: data.basics.profiles.map((p) => ({
        network: p.network,
        username: p.username,
        url: p.url,
      })),
    },
    work: data.work.map((job) => ({
      name: job.company,
      location: job.location,
      position: job.position,
      startDate: job.startDate,
      endDate: job.endDate || undefined,
      highlights: job.projects.map((p) => `${p.name} — ${line(p.oneLiner)}`),
      // 표준 외 확장: 프로젝트 단위 상세
      projects: job.projects.map((p) => ({ ...toProjectEntry(p), emphasis: p.emphasis })),
    })),
    education: data.education.map((edu) => ({
      institution: edu.institution,
      area: edu.area,
      startDate: edu.startDate,
      endDate: edu.endDate || undefined,
    })),
    skills: [
      { name: "Frontend", keywords: data.skills.frontend },
      { name: "Testing", keywords: data.skills.testing },
      { name: "Tooling", keywords: data.skills.tooling },
    ],
    projects: [...data.openSource.map((p) => ({ ...toProjectEntry(p), type: "open-source" })), ...data.sideProjects.map((p) => ({ ...toProjectEntry(p), type: "side-project" }))],
    awards: data.awards.map((award) => ({
      title: award.title,
      summary: line(award.summary),
      ...(award.project ? { project: award.project } : {}),
    })),
    // 표준 외 확장 필드
    training: data.training.map((t) => ({
      institution: t.institution,
      course: t.course,
      startDate: t.startDate,
      endDate: t.endDate || undefined,
    })),
    certificates: data.certifications.map((c) => ({ name: c.name })),
    languages: data.languages.map((l) => ({ language: l.name, fluency: l.level })),

    meta: {
      canonical: data.basics.canonical,
      version: data.meta.version,
      lastModified: data.meta.lastModified,
    },
  };
}
