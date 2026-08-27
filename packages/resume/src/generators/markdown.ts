import type { ProjectBase, ResumeData } from "../types.js";

/** YAML folded scalar(`>`)로 들어온 문단을 한 줄로 정규화합니다. */
function line(text: string): string {
  return text.replace(/\s*\n\s*/g, " ").trim();
}

/** `2026.03 ~ 현재 · Development Lead · 컴포넌트 구조 개편` 형태의 메타 줄 */
function metaLine(project: ProjectBase): string {
  return [project.period, project.role, project.scope].filter((part): part is string => Boolean(part)).map(line).join(" · ");
}

function renderProject(lines: string[], project: ProjectBase, heading: string): void {
  lines.push(`${heading} ${project.name}`);
  lines.push("");

  const meta = metaLine(project);
  if (meta) {
    lines.push(`*${meta}*`);
    lines.push("");
  }

  lines.push(line(project.oneLiner));
  lines.push("");
  lines.push(`기술 스택: ${project.techStack.join(", ")}`);
  lines.push("");

  if (project.links) {
    const links = Object.entries(project.links).map(([label, url]) => `[${label}](${url})`);
    if (links.length > 0) {
      lines.push(`링크: ${links.join(" · ")}`);
      lines.push("");
    }
  }

  if (project.constraints && project.constraints.length > 0) {
    lines.push("**제약**");
    lines.push("");
    for (const constraint of project.constraints) {
      lines.push(`- ${line(constraint)}`);
    }
    lines.push("");
  }

  lines.push("**한 일**");
  lines.push("");
  for (const highlight of project.highlights) {
    lines.push(`- **${line(highlight.title)}**`);
    lines.push(`  ${line(highlight.summary)}`);
    for (const impact of highlight.impact ?? []) {
      lines.push(`  - ${line(impact)}`);
    }
  }
  lines.push("");
}

/**
 * ResumeData → Markdown 문자열로 변환합니다.
 * LLM 컨텍스트, GitHub 프로필, llms.txt 등에 활용할 수 있습니다.
 */
export function toMarkdown(data: ResumeData): string {
  const lines: string[] = [];

  // ── Header ────────────────────────────────────────────────────────────────
  lines.push(`# ${data.basics.name} (${data.basics.nameKo})`);
  lines.push("");
  lines.push(`**${data.basics.label}**`);
  lines.push("");
  if (data.basics.summary) {
    lines.push(line(data.basics.summary));
    lines.push("");
  }

  // ── Contact ───────────────────────────────────────────────────────────────
  lines.push("## Contact");
  lines.push("");
  if (data.basics.email) lines.push(`- Email: ${data.basics.email}`);
  if (data.basics.url) lines.push(`- Website: ${data.basics.url}`);
  for (const profile of data.basics.profiles) {
    lines.push(`- ${profile.network}: [${profile.username}](${profile.url})`);
  }
  lines.push("");

  // ── Positioning ───────────────────────────────────────────────────────────
  lines.push("## 포지셔닝");
  lines.push("");
  lines.push(line(data.positioning.headline));
  lines.push("");
  if (data.positioning.targetRoles.length > 0) {
    lines.push(`지원 직군: ${data.positioning.targetRoles.join(", ")}`);
    lines.push("");
  }

  // ── Skills ────────────────────────────────────────────────────────────────
  const s = data.skills;
  lines.push("## 기술 스택");
  lines.push("");
  if (s.frontend.length > 0) lines.push(`- Frontend: ${s.frontend.join(", ")}`);
  if (s.testing.length > 0) lines.push(`- Testing: ${s.testing.join(", ")}`);
  if (s.tooling.length > 0) lines.push(`- Tooling: ${s.tooling.join(", ")}`);
  lines.push("");

  // ── Work Experience ───────────────────────────────────────────────────────
  // 프로젝트는 resume.yaml 에 적힌 순서(emphasis 순)를 그대로 따릅니다.
  if (data.work.length > 0) {
    lines.push("## 경력사항");
    lines.push("");
    for (const job of data.work) {
      const period = job.endDate ? `${job.startDate} – ${job.endDate}` : `${job.startDate} – 현재`;
      lines.push(`### ${job.company} (${job.location})`);
      lines.push("");
      lines.push(`${job.department} · ${job.position} · *${period}*`);
      lines.push("");

      for (const project of job.projects) {
        renderProject(lines, project, "####");
      }
    }
  }

  // ── Open Source ───────────────────────────────────────────────────────────
  if (data.openSource.length > 0) {
    lines.push("## 오픈소스");
    lines.push("");
    for (const project of data.openSource) {
      renderProject(lines, project, "###");
    }
  }

  // ── Side Projects ─────────────────────────────────────────────────────────
  if (data.sideProjects.length > 0) {
    lines.push("## 사이드 프로젝트");
    lines.push("");
    for (const project of data.sideProjects) {
      renderProject(lines, project, "###");
    }
  }

  // ── Awards ────────────────────────────────────────────────────────────────
  if (data.awards.length > 0) {
    lines.push("## 수상");
    lines.push("");
    for (const award of data.awards) {
      const heading = award.project ? `${award.title} — ${award.project}` : award.title;
      lines.push(`- **${heading}**`);
      lines.push(`  ${line(award.summary)}`);
    }
    lines.push("");
  }

  // ── Certifications & Languages ────────────────────────────────────────────
  if (data.certifications.length > 0) {
    lines.push("## 자격증");
    lines.push("");
    for (const cert of data.certifications) {
      lines.push(`- ${cert.name}`);
    }
    lines.push("");
  }

  if (data.languages.length > 0) {
    lines.push("## 언어");
    lines.push("");
    for (const lang of data.languages) {
      lines.push(`- ${lang.name}: ${lang.level}`);
    }
    lines.push("");
  }

  // ── Education ─────────────────────────────────────────────────────────────
  if (data.education.length > 0) {
    lines.push("## 학력사항");
    lines.push("");
    for (const edu of data.education) {
      lines.push(`- **${edu.institution}** (${edu.location}) — ${edu.area} (${edu.startDate} – ${edu.endDate})`);
    }
    lines.push("");
  }

  // ── Training ──────────────────────────────────────────────────────────────
  if (data.training.length > 0) {
    lines.push("## 직무관련 경험");
    lines.push("");
    for (const t of data.training) {
      lines.push(`- **${t.institution}** (${t.location}) — ${t.course} (${t.startDate} – ${t.endDate})`);
    }
    lines.push("");
  }

  return lines.join("\n").trim() + "\n";
}
