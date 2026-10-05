/* ═══════════════════════════════════════════════════════════════
   MINI REACT FIBER — LEVEL 8

   L1  Fiber traversal
   L2  Element → Fiber
   L3  current / workInProgress / alternate
   L4  keyed reconciliation
   L5  completeWork + commit
   L6  Hook linked list
   L7  setState + UpdateQueue + sync scheduling

   ─────────────────────────────────────────────────────────────

   LEVEL 8

   Lane / Priority
        +
   Concurrent Work Loop

   setState
      ↓
   Update(action, lane)
      ↓
   queue.pending
      ↓
   Fiber / parent.childLanes에 lane 표시
      ↓
   root.pendingLanes
      ↓
   가장 높은 priority lane 선택
      ↓
   render
      ↓
   해당 lane의 update만 처리
      ↓
   낮은 priority update는 baseQueue에 보존
      ↓
   Fiber 몇 개 처리
      ↓
   shouldYield?
      ↓
   YES → 중단
      ↓
   다음 slice에서 같은 workInProgress부터 재개
      ↓
   render 완료
      ↓
   commit
   ═══════════════════════════════════════════════════════════════ */

/* =============================================================
   PART 0 — Element
   ============================================================= */

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

function createElement(
  type: ElementType,
  config:
    | (Props & {
        key?: string | null;
      })
    | null,
  ...children: MiniReactNode[]
): MiniReactElement {
  const { key = null, ...rest } = config ?? {};

  const props: Props = {
    ...rest,
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

/* =============================================================
   PART 1 — Flags
   ============================================================= */

const NoFlags = 0b0000;
const Placement = 0b0001;
const ChildDeletion = 0b0010;
const Update = 0b0100;

const MutationMask = Placement | ChildDeletion | Update;

/* =============================================================
   ╔════════════════════════════════════════════════════════════╗
   ║                    LEVEL 8 — LANES                       ║
   ╚════════════════════════════════════════════════════════════╝
   ============================================================= */

/**
 * lane 하나
 *
 * bit 하나로 priority를 표현한다.
 */
type Lane = number;

/**
 * lane 여러 개의 집합.
 *
 * bitmask.
 */
type Lanes = number;

const NoLane: Lane = 0b0000;

const NoLanes: Lanes = 0b0000;

/**
 * 숫자가 작은 bit일수록
 * 높은 priority라고 하자.
 */
const SyncLane: Lane = 0b0001;

const DefaultLane: Lane = 0b0010;

const TransitionLane: Lane = 0b0100;

const IdleLane: Lane = 0b1000;

/* =============================================================
   PART 2 — Lane Helpers

   TODO 8-1
   ============================================================= */

function mergeLanes(a: Lanes, b: Lanes): Lanes {
  return a | b;
}

function removeLanes(set: Lanes, subset: Lanes): Lanes {
  return set & ~subset;
}

function includesSomeLane(a: Lanes, b: Lanes): boolean {
  return (a & b) !== 0;
}

/**
 * 가장 낮은 1 bit 추출.
 *
 * 예:
 *
 * lanes = 0110
 *
 * 결과:
 *
 * 0010
 *
 *
 * 2의 보수 성질:
 *
 * lanes & -lanes
 */
function getHighestPriorityLane(lanes: Lanes): Lane {
  return lanes & -lanes;
}

function laneToString(lane: Lane): string {
  switch (lane) {
    case SyncLane:
      return "Sync";

    case DefaultLane:
      return "Default";

    case TransitionLane:
      return "Transition";

    case IdleLane:
      return "Idle";

    case NoLane:
      return "NoLane";

    default:
      return `Unknown(${lane})`;
  }
}

/* =============================================================
   PART 3 — Host Environment
   ============================================================= */

type HostParent = HostElement | HostContainer;

type HostInstance = HostElement | HostTextInstance;

type HostElement = {
  kind: "element";
  type: string;
  props: Record<string, unknown>;
  children: HostInstance[];
  parent: HostParent | null;
};

type HostTextInstance = {
  kind: "text";
  text: string;
  parent: HostParent | null;
};

type HostContainer = {
  kind: "container";
  children: HostInstance[];
};

function extractHostProps(props: Props): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const key of Object.keys(props)) {
    if (key === "children") {
      continue;
    }

    result[key] = props[key];
  }

  return result;
}

function createInstance(type: string, props: Props): HostElement {
  return {
    kind: "element",
    type,
    props: extractHostProps(props),
    children: [],
    parent: null,
  };
}

function createTextInstance(text: string): HostTextInstance {
  return {
    kind: "text",
    text,
    parent: null,
  };
}

function detachHostNode(child: HostInstance): void {
  const parent = child.parent;

  if (parent === null) {
    return;
  }

  const index = parent.children.indexOf(child);

  if (index !== -1) {
    parent.children.splice(index, 1);
  }

  child.parent = null;
}

function appendHostChild(parent: HostParent, child: HostInstance): void {
  detachHostNode(child);

  parent.children.push(child);

  child.parent = parent;
}

function insertHostBefore(parent: HostParent, child: HostInstance, before: HostInstance): void {
  detachHostNode(child);

  const index = parent.children.indexOf(before);

  if (index === -1) {
    appendHostChild(parent, child);

    return;
  }

  parent.children.splice(index, 0, child);

  child.parent = parent;
}

function removeHostChild(parent: HostParent, child: HostInstance): void {
  const index = parent.children.indexOf(child);

  if (index === -1) {
    return;
  }

  parent.children.splice(index, 1);

  child.parent = null;
}

/* =============================================================
   PART 4 — State Update Queue

   L8에서 Update에 lane이 생긴다.
   ============================================================= */

type SetStateAction<T> = T | ((previous: T) => T);

type Dispatch<T> = (action: SetStateAction<T>) => void;

type StateUpdate<T> = {
  /**
   * 이 update의 priority
   */
  lane: Lane;

  action: SetStateAction<T>;

  next: StateUpdate<T> | null;
};

type UpdateQueue<T> = {
  /**
   * 새로 발생한 updates.
   *
   * circular linked list의 tail.
   */
  pending: StateUpdate<T> | null;

  dispatch: Dispatch<T> | null;

  fiber: Fiber | null;
};

