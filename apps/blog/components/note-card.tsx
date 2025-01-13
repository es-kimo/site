import { BreadCrumb } from "@/components/breadcrumb";
import { Loader } from "@/components/loader";
import { getSlugMetadata } from "@/constants/notes";
import { SlugParams } from "@/constants/params.types";
import { formatPostDate } from "@/lib/date";
import { fetchOgImage } from "@/lib/opengraph-image";
import { Skeleton } from "@workspace/ui/components/skeleton";
import Image from "next/image";
import Link from "next/link";

export async function NoteCard({ category, sub, slug, children }: SlugParams & { children: React.ReactNode }) {
  const metadata = await getSlugMetadata(category, sub, slug);
  const { createdAt, updatedAt } = metadata.other;

  const SlugLink = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <Link href={`/${category}/${sub}/${slug}`} className={className}>
      {children}
    </Link>
  );

  return (
    <article className="w-full">
      <SlugLink className="inline-block w-full transform-gpu hover:scale-[1.04] transition-transform overflow-hidden">{children}</SlugLink>
      <div className="flex flex-col gap-[2px]">
        <SlugLink className="inline-block pt-2">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <BreadCrumb category={category} sub={sub} link={false} />
            <span>{formatPostDate(updatedAt ?? createdAt)}</span>
          </div>
        </SlugLink>
        <h2>
          <SlugLink className="text-lg font-bold inline-block w-full">{metadata.title?.toString()}</SlugLink>
        </h2>
        <SlugLink className="text-[15px] text-muted-foreground">{metadata.description?.toString()}</SlugLink>
      </div>
    </article>
  );
}

async function OpengraphImage({ category, sub, slug }: SlugParams) {
  const noteUrl = `http://localhost:3000/${category}/${sub}/${slug}`;

  const ogImage = await fetchOgImage(noteUrl);

  return ogImage && <Image priority width={718} height={310} alt="썸네일 이미지" src={ogImage} className="aspect-[7/3] object-cover transform-gpu hover:scale-[1.07] transition-transform" />;
}

export function OpengraphImageFallback() {
  return (
    <Skeleton className="w-full aspect-[7/3] rounded-none flex justify-center items-center gap-1">
      <Loader />
      <span className="text-xs text-muted-foreground">로딩중...</span>
    </Skeleton>
  );
}

NoteCard.OpengraphImage = OpengraphImage;
NoteCard.OpengraphImageFallback = OpengraphImageFallback;
