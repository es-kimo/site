"use client";

import { type Language } from "@/lib/language";
import { cn } from "@workspace/ui/lib/utils";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { DynamicIslandContext } from "./contexts/context";
import { HomeIsland } from "./Home";
import { IdleIsland } from "./Idle";
import { ReaderIsland } from "./Reader";

interface DynamicIslandProps {
  language: Language;
}

export const DynamicIsland = ({ language }: DynamicIslandProps) => {
  const pathname = usePathname();
  const isReader = pathname.match(/^\/writing\/.+\/.+\/.+$/);
  const isHome = pathname === "/";
  const isIdle = !isReader && !isHome;
  const [islandWidth, setIslandWidth] = useState(0);
  const [islandHeight, setIslandHeight] = useState(0);

  return (
    <DynamicIslandContext value={{ islandWidth, setIslandWidth, islandHeight, setIslandHeight }}>
      <div
        style={{
          width: islandWidth > 0 ? `${islandWidth}px` : "calc(100vw - 12px)",
          transition: "width 300ms ease-in-out",
        }}
        className="fixed top-1.5 max-w-blog left-1/2 transform -translate-x-1/2 z-50 dark:shadow-slate-900 rounded-md"
      >
        <div className="absolute overflow-hidden w-full h-[40px] rounded-md">
          <div className={cn("absolute w-full h-full")}>
            <svg viewBox="0 0 2000 200">
              <defs>
                <filter id="liquid-glass-filter" colorInterpolationFilters="sRGB">
                  <feImage id="displacement-map" x="0" y="0" width="100%" height="100%" href="/displacement-maps/texture.jpeg" result="DISPLACEMENT_MAP" preserveAspectRatio="xMidYMid slice"></feImage>
                  <feColorMatrix
                    in="DISPLACEMENT_MAP"
                    type="matrix"
                    values="0.3 0.3 0.3 0 0
                           0.3 0.3 0.3 0 0
                           0.3 0.3 0.3 0 0
                           0 0 0 1 0"
                    result="EDGE_INTENSITY"
                  ></feColorMatrix>
                  <feComponentTransfer in="EDGE_INTENSITY" result="EDGE_MASK">
                    <feFuncA type="discrete" tableValues="0 0.1 1"></feFuncA>
                  </feComponentTransfer>
                  <feOffset in="SourceGraphic" dx="0" dy="0" result="CENTER_ORIGINAL"></feOffset>
                  <feDisplacementMap in="SourceGraphic" in2="DISPLACEMENT_MAP" scale="-100" xChannelSelector="R" yChannelSelector="B" result="RED_DISPLACED"></feDisplacementMap>
                  <feColorMatrix
                    in="RED_DISPLACED"
                    type="matrix"
                    values="1 0 0 0 0
                           0 0 0 0 0
                           0 0 0 0 0
                           0 0 0 1 0"
                    result="RED_CHANNEL"
                  ></feColorMatrix>
                  <feDisplacementMap in="SourceGraphic" in2="DISPLACEMENT_MAP" scale="-110.00000000000001" xChannelSelector="R" yChannelSelector="B" result="GREEN_DISPLACED"></feDisplacementMap>
                  <feColorMatrix
                    in="GREEN_DISPLACED"
                    type="matrix"
                    values="0 0 0 0 0
                           0 1 0 0 0
                           0 0 0 0 0
                           0 0 0 1 0"
                    result="GREEN_CHANNEL"
                  ></feColorMatrix>
                  <feDisplacementMap in="SourceGraphic" in2="DISPLACEMENT_MAP" scale="-120" xChannelSelector="R" yChannelSelector="B" result="BLUE_DISPLACED"></feDisplacementMap>
                  <feColorMatrix
                    in="BLUE_DISPLACED"
                    type="matrix"
                    values="0 0 0 0 0
                           0 0 0 0 0
                           0 0 1 0 0
                           0 0 0 1 0"
                    result="BLUE_CHANNEL"
                  ></feColorMatrix>
                  <feBlend in="GREEN_CHANNEL" in2="BLUE_CHANNEL" mode="screen" result="GB_COMBINED"></feBlend>
                  <feBlend in="RED_CHANNEL" in2="GB_COMBINED" mode="screen" result="RGB_COMBINED"></feBlend>
                  <feGaussianBlur in="RGB_COMBINED" stdDeviation="0.3" result="ABERRATED_BLURRED"></feGaussianBlur>
                  <feComposite in="ABERRATED_BLURRED" in2="EDGE_MASK" operator="in" result="EDGE_ABERRATION"></feComposite>
                  <feComponentTransfer in="EDGE_MASK" result="INVERTED_MASK">
                    <feFuncA type="table" tableValues="1 0"></feFuncA>
                  </feComponentTransfer>
                  <feComposite in="CENTER_ORIGINAL" in2="INVERTED_MASK" operator="in" result="CENTER_CLEAN"></feComposite>
                  <feComposite in="EDGE_ABERRATION" in2="CENTER_CLEAN" operator="over"></feComposite>
                </filter>
              </defs>
            </svg>
          </div>

          <div className={cn("absolute inset-0 [filter:url(#liquid-glass-filter)] backdrop-blur-[12px] saturate-[110%] brightness-[1.05]")}></div>
        </div>

        {isIdle && <IdleIsland language={language} />}
        {isReader && <ReaderIsland />}
        {isHome && <HomeIsland language={language} />}
      </div>
    </DynamicIslandContext>
  );
};
