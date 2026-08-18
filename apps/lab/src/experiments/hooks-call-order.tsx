import { Component, useState, type ReactNode } from "react";

/**
 * 훅은 이름이 아니라 "호출 순서"로 슬롯에 매핑된다.
 *
 * 1. 체크를 끈 채로 마운트한다 → 슬롯 [0]="A", [1]="B"
 * 2. 체크를 켠다 → 앞에 useState가 하나 끼어들면서 슬롯이 한 칸 밀린다
 * 3. 체크를 켠 채로 "다시 마운트" → 멀쩡하다. 훅이 하나 더 있는 것 자체는 문제가 아니다.
 */

function Slots({ withExtra }: { withExtra: boolean }) {
  if (withExtra) {
    // 일부러 규칙을 어긴다. 이 한 줄이 실험의 전부다.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useState("EXTRA");
  }

  const [a] = useState("A");
  const [b] = useState("B");

  return (
    <pre className="rounded-lg bg-black/[0.07] p-3 font-mono text-[13px] dark:bg-white/10">{`호출한 훅: ${withExtra ? 3 : 2}개\na = ${a}\nb = ${b}`}</pre>
  );
}

class Catch extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <pre className="rounded-lg bg-red-500/10 p-3 font-mono text-[13px] text-red-600 dark:text-red-400">💥 {this.state.error.message}</pre>;
    }
    return this.props.children;
  }
}

export default function Demo() {
  const [withExtra, setWithExtra] = useState(false);
  const [generation, setGeneration] = useState(0);

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex flex-wrap items-center gap-4">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={withExtra} onChange={(event) => setWithExtra(event.target.checked)} />앞에서 훅 하나 더 호출하기
        </label>
        <button className="rounded-lg border border-black/15 px-3 py-1 text-xs dark:border-white/20" onClick={() => setGeneration((value) => value + 1)}>
          다시 마운트
        </button>
      </div>

      {/* key를 바꾸면 에러 바운더리와 Slots가 함께 새로 마운트된다 */}
      <Catch key={generation}>
        <Slots withExtra={withExtra} />
      </Catch>

      <p className="text-[13px] opacity-70">
        체크를 <b>켜는 순간</b> 슬롯이 한 칸 밀린다. 그런데 그 상태로 <b>다시 마운트</b>를 누르면 멀쩡하다. 훅이 하나 더 있는 것 자체는 문제가 아니라는 뜻이다. 문제는{" "}
        <b>렌더 사이에 순서가 바뀌었다</b>는 것뿐이다.
      </p>
    </div>
  );
}
