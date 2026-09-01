import type { ResumeData } from "../types.js";

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
    lines.push(data.basics.summary);
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
  lines.push(data.positioning.headline);
  lines.push("");

  // ── Skills ────────────────────────────────────────────────────────────────
  const s = data.skills;
  lines.push("## 기술 스택");
  lines.push("");
  if (s.frontend.length > 0) lines.push(`- Frontend: ${s.frontend.join(", ")}`);
  if (s.testing.length > 0) lines.push(`- Testing: ${s.testing.join(", ")}`);
  if (s.tooling.length > 0) lines.push(`- Tooling: ${s.tooling.join(", ")}`);
  if (s.design.length > 0) lines.push(`- Design: ${s.design.join(", ")}`);
  if (s.collaboration.length > 0) lines.push(`- Collaboration: ${s.collaboration.join(", ")}`);
  lines.push("");

  // ── Featured Projects ─────────────────────────────────────────────────────
  const featuredProjects = data.work.flatMap((job) => job.projects.filter((p) => p.featured).map((p) => ({ ...p, company: job.company })));
  if (featuredProjects.length > 0) {
    lines.push("## 대표 프로젝트");
    lines.push("");
    for (const proj of featuredProjects) {
      const contributions = proj.keyContributions ?? [];

      lines.push(`### ${proj.name}`);
      lines.push("");
      lines.push(`*${proj.company}* · ${proj.role} · *${proj.period}*`);
      lines.push("");
      lines.push(proj.oneLiner);
      lines.push("");
      lines.push(`기술 스택: ${proj.techStack.join(", ")}`);
      lines.push("");

      if (contributions.length > 0) {
        lines.push("**핵심 기여**");
        lines.push("");
        for (const kc of contributions) {
          const prefix = kc.title ? `- **${kc.title}**\n  ` : `- `;
          lines.push(`${prefix}**문제**: ${kc.problem}`);
          lines.push(`  **판단**: ${kc.decision}`);
          lines.push(`  **결과**: ${kc.result}`);
          if (kc.ownershipEvidence && kc.ownershipEvidence.length > 0) {
            lines.push(`  오너십 근거: ${kc.ownershipEvidence.join(", ")}`);
          }
        }
        lines.push("");
      }
    }
  }

  // ── Work Experience ───────────────────────────────────────────────────────
  if (data.work.length > 0) {
    lines.push("## 경력사항");
    lines.push("");
    for (const job of data.work) {
      const period = job.endDate ? `${job.startDate} – ${job.endDate}` : `${job.startDate} – 현재`;
      lines.push(`### ${job.company} (${job.location})`);
      lines.push("");
      lines.push(`${job.department} · ${job.position} · *${period}*`);
      lines.push("");

      if (job.projects.length > 0) {
        lines.push("**기타 프로젝트**");
        lines.push("");
        for (const proj of job.projects) {
          lines.push(`#### ${proj.name}`);
          lines.push("");
          lines.push(`*${proj.period}* · ${proj.techStack.join(", ")}`);
          lines.push("");
          lines.push(proj.oneLiner);
          lines.push("");
          if (proj.keyContributions && proj.keyContributions.length > 0) {
            for (const kc of proj.keyContributions) {
              const prefix = kc.title ? `- **${kc.title}**\n  ` : `- `;
              lines.push(`${prefix}**문제**: ${kc.problem}`);
              lines.push(`  **판단**: ${kc.decision}`);
              lines.push(`  **결과**: ${kc.result}`);
            }
            lines.push("");
          }
        }
      }
    }
  }

  // ── Open Source ───────────────────────────────────────────────────────────
  if (data.openSource.length > 0) {
    lines.push("## 오픈소스");
    lines.push("");
    for (const proj of data.openSource) {
      const statusLabel = proj.status === "awarded" ? "수상" : proj.status === "in-progress" ? "진행중" : "";
      const badge = statusLabel ? ` (${statusLabel})` : "";
      const nameWithLink = proj.repoUrl ? `[${proj.name}](${proj.repoUrl})` : proj.name;
      lines.push(`### ${nameWithLink}${badge} — ${proj.teamSize}인`);
      lines.push("");
      lines.push(`${proj.oneLiner} (${proj.role})`);
      lines.push("");
      lines.push(`기술 스택: ${proj.techStack.join(", ")}`);
      lines.push("");
      for (const h of proj.keyContributions) {
        const prefix = h.title ? `- **${h.title}**\n  ` : `- `;
        lines.push(`${prefix}**문제**: ${h.problem}`);
        lines.push(`  **판단**: ${h.decision}`);
        lines.push(`  **결과**: ${h.result}`);
      }
      lines.push("");
    }
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
