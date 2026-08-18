import type { CSSProperties } from "react";
import { useRenderCount } from "./useRenderCount";

const badge: CSSProperties = {
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: 999,
  fontSize: 12,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  background: "rgba(127, 127, 127, 0.18)",
};

/** 렌더 횟수를 보여주는 작은 배지. */
export function RenderBadge({ label }: { label?: string }) {
  const count = useRenderCount();
  return (
    <span style={badge}>
      {label ? `${label} · ` : ""}render {count}
    </span>
  );
}
