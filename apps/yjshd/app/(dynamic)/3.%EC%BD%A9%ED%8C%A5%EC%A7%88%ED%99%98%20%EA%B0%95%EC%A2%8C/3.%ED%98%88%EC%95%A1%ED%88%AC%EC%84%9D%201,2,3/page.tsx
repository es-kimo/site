import { Metadata } from "next";
import { getAllVideos } from "@/lib/youtube";
import VideosSection from "./VideoSection";

const SUBCATEGORY = "3.혈액투석 1,2,3";

export const metadata: Metadata = {
  title: "혈액투석 1,2,3 강의",
  description: "연세정성내과 투석 환우들께서 가장 흔하게 질문하는 주제에 대해 핵심 3가지만 말씀드리는 '혈액투석 하나 둘 셋' 시리즈입니다.",
  keywords: ["혈액투석", "투석강의", "투석환자", "투석시간", "투석식사", "투석예방접종", "투석진료비", "연세정성내과", "콩팥질환"],
  openGraph: {
    title: "혈액투석 1,2,3 강의",
    description: "연세정성내과 투석 환우들께서 가장 흔하게 질문하는 주제에 대해 핵심 3가지만 말씀드리는 '혈액투석 하나 둘 셋' 시리즈입니다.",
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

export const revalidate = 3600;

export default async function PlaylistPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  const allVideos = await getAllVideos();
  const sortedVideos = allVideos.sort((a, b) => {
    const dateA = new Date(a.contentDetails.videoPublishedAt).getTime();
    const dateB = new Date(b.contentDetails.videoPublishedAt).getTime();
    return dateB - dateA; // 최신순 (내림차순)
  });

  return (
    <section className="container mx-auto px-6 py-8 space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">혈액투석 1,2,3</span> 강의
      </h2>
      <h3 className="text-sm sm:text-base text-muted-foreground sr-only">
        연세정성내과 투석 환우들께서 가장 흔하게 질문하는 주제에 대해 핵심 3가지만 말씀드리는 &apos;혈액투석 하나 둘 셋&apos; 시리즈입니다.
      </h3>
      <VideosSection page={page} videos={sortedVideos} />
    </section>
  );
}
