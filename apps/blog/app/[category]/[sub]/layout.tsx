import { getSubCategoriesByCategory } from "@/constants/subCategories";
import { isCategory } from "@/lib/type-guards";

export async function generateStaticParams({ params: { category } }: { params: { category: string } }) {
  return isCategory(category) ? getSubCategoriesByCategory(category).map((sub) => ({ category, sub })) : [];
}

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
