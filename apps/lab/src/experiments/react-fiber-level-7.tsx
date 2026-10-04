/* ═══════════════════════════════════════════════════════════════
   MINI REACT FIBER — LEVEL 7

   L1  Fiber traversal
   L2  Element → Fiber
   L3  current / workInProgress / alternate
   L4  keyed reconciliation
   L5  completeWork + commit + Host Tree
   L6  useState Hook linked list

   ───────────────────────────────────────────────────────────────

   LEVEL 7

   setState
      ↓
   Update
      ↓
   UpdateQueue
      ↓
   scheduleUpdateOnFiber
      ↓
   renderRoot
      ↓
   updateState
      ↓
   queue 처리
      ↓
   새 state 계산
      ↓
   commit

   아직 안 하는 것

   ✗ batching
   ✗ lanes
   ✗ priority
   ✗ concurrent rendering
   ✗ render-phase update
   ✗ useEffect
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   PART 0 — React Element
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
   PART 1 — Flags
   ═══════════════════════════════════════════════════════════════ */

const NoFlags = 0b0000;

const Placement = 0b0001;

const ChildDeletion = 0b0010;

const Update = 0b0100;

const MutationMask = Placement | ChildDeletion | Update;

/* ═══════════════════════════════════════════════════════════════
   PART 2 — Mini Host Tree

   실제 React DOM 대신 plain object 사용.
   ═══════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════
   PART 3 — LEVEL 7 Types

   이번 Level 핵심 자료구조.


   Hook
    │
    ├─ memoizedState
    │
    └─ queue
         │
         └─ pending
              ↓
           Update
              ↓
           Update
              ↓
              └──────┐
                     │
                     └ circular


   pending은 "가장 마지막 update".

   pending.next가
   "가장 오래된 update".
   ═══════════════════════════════════════════════════════════════ */

type SetStateAction<T> = T | ((previous: T) => T);

type Dispatch<T> = (action: SetStateAction<T>) => void;

/**
 * setState 한 번 호출할 때 하나 생성된다.
 *
 * setCount(10)
 *
 * →
 *
 * Update {
 *   action: 10
 * }
 *
 *
 * setCount(prev => prev + 1)
 *
 * →
 *
 * Update {
 *   action: prev => prev + 1
 * }
 */
type StateUpdate<T> = {
  action: SetStateAction<T>;

  /**
   * circular linked list
   */
  next: StateUpdate<T> | null;
};

/**
 * 하나의 useState Hook이 소유하는 queue.
 *
 * queue 자체는 current / WIP Hook이 공유한다.
 */
type UpdateQueue<T> = {
  /**
   * 가장 최근 Update.
   *
   * pending.next는 가장 오래된 Update.
   */
  pending: StateUpdate<T> | null;

  /**
   * 우리가 사용자에게 반환하는 setState.
   *
   * render가 바뀌어도 같은 함수 identity를 유지한다.
   */
  dispatch: Dispatch<T> | null;

  /**
   * 이 queue가 현재 어느 Fiber에 붙어 있는지.
   *
   * L7 학습용 단순화.
   */
  fiber: Fiber | null;
};

type Hook = {
  /**
   * 현재 state 값.
   */
  memoizedState: unknown;

  /**
   * useState의 UpdateQueue.
   */
  queue: UpdateQueue<any> | null;

  /**
   * 다음 Hook.
   */
  next: Hook | null;
};

/* ═══════════════════════════════════════════════════════════════
   PART 4 — Fiber
   ═══════════════════════════════════════════════════════════════ */

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

  flags: number;

  subtreeFlags: number;

  deletions: Fiber[] | null;

  alternate: Fiber | null;

  /**
   * FunctionComponent:
   *
   * Fiber.memoizedState
   *      ↓
   *    Hook #1
   *      ↓
   *    Hook #2
   *      ↓
   *    Hook #3
   */
  memoizedState: Hook | null;

  /**
   * HostComponent → HostElement
   * HostText      → HostTextInstance
   * HostRoot      → FiberRoot
   * Function      → null
   */
  stateNode: HostInstance | FiberRoot | null;
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

    flags: NoFlags,

    subtreeFlags: NoFlags,

    deletions: null,

    alternate: null,

    memoizedState: null,

    stateNode: null,
  };
}

