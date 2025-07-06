"use client";

import { Zap, Diamond, Heart, Feather, Star } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

export default function AnniversaryContent() {
  const [currentSection, setCurrentSection] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const reasonsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const reasonRefs = useRef<(HTMLDivElement | null)[]>([]);

  const sections = [
    {
      title: "2주년",
      subtitle: "2023.06.23 - 2025.06.23",
      description: "2년 동안 함께했어",
    },
    {
      title: "선물",
      subtitle: "리듬볼 원터치 귀고리",
      description: "특별한 걸 준비했어",
    },
    {
      title: "이유",
      subtitle: "왜 이걸 선택했을까?",
      description: "하나씩 들려줄게",
    },
  ];

  const reasons = [
    {
      icon: Diamond,
      title: "14K 로즈 골드",
      description: "고급스러운 소재로 오래 간직할 수 있어요",
      number: "01",
    },
    {
      icon: Zap,
      title: "원터치 방식",
      description: "착용하기 편리하고 떨어뜨릴 걱정이 없어요",
      number: "02",
    },
    {
      icon: Heart,
      title: "은은한 화려함",
      description: "네가 더 빛나 보일거야.",
      number: "03",
    },
    {
      icon: Feather,
      title: "적당한 무게와 사이즈",
      description: "낀 듯 안 낀 듯 딱 좋은 사이즈",
      number: "04",
    },
    {
      icon: Star,
      title: "일상 착용",
      description: "매일 착용해도 부담스럽지 않은 디자인이에요",
      number: "05",
    },
  ];

  // Intersection Observer for section visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.getAttribute("data-section");
          if (sectionId) {
            setVisibleSections((prev) => {
              const newSet = new Set(prev);
              if (entry.isIntersecting) {
                newSet.add(sectionId);
              } else {
                newSet.delete(sectionId);
              }
              return newSet;
            });
          }
        });
      },
      { threshold: 0.1, rootMargin: "-10% 0px -10% 0px" }
    );

    const sections = [heroRef.current, reasonsRef.current, imageRef.current, messageRef.current, footerRef.current];
    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    // Observe each reason card
    reasonRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      sections.forEach((section) => {
        if (section) observer.unobserve(section);
      });
      reasonRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollTop / docHeight;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentSection((prev) => (prev + 1) % sections.length);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 10);
      }, 200);
    }, 3000);

    return () => clearInterval(interval);
  }, [sections.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white scroll-smooth">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
        <div className="h-full bg-gray-900 transition-all duration-300 ease-out" style={{ width: `${scrollProgress * 100}%` }} />
      </div>

      {/* Hero Section */}
      <div ref={heroRef} data-section="hero" className="relative min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl"></div>

        <div className={`relative z-10 text-center max-w-sm sm:max-w-4xl mx-auto transition-all duration-1000 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="mb-12 sm:mb-16">
            <div className={`transition-all duration-300 ${isTransitioning ? "opacity-0 -translate-x-8" : "opacity-100 translate-x-0"}`}>
              <h1 className="text-6xl sm:text-8xl md:text-9xl font-thin text-gray-900 mb-4 sm:mb-6 leading-tight">{sections[currentSection]?.title}</h1>
              <p className="text-lg sm:text-2xl md:text-3xl text-gray-600 font-light mb-3 sm:mb-4 px-2">{sections[currentSection]?.subtitle}</p>
              <p className="text-base sm:text-lg text-gray-500 font-light px-4">{sections[currentSection]?.description}</p>
            </div>
          </div>

          {/* Section Indicators */}
          <div className="flex justify-center space-x-2 sm:space-x-3 mb-12 sm:mb-16">
            {sections.map((_, index) => (
              <div key={index} className={`h-2 rounded-full transition-all duration-500 ${index === currentSection ? "bg-gray-900 w-6 sm:w-8" : "bg-gray-300 w-2"}`} />
            ))}
          </div>

          {/* Scroll Hint */}
          <div className={`transition-all duration-1000 delay-1000 ${visibleSections.has("hero") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="flex flex-col items-center space-y-2 text-gray-400">
              <p className="text-sm font-light">아래로 스크롤해보세요</p>
              <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reasons Section */}
      <div ref={reasonsRef} data-section="reasons" className="relative py-16 sm:py-32 px-4 sm:px-6">
        <div className="absolute inset-0 bg-white/60 backdrop-blur-2xl"></div>

        <div className="relative z-10 max-w-sm sm:max-w-4xl mx-auto">
          <div className={`text-center mb-12 sm:mb-20 transition-all duration-1000 ${visibleSections.has("reasons") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-thin text-gray-900 mb-4 sm:mb-6">5가지 이유</h2>
            <p className="text-base sm:text-xl text-gray-600 font-light px-4">왜 이 귀고리를 선택했는지 알려줄게</p>
          </div>

          <div className="space-y-4 sm:space-y-8">
            {reasons.map((reason, index) => (
              <div
                key={index}
                ref={(el) => {
                  reasonRefs.current[index] = el;
                }}
                data-section={`reason-${index}`}
                className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/30 backdrop-blur-xl border border-white/20 p-6 sm:p-8 md:p-12 transition-all duration-700 active:scale-95 sm:hover:bg-white/40 sm:hover:scale-[1.02] ${
                  visibleSections.has(`reason-${index}`) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: `${index * 0.1}s`,
                }}
              >
                <div className="flex items-start gap-4 sm:gap-8">
                  <div className="flex-shrink-0">
                    <div className="text-2xl sm:text-4xl md:text-5xl font-thin text-gray-400 mb-3 sm:mb-4">{reason.number}</div>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/40 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center">
                      <reason.icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-700" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-900 mb-3 sm:mb-4 leading-tight">{reason.title}</h3>
                    <p className="text-base sm:text-lg md:text-xl text-gray-600 font-light leading-relaxed">{reason.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gift Image Section */}
      <div ref={imageRef} data-section="image" className="relative py-16 sm:py-32 px-4 sm:px-6">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl"></div>

        <div className="relative z-10 max-w-sm sm:max-w-2xl mx-auto">
          <div className={`transition-all duration-1000 ${visibleSections.has("image") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-thin text-gray-900 mb-4">리듬볼 원터치 귀고리</h2>
              <p className="text-base sm:text-lg text-gray-600 font-light">이런 모습이에요</p>
            </div>

            <div className="bg-white/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-12 border border-white/20">
              <div className="relative max-w-xs sm:max-w-sm mx-auto">
                <Image src="/gift.png" alt="리듬볼 원터치 귀고리" width={400} height={600} className="w-full h-auto rounded-xl shadow-lg" priority />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Section */}
      <div ref={messageRef} data-section="message" className="relative py-16 sm:py-32 px-4 sm:px-6">
        <div className="absolute inset-0 bg-white/90 backdrop-blur-2xl"></div>

        <div className="relative z-10 max-w-sm sm:max-w-3xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${visibleSections.has("message") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="bg-white/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-white/30">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-thin text-gray-900 mb-6 sm:mb-8">문득문득</h2>

              <div className="space-y-4 sm:space-y-6 text-gray-700">
                <p className="text-lg sm:text-xl md:text-2xl font-light leading-relaxed">내가 떠올랐으면 좋겠다.</p>
                <p className="text-lg sm:text-xl md:text-2xl font-light leading-relaxed">그럼, 조수석 수납함을 열어봐!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div ref={footerRef} data-section="footer" className="relative py-16 sm:py-32 px-4 sm:px-6">
        <div className="absolute inset-0 bg-gray-900/5 backdrop-blur-2xl"></div>

        <div className="relative z-10 max-w-sm sm:max-w-3xl mx-auto text-center">
          <div
            className={`bg-white/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-white/20 transition-all duration-1000 ${
              visibleSections.has("footer") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <p className="text-lg sm:text-xl md:text-2xl text-gray-800 font-light mb-4 sm:mb-6 leading-relaxed">이 페이지는 QR 코드를 통해서만 접근할 수 있는 특별한 공간이에요</p>
            <p className="text-base sm:text-lg text-gray-600 font-light">브라우저를 닫으면 다시 접근할 수 없으니 이 순간을 소중히 간직해주세요 💕</p>
          </div>
        </div>
      </div>
    </div>
  );
}
