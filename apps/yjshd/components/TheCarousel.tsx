"use client";

import { Children, isValidElement, useMemo } from "react";
import type { CarouselApi } from "@workspace/ui/components/carousel";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@workspace/ui/components/carousel";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@workspace/ui/components/dialog";
import { cn } from "@workspace/ui/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";

export default function TheCarousel({ children, title, ...props }: { children: React.ReactNode; title?: string }) {
  const [startIndex, setStartIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const childLength = useMemo(() => Children.count(children), [children]);
  const lightboxTitle = useMemo(() => {
    if (title) return title;
    const firstImage = Children.toArray(children).find((child) => isValidElement(child));
    if (isValidElement(firstImage) && firstImage.props.alt) return firstImage.props.alt;
    return "사진";
  }, [title, children]);

  const handleClick = useCallback(
    (index: number) => () => {
      setStartIndex(index);
      setOpen(true);
    },
    []
  );

  useEffect(() => {
    if (!api || !api.scrollSnapList || !api.selectedScrollSnap) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <>
      <Carousel className="w-4/6 sm:w-11/12 mx-auto" {...props}>
        <CarouselContent>
          {Children.map(children, (child, index) =>
            isValidElement(child) ? (
              <CarouselItem key={index}>
                {isValidElement(child) && {
                  ...child,
                  props: {
                    ...child.props,
                    className: cn(child.props.className, "cursor-zoom-in"),
                    onClick: handleClick(index),
                  },
                }}
              </CarouselItem>
            ) : null
          )}
        </CarouselContent>
        <CarouselPrevious className="w-12 h-12 border-primary" />
        <CarouselNext className="w-12 h-12 border-primary" />
      </Carousel>

      <Dialog open={open} onOpenChange={setOpen}>
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
                  <CarouselItem key={i}>
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
    </>
  );
}
