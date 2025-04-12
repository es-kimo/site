import { getPostContent, getPostMetadata } from "@/lib/metadata";
import { PostMetadata } from "@workspace/common/content/metadata.types";
import { decodeURIS } from "@workspace/common/lib/uri";
import { SubCategoryParams } from "@workspace/common/structure/params.types";

export async function generateMetadata({ params }: { params: Promise<SubCategoryParams> }): Promise<PostMetadata> {
  const { category, subCategory } = await params;
  const [decodedCategory, decodedSubCategory] = decodeURIS(category, subCategory);

  const metadata = await getPostMetadata({ category: decodedCategory, subCategory: decodedSubCategory });

  return { ...metadata, authors: [{ name: "연세정성내과" }], creator: "연세정성내과", publisher: "연세정성내과" };
}

export default async function Page({ params }: { params: Promise<SubCategoryParams> }) {
  const { category, subCategory } = await params;
  const [decodedCategory, decodedSubCategory] = decodeURIS(category, subCategory);

  const Post = await getPostContent({ category: decodedCategory, subCategory: decodedSubCategory });

  return <Post />;
}

export const dynamicParams = false;
