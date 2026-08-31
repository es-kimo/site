import { IconLogo } from "@/components/IconLogo";
import { ThemeChanger } from "@/components/ThemeChanger";

export function IdleIsland() {
  return (
    <div className="flex items-center justify-between gap-2 px-1.5 py-1">
      <IconLogo showBackHint />
      <ThemeChanger />
    </div>
  );
}
