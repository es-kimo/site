import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export const ThemeChanger = () => {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-8 w-8 text-muted-foreground hover:bg-transparent hover:text-foreground"
    >
      <Sun className={cn("rotate-0 transition-all dark:-rotate-90", "[transform:rotate(0deg)_scale(1)] dark:[transform:rotate(-90deg)_scale(0)]")} />
      <Moon className={cn("absolute rotate-90 transition-all dark:rotate-0", "[transform:rotate(90deg)_scale(0)] dark:[transform:rotate(0deg)_scale(1)]")} />
      <span className="sr-only">화면 모드 토글</span>
    </Button>
  );
};
