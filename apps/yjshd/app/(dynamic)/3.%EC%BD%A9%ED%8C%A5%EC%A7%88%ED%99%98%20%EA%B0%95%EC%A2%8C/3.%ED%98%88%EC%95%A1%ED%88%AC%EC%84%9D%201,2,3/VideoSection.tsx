// app/playlist/VideosSection.tsx
import YoutubePlaylist from "@/components/YoutubePlaylist";
import { getVideos } from "@/lib/youtube";

interface VideosSectionProps {
  initialCursor: string | null;
}

export default async function VideosSection({ initialCursor }: VideosSectionProps) {
  const { items, nextPageToken, prevPageToken } = await getVideos(initialCursor ?? undefined);

  return (
    // 다음 페이지 커서를 data 속성에 실어두면, 클라이언트에서 꺼내 쓸 수 있습니다.
    <section data-next-token={nextPageToken ?? ""} data-prev-token={prevPageToken ?? ""} className="mb-8">
      <YoutubePlaylist videos={items} />
    </section>
  );
}
