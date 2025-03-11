import { getCategories } from "@workspace/common/structure/notes";
import { Button } from "@workspace/ui/components/button";
import { ModeToggle } from "@workspace/ui/components/mode-toggle";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@workspace/ui/components/sheet";
import { Menu } from "lucide-react";
import { Link } from "next-view-transitions";

const H1 = "연세정성내과의원";

export const TheHeader = async () => {
  const categories = (await getCategories()).map((category) => category.split(".").pop() || "");

  return (
    <header className="grid grid-cols-5 py-4 sticky top-0 z-10 bg-background">
      <h1>
        <NavigationButton href="/">{H1}</NavigationButton>
      </h1>
      <nav className="col-span-3 hidden sm:block">
        {categories.map((category) => (
          <NavigationButton key={category} href={`/${category}`}>
            {category}
          </NavigationButton>
        ))}
      </nav>

      <ul className="flex justify-end col-start-5">
        <li>
          <ModeToggle />
        </li>
        <li>
          <AllCategoriesSheetRight categories={categories} />
        </li>
      </ul>
    </header>
  );
};

export const NavigationButton = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <Button asChild variant="ghost" className="text-lg text-neutral-400 [&.active]:text-accent-foreground">
      <Link href={href}>{children}</Link>
    </Button>
  );
};

export const AllCategoriesSheetRight = ({ categories }: { categories: string[] }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="text-lg text-neutral-400 [&.active]:text-accent-foreground">
          <Menu />
          전체보기
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col gap-10">
        <SheetHeader>
          <SheetTitle>{H1}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2">
          <SheetClose asChild>
            <Button asChild variant="ghost" className="text-xl text-neutral-400 [&.active]:text-accent-foreground justify-start">
              <Link href="/">홈</Link>
            </Button>
          </SheetClose>
          {categories.map((category) => (
            <SheetClose asChild key={category}>
              <Button asChild variant="ghost" className="text-xl text-neutral-400 [&.active]:text-accent-foreground justify-start">
                <Link href={category}>{category}</Link>
              </Button>
            </SheetClose>
          ))}
        </nav>
        <SheetFooter>
          <SheetClose>{H1}</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
