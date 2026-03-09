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

  // ── Interests ─────────────────────────────────────────────────────────────
  if (data.interests.length > 0) {
    lines.push("## 관심 분야");
    lines.push("");
    for (const interest of data.interests) {
      lines.push(`- **${interest.name}**: ${interest.description}`);
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

  // ── Qualifications ────────────────────────────────────────────────────────
  const q = data.qualifications;
  const hasQual = q.design.length > 0 || q.collaboration.length > 0 || q.certifications.length > 0 || q.english.length > 0;
  if (hasQual) {
    lines.push("## 기타 / 자격");
    lines.push("");
    if (q.design.length > 0) lines.push(`- 디자인: ${q.design.join(", ")}`);
    if (q.collaboration.length > 0) lines.push(`- 협업: ${q.collaboration.join(", ")}`);
    if (q.certifications.length > 0) lines.push(`- 자격증: ${q.certifications.join(", ")}`);
    if (q.english.length > 0) lines.push(`- 영어: ${q.english.join(", ")}`);
    lines.push("");
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

      // Contribution metrics
      if (job.contributionMetrics && job.contributionMetrics.items.length > 0) {
        lines.push(`**기여사항 (${job.contributionMetrics.period})**`);
        lines.push("");
        for (const m of job.contributionMetrics.items) {
          lines.push(`- ${m.label}: ${m.value}`);
        }
        lines.push("");
      }

      // Achievement summary
      if (job.achievementSummary.length > 0) {
        lines.push("**주요 성과 요약**");
        lines.push("");
        for (const a of job.achievementSummary) {
          lines.push(`- ${a}`);
        }
        lines.push("");
      }

      // Projects
      if (job.projects.length > 0) {
        lines.push("**참여 프로젝트**");
        lines.push("");
        for (const proj of job.projects) {
          lines.push(`#### ${proj.name}`);
          lines.push("");
          lines.push(`*${proj.period}* · ${proj.techStack.join(", ")}`);
          lines.push("");
          if (proj.description) {
            lines.push(proj.description);
            lines.push("");
          }
          for (const h of proj.highlights) {
            lines.push(`- ${h}`);
          }
          if (proj.commits || proj.linesChanged) {
            lines.push("");
            if (proj.commits) lines.push(`- commits: ${proj.commits}`);
            if (proj.linesChanged) lines.push(`- lines changed: ${proj.linesChanged}`);
          }
          lines.push("");
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
      for (const h of proj.highlights) {
        lines.push(`- ${h}`);
      }
      lines.push("");
    }
  }

  // ── Case Studies ──────────────────────────────────────────────────────────
  if (data.caseStudies.length > 0) {
    lines.push("## 경험과 고민");
    lines.push("");
    for (const cs of data.caseStudies) {
      lines.push(`### ${cs.title}`);
      lines.push("");
      lines.push(`*${cs.project}*`);
      lines.push("");

      lines.push("**배경 (Why)**");
      lines.push("");
      for (const b of cs.background) {
        lines.push(`- ${b}`);
      }
      lines.push("");

      lines.push("**실행 (How)**");
      lines.push("");
      for (const step of cs.execution) {
        lines.push(`**${step.title}**`);
        lines.push("");
        for (const d of step.details) {
          lines.push(`- ${d}`);
        }
        lines.push("");
      }

      lines.push("**결과 (Impact)**");
      lines.push("");
      for (const i of cs.impact) {
        lines.push(`- ${i}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n").trim() + "\n";
}
