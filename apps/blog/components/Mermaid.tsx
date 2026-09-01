"use client";

import { useEffect, useId, useState } from "react";
import mermaid from "mermaid";
import { useTheme } from "next-themes";
import { Workflow } from "lucide-react";

export function Mermaid({ chart, children }: { chart?: string; children?: string }) {
  const content = (chart || children || "").trim();
  const rawId = useId();
  const cleanId = "m_" + rawId.replace(/[^a-zA-Z0-9_]/g, "");
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!content) return;
    setError(false);
    setSvg("");

    mermaid.initialize({
      startOnLoad: false,
      theme: resolvedTheme === "dark" ? "dark" : "default",
      securityLevel: "loose",
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    });

    let isMounted = true;
    mermaid
      .render(cleanId, content)
      .then(({ svg }) => {
        if (isMounted) {
          setSvg(svg);
        }
      })
      .catch((err) => {
        console.error("Mermaid rendering error:", err);
        if (isMounted) setError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [content, cleanId, resolvedTheme]);

  if (!content) return null;

  if (error) {
    return (
      <figure className="my-4 overflow-hidden rounded-lg border border-[var(--markdown-soft-border)] bg-[var(--markdown-panel-background)] shadow-sm">
        <DiagramHeader />
        <div role="alert" className="px-4 py-8 text-center text-xs text-muted-foreground">다이어그램을 표시하지 못했습니다.</div>
      </figure>
    );
  }

  if (!svg) {
    return (
      <figure className="my-4 overflow-hidden rounded-lg border border-[var(--markdown-soft-border)] bg-[var(--markdown-panel-background)] shadow-sm">
        <DiagramHeader />
        <div className="flex h-28 animate-pulse items-center justify-center bg-[var(--markdown-soft-surface)] text-xs text-muted-foreground">다이어그램 렌더링 중...</div>
      </figure>
    );
  }

  return (
    <figure className="my-4 overflow-hidden rounded-lg border border-[var(--markdown-soft-border)] bg-[var(--markdown-panel-background)] shadow-sm">
      <DiagramHeader />
      <div className="flex justify-center overflow-x-auto p-4 [&_svg]:h-auto [&_svg]:max-w-full" dangerouslySetInnerHTML={{ __html: svg }} />
    </figure>
  );
}

function DiagramHeader() {
  return (
    <figcaption className="flex items-center justify-between gap-3 border-b border-[var(--markdown-soft-border)] px-3 py-2">
      <span className="flex items-center gap-2 text-xs font-medium text-foreground/70">
        <Workflow aria-hidden="true" className="size-3.5 text-[var(--markdown-link)]" strokeWidth={1.8} />
        한눈에 보기
      </span>
      <span className="text-[10px] text-muted-foreground">다이어그램</span>
    </figcaption>
  );
}
