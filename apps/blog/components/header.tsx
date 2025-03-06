import { Button } from "@workspace/ui/components/button";
import { ModeToggle } from "@workspace/ui/components/mode-toggle";
import { Github } from "lucide-react";
import { Link } from "next-view-transitions";

export const Header = () => {
  return (
    <header className="grid grid-cols-5 py-4 sticky top-0 z-[100] bg-background">
      <h1>
        <NavigationButton href="/">블로그</NavigationButton>
      </h1>
      <ul className="col-start-5 flex justify-end">
        {/* <li>
          <NavigationButton href="/about">소개</NavigationButton>
        </li> */}
        <li>
          <ModeToggle />
        </li>
        <li>
          <Button variant="ghost" size="icon" asChild>
            <Link href="https://github.com/es-kimo" target="_blank">
              <Github className="h-[1.2rem] w-[1.2rem]" />
            </Link>
          </Button>
          {/* TODO: 버튼에 알맞은 이름 부여 */}
          <span className="sr-only">Github 연결</span>
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
