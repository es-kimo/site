import { removeNumbering } from "@workspace/common/lib/file-system";
import { getCategories, getSubCategoriesByCategory } from "@workspace/common/structure/notes";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@workspace/ui/components/accordion";
import { Button } from "@workspace/ui/components/button";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@workspace/ui/components/sheet";
import { Menu } from "lucide-react";
import { Link } from "next-view-transitions";
import Image from "next/image";
import { HTMLAttributes } from "react";

const H1 = "연세정성내과의원";

export const TheHeader = async () => {
  const categories = await getCategories();

  return (
    <header className="max-w-full flex justify-between py-4 sticky top-0 z-10 bg-background">
      <div className="flex lg:gap-8">
        <h1 className="flex-shrink-0">
          <NavigationButton href="/">
            <Image alt={H1} src="/logo.jpeg" width={24} height={24} />
            <span className="sm:hidden lg:inline">{H1}</span>
          </NavigationButton>
        </h1>

        <nav className="hidden sm:flex flex-nowrap overflow-x-auto">
          {categories.map((category) => (
            <NavigationButton key={category} href={`/${category}`}>
              {removeNumbering(category)}
            </NavigationButton>
          ))}
        </nav>
      </div>

      <ul className="flex justify-end">
        <li>
          <AllCategoriesSheetRight categories={categories} />
        </li>
      </ul>
    </header>
  );
};

export const NavigationButton = ({ href, children, ...rest }: { href: string } & HTMLAttributes<HTMLButtonElement>) => {
  return (
    <Button asChild variant="ghost" className="text-base [&.active]:text-accent-foreground" {...rest}>
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
        <Button variant="ghost" className="text-base [&.active]:text-accent-foreground">
          <Menu />
          메뉴보기
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col gap-10">
        <SheetHeader>
          <SheetTitle>{H1}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2">
          <SheetClose asChild>
            <Button asChild variant="ghost" className="text-base [&.active]:text-accent-foreground justify-start border-b py-3 box-content">
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
                      <Button asChild variant="ghost" className="text-base [&.active]:text-accent-foreground justify-start">
                        <Link replace href={`/${category}`}>
                          {removeNumbering(category)}
                        </Link>
                      </Button>
                    </SheetClose>
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col">
                    {subs[idx]?.map((sub) => (
                      <SheetClose asChild key={sub}>
                        <Button asChild variant="ghost" className="text-neutral-400 text-base [&.active]:text-accent-foreground justify-start">
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
                <Button asChild variant="ghost" className="text-base [&.active]:text-accent-foreground justify-start  border-b py-3 box-content">
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
