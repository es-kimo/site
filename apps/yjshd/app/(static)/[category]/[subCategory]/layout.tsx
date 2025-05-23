import { TheHeader } from "@/components/TheHeader";
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
  return (
    <>
      <TheHeader params={params} />
      {children}
    </>
  );
}
