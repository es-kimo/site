"use client";

import { type Language } from "@/lib/language";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@workspace/ui/components/navigation-menu";
import { cn } from "@workspace/ui/lib/utils";
import { Link } from "next-view-transitions";
import { LanguageToggle } from "../LanguageToggle";
import { Logo } from "../Logo";
import { ThemeChanger } from "../ThemeChanger";

interface IdleIslandProps {
  language: Language;
  showLogo?: boolean;
}

export function IdleIsland({ language, showLogo = true }: IdleIslandProps) {
  return (
    <div className={cn("w-[calc(100vw-12px)] relative flex flex-row gap-2 justify-between py-1 px-2 transition-all duration-300 ease-in-out items-center max-h-[72px] overflow-visible rounded-full")}>
      {showLogo && <Logo />}
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
