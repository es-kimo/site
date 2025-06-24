import YoutubePlaylist from "@/components/YoutubePlaylist";
import type { VideoItem } from "@/components/YoutubePlaylist";
import { Metadata } from "next";

// 페이지 재생성 주기 (1시간)
export const revalidate = 3600;
const SUBCATEGORY = "3.혈액투석 1,2,3";
const PLAYLIST_ID = process.env.NEXT_PUBLIC_YOUTUBE_PLAYLIST_ID ?? "";
const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY ?? "";

export const metadata: Metadata = {
  title: "콩팥질환 정보",
  description:
    "콩팥(신장)질환에 대한 전문적이고 신뢰할 수 있는 의료 정보를 제공합니다. 만성 신부전, 급성 신부전, 사구체신염 등 다양한 콩팥질환에 대한 이해를 돕는 전문 의료 정보를 확인하실 수 있습니다.",
  keywords: ["콩팥질환", "신장질환", "만성신부전", "급성신부전", "사구체신염", "의료정보", "건강교육", "연세정성내과"],
  openGraph: {
    title: "연세정성내과 콩팥질환 정보",
    description:
      "콩팥(신장)질환에 대한 전문적이고 신뢰할 수 있는 의료 정보를 제공합니다. 만성 신부전, 급성 신부전, 사구체신염 등 다양한 콩팥질환에 대한 이해를 돕는 전문 의료 정보를 확인하실 수 있습니다.",
    type: "article",
    locale: "ko_KR",
    siteName: "연세정성내과",
  },
  robots: { index: true, follow: true },
  authors: [{ name: "연세정성내과" }],
  creator: "연세정성내과",
  publisher: "연세정성내과",
  category: "의료정보",
  alternates: {
    canonical: `https://www.yonsei-jshd.com/${encodeURI("3.콩팥질환 강좌")}/${encodeURI(SUBCATEGORY)}`,
  },
};

async function getVideos(pageToken?: string) {
  const params = new URLSearchParams({
    part: "snippet",
    maxResults: "50",
    playlistId: PLAYLIST_ID,
    key: API_KEY,
    ...(pageToken ? { pageToken } : {}),
  });

  const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`, { next: { revalidate } });
  return (await res.json()) as { items: VideoItem[]; nextPageToken?: string };
}

export default async function PlaylistPage() {
  const { items: videos } = await getVideos();
  return (
    <section className="mx-auto py-12 px-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">혈액투석 1,2,3</span> 강좌
      </h2>
      <p className="text-sm md:text-base text-muted-foreground mb-8">
        연세정성내과 투석 환우들께서 가장 흔하게 질문하는 주제에 대해 핵심 3가지만 말씀드리는 &apos;혈액투석 하나 둘 셋&apos; 시리즈입니다.
      </p>
      <YoutubePlaylist videos={videos} />
    </section>
  );
}
