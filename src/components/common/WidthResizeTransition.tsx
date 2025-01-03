import { debounce } from "@/lib/debounce";
import { ReactNode, useEffect, useRef } from "react";

export const MAX_BLOG_WIDTH = 1142;
export const WidthResizeTransition = ({
  children,
}: {
  children: ReactNode;
}) => {
  const targetElement = useRef<HTMLDivElement>(null);

  window.addEventListener(
    "resize",
    debounce(() => {
      if (targetElement.current) {
        targetElement.current.style.width = `${Math.min(window.innerWidth, MAX_BLOG_WIDTH)}px`;
      }
    }, 800),
  );
  useEffect(() => {
    if (targetElement.current) {
      targetElement.current.style.width = `${Math.min(window.innerWidth, MAX_BLOG_WIDTH)}px`;
    }
  }, []);
  return (
    <div ref={targetElement} className="transition-[width] duration-500">
      {children}
    </div>
  );
};
