import { describe, it, expect } from "vitest";
import { blockTreeSchema } from "../tree";
import { expectValid, expectInvalid } from "../../../test-utils/expect";
import { makeParagraph, makeSection } from "../../../test-utils/builders";

describe("blockTreeSchema", () => {
  it("valid simple tree", () => {
    const tree = [makeParagraph()];
    const parsed = expectValid(blockTreeSchema, tree);
    expect(parsed.length).toBe(1);
  });

  it("valid complex tree", () => {
    const tree = [makeSection([makeParagraph({ id: "p1", parentId: "s1" }), makeParagraph({ id: "p2", parentId: "s1" })])];
    const parsed = expectValid(blockTreeSchema, tree);
    expect(parsed.length).toBe(1);
    expect(parsed[0].children?.length).toBe(2);
  });

  it("unknown type fail", () => {
    const invalid = [{ ...makeParagraph(), type: "unknown" }];
    expectInvalid(blockTreeSchema, invalid, "Unknown block type");
  });

  it("children not allowed for paragraph", () => {
    const invalid = [{ ...makeParagraph(), children: [makeParagraph({ id: "p2" })] }];
    expectInvalid(blockTreeSchema, invalid, "must not have children");
  });

  it("children not allowed for heading", () => {
    const invalid = [{ ...makeParagraph({ type: "heading", props: { text: "Title" } }), children: [makeParagraph({ id: "p2" })] }];
    expectInvalid(blockTreeSchema, invalid, "must not have children");
  });

  it("children not allowed for list", () => {
    const invalid = [{ ...makeParagraph({ type: "list", props: { items: ["a"] } }), children: [makeParagraph({ id: "p2" })] }];
    expectInvalid(blockTreeSchema, invalid, "must not have children");
  });

  it("section requires children", () => {
    const invalid = [{ ...makeSection(undefined), children: undefined }];
    expectInvalid(blockTreeSchema, invalid, "requires children array");
  });

  it("section with empty children array is valid", () => {
    const valid = [{ ...makeSection([]) }];
    expectValid(blockTreeSchema, valid);
  });

  it("nested props trees validated", () => {
    const tree = [
      {
        id: "faq1",
        type: "faq_item",
        order: 100,
        parentId: null,
        props: {
          question: "Q",
          answer: [makeParagraph({ id: "p-inner", parentId: "faq1" })],
        },
      },
    ];
    expectValid(blockTreeSchema, tree);
  });

  it("nested props trees invalid", () => {
    const tree = [
      {
        id: "faq1",
        type: "faq_item",
        order: 100,
        parentId: null,
        props: {
          question: "Q",
          answer: [{ id: "bad", type: "unknown", order: 100, parentId: null, props: {} }],
        },
      },
    ];
    expectInvalid(blockTreeSchema, tree, "Unknown block type");
  });

  it("columns with nested trees", () => {
    const tree = [
      {
        id: "cols1",
        type: "columns",
        order: 100,
        parentId: null,
        props: {
          columns: [[makeParagraph({ id: "p-col1", parentId: "cols1" })], [makeParagraph({ id: "p-col2", parentId: "cols1" })]],
        },
      },
    ];
    expectValid(blockTreeSchema, tree);
  });

  it("accordion_group with nested trees", () => {
    const tree = [
      {
        id: "acc1",
        type: "accordion_group",
        order: 100,
        parentId: null,
        props: {
          items: [
            {
              title: "Item 1",
              body: [makeParagraph({ id: "p-acc1", parentId: "acc1" })],
            },
          ],
        },
      },
    ];
    expectValid(blockTreeSchema, tree);
  });

  it("info_card with nested trees", () => {
    const tree = [
      {
        id: "ic1",
        type: "info_card",
        order: 100,
        parentId: null,
        props: {
          title: "Info Card",
          body: [makeParagraph({ id: "p-ic1", parentId: "ic1" })],
        },
      },
    ];
    expectValid(blockTreeSchema, tree);
  });

  it("invalid props in nested trees", () => {
    const tree = [
      {
        id: "faq1",
        type: "faq_item",
        order: 100,
        parentId: null,
        props: {
          question: "Q",
          answer: [
            {
              id: "bad",
              type: "paragraph",
              order: 100,
              parentId: null,
              props: { text: "" }, // empty text is invalid
            },
          ],
        },
      },
    ];
    expectInvalid(blockTreeSchema, tree, "at least 1");
  });

  it("missing required fields", () => {
    const invalid = [{ id: "p1", type: "paragraph" }]; // missing order, parentId, props
    expectInvalid(blockTreeSchema, invalid, "Required");
  });

  it("negative order", () => {
    const invalid = [{ ...makeParagraph(), order: -1 }];
    expectInvalid(blockTreeSchema, invalid, "greater than or equal to 0");
  });

  it("non-integer order", () => {
    const invalid = [{ ...makeParagraph(), order: 1.5 }];
    expectInvalid(blockTreeSchema, invalid, "integer");
  });
});
