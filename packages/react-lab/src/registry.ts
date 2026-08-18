import hooksCallOrder from "./experiments/hooks-call-order/meta";
import strictModeDoubleInvoke from "./experiments/strict-mode-double-invoke/meta";
import type { ExperimentMeta } from "./types";

/**
 * 실험 목록.
 *
 * 여기서는 meta만 정적으로 import한다. 데모(실제 React 코드)는 절대 들어오면 안 된다.
 * 이 모듈은 블로그처럼 "목록만 필요한" 쪽에서도 import하는데,
 * 데모가 딸려 들어오면 (1) 소비처 번들이 불어나고 (2) 깨진 실험 하나가
 * 소비처 빌드를 통째로 깨뜨린다.
 *
 * 데모 로더는 demos.ts에 따로 있다.
 */
export const experiments: ExperimentMeta[] = [hooksCallOrder, strictModeDoubleInvoke];

export function getExperiment(id: string): ExperimentMeta | undefined {
  return experiments.find((experiment) => experiment.id === id);
}

/** 특정 글에 연결된 실험들. post는 `<Category>/<slug>` 형식이다. */
export function getExperimentsByPost(post: string): ExperimentMeta[] {
  return experiments.filter((experiment) => experiment.post === post);
}
