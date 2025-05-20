import { TheHeader } from "@/components/TheHeader";
import { type CategoryParams } from "@workspace/common/structure/params.types";

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
  const params = new Promise<CategoryParams>((resolve) => {
    resolve({ category: "4.게시판" });
  });
  return (
    <>
      <TheHeader params={params} />
      {children}
    </>
  );
}
