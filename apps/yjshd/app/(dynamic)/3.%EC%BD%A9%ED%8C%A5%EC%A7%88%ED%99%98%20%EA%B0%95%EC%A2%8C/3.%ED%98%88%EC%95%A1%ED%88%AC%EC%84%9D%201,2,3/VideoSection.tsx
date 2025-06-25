// app/playlist/VideosSection.tsx
import Pagination from "@/components/Pagination";
import YoutubePlaylist from "@/components/YoutubePlaylist";
import { getAllVideos } from "@/lib/youtube";
import { Badge } from "@workspace/ui/components/badge";

interface VideosSectionProps {
  page?: string;
}

const pageSize = 12; // 한 페이지당 표시할 비디오 수

export default async function VideosSection({ page }: VideosSectionProps) {
  const currentPage = Math.max(parseInt(page || "1", 10), 1);

  // 모든 비디오 데이터를 한 번에 가져오기
  const allVideos = await getAllVideos();

  // 페이지네이션 계산
  const totalPages = Math.ceil(allVideos.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageVideos = allVideos.slice(startIndex, endIndex);

  return (
    <div className="space-y-6 relative">
      {/* 인디케이터 */}
      <div className="sticky top-[var(--header-h)] sm:top-[calc(var(--header-h)_+_var(--sub-header-h))] lg:top-[var(--header-h)] z-10 backdrop-blur-md px-2 py-4 mb-8">
        <div className="flex items-center gap-3 text-muted-foreground text-sm">
          <span className="font-medium sm:text-base bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">혈액투석</span>
          <div className="h-1 w-1 bg-gray-300 rounded-full" />
          <span>총 {allVideos.length}개 강의 중</span>
          <Badge variant="secondary">
            {startIndex + 1} - {Math.min(endIndex, allVideos.length)}
          </Badge>
          <span>번째 강의</span>
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
