import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@workspace/ui/components/breadcrumb";
import Link from "next/link";

export const BreadCrumb = ({ className }: { className?: string }) => {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList className="text-inherit font-semibold text-xs">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/cs">컴퓨터과학</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">컴퓨터구조</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
