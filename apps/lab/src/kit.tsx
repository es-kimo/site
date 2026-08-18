import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * 실험에서 쓰는 계측 도구. 안 써도 된다.
 * trace 계열의 출력은 화면 아래 콘솔 패널에 순번과 함께 쌓인다.
 */

/**
 * 몇 번째 렌더인지. 첫 렌더에 1.
 * 렌더 중에 ref를 건드리므로 순수하지 않다. 의도한 것이다 —
 * StrictMode의 이중 렌더까지 그대로 세야 관찰할 값이 나온다.
 */
export function useRenderCount() {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}

/** 렌더 횟수 배지 */
export function RenderBadge({ label }: { label?: string }) {
  const count = useRenderCount();
  return (
    <span className="inline-block rounded-full bg-black/10 px-2 py-0.5 font-mono text-xs dark:bg-white/15">
      {label ? `${label} · ` : ""}render {count}
    </span>
  );
}

let sequence = 0;

/** 순번을 0으로 되돌린다. 실험을 다시 마운트할 때 자동으로 불린다. */
export function resetTrace() {
  sequence = 0;
}

/** 순번을 붙여 콘솔에 찍는다. "몇 번"보다 "무엇이 먼저"를 보려는 용도다. */
export function trace(label: string, ...args: unknown[]) {
  sequence += 1;
  console.log(`#${String(sequence).padStart(2, "0")} ${label}`, ...args);
}

/** 렌더 → layout effect → passive effect → 각 cleanup 순서를 순번과 함께 찍는다. */
export function useLifecycleTrace(name: string) {
  trace(`${name} render`);

  useLayoutEffect(() => {
    trace(`${name} layout effect`);
    return () => trace(`${name} layout cleanup`);
  });

  useEffect(() => {
    trace(`${name} effect`);
    return () => trace(`${name} effect cleanup`);
  });
}
