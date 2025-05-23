import { PostBreadcrumb } from "@/components/PostBreadcrumb";
import { TableOfContents } from "@/components/TableOfContents";
import { getMdxContent } from "@/lib/content";
import { getPostContent, getPostMetadata } from "@/lib/metadata";
import { PostMetadata } from "@workspace/common/content/metadata.types";
import { decodeURIS } from "@workspace/common/lib/uri";
import { type SlugParams } from "@workspace/common/structure/params.types";

export async function generateMetadata({ params }: { params: Promise<SlugParams> }): Promise<PostMetadata> {
  const { category, subCategory, slug } = await params;
  const [decodedCategory, decodedSubCategory, decodedSlug] = decodeURIS(category, subCategory, slug);

  const metadata = await getPostMetadata({ category: decodedCategory, subCategory: decodedSubCategory, slug: decodedSlug });

  return { ...metadata, authors: [{ name: "연세정성내과" }], creator: "연세정성내과", publisher: "연세정성내과" };
}

export default async function Page({ params }: { params: Promise<SlugParams> }) {
  const { category, subCategory, slug } = await params;
  const [decodedCategory, decodedSubCategory, decodedSlug] = decodeURIS(category, subCategory, slug);
  const { headings } = await getMdxContent({ category: decodedCategory, subCategory: decodedSubCategory, slug: decodedSlug });

  const Post = await getPostContent({ category: decodedCategory, subCategory: decodedSubCategory, slug: decodedSlug });

  return (
    <section className="grid grid-cols-[minmax(0.875rem,_1fr)_minmax(auto,_708px)_minmax(0.875rem,_1fr)] sm:grid-cols-[minmax(96px,_3fr)_minmax(auto,_850px)_minmax(96px,_1fr)] pt-6 pb-[10vh] sm:pt-[80px] sm:pb-[20vh] w-full transition-all">
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
