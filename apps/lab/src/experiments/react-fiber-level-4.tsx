/* ═══════════════════════════════════════════════════════════════
   MINI REACT FIBER — LEVEL 4
   Keyed Reconciliation

   지금까지:
   L1 — Fiber traversal
   L2 — Element → Fiber
   L3 — current / workInProgress / alternate

   이번 Level:
   L4 — 실제에 가까운 children reconciliation

   old:
     A B C

   new:
     B A D C

   결과:
     B → reuse
     A → reuse + MOVE
     D → INSERT
     C → reuse

   핵심:
   - key + type으로 Fiber identity 판단
   - 같은 순서면 빠르게 순차 비교
   - 순서가 어긋나면 Map 사용
   - Placement = INSERT 또는 MOVE
   - ChildDeletion = 삭제 예정
   - DOM은 아직 건드리지 않는다

   아직 안 하는 것:
   ✗ 실제 DOM
   ✗ commit mutation
   ✗ hooks
   ✗ lanes
   ✗ scheduler
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   PART 0 — Types
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
   PART 2 — Flags

   Level 4에서 처음으로
   "나중에 commit에서 무엇을 해야 하는가"
   를 기록한다.

   아직 DOM 작업 자체는 하지 않는다.
   ═══════════════════════════════════════════════════════════════ */

const NoFlags = 0;

const Placement = 1 << 0;
const ChildDeletion = 1 << 1;

/* ═══════════════════════════════════════════════════════════════
   PART 3 — Fiber
   ═══════════════════════════════════════════════════════════════ */

let nextFiberId = 1;

type Fiber = {
  /** 학습용 */
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
   * 이 Fiber의 child 중 삭제할 Fiber들.
   *
   * 중요:
   * 삭제당하는 Fiber 자신이 아니라
   * "부모 Fiber"가 들고 있다.
   */
  deletions: Fiber[] | null;

  /**
   * 같은 논리적 노드의
   * 반대쪽 Fiber 버전.
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

    flags: NoFlags,
    subtreeFlags: NoFlags,

    deletions: null,

    alternate: null,
  };
}

/* ═══════════════════════════════════════════════════════════════
   PART 4 — FiberRoot
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
   PART 5 — current ↔ workInProgress
   LEVEL 3 복습
   ═══════════════════════════════════════════════════════════════ */

function createWorkInProgress(current: Fiber, pendingProps: Props | string | null): Fiber {
  let workInProgress = current.alternate;

  if (workInProgress === null) {
    /*
     * alternate가 아직 없다.
     *
     * current
     *    ↕
     * 새 WIP
     */
    workInProgress = createFiber(current.tag, pendingProps, current.key, current.debugName);

    workInProgress.type = current.type;

    workInProgress.alternate = current;

    current.alternate = workInProgress;
  } else {
    /*
     * 반대편 Fiber 객체를
     * 다시 WIP으로 재사용.
     */
    workInProgress.pendingProps = pendingProps;

    workInProgress.type = current.type;

    /*
     * 이전 render의 effect는
     * 새 render에 남으면 안 된다.
     */
    workInProgress.flags = NoFlags;

    workInProgress.subtreeFlags = NoFlags;

    workInProgress.deletions = null;
  }

  /*
   * 이전 확정 상태를 기반으로
   * 새로운 WIP를 시작한다.
   */
  workInProgress.child = current.child;

  workInProgress.memoizedProps = current.memoizedProps;

  workInProgress.sibling = current.sibling;

  workInProgress.index = current.index;

  return workInProgress;
}

/* ═══════════════════════════════════════════════════════════════
   PART 6 — Element → Fiber
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
    /*
     * 이번 미니 구현에서는
     * 배열 안의 배열은 생략.
     */
    throw new Error("Unsupported child");
  }

  created.return = returnFiber;

  return created;
}

/* ═══════════════════════════════════════════════════════════════
   PART 7 — Mount

   최초 render에는 기존 Fiber가 없으므로
   그냥 전부 새로 만든다.

   최초 mount에서는 Placement 등의
   side effect 추적도 하지 않는다.
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
   LEVEL 4 START
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   PART 8 — useFiber

   기존 Fiber를 새 render에서 재사용한다.

   current
      ↓ createWorkInProgress
   WIP

   새 sibling chain에 다시 들어가므로
   index / sibling은 초기화한다.
   ═══════════════════════════════════════════════════════════════ */

function useFiber(fiber: Fiber, pendingProps: Props | string | null): Fiber {
  const clone = createWorkInProgress(fiber, pendingProps);
  clone.index = 0;
  clone.sibling = null;
  return clone;
}

