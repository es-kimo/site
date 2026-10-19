import { IconLogo } from "@/components/IconLogo";
import { ThemeChanger } from "@/components/ThemeChanger";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { DEFAULT_SIZE_INDEX, FONT_SIZES } from "./constants";
import { applyArticleFontSize, readSavedSizeIndex, saveSizeIndex } from "./font-size";

export const ReaderIsland = () => {
  const [sizeIndex, setSizeIndex] = useState(DEFAULT_SIZE_INDEX);

  useEffect(() => {
    applyArticleFontSize(sizeIndex);
    saveSizeIndex(sizeIndex);
  }, [sizeIndex]);

  useEffect(() => {
    const saved = readSavedSizeIndex();
    if (saved !== null) setSizeIndex(saved);
  }, []);

  const decreaseSize = () => {
    setSizeIndex((prev) => Math.max(0, prev - 1));
  };

  const increaseSize = () => {
    setSizeIndex((prev) => Math.min(FONT_SIZES.length - 1, prev + 1));
  };

  return (
    <div className="flex items-center gap-1.5 px-1.5 py-1" aria-label="Font size control">
      <IconLogo showBackHint />

      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-transparent hover:text-foreground" onClick={decreaseSize} disabled={sizeIndex === 0} aria-label="Decrease font size">
        <Minus strokeWidth={2.5} />
      </Button>

      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground text-xs select-none" aria-hidden="true">
          A
        </span>

        {/* Size indicator dots */}
        <div className="flex gap-1" role="status" aria-live="polite" aria-label={`Font size: ${FONT_SIZES[sizeIndex]?.label}`}>
          {FONT_SIZES.map((_, index) => (
            <div key={index} className={cn("w-1 h-1 rounded-full transition-all duration-300", index === sizeIndex ? "bg-foreground w-4" : "bg-foreground/25")} />
          ))}
        </div>

        <span className="text-muted-foreground text-base select-none" aria-hidden="true">
          A
        </span>
      </div>

      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-transparent hover:text-foreground" onClick={increaseSize} disabled={sizeIndex === FONT_SIZES.length - 1} aria-label="Increase font size">
        <Plus strokeWidth={2.5} />
      </Button>

      <ThemeChanger />
    </div>
  );
};