/* =============================================================
   PART 5 — Hook

   L8 핵심 변경:

   memoizedState
      =
   이번 render 결과 state


   baseState
      =
   아직 처리되지 않은 update들을
   나중에 다시 계산할 때 시작할 state


   baseQueue
      =
   priority 때문에 이번 render에서
   skip된 update 목록


   예:

   state = 0

   Default: +1
   Sync:    +10


   Sync render에서는:

       Default +1 → skip
       Sync +10    → 처리

   화면 state = 10


   하지만 Default를 나중에 처리하려면
   원래 update 순서를 보존해야 한다.

   그래서:

   baseState
   baseQueue

   를 둔다.
   ============================================================= */

type Hook = {
  memoizedState: unknown;

  baseState: unknown;

  /**
   * circular linked list tail
   */
  baseQueue: StateUpdate<any> | null;

  queue: UpdateQueue<any> | null;

  next: Hook | null;
};

/* =============================================================
   PART 6 — Fiber
   ============================================================= */

let nextFiberId = 1;

type Fiber = {
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

  memoizedState: Hook | null;

  stateNode: HostInstance | FiberRoot | null;

  flags: number;

  subtreeFlags: number;

  deletions: Fiber[] | null;

  alternate: Fiber | null;

  /**
   * 이 Fiber 자체에
   * pending update가 있는 lane.
   */
  lanes: Lanes;

  /**
   * descendants 어딘가에
   * pending lane이 있다는 요약.
   *
   * subtreeFlags의
   * scheduling 버전이라고 생각하면 됨.
   */
  childLanes: Lanes;
};

function createFiber(
  tag: WorkTag,

  pendingProps: Props | string | null,

  key: string | null,

  debugName: string,
): Fiber {
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

    memoizedState: null,

    stateNode: null,

    flags: NoFlags,
    subtreeFlags: NoFlags,
    deletions: null,

    alternate: null,

    lanes: NoLanes,
    childLanes: NoLanes,
  };
}

/* =============================================================
   PART 7 — FiberRoot
   ============================================================= */

type FiberRoot = {
  current: Fiber;

  container: HostContainer;

  element: MiniReactElement | null;

  /**
   * 이 root에서 아직 처리해야 하는
   * 모든 lane.
   */
  pendingLanes: Lanes;
};

function createFiberRoot(): FiberRoot {
  const container: HostContainer = {
    kind: "container",
    children: [],
  };

  const hostRootFiber = createFiber("HostRoot", null, null, "Root");

  const root: FiberRoot = {
    current: hostRootFiber,

    container,

    element: null,

    pendingLanes: NoLanes,
  };

  hostRootFiber.stateNode = root;

  return root;
}

/* =============================================================
   PART 8 — current ↔ WIP
   ============================================================= */

function createWorkInProgress(
  current: Fiber,

  pendingProps: Props | string | null,
): Fiber {
  let workInProgress = current.alternate;

  if (workInProgress === null) {
    workInProgress = createFiber(current.tag, pendingProps, current.key, current.debugName);

    workInProgress.type = current.type;

    workInProgress.stateNode = current.stateNode;

    workInProgress.alternate = current;

    current.alternate = workInProgress;
  } else {
    workInProgress.pendingProps = pendingProps;

    workInProgress.type = current.type;

    workInProgress.flags = NoFlags;

    workInProgress.subtreeFlags = NoFlags;

    workInProgress.deletions = null;
  }

  workInProgress.child = current.child;

  workInProgress.sibling = current.sibling;

  workInProgress.index = current.index;

  workInProgress.memoizedProps = current.memoizedProps;

  workInProgress.memoizedState = current.memoizedState;

  workInProgress.stateNode = current.stateNode;

  /**
   * pending scheduling 정보도
   * current에서 복사한다.
   */
  workInProgress.lanes = current.lanes;

  workInProgress.childLanes = current.childLanes;

  return workInProgress;
}

/* =============================================================
   PART 9 — Element → Fiber
   ============================================================= */

function createFiberFromElement(element: MiniReactElement): Fiber {
  const { type, key, props } = element;

  const tag: WorkTag = typeof type === "function" ? "FunctionComponent" : "HostComponent";

  const debugName = typeof type === "function" ? type.name || "Anonymous" : type;

  const fiber = createFiber(tag, props, key, debugName);

  fiber.type = type;

  return fiber;
}

function createFiberFromText(content: string | number): Fiber {
  const text = String(content);

  return createFiber("HostText", text, null, `#text("${text}")`);
}

function createChild(returnFiber: Fiber, newChild: MiniReactNode): Fiber | null {
  let created: Fiber | null;

  if (typeof newChild === "string" || typeof newChild === "number") {
    created = createFiberFromText(newChild);
  } else if (isMiniElement(newChild)) {
    created = createFiberFromElement(newChild);
  } else if (newChild === null) {
    return null;
  } else {
    throw new Error("Nested array is not supported");
  }

  created.return = returnFiber;

  return created;
}

/* =============================================================
   PART 10 — Reconciliation
   ============================================================= */

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

function useFiber(
  fiber: Fiber,

  pendingProps: Props | string | null,
): Fiber {
  const clone = createWorkInProgress(fiber, pendingProps);

  clone.index = 0;
  clone.sibling = null;

  return clone;
}

function deleteChild(returnFiber: Fiber, childToDelete: Fiber): void {
  if (returnFiber.deletions === null) {
    returnFiber.deletions = [childToDelete];

    returnFiber.flags |= ChildDeletion;
  } else {
    returnFiber.deletions.push(childToDelete);
  }
}

function deleteRemainingChildren(returnFiber: Fiber, child: Fiber | null): void {
  let current = child;

  while (current !== null) {
    deleteChild(returnFiber, current);

    current = current.sibling;
  }
}

