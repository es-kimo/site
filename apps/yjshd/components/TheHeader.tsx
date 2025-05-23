import { AllCategoriesSheet } from "@/components/AllCategoriesSheet";
import { PAGE_H1 } from "@/lib/metadata";
import { removeNumbering } from "@workspace/common/lib/string-utils";
import { decodeURIS } from "@workspace/common/lib/uri";
import { DefaultParams } from "@workspace/common/structure/params.types";
import { categories, subCategoriesMap } from "@workspace/common/structure/structure";
import { Button } from "@workspace/ui/components/button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from "@workspace/ui/components/navigation-menu";
import { cn } from "@workspace/ui/lib/utils";
import { Link } from "next-view-transitions";
import { type HTMLAttributes } from "react";

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

const NavigationBar = ({ className, activeCategory, activeSubCategory }: HTMLAttributes<HTMLDivElement> & { activeCategory?: string; activeSubCategory?: string }) => {
  const data = categories.map((category) => {
    const firstSubCategory = (subCategoriesMap.get(category) ?? [])[0];
    const hasSubCategory = !!firstSubCategory && category !== "4.게시판";
    return { category, firstSubCategory, hasSubCategory };
  });

  return (
    <nav className={cn("flex-nowrap ml-auto", className)}>
      <NavigationMenu>
        <NavigationMenuList>
          {data.map(({ category, firstSubCategory, hasSubCategory }) =>
            hasSubCategory ? (
              <NavigationMenuItem key={category}>
                <NavigationMenuTrigger
                  className={`${activeCategory === category && "active"} text-neutral-400 text-[15px] hover:text-primary [&.active]:text-primary bg-transparent [&.active]:bg-muted/50`}
                >
                  <Link href={`/${category}/${firstSubCategory}`}>{removeNumbering(category)}</Link>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="flex w-[500px] gap-3 p-4 overflow-x-auto">
                    {subCategoriesMap
                      .get(category)
                      ?.map((subCategory) => <ListItem key={subCategory} subCategory={subCategory} href={`/${category}/${subCategory}`} activeSubCategory={activeSubCategory} />)}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ) : (
              <Button
                key={category}
                variant="ghost"
                className={`${activeCategory === category && "active"} text-neutral-400 text-[15px] hover:text-primary [&.active]:text-primary [&.active]:bg-muted/50`}
              >
                <Link href={`/${category}`}>{removeNumbering(category)}</Link>
              </Button>
            )
          )}
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
};

const ListItem = ({
  className,
  subCategory,
  activeSubCategory,
  href,
  children,
  ...props
}: HTMLAttributes<HTMLAnchorElement> & {
  subCategory: string;
  href: string;
  activeSubCategory?: string;
}) => {
  return (
    <li className="flex-shrink-0">
      <Link
        className={cn(
          `${activeSubCategory === subCategory && "active"}`,
          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground [&.active]:text-primary [&.active]:bg-muted/50",
          className
        )}
        {...props}
        href={href}
      >
        <div className="text-sm font-medium leading-none">{removeNumbering(subCategory)}</div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
      </Link>
    </li>
  );
};
