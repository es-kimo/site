import { describe, it, expect } from "vitest";
import { normalizeBlockTree, validateNormalizedTree, validateBlockTree } from "../normalize";
import { makeParagraph, makeSection, makeHeading, makeList, makeImage, makeTable, makeEmbed, makeFaqItem, makeColumns, makeInfoCard } from "../../../test-utils/builders";

describe("normalizeBlockTree", () => {
  it("fills defaults for paragraph", () => {
    const tree = [
      { ...makeParagraph(), props: { text: "hi" } }, // marks omitted
    ];
    const norm = normalizeBlockTree(tree);
    const p = norm[0]!;
    expect((p.props as any).marks).toEqual([]);
    expect(validateNormalizedTree(norm).valid).toBe(true);
  });

  it("fills defaults for heading", () => {
    const tree = [
      { ...makeHeading(), props: { text: "Title" } }, // level omitted
    ];
    const norm = normalizeBlockTree(tree);
    const h = norm[0]!;
    expect((h.props as any).level).toBe(2); // string "2" -> number 2
    expect(validateNormalizedTree(norm).valid).toBe(true);
  });

  it("fills defaults for list", () => {
    const tree = [
      { ...makeList(), props: { items: ["a", "b"] } }, // style omitted
    ];
    const norm = normalizeBlockTree(tree);
    const l = norm[0]!;
    expect((l.props as any).style).toBe("bullet");
    expect(validateNormalizedTree(norm).valid).toBe(true);
  });

  it("fills defaults for image", () => {
    const tree = [
      { ...makeImage(), props: { src: "https://example.com/img.png" } }, // alt, caption omitted
    ];
    const norm = normalizeBlockTree(tree);
    const img = norm[0]!;
    expect((img.props as any).alt).toBe("");
    expect((img.props as any).caption).toBe("");
    expect(validateNormalizedTree(norm).valid).toBe(true);
  });

  it("fills defaults for table", () => {
    const tree = [
      {
        ...makeTable(),
        props: {
          rows: [
            ["A", "B"],
            ["1", "2"],
          ],
        },
      }, // hasHeader omitted
    ];
    const norm = normalizeBlockTree(tree);
    const t = norm[0]!;
    expect((t.props as any).hasHeader).toBe(false);
    expect(validateNormalizedTree(norm).valid).toBe(true);
  });

  it("fills defaults for embed", () => {
    const tree = [
      { ...makeEmbed(), props: { url: "https://youtube.com/watch?v=example" } }, // provider omitted
    ];
    const norm = normalizeBlockTree(tree);
    const e = norm[0]!;
    expect((e.props as any).provider).toBe("youtube");
    expect(validateNormalizedTree(norm).valid).toBe(true);
  });

  it("fills defaults for section", () => {
    const tree = [
      { ...makeSection(), props: {} }, // variant, padding omitted
    ];
    const norm = normalizeBlockTree(tree);
    const s = norm[0]!;
    expect((s.props as any).variant).toBe("default");
    expect((s.props as any).padding).toBe("md");
    expect(validateNormalizedTree(norm).valid).toBe(true);
  });

  it("normalizes nested trees in faq_item", () => {
    const tree = [
      {
        id: "faq",
        type: "faq_item",
        order: 100,
        parentId: null,
        props: {
          question: "Q",
          answer: [{ ...makeParagraph({ id: "inner", parentId: null }), props: { text: "A" } }],
        },
      },
    ];
    const norm = normalizeBlockTree(tree);
    const faq = norm[0]!;
    expect((faq.props as any).answer[0].order).toBe(100);
    expect((faq.props as any).answer[0].parentId).toBe("faq");
    expect((faq.props as any).answer[0].props.marks).toEqual([]);
    expect(validateNormalizedTree(norm).valid).toBe(true);
  });

  it("normalizes nested trees in columns", () => {
    const tree = [
      {
        id: "cols",
        type: "columns",
        order: 100,
        parentId: null,
        props: {
          columns: [[{ ...makeParagraph({ id: "p1", parentId: null }), props: { text: "Col 1" } }], [{ ...makeParagraph({ id: "p2", parentId: null }), props: { text: "Col 2" } }]],
        },
      },
    ];
    const norm = normalizeBlockTree(tree);
    const cols = norm[0]!;
    expect((cols.props as any).columns[0][0].parentId).toBe("cols");
    expect((cols.props as any).columns[1][0].parentId).toBe("cols");
    expect((cols.props as any).columns[0][0].props.marks).toEqual([]);
    expect(validateNormalizedTree(norm).valid).toBe(true);
  });

  it("normalizes nested trees in info_card", () => {
    const tree = [
      {
        id: "ic",
        type: "info_card",
        order: 100,
        parentId: null,
        props: {
          title: "Card",
          body: [{ ...makeParagraph({ id: "p-body", parentId: null }), props: { text: "Body" } }],
        },
      },
    ];
    const norm = normalizeBlockTree(tree);
    const ic = norm[0]!;
    expect((ic.props as any).body[0].parentId).toBe("ic");
    expect((ic.props as any).body[0].props.marks).toEqual([]);
    expect(validateNormalizedTree(norm).valid).toBe(true);
  });

  it("normalizes nested trees in accordion_group", () => {
    const tree = [
      {
        id: "acc",
        type: "accordion_group",
        order: 100,
        parentId: null,
        props: {
          items: [
            {
              title: "Item 1",
              body: [{ ...makeParagraph({ id: "p-acc", parentId: null }), props: { text: "Body" } }],
            },
          ],
        },
      },
    ];
    const norm = normalizeBlockTree(tree);
    const acc = norm[0]!;
    expect((acc.props as any).items[0].body[0].parentId).toBe("acc");
    expect((acc.props as any).items[0].body[0].props.marks).toEqual([]);
    expect(validateNormalizedTree(norm).valid).toBe(true);
  });

  it("sets order from context when missing", () => {
    const tree = [
      { ...makeParagraph(), order: undefined as any },
      { ...makeParagraph({ id: "p2" }), order: undefined as any },
    ];
    const norm = normalizeBlockTree(tree);
    expect(norm[0]!.order).toBe(100);
    expect(norm[1]!.order).toBe(200);
    expect(validateNormalizedTree(norm).valid).toBe(true);
  });

  it("preserves existing order when present", () => {
    const tree = [
      { ...makeParagraph(), order: 500 },
      { ...makeParagraph({ id: "p2" }), order: 300 },
    ];
    const norm = normalizeBlockTree(tree);
    expect(norm[0]!.order).toBe(500);
    expect(norm[1]!.order).toBe(300);
    expect(validateNormalizedTree(norm).valid).toBe(true);
  });

  it("sets parentId from context", () => {
    const tree = [
      makeSection([
        { ...makeParagraph({ id: "p1" }), parentId: null },
        { ...makeParagraph({ id: "p2" }), parentId: null },
      ]),
    ];
    const norm = normalizeBlockTree(tree);
    expect(norm[0]!.children![0]!.parentId).toBe("s1");
    expect(norm[0]!.children![1]!.parentId).toBe("s1");
    expect(validateNormalizedTree(norm).valid).toBe(true);
  });
});

