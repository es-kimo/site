import { PostBreadcrumb } from "@/components/PostBreadcrumb";
import { TableOfContents } from "@/components/TableOfContents";
import { getMdxContent } from "@/lib/content";
import { getPostContent, getPostMetadata } from "@/lib/metadata";
import { decodeURIS } from "@workspace/common/lib/uri";
import { SubCategoryParams } from "@workspace/common/structure/params.types";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<SubCategoryParams> }): Promise<Metadata> {
  const { category, subCategory } = await params;
  const [decodedCategory, decodedSubCategory] = decodeURIS(category, subCategory);

  const metadata = await getPostMetadata({ category: decodedCategory, subCategory: decodedSubCategory });
  const title = `${metadata.title}`;
  const description = metadata.description || `연세정성내과의 ${decodedCategory} - ${decodedSubCategory} 페이지입니다.`;

  return {
    title,
    description,
    keywords: ["연세정성내과", decodedCategory.replace(/^\d+\./, ""), decodedSubCategory.replace(/^\d+\./, ""), ...(metadata.keywords || [])],
    openGraph: {
      title,
      description,
      type: "article",
      locale: "ko_KR",
      siteName: "연세정성내과",
      images: metadata.openGraph?.images || [
        {
          url: "/og-default.png",
          width: 1200,
          height: 630,
          alt: "연세정성내과 기본 이미지",
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
    },
    authors: [{ name: "연세정성내과" }],
    creator: "연세정성내과",
    publisher: "연세정성내과",
    alternates: {
      canonical: `https://yonsei-jshd.com/${category}/${subCategory}`,
    },
    other: {
      "article:published_time": metadata.other?.createdAt || "",
      "article:modified_time": metadata.other?.updatedAt || metadata.other?.createdAt || "",
    },
  };
}

export default async function Page({ params }: { params: Promise<SubCategoryParams> }) {
  const { category, subCategory } = await params;
  const [decodedCategory, decodedSubCategory] = decodeURIS(category, subCategory);
  const { headings } = await getMdxContent({ category: decodedCategory, subCategory: decodedSubCategory });

  const Post = await getPostContent({ category: decodedCategory, subCategory: decodedSubCategory });

  return (
    <section className="grid grid-cols-[minmax(0.875rem,_1fr)_minmax(auto,_708px)_minmax(0.875rem,_1fr)] sm:grid-cols-[minmax(96px,_3fr)_minmax(auto,_800px)_minmax(96px,_1fr)] pt-6 pb-[10vh] sm:pt-[80px] sm:pb-[20vh] w-full transition-all">
      <aside className="hidden lg:block sticky top-[80px] left-3 w-[180px] h-fit px-2">
        <TableOfContents headings={headings.filter((heading) => heading.depth >= 2)} />
      </aside>
      <article className="col-start-2">
        <PostBreadcrumb className="text-muted-foreground mb-1" category={decodedCategory} subCategory={decodedSubCategory} />
        <Post />
      </article>
    </section>
  );
}

export const dynamicParams = false;
