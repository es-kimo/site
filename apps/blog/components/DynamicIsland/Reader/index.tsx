import { IconLogo } from "@/components/IconLogo";
import { ThemeChanger } from "@/components/ThemeChanger";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { DEFAULT_SIZE_INDEX, FONT_SIZES } from "./constants";

export const ReaderIsland = () => {
  const [sizeIndex, setSizeIndex] = useState(DEFAULT_SIZE_INDEX);

  useEffect(() => {
    // Apply font size to article content
    const currentSize = FONT_SIZES[sizeIndex];
    document.documentElement.style.setProperty("--article-font-size", `${currentSize?.value}px`);
    document.documentElement.style.setProperty("--article-scale", `${currentSize?.scale}`);
    document.documentElement.style.setProperty("--article-line-height", `${currentSize?.lineHeight}`);

    // Save preference
    localStorage.setItem("reader-font-size", sizeIndex.toString());
  }, [sizeIndex]);

  useEffect(() => {
    // Load saved preference
    const saved = localStorage.getItem("reader-font-size");
    if (saved !== null) {
      const index = Number.parseInt(saved, 10);
      if (index >= 0 && index < FONT_SIZES.length) {
        setSizeIndex(index);
      }
    }
  }, []);

  const decreaseSize = () => {
    setSizeIndex((prev) => Math.max(0, prev - 1));
  };

  const increaseSize = () => {
    setSizeIndex((prev) => Math.min(FONT_SIZES.length - 1, prev + 1));
  };

  return (
    <div className="w-full mx-auto bg-background/20 backdrop-blur-xl rounded-md px-2 py-1 flex items-center gap-3" aria-label="Font size control">
      <IconLogo />

      <Button variant="ghost" size="icon" onClick={decreaseSize} disabled={sizeIndex === 0} aria-label="Decrease font size">
        <Minus strokeWidth={2.5} />
      </Button>

      <div className="flex items-center gap-1.5 px-1">
        <span className="text-foreground/90 text-sm font-medium select-none" aria-hidden="true">
          A
        </span>

        {/* Size indicator dots */}
        <div className="flex gap-1" role="status" aria-live="polite" aria-label={`Font size: ${FONT_SIZES[sizeIndex]?.label}`}>
          {FONT_SIZES.map((_, index) => (
            <div key={index} className={cn("w-1 h-1 rounded-full transition-all duration-300", index === sizeIndex ? "bg-foreground w-4" : "bg-foreground/30")} />
          ))}
        </div>

        <span className="text-foreground/90 text-lg font-medium select-none" aria-hidden="true">
          A
        </span>
      </div>

      <Button variant="ghost" size="icon" onClick={increaseSize} disabled={sizeIndex === FONT_SIZES.length - 1} aria-label="Increase font size">
        <Plus strokeWidth={2.5} />
      </Button>

      <ThemeChanger />
    </div>
  );
};
