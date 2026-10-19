import type { ReactNode } from "react";

/** 글 본문 틀. 글 페이지와 /preview가 같은 폭과 글자 크기로 그리도록 같이 쓴다. 글자 크기 변수는 `applyArticleFontSize`가 정한다. */
export function ArticleFrame({ children, before, after }: { children: ReactNode; before?: ReactNode; after?: ReactNode }) {
  return (
    <section
      style={{
        fontSize: "var(--article-font-size, 14px)",
        lineHeight: "var(--article-line-height, 1.625)",
      }}
      className="relative left-1/2 w-[calc(100vw-2rem)] max-w-[52rem] -translate-x-1/2 transition-all"
    >
      {before}
      <article className="mx-auto flex min-w-0 w-full flex-col gap-2 break-words text-foreground/90 selection:bg-primary/20">{children}</article>
      {after}
    </section>
  );
}
