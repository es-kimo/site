import { SERIES_ITEMS, seriesHref, seriesTitle } from "@/constants/series";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Check } from "lucide-react";

interface SeriesNavProps {
  currentPart: number;
}

export function SeriesNav({ currentPart }: SeriesNavProps) {
  const prev = SERIES_ITEMS.find((item) => item.part === currentPart - 1);
  const next = SERIES_ITEMS.find((item) => item.part === currentPart + 1);

  return (
    <nav aria-label="통계 및 데이터 분석 시리즈" className="my-4 overflow-hidden rounded-lg border border-[var(--markdown-soft-border)] bg-[var(--markdown-panel-background)] shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--markdown-soft-border)] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <BookOpen aria-hidden="true" className="size-4 shrink-0 text-[var(--markdown-link)]" strokeWidth={1.8} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground/90">통계와 데이터 이야기</p>
            <p className="text-[11px] text-muted-foreground">네 편의 글을 순서대로 읽어보세요</p>
          </div>
        </div>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {currentPart} / {SERIES_ITEMS.length}
        </span>
      </div>

      <ol className="p-2 text-sm">
        {SERIES_ITEMS.map((item) => {
          const isCurrent = item.part === currentPart;
          const isComplete = item.part < currentPart;
          const content = (
            <>
              <span
                className={`grid size-6 shrink-0 place-items-center rounded-full text-[10px] tabular-nums ${
                  isCurrent ? "bg-[var(--markdown-link)] text-background" : "border border-[var(--markdown-soft-border)] bg-[var(--markdown-panel-raised)] text-muted-foreground"
                }`}
              >
                {isComplete ? <Check aria-hidden="true" className="size-3" strokeWidth={2} /> : String(item.part).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className={`block leading-5 ${isCurrent ? "font-medium text-foreground" : "text-foreground/75"}`}>{seriesTitle(item)}</span>
                <span className="block truncate text-xs leading-5 text-muted-foreground">{item.subtitle}</span>
              </span>
              {isCurrent && <span className="ml-auto hidden shrink-0 text-[10px] text-[var(--markdown-link)] sm:block">지금 읽는 글</span>}
            </>
          );

          return (
            <li key={item.part}>
              {isCurrent ? (
                <span aria-current="step" className="flex items-center gap-3 rounded-md bg-[var(--markdown-panel-active)] px-2.5 py-2">
                  {content}
                </span>
              ) : (
                <Link href={seriesHref(item.slug)} className="flex items-center gap-3 rounded-md px-2.5 py-2 transition-colors hover:bg-[var(--markdown-panel-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--markdown-link)]/40">
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      <div className="grid grid-cols-2 border-t border-[var(--markdown-soft-border)] text-xs">
        {prev ? (
          <Link href={seriesHref(prev.slug)} className="group flex min-w-0 items-center gap-2 border-r border-[var(--markdown-soft-border)] px-3 py-2.5 text-foreground/70 transition-colors hover:bg-[var(--markdown-panel-hover)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--markdown-link)]/40">
            <ArrowLeft aria-hidden="true" className="size-3.5 shrink-0 transition-transform group-hover:-translate-x-0.5" />
            <span className="min-w-0">
              <span className="block text-[10px] text-muted-foreground">이전 이야기</span>
              <span className="block truncate">{seriesTitle(prev)}</span>
            </span>
          </Link>
        ) : (
          <span className="border-r border-[var(--markdown-soft-border)]" />
        )}
        {next ? (
          <Link href={seriesHref(next.slug)} className="group flex min-w-0 items-center justify-end gap-2 px-3 py-2.5 text-right text-foreground/70 transition-colors hover:bg-[var(--markdown-panel-hover)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--markdown-link)]/40">
            <span className="min-w-0">
              <span className="block text-[10px] text-muted-foreground">다음 이야기</span>
              <span className="block truncate">{seriesTitle(next)}</span>
            </span>
            <ArrowRight aria-hidden="true" className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </nav>
  );
}
