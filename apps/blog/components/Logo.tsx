"use client";

import { ParticleSystem } from "@/lib/particles/system";
import { NavigationMenu, NavigationMenuLink, navigationMenuTriggerStyle } from "@workspace/ui/components/navigation-menu";
import { cn } from "@workspace/ui/lib/utils";
import { Link } from "next-view-transitions";
import { useEffect, useRef, useState } from "react";

const particleSystem = new ParticleSystem("khryu.dev");

export function Logo() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [gradientKey, setGradientKey] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

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
          setGradientKey((prev) => prev + 1);
        }
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
    <NavigationMenu>
      <NavigationMenuLink asChild className={navigationMenuTriggerStyle({ className: "bg-background/20" })}>
        <Link href="/writing" aria-label="khryu.dev (Writing으로 이동)" draggable={false} onClick={handleClick}>
          <svg ref={svgRef} width="72" height="24" viewBox="0 0 72 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="block overflow-visible" aria-hidden="true">
            <defs>
              <linearGradient id="textGradient" x1="120%" y1="0%" x2="-20%" y2="0%">
                <stop offset="0%" stopColor="#89CFF0" />
                <stop offset="33%" stopColor="#B4A7D6" />
                <stop offset="66%" stopColor="#E4B1AB" />
                <stop offset="100%" stopColor="#D4C5A9" />
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
                    opacity: 0.2;
                  }
                }
    
                @keyframes gradientFill {
                  0% {
                    clip-path: inset(0 0 0 100%);
                  }
                  50% {
                    clip-path: inset(0 0 0 0);
                  }
                  100% {
                    clip-path: inset(0 100% 0 0);
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
    
                .gradient-text.active {
                  animation: gradientFill .4s ease-in-out forwards;
                }
              `}</style>
            </defs>

            {/* 원본 텍스트 (currentColor, 항상 보임) */}
            <text y="18" fontSize="16" fill="currentColor" fontWeight="500" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
              {particleSystem.text.split("").map((char, i) => (
                <tspan key={`original-${i}`} x={particleSystem.getCharX(i)}>
                  {char}
                </tspan>
              ))}
            </text>

            {/* 그라데이션 텍스트 (위에 겹침) */}
            {gradientKey > 0 && (
              <text key={gradientKey} y="18" fontSize="16" fill="url(#textGradient)" fontWeight="500" style={{ fontFamily: "Inter, system-ui, sans-serif" }} className="gradient-text active">
                {particleSystem.text.split("").map((char, i) => (
                  <tspan key={`gradient-${i}`} x={particleSystem.getCharX(i)}>
                    {char}
                  </tspan>
                ))}
              </text>
            )}

            {/* Particle 텍스트들 (각 글자당 1개) */}
            {particleSystem.text.split("").map((char, charIndex) => {
              const particle = particleSystem.getParticle(charIndex);
              if (!particle) return null;

              return (
                <text
                  key={charIndex}
                  x={particleSystem.getCharX(charIndex)}
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
      </NavigationMenuLink>
    </NavigationMenu>
  );
}
