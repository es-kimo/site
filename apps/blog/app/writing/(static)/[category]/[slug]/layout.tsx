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

  return (
    <section
      style={{
        fontSize: "var(--article-font-size, 16px)",
        lineHeight: "var(--article-line-height, 1.6)",
      }}
      className="w-full transition-all"
    >
      <article className="col-start-2 min-w-0 max-w-[65ch] mx-auto px-4 text-foreground/90">
        <p className="text-muted-foreground pt-2 text-xs font-semibold mb-1">{formatPostDate(updatedAt ?? createdAt, "korean")}</p>
        {children}
      </article>
    </section>
  );
}
