/* ═══════════════════════════════════════════════════════════════
   MINI REACT FIBER — LEVEL 3
   current / workInProgress / alternate

   목표

   1. FiberRoot.current가 현재 화면의 tree를 가리킨다.
   2. render는 current를 직접 수정하지 않는다.
   3. createWorkInProgress(current)로 반대쪽 Fiber를 준비한다.
   4. commit 후 root.current를 finishedWork로 교체한다.
   5. 다음 render에서는 기존 alternate 객체를 재사용한다.

   이번 단계에서는 아직 하지 않는다.

   ✗ key 기반 이동
   ✗ 삽입 / 삭제
   ✗ Placement / Deletion flags
   ✗ DOM commit
   ✗ hooks
   ✗ lanes

   reconciliation은:
   "같은 위치 + 같은 key + 같은 type"
   만 재사용한다고 단순화한다.
   ═══════════════════════════════════════════════════════════════ */

type WorkTag = "HostRoot" | "FunctionComponent" | "HostComponent" | "HostText";

type Props = {
  [key: string]: unknown;
  children?: MiniReactNode;
};

type FunctionComponent = (props: Props) => MiniReactNode;

type ElementType = string | FunctionComponent;

type MiniReactElement = {
  $$typeof: symbol;
  type: ElementType;
  key: string | null;
  props: Props;
};

type MiniReactNode = MiniReactElement | string | number | null | MiniReactNode[];

const MINI_ELEMENT_TYPE = Symbol.for("mini.react.element");

/* ═══════════════════════════════════════════════════════════════
   PART 1 — Element
   ═══════════════════════════════════════════════════════════════ */

function createElement(
  type: ElementType,
  config:
    | (Props & {
        key?: string | null;
      })
    | null,
  ...children: MiniReactNode[]
): MiniReactElement {
  const { key = null, ...restConfig } = config ?? {};

  const props: Props = {
    ...restConfig,
  };

  if (children.length === 1) {
    props.children = children[0];
  } else if (children.length > 1) {
    props.children = children;
  }

  return {
    $$typeof: MINI_ELEMENT_TYPE,
    type,
    key,
    props,
  };
}

function isMiniElement(value: unknown): value is MiniReactElement {
  return typeof value === "object" && value !== null && "$$typeof" in value && value.$$typeof === MINI_ELEMENT_TYPE;
}

/* ═══════════════════════════════════════════════════════════════
   PART 2 — Fiber
   ═══════════════════════════════════════════════════════════════ */

let nextFiberId = 1;

type Fiber = {
  /**
   * React에는 없는 학습용 id.
   *
   * object가 새로 생성된 건지
   * 기존 alternate가 재사용된 건지 확인하기 위해 넣었다.
   */
  id: number;

  tag: WorkTag;
  debugName: string;

  type: ElementType | null;
  key: string | null;

  return: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  index: number;

  pendingProps: Props | string | null;
  memoizedProps: Props | string | null;

  flags: number;
  subtreeFlags: number;

  /**
   * LEVEL 3 핵심.
   *
   * current.alternate === workInProgress
   * workInProgress.alternate === current
   */
  alternate: Fiber | null;
};

function createFiber(tag: WorkTag, pendingProps: Props | string | null, key: string | null, debugName: string): Fiber {
  return {
    id: nextFiberId++,

    tag,
    debugName,

    type: null,
    key,

    return: null,
    child: null,
    sibling: null,
    index: 0,

    pendingProps,
    memoizedProps: null,

    flags: 0,
    subtreeFlags: 0,

    alternate: null,
  };
}

/* ═══════════════════════════════════════════════════════════════
   PART 3 — FiberRoot

   중요:

   FiberRoot !== HostRoot Fiber

   FiberRoot
      │ current
      ▼
   HostRoot Fiber
      │ child
      ▼
     App
   ═══════════════════════════════════════════════════════════════ */

type FiberRoot = {
  current: Fiber;
};

function createFiberRoot(): FiberRoot {
  const hostRootFiber = createFiber("HostRoot", null, null, "Root");

  return {
    current: hostRootFiber,
  };
}

/* ═══════════════════════════════════════════════════════════════
   PART 4 — createWorkInProgress
   대응: ReactFiber.js

   LEVEL 3 핵심 ★★★★★
   ═══════════════════════════════════════════════════════════════ */

