import { IconLogo } from "@/components/IconLogo";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@workspace/ui/components/navigation-menu";
import { cn } from "@workspace/ui/lib/utils";
import { Link } from "next-view-transitions";
import { ThemeChanger } from "../../ThemeChanger";
import { Logo } from "@/components/Logo";

export const HomeIsland = () => {
  return (
    <div
      className={cn(
        "w-[calc(100vw-32px)] md:w-[calc(var(--blog-max-w) - 32px)] px-2 relative flex flex-row gap-2 justify-between transition-all duration-300 ease-in-out items-center max-h-[72px] overflow-visible rounded-full",
      )}
      style={{ maxWidth: "min(calc(100vw - 12px), var(--blog-max-w))" }}
    >
      <div className="flex items-center">
        <IconLogo />
        <Logo />
      </div>
      <div className="flex items-center gap-1">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle({ className: "bg-background/20" })}>
                <Link href="/writing">Writing</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle({ className: "bg-background/20" })}>
                <Link href="/resume">Resume</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <ThemeChanger />
      </div>
    </div>
  );
};
