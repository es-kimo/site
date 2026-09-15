/* ═══════════════════════════════════════════════════════════════
   MINI REACT FIBER — LEVEL 2
   React Element → Fiber Tree

   실제 React 대응:
   - ReactFiber.js
       createFiberFromElement
       createFiberFromTypeAndProps
       createFiberFromText

   - ReactFiberBeginWork.js
       beginWork
       updateFunctionComponent
       reconcileChildren

   - ReactChildFiber.js
       createChild
       mountChildFibers

   이번 단계의 목표:

   Level 1:
     이미 존재하는 Fiber Tree를 순회했다.

   Level 2:
     Element를 보고 Fiber Tree를 "render 도중에" 만든다.

   아직 하지 않는 것:
   ✗ update reconciliation
   ✗ current / workInProgress tree
   ✗ alternate
   ✗ key diff
   ✗ DOM
   ✗ hooks
   ✗ lanes
   ═══════════════════════════════════════════════════════════════ */

type WorkTag = "HostRoot" | "FunctionComponent" | "HostComponent" | "HostText";

/* ═══════════════════════════════════════════════════════════════
   PART 0 — React Element
   ═══════════════════════════════════════════════════════════════ */

type FunctionComponent = (props: Props) => MiniReactNode;

type ElementType = string | FunctionComponent;

interface Props {
  [key: string]: unknown;
  children?: MiniReactNode;
}

/**
 * JSX가 최종적으로 만들어낸다고 생각할 객체.
 *
 * 진짜 ReactElement에는 더 많은 필드와 내부 처리가 있지만,
 * 학습에 필요한 핵심만 남긴다.
 *
 * 중요:
 *
 *   element("div", ...)
 *
 * 이걸 호출한다고 Fiber가 만들어지는 게 아니다.
 *
 * 지금 만들어지는 건 그냥 "UI 설명 객체"다.
 */
type MiniReactElement = {
  $$typeof: symbol;
  type: ElementType;
  key: string | null;
  props: Props;
};

type MiniReactNode = MiniReactElement | string | number | null | MiniReactNode[];

const MINI_ELEMENT_TYPE = Symbol.for("mini.react.element");

/**
 * React.createElement / jsx()의 초미니 버전.
 *
 * 예:
 *
 * createElement(
 *   "div",
 *   { id: "hello" },
 *   createElement("span", null, "Hi")
 * )
 *
 * 결과는 Fiber가 아니라:
 *
 * {
 *   type: "div",
 *   props: {
 *     id: "hello",
 *     children: ...
 *   }
 * }
 */
function createElement(
  type: ElementType,
  config: (Props & { key?: string | null }) | null,
  ...children: MiniReactNode[]
): MiniReactElement {
  // TODO 2-1
  //
  // ① key는 config에서 별도로 꺼낸다.
  //
  // ② key를 제외한 나머지를 props에 복사한다.
  //
  // ③ children:
  //
  //    0개 → 넣지 않아도 됨
  //    1개 → props.children = children[0]
  //    2개 이상 → props.children = children
  //
  // 왜 배열 하나로 무조건 만들지 않을까?
  // 실제 ReactNode는 단일 child일 수도 있기 때문이다.
  //
  // ④ 아래 형태를 반환:
  //
  // {
  //   $$typeof: MINI_ELEMENT_TYPE,
  //   type,
  //   key,
  //   props
  // }

  const props = {
    ...config,
    children: children.length > 1 ? children : children.length === 1 ? children[0] : undefined,
    key: undefined,
  };

  return {
    $$typeof: MINI_ELEMENT_TYPE,
    type,
    key: config.key,
    props,
  };
}

function isMiniElement(value: unknown): value is MiniReactElement {
  return typeof value === "object" && value !== null && "$$typeof" in value && value.$$typeof === MINI_ELEMENT_TYPE;
}

/* ═══════════════════════════════════════════════════════════════
   PART 1 — Fiber
   ═══════════════════════════════════════════════════════════════ */

type Fiber = {
  tag: WorkTag;

  /** 학습용 */
  debugName: string;

  /**
   * FunctionComponent라면 함수:
   *
   *   App
   *
   * HostComponent라면 문자열:
   *
   *   "div"
   */
  type: ElementType | null;

  key: string | null;

  return: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  index: number;

  /**
   * HostText는 문자열을 직접 pendingProps로 사용한다.
   *
   * 실제 React도 HostText Fiber에는 text content가
   * pendingProps 역할을 한다.
   */
  pendingProps: Props | string | null;
  memoizedProps: Props | string | null;

  flags: number;
  subtreeFlags: number;

  alternate: Fiber | null;
};