const reuseTrace: string[] = [];

/**
 * current Fiber의 "반대쪽 Fiber"를 준비한다.
 *
 *
 * CASE 1 — alternate가 아직 없음
 *
 * current #1
 *
 *      ↓ 새 객체 생성
 *
 * WIP #2
 *
 * #1.alternate → #2
 * #2.alternate → #1
 *
 *
 * CASE 2 — 이미 alternate가 있음
 *
 * current #2
 *      ↕
 * alternate #1
 *
 * #1 객체를 새로 만들지 않고 WIP으로 재사용.
 */
function createWorkInProgress(current: Fiber, pendingProps: Props | string | null): Fiber {
  let workInProgress = current.alternate;

  if (workInProgress === null) {
    workInProgress = createFiber(current.tag, pendingProps, current.key, current.debugName);
    workInProgress.type = current.type;
    workInProgress.alternate = current;
    current.alternate = workInProgress;

    reuseTrace.push(`create ${current.debugName} current#${current.id} -> wip#${workInProgress.id}`);
  } else {
    workInProgress.pendingProps = pendingProps;
    workInProgress.type = current.type;
    workInProgress.flags = 0;
    workInProgress.subtreeFlags = 0;

    reuseTrace.push(`reuse ${current.debugName} current#${current.id} -> wip#${workInProgress.id}`);
  }

  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;

  return workInProgress;
}

/* ═══════════════════════════════════════════════════════════════
   PART 5 — Element → new Fiber
   mount용. Level 2와 동일.
   ═══════════════════════════════════════════════════════════════ */

function createFiberFromElement(element: MiniReactElement): Fiber {
  const { type, key, props } = element;

  let tag: WorkTag;
  let debugName: string;

  if (typeof type === "function") {
    tag = "FunctionComponent";
    debugName = type.name || "Anonymous";
  } else {
    tag = "HostComponent";
    debugName = type;
  }

  const fiber = createFiber(tag, props, key, debugName);

  fiber.type = type;

  return fiber;
}

function createFiberFromText(content: string | number): Fiber {
  const text = String(content);

  return createFiber("HostText", text, null, `#text("${text}")`);
}

function createChild(returnFiber: Fiber, newChild: MiniReactNode): Fiber | null {
  let created: Fiber | null = null;

  if (typeof newChild === "string" || typeof newChild === "number") {
    created = createFiberFromText(newChild);
  } else if (isMiniElement(newChild)) {
    created = createFiberFromElement(newChild);
  } else if (newChild === null) {
    return null;
  } else {
    throw new Error("Unsupported child");
  }

  created.return = returnFiber;

  return created;
}

/* ═══════════════════════════════════════════════════════════════
   PART 6 — mountChildFibers

   최초 mount에서는 current child가 없으므로
   전부 새 Fiber를 생성한다.
   ═══════════════════════════════════════════════════════════════ */

function mountChildFibers(returnFiber: Fiber, newChildren: MiniReactNode): Fiber | null {
  const children = Array.isArray(newChildren) ? newChildren : [newChildren];

  let firstChild: Fiber | null = null;
  let previousNewFiber: Fiber | null = null;

  for (let i = 0; i < children.length; i++) {
    const newFiber = createChild(returnFiber, children[i]);

    if (newFiber === null) {
      continue;
    }

    newFiber.index = i;

    if (previousNewFiber === null) {
      firstChild = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }

    previousNewFiber = newFiber;
  }

  return firstChild;
}

/* ═══════════════════════════════════════════════════════════════
   PART 7 — 최소 update reconciliation

   Level 4의 진짜 diff가 아니다.

   이번 단계에서는:

   "같은 위치의 current Fiber와
    새 child가 같은 identity인가?"

   만 확인한다.

   identity:
     Element → key + type
     Text    → HostText

   이동 탐색 없음.
   key map 없음.
   deletion 없음.
   ═══════════════════════════════════════════════════════════════ */

/**
 * current Fiber와 새 ReactNode가
 * "같은 컴포넌트/host node"인지 판단한다.
 */
function isSameNode(current: Fiber, newChild: MiniReactNode): boolean {
  if (typeof newChild === "string" || typeof newChild === "number") {
    return current.tag === "HostText";
  }
  if (isMiniElement(newChild)) {
    return current.key === newChild.key && current.type === newChild.type;
  }
  return false;
}

