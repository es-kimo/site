"use client";

import { useEffect, useId, useState } from "react";
import mermaid from "mermaid";
import { useTheme } from "next-themes";

export function Mermaid({ chart, children }: { chart?: string; children?: string }) {
  const content = (chart || children || "").trim();
  const rawId = useId();
  const cleanId = "m_" + rawId.replace(/[^a-zA-Z0-9_]/g, "");
  const [svg, setSvg] = useState<string>("");
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!content) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: resolvedTheme === "dark" ? "dark" : "default",
      securityLevel: "loose",
      fontFamily: "var(--font-noto-sans-kr), sans-serif",
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
      });

    return () => {
      isMounted = false;
    };
  }, [content, cleanId, resolvedTheme]);

  if (!content) return null;

  if (!svg) {
    return (
      <div className="my-8 flex justify-center items-center h-28 rounded-lg bg-muted/20 border text-sm text-muted-foreground animate-pulse">
        다이어그램 렌더링 중...
      </div>
    );
  }

  return (
    <div
      className="my-8 flex justify-center overflow-x-auto p-4 bg-muted/20 border rounded-lg [&_svg]:max-w-full [&_svg]:h-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
