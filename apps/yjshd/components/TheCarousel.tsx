"use client";

import { Children, isValidElement } from "react";
import type { CarouselApi } from "@workspace/ui/components/carousel";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@workspace/ui/components/carousel";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@workspace/ui/components/dialog";
import { cn } from "@workspace/ui/lib/utils";
import { useCallback, useEffect, useState } from "react";

export default function TheCarousel({ children, title = "", ...props }: { children: React.ReactNode; title?: string }) {
  const [startIndex, setStartIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);

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
                    className: cn(child.props.className, "cursor-pointer"),
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
    </>
  );
}
