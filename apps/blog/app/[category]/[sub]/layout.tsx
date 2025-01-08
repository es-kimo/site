import { getSubParams } from "@/constants/params";

export async function generateStaticParams({ params: { category } }: { params: { category: string } }) {
  return getSubParams(category);
}

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
