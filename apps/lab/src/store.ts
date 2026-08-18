export type CommitEntry = { key: number; phase: string; duration: number };
export type LogEntry = { key: number; level: "log" | "warn" | "error"; text: string };
export type LabSnapshot = { commits: CommitEntry[]; logs: LogEntry[] };

const MAX = 200;
const EMPTY: LabSnapshot = { commits: [], logs: [] };

let snapshot: LabSnapshot = EMPTY;
let pendingCommits: CommitEntry[] = [];
let pendingLogs: LogEntry[] = [];
let flushScheduled = false;
let nextKey = 0;

const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function scheduleFlush() {
  if (flushScheduled) return;
  flushScheduled = true;

  // 실험이 렌더/커밋하는 도중에 패널을 setState 하면
  // "Cannot update a component while rendering a different component" 경고가 뜬다.
  // 마이크로태스크로 미뤄서 현재 작업이 끝난 뒤에 반영한다.
  queueMicrotask(() => {
    flushScheduled = false;
    if (pendingCommits.length === 0 && pendingLogs.length === 0) return;

    snapshot = {
      commits: [...snapshot.commits, ...pendingCommits].slice(-MAX),
      logs: [...snapshot.logs, ...pendingLogs].slice(-MAX),
    };
    pendingCommits = [];
    pendingLogs = [];
    notify();
  });
}

function reset() {
  pendingCommits = [];
  pendingLogs = [];
  snapshot = EMPTY;
}

export const labStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getSnapshot() {
    return snapshot;
  },

  /**
   * 새 실행을 시작한다. 알리지 않는 게 핵심 —
   * 이 함수는 렌더 도중에 불리므로, 여기서 구독자를 깨우면 렌더 중 setState가 된다.
   * 어차피 호출한 쪽이 곧바로 리렌더한다.
   */
  beginRun() {
    reset();
  },

  /** 버튼에서 부르는 초기화. 이건 알려야 화면이 비워진다. */
  clear() {
    reset();
    notify();
  },

  recordCommit(phase: string, duration: number) {
    pendingCommits.push({ key: nextKey++, phase, duration });
    scheduleFlush();
  },

  recordLog(level: LogEntry["level"], text: string) {
    pendingLogs.push({ key: nextKey++, level, text });
    scheduleFlush();
  },
};

function format(value: unknown) {
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.message;
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

const CAPTURED = Symbol.for("lab.console.captured");

/**
 * console을 가로채 패널에 쌓는다. 원래 console도 그대로 부르므로 DevTools는 평소와 같다.
 *
 * 표시를 globalThis에 남기는 이유: HMR로 이 모듈이 다시 실행돼도
 * 두 번 겹쳐 감싸지 않게 하려고. 겹치면 로그가 두 배로 쌓인다.
 */
export function captureConsole() {
  if (globalThis[CAPTURED]) return;
  globalThis[CAPTURED] = true;

  for (const level of ["log", "warn", "error"] as const) {
    const original = console[level].bind(console);
    console[level] = (...args: unknown[]) => {
      original(...args);
      labStore.recordLog(level, args.map(format).join(" "));
    };
  }
}
