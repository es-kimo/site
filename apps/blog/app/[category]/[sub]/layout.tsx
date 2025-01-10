import { getSubParams } from "@/constants/params";
import { SubParams } from "@/constants/params.types";
import { t } from "@/locales/translate";
import { ResolvingMetadata } from "next";

export async function generateStaticParams({ params: { category } }: { params: { category: string } }) {
  return getSubParams(category);
}

export async function generateMetadata({ params }: { params: Promise<SubParams> }) {
  const { category, sub } = await params;
  return {
    title: `${t(category)} | ${t(sub)}`,
  };
}

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
