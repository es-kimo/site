import { SubCategoryNavigationTab } from "@/components/navigation-tab";
import { categoryParams } from "@/constants/params";
import { CategoryParams } from "@/constants/params.types";
import { isCategory } from "@/lib/type-guards";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return categoryParams;
}

export async function generateMetadata({ params }: { params: Promise<CategoryParams> }): Promise<Metadata> {
  const { category } = await params;
  return {
    title: `${category}`,
    description: `${category} 분야의 다양한 주제를 글로 다룹니다.`,
    // TODO: og image
  };
}

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<CategoryParams>;
}>) {
  const { category } = await params;
  return (
    <section className="space-y-10">
      {isCategory(category) ? (
        <>
          {/* <h2 className="font-bold text-3xl">{t(category)}</h2> */}
          <SubCategoryNavigationTab category={category} />
          {children}
        </>
      ) : (
        notFound()
      )}
    </section>
  );
}
