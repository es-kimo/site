import { TheHeader } from "@/components/TheHeader";
import { SubCategoryParams } from "@workspace/common/structure/params.types";
import { Button } from "@workspace/ui/components/button";
import { ArrowRight, Phone, MapPin, Clock } from "lucide-react";
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
    <div className="flex flex-col bg-white text-gray-900">
      {/* Vercel-style grid background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-transparent" />
      </div>

      <TheHeader params={params} />

      {/* Hero Section - Vercel Style */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-32">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-gray-200 rounded-full text-sm font-mono text-gray-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              2025.01
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-none">
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
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl -z-10" />
      </section>

      {/* Stats Section - Vercel Style */}
      <section className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200">
            {[
              { value: "25+", label: "경력 연수" },
              { value: "1:1", label: "맞춤 진료" },
              { value: "24/7", label: "상담 가능" },
              { value: "100%", label: "환자 중심" },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 text-center group hover:bg-gray-50 transition-colors">
                <div className="text-4xl md:text-5xl font-bold font-mono mb-2 group-hover:text-gray-900 transition-colors">{stat.value}</div>
                <div className="text-sm text-gray-500 font-mono tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctor Section - Vercel Style */}
      <section className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-8 lg:sticky lg:top-32">
              <div>
                <div className="text-sm font-mono text-gray-500 tracking-wider mb-4">의료진</div>
                <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-none mb-6">류동열 원장</h2>
                <div className="h-px w-16 bg-gray-300 mb-6" />
              </div>

              <div className="space-y-6">
                <div className="border border-gray-200 p-6 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="text-sm font-mono text-gray-500 mb-2">학력</div>
                  <div className="text-lg">연세대학교 의과대학 졸업</div>
                </div>

                <div className="border border-gray-200 p-6 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="text-sm font-mono text-gray-500 mb-2">경력</div>
                  <div className="text-lg">전 이화여자대학교 의과대학 교수</div>
                </div>

                <div className="border border-gray-200 p-6 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="text-sm font-mono text-gray-500 mb-2">소개</div>
                  <div className="text-lg text-gray-600 leading-relaxed">25년여동안 수련의, 전문의, 교수, 연구자로 쌓은 지식과 경험을 바탕으로 여러분의 건강을 책임집니다.</div>
                </div>
              </div>

              <Button variant="ghost" className="text-gray-900 hover:bg-gray-100 group" asChild>
                <Link href="/1.소개/1.의료진 소개">
                  전체 프로필 보기
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <div className="aspect-[3/4] relative border border-gray-200 rounded-lg overflow-hidden group">
                <Image src="/doctor.png" alt="류동열 원장" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Vercel Style */}
      <section className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-32">
          <div className="mb-20">
            <div className="text-sm font-mono text-gray-500 tracking-wider mb-4">진료</div>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-none">진료 안내</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-gray-200">
            {/* 외래 진료 */}
            <div className="bg-white p-10 group hover:bg-gray-50 transition-colors">
              <div className="space-y-8">
                <div>
                  <div className="text-sm font-mono text-gray-500 tracking-wider mb-4">01</div>
                  <h3 className="text-3xl font-bold mb-4">외래 진료</h3>
                  <div className="h-px w-12 bg-gray-300" />
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="text-sm font-mono text-gray-500 mb-3">일반내과</div>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-3">
                        <span className="text-gray-900 mt-1">→</span>
                        <span>급만성 내과질환 진료</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-gray-900 mt-1">→</span>
                        <span>만성질환 관리</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-gray-900 mt-1">→</span>
                        <span>예방접종 및 영양치료</span>
                      </li>
                    </ul>
                  </div>

                  <div className="h-px bg-gray-200" />

                  <div>
                    <div className="text-sm font-mono text-gray-500 mb-3">콩팥 건강검진</div>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-3">
                        <span className="text-gray-900 mt-1">→</span>
                        <span>만성콩팥병 조기 발견</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-gray-900 mt-1">→</span>
                        <span>단계별 맞춤형 치료</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <Button variant="ghost" className="text-gray-900 hover:bg-gray-100 w-full justify-between group" asChild>
                  <Link href="/1.소개/2.진료 안내">
                    자세히 보기
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* 인공신장실 */}
            <div className="bg-white p-10 group hover:bg-gray-50 transition-colors">
              <div className="space-y-8">
                <div>
                  <div className="text-sm font-mono text-gray-500 tracking-wider mb-4">02</div>
                  <h3 className="text-3xl font-bold mb-4">인공신장실</h3>
                  <div className="h-px w-12 bg-gray-300" />
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="text-sm font-mono text-gray-500 mb-3">혈액투석 치료</div>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-3">
                        <span className="text-gray-900 mt-1">→</span>
                        <span>투석 전 혈관 관리</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-gray-900 mt-1">→</span>
                        <span>체중관리 지원</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-gray-900 mt-1">→</span>
                        <span>정기 혈액검사</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-gray-900 mt-1">→</span>
                        <span>투석 적절도 검사</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border border-gray-300 p-4 rounded">
                    <div className="text-sm font-mono text-gray-500 mb-2">야간 투석</div>
                    <div className="text-gray-900">월 · 수 · 금 야간 투석 운영</div>
                  </div>
                </div>

                <Button variant="ghost" className="text-gray-900 hover:bg-gray-100 w-full justify-between group" asChild>
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

      {/* Location Section - Vercel Style */}
      <section className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-32">
          <div className="mb-20">
            <div className="text-sm font-mono text-gray-500 tracking-wider mb-4">위치 및 시간</div>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-none">방문 안내</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-gray-200">
            {/* Location */}
            <div className="bg-white p-8 group hover:bg-gray-50 transition-colors">
              <MapPin className="w-8 h-8 mb-6 text-gray-500" />
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-mono text-gray-500 mb-2">주소</div>
                  <div className="text-lg leading-relaxed">
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
            <div className="bg-white p-8 group hover:bg-gray-50 transition-colors">
              <Phone className="w-8 h-8 mb-6 text-gray-500" />
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-mono text-gray-500 mb-2">연락처</div>
                  <a href="tel:0226922990" className="text-2xl font-mono hover:text-gray-700 transition-colors">
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
            <div className="bg-white p-8 group hover:bg-gray-50 transition-colors">
              <Clock className="w-8 h-8 mb-6 text-gray-500" />
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-mono text-gray-500 mb-3">진료시간</div>
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
    </div>
  );
}
