import { useEffect, useState } from "react";

interface UseNaverMapLinkProps {
  lat: number;
  lng: number;
  name: string;
  placeId?: string;
}

export function useNaverMapLink({ lat, lng, name, placeId = "1634387039" }: UseNaverMapLinkProps) {
  const [href, setHref] = useState<string>("");

  useEffect(() => {
    const origin = window.location.origin;
    const encodedName = encodeURIComponent(name);
    const encodedApp = encodeURIComponent(origin);

    const webUrl = `https://map.naver.com/v5/search/${encodedName}/place/${lng},${lat},15,0,0,0,dh`;
    const intentUrl =
      `intent://place?id=${placeId}&appname=${encodedApp}` +
      `#Intent;scheme=nmap;action=android.intent.action.VIEW;` +
      `category=android.intent.category.BROWSABLE;` +
      `package=com.nhn.android.nmap;end`;
    const iosUrl = `nmap://place?id=${placeId}&appname=${encodedApp}`;

    const ua = navigator.userAgent;
    if (/Android/.test(ua)) {
      setHref(intentUrl);
    } else if (/iPhone|iPad|iPod/.test(ua)) {
      setHref(iosUrl);
    } else {
      setHref(webUrl);
    }
  }, [lat, lng, name, placeId]);

  return href;
}
