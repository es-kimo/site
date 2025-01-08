import { Params } from "@/constants/params.type";

export async function generateMetadata({ params }: { params: Params }) {
  const { category, sub, slug } = await params;

  const { metadata } = await import(`@/content/${category}/${sub}/${slug}/page.mdx`);

  return { ...metadata, authors: [{ name: "Kihyun Ryu" }], creator: "Kihyun Ryu", publisher: "Kihyun Ryu" };
}

export default async function Page({ params }: { params: Params }) {
  const { category, sub, slug } = await params;

  const { default: Note } = await import(`@/content/${category}/${sub}/${slug}/page.mdx`);

  return <Note />;
}

export const dynamicParams = false;