/* ═══════════════════════════════════════════════════════════════
   PART 9 — Deletion
   ═══════════════════════════════════════════════════════════════ */

/**
 * 삭제할 child Fiber를
 * 부모 Fiber에 기록한다.
 *
 * Parent
 *   flags |= ChildDeletion
 *   deletions = [Child]
 */
function deleteChild(returnFiber: Fiber, childToDelete: Fiber): void {
  const deletions = returnFiber.deletions;

  if (deletions === null) {
    returnFiber.deletions = [childToDelete];
    returnFiber.flags |= ChildDeletion;
  } else {
    deletions.push(childToDelete);
  }
}

function deleteRemainingChildren(returnFiber: Fiber, currentFirstChild: Fiber | null): void {
  let child = currentFirstChild;
  while (child != null) {
    deleteChild(returnFiber, child);
    child = child.sibling;
  }
}

/* ═══════════════════════════════════════════════════════════════
   PART 10 — 하나의 Node 업데이트
   ═══════════════════════════════════════════════════════════════ */

function updateTextNode(returnFiber: Fiber, current: Fiber | null, textContent: string): Fiber {
  if (current === null || current.tag !== "HostText") {
    const created = createFiberFromText(textContent);
    created.return = returnFiber;
    return created;
  }

  const existing = useFiber(current, textContent);
  existing.debugName = `#text("${textContent}")`;
  existing.return = returnFiber;

  return existing;
}

function updateElement(returnFiber: Fiber, current: Fiber | null, element: MiniReactElement): Fiber {
  if (current !== null && current.type === element.type) {
    const existing = useFiber(current, element.props);
    existing.return = returnFiber;
    return existing;
  }

  const created = createFiberFromElement(element);
  created.return = returnFiber;
  return created;
}

/* ═══════════════════════════════════════════════════════════════
   PART 11 — Fast Path

   old:
   A B C

   new:
   A B C

   라면 Map까지 만들 필요 없이
   같은 위치끼리 빠르게 비교한다.
   ═══════════════════════════════════════════════════════════════ */

function updateSlot(returnFiber: Fiber, oldFiber: Fiber, newChild: MiniReactNode): Fiber | null {
  const key = oldFiber.key;

  if (typeof newChild === "string" || typeof newChild === "number") {
    if (key !== null) {
      return null;
    }
    return updateTextNode(returnFiber, oldFiber, String(newChild));
  }

  if (isMiniElement(newChild)) {
    if (newChild.key === key) {
      return updateElement(returnFiber, oldFiber, newChild);
    }

    return null;
  }

  return null;
}

/* ═══════════════════════════════════════════════════════════════
   PART 12 — 기존 children Map 만들기

   기존:
   A key=a index=0
   B key=b index=1
   C key=c index=2

   →

   Map {
     "a" => A
     "b" => B
     "c" => C
   }

   key가 없으면 index fallback.
   ═══════════════════════════════════════════════════════════════ */

function mapRemainingChildren(currentFirstChild: Fiber): Map<string | number, Fiber> {
  const existingChildren = new Map<string | number, Fiber>();

  let existingChild: Fiber | null = currentFirstChild;

  while (existingChild !== null) {
    const key = existingChild.key !== null ? existingChild.key : existingChild.index;
    existingChildren.set(key, existingChild);
    existingChild = existingChild.sibling;
  }

  return existingChildren;
}

/* ═══════════════════════════════════════════════════════════════
   PART 13 — Map에서 Fiber 후보 찾기
   ═══════════════════════════════════════════════════════════════ */

function updateFromMap(
  existingChildren: Map<string | number, Fiber>,

  returnFiber: Fiber,

  newIndex: number,

  newChild: MiniReactNode,
): Fiber | null {
  if (typeof newChild === "string" || typeof newChild === "number") {
    const matchedFiber = existingChildren.get(newIndex) ?? null;
    return updateTextNode(returnFiber, matchedFiber, String(newChild));
  }

  if (isMiniElement(newChild)) {
    const lookupKey = newChild.key !== null ? newChild.key : newIndex;
    const matchedFiber = existingChildren.get(lookupKey) ?? null;
    return updateElement(returnFiber, matchedFiber, newChild);
  }

  return null;
}

/* ═══════════════════════════════════════════════════════════════
   PART 14 — Placement

   Placement는 두 의미가 있다.

   1. INSERT
      새 Fiber가 생김

   2. MOVE
      기존 Fiber를 재사용하지만
      DOM 위치를 움직여야 함
   ═══════════════════════════════════════════════════════════════ */

