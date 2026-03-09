import type { ResumeData } from "../types.js";

/**
 * ResumeData → JSON Resume 표준에 가깝게 변환합니다.
 * 표준에 없는 필드(caseStudies, training 등)는 커스텀 키로 포함합니다.
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
      summary: data.basics.summary,
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
      highlights: job.achievementSummary,
      projects: job.projects.map((proj) => ({
        name: proj.name,
        period: proj.period,
        techStack: proj.techStack,
        description: proj.description,
        highlights: proj.highlights,
        commits: proj.commits || undefined,
        linesChanged: proj.linesChanged || undefined,
      })),
    })),
    education: data.education.map((edu) => ({
      institution: edu.institution,
      area: edu.area,
      startDate: edu.startDate,
      endDate: edu.endDate || undefined,
    })),
    // 표준 외 확장 필드
    training: data.training.map((t) => ({
      institution: t.institution,
      course: t.course,
      startDate: t.startDate,
      endDate: t.endDate || undefined,
    })),
    interests: data.interests.map((i) => ({
      name: i.name,
      description: i.description,
    })),
    projects: data.sideProjects.map((p) => ({
      name: p.name,
      description: p.description,
      highlights: p.highlights,
      teamSize: p.teamSize,
      status: p.status,
      awardNote: p.awardNote || undefined,
    })),
    caseStudies: data.caseStudies.map((cs) => ({
      title: cs.title,
      project: cs.project,
      background: cs.background,
      execution: cs.execution,
      impact: cs.impact,
    })),

    meta: {
      canonical: data.meta.canonical,
      version: data.meta.version,
      lastModified: data.meta.lastModified,
    },
  };
}