function updateTextNode(returnFiber: Fiber, current: Fiber | null, text: string): Fiber {
  if (current === null || current.tag !== "HostText") {
    const created = createFiberFromText(text);

    created.return = returnFiber;

    return created;
  }

  const existing = useFiber(current, text);

  existing.return = returnFiber;

  existing.debugName = `#text("${text}")`;

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

function mapRemainingChildren(currentFirstChild: Fiber): Map<string | number, Fiber> {
  const map = new Map<string | number, Fiber>();

  let child: Fiber | null = currentFirstChild;

  while (child !== null) {
    const key = child.key !== null ? child.key : child.index;

    map.set(key, child);

    child = child.sibling;
  }

  return map;
}

function updateFromMap(
  map: Map<string | number, Fiber>,

  returnFiber: Fiber,

  newIndex: number,

  newChild: MiniReactNode,
): Fiber | null {
  if (typeof newChild === "string" || typeof newChild === "number") {
    const matched = map.get(newIndex) ?? null;

    return updateTextNode(returnFiber, matched, String(newChild));
  }

  if (isMiniElement(newChild)) {
    const lookupKey = newChild.key !== null ? newChild.key : newIndex;

    const matched = map.get(lookupKey) ?? null;

    return updateElement(returnFiber, matched, newChild);
  }

  return null;
}

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

  for (; oldFiber !== null && newIndex < newChildren.length; newIndex++) {
    const nextOldFiber = oldFiber.sibling;

    const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIndex]);

    if (newFiber === null) {
      break;
    }

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

  if (newIndex === newChildren.length) {
    deleteRemainingChildren(returnFiber, oldFiber);

    if (previousNewFiber !== null) {
      previousNewFiber.sibling = null;
    }

    return resultingFirstChild;
  }

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

  const existingChildren = mapRemainingChildren(oldFiber);

  for (; newIndex < newChildren.length; newIndex++) {
    const newFiber = updateFromMap(existingChildren, returnFiber, newIndex, newChildren[newIndex]);

    if (newFiber === null) {
      continue;
    }

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

  existingChildren.forEach((child) => {
    deleteChild(returnFiber, child);
  });

  if (previousNewFiber !== null) {
    previousNewFiber.sibling = null;
  }

  return resultingFirstChild;
}

function reconcileChildFibers(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChildren: MiniReactNode,
): Fiber | null {
  const children = Array.isArray(newChildren) ? newChildren : [newChildren];

  return reconcileChildrenArray(returnFiber, currentFirstChild, children);
}

function reconcileChildren(current: Fiber | null, workInProgress: Fiber, nextChildren: MiniReactNode): void {
  if (current === null) {
    workInProgress.child = mountChildFibers(workInProgress, nextChildren);
  } else {
    workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren);
  }
}

/* =============================================================
   PART 11 — Hook Globals
   ============================================================= */

let currentlyRenderingFiber: Fiber | null = null;

let currentHook: Hook | null = null;

let workInProgressHook: Hook | null = null;

/* =============================================================
   PART 12 — Hook linked list
   ============================================================= */

function mountWorkInProgressHook(): Hook {
  if (currentlyRenderingFiber === null) {
    throw new Error("No rendering Fiber");
  }

  const hook: Hook = {
    memoizedState: null,

    baseState: null,

    baseQueue: null,

    queue: null,

    next: null,
  };

  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = hook;
  } else {
    workInProgressHook.next = hook;
  }

  workInProgressHook = hook;

  return hook;
}

function updateWorkInProgressHook(): Hook {
  if (currentlyRenderingFiber === null) {
    throw new Error("No rendering Fiber");
  }

  let nextCurrentHook: Hook | null;

  if (currentHook === null) {
    nextCurrentHook = currentlyRenderingFiber.alternate?.memoizedState ?? null;
  } else {
    nextCurrentHook = currentHook.next;
  }

  if (nextCurrentHook === null) {
    throw new Error("Rendered more hooks than before");
  }

  currentHook = nextCurrentHook;

  const newHook: Hook = {
    memoizedState: currentHook.memoizedState,

    baseState: currentHook.baseState,

    baseQueue: currentHook.baseQueue,

    queue: currentHook.queue,

    next: null,
  };

  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = newHook;
  } else {
    workInProgressHook.next = newHook;
  }

  workInProgressHook = newHook;

  return newHook;
}

/* =============================================================
   PART 13 — Update Queue enqueue
   ============================================================= */

function enqueueUpdate<T>(queue: UpdateQueue<T>, update: StateUpdate<T>): void {
  const pending = queue.pending;

  if (pending === null) {
    update.next = update;
  } else {
    update.next = pending.next;

    pending.next = update;
  }

  queue.pending = update;
}

/* =============================================================
   ╔════════════════════════════════════════════════════════════╗
   ║               LEVEL 8 — UPDATE PRIORITY                  ║
   ╚════════════════════════════════════════════════════════════╝
   ============================================================= */

/* =============================================================
   PART 14 — 현재 Event Lane

   실제 React에서는 event priority,
   transition context 등으로 lane을 정한다.

   여기서는 학습용으로 직접 설정.

   기본:

       DefaultLane

   runWithLane(SyncLane, () => {
     setCount(...)
   })

   이런 식으로 테스트한다.
   ============================================================= */

let currentUpdateLane: Lane = DefaultLane;

function requestUpdateLane(): Lane {
  return currentUpdateLane;
}

function runWithLane(lane: Lane, callback: () => void): void {
  const previous = currentUpdateLane;

  currentUpdateLane = lane;

  try {
    callback();
  } finally {
    currentUpdateLane = previous;
  }
}

/* =============================================================
   PART 15 — markUpdateLaneFromFiberToRoot

   setState 발생:

       Counter Fiber
          │ lanes |= lane
          │
          ↑
       Parent
          │ childLanes |= lane
          ↑
       Parent
          │ childLanes |= lane
          ↑
       HostRoot

   마지막:

       root.pendingLanes |= lane


   subtreeFlags와 닮았다.

   subtreeFlags:
      "아래에 commit effect 있음"

   childLanes:
      "아래에 pending update 있음"


   TODO 8-2
   ============================================================= */