function placeChild(newFiber: Fiber, lastPlacedIndex: number, newIndex: number): number {
  newFiber.index = newIndex;
  const current = newFiber.alternate;

  if (current !== null) {
    const oldIndex = current.index;
    if (oldIndex < lastPlacedIndex) {
      newFiber.flags |= Placement;
      return lastPlacedIndex;
    }
    return oldIndex;
  }

  newFiber.flags |= Placement;
  return lastPlacedIndex;
}

/* ═══════════════════════════════════════════════════════════════
   PART 15 — 진짜 핵심
   reconcileChildrenArray

   크게 6단계다.

   PHASE 1
   같은 위치끼리 fast path

   PHASE 2
   new가 먼저 끝났으면
   old 나머지 삭제

   PHASE 3
   old가 먼저 끝났으면
   new 나머지 삽입

   PHASE 4
   순서가 어긋났으면
   남은 old를 Map으로

   PHASE 5
   Map으로 기존 Fiber 탐색

   PHASE 6
   Map에 남은 old는 삭제
   ═══════════════════════════════════════════════════════════════ */

function reconcileChildrenArray(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChildren: MiniReactNode[],
): Fiber | null {
  let resultingFirstChild: Fiber | null = null;

  let previousNewFiber: Fiber | null = null;

  let oldFiber = currentFirstChild;

  let lastPlacedIndex = 0;

  let newIndex = 0;

  /* ─────────────────────────────────────────
     PHASE 1

     같은 위치끼리 빠르게 비교.

     old: A B C
     new: A B C

     → Map 필요 없음.
     ───────────────────────────────────────── */

  for (; oldFiber !== null && newIndex < newChildren.length; newIndex++) {
    /*
     * updateSlot 안에서 oldFiber를
     * 수정할 수 있으므로
     * 먼저 다음 sibling을 기억.
     */
    const nextOldFiber = oldFiber.sibling;

    const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIndex]);

    /*
     * key가 다르다든지 해서
     * 현재 위치끼리 매칭 실패.
     *
     * slow path로 전환.
     */
    if (newFiber === null) {
      break;
    }

    /*
     * key는 같아서 updateSlot은
     * 통과했는데 type이 달랐다면:
     *
     * old:
     * <div key="a" />
     *
     * new:
     * <span key="a" />
     *
     * 새 Fiber가 생성되고
     * alternate가 없다.
     *
     * 기존 div는 삭제 대상.
     */
    if (newFiber.alternate === null) {
      deleteChild(returnFiber, oldFiber);
    }

    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex);

    if (previousNewFiber === null) {
      resultingFirstChild = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }

    previousNewFiber = newFiber;

    oldFiber = nextOldFiber;
  }

  /* ─────────────────────────────────────────
     PHASE 2

     new children을 전부 처리했다.

     old:
     A B C

     new:
     A

     → B, C 삭제
     ───────────────────────────────────────── */

  if (newIndex === newChildren.length) {
    deleteRemainingChildren(returnFiber, oldFiber);

    if (previousNewFiber !== null) {
      previousNewFiber.sibling = null;
    }

    return resultingFirstChild;
  }

  /* ─────────────────────────────────────────
     PHASE 3

     old가 먼저 끝났다.

     old:
     A

     new:
     A B C

     → B, C 전부 INSERT
     ───────────────────────────────────────── */

  if (oldFiber === null) {
    for (; newIndex < newChildren.length; newIndex++) {
      const newFiber = createChild(returnFiber, newChildren[newIndex]);
      if (newFiber === null) {
        continue;
      }

      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex);

      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }

      previousNewFiber = newFiber;
    }

    return resultingFirstChild;
  }

  /* ─────────────────────────────────────────
     PHASE 4

     중간에서 순서가 어긋났다.

     old:
     A B C D

     new:
     A C B E D

     A까지 fast path 성공.

     남은:
     B C D

     를 Map으로 만든다.
     ───────────────────────────────────────── */

  const existingChildren = mapRemainingChildren(oldFiber);

  /* ─────────────────────────────────────────
     PHASE 5

     남은 new child를
     key/index로 Map에서 찾는다.
     ───────────────────────────────────────── */

  for (; newIndex < newChildren.length; newIndex++) {
    const newFiber = updateFromMap(existingChildren, returnFiber, newIndex, newChildren[newIndex]);

    if (newFiber === null) {
      continue;
    }

    /*
     * alternate 존재
     * =
     * 기존 Fiber를 재사용했다.
     *
     * 그러면 existingChildren에서
     * 소비된 old Fiber를 삭제해야 한다.
     *
     * 안 지우면 PHASE 6에서
     * 삭제 대상으로 잘못 판단된다.
     */
    const current = newFiber.alternate;
    if (current !== null) {
      const lookupKey = current.key !== null ? current.key : current.index;
      existingChildren.delete(lookupKey);
    }

    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex);

    if (previousNewFiber === null) {
      resultingFirstChild = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }

    previousNewFiber = newFiber;
  }

  /* ─────────────────────────────────────────
     PHASE 6

     Map에 남은 기존 Fiber
     =
     새 children에서 한 번도
     재사용되지 않은 Fiber

     → 전부 삭제.
     ───────────────────────────────────────── */
  existingChildren.forEach((child) => deleteChild(returnFiber, child));

  /*
   * 이전 render에서 복사됐을 수 있는
   * stale sibling을 끊는다.
   */
  if (previousNewFiber !== null) {
    previousNewFiber.sibling = null;
  }

  return resultingFirstChild;
}

