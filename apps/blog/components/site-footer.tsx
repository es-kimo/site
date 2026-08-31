import { ExternalLink, quietLinkClass } from "@/components/external-link";

export function SiteFooter() {
  return (
    // 글 푸터는 본문 폭 안으로 들여 그은 선을, 사이트 푸터는 화면을 가로지르는 선을 쓴다
    <footer className="no-print border-t border-border">
      <div className="mx-auto flex max-w-blog flex-wrap items-baseline justify-between gap-x-4 gap-y-2 px-4 py-6 text-xs text-muted-foreground">
        <span className="tabular-nums">© {new Date().getFullYear()} Kihyun Ryu</span>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <ExternalLink href="https://github.com/es-kimo">GitHub</ExternalLink>
          <ExternalLink href="https://x.com/ryurlah">X</ExternalLink>
          <a href="/feed.xml" className={quietLinkClass}>
            RSS
          </a>
        </div>
      </div>
    </footer>
  );
}
