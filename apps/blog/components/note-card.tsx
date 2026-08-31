import { getSlugMetadata } from "@/constants/notes";
import { SlugParams } from "@/constants/params.types";
import { formatPostDate } from "@/lib/date";
import Link from "next/link";

type NoteCardProps = SlugParams & {
  /** 목록을 감싸는 제목의 단계에 맞춘다. 홈은 섹션(h2) 안이라 3, 목록 페이지는 h1 아래라 2. */
  headingLevel?: 2 | 3;
};

export async function NoteCard({ category, slug, headingLevel = 2 }: NoteCardProps) {
  const metadata = await getSlugMetadata(category, slug);
  const { createdAt, updatedAt } = metadata.other;
  const Heading = headingLevel === 3 ? "h3" : "h2";

  return (
    // 링크는 제목 하나만 두고, after 오버레이로 카드 전체를 누를 수 있게 한다
    <article className="group relative">
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{category}</span>
        <span className="tabular-nums">{formatPostDate(updatedAt ?? createdAt)}</span>
      </div>
      {/* 한글은 break-keep이 없으면 어절 중간에서 줄이 끊긴다 */}
      <Heading className="mt-1 break-keep text-lg font-semibold leading-snug">
        <Link
          href={`/writing/${category}/${slug}`}
          className="underline-offset-2 after:absolute after:inset-0 group-hover:underline"
        >
          {metadata.title?.toString()}
        </Link>
      </Heading>
      <p className="mt-1.5 break-keep text-[15px] leading-relaxed text-muted-foreground">
        {metadata.description?.toString()}
      </p>
    </article>
  );
}
