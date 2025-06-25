"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ScrollNavigator() {
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        // 섹션 엘리먼트에서 다음/이전 토큰 읽어오기
        const section = document.querySelector<HTMLElement>("section[data-next-token][data-prev-token]");
        if (!section) return;

        const next = section.dataset.nextToken;
        const prev = section.dataset.prevToken;

        const params = new URLSearchParams([...searchParams.entries()]);

        if (entry.target === bottomRef.current && next) {
          params.set("pageToken", next);
          router.push(`/3.콩팥질환 강좌/3.혈액투석 1,2,3?${params.toString()}`);
        }

        if (entry.target === topRef.current && prev) {
          params.set("pageToken", prev);
          router.push(`/3.콩팥질환 강좌/3.혈액투석 1,2,3?${params.toString()}`);
        }
      });
    };

    const obs = new IntersectionObserver(handleIntersect, {
      rootMargin: "1px",
      threshold: 1.0,
    });

    if (topRef.current) obs.observe(topRef.current);
    if (bottomRef.current) obs.observe(bottomRef.current);
    return () => obs.disconnect();
  }, [router, searchParams]);

  return (
    <>
      {/* 최상단에 배치: 위로 스크롤하면 이전 페이지 */}
      <div ref={topRef} style={{ position: "absolute", top: 0, height: 1 }} />
      {/* 하단에 배치: 아래로 스크롤하면 다음 페이지 */}
      <div ref={bottomRef} style={{ height: 100 }} />
    </>
  );
}
