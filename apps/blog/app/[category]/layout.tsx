import NavigationTab from "@/components/navigation-tab";
import { categories } from "@/constants/categories";
import { isCategory } from "@/lib/type-guards";
import { t } from "@/locales/translate";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return categories.map((category) => ({
    category,
  }));
}

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ category: string }>;
}>) {
  const { category } = await params;

  return (
    <main className="pt-6 pb-[10vh] px-8 sm:pt-[80px] sm:pb-[20vh] space-y-6">
      {isCategory(category) ? (
        <>
          <h2 className="font-bold text-3xl">{t(category)}</h2>
          <NavigationTab category={category} />
          {children}
        </>
      ) : (
        notFound()
      )}
    </main>
  );
}
