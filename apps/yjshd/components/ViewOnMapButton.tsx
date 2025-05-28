"use client";

import { useEffect, useState } from "react";

interface ViewOnMapButtonProps {
  lat: number;
  lng: number;
  name: string; // ex) "연세정성내과의원"
}

export default function ViewOnMapButton({ lat, lng, name }: ViewOnMapButtonProps) {
  const [href, setHref] = useState<string>("");

  useEffect(() => {
    const origin = window.location.origin;
    const encodedName = encodeURIComponent(name);
    const encodedApp = encodeURIComponent(origin);
    const placeId = "1634387039";

    // 1) 웹 버전 URL (PC용)
    const webUrl = `https://map.naver.com/v5/search/${encodedName}/place/${lng},${lat},15,0,0,0,dh`;

    // 2) Android Intent URL (앱이 없으면 Play 스토어로)  [oai_citation:0‡NCloud Docs](https://guide.ncloud-docs.com/docs/en/maps-url-scheme?utm_source=chatgpt.com) [oai_citation:1‡NCloud Docs](https://guide.ncloud-docs.com/docs/ja/maps-url-scheme?utm_source=chatgpt.com)
    const intentUrl =
      `intent://place?id=${placeId}&appname=${encodedApp}` +
      `#Intent;scheme=nmap;action=android.intent.action.VIEW;` +
      `category=android.intent.category.BROWSABLE;` +
      `package=com.nhn.android.nmap;end`;

    // 3) iOS Scheme URL  [oai_citation:2‡NCloud Docs](https://guide.ncloud-docs.com/docs/en/maps-url-scheme?utm_source=chatgpt.com)
    const iosUrl = `nmap://place?id=${placeId}&appname=${encodedApp}`;

    // userAgent로 플랫폼 분기
    const ua = navigator.userAgent;
    if (/Android/.test(ua)) {
      setHref(intentUrl);
    } else if (/iPhone|iPad|iPod/.test(ua)) {
      setHref(iosUrl);
    } else {
      setHref(webUrl);
    }
  }, [lat, lng, name]);

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
