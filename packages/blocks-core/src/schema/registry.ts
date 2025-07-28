import { z } from "zod";
import { blockTreeSchema } from "./tree";

// Block type registry
export const blockTypes = {
  paragraph: "paragraph",
  heading: "heading",
  list: "list",
  image: "image",
  table: "table",
  divider: "divider",
  embed: "embed",
  faq_item: "faq_item",
  accordion_group: "accordion_group",
  cta: "cta",
  info_card: "info_card",
  section: "section",
  columns: "columns",
} as const;

export type BlockType = keyof typeof blockTypes;

// Container types that can have children (only section uses children field)
export const containerTypesUsingChildren = new Set<BlockType>(["section"]);

// Block schemas (will be imported from individual files)
export const blockSchemas: Record<BlockType, z.ZodSchema> = {
  paragraph: z.object({
    text: z.string().min(1),
    marks: z.array(z.enum(["bold", "italic", "underline", "strike", "code", "link"])).optional(),
  }),

  heading: z.object({
    text: z.string().min(1),
    level: z.enum(["1", "2", "3"]).optional(),
  }),

  list: z.object({
    style: z.enum(["bullet", "numbered"]).optional(),
    items: z.array(z.string().min(1)).min(1),
  }),

  image: z.object({
    src: z.string().url(),
    alt: z.string().optional(),
    caption: z.string().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
  }),

  table: z.object({
    rows: z.array(z.array(z.string())).min(1),
    hasHeader: z.boolean().optional(),
  }),

  divider: z.object({}),

  embed: z.object({
    url: z.string().url(),
    provider: z.string().optional(),
    html: z.string().optional(),
  }),

  faq_item: z
    .object({
      question: z.string().min(1),
      answer: z.lazy(() => blockTreeSchema),
    })
    .strict(),

  accordion_group: z
    .object({
      items: z
        .array(
          z
            .object({
              title: z.string().min(1),
              body: z.lazy(() => blockTreeSchema),
            })
            .strict()
        )
        .min(1),
    })
    .strict(),

  cta: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    buttonText: z.string().min(1),
    href: z.string().url(),
  }),

  info_card: z
    .object({
      title: z.string().min(1),
      body: z.lazy(() => blockTreeSchema),
      icon: z.string().optional(),
      image: z.string().url().optional(),
    })
    .strict(),

  section: z.object({
    variant: z.enum(["default", "highlight"]).optional(),
    padding: z.enum(["sm", "md", "lg"]).optional(),
  }),

  columns: z
    .object({
      columns: z
        .array(z.lazy(() => blockTreeSchema))
        .min(2)
        .max(3),
    })
    .strict(),
} as const;
