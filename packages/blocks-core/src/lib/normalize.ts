import type { BlockNode, BlockTree } from "../types";
import { blockSchemas, containerTypesUsingChildren, type BlockType } from "../schema/registry";
import { blockTreeSchema } from "../schema/tree";

// Local type definitions
interface NormalizationContext {
  fallbackOrder: number;
  parentId?: string | null;
}

interface NormalizedBlockNode extends BlockNode {
  order: number; // Always present after normalization
  props: Record<string, unknown>; // Always has defaults applied
}

/**
 * 블록 트리를 정규화합니다.
 * - 기본값 주입
 * - order 정렬
 * - id 정제
 * - 중첩 구조 정규화
 */
export function normalizeBlockTree(tree: BlockTree): BlockTree {
  return tree.map((node, idx) => normalizeNode(node, { fallbackOrder: (idx + 1) * 100 }));
}

/**
 * 부모 ID와 함께 블록 트리를 정규화합니다.
 */
function normalizeBlockTreeWithParent(tree: BlockTree, parentId: string): BlockTree {
  return tree.map((node, idx) => normalizeNode(node, { fallbackOrder: (idx + 1) * 100, parentId }));
}

/**
 * 단일 블록 노드를 정규화합니다.
 */
export function normalizeNode(node: BlockNode, context: NormalizationContext): NormalizedBlockNode {
  const schema = blockSchemas[node.type as BlockType];
  if (!schema) {
    throw new Error(`Unknown block type: ${node.type}`);
  }

  // 기본 order 주입
  const order = typeof node.order === "number" ? node.order : context.fallbackOrder;

  // props 스키마 파싱 + 기본값 주입
  const parsed = schema.parse(node.props);
  let props = applyDefaults(node.type as BlockType, parsed);

  // 중첩 트리 정규화 (props 내부의 BlockTree)
  props = normalizeNestedTrees(node.type as BlockType, props, node.id);

  // children 처리 (section만 children 필드 사용)
  let children: BlockNode[] | undefined;
  if (node.children && containerTypesUsingChildren.has(node.type as BlockType)) {
    children = node.children.map((child, i) =>
      normalizeNode(child, {
        fallbackOrder: (i + 1) * 100,
        parentId: node.id,
      })
    );
  }

  return {
    ...node,
    order,
    props,
    children,
    parentId: context.parentId ?? node.parentId,
  };
}

/**
 * props 내부의 중첩 트리를 정규화합니다.
 */
function normalizeNestedTrees(type: BlockType, props: any, parentId: string): Record<string, unknown> {
  switch (type) {
    case "faq_item":
      props.answer = normalizeBlockTreeWithParent(props.answer, parentId);
      break;
    case "accordion_group":
      props.items = props.items.map((it: any, idx: number) => ({
        ...it,
        body: normalizeBlockTreeWithParent(it.body, parentId),
      }));
      break;
    case "info_card":
      props.body = normalizeBlockTreeWithParent(props.body, parentId);
      break;
    case "columns":
      props.columns = props.columns.map((col: BlockTree) => normalizeBlockTreeWithParent(col, parentId));
      break;
  }
  return props;
}

/**
 * 블록 타입별 기본값을 적용합니다.
 */
function applyDefaults(type: BlockType, props: any): Record<string, unknown> {
  switch (type) {
    case "paragraph":
      props.marks ??= [];
      break;

    case "heading":
      props.level ??= "2";
      // 문자열을 숫자로 변환 (렌더러에서 사용하기 위해)
      if (typeof props.level === "string") {
        props.level = parseInt(props.level, 10);
      }
      break;

    case "list":
      props.style ??= "bullet";
      break;

    case "image":
      props.alt ??= "";
      props.caption ??= "";
      break;

    case "table":
      props.hasHeader ??= false;
      break;

    case "cta":
      props.description ??= "";
      break;

    case "section":
      props.variant ??= "default";
      props.padding ??= "md";
      break;

    case "embed":
      props.provider ??= inferProvider(props.url);
      break;

    case "info_card":
      // icon, image는 optional이므로 기본값 없음
      break;

    case "divider":
      // 빈 객체 유지
      break;

    case "faq_item":
    case "accordion_group":
    case "columns":
      // 중첩 블록 트리는 normalizeNestedTrees에서 처리
      break;

    default:
      break;
  }

  return props;
}

/**
 * URL에서 provider를 추론합니다.
 */
function inferProvider(url: string): string {
  if (!url) return "generic";

  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("vimeo.com")) return "vimeo";
  if (url.includes("maps.google.") || url.includes("google.com/maps")) return "map";
  if (url.includes("twitter.com") || url.includes("x.com")) return "twitter";
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("facebook.com")) return "facebook";
  if (url.includes("linkedin.com")) return "linkedin";

  return "generic";
}

/**
 * 블록 트리의 유효성을 검사합니다.
 */
export function validateBlockTree(tree: unknown): { valid: boolean; errors: string[] } {
  const result = blockTreeSchema.safeParse(tree);
  return {
    valid: result.success,
    errors: result.success ? [] : result.error.issues.map((i) => i.message),
  };
}

/**
 * 정규화된 블록 트리를 검증합니다.
 */
export function validateNormalizedTree(tree: BlockTree): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  function validateNormalizedNode(node: BlockNode, path: string = "") {
    const currentPath = path ? `${path}.${node.id}` : node.id;

    // order 필수 검사
    if (typeof node.order !== "number" || node.order < 0) {
      errors.push(`${currentPath}: Invalid order value ${node.order}`);
    }

    // 중첩 트리 검증 (props 내부의 BlockTree)
    validateNestedTrees(node.type as BlockType, node.props, currentPath, errors);

    // children 재귀 검사 (section만)
    if (node.children) {
      if (!containerTypesUsingChildren.has(node.type as BlockType)) {
        errors.push(`${currentPath}: Block type "${node.type}" should not have children`);
      } else {
        node.children.forEach((child, index) => {
          validateNormalizedNode(child, `${currentPath}.children[${index}]`);
        });
      }
    }
  }

  tree.forEach((node, index) => {
    validateNormalizedNode(node, `root[${index}]`);
  });

  return { valid: errors.length === 0, errors };
}

/**
 * props 내부의 중첩 트리를 검증합니다.
 */
function validateNestedTrees(type: BlockType, props: any, path: string, errors: string[]) {
  switch (type) {
    case "faq_item":
      if (props.answer) {
        const result = validateBlockTree(props.answer);
        if (!result.valid) {
          errors.push(`${path}.answer: ${result.errors.join(", ")}`);
        }
      }
      break;
    case "accordion_group":
      if (props.items) {
        props.items.forEach((item: any, idx: number) => {
          if (item.body) {
            const result = validateBlockTree(item.body);
            if (!result.valid) {
              errors.push(`${path}.items[${idx}].body: ${result.errors.join(", ")}`);
            }
          }
        });
      }
      break;
    case "info_card":
      if (props.body) {
        const result = validateBlockTree(props.body);
        if (!result.valid) {
          errors.push(`${path}.body: ${result.errors.join(", ")}`);
        }
      }
      break;
    case "columns":
      if (props.columns) {
        props.columns.forEach((col: BlockTree, idx: number) => {
          const result = validateBlockTree(col);
          if (!result.valid) {
            errors.push(`${path}.columns[${idx}]: ${result.errors.join(", ")}`);
          }
        });
      }
      break;
  }
}