describe("validateBlockTree", () => {
  it("validates valid tree", () => {
    const tree = [makeParagraph()];
    const result = validateBlockTree(tree);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("validates invalid tree", () => {
    const tree = [{ ...makeParagraph(), type: "unknown" }];
    const result = validateBlockTree(tree);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Unknown block type: unknown");
  });

  it("validates tree with invalid props", () => {
    const tree = [{ ...makeParagraph(), props: { text: "" } }]; // empty text
    const result = validateBlockTree(tree);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("at least 1"))).toBe(true);
  });
});

describe("validateNormalizedTree", () => {
  it("validates normalized tree", () => {
    const tree = normalizeBlockTree([makeParagraph()]);
    const result = validateNormalizedTree(tree);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("validates complex normalized tree", () => {
    const tree = normalizeBlockTree([makeSection([makeParagraph({ id: "p1" }), makeHeading({ id: "h1" })])]);
    const result = validateNormalizedTree(tree);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("detects invalid order", () => {
    const tree = [{ ...makeParagraph(), order: -1 }];
    const result = validateNormalizedTree(tree);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Invalid order value"))).toBe(true);
  });

  it("detects children on non-container blocks", () => {
    const tree = [{ ...makeParagraph(), children: [makeParagraph({ id: "p2" })] }];
    const result = validateNormalizedTree(tree);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("should not have children"))).toBe(true);
  });
});