function markUpdateLaneFromFiberToRoot(sourceFiber: Fiber, lane: Lane): FiberRoot {
  sourceFiber.lanes |= lane;

  if (sourceFiber.alternate !== null) {
    sourceFiber.alternate.lanes |= lane;
  }

  let parent = sourceFiber;
  while (parent.return !== null) {
    parent = parent.return;
    parent.childLanes |= lane;
    if (parent.alternate !== null) {
      parent.alternate.childLanes |= lane;
    }
  }

  if (parent.tag !== "HostRoot") {
    throw new Error("root not root");
  }

  const root = parent.stateNode as FiberRoot;

  root.pendingLanes |= lane;

  return root;
}

/* =============================================================
   PART 16 — Scheduler globals

   현재 concurrent render가
   어느 Root / Lane을 처리 중인지.
   ============================================================= */

let workInProgress: Fiber | null = null;

let workInProgressRoot: FiberRoot | null = null;

/**
 * 이번 render의 root WIP Fiber.
 *
 * workInProgress는 traversal하면서 이동하므로
 * root Fiber를 별도로 기억한다.
 */
let workInProgressRootFiber: Fiber | null = null;

/**
 * 현재 처리 중인 priority.
 */
let workInProgressRootRenderLane: Lane = NoLane;

/**
 * render 도중 새 update가 발생한 lane.
 *
 * 같은 lane update가 이미 지나간 Fiber에
 * 들어왔을 수도 있기 때문에
 * commit 전에 fresh render가 필요할 수 있다.
 */
let workInProgressRootInterleavedUpdatedLanes: Lanes = NoLanes;

/* =============================================================
   PART 17 — dispatchSetState

   L7:

       update
       ↓
       queue
       ↓
       즉시 sync render


   L8:

       update
       ↓
       lane 부여
       ↓
       queue
       ↓
       root.pendingLanes 표시
       ↓
       scheduler가 나중에 처리


   TODO 8-3
   ============================================================= */

function dispatchSetState<T>(queue: UpdateQueue<T>, action: SetStateAction<T>): void {
  if (currentlyRenderingFiber !== null) {
    throw new Error("render phase update forbidden");
  }

  const lane = requestUpdateLane();

  const update: StateUpdate<T> = {
    lane,
    action,
    next: null,
  };

  enqueueUpdate(queue, update);

  if (queue.fiber === null) {
    throw new Error("enqueue failed (queue - fiber not linked)");
  }

  scheduleUpdateOnFiber(queue.fiber, lane);
}

/* =============================================================
   PART 18 — mountState
   ============================================================= */

function mountState<T>(initialState: T): [T, Dispatch<T>] {
  const hook = mountWorkInProgressHook();

  hook.memoizedState = initialState;

  hook.baseState = initialState;

  hook.baseQueue = null;

  const queue: UpdateQueue<T> = {
    pending: null,

    dispatch: null,

    fiber: currentlyRenderingFiber,
  };

  const dispatch: Dispatch<T> = (action) => {
    dispatchSetState(queue, action);
  };

  queue.dispatch = dispatch;

  hook.queue = queue;

  return [initialState, dispatch];
}

/* =============================================================
   PART 19 — applyStateAction
   ============================================================= */

function applyStateAction<T>(state: T, action: SetStateAction<T>): T {
  if (typeof action === "function") {
    return (action as (previous: T) => T)(state);
  }

  return action;
}

/* =============================================================
   PART 20 — updateState

   ★★★★★ L8 핵심


   예:

   baseState = 0

   queue:

   Default +1
   Transition +100
   Sync +10


   Sync render:

   Default
     → priority 낮음
     → skip

   Transition
     → skip

   Sync
     → 적용


   화면 결과:

       10


   하지만 나중에 Default / Transition을
   처리할 수 있어야 한다.

   그래서 skipped update를
   baseQueue에 남긴다.


   더 중요한 점:

   낮은 priority update를 skip한 뒤
   뒤에 있는 높은 priority update를
   이미 처리했다면,

   나중에 rebase할 때
   그 높은 priority update도
   다시 재생할 필요가 있다.

   그때 lane = NoLane clone을 만든다.


   TODO 8-4
   ============================================================= */

function updateState<T>(_initialState: T): [T, Dispatch<T>] {
  const hook = updateWorkInProgressHook();

  const queue = hook.queue as UpdateQueue<T> | null;

  if (queue === null) {
    throw new Error("update queue 없음");
  }

  if (currentlyRenderingFiber === null) {
    throw new Error("rendering fiber 없음");
  }

  queue.fiber = currentlyRenderingFiber;

  let baseQueue = hook.baseQueue as StateUpdate<T> | null;

  const pendingQueue = queue.pending;

  // pending → baseQueue
  if (pendingQueue !== null) {
    queue.pending = null;

    if (baseQueue !== null) {
      const baseFirst = baseQueue.next;

      const pendingFirst = pendingQueue.next;

      if (baseFirst === null || pendingFirst === null) {
        throw new Error("broken circular queue");
      }

      baseQueue.next = pendingFirst;

      pendingQueue.next = baseFirst;
    }

    // merged queue의 tail
    baseQueue = pendingQueue;

    // interrupted render에서도
    // update를 잃지 않기 위해 current에도 보존
    if (currentHook === null) {
      throw new Error("currentHook 없음");
    }

    currentHook.baseQueue = baseQueue;
  }

  const dispatch = queue.dispatch;

  if (dispatch === null) {
    throw new Error("dispatch 없음");
  }

  if (baseQueue === null) {
    return [hook.memoizedState as T, dispatch];
  }

  const first = baseQueue.next;

  if (first === null) {
    throw new Error("broken circular queue");
  }

  let newState = hook.baseState as T;

  let newBaseState = newState;

  let newBaseQueueFirst: StateUpdate<T> | null = null;

  let newBaseQueueLast: StateUpdate<T> | null = null;

  let update: StateUpdate<T> = first;

  do {
    const updateLane = update.lane;

    const shouldSkip = updateLane !== NoLane && !includesSomeLane(workInProgressRootRenderLane, updateLane);

    if (shouldSkip) {
      const clone: StateUpdate<T> = {
        lane: updateLane,
        action: update.action,
        next: null,
      };

      if (newBaseQueueLast === null) {
        newBaseQueueFirst = clone;

        newBaseQueueLast = clone;

        // 첫 skip 시점의 state
        newBaseState = newState;
      } else {
        newBaseQueueLast.next = clone;

        newBaseQueueLast = clone;
      }

      currentlyRenderingFiber.lanes = mergeLanes(currentlyRenderingFiber.lanes, updateLane);
    } else {
      // 앞에서 skip이 있었다면
      // 나중 rebase를 위해
      // 처리된 update도 보존
      if (newBaseQueueLast !== null) {
        const clone: StateUpdate<T> = {
          lane: NoLane,

          action: update.action,

          next: null,
        };

        newBaseQueueLast.next = clone;

        newBaseQueueLast = clone;
      }

      newState = applyStateAction(newState, update.action);
    }

    const next = update.next;

    if (next === null) {
      throw new Error("broken circular queue");
    }

    update = next;
  } while (update !== first);

  if (newBaseQueueLast === null) {
    // 모두 처리함
    hook.baseState = newState;

    hook.baseQueue = null;
  } else {
    // circular list 완성
    newBaseQueueLast.next = newBaseQueueFirst;

    hook.baseState = newBaseState;

    hook.baseQueue = newBaseQueueLast;
  }

  hook.memoizedState = newState;

  return [newState, dispatch];
}

