import { describe, it } from "vitest";
import { blockSchemas } from "../registry";
import { expectValid, expectInvalid } from "../../../test-utils/expect";

describe("Block props schemas", () => {
  it("paragraph: valid", () => {
    expectValid(blockSchemas.paragraph, { text: "hello", marks: [] });
  });

  it("paragraph: invalid (missing text)", () => {
    expectInvalid(blockSchemas.paragraph, { marks: [] }, "Required");
  });

  it("paragraph: invalid (empty text)", () => {
    expectInvalid(blockSchemas.paragraph, { text: "", marks: [] }, "at least 1");
  });

  it("paragraph: valid with marks", () => {
    expectValid(blockSchemas.paragraph, { text: "hello", marks: ["bold", "italic"] });
  });

  it("heading: level optional => OK", () => {
    expectValid(blockSchemas.heading, { text: "title" }); // level omitted
  });

  it("heading: valid with level", () => {
    expectValid(blockSchemas.heading, { text: "title", level: "2" });
  });

  it("heading: invalid level", () => {
    expectInvalid(blockSchemas.heading, { text: "t", level: "4" }, "Invalid enum value");
  });

  it("heading: invalid (empty text)", () => {
    expectInvalid(blockSchemas.heading, { text: "" }, "at least 1");
  });

  it("list: style defaults allowed omit", () => {
    expectValid(blockSchemas.list, { items: ["a", "b"] });
  });

  it("list: valid with style", () => {
    expectValid(blockSchemas.list, { style: "bullet", items: ["a", "b"] });
  });

  it("list: no items", () => {
    expectInvalid(blockSchemas.list, { style: "bullet", items: [] }, "at least 1");
  });

  it("list: invalid style", () => {
    expectInvalid(blockSchemas.list, { style: "invalid", items: ["a"] }, "Invalid enum value");
  });

  it("image: valid minimal", () => {
    expectValid(blockSchemas.image, { src: "https://x.com/a.png" });
  });

  it("image: valid with all props", () => {
    expectValid(blockSchemas.image, {
      src: "https://x.com/a.png",
      alt: "alt text",
      caption: "caption",
      width: 100,
      height: 200,
    });
  });

  it("image: invalid src", () => {
    expectInvalid(blockSchemas.image, { src: "not-a-url" }, "Invalid url");
  });

  it("image: invalid width", () => {
    expectInvalid(blockSchemas.image, { src: "https://x.com/a.png", width: -1 }, "greater than 0");
  });

  it("table: hasHeader optional", () => {
    expectValid(blockSchemas.table, { rows: [["A"]] });
  });

  it("table: valid with header", () => {
    expectValid(blockSchemas.table, {
      rows: [
        ["A", "B"],
        ["1", "2"],
      ],
      hasHeader: true,
    });
  });

  it("table: no rows", () => {
    expectInvalid(blockSchemas.table, { rows: [] }, "at least 1");
  });

  it("divider: valid empty", () => {
    expectValid(blockSchemas.divider, {});
  });

  it("embed: url required", () => {
    expectInvalid(blockSchemas.embed, { provider: "youtube" }, "Required");
  });

  it("embed: valid minimal", () => {
    expectValid(blockSchemas.embed, { url: "https://youtube.com/watch?v=example" });
  });

  it("embed: valid with provider", () => {
    expectValid(blockSchemas.embed, {
      url: "https://youtube.com/watch?v=example",
      provider: "youtube",
      html: "<iframe>...</iframe>",
    });
  });

  it("embed: invalid url", () => {
    expectInvalid(blockSchemas.embed, { url: "not-a-url" }, "Invalid url");
  });

  it("faq_item: answer is blockTree", () => {
    expectValid(blockSchemas.faq_item, {
      question: "Q?",
      answer: [{ id: "p", type: "paragraph", order: 100, parentId: null, props: { text: "A" } }],
    });
  });

  it("faq_item: invalid (empty question)", () => {
    expectInvalid(
      blockSchemas.faq_item,
      {
        question: "",
        answer: [{ id: "p", type: "paragraph", order: 100, parentId: null, props: { text: "A" } }],
      },
      "at least 1"
    );
  });

  it("accordion_group: valid", () => {
    expectValid(blockSchemas.accordion_group, {
      items: [
        {
          title: "Title",
          body: [{ id: "p", type: "paragraph", order: 100, parentId: null, props: { text: "Body" } }],
        },
      ],
    });
  });

  it("accordion_group: no items", () => {
    expectInvalid(blockSchemas.accordion_group, { items: [] }, "at least 1");
  });

  it("cta: valid minimal", () => {
    expectValid(blockSchemas.cta, {
      title: "Title",
      buttonText: "Click",
      href: "https://example.com",
    });
  });

  it("cta: valid with description", () => {
    expectValid(blockSchemas.cta, {
      title: "Title",
      description: "Description",
      buttonText: "Click",
      href: "https://example.com",
    });
  });

  it("cta: invalid href", () => {
    expectInvalid(
      blockSchemas.cta,
      {
        title: "Title",
        buttonText: "Click",
        href: "not-a-url",
      },
      "Invalid url"
    );
  });

  it("info_card: body required", () => {
    expectInvalid(blockSchemas.info_card, { title: "t" }, "Required");
  });

  it("info_card: valid minimal", () => {
    expectValid(blockSchemas.info_card, {
      title: "Title",
      body: [{ id: "p", type: "paragraph", order: 100, parentId: null, props: { text: "Body" } }],
    });
  });

  it("info_card: valid with icon and image", () => {
    expectValid(blockSchemas.info_card, {
      title: "Title",
      body: [{ id: "p", type: "paragraph", order: 100, parentId: null, props: { text: "Body" } }],
      icon: "star",
      image: "https://example.com/image.png",
    });
  });

  it("info_card: invalid image url", () => {
    expectInvalid(
      blockSchemas.info_card,
      {
        title: "Title",
        body: [{ id: "p", type: "paragraph", order: 100, parentId: null, props: { text: "Body" } }],
        image: "not-a-url",
      },
      "Invalid url"
    );
  });

  it("section: valid minimal", () => {
    expectValid(blockSchemas.section, {});
  });

  it("section: valid with props", () => {
    expectValid(blockSchemas.section, { variant: "highlight", padding: "lg" });
  });

  it("section: invalid variant", () => {
    expectInvalid(blockSchemas.section, { variant: "invalid" }, "Invalid enum value");
  });

  it("columns: 1 column invalid", () => {
    expectInvalid(blockSchemas.columns, { columns: [[]] }, "at least 2");
  });

  it("columns: valid 2 columns", () => {
    expectValid(blockSchemas.columns, {
      columns: [[{ id: "p1", type: "paragraph", order: 100, parentId: null, props: { text: "Col 1" } }], [{ id: "p2", type: "paragraph", order: 100, parentId: null, props: { text: "Col 2" } }]],
    });
  });

  it("columns: valid 3 columns", () => {
    expectValid(blockSchemas.columns, {
      columns: [
        [{ id: "p1", type: "paragraph", order: 100, parentId: null, props: { text: "Col 1" } }],
        [{ id: "p2", type: "paragraph", order: 100, parentId: null, props: { text: "Col 2" } }],
        [{ id: "p3", type: "paragraph", order: 100, parentId: null, props: { text: "Col 3" } }],
      ],
    });
  });

  it("columns: 4 columns invalid", () => {
    expectInvalid(
      blockSchemas.columns,
      {
        columns: [
          [{ id: "p1", type: "paragraph", order: 100, parentId: null, props: { text: "Col 1" } }],
          [{ id: "p2", type: "paragraph", order: 100, parentId: null, props: { text: "Col 2" } }],
          [{ id: "p3", type: "paragraph", order: 100, parentId: null, props: { text: "Col 3" } }],
          [{ id: "p4", type: "paragraph", order: 100, parentId: null, props: { text: "Col 4" } }],
        ],
      },
      "at most 3"
    );
  });
});
