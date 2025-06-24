import { slugParams } from "@/constants/params";
import { Breadcrumb as BreadcrumbUI, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@workspace/ui/components/breadcrumb";
import { Link } from "next-view-transitions";

/** route group이 달라서 부모로부터 static param을 받을 수 없음 */
export function generateStaticParams() {
  return slugParams;
}

export async function generateMetadata() {
  return {
    authors: [{ name: "Kihyun Ryu" }],
    creator: "Kihyun Ryu",
    publisher: "Kihyun Ryu",
  };
}

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lectureName: string; courseName: string }>;
}>) {
  const { lectureName, courseName } = await params;

  return (
    <section className="grid grid-cols-[minmax(0.875rem,_1fr)_minmax(auto,_708px)_minmax(0.875rem,_1fr)] sm:grid-cols-[minmax(96px,_3fr)_minmax(auto,_708px)_minmax(96px,_1fr)] pt-6 pb-[10vh] sm:pt-[80px] sm:pb-[20vh] w-full transition-all">
      <aside className="hidden lg:block sticky top-[80px] left-3 border-y-2 w-[180px] h-fit">
        <dl className="border-b-[1px] border-muted px-[7px]">
          <dd className="py-[6px]">
            <Breadcrumb lectureName={lectureName} courseName={courseName} />
          </dd>
        </dl>
      </aside>
      <article className="col-start-2">
        <Breadcrumb lectureName={lectureName} courseName={courseName} />
        {children}
      </article>
    </section>
  );
}

const Breadcrumb = ({ lectureName, courseName }: { lectureName: string; courseName: string }) => {
  return (
    <BreadcrumbUI>
      <BreadcrumbList className={`text-inherit font-semibold text-xs`}>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/ossu/archive`}>ossu</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/ossu/archive/${lectureName}`}>{lectureName}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/ossu/archive/${lectureName}/${courseName}`}>{courseName}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </BreadcrumbUI>
  );
};
