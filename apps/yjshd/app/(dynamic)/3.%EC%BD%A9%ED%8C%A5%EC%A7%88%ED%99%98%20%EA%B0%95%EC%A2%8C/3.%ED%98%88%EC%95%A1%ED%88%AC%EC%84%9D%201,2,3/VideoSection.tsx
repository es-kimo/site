// app/playlist/VideosSection.tsx
import Pagination from "@/components/Pagination";
import YoutubePlaylist from "@/components/YoutubePlaylist";
import { Badge } from "@workspace/ui/components/badge";
import { VideoItem } from "@/lib/youtube";

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

  return (
    <div className="space-y-6 relative">
      {/* 인디케이터 */}
      <div className="sticky top-[var(--header-h)] sm:top-[calc(var(--header-h)_+_var(--sub-header-h))] lg:top-[var(--header-h)] z-10 bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/20 px-2 py-4 mb-8 rounded-b-xl">
        <div className="flex justify-center items-center gap-2 text-muted-foreground text-sm">
          <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">혈액투석</span>
          <div className="h-[3px] w-[3px] bg-gray-400 rounded-full opacity-60" />
          <span>총 {videos.length}개 강의 중</span>
          <Badge variant="secondary">
            {startIndex + 1} - {Math.min(endIndex, videos.length)}
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
