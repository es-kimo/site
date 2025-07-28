import type { BlockNode, BlockTree } from "../src/types";

// 공통 최소 valid block 생성
export const makeParagraph = (overrides: Partial<BlockNode> = {}): BlockNode => ({
  id: "p1",
  type: "paragraph",
  order: 100,
  parentId: null,
  props: { text: "hello", marks: [] },
  ...overrides,
});

export const makeHeading = (overrides: Partial<BlockNode> = {}): BlockNode => ({
  id: "h1",
  type: "heading",
  order: 100,
  parentId: null,
  props: { text: "제목", level: "2" },
  ...overrides,
});

export const makeSection = (children: BlockTree = [], overrides: Partial<BlockNode> = {}): BlockNode => ({
  id: "s1",
  type: "section",
  order: 100,
  parentId: null,
  props: { variant: "default", padding: "md" },
  children,
  ...overrides,
});

export const makeList = (overrides: Partial<BlockNode> = {}): BlockNode => ({
  id: "l1",
  type: "list",
  order: 100,
  parentId: null,
  props: { items: ["item 1", "item 2"], style: "bullet" },
  ...overrides,
});

export const makeImage = (overrides: Partial<BlockNode> = {}): BlockNode => ({
  id: "img1",
  type: "image",
  order: 100,
  parentId: null,
  props: { src: "https://example.com/image.png", alt: "Example image" },
  ...overrides,
});

export const makeTable = (overrides: Partial<BlockNode> = {}): BlockNode => ({
  id: "t1",
  type: "table",
  order: 100,
  parentId: null,
  props: {
    rows: [
      ["Header 1", "Header 2"],
      ["Cell 1", "Cell 2"],
    ],
    hasHeader: true,
  },
  ...overrides,
});

export const makeEmbed = (overrides: Partial<BlockNode> = {}): BlockNode => ({
  id: "e1",
  type: "embed",
  order: 100,
  parentId: null,
  props: { url: "https://youtube.com/watch?v=example", provider: "youtube" },
  ...overrides,
});

export const makeFaqItem = (overrides: Partial<BlockNode> = {}): BlockNode => ({
  id: "faq1",
  type: "faq_item",
  order: 100,
  parentId: null,
  props: {
    question: "질문입니다?",
    answer: [makeParagraph({ id: "p-answer", parentId: "faq1" })],
  },
  ...overrides,
});

export const makeColumns = (overrides: Partial<BlockNode> = {}): BlockNode => ({
  id: "c1",
  type: "columns",
  order: 100,
  parentId: null,
  props: {
    columns: [[makeParagraph({ id: "p-col1", parentId: "c1" })], [makeParagraph({ id: "p-col2", parentId: "c1" })]],
  },
  ...overrides,
});

export const makeInfoCard = (overrides: Partial<BlockNode> = {}): BlockNode => ({
  id: "ic1",
  type: "info_card",
  order: 100,
  parentId: null,
  props: {
    title: "정보 카드",
    body: [makeParagraph({ id: "p-body", parentId: "ic1" })],
  },
  ...overrides,
});
