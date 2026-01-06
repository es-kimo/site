import { Logo } from "@/components/Logo";
import { type Language } from "@/lib/language";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@workspace/ui/components/navigation-menu";
import { cn } from "@workspace/ui/lib/utils";
import { Link } from "next-view-transitions";
import { LanguageToggle } from "../../LanguageToggle";
import { ThemeChanger } from "../../ThemeChanger";

export const HomeIsland = ({ language }: { language: Language }) => {
  return (
    <div
      className={cn(
        "w-[calc(100vw-48px)] sm:w-[calc(100vw-128px)] relative flex flex-row gap-2 justify-between transition-all duration-300 ease-in-out items-center max-h-[72px] overflow-visible rounded-full"
      )}
    >
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
};
