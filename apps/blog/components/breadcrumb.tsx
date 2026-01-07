import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@workspace/ui/components/breadcrumb";
import { Link } from "next-view-transitions";

export const BreadCrumb = ({ className, category, sub, link = true }: { className?: string; category: string; sub: string; link?: boolean }) => {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList className={`text-inherit font-semibold text-xs ${!link && "sm:gap-[2px]"}`}>
        <BreadcrumbItem>
          {link ? (
            <BreadcrumbLink asChild>
              <Link href={`/writing/${category}`}>{category}</Link>
            </BreadcrumbLink>
          ) : (
            category
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
