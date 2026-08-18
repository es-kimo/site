import { useRef } from "react";

/**
 * 이 컴포넌트가 몇 번째 렌더인지 돌려준다. 첫 렌더에 1.
 *
 * 렌더 도중에 ref를 변경하므로 엄밀히는 순수하지 않다. 의도한 것이다.
 * StrictMode의 이중 렌더나 버려진 렌더(concurrent에서 중단된 렌더)까지
 * 그대로 세어야 실험에서 관찰할 값이 나온다.
 */
export function useRenderCount(): number {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}
