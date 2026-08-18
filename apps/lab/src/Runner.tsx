import { resetTrace } from "@workspace/react-lab/kit";
import type { DemoModule } from "@workspace/react-lab/types";
import { Profiler, StrictMode, useEffect, useRef, useState, type ProfilerOnRenderCallback } from "react";
import { createRoot, type Root } from "react-dom/client";
import { labStore } from "./store";

const onRender: ProfilerOnRenderCallback = (_id, phase, actualDuration) => {
  labStore.recordCommit(phase, actualDuration);
};

type RunnerProps = {
  experimentId: string;
  load: () => Promise<DemoModule>;
  strictMode: boolean;
  /** 값이 바뀔 때마다 데모를 통째로 새 루트에 다시 마운트한다 */
  generation: number;
};

/**
 * 데모를 셸과 **분리된 자기 루트**에 마운트한다.
 *
 * 그냥 <Demo />로 렌더하지 않는 이유:
 * StrictMode를 켜고 끄는 것, 언제 마운트/언마운트되는지가 이 실험실의 관찰 대상이다.
 * 셸의 트리 안에 넣으면 셸의 렌더가 데모의 렌더와 같은 커밋에 섞이고,
 * 셸을 StrictMode로 감쌀지 여부가 데모에까지 전파된다.
 */
export function Runner({ experimentId, load, strictMode, generation }: RunnerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) return;

    let disposed = false;
    let root: Root | null = null;
    let container: HTMLDivElement | null = null;

    // 마운트를 마이크로태스크로 한 번 미룬다.
    //
    // 직전 실행의 unmount도 (아래 cleanup에서) 마이크로태스크로 미뤄져 있고,
    // 마이크로태스크는 FIFO다. 여기서 미루지 않으면
    // "기록 초기화 → 이전 루트 unmount → 새 루트 마운트" 순서가 되어
    // 이전 실행의 cleanup 로그가 새 실행 기록에 섞인다.
    // 미루면 "이전 루트 unmount → 기록 초기화 → 새 루트 마운트"가 되어 깨끗해진다.
    queueMicrotask(() => {
      if (disposed) return;

      setError(null);
      labStore.clear();
      resetTrace();

      // 마운트할 때마다 컨테이너를 새로 만든다.
      // 같은 DOM 노드에 createRoot를 두 번 호출하면 React가 경고한다.
      container = document.createElement("div");
      host.appendChild(container);

      root = createRoot(container, {
        onUncaughtError: (thrown: unknown) => {
          console.error(thrown);
          // 데모 루트가 에러를 처리하는 중이다. 셸 갱신은 뒤로 미룬다.
          queueMicrotask(() => {
            if (!disposed) setError(thrown instanceof Error ? thrown.message : String(thrown));
          });
        },
      });

      const mountedRoot = root;

      void load()
        .then(({ default: Demo }) => {
          if (disposed) return;
          const tree = (
            <Profiler id={experimentId} onRender={onRender}>
              <Demo />
            </Profiler>
          );
          mountedRoot.render(strictMode ? <StrictMode>{tree}</StrictMode> : tree);
        })
        .catch((thrown: unknown) => {
          if (!disposed) setError(thrown instanceof Error ? thrown.message : String(thrown));
        });
    });

    return () => {
      disposed = true;

      const mountedRoot = root;
      const mountedContainer = container;
      if (mountedRoot === null) return;

      // 다른 루트가 렌더/커밋 중일 때 동기 unmount를 하면 React가 경고한다.
      queueMicrotask(() => {
        mountedRoot.unmount();
        mountedContainer?.remove();
      });
    };
  }, [experimentId, load, strictMode, generation]);

  return (
    <div className="runner">
      <div ref={hostRef} className="runner-host" />
      {error !== null && <p className="runner-error">루트까지 올라온 에러: {error}</p>}
    </div>
  );
}
