"use client";

import { type Language } from "@/lib/language";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@workspace/ui/components/navigation-menu";
import { cn } from "@workspace/ui/lib/utils";
import { Link } from "next-view-transitions";
import { useContext, useEffect } from "react";
import { LanguageToggle } from "../../LanguageToggle";
import { Logo } from "../../Logo";
import { ThemeChanger } from "../../ThemeChanger";
import { DynamicIslandContext } from "../contexts/context";

interface IdleIslandProps {
  language: Language;
}

export function IdleIsland({ language }: IdleIslandProps) {
  const { setIslandWidth } = useContext(DynamicIslandContext);

  useEffect(() => {
    setIslandWidth(500);
  }, [setIslandWidth]);

  return (
    <div className={cn("w-full relative flex flex-row gap-2 justify-between transition-all duration-300 ease-in-out items-center max-h-[72px] overflow-visible rounded-full")}>
      <Logo />
      <div className="flex items-center gap-1">
        <LanguageToggle currentLanguage={language} />
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
