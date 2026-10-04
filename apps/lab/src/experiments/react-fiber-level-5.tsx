/* ═══════════════════════════════════════════════════════════════
   MINI REACT FIBER — LEVEL 5
   completeWork + commit phase + Host Tree

   지금까지
   ───────────────────────────────────────────────────────────────
   L1  Fiber traversal
       child / sibling / return

   L2  Element → Fiber
       beginWork에서 tree를 점진적으로 생성

   L3  current / workInProgress / alternate
       double buffering

   L4  reconciliation
       key + type
       Placement / ChildDeletion 계산

   이번 Level
   ───────────────────────────────────────────────────────────────
   L5  completeWork + commit

       Render Phase
       ─────────────────────
       beginWork
           ↓
       reconciliation
           ↓
       Placement / Deletion 계산
           ↓
       completeWork
           ↓
       Host instance 생성
       subtreeFlags bubble

       =====================

       Commit Phase
       ─────────────────────
       Placement
       Update
       ChildDeletion
           ↓
       실제 Host Tree mutation

   브라우저 DOM 대신 Mini Host Tree를 사용한다.

   아직 안 하는 것
   ───────────────────────────────────────────────────────────────
   ✗ useState
   ✗ hooks
   ✗ update queue
   ✗ lanes
   ✗ concurrent rendering
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   PART 0 — React Element Types
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
   PART 1 — createElement
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

   L4:
     Placement
     ChildDeletion

   L5:
     Update 추가

   Placement
     INSERT 또는 MOVE

   ChildDeletion
     child 삭제 필요

   Update
     이미 존재하는 Host instance 내용 변경 필요
   ═══════════════════════════════════════════════════════════════ */

const NoFlags = 0b0000;

const Placement = 0b0001;

const ChildDeletion = 0b0010;

const Update = 0b0100;

/**
 * commit phase에서 관심 있는 flags.
 */
const MutationMask = Placement | ChildDeletion | Update;

/* ═══════════════════════════════════════════════════════════════
   PART 3 — Mini Host Environment

   브라우저라면:

   HostComponent
   → HTMLElement

   HostText
   → Text Node

   HostRoot
   → root DOM container


   여기서는 실제 DOM 대신
   plain object tree를 사용한다.
   ═══════════════════════════════════════════════════════════════ */

type HostParent = HostElement | HostContainer;

type HostInstance = HostElement | HostTextInstance;

type HostElement = {
  kind: "element";

  type: string;

  /**
   * children은 Fiber children이 아니다.
   *
   * 실제 화면/DOM에 해당하는
   * Host tree children.
   */
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

/**
 * props.children은 Host DOM attribute가 아니므로
 * 제거해서 저장한다.
 */
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

/**
 * 현재 parent에서 child 제거.
 *
 * MOVE를 구현할 때 기존 위치에서
 * 먼저 떼기 위해 사용한다.
 */
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

/**
 * before 앞에 삽입.
 *
 * 이미 parent 안에 존재하는 child라면
 * remove → insert가 되므로 MOVE가 된다.
 */
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
   PART 4 — Fiber
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

  /**
   * 내 자손들 중
   * 어떤 effect가 존재하는지 요약.
   *
   * L5 핵심.
   */
  subtreeFlags: number;

  deletions: Fiber[] | null;

  alternate: Fiber | null;

  /**
   * HostComponent:
   *   HostElement
   *
   * HostText:
   *   HostTextInstance
   *
   * HostRoot:
   *   FiberRoot
   *
   * FunctionComponent:
   *   null
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

    stateNode: null,
  };
}

/* ═══════════════════════════════════════════════════════════════
   PART 5 — FiberRoot

   FiberRoot
        │
        │ current
        ▼
   HostRoot Fiber
        │
        ▼
       App


   HostRoot Fiber.stateNode
        │
        ▼
     FiberRoot
        │
        │ container
        ▼
   HostContainer
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

  /**
   * 실제 React와 비슷하게
   * HostRoot Fiber에서 FiberRoot를
   * 찾아갈 수 있도록 연결.
   */
  hostRootFiber.stateNode = root;

  return root;
}

