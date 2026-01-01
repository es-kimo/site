import { BreadCrumb } from "@/components/breadcrumb";
import { getSlugMetadata } from "@/constants/notes";
import { SlugParams } from "@/constants/params.types";
import { formatPostDate } from "@/lib/date";
import { Link } from "next-view-transitions";
import { HTMLAttributes } from "react";

export async function NoteCard({ category, sub, slug }: SlugParams) {
  const metadata = await getSlugMetadata(category, sub, slug);
  const { createdAt, updatedAt } = metadata.other;

  const SlugLink = ({ children, className, ...props }: { children: React.ReactNode; className?: string } & HTMLAttributes<HTMLAnchorElement>) => (
    <Link href={`/writing/${category}/${sub}/${slug}`} className={className} {...props}>
      {children}
    </Link>
  );

  return (
    <article className="w-full">
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
