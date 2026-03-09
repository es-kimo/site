import { getLanguage } from "@/lib/language";
import { getResumeData } from "@workspace/resume/data";
import { toJsonLd } from "@workspace/resume/generators/json-ld";
import type { FeaturedProject, KeyContribution, ResumeData, SideProject, WorkProject } from "@workspace/resume/types";
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
    <section className={cn("mb-12 print:mb-6", cls)}>
      <h2 className="text-[15px] font-semibold tracking-tight mb-5 pb-2 border-b border-border print:text-sm print:mb-3 print:pb-1">{title}</h2>
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

function StatusBadge({ status }: { status: SideProject["status"] }) {
  const config: Record<SideProject["status"], { label: string; className: string } | null> = {
    awarded: { label: "수상", className: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" },
    completed: null,
    "in-progress": { label: "진행중", className: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" },
  };
  const c = config[status];
  if (!c) return null;
  return <span className={cn("text-[11px] px-1.5 py-0.5 rounded font-medium", c.className)}>{c.label}</span>;
}

function BulletList({ items, className: cls }: { items: string[]; className?: string }) {
  if (items.length === 0) return null;
  return (
    <ul className={cn("space-y-0.5 text-sm text-foreground/75 leading-relaxed", cls)}>
      {items.map((item, i) => (
        <li key={i} className="flex gap-1.5">
          <span className="text-muted-foreground select-none shrink-0">·</span>
          <span>{parseInlineMarkdown(item)}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function ContributionCard({ contribution, index }: { contribution: KeyContribution; index: number }) {
  return (
    <div className="relative pl-4 border-l-2 border-muted-foreground/15 mb-4 last:mb-0 print:mb-2">
      <span className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-background border-2 border-muted-foreground/25 text-[8px] flex items-center justify-center text-muted-foreground font-mono print:border-gray-300">
        {index + 1}
      </span>
      <p className="text-sm text-foreground/80 leading-relaxed">{parseInlineMarkdown(contribution.problem)}</p>
      <p className="text-sm text-foreground/90 mt-1 leading-relaxed">
        <span className="text-muted-foreground">→</span> {parseInlineMarkdown(contribution.action)}
      </p>
      <p className="text-sm font-medium text-foreground/85 mt-1 leading-relaxed">
        <span className="text-muted-foreground">✓</span> {parseInlineMarkdown(contribution.result)}
      </p>
      {contribution.ownershipEvidence && contribution.ownershipEvidence.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {contribution.ownershipEvidence.map((e, i) => (
            <Tag key={i} variant="accent">
              {e}
            </Tag>
          ))}
        </div>
      )}
      {contribution.metrics && contribution.metrics.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-3">
          {contribution.metrics.map((m, i) => (
            <span key={i} className="text-xs text-muted-foreground">
              {m.label} <span className="font-semibold text-foreground/80">{m.value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function FeaturedProjectCard({ project }: { project: FeaturedProject }) {
  return (
    <div className="mb-8 last:mb-0 print:mb-5  rounded-lg border border-border/60 p-5 print:p-3 print:border-gray-200">
      {/* Header */}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h3 className="text-[15px] font-semibold">{project.name}</h3>
        <span className="text-xs text-muted-foreground">{project.company}</span>
        <span className="ml-auto">
          <DateRange period={project.period} />
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
        <span className="text-xs text-muted-foreground">
          {project.role} · {project.scope}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-foreground/75 mt-3 leading-relaxed">{parseInlineMarkdown(project.oneLiner)}</p>

      {/* Tech */}
      <div className="flex flex-wrap gap-1 mt-3">
        {project.techStack.map((tech) => (
          <Tag key={tech} variant="accent">
            {tech}
          </Tag>
        ))}
      </div>

      {/* Responsibilities */}
      {project.responsibilities.length > 0 && <BulletList items={project.responsibilities} className="mt-3" />}

      {/* Key Contributions */}
      {project.keyContributions.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">주요 기여</p>
          {project.keyContributions.map((kc, i) => (
            <ContributionCard key={i} contribution={kc} index={i} />
          ))}
        </div>
      )}

      {/* Collaboration */}
      {/* {project.collaboration && project.collaboration.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border/40">
          <p className="text-xs font-semibold text-muted-foreground mb-1.5">협업 방식</p>
          <BulletList items={project.collaboration} />
        </div>
      )} */}
    </div>
  );
}

function WorkProjectCard({ project }: { project: WorkProject }) {
  return (
    <div className="mb-6 last:mb-0 print:mb-3 ">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h4 className="text-sm font-semibold">{project.name}</h4>
        <DateRange period={project.period} />
      </div>
      <div className="flex flex-wrap gap-1 mt-1.5">
        {project.techStack.map((tech) => (
          <Tag key={tech} variant="accent">
            {tech}
          </Tag>
        ))}
      </div>
      <p className="text-sm text-foreground/75 mt-2 leading-relaxed">{parseInlineMarkdown(project.oneLiner)}</p>
      {project.keyContributions && project.keyContributions.length > 0 && (
        <div className="mt-3">
          {project.keyContributions.map((kc, i) => (
            <ContributionCard key={i} contribution={kc} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function SideProjectCard({ project }: { project: SideProject }) {
  return (
    <div className="mb-6 last:mb-0 ">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold">{project.name}</h3>
        <StatusBadge status={project.status} />
        <span className="text-xs text-muted-foreground ml-auto tabular-nums">{project.teamSize}인</span>
      </div>
      {project.awardNote && <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 font-medium">{project.awardNote}</p>}
      <p className="text-sm text-foreground/75 mt-1.5 leading-relaxed">{parseInlineMarkdown(project.description)}</p>
      <BulletList items={project.keyContributions} className="mt-2" />
      {project.whyItMatters && <p className="text-xs text-muted-foreground mt-2 italic leading-relaxed">{project.whyItMatters}</p>}
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
        <header className="mb-12 print:mb-6">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-bold tracking-tight print:text-xl">{data.basics.nameKo}</h1>
            <span className="text-lg text-muted-foreground font-normal">{data.basics.label}</span>
          </div>
          {data.basics.summary && <p className="mt-4 text-sm leading-relaxed text-foreground/80">{data.basics.summary}</p>}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-4 text-sm text-muted-foreground">
            {data.basics.email && (
              <a href={`mailto:${data.basics.email}`} className="hover:text-foreground transition-colors underline underline-offset-2 decoration-border hover:decoration-foreground">
                {data.basics.email}
              </a>
            )}
            {data.basics.profiles.map((profile) => (
              <a
                key={profile.network}
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors underline underline-offset-2 decoration-border hover:decoration-foreground"
              >
                {profile.network}
              </a>
            ))}
            <a href="/resume.pdf" download className="hover:text-foreground transition-colors underline underline-offset-2 decoration-border hover:decoration-foreground print:hidden">
              PDF ↓
            </a>
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

        {/* ── 핵심 역량 ──────────────────────────────────────────── */}
        <Section title="핵심 역량">
          {/* <p className="text-sm text-foreground/80 mb-4 leading-relaxed">{data.positioning.headline}</p> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.positioning.coreStrengths.map((strength) => (
              <div key={strength.id} className="rounded-md bg-muted/40 p-3 print:bg-gray-50 print:p-2">
                <h3 className="text-sm font-semibold">{strength.title}</h3>
                <p className="text-xs text-foreground/70 mt-1 leading-relaxed">{parseInlineMarkdown(strength.description)}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 대표 프로젝트 ──────────────────────────────────── */}
        {data.featuredProjects.length > 0 && (
          <Section title="대표 프로젝트">
            <div className="space-y-6">
              {data.featuredProjects.map((proj) => (
                <FeaturedProjectCard key={proj.id} project={proj} />
              ))}
            </div>
          </Section>
        )}

        {/* ── 경력 사항 ──────────────────────────────────────────── */}
        {/* {data.work.length > 0 && (
          <Section title="경력 사항">
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

                {job.achievementSummary.length > 0 && (
                  <div className="mt-4 rounded-md bg-muted/40 p-3 print:bg-gray-50 print:p-2">
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">성과 요약</p>
                    <BulletList items={job.achievementSummary} />
                  </div>
                )}

                {job.projects.length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">참여 프로젝트</p>
                    {job.projects.map((proj) => (
                      <WorkProjectCard key={proj.id} project={proj} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </Section>
        )} */}

        {/* ── 개인 프로젝트 ──────────────────────────────────── */}
        {data.sideProjects.length > 0 && (
          <Section title="개인 프로젝트">
            {data.sideProjects.map((proj) => (
              <SideProjectCard key={proj.id} project={proj} />
            ))}
          </Section>
        )}

        {/* ── 학력 & 교육 (2-column) ──────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8 mb-12 print:mb-6 print:break-inside-avoid">
          {data.education.length > 0 && (
            <div>
              <h2 className="text-[15px] font-semibold tracking-tight mb-4 pb-2 border-b border-border print:text-sm print:mb-3 print:pb-1">학력</h2>
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
              <h2 className="text-[15px] font-semibold tracking-tight mb-4 pb-2 border-b border-border print:text-sm print:mb-3 print:pb-1">교육</h2>
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
          const sk = data.skills;
          const groups = [
            { label: "Frontend", items: sk.frontend },
            { label: "Testing", items: sk.testing },
            { label: "Tooling", items: sk.tooling },
            { label: "디자인", items: sk.design },
            { label: "협업", items: sk.collaboration },
            { label: "자격증", items: sk.certifications },
            { label: "영어", items: sk.english },
          ].filter((g) => g.items.length > 0);
          if (groups.length === 0) return null;
          return (
            <Section title="기술">
              <div className="space-y-2">
                {groups.map((g) => (
                  <div key={g.label} className="flex items-baseline gap-3 text-sm">
                    <span className="text-muted-foreground text-xs w-16 shrink-0 text-right">{g.label}</span>
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
        <footer className="text-xs text-muted-foreground border-t border-border pt-4 mt-12 print:mt-4 print:pt-2 print:text-gray-500 tabular-nums">
          Last updated: {data.meta.lastModified} · v{data.meta.version}
        </footer>
      </article>
    </>
  );
}
