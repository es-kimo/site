import { SERIES_ITEMS, seriesHref, seriesTitle, type SeriesItem } from "@/constants/series";
import Link from "next/link";

interface SeriesNavProps {
  currentPart: number;
}

function ItemBody({ item, isCurrent }: { item: SeriesItem; isCurrent: boolean }) {
  return (
    <span className="min-w-0">
      <span className="flex items-baseline justify-between gap-3">
        <span className={isCurrent ? "text-[15px] font-medium text-foreground" : "text-[15px] text-foreground/75 underline-offset-2 group-hover:underline"}>{seriesTitle(item)}</span>
        {isCurrent && <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:block">지금 읽는 글</span>}
      </span>
      <span className="block text-[13px] text-muted-foreground">{item.subtitle}</span>
    </span>
  );
}

export function SeriesNav({ currentPart }: SeriesNavProps) {
  const prev = SERIES_ITEMS.find((item) => item.part === currentPart - 1);
  const next = SERIES_ITEMS.find((item) => item.part === currentPart + 1);

  return (
    <nav aria-label="통계 및 데이터 분석 시리즈" className="my-5 border-y border-[var(--markdown-soft-border)] py-3">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <span className="text-xs font-semibold text-muted-foreground">통계와 데이터 이야기</span>
        <span className="text-xs tabular-nums text-muted-foreground">
          {currentPart} / {SERIES_ITEMS.length}
        </span>
      </div>

      <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
        {SERIES_ITEMS.map((item) => {
          const isCurrent = item.part === currentPart;
          const number = <span className="text-xs tabular-nums text-muted-foreground">{String(item.part).padStart(2, "0")}</span>;

          return (
            <li key={item.part}>
              {isCurrent ? (
                <div aria-current="step" className="grid grid-cols-[1.75rem_1fr] items-baseline">
                  {number}
                  <ItemBody item={item} isCurrent />
                </div>
              ) : (
                <Link href={seriesHref(item.slug)} className="group grid grid-cols-[1.75rem_1fr] items-baseline no-underline">
                  {number}
                  <ItemBody item={item} isCurrent={false} />
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {(prev || next) && (
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[var(--markdown-soft-border)] pt-3 text-xs">
          {prev ? (
            <Link href={seriesHref(prev.slug)} className="group min-w-0 text-muted-foreground no-underline transition-colors hover:text-foreground">
              <span className="block">← 이전</span>
              <span className="block truncate underline-offset-2 group-hover:underline">{seriesTitle(prev)}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={seriesHref(next.slug)} className="group col-start-2 min-w-0 text-right text-muted-foreground no-underline transition-colors hover:text-foreground">
              <span className="block">다음 →</span>
              <span className="block truncate underline-offset-2 group-hover:underline">{seriesTitle(next)}</span>
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </nav>
  );
}
