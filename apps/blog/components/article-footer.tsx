import { SeriesNav } from "@/components/SeriesNav";
import { getAdjacentNotes, type AdjacentNote } from "@/constants/notes";
import { findSeriesPart } from "@/constants/series";
import { formatPostDate } from "@/lib/date";
import Link from "next/link";

type ArticleFooterProps = {
  category: string;
  slug: string;
  date: string;
};

function AdjacentLink({ note, label, align }: { note: AdjacentNote; label: string; align: "left" | "right" }) {
  return (
    <Link
      href={`/writing/${note.category}/${note.slug}`}
      className={`group min-w-0 text-xs text-muted-foreground no-underline transition-colors hover:text-foreground ${align === "right" ? "col-start-2 text-right" : ""}`}
    >
      <span className="block">{label}</span>
      <span className="block truncate underline-offset-2 group-hover:underline">{note.title}</span>
    </Link>
  );
}

export async function ArticleFooter({ category, slug, date }: ArticleFooterProps) {
  const seriesPart = findSeriesPart(category, slug);
  const { older, newer } = seriesPart === null ? await getAdjacentNotes(category, slug) : { older: null, newer: null };

  return (
    // 본문(52rem)보다 좁은 폭과 본문 hr보다 진한 선으로 본문이 끝났음을 알린다
    <footer className="mx-auto mt-20 max-w-blog border-t border-foreground/15 pt-5">
      <div className="flex items-baseline justify-between gap-4">
        <Link href={`/writing/${category}`} className="text-sm text-muted-foreground no-underline underline-offset-2 transition-colors hover:text-foreground hover:underline">
          {category} →
        </Link>
        <span className="text-xs tabular-nums text-muted-foreground">{formatPostDate(date, "korean")}</span>
      </div>

      {seriesPart !== null && (
        <div className="mt-6">
          <SeriesNav currentPart={seriesPart} />
        </div>
      )}

      {(older || newer) && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          {older && <AdjacentLink note={older} label="← 이전 글" align="left" />}
          {newer && <AdjacentLink note={newer} label="다음 글 →" align="right" />}
        </div>
      )}
    </footer>
  );
}
