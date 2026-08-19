/* ═══════════════════════════════════════════════════════════════
   MINI REACT FIBER — LEVEL 1
   Fiber 자료구조 + Work Loop

   대응하는 실제 React 코드:
   - packages/react-reconciler/src/ReactFiber.js
   - packages/react-reconciler/src/ReactFiberWorkLoop.js

   이번 단계에서는 하지 않는 것:
   ✗ JSX
   ✗ ReactElement
   ✗ reconciliation
   ✗ DOM
   ✗ state
   ✗ hook
   ✗ scheduler
   ✗ lane

   목표:
   "이미 만들어져 있는 Fiber Tree"를 React 방식으로 순회한다.

   핵심 규칙:
   재귀 호출로 tree를 순회하면 실패.
   반드시 child / sibling / return 포인터만 사용한다.
   ═══════════════════════════════════════════════════════════════ */

type WorkTag = "HostRoot" | "FunctionComponent" | "HostComponent";

type Props = Record<string, unknown>;

type Fiber = {
  /* ─────────────────────────────────────────────────────────────
     Fiber 자신의 정체
     실제 React의 FiberNode에도 대응되는 필드가 있다.
     ───────────────────────────────────────────────────────────── */

  tag: WorkTag;

  /** 학습용 이름.
   * 실제 React에는 이런 debugName 필드는 없다.
   * console trace를 보기 위해 추가했다. */
  debugName: string;

  type: string | null;
  key: string | null;

  /* ─────────────────────────────────────────────────────────────
     Tree 구조

           parent
             │
           child
             │
         ┌───┴────┐
       fiber → sibling → sibling

     return은 parent를 가리킨다.

     실제 React에서 parent라는 이름 대신 return을 쓰는 이유도
     나중에 생각해볼 것.
     ───────────────────────────────────────────────────────────── */

  return: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  index: number;

  /* ─────────────────────────────────────────────────────────────
     Props

     pendingProps:
       이번 render에서 사용할 새 props

     memoizedProps:
       마지막으로 작업을 끝낸 props

     Level 1에서는 거의 쓰지 않지만 실제 구조를 미리 넣어둔다.
     ───────────────────────────────────────────────────────────── */

  pendingProps: Props | null;
  memoizedProps: Props | null;

  /* ─────────────────────────────────────────────────────────────
     나중을 위한 필드

     flags:
       이 Fiber 자체가 commit 때 해야 할 작업

     subtreeFlags:
       자손 중 commit할 작업이 있는지 요약

     alternate:
       current ↔ workInProgress 연결

     Level 1에서는 사용하지 않는다.
     ───────────────────────────────────────────────────────────── */

  flags: number;
  subtreeFlags: number;

  alternate: Fiber | null;
};

/* ═══════════════════════════════════════════════════════════════
   PART 1 — Fiber 생성
   대응: ReactFiber.js
   ═══════════════════════════════════════════════════════════════ */

/**
 * Fiber 하나를 만든다.
 *
 * React Element도 DOM도 아니다.
 *
 * Fiber는 React가 render 작업을 수행하기 위해 사용하는
 * "작업 단위(work unit)"라고 생각하면 된다.
 */
function createFiber(tag: WorkTag, debugName: string, pendingProps: Props | null = null): Fiber {
  // TODO 1-1
  //
  // 위 Fiber 타입의 모든 필드를 초기화해라.
  //
  // tree pointer:
  //   return   → null
  //   child    → null
  //   sibling  → null
  //   index    → 0
  //
  // render:
  //   memoizedProps → null
  //
  // effect:
  //   flags        → 0
  //   subtreeFlags → 0
  //
  // double buffering:
  //   alternate → null

  const fiber: Fiber = {
    key: "",
    type: "",

    tag,
    debugName,
    pendingProps,

    return: null,
    child: null,
    sibling: null,
    index: 0,

    memoizedProps: null,

    flags: 0,
    subtreeFlags: 0,

    alternate: null,
  };

  return fiber;
  throw new Error("TODO 1-1");
}

/* ═══════════════════════════════════════════════════════════════
   PART 2 — Fiber Tree 연결

   실제 React에서는 reconciliation 과정이 이 연결을 만든다.

   Level 1에서는 reconciliation을 아직 배우지 않았으므로
   테스트용 tree만 수동으로 만들어준다.
   ═══════════════════════════════════════════════════════════════ */

