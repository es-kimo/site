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
  if (data.positioning.coreStrengths.length > 0) {
    for (const strength of data.positioning.coreStrengths) {
      lines.push(`- **${strength.title}**: ${strength.description}`);
    }
    lines.push("");
  }

  // ── Experience Summary ────────────────────────────────────────────────────
  lines.push("## 경력 요약");
  lines.push("");
  lines.push(`총 경력: ${data.experienceSummary.totalExperience}`);
  lines.push("");
  if (data.experienceSummary.notableMetrics.length > 0) {
    for (const m of data.experienceSummary.notableMetrics) {
      lines.push(`- ${m.label}: ${m.value}`);
    }
    lines.push("");
  }
  if (data.experienceSummary.focusAreas.length > 0) {
    lines.push(`집중 영역: ${data.experienceSummary.focusAreas.join(", ")}`);
    lines.push("");
  }

  // ── Skills ────────────────────────────────────────────────────────────────
  const s = data.skills;
  lines.push("## 기술 스택");
  lines.push("");
  if (s.frontend.length > 0) lines.push(`- Frontend: ${s.frontend.join(", ")}`);
  if (s.testing.length > 0) lines.push(`- Testing: ${s.testing.join(", ")}`);
  if (s.tooling.length > 0) lines.push(`- Tooling: ${s.tooling.join(", ")}`);
  if (s.design.length > 0) lines.push(`- Design: ${s.design.join(", ")}`);
  if (s.collaboration.length > 0) lines.push(`- Collaboration: ${s.collaboration.join(", ")}`);
  if (s.certifications.length > 0) lines.push(`- 자격증: ${s.certifications.join(", ")}`);
  if (s.english.length > 0) lines.push(`- 영어: ${s.english.join(", ")}`);
  lines.push("");

  // ── Featured Projects ─────────────────────────────────────────────────────
  if (data.featuredProjects.length > 0) {
    lines.push("## 대표 프로젝트");
    lines.push("");
    for (const proj of data.featuredProjects) {
      lines.push(`### ${proj.name}`);
      lines.push("");
      lines.push(`*${proj.company}* · ${proj.role} · *${proj.period}* · ${proj.scope}`);
      lines.push("");
      lines.push(proj.oneLiner);
      lines.push("");
      lines.push(`기술 스택: ${proj.techStack.join(", ")}`);
      lines.push("");

      if (proj.responsibilities.length > 0) {
        lines.push("**담당 업무**");
        lines.push("");
        for (const r of proj.responsibilities) {
          lines.push(`- ${r}`);
        }
        lines.push("");
      }

      if (proj.keyContributions.length > 0) {
        lines.push("**핵심 기여**");
        lines.push("");
        for (const kc of proj.keyContributions) {
          lines.push(`- **문제**: ${kc.problem}`);
          lines.push(`  **행동**: ${kc.action}`);
          lines.push(`  **결과**: ${kc.result}`);
          if (kc.ownershipEvidence && kc.ownershipEvidence.length > 0) {
            lines.push(`  오너십 근거: ${kc.ownershipEvidence.join(", ")}`);
          }
          if (kc.metrics && kc.metrics.length > 0) {
            for (const m of kc.metrics) {
              lines.push(`  ${m.label}: ${m.value}`);
            }
          }
        }
        lines.push("");
      }

      if (proj.collaboration && proj.collaboration.length > 0) {
        lines.push("**협업**");
        lines.push("");
        for (const c of proj.collaboration) {
          lines.push(`- ${c}`);
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

      if (job.achievementSummary.length > 0) {
        lines.push("**주요 성과 요약**");
        lines.push("");
        for (const a of job.achievementSummary) {
          lines.push(`- ${a}`);
        }
        lines.push("");
      }

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
              lines.push(`- **문제**: ${kc.problem}`);
              lines.push(`  **행동**: ${kc.action}`);
              lines.push(`  **결과**: ${kc.result}`);
            }
            lines.push("");
          }
        }
      }
    }
  }

  // ── Side Projects ─────────────────────────────────────────────────────────
  if (data.sideProjects.length > 0) {
    lines.push("## 사이드 프로젝트 경험");
    lines.push("");
    for (const proj of data.sideProjects) {
      const statusLabel = proj.status === "awarded" ? "수상" : proj.status === "in-progress" ? "진행중" : "";
      const badge = statusLabel ? ` (${statusLabel})` : "";
      lines.push(`### ${proj.name}${badge} — ${proj.teamSize}인`);
      lines.push("");
      if (proj.awardNote) {
        lines.push(`*${proj.awardNote}*`);
        lines.push("");
      }
      lines.push(proj.description);
      lines.push("");
      for (const h of proj.keyContributions) {
        lines.push(`- ${h}`);
      }
      lines.push("");
      lines.push(`*${proj.whyItMatters}*`);
      lines.push("");
    }
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