/**
 * current Fiber 하나와
 * 새 ReactNode 하나를 대응시킨다.
 *
 *
 * 재사용 가능:
 *
 * current Fiber
 *      ↓
 * createWorkInProgress()
 *      ↓
 * WIP Fiber
 *
 *
 * 재사용 불가:
 *
 * new Element
 *      ↓
 * 새 Fiber
 */
function updateSlot(returnFiber: Fiber, current: Fiber, newChild: MiniReactNode): Fiber | null {
  if (newChild === null) {
    return null;
  }

  if (isSameNode(current, newChild)) {
    let pendingProps = null;
    if (typeof newChild === "string" || typeof newChild === "number") {
      pendingProps = String(newChild);
    } else if (isMiniElement(newChild)) {
      pendingProps = newChild.props;
    }
    const reused = createWorkInProgress(current, pendingProps);
    reused.return = returnFiber;

    return reused;
  }

  return createChild(returnFiber, newChild);
}

/**
 * 현재 sibling chain과
 * 새 children 배열을 "같은 위치끼리" 비교한다.
 *
 * Level 4에서 이 알고리즘을 뜯어고칠 예정.
 */
function reconcileChildFibers(returnFiber: Fiber, currentFirstChild: Fiber, newChildren: MiniReactNode): Fiber | null {
  const children = Array.isArray(newChildren) ? newChildren : [newChildren];

  let oldFiber: Fiber | null = currentFirstChild;
  let firstChild: Fiber | null = null;
  let previousNewFiber: Fiber | null = null;

  for (let i = 0; i < children.length; i++) {
    let newFiber: Fiber | null;
    if (oldFiber === null) {
      newFiber = createChild(returnFiber, children[i]);
    } else {
      newFiber = updateSlot(returnFiber, oldFiber, children[i]);
      oldFiber = oldFiber.sibling;
    }

    if (newFiber === null) {
      continue;
    }

    newFiber.index = i;
    if (previousNewFiber === null) {
      firstChild = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }

    previousNewFiber = newFiber;
  }

  if (previousNewFiber !== null) {
    previousNewFiber.sibling = null;
  }

  return firstChild;
}

/* ═══════════════════════════════════════════════════════════════
   PART 8 — reconcileChildren

   mount와 update가 여기서 갈린다.
   ═══════════════════════════════════════════════════════════════ */

function reconcileChildren(current: Fiber | null, workInProgress: Fiber, nextChildren: MiniReactNode): void {
  if (current === null || current.child === null) {
    workInProgress.child = mountChildFibers(workInProgress, nextChildren);
  } else {
    workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren);
  }
}

/* ═══════════════════════════════════════════════════════════════
   PART 9 — beginWork

   Level 2와 달라진 핵심:

   beginWork(workInProgress)

             ↓

   beginWork(current, workInProgress)

   이제 "이전 버전"을 동시에 볼 수 있다.
   ═══════════════════════════════════════════════════════════════ */

const renderTrace: string[] = [];

function updateHostRoot(current: Fiber | null, workInProgress: Fiber): Fiber | null {
  const props = workInProgress.pendingProps as Props;

  const nextChildren = props.children ?? null;

  reconcileChildren(current, workInProgress, nextChildren);

  return workInProgress.child;
}

function updateFunctionComponent(current: Fiber | null, workInProgress: Fiber): Fiber | null {
  const Component = workInProgress.type as FunctionComponent;

  const props = workInProgress.pendingProps as Props;

  /**
   * 새 render마다 Component는 다시 실행되고,
   * 새 Element 객체들을 반환한다.
   */
  const nextChildren = Component(props);

  reconcileChildren(current, workInProgress, nextChildren);

  return workInProgress.child;
}

function updateHostComponent(current: Fiber | null, workInProgress: Fiber): Fiber | null {
  const props = workInProgress.pendingProps as Props;

  const nextChildren = props.children ?? null;

  reconcileChildren(current, workInProgress, nextChildren);

  return workInProgress.child;
}

function updateHostText(_current: Fiber | null, _workInProgress: Fiber): null {
  return null;
}

