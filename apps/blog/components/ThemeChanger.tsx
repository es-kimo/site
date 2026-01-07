import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export const ThemeChanger = () => {
  const { theme, setTheme } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="bg-background/20">
      <Sun
        className={cn(
          "h-5 w-5 rotate-0 transition-all dark:-rotate-90",
          "[transform:scale(var(--icon-scale,1))_rotate(0deg)_scale(1)] dark:[transform:scale(var(--icon-scale,1))_rotate(-90deg)_scale(0)]"
        )}
      />
      <Moon
        className={cn(
          "absolute h-5 w-5 rotate-90 transition-all dark:rotate-0",
          "[transform:scale(var(--icon-scale,1))_rotate(90deg)_scale(0)] dark:[transform:scale(var(--icon-scale,1))_rotate(0deg)_scale(1)]"
        )}
      />
      <span className="sr-only">화면 모드 토글</span>
    </Button>
  );
};
