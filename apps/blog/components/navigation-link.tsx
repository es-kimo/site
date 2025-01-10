"use client";

import { NavigationMenuLink, navigationMenuTriggerStyle } from "@workspace/ui/components/navigation-menu";
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export const restyledNavigationMenuTriggerStyle = () => cn(navigationMenuTriggerStyle(), "text-base text-neutral-400 hover:bg-inherit transition-colors duration-300 rounded-[initial] px-2");

export function NavigationLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = useMemo(() => href === pathname, [href, pathname]);

  return (
    <Link href={href} legacyBehavior passHref>
      <NavigationMenuLink className={cn(restyledNavigationMenuTriggerStyle(), isActive && "border-b-2 border-accent-foreground text-accent-foreground")}>{children}</NavigationMenuLink>
    </Link>
  );
}
