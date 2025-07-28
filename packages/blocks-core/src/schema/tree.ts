import { z } from "zod";
import { blockSchemas, containerTypesUsingChildren, type BlockType } from "./registry";
import type { BlockNode } from "../types";

// Block node schema with recursive children support and proper validation
export const blockNodeSchema: z.ZodType<BlockNode> = z
  .object({
    id: z.string(),
    type: z.string(),
    order: z.number().int().nonnegative(),
    parentId: z.string().nullable(),
    props: z.record(z.unknown()),
    children: z.array(z.lazy(() => blockNodeSchema)).optional(),
  })
  .superRefine((val, ctx) => {
    // Check if block type exists
    const schema = blockSchemas[val.type as BlockType];
    if (!schema) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Unknown block type: ${val.type}`,
      });
      return;
    }

    // Check if children are allowed for this block type
    const allowsChildren = containerTypesUsingChildren.has(val.type as BlockType);
    if (!allowsChildren && val.children) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${val.type} must not have children`,
      });
    }
    if (allowsChildren && !val.children) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${val.type} requires children array`,
      });
    }

    // Validate props against the block-specific schema
    const res = schema.safeParse(val.props);
    if (!res.success) {
      res.error.issues.forEach((i) => ctx.addIssue(i));
    }
  });

// Block tree schema (array of block nodes)
export const blockTreeSchema = z.array(blockNodeSchema);

// Type exports
export type BlockNodeSchema = z.infer<typeof blockNodeSchema>;
export type BlockTreeSchema = z.infer<typeof blockTreeSchema>;
