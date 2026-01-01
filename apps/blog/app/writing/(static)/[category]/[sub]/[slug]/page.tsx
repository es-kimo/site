import { getSlugMetadata } from "@/constants/notes";
import { SlugParams } from "@/constants/params.types";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<SlugParams> }) {
  const { category, sub, slug } = await params;

  const metadata = await getSlugMetadata(category, sub, slug);

  return { ...metadata, authors: [{ name: "Kihyun Ryu" }], creator: "Kihyun Ryu", publisher: "Kihyun Ryu" };
}

export default async function Page({ params }: { params: Promise<SlugParams> }) {
  const { category, sub, slug } = await params;
  const metadata = await getSlugMetadata(category, sub, slug);
  const { default: Note } = await import(`@/content/${decodeURIComponent(category)}/${decodeURIComponent(sub)}/${decodeURIComponent(slug)}/page.mdx`);

  if (metadata.other?.status === "draft") {
    notFound();
  }

  return <Note />;
}

export const dynamicParams = false;
