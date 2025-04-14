import { AllCategoriesSheet } from "@/components/AllCategoriesSheet";
import { PAGE_H1 } from "@/lib/metadata";
import { removeNumbering } from "@workspace/common/lib/string-utils";
import { DefaultParams } from "@workspace/common/structure/params.types";
import { categories } from "@workspace/common/structure/structure";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Link } from "next-view-transitions";
import type { HTMLAttributes } from "react";

interface TheHeaderProps {
  params: Promise<DefaultParams>;
}

export const TheHeader = async ({ params }: TheHeaderProps) => {
  const { category } = await params;

  const decodedCategory = category && decodeURI(category);

  return (
    <>
      <header className="max-w-full flex justify-between py-4 px-2 sm:px-4 sticky top-0 z-50 bg-[#fcfcfc]">
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
      <NavigationBar activeCategory={decodedCategory} className="hidden sm:flex lg:hidden justify-center bg-muted/30" />
    </>
  );
};

const NavigationBar = ({ className, activeCategory }: HTMLAttributes<HTMLDivElement> & { activeCategory?: string }) => {
  return (
    <nav className={cn("flex-nowrap overflow-x-auto ml-auto", className)}>
      {categories.map((category) => (
        <Button
          asChild
          variant="ghost"
          key={category}
          className={`${activeCategory === category && "active"} text-neutral-400 text-[15px] hover:text-primary [&.active]:text-primary [&.active]:bg-muted/50`}
        >
          <Link href={`/${category}`}>{removeNumbering(category)}</Link>
        </Button>
      ))}
    </nav>
  );
};