/* =============================================================
   PART 21 — Dispatcher
   ============================================================= */

type Dispatcher = {
  useState<T>(initialState: T): [T, Dispatch<T>];
};

const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState,
};

const HooksDispatcherOnUpdate: Dispatcher = {
  useState: updateState,
};

let currentDispatcher: Dispatcher | null = null;

function useState<T>(initialState: T): [T, Dispatch<T>] {
  if (currentDispatcher === null) {
    throw new Error("Invalid hook call");
  }

  return currentDispatcher.useState(initialState);
}

/* =============================================================
   PART 22 — renderWithHooks
   ============================================================= */

function renderWithHooks(
  current: Fiber | null,

  workInProgressFiber: Fiber,

  Component: FunctionComponent,

  props: Props,
): MiniReactNode {
  currentlyRenderingFiber = workInProgressFiber;

  workInProgressFiber.memoizedState = null;

  currentHook = null;

  workInProgressHook = null;

  currentDispatcher = current === null ? HooksDispatcherOnMount : HooksDispatcherOnUpdate;

  try {
    const children = Component(props);

    if (current !== null && current.memoizedState !== null) {
      const renderedCurrentHook = currentHook as Hook | null;

      if (renderedCurrentHook === null || renderedCurrentHook.next !== null) {
        throw new Error("Rendered fewer hooks than expected");
      }
    }

    return children;
  } finally {
    currentlyRenderingFiber = null;

    currentHook = null;

    workInProgressHook = null;

    currentDispatcher = null;
  }
}

/* =============================================================
   PART 23 — beginWork
   ============================================================= */

function updateHostRoot(
  current: Fiber | null,

  workInProgressFiber: Fiber,
): Fiber | null {
  const props = workInProgressFiber.pendingProps as Props;

  reconcileChildren(current, workInProgressFiber, props.children ?? null);

  return workInProgressFiber.child;
}

function updateFunctionComponent(
  current: Fiber | null,

  workInProgressFiber: Fiber,
): Fiber | null {
  const Component = workInProgressFiber.type as FunctionComponent;

  const props = workInProgressFiber.pendingProps as Props;

  const children = renderWithHooks(current, workInProgressFiber, Component, props);

  reconcileChildren(current, workInProgressFiber, children);

  return workInProgressFiber.child;
}

function updateHostComponent(
  current: Fiber | null,

  workInProgressFiber: Fiber,
): Fiber | null {
  const props = workInProgressFiber.pendingProps as Props;

  reconcileChildren(current, workInProgressFiber, props.children ?? null);

  return workInProgressFiber.child;
}

function beginWork(
  current: Fiber | null,

  workInProgressFiber: Fiber,
): Fiber | null {
  switch (workInProgressFiber.tag) {
    case "HostRoot":
      return updateHostRoot(current, workInProgressFiber);

    case "FunctionComponent":
      return updateFunctionComponent(current, workInProgressFiber);

    case "HostComponent":
      return updateHostComponent(current, workInProgressFiber);

    case "HostText":
      return null;
  }
}

/* =============================================================
   PART 24 — completeWork
   ============================================================= */

function haveHostPropsChanged(oldProps: Props, newProps: Props): boolean {
  const oldHost = extractHostProps(oldProps);

  const newHost = extractHostProps(newProps);

  const oldKeys = Object.keys(oldHost);

  const newKeys = Object.keys(newHost);

  if (oldKeys.length !== newKeys.length) {
    return true;
  }

  for (const key of oldKeys) {
    if (!Object.is(oldHost[key], newHost[key])) {
      return true;
    }
  }

  return false;
}

function appendAllChildren(parent: HostElement, workInProgressFiber: Fiber): void {
  let node = workInProgressFiber.child;

  while (node !== null) {
    if (node.tag === "HostComponent" || node.tag === "HostText") {
      appendHostChild(parent, node.stateNode as HostInstance);
    } else if (node.child !== null) {
      node = node.child;

      continue;
    }

    while (node.sibling === null) {
      if (node.return === null || node.return === workInProgressFiber) {
        return;
      }

      node = node.return;
    }

    node = node.sibling;
  }
}

/**
 * L5 effect bubbling
 * +
 * L8 lane bubbling
 */
function bubbleProperties(completedWork: Fiber): void {
  let subtreeFlags = NoFlags;

  let childLanes = NoLanes;

  let child = completedWork.child;

  while (child !== null) {
    subtreeFlags |= child.subtreeFlags;

    subtreeFlags |= child.flags;

    childLanes = mergeLanes(childLanes, child.lanes);

    childLanes = mergeLanes(childLanes, child.childLanes);

    child = child.sibling;
  }

  completedWork.subtreeFlags = subtreeFlags;

  completedWork.childLanes = childLanes;
}