/* ═══════════════════════════════════════════════════════════════
   PART 16 — reconcileChildFibers

   single child도 학습 단순화를 위해
   배열 reconciliation을 통과시킨다.
   ═══════════════════════════════════════════════════════════════ */

function reconcileChildFibers(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChildren: MiniReactNode,
): Fiber | null {
  const children = Array.isArray(newChildren) ? newChildren : [newChildren];

  return reconcileChildrenArray(returnFiber, currentFirstChild, children);
}

/* ═══════════════════════════════════════════════════════════════
   PART 17 — reconcileChildren

   최초 mount:
   mountChildFibers

   update:
   reconcileChildFibers
   ═══════════════════════════════════════════════════════════════ */

function reconcileChildren(current: Fiber | null, workInProgress: Fiber, nextChildren: MiniReactNode): void {
  if (current === null) {
    workInProgress.child = mountChildFibers(workInProgress, nextChildren);
  } else {
    workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren);
  }
}

/* ═══════════════════════════════════════════════════════════════
   PART 18 — beginWork
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

  /*
   * Function Component는
   * update에서도 다시 실행된다.
   *
   * 새 Element 객체들이 생긴다.
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
    `begin ${workInProgress.debugName}` +
      ` #${workInProgress.id}` +
      ` current=${current !== null ? "#" + current.id : "null"}`,
  );

  switch (workInProgress.tag) {
    case "HostRoot":
      return updateHostRoot(current, workInProgress);

    case "FunctionComponent":
      return updateFunctionComponent(current, workInProgress);

    case "HostComponent":
      return updateHostComponent(current, workInProgress);

    case "HostText":
      return updateHostText(current, workInProgress);
  }
}

/* ═══════════════════════════════════════════════════════════════
   PART 19 — Work Loop
   ═══════════════════════════════════════════════════════════════ */

let workInProgress: Fiber | null = null;

