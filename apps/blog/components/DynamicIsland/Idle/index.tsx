"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Logo } from "../../Logo";
import { ThemeChanger } from "../../ThemeChanger";

export function IdleIsland() {
  return (
    <div className={cn("w-full relative flex flex-row gap-2 justify-between transition-all duration-300 ease-in-out items-center max-h-[72px] overflow-visible rounded-full")}>
      <Logo />
      <div className="flex items-center gap-1">
        <ThemeChanger />
      </div>
    </div>
  );
}
