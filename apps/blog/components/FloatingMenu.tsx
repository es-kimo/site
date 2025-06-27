"use client";

import { Button } from "@workspace/ui/components/button";
import { ModeToggle } from "@workspace/ui/components/mode-toggle";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import { DatabaseZap, Github, Home, PencilLine, Signature } from "lucide-react";
import { Link } from "next-view-transitions";
import { useEffect, useRef, useState } from "react";

// 상수 정의
const SCROLL_THRESHOLD = 20; // 스크롤 임계값
const BOTTOM_MARGIN = 20; // 하단 여백

// Glass button 스타일 함수
const glassButtonStyle = (className?: string) => {
  return cn(
    "h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-md bg-zinc-800/40 border border-slate-300/20 hover:bg-black text-white/90 hover:text-white",
    "[.light_&]:bg-white/70 [.light_&]:hover:bg-white [.light_&]:border-neutral-300/20 [.light_&]:hover:border-slate-400/20 [.light_&]:text-neutral-500 [.light_&]:hover:text-neutral-800",
    className
  );
};

interface GlassButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

function GlassButton({ onClick, children, className, asChild }: GlassButtonProps) {
  return (
    <Button size="icon" variant="secondary" onClick={onClick} asChild={asChild} className={glassButtonStyle(className)}>
      {children}
    </Button>
  );
}

interface FloatingMenuProps {
  className?: string;
}

export function FloatingMenu({ className }: FloatingMenuProps) {
  const [isVisible, setIsVisible] = useState(false);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const checkScrollAvailability = () => {
      const viewportHeight = window.innerHeight;
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );

      const hasScrollContent = documentHeight > viewportHeight;
      const hasOverflow = document.documentElement.scrollHeight > document.documentElement.clientHeight;
      const bodyHasOverflow = document.body.scrollHeight > document.body.clientHeight;

      const canScroll = hasScrollContent || hasOverflow || bodyHasOverflow;

      if (!canScroll) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const handleScroll = () => {
      const currentScrollY = window.pageYOffset;
      const viewportHeight = window.innerHeight;
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );

      const isAtBottom = currentScrollY + viewportHeight >= documentHeight - BOTTOM_MARGIN;
      const isAtTop = currentScrollY <= SCROLL_THRESHOLD;
      const isScrollingUp = currentScrollY < lastScrollYRef.current;
      const isScrollingDown = currentScrollY > lastScrollYRef.current;

      if ((isAtBottom || (currentScrollY > SCROLL_THRESHOLD && isScrollingUp)) && !isAtTop) {
        setIsVisible(true);
      } else if ((isScrollingDown && currentScrollY > SCROLL_THRESHOLD) || isAtTop) {
        setIsVisible(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    const resizeObserver = new ResizeObserver(() => {
      checkScrollAvailability();
    });

    resizeObserver.observe(document.body);
    resizeObserver.observe(document.documentElement);

    checkScrollAvailability();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className={cn("fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 rounded-3xl overflow-hidden", isVisible ? "shadow-2xl [.dark_&]:shadow-slate-700" : "", className)}>
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

      <div
        className={cn(
          "absolute inset-0 [filter:url(#liquid-glass-filter)] backdrop-blur-[12px] saturate-[110%] brightness-[1.05]",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      ></div>

      <div className={cn("flex flex-row gap-2 p-4 transition-all duration-300 ease-in-out items-center", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none")}>
        <GlassButton asChild>
          <Link href="/">
            <Home className="h-5 w-5" />
          </Link>
        </GlassButton>

        <GlassButton asChild>
          <Link href="/database">
            <DatabaseZap className="h-5 w-5" />
          </Link>
        </GlassButton>

        <GlassButton asChild>
          <Link href="/writing">
            <PencilLine className="h-5 w-5" />
          </Link>
        </GlassButton>

        <GlassButton asChild>
          <Link href="/about">
            <Signature className="h-5 w-5" />
          </Link>
        </GlassButton>

        <Separator orientation="vertical" className="h-10" />

        <ModeToggle className={glassButtonStyle()} />

        <GlassButton asChild>
          <Link href="https://github.com/es-kimo" target="_blank" rel="noopener noreferrer">
            <Github className="h-5 w-5" />
          </Link>
        </GlassButton>
      </div>
    </div>
  );
}