function beginWork(current: Fiber | null, workInProgress: Fiber): Fiber | null {
  renderTrace.push(
    `begin ${workInProgress.debugName}` + ` #${workInProgress.id}` + ` current=${current ? "#" + current.id : "null"}`,
  );

  let fiber: Fiber | null;

  switch (workInProgress.tag) {
    case "FunctionComponent": {
      fiber = updateFunctionComponent(current, workInProgress);
      break;
    }
    case "HostComponent": {
      fiber = updateHostComponent(current, workInProgress);
      break;
    }
    case "HostRoot": {
      fiber = updateHostRoot(current, workInProgress);
      break;
    }
    case "HostText": {
      fiber = updateHostText(current, workInProgress);
    }
  }

  return fiber;
}

/* ═══════════════════════════════════════════════════════════════
   PART 10 — Work Loop
   ═══════════════════════════════════════════════════════════════ */

let workInProgress: Fiber | null = null;

function performUnitOfWork(unitOfWork: Fiber): void {
  const current = unitOfWork.alternate;
  const next = beginWork(current, unitOfWork);

  unitOfWork.memoizedProps = unitOfWork.pendingProps;

  if (next !== null) {
    workInProgress = next;
  } else {
    completeUnitOfWork(unitOfWork);
  }
}

function workLoopSync(): void {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function completeWork(unitOfWork: Fiber): void {
  renderTrace.push(`complete ${unitOfWork.debugName}` + ` #${unitOfWork.id}`);
}

function completeUnitOfWork(unitOfWork: Fiber): void {
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
   PART 11 — Render 시작

   이제 render는 root.current에서 바로 시작하지 않는다.

   root.current
       ↓
   createWorkInProgress()
       ↓
   WIP HostRoot
       ↓
   workLoop
   ═══════════════════════════════════════════════════════════════ */

function renderRoot(root: FiberRoot, element: MiniReactElement): Fiber {
  const current = root.current;

  const workInProgressRoot = createWorkInProgress(current, { children: element });
  workInProgress = workInProgressRoot;

  workLoopSync();

  return workInProgressRoot;
}

/* ═══════════════════════════════════════════════════════════════
   PART 12 — Commit

   실제 DOM commit은 아직 안 한다.

   이번 단계의 commit은 딱 하나:

       root.current 교체

   이것만 한다.
   ═══════════════════════════════════════════════════════════════ */

function commitRoot(root: FiberRoot, finishedWork: Fiber): void {
  root.current = finishedWork;
}

/* ═══════════════════════════════════════════════════════════════
   DEMO COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function Header(props: Props): MiniReactNode {
  return createElement("h1", null, `Header ${props.version}`);
}

function App(props: Props): MiniReactNode {
  return createElement(
    "main",
    null,

    createElement(Header, {
      version: props.version,
    }),

    createElement("p", null, `Version ${props.version}`),
  );
}

/* ═══════════════════════════════════════════════════════════════
   DEBUG
   ═══════════════════════════════════════════════════════════════ */

function printTree(fiber: Fiber | null, depth = 0): void {
  let node = fiber;

  while (node !== null) {
    console.log(
      `${"  ".repeat(depth)}` +
        `${node.debugName}` +
        ` #${node.id}` +
        ` alt=${node.alternate ? "#" + node.alternate.id : "null"}`,
    );

    if (node.child !== null) {
      printTree(node.child, depth + 1);
    }

    node = node.sibling;
  }
}

function run(root: FiberRoot, version: string): void {
  renderTrace.length = 0;
  reuseTrace.length = 0;

  const element = createElement(App, { version });

  console.log(`\n════════ ${version} render ════════`);

  console.log("render 전 current root:", `#${root.current.id}`);

  const finishedWork = renderRoot(root, element);

  console.log("\n[alternate]");

  console.log(reuseTrace.join("\n"));

  console.log("\n[render]");

  console.log(renderTrace.join("\n"));

  /**
   * 이 시점에는 아직 root.current는
   * 이전 tree여야 한다.
   */
  console.log("\ncommit 전");

  console.log("current:", root.current.id);

  console.log("finished:", finishedWork.id);

  commitRoot(root, finishedWork);

  console.log("\ncommit 후 current:", root.current.id);

  console.log("\n[current tree]");

  printTree(root.current);
}

/* ═══════════════════════════════════════════════════════════════
   실행

   일부러 세 번 한다.
   ═══════════════════════════════════════════════════════════════ */

const root = createFiberRoot();

run(root, "A");
run(root, "B");
run(root, "C");

export {};
