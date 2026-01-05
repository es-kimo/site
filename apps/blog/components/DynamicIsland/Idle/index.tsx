"use client";

import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@workspace/ui/components/navigation-menu";
import { cn } from "@workspace/ui/lib/utils";
import { Link } from "next-view-transitions";
import { useContext, useEffect } from "react";
import { Logo } from "../../Logo";
import { ThemeChanger } from "../../ThemeChanger";
import { DynamicIslandContext } from "../contexts/context";

export function IdleIsland() {
  const { setIslandWidth } = useContext(DynamicIslandContext);

  useEffect(() => {
    setIslandWidth(500);
  }, [setIslandWidth]);

  return (
    <div className={cn("w-full relative flex flex-row gap-2 justify-between transition-all duration-300 ease-in-out items-center max-h-[72px] overflow-visible rounded-full")}>
      <Logo />
      <div className="flex items-center gap-1">
        <ThemeChanger />
      </div>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle({ className: "bg-background/20" })}>
              <Link href="/writing">Writing</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
