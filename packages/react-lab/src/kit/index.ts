/**
 * 실험에서 공통으로 쓰는 계측 도구.
 *
 * 주의: `embeddable: true`인 실험은 kit을 import할 수 없다.
 * Sandpack이 워크스페이스 모듈을 해석하지 못하기 때문이다. types.ts의 설명 참고.
 */
export { RenderBadge } from "./RenderBadge";
export { resetTrace, trace, useLifecycleTrace } from "./trace";
export { useRenderCount } from "./useRenderCount";
