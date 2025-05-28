"use client";

import { useNaverMapLink } from "../hooks/useNaverMapLink";

interface ViewOnMapButtonProps {
  lat: number;
  lng: number;
  name: string; // ex) "연세정성내과의원"
}

export function ViewOnMapButton({ lat, lng, name }: ViewOnMapButtonProps) {
  const href = useNaverMapLink({ lat, lng, name });

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-block",
        textDecoration: "none",
        background: "linear-gradient(90deg, #007aff, #00d4ff)",
        color: "#fff",
        padding: "8px 16px",
        borderRadius: "6px",
        fontSize: "14px",
        fontWeight: 500,
      }}
    >
      🗺️ 지도에서 보기
    </a>
  );
}
