"use client";

import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavigationLink({ href, count, children }: { href: string; count: number; children: React.ReactNode }) {
  const isActive = decodeURIComponent(usePathname()) === href;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex items-baseline gap-1.5 text-sm transition-colors",
        isActive ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
      <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
    </Link>
  );
}