/* ═══════════════════════════════════════════════════════════════
   PART 5 — FiberRoot

   LEVEL 7에서 element 추가.

   setState는 새로운 JSX를 직접 받지 않는다.

   따라서 root가:

       "현재 렌더 중인 최상위 Element"

   를 기억해 둬야 한다.

   setState
      ↓
   root.element
      ↓
   다시 render
   ═══════════════════════════════════════════════════════════════ */

type FiberRoot = {
  current: Fiber;

  container: HostContainer;

  /**
   * L7
   *
   * setState 발생 시
   * 같은 앱을 다시 렌더하기 위해 저장.
   */
  element: MiniReactElement | null;
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
  };

  hostRootFiber.stateNode = root;

  return root;
}

/* ═══════════════════════════════════════════════════════════════
   PART 6 — current ↔ WIP
   ═══════════════════════════════════════════════════════════════ */

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

  return workInProgress;
}

/* ═══════════════════════════════════════════════════════════════
   PART 7 — Element → Fiber
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

/* ═══════════════════════════════════════════════════════════════
   PART 8 — Mount Children
   ═══════════════════════════════════════════════════════════════ */

function mountChildFibers(
  returnFiber: Fiber,

  newChildren: MiniReactNode,
): Fiber | null {
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
   PART 9 — Fiber Reuse
   ═══════════════════════════════════════════════════════════════ */

function useFiber(
  fiber: Fiber,

  pendingProps: Props | string | null,
): Fiber {
  const clone = createWorkInProgress(fiber, pendingProps);

  clone.index = 0;

  clone.sibling = null;

  return clone;
}

/* ═══════════════════════════════════════════════════════════════
   PART 10 — Delete
   ═══════════════════════════════════════════════════════════════ */

function deleteChild(returnFiber: Fiber, childToDelete: Fiber): void {
  const deletions = returnFiber.deletions;

  if (deletions === null) {
    returnFiber.deletions = [childToDelete];

    returnFiber.flags |= ChildDeletion;
  } else {
    deletions.push(childToDelete);
  }
}

function deleteRemainingChildren(
  returnFiber: Fiber,

  currentFirstChild: Fiber | null,
): void {
  let child = currentFirstChild;

  while (child !== null) {
    deleteChild(returnFiber, child);

    child = child.sibling;
  }
}

/* ═══════════════════════════════════════════════════════════════
   PART 11 — Reconciliation helpers
   ═══════════════════════════════════════════════════════════════ */

function updateTextNode(
  returnFiber: Fiber,

  current: Fiber | null,

  textContent: string,
): Fiber {
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

function updateElement(
  returnFiber: Fiber,

  current: Fiber | null,

  element: MiniReactElement,
): Fiber {
  if (current !== null && current.type === element.type) {
    const existing = useFiber(current, element.props);

    existing.return = returnFiber;

    return existing;
  }

  const created = createFiberFromElement(element);

  created.return = returnFiber;

  return created;
}

function updateSlot(
  returnFiber: Fiber,

  oldFiber: Fiber,

  newChild: MiniReactNode,
): Fiber | null {
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
  const existingChildren = new Map<string | number, Fiber>();

  let existingChild: Fiber | null = currentFirstChild;

  while (existingChild !== null) {
    const key = existingChild.key !== null ? existingChild.key : existingChild.index;

    existingChildren.set(key, existingChild);

    existingChild = existingChild.sibling;
  }

  return existingChildren;
}

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

function placeChild(
  newFiber: Fiber,

  lastPlacedIndex: number,

  newIndex: number,
): number {
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
   PART 12 — Array Reconciliation
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

  /* FAST PATH */

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

  /* new가 먼저 끝남 */

  if (newIndex === newChildren.length) {
    deleteRemainingChildren(returnFiber, oldFiber);

    if (previousNewFiber !== null) {
      previousNewFiber.sibling = null;
    }

    return resultingFirstChild;
  }

  /* old가 먼저 끝남 */

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

  /* Slow path */

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

function reconcileChildren(
  current: Fiber | null,

  workInProgress: Fiber,

  nextChildren: MiniReactNode,
): void {
  if (current === null) {
    workInProgress.child = mountChildFibers(workInProgress, nextChildren);
  } else {
    workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren);
  }
}

/* ═══════════════════════════════════════════════════════════════
   PART 13 — LEVEL 6 Hook Globals

   Fiber tree cursor:

       global workInProgress


   Hook cursors:

       currentlyRenderingFiber

       currentHook

       workInProgressHook
   ═══════════════════════════════════════════════════════════════ */

let currentlyRenderingFiber: Fiber | null = null;

let currentHook: Hook | null = null;

let workInProgressHook: Hook | null = null;

/* ═══════════════════════════════════════════════════════════════
   PART 14 — Hook linked list
   ═══════════════════════════════════════════════════════════════ */

function mountWorkInProgressHook(): Hook {
  if (currentlyRenderingFiber === null) {
    throw new Error("렌더 중인 Fiber가 없습니다.");
  }

  const hook: Hook = {
    memoizedState: null,

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
    throw new Error("렌더 중인 Fiber가 없습니다.");
  }

  let nextCurrentHook: Hook | null;

  if (currentHook === null) {
    const currentFiber = currentlyRenderingFiber.alternate;

    nextCurrentHook = currentFiber?.memoizedState ?? null;
  } else {
    nextCurrentHook = currentHook.next;
  }

  if (nextCurrentHook === null) {
    throw new Error("Rendered more hooks than during the previous render");
  }

  currentHook = nextCurrentHook;

  /**
   * current Hook 자체를 변경하지 않는다.
   *
   * WIP Hook을 새로 만든다.
   *
   * 단 queue 객체는 공유한다.
   *
   * current Hook
   *     │
   *     └ queue ───────────┐
   *                         │
   * WIP Hook                │
   *     └ queue ────────────┘
   */
  const newHook: Hook = {
    memoizedState: currentHook.memoizedState,

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

/* ═══════════════════════════════════════════════════════════════
   ╔════════════════════════════════════════════════════════════╗
   ║                   LEVEL 7 START                          ║
   ╚════════════════════════════════════════════════════════════╝
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   PART 15 — enqueueUpdate

   queue는 circular linked list.


   최초:

   pending = null


   setState(A)

          ┌────────┐
          │        ▼
       Update A ───┘

       pending
          ↓
          A


   setState(B)


       A → B
       ↑   │
       └───┘

           ↑
        pending


   pending은 항상 최신 Update.

   pending.next는 가장 오래된 Update.


   TODO 7-1
   ═══════════════════════════════════════════════════════════════ */

function enqueueUpdate<T>(
  queue: UpdateQueue<T>,

  update: StateUpdate<T>,
): void {
  const pending = queue.pending;
  if (pending === null) {
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }

  queue.pending = update;
}

/* ═══════════════════════════════════════════════════════════════
   PART 16 — dispatchSetState

   사용자가:

       setCount(10)

   호출하면 실제로 여기로 들어온다고 생각.


   setState가 하는 일:

   ① Update 생성

   ② queue에 enqueue

   ③ root에 업데이트 발생 사실 전달

   중요한 것:

       setState가 state를
       여기서 직접 변경하지 않는다.


   ❌

       hook.memoizedState = 10


   ✅

       queue에 Update를 넣는다.

       다음 render에서
       state를 계산한다.


   TODO 7-2
   ═══════════════════════════════════════════════════════════════ */

function dispatchSetState<T>(
  queue: UpdateQueue<T>,

  action: SetStateAction<T>,
): void {
  if (currentlyRenderingFiber !== null) {
    throw new Error("현재 render 중 setState는 L7에서는 지원하지 않는다.");
  }

  const newUpdate: StateUpdate<T> = {
    action,
    next: null,
  };

  enqueueUpdate(queue, newUpdate);

  if (queue.fiber === null) {
    throw new Error("queue 삽입 실패");
  }

  scheduleUpdateOnFiber(queue.fiber);
}

/* ═══════════════════════════════════════════════════════════════
   PART 17 — mountState


   최초 render:

       const [count, setCount]
           = useState(0)


   Fiber
     ↓
   Hook
     ├ memoizedState = 0
     │
     └ queue
         ├ pending = null
         ├ dispatch = setCount
         └ fiber = 현재 Fiber


   여기서 만들어진 queue는
   이후 render에서도 계속 재사용한다.


   TODO 7-3
   ═══════════════════════════════════════════════════════════════ */

function mountState<T>(initialState: T): [T, Dispatch<T>] {
  const hook = mountWorkInProgressHook();
  hook.memoizedState = initialState;
  const queue: UpdateQueue<T> = {
    pending: null,
    dispatch: null,
    fiber: currentlyRenderingFiber,
  };
  const dispatch: Dispatch<T> = (action) => dispatchSetState(queue, action);

  queue.dispatch = dispatch;
  hook.queue = queue;

  return [initialState, dispatch];
}

/* ═══════════════════════════════════════════════════════════════
   PART 18 — processUpdateQueue


   현재:

       state = 0


   queue:

       setState(prev => prev + 1)
       setState(prev => prev + 1)
       setState(10)


   처리:

       0
       ↓ +1
       1
       ↓ +1
       2
       ↓ 10
       10


   핵심:

   UpdateQueue는
   "state 변경 명령들의 목록".

   state는 render에서 계산된다.


   TODO 7-4
   ═══════════════════════════════════════════════════════════════ */

function processUpdateQueue<T>(baseState: T, queue: UpdateQueue<T>): T {
  const pending = queue.pending;

  if (pending === null) {
    return baseState;
  }

  const first = pending.next;

  if (first === null) {
    throw new Error("Invalid update queue");
  }

  let update: StateUpdate<T> = first;
  let newState = baseState;

  do {
    const action = update.action;

    if (typeof action === "function") {
      newState = (action as (previous: T) => T)(newState);
    } else {
      newState = action;
    }

    update = update.next as StateUpdate<T>;
  } while (update !== first);

  queue.pending = null;

  return newState;
}

/* ═══════════════════════════════════════════════════════════════
   PART 19 — updateState


   update render:


   current Hook

      state = 0
      queue
        ↓
      Update(+1)


          ↓


   updateWorkInProgressHook()


          ↓


   WIP Hook

      state = 0
      같은 queue 공유


          ↓


   processUpdateQueue


          ↓


      state = 1


   TODO 7-5
   ═══════════════════════════════════════════════════════════════ */

function updateState<T>(_initialState: T): [T, Dispatch<T>] {
  const hook = updateWorkInProgressHook();
  const queue = hook.queue;
  if (queue === null) {
    throw new Error("no queue in hook");
  }

  queue.fiber = currentlyRenderingFiber;

  const newState = processUpdateQueue(hook.memoizedState, queue);

  hook.memoizedState = newState;

  const dispatch = queue.dispatch;

  if (dispatch === null) {
    throw new Error("no dispatch created when mounted");
  }

  return [newState, dispatch];
}

/* ═══════════════════════════════════════════════════════════════
   PART 20 — Dispatcher
   ═══════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════
   PART 21 — renderWithHooks

   L6 완성본.

   update:

   current Fiber
      │
      └ Hook A → Hook B → Hook C


   WIP Fiber
      │
      └ Hook A' → Hook B' → Hook C'


   currentHook:

       이전 list cursor


   workInProgressHook:

       새 list cursor
   ═══════════════════════════════════════════════════════════════ */

function renderWithHooks(
  current: Fiber | null,

  workInProgress: Fiber,

  Component: FunctionComponent,

  props: Props,
): MiniReactNode {
  currentlyRenderingFiber = workInProgress;

  workInProgress.memoizedState = null;

  currentHook = null;

  workInProgressHook = null;

  currentDispatcher = current === null ? HooksDispatcherOnMount : HooksDispatcherOnUpdate;

  try {
    const children = Component(props);

    if (current !== null) {
      const currentFirstHook = current.memoizedState;

      if (currentFirstHook !== null) {
        /**
         * TS는 Component(props) 내부에서
         * module global currentHook이
         * 변경됐다는 사실을 추론하지 못하므로
         * snapshot으로 명시.
         */
        const renderedCurrentHook = currentHook as Hook | null;

        if (renderedCurrentHook === null || renderedCurrentHook.next !== null) {
          throw new Error("Rendered fewer hooks than expected");
        }
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

/* ═══════════════════════════════════════════════════════════════
   PART 22 — beginWork
   ═══════════════════════════════════════════════════════════════ */

function updateHostRoot(
  current: Fiber | null,

  workInProgress: Fiber,
): Fiber | null {
  const props = workInProgress.pendingProps as Props;

  const nextChildren = props.children ?? null;

  reconcileChildren(current, workInProgress, nextChildren);

  return workInProgress.child;
}

function updateFunctionComponent(
  current: Fiber | null,

  workInProgress: Fiber,
): Fiber | null {
  const Component = workInProgress.type as FunctionComponent;

  const props = workInProgress.pendingProps as Props;

  const nextChildren = renderWithHooks(current, workInProgress, Component, props);

  reconcileChildren(current, workInProgress, nextChildren);

  return workInProgress.child;
}

function updateHostComponent(
  current: Fiber | null,

  workInProgress: Fiber,
): Fiber | null {
  const props = workInProgress.pendingProps as Props;

  const nextChildren = props.children ?? null;

  reconcileChildren(current, workInProgress, nextChildren);

  return workInProgress.child;
}

function beginWork(
  current: Fiber | null,

  workInProgress: Fiber,
): Fiber | null {
  switch (workInProgress.tag) {
    case "HostRoot":
      return updateHostRoot(current, workInProgress);

    case "FunctionComponent":
      return updateFunctionComponent(current, workInProgress);

    case "HostComponent":
      return updateHostComponent(current, workInProgress);

    case "HostText":
      return null;
  }
}

/* ═══════════════════════════════════════════════════════════════
   PART 23 — completeWork Helpers
   ═══════════════════════════════════════════════════════════════ */

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

/**
 * Mount된 HostComponent의
 * Host subtree 조립.
 */
function appendAllChildren(
  parent: HostElement,

  workInProgress: Fiber,
): void {
  let node = workInProgress.child;

  while (node !== null) {
    if (node.tag === "HostComponent" || node.tag === "HostText") {
      appendHostChild(parent, node.stateNode as HostInstance);
    } else if (node.child !== null) {
      node = node.child;

      continue;
    }

    while (node.sibling === null) {
      if (node.return === null || node.return === workInProgress) {
        return;
      }

      node = node.return;
    }

    node = node.sibling;
  }
}

function bubbleProperties(completedWork: Fiber): void {
  let subtreeFlags = NoFlags;

  let child = completedWork.child;

  while (child !== null) {
    subtreeFlags |= child.subtreeFlags;

    subtreeFlags |= child.flags;

    child = child.sibling;
  }

  completedWork.subtreeFlags = subtreeFlags;
}

function completeWork(
  current: Fiber | null,

  workInProgress: Fiber,
): void {
  switch (workInProgress.tag) {
    case "HostComponent": {
      const newProps = workInProgress.pendingProps as Props;

      if (current === null) {
        const instance = createInstance(
          workInProgress.type as string,

          newProps,
        );

        appendAllChildren(instance, workInProgress);

        workInProgress.stateNode = instance;
      } else {
        const oldProps = current.memoizedProps as Props;

        if (haveHostPropsChanged(oldProps, newProps)) {
          workInProgress.flags |= Update;
        }
      }

      bubbleProperties(workInProgress);

      return;
    }

    case "HostText": {
      const newText = workInProgress.pendingProps as string;

      if (current === null) {
        workInProgress.stateNode = createTextInstance(newText);
      } else {
        const oldText = current.memoizedProps as string;

        if (oldText !== newText) {
          workInProgress.flags |= Update;
        }
      }

      bubbleProperties(workInProgress);

      return;
    }

    case "FunctionComponent":

    case "HostRoot": {
      bubbleProperties(workInProgress);

      return;
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   PART 24 — Work Loop
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

function workLoopSync(): void {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function renderRoot(
  root: FiberRoot,

  element: MiniReactElement,
): Fiber {
  const current = root.current;

  const workInProgressRoot = createWorkInProgress(current, {
    children: element,
  });

  workInProgress = workInProgressRoot;

  workLoopSync();

  return workInProgressRoot;
}

/* ═══════════════════════════════════════════════════════════════
   PART 25 — Commit helpers
   ═══════════════════════════════════════════════════════════════ */

function findHostParent(start: Fiber | null): HostParent {
  let parent = start;

  while (parent !== null) {
    if (parent.tag === "HostComponent") {
      return parent.stateNode as HostElement;
    }

    if (parent.tag === "HostRoot") {
      const root = parent.stateNode as FiberRoot;

      return root.container;
    }

    parent = parent.return;
  }

  throw new Error("Host parent not found");
}

function getHostParent(fiber: Fiber): HostParent {
  return findHostParent(fiber.return);
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
  const parent = getHostParent(finishedWork);

  const before = getHostSibling(finishedWork);

  insertOrAppendPlacementNode(finishedWork, before, parent);
}

function collectHostChildrenForDeletion(
  fiber: Fiber,

  result: HostInstance[],
): void {
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

function commitDeletion(
  childToDelete: Fiber,

  returnFiber: Fiber,
): void {
  const parent = findHostParent(returnFiber);

  const hostChildren: HostInstance[] = [];

  collectHostChildrenForDeletion(childToDelete, hostChildren);

  for (const child of hostChildren) {
    removeHostChild(parent, child);
  }
}

function commitUpdate(finishedWork: Fiber): void {
  switch (finishedWork.tag) {
    case "HostComponent": {
      const instance = finishedWork.stateNode as HostElement;

      const newProps = finishedWork.pendingProps as Props;

      instance.props = extractHostProps(newProps);

      return;
    }

    case "HostText": {
      const text = finishedWork.stateNode as HostTextInstance;

      text.text = finishedWork.pendingProps as string;

      return;
    }

    default:
      return;
  }
}

/* ═══════════════════════════════════════════════════════════════
   PART 26 — Commit traversal
   ═══════════════════════════════════════════════════════════════ */

function recursivelyTraverseMutationEffects(parentFiber: Fiber): void {
  if (parentFiber.flags & ChildDeletion) {
    const deletions = parentFiber.deletions;

    if (deletions !== null) {
      for (const childToDelete of deletions) {
        commitDeletion(childToDelete, parentFiber);
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

function commitMutationEffectsOnFiber(finishedWork: Fiber): void {
  recursivelyTraverseMutationEffects(finishedWork);

  if (finishedWork.flags & Placement) {
    commitPlacement(finishedWork);

    finishedWork.flags &= ~Placement;
  }

  if (finishedWork.flags & Update) {
    commitUpdate(finishedWork);

    finishedWork.flags &= ~Update;
  }
}

function commitMutationEffects(finishedWork: Fiber): void {
  commitMutationEffectsOnFiber(finishedWork);
}

function commitRoot(
  root: FiberRoot,

  finishedWork: Fiber,
): void {
  const subtreeHasEffects = (finishedWork.subtreeFlags & MutationMask) !== NoFlags;

  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;

  if (subtreeHasEffects || rootHasEffect) {
    commitMutationEffects(finishedWork);
  }

  root.current = finishedWork;
}

/* ═══════════════════════════════════════════════════════════════
   PART 27 — LEVEL 7 Root lookup

   setState가 발생한 Fiber에서:

       Counter
          ↑
        div
          ↑
        App
          ↑
       HostRoot


   return을 계속 타고 올라가서
   HostRoot Fiber를 찾는다.

   HostRoot.stateNode
      ↓
   FiberRoot


   TODO 7-6
   ═══════════════════════════════════════════════════════════════ */

function getRootFromFiber(sourceFiber: Fiber): FiberRoot {
  let node = sourceFiber;

  while (node.return !== null) {
    node = node.return;
  }

  if (node.tag !== "HostRoot") {
    throw new Error("root is not HostRoot");
  }

  return node.stateNode as FiberRoot;
}

/* ═══════════════════════════════════════════════════════════════
   PART 28 — scheduleUpdateOnFiber


   Level 7에서는 Sync Scheduler.


   setState
      ↓
   scheduleUpdateOnFiber
      ↓
   root 찾기
      ↓
   root.element 가져오기
      ↓
   renderRoot
      ↓
   commitRoot


   즉 setState 하나 호출하면
   바로 전체 sync render가 시작된다.


   실제 React는 여기 사이에:

       lanes
       scheduler
       batching
       priority

   등이 들어간다.


   그게 L8.


   TODO 7-7
   ═══════════════════════════════════════════════════════════════ */

function scheduleUpdateOnFiber(fiber: Fiber): void {
  const root = getRootFromFiber(fiber);
  if (root.element === null) {
    throw new Error("root.element is null");
  }

  const finishedWork = renderRoot(root, root.element);

  commitRoot(root, finishedWork);
}

/* ═══════════════════════════════════════════════════════════════
   PART 29 — Public render

   최초 앱 render.

   중요:

   root.element = element

   을 저장해둔다.

   이후 setState가 같은 Element를
   사용해 다시 render할 수 있다.
   ═══════════════════════════════════════════════════════════════ */

function render(
  element: MiniReactElement,

  root: FiberRoot,
): void {
  root.element = element;

  const finishedWork = renderRoot(root, element);

  commitRoot(root, finishedWork);
}

/* ═══════════════════════════════════════════════════════════════
   PART 30 — Debug
   ═══════════════════════════════════════════════════════════════ */

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

  const propsString = Object.entries(node.props)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join(" ");

  console.log(`${indent}<${node.type}${propsString ? " " + propsString : ""}>`);

  for (const child of node.children) {
    printHostTree(child, depth + 1);
  }

  console.log(`${indent}</${node.type}>`);
}

function printHooks(fiber: Fiber): void {
  let hook = fiber.memoizedState;

  let index = 1;

  while (hook !== null) {
    console.log(`Hook #${index}`, {
      state: hook.memoizedState,

      pending: hook.queue?.pending !== null,
    });

    hook = hook.next;

    index++;
  }
}

/* ═══════════════════════════════════════════════════════════════
   PART 31 — Demo

   두 개의 useState.

   Hook list:

   Counter Fiber
      │
      └─ Hook #1 count
           │
           └─ Hook #2 label
   ═══════════════════════════════════════════════════════════════ */

let externalSetCount: Dispatch<number> | null = null;

let externalSetLabel: Dispatch<string> | null = null;

function Counter(_props: Props): MiniReactNode {
  const [count, setCount] = useState(0);

  const [label, setLabel] = useState("Count");

  externalSetCount = setCount;

  externalSetLabel = setLabel;

  return createElement(
    "div",

    {
      role: "counter",
    },

    createElement(
      "span",

      null,

      `${label}: ${count}`,
    ),
  );
}

function App(_props: Props): MiniReactNode {
  return createElement(
    "main",

    null,

    createElement(Counter, null),
  );
}

/* ═══════════════════════════════════════════════════════════════
   PART 32 — Tests
   ═══════════════════════════════════════════════════════════════ */

const root = createFiberRoot();

const appElement = createElement(App, null);

console.log("\n══════════════════");

console.log("1. INITIAL MOUNT");

console.log("══════════════════");

render(appElement, root);

printHostTree(root.container);

function getSetCount(): Dispatch<number> {
  if (externalSetCount === null) {
    throw new Error("setCount 없음");
  }

  return externalSetCount;
}

function getSetLabel(): Dispatch<string> {
  if (externalSetLabel === null) {
    throw new Error("setLabel 없음");
  }

  return externalSetLabel;
}

/**
 * 기대:
 *
 * <root>
 *   <main>
 *     <div role="counter">
 *       <span>
 *         "Count: 0"
 *       </span>
 *     </div>
 *   </main>
 * </root>
 */

/* ───────────────────────────────────────────────────────────── */

console.log("\n══════════════════");

console.log("2. setCount(1)");

console.log("══════════════════");

if (externalSetCount === null) {
  throw new Error("setCount 없음");
}

getSetCount()(1);

printHostTree(root.container);

/**
 * 기대:
 *
 * Count: 1
 */

/* ───────────────────────────────────────────────────────────── */

console.log("\n══════════════════");

console.log("3. functional update");

console.log("══════════════════");

getSetCount()((prev) => prev + 10);

printHostTree(root.container);

/**
 * 기대:
 *
 * Count: 11
 */

/* ───────────────────────────────────────────────────────────── */

console.log("\n══════════════════");

console.log("4. second Hook update");

console.log("══════════════════");

if (externalSetLabel === null) {
  throw new Error("setLabel 없음");
}

getSetLabel()("Total");

printHostTree(root.container);

/**
 * 기대:
 *
 * Total: 11
 */

/* ───────────────────────────────────────────────────────────── */

console.log("\n══════════════════");

console.log("5. Hook list");

console.log("══════════════════");

/**
 * Root
 *   ↓
 * App
 *   ↓
 * main
 *   ↓
 * Counter
 *
 * 를 찾아본다.
 */

const appFiber = root.current.child;

const mainFiber = appFiber?.child;

const counterFiber = mainFiber?.child;

if (counterFiber === undefined || counterFiber === null) {
  throw new Error("Counter Fiber 없음");
}

printHooks(counterFiber);

/**
 * 기대:
 *
 * Hook #1
 * {
 *   state: 11,
 *   pending: false
 * }
 *
 * Hook #2
 * {
 *   state: "Total",
 *   pending: false
 * }
 */

/* ═══════════════════════════════════════════════════════════════
   LEVEL 7 최종 Mental Model


   최초 render
   ──────────────────────

   Counter Fiber

      memoizedState
           ↓
       Hook(count=0)
           │
           │ queue
           ↓
       UpdateQueue
           │
           └ dispatch=setCount

           ↓ next

       Hook(label="Count")
           │
           └ queue


   setCount(prev => prev + 1)
   ──────────────────────

   dispatch
      ↓

   dispatchSetState
      ↓

   Update 생성

   {
      action: prev => prev + 1
   }

      ↓

   queue.pending에 저장

      ↓

   scheduleUpdateOnFiber

      ↓

   Fiber.return을 따라
   HostRoot 탐색

      ↓

   FiberRoot

      ↓

   renderRoot

      ↓

   Counter 다시 실행

      ↓

   useState(0)

      ↓

   updateState

      ↓

   current Hook clone

      ↓

   processUpdateQueue

      ↓

   0 → 1

      ↓

   WIP Hook.memoizedState = 1

      ↓

   Component 결과:

      "Count: 1"

      ↓

   reconciliation

      ↓

   HostText Update flag

      ↓

   commit

      ↓

   실제 HostText:

      "Count: 0"
          ↓
      "Count: 1"


   핵심:

   setState는 state를 변경하는 함수가 아니다.

   setState는:

       "다음 render에서 처리할
        state update를 queue에 넣고
        render를 예약하는 함수"

   이다.
   ═══════════════════════════════════════════════════════════════ */

export {};
