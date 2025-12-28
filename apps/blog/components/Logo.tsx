"use client";

import { ParticleSystem } from "@/lib/particles/system";
import { cn } from "@workspace/ui/lib/utils";
import { Link } from "next-view-transitions";
import { useEffect, useRef, useState } from "react";

const particleSystem = new ParticleSystem("khryu.dev");

export function Logo({ className }: { className?: string }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isGradientAnimating, setIsGradientAnimating] = useState(false);
  const [charPositions, setCharPositions] = useState<number[]>([]);
  const textRef = useRef<SVGTextElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

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

  // 파티클 애니메이션 완료 감지
  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement || !isAnimating) return;

    let completedCount = 0;
    const totalParticles = particleSystem.text.length;

    const handleAnimationEnd = (e: AnimationEvent) => {
      if (e.animationName === "convergeAndRotate") {
        completedCount++;
        if (completedCount === totalParticles) {
          setIsAnimating(false);
          // 파티클 애니메이션이 끝나면 그라데이션 애니메이션 시작
          setIsGradientAnimating(true);
        }
      } else if (e.animationName === "gradientFill") {
        // 그라데이션 애니메이션이 끝나면 상태 리셋
        setIsGradientAnimating(false);
      }
    };

    svgElement.addEventListener("animationend", handleAnimationEnd);

    return () => {
      svgElement.removeEventListener("animationend", handleAnimationEnd);
    };
  }, [isAnimating]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    requestAnimationFrame(() => {
      setIsAnimating(true);
    });
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
      <svg ref={svgRef} width="72" height="24" viewBox="0 0 72 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="block overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6ee7ff" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#fca5a5" />
          </linearGradient>

          <style>{`
            @keyframes convergeAndRotate {
              0% {
                transform: translate(var(--start-x), var(--start-y)) rotate(var(--start-rotation));
                opacity: 1;
              }
           
              75% {
                transform: translate(0px, 0px) rotate(0deg);
                opacity: 0.9;
              }

              100% {
                transform: translate(0px, 0px) rotate(0deg);
                opacity: 0;
              }
            }

            @keyframes gradientFill {
              0% {
                clip-path: inset(0 100% 0 0);
              }
              50% {
                clip-path: inset(0 0 0 0);
              }
              100% {
                clip-path: inset(0 0 0 100%);
              }
            }

            .particle {
              opacity: 0;
              transform-origin: center;
              transform: translate(var(--start-x), var(--start-y)) rotate(var(--start-rotation));
            }

            .particle.active {
              animation: convergeAndRotate ${particleSystem.getAnimationDuration()}s ease forwards;
            }

            .gradient-text {
              clip-path: inset(0 100% 0 0);
            }

            .gradient-text.active {
              animation: gradientFill .3s ease-in-out forwards;
            }
          `}</style>
        </defs>

        {/* 원본 텍스트 (currentColor, 항상 보임) */}
        <text ref={textRef} y="18" fontSize="16" fill="currentColor" fontWeight="500" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
          {particleSystem.text.split("").map((char, i) => {
            const charX = charPositions.length > 0 ? (charPositions[i] ?? particleSystem.getCharX(i)) : particleSystem.getCharX(i);
            return (
              <tspan key={`original-${i}`} x={charX}>
                {char}
              </tspan>
            );
          })}
        </text>

        {/* 그라데이션 텍스트 (위에 겹침) */}
        <text y="18" fontSize="16" fill="url(#textGradient)" fontWeight="500" style={{ fontFamily: "Inter, system-ui, sans-serif" }} className={cn("gradient-text", isGradientAnimating && "active")}>
          {particleSystem.text.split("").map((char, i) => {
            const charX = charPositions.length > 0 ? (charPositions[i] ?? particleSystem.getCharX(i)) : particleSystem.getCharX(i);
            return (
              <tspan key={`gradient-${i}`} x={charX}>
                {char}
              </tspan>
            );
          })}
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
              letterSpacing="0.02em"
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