function createFiber(tag: WorkTag, pendingProps: Props | string | null, key: string | null, debugName: string): Fiber {
  return {
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
   PART 2 — Element → Fiber
   대응: ReactFiber.js
   ═══════════════════════════════════════════════════════════════ */

/**
 * 핵심 함수 ★★★
 *
 * React Element를 실제 작업 단위인 Fiber로 변환한다.
 *
 * 예:
 *
 * {
 *   type: App,
 *   props: {}
 * }
 *
 *       ↓
 *
 * Fiber {
 *   tag: FunctionComponent,
 *   type: App,
 *   pendingProps: {}
 * }
 *
 *
 * 또는:
 *
 * {
 *   type: "div"
 * }
 *
 *       ↓
 *
 * Fiber {
 *   tag: HostComponent,
 *   type: "div"
 * }
 */
function createFiberFromElement(element: MiniReactElement): Fiber {
  // TODO 2-2
  //
  // const { type, key, props } = element;
  //
  // type에 따라 tag를 결정한다.
  //
  // typeof type === "function"
  //   → FunctionComponent
  //
  // typeof type === "string"
  //   → HostComponent
  //
  // debugName:
  //
  // FunctionComponent
  //   → type.name || "Anonymous"
  //
  // HostComponent
  //   → type
  //
  // createFiber(...)로 만든 뒤
  //
  // fiber.type = type;
  //
  // 해서 반환.
  //
  // 이번 단계에서는 그 외 type은 throw 해도 된다.
  function extractTag(type: ElementType): WorkTag {
    if (typeof type === "function") return "FunctionComponent";
    if (typeof type === "string") return "HostComponent";
    throw new Error("unknown element type");
  }

  function extractDebugName(type: ElementType): string {
    if (typeof type === "function") return type.name || "Anonymous";
    if (typeof type === "string") return type;
    throw new Error("unknown element type");
  }

  const { key, props, type } = element;
  const tag = extractTag(type);
  const debugName = extractDebugName(type);

  const fiber = createFiber(tag, props, key, debugName);
  fiber.type = type;

  return fiber;
}

/**
 * 문자열도 Fiber가 된다.
 *
 * 예:
 *
 * <div>Hello</div>
 *
 * Fiber Tree:
 *
 * div
 *  │
 *  └── HostText("Hello")
 */
function createFiberFromText(content: string | number): Fiber {
  const text = String(content);

  return createFiber("HostText", text, null, `#text("${text}")`);
}

/* ═══════════════════════════════════════════════════════════════
   PART 3 — Child 생성
   대응: ReactChildFiber.js
   ═══════════════════════════════════════════════════════════════ */

/**
 * ReactNode 하나를 Fiber 하나로 변환한다.
 *
 * 중요:
 *
 * parent Fiber를 인자로 받는다.
 *
 * 왜?
 *
 * 새 Fiber를 만들자마자
 *
 *   child.return = parent
 *
 * 를 설정해야 하기 때문이다.
 */
function createChild(returnFiber: Fiber, newChild: MiniReactNode): Fiber | null {
  // TODO 2-3
  //
  // case 1:
  //
  // typeof newChild === "string"
  // typeof newChild === "number"
  //
  //   → createFiberFromText()
  //
  //
  // case 2:
  //
  // isMiniElement(newChild)
  //
  //   → createFiberFromElement()
  //
  //
  // case 3:
  //
  // newChild === null
  //
  //   → null
  //
  //
  // 생성된 Fiber가 있다면 반드시:
  //
  //   created.return = returnFiber
  //
  // 를 해라.
  //
  //
  // Array는 여기서 처리하지 않는다.
  // mountChildFibers가 바깥에서 배열을 순회한다.
  //
  // 예상하지 못한 값이면 throw 해도 됨.
  function createFiber(node: MiniReactNode) {
    if (typeof node === "string" || typeof node === "number") {
      return createFiberFromText(node);
    }

    if (isMiniElement(node)) {
      return createFiberFromElement(node);
    }

    if (node === null) {
      return null;
    }

    throw new Error("unknown react node");
  }

  const fiber = createFiber(newChild);
  fiber.return = returnFiber;

  return fiber;
}

/**
 * children을 Fiber linked list로 만든다.
 *
 * 이것이 Level 1에서 직접 호출했던
 *
 *   linkChildren(parent, [...])
 *
 * 를 대체한다.
 *
 *
 * React Node:
 *
 * [
 *   <Header />,
 *   <Main />,
 *   <Footer />
 * ]
 *
 *              ↓
 *
 * Fiber:
 *
 * Header
 *   │ sibling
 *   ▼
 * Main
 *   │ sibling
 *   ▼
 * Footer
 */
function mountChildFibers(returnFiber: Fiber, newChildren: MiniReactNode): Fiber | null {
  // TODO 2-4 ★★★
  //
  // 1. newChildren이 배열이면 그대로 사용
  //
  //    아니면:
  //
  //      [newChildren]
  //
  //    형태로 만든다.
  //
  //
  // 2. 아래 포인터를 준비한다.
  //
  //    let firstChild: Fiber | null = null;
  //    let previousNewFiber: Fiber | null = null;
  //
  //
  // 3. children을 순회하면서:
  //
  //    const newFiber = createChild(returnFiber, child)
  //
  //
  // 4. null child면 skip
  //
  //
  // 5. newFiber.index = 현재 배열 index
  //
  //
  // 6. 첫 번째라면:
  //
  //      firstChild = newFiber
  //
  //    두 번째 이후라면:
  //
  //      previousNewFiber.sibling = newFiber
  //
  //
  // 7.
  //
  //    previousNewFiber = newFiber
  //
  //
  // 8. 마지막으로 firstChild 반환
  //
  //
  // 절대 children.map(...)으로 Fiber[]만 만들고 끝내지 마라.
  //
  // 목표는 배열 생성이 아니라:
  //
  //   child → sibling → sibling
  //
  // 구조를 만드는 것이다.
  const newChildrenArr = Array.isArray(newChildren) ? newChildren : [newChildren];

  let firstChild: Fiber | null = null;
  let previousNewFiber: Fiber | null = null;

  for (let i = 0; i < newChildrenArr.length; i++) {
    const child = newChildrenArr[i];
    const newFiber = createChild(returnFiber, child);
    newFiber.index = i;
    if (i === 0) {
      firstChild = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;
  }

  return firstChild;
}

/* ═══════════════════════════════════════════════════════════════
   PART 4 — Reconciliation

   이름은 reconciliation이지만 Level 2에는 비교 대상이 없다.

   기존 tree:
      없음

   새로운 children:
      있음

   따라서 전부 mount하면 끝이다.

   Level 4에서 여기가 진짜 diff 알고리즘으로 바뀐다.
   ═══════════════════════════════════════════════════════════════ */

function reconcileChildren(workInProgress: Fiber, nextChildren: MiniReactNode): void {
  // TODO 2-5
  //
  // mountChildFibers를 호출해서
  //
  // workInProgress.child
  //
  // 에 첫 번째 child Fiber를 연결한다.
  workInProgress.child = mountChildFibers(workInProgress, nextChildren);
}

/* ═══════════════════════════════════════════════════════════════
   PART 5 — beginWork

   Level 1:

   function beginWork(fiber) {
     return fiber.child;
   }


   Level 2:

   function beginWork(fiber) {

     switch (fiber.tag) {

       HostRoot:
         ...

       FunctionComponent:
         ...

       HostComponent:
         ...

       HostText:
         ...
     }

   }

   여기서부터 진짜 React 느낌이 강해진다.
   ═══════════════════════════════════════════════════════════════ */

const trace: string[] = [];

/**
 * Root는 자기 자신이 UI를 반환하는 함수가 없다.
 *
 * 대신 pendingProps.children에
 * 최상위 Element를 들고 있다고 하자.
 */
function updateHostRoot(workInProgress: Fiber): Fiber | null {
  // TODO 2-6-A
  //
  // pendingProps를 Props로 보고
  //
  // const nextChildren = props.children ?? null;
  //
  // reconcileChildren(workInProgress, nextChildren)
  //
  // 이후:
  //
  // return workInProgress.child;
  //
  const nextChildren = (workInProgress.pendingProps as Props).children ?? null;
  reconcileChildren(workInProgress, nextChildren);

  return workInProgress.child;
}

/**
 * 이번 Level의 핵심 ★★★
 *
 * Function Component Fiber를 처리한다.
 *
 *
 * App Fiber
 *
 *    ↓
 *
 * App(props) 실행
 *
 *    ↓
 *
 * React Element 반환
 *
 *    ↓
 *
 * reconcileChildren()
 *
 *    ↓
 *
 * child Fiber 생성
 */
function updateFunctionComponent(workInProgress: Fiber): Fiber | null {
  // TODO 2-6-B
  //
  // 1.
  //
  // const Component = workInProgress.type
  //
  // 타입상 FunctionComponent임을 확인하거나 cast.
  //
  //
  // 2.
  //
  // const props = workInProgress.pendingProps as Props
  //
  //
  // 3. 진짜 중요한 부분:
  //
  // const nextChildren = Component(props);
  //
  //
  // 즉 우리가 평소에 쓰는:
  //
  // function App() {
  //   return <div />
  // }
  //
  // 의 App()이 "여기서" 실행되는 것이다.
  //
  //
  // 4.
  //
  // reconcileChildren(workInProgress, nextChildren)
  //
  //
  // 5.
  //
  // return workInProgress.child;
  const Component = workInProgress.type as FunctionComponent;
  const props = workInProgress.pendingProps as Props;
  const nextChildren = Component(props);

  reconcileChildren(workInProgress, nextChildren);

  return workInProgress.child;
}

/**
 * DOM element에 대응하는 Fiber.
 *
 * 아직 DOM을 생성하지 않는다.
 *
 * 이번 begin phase에서는 오직:
 *
 *   props.children
 *
 * 을 Fiber로 만든다.
 *
 * 실제 DOM 생성 쪽은 나중에 completeWork에서 다룬다.
 */
function updateHostComponent(workInProgress: Fiber): Fiber | null {
  // TODO 2-6-C
  //
  // pendingProps에서 children을 읽는다.
  //
  // reconcileChildren(...)
  //
  // return workInProgress.child

  const nextChildren = (workInProgress.pendingProps as Props).children ?? null;
  reconcileChildren(workInProgress, nextChildren);
  return workInProgress.child;
}

/**
 * Text는 더 내려갈 child가 없다.
 */
function updateHostText(_workInProgress: Fiber): null {
  return null;
}

/**
 * Level 1의 beginWork를 교체한다.
 */
function beginWork(unitOfWork: Fiber): Fiber | null {
  trace.push(`begin    ${unitOfWork.debugName}`);

  // TODO 2-7 ★★★
  //
  // unitOfWork.tag에 따라:
  //
  // HostRoot
  //   → updateHostRoot
  //
  // FunctionComponent
  //   → updateFunctionComponent
  //
  // HostComponent
  //   → updateHostComponent
  //
  // HostText
  //   → updateHostText
  //
  // 를 호출하고 결과 Fiber를 반환.
  //
  // switch를 추천.

  let fiber: Fiber | null;

  switch (unitOfWork.tag) {
    case "HostRoot": {
      fiber = updateHostRoot(unitOfWork);
      break;
    }
    case "FunctionComponent": {
      fiber = updateFunctionComponent(unitOfWork);
      break;
    }
    case "HostComponent": {
      fiber = updateHostComponent(unitOfWork);
      break;
    }
    case "HostText": {
      fiber = updateHostText(unitOfWork);
      break;
    }
  }

  return fiber;
}

/* ═══════════════════════════════════════════════════════════════
   PART 6 — LEVEL 1 Work Loop
   여기는 이미 완성했으므로 건드리지 않아도 됨.
   ═══════════════════════════════════════════════════════════════ */

let workInProgress: Fiber | null = null;

function prepareFreshStack(root: Fiber): void {
  workInProgress = root;
}

function workLoopSync(): void {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(unitOfWork: Fiber): void {
  const next = beginWork(unitOfWork);

  unitOfWork.memoizedProps = unitOfWork.pendingProps;

  if (next !== null) {
    workInProgress = next;
  } else {
    completeUnitOfWork(unitOfWork);
  }
}

function completeWork(unitOfWork: Fiber): void {
  trace.push(`complete ${unitOfWork.debugName}`);
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
   PART 7 — 우리가 "사용하는 React 코드"
   ═══════════════════════════════════════════════════════════════ */

function Header(props: Props): MiniReactNode {
  return createElement("h1", null, String(props.title));
}

function Content(): MiniReactNode {
  return createElement(
    "section",
    { className: "content" },

    createElement("p", null, "Hello Fiber"),

    createElement("button", null, "Click"),
  );
}

function Footer(): MiniReactNode {
  return createElement("footer", null, "Bye");
}

function App(): MiniReactNode {
  return createElement(
    "main",
    { id: "app" },

    createElement(Header, {
      title: "Mini React",
    }),

    createElement(Content, null),

    createElement(Footer, null),
  );
}

/* ═══════════════════════════════════════════════════════════════
   PART 8 — Root
   ═══════════════════════════════════════════════════════════════ */

/**
 * 중요:
 *
 * 여기서는 아직 App Fiber가 없다.
 *
 * 존재하는 건:
 *
 * Root Fiber
 *
 * 그리고 pendingProps 안의:
 *
 * App React Element
 *
 * 뿐이다.
 */

const appElement = createElement(App, null);

const root = createFiber(
  "HostRoot",
  {
    children: appElement,
  },
  null,
  "Root",
);

/**
 * workLoop 시작 전에는:
 *
 * root.child === null
 *
 * 이어야 한다.
 *
 * 즉 아직 Fiber Tree는 존재하지 않는다.
 */
console.log("render 전 root.child:", root.child);

prepareFreshStack(root);
workLoopSync();

console.log("\n" + trace.join("\n"));

/**
 * render가 끝난 후에는:
 *
 * root.child
 *
 * 아래로 Fiber Tree가 만들어져 있어야 한다.
 */
console.log("\nrender 후 root.child:", root.child?.debugName);

export {};
