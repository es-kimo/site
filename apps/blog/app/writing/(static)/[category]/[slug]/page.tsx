import { getSlugMetadata } from "@/constants/notes";
import { slugParams } from "@/constants/params";
import { SlugParams } from "@/constants/params.types";
import { decodeURIS } from "@workspace/common/lib/uri";
import { notFound } from "next/navigation";

/** route group이 달라서 부모로부터 static param을 받을 수 없음 */
export function generateStaticParams() {
  return slugParams;
}

export async function generateMetadata({ params }: { params: Promise<SlugParams> }) {
  const { category, slug } = await params;
  const [decodedCategory, decodedSlug] = decodeURIS(category, slug);

  const metadata = await getSlugMetadata(decodedCategory, decodedSlug);

  return { ...metadata, authors: [{ name: "Kihyun Ryu" }], creator: "Kihyun Ryu", publisher: "Kihyun Ryu" };
}

export default async function Page({ params }: { params: Promise<SlugParams> }) {
  const { category, slug } = await params;
  const [decodedCategory, decodedSlug] = decodeURIS(category, slug);

  const metadata = await getSlugMetadata(decodedCategory, decodedSlug);
  const { default: Note } = await import(`@/content/${decodedCategory}/${decodedSlug}/page.mdx`);

  if (metadata.other?.status === "draft") {
    notFound();
  }

  return <Note />;
}

export const dynamicParams = false;