function completeWork(
  current: Fiber | null,

  workInProgressFiber: Fiber,
): void {
  switch (workInProgressFiber.tag) {
    case "HostComponent": {
      const newProps = workInProgressFiber.pendingProps as Props;

      if (current === null) {
        const instance = createInstance(
          workInProgressFiber.type as string,

          newProps,
        );

        appendAllChildren(instance, workInProgressFiber);

        workInProgressFiber.stateNode = instance;
      } else {
        const oldProps = current.memoizedProps as Props;

        if (haveHostPropsChanged(oldProps, newProps)) {
          workInProgressFiber.flags |= Update;
        }
      }

      bubbleProperties(workInProgressFiber);

      return;
    }

    case "HostText": {
      const newText = workInProgressFiber.pendingProps as string;

      if (current === null) {
        workInProgressFiber.stateNode = createTextInstance(newText);
      } else {
        const oldText = current.memoizedProps as string;

        if (oldText !== newText) {
          workInProgressFiber.flags |= Update;
        }
      }

      bubbleProperties(workInProgressFiber);

      return;
    }

    case "FunctionComponent":

    case "HostRoot": {
      bubbleProperties(workInProgressFiber);

      return;
    }
  }
}

/* =============================================================
   PART 25 — Fiber Unit of Work

   중요:

   renderLane 하나를 처리했으므로
   해당 Fiber.lanes에서 제거.
   ============================================================= */

function performUnitOfWork(unitOfWork: Fiber): void {
  const current = unitOfWork.alternate;

  const next = beginWork(current, unitOfWork);

  unitOfWork.memoizedProps = unitOfWork.pendingProps;

  /**
   * 이번 render lane은
   * 이 Fiber에서 처리했다.
   *
   * skip된 낮은 priority lane은
   * updateState가 다시 lanes에
   * 남겨놓는다.
   */
  unitOfWork.lanes = removeLanes(unitOfWork.lanes, workInProgressRootRenderLane);

  if (next !== null) {
    workInProgress = next;
  } else {
    completeUnitOfWork(unitOfWork);
  }
}

function completeUnitOfWork(unitOfWork: Fiber): void {
  let completedWork: Fiber | null = unitOfWork;

  do {
    const current = completedWork.alternate;

    completeWork(current, completedWork);

    const sibling = completedWork.sibling;

    if (sibling !== null) {
      workInProgress = sibling;

      return;
    }

    completedWork = completedWork.return;

    workInProgress = completedWork;
  } while (completedWork !== null);
}

/* =============================================================
   ╔════════════════════════════════════════════════════════════╗
   ║             LEVEL 8 — CONCURRENT WORK LOOP               ║
   ╚════════════════════════════════════════════════════════════╝
   ============================================================= */

/* =============================================================
   PART 26 — shouldYield

   실제 React Scheduler는
   시간(time slice)을 기준으로 판단한다.

   우리는 학습용으로:

       Fiber N개 처리하면 yield

   로 단순화.


   TODO 8-5
   ============================================================= */

const UNIT_BUDGET = 5;

let unitsProcessedInSlice = 0;

function shouldYield(): boolean {
  return unitsProcessedInSlice >= UNIT_BUDGET;
}

/* =============================================================
   PART 27 — Concurrent Work Loop

   이전 sync:

   while (workInProgress !== null) {
     performUnitOfWork(...)
   }


   Concurrent:

   while (
     workInProgress !== null
     &&
     !shouldYield()
   )


   workInProgress를 null로
   초기화하지 않는다.

   그래서 다음 slice에서:

       "그 Fiber부터"

   다시 시작할 수 있다.


   TODO 8-6
   ============================================================= */

function workLoopConcurrent(): void {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
    unitsProcessedInSlice++;
  }
}

