"use client";

import Script from "next/script";
import { useState } from "react";
import NaverMap from "./NaverMap";
import { Skeleton } from "@workspace/ui/components/skeleton";
import ViewOnMapButton from "@/components/ViewOnMapButton";

interface NaverMapWrapperProps {
  lat: number;
  lng: number;
  zoom?: number;
  width?: string;
}

export default function NaverMapWrapper({ lat, lng, zoom, width }: NaverMapWrapperProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      <Script src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID_DEV}`} strategy="lazyOnload" onLoad={() => setIsLoaded(true)} />
      <div className="my-4">
        <div className="flex flex-col gap-2">
          {isLoaded ? <NaverMap lat={lat} lng={lng} zoom={zoom} width={width} /> : <Skeleton className="w-full aspect-video" />}
          <ViewOnMapButton lat={lat} lng={lng} name="연세정성내과의원" />
        </div>
      </div>
    </>
  );
}