/* ═══════════════════════════════════════════════════════════════
   PART 6 — current ↔ workInProgress
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

    /**
     * 이전 render의 effect 제거.
     */
    workInProgress.flags = NoFlags;

    workInProgress.subtreeFlags = NoFlags;

    workInProgress.deletions = null;
  }

  workInProgress.child = current.child;

  workInProgress.memoizedProps = current.memoizedProps;

  workInProgress.sibling = current.sibling;

  workInProgress.index = current.index;

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
   PART 8 — Mount children
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
   PART 9 — L4: Fiber reuse
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
   PART 10 — L4: Deletion recording
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
   PART 11 — L4: Update Node
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
   PART 12 — L4: Fast path
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
   PART 13 — L4: Slow path Map
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
   PART 14 — L4: Placement
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
      /**
       * MOVE
       */
      newFiber.flags |= Placement;

      return lastPlacedIndex;
    }

    return oldIndex;
  }

  /**
   * INSERT
   */
  newFiber.flags |= Placement;

  return lastPlacedIndex;
}

/* ═══════════════════════════════════════════════════════════════
   PART 15 — L4: Array reconciliation
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

  /* ───────── PHASE 1
     같은 위치 fast path
     ─────────────────── */

  for (; oldFiber !== null && newIndex < newChildren.length; newIndex++) {
    const nextOldFiber = oldFiber.sibling;

    const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIndex]);

    if (newFiber === null) {
      break;
    }

    /**
     * key는 같지만 type이 달라
     * 새 Fiber가 만들어진 경우.
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

  /* ───────── PHASE 2
     new가 먼저 끝남
     ─────────────────── */

  if (newIndex === newChildren.length) {
    deleteRemainingChildren(returnFiber, oldFiber);

    if (previousNewFiber !== null) {
      previousNewFiber.sibling = null;
    }

    return resultingFirstChild;
  }

  /* ───────── PHASE 3
     old가 먼저 끝남
     나머지 INSERT
     ─────────────────── */

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

  /* ───────── PHASE 4
     Map 생성
     ─────────────────── */

  const existingChildren = mapRemainingChildren(oldFiber);

  /* ───────── PHASE 5
     Map lookup
     ─────────────────── */

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

  /* ───────── PHASE 6
     Map에 남은 old 삭제
     ─────────────────── */

  existingChildren.forEach((child) => {
    deleteChild(returnFiber, child);
  });

  if (previousNewFiber !== null) {
    previousNewFiber.sibling = null;
  }

  return resultingFirstChild;
}

/* ═══════════════════════════════════════════════════════════════
   PART 16 — reconcile children
   ═══════════════════════════════════════════════════════════════ */

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
  /**
   * 중요.
   *
   * current === null
   * → 새로 mount되는 subtree
   * → 내부 children에 Placement를
   *   일일이 표시할 필요 없음.
   *
   * current !== null
   * → update
   * → current.child가 null이어도
   *   신규 child는 Placement 추적 필요.
   *
   * 특히 HostRoot의 최초 render에서도
   * current HostRoot 자체는 존재하므로
   * App Fiber에 Placement가 붙는다.
   */
  if (current === null) {
    workInProgress.child = mountChildFibers(workInProgress, nextChildren);
  } else {
    workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren);
  }
}

/* ═══════════════════════════════════════════════════════════════
   PART 17 — beginWork
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
   * Function Component 실행.
   *
   * 새로운 React Element들이 생긴다.
   */
  const nextChildren = Component(props);

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

const renderTrace: string[] = [];

function beginWork(
  current: Fiber | null,

  workInProgress: Fiber,
): Fiber | null {
  renderTrace.push(`begin ${workInProgress.debugName}`);

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
      throw new Error("Unknown tag");
  }
}

