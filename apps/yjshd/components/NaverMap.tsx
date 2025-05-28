"use client";

import { RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface NaverMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  width?: string;
}

export default function NaverMap({ lat, lng, zoom = 15, width = "100%" }: NaverMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const initialCenterRef = useRef<naver.maps.LatLng | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768); // break point
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const naver = window.naver;
    if (!naver || !containerRef.current) return;

    const location = new naver.maps.LatLng(lat, lng);
    const map = new naver.maps.Map(containerRef.current, {
      center: location,
      zoom,
    });

    mapRef.current = map;
    initialCenterRef.current = location;

    const marker = new naver.maps.Marker({
      position: location,
      map,
      icon: {
        url: "/clinic-marker.png",
        scaledSize: new naver.maps.Size(32, 48),
        anchor: new naver.maps.Point(24, 48),
      },
    });

    const infoWindow = new naver.maps.InfoWindow({
      content: `
    <div style="
      font-family: 'Noto Sans KR', sans-serif;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      width: 220px;
      padding: 16px;
      color: #333;
      line-height: 1.5;
    ">
      <!-- 헤더 -->
      <div style="display:flex; align-items:center; margin-bottom:12px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#007aff" style="margin-right:8px;">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
        </svg>
        <h4 style="margin:0; font-size:16px; font-weight:600; color:#111;">
          연세정성내과의원
        </h4>
      </div>
      <hr style="border:none; border-top:1px solid #f0f0f0; margin:0 0 12px;" />

      <!-- 컨텐츠 -->
      <div style="font-size:14px;">
        <div style="display:flex; align-items:center; margin-bottom:8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#666" style="margin-right:6px;">
            <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7z"/>
          </svg>
          서울시 강서구 화곡로 301
        </div>
        <div style="display:flex; align-items:center; margin-bottom:8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#666" style="margin-right:6px;">
            <path d="M12 8V4l8 8-8 8v-4H4V8z"/>
          </svg>
          평일 9:00 – 18:00<br/>목/토 9:00 – 13:00
        </div>
        <div style="display:flex; align-items:center; margin-bottom:12px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#666" style="margin-right:6px;">
            <path d="M6.62 10.79a15.464 15.464 0 006.59 6.59l2.2-2.2a1 1 0 01.96-.27c1.05.28 2.18.43 3.33.43a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.15.15 2.28.43 3.33a1 1 0 01-.27.96l-2.2 2.2z"/>
          </svg>
          <a href="tel:0226922990">
            02-2692-2990
          </a>
        </div>
      </div>

      <!-- 길찾기 버튼 -->
      <a href="https://map.naver.com/index.nhn?elat=${lat}&elng=${lng}&etext=${encodeURIComponent("연세정성내과의원")}&menu=route" target="_blank"
         style="
           display:block;
           text-align:center;
           text-decoration:none;
           background: linear-gradient(90deg, #007aff, #00d4ff);
           color:#fff;
           padding:8px 0;
           border-radius:6px;
           font-size:14px;
           font-weight:500;
         ">
        🚗 길찾기
      </a>
    </div>
  `,
      pixelOffset: new naver.maps.Point(0, 0),
    });

    if (!isMobile) {
      // 컴포넌트 마운트 시 바로 열기
      infoWindow.open(map, marker);
    }

    // (선택) 마커 클릭 시에도 토글 열기/닫기
    marker.addListener("click", () => {
      if (infoWindow.getMap()) infoWindow.close();
      else infoWindow.open(map, marker);
    });

    // 정리: 언마운트 시 이벤트와 오버레이 제거
    return () => {
      naver.maps.Event.clearInstanceListeners(map);
      infoWindow.close();
    };
  }, [lat, lng, zoom, isMobile]);

  const handleRecenter = useCallback(() => {
    if (mapRef.current && initialCenterRef.current) {
      mapRef.current.panTo(initialCenterRef.current);
    }
  }, []);

  return (
    <div ref={containerRef} style={{ width, aspectRatio: "16/9" }} className="rounded-lg overflow-hidden">
      {/* 재중앙 이동 버튼 */}
      <button
        onClick={handleRecenter}
        aria-label="지도 중앙으로 이동"
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 5,
          background: "#fff",
          border: "none",
          padding: 8,
          borderRadius: "50%",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          cursor: "pointer",
        }}
      >
        <RefreshCcw size={18} />
      </button>
    </div>
  );
}
