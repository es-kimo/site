// app/playlist/VideosSection.tsx
import YoutubePlaylist from "@/components/YoutubePlaylist";
import { getVideos } from "@/lib/youtube";
import Pagination from "./Pagination";

interface VideosSectionProps {
  pageToken?: string;
}

export default async function VideosSection({ pageToken }: VideosSectionProps) {
  const { items, nextPageToken, prevPageToken } = await getVideos(pageToken ?? undefined);

  return (
    <div className="space-y-8">
      {/* 비디오 목록 */}
      <section className="mb-8">
        <YoutubePlaylist videos={items} />
      </section>

      {/* 페이지네이션 컨트롤 */}
      <Pagination nextPageToken={nextPageToken} prevPageToken={prevPageToken} currentPageToken={pageToken} />
    </div>
  );
}
