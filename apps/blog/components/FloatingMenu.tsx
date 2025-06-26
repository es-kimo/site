"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { ChevronUp, Home, Search, Menu, X, BookOpen, Calendar, User } from "lucide-react";

interface FloatingMenuProps {
  className?: string;
  showScrollToTop?: boolean;
  showSearch?: boolean;
  showMenu?: boolean;
  onSearchClick?: () => void;
  onMenuClick?: () => void;
  onHomeClick?: () => void;
}

export function FloatingMenu({ className, showScrollToTop = true, showSearch = true, showMenu = true, onSearchClick, onMenuClick, onHomeClick }: FloatingMenuProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const lastScrollYRef = React.useRef(0);
  const hasScrollRef = React.useRef(false);

  React.useEffect(() => {
    const checkScrollAvailability = () => {
      const viewportHeight = window.innerHeight;
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );

      const hasScrollContent = documentHeight > viewportHeight;
      const hasOverflow = document.documentElement.scrollHeight > document.documentElement.clientHeight;
      const bodyHasOverflow = document.body.scrollHeight > document.body.clientHeight;

      const canScroll = hasScrollContent || hasOverflow || bodyHasOverflow;

      hasScrollRef.current = canScroll;

      if (!canScroll) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const handleScroll = () => {
      console.log("handleScroll");
      if (!hasScrollRef.current) return;

      const currentScrollY = window.pageYOffset;

      const isScrollingUp = currentScrollY < lastScrollYRef.current;
      const isScrollingDown = currentScrollY > lastScrollYRef.current;

      if (currentScrollY > 100 && isScrollingUp) {
        setIsVisible(true);
      }

      if (isScrollingDown || currentScrollY <= 100) {
        setIsVisible(false);
        setIsMenuOpen(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    const resizeObserver = new ResizeObserver(() => {
      console.log("resizeObserver");
      checkScrollAvailability();
    });

    resizeObserver.observe(document.body);
    resizeObserver.observe(document.documentElement);

    checkScrollAvailability();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
    onMenuClick?.();
  };

  return (
    <div className={cn("fixed bottom-6 right-6 z-50 flex flex-col gap-2", className)}>
      <div className={cn("flex flex-col gap-2 transition-all duration-300 ease-in-out", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none")}>
        {showScrollToTop && (
          <Button
            size="icon"
            variant="secondary"
            onClick={scrollToTop}
            className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background/90"
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
        )}

        {showSearch && (
          <Button
            size="icon"
            variant="secondary"
            onClick={onSearchClick}
            className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background/90"
          >
            <Search className="h-5 w-5" />
          </Button>
        )}

        {showMenu && (
          <Button
            size="icon"
            variant="secondary"
            onClick={handleMenuClick}
            className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background/90"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        )}
      </div>

      <div className={cn("flex flex-col gap-2 transition-all duration-300 ease-in-out", isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none")}>
        <Button
          size="icon"
          variant="secondary"
          onClick={onHomeClick}
          className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background/90"
        >
          <Home className="h-5 w-5" />
        </Button>

        <Button
          size="icon"
          variant="secondary"
          className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background/90"
        >
          <BookOpen className="h-5 w-5" />
        </Button>

        <Button
          size="icon"
          variant="secondary"
          className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background/90"
        >
          <Calendar className="h-5 w-5" />
        </Button>

        <Button
          size="icon"
          variant="secondary"
          className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background/90"
        >
          <User className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
