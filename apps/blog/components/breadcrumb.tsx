import { t } from "@/locales/translate";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@workspace/ui/components/breadcrumb";
import Link from "next/link";

export const BreadCrumb = ({ className, category, sub, link = true }: { className?: string; category: string; sub: string; link?: boolean }) => {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList className={`text-inherit font-semibold text-xs ${!link && "sm:gap-[2px]"}`}>
        <BreadcrumbItem>
          {link ? (
            <BreadcrumbLink asChild>
              <Link href={`/${category}`}>{t(category)}</Link>
            </BreadcrumbLink>
          ) : (
            t(category)
          )}
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {link ? (
            <BreadcrumbLink asChild>
              <Link href={`/${category}/${sub}`}>{t(sub)}</Link>
            </BreadcrumbLink>
          ) : (
            t(sub)
          )}
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
