/* ═══════════════════════════════════════════════════════════════
   MINI REACT FIBER — LEVEL 6
   Hook Linked List + renderWithHooks + useState

   지금까지
   ─────────────────────────────────────────────────────────────

   L1
   Fiber traversal

       child
       sibling
       return


   L2
   Element → Fiber

       Component()
           ↓
       Element
           ↓
       reconcile
           ↓
       Fiber


   L3
   current ↔ workInProgress

       Fiber A
          ↕ alternate
       Fiber A'


   L4
   keyed reconciliation

       key + type
       Placement
       ChildDeletion


   L5
   complete + commit

       render phase
           ↓
       flags
           ↓
       completeWork
           ↓
       Host instance
           ↓
       commit phase
           ↓
       Host Tree mutation


   이번 Level
   ─────────────────────────────────────────────────────────────

   L6
   Hooks

       FunctionComponent Fiber
                 │
                 │ memoizedState
                 ▼
              Hook #1
                 │ next
                 ▼
              Hook #2
                 │ next
                 ▼
              Hook #3


   목표

   - Fiber.memoizedState가 Hook list의 head
   - Hook 호출 순서대로 linked list 생성
   - mount 시 Hook 생성
   - update 시 current Hook을 순서대로 복제
   - renderWithHooks가 Hook 환경을 준비
   - 왜 조건문 안에서 Hook을 쓰면 안 되는지 이해


   아직 안 하는 것

   ✗ 실제 setState
   ✗ UpdateQueue
   ✗ rerender scheduling
   ✗ lanes
   ✗ concurrent rendering

   setter는 Level 7에서 구현.
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
   PART 2 — Mini Host Environment

   실제 DOM 대신 plain object tree.
   ═══════════════════════════════════════════════════════════════ */

type HostParent = HostElement | HostContainer;

type HostInstance = HostElement | HostTextInstance;

type HostElement = {
  kind: "element";

  type: string;

  children: HostInstance[];

  props: Record<string, unknown>;

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

    children: [],

    props: extractHostProps(props),

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

function appendHostChild(
  parent: HostParent,

  child: HostInstance,
): void {
  detachHostNode(child);

  parent.children.push(child);

  child.parent = parent;
}

function insertHostBefore(
  parent: HostParent,

  child: HostInstance,

  before: HostInstance,
): void {
  detachHostNode(child);

  const index = parent.children.indexOf(before);

  if (index === -1) {
    appendHostChild(parent, child);

    return;
  }

  parent.children.splice(index, 0, child);

  child.parent = parent;
}

function removeHostChild(
  parent: HostParent,

  child: HostInstance,
): void {
  const index = parent.children.indexOf(child);

  if (index === -1) {
    return;
  }

  parent.children.splice(index, 1);

  child.parent = null;
}

/* ═══════════════════════════════════════════════════════════════
   ╔════════════════════════════════════════════════════════════╗
   ║                 LEVEL 6 DATA STRUCTURE                   ║
   ╚════════════════════════════════════════════════════════════╝

   Hook을 Fiber보다 먼저 선언.

   실제 React Hook에는:

     memoizedState
     baseState
     baseQueue
     queue
     next

   등이 있지만 L6에서는:

     memoizedState
     next

   두 개만 사용한다.

   L7에서 queue를 붙인다.
   ═══════════════════════════════════════════════════════════════ */

type Hook = {
  /**
   * 해당 Hook이 기억하는 값.
   *
   * useState(10)이면:
   *
   * memoizedState = 10
   */
  memoizedState: unknown;

  /**
   * 다음 Hook.
   */
  next: Hook | null;
};

/* ═══════════════════════════════════════════════════════════════
   PART 3 — Fiber
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

  stateNode: HostInstance | FiberRoot | null;

  /**
   * LEVEL 6 핵심.
   *
   * FunctionComponent의 경우:
   *
   * memoizedState
   *      ↓
   * first Hook
   *      ↓
   * second Hook
   *      ↓
   * ...
   *
   * 주의:
   *
   * Fiber.memoizedProps
   * 와
   * Fiber.memoizedState
   *
   * 는 완전히 다른 필드다.
   */
  memoizedState: Hook | null;
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

    stateNode: null,

    /**
     * 최초에는 Hook 없음.
     */
    memoizedState: null,
  };
}

/* ═══════════════════════════════════════════════════════════════
   PART 4 — FiberRoot
   ═══════════════════════════════════════════════════════════════ */

type FiberRoot = {
  current: Fiber;

  container: HostContainer;
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
  };

  hostRootFiber.stateNode = root;

  return root;
}

