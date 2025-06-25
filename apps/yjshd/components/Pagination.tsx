import PaginationLink from "@/components/PaginationLink";
import { Pagination as PaginationRoot, PaginationContent, PaginationItem } from "@workspace/ui/components/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  anchor?: string;
  className?: string;
}

function buildPages(total: number, current: number) {
  const out: (number | "…")[] = [];
  const sibling = 1;
  const first = 1;
  const last = total;

  out.push(first);

  const left = Math.max(current - sibling, first + 1);
  const right = Math.min(current + sibling, last - 1);

  if (left > first + 1) out.push("…");
  for (let i = left; i <= right; i++) out.push(i);
  if (right < last - 1) out.push("…");

  if (last !== first) out.push(last);
  return out;
}

export default function Pagination({ currentPage, totalPages, baseUrl, anchor = "", className = "" }: PaginationProps) {
  const pages = buildPages(totalPages, currentPage);
  const prevHref = currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}${anchor}` : undefined;
  const nextHref = currentPage < totalPages ? `${baseUrl}?page=${currentPage + 1}${anchor}` : undefined;

  return (
    <nav aria-label="페이지 네비게이션" className={className}>
      <PaginationRoot>
        <PaginationContent className="flex items-center justify-center gap-1">
          {/* First */}
          <PaginationItem className="hidden sm:block">
            <PaginationLink href={`${baseUrl}?page=1${anchor}`} aria-label="첫 페이지" className={`${prevHref ? "" : "pointer-events-none opacity-50"}`}>
              «
            </PaginationLink>
          </PaginationItem>

          {/* Prev */}
          <PaginationItem className="hidden sm:block">
            <PaginationLink href={prevHref || "#"} aria-disabled={!prevHref} aria-label="이전 페이지" className={`${prevHref ? "" : "pointer-events-none opacity-50"}`}>
              <ChevronLeft className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>

          {/* 숫자 & Ellipsis */}
          {pages.map((p, idx) =>
            typeof p === "number" ? (
              <PaginationItem key={idx}>
                <PaginationLink href={`${baseUrl}?page=${p}${anchor}`} isActive={p === currentPage}>
                  {p}
                </PaginationLink>
              </PaginationItem>
            ) : (
              <li key={idx} className="px-3 py-2 min-w-11 min-h-11 flex items-center justify-center text-gray-400 select-none">
                …
              </li>
            )
          )}

          {/* Next */}
          <PaginationItem className="hidden sm:block">
            <PaginationLink href={nextHref || "#"} aria-disabled={!nextHref} aria-label="다음 페이지" className={`${nextHref ? "" : "pointer-events-none opacity-50"}`}>
              <ChevronRight className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>

          {/* Last */}
          <PaginationItem className="hidden sm:block">
            <PaginationLink href={`${baseUrl}?page=${totalPages}${anchor}`} aria-label="마지막 페이지" className={`${nextHref ? "" : "pointer-events-none opacity-50"}`}>
              »
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </PaginationRoot>
    </nav>
  );
}
