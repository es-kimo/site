# 실험

`src/experiments/` 안의 `.tsx` 파일 하나가 실험 하나다. 파일을 만들면 사이드바에 바로 뜬다.
등록할 곳은 없다.

```tsx
export default function Demo() {
  return <div>...</div>;
}
```

파일이 여러 개 필요하면 `src/experiments/<이름>/index.tsx`로 두면 된다.
사이드바에 뜨는 이름은 파일 이름 그대로다. 한글 파일명도 된다.

## 딱 하나 지켜야 하는 것

**default export 말고 다른 걸 export하지 마라.**

컴포넌트가 아닌 값을 export하면 React Fast Refresh가 그 파일을 포기하고
페이지를 통째로 새로고침한다. 입력하던 값도 렌더 카운터도 다 날아간다.
바깥에서 쓸 일 없는 헬퍼는 `export` 없이 파일 안에 그냥 두면 된다.

## 쓸 수 있는 것

- Tailwind — 그냥 className에 쓰면 된다
- `../kit` — `useRenderCount`, `RenderBadge`, `trace`, `useLifecycleTrace` (안 써도 된다)
- 화면 위쪽의 StrictMode 토글 / 다시 마운트 버튼은 알아서 붙는다
- `console.log`는 아래 콘솔 패널에도 쌓인다
