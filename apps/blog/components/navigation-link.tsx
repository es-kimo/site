"use client";

import { NavigationMenuLink, navigationMenuTriggerStyle } from "@workspace/ui/components/navigation-menu";
import { cn } from "@workspace/ui/lib/utils";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export const restyledNavigationMenuTriggerStyle = () => cn(navigationMenuTriggerStyle(), "text-base text-neutral-400 hover:bg-inherit transition-colors duration-300 rounded-[initial] px-2");

export function NavigationLink({ href, children, inclusiveActiveState }: { href: string; children: React.ReactNode; inclusiveActiveState?: boolean }) {
  const pathname = usePathname();
  const decodedPathname = decodeURIComponent(pathname);
  const isActive = useMemo(() => {
    if (inclusiveActiveState) {
      return decodedPathname.startsWith(href);
    }
    return href === decodedPathname;
  }, [href, decodedPathname, inclusiveActiveState]);
  const router = useTransitionRouter();

  return (
    <NavigationMenuLink
      onClick={(e) => {
        e.preventDefault();
        router.push(href);
      }}
      href={href}
      className={cn(restyledNavigationMenuTriggerStyle(), isActive && "border-b-2 border-accent-foreground text-accent-foreground")}
    >
      {children}
    </NavigationMenuLink>
  );
}