/**
 * parent 밑에 children을 연결한다.
 *
 * 예:
 *
 * linkChildren(app, [header, main, footer])
 *
 *
 *       App
 *        │ child
 *        ▼
 *     Header ─sibling→ Main ─sibling→ Footer
 *
 * 각 child의 return은 App이다.
 */
function linkChildren(parent: Fiber, children: Fiber[]): void {
  if (children.length === 0) {
    parent.child = null;
    return;
  }

  // TODO 1-2
  //
  // 해야 할 일:
  //
  // 1. parent.child가 첫 번째 child를 가리키게 한다.
  //
  // 2. 모든 child.return = parent
  //
  // 3. child.index를 배열 위치로 넣는다.
  //
  // 4. 이전 child.sibling이 다음 child를 가리키게 한다.
  //
  // 마지막 sibling은 null이어야 한다.
  parent.child = children[0];
  children[0].index = 0;
  children[0].return = parent;
  for (let i = 1; i < children.length; i++) {
    children[i - 1].sibling = children[i];
    children[i].index = i;
    children[i].return = parent;
  }
}

/* ═══════════════════════════════════════════════════════════════
   PART 3 — Work Loop
   대응: ReactFiberWorkLoop.js
   ═══════════════════════════════════════════════════════════════ */

/**
 * React가 "현재 처리하고 있는 Fiber".
 *
 * 실제 React에서도 module-level 변수로
 * workInProgress를 들고 있다.
 */
let workInProgress: Fiber | null = null;

/**
 * 실행 순서를 눈으로 보기 위한 학습용 로그.
 */
const trace: string[] = [];

/**
 * 새로운 render를 시작한다.
 *
 * 이번 단계에서는 이미 만들어놓은 root부터 작업을 시작한다.
 *
 * Level 3에서는 여기서
 *
 *   current root
 *       ↓
 *   createWorkInProgress(current)
 *
 * 흐름이 추가된다.
 */
function prepareFreshStack(root: Fiber): void {
  // TODO 1-3
  //
  // workInProgress를 어디서 시작해야 할까?
  workInProgress = root;
}

/**
 * synchronous render loop.
 *
 * 실제 React 구조와 거의 동일한 핵심 형태다.
 */
function workLoopSync(): void {
  // TODO 1-4
  //
  // workInProgress가 존재하는 동안
  // performUnitOfWork를 반복한다.
  //
  // 주의:
  // performUnitOfWork의 반환값을 여기서 받을 필요는 없다.
  // 함수 내부에서 workInProgress를 갱신하도록 만들 것이다.
  while (workInProgress) {
    performUnitOfWork(workInProgress);
  }
}

/* ═══════════════════════════════════════════════════════════════
   PART 4 — begin phase

   React render phase는 크게:

              begin
               ↓
          child로 내려감

              ...

             complete
               ↑
          parent로 올라감

   구조를 가진다.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Fiber 하나의 "시작 작업".
 *
 * 진짜 React의 beginWork는 여기에서:
 *
 * - Function Component 실행
 * - Hook 실행
 * - children reconciliation
 * - child Fiber 생성
 *
 * 등을 한다.
 *
 * 하지만 Level 1에서는 tree가 이미 만들어져 있으므로
 * 할 일이 하나뿐이다.
 */
function beginWork(unitOfWork: Fiber): Fiber | null {
  trace.push(`begin    ${unitOfWork.debugName}`);

  // TODO 1-5
  //
  // 더 깊이 내려갈 child가 있다면
  // 다음 작업은 누구여야 할까?
  return unitOfWork.child;
}

/**
 * Fiber 하나를 처리한다.
 *
 * 이것이 Fiber를 "unit of work"라고 부르는 이유가
 * 가장 직접적으로 드러나는 함수다.
 */
