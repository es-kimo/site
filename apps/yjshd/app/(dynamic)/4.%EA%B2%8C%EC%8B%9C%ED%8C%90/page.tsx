import PaginationLink from "@/components/PaginationLink";
import { getPostMetadata } from "@/lib/metadata";
import { formatPostDate } from "@workspace/common/lib/date";
import { getSlugsByCategory } from "@workspace/common/structure/utils";
import { Badge } from "@workspace/ui/components/badge";
import { Pagination, PaginationContent, PaginationItem } from "@workspace/ui/components/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Metadata } from "next";
import { Link } from "next-view-transitions";

const category = "4.게시판";
const pageSize = 10;
const NEW_THRESHOLD_DAYS = 7;

export const metadata: Metadata = {
  title: "게시판",
  description: "연세정성내과의 공지사항과 의료 정보를 확인하실 수 있는 게시판입니다. 환자분들을 위한 유용한 건강 정보와 병원 소식을 제공합니다.",
  keywords: ["연세정성내과", "게시판", "공지사항", "의료정보", "건강정보", "병원소식"],
  openGraph: {
    title: "연세정성내과 게시판",
    description: "연세정성내과의 공지사항과 의료 정보를 확인하실 수 있는 게시판입니다. 환자분들을 위한 유용한 건강 정보와 병원 소식을 제공합니다.",
    type: "website",
    locale: "ko_KR",
    siteName: "연세정성내과",
  },
};

/* ---------- Pagination 계산 ---------- */
function buildPages(total: number, current: number) {
  const out: (number | "…")[] = [];
  const sibling = 1;
  const first = 1;
  const last = total;

  out.push(first);

  const left = Math.max(current - sibling, first + 1);
  const right = Math.min(current + sibling, last - 1);

  if (left > first + 1) out.push("…");
  for (let i = left; i <= right; i++) out.push(i);
  if (right < last - 1) out.push("…");

  if (last !== first) out.push(last);
  return out;
}

/* ---------- 페이지 컴포넌트 ---------- */
export default async function BoardPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  const now = new Date();

  /* 글 메타 읽기 */
  const slugs = await getSlugsByCategory(category);
  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const meta = await getPostMetadata({ category, slug });
      return { ...meta, id: `${meta.other.createdAt}-${slug}`, slug };
    })
  ).then((l) => l.sort((a, b) => new Date(b.other.createdAt).getTime() - new Date(a.other.createdAt).getTime()));

  /* 공지 우선 */
  const ordered = [...posts.filter((p) => p.pinned), ...posts.filter((p) => !p.pinned)];

  /* 페이지네이터 */
  const totalPages = Math.ceil(ordered.length / pageSize);
  const currentPage = Math.min(Math.max(parseInt(page || "1", 10), 1), totalPages);
  const pageItems = ordered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pages = buildPages(totalPages, currentPage);

  const prevHref = currentPage > 1 ? `?page=${currentPage - 1}` : undefined;
  const nextHref = currentPage < totalPages ? `?page=${currentPage + 1}` : undefined;

  /* New 뱃지 */
  const isNew = (d: string) => (now.getTime() - +new Date(d)) / 86_400_000 <= NEW_THRESHOLD_DAYS;

  return (
    <>
      {/* SEO */}
      {/* SEO Links */}
      <div id="boardTop">
        {prevHref && <link rel="prev" href={prevHref} />}
        {nextHref && <link rel="next" href={nextHref} />}
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">게시판</h2>

        <ul className="divide-y divide-gray-200">
          {pageItems.map((post) => (
            <li key={post.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="flex items-center gap-2">
                {post.pinned && <Badge variant="destructive">공지</Badge>}
                <Link href={`/${category}/${post.slug}`} className="text-sm sm:text-[17px] text-gray-800 hover:text-blue-600 transition-colors line-clamp-1">
                  {String(post.title)}
                </Link>
                {isNew(post.other.createdAt) && <span className="bg-primary/10 text-primary text-[11px] px-1 rounded">New</span>}
              </div>
              <span className="text-sm text-gray-500 mt-1 sm:mt-0">{formatPostDate(post.other.createdAt)}</span>
            </li>
          ))}
        </ul>

        {/* ---------- Pagination ---------- */}
        <nav aria-label="게시판 페이지" className="mt-8">
          {/* 데스크톱 : 풀 페이지네이터 */}
          <Pagination>
            <PaginationContent className="flex items-center justify-center gap-1">
              {/* First */}
              <PaginationItem className="hidden sm:block">
                <PaginationLink href="?page=1#boardTop" aria-label="첫 페이지" className={`${prevHref ? "" : "pointer-events-none opacity-50"}`}>
                  «
                </PaginationLink>
              </PaginationItem>

              {/* Prev */}
              <PaginationItem className="hidden sm:block">
                <PaginationLink href={`${prevHref}#boardTop`} aria-disabled={!prevHref} aria-label="이전 페이지" className={`${prevHref ? "" : "pointer-events-none opacity-50"}`}>
                  <ChevronLeft className="h-4 w-4" />
                </PaginationLink>
              </PaginationItem>

              {/* 숫자 & Ellipsis */}
              {pages.map((p, idx) =>
                typeof p === "number" ? (
                  <PaginationItem key={idx}>
                    <PaginationLink href={`?page=${p}#boardTop`} isActive={p === currentPage}>
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ) : (
                  <li key={idx} className="px-3 py-2 min-w-11 min-h-11 flex items-center justify-center text-gray-400 select-none">
                    …
                  </li>
                )
              )}

              {/* Next */}
              <PaginationItem className="hidden sm:block">
                <PaginationLink href={`${nextHref}#boardTop`} aria-disabled={!nextHref} aria-label="다음 페이지" className={`${nextHref ? "" : "pointer-events-none opacity-50"}`}>
                  <ChevronRight className="h-4 w-4" />
                </PaginationLink>
              </PaginationItem>

              {/* Last */}
              <PaginationItem className="hidden sm:block">
                <PaginationLink href={`?page=${totalPages}#boardTop`} aria-label="마지막 페이지" className={`${nextHref ? "" : "pointer-events-none opacity-50"}`}>
                  »
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </nav>
      </div>
    </>
  );
}