function workLoopSync(): void {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

/* =============================================================
   PART 28 — prepareFreshStack

   새로운 render 시작.

   current tree:

        root.current


   새로운 WIP root:

        createWorkInProgress(...)


   globals:

     workInProgressRoot
     workInProgressRootFiber
     workInProgressRootRenderLane
     workInProgress


   를 세팅.


   TODO 8-7
   ============================================================= */

function prepareFreshStack(root: FiberRoot, lane: Lane): void {
  if (root.element === null) {
    throw new Error("root element empty");
  }

  const current = root.current;
  const wipRoot = createWorkInProgress(current, { children: root.element });

  workInProgressRoot = root;
  workInProgressRootFiber = wipRoot;
  workInProgressRootRenderLane = lane;
  workInProgressRootInterleavedUpdatedLanes = NoLanes;
  workInProgress = wipRoot;
}

/* =============================================================
   PART 29 — scheduleUpdateOnFiber

   여기서는 실제 callback scheduler를
   만들지는 않는다.

   단지:

       "root에 이런 lane 작업이 있음"

   을 표시한다.

   실제 실행은 아래의:

       flushConcurrentWork()

   가 Scheduler 역할을 흉내 낸다.


   TODO 8-8
   ============================================================= */

function scheduleUpdateOnFiber(fiber: Fiber, lane: Lane): void {
  const root = markUpdateLaneFromFiberToRoot(fiber, lane);

  if (workInProgressRoot === root && workInProgress !== null) {
    workInProgressRootInterleavedUpdatedLanes |= lane;
  }
}

/* =============================================================
   PART 30 — Commit
   ============================================================= */

function findHostParent(start: Fiber | null): HostParent {
  let node = start;

  while (node !== null) {
    if (node.tag === "HostComponent") {
      return node.stateNode as HostElement;
    }

    if (node.tag === "HostRoot") {
      return (node.stateNode as FiberRoot).container;
    }

    node = node.return;
  }

  throw new Error("Host parent not found");
}

function getHostSibling(fiber: Fiber): HostInstance | null {
  let node = fiber;

  siblingSearch: while (true) {
    while (node.sibling === null) {
      const parent = node.return;

      if (parent === null || parent.tag === "HostRoot" || parent.tag === "HostComponent") {
        return null;
      }

      node = parent;
    }

    node = node.sibling;

    while (node.tag !== "HostComponent" && node.tag !== "HostText") {
      if (node.flags & Placement) {
        continue siblingSearch;
      }

      if (node.child === null) {
        continue siblingSearch;
      }

      node = node.child;
    }

    if (!(node.flags & Placement)) {
      return node.stateNode as HostInstance;
    }
  }
}

function insertOrAppendPlacementNode(
  fiber: Fiber,

  before: HostInstance | null,

  parent: HostParent,
): void {
  if (fiber.tag === "HostComponent" || fiber.tag === "HostText") {
    const node = fiber.stateNode as HostInstance;

    if (before !== null) {
      insertHostBefore(parent, node, before);
    } else {
      appendHostChild(parent, node);
    }

    return;
  }

  let child = fiber.child;

  while (child !== null) {
    insertOrAppendPlacementNode(child, before, parent);

    child = child.sibling;
  }
}

function commitPlacement(finishedWork: Fiber): void {
  const parent = findHostParent(finishedWork.return);

  const before = getHostSibling(finishedWork);

  insertOrAppendPlacementNode(finishedWork, before, parent);
}

function collectHostChildrenForDeletion(fiber: Fiber, result: HostInstance[]): void {
  if (fiber.tag === "HostComponent" || fiber.tag === "HostText") {
    result.push(fiber.stateNode as HostInstance);

    return;
  }

  let child = fiber.child;

  while (child !== null) {
    collectHostChildrenForDeletion(child, result);

    child = child.sibling;
  }
}

function commitDeletion(childToDelete: Fiber, returnFiber: Fiber): void {
  const parent = findHostParent(returnFiber);

  const hostChildren: HostInstance[] = [];

  collectHostChildrenForDeletion(childToDelete, hostChildren);

  for (const child of hostChildren) {
    removeHostChild(parent, child);
  }
}

function commitUpdate(fiber: Fiber): void {
  if (fiber.tag === "HostComponent") {
    const instance = fiber.stateNode as HostElement;

    instance.props = extractHostProps(fiber.pendingProps as Props);
  }

  if (fiber.tag === "HostText") {
    const instance = fiber.stateNode as HostTextInstance;

    instance.text = fiber.pendingProps as string;
  }
}

function recursivelyTraverseMutationEffects(parentFiber: Fiber): void {
  if (parentFiber.flags & ChildDeletion) {
    const deletions = parentFiber.deletions;

    if (deletions !== null) {
      for (const child of deletions) {
        commitDeletion(child, parentFiber);
      }
    }

    parentFiber.flags &= ~ChildDeletion;

    parentFiber.deletions = null;
  }

  if (parentFiber.subtreeFlags & MutationMask) {
    let child = parentFiber.child;

    while (child !== null) {
      commitMutationEffectsOnFiber(child);

      child = child.sibling;
    }
  }
}

function commitMutationEffectsOnFiber(fiber: Fiber): void {
  recursivelyTraverseMutationEffects(fiber);

  if (fiber.flags & Placement) {
    commitPlacement(fiber);

    fiber.flags &= ~Placement;
  }

  if (fiber.flags & Update) {
    commitUpdate(fiber);

    fiber.flags &= ~Update;
  }
}

function commitRoot(root: FiberRoot, finishedWork: Fiber): void {
  if ((finishedWork.flags & MutationMask) !== NoFlags || (finishedWork.subtreeFlags & MutationMask) !== NoFlags) {
    commitMutationEffectsOnFiber(finishedWork);
  }

  root.current = finishedWork;
}

/* =============================================================
   PART 31 — performConcurrentWorkOnRoot

   ★★★★★ L8 핵심


   root.pendingLanes:

       Sync
       Default
       Transition


   ↓

   highest priority 선택:

       Sync


   ↓

   Sync render 시작


   Fiber N개 처리


   ↓

   shouldYield == true


   ↓

   return


   다음 Scheduler tick:


   workInProgress가 남아있음

   ↓

   그대로 이어서 처리


   render 완료

   ↓

   commit


   TODO 8-9
   ============================================================= */

type ConcurrentWorkResult = "idle" | "yielded" | "committed" | "restarted";

function performConcurrentWorkOnRoot(root: FiberRoot): ConcurrentWorkResult {
  const lane = getHighestPriorityLane(root.pendingLanes);
  if (lane === NoLane) {
    return "idle";
  }

  if (workInProgressRoot !== root || workInProgressRootRenderLane !== lane || workInProgress === null) {
    prepareFreshStack(root, lane);
  }

  unitsProcessedInSlice = 0;

  workLoopConcurrent();

  if (workInProgress !== null) {
    return "yielded";
  }

  if (includesSomeLane(workInProgressRootInterleavedUpdatedLanes, lane)) {
    prepareFreshStack(root, lane);
    return "restarted";
  }

  const finishedWork = workInProgressRootFiber;
  if (finishedWork === null) {
    throw new Error("no finished work");
  }
  commitRoot(root, finishedWork);

  root.pendingLanes = removeLanes(root.pendingLanes, lane);

  workInProgressRoot = null;

  workInProgressRootFiber = null;

  workInProgressRootRenderLane = NoLane;

  workInProgressRootInterleavedUpdatedLanes = NoLanes;

  workInProgress = null;

  return "committed";
}

/* =============================================================
   PART 32 — Fake Scheduler Driver

   실제 React에서는 Scheduler가
   callback을 다시 호출한다.

   여기서는 while loop로
   Scheduler tick을 흉내 낸다.


   TODO 8-10
   ============================================================= */

function flushConcurrentWork(root: FiberRoot): void {
  while (root.pendingLanes !== NoLanes) {
    const result = performConcurrentWorkOnRoot(root);
    console.log("performConcurrentWorkOnRoot result: ", result);
  }
}

/* =============================================================
   PART 33 — Initial synchronous render

   최초 mount까지 concurrent하게 하면
   코드 읽기가 더 복잡해지므로
   최초 mount만 sync로 처리.

   state update부터 L8 scheduler 사용.
   ============================================================= */

function render(element: MiniReactElement, root: FiberRoot): void {
  root.element = element;

  prepareFreshStack(root, SyncLane);

  workLoopSync();

  if (workInProgressRootFiber === null) {
    throw new Error("No finished work");
  }

  commitRoot(root, workInProgressRootFiber);

  workInProgress = null;

  workInProgressRoot = null;

  workInProgressRootFiber = null;

  workInProgressRootRenderLane = NoLane;

  workInProgressRootInterleavedUpdatedLanes = NoLanes;
}

/* =============================================================
   PART 34 — Demo
   ============================================================= */

let externalSetCount: Dispatch<number> | null = null;

function getSetCount(): Dispatch<number> {
  const dispatch = externalSetCount as Dispatch<number> | null;

  if (dispatch === null) {
    throw new Error("setCount 없음");
  }

  return dispatch;
}

function Row(props: Props): MiniReactNode {
  return createElement("li", null, String(props.value));
}

function Counter(_props: Props): MiniReactNode {
  const [count, setCount] = useState(0);

  externalSetCount = setCount;

  /**
   * Fiber 수를 일부러 늘린다.
   *
   * UNIT_BUDGET이 작으므로
   * 한 render가 여러 slice로 나뉘는 걸
   * 확인할 수 있다.
   */
  const rows: MiniReactNode[] = [];

  for (let i = 0; i < 8; i++) {
    rows.push(
      createElement(Row, {
        key: String(i),
        value: `${count}-${i}`,
      }),
    );
  }

  return createElement(
    "section",

    {
      count,
    },

    createElement("h1", null, `Count: ${count}`),

    createElement("ul", null, ...rows),
  );
}

function App(): MiniReactNode {
  return createElement("main", null, createElement(Counter, null));
}

/* =============================================================
   PART 35 — Host Tree Debug
   ============================================================= */

function printHostTree(
  node: HostContainer | HostInstance,

  depth = 0,
): void {
  const indent = "  ".repeat(depth);

  if (node.kind === "container") {
    console.log(`${indent}<root>`);

    for (const child of node.children) {
      printHostTree(child, depth + 1);
    }

    console.log(`${indent}</root>`);

    return;
  }

  if (node.kind === "text") {
    console.log(`${indent}"${node.text}"`);

    return;
  }

  console.log(`${indent}<${node.type}>`);

  for (const child of node.children) {
    printHostTree(child, depth + 1);
  }

  console.log(`${indent}</${node.type}>`);
}

/* =============================================================
   PART 36 — Tests
   ============================================================= */

const root = createFiberRoot();

const app = createElement(App, null);

console.log("\n===== INITIAL =====");

render(app, root);

printHostTree(root.container);

/* -------------------------------------------------------------
   TEST 1 — 여러 priority update를 먼저 enqueue
   ------------------------------------------------------------- */

/**
 * enqueue 순서는:
 *
 * 1. Default     +1
 * 2. Transition +100
 * 3. Sync       +10
 *
 *
 * 하지만 scheduler 처리 순서는:
 *
 * Sync
 * ↓
 * Default
 * ↓
 * Transition
 *
 *
 * 최종 state는 update order를
 * rebase해서 보존해야 함.
 *
 * 원래 update 순서:
 *
 * 0
 * ↓ +1
 * 1
 * ↓ +100
 * 101
 * ↓ +10
 * 111
 */

runWithLane(DefaultLane, () => {
  getSetCount()((prev) => prev + 1);
});

runWithLane(TransitionLane, () => {
  getSetCount()((prev) => prev + 100);
});

runWithLane(SyncLane, () => {
  getSetCount()((prev) => prev + 10);
});

console.log("\npending lanes:", root.pendingLanes);

/**
 * 기대:
 *
 * Sync | Default | Transition
 *
 * 세 lane이 모두 pending.
 */

/* -------------------------------------------------------------
   TEST 2 — concurrent flush
   ------------------------------------------------------------- */

console.log("\n===== CONCURRENT FLUSH =====");

flushConcurrentWork(root);

/**
 * UNIT_BUDGET = 5 이므로
 *
 * 한 lane render도:
 *
 * slice 1
 * yield
 *
 * slice 2
 * yield
 *
 * ...
 *
 * 처럼 나뉠 수 있다.
 *
 *
 * Lane 처리:
 *
 * Sync commit
 * ↓
 * Default commit
 * ↓
 * Transition commit
 *
 *
 * 최종:
 *
 * Count: 111
 */

/* -------------------------------------------------------------
   TEST 3
   ------------------------------------------------------------- */

console.log("\n===== FINAL HOST TREE =====");

printHostTree(root.container);

/* =============================================================
   LEVEL 8 — FINAL MENTAL MODEL


   setState(action)
        │
        ▼
   requestUpdateLane()
        │
        ▼
   Update {
     action,
     lane
   }
        │
        ▼
   Hook.queue
        │
        ▼
   Fiber.lanes
        │
        ▼
   parent.childLanes
        │
        ▼
   root.pendingLanes


   ─────────────────────────


   root.pendingLanes

     0111

       │
       ▼

   getHighestPriorityLane

       │
       ▼

     0001 Sync


   ─────────────────────────


   prepareFreshStack

       │
       ▼

   workInProgress
       │
       ▼
     Fiber #1
       │
       ▼
     Fiber #2
       │
       ▼
     Fiber #3
       │
       ▼

   shouldYield()

       │
       ├ YES
       │
       │
       │   workInProgress 보존
       │
       │       ↓
       │   다음 scheduler tick
       │       ↓
       │   같은 Fiber부터 재개
       │
       │
       └ NO
           ↓
        계속 작업


   ─────────────────────────


   useState update queue:

   Default
      ↓
   Transition
      ↓
   Sync


   Sync render라면:

   Default    → skip
   Transition → skip
   Sync       → process


   skip된 update:

       baseQueue


   process된 state:

       memoizedState


   ─────────────────────────


   Render 완료

       ↓

   commitRoot

       ↓

   root.current = WIP

       ↓

   처리한 lane 제거

       ↓

   다음 highest lane 처리


   =============================================================

   가장 중요한 결론


   Fiber가 존재하는 이유가
   여기에서 완성된다.


   재귀 호출이었다면:

       App()
         Child()
           Child()
             Child()

   JS call stack에 작업 위치가
   묶여버린다.


   Fiber에서는:

       workInProgress
            ↓
         Fiber X

   라는 명시적인 cursor가 있으므로


       "여기까지 했어"

   를 기억하고

       return


   했다가 나중에


       Fiber X부터 계속


   할 수 있다.


   즉 Fiber는 단순한
   Virtual DOM Node가 아니다.


   Fiber =
     interruptible unit of work


   ============================================================= */

export {};
