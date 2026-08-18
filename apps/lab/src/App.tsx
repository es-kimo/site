import { Component, Profiler, StrictMode, memo, useEffect, useState, useSyncExternalStore, type ComponentType, type ReactNode } from "react";
import { resetTrace } from "./kit";
import { captureConsole, labStore } from "./store";

captureConsole();

/**
 * src/experiments/ 안의 .tsx 파일 하나가 실험 하나다.
 * 파일을 만들면 사이드바에 바로 뜬다. 등록할 곳은 없다.
 */
const found = Object.entries(
  import.meta.glob<{ default?: ComponentType }>(["./experiments/*.tsx", "./experiments/*/index.tsx"], { eager: true })
)
  .map(([path, module]) => ({
    name: path.replace("./experiments/", "").replace(/\/index\.tsx$/, "").replace(/\.tsx$/, ""),
    Demo: module.default,
  }))
  .filter((experiment) => experiment.Demo)
  .sort((a, b) => a.name.localeCompare(b.name));

class Boundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <pre className="overflow-x-auto rounded-lg bg-red-500/10 p-3 font-mono text-sm text-red-600 dark:text-red-400">💥 {this.state.error.message}</pre>
      );
    }
    return this.props.children;
  }
}

/**
 * 실험이 도는 자리.
 *
 * memo인 이유: 아래 패널이 로그 때문에 리렌더될 때 실험까지 덩달아 리렌더되면
 * 렌더 횟수 측정이 통째로 무의미해진다. props가 그대로면 여기는 건드리지 않는다.
 *
 * StrictMode는 별도 루트가 필요 없다. 그냥 서브트리를 감싸면 된다.
 */
const DemoHost = memo(function DemoHost({ name, Demo, strict }: { name: string; Demo: ComponentType; strict: boolean }) {
  const tree = (
    <Boundary>
      <Demo />
    </Boundary>
  );

  return (
    <Profiler id={name} onRender={(_id, phase, duration) => labStore.recordCommit(phase, duration)}>
      {strict ? <StrictMode>{tree}</StrictMode> : tree}
    </Profiler>
  );
});

/**
 * 커밋/콘솔 패널.
 *
 * store 구독이 여기에만 있는 게 중요하다. 위쪽(Detail)에서 구독하면
 * 로그가 쌓일 때마다 실험이 통째로 리렌더된다.
 */
function Panels() {
  const { commits, logs } = useSyncExternalStore(labStore.subscribe, labStore.getSnapshot);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="overflow-hidden rounded-lg border border-black/10 dark:border-white/15">
        <h2 className="border-b border-black/10 bg-black/5 px-3 py-2 text-xs font-semibold tracking-wider uppercase opacity-60 dark:border-white/15 dark:bg-white/5">커밋 {commits.length}</h2>
        <ol className="max-h-60 overflow-auto p-1.5 font-mono text-xs">
          {commits.map((commit) => (
            <li key={commit.key} className="flex justify-between gap-3 rounded px-1.5 py-0.5 even:bg-black/5 dark:even:bg-white/5">
              <span className={commit.phase === "mount" ? "text-blue-600 dark:text-blue-400" : ""}>{commit.phase}</span>
              <span className="opacity-50">{commit.duration.toFixed(2)}ms</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="overflow-hidden rounded-lg border border-black/10 dark:border-white/15">
        <h2 className="border-b border-black/10 bg-black/5 px-3 py-2 text-xs font-semibold tracking-wider uppercase opacity-60 dark:border-white/15 dark:bg-white/5">콘솔 {logs.length}</h2>
        <ol className="max-h-60 overflow-auto p-1.5 font-mono text-xs">
          {logs.map((log) => (
            <li
              key={log.key}
              className={`rounded px-1.5 py-0.5 break-words whitespace-pre-wrap even:bg-black/5 dark:even:bg-white/5 ${
                log.level === "error" ? "text-red-600 dark:text-red-400" : log.level === "warn" ? "text-amber-600 dark:text-amber-400" : ""
              }`}
            >
              {log.text}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Detail({ name, Demo }: { name: string; Demo: ComponentType }) {
  const [strict, setStrict] = useState(false);
  const [generation, setGeneration] = useState(0);

  const runId = `${name}:${strict}:${generation}`;
  const [startedRun, setStartedRun] = useState(runId);

  // 실행 조건이 바뀌면 기록을 비우고 순번을 되돌린다.
  // effect가 아니라 렌더 중에 하는 이유: effect는 자식이 먼저 돌기 때문에
  // 새 실험의 마운트 로그가 쌓인 뒤에 지워버린다.
  if (startedRun !== runId) {
    setStartedRun(runId);
    labStore.beginRun();
    resetTrace();
  }

  return (
    <main className="flex min-w-0 flex-col gap-5 p-6 lg:p-8">
      <h1 className="font-mono text-lg font-semibold">{name}</h1>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={strict} onChange={(event) => setStrict(event.target.checked)} />
          StrictMode
        </label>
        <button className="rounded-lg border border-black/15 px-3 py-1 text-xs hover:border-blue-500 hover:text-blue-600 dark:border-white/20" onClick={() => setGeneration((value) => value + 1)}>
          다시 마운트
        </button>
        <button className="rounded-lg border border-black/15 px-3 py-1 text-xs hover:border-blue-500 hover:text-blue-600 dark:border-white/20" onClick={() => labStore.clear()}>
          기록 지우기
        </button>
      </div>

      <div className="rounded-lg border border-black/10 p-5 dark:border-white/15">
        <DemoHost key={runId} name={name} Demo={Demo} strict={strict} />
      </div>

      <Panels />
    </main>
  );
}

export function App() {
  const [hash, setHash] = useState(() => decodeURIComponent(window.location.hash.slice(1)));

  useEffect(() => {
    const onHashChange = () => setHash(decodeURIComponent(window.location.hash.slice(1)));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const selected = found.find((experiment) => experiment.name === hash) ?? found[0];

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)]">
      <nav className="border-b border-black/10 bg-black/[0.03] p-3 md:border-r md:border-b-0 dark:border-white/15 dark:bg-white/[0.03]">
        <div className="px-2 pb-3 text-xs font-semibold tracking-wider uppercase opacity-50">React Lab</div>
        <ul className="flex flex-col gap-0.5">
          {found.map((experiment) => (
            <li key={experiment.name}>
              <a
                href={`#${encodeURIComponent(experiment.name)}`}
                className={`block rounded-lg px-2.5 py-1.5 font-mono text-[13px] ${
                  experiment.name === selected?.name ? "bg-blue-500/15 text-blue-700 dark:text-blue-300" : "hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                {experiment.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {selected ? (
        <Detail name={selected.name} Demo={selected.Demo!} />
      ) : (
        <main className="p-8 text-sm opacity-60">src/experiments/ 에 .tsx 파일을 만들면 여기 뜹니다.</main>
      )}
    </div>
  );
}
