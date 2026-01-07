import { categoryParams } from "@/constants/params";
import { CategoryParams } from "@/constants/params.types";
import { isCategory } from "@/lib/type-guards";
import { decodeURIS } from "@workspace/common/lib/uri";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return categoryParams;
}

export async function generateMetadata({ params }: { params: Promise<CategoryParams> }): Promise<Metadata> {
  const { category } = await params;
  const [decodedCategory] = decodeURIS(category);
  return {
    title: `Writing | ${decodedCategory}`,
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
  const [decodedCategory] = decodeURIS(category);
  return (
    <section className="space-y-10">
      {isCategory(decodedCategory) ? (
        <>
          {/* <h2 className="font-bold text-3xl">{t(decodedCategory)}</h2> */}
          {children}
        </>
      ) : (
        notFound()
      )}
    </section>
  );
}
