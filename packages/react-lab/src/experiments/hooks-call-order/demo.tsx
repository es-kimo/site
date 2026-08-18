import { Component, useState, type CSSProperties, type ReactNode } from "react";

/**
 * 훅은 이름이 아니라 "호출 순서"로 슬롯에 매핑된다.
 *
 * embeddable 실험이므로 이 파일은 단일 파일이고 react 외의 import가 없다.
 * 스타일도 인라인으로만 준다. (블로그 Sandpack에 소스를 그대로 넣기 때문)
 */

const box: CSSProperties = {
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  fontSize: 14,
  lineHeight: 1.6,
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const row: CSSProperties = { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" };

const output: CSSProperties = {
  margin: 0,
  padding: 12,
  borderRadius: 8,
  background: "rgba(127, 127, 127, 0.12)",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: 13,
  whiteSpace: "pre-wrap",
};

const note: CSSProperties = { margin: 0, opacity: 0.75, fontSize: 13 };

function Slots({ withExtra }: { withExtra: boolean }) {
  if (withExtra) {
    // 일부러 규칙을 어긴다. 이 한 줄이 실험의 전부다.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useState("EXTRA");
  }

  const [a] = useState("A");
  const [b] = useState("B");

  return (
    <pre style={output}>
      {`호출한 훅: ${withExtra ? 3 : 2}개\na = ${a}\nb = ${b}`}
    </pre>
  );
}

class Catch extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <pre style={{ ...output, background: "rgba(220, 38, 38, 0.12)" }}>💥 {this.state.error.message}</pre>;
    }
    return this.props.children;
  }
}

export default function Demo() {
  const [withExtra, setWithExtra] = useState(false);
  const [generation, setGeneration] = useState(0);

  return (
    <div style={box}>
      <div style={row}>
        <label style={row}>
          <input type="checkbox" checked={withExtra} onChange={(event) => setWithExtra(event.target.checked)} />
          앞에서 훅 하나 더 호출하기
        </label>
        <button onClick={() => setGeneration((value) => value + 1)}>다시 마운트</button>
      </div>

      {/* key를 바꾸면 에러 바운더리와 Slots가 함께 새로 마운트된다 */}
      <Catch key={generation}>
        <Slots withExtra={withExtra} />
      </Catch>

      <p style={note}>
        체크를 <b>켜는 순간</b> 슬롯이 한 칸 밀린다. 그런데 그 상태로 <b>다시 마운트</b>를 누르면 멀쩡하다. 훅이 하나 더 있는 것 자체는 문제가 아니라는 뜻이다.
        문제는 <b>렌더 사이에 순서가 바뀌었다</b>는 것뿐이다.
      </p>
    </div>
  );
}
