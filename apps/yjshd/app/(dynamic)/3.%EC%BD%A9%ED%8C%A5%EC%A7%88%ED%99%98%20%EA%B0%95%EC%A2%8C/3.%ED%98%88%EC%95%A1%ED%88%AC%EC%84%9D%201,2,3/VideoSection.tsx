// app/playlist/VideosSection.tsx
import PaginationLink from "@/components/PaginationLink";
import YoutubePlaylist from "@/components/YoutubePlaylist";
import { getAllVideos } from "@/lib/youtube";
import { Pagination, PaginationContent, PaginationItem } from "@workspace/ui/components/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface VideosSectionProps {
  page?: string;
}

const pageSize = 12; // 한 페이지당 표시할 비디오 수

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

export default async function VideosSection({ page }: VideosSectionProps) {
  const currentPage = Math.max(parseInt(page || "1", 10), 1);

  // 모든 비디오 데이터를 한 번에 가져오기
  const allVideos = await getAllVideos();

  // 페이지네이션 계산
  const totalPages = Math.ceil(allVideos.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageVideos = allVideos.slice(startIndex, endIndex);

  const pages = buildPages(totalPages, currentPage);

  const prevHref = currentPage > 1 ? `?page=${currentPage - 1}` : undefined;
  const nextHref = currentPage < totalPages ? `?page=${currentPage + 1}` : undefined;

  return (
    <div className="space-y-8">
      {/* 비디오 목록 */}
      <section className="mb-8">
        <YoutubePlaylist videos={currentPageVideos} />
      </section>

      {/* 페이지네이션 컨트롤 */}
      <nav aria-label="비디오 페이지" className="mt-8">
        <Pagination>
          <PaginationContent className="flex items-center justify-center gap-1">
            {/* First */}
            <PaginationItem className="hidden sm:block">
              <PaginationLink href="?page=1" aria-label="첫 페이지" className={`${prevHref ? "" : "pointer-events-none opacity-50"}`}>
                «
              </PaginationLink>
            </PaginationItem>

            {/* Prev */}
            <PaginationItem className="hidden sm:block">
              <PaginationLink href={prevHref || "#"} aria-disabled={!prevHref} aria-label="이전 페이지" className={`${prevHref ? "" : "pointer-events-none opacity-50"}`}>
                <ChevronLeft className="h-4 w-4" />
              </PaginationLink>
            </PaginationItem>

            {/* 숫자 & Ellipsis */}
            {pages.map((p, idx) =>
              typeof p === "number" ? (
                <PaginationItem key={idx}>
                  <PaginationLink href={`?page=${p}`} isActive={p === currentPage}>
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
              <PaginationLink href={nextHref || "#"} aria-disabled={!nextHref} aria-label="다음 페이지" className={`${nextHref ? "" : "pointer-events-none opacity-50"}`}>
                <ChevronRight className="h-4 w-4" />
              </PaginationLink>
            </PaginationItem>

            {/* Last */}
            <PaginationItem className="hidden sm:block">
              <PaginationLink href={`?page=${totalPages}`} aria-label="마지막 페이지" className={`${nextHref ? "" : "pointer-events-none opacity-50"}`}>
                »
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </nav>
    </div>
  );
}
