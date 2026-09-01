import { Fragment } from "react";
import { getResumeData } from "@workspace/resume/data";
import { toJsonLd } from "@workspace/resume/generators/json-ld";
import type { KeyContribution, OpenSourceProject, ResumeData, WorkProject } from "@workspace/resume/types";
import { cn } from "@workspace/ui/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume",
  description: "류기현 — Frontend Engineer",
};

// ── Utilities ──────────────────────────────────────────────────────────────

function parseInlineMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let key = 0;
  const pattern = /(`[^`]+`)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      nodes.push(
        <code key={key++} className="px-1 py-0.5 rounded bg-muted text-[0.9em] font-mono">
          {match[1].slice(1, -1)}
        </code>,
      );
    } else if (match[2]) {
      nodes.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3]) {
      nodes.push(<em key={key++}>{match[3]}</em>);
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes.length > 0 ? nodes : [text];
}

// ── UI Primitives ───────────────────────────────────────────────────────────

function Section({ title, children, className: cls }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("mb-12 print:mb-12", cls)}>
      <h2 className="text-[19px] font-bold tracking-tight mb-5 pb-2 border-b border-border print:text-[16px] print:mb-3 print:pb-1">{title}</h2>
      {children}
    </section>
  );
}

type DateRangeProps = { period: string } | { start: string; end?: string };

function DateRange(props: DateRangeProps) {
  const display = "period" in props ? props.period : `${props.start} – ${props.end || "현재"}`;
  return <span className="text-xs text-muted-foreground tabular-nums">{display}</span>;
}

function Tag({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "accent" }) {
  return (
    <span
      className={cn(
        "inline-block text-xs px-1.5 py-px rounded font-medium",
        variant === "accent" ? "bg-foreground/5 text-foreground/70 dark:bg-foreground/10" : "text-muted-foreground",
        "print:bg-gray-100 print:text-gray-600 print:px-1",
      )}
    >
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: OpenSourceProject["status"] }) {
  const config: Record<OpenSourceProject["status"], { label: string; className: string } | null> = {
    awarded: { label: "수상", className: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" },
    completed: null,
    "in-progress": { label: "진행중", className: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" },
  };
  const c = config[status];
  if (!c) return null;
  return <span className={cn("text-[11px] px-1.5 py-0.5 rounded font-medium", c.className)}>{c.label}</span>;
}

type ContributionIconKind = "problem" | "decision" | "result";

function ContributionIcon({ kind, className: cls }: { kind: ContributionIconKind; className?: string }) {
  const iconMap: Record<ContributionIconKind, { d: string; fill: string }> = {
    problem: {
      d: "M7.99992 1.33337C11.6818 1.33337 14.6666 4.31814 14.6666 8.00004C14.6666 11.6819 11.6818 14.6667 7.99992 14.6667C4.31802 14.6667 1.33325 11.6819 1.33325 8.00004C1.33325 4.31814 4.31802 1.33337 7.99992 1.33337ZM7.99992 7.00004C7.70537 7.00004 7.46672 7.23869 7.46672 7.53324V10.4668C7.46672 10.7614 7.70537 11 7.99992 11C8.29441 11 8.53312 10.7613 8.53312 10.4668V7.53324C8.53312 7.23873 8.29441 7.00011 7.99992 7.00004ZM7.99992 4.93363C7.70537 4.93364 7.46672 5.17229 7.46672 5.46684C7.46678 5.76133 7.70541 6.00004 7.99992 6.00004C8.29443 6.00004 8.53306 5.76134 8.53312 5.46684C8.53312 5.17229 8.29447 4.93363 7.99992 4.93363Z",
      fill: "#4088FF",
    },
    decision: {
      d: "M7.99992 1.33337C11.6818 1.33337 14.6666 4.31814 14.6666 8.00004C14.6666 11.6819 11.6818 14.6667 7.99992 14.6667C4.31802 14.6667 1.33325 11.6819 1.33325 8.00004C1.33325 4.31814 4.31802 1.33337 7.99992 1.33337ZM10.7226 6.10225C10.5212 5.88744 10.1836 5.87627 9.96867 6.07751L7.1451 8.72465L6.04354 7.62309C5.83528 7.41492 5.49789 7.41492 5.28963 7.62309C5.08145 7.83138 5.08138 8.1694 5.28963 8.37764L6.75643 9.84379C6.95991 10.0471 7.28801 10.0528 7.49797 9.85616L10.6978 6.85616C10.9126 6.6548 10.9237 6.31716 10.7226 6.10225Z",
      fill: "#26A554",
    },
    result: {
      d: "M7.99992 1.33337C11.6818 1.33337 14.6666 4.31814 14.6666 8.00004C14.6666 11.6819 11.6818 14.6667 7.99992 14.6667C4.31802 14.6667 1.33325 11.6819 1.33325 8.00004C1.33325 4.31814 4.31802 1.33337 7.99992 1.33337ZM10.7226 6.10225C10.5212 5.88744 10.1836 5.87627 9.96867 6.07751L7.1451 8.72465L6.04354 7.62309C5.83528 7.41492 5.49789 7.41492 5.28963 7.62309C5.08145 7.83138 5.08138 8.1694 5.28963 8.37764L6.75643 9.84379C6.95991 10.0471 7.28801 10.0528 7.49797 9.85616L10.6978 6.85616C10.9126 6.6548 10.9237 6.31716 10.7226 6.10225Z",
      fill: "#515761",
    },
  };

  const icon = iconMap[kind];

  return (
    <svg className={cn("w-4 h-4 shrink-0", cls)} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d={icon.d} fill={icon.fill} />
    </svg>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function CompactContributionCard({ contribution }: { contribution: KeyContribution }) {
  return (
    <div className="rounded-none border-l-2 border-border/60 pl-3 py-1 break-inside-avoid">
      {contribution.title && <p className="text-[13px] font-semibold text-foreground/90 mb-2">{contribution.title}</p>}
      <div className="space-y-2">
        <div className="grid grid-cols-[16px_1fr] gap-2 items-start">
          <ContributionIcon kind="problem" className="mt-0.5" />
          <p className="text-[13px] text-foreground/75 leading-relaxed">{parseInlineMarkdown(contribution.problem)}</p>
        </div>
        <div className="grid grid-cols-[16px_1fr] gap-2 items-start">
          <ContributionIcon kind="decision" className="mt-0.5" />
          <p className="text-[13px] text-foreground/90 leading-relaxed font-medium">{parseInlineMarkdown(contribution.decision)}</p>
        </div>
        <div className="grid grid-cols-[16px_1fr] gap-2 items-start">
          <ContributionIcon kind="result" className="mt-0.5" />
          <p className="text-[13px] text-foreground/80 leading-relaxed">{parseInlineMarkdown(contribution.result)}</p>
        </div>
      </div>
    </div>
  );
}

function FeaturedProjectCard({ project, company }: { project: WorkProject; company: string }) {
  const contributions = project.keyContributions ?? [];

  return (
    <div className="mb-6 last:mb-0 break-inside-avoid">
      {/* Header */}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h3 className="text-sm font-semibold">{project.name}</h3>
        <span className="text-xs text-muted-foreground">{company}</span>
        <span className="ml-auto">
          <DateRange period={project.period} />
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-foreground/80 mt-1 leading-relaxed">{parseInlineMarkdown(project.oneLiner)}</p>

      {/* Key Contributions */}
      {contributions.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-[11px] font-semibold text-muted-foreground">핵심 기여</p>
          {contributions.map((kc, i) => (
            <CompactContributionCard key={i} contribution={kc} />
          ))}
        </div>
      )}
    </div>
  );
}

function WorkProjectCard({ project }: { project: WorkProject }) {
  const contributions = project.keyContributions ?? [];

  return (
    <div className="mb-6 last:mb-0 break-inside-avoid">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h3 className="text-sm font-semibold">{project.name}</h3>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">{project.period}</span>
      </div>
      <p className="text-sm text-foreground/80 mt-1 leading-relaxed">{project.oneLiner}</p>
      {contributions.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-[11px] font-semibold text-muted-foreground">핵심 기여</p>
          {contributions.map((kc, i) => (
            <CompactContributionCard key={i} contribution={kc} />
          ))}
        </div>
      )}
    </div>
  );
}

function OpenSourceProjectCard({ project }: { project: OpenSourceProject }) {
  const contributions = project.keyContributions ?? [];

  return (
    <div className="mb-6 last:mb-0 break-inside-avoid">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold">{project.name}</h3>
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors inline-flex items-baseline"
          >
            <span className="underline underline-offset-2">GitHub</span>
            <span className="text-[8px] -translate-y-1.5 ml-px">↗</span>
          </a>
        )}
        <StatusBadge status={project.status} />
        <span className="text-xs text-muted-foreground ml-auto tabular-nums">{project.teamSize}인</span>
      </div>
      <p className="text-sm text-foreground/80 mt-1.5 leading-relaxed">{parseInlineMarkdown(project.oneLiner)}</p>
      {contributions.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-[11px] font-semibold text-muted-foreground">핵심 기여</p>
          {contributions.map((kc, i) => (
            <CompactContributionCard key={i} contribution={kc} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ResumePage() {
  const data: ResumeData = getResumeData();
  const jsonLd = toJsonLd(data);
  const featuredProjects = data.work.flatMap((job) =>
    job.projects
      .filter((project) => project.featured)
      .map((project) => ({
        company: job.company,
        project,
      })),
  );
  const otherProjects = data.work.flatMap((job) => job.projects.filter((project) => !project.featured));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className={cn("max-w-2xl mx-auto print:max-w-none print:mx-0 print:text-[11pt] print:leading-snug")}>
        {/* ── Header ──────────────────────────────────────────────── */}
        <header className="mb-12 print:mb-6">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-bold tracking-tight print:text-xl">{data.basics.nameKo}</h1>
            <span className="text-lg text-muted-foreground font-normal">{data.basics.label}</span>
          </div>
          {data.basics.summary && (
            <p className="mt-4 text-sm leading-relaxed text-foreground/80">
              {data.basics.summary.split("\n").map((line, i, arr) => (
                <Fragment key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </Fragment>
              ))}
            </p>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-4 text-sm">
            {data.basics.email && (
              <a href={`mailto:${data.basics.email}`} className="text-foreground/60 hover:text-foreground transition-colors inline-flex items-center gap-1">
                <span className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground">{data.basics.email}</span>
              </a>
            )}
            {data.basics.profiles.map((profile) => (
              <a key={profile.network} href={profile.url} target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-foreground transition-colors inline-flex items-baseline">
                <span className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground">{profile.network}</span>
                <span className="text-[8px] -translate-y-1.5 ml-px">↗</span>
              </a>
            ))}
          </div>
        </header>

        {/* ── 경력 사항 ──────────────────────────────────────────── */}
        {data.work.length > 0 && (
          <Section title="경력">
            {data.work.map((job) => (
              <div key={`${job.company}-${job.startDate}`} className="mb-8 last:mb-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-[15px] font-semibold">{job.company}</h3>
                  <span className="text-xs text-muted-foreground">{job.location}</span>
                  <span className="ml-auto">
                    <DateRange start={job.startDate} end={job.endDate} />
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {job.department} · {job.position}
                </p>
              </div>
            ))}
          </Section>
        )}

        {/* ── 대표 프로젝트 ──────────────────────────────────── */}
        {featuredProjects.length > 0 && (
          <Section title="대표 프로젝트">
            <div className="space-y-8">
              {featuredProjects.map(({ project, company }) => (
                <FeaturedProjectCard key={project.id} project={project} company={company} />
              ))}
            </div>
          </Section>
        )}

        {/* ── 참여 프로젝트 ──────────────────────────────────── */}
        {otherProjects.length > 0 && (
          <Section title="참여 프로젝트">
            {otherProjects.map((proj) => (
              <WorkProjectCard key={proj.id} project={proj} />
            ))}
          </Section>
        )}

        {/* ── 오픈소스 ──────────────────────────────────────── */}
        {data.openSource.length > 0 && (
          <Section title="오픈소스">
            {data.openSource.map((proj) => (
              <OpenSourceProjectCard key={proj.id} project={proj} />
            ))}
          </Section>
        )}

        {/* ── 마지막 페이지 래퍼 (인쇄 시 footer를 하단 고정) ── */}
        <div className="print:flex print:flex-col print:min-h-[100vh] print:break-before-page">
          {/* ── 학력 & 교육 (2-column) ──────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8 mb-12 print:mb-6 print:break-inside-avoid">
            {data.education.length > 0 && (
              <div>
                <h2 className="text-[19px] font-bold tracking-tight mb-4 pb-2 border-b border-border print:text-[16px] print:mb-3 print:pb-1">학력</h2>
                <div className="space-y-4">
                  {data.education.map((edu) => (
                    <div key={`${edu.institution}-${edu.startDate}`}>
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-sm font-semibold">{edu.institution}</h3>
                        <span className="text-xs text-muted-foreground">{edu.location}</span>
                      </div>
                      <p className="text-sm text-foreground/75 mt-0.5">{edu.area}</p>
                      <DateRange start={edu.startDate} end={edu.endDate} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.training.length > 0 && (
              <div>
                <h2 className="text-[19px] font-bold tracking-tight mb-4 pb-2 border-b border-border print:text-[16px] print:mb-3 print:pb-1">교육</h2>
                <div className="space-y-4">
                  {data.training.map((t) => (
                    <div key={`${t.institution}-${t.startDate}`}>
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-sm font-semibold">{t.institution}</h3>
                        <span className="text-xs text-muted-foreground">{t.location}</span>
                      </div>
                      <p className="text-sm text-foreground/75 mt-0.5">{t.course}</p>
                      <DateRange start={t.startDate} end={t.endDate} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── 기술 ─────────────────────────────────────────────── */}
          {(() => {
            const groups = [
              { label: "자격증", items: data.certifications.map((c) => c.name) },
              { label: "언어", items: data.languages.map((l) => `${l.name} (${l.level})`) },
            ].filter((g) => g.items.length > 0);
            if (groups.length === 0) return null;
            return (
              <Section title="자격 및 언어">
                <div className="space-y-2">
                  {groups.map((g) => (
                    <div key={g.label} className="flex items-baseline gap-3 text-sm">
                      <span className="text-muted-foreground text-xs w-20 shrink-0 text-right">{g.label}</span>
                      <div className="flex flex-wrap gap-1">
                        {g.items.map((item) => (
                          <Tag key={item} variant="accent">
                            {item}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            );
          })()}

          {/* ── Footer ─────────────────────────────────────────────── */}
          <footer className="text-xs text-muted-foreground border-t border-border pt-4 mt-12 print:mt-auto print:pt-2 print:text-gray-500 tabular-nums">
            Last updated: {data.meta.lastModified} · v{data.meta.version}
          </footer>
        </div>
        {/* 마지막 페이지 래퍼 끝 */}
      </article>
    </>
  );
}
