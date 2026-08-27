import type { ProjectBase, ResumeData } from "../types.js";

/** YAML folded scalar(`>`)로 들어온 문단을 한 줄로 정규화합니다. */
function line(text: string): string {
  return text.replace(/\s*\n\s*/g, " ").trim();
}

/**
 * ResumeData → Schema.org JSON-LD 객체를 생성합니다.
 * 웹 이력서 페이지의 <script type="application/ld+json"> 에 삽입하면
 * 검색엔진과 AI 크롤러가 구조화된 데이터로 파싱할 수 있습니다.
 */
export function toJsonLd(data: ResumeData): Record<string, unknown> {
  const allProjects: ProjectBase[] = [...data.work.flatMap((job) => job.projects), ...data.openSource, ...data.sideProjects];

  // 모든 기술 스택 키워드를 수집
  const allTechKeywords = new Set<string>();
  for (const project of allProjects) {
    for (const tech of project.techStack) {
      allTechKeywords.add(tech);
    }
  }
  for (const tech of data.skills.frontend) allTechKeywords.add(tech);
  for (const tech of data.skills.testing) allTechKeywords.add(tech);
  for (const tech of data.skills.tooling) allTechKeywords.add(tech);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.basics.name,
    alternateName: data.basics.nameKo,
    jobTitle: data.basics.label,
    email: `mailto:${data.basics.email}`,
    url: data.basics.url,
    description: line(data.basics.summary) || data.basics.label,
    sameAs: data.basics.profiles.map((p) => p.url),
    knowsAbout: [...allTechKeywords],
    alumniOf: [
      ...data.education.map((edu) => ({
        "@type": "EducationalOrganization",
        name: edu.institution,
        location: edu.location,
      })),
      ...data.training.map((t) => ({
        "@type": "EducationalOrganization",
        name: t.institution,
        location: t.location,
      })),
    ],
    hasOccupation: data.work.map((job) => ({
      "@type": "Occupation",
      name: job.position,
      occupationLocation: {
        "@type": "Organization",
        name: job.company,
        department: {
          "@type": "Organization",
          name: job.department,
        },
      },
      startDate: job.startDate,
      ...(job.endDate ? { endDate: job.endDate } : {}),
    })),
    subjectOf: allProjects.map((project) => ({
      "@type": "CreativeWork",
      name: project.name,
      abstract: line(project.oneLiner),
      keywords: project.techStack,
      ...(project.links?.repo ? { url: project.links.repo } : {}),
    })),
    award: data.awards.map((a) => (a.project ? `${a.title} — ${a.project}` : a.title)),
    hasCredential: data.certifications.map((cert) => ({
      "@type": "EducationalOccupationalCredential",
      name: cert.name,
    })),
    knowsLanguage: data.languages.map((lang) => `${lang.name} (${lang.level})`),
  };
}

/**
 * JSON-LD를 HTML <script> 태그 문자열로 반환합니다.
 */
export function toJsonLdScript(data: ResumeData): string {
  const ld = toJsonLd(data);
  return `<script type="application/ld+json">\n${JSON.stringify(ld, null, 2)}\n</script>`;
}
