// app/playlist/VideosSection.tsx
import Pagination from "@/components/Pagination";
import PaginationLink from "@/components/PaginationLink";
import YoutubePlaylist from "@/components/YoutubePlaylist";
import { VideoItem } from "@/lib/youtube";
import { Badge } from "@workspace/ui/components/badge";

interface VideosSectionProps {
  page?: string;
  videos: VideoItem[];
}

const pageSize = 12; // 한 페이지당 표시할 비디오 수

export default function VideosSection({ page, videos }: VideosSectionProps) {
  const currentPage = Math.max(parseInt(page || "1", 10), 1);

  // 페이지네이션 계산
  const totalPages = Math.ceil(videos.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageVideos = videos.slice(startIndex, endIndex);

  // 이전/다음 페이지 링크
  const prevHref = currentPage > 1 ? `?page=${currentPage - 1}` : undefined;
  const nextHref = currentPage < totalPages ? `?page=${currentPage + 1}` : undefined;

  return (
    <div className="space-y-6 relative">
      {/* 인디케이터 */}
      <div className="sticky top-[var(--header-h)] sm:top-[calc(var(--header-h)_+_var(--sub-header-h))] lg:top-[var(--header-h)] z-10 bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/20 p-4 mb-8 rounded-b-xl">
        <div className="flex items-center justify-between">
          {/* 이전 페이지 버튼 */}
          <PaginationLink isActive={!!prevHref} href={prevHref || "#"} aria-disabled={!prevHref} aria-label="이전 페이지" className={`${!prevHref && "text-gray-300 pointer-events-none"}`}>
            이전
          </PaginationLink>

          {/* 중앙 정보 */}
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">혈액투석</span>
            <div className="h-[3px] w-[3px] bg-gray-400 rounded-full opacity-60" />
            <span className="hidden sm:inline">총 {videos.length}개 강의 중</span>
            <Badge variant="secondary" className="text-xs">
              {startIndex + 1} - {Math.min(endIndex, videos.length)}
            </Badge>
            <span className="sm:hidden">/ {videos.length}</span>
            <span className="hidden sm:inline">번째 강의</span>
          </div>

          {/* 다음 페이지 버튼 */}
          <PaginationLink isActive={!!nextHref} href={nextHref || "#"} aria-disabled={!nextHref} aria-label="다음 페이지" className={`${!nextHref && "text-gray-300 pointer-events-none"}`}>
            다음
          </PaginationLink>
        </div>
      </div>

      {/* 비디오 목록 */}
      <article className="mb-8">
        <YoutubePlaylist videos={currentPageVideos} />
      </article>

      {/* 페이지네이션 컨트롤 */}
      <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/3.콩팥질환 강좌/3.혈액투석 1,2,3" className="mt-8" />
    </div>
  );
}
