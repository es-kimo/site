import { getSubParams } from "@/constants/params";
import { SubParams } from "@/constants/params.types";
import { decodeURIS } from "@workspace/common/lib/uri";

export async function generateStaticParams({ params: { category } }: { params: { category: string } }) {
  return getSubParams(category);
}

export async function generateMetadata({ params }: { params: Promise<SubParams> }) {
  const { category, sub } = await params;
  const [decodedCategory, decodedSub] = decodeURIS(category, sub);
  return {
    title: `${decodedCategory} | ${decodedSub}`,
  };
}

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
