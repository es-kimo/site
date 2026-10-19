import { ArticleFrame } from "@/components/article-frame";
import type { Metadata } from "next";
import { PreviewClient } from "./preview-client";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** 에디터가 iframe으로 띄워 MDX 원문을 보내면 글 페이지와 같은 틀에 그린다. 사이트 틀(섬·푸터·여백)은 두지 않는다. */
export default function PreviewPage() {
  return (
    <ArticleFrame>
      <PreviewClient />
    </ArticleFrame>
  );
}
