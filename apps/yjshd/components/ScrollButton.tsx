"use client";

import { Button } from "@workspace/ui/components/button";
import { ArrowRight } from "lucide-react";

interface ScrollButtonProps {
  targetId: string;
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export function ScrollButton({ targetId, children, variant = "outline", className }: ScrollButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Button size="lg" variant={variant} className={className} asChild>
      <a href={`#${targetId}`} onClick={handleClick}>
        {children}
        <ArrowRight className="ml-2 w-4 h-4" />
      </a>
    </Button>
  );
}