/* ═══════════════════════════════════════════════════════════════
   PART 5 — current ↔ workInProgress

   L6에서 중요한 추가 한 줄:

   workInProgress.memoizedState
     = current.memoizedState

   이전 Hook list를 다음 render가
   참조할 수 있게 한다.
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

  workInProgress.memoizedProps = current.memoizedProps;

  workInProgress.sibling = current.sibling;

  workInProgress.index = current.index;

  workInProgress.stateNode = current.stateNode;

  /**
   * LEVEL 6
   *
   * 현재 Fiber의 Hook list.
   *
   * renderWithHooks에서
   * WIP list를 새로 만들기 전에
   * 이전 상태를 참조하기 위해 복사.
   */
  workInProgress.memoizedState = current.memoizedState;

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

function createChild(
  returnFiber: Fiber,

  newChild: MiniReactNode,
): Fiber | null {
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
   PART 7 — Mount children
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
   PART 8 — Fiber reuse
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
   PART 9 — Delete
   ═══════════════════════════════════════════════════════════════ */

function deleteChild(
  returnFiber: Fiber,

  childToDelete: Fiber,
): void {
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
   PART 10 — Node update
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

/* ═══════════════════════════════════════════════════════════════
   PART 11 — Fast reconciliation
   ═══════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════
   PART 12 — Map reconciliation
   ═══════════════════════════════════════════════════════════════ */

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
  existingChildren: Map<string | number, Fiber>,

  returnFiber: Fiber,

  newIndex: number,

  newChild: MiniReactNode,
): Fiber | null {
  if (typeof newChild === "string" || typeof newChild === "number") {
    const matched = existingChildren.get(newIndex) ?? null;

    return updateTextNode(returnFiber, matched, String(newChild));
  }

  if (isMiniElement(newChild)) {
    const key = newChild.key !== null ? newChild.key : newIndex;

    const matched = existingChildren.get(key) ?? null;

    return updateElement(returnFiber, matched, newChild);
  }

  return null;
}

/* ═══════════════════════════════════════════════════════════════
   PART 13 — Placement
   ═══════════════════════════════════════════════════════════════ */

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
   PART 14 — reconcileChildrenArray
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

  /* Fast path */

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

  /* Map slow path */

  const existingChildren = mapRemainingChildren(oldFiber);

  for (; newIndex < newChildren.length; newIndex++) {
    const newFiber = updateFromMap(existingChildren, returnFiber, newIndex, newChildren[newIndex]);

    if (newFiber === null) {
      continue;
    }

    const current = newFiber.alternate;

    if (current !== null) {
      const key = current.key !== null ? current.key : current.index;

      existingChildren.delete(key);
    }

    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex);

    if (previousNewFiber === null) {
      resultingFirstChild = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }

    previousNewFiber = newFiber;
  }

  existingChildren.forEach((fiber) => {
    deleteChild(returnFiber, fiber);
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
   ╔════════════════════════════════════════════════════════════╗
   ║                   LEVEL 6 START                          ║
   ╚════════════════════════════════════════════════════════════╝
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   PART 15 — Hook Render Globals

   왜 module-level 변수인가?

   현재 Component 실행 중:

       Fiber
        ↓

   useState()
   useState()
   useState()

   각 useState 호출이:

   "지금 어느 Fiber를 렌더 중인가?"
   "몇 번째 Hook까지 처리했는가?"

   를 알아야 하기 때문.


   현재 렌더 위치:

   currentlyRenderingFiber


   이전 current hook 위치:

   currentHook


   새 WIP hook 위치:

   workInProgressHook
   ═══════════════════════════════════════════════════════════════ */

let currentlyRenderingFiber: Fiber | null = null;

let currentHook: Hook | null = null;

let workInProgressHook: Hook | null = null;

/* ═══════════════════════════════════════════════════════════════
   PART 16 — mountWorkInProgressHook

   최초 render:

   function Counter() {
     useState(10);
     useState(20);
     useState(30);
   }


   첫 useState:

   Fiber.memoizedState
           ↓
        Hook(10)


   두 번째:

   Fiber.memoizedState
           ↓
        Hook(10)
           ↓ next
        Hook(20)


   세 번째:

        Hook(10)
           ↓
        Hook(20)
           ↓
        Hook(30)
   ═══════════════════════════════════════════════════════════════ */

function mountWorkInProgressHook(): Hook {
  if (currentlyRenderingFiber === null) {
    throw new Error("렌더 중인 파이버가 없습니다.");
  }

  const hook: Hook = {
    memoizedState: null,
    next: null,
  };

  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = hook;
    workInProgressHook = hook;
  } else {
    workInProgressHook.next = hook;
    workInProgressHook = hook;
  }

  return hook;
}

/* ═══════════════════════════════════════════════════════════════
   PART 17 — updateWorkInProgressHook

   update에서 핵심.


   current Fiber:

   memoizedState
      ↓
   Hook A
      ↓
   Hook B
      ↓
   Hook C


   WIP Fiber:

   memoizedState
      ↓
   new Hook A'
      ↓
   new Hook B'
      ↓
   new Hook C'


   current Hook 객체 자체를 수정하지 않고
   WIP Hook list를 새로 만든다.


   이것도 Fiber double buffering과
   비슷한 사고방식.
   ═══════════════════════════════════════════════════════════════ */

function updateWorkInProgressHook(): Hook {
  if (currentlyRenderingFiber === null) {
    throw new Error("렌더링 중인 파이버가 없습니다.");
  }

  let nextCurrentHook: Hook | null;

  if (currentHook === null) {
    const currentFiber = currentlyRenderingFiber.alternate;
    nextCurrentHook = currentFiber?.memoizedState ?? null;
  } else {
    nextCurrentHook = currentHook.next;
    if (nextCurrentHook === null) {
      throw new Error("Rendered more hooks...");
    }
    currentHook = nextCurrentHook;
  }

  const newHook: Hook = {
    memoizedState: currentHook?.memoizedState,
    next: null,
  };

  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = newHook;
    workInProgressHook = newHook;
  } else {
    workInProgressHook.next = newHook;
    workInProgressHook = newHook;
  }

  return newHook;
}

