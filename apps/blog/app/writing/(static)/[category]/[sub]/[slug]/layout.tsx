import { BreadCrumb } from "@/components/breadcrumb";
import { getSlugMetadata } from "@/constants/notes";
import { slugParams } from "@/constants/params";
import { SlugParams } from "@/constants/params.types";
import { formatPostDate } from "@/lib/date";
import { decodeURIS } from "@workspace/common/lib/uri";

/** route group이 달라서 부모로부터 static param을 받을 수 없음 */
export function generateStaticParams() {
  return slugParams;
}

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
  const { category, sub, slug } = await params;
  const [decodedCategory, decodedSub, decodedSlug] = decodeURIS(category, sub, slug);
  const metadata = await getSlugMetadata(decodedCategory, decodedSub, decodedSlug);
  const { createdAt, updatedAt } = metadata.other;

  return (
    <section
      style={{
        fontSize: "var(--article-font-size, 16px)",
      }}
      className="w-full transition-all"
    >
      <article className="col-start-2 min-w-0">
        <p className="text-muted-foreground pt-2 text-xs font-semibold mb-1">{formatPostDate(updatedAt ?? createdAt, "korean")}</p>
        {children}
      </article>
    </section>
  );
}
