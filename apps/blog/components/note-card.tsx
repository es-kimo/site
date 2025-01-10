import { BreadCrumb } from "@/components/breadcrumb";
import { getSlugMetadata } from "@/constants/notes";
import { Category } from "@/constants/notes.types";
import { fetchOgImage } from "@/lib/opengraph-image";
import Image from "next/image";
import Link from "next/link";

export async function NoteCard({ category, sub, slug }: { category: Category; sub: string; slug: string }) {
  const noteUrl = `http://localhost:3000/${category}/${sub}/${slug}`;

  const ogImage = await fetchOgImage(noteUrl);

  const metadata = await getSlugMetadata(category, sub, slug);

  const SlugLink = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <Link href={`/${category}/${sub}/${slug}`} className={className}>
      {children}
    </Link>
  );

  // TODO: Image Fallback, Image 로딩 중 스켈레톤
  return (
    <article>
      <SlugLink className="inline-block transform-gpu hover:scale-[1.04] transition-transform overflow-hidden">
        {ogImage && (
          <Image width={718} height={310} alt={metadata.title?.toString() ?? ""} src={ogImage} className="aspect-[7_/_3] object-cover transform-gpu hover:scale-[1.07] transition-transform" />
        )}
      </SlugLink>
      <div className="flex flex-col gap-[2px] mt-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <BreadCrumb category={category} sub={sub} link={false} />
          <SlugLink className="inline-block">3일 전</SlugLink>
        </div>
        <h2>
          <SlugLink className="text-lg font-bold inline-block w-full">{metadata.title?.toString()}</SlugLink>
        </h2>
        <SlugLink className="text-[15px] text-muted-foreground">{metadata.description?.toString()}</SlugLink>
      </div>
    </article>
  );
}
