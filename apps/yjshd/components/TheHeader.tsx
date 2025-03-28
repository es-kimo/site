import { AllCategoriesSheet } from "@/components/AllCategoriesSheet";
import { PAGE_H1 } from "@/lib/metadata";
import { removeNumbering } from "@workspace/common/lib/string-utils";
import { DefaultParams } from "@workspace/common/structure/params.types";
import { categories } from "@workspace/common/structure/structure";
import { Button } from "@workspace/ui/components/button";
import { Link } from "next-view-transitions";
import Image from "next/image";

interface TheHeaderProps {
  params: Promise<DefaultParams>;
}

export const TheHeader = async ({ params }: TheHeaderProps) => {
  const { category } = await params;

  const decodedCategory = category && decodeURI(category);

  return (
    <header className="max-w-full flex justify-between py-4 sticky top-0 z-10 bg-background">
      <div className="flex lg:gap-8">
        <h1 className="flex-shrink-0">
          <Button asChild variant="ghost" className={`${decodedCategory === undefined && "active"} text-base [&.active]:text-accent-foreground`}>
            <Link href="/">
              {" "}
              <Image alt={PAGE_H1} src="/logo.jpeg" width={24} height={24} />
              <span className="sm:hidden lg:inline">{PAGE_H1}</span>
            </Link>
          </Button>
        </h1>

        <nav className="hidden sm:flex flex-nowrap overflow-x-auto">
          {categories.map((category) => (
            <Button
              asChild
              variant="ghost"
              key={category}
              className={`${decodedCategory === category && "active"} text-neutral-400 text-base [&.active]:text-accent-foreground [&.active]:bg-muted/50`}
            >
              <Link href={`/${category}`}>{removeNumbering(category)}</Link>
            </Button>
          ))}
        </nav>
      </div>

      <ul className="flex justify-end">
        <li>
          <AllCategoriesSheet params={params} />
        </li>
      </ul>
    </header>
  );
};
