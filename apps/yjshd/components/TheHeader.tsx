import { removeNumbering } from "@workspace/common/lib/string-utils";
import { categories, subCategoriesMap } from "@workspace/common/structure/structure";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@workspace/ui/components/accordion";
import { Button } from "@workspace/ui/components/button";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@workspace/ui/components/sheet";
import { Menu } from "lucide-react";
import { Link } from "next-view-transitions";
import Image from "next/image";
import { HTMLAttributes } from "react";

const PAGE_TITLE = "연세정성내과의원";

export const TheHeader = async () => {
  return (
    <header className="max-w-full flex justify-between py-4 sticky top-0 z-10 bg-background">
      <div className="flex lg:gap-8">
        <h1 className="flex-shrink-0">
          <NavigationButton href="/">
            <Image alt={PAGE_TITLE} src="/logo.jpeg" width={24} height={24} />
            <span className="sm:hidden lg:inline">{PAGE_TITLE}</span>
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
          <AllCategoriesSheetRight />
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

export const AllCategoriesSheetRight = async () => {
  const categoriesWithSubCategories = categories.map((category) => {
    const subCategories = subCategoriesMap.get(category) ?? [];
    const hasSubCategory = !!subCategories.length;
    return {
      category,
      subCategories,
      hasSubCategory,
    };
  });

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
          <SheetTitle>{PAGE_TITLE}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2">
          <SheetClose asChild>
            <Button asChild variant="ghost" className="text-base [&.active]:text-accent-foreground justify-start border-b py-3 box-content">
              <Link href="/">홈</Link>
            </Button>
          </SheetClose>
          <Accordion type="single" collapsible>
            {categoriesWithSubCategories
              .filter(({ hasSubCategory }) => hasSubCategory)
              .map(({ category, subCategories }, idx) => (
                <AccordionItem value={`item-${idx}`} key={`item-${idx}-${category}`}>
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
                    {subCategories.map((sub) => (
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

          {categoriesWithSubCategories
            .filter(({ hasSubCategory }) => !hasSubCategory)
            .map(({ category }, idx) => (
              <SheetClose asChild key={`item-${idx}-${category}`}>
                <Button asChild variant="ghost" className="text-base [&.active]:text-accent-foreground justify-start  border-b py-3 box-content">
                  <Link href={`/${category}`}>{removeNumbering(category)}</Link>
                </Button>
              </SheetClose>
            ))}
        </nav>
        <SheetFooter>
          <SheetClose>{PAGE_TITLE}</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
