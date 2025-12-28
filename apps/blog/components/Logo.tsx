"use client";

import { ParticleSystem } from "@/lib/particles/system";
import { cn } from "@workspace/ui/lib/utils";
import { Link } from "next-view-transitions";
import { useEffect, useRef, useState } from "react";

const particleSystem = new ParticleSystem("khryu.dev");

export function Logo({ className }: { className?: string }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [charPositions, setCharPositions] = useState<number[]>([]);
  const textRef = useRef<SVGTextElement>(null);

  // 실제 렌더링된 글자 위치 측정
  useEffect(() => {
    if (!textRef.current) return;

    const measurePositions = () => {
      const positions: number[] = [];
      const tspans = textRef.current?.querySelectorAll("tspan");

      tspans?.forEach((tspan) => {
        const bbox = tspan.getBBox();
        positions.push(bbox.x);
      });

      if (positions.length > 0) {
        setCharPositions(positions);
      }
    };

    // 폰트 로드 후 측정
    if (document.fonts?.ready) {
      document.fonts.ready.then(measurePositions);
    } else {
      measurePositions();
    }
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAnimating(true);
    // 정확한 애니메이션 종료 시간 계산
    setTimeout(() => setIsAnimating(false), particleSystem.getTotalAnimationTime());
  };

  return (
    <Link
      href="/writing"
      aria-label="khryu.dev (Writing으로 이동)"
      draggable={false}
      onClick={handleClick}
      className={cn(
        "select-none cursor-pointer block",
        "text-foreground/90 hover:text-foreground",
        "hover:bg-foreground/5 active:bg-foreground/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "transition-colors rounded-sm px-1 py-0.5",
        className
      )}
    >
      <svg width="72" height="24" viewBox="0 0 72 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="block overflow-visible" aria-hidden="true">
        <defs>
          <style>{`
            @keyframes convergeAndRotate {
              0% {
                transform: translate(var(--start-x), var(--start-y)) rotate(var(--start-rotation));
                opacity: 1;
              }
              85% {
                opacity: 1;
              }
              100% {
                transform: translate(0px, 0px) rotate(0deg);
                opacity: 0;
              }
            }

            .particle {
              opacity: 0;
              transform-origin: center;
              transform: translate(var(--start-x), var(--start-y)) rotate(var(--start-rotation));
            }

            .particle.active {
              animation: convergeAndRotate ${particleSystem.getAnimationDuration()}s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
              animation-delay: var(--delay);
            }
          `}</style>
        </defs>

        {/* 원본 텍스트 (항상 보임) - 각 글자를 tspan으로 분리 */}
        <text ref={textRef} y="18" fontSize="16" fill="currentColor" style={{ fontFamily: "Inter, system-ui, sans-serif" }} opacity={isAnimating ? 0.3 : 1} className="transition-opacity duration-300">
          {particleSystem.text.split("").map((char, i) => (
            <tspan key={`original-${i}`} x={particleSystem.getCharX(i)}>
              {char}
            </tspan>
          ))}
        </text>

        {/* Particle 텍스트들 (각 글자당 1개) */}
        {particleSystem.text.split("").map((char, charIndex) => {
          // 브라우저 측정값이 있으면 사용, 없으면 계산값 사용
          const charX = charPositions.length > 0 ? (charPositions[charIndex] ?? particleSystem.getCharX(charIndex)) : particleSystem.getCharX(charIndex);

          const particle = particleSystem.getParticle(charIndex);
          if (!particle) return null;

          return (
            <text
              key={charIndex}
              x={charX}
              y={18}
              fontSize="16"
              fontWeight="500"
              fill={particle.color}
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                // @ts-expect-error - CSS custom properties
                "--start-x": `${particle.x}px`,
                "--start-y": `${particle.y}px`,
                "--start-rotation": `${particle.rotation}deg`,
                "--delay": `${particle.delay}s`,
              }}
              className={cn("particle", isAnimating && "active")}
            >
              {char}
            </text>
          );
        })}
      </svg>
    </Link>
  );
}
