import { describe, it, expect } from "vitest";
import { blockTreeSchema } from "../schema/tree";

describe("blockTreeSchema", () => {
  it("should validate a simple paragraph block", () => {
    const validBlock = [
      {
        id: "block-1",
        type: "paragraph",
        order: 0,
        parentId: null,
        props: {
          text: "Hello, world!",
          marks: ["bold"],
        },
      },
    ];

    const result = blockTreeSchema.safeParse(validBlock);
    expect(result.success).toBe(true);
  });

  it("should validate a heading block", () => {
    const validBlock = [
      {
        id: "block-2",
        type: "heading",
        order: 0,
        parentId: null,
        props: {
          text: "Main Title",
          level: 1,
        },
      },
    ];

    const result = blockTreeSchema.safeParse(validBlock);
    expect(result.success).toBe(true);
  });

  it("should validate a section with children", () => {
    const validBlock = [
      {
        id: "section-1",
        type: "section",
        order: 0,
        parentId: null,
        props: {
          variant: "default",
          padding: "md",
        },
        children: [
          {
            id: "para-1",
            type: "paragraph",
            order: 0,
            parentId: "section-1",
            props: {
              text: "Section content",
            },
          },
        ],
      },
    ];

    const result = blockTreeSchema.safeParse(validBlock);
    expect(result.success).toBe(true);
  });

  it("should reject invalid block type", () => {
    const invalidBlock = [
      {
        id: "block-3",
        type: "invalid_type",
        order: 0,
        parentId: null,
        props: {},
      },
    ];

    const result = blockTreeSchema.safeParse(invalidBlock);
    expect(result.success).toBe(false);
    if (!result.success && result.error.issues.length > 0) {
      expect(result.error.issues[0]?.message).toContain("Unknown block type");
    }
  });

  it("should reject paragraph with children", () => {
    const invalidBlock = [
      {
        id: "block-4",
        type: "paragraph",
        order: 0,
        parentId: null,
        props: {
          text: "Should not have children",
        },
        children: [
          {
            id: "child-1",
            type: "paragraph",
            order: 0,
            parentId: "block-4",
            props: {
              text: "Child paragraph",
            },
          },
        ],
      },
    ];

    const result = blockTreeSchema.safeParse(invalidBlock);
    expect(result.success).toBe(false);
    if (!result.success && result.error.issues.length > 0) {
      expect(result.error.issues[0]?.message).toContain("must not have 'children'");
    }
  });

  it("should reject section without children", () => {
    const invalidBlock = [
      {
        id: "section-2",
        type: "section",
        order: 0,
        parentId: null,
        props: {
          variant: "default",
        },
      },
    ];

    const result = blockTreeSchema.safeParse(invalidBlock);
    expect(result.success).toBe(false);
    if (!result.success && result.error.issues.length > 0) {
      expect(result.error.issues[0]?.message).toContain("requires 'children' array");
    }
  });
});