/* ═══════════════════════════════════════════════════════════════
   ╔════════════════════════════════════════════════════════════╗
   ║                 LEVEL 5 START                            ║
   ╚════════════════════════════════════════════════════════════╝
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   PART 18 — Host props 비교

   HostComponent update 여부를
   아주 단순하게 판단한다.
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

/* ═══════════════════════════════════════════════════════════════
   PART 19 — appendAllChildren

   completeWork(HostComponent)에서 사용.

   예:

   <div>
     <Wrapper>
       <span />
     </Wrapper>
   </div>


   Fiber:

   div
    │
    └ Wrapper (Function)
        │
        └ span (Host)


   div Host instance에는
   Wrapper가 아니라 span Host instance가 들어가야 한다.


   즉 FunctionComponent를 만나면
   그 아래로 내려가 실제 Host node를 찾는다.

   Host node를 만나면:
   그 node 자체를 append하고,
   그 node의 내부로는 더 내려가지 않는다.

   왜냐하면 span 내부 children은
   span의 completeWork 때 이미 조립되어 있기 때문.
   ═══════════════════════════════════════════════════════════════ */

function appendAllChildren(
  parent: HostElement,

  workInProgress: Fiber,
): void {
  // TODO 5-1 ★★★★
  //
  // Fiber의 child/sibling/return 포인터를 이용해
  // workInProgress 하위의 "최상위 Host node들"을
  // parent에 append해라.
  //
  //
  // 힌트:
  //
  // let node =
  //   workInProgress.child;
  //
  // while (node !== null) {
  //
  //   if (
  //     node.tag === "HostComponent" ||
  //     node.tag === "HostText"
  //   ) {
  //
  //     appendHostChild(
  //       parent,
  //       node.stateNode as HostInstance
  //     );
  //
  //   } else if (
  //     node.child !== null
  //   ) {
  //
  //     node.child.return = node;
  //     node = node.child;
  //     continue;
  //   }
  //
  //
  //   // sibling이 없으면
  //   // return을 따라 위로 올라가며
  //   // sibling을 찾는다.
  //
  // }
}

/* ═══════════════════════════════════════════════════════════════
   PART 20 — subtreeFlags bubbling

   child에 effect가 있으면
   부모가 그 사실을 알 수 있어야 한다.

   예:

          App
           │
          div
           │
        ┌──┴──┐
        A     B
        │
     Placement


   App.subtreeFlags에 Placement가 올라와야
   commit phase가:

   "App 아래에 mutation이 있구나"

   를 알고 내려갈 수 있다.
   ═══════════════════════════════════════════════════════════════ */

function bubbleProperties(completedWork: Fiber): void {
  // TODO 5-2 ★★★
  //
  // let subtreeFlags =
  //   NoFlags;
  //
  //
  // let child =
  //   completedWork.child;
  //
  //
  // while (child !== null) {
  //
  //   subtreeFlags |=
  //     child.subtreeFlags;
  //
  //   subtreeFlags |=
  //     child.flags;
  //
  //   child =
  //     child.sibling;
  // }
  //
  //
  // completedWork.subtreeFlags =
  //   subtreeFlags;
}

/* ═══════════════════════════════════════════════════════════════
   PART 21 — completeWork

   beginWork
   부모 → 자식

   completeWork
   자식 → 부모


   HostComponent mount:

       Fiber
         ↓
     Host instance 생성

       자식 Host instance들은
       이미 complete되어 있음

         ↓
     appendAllChildren

         ↓
     stateNode 저장


   HostComponent update:

     기존 stateNode 재사용
         ↓
     props 변경 여부 확인
         ↓
     Update flag


   HostText update:

     text 변경 여부 확인
         ↓
     Update flag
   ═══════════════════════════════════════════════════════════════ */

