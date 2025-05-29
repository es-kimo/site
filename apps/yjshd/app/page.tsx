import { TheHeader } from "@/components/TheHeader";
import { SubCategoryParams } from "@workspace/common/structure/params.types";
import { Button } from "@workspace/ui/components/button";
import { ExternalLink } from "lucide-react";
import { Link } from "next-view-transitions";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "연세정성내과",
  description: "더 나은 의료 서비스를 향한 도약, 연세정성내과의 발돋움 2025",
  openGraph: {
    title: "연세정성내과",
    description: "더 나은 의료 서비스를 향한 도약, 연세정성내과의 발돋움 2025",
    images: [
      {
        url: "/doctor.png",
        width: 230,
        height: 250,
        alt: "연세정성내과 의사선생님",
      },
    ],
  },
};

export default function Page({ params }: { params: Promise<SubCategoryParams> }) {
  return (
    <div className="flex flex-col gap-8 lg:gap-16 relative">
      {/* Background */}
      <div className="fixed inset-0 -z-50">
        {/* 1) 라벤더→스카이블루→화이트 라디얼 그라데이션 */}
        <div className="absolute top-[72px] inset-0 bg-[radial-gradient(circle_at_center,#fb9bd6_0%,#7A8BFF_50%,#00E5FF_100%)] opacity-20" />
        {/* 2) 위쪽 화이트 페이드 인→중앙 투명→아래 살짝 다크 페이드 아웃 */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.8)_80%,rgba(0,0,0,0.02)_100%)]" />
      </div>

      <TheHeader params={params} />

      <main className="flex flex-col gap-8 lg:gap-16 w-fit mx-auto px-4">
        <div>
          <div className="text-2xl lg:text-4xl">
            <p className="font-bold">더 나은 의료 서비스를 향한 도약</p>
            <h2>연세정성내과의 발돋움 2025</h2>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:justify-between gap-8 lg:gap-36">
          <div>
            <p className="mb-5 lg:text-xl lg:leading-10 text-muted-foreground opacity-0 animate-fade-in-up">
              정상이 어디인지 누구도 알 수 없습니다.
              <br />
              어제보다 나은 내일을 위해
              <br />
              오늘 혁신하고
              <br />
              오시는 한 분 한 분 정성을 다합니다.
            </p>

            <Button variant="outline" className="opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards_0.3s] w-full" asChild>
              <Link href="/1.연세정성내과의 발돋움/1.2025 발돋움">
                2025 발돋움 <ExternalLink />
              </Link>
            </Button>
          </div>

          <div className="hidden h-md:grid md:grid grid-cols-2 overflow-auto">
            <Image src={"/doctor.png"} alt="의사선생님" width={200} height={230} className="aspect-[200/230]" />
            <Image src={"/mission.png"} alt="연세정성내과 미션과 비젼" width={200} height={230} className="aspect-[200/230]" />
          </div>
        </div>
      </main>
    </div>
  );
}
