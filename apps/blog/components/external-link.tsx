/** 홈 머리말과 사이트 푸터가 공유하는 조용한 링크 스타일 */
export const quietLinkClass =
  "underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground hover:text-foreground transition-colors";

export function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-baseline hover:text-foreground transition-colors"
    >
      <span className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground">
        {children}
      </span>
      <span className="text-[8px] -translate-y-1.5 ml-px">↗</span>
    </a>
  );
}