function performUnitOfWork(unitOfWork: Fiber): void {
  // TODO 1-6
  //
  // ① beginWork 수행
  //
  // ② 작업이 끝난 props를 memoizedProps에 저장
  //
  // ③ beginWork가 다음 Fiber를 줬다면
  //      workInProgress를 그 Fiber로 이동
  //
  // ④ 다음 Fiber가 없다면?
  //      이 Fiber의 아래쪽 작업은 끝났다는 뜻이다.
  //      completeUnitOfWork로 넘어간다.
  const next = beginWork(unitOfWork);

  unitOfWork.memoizedProps = unitOfWork.pendingProps;

  if (next !== null) {
    workInProgress = next;
  } else {
    completeUnitOfWork(unitOfWork);
  }
}

/* ═══════════════════════════════════════════════════════════════
   PART 5 — complete phase
   ═══════════════════════════════════════════════════════════════ */

/**
 * Fiber의 하위 tree 처리가 모두 끝난 뒤 실행된다.
 *
 * 진짜 React의 completeWork에서는 HostComponent의 경우
 * DOM instance 생성/갱신 준비 같은 renderer 관련 처리가 들어간다.
 *
 * 지금은 순서만 확인한다.
 */
function completeWork(unitOfWork: Fiber): void {
  trace.push(`complete ${unitOfWork.debugName}`);
}

/**
 * 핵심 난이도 ★★★
 *
 * child가 더 이상 없을 때 실행된다.
 *
 * 여기에서:
 *
 *   1. 현재 Fiber complete
 *   2. sibling이 있으면 sibling으로
 *   3. sibling이 없으면 parent(return)로
 *   4. parent도 complete
 *   5. 다시 sibling 찾기
 *
 * 를 반복한다.
 *
 * 재귀 금지.
 */
function completeUnitOfWork(unitOfWork: Fiber): void {
  // TODO 1-7
  //
  // 힌트:
  //
  // let completedWork: Fiber | null = unitOfWork;
  //
  // do {
  //   ...
  //
  //   const sibling = ...
  //
  //   if (sibling !== null) {
  //       workInProgress = ...
  //       return;
  //   }
  //
  //   completedWork = ...
  //   workInProgress = ...
  //
  // } while (...)

  let completedWork: Fiber | null = unitOfWork;

  do {
    completeWork(completedWork);

    const sibling = completedWork.sibling;

    if (sibling !== null) {
      workInProgress = sibling;
      return;
    }

    completedWork = completedWork.return;
    workInProgress = completedWork;
  } while (completedWork !== null);
}

/* ═══════════════════════════════════════════════════════════════
   DEMO TREE
   건드릴 필요 없음
   ═══════════════════════════════════════════════════════════════ */

const root = createFiber("HostRoot", "Root");

const app = createFiber("FunctionComponent", "App");

const header = createFiber("FunctionComponent", "Header");
const main = createFiber("FunctionComponent", "Main");
const footer = createFiber("FunctionComponent", "Footer");

const article = createFiber("HostComponent", "Article");
const sidebar = createFiber("HostComponent", "Sidebar");

linkChildren(root, [app]);

linkChildren(app, [header, main, footer]);

linkChildren(main, [article, sidebar]);

/*

완성되는 Fiber Tree:

                    Root
                     │
                    App
                     │
          ┌──────────┼──────────┐
        Header      Main       Footer
                     │
                 ┌───┴────┐
               Article  Sidebar


하지만 메모리 구조는 실제로는:

Root.child
   ↓
 App.child
   ↓
Header
   │ sibling
   ▼
 Main
   │ sibling
   ▼
Footer


Main.child
   ↓
Article
   │ sibling
   ▼
Sidebar


그리고:

Header.return  → App
Main.return    → App
Footer.return  → App

Article.return → Main
Sidebar.return → Main

*/

/* ═══════════════════════════════════════════════════════════════
   실행
   ═══════════════════════════════════════════════════════════════ */

prepareFreshStack(root);
workLoopSync();

console.log(trace.join("\n"));

/* ═══════════════════════════════════════════════════════════════
   성공 조건

   아래 순서가 정확히 출력되어야 한다.

   begin    Root
   begin    App
   begin    Header
   complete Header

   begin    Main
   begin    Article
   complete Article

   begin    Sidebar
   complete Sidebar
   complete Main

   begin    Footer
   complete Footer

   complete App
   complete Root

   ═══════════════════════════════════════════════════════════════ */
