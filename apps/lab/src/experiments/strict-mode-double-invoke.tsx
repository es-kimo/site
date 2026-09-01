import { useState } from "react";
import { RenderBadge, useLifecycleTrace } from "../kit";

/**
 * StrictMode는 무엇을 두 번 부르고 무엇을 두 번 부르지 않는가.
 *
 * 위쪽 StrictMode를 켜고 끄면서 콘솔 패널의 순번을 비교한다.
 * 커밋 패널의 개수도 같이 본다 — 렌더는 두 번이어도 커밋은 한 번이다.
 */

function Child({ label }: { label: string }) {
  useLifecycleTrace(label);
  return (
    <div className="flex items-center gap-2.5">
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
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex flex-wrap items-center gap-2.5">
        <button className="rounded-lg border border-black/15 px-3 py-1 text-xs dark:border-white/20" onClick={() => setTick((value) => value + 1)}>
          업데이트 ({tick})
        </button>
        <button className="rounded-lg border border-black/15 px-3 py-1 text-xs dark:border-white/20" onClick={() => setChildMounted((value) => !value)}>
          {childMounted ? "Child 언마운트" : "Child 마운트"}
        </button>
        <RenderBadge label="Demo" />
      </div>

      {childMounted && <Child label="Child" />}
    </div>
  );
}
