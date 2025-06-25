import { Metadata } from "next";
import { Suspense } from "react";
import VideosSection from "./VideoSection";

const SUBCATEGORY = "3.혈액투석 1,2,3";

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

export const revalidate = 3600;

export default async function PlaylistPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;

  return (
    <main className="container mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">혈액투석 1,2,3 강좌</h1>

      {/* 스트리밍 SSR: 준비되는 즉시 각 섹션을 클라이언트에 전송 */}
      <Suspense fallback={<p>로딩 중…</p>}>
        <VideosSection page={page} />
      </Suspense>
    </main>
  );
}
