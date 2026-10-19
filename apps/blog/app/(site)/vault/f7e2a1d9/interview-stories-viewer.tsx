"use client";

import type { InterviewStory, InterviewQuestion, AlternativeConsidered, TechnicalStep, BranchQuestion, QuestionBranch } from "@workspace/resume/types";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@workspace/ui/components/accordion";
import { Search, X, FolderOpen, Tag } from "lucide-react";
import { Fragment, useMemo, useState } from "react";

// ── Inline Markdown ─────────────────────────────────────────────────────────

function InlineMarkdown({ text }: { text: string }) {
  const nodes: React.ReactNode[] = [];
  let key = 0;
  const pattern = /(`[^`]+`)|\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<Fragment key={key++}>{text.slice(lastIndex, match.index)}</Fragment>);
    }
    if (match[1]) {
      nodes.push(
        <code key={key++} className="px-1 py-0.5 rounded bg-muted text-[0.85em] font-mono">
          {match[1].slice(1, -1)}
        </code>,
      );
    } else if (match[2]) {
      nodes.push(<strong key={key++}>{match[2]}</strong>);
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(<Fragment key={key++}>{text.slice(lastIndex)}</Fragment>);
  }
  return <>{nodes.length > 0 ? nodes : text}</>;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function getAllTags(stories: InterviewStory[]): string[] {
  const tagSet = new Set<string>();
  for (const s of stories) s.tags.forEach((t) => tagSet.add(t));
  return [...tagSet].sort();
}

function getAllProjects(stories: InterviewStory[]): string[] {
  const set = new Set<string>();
  for (const s of stories) set.add(s.relatedProject);
  return [...set].sort();
}

function matchesBranchQuestion(bq: BranchQuestion, q: string): boolean {
  return bq.q.toLowerCase().includes(q) || bq.answer.toLowerCase().includes(q) || (bq.followUps?.some((f) => matchesBranchQuestion(f, q)) ?? false);
}

function matchesSearch(story: InterviewStory, query: string): boolean {
  const q = query.toLowerCase();
  return (
    story.title.toLowerCase().includes(q) ||
    story.tags.some((t) => t.toLowerCase().includes(q)) ||
    story.questions.some(
      (qn) =>
        qn.q.toLowerCase().includes(q) ||
        qn.conclusion.toLowerCase().includes(q) ||
        (qn.reason?.toLowerCase().includes(q) ?? false) ||
        (qn.example?.toLowerCase().includes(q) ?? false) ||
        (qn.retrospective?.toLowerCase().includes(q) ?? false),
    ) ||
    (story.entryQuestion?.answer.toLowerCase().includes(q) ?? false) ||
    (story.branches?.some((b) => b.questions.some((bq) => matchesBranchQuestion(bq, q))) ?? false) ||
    story.ownership.some((o) => o.toLowerCase().includes(q))
  );
}

function countBranchQuestions(bq: BranchQuestion): number {
  return 1 + (bq.followUps?.reduce((sum, f) => sum + countBranchQuestions(f), 0) ?? 0);
}

function countStoryQuestions(story: InterviewStory): number {
  if (story.branches) {
    const branchCount = story.branches.reduce((sum, b) => sum + b.questions.reduce((s, bq) => s + countBranchQuestions(bq), 0), 0);
    return (story.entryQuestion ? 1 : 0) + branchCount;
  }
  return story.questions.length;
}

// ── View Mode ───────────────────────────────────────────────────────────────

type ViewMode = "all" | "by-project";

// ── Sub‑Components ──────────────────────────────────────────────────────────

function AnswerField({ label, content }: { label: string; content: string }) {
  return (
    <div className="text-sm leading-relaxed">
      <strong>{label}</strong>: <InlineMarkdown text={content.trim()} />
    </div>
  );
}

function QuestionCard({ question }: { question: InterviewQuestion }) {
  return (
    <div className="space-y-2.5">
      <h4 className="text-sm font-semibold">Q. &ldquo;{question.q}&rdquo;</h4>
      <div className="border-l-2 border-primary/40 pl-4 space-y-2">
        <AnswerField label="결론" content={question.conclusion} />
        {question.reason && <AnswerField label="이유" content={question.reason} />}
        {question.example && <AnswerField label="사례" content={question.example} />}
        {question.retrospective && <AnswerField label="회고" content={question.retrospective} />}
      </div>
    </div>
  );
}

function BranchQuestionCard({ question, depth = 0 }: { question: BranchQuestion; depth?: number }) {
  return (
    <div className={depth > 0 ? "ml-4" : ""}>
      <div className="space-y-2.5">
        <h4 className="text-sm font-semibold flex items-center gap-1.5">
          {depth > 0 && <span className="text-muted-foreground">↳</span>}
          Q. &ldquo;{question.q}&rdquo;
        </h4>
        <div className="border-l-2 border-primary/40 pl-4">
          <div className="text-sm leading-relaxed">
            <InlineMarkdown text={question.answer.trim()} />
          </div>
        </div>
      </div>
      {question.followUps && question.followUps.length > 0 && (
        <div className="mt-4 space-y-4">
          {question.followUps.map((fu) => (
            <BranchQuestionCard key={fu.id} question={fu} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function BranchSection({ branch }: { branch: QuestionBranch }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">{branch.trigger}</span>
      </div>
      {branch.questions.map((bq) => (
        <BranchQuestionCard key={bq.id} question={bq} />
      ))}
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="text-xs bg-muted/50 rounded-md p-3 overflow-x-auto border">
      <code>{code.trim()}</code>
    </pre>
  );
}

function TechnicalStepCard({ step }: { step: TechnicalStep }) {
  return (
    <div className="space-y-2">
      <h5 className="text-sm font-medium">{step.title}</h5>
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{step.insight.trim()}</p>
      {step.code && <CodeBlock code={step.code} />}
      {step.layerBehavior && (
        <div className="grid grid-cols-3 gap-2 text-xs">
          {Object.entries(step.layerBehavior).map(([layer, behavior]) => (
            <div key={layer} className="bg-muted/30 rounded p-2 border">
              <span className="font-mono font-medium">{layer}</span>
              <p className="text-muted-foreground mt-0.5">{behavior}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AlternativeCard({ alt }: { alt: AlternativeConsidered }) {
  return (
    <div className="border rounded-md p-3 space-y-1">
      <p className="text-sm font-medium">{alt.approach}</p>
      <p className="text-sm text-muted-foreground">
        <InlineMarkdown text={alt.whyNotViable.trim()} />
      </p>
    </div>
  );
}

function StoryCard({ story }: { story: InterviewStory }) {
  return (
    <AccordionItem value={story.id} className="border rounded-lg px-4 mb-3 last:mb-0">
      <AccordionTrigger className="hover:no-underline gap-3">
        <div className="flex flex-col items-start gap-1.5 text-left">
          <span className="text-sm font-semibold leading-snug">{story.title}</span>
          <div className="flex flex-wrap gap-1">
            <span className="text-xs text-muted-foreground mr-1">{countStoryQuestions(story)}개 Q&amp;A</span>
            {story.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-8 pt-2">
        {/* Questions — primary content */}
        {story.entryQuestion || story.branches ? (
          <div className="space-y-8">
            {/* Entry question */}
            {story.entryQuestion && (
              <div className="space-y-2.5">
                <h4 className="text-sm font-semibold">Q. &ldquo;{story.entryQuestion.q}&rdquo;</h4>
                <div className="border-l-2 border-primary/40 pl-4">
                  <div className="text-sm leading-relaxed">
                    <InlineMarkdown text={story.entryQuestion.answer.trim()} />
                  </div>
                </div>
              </div>
            )}
            {/* Branches */}
            {story.branches?.map((branch) => <BranchSection key={branch.id} branch={branch} />)}
          </div>
        ) : (
          <div className="space-y-6">
            {story.questions.map((question, i) => (
              <QuestionCard key={i} question={question} />
            ))}
          </div>
        )}

        {/* Ownership */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Ownership</h4>
          <ul className="list-disc list-inside space-y-1">
            {story.ownership.map((item, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Secondary: Technical Deep Dives */}
        {story.technicalDeepDives && story.technicalDeepDives.length > 0 && (
          <Accordion type="single" collapsible>
            {story.technicalDeepDives.map((dive, i) => (
              <AccordionItem key={i} value={`dive-${i}`} className="border rounded-md px-3">
                <AccordionTrigger className="text-sm hover:no-underline">{dive.title}</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{dive.summary.trim()}</p>
                  {dive.steps.map((step, j) => (
                    <TechnicalStepCard key={j} step={step} />
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {/* Secondary: Alternatives Considered */}
        {story.alternativesConsidered && story.alternativesConsidered.length > 0 && (
          <Accordion type="single" collapsible>
            <AccordionItem value="alternatives" className="border rounded-md px-3">
              <AccordionTrigger className="text-sm hover:no-underline">검토한 대안 ({story.alternativesConsidered.length})</AccordionTrigger>
              <AccordionContent className="space-y-2">
                {story.alternativesConsidered.map((alt, i) => (
                  <AlternativeCard key={i} alt={alt} />
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

// ── Main Viewer ─────────────────────────────────────────────────────────────

export function InterviewStoriesViewer({ stories }: { stories: InterviewStory[] }) {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("all");

  const allTags = useMemo(() => getAllTags(stories), [stories]);
  const allProjects = useMemo(() => getAllProjects(stories), [stories]);

  const filtered = useMemo(() => {
    return stories.filter((s) => {
      if (search && !matchesSearch(s, search)) return false;
      if (selectedTags.size > 0 && !s.tags.some((t) => selectedTags.has(t))) return false;
      return true;
    });
  }, [stories, search, selectedTags]);

  const groupedByProject = useMemo(() => {
    const map = new Map<string, InterviewStory[]>();
    for (const s of filtered) {
      const arr = map.get(s.relatedProject) ?? [];
      arr.push(s);
      map.set(s.relatedProject, arr);
    }
    return map;
  }, [filtered]);

  const totalQuestions = useMemo(() => stories.reduce((sum, s) => sum + countStoryQuestions(s), 0), [stories]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedTags(new Set());
  };

  const hasActiveFilters = search.length > 0 || selectedTags.size > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Interview Stories</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {stories.length}개 경험 · {totalQuestions}개 Q&amp;A
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="질문, 키워드, 태그로 검색..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* View mode toggle + tags */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("all")}
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border transition-colors ${
              viewMode === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            <Tag className="h-3 w-3" />
            전체
          </button>
          <button
            onClick={() => setViewMode("by-project")}
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border transition-colors ${
              viewMode === "by-project" ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            <FolderOpen className="h-3 w-3" />
            프로젝트별
          </button>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground ml-auto">
              <X className="h-3 w-3" />
              필터 초기화
            </button>
          )}
        </div>

        {/* Tag Chips */}
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                selectedTags.has(tag) ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {hasActiveFilters && <p className="text-xs text-muted-foreground">{filtered.length}개 결과</p>}

      {/* Stories */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">검색 결과가 없습니다.</div>
      ) : viewMode === "all" ? (
        <Accordion type="multiple">
          {filtered.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </Accordion>
      ) : (
        <div className="space-y-8">
          {allProjects
            .filter((p) => groupedByProject.has(p))
            .map((project) => (
              <section key={project}>
                <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  {project}
                  <span className="text-xs font-normal text-muted-foreground">({groupedByProject.get(project)!.length})</span>
                </h2>
                <Accordion type="multiple">
                  {groupedByProject.get(project)!.map((story) => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </Accordion>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}
