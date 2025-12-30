"use client";

import { Button } from "@workspace/ui/components/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@workspace/ui/components/navigation-menu";
import { cn } from "@workspace/ui/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Link } from "next-view-transitions";
import { Logo } from "./Logo";

interface IslandProps {
  className?: string;
}

export function Island({ className }: IslandProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn("fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 shadow-2xl dark:shadow-slate-700 rounded-md", className)}>
      <div className="absolute overflow-hidden w-full h-[48px] rounded-md">
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

      <div className={cn("relative flex flex-row gap-2 py-1 px-4 transition-all duration-300 ease-in-out items-center max-h-[72px] overflow-visible rounded-full")}>
        <Logo />
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="bg-background/20">
          <Sun
            className={cn(
              "h-5 w-5 rotate-0 transition-all dark:-rotate-90",
              "[transform:scale(var(--icon-scale,1))_rotate(0deg)_scale(1)] dark:[transform:scale(var(--icon-scale,1))_rotate(-90deg)_scale(0)]"
            )}
          />
          <Moon
            className={cn(
              "absolute h-5 w-5 rotate-90 transition-all dark:rotate-0",
              "[transform:scale(var(--icon-scale,1))_rotate(90deg)_scale(0)] dark:[transform:scale(var(--icon-scale,1))_rotate(0deg)_scale(1)]"
            )}
          />
          <span className="sr-only">화면 모드 토글</span>
        </Button>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle({ className: "bg-background/20" })}>
                <Link href="/about">About</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}