/* ═══════════════════════════════════════════════════════════════
   PART 18 — Dispatcher

   우리가 평소 호출하는:

       useState(10)

   이 함수 자체가 mount인지 update인지
   판단하지 않는다.


   renderWithHooks에서 현재 상황에 따라:

       Mount Dispatcher

   또는

       Update Dispatcher

   를 선택한다.


   React:

       useState()
           ↓
       current dispatcher
           ↓
      ┌───────────────┐
      │ mountState    │
      │      or       │
      │ updateState   │
      └───────────────┘
   ═══════════════════════════════════════════════════════════════ */

type SetStateAction<T> = T | ((previous: T) => T);

type Dispatch<T> = (action: SetStateAction<T>) => void;

type Dispatcher = {
  useState<T>(initialState: T): [T, Dispatch<T>];
};

let currentDispatcher: Dispatcher | null = null;

/* ═══════════════════════════════════════════════════════════════
   PART 19 — Level 7 placeholder setter

   이번 Level에서는 state 저장 구조만 본다.

   setter를 호출하면 에러.

   진짜 setter:
   dispatchSetState
   UpdateQueue
   scheduleUpdateOnFiber

   는 L7.
   ═══════════════════════════════════════════════════════════════ */

function createLevel7PlaceholderDispatch<T>(): Dispatch<T> {
  return () => {
    throw new Error("setState는 Level 7에서 구현합니다.");
  };
}

/* ═══════════════════════════════════════════════════════════════
   PART 20 — mountState

   첫 render:

       useState(10)

           ↓

       mountState(10)

           ↓

       Hook 생성

           ↓

       hook.memoizedState = 10
   ═══════════════════════════════════════════════════════════════ */

function mountState<T>(initialState: T): [T, Dispatch<T>] {
  const hook = mountWorkInProgressHook();
  hook.memoizedState = initialState;
  const dispatch = createLevel7PlaceholderDispatch<T>();

  return [hook.memoizedState as T, dispatch];
}

/* ═══════════════════════════════════════════════════════════════
   PART 21 — updateState

   두 번째 render:

   current Hook:

       memoizedState = 10


   updateWorkInProgressHook()

       ↓ clone


   WIP Hook:

       memoizedState = 10


   아직 setState가 없으므로
   그대로 반환한다.
   ═══════════════════════════════════════════════════════════════ */

function updateState<T>(_initialState: T): [T, Dispatch<T>] {
  const hook = updateWorkInProgressHook();
  const dispatch = createLevel7PlaceholderDispatch<T>();
  return [hook.memoizedState as T, dispatch];
}

/* ═══════════════════════════════════════════════════════════════
   PART 22 — Dispatchers
   ═══════════════════════════════════════════════════════════════ */

const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState,
};

const HooksDispatcherOnUpdate: Dispatcher = {
  useState: updateState,
};

/**
 * 사용자가 호출하는 API.
 *
 * 우리가 평소:
 *
 *   const [count, setCount] =
 *     useState(0)
 *
 * 하는 바로 그 위치에 대응.
 */
