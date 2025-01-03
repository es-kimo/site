import { Button } from "@workspace/ui/components/button";
import { ModeToggle } from "@workspace/ui/components/mode-toggle";
import { SearchIcon } from "lucide-react";
import Link from "next/link";

export const Header = () => {
  return (
    <header className="grid grid-cols-5 py-4 sticky top-0 z-[100] bg-background">
      <h1>
        <NavigationButton href="/">블로그</NavigationButton>
      </h1>
      <nav className="col-span-3">
        <NavigationButton href="/fe">프론트엔드</NavigationButton>
        <NavigationButton href="/be">백엔드</NavigationButton>
        <NavigationButton href="/algo">알고리즘</NavigationButton>
        <NavigationButton href="/cs">컴퓨터과학</NavigationButton>
      </nav>

      <ul className="flex justify-end">
        <li>
          <NavigationButton href="/about">소개</NavigationButton>
        </li>
        <li>
          <ModeToggle />
        </li>
        <li>
          <Button variant="ghost" size="icon">
            <SearchIcon className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        </li>
      </ul>
    </header>
  );
};

export const NavigationButton = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <Button asChild variant="ghost" className="text-base text-neutral-400 [&.active]:text-accent-foreground">
      <Link href={href}>{children}</Link>
    </Button>
  );
};
