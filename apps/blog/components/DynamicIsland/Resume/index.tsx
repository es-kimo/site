import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Download } from "lucide-react";
import { Logo } from "../../Logo";
import { ThemeChanger } from "../../ThemeChanger";

export function ResumeIsland() {
  return (
    <div className={cn("w-full relative flex flex-row gap-2 justify-between transition-all duration-300 ease-in-out items-center max-h-[72px] overflow-visible rounded-full")}>
      <Logo />
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" asChild>
          <a href="/resume.pdf" download aria-label="PDF 다운로드">
            <Download className="h-[1.2rem] w-[1.2rem]" />
          </a>
        </Button>
        <ThemeChanger />
      </div>
    </div>
  );
}
