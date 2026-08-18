import { demoLoaders } from "@workspace/react-lab/demos";
import { experiments } from "@workspace/react-lab/registry";
import type { ExperimentMeta } from "@workspace/react-lab/types";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { Runner } from "./Runner";
import { captureConsole, labStore } from "./store";

captureConsole();

function useHashId(fallback: string): string {
  const [hash, setHash] = useState(() => window.location.hash.slice(1));

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash.slice(1));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return hash === "" ? fallback : hash;
}

function Panel({ title, empty, children }: { title: string; empty: boolean; children: ReactNode }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {empty ? <p className="panel-empty">아직 없음</p> : children}
    </section>
  );
}

function Detail({ experiment }: { experiment: ExperimentMeta }) {
  const [strictMode, setStrictMode] = useState(experiment.run?.strictMode ?? false);
  const [generation, setGeneration] = useState(0);
  const { commits, logs } = useSyncExternalStore(labStore.subscribe, labStore.getSnapshot);
  const load = demoLoaders[experiment.id];

  return (
    <main className="detail">
      <header className="detail-head">
        <h1>{experiment.title}</h1>
        <ul className="tags">
          {experiment.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
          <li className={experiment.embeddable ? "tag-ok" : "tag-muted"}>{experiment.embeddable ? "블로그 임베드 가능" : "lab 전용"}</li>
        </ul>
      </header>

      <dl className="meta">
        <dt>질문</dt>
        <dd>{experiment.question}</dd>
        <dt>가설</dt>
        <dd>{experiment.hypothesis}</dd>
        {experiment.finding !== undefined && experiment.finding !== "" && (
          <>
            <dt>확인한 것</dt>
            <dd>{experiment.finding}</dd>
          </>
        )}
        {experiment.post !== undefined && (
          <>
            <dt>연결된 글</dt>
            <dd>
              <code>{experiment.post}</code>
            </dd>
          </>
        )}
      </dl>

      <div className="controls">
        <label>
          <input type="checkbox" checked={strictMode} onChange={(event) => setStrictMode(event.target.checked)} />
          StrictMode
        </label>
        <button onClick={() => setGeneration((value) => value + 1)}>다시 마운트</button>
        <button onClick={() => labStore.clear()}>기록 지우기</button>
      </div>

      {load === undefined ? (
        <p className="panel-empty">demos.ts에 {experiment.id} 로더가 없습니다</p>
      ) : (
        <Runner experimentId={experiment.id} load={load} strictMode={strictMode} generation={generation} />
      )}

      <div className="panels">
        <Panel title={`커밋 ${commits.length}`} empty={commits.length === 0}>
          <ol className="commits">
            {commits.map((commit) => (
              <li key={commit.key}>
                <span className={`phase phase-${commit.phase}`}>{commit.phase}</span>
                <span className="duration">{commit.duration.toFixed(2)}ms</span>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel title={`콘솔 ${logs.length}`} empty={logs.length === 0}>
          <ol className="logs">
            {logs.map((log) => (
              <li key={log.key} className={`log-${log.level}`}>
                {log.text}
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </main>
  );
}

export function App() {
  const first = experiments[0];
  const selectedId = useHashId(first?.id ?? "");
  const selected = experiments.find((experiment) => experiment.id === selectedId) ?? first;

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="brand">React Lab</div>
        <ul>
          {experiments.map((experiment) => (
            <li key={experiment.id}>
              <a href={`#${experiment.id}`} className={experiment.id === selected?.id ? "active" : undefined}>
                <span className="item-title">{experiment.title}</span>
                <span className="item-id">{experiment.id}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* key로 실험이 바뀔 때마다 컨트롤 상태를 그 실험의 기본값으로 되돌린다 */}
      {selected === undefined ? <main className="detail">실험이 없습니다</main> : <Detail key={selected.id} experiment={selected} />}
    </div>
  );
}
