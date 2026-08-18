import type { DemoModule } from "./types";

/**
 * 데모 지연 로더. **lab 앱 전용**이다.
 *
 * 블로그는 이 모듈을 import하지 말고, 글에서 실제로 쓰는 실험만
 * `@workspace/react-lab/experiments/<id>` 로 직접 import한다.
 * 그래야 아직 실험 중이라 깨져 있는 데모가 블로그 빌드를 막지 않는다.
 */
export const demoLoaders: Record<string, () => Promise<DemoModule>> = {
  "hooks-call-order": () => import("./experiments/hooks-call-order/demo"),
  "strict-mode-double-invoke": () => import("./experiments/strict-mode-double-invoke/demo"),
};
