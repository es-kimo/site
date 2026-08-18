export type CommitEntry = {
  key: number;
  phase: "mount" | "update" | "nested-update";
  duration: number;
};

export type LogEntry = {
  key: number;
  level: "log" | "warn" | "error";
  text: string;
};

export type LabSnapshot = {
  commits: CommitEntry[];
  logs: LogEntry[];
};

const MAX = 200;
const EMPTY: LabSnapshot = { commits: [], logs: [] };

let snapshot: LabSnapshot = EMPTY;
let pendingCommits: CommitEntry[] = [];
let pendingLogs: LogEntry[] = [];
let flushScheduled = false;
let nextKey = 0;

const listeners = new Set<() => void>();

function scheduleFlush() {
  if (flushScheduled) return;
  flushScheduled = true;

  // 실험 코드가 렌더/커밋하는 도중에 셸을 setState 하면
  // "Cannot update a component while rendering a different component" 경고가 뜬다.
  // 데모는 셸과 별도의 루트에서 돌지만 React 인스턴스는 같으므로 그대로 걸린다.
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

    for (const listener of listeners) listener();
  });
}

export const labStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getSnapshot(): LabSnapshot {
    return snapshot;
  },

  clear() {
    pendingCommits = [];
    pendingLogs = [];
    snapshot = EMPTY;
    for (const listener of listeners) listener();
  },

  recordCommit(phase: CommitEntry["phase"], duration: number) {
    pendingCommits.push({ key: nextKey++, phase, duration });
    scheduleFlush();
  },

  recordLog(level: LogEntry["level"], text: string) {
    pendingLogs.push({ key: nextKey++, level, text });
    scheduleFlush();
  },
};

function format(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.message;
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

let captured = false;

/**
 * console을 가로채 로그 패널에 쌓는다. 원래 console도 그대로 호출하므로
 * DevTools에서는 평소와 똑같이 보인다.
 */
export function captureConsole(): void {
  if (captured) return;
  captured = true;

  for (const level of ["log", "warn", "error"] as const) {
    const original = console[level].bind(console);
    console[level] = (...args: unknown[]) => {
      original(...args);
      labStore.recordLog(level, args.map(format).join(" "));
    };
  }
}
