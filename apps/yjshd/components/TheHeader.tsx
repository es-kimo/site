import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@workspace/ui/components/accordion";
import { getCategories, getSubCategoriesByCategory } from "@workspace/common/structure/notes";
import { Button } from "@workspace/ui/components/button";
import { ModeToggle } from "@workspace/ui/components/mode-toggle";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@workspace/ui/components/sheet";
import { Menu } from "lucide-react";
import { Link } from "next-view-transitions";
import { removeNumbering } from "@workspace/common/lib/file-system";

const H1 = "연세정성내과의원";

export const TheHeader = async () => {
  const categories = await getCategories();

  return (
    <header className="grid grid-cols-5 py-4 sticky top-0 z-10 bg-background">
      <h1>
        <NavigationButton href="/">{H1}</NavigationButton>
      </h1>
      <nav className="col-span-3 hidden sm:block">
        {categories.map((category) => (
          <NavigationButton key={category} href={`/${category}`}>
            {removeNumbering(category)}
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

export const AllCategoriesSheetRight = async ({ categories }: { categories: string[] }) => {
  const subs = await Promise.all(categories.map(async (category) => await getSubCategoriesByCategory(category)));
  const hasSubCategories = subs.map((sub) => !!sub.length);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="text-lg [&.active]:text-accent-foreground">
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
            <Button asChild variant="ghost" className="text-lg [&.active]:text-accent-foreground justify-start border-b py-3 box-content">
              <Link href="/">홈</Link>
            </Button>
          </SheetClose>
          <Accordion type="single" collapsible>
            {categories
              .filter((_, idx) => hasSubCategories[idx])
              .map((category, idx) => (
                <AccordionItem value={`item-${idx + 1}`} key={`item-${idx + 1}-${category}`}>
                  <AccordionTrigger>
                    <SheetClose asChild key={category}>
                      <Button asChild variant="ghost" className="text-lg [&.active]:text-accent-foreground justify-start">
                        <Link replace href={`/${category}`}>
                          {removeNumbering(category)}
                        </Link>
                      </Button>
                    </SheetClose>
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col">
                    {subs[idx]?.map((sub) => (
                      <SheetClose asChild key={sub}>
                        <Button asChild variant="ghost" className="text-neutral-400 text-lg [&.active]:text-accent-foreground justify-start">
                          <Link href={`/${category}/${sub}`}>{removeNumbering(sub)}</Link>
                        </Button>
                      </SheetClose>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
          {categories
            .filter((_, idx) => !hasSubCategories[idx])
            .map((category, idx) => (
              <SheetClose asChild key={`item-${idx + 1}-${category}`}>
                <Button asChild variant="ghost" className="text-lg [&.active]:text-accent-foreground justify-start  border-b py-3 box-content">
                  <Link href={`/${category}`}>{removeNumbering(category)}</Link>
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
