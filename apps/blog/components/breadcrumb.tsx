import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@workspace/ui/components/breadcrumb";
import { formatCategoryLabel } from "@/lib/category";
import Link from "next/link";

export const BreadCrumb = ({ className, category, sub, link = true }: { className?: string; category: string; sub: string; link?: boolean }) => {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList className={`text-inherit font-semibold text-xs ${!link && "sm:gap-[2px]"}`}>
        <BreadcrumbItem>
          {link ? (
            <BreadcrumbLink asChild>
              <Link href={`/writing/${category}`}>{formatCategoryLabel(category)}</Link>
            </BreadcrumbLink>
          ) : (
            formatCategoryLabel(category)
          )}
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {link ? (
            <BreadcrumbLink asChild>
              <Link href={`/writing/${category}/${sub}`}>{sub}</Link>
            </BreadcrumbLink>
          ) : (
            sub
          )}
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
