import { ArticleFooter } from "@/components/article-footer";
import { getSlugMetadata } from "@/constants/notes";
import { SlugParams } from "@/constants/params.types";
import { formatPostDate } from "@/lib/date";
import { decodeURIS } from "@workspace/common/lib/uri";

export async function generateMetadata() {
  return {
    authors: [{ name: "Kihyun Ryu" }],
    creator: "Kihyun Ryu",
    publisher: "Kihyun Ryu",
  };
}

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<SlugParams>;
}>) {
  const { category, slug } = await params;
  const [decodedCategory, decodedSlug] = decodeURIS(category, slug);
  const metadata = await getSlugMetadata(decodedCategory, decodedSlug);
  const { createdAt, updatedAt } = metadata.other;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: metadata.title?.toString(),
    description: metadata.description?.toString(),
    datePublished: createdAt,
    ...(updatedAt && { dateModified: updatedAt }),
    author: {
      "@type": "Person",
      name: "Kihyun Ryu",
      url: "https://khryu.dev",
    },
    publisher: {
      "@type": "Person",
      name: "Kihyun Ryu",
    },
    url: `https://khryu.dev/writing/${encodeURIComponent(decodedCategory)}/${encodeURIComponent(decodedSlug)}`,
  };

  return (
    <section
      style={{
        fontSize: "var(--article-font-size, 14px)",
        lineHeight: "var(--article-line-height, 1.625)",
      }}
      className="relative left-1/2 w-[calc(100vw-2rem)] max-w-[52rem] -translate-x-1/2 transition-all"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="mx-auto flex min-w-0 w-full flex-col gap-2 break-words text-foreground/90 selection:bg-primary/20">
        <p className="text-muted-foreground pt-2 text-xs font-semibold mb-1">{formatPostDate(updatedAt ?? createdAt, "korean")}</p>
        {children}
      </article>
      <ArticleFooter category={decodedCategory} slug={decodedSlug} date={updatedAt ?? createdAt} />
    </section>
  );
}
