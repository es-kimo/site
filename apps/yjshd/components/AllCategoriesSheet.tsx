import { getMdxContent } from "@/lib/content";
import { PAGE_H1 } from "@/lib/metadata";
import { removeNumbering } from "@workspace/common/lib/string-utils";
import { decodeURIS } from "@workspace/common/lib/uri";
import { DefaultParams } from "@workspace/common/structure/params.types";
import { contentStructureMaps } from "@workspace/common/structure/structure";
import { getSlugsByCategoryAndSubCategory } from "@workspace/common/structure/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@workspace/ui/components/accordion";
import { Button } from "@workspace/ui/components/button";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@workspace/ui/components/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";

interface AllCategoriesSheetProps {
  params: Promise<DefaultParams>;
}

export const AllCategoriesSheet = async ({ params }: AllCategoriesSheetProps) => {
  const { categories, subCategoriesMap } = contentStructureMaps;

  const categoriesWithSubCategories = categories.map((category) => {
    const subCategories = subCategoriesMap.get(category) ?? [];
    const hasSubCategory = !!subCategories.length && category !== "4.게시판";
    return {
      category,
      subCategories,
      hasSubCategory,
    };
  });

  const { category, subCategory } = await params;

  const [decodedCategory, decodedSubCategory] = decodeURIS(category, subCategory);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="text-[15px] [&.active]:text-accent-foreground">
          <Menu />
          메뉴보기
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col gap-10 overflow-scroll">
        <SheetHeader>
          <SheetTitle>{PAGE_H1}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col">
          <SheetClose asChild>
            <Button
              asChild
              variant="ghost"
              className={`${category === undefined && "active"} text-base [&.active]:text-accent-foreground [&.active]:bg-muted/50 justify-start  border-b py-3 box-content`}
            >
              <Link href="/">홈</Link>
            </Button>
          </SheetClose>
          <Accordion type="single" collapsible defaultValue={decodedCategory}>
            {categoriesWithSubCategories
              .filter(({ hasSubCategory }) => hasSubCategory)
              .map(({ category, subCategories }, idx) => (
                <AccordionItem value={category} key={`item-${idx}-${category}`}>
                  <AccordionTrigger className="text-base px-4">{removeNumbering(category)}</AccordionTrigger>
                  <AccordionContent className="flex flex-col">
                    {subCategories.map(async (subCategory) => {
                      const slug = await getSlugsByCategoryAndSubCategory(category, subCategory);
                      if (slug.length > 0) {
                        return (
                          <SheetClose asChild key={subCategory}>
                            <Button asChild variant="ghost" className="ml-3 w-full text-sm [&.active]:text-accent-foreground [&.active]:bg-muted/50 justify-start">
                              <Link href={`/${category}/${subCategory}`}>{removeNumbering(subCategory)}</Link>
                            </Button>
                          </SheetClose>
                        );
                      }

                      const { headings } = await getMdxContent({ category, subCategory });
                      return (
                        <SheetClose asChild key={subCategory}>
                          <ul className="ml-3">
                            <li>
                              <Button
                                asChild
                                variant="ghost"
                                className={`${subCategory === decodedSubCategory && "active"} w-full text-sm [&.active]:text-accent-foreground [&.active]:bg-muted/50 justify-start`}
                              >
                                <Link href={`/${category}/${subCategory}`}>{removeNumbering(subCategory)}</Link>
                              </Button>
                            </li>
                            {headings
                              .filter((heading) => heading.depth === 2)
                              .map((heading) => (
                                <li key={heading.id}>
                                  <SheetClose asChild>
                                    <Button asChild variant="ghost" className="w-full text-sm text-neutral-400 [&.active]:text-accent-foreground [&.active]:bg-muted/50 justify-start">
                                      <Link replace href={`/${category}/${subCategory}#${heading.id}`}>
                                        <span className="ml-3">{heading.value}</span>
                                      </Link>
                                    </Button>
                                  </SheetClose>
                                </li>
                              ))}
                          </ul>
                        </SheetClose>
                      );
                    })}
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>

          {categoriesWithSubCategories
            .filter(({ hasSubCategory }) => !hasSubCategory)
            .map(({ category }, idx) => (
              <SheetClose asChild key={`item-${idx}-${category}`}>
                <Button
                  asChild
                  variant="ghost"
                  className={`${category === decodedCategory && "active"} text-base [&.active]:text-accent-foreground [&.active]:bg-muted/50 justify-start  border-b py-3 box-content`}
                >
                  <Link href={`/${category}`}>{removeNumbering(category)}</Link>
                </Button>
              </SheetClose>
            ))}
        </nav>
        <SheetFooter>
          <SheetClose>{PAGE_H1}</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
