import type { CSSProperties } from "react";
import { useState } from "react";
import { RenderBadge, useLifecycleTrace } from "../../kit";

/**
 * StrictMode 토글의 효과를 눈으로 보기 위한 실험.
 *
 * 위쪽 컨트롤바의 StrictMode를 켜고 끄면서 콘솔 패널의 순번을 비교한다.
 * 커밋 패널의 개수도 같이 본다 — 렌더는 두 번이어도 커밋은 한 번이다.
 */

const box: CSSProperties = { display: "flex", flexDirection: "column", gap: 12, fontSize: 14 };
const row: CSSProperties = { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" };

function Child({ label }: { label: string }) {
  useLifecycleTrace(label);
  return (
    <div style={row}>
      <span>{label}</span>
      <RenderBadge label={label} />
    </div>
  );
}

export default function Demo() {
  const [tick, setTick] = useState(0);
  const [childMounted, setChildMounted] = useState(true);

  useLifecycleTrace("Demo");

  return (
    <div style={box}>
      <div style={row}>
        <button onClick={() => setTick((value) => value + 1)}>업데이트 ({tick})</button>
        <button onClick={() => setChildMounted((value) => !value)}>{childMounted ? "Child 언마운트" : "Child 마운트"}</button>
        <RenderBadge label="Demo" />
      </div>

      {childMounted && <Child label="Child" />}
    </div>
  );
}
