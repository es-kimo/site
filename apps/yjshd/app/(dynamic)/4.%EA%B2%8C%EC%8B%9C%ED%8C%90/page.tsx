import { getPostMetadata } from "@/lib/metadata";
import { formatPostDate } from "@workspace/common/lib/date";
import { getSlugsByCategory } from "@workspace/common/structure/utils";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@workspace/ui/components/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { Link } from "next-view-transitions";
import { Metadata } from "next";

const category = "4.게시판";

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

export default async function BoardPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  const currentPage = parseInt(page || "1", 10);
  const pageSize = 10;
  const slugs = await getSlugsByCategory(category);
  console.time("게시판 포스트 로딩 시간");
  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const metadata = await getPostMetadata({ category, slug });
      return { ...metadata, id: `${metadata.other.createdAt}-${slug}`, slug };
    })
  ).then((posts) => {
    const sorted = posts.sort((a, b) => new Date(b.other.createdAt).getTime() - new Date(a.other.createdAt).getTime());
    console.timeEnd("게시판 포스트 로딩 시간");
    return sorted;
  });

  const totalItems = posts.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const paginated = posts.slice(start, end);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">게시판</h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">글 제목</TableHead>
              <TableHead className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">작성자</TableHead>
              <TableHead className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">작성일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((post) => (
              <TableRow key={post.id} className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 cursor-pointer transition-colors">
                <TableCell className="px-4 py-3 text-sm text-gray-700">
                  <Link href={`/${category}/${post.slug}`} className="hover:underline">
                    {String(post.title)}
                  </Link>
                </TableCell>
                <TableCell className="px-4 py-3 text-sm text-gray-700">관리자</TableCell>
                <TableCell className="px-4 py-3 text-sm text-gray-700">{formatPostDate(post.other.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center mt-6">
        <Pagination>
          <PaginationContent className="flex items-center space-x-2">
            <PaginationItem>
              <PaginationPrevious href={`?page=${currentPage - 1}`}>이전</PaginationPrevious>
            </PaginationItem>

            {pages.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink href={`?page=${page}`} isActive={page === currentPage}>
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext href={`?page=${currentPage + 1}`}>다음</PaginationNext>
            </PaginationItem>

            {totalPages > pages.length && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
