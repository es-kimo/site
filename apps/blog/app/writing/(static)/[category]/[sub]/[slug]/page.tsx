import { getSlugMetadata } from "@/constants/notes";
import { SlugParams } from "@/constants/params.types";
import { decodeURIS } from "@workspace/common/lib/uri";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<SlugParams> }) {
  const { category, sub, slug } = await params;
  const [decodedCategory, decodedSub, decodedSlug] = decodeURIS(category, sub, slug);

  const metadata = await getSlugMetadata(decodedCategory, decodedSub, decodedSlug);

  return { ...metadata, authors: [{ name: "Kihyun Ryu" }], creator: "Kihyun Ryu", publisher: "Kihyun Ryu" };
}

export default async function Page({ params }: { params: Promise<SlugParams> }) {
  const { category, sub, slug } = await params;
  const [decodedCategory, decodedSub, decodedSlug] = decodeURIS(category, sub, slug);

  const metadata = await getSlugMetadata(decodedCategory, decodedSub, decodedSlug);
  const { default: Note } = await import(`@/content/${decodedCategory}/${decodedSub}/${decodedSlug}/page.mdx`);

  if (metadata.other?.status === "draft") {
    notFound();
  }

  return <Note />;
}

export const dynamicParams = false;
