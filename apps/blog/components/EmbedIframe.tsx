type EmbedIframeProps = {
  src: string;
  title: string;
  height?: number;
};

export function EmbedIframe({ src, title, height = 4300 }: EmbedIframeProps) {
  return (
    <figure className="my-4 overflow-hidden rounded-lg border border-[var(--markdown-soft-border)] bg-[var(--markdown-panel-background)] shadow-sm">
      <figcaption className="flex items-center justify-between gap-3 border-b border-[var(--markdown-soft-border)] px-3 py-2">
        <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-foreground/70">
          <PanelsTopLeft aria-hidden="true" className="size-3.5 shrink-0 text-[var(--markdown-link)]" strokeWidth={1.8} />
          함께 보기
        </span>
        <span className="truncate text-[10px] text-muted-foreground">{title}</span>
      </figcaption>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        scrolling="auto"
        style={{
          width: "100%",
          height,
          border: 0,
          background: "#fff",
        }}
      />
    </figure>
  );
}
import { PanelsTopLeft } from "lucide-react";
