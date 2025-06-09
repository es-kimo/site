import { getPostMetadata } from "@/lib/metadata";
import { formatPostDate } from "@workspace/common/lib/date";
import { getSlugsByCategory } from "@workspace/common/structure/utils";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@workspace/ui/components/pagination";
import { Link } from "next-view-transitions";
import { Metadata } from "next";

const category = "4.게시판";
const NEW_THRESHOLD_DAYS = 3; // New 뱃지 표시 기준

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
  robots: {
    index: true,
    follow: true,
  },
  authors: [{ name: "연세정성내과" }],
  creator: "연세정성내과",
  publisher: "연세정성내과",
};

function getVisiblePages(totalPages: number, currentPage: number) {
  const pages: (number | string)[] = [];
  if (currentPage > 2) {
    pages.push(1, "...");
  }
  for (let i = currentPage - 1; i <= currentPage + 1; i++) {
    if (i >= 1 && i <= totalPages) {
      pages.push(i);
    }
  }
  if (currentPage < totalPages - 1) {
    pages.push("...", totalPages);
  }
  return pages;
}

export default async function BoardPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  const currentPage = Math.max(parseInt(page || "1", 10), 1);
  const pageSize = 10;

  // 1) 모든 글 불러오기 & 정렬
  const slugs = await getSlugsByCategory(category);
  console.time("게시판 포스트 로딩 시간");
  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const meta = await getPostMetadata({ category, slug });
      return {
        ...meta,
        id: `${meta.other.createdAt}-${slug}`,
        slug,
      };
    })
  ).then((list) => {
    const sorted = list.sort((a, b) => new Date(b.other.createdAt).getTime() - new Date(a.other.createdAt).getTime());
    console.timeEnd("게시판 포스트 로딩 시간");
    return sorted;
  });

  // 2) 공지글(pinned) 먼저, 나머지 글 뒤에
  const pinned = posts.filter((p) => p.other.pinned);
  const normal = posts.filter((p) => !p.other.pinned);
  const ordered = [...pinned, ...normal];

  // 3) 페이징
  const totalItems = ordered.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const start = (currentPage - 1) * pageSize;
  const paginated = ordered.slice(start, start + pageSize);

  // 4) New 뱃지 표시 여부 체크
  const now = new Date();
  const isNewPost = (createdAt: string) => {
    const diffDays = (now.getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= NEW_THRESHOLD_DAYS;
  };

  const visiblePages = getVisiblePages(totalPages, currentPage);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">게시판</h2>

      <ul className="divide-y divide-gray-200">
        {paginated.map((post) => (
          <li key={post.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex items-center space-x-2">
              {post.other.pinned && <span className="bg-red-500 text-white text-xs px-1 rounded">공지</span>}
              <Link href={`/${category}/${post.slug}`} className="text-lg text-gray-800 hover:text-blue-600">
                {String(post.title)}
              </Link>
              {isNewPost(post.other.createdAt) && <span className="bg-blue-100 text-blue-600 text-xs px-1 rounded">New</span>}
            </div>
            <div className="text-sm text-gray-500 mt-1 sm:mt-0">관리자 • {formatPostDate(post.other.createdAt)}</div>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <nav role="navigation" aria-label="페이지 네비게이션" className="flex justify-center mt-6">
        <Pagination>
          <PaginationContent className="flex items-center space-x-2">
            {/* 처음, 이전 */}
            <PaginationItem>
              <PaginationLink href={`?page=1`} aria-label="첫 페이지" disabled={currentPage === 1}>
                «
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationPrevious href={`?page=${currentPage - 1}`} disabled={currentPage === 1} />
            </PaginationItem>

            {/* 숫자 페이지 */}
            {visiblePages.map((p, idx) =>
              typeof p === "string" ? (
                <PaginationItem key={`el-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink href={`?page=${p}`} isActive={p === currentPage} aria-current={p === currentPage ? "page" : undefined}>
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            {/* 다음, 마지막 */}
            <PaginationItem>
              <PaginationNext href={`?page=${currentPage + 1}`} disabled={currentPage === totalPages} />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href={`?page=${totalPages}`} aria-label="마지막 페이지" disabled={currentPage === totalPages}>
                »
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </nav>
    </div>
  );
}
