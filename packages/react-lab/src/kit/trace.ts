import { useEffect, useLayoutEffect } from "react";

let sequence = 0;

/** 순번을 0으로 되돌린다. 실험을 다시 마운트할 때 쓴다. */
export function resetTrace(): void {
  sequence = 0;
}

/**
 * 순번을 붙여 콘솔에 찍는다.
 * "무엇이 몇 번 일어났는가"보다 "무엇이 먼저 일어났는가"를 보려는 용도다.
 */
export function trace(label: string, ...args: unknown[]): void {
  sequence += 1;
  console.log(`#${String(sequence).padStart(2, "0")} ${label}`, ...args);
}

/**
 * 렌더 → layout effect → passive effect → 각 cleanup 순서를 순번과 함께 찍는다.
 *
 * 렌더 중에 콘솔을 찍는 것도 의도한 것이다. StrictMode를 켰을 때
 * 렌더만 두 번 찍히고 effect는 mount→unmount→mount로 찍히는 걸 눈으로 보기 위함이다.
 */
export function useLifecycleTrace(name: string): void {
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
