import { ExternalLink, quietLinkClass } from "@/components/external-link";
import { NoteGrid } from "@/components/note-grid";
import { ALL_NOTES, sortNotesByLatestDate } from "@/constants/notes";
import { SERIES_CATEGORY, SERIES_ITEMS, SPLITS_URL, seriesHref } from "@/constants/series";
import Link from "next/link";

const RECENT_COUNT = 5;

const SERIES_SLUGS = new Set(SERIES_ITEMS.map(({ slug }) => slug));

async function getRecentNotes() {
  // 시리즈 네 편은 Project 섹션에서 전부 나열하므로 여기서는 제외한다
  const notes = ALL_NOTES.filter(({ category, slug }) => !(category === SERIES_CATEGORY && SERIES_SLUGS.has(slug)));
  const sortedNotes = await sortNotesByLatestDate(notes);

  return sortedNotes.slice(0, RECENT_COUNT);
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold text-muted-foreground">{children}</h2>;
}

export default async function HomePage() {
  const recentNotes = await getRecentNotes();
  const totalCount = ALL_NOTES.length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Kihyun Ryu</h1>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-sm text-muted-foreground">
          <Link href="/resume" className={quietLinkClass}>
            Resume
          </Link>
          <ExternalLink href="https://github.com/es-kimo">GitHub</ExternalLink>
          <ExternalLink href="https://x.com/ryurlah">X</ExternalLink>
          <a href="/feed.xml" className={quietLinkClass}>
            RSS
          </a>
        </div>
      </header>

      <section className="border-t border-border pt-8">
        <SectionHeading>Project</SectionHeading>

        <div className="mt-4 flex flex-col gap-1">
          <h3 className="text-lg font-bold">
            <ExternalLink href={SPLITS_URL}>splits.kr</ExternalLink>
          </h3>
          <p className="text-[15px] leading-relaxed break-keep text-muted-foreground">
            쇼트트랙 기록을 같은 출생연도, 성별, 종목의 또래 집단과 비교하는 서비스입니다. 대한체육회 공식 대회 기록
            20년치를 집계했고, 기록을 다루면서 정한 기준은 네 편의 글로 정리했습니다.
          </p>
        </div>

        <ol className="mt-5 flex flex-col gap-3">
          {SERIES_ITEMS.map((item) => (
            <li key={item.part}>
              <Link href={seriesHref(item.slug)} className="group grid grid-cols-[1.75rem_1fr] items-baseline">
                <span className="text-xs tabular-nums text-muted-foreground">{String(item.part).padStart(2, "0")}</span>
                <span>
                  <span className="block text-[15px] font-medium group-hover:underline underline-offset-2">
                    {item.title}
                  </span>
                  <span className="block text-[13px] text-muted-foreground">{item.subtitle}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-border pt-8">
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <SectionHeading>Writing</SectionHeading>
          <Link
            href="/writing"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors tabular-nums"
          >
            전체 {totalCount}편 →
          </Link>
        </div>
        <NoteGrid notes={recentNotes} headingLevel={3} />
      </section>
    </div>
  );
}
