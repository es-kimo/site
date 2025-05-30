"use client";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@workspace/ui/components/carousel";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";
import { cn } from "@workspace/ui/lib/utils";
import { Children, isValidElement, useCallback, useEffect, useState } from "react";

const gridCn = ["", "", "sm:grid-cols-2", "grid-cols-2 md:grid-cols-3", "sm:grid-cols-4"];

export default function ImageLightbox({ children, grid, preserveSize, title = "" }: { children: React.ReactNode; grid?: number; preserveSize?: boolean; title?: string }) {
  const gridCols = grid ? gridCn[Math.min(4, grid)] : "sm:grid-cols-2";
  const [startIndex, setStartIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const handleClick = useCallback((index: number) => () => setStartIndex(index), []);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className={cn(`grid ${gridCols}`)}>
          {Children.map(children, (child, i) => {
            if (!isValidElement(child)) return null;
            return (
              <div key={i}>
                {isValidElement(child) && {
                  ...child,
                  props: {
                    ...child.props,
                    className: cn(child.props.className, !preserveSize && "aspect-square object-cover", "cursor-pointer"),
                    onClick: handleClick(i),
                  },
                }}
              </div>
            );
          })}
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>

        <Carousel
          opts={{
            startIndex,
          }}
          setApi={setApi}
        >
          <CarouselContent>{Children.map(children, (child, i) => (isValidElement(child) ? <CarouselItem key={i}>{child}</CarouselItem> : null))}</CarouselContent>
          <CarouselPrevious className="w-12 h-12 border-primary" />
          <CarouselNext className="w-12 h-12 border-primary" />
        </Carousel>

        <DialogDescription>
          {current} / {count}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
