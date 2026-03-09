import { getResumeData } from "@workspace/resume/data";
import { toJsonLd } from "@workspace/resume/generators/json-ld";
import type { ResumeData, WorkProject, SideProject, CaseStudy, ExecutionStep } from "@workspace/resume/types";
import type { Metadata } from "next";
import { cn } from "@workspace/ui/lib/utils";
import { getLanguage } from "@/lib/language";

export const metadata: Metadata = {
  title: "Resume",
  description: "류기현 — Frontend Engineer",
};

// ── Utilities ──────────────────────────────────────────────────────────────

/**
 * 간단한 인라인 마크다운 파서
 * 백틱(`code`), 볼드(**text**), 이탤릭(*text*)을 지원합니다.
 */
function parseInlineMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let key = 0;

  // 백틱(code), 볼드, 이탤릭을 순차적으로 파싱
  // 볼드를 먼저 매칭하여 이탤릭과의 충돌 방지
  const pattern = /(`[^`]+`)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    // 매치 이전의 일반 텍스트
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // 백틱: `code`
      nodes.push(
        <code key={key++} className="px-1.5 py-0.5 rounded bg-muted text-[0.9em] font-mono">
          {match[1].slice(1, -1)}
        </code>,
      );
    } else if (match[2]) {
      // 볼드: **text**
      nodes.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3]) {
      // 이탤릭: *text*
      nodes.push(<em key={key++}>{match[3]}</em>);
    }

    lastIndex = pattern.lastIndex;
  }

  // 남은 텍스트
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

// ── UI Primitives ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10 print:mb-6 print:break-inside-avoid">
      <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2 print:text-base print:mb-2 print:pb-1">{title}</h2>
      {children}
    </section>
  );
}

function DateRange({ start, end }: { start: string; end?: string }) {
  return (
    <span className="text-sm text-muted-foreground whitespace-nowrap">
      {start} – {end || "현재"}
    </span>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-block text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground mr-1.5 mb-1.5 print:bg-gray-100 print:text-gray-700 print:px-1.5 print:py-0">{children}</span>;
}

function StatusBadge({ status }: { status: SideProject["status"] }) {
  const labels: Record<SideProject["status"], string> = {
    awarded: "수상",
    completed: "",
    "in-progress": "진행중",
  };
  const label = labels[status];
  if (!label) return null;
  return (
    <span
      className={cn(
        "inline-block text-xs px-2 py-0.5 rounded-md ml-2",
        status === "awarded" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      )}
    >
      {label}
    </span>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-2 space-y-1 text-sm text-foreground/80">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-muted-foreground select-none shrink-0">·</span>
          <span>{parseInlineMarkdown(item)}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function WorkProjectCard({ project }: { project: WorkProject }) {
  return (
    <div className="mb-5 last:mb-0 print:mb-3 print:break-inside-avoid">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h4 className="font-medium text-sm">{project.name}</h4>
        <span className="text-xs text-muted-foreground">{project.period}</span>
      </div>
      <div className="mt-1">
        {project.techStack.map((tech) => (
          <Badge key={tech}>{tech}</Badge>
        ))}
      </div>
      {project.description && <p className="text-sm text-foreground/80 mt-1.5">{parseInlineMarkdown(project.description)}</p>}
      <BulletList items={project.highlights} />
      {(project.commits || project.linesChanged) && (
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          {project.commits && <span>commits: {project.commits}</span>}
          {project.linesChanged && <span>lines changed: {project.linesChanged}</span>}
        </div>
      )}
    </div>
  );
}

function SideProjectCard({ project }: { project: SideProject }) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-baseline gap-1">
        <h3 className="font-medium text-sm">{project.name}</h3>
        <StatusBadge status={project.status} />
        <span className="text-xs text-muted-foreground ml-auto">{project.teamSize}인</span>
      </div>
      {project.awardNote && <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">*{project.awardNote}</p>}
      <p className="text-sm text-foreground/80 mt-1">{parseInlineMarkdown(project.description)}</p>
      <BulletList items={project.highlights} />
    </div>
  );
}

function CaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <div className="mb-8 last:mb-0 print:mb-4 print:break-inside-avoid">
      <h3 className="font-medium text-sm">{study.title}</h3>
      <p className="text-xs text-muted-foreground mt-0.5">{study.project}</p>

      <div className="mt-3 space-y-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1">배경 (Why)</p>
          <BulletList items={study.background} />
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1">실행 (How)</p>
          {study.execution.map((step: ExecutionStep, i: number) => (
            <div key={i} className="mb-2 last:mb-0">
              <p className="text-sm font-medium text-foreground/90">{step.title}</p>
              <BulletList items={step.details} />
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1">결과 (Impact)</p>
          <BulletList items={study.impact} />
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ResumePage() {
  const data: ResumeData = getResumeData();
  const jsonLd = toJsonLd(data);
  const language = await getLanguage();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article
        className={cn(
          "max-w-2xl mx-auto print:max-w-none print:mx-0 print:text-[11pt] print:leading-snug",
          language === "ko" ? "font-[family-name:var(--font-noto-sans-kr)]" : "font-[family-name:var(--font-stix)]",
        )}
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <header className="mb-10 print:mb-6">
          <h1 className="text-2xl font-bold print:text-xl">
            {data.basics.nameKo}
            <span className="text-muted-foreground font-normal ml-2 text-lg">{data.basics.name}</span>
          </h1>
          <p className="text-muted-foreground mt-1">{data.basics.label}</p>
          {data.basics.summary && <p className="mt-4 text-sm leading-relaxed text-foreground/85">{data.basics.summary}</p>}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
            {data.basics.email && (
              <a href={`mailto:${data.basics.email}`} className="hover:text-foreground transition-colors">
                {data.basics.email}
              </a>
            )}
            {data.basics.profiles.map((profile) => (
              <a key={profile.network} href={profile.url} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                {profile.network}
              </a>
            ))}
            <a href="/resume.pdf" download className="hover:text-foreground transition-colors print:hidden">
              PDF ↓
            </a>
          </div>
        </header>

        {/* ── 관심 분야 ──────────────────────────────────────────── */}
        {data.interests.length > 0 && (
          <Section title="관심 분야">
            <div className="space-y-2">
              {data.interests.map((interest) => (
                <div key={interest.name}>
                  <h3 className="text-sm font-medium">{interest.name}</h3>
                  <p className="text-sm text-foreground/80 mt-0.5">{parseInlineMarkdown(interest.description)}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── 학력사항 & 직무관련 경험 (2-column) ──────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mb-10">
          {data.education.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">학력사항</h2>
              <div className="space-y-3">
                {data.education.map((edu) => (
                  <div key={`${edu.institution}-${edu.startDate}`}>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-sm font-medium">{edu.institution}</h3>
                      <span className="text-xs text-muted-foreground">{edu.location}</span>
                    </div>
                    <p className="text-sm text-foreground/80">{edu.area}</p>
                    <DateRange start={edu.startDate} end={edu.endDate} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.training.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">직무관련 경험</h2>
              <div className="space-y-3">
                {data.training.map((t) => (
                  <div key={`${t.institution}-${t.startDate}`}>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-sm font-medium">{t.institution}</h3>
                      <span className="text-xs text-muted-foreground">{t.location}</span>
                    </div>
                    <p className="text-sm text-foreground/80">{t.course}</p>
                    <DateRange start={t.startDate} end={t.endDate} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── 기타 / 자격 ────────────────────────────────────────── */}
        {(() => {
          const q = data.qualifications;
          const entries = [
            q.design.length > 0 && { label: "디자인", value: q.design.join(", ") },
            q.collaboration.length > 0 && { label: "협업", value: q.collaboration.join(", ") },
            q.certifications.length > 0 && { label: "자격증", value: q.certifications.join(", ") },
            q.english.length > 0 && { label: "영어", value: q.english.join(", ") },
          ].filter(Boolean) as { label: string; value: string }[];
          if (entries.length === 0) return null;
          return (
            <Section title="기타 / 자격">
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                {entries.map((e) => (
                  <span key={e.label}>
                    <span className="text-muted-foreground">{e.label}:</span> {e.value}
                  </span>
                ))}
              </div>
            </Section>
          );
        })()}

        {/* ── 경력사항 ──────────────────────────────────────────── */}
        {data.work.length > 0 && (
          <Section title="경력기술서">
            {data.work.map((job) => (
              <div key={`${job.company}-${job.startDate}`} className="mb-8">
                {/* Company header */}
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                  <h3 className="text-base font-semibold">{job.company}</h3>
                  <span className="text-xs text-muted-foreground">{job.location}</span>
                </div>
                <p className="text-sm text-foreground/80">
                  {job.department} · {job.position}
                </p>
                <DateRange start={job.startDate} end={job.endDate} />

                {/* Achievement summary */}
                {job.achievementSummary.length > 0 && (
                  <div className="mt-5 p-3 rounded-md bg-muted/50">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">주요 성과 요약</p>
                    <BulletList items={job.achievementSummary} />
                  </div>
                )}

                {/* Projects */}
                {job.projects.length > 0 && (
                  <div className="mt-5">
                    <p className="text-xs font-semibold text-muted-foreground mb-3">참여 프로젝트</p>
                    {job.projects.map((proj) => (
                      <WorkProjectCard key={proj.name} project={proj} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* ── 사이드 프로젝트 ──────────────────────────────────── */}
        {data.sideProjects.length > 0 && (
          <Section title="사이드 프로젝트 경험">
            {data.sideProjects.map((proj) => (
              <SideProjectCard key={proj.name} project={proj} />
            ))}
          </Section>
        )}

        {/* ── 경험과 고민 ──────────────────────────────────────── */}
        {data.caseStudies.length > 0 && (
          <Section title="경험과 고민">
            {data.caseStudies.map((cs) => (
              <CaseStudyCard key={cs.title} study={cs} />
            ))}
          </Section>
        )}

        {/* ── Footer ─────────────────────────────────────────────── */}
        <footer className="text-xs text-muted-foreground border-t border-border pt-4 mt-10 print:mt-4 print:pt-2 print:text-gray-500">
          Last updated: {data.meta.lastModified} · v{data.meta.version}
        </footer>
      </article>
    </>
  );
}
