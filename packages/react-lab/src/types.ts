import type { ComponentType } from "react";

/** 실험을 실행할 조건. lab 앱의 Runner가 이 값을 토글한다. */
export interface RunOptions {
  /** 데모를 StrictMode로 감쌀지 */
  strictMode: boolean;
}

export interface ExperimentMeta {
  /** 폴더 이름과 같아야 한다 */
  id: string;
  title: string;
  /** 이 실험이 답하려는 질문 */
  question: string;
  /** 실험 전에 세운 가설 */
  hypothesis: string;
  /** 실험으로 확인한 사실. 아직 안 끝났으면 비워둔다 */
  finding?: string;
  tags: string[];
  /** 기본 실행 조건 */
  run?: Partial<RunOptions>;
  /** 연결된 블로그 글. `<Category>/<slug>` 형식 */
  post?: string;
  /**
   * 블로그의 Sandpack에 소스를 그대로 넣을 수 있는지.
   *
   * Sandpack은 자체 번들러로 격리 실행되기 때문에 워크스페이스 모듈을 해석하지 못한다.
   * 따라서 true인 실험의 demo.tsx는 **단일 파일**이어야 하고 `react` 외의 import가 없어야 한다.
   * (kit/ 사용 금지, CSS import 금지, 스타일은 인라인으로)
   *
   * scripts/check-embeddable.mjs 가 이 규약을 검사한다.
   */
  embeddable: boolean;
}

/** demo.tsx가 default export해야 하는 모양 */
export type DemoModule = { default: ComponentType };

/** meta.ts에서 쓰는 항등 함수. 타입 추론과 자동완성을 위해 있다. */
export function defineExperiment(meta: ExperimentMeta): ExperimentMeta {
  return meta;
}