function completeWork(
  current: Fiber | null,

  workInProgress: Fiber,
): void {
  // TODO 5-3 ★★★★★
  //
  // switch (
  //   workInProgress.tag
  // )
  //
  //
  // ───────────────────────────
  // HostComponent
  // ───────────────────────────
  //
  // const newProps =
  //   workInProgress.pendingProps as Props;
  //
  //
  // if (current === null) {
  //
  //   // MOUNT
  //
  //   const instance =
  //     createInstance(
  //       workInProgress.type as string,
  //       newProps
  //     );
  //
  //
  //   appendAllChildren(
  //     instance,
  //     workInProgress
  //   );
  //
  //
  //   workInProgress.stateNode =
  //     instance;
  //
  // } else {
  //
  //   // UPDATE
  //
  //   const oldProps =
  //     current.memoizedProps as Props;
  //
  //
  //   if (
  //     haveHostPropsChanged(
  //       oldProps,
  //       newProps
  //     )
  //   ) {
  //     workInProgress.flags |=
  //       Update;
  //   }
  // }
  //
  //
  // bubbleProperties(
  //   workInProgress
  // );
  //
  // return;
  //
  //
  //
  // ───────────────────────────
  // HostText
  // ───────────────────────────
  //
  // const newText =
  //   workInProgress.pendingProps as string;
  //
  //
  // if (current === null) {
  //
  //   workInProgress.stateNode =
  //     createTextInstance(
  //       newText
  //     );
  //
  // } else {
  //
  //   const oldText =
  //     current.memoizedProps as string;
  //
  //
  //   if (
  //     oldText !== newText
  //   ) {
  //     workInProgress.flags |=
  //       Update;
  //   }
  // }
  //
  //
  // bubbleProperties(
  //   workInProgress
  // );
  //
  // return;
  //
  //
  //
  // ───────────────────────────
  // FunctionComponent
  // HostRoot
  // ───────────────────────────
  //
  // Host instance 생성 없음.
  //
  // bubbleProperties(
  //   workInProgress
  // );
  //
  // return;

  throw new Error("TODO 5-3");
}

/* ═══════════════════════════════════════════════════════════════
   PART 22 — Work Loop

   L1의 completeUnitOfWork가
   이제 진짜 completeWork를 호출한다.
   ═══════════════════════════════════════════════════════════════ */

let workInProgress: Fiber | null = null;