function performUnitOfWork(unitOfWork: Fiber): void {
  /*
   * 새 Fiber라면 alternate=null.
   * 재사용 Fiber라면 alternate=current.
   */
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

/* ═══════════════════════════════════════════════════════════════
   PART 20 — completeWork

   Level 5에서 여기서:
   - DOM 생성
   - subtreeFlags 누적
   등을 다룬다.

   지금은 traversal만.
   ═══════════════════════════════════════════════════════════════ */

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
   PART 21 — Render / Commit
   ═══════════════════════════════════════════════════════════════ */

function renderRoot(root: FiberRoot, element: MiniReactElement): Fiber {
  const current = root.current;

  const workInProgressRoot = createWorkInProgress(current, {
    children: element,
  });

  workInProgress = workInProgressRoot;

  workLoopSync();

  /*
   * render가 끝난 tree.
   *
   * 아직 root.current는
   * 이전 tree다.
   */
  return workInProgressRoot;
}

function commitRoot(root: FiberRoot, finishedWork: Fiber): void {
  /*
   * Level 4에서는 실제 DOM
   * mutation은 하지 않는다.
   *
   * 단순히 완성된 Fiber Tree를
   * 새로운 current로 채택.
   */
  root.current = finishedWork;
}

/* ═══════════════════════════════════════════════════════════════
   PART 22 — Demo Components
   ═══════════════════════════════════════════════════════════════ */

function Item(props: Props): MiniReactNode {
  return createElement("li", null, String(props.id));
}

function App(props: Props): MiniReactNode {
  const items = props.items as string[];

  return createElement(
    "ul",
    null,

    ...items.map((id) =>
      createElement(Item, {
        key: id,
        id,
      }),
    ),
  );
}

/* ═══════════════════════════════════════════════════════════════
   PART 23 — Debug
   ═══════════════════════════════════════════════════════════════ */

function flagToString(flags: number): string {
  const result: string[] = [];

  if (flags & Placement) {
    result.push("Placement");
  }

  if (flags & ChildDeletion) {
    result.push("ChildDeletion");
  }

  return result.length > 0 ? result.join(" | ") : "NoFlags";
}

function printEffects(fiber: Fiber | null, depth = 0): void {
  let node = fiber;

  while (node !== null) {
    const alternate = node.alternate;

    console.log(
      `${"  ".repeat(depth)}` +
        `${node.debugName}` +
        ` #${node.id}` +
        ` key=${node.key}` +
        ` oldIndex=${alternate !== null ? alternate.index : "-"}` +
        ` newIndex=${node.index}` +
        ` flags=${flagToString(node.flags)}`,
    );

    if (node.deletions !== null) {
      console.log(
        `${"  ".repeat(depth + 1)}` +
          `DELETE → ` +
          node.deletions.map((fiber) => fiber.key ?? fiber.debugName).join(", "),
      );
    }

    if (node.child !== null) {
      printEffects(node.child, depth + 1);
    }

    node = node.sibling;
  }
}

function printItemFibers(root: Fiber): void {
  /*
   * Root
   *  └ App
   *     └ ul
   *        ├ Item
   *        ├ Item
   *        ...
   */

  const app = root.child;

  const ul = app?.child;

  let item = ul?.child ?? null;

  const result: string[] = [];

  while (item !== null) {
    result.push(
      `${item.key}` +
        `(#${item.id}, ` +
        `alt=${item.alternate ? "#" + item.alternate.id : "null"}, ` +
        `index=${item.index}, ` +
        `${flagToString(item.flags)})`,
    );

    item = item.sibling;
  }

  console.log(result.join(" → "));
}

/* ═══════════════════════════════════════════════════════════════
   PART 24 — Run
   ═══════════════════════════════════════════════════════════════ */

function run(root: FiberRoot, label: string, items: string[]): void {
  renderTrace.length = 0;

  console.log(`\n\n════════════════════════════════`);

  console.log(label);

  console.log(`new children: [${items.join(", ")}]`);

  console.log(`════════════════════════════════`);

  const element = createElement(App, { items });

  const previousCurrent = root.current;

  const finishedWork = renderRoot(root, element);

  console.log("\n[commit 전]");

  console.log("current root:", `#${previousCurrent.id}`);

  console.log("finished root:", `#${finishedWork.id}`);

  console.log("\n[effects]");

  printEffects(finishedWork);

  console.log("\n[item fibers]");

  printItemFibers(finishedWork);

  /*
   * 여기까지는 render phase.
   *
   * flags는 계산됐지만
   * 아직 DOM을 수정한 적 없다.
   */

  commitRoot(root, finishedWork);

  console.log("\ncommit 완료");

  console.log("root.current:", `#${root.current.id}`);
}

/* ═══════════════════════════════════════════════════════════════
   PART 25 — Test Cases
   ═══════════════════════════════════════════════════════════════ */

const root = createFiberRoot();

/*
 * ──────────────────────────────────────────
 * RENDER 1 — MOUNT
 *
 * A B C
 *
 * 최초 mount.
 *
 * 이번 구현에서는 mount 시
 * Placement 추적을 하지 않는다.
 * ──────────────────────────────────────────
 */

run(root, "1. MOUNT", ["A", "B", "C"]);

/*
 * ──────────────────────────────────────────
 * RENDER 2
 *
 * old:
 *
 * A B C
 *
 * new:
 *
 * B A D C
 *
 *
 * 예상:
 *
 * B
 *   reuse
 *   oldIndex=1
 *   NoFlags
 *
 * A
 *   reuse
 *   oldIndex=0
 *   Placement(MOVE)
 *
 * D
 *   new
 *   Placement(INSERT)
 *
 * C
 *   reuse
 *   NoFlags
 * ──────────────────────────────────────────
 */

run(root, "2. REORDER + INSERT", ["B", "A", "D", "C"]);

/*
 * ──────────────────────────────────────────
 * RENDER 3
 *
 * old:
 *
 * B A D C
 *
 * new:
 *
 * D B C
 *
 *
 * A는 삭제.
 *
 * 일부 Fiber에는
 * MOVE Placement가 생긴다.
 *
 * ul Fiber:
 *
 * flags |= ChildDeletion
 * deletions = [A]
 * ──────────────────────────────────────────
 */

run(root, "3. MOVE + DELETE", ["D", "B", "C"]);

export {};