function useState<T>(initialState: T): [T, Dispatch<T>] {
  if (currentDispatcher === null) {
    throw new Error("Invalid hook call: Hook은 Function Component render 중에만 사용할 수 있습니다.");
  }

  return currentDispatcher.useState(initialState);
}

/* ═══════════════════════════════════════════════════════════════
   PART 23 — renderWithHooks

   LEVEL 6의 핵심 ★★★★★


   이전:

   updateFunctionComponent()
       ↓
   Component(props)


   이제:

   updateFunctionComponent()
       ↓
   renderWithHooks()
       ↓
   Hook 환경 준비
       ↓
   Mount / Update Dispatcher 선택
       ↓
   Component(props)
       ↓
   useState()
       ↓
   Hook linked list 생성
       ↓
   cleanup
       ↓
   children 반환
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

  if (current === null) {
    currentDispatcher = HooksDispatcherOnMount;
  } else {
    currentDispatcher = HooksDispatcherOnUpdate;
  }

  const children = Component(props);

  if (current !== null) {
    const currentFirstHook = current.memoizedState;
    let renderedTooFewHooks = false;

    if (currentFirstHook !== null) {
      if (currentHook === null) {
        renderedTooFewHooks = true;
      } else if (currentHook.next !== null) {
        renderedTooFewHooks = true;
      }
    }

    currentlyRenderingFiber = null;
    currentHook = null;
    workInProgressHook = null;
    currentDispatcher = null;

    if (renderedTooFewHooks) {
      throw new Error("Rendered fewer hooks than expected");
    }
  }

  return children;
}

/* ═══════════════════════════════════════════════════════════════
   PART 24 — beginWork

   중요한 변경:

   기존:

       Component(props)

   이제:

       renderWithHooks(
         current,
         workInProgress,
         Component,
         props
       )
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

  /**
   * LEVEL 6
   */
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

function updateHostText(
  _current: Fiber | null,

  _workInProgress: Fiber,
): null {
  return null;
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
      return updateHostText(current, workInProgress);

    default:
      throw new Error("Unknown Fiber tag");
  }
}

/* ═══════════════════════════════════════════════════════════════
   PART 25 — L5 Host props compare
   ═══════════════════════════════════════════════════════════════ */

function haveHostPropsChanged(
  oldProps: Props,

  newProps: Props,
): boolean {
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

/* ═══════════════════════════════════════════════════════════════
   PART 26 — appendAllChildren
   ═══════════════════════════════════════════════════════════════ */

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

    if (node === workInProgress) {
      return;
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

/* ═══════════════════════════════════════════════════════════════
   PART 27 — subtree flags
   ═══════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════
   PART 28 — completeWork
   ═══════════════════════════════════════════════════════════════ */

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

    case "HostRoot":
      bubbleProperties(workInProgress);

      return;
  }
}

/* ═══════════════════════════════════════════════════════════════
   PART 29 — Work Loop
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

/* ═══════════════════════════════════════════════════════════════
   PART 30 — Render Root
   ═══════════════════════════════════════════════════════════════ */

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
   PART 31 — Host parent
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

/* ═══════════════════════════════════════════════════════════════
   PART 32 — Host sibling
   ═══════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════
   PART 33 — Placement
   ═══════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════
   PART 34 — Deletion
   ═══════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════
   PART 35 — Host Update
   ═══════════════════════════════════════════════════════════════ */

function commitUpdate(finishedWork: Fiber): void {
  switch (finishedWork.tag) {
    case "HostComponent": {
      const instance = finishedWork.stateNode as HostElement;

      const newProps = finishedWork.pendingProps as Props;

      instance.props = extractHostProps(newProps);

      return;
    }

    case "HostText": {
      const instance = finishedWork.stateNode as HostTextInstance;

      instance.text = finishedWork.pendingProps as string;

      return;
    }

    default:
      return;
  }
}

/* ═══════════════════════════════════════════════════════════════
   PART 36 — Commit traversal
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

  const rootHasEffects = (finishedWork.flags & MutationMask) !== NoFlags;

  if (subtreeHasEffects || rootHasEffects) {
    commitMutationEffects(finishedWork);
  }

  root.current = finishedWork;
}

/* ═══════════════════════════════════════════════════════════════
   PART 37 — Hook Demo

   이 Component가 L6의 핵심.

   Hook 호출 순서:

   1번 → state A
   2번 → state B
   3번 → state C


   이름으로 연결되는 게 아니다.

   오직 순서.
   ═══════════════════════════════════════════════════════════════ */

