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
  const [lastScrollY, setLastScrollY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.pageYOffset;

      // 스크롤 방향 감지
      const isScrollingUp = currentScrollY < lastScrollY;
      const isScrollingDown = currentScrollY > lastScrollY;

      // 스크롤 위치가 100px 이상이고 위로 스크롤할 때 메뉴 표시
      if (currentScrollY > 100 && isScrollingUp) {
        setIsVisible(true);
      }

      // 아래로 스크롤하거나 맨 위에 가까우면 메뉴 숨김
      if (isScrollingDown || currentScrollY <= 100) {
        setIsVisible(false);
        setIsMenuOpen(false); // 메뉴가 열려있으면 닫기
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

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
      {/* Main floating menu */}
      <div className={cn("flex flex-col gap-2 transition-all duration-300 ease-in-out", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none")}>
        {/* Scroll to top button */}
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

        {/* Search button */}
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

        {/* Menu button */}
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

      {/* Expanded menu items */}
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
