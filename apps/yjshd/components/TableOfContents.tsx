"use client";

import type { Heading } from "@/lib/content";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

export const TableOfContents = ({ headings }: { headings: Heading[] }) => {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          setActiveId(visible[0]?.target.id ?? null);
        }
      },
      {
        rootMargin: "0px 0px -40% 0px",
        threshold: 0.1,
      }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  return (
    <div className="w-full max-w-xs">
      <h2 className="sr-only">목차</h2>
      <ScrollArea className="h-fit">
        <ul className="space-y-2 border-l-2 border-slate-200">
          {headings.map((heading, idx) => (
            <li
              key={`${idx}-${heading.id}`}
              className={cn(
                "px-4 text-sm transition-colors -translate-x-[2px]",
                activeId === heading.id ? "text-blue-600 font-medium border-l-2 border-blue-600" : "text-muted-foreground",
                heading.depth === 2 && "pl-4",
                heading.depth === 3 && "pl-8",
                heading.depth >= 4 && "pl-12"
              )}
            >
              <Link href={`#${heading.id}`} className="break-keep">
                {heading.value}
              </Link>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
};
