import { TheHeader } from "@/components/TheHeader";
import { SubCategoryParams } from "@workspace/common/structure/params.types";
import { Button } from "@workspace/ui/components/button";
import { ArrowRight, Clock, MapPin, Phone } from "lucide-react";
import { Metadata } from "next";
import { Link } from "next-view-transitions";
import Image from "next/image";

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
    <div className="flex flex-col bg-white text-gray-900">
      {/* Vercel-style grid background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-transparent" />
      </div>

      {/* Fixed Header - DOM 플로우에서 제거 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md">
        <TheHeader params={params} />
      </div>

      {/* Hero Section - Vercel Style */}
      <section className="relative h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-gray-200 rounded-full text-sm font-mono text-gray-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              2026
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-none">
              더 나은 의료를
              <br />
              <span className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent">향한 도약</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">어제보다 나은 내일을 위해 혁신하고, 오시는 한 분 한 분 정성을 다합니다.</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button size="lg" className="bg-gray-900 text-white hover:bg-gray-800 h-12 px-6 font-medium" asChild>
                <Link href="/1.소개/2.진료 안내">
                  진료 안내
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-gray-300 text-gray-900 hover:bg-gray-100 h-12 px-6 font-medium" asChild>
                <a href="tel:0226922990">
                  전화 상담
                  <Phone className="ml-2 w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Gradient orb */}
      </section>

      {/* Doctor Section - 간소화 및 가독성 개선 */}
      <section className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6 lg:sticky lg:top-32">
              <div>
                <div className="text-sm font-mono text-gray-500 mb-3">의료진</div>
                <h2 className="text-4xl font-bold mb-2">류동열 원장</h2>
                <p className="text-gray-600 leading-relaxed">25년여동안 수련의, 전문의, 교수, 연구자로 쌓은 지식과 경험을 바탕으로 여러분의 건강을 책임집니다.</p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="text-sm font-mono text-gray-500 w-12">학력</div>
                  <div className="text-sm">연세대학교 의과대학 졸업</div>
                </div>

                <div className="flex gap-3">
                  <div className="text-sm font-mono text-gray-500 w-12">경력</div>
                  <div className="text-sm">전 이화여자대학교 의과대학 교수</div>
                </div>
              </div>

              <Button variant="ghost" className="text-gray-900 hover:bg-gray-100 group" asChild>
                <Link href="/1.소개/1.의료진 소개">
                  전체 프로필 보기
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            <Image src="/doctor.png" alt="류동열 원장" width={359} height={400} />
          </div>
        </div>
      </section>

      {/* Services Section - 간소화 및 집중도 향상 */}
      <section className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="mb-12">
            <div className="text-sm font-mono text-gray-500 mb-3">진료</div>
            <h2 className="text-4xl font-bold">진료 안내</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 외래 진료 */}
            <div className="border border-gray-200 rounded-lg p-8 hover:border-gray-900 hover:shadow-lg transition-all duration-300">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-3">외래 진료</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-bold text-gray-900 mb-2">일반내과</div>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• 급만성 내과질환 진료</li>
                      <li>• 만성질환 관리</li>
                      <li>• 예방접종 및 영양치료</li>
                    </ul>
                  </div>

                  <div>
                    <div className="text-sm font-bold text-gray-900 mb-2">콩팥 건강검진</div>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• 만성콩팥병 조기 발견</li>
                      <li>• 단계별 맞춤형 치료</li>
                    </ul>
                  </div>
                </div>

                <Button variant="ghost" className="text-gray-900 hover:bg-gray-100 w-full justify-between group mt-4" asChild>
                  <Link href="/1.소개/2.진료 안내">
                    자세히 보기
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* 인공신장실 */}
            <div className="border border-gray-200 rounded-lg p-8 hover:border-gray-900 hover:shadow-lg transition-all duration-300">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-3">인공신장실</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-bold text-gray-900 mb-2">혈액투석 치료</div>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• 투석 전 혈관 관리</li>
                      <li>• 체중관리 지원</li>
                      <li>• 정기 혈액검사</li>
                      <li>• 투석 적절도 검사</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                    <div className="text-sm font-bold text-gray-900 mb-1">야간 투석</div>
                    <div className="text-sm text-gray-600">월 · 수 · 금 야간 투석 운영</div>
                  </div>
                </div>

                <Button variant="ghost" className="text-gray-900 hover:bg-gray-100 w-full justify-between group mt-4" asChild>
                  <Link href="/1.소개/2.진료 안내">
                    자세히 보기
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section - 간소화 및 집중도 향상 */}
      <section className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="mb-12">
            <div className="text-sm font-mono text-gray-500 mb-3">위치 및 시간</div>
            <h2 className="text-4xl font-bold">방문 안내</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Location */}
            <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-900 hover:shadow-lg transition-all duration-300">
              <MapPin className="w-6 h-6 mb-4 text-gray-500" />
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-bold text-gray-900 mb-2">주소</div>
                  <div className="text-sm leading-relaxed text-gray-600">
                    강서구청 바로 앞<br />
                    횡단보도 건너편
                    <br />
                    5층 건물 4층
                  </div>
                </div>
                <Button variant="ghost" className="text-gray-900 hover:bg-gray-100 p-0 h-auto font-mono text-sm group" asChild>
                  <Link href="/1.소개/3.연세정성내과 소개">
                    지도 보기
                    <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Phone */}
            <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-900 hover:shadow-lg transition-all duration-300">
              <Phone className="w-6 h-6 mb-4 text-gray-500" />
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-bold text-gray-900 mb-2">연락처</div>
                  <a href="tel:0226922990" className="text-xl font-mono hover:text-gray-700 transition-colors">
                    02-2692-2990
                  </a>
                </div>
                <Button variant="ghost" className="text-gray-900 hover:bg-gray-100 p-0 h-auto font-mono text-sm" asChild>
                  <a href="tel:0226922990">
                    전화하기
                    <ArrowRight className="ml-2 w-3 h-3" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Hours */}
            <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-900 hover:shadow-lg transition-all duration-300">
              <Clock className="w-6 h-6 mb-4 text-gray-500" />
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-bold text-gray-900 mb-3">진료시간</div>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-500">월·화·수·금</span>
                      <span>09:00-18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">목·토</span>
                      <span>09:00-13:00</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-gray-500">점심시간 13:00-14:30</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Action Button - 스크롤 없이 빠른 접근 */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <a href="tel:0226922990" className="group flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all duration-300">
          <Phone className="w-5 h-5" />
          <span className="font-medium text-sm">전화 상담</span>
        </a>
      </div>
    </div>
  );
}