function performUnitOfWork(unitOfWork: Fiber): void {
  const current = unitOfWork.alternate;

  const next = beginWork(current, unitOfWork);

  /**
   * 이번 render input 처리 완료.
   */
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

    /**
     * LEVEL 5
     */
    completeWork(current, completedWork);

    renderTrace.push(`complete ${completedWork.debugName}`);

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
   PART 23 — Render Root
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
   PART 24 — Host Parent 찾기

   Placement / Deletion 할 때
   실제 Host parent가 필요하다.

   예:

   ul HostFiber
      │
      └ Item FunctionFiber
            │
            └ li HostFiber


   Item에 Placement가 붙어도
   실제 DOM parent는 ul이다.
   ═══════════════════════════════════════════════════════════════ */

function findHostParent(start: Fiber | null): HostParent {
  // TODO 5-4 ★★★
  //
  // let parent = start;
  //
  //
  // while (
  //   parent !== null
  // ) {
  //
  //   if (
  //     parent.tag ===
  //       "HostComponent"
  //   ) {
  //
  //     return parent.stateNode
  //       as HostElement;
  //   }
  //
  //
  //   if (
  //     parent.tag ===
  //       "HostRoot"
  //   ) {
  //
  //     const root =
  //       parent.stateNode
  //         as FiberRoot;
  //
  //     return root.container;
  //   }
  //
  //
  //   parent =
  //     parent.return;
  // }
  //
  //
  // throw new Error(
  //   "Host parent not found"
  // );

  throw new Error("TODO 5-4");
}

/**
 * Placement용.
 *
 * 자기 자신이 아니라
 * return부터 Host parent를 찾는다.
 */
function getHostParent(fiber: Fiber): HostParent {
  return findHostParent(fiber.return);
}

/* ═══════════════════════════════════════════════════════════════
   PART 25 — Host Sibling 찾기

   Placement에서 append만 하면
   MOVE가 제대로 구현되지 않는다.


   old:

   A B C


   new:

   B A D C


   A를 그냥 append하면:

   B C A

   가 되어버림.


   실제로는:

   A를 C "앞에" 넣어야 한다.

   따라서 Placement Fiber의 오른쪽에서
   아직 움직이지 않을 안정적인 Host sibling을 찾는다.

   stable sibling:
     Placement flag가 없는 Host node
   ═══════════════════════════════════════════════════════════════ */

function getHostSibling(fiber: Fiber): HostInstance | null {
  // TODO 5-5 ★★★★★
  //
  // 실제 React commitPlacement에서
  // 꽤 중요한 알고리즘.
  //
  //
  // 목표:
  //
  // fiber 오른쪽 방향을 탐색해서
  // "Placement 대상이 아닌"
  // 첫 HostComponent / HostText를 찾는다.
  //
  //
  // 힌트 구조:
  //
  // let node = fiber;
  //
  // siblingSearch:
  // while (true) {
  //
  //   while (
  //     node.sibling === null
  //   ) {
  //
  //     const parent =
  //       node.return;
  //
  //
  //     if (
  //       parent === null ||
  //       parent.tag === "HostRoot" ||
  //       parent.tag === "HostComponent"
  //     ) {
  //       return null;
  //     }
  //
  //
  //     node = parent;
  //   }
  //
  //
  //   node =
  //     node.sibling;
  //
  //
  //   while (
  //     node.tag !== "HostComponent" &&
  //     node.tag !== "HostText"
  //   ) {
  //
  //     // 이 subtree 자체가 Placement라면
  //     // 안정적인 기준점이 될 수 없다.
  //
  //     if (
  //       node.flags & Placement
  //     ) {
  //       continue siblingSearch;
  //     }
  //
  //
  //     if (
  //       node.child === null
  //     ) {
  //       continue siblingSearch;
  //     }
  //
  //
  //     node =
  //       node.child;
  //   }
  //
  //
  //   if (
  //     !(node.flags & Placement)
  //   ) {
  //     return node.stateNode
  //       as HostInstance;
  //   }
  // }

  throw new Error("TODO 5-5");
}

/* ═══════════════════════════════════════════════════════════════
   PART 26 — Placement Node 삽입

   Placement가 FunctionComponent에 붙을 수도 있다.

   예:

   Item(Function)
      │
      └ li(Host)


   실제 Host Tree에 삽입할 것은
   Item이 아니라 li.

   따라서 Host node가 나올 때까지
   아래로 내려간다.
   ═══════════════════════════════════════════════════════════════ */

function insertOrAppendPlacementNode(
  fiber: Fiber,

  before: HostInstance | null,

  parent: HostParent,
): void {
  // TODO 5-6 ★★★
  //
  // if (
  //   fiber.tag === "HostComponent" ||
  //   fiber.tag === "HostText"
  // ) {
  //
  //   const node =
  //     fiber.stateNode
  //       as HostInstance;
  //
  //
  //   if (
  //     before !== null
  //   ) {
  //     insertHostBefore(
  //       parent,
  //       node,
  //       before
  //     );
  //   } else {
  //     appendHostChild(
  //       parent,
  //       node
  //     );
  //   }
  //
  //   return;
  // }
  //
  //
  // let child =
  //   fiber.child;
  //
  //
  // while (
  //   child !== null
  // ) {
  //
  //   insertOrAppendPlacementNode(
  //     child,
  //     before,
  //     parent
  //   );
  //
  //   child =
  //     child.sibling;
  // }
}

/* ═══════════════════════════════════════════════════════════════
   PART 27 — commitPlacement
   ═══════════════════════════════════════════════════════════════ */

function commitPlacement(finishedWork: Fiber): void {
  // TODO 5-7
  //
  // const parent =
  //   getHostParent(
  //     finishedWork
  //   );
  //
  //
  // const before =
  //   getHostSibling(
  //     finishedWork
  //   );
  //
  //
  // insertOrAppendPlacementNode(
  //   finishedWork,
  //   before,
  //   parent
  // );
}

/* ═══════════════════════════════════════════════════════════════
   PART 28 — Deletion Host Nodes 찾기

   삭제되는 Fiber가 FunctionComponent일 수 있다.

   Item(Function)
       │
       └ li(Host)
           │
           └ Text


   실제 Host parent에서 제거할 것은
   최상위 Host node인 li 하나.

   li 안의 Text까지 따로 삭제할 필요는 없다.
   ═══════════════════════════════════════════════════════════════ */

function collectHostChildrenForDeletion(
  fiber: Fiber,

  result: HostInstance[],
): void {
  // TODO 5-8 ★★★
  //
  // if (
  //   fiber.tag === "HostComponent" ||
  //   fiber.tag === "HostText"
  // ) {
  //
  //   result.push(
  //     fiber.stateNode
  //       as HostInstance
  //   );
  //
  //   // 중요:
  //   // Host node를 찾았다면
  //   // 그 내부로 더 내려가지 않는다.
  //
  //   return;
  // }
  //
  //
  // let child =
  //   fiber.child;
  //
  //
  // while (
  //   child !== null
  // ) {
  //
  //   collectHostChildrenForDeletion(
  //     child,
  //     result
  //   );
  //
  //   child =
  //     child.sibling;
  // }
}

/* ═══════════════════════════════════════════════════════════════
   PART 29 — commitDeletion
   ═══════════════════════════════════════════════════════════════ */

function commitDeletion(
  childToDelete: Fiber,

  returnFiber: Fiber,
): void {
  // TODO 5-9 ★★★
  //
  // 삭제 Fiber의 부모 Fiber 자체가
  // HostComponent일 수도 있으므로:
  //
  // const parent =
  //   findHostParent(
  //     returnFiber
  //   );
  //
  //
  // const hostChildren:
  //   HostInstance[] = [];
  //
  //
  // collectHostChildrenForDeletion(
  //   childToDelete,
  //   hostChildren
  // );
  //
  //
  // for (
  //   const child of
  //   hostChildren
  // ) {
  //
  //   removeHostChild(
  //     parent,
  //     child
  //   );
  // }
}

/* ═══════════════════════════════════════════════════════════════
   PART 30 — Host Update

   HostComponent:
     props 갱신

   HostText:
     text 갱신
   ═══════════════════════════════════════════════════════════════ */

function commitUpdate(finishedWork: Fiber): void {
  // TODO 5-10 ★★★
  //
  // switch (
  //   finishedWork.tag
  // ) {
  //
  //
  // case "HostComponent":
  //
  //   const instance =
  //     finishedWork.stateNode
  //       as HostElement;
  //
  //
  //   const newProps =
  //     finishedWork.pendingProps
  //       as Props;
  //
  //
  //   instance.props =
  //     extractHostProps(
  //       newProps
  //     );
  //
  //   return;
  //
  //
  // case "HostText":
  //
  //   const text =
  //     finishedWork.stateNode
  //       as HostTextInstance;
  //
  //
  //   text.text =
  //     finishedWork.pendingProps
  //       as string;
  //
  //   return;
  //
  //
  // default:
  //   return;
  // }
}

/* ═══════════════════════════════════════════════════════════════
   PART 31 — Mutation traversal

   subtreeFlags 덕분에:

   "이 subtree에 mutation이 하나도 없다"

   라면 아래로 내려갈 필요가 없다.


   중요한 순서:

   ① 부모가 가지고 있는 deletions 처리
   ② mutation이 있는 child subtree 순회
   ③ 자기 자신의 Placement / Update 처리


   ChildDeletion은 부모에 붙어있다는 점에 주의.
   ═══════════════════════════════════════════════════════════════ */

function recursivelyTraverseMutationEffects(parentFiber: Fiber): void {
  // TODO 5-11 ★★★★
  //
  // ──────────────────────────
  // 1. deletions
  // ──────────────────────────
  //
  // if (
  //   parentFiber.flags &
  //   ChildDeletion
  // ) {
  //
  //   const deletions =
  //     parentFiber.deletions;
  //
  //
  //   if (
  //     deletions !== null
  //   ) {
  //
  //     for (
  //       const childToDelete
  //       of deletions
  //     ) {
  //
  //       commitDeletion(
  //         childToDelete,
  //         parentFiber
  //       );
  //     }
  //   }
  // }
  //
  //
  // ──────────────────────────
  // 2. subtree
  // ──────────────────────────
  //
  // if (
  //   parentFiber.subtreeFlags &
  //   MutationMask
  // ) {
  //
  //   let child =
  //     parentFiber.child;
  //
  //
  //   while (
  //     child !== null
  //   ) {
  //
  //     commitMutationEffectsOnFiber(
  //       child
  //     );
  //
  //     child =
  //       child.sibling;
  //   }
  // }
}

/* ═══════════════════════════════════════════════════════════════
   PART 32 — 한 Fiber의 mutation effect 처리
   ═══════════════════════════════════════════════════════════════ */

function commitMutationEffectsOnFiber(finishedWork: Fiber): void {
  // TODO 5-12 ★★★★★
  //
  // 먼저 자식 쪽 effect:
  //
  // recursivelyTraverseMutationEffects(
  //   finishedWork
  // );
  //
  //
  // 그다음 자신의 Placement:
  //
  // if (
  //   finishedWork.flags &
  //   Placement
  // ) {
  //
  //   commitPlacement(
  //     finishedWork
  //   );
  //
  //
  //   finishedWork.flags &=
  //     ~Placement;
  // }
  //
  //
  // Update:
  //
  // if (
  //   finishedWork.flags &
  //   Update
  // ) {
  //
  //   commitUpdate(
  //     finishedWork
  //   );
  //
  //
  //   finishedWork.flags &=
  //     ~Update;
  // }
}

/* ═══════════════════════════════════════════════════════════════
   PART 33 — commitMutationEffects
   ═══════════════════════════════════════════════════════════════ */

function commitMutationEffects(finishedWork: Fiber): void {
  commitMutationEffectsOnFiber(finishedWork);
}

/* ═══════════════════════════════════════════════════════════════
   PART 34 — commitRoot

   Render가 끝났다고 바로 current가
   바뀌는 것이 아니다.

   finishedWork의 mutation을
   Host Tree에 먼저 적용한 후:

       root.current = finishedWork

   로 확정한다.
   ═══════════════════════════════════════════════════════════════ */

function commitRoot(
  root: FiberRoot,

  finishedWork: Fiber,
): void {
  // TODO 5-13 ★★★★★
  //
  // const subtreeHasEffects =
  //   (
  //     finishedWork.subtreeFlags &
  //     MutationMask
  //   ) !== NoFlags;
  //
  //
  // const rootHasEffect =
  //   (
  //     finishedWork.flags &
  //     MutationMask
  //   ) !== NoFlags;
  //
  //
  // if (
  //   subtreeHasEffects ||
  //   rootHasEffect
  // ) {
  //
  //   commitMutationEffects(
  //     finishedWork
  //   );
  // }
  //
  //
  // root.current =
  //   finishedWork;
}

/* ═══════════════════════════════════════════════════════════════
   PART 35 — Demo Components
   ═══════════════════════════════════════════════════════════════ */

function Item(props: Props): MiniReactNode {
  return createElement(
    "li",
    {
      itemId: props.id,
    },

    `${props.prefix ?? ""}${props.id}`,
  );
}

function App(props: Props): MiniReactNode {
  const items = props.items as string[];

  const prefix = String(props.prefix ?? "");

  return createElement(
    "ul",
    {
      role: "list",
    },

    ...items.map((id) =>
      createElement(Item, {
        key: id,

        id,

        prefix,
      }),
    ),
  );
}

/* ═══════════════════════════════════════════════════════════════
   PART 36 — Debug: Fiber flags
   ═══════════════════════════════════════════════════════════════ */

function flagToString(flags: number): string {
  const result: string[] = [];

  if (flags & Placement) {
    result.push("Placement");
  }

  if (flags & ChildDeletion) {
    result.push("ChildDeletion");
  }

  if (flags & Update) {
    result.push("Update");
  }

  return result.join(" | ") || "NoFlags";
}

function printFiberEffects(
  fiber: Fiber | null,

  depth = 0,
): void {
  let node = fiber;

  while (node !== null) {
    console.log(
      `${"  ".repeat(depth)}` +
        `${node.debugName}` +
        ` key=${node.key}` +
        ` flags=${flagToString(node.flags)}` +
        ` subtree=${flagToString(node.subtreeFlags)}`,
    );

    if (node.deletions !== null) {
      console.log(
        `${"  ".repeat(depth + 1)}` + `DELETE → ` + node.deletions.map((item) => item.key ?? item.debugName).join(", "),
      );
    }

    if (node.child !== null) {
      printFiberEffects(node.child, depth + 1);
    }

    node = node.sibling;
  }
}

/* ═══════════════════════════════════════════════════════════════
   PART 37 — Debug: Host Tree

   실제 DOM 대신 이 결과를 보면 된다.

   예:

   <root>
     <ul role="list">
       <li itemId="B">
         "B"
       </li>
       ...
     </ul>
   </root>
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

/* ═══════════════════════════════════════════════════════════════
   PART 38 — Run
   ═══════════════════════════════════════════════════════════════ */

function run(
  root: FiberRoot,

  label: string,

  items: string[],

  prefix = "",
): void {
  renderTrace.length = 0;

  console.log("\n\n════════════════════════════");

  console.log(label);

  console.log("items:", items);

  console.log("prefix:", JSON.stringify(prefix));

  console.log("════════════════════════════");

  const element = createElement(App, {
    items,
    prefix,
  });

  /* ────────────────
     RENDER PHASE
     ──────────────── */

  const finishedWork = renderRoot(root, element);

  console.log("\n[Render 결과 — Fiber Effects]");

  printFiberEffects(finishedWork);

  console.log("\n[Commit 전 Host Tree]");

  printHostTree(root.container);

  /* ────────────────
     COMMIT PHASE
     ──────────────── */

  commitRoot(root, finishedWork);

  console.log("\n[Commit 후 Host Tree]");

  printHostTree(root.container);
}

/* ═══════════════════════════════════════════════════════════════
   PART 39 — Test Cases
   ═══════════════════════════════════════════════════════════════ */

const root = createFiberRoot();

/* ───────────────────────────────────────────────────────────────
   TEST 1 — 최초 Mount

   Fiber:

   Root
    └ App          Placement
       └ ul
          ├ Item A
          │  └ li
          │     └ Text "A"
          ├ Item B
          └ Item C


   App 하나에만 Placement가 있어도
   commitPlacement(App)이 내려가서
   ul Host subtree 전체를 root container에 넣는다.

   예상 Host Tree:

   <root>
     <ul>
       <li>A</li>
       <li>B</li>
       <li>C</li>
     </ul>
   </root>
   ─────────────────────────────────────────────────────────────── */

run(
  root,

  "1. MOUNT",

  ["A", "B", "C"],
);

/* ───────────────────────────────────────────────────────────────
   TEST 2 — MOVE + INSERT

   old:

   A B C

   new:

   B A D C


   L4에서 예상:

   B   NoFlags
   A   Placement   ← MOVE
   D   Placement   ← INSERT
   C   NoFlags


   L5 commit:

   A Host node를 C 앞으로 이동
   D Host node를 C 앞으로 삽입


   최종:

   B A D C
   ─────────────────────────────────────────────────────────────── */

run(
  root,

  "2. REORDER + INSERT",

  ["B", "A", "D", "C"],
);

/* ───────────────────────────────────────────────────────────────
   TEST 3 — DELETE + MOVE

   old:

   B A D C

   new:

   D B C


   A 삭제.

   ul Fiber:
     ChildDeletion
     deletions = [A]

   B:
     Placement 가능


   최종:

   D B C
   ─────────────────────────────────────────────────────────────── */

run(
  root,

  "3. MOVE + DELETE",

  ["D", "B", "C"],
);

/* ───────────────────────────────────────────────────────────────
   TEST 4 — HostText Update

   children 구조는 그대로:

   D B C

   text만:

   D → v2-D
   B → v2-B
   C → v2-C


   HostText Fiber에 Update flag.

   commitUpdate에서 기존 Text instance
   내용을 변경한다.
   ─────────────────────────────────────────────────────────────── */

run(
  root,

  "4. TEXT UPDATE",

  ["D", "B", "C"],

  "v2-",
);

export {};
