import { normalizeBlockTree, validateBlockTree, validateNormalizedTree } from "../lib/normalize";
import type { BlockTree } from "../types";

// 정규화 전 예제 블록 트리 (기본값이 누락된 상태)
const exampleBlockTree: BlockTree = [
  {
    id: "block-1",
    type: "heading",
    order: 0,
    parentId: null,
    props: {
      text: "제목",
      // level이 누락됨 (기본값 2가 주입됨)
    },
  },
  {
    id: "block-2",
    type: "paragraph",
    order: 100,
    parentId: null,
    props: {
      text: "이것은 단락입니다.",
      // marks가 누락됨 (기본값 []가 주입됨)
    },
  },
  {
    id: "block-3",
    type: "list",
    order: 200,
    parentId: null,
    props: {
      items: ["항목 1", "항목 2", "항목 3"],
      // style이 누락됨 (기본값 "bullet"이 주입됨)
    },
  },
  {
    id: "block-4",
    type: "image",
    order: 300,
    parentId: null,
    props: {
      src: "https://example.com/image.jpg",
      // alt, caption이 누락됨 (기본값 ""가 주입됨)
    },
  },
  {
    id: "block-5",
    type: "section",
    order: 400,
    parentId: null,
    props: {
      // variant, padding이 누락됨 (기본값 "default", "md"가 주입됨)
    },
    children: [
      {
        id: "block-5-1",
        type: "paragraph",
        order: 0, // 정규화 시 100으로 변경됨
        parentId: "block-5",
        props: {
          text: "섹션 내부의 단락",
        },
      },
    ],
  },
  {
    id: "block-6",
    type: "embed",
    order: 500,
    parentId: null,
    props: {
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      // provider가 누락됨 (URL에서 "youtube"로 추론됨)
    },
  },
  {
    id: "block-7",
    type: "info_card",
    order: 600,
    parentId: null,
    props: {
      title: "정보 카드",
      body: [
        {
          id: "block-7-1",
          type: "paragraph",
          order: 0,
          parentId: null,
          props: {
            text: "정보 카드 내부의 내용",
            // marks가 누락됨 (정규화 시 []가 주입됨)
          },
        },
      ],
      // icon, image는 optional이므로 기본값 없음
    },
  },
  {
    id: "block-8",
    type: "faq_item",
    order: 700,
    parentId: null,
    props: {
      question: "자주 묻는 질문",
      answer: [
        {
          id: "block-8-1",
          type: "paragraph",
          order: 0,
          parentId: null,
          props: {
            text: "답변 내용입니다.",
            // marks가 누락됨 (정규화 시 []가 주입됨)
          },
        },
      ],
    },
  },
  {
    id: "block-9",
    type: "accordion_group",
    order: 800,
    parentId: null,
    props: {
      items: [
        {
          title: "아코디언 항목 1",
          body: [
            {
              id: "block-9-1",
              type: "paragraph",
              order: 0,
              parentId: null,
              props: {
                text: "아코디언 내용입니다.",
                // marks가 누락됨 (정규화 시 []가 주입됨)
              },
            },
          ],
        },
      ],
    },
  },
  {
    id: "block-10",
    type: "columns",
    order: 900,
    parentId: null,
    props: {
      columns: [
        [
          {
            id: "block-10-1",
            type: "paragraph",
            order: 0,
            parentId: null,
            props: {
              text: "첫 번째 컬럼",
              // marks가 누락됨 (정규화 시 []가 주입됨)
            },
          },
        ],
        [
          {
            id: "block-10-2",
            type: "paragraph",
            order: 0,
            parentId: null,
            props: {
              text: "두 번째 컬럼",
              // marks가 누락됨 (정규화 시 []가 주입됨)
            },
          },
        ],
      ],
    },
  },
];

export function runNormalizationExample() {
  console.log("=== 정규화 전 블록 트리 ===");
  console.log(JSON.stringify(exampleBlockTree, null, 2));

  // 정규화 전 유효성 검사
  const preValidation = validateBlockTree(exampleBlockTree);
  console.log("\n=== 정규화 전 유효성 검사 ===");
  console.log("유효:", preValidation.valid);
  if (!preValidation.valid) {
    console.log("오류:", preValidation.errors);
  }

  // 정규화 실행
  const normalizedTree = normalizeBlockTree(exampleBlockTree);

  console.log("\n=== 정규화 후 블록 트리 ===");
  console.log(JSON.stringify(normalizedTree, null, 2));

  // 정규화 후 유효성 검사
  const postValidation = validateNormalizedTree(normalizedTree);
  console.log("\n=== 정규화 후 유효성 검사 ===");
  console.log("유효:", postValidation.valid);
  if (!postValidation.valid) {
    console.log("오류:", postValidation.errors);
  }

  // 주요 변경사항 확인
  console.log("\n=== 주요 변경사항 ===");

  // heading level 확인
  const heading = normalizedTree.find((b) => b.type === "heading");
  console.log(`Heading level: ${(heading?.props as any)?.level}`);

  // paragraph marks 확인
  const paragraph = normalizedTree.find((b) => b.type === "paragraph");
  console.log(`Paragraph marks:`, (paragraph?.props as any)?.marks);

  // list style 확인
  const list = normalizedTree.find((b) => b.type === "list");
  console.log(`List style: ${(list?.props as any)?.style}`);

  // image alt 확인
  const image = normalizedTree.find((b) => b.type === "image");
  console.log(`Image alt: "${(image?.props as any)?.alt}"`);

  // section variant 확인
  const section = normalizedTree.find((b) => b.type === "section");
  console.log(`Section variant: ${(section?.props as any)?.variant}`);
  console.log(`Section padding: ${(section?.props as any)?.padding}`);

  // embed provider 확인
  const embed = normalizedTree.find((b) => b.type === "embed");
  console.log(`Embed provider: ${(embed?.props as any)?.provider}`);

  // children order 확인
  const sectionChildren = section?.children;
  if (sectionChildren && sectionChildren.length > 0) {
    console.log(`Section children order: ${sectionChildren[0]?.order}`);
  }

  // info_card body 확인
  const infoCard = normalizedTree.find((b) => b.type === "info_card");
  console.log(`Info card body:`, (infoCard?.props as any)?.body);

  // faq_item answer 확인
  const faqItem = normalizedTree.find((b) => b.type === "faq_item");
  console.log(`FAQ item answer:`, (faqItem?.props as any)?.answer);

  // accordion_group items 확인
  const accordionGroup = normalizedTree.find((b) => b.type === "accordion_group");
  console.log(`Accordion group items:`, (accordionGroup?.props as any)?.items);

  // columns 확인
  const columns = normalizedTree.find((b) => b.type === "columns");
  console.log(`Columns:`, (columns?.props as any)?.columns);
}

// 서버 액션에서 사용하는 예제
export function serverActionExample(rawBlockTree: BlockTree) {
  try {
    // 1. 정규화 실행
    const normalizedTree = normalizeBlockTree(rawBlockTree);

    // 2. 유효성 검사
    const validation = validateNormalizedTree(normalizedTree);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    // 3. DB 저장 (여기서는 예시로 반환)
    return {
      success: true,
      data: normalizedTree,
      message: "블록 트리가 성공적으로 정규화되고 저장되었습니다.",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// 예제 실행
runNormalizationExample();
