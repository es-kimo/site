"use client";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@workspace/ui/components/carousel";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";
import { cn } from "@workspace/ui/lib/utils";
import { X } from "lucide-react";
import { Children, isValidElement, useCallback, useEffect, useMemo, useState } from "react";

const gridCn = ["", "", "sm:grid-cols-2", "grid-cols-2 md:grid-cols-3", "grid-cols-3 md:grid-cols-4"];

export default function ImageLightbox({ children, grid, preserveSize, title }: { children: React.ReactNode; grid?: number; preserveSize?: boolean; title?: string }) {
  const gridCols = grid ? gridCn[Math.min(4, grid)] : "grid-cols-2";
  const [startIndex, setStartIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const childLength = useMemo(() => Children.count(children), [children]);
  const lightboxTitle = useMemo(() => {
    if (title) return title;
    const firstImage = Children.toArray(children).find((child) => isValidElement(child));
    if (isValidElement(firstImage) && firstImage.props.alt) return firstImage.props.alt;
    return "사진";
  }, [title, children]);

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
                    className: cn(child.props.className, !preserveSize && "aspect-square object-cover", "cursor-zoom-in", grid && grid > 1 && "m-1 sm:m-4"),
                    onClick: handleClick(i),
                  },
                }}
              </div>
            );
          })}
        </div>
      </DialogTrigger>
      <DialogContent className="bg-transparent p-0 m-0 border-none shadow-none max-w-2xl" closeButton={false}>
        <DialogTitle className="text-white text-base flex items-center justify-center">
          {lightboxTitle}
          <DialogClose className="absolute right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-8 w-8" color="white" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogTitle>

        <Carousel
          opts={{
            startIndex,
          }}
          setApi={setApi}
          className="bg-transparent border-none"
        >
          <CarouselContent>
            {Children.map(children, (child, i) =>
              isValidElement(child) ? (
                <CarouselItem key={i} className="flex">
                  {isValidElement(child) && {
                    ...child,
                    props: {
                      ...child.props,
                      className: "w-full max-h-[calc(100dvh-300px)] md:max-h-[calc(100dvh-240px)] object-contain",
                    },
                  }}
                </CarouselItem>
              ) : null
            )}
          </CarouselContent>
          {childLength > 1 && (
            <>
              <CarouselPrevious className="top-[initial] -bottom-16 left-1/4" />
              <CarouselNext className="top-[initial] -bottom-16 right-1/4" />
            </>
          )}
        </Carousel>

        {childLength > 1 && (
          <DialogDescription className="text-white text-base text-center">
            {current} / {count}
          </DialogDescription>
        )}
      </DialogContent>
    </Dialog>
  );
}
