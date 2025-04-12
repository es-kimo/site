import { PostBreadcrumb } from "@/components/PostBreadcrumb";
import { TheHeader } from "@/components/TheHeader";
import { decodeURIS } from "@workspace/common/lib/uri";
import { SubCategoryParams } from "@workspace/common/structure/params.types";

export async function generateMetadata() {
  return {
    authors: [{ name: "연세정성내과" }],
    creator: "연세정성내과",
    publisher: "연세정성내과",
  };
}

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<SubCategoryParams>;
}>) {
  const { category, subCategory } = await params;
  const [decodedCategory, decodedSubCategory] = decodeURIS(category, subCategory);

  return (
    <>
      <TheHeader params={params} />

      <section className="grid grid-cols-[minmax(0.875rem,_1fr)_minmax(auto,_708px)_minmax(0.875rem,_1fr)] sm:grid-cols-[minmax(96px,_3fr)_minmax(auto,_850px)_minmax(96px,_1fr)] pt-6 pb-[10vh] sm:pt-[80px] sm:pb-[20vh] w-full transition-all">
        <aside className="hidden lg:block sticky top-[80px] left-3 border-y-2 w-[180px] h-fit">{/* TODO: 목차 */}</aside>
        <article className="col-start-2">
          <PostBreadcrumb className="text-muted-foreground mb-1" category={decodedCategory} subCategory={decodedSubCategory} />
          {children}
        </article>
      </section>
    </>
  );
}
