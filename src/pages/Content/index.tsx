import { WidthResizeTransition } from "@/components/common/WidthResizeTransition";
import { mdxComponents } from "@/components/mdx-components";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import CS01 from "@/contents/CS/cs01.mdx";
import { Link } from "react-router";

const Content = () => {
  return (
    <WidthResizeTransition>
      <section className="grid grid-cols-[minmax(96px,_3fr)_minmax(auto,_708px)_minmax(96px,_1fr)] p-[80px_0_20vh] w-full">
        <aside className="fade-transition invisible opacity-0 lg:opacity-100 lg:visible sticky top-[80px] left-3 border-t-2 border-b-2 w-[180px] h-fit">
          <dl className="border-b-[1px] border-muted px-[7px]">
            <dd className="py-[6px]">
              <BreadCrumb />
            </dd>
          </dl>
          <dl className="flex gap-4 text-xs px-[7px] py-[9px]">
            <dt className="text-muted-foreground">작성일</dt>
            <dd>3일 전</dd>
          </dl>
        </aside>
        <article className="col-start-2">
          <BreadCrumb className="fade-transition h-4 lg:opacity-0 lg:invisible lg:h-0 lg:m-0 text-muted-foreground mb-1" />
          <CS01 components={mdxComponents} />
        </article>
      </section>
    </WidthResizeTransition>
  );
};

const BreadCrumb = ({ className }: { className?: string }) => {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList className="text-inherit font-semibold text-xs">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/cs">컴퓨터과학</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">컴퓨터구조</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Content;
