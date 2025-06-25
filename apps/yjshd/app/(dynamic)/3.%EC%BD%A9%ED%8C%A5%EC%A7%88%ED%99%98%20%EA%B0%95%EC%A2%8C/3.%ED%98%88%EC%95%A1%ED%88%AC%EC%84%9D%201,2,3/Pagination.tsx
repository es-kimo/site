"use client";

import { Button } from "@workspace/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  nextPageToken?: string;
  prevPageToken?: string;
  currentPageToken?: string;
}

export default function Pagination({ nextPageToken, prevPageToken, currentPageToken }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigateToPage = (pageToken: string | undefined) => {
    const params = new URLSearchParams([...searchParams.entries()]);

    if (pageToken) {
      params.set("pageToken", pageToken);
    } else {
      params.delete("pageToken");
    }

    router.push(`/3.콩팥질환 강좌/3.혈액투석 1,2,3?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-center gap-4 py-8">
      <Button variant="outline" onClick={() => navigateToPage(prevPageToken)} disabled={!prevPageToken} className="flex items-center gap-2">
        <ChevronLeft className="w-4 h-4" />
        이전
      </Button>

      <div className="text-sm text-gray-600">{currentPageToken ? "다음 페이지" : "첫 페이지"}</div>

      <Button variant="outline" onClick={() => navigateToPage(nextPageToken)} disabled={!nextPageToken} className="flex items-center gap-2">
        다음
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
