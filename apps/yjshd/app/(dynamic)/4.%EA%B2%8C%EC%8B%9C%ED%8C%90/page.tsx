import Pagination from "@/components/Pagination";
import { getPostMetadata } from "@/lib/metadata";
import { formatPostDate } from "@workspace/common/lib/date";
import { getSlugsByCategory } from "@workspace/common/structure/utils";
import { Badge } from "@workspace/ui/components/badge";
import { Metadata } from "next";
import Link from "next/link";

const category = "4.게시판";
const pageSize = 10;
const NEW_THRESHOLD_DAYS = 7;

export const metadata: Metadata = {
  title: "게시판",
  description: "연세정성내과의 공지사항과 의료 정보를 확인하실 수 있는 게시판입니다. 환자분들을 위한 유용한 건강 정보와 병원 소식을 제공합니다.",
  keywords: ["연세정성내과", "게시판", "공지사항", "의료정보", "건강정보", "병원소식"],
  openGraph: {
    title: "연세정성내과 게시판",
    description: "연세정성내과의 공지사항과 의료 정보를 확인하실 수 있는 게시판입니다. 환자분들을 위한 유용한 건강 정보와 병원 소식을 제공합니다.",
    type: "website",
    locale: "ko_KR",
    siteName: "연세정성내과",
  },
};

export default async function BoardPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  const now = new Date();

  /* 글 메타 읽기 */
  const slugs = await getSlugsByCategory(category);
  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const meta = await getPostMetadata({ category, slug });
      return { ...meta, id: `${meta.other.createdAt}-${slug}`, slug };
    }),
  ).then((l) => l.sort((a, b) => new Date(b.other.createdAt).getTime() - new Date(a.other.createdAt).getTime()));

  /* 공지 우선 */
  const ordered = [...posts.filter((p) => p.pinned), ...posts.filter((p) => !p.pinned)];

  /* 페이지네이터 */
  const totalPages = Math.ceil(ordered.length / pageSize);
  const currentPage = Math.min(Math.max(parseInt(page || "1", 10), 1), totalPages);
  const pageItems = ordered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const prevHref = currentPage > 1 ? `?page=${currentPage - 1}` : undefined;
  const nextHref = currentPage < totalPages ? `?page=${currentPage + 1}` : undefined;

  /* New 뱃지 */
  const isNew = (d: string) => (now.getTime() - +new Date(d)) / 86_400_000 <= NEW_THRESHOLD_DAYS;

  return (
    <>
      {/* SEO */}
      {/* SEO Links */}
      <div id="boardTop">
        {prevHref && <link rel="prev" href={prevHref} />}
        {nextHref && <link rel="next" href={nextHref} />}
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">게시판</h2>

        <ul className="divide-y divide-gray-200">
          {pageItems.map((post) => (
            <li key={post.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="flex items-center gap-2">
                {post.pinned && <Badge variant="destructive">공지</Badge>}
                <Link href={`/${category}/${post.slug}`} className="text-sm sm:text-[17px] text-gray-800 hover:text-blue-600 transition-colors line-clamp-1">
                  {String(post.title)}
                </Link>
                {isNew(post.other.createdAt) && <span className="bg-primary/10 text-primary text-[11px] px-1 rounded">New</span>}
              </div>
              <span className="text-sm text-gray-500 mt-1 sm:mt-0">{formatPostDate(post.other.createdAt)}</span>
            </li>
          ))}
        </ul>

        <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/4.게시판" anchor="#boardTop" className="mt-8" />
      </div>
    </>
  );
}
