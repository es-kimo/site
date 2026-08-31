import { IconLogo } from "@/components/IconLogo";
import { ThemeChanger } from "@/components/ThemeChanger";
import { IslandLink } from "../IslandLink";

export const HomeIsland = () => {
  return (
    <div className="w-[calc(100vw-16px)] max-w-blog flex items-center justify-between gap-2 px-1.5 py-1">
      <IconLogo />
      <nav className="flex items-center gap-0.5">
        <IslandLink href="/writing">Writing</IslandLink>
        <IslandLink href="/resume">Resume</IslandLink>
        <ThemeChanger />
      </nav>
    </div>
  );
};
