import { IconLogo } from "@/components/IconLogo";
import { ThemeChanger } from "@/components/ThemeChanger";
import { Button } from "@workspace/ui/components/button";
import { Download } from "lucide-react";

export function ResumeIsland() {
  return (
    <div className="flex items-center justify-between gap-2 px-1.5 py-1">
      <IconLogo showBackHint />
      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-transparent hover:text-foreground" asChild>
          <a href="/resume.pdf" download aria-label="PDF 다운로드">
            <Download />
          </a>
        </Button>
        <ThemeChanger />
      </div>
    </div>
  );
}
