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
}: Readonly<{
  children: React.ReactNode;
}>) {
  const params = new Promise<SubCategoryParams>((resolve) => {
    resolve({ category: "3.강좌", subCategory: "3.혈액투석 1,2,3" });
  });
  return (
    <>
      <TheHeader params={params} />
      {children}
    </>
  );
}