function HookDemo(props: Props): MiniReactNode {
  const [first, _setFirst] = useState("FIRST");

  const [second, _setSecond] = useState(100);

  const [third, _setThird] = useState(true);

  return createElement(
    "section",
    {
      demo: "hooks",
    },

    createElement("p", null, `label=${props.label}`),

    createElement("p", null, `first=${first}`),

    createElement("p", null, `second=${second}`),

    createElement("p", null, `third=${third}`),
  );
}

function App(props: Props): MiniReactNode {
  return createElement(
    "main",
    {
      app: true,
    },

    createElement("h1", null, "Mini Fiber Hooks"),

    createElement(HookDemo, {
      label: props.label,
    }),
  );
}

/* ═══════════════════════════════════════════════════════════════
   PART 38 — Hook Debug
   ═══════════════════════════════════════════════════════════════ */

function findFiberByName(
  fiber: Fiber | null,

  name: string,
): Fiber | null {
  if (fiber === null) {
    return null;
  }

  let node: Fiber | null = fiber;

  while (node !== null) {
    if (node.debugName === name) {
      return node;
    }

    const foundInChild = findFiberByName(node.child, name);

    if (foundInChild !== null) {
      return foundInChild;
    }

    node = node.sibling;
  }

  return null;
}

function printHooks(fiber: Fiber): void {
  console.log(`\n[Hooks — ${fiber.debugName} Fiber #${fiber.id}]`);

  let hook = fiber.memoizedState;

  let index = 0;

  while (hook !== null) {
    console.log(`Hook #${index}` + ` memoizedState=` + JSON.stringify(hook.memoizedState));

    hook = hook.next;

    index += 1;
  }

  if (index === 0) {
    console.log("(Hook 없음)");
  }
}

/* ═══════════════════════════════════════════════════════════════
   PART 39 — Host Tree Debug
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

  const props = Object.entries(node.props)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join(" ");

  console.log(`${indent}<${node.type}${props ? ` ${props}` : ""}>`);

  for (const child of node.children) {
    printHostTree(child, depth + 1);
  }

  console.log(`${indent}</${node.type}>`);
}

/* ═══════════════════════════════════════════════════════════════
   PART 40 — Run
   ═══════════════════════════════════════════════════════════════ */

function run(
  root: FiberRoot,

  label: string,
): void {
  console.log("\n\n════════════════════════════════");

  console.log(`render label=${label}`);

  console.log("════════════════════════════════");

  const element = createElement(App, {
    label,
  });

  const finishedWork = renderRoot(root, element);

  commitRoot(root, finishedWork);

  console.log("\n[Host Tree]");

  printHostTree(root.container);

  const hookDemo = findFiberByName(root.current, "HookDemo");

  if (hookDemo !== null) {
    printHooks(hookDemo);
  }
}

/* ═══════════════════════════════════════════════════════════════
   PART 41 — Tests
   ═══════════════════════════════════════════════════════════════ */

const root = createFiberRoot();

/**
 * MOUNT
 *
 * HookDemo Fiber:
 *
 * memoizedState
 *      ↓
 * Hook("FIRST")
 *      ↓
 * Hook(100)
 *      ↓
 * Hook(true)
 */
run(root, "A");

/**
 * UPDATE
 *
 * Component는 다시 실행된다.
 *
 * 하지만:
 *
 * useState("FIRST")
 * useState(100)
 * useState(true)
 *
 * 는 current Hook list에서
 * 같은 순서의 값을 가져온다.
 *
 * label만 B로 변경.
 */
run(root, "B");

/**
 * 다시 UPDATE.
 *
 * Hook Fiber object는
 * alternate 방향으로 바뀔 수 있지만
 *
 * state 값은:
 *
 * FIRST
 * 100
 * true
 *
 * 그대로 유지되어야 한다.
 */
run(root, "C");

/* ═══════════════════════════════════════════════════════════════
   BONUS — Hook 순서 규칙 실험

   아래 Component로 HookDemo를 교체해서
   실험해봐도 된다.

   처음:
     enabled=true

   다음:
     enabled=false

   로 렌더하면:

   이전 Hook:
     Hook #1
     Hook #2

   다음 Hook:
     Hook #1

   이 되어 "Rendered fewer hooks"가 발생해야 한다.


function BadHooks(
  props: Props,
): MiniReactNode {

  const [first] =
    useState("A");


  if (
    props.enabled
  ) {
    const [second] =
      useState("B");

    console.log(
      second,
    );
  }


  return createElement(
    "p",
    null,
    first,
  );
}

   ═══════════════════════════════════════════════════════════════ */

export {};
