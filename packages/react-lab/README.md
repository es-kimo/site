# @workspace/react-lab

React 동작 원리를 직접 코드로 확인해보는 실험 모음. **실험 소스의 단일 진실**이다.

- `apps/lab` — 실험을 격리된 루트에 마운트해서 돌려보는 호스트
- `apps/blog` — 같은 파일을 글의 예제로 재사용 (복붙하지 않는다)

## 실험 추가하기

```
src/experiments/<id>/
  meta.ts      질문 / 가설 / 확인한 것
  demo.tsx     default export 하나
  notes.md     관찰 기록 (글의 초안 재료)
```

그리고 두 곳에 등록한다.

- `src/registry.ts` — meta를 정적 import. **데모는 절대 넣지 않는다.**
- `src/demos.ts` — 데모 지연 로더

두 파일을 나눠 둔 이유가 있다. 블로그처럼 목록만 필요한 쪽은 `registry`만 import하므로,
아직 실험 중이라 깨져 있는 데모가 블로그 빌드를 막지 않는다.

## embeddable 규약

`meta.ts`의 `embeddable: true`는 "이 데모의 소스를 블로그 Sandpack에 그대로 넣을 수 있다"는 뜻이다.
Sandpack은 자체 번들러로 격리 실행되므로 워크스페이스 모듈을 해석하지 못한다. 따라서:

- 단일 파일 (`demo.tsx` 하나로 끝)
- `react` 외의 import 금지 — `kit/`도 못 쓴다
- CSS import 금지, 스타일은 인라인으로

`pnpm -F @workspace/react-lab check:embeddable`이 이 규약을 검사한다.

계측 도구(`kit/`)가 필요한 실험은 `embeddable: false`로 두고 lab에서만 돌린다.

## kit

`embeddable: false`인 실험이 쓰는 계측 도구.

| | |
| --- | --- |
| `useRenderCount()` | 몇 번째 렌더인지. 렌더 중 ref를 건드리므로 StrictMode 이중 렌더까지 그대로 센다 |
| `RenderBadge` | 위 숫자를 보여주는 배지 |
| `trace(label)` | 순번을 붙여 콘솔에 찍는다. lab의 콘솔 패널에 쌓인다 |
| `useLifecycleTrace(name)` | 렌더 → layout effect → passive effect → 각 cleanup 순서를 순번과 함께 찍는다 |

## 검사

```bash
pnpm -F @workspace/react-lab check-types
pnpm -F @workspace/react-lab lint
pnpm -F @workspace/react-lab check:embeddable
```
