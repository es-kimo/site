import { removeNumbering } from "@workspace/common/lib/string-utils";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@workspace/ui/components/breadcrumb";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Link } from "next-view-transitions";

export const PostBreadcrumb = ({ className, category, subCategory, isLink = true }: { className?: string; category?: string; subCategory?: string; isLink?: boolean }) => {
  const CategoryContent = () => {
    if (category === undefined) {
      return <Skeleton className="w-16 h-4" />;
    }

    if (!isLink) {
      return category;
    }

    return (
      <BreadcrumbLink asChild>
        <Link href={`/${category}`}>{removeNumbering(category)}</Link>
      </BreadcrumbLink>
    );
  };

  const SubCategoryContent = () => {
    if (subCategory === undefined) {
      return <Skeleton className="w-12 h-10" />;
    }

    if (!isLink) {
      return subCategory;
    }

    return (
      <BreadcrumbLink asChild>
        <Link href={`/${category}/${subCategory}`}>{removeNumbering(subCategory)}</Link>
      </BreadcrumbLink>
    );
  };

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList className={`text-inherit font-semibold text-sm ${!isLink && "sm:gap-[2px]"}`}>
        <BreadcrumbItem>
          <CategoryContent />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <SubCategoryContent />
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
