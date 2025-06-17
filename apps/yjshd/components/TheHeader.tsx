import { AllCategoriesSheet } from "@/components/AllCategoriesSheet";
import { getMdxContent } from "@/lib/content";
import { PAGE_H1 } from "@/lib/metadata";
import { removeNumbering } from "@workspace/common/lib/string-utils";
import { decodeURIS } from "@workspace/common/lib/uri";
import { DefaultParams } from "@workspace/common/structure/params.types";
import { categories, subCategoriesMap } from "@workspace/common/structure/structure";
import { getSlugsByCategoryAndSubCategory } from "@workspace/common/structure/utils";
import { Button } from "@workspace/ui/components/button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from "@workspace/ui/components/navigation-menu";
import { cn } from "@workspace/ui/lib/utils";
import { Link } from "next-view-transitions";
import { Fragment, type HTMLAttributes } from "react";

interface TheHeaderProps {
  params: Promise<DefaultParams>;
}

export const TheHeader = async ({ params }: TheHeaderProps) => {
  const { category, subCategory } = await params;

  const [decodedCategory, decodedSubCategory] = decodeURIS(category, subCategory);

  return (
    <div className="max-w-full sticky top-0 z-50 bg-background">
      <header className="w-full flex justify-between py-4 px-2 sm:px-4">
        <h1 className="flex-shrink-0">
          <Button asChild variant="ghost" className={`${decodedCategory === undefined && "active"} text-xl [&.active]:text-accent-foreground`}>
            <Link href="/">
              <span>{PAGE_H1}</span>
            </Link>
          </Button>
        </h1>

        <NavigationBar activeCategory={decodedCategory} className="hidden lg:flex" />

        <ul className="flex justify-end ml-6">
          <li>
            <AllCategoriesSheet params={params} />
          </li>
        </ul>
      </header>
      <NavigationBar activeCategory={decodedCategory} activeSubCategory={decodedSubCategory} className="hidden sm:flex lg:hidden justify-center bg-muted/30" />
    </div>
  );
};

const NavigationBar = async ({
  className,
  activeCategory,
  activeSubCategory,
  activeSlug,
}: HTMLAttributes<HTMLDivElement> & { activeCategory?: string; activeSubCategory?: string; activeSlug?: string }) => {
  const categoriesWithSubCategories = categories.filter((category) => category !== "4.게시판");
  return (
    <nav className={cn("flex-nowrap ml-auto", className)}>
      <NavigationMenu>
        <NavigationMenuList>
          {categoriesWithSubCategories.map((category) => (
            <NavigationMenuItem key={category}>
              <NavigationMenuTrigger
                className={`${activeCategory === category && "active"} text-neutral-400 text-[15px] hover:text-primary [&.active]:text-primary bg-transparent [&.active]:bg-muted/50`}
              >
                <Link href={`/${category}`}>{removeNumbering(category)}</Link>
              </NavigationMenuTrigger>
              <Content category={category} activeSubCategory={activeSubCategory} activeHeading={activeSlug} />
            </NavigationMenuItem>
          ))}
          <Button variant="ghost" className={`${activeCategory === "4.게시판" && "active"} text-neutral-400 text-[15px] hover:text-primary [&.active]:text-primary [&.active]:bg-muted/50`}>
            <Link href="/4.게시판">{removeNumbering("4.게시판")}</Link>
          </Button>
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
};

const StyledLink = ({ title, className, href, children, bold }: HTMLAttributes<HTMLAnchorElement> & { title: string; href: string; bold?: boolean }) => {
  return (
    <Link
      className={cn(
        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground [&.active]:text-primary [&.active]:bg-muted/50",
        className
      )}
      href={href}
    >
      <div className={cn("text-sm leading-none text-muted-foreground line-clamp-1", bold && "text-[initial] font-medium")}>{removeNumbering(title)}</div>
      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
    </Link>
  );
};

const Content = async ({ category, activeSubCategory, activeHeading }: { category: string; activeSubCategory?: string; activeHeading?: string }) => {
  const subCategories = await Promise.all(
    (subCategoriesMap.get(category) ?? []).map(async (subCategory) => {
      const slugs = await getSlugsByCategoryAndSubCategory(category, subCategory);
      const hasSlug = slugs && slugs.length > 0;
      if (hasSlug) {
        return { subCategory, hasSlug, headings: null };
      }
      const { headings } = await getMdxContent({ category, subCategory });
      return { subCategory, hasSlug, headings: headings.filter((heading) => heading.depth === 2) };
    })
  );

  return (
    <NavigationMenuContent>
      <div className="grid gap-3 p-4 sm:w-[500px] sm:grid-cols-[.75fr_1fr]">
        {subCategories.map(({ subCategory, hasSlug, headings }) =>
          !hasSlug ? (
            <Fragment key={subCategory}>
              <div className="pr-2 sm:border-r">
                <StyledLink title={subCategory} href={`/${category}/${subCategory}`} className={cn(activeSubCategory === subCategory && "active")} bold />
              </div>
              <ul>
                {headings.map((heading) => (
                  <li key={heading.id}>
                    <StyledLink title={heading.value} href={`/${category}/${subCategory}#${heading.id}`} className={cn(activeHeading === heading.id && "active")} />
                  </li>
                ))}
              </ul>
            </Fragment>
          ) : (
            <StyledLink key={subCategory} title={subCategory} href={`/${category}/${subCategory}`} className={cn(activeSubCategory === subCategory && "active", "col-span-2")} bold />
          )
        )}
      </div>
    </NavigationMenuContent>
  );
};
